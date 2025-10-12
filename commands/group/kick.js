export default {
  name: 'kick',
  description: 'Removes mentioned members from the group.',
  execute: async (sock, msg, args, metadata) => {
    const isGroup = msg.key.remoteJid.endsWith('@g.us');
    const participants = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!isGroup) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❌ This command only works in packs.' }, { quoted: msg });
    }

    if (!participants.length) {
      return sock.sendMessage(msg.key.remoteJid, { text: '❗ Mention a user to kick.' }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(msg.key.remoteJid, participants, 'remove');
      await sock.sendMessage(msg.key.remoteJid, { text: '👢 User(s) kicked successfully.' }, { quoted: msg });
    } catch (err) {
      console.error('Kick error:', err);
      await sock.sendMessage(msg.key.remoteJid, { text: '❌ Failed to kick the user(s).' }, { quoted: msg });
    }
  },
};
