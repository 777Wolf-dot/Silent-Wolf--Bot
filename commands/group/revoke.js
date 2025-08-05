export default {
  name: 'revoke',
  description: 'Reset group invite link',
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
      await sock.sendMessage(sender, { text: '⛔ Only pack leaders (admins) can use this command.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupRevokeInvite(sender);
      await sock.sendMessage(sender, {
        text: '🔁 *Group invite link has been revoked!*\n🛡️ A new link will be generated if requested.',
      }, { quoted: msg });
    } catch (err) {
      console.error(err);
      await sock.sendMessage(sender, {
        text: '❌ Failed to revoke the invite link. The wolf stumbled...',
      }, { quoted: msg });
    }
  }
};
