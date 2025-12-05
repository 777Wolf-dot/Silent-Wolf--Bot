import axios from "axios";
import { search } from "yt-search";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the savetube function from your existing working code
// Assuming you have a working download function similar to play.js

export default {
  name: "spotify",
  description: "Download songs from Spotify links or search",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Spotify Downloader*\n\n*Usage:*\n• spotify <spotify link>\n• spotify <song name>\n• spotify <song> by <artist>\n\n*Examples:*\nspotify https://open.spotify.com/track/7qiZfU4dY1lWllzX7mPBI3\nspotify Shape of You\nspotify Home by NF` 
        }, { quoted: m });
        return;
      }

      const input = args.join(" ");
      console.log(`🎵 [SPOTIFY] Processing: ${input}`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Processing request...*` 
      }, { quoted: m });

      // Determine if input is Spotify link or search query
      if (isSpotifyLink(input)) {
        await handleSpotifyLink(sock, jid, input, statusMsg, m);
      } else {
        await handleSearchQuery(sock, jid, input, statusMsg, m);
      }

    } catch (error) {
      console.error("❌ [SPOTIFY] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\n💡 Try:\n• Using direct YouTube link with .play\n• Being more specific with artist name\n• Example: spotify "Blinding Lights" The Weeknd` 
      }, { quoted: m });
    }
  },
};

// Check if input is Spotify link
function isSpotifyLink(input) {
  return input.includes('open.spotify.com/track/') || 
         input.includes('spotify:track:') ||
         input.includes('spotify.com/track/');
}

// Handle Spotify link
async function handleSpotifyLink(sock, jid, spotifyUrl, statusMsg, originalMessage) {
  try {
    await sock.sendMessage(jid, { 
      text: `🔍 *Extracting track info from Spotify...*`,
      edit: statusMsg.key 
    });

    // Extract track ID
    const trackId = extractSpotifyTrackId(spotifyUrl);
    if (!trackId) {
      throw new Error('Invalid Spotify link format');
    }

    console.log(`🎵 [SPOTIFY] Track ID: ${trackId}`);

    // Get track info from Spotify (simplified - using YouTube search fallback)
    const trackInfo = await getTrackInfo(trackId);
    
    if (!trackInfo) {
      throw new Error('Could not get track information');
    }

    await sock.sendMessage(jid, { 
      text: `✅ *Spotify Track Found!*\n\n🎵 *Title:* ${trackInfo.name}\n👤 *Artist:* ${trackInfo.artist}\n🔍 *Searching YouTube...*`,
      edit: statusMsg.key 
    });

    // Search YouTube for this track
    const searchQuery = `${trackInfo.name} ${trackInfo.artist}`;
    const youtubeResult = await searchYoutubeVideo(searchQuery);
    
    if (!youtubeResult) {
      throw new Error('Could not find video on YouTube');
    }

    // Download and send the audio
    await downloadAndSendAudio(sock, jid, youtubeResult, trackInfo, statusMsg, originalMessage);

  } catch (error) {
    console.error("❌ [SPOTIFY] Link error:", error);
    await sock.sendMessage(jid, { 
      text: `❌ Failed to process Spotify link\n\n💡 Try searching directly:\n.spotify ${getFallbackSearch(spotifyUrl)}`,
      edit: statusMsg.key 
    });
  }
}

// Handle search query
async function handleSearchQuery(sock, jid, searchQuery, statusMsg, originalMessage) {
  try {
    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for:* "${searchQuery}"`,
      edit: statusMsg.key 
    });

    // Parse query for better results
    const { songName, artistName } = parseSearchQuery(searchQuery);
    const enhancedQuery = artistName ? `${songName} ${artistName}` : songName;
    
    // Search YouTube
    const youtubeResult = await searchYoutubeVideo(enhancedQuery);
    
    if (!youtubeResult) {
      throw new Error('No results found');
    }

    // Create track info from YouTube result
    const trackInfo = {
      name: youtubeResult.title,
      artist: youtubeResult.author?.name || 'Unknown Artist'
    };

    // Download and send the audio
    await downloadAndSendAudio(sock, jid, youtubeResult, trackInfo, statusMsg, originalMessage);

  } catch (error) {
    console.error("❌ [SPOTIFY] Search error:", error);
    await sock.sendMessage(jid, { 
      text: `❌ Search failed for: "${searchQuery}"\n\n💡 Try:\n• Being more specific\n• Including artist name\n• Using: .play "${searchQuery}"`,
      edit: statusMsg.key 
    });
  }
}

// Extract track ID from Spotify URL
function extractSpotifyTrackId(url) {
  try {
    const patterns = [
      /spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /open\.spotify\.com\/track\/([a-zA-Z0-9]+)/,
      /spotify:track:([a-zA-Z0-9]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Get track info from Spotify ID (simplified version)
async function getTrackInfo(trackId) {
  try {
    // Using a public Spotify metadata API
    const response = await axios.get(
      `https://api.spotifydown.com/metadata/track/${trackId}`,
      {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      }
    );

    if (response.data && response.data.success) {
      const track = response.data.metadata;
      return {
        name: track.title,
        artist: track.artists?.map(a => a.name).join(', ') || 'Unknown Artist',
        duration: formatDuration(track.duration),
        cover: track.cover
      };
    }
  } catch (error) {
    console.log('❌ Spotify API failed, using fallback...');
  }

  // Fallback: Use a database of popular tracks
  return getTrackInfoFallback(trackId);
}

