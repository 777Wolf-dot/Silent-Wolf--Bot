// // // import axios from 'axios';
// // // import { createWriteStream, existsSync, mkdirSync } from 'fs';
// // // import { promisify } from 'util';
// // // import { exec } from 'child_process';
// // // import fs from 'fs';

// // // const execAsync = promisify(exec);

// // // export default {
// // //   name: "tiktok",
// // //   description: "Download TikTok videos without watermark",
// // //   async execute(sock, m, args) {
// // //     const jid = m.key.remoteJid;

// // //     try {
// // //       if (args.length === 0) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <tiktok-url>\n\n*Example:*\ntiktok https://vt.tiktok.com/xxxxx\ntiktok https://www.tiktok.com/@user/video/123456789\n\n*Features:*\n• No watermark\n• HD quality\n• Fast download\n• Audio extraction available` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       const url = args[0];
      
// // //       // Validate TikTok URL
// // //       if (!isValidTikTokUrl(url)) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `❌ Invalid TikTok URL!\n\nPlease provide a valid TikTok URL like:\n• https://vt.tiktok.com/xxxxx\n• https://www.tiktok.com/@user/video/123456789` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       // Send processing message
// // //       const processingMsg = await sock.sendMessage(jid, { 
// // //         text: `⏳ Processing TikTok download...\n\nURL: ${url}\n\nPlease wait while we fetch your video...` 
// // //       }, { quoted: m });

// // //       // Download TikTok video
// // //       const result = await downloadTikTok(url);
      
// // //       if (!result.success) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `❌ Download failed!\n\nError: ${result.error}\n\nPlease try again with a different URL.` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       const { videoPath, audioPath, videoInfo } = result;

// // //       // Send success message with video info
// // //       await sock.sendMessage(jid, { 
// // //         text: `✅ *TikTok Download Successful!*\n\n📝 *Title:* ${videoInfo.title || 'No title'}\n👤 *Author:* ${videoInfo.author || 'Unknown'}\n❤️ *Likes:* ${videoInfo.likes || 'N/A'}\n💬 *Comments:* ${videoInfo.comments || 'N/A'}\n🔄 *Shares:* ${videoInfo.shares || 'N/A'}\n\n📥 Sending video now...` 
// // //       }, { quoted: m });

// // //       // Send video
// // //       await sock.sendMessage(jid, {
// // //         video: fs.readFileSync(videoPath),
// // //         caption: `🎵 ${videoInfo.title || 'TikTok Video'}\n👤 By: ${videoInfo.author || 'Unknown'}\n\nDownloaded via @SilentWolf Bot`
// // //       }, { quoted: m });

// // //       // Offer audio version if available
// // //       if (audioPath && existsSync(audioPath)) {
// // //         await sock.sendMessage(jid, {
// // //           text: `🎧 *Audio version available!*\n\nWould you like the audio-only version? Reply with "audio" to get the MP3.`
// // //         }, { quoted: m });
// // //       }

// // //       // Clean up files after sending
// // //       setTimeout(() => {
// // //         try {
// // //           if (existsSync(videoPath)) fs.unlinkSync(videoPath);
// // //           if (audioPath && existsSync(audioPath)) fs.unlinkSync(audioPath);
// // //         } catch (cleanupError) {
// // //           console.log('Cleanup error:', cleanupError);
// // //         }
// // //       }, 30000);

// // //     } catch (error) {
// // //       console.error("❌ [TIKTOK] ERROR:", error);
// // //       await sock.sendMessage(jid, { 
// // //         text: `❌ TikTok download failed!\n\nError: ${error.message}\n\nPlease try again with a different URL or check if the video is available.` 
// // //       }, { quoted: m });
// // //     }
// // //   },
// // // };

// // // /**
// // //  * Check if URL is a valid TikTok URL
// // //  */
// // // function isValidTikTokUrl(url) {
// // //   const tiktokPatterns = [
// // //     /https?:\/\/(vm|vt)\.tiktok\.com\/[A-Za-z0-9]+/,
// // //     /https?:\/\/(www\.)?tiktok\.com\/@[A-Za-z0-9._]+\/video\/[0-9]+/,
// // //     /https?:\/\/(www\.)?tiktok\.com\/t\/[A-Za-z0-9]+/,
// // //     /https?:\/\/tiktok\.com\/@[A-Za-z0-9._]+\/video\/[0-9]+/
// // //   ];
  
// // //   return tiktokPatterns.some(pattern => pattern.test(url));
// // // }

// // // /**
// // //  * Download TikTok video using multiple API endpoints
// // //  */
// // // async function downloadTikTok(url) {
// // //   try {
// // //     // Ensure temp directory exists
// // //     const tempDir = './temp/tiktok';
// // //     if (!existsSync(tempDir)) {
// // //       mkdirSync(tempDir, { recursive: true });
// // //     }

// // //     const timestamp = Date.now();
// // //     const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;
// // //     const audioPath = `${tempDir}/tiktok_audio_${timestamp}.mp3`;

