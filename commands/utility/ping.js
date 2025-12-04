// export default {
//   name: 'ping',
//   description: 'Check bot latency',
//   category: 'utility',

//   async execute(sock, m, args) {
//     const start = Date.now();

//     // Initial scanning animation
//     await sock.sendMessage(m.key.remoteJid, {
//       text: `
// ╭━━🐺 *WOLFBOT SYSTEM CHECK* 🐺━╮
// ┃  ⚙️ Initializing Neural Circuits...
// ┃  📡 Tracking Core Signal...
// ┃  🧠 Syncing Wolf Consciousness...
// ╰━━━━━━━━━━━━━━━╯
// `
//     }, { quoted: m });

//     const latency = Date.now() - start;

//     // Determine latency status
//     let statusEmoji, statusText, mood;
//     if (latency <= 100) {
//       statusEmoji = "🟢";
//       statusText = "Lightning Fast";
//       mood = "⚡ Hyper Instinct Mode Activated!";
//     } else if (latency <= 300) {
//       statusEmoji = "🟡";
//       statusText = "Moderate";
//       mood = "🧠 Calculating Precision Hunt...";
//     } else {
//       statusEmoji = "🔴";
//       statusText = "Slow";
//       mood = "🌑 Patience of the Wolf… recalibrating senses.";
//     }

//     // Themed response
//     await sock.sendMessage(m.key.remoteJid, {
//       text: `
// ╭━━🌕 *WOLFBOT PONG!* 🌕━━╮
// ┃  ⚡ *Latency:* ${latency}ms
// ┃  ${statusEmoji} *Status:* ${statusText}
// ┃  🐾 *Mode:* ${mood}
// ╰━━━━━━━━━━━━━━━━╯

// _🐺 The Moon Watches — The Hunt Continues..._
// `
//     }, { quoted: m });
//   }
// };
























// export default {
//   name: 'ping',
//   description: 'Check bot latency',
//   category: 'utility',

//   async execute(sock, m, args) {
//     const start = Date.now();

//     // Simple initial syncing message
//     const loadingMessage = await sock.sendMessage(m.key.remoteJid, {
//       text: `🐺 *WolfBot* is syncing... █▒▒▒▒▒▒▒▒▒`
//     }, { quoted: m });

//     const latency = Date.now() - start;

//     // Determine latency status
//     let statusEmoji, statusText, mood;
//     if (latency <= 100) {
//       statusEmoji = "🟢";
//       statusText = "Lightning Fast";
//       mood = "⚡ Hyper Instinct Mode Activated!";
//     } else if (latency <= 300) {
//       statusEmoji = "🟡";
//       statusText = "Moderate";
//       mood = "🧠 Calculating Precision Hunt...";
//     } else {
//       statusEmoji = "🔴";
//       statusText = "Slow";
//       mood = "🌑 Patience of the Wolf… recalibrating senses.";
//     }

//     // Edit the original message with ping results
//     await sock.sendMessage(m.key.remoteJid, {
//       text: `
// ╭━━🌕 *WOLFBOT PONG!* 🌕━━╮
// ┃  ⚡ *Latency:* ${latency}ms
// ┃  ${statusEmoji} *Status:* ${statusText}
// ┃  🐾 *Mode:* ${mood}
// ╰━━━━━━━━━━━━━━━━━━━━╯

// _🐺 The Moon Watches — The Hunt Continues..._
// `
//     }, { 
//       quoted: m,
//       edit: loadingMessage.key
//     });
//   }
// };













export default {
  name: 'ping',
  description: 'Check bot latency',
  category: 'utility',

  async execute(sock, m, args) {
    const start = Date.now();

    // Send initial syncing message
    const loadingMessage = await sock.sendMessage(m.key.remoteJid, {
      text: `🐺 *WolfBot* is syncing... █▒▒▒▒▒▒▒▒▒`
    }, { quoted: m });

    const latency = Date.now() - start;

    // Determine latency status
    let statusEmoji, statusText, mood;
    if (latency <= 100) {
      statusEmoji = "🟢";
      statusText = "Lightning Fast";
      mood = "⚡Hyper Instinct";
    } else if (latency <= 300) {
      statusEmoji = "🟡";
      statusText = "Moderate";
      mood = "🧠Precision Hunt...";
    } else {
      statusEmoji = "🔴";
      statusText = "Slow";
      mood = "🌑 Patience.";
    }

    // Wait for 1 second total (including time already passed)
    const timePassed = Date.now() - start;
    const remainingTime = 1000 - timePassed;
    if (remainingTime > 0) {
      await new Promise(resolve => setTimeout(resolve, remainingTime));
    }

    // Edit the original message with ping results
    await sock.sendMessage(m.key.remoteJid, {
      text: `
╭━━🌕 *WOLFBOT PONG!* 🌕━━╮
┃  ⚡ *Latency:* ${latency}ms
┃  ${statusEmoji} *Status:* ${statusText}
┃  🐾 *Mode:* ${mood}
╰━━━━━━━━━━━━━━━━━━━━╯
_🐺 The Moon Watches — ..._
`,
      edit: loadingMessage.key
    }, { quoted: m });
  }
};