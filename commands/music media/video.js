// import axios from 'axios';
// import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
// import { promisify } from 'util';
// import { exec } from 'child_process';
// import fs from 'fs';

// const execAsync = promisify(exec);

// let getUserCaption;

// async function initializeCaptionSystem() {
//   try {
//     const tiktokModule = await import('./tiktok.js');
//     getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
//   } catch (error) {
//     getUserCaption = (userId) => "WolfBot is the Alpha";
//   }
// }

// initializeCaptionSystem();

// function getCaption(userId) {
//   if (typeof getUserCaption === 'function') {
//     return getUserCaption(userId);
//   }
//   return "WolfBot is the Alpha";
// }

// export default {
//   name: "video",
//   description: "Search and download videos from YouTube",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const userId = m.key.participant || m.key.remoteJid;

//     try {
//       if (!args[0]) {
//         await sock.sendMessage(jid, { 
//           text: `🎬 *Video Downloader*\n\nUsage: video <search query>\nExample: video NF Home\nExample: video Ethical Hacking tutorial` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(' ');
//       await sock.sendMessage(jid, { text: `🔍 Searching for "${searchQuery}"...` }, { quoted: m });

//       // Search for videos
//       const searchResult = await searchYouTube(searchQuery);
      
//       if (!searchResult || !searchResult.url) {
//         await sock.sendMessage(jid, { text: '❌ No videos found' }, { quoted: m });
//         return;
//       }

//       await sock.sendMessage(jid, { text: `⏳ Downloading: ${searchResult.title}` }, { quoted: m });

//       // Download the video
//       const result = await downloadYouTubeVideo(searchResult.url);
      
//       if (!result.success) {
//         await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error}` }, { quoted: m });
//         return;
//       }

//       const { filePath, fileSize } = result;
//       const userCaption = getCaption(userId);
//       const maxSize = 16 * 1024 * 1024;

//       if (fileSize > maxSize) {
//         await sock.sendMessage(jid, {
//           document: readFileSync(filePath),
//           fileName: `${sanitizeFileName(searchResult.title)}.mp4`,
//           mimetype: 'video/mp4',
//           caption: `📁 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${searchResult.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
//         }, { quoted: m });
//       } else {
//         await sock.sendMessage(jid, {
//           video: readFileSync(filePath),
//           caption: `🎬 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${searchResult.duration}\n\n${userCaption}`
//         }, { quoted: m });
//       }

//       // Cleanup
//       setTimeout(() => {
//         try {
//           if (existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//           }
//         } catch (e) {}
//       }, 30000);

//     } catch (error) {
//       console.error('Video command error:', error);
//       await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
//     }
//   },
// };

// // Search YouTube videos
// async function searchYouTube(query) {
//   try {
//     // Method 1: Use yt-dlp for search
//     try {
//       await execAsync('yt-dlp --version');
      
//       const searchCmd = `yt-dlp "ytsearch:${query}" --dump-json --no-download`;
//       const { stdout } = await execAsync(searchCmd, { timeout: 30000 });
//       const results = JSON.parse(stdout);
      
//       if (results && results.title) {
//         return {
//           title: results.title,
//           url: results.webpage_url,
//           channel: results.uploader || 'Unknown',
//           duration: results.duration_string || 'N/A',
//           views: results.view_count || 0
//         };
//       }
//     } catch (ytdlpError) {
//       console.log('yt-dlp search failed:', ytdlpError.message);
//     }

//     // Method 2: Use YouTube search API
//     const encodedQuery = encodeURIComponent(query);
//     const searchUrl = `https://www.youtube.com/results?search_query=${encodedQuery}`;
    
//     const response = await axios.get(searchUrl, {
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//       },
//       timeout: 10000
//     });

//     // Extract video ID from search results
//     const html = response.data;
//     const videoIdMatch = html.match(/"videoId":"([^"]{11})"/);
    
//     if (videoIdMatch && videoIdMatch[1]) {
//       const videoId = videoIdMatch[1];
//       const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
      
//       // Get video details
//       try {
//         const detailsCmd = `yt-dlp --dump-json "${videoUrl}" --no-download`;
//         const { stdout: detailsJson } = await execAsync(detailsCmd, { timeout: 30000 });
//         const details = JSON.parse(detailsJson);
        
//         return {
//           title: details.title || query,
//           url: videoUrl,
//           channel: details.uploader || 'Unknown',
//           duration: details.duration_string || 'N/A'
//         };
//       } catch (e) {
//         // Return basic info if details fail
//         return {
//           title: query,
//           url: videoUrl,
//           channel: 'YouTube',
//           duration: 'N/A'
//         };
//       }
//     }

