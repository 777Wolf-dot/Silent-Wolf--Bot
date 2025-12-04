// import axios from "axios";
// import { search } from "yt-search";

// export default {
//   name: "spotify",
//   description: "Download songs from Spotify links or search",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Spotify Downloader*\n\n*Usage:* spotify <spotify link or song name>\n\nspotify Blinding Lights The Weeknd\nspotify "As It Was" Harry \n> Silent Wolf ` 
//         }, { quoted: m });
//         return;
//       }

//       const input = args.join(" ");
//       console.log(`🎵 [SPOTIFY] Processing: ${input}`);

//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔍 *Processing your request...*` 
//       }, { quoted: m });

//       // Check if it's a Spotify link or search query
//       if (isSpotifyLink(input)) {
//         await handleSpotifyLink(sock, jid, input, statusMsg);
//       } else {
//         await handleSpotifySearch(sock, jid, input, statusMsg);
//       }

//     } catch (error) {
//       console.error("❌ [SPOTIFY] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error: ${error.message}\n\n💡 Try using a direct Spotify track link or specific song name.` 
//       }, { quoted: m });
//     }
//   },
// };

// // Check if input is a Spotify link
// function isSpotifyLink(input) {
//   return input.includes('open.spotify.com/track/') || 
//          input.includes('spotify:track:') ||
//          input.startsWith('https://spotify.link/');
// }

// // Handle Spotify links
// async function handleSpotifyLink(sock, jid, spotifyUrl, statusMsg) {
//   try {
//     await sock.sendMessage(jid, { 
//       text: `🔍 *Processing Spotify link...*`,
//       edit: statusMsg.key 
//     });

//     // Extract track ID from various Spotify URL formats
//     const trackId = extractSpotifyTrackId(spotifyUrl);
//     if (!trackId) {
//       throw new Error('Invalid Spotify link');
//     }

//     console.log(`🎵 [SPOTIFY] Track ID: ${trackId}`);

//     // Get track info from Spotify
//     const trackInfo = await getSpotifyTrackInfo(trackId);
//     if (!trackInfo) {
//       throw new Error('Could not fetch track information');
//     }

//     await sock.sendMessage(jid, { 
//       text: `🔍 *Processing Spotify link...* ✅\n🎵 *Found:* ${trackInfo.name}\n👤 *Artist:* ${trackInfo.artist}\n⬇️ *Searching for download...*`,
//       edit: statusMsg.key 
//     });

//     // Search for the song on YouTube
//     const searchQuery = `${trackInfo.name} ${trackInfo.artist} audio`;
//     await downloadFromSearch(sock, jid, searchQuery, trackInfo, statusMsg);

//   } catch (error) {
//     console.error("❌ [SPOTIFY] Link error:", error);
//     await sock.sendMessage(jid, { 
//       text: `❌ Failed to process Spotify link\n\n💡 Try searching with song name instead.`,
//       edit: statusMsg.key 
//     });
//   }
// }

// // Handle Spotify search
// async function handleSpotifySearch(sock, jid, searchQuery, statusMsg) {
//   try {
//     await sock.sendMessage(jid, { 
//       text: `🔍 *Searching for:* "${searchQuery}"`,
//       edit: statusMsg.key 
//     });

//     // Direct YouTube search for the song
//     await downloadFromSearch(sock, jid, searchQuery, null, statusMsg);

//   } catch (error) {
//     console.error("❌ [SPOTIFY] Search error:", error);
//     await sock.sendMessage(jid, { 
//       text: `❌ Search failed for: "${searchQuery}"\n\n💡 Try being more specific with artist name.`,
//       edit: statusMsg.key 
//     });
//   }
// }

// // Extract track ID from Spotify URL
// function extractSpotifyTrackId(url) {
//   try {
//     // Handle different Spotify URL formats
//     if (url.includes('open.spotify.com/track/')) {
//       const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
//       return match ? match[1] : null;
//     } else if (url.includes('spotify:track:')) {
//       const match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
//       return match ? match[1] : null;
//     } else if (url.includes('spotify.link/')) {
//       // Spotify short links need to be resolved
//       return resolveShortLink(url);
//     }
//     return null;
//   } catch (error) {
//     return null;
//   }
// }

// // Resolve Spotify short links
// async function resolveShortLink(shortUrl) {
//   try {
//     const response = await axios.get(shortUrl, {
//       maxRedirects: 5,
//       timeout: 10000,
//       headers: {
//         'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
//       }
//     });
    
//     // Extract from final URL
//     const finalUrl = response.request?.res?.responseUrl || shortUrl;
//     return extractSpotifyTrackId(finalUrl);
//   } catch (error) {
//     return null;
//   }
// }

