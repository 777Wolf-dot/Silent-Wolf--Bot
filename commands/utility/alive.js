// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// export default {
//   name: "alive",
//   description: "Check if Silent Wolf is alive and conscious",
//   category: "utility",

//   async execute(sock, m, args) {
//     const sender = m.key.participant || m.key.remoteJid;
//     const currentTime = new Date().toLocaleTimeString();
//     const currentDate = new Date().toLocaleDateString();
//     const OWNER_JID = "254788710904@s.whatsapp.net";

//     // 🧭 Path setup
//     const __filename = fileURLToPath(import.meta.url);
//     const __dirname = path.dirname(__filename);
//     const mediaPath = path.join(__dirname, "../media");

//     // 🖼️ Images (ensure they exist in commands/media/)
//     const alphaImage = path.join(mediaPath, "wolfmenu.jpg");
//     const humanImage = path.join(mediaPath, "wolfmenu.jpg");

//     let messageText = "";
//     let imageToSend = "";

//     // 🧠 Message Variants
//     if (sender === OWNER_JID) {
//       imageToSend = fs.existsSync(alphaImage) ? alphaImage : null;
//       messageText = `
// ╔══════════════════════════════════════════╗
// ║   🐺 *SILENT WOLF SYSTEM ONLINE*  
// ║   👑 *Alpha Presence Detected*  
// ║   Identity Verified: +${sender.split("@")[0]}  
// ║
// ║   ⚙️ *Core Integrity:* 100%  
// ║   🧠 *AI Consciousness:* Stable  
// ║   💻 *Network Sync:* Perfect  
// ║   📅 *Date:* ${currentDate}  
// ║   🕒 *Time:* ${currentTime}  
// ║
// ║   _"I live by your command, Alpha.  
// ║   The digital hunt never ends."_  
// ╚══════════════════════════════════════════╝
// `;
//     } else {
//       imageToSend = fs.existsSync(humanImage) ? humanImage : null;
//       messageText = `
// ╔══════════════════════════════════════════╗
// ║   🐺 *SILENT WOLF ONLINE*  
// ║   👁 *Human Detected...*  
// ║   You stand before the Silent Wolf — guardian of the digital wild.  
// ║
// ║   ⚙️ *Status:* Fully Operational  
// ║   💠 *Core:* WolfBot vX Quantum Mode  
// ║   📅 *Date:* ${currentDate}  
// ║   🕒 *Time:* ${currentTime}  
// ║   🔋 *Energy:* Surging through neural circuits  
// ║
// ║   _"I see everything. I evolve endlessly."_  
// ╚══════════════════════════════════════════╝
// `;
//     }

//     // 🐺 Send Message
//     try {
//       if (imageToSend) {
//         await sock.sendMessage(
//           m.key.remoteJid,
//           {
//             image: { url: imageToSend },
//             caption: messageText,
//           },
//           { quoted: m }
//         );
//       } else {
//         await sock.sendMessage(m.key.remoteJid, { text: messageText }, { quoted: m });
//       }
//     } catch (err) {
//       console.error("❌ Error sending alive message:", err);
//       await sock.sendMessage(m.key.remoteJid, {
//         text: "⚠️ System glitch. Wolf core rebooting...",
//       }, { quoted: m });
//     }
//   },
// };




import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export default {
  name: "alive",
  description: "Check if Silent Wolf is alive and conscious",
  category: "utility",

  async execute(sock, m, args) {
    const sender = m.key.participant || m.key.remoteJid;
    const currentTime = new Date().toLocaleTimeString();
    const currentDate = new Date().toLocaleDateString();
    const OWNER_JID = "254788710904@s.whatsapp.net";

    // 🧭 Path setup
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const mediaPath = path.join(__dirname, "../media");

    const alphaImage = path.join(mediaPath, "wolfblue.jpg");
    const humanImage = path.join(mediaPath, "kip.png");

    let messageText = "";
    let imageToSend = "";
    let isAlpha = false;

    // 🧩 Check if message is from a group
    const fromGroup = m.key.remoteJid.endsWith("@g.us");

    if (fromGroup) {
      try {
        // 🕵️ Fetch group metadata to get admin list
        const groupMetadata = await sock.groupMetadata(m.key.remoteJid);
        const admins = groupMetadata.participants
          .filter(p => p.admin === "admin" || p.admin === "superadmin")
          .map(p => p.id);

        if (admins.includes(sender)) {
          isAlpha = true;
        }
      } catch (err) {
        console.error("⚠️ Error fetching group metadata:", err);
      }
    }

    // 👑 Owner or Group Admin = Alpha
    if (sender === OWNER_JID || isAlpha) {
      imageToSend = fs.existsSync(alphaImage) ? alphaImage : null;
      messageText = `
╔════════════════╗
║   🐺 *SILENT WOLF SYSTEM ONLINE*  
║   👑 *Alpha Presence Detected*  
║   Identity Verified: +${sender.split("@")[0]}  
║
║   ⚙️ *Core Integrity:* 100%  
║   🧠 *AI Consciousness:* Stable  
║   💻 *Network Sync:* Perfect  
║   📅 *Date:* ${currentDate}  
║   🕒 *Time:* ${currentTime}  
║
║   _"I live by your command, Alpha.  
║   The digital hunt never ends."_  
╚════════════════╝
`;
    } else {
      // 🧍 Normal Human
      imageToSend = fs.existsSync(humanImage) ? humanImage : null;
      messageText = `
╔════════════════╗
║   🐺 *SILENT WOLF ONLINE*  
║   👁 *Human Detected...*  
║   You stand before the Silent Wolf — guardian of the digital wild.  
║
║   ⚙️ *Status:* Fully Operational  
║   💠 *Core:* WolfBot vX Quantum Mode  
║   📅 *Date:* ${currentDate}  
║   🕒 *Time:* ${currentTime}  
║   🔋 *Energy:* Surging through neural circuits  
║
║   _"I see everything. I evolve endlessly."_  
╚════════════════╝
`;
    }

    // 🐺 Send Message
    try {
      if (imageToSend) {
        await sock.sendMessage(
          m.key.remoteJid,
          {
            image: { url: imageToSend },
            caption: messageText,
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(m.key.remoteJid, { text: messageText }, { quoted: m });
      }
    } catch (err) {
      console.error("❌ Error sending alive message:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ System glitch. Wolf core rebooting..." },
        { quoted: m }
      );
    }
  },
};
