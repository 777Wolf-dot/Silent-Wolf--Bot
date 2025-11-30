// // import axios from 'axios';
// // import { createWriteStream, existsSync, mkdirSync } from 'fs';
// // import { promisify } from 'util';
// // import { exec } from 'child_process';
// // import fs from 'fs';
// // import ytdl from 'ytdl-core';
// // import yts from 'yt-search';

// // const execAsync = promisify(exec);

// // // Import the global caption system
// // let getUserCaption;

// // async function initializeCaptionSystem() {
// //   try {
// //     const tiktokModule = await import('./tiktok.js');
// //     getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
// //   } catch (error) {
// //     console.log('tiktok.js not available, using default caption');
// //     getUserCaption = (userId) => "WolfBot is the Alpha";
// //   }
// // }

// // initializeCaptionSystem();

// // function getCaption(userId) {
// //   if (typeof getUserCaption === 'function') {
// //     return getUserCaption(userId);
// //   }
// //   return "WolfBot is the Alpha";
// // }

// // export default {
// //   name: "youtube",
// //   description: "Download YouTube videos and audio",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const userId = m.key.participant || m.key.remoteJid;

// //     try {
// //       if (!args[0]) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎬 *YouTube Downloader*\n\nUsage:\n• youtube <url> - Download video\n• youtube audio <url> - Download audio only\n• youtube search <query> - Search videos\n\nQuality Options:\n• 144p, 240p, 360p, 480p, 720p, 1080p\n\nEx:\nyoutube https://youtube.com/watch?v=xyz\nyoutube audio https://youtube.com/watch?v=xyz\nyoutube search baby shark` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const command = args[0].toLowerCase();
      
// //       if (command === 'search') {
// //         const query = args.slice(1).join(' ');
// //         if (!query) {
// //           await sock.sendMessage(jid, { text: '❌ Please provide a search query' }, { quoted: m });
// //           return;
// //         }
// //         return await searchYouTube(sock, jid, m, query);
// //       }

// //       let url = args[0];
// //       let quality = '360p';
// //       let audioOnly = false;

// //       // Parse commands
// //       if (command === 'audio') {
// //         audioOnly = true;
// //         url = args[1];
// //         quality = args[2] || 'high';
// //       } else if (['144p', '240p', '360p', '480p', '720p', '1080p'].includes(command)) {
// //         quality = command;
// //         url = args[1];
// //       }

// //       if (!url) {
// //         await sock.sendMessage(jid, { text: '❌ Please provide a YouTube URL' }, { quoted: m });
// //         return;
// //       }

// //       if (!isValidYouTubeUrl(url)) {
// //         await sock.sendMessage(jid, { text: '❌ Invalid YouTube URL' }, { quoted: m });
// //         return;
// //       }

// //       await sock.sendMessage(jid, { text: `⏳ ${audioOnly ? 'Downloading audio...' : `Downloading video (${quality})...`}` }, { quoted: m });

// //       const result = audioOnly ? 
// //         await downloadYouTubeAudio(url, quality) : 
// //         await downloadYouTubeVideo(url, quality);

// //       if (!result.success) {
// //         await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error}` }, { quoted: m });
// //         return;
// //       }

// //       const { filePath, videoInfo, fileSize } = result;
// //       const userCaption = getCaption(userId);

// //       // Check file size (WhatsApp limits: 16MB for videos, 16MB for documents)
// //       const maxSize = 16 * 1024 * 1024; // 16MB in bytes
      
// //       if (fileSize > maxSize) {
// //         // Send as document if file is too large
// //         await sock.sendMessage(jid, {
// //           document: fs.readFileSync(filePath),
// //           fileName: `${videoInfo.title}.${audioOnly ? 'mp3' : 'mp4'}`,
// //           mimetype: audioOnly ? 'audio/mpeg' : 'video/mp4',
// //           caption: `📁 *${videoInfo.title}*\n\n📊 Size: ${formatFileSize(fileSize)}\n🎵 Channel: ${videoInfo.author}\n⏱ Duration: ${videoInfo.timestamp}\n\n${userCaption}`
// //         }, { quoted: m });
// //       } else {
// //         if (audioOnly) {
// //           await sock.sendMessage(jid, {
// //             audio: fs.readFileSync(filePath),
// //             mimetype: 'audio/mpeg',
// //             fileName: `${videoInfo.title}.mp3`,
// //             caption: `🎵 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.timestamp}\n\n${userCaption}`
// //           }, { quoted: m });
// //         } else {
// //           await sock.sendMessage(jid, {
// //             video: fs.readFileSync(filePath),
// //             caption: `🎬 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.timestamp}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
// //           }, { quoted: m });
// //         }
// //       }

// //       // Cleanup
// //       setTimeout(() => {
// //         try {
// //           if (existsSync(filePath)) {
// //             fs.unlinkSync(filePath);
// //             console.log(`Cleaned up: ${filePath}`);
// //           }
// //         } catch (e) {
// //           console.log('Cleanup error:', e.message);
// //         }
// //       }, 30000);

