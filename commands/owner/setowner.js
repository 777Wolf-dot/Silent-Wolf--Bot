import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "setownername",
  description: "Sets the bot owner name displayed in menus",
  async execute(sock, m, args) {
    const sender = m.key.fromMe || global.owner?.includes(m.sender);

    // Only the real owner can use it
    if (!sender) {
      return sock.sendMessage(m.chat, { 
        text: "⛔ *Only the bot owner can change the owner name!*" 
      }, { quoted: m });
    }

    const newName = args.join(" ").trim();

    if (!newName) {
      return sock.sendMessage(m.chat, { 
        text: "⚠️ *Usage:* `setownername Wolf King`" 
      }, { quoted: m });
    }

    // Set in global memory
    global.ownername = newName;

    // Save persistently
    const configFile = path.join(__dirname, "../../settings/bot-settings.json");

    let config = {};
    if (fs.existsSync(configFile)) {
      config = JSON.parse(fs.readFileSync(configFile));
    }

    config.ownername = newName;

    fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

    await sock.sendMessage(m.chat, {
      text: `🐺✨ *Owner name updated!*\n\nNew Owner Name: *${newName}*`
    }, { quoted: m });
  }
};