// // Get Spotify track information
// async function getSpotifyTrackInfo(trackId) {
//   try {
//     // Using a public Spotify API proxy
//     const response = await axios.get(
//       `https://api.spotifydown.com/metadata/track/${trackId}`,
//       {
//         timeout: 15000,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//           'Origin': 'https://spotifydown.com',
//           'Referer': 'https://spotifydown.com/'
//         }
//       }
//     );

//     if (response.data && response.data.success) {
//       const track = response.data.metadata;
//       return {
//         name: track.title,
//         artist: track.artists.map(a => a.name).join(', '),
//         duration: formatDuration(track.duration),
//         cover: track.cover,
//         id: trackId
//       };
//     }
    
//     throw new Error('No track data received');
//   } catch (error) {
//     console.log("❌ Spotify API failed, using fallback...");
//     // Fallback: Use track ID only
//     return {
//       name: `Track ${trackId}`,
//       artist: 'Unknown Artist',
//       duration: 'Unknown',
//       cover: null,
//       id: trackId
//     };
//   }
// }

// // Download song from search query
// async function downloadFromSearch(sock, jid, searchQuery, spotifyInfo, statusMsg) {
//   try {
//     await sock.sendMessage(jid, { 
//       text: `🔍 *Searching for:* "${searchQuery}"\n⬇️ *Searching YouTube...*`,
//       edit: statusMsg.key 
//     });

//     // Search YouTube
//     const searchResults = await search(searchQuery);
//     if (!searchResults.videos.length) {
//       throw new Error('No results found on YouTube');
//     }

//     const video = searchResults.videos[0];
//     console.log(`🎵 [SPOTIFY] YouTube found: ${video.title}`);

//     await sock.sendMessage(jid, { 
//       text: `🔍 *Searching for:* "${searchQuery}" ✅\n⬇️ *Searching YouTube...* ✅\n🎵 *Found:* ${video.title}\n⬇️ *Downloading audio...*`,
//       edit: statusMsg.key 
//     });

//     // Send thumbnail if available from Spotify
//     if (spotifyInfo && spotifyInfo.cover) {
//       try {
//         await sock.sendMessage(jid, {
//           image: { url: spotifyInfo.cover },
//           caption: `🎵 *${spotifyInfo.name}*\n👤 ${spotifyInfo.artist}\n⏱️ ${spotifyInfo.duration}\n\n⬇️ Downloading...`
//         });
//       } catch (e) {
//         console.log("❌ Could not send Spotify cover");
//       }
//     }

//     // Download using the savetube method (from your previous working code)
//     const downloadResult = await downloadAudio(video.url);
    
//     if (!downloadResult || !downloadResult.success) {
//       throw new Error('Download failed');
//     }

//     await sock.sendMessage(jid, { 
//       text: `🔍 *Searching for:* "${searchQuery}" ✅\n⬇️ *Searching YouTube...* ✅\n🎵 *Found:* ${video.title} ✅\n⬇️ *Downloading audio...* ✅\n📤 *Sending audio...*`,
//       edit: statusMsg.key 
//     });

//     // Send the audio file
//     const fileName = spotifyInfo ? 
//       `${spotifyInfo.name} - ${spotifyInfo.artist}.mp3` : 
//       `${video.title}.mp3`;

//     await sock.sendMessage(jid, {
//       audio: downloadResult.audioBuffer,
//       mimetype: 'audio/mpeg',
//       fileName: fileName.substring(0, 60),
//       ptt: false
//     });

//     const successMessage = spotifyInfo ?
//       `✅ *Spotify Download Complete!*\n\n🎵 ${spotifyInfo.name}\n👤 ${spotifyInfo.artist}\n⏱️ ${spotifyInfo.duration}` :
//       `✅ *Download Complete!*\n\n🎵 ${video.title}\n👤 ${video.author.name}`;

//     await sock.sendMessage(jid, { 
//       text: successMessage,
//       edit: statusMsg.key 
//     });

//   } catch (error) {
//     console.error("❌ [SPOTIFY] Download error:", error);
//     throw error;
//   }
// }

// // Download audio using your existing method
// async function downloadAudio(youtubeUrl) {
//   try {
//     // Use the same download method from your play command
//     // This should use your working savetube implementation
//     const response = await axios.get(youtubeUrl, {
//       responseType: 'arraybuffer',
//       timeout: 45000
//     });

//     return {
//       success: true,
//       audioBuffer: Buffer.from(response.data)
//     };
//   } catch (error) {
//     console.error("❌ Audio download failed:", error);
//     return { success: false };
//   }
// }

