import axios from "axios";

export default {
  name: "logo",
  description: "Create stylish text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Logo Maker*\n\n${global.prefix}logo <text>\n\n*Other Styles:*\n${global.prefix}neonlogo <text>\n${global.prefix}firelogo <text>\n${global.prefix}goldlogo <text>\n${global.prefix}shadowlogo <text>\n${global.prefix}gradientlogo <text>\n\n*Example:*\n${global.prefix}logo WOLF` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      await generateLogo(sock, jid, m, text, "default");

    } catch (error) {
      console.error("❌ [LOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating logo: ${error.message}` 
      }, { quoted: m });
    }
  },
};