// // //     // Try multiple TikTok downloader APIs
// // //     const apis = [
// // //       {
// // //         name: 'tikwm',
// // //         url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
// // //         videoKey: 'data.play',
// // //         audioKey: 'data.music',
// // //         infoKey: 'data'
// // //       },
// // //       {
// // //         name: 'tikmate',
// // //         url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
// // //         videoKey: 'url',
// // //         process: (data) => ({ 
// // //           video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
// // //           audio_url: data.music || null,
// // //           info: data
// // //         })
// // //       },
// // //       {
// // //         name: 'snaptik',
// // //         url: `https://snaptik.app/abc.php?url=${encodeURIComponent(url)}`,
// // //         process: async (data) => {
// // //           // This would require HTML parsing, simplified for example
// // //           return null;
// // //         }
// // //       }
// // //     ];

// // //     let videoUrl = null;
// // //     let audioUrl = null;
// // //     let videoInfo = {};

// // //     // Try each API until one works
// // //     for (const api of apis) {
// // //       try {
// // //         console.log(`Trying ${api.name} API...`);
        
// // //         const response = await axios.get(api.url, {
// // //           timeout: 30000,
// // //           headers: {
// // //             'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
// // //             'Accept': 'application/json, text/plain, */*',
// // //             'Accept-Language': 'en-US,en;q=0.9',
// // //             'Origin': 'https://tikwm.com',
// // //             'Referer': 'https://tikwm.com/',
// // //             'Sec-Fetch-Dest': 'empty',
// // //             'Sec-Fetch-Mode': 'cors',
// // //             'Sec-Fetch-Site': 'same-site'
// // //           }
// // //         });

// // //         if (response.data) {
// // //           let data = response.data;
          
// // //           // Process data based on API
// // //           if (api.process) {
// // //             const processed = api.process(data);
// // //             if (processed) {
// // //               videoUrl = processed.video_url;
// // //               audioUrl = processed.audio_url;
// // //               videoInfo = processed.info || {};
// // //             }
// // //           } else {
// // //             // Standard API response handling
// // //             if (api.videoKey) {
// // //               const keys = api.videoKey.split('.');
// // //               videoUrl = keys.reduce((obj, key) => obj?.[key], data);
// // //             }
// // //             if (api.audioKey) {
// // //               const keys = api.audioKey.split('.');
// // //               audioUrl = keys.reduce((obj, key) => obj?.[key], data);
// // //             }
// // //             if (api.infoKey) {
// // //               const keys = api.infoKey.split('.');
// // //               videoInfo = keys.reduce((obj, key) => obj?.[key], data) || {};
// // //             }
// // //           }

// // //           if (videoUrl) {
// // //             console.log(`Success with ${api.name}`);
// // //             break;
// // //           }
// // //         }
// // //       } catch (apiError) {
// // //         console.log(`${api.name} failed:`, apiError.message);
// // //         continue;
// // //       }
// // //     }

// // //     if (!videoUrl) {
// // //       // Fallback to direct download using yt-dlp
// // //       return await downloadWithYtDlp(url, videoPath, audioPath);
// // //     }

// // //     // Download video
// // //     await downloadFile(videoUrl, videoPath);

// // //     // Download audio if available
// // //     if (audioUrl) {
// // //       try {
// // //         await downloadFile(audioUrl, audioPath);
// // //       } catch (audioError) {
// // //         console.log('Audio download failed:', audioError.message);
// // //       }
// // //     }

// // //     // Extract basic video info if not provided by API
// // //     if (!videoInfo.title && !videoInfo.author) {
// // //       videoInfo = {
// // //         title: 'TikTok Video',
// // //         author: 'Unknown User',
// // //         likes: 'N/A',
// // //         comments: 'N/A',
// // //         shares: 'N/A'
// // //       };
// // //     }

// // //     return {
// // //       success: true,
// // //       videoPath,
// // //       audioPath: existsSync(audioPath) ? audioPath : null,
// // //       videoInfo
// // //     };

// // //   } catch (error) {
// // //     console.error('TikTok download error:', error);
// // //     return {
// // //       success: false,
// // //       error: error.message
// // //     };
// // //   }
// // // }

// // // /**
// // //  * Download using yt-dlp as fallback
// // //  */
// // // async function downloadWithYtDlp(url, videoPath, audioPath) {
// // //   try {
// // //     // Check if yt-dlp is installed
// // //     try {
// // //       await execAsync('yt-dlp --version');
// // //     } catch {
// // //       return { success: false, error: 'yt-dlp not installed on server' };
// // //     }

// // //     // Download video without watermark
// // //     const videoCommand = `yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`;
// // //     await execAsync(videoCommand);

// // //     // Download audio separately
// // //     const audioCommand = `yt-dlp -f "bestaudio" -o "${audioPath}" --extract-audio --audio-format mp3 "${url}"`;
// // //     await execAsync(audioCommand);

// // //     // Get video info
// // //     const infoCommand = `yt-dlp --dump-json "${url}"`;
// // //     const { stdout: infoJson } = await execAsync(infoCommand);
// // //     const videoInfo = JSON.parse(infoJson);

// // //     return {
// // //       success: true,
// // //       videoPath,
// // //       audioPath: existsSync(audioPath) ? audioPath : null,
// // //       videoInfo: {
// // //         title: videoInfo.title || 'TikTok Video',
// // //         author: videoInfo.uploader || 'Unknown User',
// // //         likes: videoInfo.like_count || 'N/A',
// // //         comments: videoInfo.comment_count || 'N/A',
// // //         shares: videoInfo.repost_count || 'N/A'
// // //       }
// // //     };