//     // Method 3: Fallback to first result from search API
//     const apiUrl = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&q=${encodedQuery}&maxResults=1&key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8`;
    
//     try {
//       const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
//       if (apiResponse.data.items && apiResponse.data.items.length > 0) {
//         const item = apiResponse.data.items[0];
//         const videoUrl = `https://www.youtube.com/watch?v=${item.id.videoId}`;
        
//         return {
//           title: item.snippet.title,
//           url: videoUrl,
//           channel: item.snippet.channelTitle,
//           duration: 'N/A'
//         };
//       }
//     } catch (apiError) {
//       console.log('YouTube API search failed:', apiError.message);
//     }

//     return null;

//   } catch (error) {
//     console.error('YouTube search error:', error);
//     return null;
//   }
// }

// // Download YouTube video
// async function downloadYouTubeVideo(url) {
//   const tempDir = './temp/video';
//   if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

//   const timestamp = Date.now();
//   const filePath = `${tempDir}/video_${timestamp}.mp4`;

//   try {
//     await execAsync('yt-dlp --version');
    
//     // Download with WhatsApp-compatible format
//     const downloadCmd = `yt-dlp -f "best[ext=mp4][height<=720]/best[ext=mp4]/best" --no-check-certificate -o "${filePath}" "${url}"`;
//     await execAsync(downloadCmd, { timeout: 120000 });

//     const stats = fs.statSync(filePath);
    
//     if (stats.size === 0) {
//       throw new Error('Empty file downloaded');
//     }

//     return {
//       success: true,
//       filePath,
//       fileSize: stats.size
//     };

//   } catch (error) {
//     console.error('Video download error:', error);
//     if (existsSync(filePath)) fs.unlinkSync(filePath);
//     return { success: false, error: error.message };
//   }
// }

// // Utility functions
// function formatFileSize(bytes) {
//   if (!bytes) return 'Unknown';
//   const k = 1024;
//   const sizes = ['B', 'KB', 'MB', 'GB'];
//   const i = Math.floor(Math.log(bytes) / Math.log(k));
//   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// }

// function sanitizeFileName(name) {
//   return name.replace(/[^a-z0-9]/gi, '_').substring(0, 50);
// }


























import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
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
  name: "video",
  description: "Search and download videos from YouTube",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎬 *Video Downloader*\n\nUsage: video <search query>\nExample: video NF Home\nExample: video Ethical Hacking tutorial` 
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

      // Download the video
      const result = await downloadYouTubeVideo(searchResult.url);
      
      if (!result.success) {
        // Update status message with download failure
        await sock.sendMessage(jid, { 
          text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ❌\n\n❌ Download failed: ${result.error}`,
          edit: statusMsg.key 
        });
        return;
      }

      const { filePath, fileSize } = result;
      const userCaption = getCaption(userId);
      const maxSize = 16 * 1024 * 1024; // 16MB limit for videos

      // Update status message to show downloading progress
      await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ✅\n📤 *Uploading video...*`,
        edit: statusMsg.key 
      });

      if (fileSize > maxSize) {
        // Send as document if too large
        await sock.sendMessage(jid, {
          document: readFileSync(filePath),
          fileName: `${sanitizeFileName(searchResult.title)}.mp4`,
          mimetype: 'video/mp4',
          caption: `📁 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${searchResult.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
        });
      } else {
        // Send as video
        await sock.sendMessage(jid, {
          video: readFileSync(filePath),
          caption: `🎬 *${searchResult.title}*\n\n👤 ${searchResult.channel}\n⏱ ${searchResult.duration}\n\n${userCaption}`
        });
      }

      // Update status message to show completion
      await sock.sendMessage(jid, { 
        text: `🔍 *Searching for*: "${searchQuery}"... ✅\n⏳ *Downloading*: ${searchResult.title} ✅\n📤 *Uploading video...* ✅\n\n✅ *Video sent successfully!*`,
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
      console.error('Video command error:', error);
      
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

// Search YouTube videos
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

// Download YouTube video
async function downloadYouTubeVideo(url) {
  const tempDir = './temp/video';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const filePath = `${tempDir}/video_${timestamp}.mp4`;

  try {
    await execAsync('yt-dlp --version');
    
    // Download with WhatsApp-compatible format
    const downloadCmd = `yt-dlp -f "best[ext=mp4][height<=720]/best[ext=mp4]/best" --no-check-certificate -o "${filePath}" "${url}"`;
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(filePath);
    
    if (stats.size === 0) {
      throw new Error('Empty file downloaded');
    }

    return {
      success: true,
      filePath,
      fileSize: stats.size
    };

  } catch (error) {
    console.error('Video download error:', error);
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    return { success: false, error: error.message };
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