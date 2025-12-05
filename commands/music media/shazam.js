// import axios from 'axios';
// import fs from 'fs';
// import { promisify } from 'util';
// import FormData from 'form-data';
// import { fileTypeFromBuffer } from 'file-type';

// // Promisify fs functions
// const writeFileAsync = promisify(fs.writeFile);
// const unlinkAsync = promisify(fs.unlink);
// const existsAsync = promisify(fs.exists);
// const mkdirAsync = promisify(fs.mkdir);

// // Use dynamic import for baileys since it might be CommonJS
// let downloadContentFromMessage;
// try {
//     const baileys = await import('@whiskeysockets/baileys');
//     downloadContentFromMessage = baileys.downloadContentFromMessage || 
//                                  (baileys.default && baileys.default.downloadContentFromMessage);
// } catch (error) {
//     console.error('Failed to import baileys:', error);
// }

// export default {
//     name: "shazam",
//     description: "Identify music from audio/video",
//     aliases: ["identify", "music", "song", "recognize"],
    
//     async execute(sock, m, args, metadata) {
//         const jid = m.key.remoteJid;
//         console.log('🎵 Shazam command triggered');
        
//         try {
//             // Check if message has audio/video or is a reply to audio/video
//             let mediaMessage = null;
//             let mediaType = null;
            
//             // Check current message
//             if (m.message?.audioMessage) {
//                 mediaMessage = m.message.audioMessage;
//                 mediaType = 'audio';
//                 console.log('Found audio in current message');
//             } else if (m.message?.videoMessage) {
//                 mediaMessage = m.message.videoMessage;
//                 mediaType = 'video';
//                 console.log('Found video in current message');
//             }
//             // Check quoted message
//             else if (m.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
//                 const quotedMsg = m.message.extendedTextMessage.contextInfo.quotedMessage;
//                 console.log('Checking quoted message');
                
//                 if (quotedMsg.audioMessage) {
//                     mediaMessage = quotedMsg.audioMessage;
//                     mediaType = 'audio';
//                     console.log('Found audio in quoted message');
//                 } else if (quotedMsg.videoMessage) {
//                     mediaMessage = quotedMsg.videoMessage;
//                     mediaType = 'video';
//                     console.log('Found video in quoted message');
//                 }
//             }

//             if (!mediaMessage || !mediaType) {
//                 console.log('No media found, sending instructions');
//                 await sock.sendMessage(jid, { 
//                     text: `🎵 *Shazam Music Recognition*\n\nSend or reply to an audio/video message with music.\n\nExample: Reply to an audio message with "!shazam"` 
//                 }, { quoted: m });
//                 return;
//             }

//             // Send initial analyzing message
//             console.log('Sending initial message');
//             let analyzingMsg;
//             try {
//                 analyzingMsg = await sock.sendMessage(jid, { 
//                     text: `🔍 *Downloading ${mediaType}...*` 
//                 }, { quoted: m });
//             } catch (sendError) {
//                 console.error('Failed to send initial message:', sendError);
//                 analyzingMsg = null;
//             }

//             // Download the media
//             let audioBuffer;
//             try {
//                 console.log('Downloading media...');
                
//                 // Try different download methods
//                 if (sock.downloadMediaMessage) {
//                     // Method 1: downloadMediaMessage (if available)
//                     audioBuffer = await sock.downloadMediaMessage(mediaMessage);
//                 } else if (downloadContentFromMessage) {
//                     // Method 2: downloadContentFromMessage from baileys
//                     const stream = await downloadContentFromMessage(mediaMessage, mediaType);
//                     const chunks = [];
//                     for await (const chunk of stream) {
//                         chunks.push(chunk);
//                     }
//                     audioBuffer = Buffer.concat(chunks);
//                 } else if (sock.downloadAndSaveMediaMessage) {
//                     // Method 3: downloadAndSaveMediaMessage
//                     const tempPath = await sock.downloadAndSaveMediaMessage(mediaMessage);
//                     audioBuffer = fs.readFileSync(tempPath);
//                     fs.unlinkSync(tempPath); // Clean up
//                 } else {
//                     throw new Error('No supported download method found');
//                 }
                
//                 if (!audioBuffer || audioBuffer.length === 0) {
//                     throw new Error('Downloaded audio is empty');
//                 }
                
//                 console.log(`Downloaded ${mediaType}: ${audioBuffer.length} bytes`);
                
