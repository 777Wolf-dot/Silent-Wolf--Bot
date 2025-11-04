import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "goodnight",
  alias: ["gn", "night", "goodnite"],
  description: "Send a wolf-themed good night with ego flair, borders, and an ominous whisper",
  category: "fun",

  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      const sender = m.key.participant || jid;

      // 🐺 Image path (search in local and parent media dirs)
      const img1 = path.join(__dirname, "media", "image.png");
      const img2 = path.join(__dirname, "../media", "image.png");
      const imagePath = fs.existsSync(img1) ? img1 : fs.existsSync(img2) ? img2 : null;

      // 🐾 Determine mentions & captionMention
      let mentions = [];
      let captionMention = "";

      if (jid.endsWith("@g.us")) {
        // 📌 Group chat - fetch participants
        const groupMetadata = await sock.groupMetadata(jid);
        const participants = groupMetadata.participants.map(p => p.id);

        if (args.length > 0) {
          // Tag a specific person if provided (first arg)
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

      // 🐺 Border + caption (with a soul-tingling line)
      const caption = `
🌑🐺════════════🌑🐺
🐺 GOOD NIGHT, ${captionMention} 🐺
🌑🐺════════════🌑🐺

Rest your bones, mortal. The Silent Wolf watches as the world exhales.
Dream well — or dream wisely, for I am the velvet shadow that lingers at the edge of sleep.
Under my moonlit gaze, even your bravest thoughts shiver. Let your soul remember me tonight.
Sleep... while you can.

_"The hunt sleeps, but the watcher never truly rests."_ 🐾
🌑🐺════════════🌑🐺
`.trim();

      // 🐺 Send image + caption if available, otherwise fallback to text
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

      console.log("✅ Good night sent successfully!");
    } catch (err) {
      console.error("❌ Good night command error:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ The Silent Wolf refuses to rest properly... something went wrong." },
        { quoted: m }
      );
    }
  },
};
