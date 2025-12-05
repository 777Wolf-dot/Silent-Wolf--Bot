// // import axios from "axios";
// // import crypto from "crypto";
// // import yts from "yt-search";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // const savetube = {
// //    api: {
// //       base: "https://media.savetube.me/api",
// //       cdn: "/random-cdn",
// //       info: "/v2/info",
// //       download: "/download"
// //    },
// //    headers: {
// //       'accept': '*/*',
// //       'content-type': 'application/json',
// //       'origin': 'https://yt.savetube.me',
// //       'referer': 'https://yt.savetube.me/',
// //       'user-agent': 'Postify/1.0.0'
// //    },
// //    formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
// //    crypto: {
// //       hexToBuffer: (hexString) => {
// //          const matches = hexString.match(/.{1,2}/g);
// //          return Buffer.from(matches.join(''), 'hex');
// //       },
// //       decrypt: async (enc) => {
// //          try {
// //             const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
// //             const data = Buffer.from(enc, 'base64');
// //             const iv = data.slice(0, 16);
// //             const content = data.slice(16);
// //             const key = savetube.crypto.hexToBuffer(secretKey);
// //             const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
// //             let decrypted = decipher.update(content);
// //             decrypted = Buffer.concat([decrypted, decipher.final()]);
// //             return JSON.parse(decrypted.toString());
// //          } catch (error) {
// //             throw new Error(error)
// //          }
// //       }
// //    },
// //    youtube: url => {
// //       if (!url) return null;
// //       const a = [
// //          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
// //          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
// //          /youtu\.be\/([a-zA-Z0-9_-]{11})/
// //       ];
// //       for (let b of a) {
// //          if (b.test(url)) return url.match(b)[1];
// //       }
// //       return null
// //    },
// //    request: async (endpoint, data = {}, method = 'post') => {
// //       try {
// //          const {
// //             data: response
// //          } = await axios({
// //             method,
// //             url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
// //             data: method === 'post' ? data : undefined,
// //             params: method === 'get' ? data : undefined,
// //             headers: savetube.headers
// //          })
// //          return {
// //             status: true,
// //             code: 200,
// //             data: response
// //          }
// //       } catch (error) {
// //          throw new Error(error)
// //       }
// //    },
// //    getCDN: async () => {
// //       const response = await savetube.request(savetube.api.cdn, {}, 'get');
// //       if (!response.status) throw new Error(response)
// //       return {
// //          status: true,
// //          code: 200,
// //          data: response.data.cdn
// //       }
// //    },
// //    download: async (link, format) => {
// //       if (!link) {
// //          return {
// //             status: false,
// //             code: 400,
// //             error: "No link provided. Please provide a valid YouTube link."
// //          }
// //       }
// //       if (!format || !savetube.formats.includes(format)) {
// //          return {
// //             status: false,
// //             code: 400,
// //             error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
// //             available_fmt: savetube.formats
// //          }
// //       }
// //       const id = savetube.youtube(link);
// //       if (!id) throw new Error('Invalid YouTube link.');
// //       try {
// //          const cdnx = await savetube.getCDN();
// //          if (!cdnx.status) return cdnx;
// //          const cdn = cdnx.data;
// //          const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
// //             url: `https://www.youtube.com/watch?v=${id}`
// //          });
// //          if (!result.status) return result;
// //          const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
// //          try {
// //             dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
// //                id: id,
// //                downloadType: format === 'mp3' ? 'audio' : 'video',
// //                quality: format === 'mp3' ? '128' : format,
// //                key: decrypted.key
// //             });
// //          } catch (error) {
// //             throw new Error('Failed to get download link. Please try again later.');
// //          };
// //          return {
// //             status: true,
// //             code: 200,
// //             result: {
// //                title: decrypted.title || "Unknown Title",
// //                type: format === 'mp3' ? 'audio' : 'video',
// //                format: format,
// //                thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
// //                download: dl.data.data.downloadUrl,
// //                id: id,
// //                key: decrypted.key,
// //                duration: decrypted.duration,
// //                quality: format === 'mp3' ? '128' : format,
// //                downloaded: dl.data.data.downloaded
// //             }
// //          }
// //       } catch (error) {
// //          throw new Error('An error occurred while processing your request. Please try again later.');
// //       }
// //    }
// // };