//                 if (analyzingMsg) {
//                     await sock.sendMessage(jid, { 
//                         text: `✅ Downloaded ${(audioBuffer.length / 1024).toFixed(0)} KB\n🎵 *Identifying music...*`,
//                         edit: analyzingMsg.key
//                     });
//                 }
                
//             } catch (downloadError) {
//                 console.error('Download error:', downloadError);
//                 await sock.sendMessage(jid, { 
//                     text: `❌ Failed to download ${mediaType}.\nError: ${downloadError.message}`
//                 }, { quoted: m });
//                 return;
//             }

//             // Create temp directory
//             const tempDir = './temp';
//             if (!await existsAsync(tempDir)) {
//                 await mkdirAsync(tempDir, { recursive: true });
//             }
            
//             const tempFilePath = `${tempDir}/audio_${Date.now()}.mp3`;
            
//             try {
//                 console.log('Saving to temp file:', tempFilePath);
//                 await writeFileAsync(tempFilePath, audioBuffer);
                
//                 if (analyzingMsg) {
//                     await sock.sendMessage(jid, { 
//                         text: `📤 *Processing audio...*`,
//                         edit: analyzingMsg.key
//                     });
//                 }
                
//                 // Try to identify using different methods
//                 console.log('Trying to identify music...');
//                 let result;
                
//                 // Method 1: Try direct API with buffer
//                 try {
//                     result = await identifyMusicDirect(audioBuffer);
//                 } catch (error1) {
//                     console.log('Method 1 failed:', error1.message);
                    
//                     // Method 2: Try with file upload
//                     try {
//                         result = await identifyMusicWithUpload(tempFilePath);
//                     } catch (error2) {
//                         console.log('Method 2 failed:', error2.message);
                        
//                         // Method 3: Try simple API
//                         result = await identifyMusicSimple(audioBuffer);
//                     }
//                 }
                
//                 if (result && result.success) {
//                     console.log('Song identified:', result.track.title);
//                     const resultText = formatShazamResult(result.track);
                    
//                     if (analyzingMsg) {
//                         await sock.sendMessage(jid, { 
//                             text: resultText,
//                             edit: analyzingMsg.key
//                         });
//                     } else {
//                         await sock.sendMessage(jid, { 
//                             text: resultText
//                         }, { quoted: m });
//                     }
                    
//                 } else {
//                     console.log('No match found');
//                     await sock.sendMessage(jid, { 
//                         text: `❌ *Could not identify music*\n\n*Tips:*\n• Use 10-30 seconds of clear audio\n• Less background noise\n• Popular songs work better`
//                     }, { quoted: m });
//                 }
                
//             } catch (error) {
//                 console.error('Processing error:', error);
//                 await sock.sendMessage(jid, { 
//                     text: `❌ Processing error: ${error.message}`
//                 }, { quoted: m });
//             } finally {
//                 // Cleanup
//                 try {
//                     if (await existsAsync(tempFilePath)) {
//                         await unlinkAsync(tempFilePath);
//                         console.log('Temp file cleaned up');
//                     }
//                 } catch (e) {
//                     console.log('Cleanup error:', e.message);
//                 }
//             }

//         } catch (error) {
//             console.error('Shazam command error:', error);
//             await sock.sendMessage(jid, { 
//                 text: `❌ Error: ${error.message}` 
//             }, { quoted: m });
//         }
//     }
// };

// // Method 1: Direct identification with buffer
// async function identifyMusicDirect(audioBuffer) {
//     try {
//         console.log('Trying direct identification...');
        
//         // Use a simple Shazam API endpoint
//         const formData = new FormData();
//         formData.append('file', audioBuffer, {
//             filename: 'audio.mp3',
//             contentType: 'audio/mpeg'
//         });
        
//         const response = await axios.post('https://api.audd.io/', formData, {
//             headers: {
//                 ...formData.getHeaders(),
//                 'Accept': 'application/json'
//             },
//             params: {
//                 api_token: 'test', // You'll need to get a real API key from audd.io
//                 return: 'spotify'
//             },
//             timeout: 30000
//         });
        
//         const data = response.data;
//         console.log('Direct API response:', data);
        
//         if (data.status === 'success' && data.result) {
//             const track = data.result;
//             return {
//                 success: true,
//                 track: {
//                     title: track.title || 'Unknown',
//                     artist: track.artist || 'Unknown',
//                     album: track.album || 'Unknown Album',
//                     releaseDate: track.release_date || 'Unknown',
//                     genre: track.genre || 'Unknown Genre',
//                     spotifyUrl: track.spotify?.external_urls?.spotify || '',
//                     confidence: track.score ? `${Math.round(track.score * 100)}%` : 'Unknown'
//                 }
//             };
//         }
        
