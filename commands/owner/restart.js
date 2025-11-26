// commands/owner/restart.js
// Wolf-themed, egocentric restart command
// Only the owner can use this command

import fs from "fs";
import path from "path";

// Load .env (if available)
try {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(dotenvPath)) {
    require("dotenv").config({ path: dotenvPath });
  }
} catch (e) {
  console.warn("[restart] dotenv load error:", e.message);
}

export default {
  name: "restart",
  alias: ["reboot", "wolfrestart", "wr"],

  description: "Restart the Silent Wolf bot (Owner only)",
  usage: ".restart",

  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const sender = (m.sender || m.participant || m.key.participant).toString();

    const OWNER = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
    const OWNER_JID = OWNER ? `${OWNER}@s.whatsapp.net` : "";

    // Permission check
    if (sender !== OWNER_JID) {
      return await sock.sendMessage(jid, {
        text: "⛔ *Only the Wolf King (Owner) can command a restart.*"
      }, { quoted: m });
    }

    // Egocentric restart message 🐺💀
    const msg = 
      "🐺 *Silent Wolf System Command*\n\n" +
      "🔄 Initiating *SELF-REBOOT*... \n" +
      "⚡ Shutting down modules...\n" +
      "🌕 Reawakening the wolf spirit...\n\n" +
      "💀 *THE PACK OBEYS ONLY ME.*\n" +
      "🔻 Restarting now...";

    await sock.sendMessage(jid, { text: msg }, { quoted: m });

    console.log("🐺 Silent Wolf: Restart triggered by OWNER.");

    // Delay slightly so the message sends before exit
    setTimeout(() => {
      process.exit(0); // PM2 or hosting service will restart the bot
    }, 1000);
  }
};
