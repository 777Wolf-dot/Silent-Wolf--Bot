// commands/menus/togglemenuinfo.js
import { menuToggles, toggleField, lastMenuUsed } from "./menuToggles.js";

export default {
  name: "togglemenuinfo",
  description: "Toggle info sections (user, owner, uptime, etc.) for the current active menu.",
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const menu = lastMenuUsed;
    const field = args[0]?.toLowerCase();

    if (!field) {
      // Show all toggles for this menu
      const fields = Object.entries(menuToggles[menu])
        .map(([key, value]) => `> ${value ? "✅" : "❌"} ${key}`)
        .join("\n");
      
      await sock.sendMessage(
        jid,
        { text: `🐺 *Menu ${menu} Toggles:*\n\n${fields}\n\nUse *.togglemenuinfo fieldname* to toggle one.` },
        { quoted: m }
      );
      return;
    }

    const result = toggleField(menu, field);
    await sock.sendMessage(jid, { text: result }, { quoted: m });
  },
};