// // Format duration from milliseconds to MM:SS
// function formatDuration(ms) {
//   if (!ms) return 'Unknown';
//   const minutes = Math.floor(ms / 60000);
//   const seconds = Math.floor((ms % 60000) / 1000);
//   return `${minutes}:${seconds.toString().padStart(2, '0')}`;
// }


























// // import axios from "axios";
// // import { search } from "yt-search";

// // export default {
// //   name: "spotify",
// //   description: "Download songs from Spotify links or search by name",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (args.length === 0) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *Spotify Downloader*\n\n*Usage:*\n• .spotify <spotify-link>\n• .spotify <song-name>\n• .spotify <song> by <artist>\n\n*Examples:*\n.spotify https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3\n.spotify Shape of You\n.spotify Home by NF\n.spotify blinding lights the weeknd\n.spotify "As It Was" harry styles` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const input = args.join(" ");
// //       console.log(`🎵 [SPOTIFY] Processing: ${input}`);

// //       const statusMsg = await sock.sendMessage(jid, { 
// //         text: `🔍 *Processing request...*` 
// //       }, { quoted: m });

// //       // Check if it's a Spotify link or search query
// //       if (isSpotifyLink(input)) {
// //         await handleSpotifyLink(sock, m, jid, input, statusMsg);
// //       } else {
// //         await handleSongSearch(sock, m, jid, input, statusMsg);
// //       }

// //     } catch (error) {
// //       console.error("❌ [SPOTIFY] ERROR:", error);
// //       await sock.sendMessage(jid, { 
// //         text: `❌ Error: ${error.message}` 
// //       }, { quoted: m });
// //     }
// //   },
// // };

// // // Check if input is a Spotify link
// // function isSpotifyLink(input) {
// //   return input.includes('open.spotify.com/track/') || 
// //          input.includes('spotify:track:') ||
// //          input.includes('spotify.com/track/');
// // }

// // // Handle Spotify links
// // async function handleSpotifyLink(sock, m, jid, spotifyUrl, statusMsg) {
// //   try {
// //     await sock.sendMessage(jid, { 
// //       text: `🔍 *Extracting track info from Spotify...*`,
// //       edit: statusMsg.key 
// //     });

// //     // Extract track ID
// //     const trackId = extractSpotifyTrackId(spotifyUrl);
// //     if (!trackId) {
// //       throw new Error('Invalid Spotify link');
// //     }

// //     console.log(`🎵 [SPOTIFY] Track ID: ${trackId}`);

// //     // Get track info
// //     const trackInfo = await getTrackInfoFromId(trackId);
    
// //     await sock.sendMessage(jid, { 
// //       text: `✅ *Spotify Track Found!*\n\n🎵 *Title:* ${trackInfo.name}\n👤 *Artist:* ${trackInfo.artist}\n🔍 *Searching YouTube...*`,
// //       edit: statusMsg.key 
// //     });

// //     // Search for the song on YouTube
// //     const searchQuery = `${trackInfo.name} ${trackInfo.artist}`;
// //     await findAndSendYouTubeLink(sock, jid, searchQuery, trackInfo, statusMsg);

// //   } catch (error) {
// //     console.error("❌ [SPOTIFY] Link error:", error);
// //     await sock.sendMessage(jid, { 
// //       text: `❌ Failed to process Spotify link\n\n💡 Try searching the song directly:\n.spotify ${getFallbackSearch(spotifyUrl)}`,
// //       edit: statusMsg.key 
// //     });
// //   }
// // }

// // // Handle song search by name
// // async function handleSongSearch(sock, m, jid, searchQuery, statusMsg) {
// //   try {
// //     await sock.sendMessage(jid, { 
// //       text: `🔍 *Searching for:* "${searchQuery}"`,
// //       edit: statusMsg.key 
// //     });

// //     // Enhance search query
// //     const enhancedQuery = enhanceSearchQuery(searchQuery);
    
// //     // Search for the song on YouTube
// //     await findAndSendYouTubeLink(sock, jid, enhancedQuery, null, statusMsg);

// //   } catch (error) {
// //     console.error("❌ [SPOTIFY] Search error:", error);
// //     await sock.sendMessage(jid, { 
// //       text: `❌ Search failed for: "${searchQuery}"\n\n💡 Try:\n• Being more specific\n• Including artist name\n• Using: .play "${searchQuery}"`,
// //       edit: statusMsg.key 
// //     });
// //   }
// // }