// //     } catch (error) {
// //       console.error('YouTube command error:', error);
// //       await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
// //     }
// //   },
// // };

// // // YouTube search function
// // async function searchYouTube(sock, jid, m, query) {
// //   try {
// //     await sock.sendMessage(jid, { text: `🔍 Searching for "${query}"...` }, { quoted: m });

// //     const searchResults = await yts(query);
    
// //     if (!searchResults.videos.length) {
// //       await sock.sendMessage(jid, { text: '❌ No videos found' }, { quoted: m });
// //       return;
// //     }

// //     const results = searchResults.videos.slice(0, 5);
// //     let responseText = `🔍 *Search Results for "${query}"*\n\n`;

// //     results.forEach((video, index) => {
// //       responseText += `${index + 1}. *${video.title}*\n`;
// //       responseText += `   👤 ${video.author.name}\n`;
// //       responseText += `   ⏱ ${video.timestamp || 'N/A'}\n`;
// //       responseText += `   📊 ${formatFileSize(video.bytes || 0)}\n`;
// //       responseText += `   🔗 ${video.url}\n\n`;
// //     });

// //     responseText += `Reply with number to download (1-5)`;

// //     await sock.sendMessage(jid, { text: responseText }, { quoted: m });

// //     // Store search results for user selection
// //     if (!global.ytSearch) global.ytSearch = {};
// //     global.ytSearch[jid] = {
// //       results: results.map(v => ({
// //         url: v.url,
// //         title: v.title,
// //         author: v.author.name,
// //         timestamp: v.timestamp,
// //         duration: v.duration
// //       })),
// //       timestamp: Date.now()
// //     };

// //     // Clean up old search results after 5 minutes
// //     setTimeout(() => {
// //       if (global.ytSearch && global.ytSearch[jid]) {
// //         delete global.ytSearch[jid];
// //       }
// //     }, 300000);

// //   } catch (error) {
// //     console.error('YouTube search error:', error);
// //     await sock.sendMessage(jid, { text: `❌ Search failed: ${error.message}` }, { quoted: m });
// //   }
// // }

// // // Handle search result selection
// // export async function handleYoutubeSearchSelection(sock, m, selectedNumber) {
// //   const jid = m.key.remoteJid;
  
// //   if (!global.ytSearch || !global.ytSearch[jid]) {
// //     await sock.sendMessage(jid, { text: '❌ No active search session or session expired' }, { quoted: m });
// //     return;
// //   }

// //   const searchData = global.ytSearch[jid];
// //   const index = parseInt(selectedNumber) - 1;

// //   if (isNaN(index) || index < 0 || index >= searchData.results.length) {
// //     await sock.sendMessage(jid, { text: '❌ Invalid selection. Please choose a number from the list.' }, { quoted: m });
// //     return;
// //   }

// //   const selectedVideo = searchData.results[index];
// //   delete global.ytSearch[jid]; // Clear search data

// //   // Trigger download with selected URL
// //   const youtubeModule = await import('./youtube.js');
// //   await youtubeModule.default.execute(sock, { ...m, args: [selectedVideo.url] }, [selectedVideo.url]);
// // }

// // // Download YouTube video
// // async function downloadYouTubeVideo(url, quality = '360p') {
// //   try {
// //     const tempDir = './temp/youtube';
// //     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

// //     const timestamp = Date.now();
// //     const filePath = `${tempDir}/youtube_${timestamp}.mp4`;

// //     // Get video info
// //     const info = await ytdl.getInfo(url);
// //     const videoDetails = info.videoDetails;
    
// //     // Choose format based on quality
// //     let format;
// //     const formats = ytdl.filterFormats(info.formats, 'videoandaudio');
    
// //     if (quality === '144p') {
// //       format = formats.find(f => f.qualityLabel === '144p') || formats[0];
// //     } else if (quality === '240p') {
// //       format = formats.find(f => f.qualityLabel === '240p') || formats[0];
// //     } else if (quality === '360p') {
// //       format = formats.find(f => f.qualityLabel === '360p') || formats[0];
// //     } else if (quality === '480p') {
// //       format = formats.find(f => f.qualityLabel === '480p') || formats[0];
// //     } else if (quality === '720p') {
// //       format = formats.find(f => f.qualityLabel === '720p') || formats[0];
// //     } else if (quality === '1080p') {
// //       format = formats.find(f => f.qualityLabel === '1080p') || formats[0];
// //     } else {
// //       format = formats.find(f => f.qualityLabel === '360p') || formats[0];
// //     }

// //     if (!format) {
// //       return { success: false, error: 'No suitable format found' };
// //     }

// //     // Download video
// //     const videoStream = ytdl(url, { format: format });
// //     const writeStream = createWriteStream(filePath);

// //     await new Promise((resolve, reject) => {
// //       videoStream.pipe(writeStream);
// //       videoStream.on('end', resolve);
// //       videoStream.on('error', reject);
// //     });

// //     const stats = fs.statSync(filePath);
// //     const fileSize = stats.size;

