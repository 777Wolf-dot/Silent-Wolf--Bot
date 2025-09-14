// commands/owner/silent.js
export default {
  name: "silent",
  description: "Unleash the ego of the Silent Wolf 🐺",
  execute: async (sock, msg, args) => {
    const from = msg.key.remoteJid;
    const sender = msg.pushName || "Alpha Wolf";

    const loadingFrames = [
      "🟢░░░░░░░░░░ Ego Awakening...",
      "🟢🟢░░░░░░░░ Ego Rising...",
      "🟢🟢🟢░░░░░░ Silent Power...",
      "🟢🟢🟢🟢░░░░ Dominance Loading...",
      "🟢🟢🟢🟢🟢░░ Alpha Power Incoming...",
      "🟢🟢🟢🟢🟢🟢░ The Silent Wolf Stirs...",
      "🟢🟢🟢🟢🟢🟢🟢 Full Ego Unleashed!"
    ];

    // Send each loading frame as a new message
    for (const frame of loadingFrames) {
      await sock.sendMessage(from, { text: frame });
      await new Promise(r => setTimeout(r, 1000));
    }

    const egoMessage = `
🌌🌑 *SILENT WOLF RISES* 🌑🌌
────────────────────────────
🔥 Name: *${sender}*
⚡ Title: *The Silent Alpha*
🐺 Legacy: *Feared in silence, respected in power*
🌍 Presence: *Echoes across the digital forest*
💀 Enemies: *Crushed in shadows*

🟢 No roar... only silence.
🟢 No mercy... only dominance.
🟢 No defeat... only victory.

🌕🐺 *The Silent Wolf does not bark... he strikes.* 🐺🌕
────────────────────────────
    `;

    await sock.sendMessage(from, { text: egoMessage });
  }
};