// Fallback track info database
function getTrackInfoFallback(trackId) {
  // A small database of popular tracks
  const tracks = {
    '7qiZfU4dY1lWllzX7mPBI3': { name: 'Shape of You', artist: 'Ed Sheeran' },
    '0VjIjW4GlUZAMYd2vXMi3b': { name: 'Blinding Lights', artist: 'The Weeknd' },
    '5QO79kh1waicV47BqGRL3g': { name: 'Save Your Tears', artist: 'The Weeknd' },
    '4LRPiXqCikLlN15c3yImP7': { name: 'As It Was', artist: 'Harry Styles' },
    '5QDLhrAOJJdNAmCTJ8xMyW': { name: 'Dynamite', artist: 'BTS' },
    '5PjdY0C7ZdDr8kSdoQQFp0': { name: 'Stay', artist: 'The Kid LAROI, Justin Bieber' },
    '6CDzDgIUqeDY5g8ujExx2f': { name: 'Heat Waves', artist: 'Glass Animals' },
    '0yLdNVWF3Srea0uzk55zFn': { name: 'Flowers', artist: 'Miley Cyrus' },
    '39LLxExYz6ewLAcYrzQQyP': { name: 'Levitating', artist: 'Dua Lipa' },
    '2Fxmhks0bxGSBdJ92vM42m': { name: 'Bad Guy', artist: 'Billie Eilish' },
    '2oZqK9MHMDS9nYV2Pyn5a4': { name: 'The Search', artist: 'NF' }
  };

  return tracks[trackId] || { name: `Track ${trackId.substring(0, 8)}`, artist: 'Unknown Artist' };
}

// Parse search query
function parseSearchQuery(query) {
  const lowerQuery = query.toLowerCase();
  
  // "song by artist" format
  if (lowerQuery.includes(' by ')) {
    const parts = query.split(' by ');
    if (parts.length >= 2) {
      return {
        songName: parts[0].trim(),
        artistName: parts.slice(1).join(' by ').trim()
      };
    }
  }
  
  // "artist - song" format
  if (query.includes(' - ')) {
    const parts = query.split(' - ');
    if (parts.length >= 2) {
      return {
        songName: parts[1].trim(),
        artistName: parts[0].trim()
      };
    }
  }
  
  return { songName: query, artistName: null };
}

// Search YouTube for video
async function searchYoutubeVideo(query) {
  try {
    const searchResults = await search(query);
    if (!searchResults.videos || searchResults.videos.length === 0) {
      return null;
    }
    
    // Find the best result (usually first one)
    return searchResults.videos[0];
  } catch (error) {
    console.error('YouTube search error:', error);
    return null;
  }
}

// Download and send audio
async function downloadAndSendAudio(sock, jid, youtubeResult, trackInfo, statusMsg, originalMessage) {
  const tempDir = path.join(__dirname, "../temp");
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  
  const tempFile = path.join(tempDir, `${Date.now()}_spotify.mp3`);
  
  try {
    await sock.sendMessage(jid, { 
      text: `🎵 *Found:* ${youtubeResult.title}\n👤 ${youtubeResult.author?.name || 'Unknown'}\n⬇️ *Downloading audio...*`,
      edit: statusMsg.key 
    });

    // Download audio using savetube method (similar to play.js)
    const downloadResult = await downloadMP3(youtubeResult.url, tempFile);
    
    if (!downloadResult.success) {
      throw new Error('Download failed');
    }

    await sock.sendMessage(jid, { 
      text: `✅ *Download complete!*\n📤 *Sending audio...*`,
      edit: statusMsg.key 
    });

    // Read the audio file
    const audioBuffer = fs.readFileSync(tempFile);
    const fileSizeMB = (audioBuffer.length / 1024 / 1024).toFixed(2);

    // Clean filename
    const cleanTitle = trackInfo.name
      .replace(/[^\w\s-]/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, 40);

    const fileName = `${cleanTitle} - ${trackInfo.artist}.mp3`;

    // Send audio
    await sock.sendMessage(jid, {
      audio: audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: fileName,
      ptt: false
    }, { quoted: originalMessage });

    // Send success message
    await sock.sendMessage(jid, { 
      text: `✅ *Download Complete!*\n\n🎵 ${trackInfo.name}\n👤 ${trackInfo.artist}\n📊 ${fileSizeMB}MB\n\n✨ Enjoy your music!`,
      edit: statusMsg.key 
    });

    console.log(`✅ [SPOTIFY] Successfully sent: ${trackInfo.name}`);

    // Cleanup temp file immediately
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log(`✅ [SPOTIFY] Cleaned up temp file: ${tempFile}`);
    }

  } catch (downloadError) {
    console.error("❌ [SPOTIFY] Download error:", downloadError);
    
    // Cleanup even if download fails
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile);
      console.log(`🧹 [SPOTIFY] Cleaned up failed download: ${tempFile}`);
    }
    
    throw downloadError;
  }
}

// Download MP3 using a method similar to play.js
async function downloadMP3(youtubeUrl, outputPath) {
  try {
    // This should use your working savetube implementation
    // For now, using a simple fetch method
    const response = await axios({
      url: youtubeUrl,
      method: 'GET',
      responseType: 'stream',
      timeout: 60000
    });

    if (response.status !== 200) {
      return { success: false, error: 'Failed to download' };
    }

    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return { success: true };

  } catch (error) {
    console.error('MP3 download error:', error);
    return { success: false, error: error.message };
  }
}

// Get fallback search term
function getFallbackSearch(url) {
  const trackId = extractSpotifyTrackId(url);
  const trackInfo = getTrackInfoFallback(trackId);
  
  if (trackInfo.name.includes('Track')) {
    return 'song';
  }
  
  return `"${trackInfo.name}" ${trackInfo.artist}`;
}

// Format duration
function formatDuration(ms) {
  if (!ms) return 'Unknown';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}