export default {
  name: 'mute',
  description: 'Mute the group (read-only)',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { text: '❌ This command can only be used within a pack (group).' }, { quoted: msg });
      return;
    }

    const user = msg.key.participant || msg.participant || msg.key.remoteJid;
    const groupAdmins = metadata.participants.filter(p => p.admin);
    const isAdmin = groupAdmins.some(p => p.id === user);

    if (!isAdmin) {
      await sock.sendMessage(sender, { text: '⛔ Only the Alpha wolves (admins) can silence the pack.' }, { quoted: msg });
      return;
    }

    try {
      await sock.groupSettingUpdate(sender, 'announcement'); // read-only
      await sock.sendMessage(sender, {
        text: '🔇 *The pack has been silenced.*\nOnly the leaders may now speak.',
      }, { quoted: msg });
    } catch (error) {
      console.error(error);
      await sock.sendMessage(sender, {
        text: '⚠️ Failed to mute the pack. Try again or check permissions.',
      }, { quoted: msg });
    }
  }
};
