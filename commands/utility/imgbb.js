// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import axios from "axios";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   name: "imgbb",
//   description: "Convert replied image to ImgBB URL directly",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       // Check if message is a reply to an image
//       const quotedMessage = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      
//       if (!quotedMessage?.imageMessage) {
//         await sock.sendMessage(jid, { 
//           text: `📸 *ImgBB URL Generator*\n\nReply to an image with *${global.prefix}imgbb* to get a direct URL.` 
//         }, { quoted: m });
//         return;
//       }

//       // Get API key from environment variables
//       const apiKey = process.env.IMGBB_API_KEY || global.IMGBB_API_KEY;
      
//       if (!apiKey) {
//         await sock.sendMessage(jid, { 
//           text: `❌ *ImgBB API Key Not Configured*\n\nPlease add your ImgBB API key to the .env file:\n\nIMGBB_API_KEY=your_api_key_here\n\nGet your free API key from: https://api.imgbb.com/` 
//         }, { quoted: m });
//         return;
//       }

//       const imageMsg = quotedMessage.imageMessage;
//       console.log(`📸 Processing image for ImgBB upload`);

//       // Send initial message and store its ID for editing
//       const processingMsg = await sock.sendMessage(jid, { 
//         text: "⏳ *Downloading image from WhatsApp...*" 
//       }, { quoted: m });

//       let imageBuffer;

//       // Try to download the image
//       try {
//         // Method 1: Use WhatsApp direct URL with proper headers
//         if (imageMsg.url) {
//           console.log("🌐 Downloading from WhatsApp URL...");
          
//           // Update message to show download progress
//           await sock.sendMessage(jid, { 
//             text: "⏳ *Downloading image from WhatsApp...* ✅\n🔄 *Uploading to ImgBB...*",
//             edit: processingMsg.key 
//           });

//           const response = await axios.get(imageMsg.url, {
//             responseType: 'arraybuffer',
//             timeout: 30000,
//             headers: {
//               'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//               'Origin': 'https://web.whatsapp.com',
//               'Referer': 'https://web.whatsapp.com/'
//             }
//           });
//           imageBuffer = Buffer.from(response.data);
//         } else {
//           throw new Error("No direct URL available");
//         }
//       } catch (downloadError) {
//         console.log("❌ Direct download failed:", downloadError.message);
//         await sock.sendMessage(jid, { 
//           text: "❌ *Failed to download image from WhatsApp*",
//           edit: processingMsg.key 
//         });
//         return;
//       }

//       // Validate image
//       if (!imageBuffer || imageBuffer.length < 100) {
//         await sock.sendMessage(jid, { 
//           text: "❌ *Downloaded image is corrupted or too small*",
//           edit: processingMsg.key 
//         });
//         return;
//       }

//       console.log(`📤 Uploading ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB to ImgBB...`);

//       // Upload to ImgBB with correct format
//       const result = await uploadToImgBB(imageBuffer, apiKey);
      
//       if (!result.success) {
//         await sock.sendMessage(jid, { 
//           text: `❌ *ImgBB Upload Failed*\n\nError: ${result.error}`,
//           edit: processingMsg.key 
//         });
//         return;
//       }

//       const { url, id } = result;
//       console.log(`✅ ImgBB upload successful: ${url}`);

//       // Edit the original message with the final result
//       await sock.sendMessage(jid, { 
//         text: `✅ *ImgBB Upload Successful!*\n\n🌐 *Direct URL:*\n\`${url}\`\n\n🚀 *Use with:*\n\`${global.prefix}setmenuimage ${url}\`\n\n📊 *Image ID:* ${id}`,
//         edit: processingMsg.key 
//       });

//     } catch (error) {
//       console.error("❌ [IMGBB] ERROR:", error.message);
//       await sock.sendMessage(jid, { 
//         text: `❌ *Unexpected Error*\n\n${error.message}` 
//       }, { quoted: m });
//     }
//   },
// };

// // Fixed ImgBB upload function without FormData issues
// async function uploadToImgBB(imageBuffer, apiKey) {
//   try {
//     // Convert to base64
//     const base64Image = imageBuffer.toString('base64');
    
//     console.log(`📤 Uploading to ImgBB...`);
    
//     // Use URLSearchParams for form data
//     const params = new URLSearchParams();
//     params.append('key', apiKey);
//     params.append('image', base64Image);

//     const response = await axios.post('https://api.imgbb.com/1/upload', 
//       params.toString(),
//       {
//         headers: {
//           'Content-Type': 'application/x-www-form-urlencoded',
//         },
//         timeout: 30000,
//       }
//     );

//     console.log('📥 ImgBB Response:', response.data);

//     if (response.data.success) {
//       return {
//         success: true,
//         url: response.data.data.url,
//         id: response.data.data.id,
//         deleteUrl: response.data.data.delete_url
//       };
//     } else {
//       throw new Error(response.data.error?.message || 'Upload failed');
//     }
    
//   } catch (error) {
//     console.error('❌ ImgBB Upload Error:', error.response?.data || error.message);
    
//     let errorMsg = 'Upload failed';
    
