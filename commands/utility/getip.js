// commands/utility/getip.js
import fetch from 'node-fetch';

export default {
  name: 'getip',
  alias: ['myip'],
  description: '🌐 Get the public IP of the bot/server',
  category: 'utility',
  usage: '.getip',

  async execute(sock, m, args, from, isGroup, sender) {
    const jid = typeof from === 'string' ? from : m.key.remoteJid;

    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();

      const ipText = `🌐 Bot Public IP: ${data.ip}`;
      await sock.sendMessage(jid, { text: ipText }, { quoted: m });

    } catch (error) {
      console.error('[GetIP Error]', error);
      await sock.sendMessage(jid, { text: '❌ Failed to fetch public IP. Please try again later.' }, { quoted: m });
    }
  },
};