// // //   } catch (error) {
// // //     console.error('yt-dlp download error:', error);
// // //     return { success: false, error: error.message };
// // //   }
// // // }

// // // /**
// // //  * Download file from URL
// // //  */
// // // async function downloadFile(url, filePath) {
// // //   const writer = createWriteStream(filePath);
  
// // //   const response = await axios({
// // //     method: 'GET',
// // //     url: url,
// // //     responseType: 'stream',
// // //     timeout: 60000,
// // //     headers: {
// // //       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
// // //       'Referer': 'https://www.tiktok.com/',
// // //       'Origin': 'https://www.tiktok.com'
// // //     }
// // //   });

// // //   response.data.pipe(writer);

// // //   return new Promise((resolve, reject) => {
// // //     writer.on('finish', resolve);
// // //     writer.on('error', reject);
// // //   });
// // // }

// // // /**
// // //  * Audio extraction handler
// // //  */
// // // export const tiktokAudioHandler = {
// // //   name: "audio",
// // //   description: "Get audio from last TikTok download",
// // //   async execute(sock, m, args) {
// // //     const jid = m.key.remoteJid;
    
// // //     try {
// // //       // This would need to track the last downloaded TikTok per user
// // //       // For now, we'll show a message
// // //       await sock.sendMessage(jid, {
// // //         text: `🎧 *Audio Extraction*\n\nTo get audio from a TikTok video, please download the video first using:\n\n*tiktok <url>*\n\nThen reply with "audio" to get the MP3 version.`
// // //       }, { quoted: m });
      
// // //     } catch (error) {
// // //       console.error("❌ [TIKTOK AUDIO] ERROR:", error);
// // //       await sock.sendMessage(jid, { 
// // //         text: `❌ Audio extraction failed!\n\nError: ${error.message}` 
// // //       }, { quoted: m });
// // //     }
// // //   }
// // // };



















// // // import axios from 'axios';
// // // import { createWriteStream, existsSync, mkdirSync } from 'fs';
// // // import { promisify } from 'util';
// // // import { exec } from 'child_process';
// // // import fs from 'fs';

// // // const execAsync = promisify(exec);

// // // export default {
// // //   name: "tiktok",
// // //   description: "Download TikTok videos without watermark",
// // //   async execute(sock, m, args) {
// // //     const jid = m.key.remoteJid;

// // //     try {
// // //       if (!args[0]) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <url>\n\nEx: tiktok https://vt.tiktok.com/xyz` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       const url = args[0];
      
// // //       if (!isValidTikTokUrl(url)) {
// // //         await sock.sendMessage(jid, { text: `❌ Invalid TikTok URL` }, { quoted: m });
// // //         return;
// // //       }

// // //       await sock.sendMessage(jid, { text: `⏳ Downloading...` }, { quoted: m });

// // //       const result = await downloadTikTok(url);
      
// // //       if (!result.success) {
// // //         await sock.sendMessage(jid, { text: `❌ Download failed` }, { quoted: m });
// // //         return;
// // //       }

// // //       const { videoPath, audioPath, videoInfo } = result;

// // //       await sock.sendMessage(jid, {
// // //         video: fs.readFileSync(videoPath),
// // //         caption: `🎵 ${videoInfo.title || 'TikTok Video'}\n👤 ${videoInfo.author || 'Unknown'}`
// // //       }, { quoted: m });

// // //       if (audioPath && existsSync(audioPath)) {
// // //         await sock.sendMessage(jid, { text: `🎧 Reply "audio" for MP3` }, { quoted: m });
// // //       }

// // //       setTimeout(() => {
// // //         try {
// // //           if (existsSync(videoPath)) fs.unlinkSync(videoPath);
// // //           if (audioPath && existsSync(audioPath)) fs.unlinkSync(audioPath);
// // //         } catch (e) {}
// // //       }, 30000);

// // //     } catch (error) {
// // //       await sock.sendMessage(jid, { text: `❌ Error` }, { quoted: m });
// // //     }
// // //   },
// // // };

// // // function isValidTikTokUrl(url) {
// // //   const patterns = [
// // //     /https?:\/\/(vm|vt)\.tiktok\.com\/\S+/,
// // //     /https?:\/\/(www\.)?tiktok\.com\/@\S+\/video\/\d+/
// // //   ];
// // //   return patterns.some(pattern => pattern.test(url));
// // // }

// // // async function downloadTikTok(url) {
// // //   try {
// // //     const tempDir = './temp/tiktok';
// // //     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

// // //     const timestamp = Date.now();
// // //     const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;
// // //     const audioPath = `${tempDir}/audio_${timestamp}.mp3`;

// // //     const apis = [
// // //       {
// // //         url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
// // //         videoKey: 'data.play',
// // //         audioKey: 'data.music',
// // //         infoKey: 'data'
// // //       },
// // //       {
// // //         url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
// // //         process: (data) => ({ 
// // //           video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
// // //           audio_url: data.music || null,
// // //           info: data
// // //         })
// // //       }
// // //     ];

// // //     let videoUrl = null;
// // //     let audioUrl = null;
// // //     let videoInfo = {};

