export default {
  name: 'link',
  description: 'Get the group invite link',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { text: '❌ This command is only for groups.' }, { quoted: msg });
      return;
    }

    const user = msg.key.participant || msg.participant || msg.key.remoteJid;
    const groupAdmins = metadata.participants.filter(p => p.admin);
    const isAdmin = groupAdmins.some(p => p.id === user);

    if (!isAdmin) {
      await sock.sendMessage(sender, { text: '⛔ Only group admins can use this command.' }, { quoted: msg });
      return;
    }

    try {
      const code = await sock.groupInviteCode(sender);
      const inviteLink = `https://chat.whatsapp.com/${code}`;

      await sock.sendMessage(sender, {
        text: `🐺 *Silent Wolf Group Invite Link*\n\n🔗 ${inviteLink}`,
      }, { quoted: msg });
    } catch (err) {
      console.error('Group Link Error:', err);
      await sock.sendMessage(sender, { text: '❌ Could not fetch the group link.' }, { quoted: msg });
    }
  }
};
