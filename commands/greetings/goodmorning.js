import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "goodmorning",
  alias: ["gm", "morning"],
  description: "Send a wolf-themed good morning with ego flair and borders",
  category: "fun",

  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      const sender = m.key.participant || jid;

      // 🐺 Image path
      const img1 = path.join(__dirname, "media", "goodmorning.jpg");
      const img2 = path.join(__dirname, "../media", "goodmorning.jpg");
      const imagePath = fs.existsSync(img1) ? img1 : fs.existsSync(img2) ? img2 : null;

      // 🐾 Determine mentions
      let mentions = [];
      let captionMention = "";

      if (jid.endsWith("@g.us")) {
        // 📌 Group chat
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants.map(p => p.id);

        if (args.length > 0) {
          // Tag a specific person if mentioned
          const mentionedUser = args[0].replace(/[@ ]/g, "") + "@s.whatsapp.net";
          if (participants.includes(mentionedUser)) {
            mentions = [mentionedUser];
            captionMention = `@${mentionedUser.split("@")[0]}`;
          } else {
            mentions = [sender];
            captionMention = `@${sender.split("@")[0]}`;
          }
        } else {
          // Tag everyone
          mentions = participants;
          captionMention = "everyone";
        }
      } else {
        // 📌 DM
        mentions = [sender];
        captionMention = `@${sender.split("@")[0]}`;
      }

      // 🐺 Caption with border style
      const caption = `
🌕🐺════════════🌕🐺
🐺 GOOD MORNING, ${captionMention} 🐺
🌕🐺════════════🌕🐺

Rise and shine, mortal. 
The Silent Wolf sees your
potential.  
Seize the day… or 
stay in the shadows.

_"The hunt begins at dawn, 
and I lead."_ 🐾
🌕🐺════════════🌕🐺
`;

      // 🐺 Send image + caption or fallback to text
      if (imagePath) {
        await sock.sendMessage(
          jid,
          {
            image: fs.readFileSync(imagePath),
            caption,
            mentions,
            mimetype: "image/jpeg",
          },
          { quoted: m }
        );
      } else {
        await sock.sendMessage(
          jid,
          { text: caption, mentions },
          { quoted: m }
        );
      }

      console.log("✅ Good morning sent successfully!");
    } catch (err) {
      console.error("❌ Good morning command error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Wolf refuses to rise... something went wrong." },
        { quoted: m }
      );
    }
  },
};