//     if (error.response?.data?.error) {
//       // Handle ImgBB specific errors
//       const imgbbError = error.response.data.error;
//       switch (imgbbError.code) {
//         case 100:
//           errorMsg = 'No image data received';
//           break;
//         case 110:
//           errorMsg = 'Invalid image format';
//           break;
//         case 120:
//           errorMsg = 'Image too large (max 32MB)';
//           break;
//         case 130:
//           errorMsg = 'Image upload timeout';
//           break;
//         case 310:
//           errorMsg = 'Invalid image source or corrupted data';
//           break;
//         default:
//           errorMsg = imgbbError.message || 'Unknown ImgBB error';
//       }
//     } else if (error.response?.status === 400) {
//       errorMsg = 'Bad request - check API key and image format';
//     } else if (error.response?.status === 403) {
//       errorMsg = 'API key invalid or quota exceeded';
//     } else if (error.code === 'ECONNABORTED') {
//       errorMsg = 'Upload timeout (30 seconds)';
//     } else if (error.code === 'ENOTFOUND') {
//       errorMsg = 'Cannot connect to ImgBB server';
//     }
    
//     return {
//       success: false,
//       error: errorMsg
//     };
//   }
// }





























import axios from "axios";
import { downloadMediaMessage } from "@whiskeysockets/baileys";

export default {
  name: "imgbb",
  description: "Convert replied image to ImgBB URL directly",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      // Check if message is a reply to an image
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted?.imageMessage) {
        return sock.sendMessage(
          jid,
          {
            text: `📸 *ImgBB URL Generator*\n\nReply to an image with *${global.prefix}imgbb* to get a direct URL.`
          },
          { quoted: m }
        );
      }

      // Load API key
      const apiKey = process.env.IMGBB_API_KEY || global.IMGBB_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(
          jid,
          {
            text: `❌ *ImgBB API Key Missing*\nAdd this in your .env:\n\nIMGBB_API_KEY=YOUR_KEY_HERE`
          },
          { quoted: m }
        );
      }

      // Acknowledgement message
      const processingMsg = await sock.sendMessage(
        jid,
        { text: "⏳ *Downloading image from WhatsApp...*" },
        { quoted: m }
      );

      // ⭐ FIXED: Use Baileys decryption, NOT axios
      let imageBuffer;
      try {
        console.log("📥 Downloading via Baileys decryption...");

        imageBuffer = await downloadMediaMessage(
          { message: quoted },
          "buffer",
          {}
        );

        if (!imageBuffer || imageBuffer.length < 150) {
          throw new Error("Image buffer is empty or corrupted");
        }

      } catch (err) {
        console.log("❌ Download Error:", err.message);
        return sock.sendMessage(
          jid,
          { text: "❌ *Failed to download image from WhatsApp (decryption failed)*" },
          { quoted: m }
        );
      }

      // Update status
      await sock.sendMessage(
        jid,
        {
          text: `📤 *Uploading ${(imageBuffer.length / 1024 / 1024).toFixed(2)}MB to ImgBB...*`,
          edit: processingMsg.key
        }
      );

      // Upload
      const result = await uploadToImgBB(imageBuffer, apiKey);

      if (!result.success) {
        return sock.sendMessage(
          jid,
          {
            text: `❌ *ImgBB Upload Failed*\n\n${result.error}`,
            edit: processingMsg.key
          }
        );
      }

      // Success
      return sock.sendMessage(
        jid,
        {
          text:
            `✅ *ImgBB Upload Successful!*\n\n` +
            `🌐 *Direct URL:*\n${result.url}\n\n` +
            `🆔 *Image ID:* ${result.id}\n` +
            `🗑 *Delete URL:* ${result.deleteUrl}\n\n` +
            ``,
          edit: processingMsg.key
        }
      );

    } catch (err) {
      console.error("❌ [IMGBB ERROR]:", err.message);
      return sock.sendMessage(
        jid,
        { text: `❌ Unexpected error: ${err.message}` },
        { quoted: m }
      );
    }
  }
};

// ⭐ FIXED ImgBB uploader (base64)
async function uploadToImgBB(buffer, apiKey) {
  try {
    const base64 = buffer.toString("base64");

    const params = new URLSearchParams();
    params.append("key", apiKey);
    params.append("image", base64);

    const res = await axios.post(
      "https://api.imgbb.com/1/upload",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        timeout: 30000
      }
    );

    if (res.data.success) {
      return {
        success: true,
        url: res.data.data.url,
        id: res.data.data.id,
        deleteUrl: res.data.data.delete_url
      };
    }

    return {
      success: false,
      error: res.data.error?.message || "Unknown ImgBB error"
    };

  } catch (e) {
    console.log("❌ ImgBB Error:", e.response?.data || e.message);

    const code = e.response?.data?.error?.code;
    let msg = "Upload failed";

    if (code === 310) msg = "Invalid image source / corrupted data";
    if (code === 100) msg = "No image data received";
    if (code === 110) msg = "Invalid image format";
    if (code === 120) msg = "Image too large";
    if (code === 130) msg = "Upload timeout";

    return { success: false, error: msg };
  }
}
