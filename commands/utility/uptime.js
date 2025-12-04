// export default {
//   name: 'uptime',
//   description: 'Check how long the Silent Wolf has been running',
//   category: 'utility',

//   async execute(sock, m, args) {
//     const uptime = process.uptime(); // uptime in seconds
//     const hours = Math.floor(uptime / 3600);
//     const minutes = Math.floor((uptime % 3600) / 60);
//     const seconds = Math.floor(uptime % 60);

//     const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;

//     // Themed message
//     const msg = `
// ╭━🐺*SILENT WOLF STATUS CORE*🐺━╮

// ┃  🌕 *System Uptime:* ${formattedUptime}
// ┃  ⚙️ *Operational Mode:* Active & Responsive
// ┃  💠 *Processor:* WolfBot v1.0 Neural Engine
// ┃  🧠 *Core State:* Focused | Adaptive | Lethal
// ┃  🔋 *Energy Levels:* ∞ — Fueled by the Hunt

// ╰━━━━━━━━━━━━━━━━━━╯

// _🐺 "The night never sleeps... neither does the Wolf."_
// `;

//     await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
//   }
// };
















export default {
  name: 'uptime',
  description: 'Check how long the Silent Wolf has been running',
  category: 'utility',

  async execute(sock, m, args) {
    const uptime = process.uptime(); // uptime in seconds
    const hours = Math.floor(uptime / 3600);
    const minutes = Math.floor((uptime % 3600) / 60);
    const seconds = Math.floor(uptime % 60);

    const formattedUptime = `${hours}h ${minutes}m ${seconds}s`;
    
    // Get memory usage
    const usedMemory = process.memoryUsage();
    const memoryUsage = Math.round(usedMemory.heapUsed / 1024 / 1024);

    // Clean, minimal message
    const msg = `╔═════════════════╗
🐺 *SILENT WOLF STATUS*

⏱️ *Uptime:* ${formattedUptime}
💾 *Memory:* ${memoryUsage}MB
⚡ *Status:* Active & Responsive

_🐺"The night never sleeps neither does the Wolf."_
╚═════════════════╝
`;

    await sock.sendMessage(m.key.remoteJid, { text: msg }, { quoted: m });
  }
};