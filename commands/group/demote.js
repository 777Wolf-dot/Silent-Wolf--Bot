export default {
  name: 'demote',
  description: 'Demote a group admin to member',
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
      await sock.sendMessage(sender, { text: '⚠️ Please mention the admin you want to demote.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupParticipantsUpdate(sender, [mentionedJid], 'demote');
      await sock.sendMessage(sender, { text: `⬇️ @${mentionedJid.split('@')[0]} has been demoted from *admin*!`, mentions: [mentionedJid] }, { quoted: msg });
    } catch (error) {
      console.error('Demote Error:', error);
      await sock.sendMessage(sender, { text: '❌ Failed to demote member. Try again later.' }, { quoted: msg });
    }
  }
};