// //     return {
// //       success: true,
// //       filePath,
// //       fileSize,
// //       videoInfo: {
// //         title: videoDetails.title,
// //         author: videoDetails.author.name,
// //         timestamp: videoDetails.lengthSeconds ? formatDuration(videoDetails.lengthSeconds) : 'N/A',
// //         quality: format.qualityLabel
// //       }
// //     };

// //   } catch (error) {
// //     console.error('YouTube video download error:', error);
// //     return { success: false, error: error.message };
// //   }
// // }

// // // Download YouTube audio
// // async function downloadYouTubeAudio(url, quality = 'high') {
// //   try {
// //     const tempDir = './temp/youtube';
// //     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

// //     const timestamp = Date.now();
// //     const filePath = `${tempDir}/youtube_audio_${timestamp}.mp3`;

// //     // Get video info
// //     const info = await ytdl.getInfo(url);
// //     const videoDetails = info.videoDetails;

// //     // Choose audio format
// //     const audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
// //     const format = quality === 'high' ? 
// //       audioFormats.find(f => f.audioBitrate && f.audioBitrate >= 128) || audioFormats[0] :
// //       audioFormats[0];

// //     if (!format) {
// //       return { success: false, error: 'No audio format found' };
// //     }

// //     // Download audio using yt-dlp for better quality conversion
// //     try {
// //       await execAsync(`yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 -o "${filePath}" "${url}"`);
// //     } catch (ytdlpError) {
// //       // Fallback to ytdl-core if yt-dlp fails
// //       console.log('yt-dlp failed, using ytdl-core fallback');
// //       const audioStream = ytdl(url, { format: format });
// //       const writeStream = createWriteStream(filePath.replace('.mp3', '.webm'));
      
// //       await new Promise((resolve, reject) => {
// //         audioStream.pipe(writeStream);
// //         audioStream.on('end', resolve);
// //         audioStream.on('error', reject);
// //       });

// //       // Convert to mp3 using ffmpeg if available
// //       try {
// //         await execAsync(`ffmpeg -i "${filePath.replace('.mp3', '.webm')}" -vn -ar 44100 -ac 2 -b:a 192k "${filePath}"`);
// //         fs.unlinkSync(filePath.replace('.mp3', '.webm'));
// //       } catch (convertError) {
// //         // If conversion fails, send as is
// //         fs.renameSync(filePath.replace('.mp3', '.webm'), filePath);
// //       }
// //     }

// //     const stats = fs.statSync(filePath);
// //     const fileSize = stats.size;

// //     return {
// //       success: true,
// //       filePath,
// //       fileSize,
// //       videoInfo: {
// //         title: videoDetails.title,
// //         author: videoDetails.author.name,
// //         timestamp: videoDetails.lengthSeconds ? formatDuration(videoDetails.lengthSeconds) : 'N/A'
// //       }
// //     };

// //   } catch (error) {
// //     console.error('YouTube audio download error:', error);
// //     return { success: false, error: error.message };
// //   }
// // }

// // // Utility functions
// // function isValidYouTubeUrl(url) {
// //   const patterns = [
// //     /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
// //     /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
// //     /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/
// //   ];
// //   return patterns.some(pattern => pattern.test(url));
// // }

// // function formatDuration(seconds) {
// //   const hours = Math.floor(seconds / 3600);
// //   const minutes = Math.floor((seconds % 3600) / 60);
// //   const secs = Math.floor(seconds % 60);
  
// //   if (hours > 0) {
// //     return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// //   }
// //   return `${minutes}:${secs.toString().padStart(2, '0')}`;
// // }

// // function formatFileSize(bytes) {
// //   if (bytes === 0) return '0 B';
// //   const k = 1024;
// //   const sizes = ['B', 'KB', 'MB', 'GB'];
// //   const i = Math.floor(Math.log(bytes) / Math.log(k));
// //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
// // }


















// import axios from 'axios';
// import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
// import { promisify } from 'util';
// import { exec } from 'child_process';
// import fs from 'fs';
// import path from 'path';

// const execAsync = promisify(exec);

// // Import the global caption system
// let getUserCaption;

// async function initializeCaptionSystem() {
//   try {
//     const tiktokModule = await import('./tiktok.js');
//     getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
//   } catch (error) {
//     console.log('tiktok.js not available, using default caption');
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
//   name: "youtube",
//   description: "Download YouTube videos and audio",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const userId = m.key.participant || m.key.remoteJid;

//     try {
//       if (!args[0]) {
//         await sock.sendMessage(jid, { 
//           text: `🎬 *YouTube Downloader*\n\nUsage:\n• youtube <url> - Download video\n• youtube audio <url> - Download audio only\n• youtube search <query> - Search videos\n\nQuality Options:\n• low (144p-360p)\n• medium (480p-720p) \n• high (1080p)\n\nEx:\nyoutube https://youtu.be/xyz\nyoutube audio https://youtu.be/xyz\nyoutube search baby shark` 
//         }, { quoted: m });
//         return;
//       }

//       const command = args[0].toLowerCase();
      
