export default {
  name: 'unmute',
  description: 'Unmute the group and allow all members to send messages',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
      return;
    }

    const user = msg.key.participant || msg.participant || msg.key.remoteJid;
    const groupAdmins = metadata.participants.filter(p => p.admin);
    const isAdmin = groupAdmins.some(p => p.id === user);

    if (!isAdmin) {
      await sock.sendMessage(sender, { text: '⛔ Only group admins can unmute the group.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupSettingUpdate(sender, 'not_announcement'); // 'not_announcement' = all members can send messages
      await sock.sendMessage(sender, { text: '🔊 *Group has been unmuted. Everyone can now send messages.*' }, { quoted: msg });
    } catch (err) {
      console.error('Unmute Error:', err);
      await sock.sendMessage(sender, { text: '❌ Failed to unmute the group.' }, { quoted: msg });
    }
  }
};