//         throw new Error('No match found');
        
//     } catch (error) {
//         console.error('Direct identification error:', error.message);
//         throw error;
//     }
// }

// // Method 2: Identification with file upload
// async function identifyMusicWithUpload(filePath) {
//     try {
//         console.log('Trying identification with upload...');
        
//         // Read the file
//         const fileBuffer = fs.readFileSync(filePath);
        
//         // Try public Shazam API
//         const formData = new FormData();
//         formData.append('audio', fileBuffer, {
//             filename: 'audio.mp3',
//             contentType: 'audio/mpeg'
//         });
        
//         const response = await axios.post('https://shazam-api-free.p.rapidapi.com/shazam', formData, {
//             headers: {
//                 ...formData.getHeaders(),
//                 'X-RapidAPI-Key': 'your-rapidapi-key-here', // You need to get this from RapidAPI
//                 'X-RapidAPI-Host': 'shazam-api-free.p.rapidapi.com'
//             },
//             timeout: 30000
//         });
        
//         const data = response.data;
//         console.log('Upload API response:', data);
        
//         if (data && data.track) {
//             const track = data.track;
//             return {
//                 success: true,
//                 track: {
//                     title: track.title || track.heading?.title || 'Unknown',
//                     artist: track.subtitle || track.heading?.subtitle || 'Unknown',
//                     album: track.sections?.[0]?.metadata?.[0]?.text || 'Unknown Album',
//                     genre: track.genres?.primary || 'Unknown Genre',
//                     spotifyUrl: track.share?.href || '',
//                     confidence: 'High'
//                 }
//             };
//         }
        
//         throw new Error('No match found');
        
//     } catch (error) {
//         console.error('Upload identification error:', error.message);
//         throw error;
//     }
// }

// // Method 3: Simple identification (fallback)
// async function identifyMusicSimple(audioBuffer) {
//     try {
//         console.log('Trying simple identification...');
        
//         // Use a free public API
//         const formData = new FormData();
//         formData.append('file', audioBuffer, 'audio.mp3');
        
//         // This is a demo API - you might need to find a working one
//         const response = await axios.post('https://api.musicidentify.com/identify', formData, {
//             headers: formData.getHeaders(),
//             timeout: 20000
//         });
        
//         const data = response.data;
//         console.log('Simple API response:', data);
        
//         if (data.success && data.result) {
//             return {
//                 success: true,
//                 track: {
//                     title: data.result.title || 'Unknown',
//                     artist: data.result.artist || 'Unknown',
//                     album: data.result.album || 'Unknown Album',
//                     confidence: data.result.confidence || 'Unknown'
//                 }
//             };
//         }
        
//         // If all APIs fail, return a demo response for testing
//         return {
//             success: true,
//             track: {
//                 title: "Demo Song",
//                 artist: "Demo Artist",
//                 album: "Demo Album",
//                 releaseDate: "2023",
//                 genre: "Pop",
//                 confidence: "High (Demo Mode)",
//                 note: "This is a demo response. Get a real API key from audd.io or RapidAPI for actual identification."
//             }
//         };
        
//     } catch (error) {
//         console.error('Simple identification error:', error.message);
//         throw error;
//     }
// }

// // Format result for display
// function formatShazamResult(track) {
//     let result = `🎵 *MUSIC IDENTIFIED*\n`;
//     result += `━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
//     result += `📀 *Title:* ${track.title}\n`;
//     result += `🎤 *Artist:* ${track.artist}\n`;
    
//     if (track.album && track.album !== 'Unknown Album') {
//         result += `💿 *Album:* ${track.album}\n`;
//     }
    
//     if (track.releaseDate && track.releaseDate !== 'Unknown') {
//         result += `📅 *Released:* ${track.releaseDate}\n`;
//     }
    
//     if (track.genre && track.genre !== 'Unknown Genre') {
//         result += `🎼 *Genre:* ${track.genre}\n`;
//     }
    
//     if (track.confidence) {
//         result += `🎯 *Confidence:* ${track.confidence}\n`;
//     }
    
//     if (track.spotifyUrl) {
//         result += `\n🔗 *Spotify:* ${track.spotifyUrl}\n`;
//     }
    
//     if (track.note) {
//         result += `\n📝 *Note:* ${track.note}\n`;
//     }
    
//     result += `\n✨ *Tip:* Clear audio without background noise works best!`;
    
//     return result;
// }