// // //     for (const api of apis) {
// // //       try {
// // //         const response = await axios.get(api.url, { timeout: 30000 });
        
// // //         if (response.data) {
// // //           let data = response.data;
          
// // //           if (api.process) {
// // //             const processed = api.process(data);
// // //             videoUrl = processed.video_url;
// // //             audioUrl = processed.audio_url;
// // //             videoInfo = processed.info || {};
// // //           } else {
// // //             videoUrl = api.videoKey.split('.').reduce((obj, key) => obj?.[key], data);
// // //             audioUrl = api.audioKey.split('.').reduce((obj, key) => obj?.[key], data);
// // //             videoInfo = api.infoKey.split('.').reduce((obj, key) => obj?.[key], data) || {};
// // //           }

// // //           if (videoUrl) break;
// // //         }
// // //       } catch (e) {
// // //         continue;
// // //       }
// // //     }

// // //     if (!videoUrl) {
// // //       return await downloadWithYtDlp(url, videoPath, audioPath);
// // //     }

// // //     await downloadFile(videoUrl, videoPath);

// // //     if (audioUrl) {
// // //       try {
// // //         await downloadFile(audioUrl, audioPath);
// // //       } catch (e) {}
// // //     }

// // //     if (!videoInfo.title) {
// // //       videoInfo = { title: 'TikTok Video', author: 'Unknown' };
// // //     }

// // //     return {
// // //       success: true,
// // //       videoPath,
// // //       audioPath: existsSync(audioPath) ? audioPath : null,
// // //       videoInfo
// // //     };

// // //   } catch (error) {
// // //     return { success: false, error: error.message };
// // //   }
// // // }

// // // async function downloadWithYtDlp(url, videoPath, audioPath) {
// // //   try {
// // //     await execAsync('yt-dlp --version');
// // //   } catch {
// // //     return { success: false, error: 'yt-dlp not installed' };
// // //   }

// // //   try {
// // //     await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
// // //     await execAsync(`yt-dlp -f "bestaudio" -o "${audioPath}" --extract-audio --audio-format mp3 "${url}"`);
    
// // //     const { stdout: infoJson } = await execAsync(`yt-dlp --dump-json "${url}"`);
// // //     const info = JSON.parse(infoJson);

// // //     return {
// // //       success: true,
// // //       videoPath,
// // //       audioPath: existsSync(audioPath) ? audioPath : null,
// // //       videoInfo: {
// // //         title: info.title || 'TikTok Video',
// // //         author: info.uploader || 'Unknown',
// // //         likes: info.like_count || 'N/A'
// // //       }
// // //     };
// // //   } catch (error) {
// // //     return { success: false, error: error.message };
// // //   }
// // // }

// // // async function downloadFile(url, filePath) {
// // //   const writer = createWriteStream(filePath);
// // //   const response = await axios({
// // //     method: 'GET',
// // //     url: url,
// // //     responseType: 'stream',
// // //     timeout: 60000
// // //   });

// // //   response.data.pipe(writer);

// // //   return new Promise((resolve, reject) => {
// // //     writer.on('finish', resolve);
// // //     writer.on('error', reject);
// // //   });
// // // }

// // // export const tiktokAudioHandler = {
// // //   name: "audio",
// // //   description: "Get audio from TikTok",
// // //   async execute(sock, m, args) {
// // //     const jid = m.key.remoteJid;
// // //     await sock.sendMessage(jid, { text: `🎧 Use: tiktok <url> first, then reply "audio"` }, { quoted: m });
// // //   }
// // // };
























// // import axios from 'axios';
// // import { createWriteStream, existsSync, mkdirSync } from 'fs';
// // import { promisify } from 'util';
// // import { exec } from 'child_process';
// // import fs from 'fs';

// // const execAsync = promisify(exec);

// // export default {
// //   name: "tiktok",
// //   description: "Download TikTok videos without watermark",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (!args[0]) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <url>\n\nEx: tiktok https://vt.tiktok.com/xyz` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const url = args[0];
      
// //       if (!isValidTikTokUrl(url)) {
// //         await sock.sendMessage(jid, { text: `❌ Invalid TikTok URL` }, { quoted: m });
// //         return;
// //       }

// //       await sock.sendMessage(jid, { text: `⏳ Downloading...` }, { quoted: m });

// //       const result = await downloadTikTok(url);
      
// //       if (!result.success) {
// //         await sock.sendMessage(jid, { text: `❌ Download failed` }, { quoted: m });
// //         return;
// //       }

// //       const { videoPath, videoInfo } = result;

// //       await sock.sendMessage(jid, {
// //         video: fs.readFileSync(videoPath),
// //         caption: `🎵 ${videoInfo.title || 'TikTok Video'}\n👤 ${videoInfo.author || 'Unknown'}\n❤️ ${videoInfo.likes || '0'} 💬 ${videoInfo.comments || '0'} 🔄 ${videoInfo.shares || '0'}`
// //       }, { quoted: m });

// //       setTimeout(() => {
// //         try {
// //           if (existsSync(videoPath)) fs.unlinkSync(videoPath);
// //         } catch (e) {}
// //       }, 30000);

// //     } catch (error) {
// //       await sock.sendMessage(jid, { text: `❌ Error` }, { quoted: m });
// //     }
// //   },
// // };

