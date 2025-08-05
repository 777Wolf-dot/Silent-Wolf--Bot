export default {
  name: 'deninfo',
  description: 'Shows detailed group information',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
      return;
    }

    try {
      const groupInfo = metadata;

      const groupName = groupInfo.subject || 'N/A';
      const groupDesc = groupInfo.desc || 'No Description';
      const groupOwner = groupInfo.owner || 'Unknown';
      const memberCount = groupInfo.participants.length;

      const admins = groupInfo.participants.filter(p => p.admin).map(a => a.id.split('@')[0]);
      const adminList = admins.length ? admins.map(id => `• @${id}`).join('\n') : 'None';

      const infoText = `🐺 *Group Info*\n\n` +
        `📛 *Name:* ${groupName}\n` +
        `👤 *Owner:* @${groupOwner.split('@')[0]}\n` +
        `👥 *Members:* ${memberCount}\n` +
        `📜 *Description:* ${groupDesc}\n\n` +
        `🛡 *Admins:*\n${adminList}`;

      await sock.sendMessage(sender, {
        text: infoText,
        mentions: [groupOwner, ...admins.map(id => `${id}@s.whatsapp.net`)]
      }, { quoted: msg });

    } catch (err) {
      console.error('GroupInfo Error:', err);
      await sock.sendMessage(sender, { text: '❌ Failed to fetch group info.' }, { quoted: msg });
    }
  }
};
