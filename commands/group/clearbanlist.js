import fs from 'fs';

const bannedPath = './banned.json';

export default {
  name: 'clearbanlist',
  description: 'Clear all banned users in this group',
  category: 'group',
  async execute(sock, m) {
    const groupId = m.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');

    if (!isGroup) return sock.sendMessage(groupId, { text: '❌ This command only works in groups.' });

    // Load existing data
    let bannedData = {};
    if (fs.existsSync(bannedPath)) {
      bannedData = JSON.parse(fs.readFileSync(bannedPath));
    }

    if (!bannedData[groupId] || bannedData[groupId].length === 0) {
      return sock.sendMessage(groupId, { text: '✅ The ban list is already empty for this group.' });
    }

    // Clear the list
    delete bannedData[groupId];
    fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2));

    await sock.sendMessage(groupId, { text: '🧹 All banned users have been cleared from this group.' });
  },
};