// // export default {
// //   name: "song",
// //   description: "Download and send songs as audio messages",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (args.length === 0) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const searchQuery = args.join(" ");
// //       console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

// //       const statusMsg = await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}"` 
// //       }, { quoted: m });

// //       // Determine if input is YouTube link or search query
// //       let videoUrl = '';
// //       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
// //         videoUrl = searchQuery;
// //       } else {
// //         // Search YouTube for the video
// //         const { videos } = await yts(searchQuery);
// //         if (!videos || videos.length === 0) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ No songs found for "${searchQuery}"`,
// //             edit: statusMsg.key 
// //           });
// //           return;
// //         }
// //         videoUrl = videos[0].url;
// //         console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
// //       }

// //       await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
// //         edit: statusMsg.key 
// //       });

// //       // Download using savetube
// //       let result;
// //       try {
// //         result = await savetube.download(videoUrl, 'mp3');
// //       } catch (err) {
// //         console.error("❌ [SONG] Savetube error:", err);
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Download service failed`,
// //           edit: statusMsg.key 
// //         });
// //         return;
// //       }

// //       if (!result || !result.status || !result.result || !result.result.download) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to get download link`,
// //           edit: statusMsg.key 
// //         });
// //         return;
// //       }

// //       // Send thumbnail preview first
// //       try {
// //         await sock.sendMessage(jid, {
// //           image: { url: result.result.thumbnail },
// //           caption: `🎵 *${result.result.title}*\n⬇️ Downloading audio...`
// //         }, { quoted: m });
// //       } catch (thumbnailError) {
// //         console.log("❌ Could not send thumbnail");
// //       }

// //       await sock.sendMessage(jid, { 
// //         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
// //         edit: statusMsg.key 
// //       });

// //       // Download the audio file
// //       const tempDir = path.join(__dirname, "../temp");
// //       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
// //       const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
// //       try {
// //         const response = await axios({
// //           url: result.result.download,
// //           method: 'GET',
// //           responseType: 'stream',
// //           timeout: 45000
// //         });

// //         if (response.status !== 200) {
// //           throw new Error('Failed to download audio file');
// //         }

// //         const writer = fs.createWriteStream(tempFile);
// //         response.data.pipe(writer);
        
// //         await new Promise((resolve, reject) => {
// //           writer.on('finish', resolve);
// //           writer.on('error', reject);
// //         });

// //         // Read the file into buffer
// //         const audioBuffer = fs.readFileSync(tempFile);
// //         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

// //         // Send as AUDIO MESSAGE (not document)
// //         await sock.sendMessage(jid, {
// //           audio: audioBuffer,
// //           mimetype: 'audio/mpeg',
// //           ptt: false, // Not push-to-talk
// //           contextInfo: {
// //             externalAdReply: {
// //               title: result.result.title,
// //               body: `🎵 Song Audio • ${fileSizeMB}MB`,
// //               mediaType: 2,
// //               thumbnail: await getThumbnailBuffer(result.result.thumbnail),
// //               mediaUrl: videoUrl
// //             }
// //           }
// //         }, { quoted: m });

// //         await sock.sendMessage(jid, { 
// //           text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n🎧 You can play this directly in chat`,
// //           edit: statusMsg.key 
// //         });

// //         console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

