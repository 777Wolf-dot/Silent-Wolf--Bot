// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Path to store the current menu style
// const stylePath = path.join(__dirname, "current_style.json");

// export default {
//   name: "menustyle",
//   alias: ["setmenustyle", "changemenustyle"],
//   description: "Switch between Wolf menu styles (1–7)",
//   category: "owner",

//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const styleNum = parseInt(args[0]);

//     // Validate input
//     if (!styleNum || styleNum < 1 || styleNum > 10) {
//       await sock.sendMessage(
//         jid,
//         {
//           text: `🧭 *Usage:* .menustyle <1|2|3|4|5|6|7>\n\n1️⃣ Image Menu\n2️⃣ Text Only\n3️⃣ Full Descriptions\n4️⃣ Ad Style\n5 Faded\n6 Faded + Image\n Image + Text`,
//         },
//         { quoted: m }
//       );
//       return;
//     }

//     // Save chosen style
//     try {
//       fs.writeFileSync(stylePath, JSON.stringify({ current: styleNum }, null, 2));
//       await sock.sendMessage(jid, { text: `✅ Wolf Menu Style updated to *Style ${styleNum}*.` }, { quoted: m });
//       console.log(`🐺 Menu style changed to Style ${styleNum} by ${jid}`);
//     } catch (err) {
//       console.error("❌ Failed to save menu style:", err);
//       await sock.sendMessage(jid, { text: "⚠️ Failed to update menu style." }, { quoted: m });
//     }
//   },
// };

// // 🐾 Helper function to get the current menu style anywhere
// export function getCurrentMenuStyle() {
//   try {
//     if (fs.existsSync(stylePath)) {
//       const data = fs.readFileSync(stylePath, "utf8");
//       const json = JSON.parse(data);
//       return json.current || 1;
//     }
//     return 1; // Default style
//   } catch (err) {
//     console.error("❌ Error reading current menu style:", err);
//     return 1;
//   }
// }






import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the current menu style
const stylePath = path.join(__dirname, "current_style.json");

export default {
  name: "menustyle",
  alias: ["setmenustyle", "changemenustyle", "style"],
  description: "Switch between Wolf menu styles (1–7)",
  category: "owner",
  ownerOnly: true,
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const { jidManager } = extra;
    
    // ====== OWNER CHECK (Same as mode command) ======
    const isOwner = jidManager.isOwner(m);
    const isFromMe = m.key.fromMe;
    const senderJid = m.key.participant || jid;
    const cleaned = jidManager.cleanJid(senderJid);
    
    if (!isOwner) {
      // Detailed error message in REPLY format
      let errorMsg = `❌ *Owner Only Command!*\n\n`;
      errorMsg += `Only the bot owner can change menu styles.\n\n`;
      errorMsg += `🔍 *Debug Info:*\n`;
      errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
      errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
      errorMsg += `├─ Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
      errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
      
      // Get owner info
      const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : {};
      errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
      
      if (cleaned.isLid && isFromMe) {
        errorMsg += `⚠️ *Issue Detected:*\n`;
        errorMsg += `You're using a linked device (LID).\n`;
        errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
      } else if (!ownerInfo.cleanNumber) {
        errorMsg += `⚠️ *Issue Detected:*\n`;
        errorMsg += `Owner not set in jidManager!\n`;
        errorMsg += `Try using ${PREFIX}debugchat fix\n`;
      }
      
      return sock.sendMessage(jid, { 
        text: errorMsg 
      }, { 
        quoted: m // This makes it a reply to the original message
      });
    }
    
    // ====== SHOW CURRENT STYLE IF NO ARGS ======
    if (!args[0]) {
      const currentStyle = getCurrentMenuStyle();
      
      let styleList = `🎨 *MENU STYLE MANAGEMENT*\n\n`;
      styleList += `📊 Current Style: Style ${currentStyle}\n\n`;
      styleList += `📋 Available Styles:\n`;
      styleList += `1️⃣   Image Menu\n`;
      styleList += `2️⃣   Text Only\n`;
      styleList += `3️⃣   Full Descriptions\n`;
      styleList += `4️⃣   Ad Style\n`;
      styleList += `5️⃣   Faded\n`;
      styleList += `6️⃣   Faded + Image\n`;
      styleList += `7️⃣   Image + Text\n\n`;
      styleList += `Usage: ${PREFIX}menustyle <1-7>\n`;
      styleList += `Example: ${PREFIX}menustyle 3`;
      
      return sock.sendMessage(jid, { 
        text: styleList 
      }, { 
        quoted: m // Reply format
      });
    }
    
    const styleNum = parseInt(args[0]);
    
    // Validate input (1-7 only)
    if (isNaN(styleNum) || styleNum < 1 || styleNum > 7) {
      return sock.sendMessage(
        jid,
        {
          text: `❌ Invalid style number!\n\nValid styles: 1 to 7\n\nUsage: ${PREFIX}menustyle <1-7>\nExample: ${PREFIX}menustyle 3`
        },
        { 
          quoted: m // Reply format
        }
      );
    }
    
    // Save chosen style
    try {
      const styleData = {
        current: styleNum,
        setBy: cleaned.cleanNumber || 'Unknown',
        setAt: new Date().toISOString(),
        setFrom: cleaned.isLid ? 'LID Device' : 'Regular Device',
        chatType: jid.includes('@g.us') ? 'Group' : 'DM'
      };
      
      fs.writeFileSync(stylePath, JSON.stringify(styleData, null, 2));
      
      // Style descriptions
      const styleDescriptions = {
        1: 'Image Menu - Menu with image header',
        2: 'Text Only - Minimal text menu',
        3: 'Full Descriptions - Detailed command info',
        4: 'Ad Style - Promotional format',
        5: 'Faded - Faded aesthetic design',
        6: 'Faded + Image - Faded with image',
        7: 'Image + Text - Balanced layout'
      };
      
      let successMsg = `✅ *Menu Style Updated*\n\n`;
      successMsg += `🎨 New Style: *Style ${styleNum}*\n`;
      successMsg += `📝 ${styleDescriptions[styleNum]}\n\n`;
      successMsg += `🔧 Changes applied immediately.\n`;
      
      if (cleaned.isLid) {
        successMsg += `📱 *Note:* Changed from linked device\n`;
      }
      
      if (jid.includes('@g.us')) {
        successMsg += `👥 *Note:* Changed in group chat`;
      }
      
      await sock.sendMessage(jid, { 
        text: successMsg 
      }, { 
        quoted: m // Reply format
      });
      
      // Log to console
      console.log(`✅ Menu style changed to ${styleNum} by ${cleaned.cleanJid}`);
      if (cleaned.isLid) {
        console.log(`   ↳ Changed from LID device`);
      }
      
    } catch (err) {
      console.error("❌ Failed to save menu style:", err);
      await sock.sendMessage(
        jid, 
        { 
          text: `❌ Error saving menu style: ${err.message}` 
        }, 
        { 
          quoted: m // Reply format
        }
      );
    }
  },
};

// 🐾 Helper function to get the current menu style anywhere
export function getCurrentMenuStyle() {
  try {
    if (fs.existsSync(stylePath)) {
      const data = fs.readFileSync(stylePath, "utf8");
      const json = JSON.parse(data);
      return json.current || 1;
    }
    return 1; // Default style
  } catch (err) {
    console.error("❌ Error reading current menu style:", err);
    return 1;
  }
}