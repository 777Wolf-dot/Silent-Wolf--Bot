import axios from 'axios';
import { existsSync, mkdirSync, readFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';

const execAsync = promisify(exec);

let getUserCaption;

async function initializeCaptionSystem() {
  try {
    const tiktokModule = await import('./tiktok.js');
    getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
  } catch (error) {
    getUserCaption = (userId) => "WolfBot is the Alpha";
  }
}

initializeCaptionSystem();

function getCaption(userId) {
  if (typeof getUserCaption === 'function') {
    return getUserCaption(userId);
  }
  return "WolfBot is the Alpha";
}

export default {
  name: "video2",
  description: "Search and download videos from YouTube (direct video, not document)",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎬 *Video2 Downloader* (Direct Video)\n\nUsage: video2 <search query>\nExample: video2 NF Home\nExample: video2 Ethical Hacking tutorial\n\n⚠️ *Note:* This sends video directly, not as document` 
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(' ');
      
      // Send initial status message
      statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"...` 
      }, { quoted: m });

      // Search for videos
      const searchResult = await searchYouTube(searchQuery);
      
      if (!searchResult || !searchResult.url) {
        // Edit the status message to show error
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching for*: "${searchQuery}"... ❌\n\n❌ No videos found`,
          edit: statusMsg.key 
        });
        return;
      }

      // Update status message to show found video
      await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title}`,
        edit: statusMsg.key 
      });

      // Download the video with direct format (optimized for WhatsApp)
      const result = await downloadYouTubeVideoDirect(searchResult.url);
      
      if (!result.success) {
        // Update status message with download failure
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ❌\n\n❌ Download failed: ${result.error}`,
          edit: statusMsg.key 
        });
        return;
      }

      const { filePath, fileSize, duration } = result;
      const userCaption = getCaption(userId);

      // Update status message to show downloading progress
      await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ✅\n📤 *Compressing & sending video...*`,
        edit: statusMsg.key 
      });

      // Check if video is too large (WhatsApp has limits)
      const maxVideoSize = 48 * 1024 * 1024; // 48MB limit for videos on WhatsApp
      
      if (fileSize > maxVideoSize) {
        // Try to compress the video
        const compressedPath = await compressVideo(filePath, maxVideoSize);
        
        if (compressedPath) {
          const compressedStats = fs.statSync(compressedPath);
          
          // Send compressed video
          await sock.sendMessage(jid, {
            video: readFileSync(compressedPath),
            caption: `🎬 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${duration || searchResult.duration}\n📊 ${formatFileSize(compressedStats.size)} (compressed)\n\n${userCaption}`
          });
          
          // Clean up compressed file
          setTimeout(() => {
            try {
              if (existsSync(compressedPath)) {
                fs.unlinkSync(compressedPath);
                console.log(`🧹 Cleaned up compressed video: ${compressedPath}`);
              }
            } catch (e) {}
          }, 30000);
        } else {
          // Send original as document if compression failed
          await sock.sendMessage(jid, {
            document: readFileSync(filePath),
            fileName: `${sanitizeFileName(searchResult.title)}.mp4`,
            mimetype: 'video/mp4',
            caption: `📁 *${searchResult.title}* (Too large for video)\n\n👤 ${searchResult.channel}\n⏱ ${duration || searchResult.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
          });
        }
      } else {
        // Send as video (within size limits)
        await sock.sendMessage(jid, {
          video: readFileSync(filePath),
          caption: `🎬 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${duration || searchResult.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
        });
      }

      // Update status message to show completion
      await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ✅\n📤 *Compressing & sending video...* ✅\n\n✅ *Video sent successfully!*`,
        edit: statusMsg.key 
      });

      // Cleanup
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`🧹 Cleaned up video file: ${filePath}`);
          }
        } catch (e) {
          console.log('Cleanup error:', e.message);
        }
      }, 30000);

    } catch (error) {
      console.error('Video2 command error:', error);
      
      // Update status message with error if it exists
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching for*: "${args.join(' ')}"... ❌\n\n❌ Error: ${error.message}`,
          edit: statusMsg.key 
        });
      } else {
        await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
      }
    }
  },
};

