import { delay } from '@whiskeysockets/baileys';

export default {
  name: 'unblock',
  description: 'Unblock a user (tag in group or provide number in DM)',
  category: 'owner',
  async execute(sock, msg, args) {
    const { key, message } = msg;
    const isGroup = key.remoteJid.endsWith('@g.us');
    let target;

    if (isGroup) {
      const mentioned = message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || mentioned.length === 0) {
        return await sock.sendMessage(key.remoteJid, {
          text: '🕊️⚠️ *Mention the user you want to release from the snare.*',
        }, { quoted: msg });
      }
      target = mentioned[0];
    } else {
      // In DM: use number if given
      if (!args[0]) {
        return await sock.sendMessage(key.remoteJid, {
          text: '🕊️⚠️ *Provide the number of the user to release.*\nExample: .wolfrelease 254712345678',
        }, { quoted: msg });
      }
      let number = args[0].replace(/[^0-9]/g, ''); // remove spaces/symbols
      if (number.length < 8) {
        return await sock.sendMessage(key.remoteJid, {
          text: '⚠️ Invalid number. Try again like:\n`.wolfrelease 2547xxxxxxx`',
        }, { quoted: msg });
      }
      target = `${number}@s.whatsapp.net`;
    }

    try {
      await sock.updateBlockStatus(target, 'unblock');
      await delay(1000);
      await sock.sendMessage(key.remoteJid, {
        text: `🌕 The Wolf has released ${target}.\n✅ *Unblocked successfully.*`,
      }, { quoted: msg });
    } catch (err) {
      console.error('Error unblocking user:', err);
      await sock.sendMessage(key.remoteJid, {
        text: '⚠️ The Wolf couldn’t release the target. Chains still bound...',
      }, { quoted: msg });
    }
  },
};