// //       } catch (downloadError) {
// //         console.error("❌ [SONG] Download error:", downloadError);
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to download audio file`,
// //           edit: statusMsg.key 
// //         });
// //       } finally {
// //         // Clean up temp file
// //         setTimeout(() => {
// //           try {
// //             if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
// //           } catch (cleanError) {
// //             console.log("Cleanup error:", cleanError);
// //           }
// //         }, 5000);
// //       }

// //     } catch (error) {
// //       console.error("❌ [SONG] ERROR:", error);
// //       await sock.sendMessage(jid, { 
// //         text: `❌ Error: ${error.message}` 
// //       }, { quoted: m });
// //     }
// //   },
// // };

// // // Helper function to get thumbnail buffer for audio message
// // async function getThumbnailBuffer(thumbnailUrl) {
// //   try {
// //     const response = await axios.get(thumbnailUrl, {
// //       responseType: 'arraybuffer',
// //       timeout: 10000
// //     });
// //     return Buffer.from(response.data);
// //   } catch (error) {
// //     console.log("❌ Could not fetch thumbnail");
// //     return null;
// //   }
// // }
































































// import axios from "axios";
// import crypto from "crypto";
// import yts from "yt-search";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const savetube = {
//    api: {
//       base: "https://media.savetube.me/api",
//       cdn: "/random-cdn",
//       info: "/v2/info",
//       download: "/download"
//    },
//    headers: {
//       'accept': '*/*',
//       'content-type': 'application/json',
//       'origin': 'https://yt.savetube.me',
//       'referer': 'https://yt.savetube.me/',
//       'user-agent': 'Postify/1.0.0'
//    },
//    formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
//    crypto: {
//       hexToBuffer: (hexString) => {
//          const matches = hexString.match(/.{1,2}/g);
//          return Buffer.from(matches.join(''), 'hex');
//       },
//       decrypt: async (enc) => {
//          try {
//             const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
//             const data = Buffer.from(enc, 'base64');
//             const iv = data.slice(0, 16);
//             const content = data.slice(16);
//             const key = savetube.crypto.hexToBuffer(secretKey);
//             const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
//             let decrypted = decipher.update(content);
//             decrypted = Buffer.concat([decrypted, decipher.final()]);
//             return JSON.parse(decrypted.toString());
//          } catch (error) {
//             throw new Error(error)
//          }
//       }
//    },
//    youtube: url => {
//       if (!url) return null;
//       const a = [
//          /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
//          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
//          /youtu\.be\/([a-zA-Z0-9_-]{11})/
//       ];
//       for (let b of a) {
//          if (b.test(url)) return url.match(b)[1];
//       }
//       return null
//    },
//    request: async (endpoint, data = {}, method = 'post') => {
//       try {
//          const {
//             data: response
//          } = await axios({
//             method,
//             url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
//             data: method === 'post' ? data : undefined,
//             params: method === 'get' ? data : undefined,
//             headers: savetube.headers
//          })
//          return {
//             status: true,
//             code: 200,
//             data: response
//          }
//       } catch (error) {
//          throw new Error(error)
//       }
//    },
//    getCDN: async () => {
//       const response = await savetube.request(savetube.api.cdn, {}, 'get');
//       if (!response.status) throw new Error(response)
//       return {
//          status: true,
//          code: 200,
//          data: response.data.cdn
//       }
//    },
//    download: async (link, format) => {
//       if (!link) {
//          return {
//             status: false,
//             code: 400,
//             error: "No link provided. Please provide a valid YouTube link."
//          }
//       }
//       if (!format || !savetube.formats.includes(format)) {
//          return {
//             status: false,
//             code: 400,
//             error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
//             available_fmt: savetube.formats
//          }
//       }
//       const id = savetube.youtube(link);
//       if (!id) throw new Error('Invalid YouTube link.');
//       try {
//          const cdnx = await savetube.getCDN();
//          if (!cdnx.status) return cdnx;
//          const cdn = cdnx.data;
//          const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
//             url: `https://www.youtube.com/watch?v=${id}`
//          });
//          if (!result.status) return result;
//          const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
//          try {
//             dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
//                id: id,
//                downloadType: format === 'mp3' ? 'audio' : 'video',
//                quality: format === 'mp3' ? '128' : format,
//                key: decrypted.key
//             });
//          } catch (error) {
//             throw new Error('Failed to get download link. Please try again later.');
//          };
//          return {
//             status: true,
//             code: 200,
//             result: {
//                title: decrypted.title || "Unknown Title",
//                type: format === 'mp3' ? 'audio' : 'video',
//                format: format,
//                thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
//                download: dl.data.data.downloadUrl,
//                id: id,
//                key: decrypted.key,
//                duration: decrypted.duration,
//                quality: format === 'mp3' ? '128' : format,
//                downloaded: dl.data.data.downloaded
//             }
//          }
//       } catch (error) {
//          throw new Error('An error occurred while processing your request. Please try again later.');
//       }
//    }
// };