// // function isValidTikTokUrl(url) {
// //   const patterns = [
// //     /https?:\/\/(vm|vt)\.tiktok\.com\/\S+/,
// //     /https?:\/\/(www\.)?tiktok\.com\/@\S+\/video\/\d+/
// //   ];
// //   return patterns.some(pattern => pattern.test(url));
// // }

// // async function downloadTikTok(url) {
// //   try {
// //     const tempDir = './temp/tiktok';
// //     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

// //     const timestamp = Date.now();
// //     const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;

// //     const apis = [
// //       {
// //         url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
// //         videoKey: 'data.play',
// //         infoKey: 'data'
// //       },
// //       {
// //         url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
// //         process: (data) => ({ 
// //           video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`,
// //           info: data
// //         })
// //       }
// //     ];

// //     let videoUrl = null;
// //     let videoInfo = {};

// //     for (const api of apis) {
// //       try {
// //         const response = await axios.get(api.url, { timeout: 30000 });
        
// //         if (response.data) {
// //           let data = response.data;
          
// //           if (api.process) {
// //             const processed = api.process(data);
// //             videoUrl = processed.video_url;
// //             videoInfo = processed.info || {};
// //           } else {
// //             videoUrl = api.videoKey.split('.').reduce((obj, key) => obj?.[key], data);
// //             videoInfo = api.infoKey.split('.').reduce((obj, key) => obj?.[key], data) || {};
// //           }

// //           if (videoUrl) break;
// //         }
// //       } catch (e) {
// //         continue;
// //       }
// //     }

// //     if (!videoUrl) {
// //       return await downloadWithYtDlp(url, videoPath);
// //     }

// //     await downloadFile(videoUrl, videoPath);

// //     if (!videoInfo.title) {
// //       videoInfo = { 
// //         title: 'TikTok Video', 
// //         author: 'Unknown',
// //         likes: '0',
// //         comments: '0', 
// //         shares: '0'
// //       };
// //     }

// //     return {
// //       success: true,
// //       videoPath,
// //       videoInfo
// //     };

// //   } catch (error) {
// //     return { success: false, error: error.message };
// //   }
// // }

// // async function downloadWithYtDlp(url, videoPath) {
// //   try {
// //     await execAsync('yt-dlp --version');
// //   } catch {
// //     return { success: false, error: 'yt-dlp not installed' };
// //   }

// //   try {
// //     await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
    
// //     const { stdout: infoJson } = await execAsync(`yt-dlp --dump-json "${url}"`);
// //     const info = JSON.parse(infoJson);

// //     return {
// //       success: true,
// //       videoPath,
// //       videoInfo: {
// //         title: info.title || 'TikTok Video',
// //         author: info.uploader || 'Unknown',
// //         likes: info.like_count || '0',
// //         comments: info.comment_count || '0',
// //         shares: info.repost_count || '0'
// //       }
// //     };
// //   } catch (error) {
// //     return { success: false, error: error.message };
// //   }
// // }

// // async function downloadFile(url, filePath) {
// //   const writer = createWriteStream(filePath);
// //   const response = await axios({
// //     method: 'GET',
// //     url: url,
// //     responseType: 'stream',
// //     timeout: 60000
// //   });

// //   response.data.pipe(writer);

// //   return new Promise((resolve, reject) => {
// //     writer.on('finish', resolve);
// //     writer.on('error', reject);
// //   });
// // }
















// // import axios from 'axios';
// // import { createWriteStream, existsSync, mkdirSync } from 'fs';
// // import { promisify } from 'util';
// // import { exec } from 'child_process';
// // import fs from 'fs';

// // const execAsync = promisify(exec);

// // // Store user captions
// // const userCaptions = new Map();

// // export default {
// //   name: "tiktok",
// //   description: "Download TikTok videos without watermark",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const userId = m.key.participant || m.key.remoteJid;

// //     try {
// //       if (!args[0]) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <url>\n\nEx: tiktok https://vt.tiktok.com/xyz` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const url = args[0];
      
// //       if (!isValidTikTokUrl(url)) {
// //         await sock.sendMessage(jid, { text: `❌ Invalid TikTok URL` }, { quoted: m });
// //         return;
// //       }

// //       await sock.sendMessage(jid, { text: `⏳ Downloading...` }, { quoted: m });

// //       const result = await downloadTikTok(url);
      
// //       if (!result.success) {
// //         await sock.sendMessage(jid, { text: `❌ Download failed` }, { quoted: m });
// //         return;
// //       }

// //       const { videoPath } = result;
      
// //       // Get user's custom caption or use default
// //       const userCaption = userCaptions.get(userId) || "WolfBot is the Alpha";

// //       await sock.sendMessage(jid, {
// //         video: fs.readFileSync(videoPath),
// //         caption: userCaption
// //       }, { quoted: m });

// //       setTimeout(() => {
// //         try {
// //           if (existsSync(videoPath)) fs.unlinkSync(videoPath);
// //         } catch (e) {}
// //       }, 30000);

// //     } catch (error) {
// //       await sock.sendMessage(jid, { text: `❌ Error` }, { quoted: m });
// //     }
// //   },
// // };

