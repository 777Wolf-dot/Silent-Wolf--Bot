// commands/group/hidetag.js

import baileys from '@whiskeysockets/baileys';
const { proto } = baileys;

export default {
  name: 'hidetag',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const text = args.join(' ') || '🔔';

    try {
      const metadata = await sock.groupMetadata(jid);
      const members = metadata.participants.map(p => p.id);

      await sock.sendMessage(jid, {
        text,
        mentions: members
      }, { quoted: msg });

    } catch (err) {
      console.error('❌ hidetag error:', err);
      await sock.sendMessage(jid, { text: '❌ Failed to send hidden tag message.' }, { quoted: msg });
    }
  }
};
