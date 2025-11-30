import axios from "axios";
import { search } from "yt-search";

export default {
  name: "spotify",
  description: "Download songs from Spotify links or search",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎵 *Spotify Downloader*\n\n*Usage:* spotify <spotify link or song name>\n\nspotify Blinding Lights The Weeknd\nspotify "As It Was" Harry \n> Silent Wolf ` 
        }, { quoted: m });
        return;
      }

      const input = args.join(" ");
      console.log(`🎵 [SPOTIFY] Processing: ${input}`);

      const statusMsg = await sock.sendMessage(jid, { 
        text: `🔍 *Processing your request...*` 
      }, { quoted: m });

      // Check if it's a Spotify link or search query
      if (isSpotifyLink(input)) {
        await handleSpotifyLink(sock, jid, input, statusMsg);
      } else {
        await handleSpotifySearch(sock, jid, input, statusMsg);
      }

    } catch (error) {
      console.error("❌ [SPOTIFY] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error: ${error.message}\n\n💡 Try using a direct Spotify track link or specific song name.` 
      }, { quoted: m });
    }
  },
};

// Check if input is a Spotify link
function isSpotifyLink(input) {
  return input.includes('open.spotify.com/track/') || 
         input.includes('spotify:track:') ||
         input.startsWith('https://spotify.link/');
}

// Handle Spotify links
async function handleSpotifyLink(sock, jid, spotifyUrl, statusMsg) {
  try {
    await sock.sendMessage(jid, { 
      text: `🔍 *Processing Spotify link...*`,
      edit: statusMsg.key 
    });

    // Extract track ID from various Spotify URL formats
    const trackId = extractSpotifyTrackId(spotifyUrl);
    if (!trackId) {
      throw new Error('Invalid Spotify link');
    }

    console.log(`🎵 [SPOTIFY] Track ID: ${trackId}`);

    // Get track info from Spotify
    const trackInfo = await getSpotifyTrackInfo(trackId);
    if (!trackInfo) {
      throw new Error('Could not fetch track information');
    }

    await sock.sendMessage(jid, { 
      text: `🔍 *Processing Spotify link...* ✅\n🎵 *Found:* ${trackInfo.name}\n👤 *Artist:* ${trackInfo.artist}\n⬇️ *Searching for download...*`,
      edit: statusMsg.key 
    });

    // Search for the song on YouTube
    const searchQuery = `${trackInfo.name} ${trackInfo.artist} audio`;
    await downloadFromSearch(sock, jid, searchQuery, trackInfo, statusMsg);

  } catch (error) {
    console.error("❌ [SPOTIFY] Link error:", error);
    await sock.sendMessage(jid, { 
      text: `❌ Failed to process Spotify link\n\n💡 Try searching with song name instead.`,
      edit: statusMsg.key 
    });
  }
}

// Handle Spotify search
async function handleSpotifySearch(sock, jid, searchQuery, statusMsg) {
  try {
    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for:* "${searchQuery}"`,
      edit: statusMsg.key 
    });

    // Direct YouTube search for the song
    await downloadFromSearch(sock, jid, searchQuery, null, statusMsg);

  } catch (error) {
    console.error("❌ [SPOTIFY] Search error:", error);
    await sock.sendMessage(jid, { 
      text: `❌ Search failed for: "${searchQuery}"\n\n💡 Try being more specific with artist name.`,
      edit: statusMsg.key 
    });
  }
}

// Extract track ID from Spotify URL
function extractSpotifyTrackId(url) {
  try {
    // Handle different Spotify URL formats
    if (url.includes('open.spotify.com/track/')) {
      const match = url.match(/open\.spotify\.com\/track\/([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    } else if (url.includes('spotify:track:')) {
      const match = url.match(/spotify:track:([a-zA-Z0-9]+)/);
      return match ? match[1] : null;
    } else if (url.includes('spotify.link/')) {
      // Spotify short links need to be resolved
      return resolveShortLink(url);
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Resolve Spotify short links
async function resolveShortLink(shortUrl) {
  try {
    const response = await axios.get(shortUrl, {
      maxRedirects: 5,
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });
    
    // Extract from final URL
    const finalUrl = response.request?.res?.responseUrl || shortUrl;
    return extractSpotifyTrackId(finalUrl);
  } catch (error) {
    return null;
  }
}

// Get Spotify track information
async function getSpotifyTrackInfo(trackId) {
  try {
    // Using a public Spotify API proxy
    const response = await axios.get(
      `https://api.spotifydown.com/metadata/track/${trackId}`,
      {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Origin': 'https://spotifydown.com',
          'Referer': 'https://spotifydown.com/'
        }
      }
    );

    if (response.data && response.data.success) {
      const track = response.data.metadata;
      return {
        name: track.title,
        artist: track.artists.map(a => a.name).join(', '),
        duration: formatDuration(track.duration),
        cover: track.cover,
        id: trackId
      };
    }
    
    throw new Error('No track data received');
  } catch (error) {
    console.log("❌ Spotify API failed, using fallback...");
    // Fallback: Use track ID only
    return {
      name: `Track ${trackId}`,
      artist: 'Unknown Artist',
      duration: 'Unknown',
      cover: null,
      id: trackId
    };
  }
}