//       if (command === 'search') {
//         const query = args.slice(1).join(' ');
//         if (!query) {
//           await sock.sendMessage(jid, { text: '❌ Please provide a search query' }, { quoted: m });
//           return;
//         }
//         return await searchYouTube(sock, jid, m, query);
//       }

//       let url = args[0];
//       let quality = 'medium';
//       let audioOnly = false;

//       // Parse commands
//       if (command === 'audio') {
//         audioOnly = true;
//         url = args[1];
//         quality = args[2] || 'high';
//       } else if (['low', 'medium', 'high'].includes(command)) {
//         quality = command;
//         url = args[1];
//       }

//       if (!url) {
//         await sock.sendMessage(jid, { text: '❌ Please provide a YouTube URL' }, { quoted: m });
//         return;
//       }

//       // Extract URL from message if it's a search result selection
//       if (global.ytSearch && global.ytSearch[jid] && !isValidYouTubeUrl(url)) {
//         const index = parseInt(url) - 1;
//         if (!isNaN(index) && global.ytSearch[jid].results[index]) {
//           url = global.ytSearch[jid].results[index].url;
//           delete global.ytSearch[jid];
//         }
//       }

//       if (!isValidYouTubeUrl(url)) {
//         await sock.sendMessage(jid, { text: '❌ Invalid YouTube URL' }, { quoted: m });
//         return;
//       }

//       await sock.sendMessage(jid, { text: `⏳ ${audioOnly ? 'Downloading audio...' : `Downloading video (${quality})...`}` }, { quoted: m });

//       const result = audioOnly ? 
//         await downloadYouTubeAudio(url, quality) : 
//         await downloadYouTubeVideo(url, quality);

//       if (!result.success) {
//         await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error}` }, { quoted: m });
//         return;
//       }

//       const { filePath, videoInfo, fileSize } = result;
//       const userCaption = getCaption(userId);

//       // Check file size (WhatsApp limits: 16MB for videos, 16MB for documents)
//       const maxSize = 16 * 1024 * 1024; // 16MB in bytes
      
//       if (fileSize > maxSize) {
//         // Send as document if file is too large
//         await sock.sendMessage(jid, {
//           document: readFileSync(filePath),
//           fileName: `${sanitizeFileName(videoInfo.title)}.${audioOnly ? 'mp3' : 'mp4'}`,
//           mimetype: audioOnly ? 'audio/mpeg' : 'video/mp4',
//           caption: `📁 *${videoInfo.title}*\n\n📊 Size: ${formatFileSize(fileSize)}\n🎵 Channel: ${videoInfo.author}\n⏱ Duration: ${videoInfo.duration}\n\n${userCaption}`
//         }, { quoted: m });
//       } else {
//         if (audioOnly) {
//           await sock.sendMessage(jid, {
//             audio: readFileSync(filePath),
//             mimetype: 'audio/mpeg',
//             fileName: `${sanitizeFileName(videoInfo.title)}.mp3`,
//             caption: `🎵 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.duration}\n\n${userCaption}`
//           }, { quoted: m });
//         } else {
//           await sock.sendMessage(jid, {
//             video: readFileSync(filePath),
//             caption: `🎬 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
//           }, { quoted: m });
//         }
//       }

//       // Cleanup
//       setTimeout(() => {
//         try {
//           if (existsSync(filePath)) {
//             fs.unlinkSync(filePath);
//             console.log(`Cleaned up: ${filePath}`);
//           }
//         } catch (e) {
//           console.log('Cleanup error:', e.message);
//         }
//       }, 30000);

//     } catch (error) {
//       console.error('YouTube command error:', error);
//       await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
//     }
//   },
// };

// // YouTube search function
// async function searchYouTube(sock, jid, m, query) {
//   try {
//     await sock.sendMessage(jid, { text: `🔍 Searching for "${query}"...` }, { quoted: m });

//     // Use YouTube API or scraping fallback
//     const searchResults = await searchYouTubeVideos(query);
    
//     if (!searchResults.length) {
//       await sock.sendMessage(jid, { text: '❌ No videos found' }, { quoted: m });
//       return;
//     }

//     const results = searchResults.slice(0, 5);
//     let responseText = `🔍 *Search Results for "${query}"*\n\n`;

//     results.forEach((video, index) => {
//       responseText += `${index + 1}. *${video.title}*\n`;
//       responseText += `   👤 ${video.author}\n`;
//       responseText += `   ⏱ ${video.duration}\n`;
//       responseText += `   📺 ${video.views}\n\n`;
//     });

//     responseText += `Reply with number to download (1-5)`;

//     await sock.sendMessage(jid, { text: responseText }, { quoted: m });

//     // Store search results for user selection
//     if (!global.ytSearch) global.ytSearch = {};
//     global.ytSearch[jid] = {
//       results: results,
//       timestamp: Date.now()
//     };

//     // Clean up old search results after 5 minutes
//     setTimeout(() => {
//       if (global.ytSearch && global.ytSearch[jid]) {
//         delete global.ytSearch[jid];
//       }
//     }, 300000);

