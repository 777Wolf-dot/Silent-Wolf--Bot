import { menuToggles } from "./menuToggles.js";

export default {
  name: "resetmenuinfo",
  description: "Resets all menu info toggles to default (show everything)",
  async execute(sock, m, args) {
    try {
      // Reset all fields to true
      for (const key in menuToggles) {
        if (Object.hasOwn(menuToggles, key)) {
          menuToggles[key] = true;
        }
      }

      await sock.sendMessage(
        m.key.remoteJid,
        { text: "✅ Menu info toggles have been reset to default (all fields visible)." },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ [RESETMENUINFO] ERROR:", err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠ Failed to reset menu info toggles." },
        { quoted: m }
      );
    }
  },
};
