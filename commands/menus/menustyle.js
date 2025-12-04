import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to store the current menu style
const stylePath = path.join(__dirname, "current_style.json");

export default {
  name: "menustyle",
  alias: ["setmenustyle", "changemenustyle"],
  description: "Switch between Wolf menu styles (1–7)",
  category: "owner",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const styleNum = parseInt(args[0]);

    // Validate input
    if (!styleNum || styleNum < 1 || styleNum > 10) {
      await sock.sendMessage(
        jid,
        {
          text: `🧭 *Usage:* .menustyle <1|2|3|4|5|6|7>\n\n1️⃣ Image Menu\n2️⃣ Text Only\n3️⃣ Full Descriptions\n4️⃣ Ad Style\n5 Faded\n6 Faded + Image\n Image + Text`,
        },
        { quoted: m }
      );
      return;
    }

    // Save chosen style
    try {
      fs.writeFileSync(stylePath, JSON.stringify({ current: styleNum }, null, 2));
      await sock.sendMessage(jid, { text: `✅ Wolf Menu Style updated to *Style ${styleNum}*.` }, { quoted: m });
      console.log(`🐺 Menu style changed to Style ${styleNum} by ${jid}`);
    } catch (err) {
      console.error("❌ Failed to save menu style:", err);
      await sock.sendMessage(jid, { text: "⚠️ Failed to update menu style." }, { quoted: m });
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
