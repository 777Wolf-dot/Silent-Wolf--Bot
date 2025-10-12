export default {
  name: 'demote',
  description: 'Demote a group admin to member',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const groupJid = msg.key.remoteJid;

    // Check if it's a group
    if (!groupJid.endsWith('@g.us')) {
      await sock.sendMessage(groupJid, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
      return;
    }

    // Identify sender's JID
    const senderJid = msg.key.participant || msg.participant || msg.key.remoteJid;

    // Get participant info from metadata
    const senderInfo = metadata?.participants?.find(p => p.id === senderJid);

    const isAdmin = senderInfo && ['admin', 'superadmin'].includes(senderInfo.admin);

    if (!isAdmin) {
      await sock.sendMessage(groupJid, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
      return;
    }

    // Get mentioned user
    const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    if (!mentionedJid) {
      await sock.sendMessage(groupJid, { text: '⚠️ Please mention the admin you want to demote.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(groupJid, [mentionedJid], 'demote');
      await sock.sendMessage(
        groupJid,
        { text: `⬇️ @${mentionedJid.split('@')[0]} has been demoted from *admin*!`, mentions: [mentionedJid] },
        { quoted: msg }
      );
    } catch (error) {
      console.error('Demote Error:', error);
      await sock.sendMessage(groupJid, { text: '❌ Failed to demote member. Try again later.' }, { quoted: msg });
    }
  }
};
