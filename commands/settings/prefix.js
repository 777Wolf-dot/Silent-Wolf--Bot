import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store prefix in a JSON file
const prefixPath = path.join(__dirname, "../../lib/prefix.json");

export default {
  name: "setprefix",
  alias: ["prefix", "changeprefix"],
  description: "Change the bot prefix to anything (emoji, letter, symbol)",
  category: "owner",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    // Only allow owner
    const ownerNumber = "254788710904@s.whatsapp.net";
    if (m.key.participant !== ownerNumber && jid !== ownerNumber) {
      await sock.sendMessage(jid, { text: "❌ Only the bot owner can change the prefix." }, { quoted: m });
      return;
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      await sock.sendMessage(jid, { text: "🧭 Usage: .setprefix <new prefix>" }, { quoted: m });
      return;
    }

    // Save prefix to file
    try {
      fs.writeFileSync(prefixPath, JSON.stringify({ prefix: newPrefix }, null, 2));
      await sock.sendMessage(jid, { text: `✅ Bot prefix updated to: *${newPrefix}*` }, { quoted: m });
    } catch (err) {
      console.error("❌ Failed to save prefix:", err);
      await sock.sendMessage(jid, { text: "❌ Failed to update prefix. Check console." }, { quoted: m });
    }
  },
};

// Helper function to get current prefix
export function getPrefix() {
  try {
    const data = fs.readFileSync(prefixPath, "utf8");
    return JSON.parse(data).prefix || ".";
  } catch {
    return ".";
  }
}
