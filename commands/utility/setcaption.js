// // Store user captions
// const userCaptions = new Map();

// export default {
//   name: "setcaption",
//   description: "Set custom caption for TikTok downloads",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const userId = m.key.participant || m.key.remoteJid;

//     try {
//       if (!args[0]) {
//         await sock.sendMessage(jid, { 
//           text: `📝 *Set Caption*\n\nUsage: setcaption <your text>\n\nEx: setcaption My awesome video!\n\nCurrent caption: "${userCaptions.get(userId) || 'WolfBot is the Alpha'}"` 
//         }, { quoted: m });
//         return;
//       }

//       const caption = args.join(' ');
//       userCaptions.set(userId, caption);

//       await sock.sendMessage(jid, { 
//         text: `✅ Caption set!\n\n"${caption}"\n\nThis will be used for all your TikTok downloads.` 
//       }, { quoted: m });

//     } catch (error) {
//       await sock.sendMessage(jid, { text: `❌ Error setting caption` }, { quoted: m });
//     }
//   },
// };

// // Export the userCaptions map for use in tiktok.js
// export { userCaptions };
















import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import fs from 'fs';

const execAsync = promisify(exec);

// Global user captions storage for all commands
const globalUserCaptions = new Map();

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
        await sock.sendMessage(jid, { text: `❌ Download failed` }, { quoted: m });
        return;
      }

      const { videoPath } = result;
      
      // Get user's global custom caption or use default
      const userCaption = globalUserCaptions.get(userId) || "WolfBot is the Alpha";

      await sock.sendMessage(jid, {
        video: fs.readFileSync(videoPath),
        caption: userCaption
      }, { quoted: m });

      setTimeout(() => {
        try {
          if (existsSync(videoPath)) fs.unlinkSync(videoPath);
        } catch (e) {}
      }, 30000);

    } catch (error) {
      await sock.sendMessage(jid, { text: `❌ Error` }, { quoted: m });
    }
  },
};

// Global set caption command for all commands
export const setCaptionHandler = {
  name: "setcaption",
  description: "Set custom caption for all media downloads",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;

    try {
      if (!args[0]) {
        const currentCaption = globalUserCaptions.get(userId) || 'WolfBot is the Alpha';
        await sock.sendMessage(jid, { 
          text: `📝 *Global Caption Settings*\n\nUsage: setcaption <your text>\n\nCurrent caption: "${currentCaption}"\n\nThis caption will be used for:\n• TikTok downloads\n• Instagram downloads\n• YouTube downloads\n• All media with captions` 
        }, { quoted: m });
        return;
      }

      const caption = args.join(' ');
      globalUserCaptions.set(userId, caption);

      await sock.sendMessage(jid, { 
        text: `✅ Global caption set!\n\n"${caption}"\n\nThis will be used for all your media downloads.` 
      }, { quoted: m });

    } catch (error) {
      await sock.sendMessage(jid, { text: `❌ Error setting caption` }, { quoted: m });
    }
  },
};

// Export the global captions for other commands to use
export function getUserCaption(userId) {
  return globalUserCaptions.get(userId) || "WolfBot is the Alpha";
}

export function setUserCaption(userId, caption) {
  globalUserCaptions.set(userId, caption);
}

export function getUserCaptionMap() {
  return globalUserCaptions;
}

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

          if (videoUrl) break;
        }
      } catch (e) {
        continue;
      }
    }

    if (!videoUrl) {
      return await downloadWithYtDlp(url, videoPath);
    }

    await downloadFile(videoUrl, videoPath);

    return {
      success: true,
      videoPath
    };

  } catch (error) {
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
    await execAsync(`yt-dlp -f "best[ext=mp4]" -o "${videoPath}" "${url}"`);
    return { success: true, videoPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function downloadFile(url, filePath) {
  const writer = createWriteStream(filePath);
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'stream',
    timeout: 60000
  });

  response.data.pipe(writer);

  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}