//   } catch (error) {
//     console.error('YouTube search error:', error);
//     await sock.sendMessage(jid, { text: `❌ Search failed: ${error.message}` }, { quoted: m });
//   }
// }

// // Search YouTube videos using API
// async function searchYouTubeVideos(query) {
//   try {
//     // Method 1: Use YouTube API via rapidapi
//     const response = await axios.get(`https://youtube-search-results.p.rapidapi.com/youtube-search/`, {
//       params: { q: query },
//       headers: {
//         'X-RapidAPI-Key': 'your-rapidapi-key-here', // You can get free key from rapidapi.com
//         'X-RapidAPI-Host': 'youtube-search-results.p.rapidapi.com'
//       },
//       timeout: 10000
//     });

//     if (response.data && response.data.items) {
//       return response.data.items.slice(0, 10).map(item => ({
//         title: item.title,
//         url: item.url,
//         author: item.author,
//         duration: item.duration,
//         views: item.views
//       }));
//     }
//   } catch (error) {
//     console.log('YouTube API search failed, using fallback');
//   }

//   // Method 2: Use simple scraping fallback
//   try {
//     const response = await axios.get(`https://www.youtube.com/results`, {
//       params: { search_query: query },
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//       },
//       timeout: 10000
//     });

//     // Simple regex extraction (basic fallback)
//     const videoData = [];
//     const regex = /"videoRenderer":\s*({.*?})/g;
//     let match;
    
//     while ((match = regex.exec(response.data)) !== null && videoData.length < 5) {
//       try {
//         const data = JSON.parse(match[1]);
//         if (data.title && data.title.runs && data.title.runs[0]) {
//           videoData.push({
//             title: data.title.runs[0].text,
//             url: `https://www.youtube.com/watch?v=${data.videoId}`,
//             author: data.ownerText ? data.ownerText.runs[0].text : 'Unknown',
//             duration: data.lengthText ? data.lengthText.simpleText : 'N/A',
//             views: data.viewCountText ? data.viewCountText.simpleText : 'N/A'
//           });
//         }
//       } catch (e) {
//         continue;
//       }
//     }
    
//     return videoData;
//   } catch (error) {
//     console.log('Scraping fallback also failed');
//     return [];
//   }
// }

// // Download YouTube video using multiple methods
// async function downloadYouTubeVideo(url, quality = 'medium') {
//   const tempDir = './temp/youtube';
//   if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

//   const timestamp = Date.now();
//   const filePath = `${tempDir}/youtube_${timestamp}.mp4`;

//   try {
//     // Method 1: Try yt-dlp first (most reliable)
//     try {
//       await execAsync('yt-dlp --version');
//       console.log('Using yt-dlp for download');
      
//       let qualityFlag;
//       switch(quality) {
//         case 'low': qualityFlag = 'best[height<=360]'; break;
//         case 'medium': qualityFlag = 'best[height<=720]'; break;
//         case 'high': qualityFlag = 'best[height<=1080]'; break;
//         default: qualityFlag = 'best[height<=720]';
//       }

//       // Get video info first
//       const infoCmd = `yt-dlp --dump-json "${url}"`;
//       const { stdout: infoJson } = await execAsync(infoCmd);
//       const videoInfo = JSON.parse(infoJson);

//       // Download video
//       const downloadCmd = `yt-dlp -f "${qualityFlag}" -o "${filePath}" "${url}"`;
//       await execAsync(downloadCmd);

//       const stats = fs.statSync(filePath);
//       const fileSize = stats.size;

//       return {
//         success: true,
//         filePath,
//         fileSize,
//         videoInfo: {
//           title: videoInfo.title || 'YouTube Video',
//           author: videoInfo.uploader || 'Unknown Channel',
//           duration: videoInfo.duration_string || formatDuration(videoInfo.duration) || 'N/A'
//         }
//       };

//     } catch (ytdlpError) {
//       console.log('yt-dlp failed:', ytdlpError.message);
//     }

//     // Method 2: Try youtube-dl
//     try {
//       await execAsync('youtube-dl --version');
//       console.log('Using youtube-dl for download');
      
//       const downloadCmd = `youtube-dl -f "best[height<=720]" -o "${filePath}" "${url}"`;
//       await execAsync(downloadCmd);

//       const stats = fs.statSync(filePath);
//       const fileSize = stats.size;

//       return {
//         success: true,
//         filePath,
//         fileSize,
//         videoInfo: {
//           title: 'YouTube Video',
//           author: 'Unknown Channel',
//           duration: 'N/A'
//         }
//       };

//     } catch (youtubedlError) {
//       console.log('youtube-dl failed:', youtubedlError.message);
//     }

//     // Method 3: Use online API as last resort
//     console.log('Trying online API download');
//     return await downloadViaAPI(url, filePath, 'video');

//   } catch (error) {
//     console.error('All YouTube video download methods failed:', error);
//     return { 
//       success: false, 
//       error: 'All download methods failed. Please try again later.' 
//     };
//   }
// }

// // Download YouTube audio
// async function downloadYouTubeAudio(url, quality = 'high') {
//   const tempDir = './temp/youtube';
//   if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

