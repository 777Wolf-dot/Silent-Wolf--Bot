import fs from "fs";
import path from "path";
import axios from "axios";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";

export default {
  name: "setpp",
  alias: ["setprofilepic", "wolfpp"],
  desc: "Change bot profile picture 🐺",
  category: "owner",
  usage: ".setpp [reply to an image or use URL]",

  async execute(sock, m, args) {
    try {
      const chatId = m.key.remoteJid;

      // ✅ Only owner can use this
      if (!m.key.fromMe) {
        await sock.sendMessage(chatId, {
          text: "❌ Only the Alpha Wolf (Owner) can change the pack’s banner! 🐺",
        });
        return;
      }

      // ✅ If user provides a URL
      if (args[0]) {
        const imageUrl = args[0];
        const tmpDir = path.join(process.cwd(), "tmp");
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

        const imagePath = path.join(tmpDir, `wolfpp_${Date.now()}.jpg`);
        const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
        fs.writeFileSync(imagePath, Buffer.from(response.data));

        await sock.updateProfilePicture(sock.user.id, { url: imagePath });
        fs.unlinkSync(imagePath);

        await sock.sendMessage(chatId, { text: "🐺 Profile picture updated successfully from URL!" });
        return;
      }

      // ✅ If replying to an image
      const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!quoted) {
        await sock.sendMessage(chatId, { text: "_📸 Reply to an image with .setpp or provide a URL._" });
        return;
      }

      const imageMessage = quoted.imageMessage || quoted.stickerMessage;
      if (!imageMessage) {
        await sock.sendMessage(chatId, { text: "❌ The replied message must contain an image!" });
        return;
      }

      // ✅ Download image to temp file
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

      const stream = await downloadContentFromMessage(imageMessage, "image");
      let buffer = Buffer.alloc(0);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const imagePath = path.join(tmpDir, `wolfpp_${Date.now()}.jpg`);
      fs.writeFileSync(imagePath, buffer);

      // ✅ Update bot’s profile picture
      await sock.updateProfilePicture(sock.user.id, { url: imagePath });
      fs.unlinkSync(imagePath);

      await sock.sendMessage(chatId, {
        text: "🐺 The Alpha Wolf has updated the banner successfully!",
      });

    } catch (error) {
      console.error("🐺 Error in setpp command:", error);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ Failed to update profile picture!\n\n⚙️ Error: ${error.message}`,
      });
    }
  },
};
