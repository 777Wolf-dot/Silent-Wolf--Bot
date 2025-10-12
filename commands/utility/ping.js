export default {
  name: 'ping',
  description: 'Check bot latency',
  category: 'utility',

  async execute(sock, m, args) {
    const start = Date.now();

    // Send initial response
    await sock.sendMessage(m.key.remoteJid, {
      text: '🐺 Pinging the Silent Wolf core...'
    }, { quoted: m });

    const latency = Date.now() - start;

    // Final latency message
    await sock.sendMessage(m.key.remoteJid, {
      text: `⚡ *Silent Wolf Pong!*\n\n📡 *Latency:* ${latency}ms\n🧠 *Status:* Online & Howling!`
    }, { quoted: m });
  }
};