// // // Set caption command
// // export const setCaptionHandler = {
// //   name: "setcaption",
// //   description: "Set custom caption for TikTok downloads",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const userId = m.key.participant || m.key.remoteJid;

// //     try {
// //       if (!args[0]) {
// //         await sock.sendMessage(jid, { 
// //           text: `📝 *Set Caption*\n\nUsage: setcaption <your text>\n\nEx: setcaption My awesome video!\n\nCurrent: "${userCaptions.get(userId) || 'WolfBot is the Alpha'}"` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const caption = args.join(' ');
// //       userCaptions.set(userId, caption);

// //       await sock.sendMessage(jid, { 
// //         text: `✅ Caption set!\n\n"${caption}"` 
// //       }, { quoted: m });

// //     } catch (error) {
// //       await sock.sendMessage(jid, { text: `❌ Error setting caption` }, { quoted: m });
// //     }
// //   },
// // };

// // function isValidTikTokUrl(url) {
// //   const patterns = [
// //     /https?:\/\/(vm|vt)\.tiktok\.com\/\S+/,
// //     /https?:\/\/(www\.)?tiktok\.com\/@\S+\/video\/\d+/
// //   ];
// //   return patterns.some(pattern => pattern.test(url));
// // }

// // async function downloadTikTok(url) {
// //   try {
// //     const tempDir = './temp/tiktok';
// //     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

// //     const timestamp = Date.now();
// //     const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;

// //     const apis = [
// //       {
// //         url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
// //         videoKey: 'data.play'
// //       },
// //       {
// //         url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
// //         process: (data) => ({ 
// //           video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`
// //         })
// //       }
// //     ];

// //     let videoUrl = null;

// //     for (const api of apis) {
// //       try {
// //         const response = await axios.get(api.url, { timeout: 30000 });
        
// //         if (response.data) {
// //           let data = response.data;
          
// //           if (api.process) {
// //             const processed = api.process(data);
// //             videoUrl = processed.video_url;
// //           } else {
// //             videoUrl = api.videoKey.split('.').reduce((obj, key) => obj?.[key], data);
// //           }

// //           if (videoUrl) break;
// //         }
// //       } catch (e) {
// //         continue;
// //       }
// //     }

// //     if (!videoUrl) {
// //       return await downloadWithYtDlp(url, videoPath);
// //     }

// //     await downloadFile(videoUrl, videoPath);

// //     return {
// //       success: true,
// //       videoPath
// //     };

// //   } catch (error) {
// //     return { success: false, error: error.message };
// //   }
// // }

// // async function downloadWithYtDlp(url, videoPath) {
// //   try {
// //     await execAsync('yt-dlp --version');
// //   } catch {
// //     return { success: false, error: 'yt-dlp not installed' };
// //   }

// //   try {
// //     await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
// //     return { success: true, videoPath };
// //   } catch (error) {
// //     return { success: false, error: error.message };
// //   }
// // }

// // async function downloadFile(url, filePath) {
// //   const writer = createWriteStream(filePath);
// //   const response = await axios({
// //     method: 'GET',
// //     url: url,
// //     responseType: 'stream',
// //     timeout: 60000
// //   });

// //   response.data.pipe(writer);

// //   return new Promise((resolve, reject) => {
// //     writer.on('finish', resolve);
// //     writer.on('error', reject);
// //   });
// // }
















// import axios from 'axios';
// import { createWriteStream, existsSync, mkdirSync } from 'fs';
// import { promisify } from 'util';
// import { exec } from 'child_process';
// import fs from 'fs';

// const execAsync = promisify(exec);

// // Store user captions
// const userCaptions = new Map();

// export default {
//   name: "tiktok",
//   description: "Download TikTok videos without watermark",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const userId = m.key.participant || m.key.remoteJid;

//     try {
//       if (!args[0]) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <url>\n\nEx: tiktok https://vt.tiktok.com/xyz` 
//         }, { quoted: m });
//         return;
//       }

//       const url = args[0];
      
//       if (!isValidTikTokUrl(url)) {
//         await sock.sendMessage(jid, { text: `❌ Invalid TikTok URL` }, { quoted: m });
//         return;
//       }

//       await sock.sendMessage(jid, { text: `⏳ Downloading...` }, { quoted: m });

//       const result = await downloadTikTok(url);
      
//       if (!result.success) {
//         await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error || 'Unknown error'}` }, { quoted: m });
//         return;
//       }

//       const { videoPath } = result;
      
//       // Get user's custom caption or use default
//       const userCaption = userCaptions.get(userId) || "WolfBot is the Alpha";

//       try {
//         const videoData = fs.readFileSync(videoPath);
//         await sock.sendMessage(jid, {
//           video: videoData,
//           caption: userCaption
//         }, { quoted: m });

//         // Delete temp file immediately after sending
//         if (existsSync(videoPath)) {
//           fs.unlinkSync(videoPath);
//           console.log(`✅ [TIKTOK] Cleaned up temp video: ${videoPath}`);
//         }

//       } catch (sendError) {
//         console.error('❌ [TIKTOK] Error sending video:', sendError);
//         // Cleanup even if sending fails
//         if (existsSync(videoPath)) {
//           fs.unlinkSync(videoPath);
//           console.log(`🧹 [TIKTOK] Cleaned up failed send: ${videoPath}`);
//         }
//         throw sendError;
//       }

