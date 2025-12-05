import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';
import { getUserCaption } from './tiktok.js'; // Import caption from TikTok module if you want consistency

const execAsync = promisify(exec);

export default {
  name: "facebook",
  aliases: ["fb", "fbdl"], // Add aliases for convenience
  description: "Download Facebook videos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `📥 *Facebook Video Downloader*\n\nUsage: fb <facebook-url>\n\nExamples:\n• fb https://fb.watch/xyz\n• fb https://www.facebook.com/username/videos/123456\n• fb https://fb.com/reel/xyz123\n\n📝 *Note:* Supports Facebook, Facebook Watch, and Reels` 
        }, { quoted: m });
        return;
      }

      const url = args[0];
      
      if (!isValidFacebookUrl(url)) {
        await sock.sendMessage(jid, { 
          text: `❌ Invalid Facebook URL\n\nSupported formats:\n• https://fb.watch/...\n• https://facebook.com/.../videos/...\n• https://fb.com/reel/...\n• https://www.facebook.com/watch/?v=...` 
        }, { quoted: m });
        return;
      }

      await sock.sendMessage(jid, { 
        text: `⏳ *Processing...*\n\nFetching video from Facebook...` 
      }, { quoted: m });

      const result = await downloadFacebook(url);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `❌ Download failed: ${result.error || 'Unknown error'}\n\nTry a different link or check if the video is publicly accessible.` 
        }, { quoted: m });
        return;
      }

      const { videoPath, videoInfo } = result;
      
      // Get user's custom caption or use default
      const userCaption = getUserCaption(userId) || "WolfBot is the Alpha";
      
      // Add video info to caption if available
      let caption = userCaption;
      if (videoInfo && videoInfo.title) {
        caption = `${videoInfo.title}\n\n${userCaption}`;
      }

      try {
        // Read video file into buffer
        const videoData = fs.readFileSync(videoPath);
        const fileSize = fs.statSync(videoPath).size;
        console.log(`📊 [FACEBOOK] Video size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Send video
        await sock.sendMessage(jid, {
          video: videoData,
          caption: caption,
          mimetype: 'video/mp4',
          fileName: `facebook_video.mp4`
        }, { quoted: m });

        console.log(`✅ [FACEBOOK] Video sent successfully`);

        // DELETE TEMP FILE IMMEDIATELY AFTER SENDING
        if (existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`🧹 [FACEBOOK] Cleaned up temp video: ${videoPath}`);
        }

      } catch (sendError) {
        console.error('❌ [FACEBOOK] Error sending video:', sendError);
        
        // Try to send as document if video sending fails (for larger files)
        if (sendError.message.includes('too large') || sendError.message.includes('size')) {
          try {
            const videoData = fs.readFileSync(videoPath);
            await sock.sendMessage(jid, {
              document: videoData,
              fileName: 'facebook_video.mp4',
              mimetype: 'video/mp4'
            }, { quoted: m });
            console.log(`✅ [FACEBOOK] Video sent as document`);
          } catch (docError) {
            await sock.sendMessage(jid, { 
              text: `❌ Video is too large to send. Size: ${(fs.statSync(videoPath).size / 1024 / 1024).toFixed(2)}MB` 
            }, { quoted: m });
          }
        }
        
        // Cleanup
        if (existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`🧹 [FACEBOOK] Cleaned up failed send: ${videoPath}`);
        }
      }

    } catch (error) {
      console.error('❌ [FACEBOOK] Command error:', error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\nPlease try again or use a different link.` 
      }, { quoted: m });
    }
  },
};

