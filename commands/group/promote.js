export default {
  name: 'promote',
  description: 'Promote a member to admin',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');
    const isAdmin = metadata?.participants?.find(p => p.id === msg.key.participant)?.admin;

    if (!isGroup) {
      await sock.sendMessage(sender, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
      return;
    }

    if (!isAdmin) {
      await sock.sendMessage(sender, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
      return;
    }

    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

    if (!mentionedJid) {
      await sock.sendMessage(sender, { text: '⚠️ Please mention the member you want to promote.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(sender, [mentionedJid], 'promote');
      await sock.sendMessage(sender, { text: `🆙 @${mentionedJid.split('@')[0]} has been promoted to *An Alpha*!`, mentions: [mentionedJid] }, { quoted: msg });
    } catch (error) {
      console.error('Promote Error:', error);
      await sock.sendMessage(sender, { text: '❌ Failed to promote member. Try again later.' }, { quoted: msg });
    }
  }
};