//   const timestamp = Date.now();
//   const filePath = `${tempDir}/youtube_audio_${timestamp}.mp3`;

//   try {
//     // Method 1: Try yt-dlp first
//     try {
//       await execAsync('yt-dlp --version');
      
//       // Get video info first
//       const infoCmd = `yt-dlp --dump-json "${url}"`;
//       const { stdout: infoJson } = await execAsync(infoCmd);
//       const videoInfo = JSON.parse(infoJson);

//       // Download audio
//       const downloadCmd = `yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 0 -o "${filePath}" "${url}"`;
//       await execAsync(downloadCmd);

//       const stats = fs.statSync(filePath);
//       const fileSize = stats.size;

//       return {
//         success: true,
//         filePath,
//         fileSize,
//         videoInfo: {
//           title: videoInfo.title || 'YouTube Audio',
//           author: videoInfo.uploader || 'Unknown Channel',
//           duration: videoInfo.duration_string || formatDuration(videoInfo.duration) || 'N/A'
//         }
//       };

//     } catch (ytdlpError) {
//       console.log('yt-dlp audio failed:', ytdlpError.message);
//     }

//     // Method 2: Try online API
//     return await downloadViaAPI(url, filePath, 'audio');

//   } catch (error) {
//     console.error('YouTube audio download failed:', error);
//     return { 
//       success: false, 
//       error: 'Audio download failed. Please try again later.' 
//     };
//   }
// }

// // Download via online API
// async function downloadViaAPI(url, filePath, type) {
//   try {
//     const apis = [
//       {
//         name: 'youtube88',
//         video: `https://youtube88.p.rapidapi.com/download/mp4`,
//         audio: `https://youtube88.p.rapidapi.com/download/mp3`,
//         headers: {
//           'X-RapidAPI-Key': 'your-rapidapi-key-here',
//           'X-RapidAPI-Host': 'youtube88.p.rapidapi.com'
//         },
//         data: { url: url }
//       },
//       {
//         name: 'ytstream',
//         video: `https://ytstream-download-youtube-videos.p.rapidapi.com/dl`,
//         audio: `https://ytstream-download-youtube-videos.p.rapidapi.com/dl`,
//         headers: {
//           'X-RapidAPI-Key': 'your-rapidapi-key-here',
//           'X-RapidAPI-Host': 'ytstream-download-youtube-videos.p.rapidapi.com'
//         },
//         params: { id: extractVideoId(url) }
//       }
//     ];

//     for (const api of apis) {
//       try {
//         const apiUrl = type === 'audio' ? api.audio : api.video;
//         const response = await axios.post(apiUrl, api.data || {}, {
//           headers: api.headers,
//           params: api.params,
//           timeout: 30000
//         });

//         if (response.data && response.data.url) {
//           await downloadFile(response.data.url, filePath);
          
//           const stats = fs.statSync(filePath);
//           return {
//             success: true,
//             filePath,
//             fileSize: stats.size,
//             videoInfo: {
//               title: response.data.title || 'YouTube Video',
//               author: response.data.channel || 'Unknown Channel',
//               duration: response.data.duration || 'N/A'
//             }
//           };
//         }
//       } catch (apiError) {
//         console.log(`${api.name} failed:`, apiError.message);
//         continue;
//       }
//     }

//     throw new Error('All APIs failed');

//   } catch (error) {
//     throw new Error(`API download failed: ${error.message}`);
//   }
// }

// // Utility functions
// function isValidYouTubeUrl(url) {
//   const patterns = [
//     /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
//     /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
//     /^(https?:\/\/)?(www\.)?youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
//     /youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/
//   ];
//   return patterns.some(pattern => pattern.test(url));
// }

// function extractVideoId(url) {
//   const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
//   return match ? match[1] : null;
// }

// function formatDuration(seconds) {
//   if (!seconds) return 'N/A';
//   const hours = Math.floor(seconds / 3600);
//   const minutes = Math.floor((seconds % 3600) / 60);
//   const secs = Math.floor(seconds % 60);
  
//   if (hours > 0) {
//     return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   }
//   return `${minutes}:${secs.toString().padStart(2, '0')}`;
// }

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

// async function downloadFile(url, filePath) {
//   const writer = createWriteStream(filePath);
//   const response = await axios({
//     method: 'GET',
//     url: url,
//     responseType: 'stream',
//     timeout: 60000
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// }
































import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';

const execAsync = promisify(exec);

// Import the global caption system
let getUserCaption;