// Helper function to extract Facebook video ID
function extractFacebookVideoId(url) {
  const patterns = [
    /(?:v=|\/)([0-9]+)/, // ?v= or /video/123456
    /fb\.watch\/([a-zA-Z0-9_-]+)/, // fb.watch/abc123
    /reel\/([a-zA-Z0-9_-]+)/, // reel/abc123
    /video\/([0-9]+)/, // video/123456
    /watch\/\?v=([0-9]+)/ // watch/?v=123456
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return null;
}

function isValidFacebookUrl(url) {
  const patterns = [
    /https?:\/\/(www\.|m\.)?facebook\.com\/.*/i,
    /https?:\/\/(www\.|m\.)?fb\.com\/.*/i,
    /https?:\/\/(www\.|m\.)?fb\.watch\/.*/i,
    /https?:\/\/(www\.)?facebook\.com\/watch\/.*/i,
    /https?:\/\/(www\.)?facebook\.com\/reel\/.*/i
  ];
  return patterns.some(pattern => pattern.test(url));
}

async function downloadFacebook(url) {
  try {
    const tempDir = './temp/facebook';
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    const timestamp = Date.now();
    const videoPath = `${tempDir}/fb_${timestamp}.mp4`;

    // Try multiple download methods in order
    const methods = [
      downloadWithYtDlp,     // Method 1: yt-dlp (most reliable)
      downloadWithSnapTik,   // Method 2: SnapTik API
      downloadWithSaveFrom   // Method 3: SaveFrom API
    ];

    for (const method of methods) {
      try {
        console.log(`[FACEBOOK] Trying method: ${method.name}`);
        const result = await method(url, videoPath);
        if (result.success) {
          return result;
        }
      } catch (error) {
        console.log(`[FACEBOOK] Method ${method.name} failed:`, error.message);
        continue;
      }
    }

    return { 
      success: false, 
      error: 'All download methods failed. Try using yt-dlp locally.' 
    };

  } catch (error) {
    console.error('❌ [FACEBOOK] Download error:', error);
    return { success: false, error: error.message };
  }
}

// Method 1: yt-dlp (Most reliable)
async function downloadWithYtDlp(url, videoPath) {
  try {
    // Check if yt-dlp is installed
    try {
      await execAsync('yt-dlp --version');
    } catch {
      return { success: false, error: 'yt-dlp not installed' };
    }

    console.log(`[FACEBOOK] Downloading with yt-dlp: ${url}`);
    
    // Get video info first
    const infoResult = await execAsync(`yt-dlp --dump-json "${url}"`);
    const videoInfo = JSON.parse(infoResult.stdout);
    
    // Download the video
    await execAsync(`yt-dlp -f "best[ext=mp4]" --no-playlist -o "${videoPath}" "${url}"`);
    
    // Verify download
    if (existsSync(videoPath) && fs.statSync(videoPath).size > 0) {
      const fileSize = fs.statSync(videoPath).size;
      console.log(`✅ [FACEBOOK] yt-dlp successful: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      
      return { 
        success: true, 
        videoPath,
        videoInfo: {
          title: videoInfo.title || 'Facebook Video',
          duration: videoInfo.duration || null,
          uploader: videoInfo.uploader || null
        }
      };
    } else {
      throw new Error('yt-dlp download failed');
    }
    
  } catch (error) {
    console.error('❌ [FACEBOOK] yt-dlp error:', error);
    return { success: false, error: error.message };
  }
}

// Method 2: SnapTik API
async function downloadWithSnapTik(url, videoPath) {
  try {
    console.log(`[FACEBOOK] Using SnapTik API`);
    
    const apiUrl = `https://snaptik.app/abc.php?url=${encodeURIComponent(url)}`;
    const response = await axios.get(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
      },
      timeout: 30000
    });

    if (response.data && response.data.data && response.data.data.play) {
      const videoUrl = response.data.data.play;
      await downloadFile(videoUrl, videoPath, 'facebook.com');
      
      if (existsSync(videoPath) && fs.statSync(videoPath).size > 0) {
        return { success: true, videoPath };
      }
    }
    
    return { success: false, error: 'No video URL found' };
    
  } catch (error) {
    console.error('❌ [FACEBOOK] SnapTik error:', error);
    return { success: false, error: error.message };
  }
}

// Method 3: SaveFrom API
async function downloadWithSaveFrom(url, videoPath) {
  try {
    console.log(`[FACEBOOK] Using SaveFrom API`);
    
    const apiUrl = `https://api.savefrom.net/api/convert`;
    const response = await axios.post(apiUrl, {
      url: url,
      host: 'facebook'
    }, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Content-Type': 'application/json',
      },
      timeout: 30000
    });

    if (response.data && response.data.url) {
      const videoUrl = response.data.url;
      await downloadFile(videoUrl, videoPath, 'facebook.com');
      
      if (existsSync(videoPath) && fs.statSync(videoPath).size > 0) {
        return { success: true, videoPath };
      }
    }
    
    return { success: false, error: 'No video URL found' };
    
  } catch (error) {
    console.error('❌ [FACEBOOK] SaveFrom error:', error);
    return { success: false, error: error.message };
  }
}

// Enhanced download function with better headers
async function downloadFile(url, filePath, referer = 'https://www.facebook.com/') {
  const writer = createWriteStream(filePath);
  
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 120000, // 2 minutes timeout for larger videos
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Referer': referer,
      'Accept': 'video/mp4,video/webm,video/*;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'video',
      'Sec-Fetch-Mode': 'no-cors',
      'Sec-Fetch-Site': 'cross-site'
    },
    maxContentLength: 500 * 1024 * 1024, // 500MB max
    maxBodyLength: 500 * 1024 * 1024
  });

  let downloadedBytes = 0;
  const totalBytes = parseInt(response.headers['content-length']) || 0;

  response.data.on('data', (chunk) => {
    downloadedBytes += chunk.length;
    if (totalBytes > 0) {
      const percent = ((downloadedBytes / totalBytes) * 100).toFixed(1);
      if (percent % 10 === 0) {
        console.log(`📥 Downloading: ${percent}% (${(downloadedBytes / 1024 / 1024).toFixed(2)}MB)`);
      }
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', () => {
      console.log(`✅ Download complete: ${(downloadedBytes / 1024 / 1024).toFixed(2)}MB`);
      resolve();
    });
    
    writer.on('error', (err) => {
      if (existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
    
    response.data.on('error', (err) => {
      if (existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      reject(err);
    });
  });
}