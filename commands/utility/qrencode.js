// commands/utility/qrencode.js
import qrcode from 'qrcode';

export default {
  name: 'qrencode',
  alias: ['qrcode', 'qr'],
  description: '📱 Generate a QR code from text or URL',
  category: 'utility',
  usage: '.qrencode <text or URL>',

  async execute(sock, m, args, from, isGroup, sender) {
    if (!args.length) {
      return sock.sendMessage(
        typeof from === 'string' ? from : m.key.remoteJid,
        { text: '❌ Please provide text or a URL to generate a QR code.\nExample: `.qrencode https://example.com`' },
        { quoted: m }
      );
    }

    const textToEncode = args.join(' ');

    try {
      const qrBuffer = await qrcode.toBuffer(textToEncode, { type: 'png', margin: 2, scale: 5 });

      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      await sock.sendMessage(jid, { image: qrBuffer, caption: '📱 Here is your QR code' }, { quoted: m });

    } catch (err) {
      console.error('[QR Encode Error]', err);
      const jid = typeof from === 'string' ? from : m.key.remoteJid;
      if (typeof jid === 'string') {
        sock.sendMessage(jid, { text: '❌ Failed to generate QR code. Please try again.' }, { quoted: m });
      }
    }
  }
};