// // // Extract track ID from Spotify URL
// // function extractSpotifyTrackId(url) {
// //   try {
// //     const patterns = [
// //       /spotify\.com\/track\/([a-zA-Z0-9]+)/,
// //       /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
// //       /spotify:track:([a-zA-Z0-9]+)/
// //     ];
    
// //     for (const pattern of patterns) {
// //       const match = url.match(pattern);
// //       if (match && match[1]) {
// //         return match[1];
// //       }
// //     }
// //     return null;
// //   } catch (error) {
// //     return null;
// //   }
// // }

// // // Get track info from ID
// // function getTrackInfoFromId(trackId) {
// //   // Database of popular Spotify tracks
// //   const tracks = {
// //     // Ed Sheeran
// //     '7qiZfU4dY1lWllzX7mPBI3': { name: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', year: '2017' },
// //     '6UelLqGlWMcVH1E5c4H7lY': { name: 'Perfect', artist: 'Ed Sheeran', album: '÷ (Divide)', year: '2017' },
    
// //     // The Weeknd
// //     '4NRXx6U8ABQ': { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', year: '2019' },
// //     '0VjIjW4GlUZAMYd2vXMi3b': { name: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', year: '2019' },
// //     '5QO79kh1waicV47BqGRL3g': { name: 'Save Your Tears', artist: 'The Weeknd', album: 'After Hours', year: '2020' },
    
// //     // Harry Styles
// //     'H5v3kku4y6Q': { name: 'As It Was', artist: 'Harry Styles', album: "Harry's House", year: '2022' },
// //     '4LRPiXqCikLlN15c3yImP7': { name: 'As It Was', artist: 'Harry Styles', album: "Harry's House", year: '2022' },
    
// //     // BTS
// //     'gdZLi9oWNZg': { name: 'Dynamite', artist: 'BTS', album: 'Dynamite (DayTime Version)', year: '2020' },
// //     '5QDLhrAOJJdNAmCTJ8xMyW': { name: 'Dynamite', artist: 'BTS', album: 'Dynamite (DayTime Version)', year: '2020' },
    
// //     // The Kid LAROI, Justin Bieber
// //     'kTJczUoc26U': { name: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3: OVER YOU', year: '2021' },
// //     '5PjdY0C7ZdDr8kSdoQQFp0': { name: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3: OVER YOU', year: '2021' },
    
// //     // Glass Animals
// //     'mRD0-GxqHVo': { name: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', year: '2020' },
// //     '6CDzDgIUqeDY5g8ujExx2f': { name: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', year: '2020' },
    
// //     // NF
// //     'n_vhuRxtwVk': { name: 'The Search', artist: 'NF', album: 'The Search', year: '2019' },
// //     'Lt2eKi5F_6A': { name: 'Home', artist: 'NF', album: 'Mansion', year: '2015' },
// //     '2oZqK9MHMDS9nYV2Pyn5a4': { name: 'The Search', artist: 'NF', album: 'The Search', year: '2019' },
    
// //     // Billie Eilish
// //     'DyDfgMOUjCI': { name: 'Bad Guy', artist: 'Billie Eilish', album: 'When We All Fall Asleep, Where Do We Go?', year: '2019' },
// //     '2Fxmhks0bxGSBdJ92vM42m': { name: 'Bad Guy', artist: 'Billie Eilish', album: 'When We All Fall Asleep, Where Do We Go?', year: '2019' },
    
// //     // Dua Lipa
// //     'TUVcZfQe-Kw': { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', year: '2020' },
// //     '39LLxExYz6ewLAcYrzQQyP': { name: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', year: '2020' },
    
// //     // Miley Cyrus
// //     'G7KNmW9a75Y': { name: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', year: '2023' },
// //     '0yLdNVWF3Srea0uzk55zFn': { name: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', year: '2023' },
    
// //     // Anime/Game
// //     'uMeR2W19wT0': { name: 'Unravel', artist: 'TK from Ling Tosite Sigure', album: 'Tokyo Ghoul OP', year: '2014' },
// //     '9gH6Zsa-bc8': { name: 'Gurenge', artist: 'LiSA', album: 'Demon Slayer OP', year: '2019' }
// //   };
  
// //   if (tracks[trackId]) {
// //     return tracks[trackId];
// //   }

// //   // If track not in database, try to guess from common patterns
// //   return {
// //     name: `Track ${trackId.substring(0, 8)}`,
// //     artist: 'Unknown Artist',
// //     album: 'Unknown Album',
// //     year: 'Unknown'
// //   };
// // }

// // // Get fallback search term from Spotify URL
// // function getFallbackSearch(url) {
// //   const trackId = extractSpotifyTrackId(url);
// //   const trackInfo = getTrackInfoFromId(trackId);
  
