import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "url",
  description: "Generate image URL from replied image",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Check if replied to an image
    const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    
    if (!quotedMessage?.imageMessage) {
      await sock.sendMessage(jid, { 
        text: `📸 Reply to an image with *${global.prefix}url* to generate a direct URL.` 
      }, { quoted: m });
      return;
    }

    try {
      await sock.sendMessage(jid, { 
        text: "🔄 Processing your image..." 
      }, { quoted: m });

      // Simple download attempt
      let imageBuffer;
      try {
        // Try the most common download method
        if (sock.downloadAndSaveMediaMessage) {
          const tempFile = await sock.downloadAndSaveMediaMessage(quotedMessage);
          imageBuffer = fs.readFileSync(tempFile);
          if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
        } else {
          throw new Error('No download method');
        }
      } catch (downloadError) {
        await sock.sendMessage(jid, { 
          text: `❌ Cannot download image automatically.

💡 *Manual Method:*
1. Save the image
2. Upload to: https://imgbb.com/
3. Copy "Direct Link" 
4. Use: ${global.prefix}setmenuimage YOUR_URL` 
        }, { quoted: m });
        return;
      }

      // Upload to ImgBB
      const base64Image = imageBuffer.toString('base64');
      const apiKey = '2dd8ffd8d9b41772d85f4827afc0d3ae';
      
      const response = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, 
        `image=${encodeURIComponent(base64Image)}`,
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          timeout: 25000
        }
      );

      if (response.data.success) {
        const imageUrl = response.data.data.url;
        
        await sock.sendMessage(jid, { 
          text: `✅ *URL Generated!*

${imageUrl}

Use: ${global.prefix}setmenuimage ${imageUrl}` 
        }, { quoted: m });
      } else {
        throw new Error('ImgBB upload failed');
      }

    } catch (error) {
      console.error("URL Error:", error);
      await sock.sendMessage(jid, { 
        text: "❌ Failed to generate URL. Try manual upload at imgbb.com" 
      }, { quoted: m });
    }
  },
};