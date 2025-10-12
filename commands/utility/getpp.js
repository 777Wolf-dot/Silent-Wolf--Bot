import fs from "fs";
import path from "path";
import axios from "axios";

export default {
  name: "getpp",
  alias: ["getprofilepic", "wolfgetpp"],
  desc: "Fetch someone's profile picture 🐺",
  category: "utility",
  usage: ".getpp [@user | reply to message]",

  async execute(sock, m) {
    try {
      const chatId = m.key.remoteJid;

      const isGroup = chatId.endsWith("@g.us");
      const isOwner = m.key.fromMe; // This checks if the message is from the linked owner

      // Only enforce owner check in DMs
      if (!isGroup && !isOwner) {
        await sock.sendMessage(chatId, {
          text: "⚠️ Only the Alpha Wolf (Owner) can use this command in DMs.",
          contextInfo: { stanzaId: m.key.id, participant: m.key.participant, quotedMessage: m.message },
        });
        return;
      }

      // Identify target user
      const mentioned = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
      const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
      const target = mentioned || quoted;

      if (!target) {
        await sock.sendMessage(chatId, {
          text: "⚠️ You must *mention* someone or *reply to* their message to fetch their profile picture. 🐾",
          contextInfo: { stanzaId: m.key.id, participant: m.key.participant, quotedMessage: m.message },
        });
        return;
      }

      // Fetch profile picture
      let ppUrl;
      try {
        ppUrl = await sock.profilePictureUrl(target, "image");
      } catch {
        ppUrl = "https://files.catbox.moe/lvcwnf.jpg"; // fallback image
      }

      // Download image temporarily
      const tmpDir = path.join(process.cwd(), "tmp");
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      const filePath = path.join(tmpDir, `wolf_getpp_${Date.now()}.jpg`);

      const response = await axios.get(ppUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(filePath, Buffer.from(response.data));

      // Send profile picture as a reply
      await sock.sendMessage(chatId, {
        image: { url: filePath },
        caption: `🐺 *Target:* @${target.split("@")[0]}\n📸 Profile picture retrieved successfully!`,
        mentions: [target],
        contextInfo: { stanzaId: m.key.id, participant: m.key.participant, quotedMessage: m.message },
      });

      fs.unlinkSync(filePath);

    } catch (error) {
      console.error("🐺 Error in getpp command:", error);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ Failed to retrieve profile picture!\n\n⚙️ Error: ${error.message}`,
      });
    }
  },
};