//     } catch (error) {
//       console.error('❌ [TIKTOK] Command error:', error);
//       await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
//     }
//   },
// };

// // Global function to get user caption (for use in other modules)
// export function getUserCaption(userId) {
//   return userCaptions.get(userId) || "WolfBot is the Alpha";
// }

// // Set caption command
// export const setCaptionHandler = {
//   name: "setcaption",
//   description: "Set custom caption for TikTok downloads",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const userId = m.key.participant || m.key.remoteJid;

//     try {
//       if (!args[0]) {
//         await sock.sendMessage(jid, { 
//           text: `📝 *Set Caption*\n\nUsage: setcaption <your text>\n\nEx: setcaption My awesome video!\n\nCurrent: "${userCaptions.get(userId) || 'WolfBot is the Alpha'}"` 
//         }, { quoted: m });
//         return;
//       }

//       const caption = args.join(' ');
//       userCaptions.set(userId, caption);

//       await sock.sendMessage(jid, { 
//         text: `✅ Caption set!\n\n"${caption}"` 
//       }, { quoted: m });

//     } catch (error) {
//       console.error('❌ [SETCAPTION] Error:', error);
//       await sock.sendMessage(jid, { text: `❌ Error setting caption` }, { quoted: m });
//     }
//   },
// };

// function isValidTikTokUrl(url) {
//   const patterns = [
//     /https?:\/\/(vm|vt)\.tiktok\.com\/\S+/,
//     /https?:\/\/(www\.)?tiktok\.com\/@\S+\/video\/\d+/
//   ];
//   return patterns.some(pattern => pattern.test(url));
// }

// async function downloadTikTok(url) {
//   try {
//     const tempDir = './temp/tiktok';
//     if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

//     const timestamp = Date.now();
//     const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;

//     const apis = [
//       {
//         url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
//         videoKey: 'data.play'
//       },
//       {
//         url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
//         process: (data) => ({ 
//           video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`
//         })
//       }
//     ];

//     let videoUrl = null;

//     for (const api of apis) {
//       try {
//         const response = await axios.get(api.url, { timeout: 30000 });
        
//         if (response.data) {
//           let data = response.data;
          
//           if (api.process) {
//             const processed = api.process(data);
//             videoUrl = processed.video_url;
//           } else {
//             videoUrl = api.videoKey.split('.').reduce((obj, key) => obj?.[key], data);
//           }

//           if (videoUrl) break;
//         }
//       } catch (e) {
//         console.log(`[TIKTOK] API ${api.url} failed:`, e.message);
//         continue;
//       }
//     }

//     if (!videoUrl) {
//       return await downloadWithYtDlp(url, videoPath);
//     }

//     await downloadFile(videoUrl, videoPath);

//     return {
//       success: true,
//       videoPath
//     };

//   } catch (error) {
//     console.error('❌ [TIKTOK] Download error:', error);
//     return { success: false, error: error.message };
//   }
// }

// async function downloadWithYtDlp(url, videoPath) {
//   try {
//     await execAsync('yt-dlp --version');
//   } catch {
//     return { success: false, error: 'yt-dlp not installed' };
//   }

//   try {
//     console.log(`[TIKTOK] Downloading with yt-dlp: ${url}`);
//     await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
//     return { success: true, videoPath };
//   } catch (error) {
//     console.error('❌ [TIKTOK] yt-dlp error:', error);
//     return { success: false, error: error.message };
//   }
// }

// async function downloadFile(url, filePath) {
//   const writer = createWriteStream(filePath);
//   const response = await axios({
//     method: 'GET',
//     url: url,
//     responseType: 'stream',
//     timeout: 60000,
//     headers: {
//       'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//       'Referer': 'https://www.tiktok.com/'
//     }
//   });

//   response.data.pipe(writer);

//   return new Promise((resolve, reject) => {
//     writer.on('finish', resolve);
//     writer.on('error', reject);
//   });
// }
































import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';

const execAsync = promisify(exec);

// Store user captions
const userCaptions = new Map();

