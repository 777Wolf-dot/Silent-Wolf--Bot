

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "repo",
  description: "Shows Wolf Bot repository",

  async execute(sock, m, args) {
    try {
      const sender = m.key.participant || m.key.remoteJid;
      const jid = m.key.remoteJid;

      // 🧭 Locate image
      const imagePath1 = path.join(__dirname, "media", "wolfblue.jpg");
      const imagePath2 = path.join(__dirname, "../media", "wolfblue.jpg");
      const imagePath = fs.existsSync(imagePath1)
        ? imagePath1
        : fs.existsSync(imagePath2)
        ? imagePath2
        : null;

      // 🐺 Caption with ego and style
      const caption = `
🌕🐺══════════════🌕🐺
🐺 WOLF BOT REPOSITORY
🌕🐺══════════════🌕🐺

📚 GitHub: https://github.com/777Wolf-dot/Silent-Wolf--Bot.git

⚡ Powerful WhatsApp bot with multiple commands
🧠 AI & media utilities
🎵 Audio tools & downloads

⭐ Star the repo if you dare!
🔧 Crafted by: 777Wolf-dot
🌕🐺══════════════🌕🐺
`;

      // 🐺 Send Image + Caption or fallback to text
      if (imagePath) {
        await sock.sendMessage(
          jid,
          {
            image: fs.readFileSync(imagePath),
            caption: caption,
            mimetype: "image/jpeg",
          },
          { quoted: m }
        );
        console.log("✅ Repo info sent with image + caption");
      } else {
        await sock.sendMessage(
          jid,
          { text: caption },
          { quoted: m }
        );
        console.log("⚠️ Image not found, sent text only");
      }

    } catch (err) {
      console.error("❌ About command error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Wolf encountered a glitch while revealing its power..." },
        { quoted: m }
      );
    }
  },
};
