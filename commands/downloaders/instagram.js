import axios from 'axios';

export default {
  name: 'instagram', // Changed from 'ig' to 'instagram'
  description: 'Download Instagram videos, posts, reels, and stories',
  category: 'downloader',

  async execute(sock, m, args) {
    try {
      const url = args[0];
      
      if (!url) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '📱 *Instagram Downloader*\n\nUsage: *.instagram <instagram-url>*\n\nExample: .instagram https://www.instagram.com/reel/Cxample...'
        }, { quoted: m });
      }

      // Validate URL
      if (!url.includes('instagram.com')) {
        return await sock.sendMessage(m.key.remoteJid, {
          text: '❌ *Invalid URL*\nPlease provide a valid Instagram link'
        }, { quoted: m });
      }

      // Send processing message
      const processingMsg = await sock.sendMessage(m.key.remoteJid, {
        text: '🔍 *Analyzing Instagram URL...*\n⏳ This may take a few seconds...'
      }, { quoted: m });

      console.log('🔄 Starting download for:', url);

      // Try multiple download methods
      const result = await downloadWithAllMethods(url);
      
      if (!result.success) {
        console.log('❌ All download methods failed');
        return await sock.sendMessage(m.key.remoteJid, {
          text: `❌ *Download Failed*\n\n${result.error}\n\n💡 *Tips:*\n• Make sure the account is public\n• Try a different Instagram link\n• The content might be private or removed`
        }, { edit: processingMsg.key });
      }

      console.log('✅ Download successful, sending media...');

      // Send the downloaded media
      if (result.type === 'video') {
        await sock.sendMessage(m.key.remoteJid, {
          video: { url: result.url },
          caption: `📹 *Instagram Video*\n\n👤 *Author:* ${result.author || 'Unknown'}\n🔗 *Source:* ${url}\n\n✨ Downloaded by WolfBot`
        });
      } else if (result.type === 'image') {
        await sock.sendMessage(m.key.remoteJid, {
          image: { url: result.url },
          caption: `🖼️ *Instagram Photo*\n\n👤 *Author:* ${result.author || 'Unknown'}\n🔗 *Source:* ${url}\n\n✨ Downloaded by WolfBot`
        });
      }

      // Update processing message
      await sock.sendMessage(m.key.remoteJid, {
        text: '✅ *Download Completed Successfully!*\n🎉 Enjoy your content!'
      }, { edit: processingMsg.key });

    } catch (error) {
      console.error('❌ Main execution error:', error);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ *Unexpected Error*\n\n${error.message}\n\nPlease try again later.`
      }, { quoted: m });
    }
  }
};

// MAIN DOWNLOAD FUNCTION - TRIES ALL METHODS
async function downloadWithAllMethods(url) {
  console.log('🔄 Starting download process...');
  
  // Method 1: Direct APIs (Primary)
  console.log('📡 Trying Method 1: Direct APIs...');
  const apiResult = await tryAllAPIs(url);
  if (apiResult.success) {
    console.log('✅ Method 1 succeeded');
    return apiResult;
  }

  // Method 2: Alternative Services (Secondary)
  console.log('📡 Trying Method 2: Alternative Services...');
  const serviceResult = await tryAlternativeServices(url);
  if (serviceResult.success) {
    console.log('✅ Method 2 succeeded');
    return serviceResult;
  }

  console.log('❌ All methods failed');
  return {
    success: false,
    error: 'All download methods failed. The content might be private or the services are temporarily down.'
  };
}

// METHOD 1: DIRECT APIs (CURRENTLY WORKING)
async function tryAllAPIs(url) {
  const apis = [
    {
      name: 'API-1 (FGMods)',
      url: `https://api.fgmods.xyz/api/downloader/instagram2?url=${encodeURIComponent(url)}&apikey=fgmods`,
      parser: (data) => data.result?.url || data.url
    },
    {
      name: 'API-2 (Fantox)',
      url: `https://api.fantox.xyz/instagram?url=${encodeURIComponent(url)}`,
      parser: (data) => data.data?.url || data.url
    },
    {
      name: 'API-3 (Ridwan)',
      url: `https://api.erdwpe.com/api/download/instagram?url=${encodeURIComponent(url)}`,
      parser: (data) => data.result?.url || data.url
    }
  ];

  for (const api of apis) {
    try {
      console.log(`   Trying ${api.name}...`);
      const response = await axios.get(api.url, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json'
        }
      });

      console.log(`   ${api.name} response status:`, response.status);
      
      if (response.data) {
        const mediaUrl = api.parser(response.data);
        if (mediaUrl && isValidUrl(mediaUrl)) {
          console.log(`   ✅ ${api.name} found media:`, mediaUrl);
          return {
            success: true,
            type: mediaUrl.includes('.mp4') ? 'video' : 'image',
            url: mediaUrl,
            author: response.data.author || response.data.username || 'Unknown'
          };
        }
      }
    } catch (error) {
      console.log(`   ❌ ${api.name} failed:`, error.message);
      continue;
    }
  }
  
  return { success: false };
}

// METHOD 2: ALTERNATIVE SERVICES
async function tryAlternativeServices(url) {
  const services = [
    {
      name: 'Service-1 (SnapInsta)',
      url: `https://snapinsta.app/action.php`,
      method: 'POST',
      data: `url=${encodeURIComponent(url)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      parser: (data) => {
        try {
          const jsonMatch = data.match(/"download_url":"([^"]+)"/);
          if (jsonMatch) return jsonMatch[1].replace(/\\/g, '');
          
          const htmlMatch = data.match(/href="(https:[^"]*\.(mp4|jpg|png))"/);
          return htmlMatch ? htmlMatch[1] : null;
        } catch (e) {
          return null;
        }
      }
    }
  ];

  for (const service of services) {
    try {
      console.log(`   Trying ${service.name}...`);
      const config = {
        timeout: 15000,
        headers: service.headers
      };

      let response;
      if (service.method === 'POST') {
        response = await axios.post(service.url, service.data, config);
      } else {
        response = await axios.get(service.url, config);
      }

      const mediaUrl = service.parser(response.data);
      if (mediaUrl && isValidUrl(mediaUrl)) {
        console.log(`   ✅ ${service.name} found media:`, mediaUrl);
        return {
          success: true,
          type: mediaUrl.includes('.mp4') ? 'video' : 'image',
          url: mediaUrl,
          author: 'Unknown'
        };
      }
    } catch (error) {
      console.log(`   ❌ ${service.name} failed:`, error.message);
      continue;
    }
  }
  
  return { success: false };
}

// UTILITY FUNCTIONS
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}