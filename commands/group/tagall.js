export default {
  name: 'tagall',
  description: 'Mention all group members',
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
      await sock.sendMessage(sender, { text: '⛔ Only group admins can use this command.' }, { quoted: msg });
      return;
    }

    const mentions = metadata.participants.map(p => p.id);
    const tagText = `🐺 *Silent Wolf Howl* 🐺\n\n📢 Calling all pack members:\n\n` + mentions.map(m => `🧍 @${m.split('@')[0]}`).join('\n');

    await sock.sendMessage(sender, {
      text: tagText,
      mentions,
    }, { quoted: msg });
  }
};