export default {
  name: "tiktok",
  description: "Download TikTok videos without watermark",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎵 *TikTok Downloader*\n\nUsage: tiktok <url>\n\nEx: tiktok https://vt.tiktok.com/xyz` 
        }, { quoted: m });
        return;
      }

      const url = args[0];
      
      if (!isValidTikTokUrl(url)) {
        await sock.sendMessage(jid, { text: `❌ Invalid TikTok URL` }, { quoted: m });
        return;
      }

      await sock.sendMessage(jid, { text: `⏳ Downloading...` }, { quoted: m });

      const result = await downloadTikTok(url);
      
      if (!result.success) {
        await sock.sendMessage(jid, { text: `❌ Download failed: ${result.error || 'Unknown error'}` }, { quoted: m });
        return;
      }

      const { videoPath } = result;
      
      // Get user's custom caption or use default
      const userCaption = userCaptions.get(userId) || "WolfBot is the Alpha";

      try {
        // Read video file into buffer
        const videoData = fs.readFileSync(videoPath);
        const fileSize = fs.statSync(videoPath).size;
        console.log(`📊 [TIKTOK] Video size: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
        
        // Send video
        await sock.sendMessage(jid, {
          video: videoData,
          caption: userCaption,
          mimetype: 'video/mp4'
        }, { quoted: m });

        console.log(`✅ [TIKTOK] Video sent successfully`);

        // DELETE TEMP FILE IMMEDIATELY AFTER SENDING
        if (existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`🧹 [TIKTOK] Cleaned up temp video: ${videoPath}`);
        }

      } catch (sendError) {
        console.error('❌ [TIKTOK] Error sending video:', sendError);
        // Cleanup even if sending fails
        if (existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          console.log(`🧹 [TIKTOK] Cleaned up failed send: ${videoPath}`);
        }
        throw sendError;
      }

    } catch (error) {
      console.error('❌ [TIKTOK] Command error:', error);
      await sock.sendMessage(jid, { text: `❌ Error: ${error.message}` }, { quoted: m });
    }
  },
};

// Global function to get user caption (for use in other modules)
export function getUserCaption(userId) {
  return userCaptions.get(userId) || "WolfBot is the Alpha";
}

// Set caption command
export const setCaptionHandler = {
  name: "setcaption",
  description: "Set custom caption for TikTok downloads",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `📝 *Set Caption*\n\nUsage: setcaption <your text>\n\nEx: setcaption My awesome video!\n\nCurrent: "${userCaptions.get(userId) || 'WolfBot is the Alpha'}"` 
        }, { quoted: m });
        return;
      }

      const caption = args.join(' ');
      userCaptions.set(userId, caption);

      await sock.sendMessage(jid, { 
        text: `✅ Caption set!\n\n"${caption}"` 
      }, { quoted: m });

    } catch (error) {
      console.error('❌ [SETCAPTION] Error:', error);
      await sock.sendMessage(jid, { text: `❌ Error setting caption` }, { quoted: m });
    }
  },
};

function isValidTikTokUrl(url) {
  const patterns = [
    /https?:\/\/(vm|vt)\.tiktok\.com\/\S+/,
    /https?:\/\/(www\.)?tiktok\.com\/@\S+\/video\/\d+/
  ];
  return patterns.some(pattern => pattern.test(url));
}

async function downloadTikTok(url) {
  try {
    const tempDir = './temp/tiktok';
    if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

    const timestamp = Date.now();
    const videoPath = `${tempDir}/tiktok_${timestamp}.mp4`;

    const apis = [
      {
        url: `https://tikwm.com/api/?url=${encodeURIComponent(url)}`,
        videoKey: 'data.play'
      },
      {
        url: `https://api.tikmate.app/api/lookup?url=${encodeURIComponent(url)}`,
        process: (data) => ({ 
          video_url: `https://tikmate.app/download/${data.token}/${data.id}.mp4`
        })
      }
    ];

    let videoUrl = null;

    for (const api of apis) {
      try {
        const response = await axios.get(api.url, { timeout: 30000 });
        
        if (response.data) {
          let data = response.data;
          
          if (api.process) {
            const processed = api.process(data);
            videoUrl = processed.video_url;
          } else {
            videoUrl = api.videoKey.split('.').reduce((obj, key) => obj?.[key], data);
          }

          if (videoUrl) {
            console.log(`✅ [TIKTOK] Got video URL from ${api.url}`);
            break;
          }
        }
      } catch (e) {
        console.log(`[TIKTOK] API ${api.url} failed:`, e.message);
        continue;
      }
    }

    if (!videoUrl) {
      console.log(`[TIKTOK] No API worked, trying yt-dlp...`);
      return await downloadWithYtDlp(url, videoPath);
    }

    console.log(`[TIKTOK] Downloading video from: ${videoUrl}`);
    await downloadFile(videoUrl, videoPath);
    
    // Verify download was successful
    if (existsSync(videoPath) && fs.statSync(videoPath).size > 0) {
      const fileSize = fs.statSync(videoPath).size;
      console.log(`✅ [TIKTOK] Download successful: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      return {
        success: true,
        videoPath
      };
    } else {
      throw new Error('Downloaded file is empty or missing');
    }

  } catch (error) {
    console.error('❌ [TIKTOK] Download error:', error);
    return { success: false, error: error.message };
  }
}

async function downloadWithYtDlp(url, videoPath) {
  try {
    await execAsync('yt-dlp --version');
  } catch {
    return { success: false, error: 'yt-dlp not installed' };
  }

  try {
    console.log(`[TIKTOK] Downloading with yt-dlp: ${url}`);
    await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
    
    // Verify download
    if (existsSync(videoPath) && fs.statSync(videoPath).size > 0) {
      const fileSize = fs.statSync(videoPath).size;
      console.log(`✅ [TIKTOK] yt-dlp successful: ${(fileSize / 1024 / 1024).toFixed(2)} MB`);
      return { success: true, videoPath };
    } else {
      throw new Error('yt-dlp download failed');
    }
    
  } catch (error) {
    console.error('❌ [TIKTOK] yt-dlp error:', error);
    return { success: false, error: error.message };
  }
}

async function downloadFile(url, filePath) {
  const writer = createWriteStream(filePath);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 60000,
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Referer': 'https://www.tiktok.com/',
      'Accept': 'video/mp4,video/webm,video/*;q=0.9,*/*;q=0.8'
    }
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', (err) => {
      // Cleanup partial download on error
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