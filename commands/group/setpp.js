// commands/group/setpp.js
import { downloadMediaMessage, jidDecode } from '@whiskeysockets/baileys';
import fs from 'fs';

export default {
  name: 'setpp',
  description: 'Set group or bot profile picture',
  category: 'group',
  async execute(sock, m, args) {
    if (!m.quoted || !/image/.test(m.quoted.mimetype)) {
      return sock.sendMessage(m.chat, { text: '❌ Reply to an image to set as profile picture.' }, { quoted: m });
    }

    const media = await downloadMediaMessage(m.quoted, 'buffer', {}, { reuploadRequest: sock });

    try {
      const isGroup = m.chat.endsWith('@g.us');

      if (isGroup) {
        await sock.groupUpdateProfilePicture(m.chat, media);
        await sock.sendMessage(m.chat, { text: '✅ Group profile picture updated!' }, { quoted: m });
      } else {
        await sock.updateProfilePicture(m.chat, media);
        await sock.sendMessage(m.chat, { text: '✅ Bot profile picture updated!' }, { quoted: m });
      }
    } catch (err) {
      console.error('Failed to update profile picture:', err);
      await sock.sendMessage(m.chat, { text: '❌ Failed to update profile picture.' }, { quoted: m });
    }
  }
};
