import fs from 'fs';

const bannedPath = './banned.json';

export default {
  name: 'banlist',
  description: 'Show list of banned users in this group',
  category: 'group',
  async execute(sock, m) {
    const groupId = m.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');

    if (!isGroup) return sock.sendMessage(groupId, { text: '❌ This command only works in groups.' });

    // Load banned data
    let bannedData = {};
    if (fs.existsSync(bannedPath)) {
      bannedData = JSON.parse(fs.readFileSync(bannedPath));
    }

    if (!bannedData[groupId] || bannedData[groupId].length === 0) {
      return sock.sendMessage(groupId, { text: '✅ No one is currently banned in this group.' });
    }

    const mentions = bannedData[groupId];
    const formattedList = mentions
      .map((jid, i) => `➤ ${i + 1}. @${jid.split('@')[0]}`)
      .join('\n');

    const message = `🚫 *Banned Users in This Group:*\n\n${formattedList}`;

    await sock.sendMessage(groupId, {
      text: message,
      mentions,
    });
  },
};