// export default {
//   name: "song",
//   description: "Download and send songs as audio messages",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
//         }, { quoted: m });
//         return;
//       }

//       const searchQuery = args.join(" ");
//       console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}"` 
//       }, { quoted: m });

//       // Determine if input is YouTube link or search query
//       let videoUrl = '';
//       if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
//         videoUrl = searchQuery;
//       } else {
//         // Search YouTube for the video
//         const { videos } = await yts(searchQuery);
//         if (!videos || videos.length === 0) {
//           await sock.sendMessage(jid, { 
//             text: `❌ No songs found for "${searchQuery}"`,
//             edit: statusMsg.key 
//           });
//           return;
//         }
//         videoUrl = videos[0].url;
//         console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
//       }

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
//         edit: statusMsg.key 
//       });

//       // Download using savetube
//       let result;
//       try {
//         result = await savetube.download(videoUrl, 'mp3');
//       } catch (err) {
//         console.error("❌ [SONG] Savetube error:", err);
//         await sock.sendMessage(jid, { 
//           text: `❌ Download service failed`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (!result || !result.status || !result.result || !result.result.download) {
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to get download link`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Removed the image sending part here
//       // The thumbnail preview image sending has been removed as requested

//       await sock.sendMessage(jid, { 
//         text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
//         edit: statusMsg.key 
//       });

//       // Download the audio file
//       const tempDir = path.join(__dirname, "../temp");
//       if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
//       const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
//       try {
//         const response = await axios({
//           url: result.result.download,
//           method: 'GET',
//           responseType: 'stream',
//           timeout: 45000
//         });

//         if (response.status !== 200) {
//           throw new Error('Failed to download audio file');
//         }

//         const writer = fs.createWriteStream(tempFile);
//         response.data.pipe(writer);
        
//         await new Promise((resolve, reject) => {
//           writer.on('finish', resolve);
//           writer.on('error', reject);
//         });

//         // Read the file into buffer
//         const audioBuffer = fs.readFileSync(tempFile);
//         const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

//         // Send as AUDIO MESSAGE (not document)
//         await sock.sendMessage(jid, {
//           audio: audioBuffer,
//           mimetype: 'audio/mpeg',
//           ptt: false, // Not push-to-talk
//           contextInfo: {
//             externalAdReply: {
//               title: result.result.title,
//               body: `🎵 Song Audio • ${fileSizeMB}MB`,
//               mediaType: 2,
//               thumbnail: await getThumbnailBuffer(result.result.thumbnail),
//               mediaUrl: videoUrl
//             }
//           }
//         }, { quoted: m });

//         await sock.sendMessage(jid, { 
//           text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n`,
//           edit: statusMsg.key 
//         });

//         console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

//       } catch (downloadError) {
//         console.error("❌ [SONG] Download error:", downloadError);
//         await sock.sendMessage(jid, { 
//           text: `❌ Failed to download audio file`,
//           edit: statusMsg.key 
//         });
//       } finally {
//         // Clean up temp file
//         setTimeout(() => {
//           try {
//             if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
//           } catch (cleanError) {
//             console.log("Cleanup error:", cleanError);
//           }
//         }, 5000);
//       }

//     } catch (error) {
//       console.error("❌ [SONG] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}` 
//       }, { quoted: m });
//     }
//   },
// };

// // Helper function to get thumbnail buffer for audio message
// async function getThumbnailBuffer(thumbnailUrl) {
//   try {
//     const response = await axios.get(thumbnailUrl, {
//       responseType: 'arraybuffer',
//       timeout: 10000
//     });
//     return Buffer.from(response.data);
//   } catch (error) {
//     console.log("❌ Could not fetch thumbnail");
//     return null;
//   }
// }

















