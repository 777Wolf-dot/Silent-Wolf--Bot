// commands/utility/shorturl.js
import fetch from 'node-fetch';

export default {
  name: 'shorturl',
  alias: ['tinyurl', 'shorten'],
  description: '🔗 Shorten a long URL',
  category: 'utility',
  usage: '.shorturl <long URL>',

  async execute(sock, m, args, from, isGroup, sender) {
    if (!args.length) {
      return sock.sendMessage(
        typeof from === 'string' ? from : m.key.remoteJid,
        { text: '❌ Please provide a URL to shorten.\nExample: `.shorturl https://example.com`' },
        { quoted: m }
      );
    }

    const longUrl = args[0];

    try {
      const response = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
      const shortUrl = await response.text();

      const messageText = `🔗 Shortened URL:\n${shortUrl}`;
      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      await sock.sendMessage(jid, { text: messageText }, { quoted: m });

    } catch (err) {
      console.error('[ShortURL Error]', err);
      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      if (typeof jid === 'string') {
        sock.sendMessage(jid, { text: '❌ Failed to shorten URL. Please try again later.' }, { quoted: m });
      }
    }
  }
};