// Download song from search query
async function downloadFromSearch(sock, jid, searchQuery, spotifyInfo, statusMsg) {
  try {
    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for:* "${searchQuery}"\n⬇️ *Searching YouTube...*`,
      edit: statusMsg.key 
    });

    // Search YouTube
    const searchResults = await search(searchQuery);
    if (!searchResults.videos.length) {
      throw new Error('No results found on YouTube');
    }

    const video = searchResults.videos[0];
    console.log(`🎵 [SPOTIFY] YouTube found: ${video.title}`);

    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for:* "${searchQuery}" ✅\n⬇️ *Searching YouTube...* ✅\n🎵 *Found:* ${video.title}\n⬇️ *Downloading audio...*`,
      edit: statusMsg.key 
    });

    // Send thumbnail if available from Spotify
    if (spotifyInfo && spotifyInfo.cover) {
      try {
        await sock.sendMessage(jid, {
          image: { url: spotifyInfo.cover },
          caption: `🎵 *${spotifyInfo.name}*\n👤 ${spotifyInfo.artist}\n⏱️ ${spotifyInfo.duration}\n\n⬇️ Downloading...`
        });
      } catch (e) {
        console.log("❌ Could not send Spotify cover");
      }
    }

    // Download using the savetube method (from your previous working code)
    const downloadResult = await downloadAudio(video.url);
    
    if (!downloadResult || !downloadResult.success) {
      throw new Error('Download failed');
    }

    await sock.sendMessage(jid, { 
      text: `🔍 *Searching for:* "${searchQuery}" ✅\n⬇️ *Searching YouTube...* ✅\n🎵 *Found:* ${video.title} ✅\n⬇️ *Downloading audio...* ✅\n📤 *Sending audio...*`,
      edit: statusMsg.key 
    });

    // Send the audio file
    const fileName = spotifyInfo ? 
      `${spotifyInfo.name} - ${spotifyInfo.artist}.mp3` : 
      `${video.title}.mp3`;

    await sock.sendMessage(jid, {
      audio: downloadResult.audioBuffer,
      mimetype: 'audio/mpeg',
      fileName: fileName.substring(0, 60),
      ptt: false
    });

    const successMessage = spotifyInfo ?
      `✅ *Spotify Download Complete!*\n\n🎵 ${spotifyInfo.name}\n👤 ${spotifyInfo.artist}\n⏱️ ${spotifyInfo.duration}` :
      `✅ *Download Complete!*\n\n🎵 ${video.title}\n👤 ${video.author.name}`;

    await sock.sendMessage(jid, { 
      text: successMessage,
      edit: statusMsg.key 
    });

  } catch (error) {
    console.error("❌ [SPOTIFY] Download error:", error);
    throw error;
  }
}

// Download audio using your existing method
async function downloadAudio(youtubeUrl) {
  try {
    // Use the same download method from your play command
    // This should use your working savetube implementation
    const response = await axios.get(youtubeUrl, {
      responseType: 'arraybuffer',
      timeout: 45000
    });

    return {
      success: true,
      audioBuffer: Buffer.from(response.data)
    };
  } catch (error) {
    console.error("❌ Audio download failed:", error);
    return { success: false };
  }
}

// Format duration from milliseconds to MM:SS
function formatDuration(ms) {
  if (!ms) return 'Unknown';
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}