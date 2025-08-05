import fs from 'fs';

const bannedPath = './banned.json';

export default {
  name: 'ban',
  description: 'Ban and remove user from group',
  category: 'group',
  async execute(sock, m, args) {
    const groupId = m.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');

    if (!isGroup) return sock.sendMessage(groupId, { text: 'This command only works in groups.' });

    const metadata = await sock.groupMetadata(groupId);
    const sender = m.key.participant || m.key.remoteJid;

    const quoted = m.message?.extendedTextMessage?.contextInfo?.participant;
    const mention = m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
    const target = mention || quoted;

    if (!target) {
      return sock.sendMessage(groupId, { text: 'Tag or reply to the user you want to ban.' });
    }

    if (target === sender) {
      return sock.sendMessage(groupId, { text: 'You cannot ban yourself.' });
    }

    // Load or init banned data
    let bannedData = {};
    if (fs.existsSync(bannedPath)) {
      bannedData = JSON.parse(fs.readFileSync(bannedPath));
    }

    if (!bannedData[groupId]) {
      bannedData[groupId] = [];
    }

    if (!bannedData[groupId].includes(target)) {
      bannedData[groupId].push(target);
      fs.writeFileSync(bannedPath, JSON.stringify(bannedData, null, 2));
    }

    // Kick the user immediately
    await sock.groupParticipantsUpdate(groupId, [target], 'remove');
    await sock.sendMessage(groupId, {
      text: `🚫 @${target.split('@')[0]} has been *banned* and removed.`,
      mentions: [target],
    });
  },
};