async function initializeCaptionSystem() {
  try {
    const tiktokModule = await import('./tiktok.js');
    getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
  } catch (error) {
    console.log('tiktok.js not available, using default caption');
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
  name: "youtube",
  description: "Download YouTube videos and audio",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎬 *YouTube Downloader*\n\nUsage:\n• youtube <url> - Download video\n• youtube audio <url> - Download audio only\n\nEx:\nyoutube https://youtu.be/abc123\nyoutube audio https://youtu.be/abc123` 
        }, { quoted: m });
        return;
      }

      let url = args[0];
      let audioOnly = false;

      if (args[0].toLowerCase() === 'audio') {
        audioOnly = true;
        url = args[1];
      }

      if (!url) {
        await sock.sendMessage(jid, { text: '❌ Please provide a YouTube URL' }, { quoted: m });
        return;
      }

      if (!isValidYouTubeUrl(url)) {
        await sock.sendMessage(jid, { text: '❌ Invalid YouTube URL' }, { quoted: m });
        return;
      }

      await sock.sendMessage(jid, { text: `⏳ ${audioOnly ? 'Downloading audio...' : 'Downloading video...'}` }, { quoted: m });

      const result = audioOnly ? 
        await downloadYouTubeAudio(url) : 
        await downloadYouTubeVideo(url);

      if (!result.success) {
        await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error}` }, { quoted: m });
        return;
      }

      const { filePath, videoInfo, fileSize } = result;
      const userCaption = getCaption(userId);

      // Check if file exists and has content
      if (!existsSync(filePath) || fs.statSync(filePath).size === 0) {
        await sock.sendMessage(jid, { text: '❌ Downloaded file is empty or corrupted' }, { quoted: m });
        return;
      }

      // Check file size (WhatsApp limits: 16MB for videos, 16MB for documents)
      const maxSize = 16 * 1024 * 1024; // 16MB in bytes
      
      if (fileSize > maxSize) {
        // Send as document if file is too large
        await sock.sendMessage(jid, {
          document: readFileSync(filePath),
          fileName: `${sanitizeFileName(videoInfo.title)}.${audioOnly ? 'mp3' : 'mp4'}`,
          mimetype: audioOnly ? 'audio/mpeg' : 'video/mp4',
          caption: `📁 *${videoInfo.title}*\n\n📊 Size: ${formatFileSize(fileSize)}\n🎵 Channel: ${videoInfo.author}\n⏱ Duration: ${videoInfo.duration}\n\n${userCaption}`
        }, { quoted: m });
      } else {
        if (audioOnly) {
          await sock.sendMessage(jid, {
            audio: readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${sanitizeFileName(videoInfo.title)}.mp3`,
            caption: `🎵 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.duration}\n\n${userCaption}`
          }, { quoted: m });
        } else {
          await sock.sendMessage(jid, {
            video: readFileSync(filePath),
            caption: `🎬 *${videoInfo.title}*\n\n👤 ${videoInfo.author}\n⏱ ${videoInfo.duration}\n📊 ${formatFileSize(fileSize)}\n\n${userCaption}`
          }, { quoted: m });
        }
      }

      // Cleanup
      setTimeout(() => {
        try {
          if (existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Cleaned up: ${filePath}`);
          }
        } catch (e) {
          console.log('Cleanup error:', e.message);
        }
      }, 30000);

    } catch (error) {
      console.error('YouTube command error:', error);
      await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
    }
  },
};

// Download YouTube video with multiple fallback methods
async function downloadYouTubeVideo(url) {
  const tempDir = './temp/youtube';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const finalPath = `${tempDir}/youtube_${timestamp}.mp4`;

  // Try multiple methods in sequence
  const methods = [
    () => downloadWithYtdlpDirect(url, finalPath),
    () => downloadWithYtdlpCompatible(url, finalPath),
    () => downloadWithOnlineService(url, finalPath),
    () => downloadWithYoutubeDl(url, finalPath)
  ];

  for (let i = 0; i < methods.length; i++) {
    try {
      console.log(`Trying method ${i + 1}...`);
      const result = await methods[i]();
      
      if (result.success) {
        console.log(`Success with method ${i + 1}`);
        return result;
      }
    } catch (error) {
      console.log(`Method ${i + 1} failed:`, error.message);
      continue;
    }
  }

  return { success: false, error: 'All download methods failed' };
}

// Method 1: yt-dlp with direct MP4 download
async function downloadWithYtdlpDirect(url, filePath) {
  try {
    await execAsync('yt-dlp --version');
    
    // Get video info first
    const infoCmd = `yt-dlp --dump-json "${url}"`;
    const { stdout: infoJson } = await execAsync(infoCmd);
    const videoInfo = JSON.parse(infoJson);

    // Try to find ready-to-use MP4 files first (no conversion needed)
    const downloadCmd = `yt-dlp -f "best[ext=mp4][vcodec^=avc][acodec^=mp4a]/best[ext=mp4]" --no-check-certificate --no-warnings -o "${filePath}" "${url}"`;
    
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    if (fileSize === 0) throw new Error('Empty file');

    return {
      success: true,
      filePath,
      fileSize,
      videoInfo: {
        title: videoInfo.title || 'YouTube Video',
        author: videoInfo.uploader || 'Unknown Channel',
        duration: videoInfo.duration_string || formatDuration(videoInfo.duration) || 'N/A'
      }
    };
  } catch (error) {
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
}

// Method 2: yt-dlp with compatible format selection
async function downloadWithYtdlpCompatible(url, filePath) {
  try {
    await execAsync('yt-dlp --version');
    
    const infoCmd = `yt-dlp --dump-json "${url}"`;
    const { stdout: infoJson } = await execAsync(infoCmd);
    const videoInfo = JSON.parse(infoJson);

    // More flexible format selection for WhatsApp compatibility
    const downloadCmd = `yt-dlp -f "best[height<=720][ext=mp4]/best[height<=720]/best[ext=mp4]/best" --no-check-certificate --no-warnings -o "${filePath}" "${url}"`;
    
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    if (fileSize === 0) throw new Error('Empty file');

    return {
      success: true,
      filePath,
      fileSize,
      videoInfo: {
        title: videoInfo.title || 'YouTube Video',
        author: videoInfo.uploader || 'Unknown Channel',
        duration: videoInfo.duration_string || formatDuration(videoInfo.duration) || 'N/A'
      }
    };
  } catch (error) {
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
}

// Method 3: Online YouTube download services
async function downloadWithOnlineService(url, filePath) {
  try {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid video ID');

    // Try multiple online services
    const services = [
      `https://api.vevioz.com/api/button/mp4/${videoId}`,
      `https://api.vevioz.com/api/button/mp3/${videoId}`,
      `https://yt5s.com/en?q=${videoId}`,
      `https://yt1s.com/api/ajaxSearch/index`
    ];

    for (const serviceUrl of services) {
      try {
        let downloadUrl;
        
        if (serviceUrl.includes('vevioz')) {
          const response = await axios.get(serviceUrl, { timeout: 30000 });
          if (response.data && response.data.url) {
            downloadUrl = response.data.url;
          }
        } else if (serviceUrl.includes('yt1s')) {
          const response = await axios.post(serviceUrl, {
            q: `https://www.youtube.com/watch?v=${videoId}`,
            vt: 'mp4'
          }, { 
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            },
            timeout: 30000 
          });
          
          if (response.data && response.data.d_url) {
            downloadUrl = response.data.d_url;
          }
        }

        if (downloadUrl) {
          await downloadFile(downloadUrl, filePath);
          const stats = fs.statSync(filePath);
          
          if (stats.size > 0) {
            return {
              success: true,
              filePath,
              fileSize: stats.size,
              videoInfo: {
                title: 'YouTube Video',
                author: 'Unknown Channel',
                duration: 'N/A'
              }
            };
          }
        }
      } catch (serviceError) {
        console.log('Service failed:', serviceError.message);
        continue;
      }
    }
    
    throw new Error('All online services failed');
  } catch (error) {
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
}

// Method 4: Fallback to youtube-dl
async function downloadWithYoutubeDl(url, filePath) {
  try {
    await execAsync('youtube-dl --version');
    
    const downloadCmd = `youtube-dl -f "best[ext=mp4]/best" --no-check-certificate -o "${filePath}" "${url}"`;
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    if (fileSize === 0) throw new Error('Empty file');

    return {
      success: true,
      filePath,
      fileSize,
      videoInfo: {
        title: 'YouTube Video',
        author: 'Unknown Channel',
        duration: 'N/A'
      }
    };
  } catch (error) {
    if (existsSync(filePath)) fs.unlinkSync(filePath);
    throw error;
  }
}

// Download YouTube audio
async function downloadYouTubeAudio(url) {
  const tempDir = './temp/youtube';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const finalPath = `${tempDir}/youtube_audio_${timestamp}.mp3`;

  try {
    await execAsync('yt-dlp --version');
    
    // Get video info first
    const infoCmd = `yt-dlp --dump-json "${url}"`;
    const { stdout: infoJson } = await execAsync(infoCmd);
    const videoInfo = JSON.parse(infoJson);

    // Download best audio and let yt-dlp handle format
    const downloadCmd = `yt-dlp -f "bestaudio" --extract-audio --audio-format mp3 --audio-quality 5 --no-check-certificate -o "${finalPath}" "${url}"`;
    await execAsync(downloadCmd, { timeout: 120000 });

    const stats = fs.statSync(finalPath);
    const fileSize = stats.size;

    if (fileSize === 0) throw new Error('Empty audio file');

    return {
      success: true,
      filePath: finalPath,
      fileSize,
      videoInfo: {
        title: videoInfo.title || 'YouTube Audio',
        author: videoInfo.uploader || 'Unknown Channel',
        duration: videoInfo.duration_string || formatDuration(videoInfo.duration) || 'N/A'
      }
    };

  } catch (error) {
    console.error('YouTube audio download failed:', error);
    if (existsSync(finalPath)) fs.unlinkSync(finalPath);
    return { 
      success: false, 
      error: 'Audio download failed. Please try again later.' 
    };
  }
}

// Utility functions
function isValidYouTubeUrl(url) {
  const patterns = [
    /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /^(https?:\/\/)?(www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?v=[a-zA-Z0-9_-]{11}/
  ];
  return patterns.some(pattern => pattern.test(url));
}

function extractVideoId(url) {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function formatDuration(seconds) {
  if (!seconds) return 'N/A';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

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

async function downloadFile(url, filePath) {
  const writer = createWriteStream(filePath);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}