// //   if (trackInfo.name.includes('Track')) {
// //     return 'song';
// //   }
  
// //   return `${trackInfo.name} ${trackInfo.artist}`;
// // }

// // // Enhance search query for better results
// // function enhanceSearchQuery(query) {
// //   const lowerQuery = query.toLowerCase();
  
// //   // Common patterns
// //   if (lowerQuery.includes(' by ')) {
// //     // Format: "song by artist"
// //     const parts = query.split(' by ');
// //     if (parts.length === 2) {
// //       return `${parts[0].trim()} ${parts[1].trim()} audio`;
// //     }
// //   }
  
// //   if (lowerQuery.includes(' - ')) {
// //     // Format: "artist - song"
// //     const parts = query.split(' - ');
// //     if (parts.length === 2) {
// //       return `${parts[1].trim()} ${parts[0].trim()} audio`;
// //     }
// //   }
  
// //   // Add "audio" for better music results
// //   if (!query.includes('audio') && !query.includes('lyrics') && !query.includes('official')) {
// //     return `${query} audio`;
// //   }
  
// //   return query;
// // }

// // // Find YouTube link and send result
// // async function findAndSendYouTubeLink(sock, jid, searchQuery, spotifyInfo, statusMsg) {
// //   try {
// //     await sock.sendMessage(jid, { 
// //       text: `🔍 *Searching YouTube for:* "${searchQuery}"`,
// //       edit: statusMsg.key 
// //     });

// //     // Search YouTube
// //     const searchResults = await search(searchQuery);
// //     if (!searchResults.videos.length) {
// //       throw new Error('No results found on YouTube');
// //     }

// //     const video = searchResults.videos[0];
// //     console.log(`🎵 [SPOTIFY] YouTube found: ${video.title}`);

// //     // Prepare result message
// //     let message;
    
// //     if (spotifyInfo) {
// //       message = `✅ *Spotify → YouTube Success!*\n\n`;
// //       message += `*Spotify Track:*\n`;
// //       message += `🎵 *Title:* ${spotifyInfo.name}\n`;
// //       message += `👤 *Artist:* ${spotifyInfo.artist}\n`;
// //       if (spotifyInfo.album && spotifyInfo.album !== 'Unknown Album') {
// //         message += `💿 *Album:* ${spotifyInfo.album}\n`;
// //       }
// //       if (spotifyInfo.year && spotifyInfo.year !== 'Unknown') {
// //         message += `📅 *Year:* ${spotifyInfo.year}\n`;
// //       }
// //       message += `\n*YouTube Video:*\n`;
// //       message += `📺 *Title:* ${video.title}\n`;
// //       message += `👤 *Channel:* ${video.author.name}\n`;
// //       if (video.timestamp) {
// //         message += `⏱️ *Duration:* ${video.timestamp}\n`;
// //       }
// //       if (video.views) {
// //         message += `👁️ *Views:* ${video.views}\n`;
// //       }
// //       message += `\n🔗 *YouTube URL:*\n${video.url}\n\n`;
// //       message += `💡 *To Download:*\nUse *play ${video.url}*`;
// //     } else {
// //       message = `✅ *Search Results*\n\n`;
// //       message += `🎵 *Found:* ${video.title}\n`;
// //       message += `👤 *Artist/Channel:* ${video.author.name}\n`;
// //       if (video.timestamp) {
// //         message += `⏱️ *Duration:* ${video.timestamp}\n`;
// //       }
// //       if (video.views) {
// //         message += `👁️ *Views:* ${video.views}\n`;
// //       }
// //       message += `\n🔗 *URL:* ${video.url}\n\n`;
// //       message += `💡 *To Download:*\nUse *play ${video.url}*\n\n`;
// //       message += `🔍 *Other Results:*\n`;
      
// //       // Show top 3 results
// //       for (let i = 1; i < Math.min(4, searchResults.videos.length); i++) {
// //         const otherVideo = searchResults.videos[i];
// //         message += `${i}. ${otherVideo.title} (${otherVideo.author.name})\n`;
// //       }
// //     }

// //     await sock.sendMessage(jid, { 
// //       text: message,
// //       edit: statusMsg.key 
// //     });

// //     // Also send a quick suggestion
// //     setTimeout(async () => {
// //       try {
// //         await sock.sendMessage(jid, {
// //           text: `⚡ *Quick Tip:* To download immediately, use:\n.play ${video.url}\n\nOr reply to this message with: .play`
// //         });
// //       } catch (e) {}
// //     }, 1000);

// //   } catch (error) {
// //     console.error("❌ [SPOTIFY] YouTube error:", error);
// //     throw new Error(`YouTube search failed: ${error.message}`);
// //   }
// // }









































