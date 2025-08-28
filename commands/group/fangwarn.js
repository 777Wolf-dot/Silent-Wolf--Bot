const warnings = new Map();

// Replace with your WhatsApp number including @s.whatsapp.net
const BOT_OWNER = 'yournumber@s.whatsapp.net';

export default {
  name: 'warn',
  execute: async (sock, msg, args, metadata) => {
    const jid = msg.key.remoteJid;
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

    if (!mentions.length) {
      return sock.sendMessage(jid, { text: '⚠️ Mention a user to warn!' }, { quoted: msg });
    }

    const user = mentions[0];

    // Check if user is the bot owner
    if (user === BOT_OWNER) {
      return sock.sendMessage(jid, { text: '❌ Cannot warn the bot owner!' }, { quoted: msg });
    }

    // Check if user is an admin
    const participant = metadata.participants.find(p => p.id === user);
    if (participant?.admin) {
      return sock.sendMessage(jid, { text: '❌ Cannot warn a group admin!' }, { quoted: msg });
    }

    const current = warnings.get(user) || 0;
    const updated = current + 1;
    warnings.set(user, updated);

    let text = `⚠️ <@${user.split('@')[0]}> has been warned. (${updated}/3)`;

    if (updated >= 3) {
      try {
        await sock.groupParticipantsUpdate(jid, [user], 'remove');
        text = `❌ <@${user.split('@')[0]}> was banned after 3 warnings!`;
        warnings.delete(user);
      } catch (err) {
        text = `❌ Tried to ban <@${user.split('@')[0]}>, but failed.`;
        console.error('Warn auto-ban error:', err);
      }
    }

    await sock.sendMessage(jid, {
      text,
      mentions: [user]
    }, { quoted: msg });
  }
};
