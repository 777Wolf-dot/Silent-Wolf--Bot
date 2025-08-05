import fs from 'fs';

const bannedPath = './banned.json';

export default {
  name: 'unban',
  description: 'Unban a user from the group',
  category: 'group',
  async execute(sock, m, args) {
    const groupId = m.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');

    if (!isGroup) return sock.sendMessage(groupId, { text: 'This command only works in groups.' });

    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mention || quoted;

    if (!target) {
      return sock.sendMessage(groupId, { text: 'Tag or reply to the user you want to unban.' });
    }

    // Load banned data
    let bannedData = {};
    if (fs.existsSync(bannedPath)) {
      bannedData = JSON.parse(fs.readFileSync(bannedPath));
    }

    if (!bannedData[groupId]) {
      return sock.sendMessage(groupId, { text: 'There are no banned users in this group.' });
    }

    if (!bannedData[groupId].includes(target)) {
      return sock.sendMessage(groupId, { text: 'This user is not banned.' });
    }

    // Remove user from ban list
    bannedData[groupId] = bannedData[groupId].filter(id => id !== target);
    fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2));

    await sock.sendMessage(groupId, {
      text: `✅ @${target.split('@')[0]} has been *unbanned*.`,
      mentions: [target],
    });
  },
};