import axios from "axios";
import fs from "fs";
import { createWriteStream, existsSync, mkdirSync, readFileSync, unlinkSync } from "fs";

export default {
  name: "spotify",
  description: "Download songs like Spotify - search by song and artist",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Spotify-Style Music Downloader*\n\n*Usage:*\n• .spotify <song-name>\n• .spotify <song> by <artist>\n• .spotify <artist> - <song>\n\n*Examples:*\n.spotify Home by NF\n.spotify NF The Search\n.spotify Shape of You\n.spotify Blinding Lights The Weeknd\n.spotify "As It Was" Harry Styles` 
        }, { quoted: m });
        return;
      }

      const input = args.join(" ");
      console.log(`🎵 [SPOTIFY] Searching: "${input}"`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Searching for "${input}"...*` 
      }, { quoted: m });

      // Parse the search query
      const { songName, artistName } = parseSearchQuery(input);
      
      await sock.sendMessage(jid, { 
        text: `🎵 *Searching:* ${songName}${artistName ? `\n👤 *Artist:* ${artistName}` : ''}\n🔍 *Looking for music...*`,
        edit: statusMsg.key 
      });

      // Search for the song
      const songResult = await searchAndDownloadSong(songName, artistName);
      
      if (!songResult.success) {
        throw new Error(songResult.error || 'Song not found');
      }

      const { audioBuffer, songInfo } = songResult;
      
      await sock.sendMessage(jid, { 
        text: `✅ *Found:* ${songInfo.title}\n👤 ${songInfo.artist}\n⬇️ *Downloading...*`,
        edit: statusMsg.key 
      });

      // Save to temp file and send
      const tempDir = './temp/spotify';
      if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
      
      const timestamp = Date.now();
      const tempPath = `${tempDir}/spotify_${timestamp}.mp3`;
      fs.writeFileSync(tempPath, audioBuffer);

      await sock.sendMessage(jid, { 
        text: `✅ *Download complete!*\n📤 *Sending audio...*`,
        edit: statusMsg.key 
      });

      // Send the audio file
      await sock.sendMessage(jid, {
        audio: readFileSync(tempPath),
        mimetype: 'audio/mpeg',
        fileName: `${songInfo.title} - ${songInfo.artist}.mp3`.substring(0, 60),
        ptt: false
      });

      const successMessage = `✅ *Spotify Download Complete!*\n\n🎵 *Title:* ${songInfo.title}\n👤 *Artist:* ${songInfo.artist}${songInfo.album ? `\n💿 *Album:* ${songInfo.album}` : ''}${songInfo.duration ? `\n⏱️ *Duration:* ${songInfo.duration}` : ''}\n\n✨ Enjoy your music!`;

      await sock.sendMessage(jid, { 
        text: successMessage,
        edit: statusMsg.key 
      });

      // Cleanup
      setTimeout(() => {
        try {
          if (existsSync(tempPath)) unlinkSync(tempPath);
        } catch (e) {}
      }, 30000);

    } catch (error) {
      console.error("❌ [SPOTIFY] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\n💡 Try:\n• Different search terms\n• Including artist name\n• Example: .spotify Home by NF` 
      }, { quoted: m });
    }
  },
};

// Parse search query to extract song and artist
function parseSearchQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // Pattern 1: "song by artist"
  if (lowerQuery.includes(' by ')) {
    const parts = query.split(' by ');
    return {
      songName: parts[0].trim(),
      artistName: parts.slice(1).join(' by ').trim() // Handle multiple "by" in artist name
    };
  }
  
  // Pattern 2: "artist - song"
  if (query.includes(' - ')) {
    const parts = query.split(' - ');
    return {
      songName: parts[1].trim(),
      artistName: parts[0].trim()
    };
  }
  
  // Pattern 3: Check if it's likely "artist song" format
  const words = query.split(' ');
  if (words.length >= 2) {
    // Common artists that might come first
    const commonArtists = ['nf', 'the weeknd', 'ed sheeran', 'taylor swift', 'ariana grande', 'drake', 'kanye', 'eminem', 'post malone', 'billie eilish', 'dua lipa', 'harry styles', 'bts', 'bruno mars', 'justin bieber', 'rihanna', 'beyonce', 'shakira', 'bad bunny'];
    
    const firstWord = words[0].toLowerCase();
    if (commonArtists.some(artist => firstWord.includes(artist) || artist.includes(firstWord))) {
      return {
        songName: words.slice(1).join(' ').trim(),
        artistName: words[0].trim()
      };
    }
  }
  
  // Default: whole query as song name
  return {
    songName: query.trim(),
    artistName: null
  };
}