import axios from "axios";
import crypto from "crypto";
import yts from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const savetube = {
   api: {
      base: "https://media.savetube.me/api",
      cdn: "/random-cdn",
      info: "/v2/info",
      download: "/download"
   },
   headers: {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://yt.savetube.me',
      'referer': 'https://yt.savetube.me/',
      'user-agent': 'Postify/1.0.0'
   },
   formats: ['144', '240', '360', '480', '720', '1080', 'mp3'],
   crypto: {
      hexToBuffer: (hexString) => {
         const matches = hexString.match(/.{1,2}/g);
         return Buffer.from(matches.join(''), 'hex');
      },
      decrypt: async (enc) => {
         try {
            const secretKey = 'C5D58EF67A7584E4A29F6C35BBC4EB12';
            const data = Buffer.from(enc, 'base64');
            const iv = data.slice(0, 16);
            const content = data.slice(16);
            const key = savetube.crypto.hexToBuffer(secretKey);
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
            let decrypted = decipher.update(content);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
            return JSON.parse(decrypted.toString());
         } catch (error) {
            throw new Error(error)
         }
      }
   },
   youtube: url => {
      if (!url) return null;
      const a = [
         /youtube\.com\/watch\?v=([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/v\/([a-zA-Z0-9_-]{11})/,
         /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
         /youtu\.be\/([a-zA-Z0-9_-]{11})/
      ];
      for (let b of a) {
         if (b.test(url)) return url.match(b)[1];
      }
      return null
   },
   request: async (endpoint, data = {}, method = 'post') => {
      try {
         const {
            data: response
         } = await axios({
            method,
            url: `${endpoint.startsWith('http') ? '' : savetube.api.base}${endpoint}`,
            data: method === 'post' ? data : undefined,
            params: method === 'get' ? data : undefined,
            headers: savetube.headers
         })
         return {
            status: true,
            code: 200,
            data: response
         }
      } catch (error) {
         throw new Error(error)
      }
   },
   getCDN: async () => {
      const response = await savetube.request(savetube.api.cdn, {}, 'get');
      if (!response.status) throw new Error(response)
      return {
         status: true,
         code: 200,
         data: response.data.cdn
      }
   },
   download: async (link, format) => {
      if (!link) {
         return {
            status: false,
            code: 400,
            error: "No link provided. Please provide a valid YouTube link."
         }
      }
      if (!format || !savetube.formats.includes(format)) {
         return {
            status: false,
            code: 400,
            error: "Invalid format. Please choose one of the available formats: 144, 240, 360, 480, 720, 1080, mp3.",
            available_fmt: savetube.formats
         }
      }
      const id = savetube.youtube(link);
      if (!id) throw new Error('Invalid YouTube link.');
      try {
         const cdnx = await savetube.getCDN();
         if (!cdnx.status) return cdnx;
         const cdn = cdnx.data;
         const result = await savetube.request(`https://${cdn}${savetube.api.info}`, {
            url: `https://www.youtube.com/watch?v=${id}`
         });
         if (!result.status) return result;
         const decrypted = await savetube.crypto.decrypt(result.data.data); var dl;
         try {
            dl = await savetube.request(`https://${cdn}${savetube.api.download}`, {
               id: id,
               downloadType: format === 'mp3' ? 'audio' : 'video',
               quality: format === 'mp3' ? '128' : format,
               key: decrypted.key
            });
         } catch (error) {
            throw new Error('Failed to get download link. Please try again later.');
         };
         return {
            status: true,
            code: 200,
            result: {
               title: decrypted.title || "Unknown Title",
               type: format === 'mp3' ? 'audio' : 'video',
               format: format,
               thumbnail: decrypted.thumbnail || `https://i.ytimg.com/vi/${id}/0.jpg`,
               download: dl.data.data.downloadUrl,
               id: id,
               key: decrypted.key,
               duration: decrypted.duration,
               quality: format === 'mp3' ? '128' : format,
               downloaded: dl.data.data.downloaded
            }
         }
      } catch (error) {
         throw new Error('An error occurred while processing your request. Please try again later.');
      }
   }
};

export default {
  name: "song",
  description: "Download and send songs as audio messages",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Song Audio*\n\n song <song name>\n\nExample: song Home by NF` 
        }, { quoted: m });
        return;
      }

      const searchQuery = args.join(" ");
      console.log(`🎵 [SONG] Searching for: ${searchQuery}`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}"` 
      }, { quoted: m });

      // Determine if input is YouTube link or search query
      let videoUrl = '';
      if (searchQuery.startsWith('http://') || searchQuery.startsWith('https://')) {
        videoUrl = searchQuery;
      } else {
        // Search YouTube for the video
        const { videos } = await yts(searchQuery);
        if (!videos || videos.length === 0) {
          await sock.sendMessage(jid, { 
            text: `❌ No songs found for "${searchQuery}"`,
            edit: statusMsg.key 
          });
          return;
        }
        videoUrl = videos[0].url;
        console.log(`🎵 [SONG] Found: ${videos[0].title} - ${videoUrl}`);
      }

      await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...*`,
        edit: statusMsg.key 
      });

      // Download using savetube
      let result;
      try {
        result = await savetube.download(videoUrl, 'mp3');
      } catch (err) {
        console.error("❌ [SONG] Savetube error:", err);
        await sock.sendMessage(jid, { 
          text: `❌ Download service failed`,
          edit: statusMsg.key 
        });
        return;
      }

      if (!result || !result.status || !result.result || !result.result.download) {
        await sock.sendMessage(jid, { 
          text: `❌ Failed to get download link`,
          edit: statusMsg.key 
        });
        return;
      }

      await sock.sendMessage(jid, { 
        text: `🔍 *Searching*: "${searchQuery}" ✅\n⬇️ *Downloading audio...* ✅\n🎵 *Sending audio message...*`,
        edit: statusMsg.key 
      });

      // Download the audio file
      const tempDir = path.join(__dirname, "../temp");
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      
      const tempFile = path.join(tempDir, `${Date.now()}_song.mp3`);
      
      try {
        const response = await axios({
          url: result.result.download,
          method: 'GET',
          responseType: 'stream',
          timeout: 45000
        });

        if (response.status !== 200) {
          throw new Error('Failed to download audio file');
        }

        const writer = fs.createWriteStream(tempFile);
        response.data.pipe(writer);
        
        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Read the file into buffer
        const audioBuffer = fs.readFileSync(tempFile);
        const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

        // Get thumbnail for audio message
        let thumbnailBuffer = null;
        try {
          const thumbnailResponse = await axios.get(result.result.thumbnail, {
            responseType: 'arraybuffer',
            timeout: 10000
          });
          thumbnailBuffer = Buffer.from(thumbnailResponse.data);
        } catch (thumbError) {
          console.log("❌ Could not fetch thumbnail, using default");
        }

        // Send as AUDIO MESSAGE (not document)
        await sock.sendMessage(jid, {
          audio: audioBuffer,
          mimetype: 'audio/mpeg',
          ptt: false, // Not push-to-talk
          contextInfo: {
            externalAdReply: {
              title: result.result.title,
              body: `🎵 Song Audio • ${fileSizeMB}MB`,
              mediaType: 2,
              thumbnail: thumbnailBuffer,
              mediaUrl: videoUrl
            }
          }
        }, { quoted: m });

        // Delete temp file immediately after sending
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`✅ [SONG] Cleaned up temp file: ${tempFile}`);
        }

        await sock.sendMessage(jid, { 
          text: `✅ *Audio Sent!*\n\n"${result.result.title}"\n`,
          edit: statusMsg.key 
        });

        console.log(`✅ [SONG] Successfully sent audio: ${result.result.title}`);

      } catch (downloadError) {
        console.error("❌ [SONG] Download error:", downloadError);
        await sock.sendMessage(jid, { 
          text: `❌ Failed to download audio file`,
          edit: statusMsg.key 
        });
        
        // Clean up temp file even if sending fails
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
          console.log(`🧹 [SONG] Cleaned up failed download: ${tempFile}`);
        }
      }

    } catch (error) {
      console.error("❌ [SONG] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}` 
      }, { quoted: m });
    }
  },
};