// Search YouTube videos (same as video command)
async function searchYouTube(query) {
  try {
    // Method 1: Use yt-dlp for search
    try {
      await execAsync('yt-dlp --version');
      
      const searchCmd = `yt-dlp "ytsearch:${query}" --dump-json --no-download`;
      const { stdout } = await execAsync(searchCmd, { timeout: 30000 });
      const results = JSON.parse(stdout);
      
      if (results && results.title) {
        return {
          title: results.title,
          url: results.webpage_url,
          channel: results.uploader || 'Unknown',
          duration: results.duration_string || 'N/A',
          views: results.view_count || 0
        };
      }
    } catch (ytdlpError) {
      console.log('yt-dlp search failed:', ytdlpError.message);
    }

    // Method 2: Use YouTube search API
    const encodedQuery = encodeURIComponent(query);
    const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
    
    const response = await axios.get(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });

    // Extract video ID from search results
    const html = response.data;
    const videoIdMatch = html.match(/"videoId":"([^"]{11})"/);
    
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
      // Get video details
      try {
        const detailsCmd = `yt-dlp --dump-json "${videoUrl}" --no-download`;
        const { stdout: detailsJson } = await execAsync(detailsCmd, { timeout: 30000 });
        const details = JSON.parse(detailsJson);
        
        return {
          title: details.title || query,
          url: videoUrl,
          channel: details.uploader || 'Unknown',
          duration: details.duration_string || 'N/A'
        };
      } catch (e) {
        // Return basic info if details fail
        return {
          title: query,
          url: videoUrl,
          channel: 'YouTube',
          duration: 'N/A'
        };
      }
    }

    // Method 3: Fallback to first result from search API
    const apiUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&maxResults=1&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`;
    
    try {
      const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
      if (apiResponse.data.items && apiResponse.data.items.length > 0) {
        const item = apiResponse.data.items[0];
        const videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
        
        return {
          title: item.snippet.title,
          url: videoUrl,
          channel: item.snippet.channelTitle,
          duration: 'N/A'
        };
      }
    } catch (apiError) {
      console.log('YouTube API search failed:', apiError.message);
    }

    return null;

  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

// Download YouTube video optimized for direct sending
async function downloadYouTubeVideoDirect(url) {
  const tempDir = './temp/video2';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const filePath = `${tempDir}/video_${timestamp}.mp4`;

  try {
    await execAsync('yt-dlp --version');
    
    // Download optimized for WhatsApp direct video sending:
    // - Prefer MP4 format
    // - Limit to 720p for better compression
    // - Include audio
    // - Use best quality within constraints
    const downloadCmd = `yt-dlp -f "best[height<=720][ext=mp4]/best[height<=480][ext=mp4]/best[ext=mp4]" --merge-output-format mp4 --no-check-certificate -o "${filePath}" "${url}"`;
    
    // Get video info first to check duration
    const infoCmd = `yt-dlp --dump-json --no-download "${url}"`;
    const { stdout: infoJson } = await execAsync(infoCmd, { timeout: 30000 });
    const videoInfo = JSON.parse(infoJson);
    const duration = videoInfo.duration || 0;
    
    // Skip if video is too long (> 5 minutes)
    if (duration > 300) { // 5 minutes
      return { 
        success: false, 
        error: 'Video too long (max 5 minutes for direct video)' 
      };
    }
    
    // Now download the video
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(filePath);
    
    if (stats.size === 0) {
      throw new Error('Empty file downloaded');
    }

    return {
      success: true,
      filePath,
      fileSize: stats.size,
      duration: videoInfo.duration_string || 'N/A'
    };

  } catch (error) {
    console.error('Video2 download error:', error);
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    return { success: false, error: error.message };
  }
}

// Compress video for WhatsApp
async function compressVideo(inputPath, maxSizeBytes) {
  const tempDir = './temp/compressed';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
  
  const outputPath = `${tempDir}/compressed_${Date.now()}.mp4`;
  
  try {
    // Use ffmpeg to compress video
    // Calculate target bitrate based on max size and duration
    const ffprobeCmd = `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${inputPath}"`;
    const { stdout: durationStr } = await execAsync(ffprobeCmd);
    const duration = parseFloat(durationStr);
    
    if (!duration || duration <= 0) {
      return null;
    }
    
    // Calculate target bitrate (in kbps)
    // Formula: bitrate = (target_size_in_bytes * 8) / duration / 1000
    const targetBitrate = Math.floor((maxSizeBytes * 8) / duration / 1000) - 64; // Subtract audio bitrate
    
    // Ensure reasonable bitrate limits
    const minBitrate = 500;
    const maxBitrate = 2000;
    const bitrate = Math.max(minBitrate, Math.min(maxBitrate, targetBitrate));
    
    // Compress video with ffmpeg
    const ffmpegCmd = `ffmpeg -i "${inputPath}" -vf "scale='min(720,iw)':-2" -c:v libx264 -preset fast -crf 28 -b:v ${bitrate}k -c:a aac -b:a 64k -y "${outputPath}"`;
    
    await execAsync(ffmpegCmd, { timeout: 60000 });
    
    const stats = fs.statSync(outputPath);
    if (stats.size > 0 && stats.size < maxSizeBytes) {
      return outputPath;
    }
    
    // If still too large, try more aggressive compression
    const ffmpegCmd2 = `ffmpeg -i "${inputPath}" -vf "scale='min(480,iw)':-2" -c:v libx264 -preset ultrafast -crf 32 -b:v 500k -c:a aac -b:a 48k -y "${outputPath}"`;
    await execAsync(ffmpegCmd2, { timeout: 60000 });
    
    const stats2 = fs.statSync(outputPath);
    if (stats2.size > 0 && stats2.size < maxSizeBytes) {
      return outputPath;
    }
    
    return null;
    
  } catch (error) {
    console.error('Video compression error:', error);
    return null;
  }
}

// Utility functions
function formatFileSize(bytes) {
  if (!bytes) return 'Unknown';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
}