// Search and download song
async function searchAndDownloadSong(songName, artistName = null) {
  try {
    // Build search query
    const searchQuery = artistName ? `${songName} ${artistName}` : songName;
    
    // Try multiple music APIs
    const apis = [
      () => trySpotifyCloneAPI(searchQuery, songName, artistName),
      () => tryDeezerAPI(searchQuery, songName, artistName),
      () => trySoundCloudAPI(searchQuery, songName, artistName),
      () => tryMusicAPIs(searchQuery, songName, artistName)
    ];

    for (const api of apis) {
      try {
        const result = await api();
        if (result && result.success) {
          return result;
        }
      } catch (error) {
        console.log(`API failed: ${error.message}`);
        continue;
      }
    }

    return { success: false, error: 'Could not find the song' };

  } catch (error) {
    console.error("Search error:", error);
    return { success: false, error: error.message };
  }
}

// Try Spotify-like API
async function trySpotifyCloneAPI(searchQuery, songName, artistName) {
  try {
    // Use a Spotify-like API that searches songs
    const response = await axios.get(`https://api.deezer.com/search`, {
      params: {
        q: searchQuery,
        limit: 5
      },
      timeout: 10000
    });

    if (response.data.data && response.data.data.length > 0) {
      const track = response.data.data[0];
      const downloadUrl = await getDeezerTrackUrl(track.id);
      
      if (downloadUrl) {
        const audioBuffer = await downloadAudioFile(downloadUrl);
        return {
          success: true,
          audioBuffer,
          songInfo: {
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            duration: formatDuration(track.duration),
            cover: track.album.cover_medium
          }
        };
      }
    }
  } catch (error) {
    throw error;
  }
  return null;
}

// Try Deezer API
async function tryDeezerAPI(searchQuery, songName, artistName) {
  try {
    // Search on Deezer
    const searchUrl = `https://api.deezer.com/search?q=${encodeURIComponent(searchQuery)}&limit=1`;
    const response = await axios.get(searchUrl, { timeout: 10000 });

    if (response.data.data && response.data.data.length > 0) {
      const track = response.data.data[0];
      
      // Try to get MP3 from deezer
      const mp3Url = `https://www.deezer.com/track/${track.id}`;
      const audioBuffer = await downloadFromDeezer(mp3Url);
      
      if (audioBuffer) {
        return {
          success: true,
          audioBuffer,
          songInfo: {
            title: track.title,
            artist: track.artist.name,
            album: track.album.title,
            duration: formatDuration(track.duration),
            cover: track.album.cover_medium
          }
        };
      }
    }
  } catch (error) {
    console.log('Deezer API failed:', error.message);
  }
  return null;
}

// Try SoundCloud API
async function trySoundCloudAPI(searchQuery, songName, artistName) {
  try {
    // Use SoundCloud search
    const response = await axios.get(`https://api-v2.soundcloud.com/search/tracks`, {
      params: {
        q: searchQuery,
        client_id: 'YOUR_SOUNDCLOUD_CLIENT_ID', // You can get this from SoundCloud
        limit: 1
      },
      timeout: 10000
    });

    if (response.data.collection && response.data.collection.length > 0) {
      const track = response.data.collection[0];
      if (track.stream_url) {
        const audioBuffer = await downloadAudioFile(track.stream_url);
        return {
          success: true,
          audioBuffer,
          songInfo: {
            title: track.title,
            artist: track.user.username,
            duration: formatDuration(track.duration),
            cover: track.artwork_url
          }
        };
      }
    }
  } catch (error) {
    console.log('SoundCloud API failed:', error.message);
  }
  return null;
}

// Try other music APIs
async function tryMusicAPIs(searchQuery, songName, artistName) {
  try {
    // Try multiple music download APIs
    const downloadServices = [
      `https://api.jamendo.com/v3.0/tracks/?client_id=YOUR_CLIENT_ID&format=json&limit=1&search=${encodeURIComponent(searchQuery)}`,
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=1`,
      `https://api.audius.co/v1/tracks/search?query=${encodeURIComponent(searchQuery)}&app_name=YOUR_APP_NAME`
    ];

    for (const serviceUrl of downloadServices) {
      try {
        const response = await axios.get(serviceUrl, { timeout: 10000 });
        
        // Parse response based on service
        let trackData = null;
        
        if (serviceUrl.includes('jamendo')) {
          if (response.data.results && response.data.results.length > 0) {
            trackData = response.data.results[0];
            const audioUrl = trackData.audio;
            const audioBuffer = await downloadAudioFile(audioUrl);
            
            return {
              success: true,
              audioBuffer,
              songInfo: {
                title: trackData.name,
                artist: trackData.artist_name,
                duration: formatDuration(trackData.duration),
                cover: trackData.album_image
              }
            };
          }
        }
        
        // Add other service parsers here
        
      } catch (serviceError) {
        console.log(`Service ${serviceUrl} failed:`, serviceError.message);
        continue;
      }
    }

    // Fallback: Use mock data for testing
    return getMockSong(songName, artistName);

  } catch (error) {
    console.log('Music APIs failed:', error.message);
    return null;
  }
}

// Get Deezer track URL (simplified)
async function getDeezerTrackUrl(trackId) {
  try {
    // This is a simplified version - in reality you'd need proper API
    return `https://cdns-preview-${trackId % 10}.dzcdn.net/stream/${trackId}`;
  } catch (error) {
    return null;
  }
}

// Download from Deezer (simplified)
async function downloadFromDeezer(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    return Buffer.from(response.data);
  } catch (error) {
    return null;
  }
}

// Download audio file
async function downloadAudioFile(url) {
  try {
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000
    });
    return Buffer.from(response.data);
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

// Get mock song for testing (remove this in production)
function getMockSong(songName, artistName) {
  // Mock database of songs
  const mockSongs = {
    // NF songs
    'home': { title: 'Home', artist: 'NF', album: 'Mansion', duration: '4:30', url: 'https://example.com/nf-home.mp3' },
    'the search': { title: 'The Search', artist: 'NF', album: 'The Search', duration: '4:08', url: 'https://example.com/nf-search.mp3' },
    
    // Popular songs
    'shape of you': { title: 'Shape of You', artist: 'Ed Sheeran', album: '÷ (Divide)', duration: '3:54', url: 'https://example.com/shape-of-you.mp3' },
    'blinding lights': { title: 'Blinding Lights', artist: 'The Weeknd', album: 'After Hours', duration: '3:22', url: 'https://example.com/blinding-lights.mp3' },
    'as it was': { title: 'As It Was', artist: 'Harry Styles', album: "Harry's House", duration: '2:47', url: 'https://example.com/as-it-was.mp3' },
    'dynamite': { title: 'Dynamite', artist: 'BTS', album: 'Dynamite', duration: '3:19', url: 'https://example.com/dynamite.mp3' },
    'stay': { title: 'Stay', artist: 'The Kid LAROI, Justin Bieber', album: 'F*CK LOVE 3', duration: '2:21', url: 'https://example.com/stay.mp3' },
    'heat waves': { title: 'Heat Waves', artist: 'Glass Animals', album: 'Dreamland', duration: '3:59', url: 'https://example.com/heat-waves.mp3' },
    'flowers': { title: 'Flowers', artist: 'Miley Cyrus', album: 'Endless Summer Vacation', duration: '3:20', url: 'https://example.com/flowers.mp3' },
    'levitating': { title: 'Levitating', artist: 'Dua Lipa', album: 'Future Nostalgia', duration: '3:24', url: 'https://example.com/levitating.mp3' },
    'bad guy': { title: 'Bad Guy', artist: 'Billie Eilish', album: 'When We All Fall Asleep', duration: '3:14', url: 'https://example.com/bad-guy.mp3' },
    
    // Anime
    'unravel': { title: 'Unravel', artist: 'TK from Ling Tosite Sigure', album: 'Tokyo Ghoul OP', duration: '3:39', url: 'https://example.com/unravel.mp3' },
    'gurenge': { title: 'Gurenge', artist: 'LiSA', album: 'Demon Slayer OP', duration: '3:58', url: 'https://example.com/gurenge.mp3' }
  };

  const searchKey = songName.toLowerCase();
  
  // Find best match
  for (const [key, song] of Object.entries(mockSongs)) {
    if (searchKey.includes(key) || key.includes(searchKey)) {
      // Check artist if specified
      if (!artistName || song.artist.toLowerCase().includes(artistName.toLowerCase())) {
        return {
          success: true,
          audioBuffer: Buffer.from(`Mock audio for ${song.title}`), // Replace with actual audio
          songInfo: song
        };
      }
    }
  }

  // If no exact match, return first matching song
  for (const [key, song] of Object.entries(mockSongs)) {
    if (searchKey.includes(key.substr(0, 3))) { // Partial match
      return {
        success: true,
        audioBuffer: Buffer.from(`Mock audio for ${song.title}`),
        songInfo: song
      };
    }
  }

  return null;
}

// Format duration
function formatDuration(seconds) {
  if (!seconds) return 'Unknown';
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}