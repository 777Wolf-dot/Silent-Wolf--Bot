import { delay } from '@whiskeysockets/baileys';

export default {
  name: 'block',
  description: 'Block a user (tag in group or auto-block in DM)',
  category: 'owner',
  async execute(sock, msg, args) {
    const { key, message, pushName } = msg;
    const isGroup = key.remoteJid.endsWith('@g.us');
    let target;

    if (isGroup) {
      const mentioned = message?.extendedTextMessage?.contextInfo?.mentionedJid;
      if (!mentioned || mentioned.length === 0) {
        return await sock.sendMessage(key.remoteJid, {
          text: '🐺⚠️ *Summon a target!* Tag the user you want me to snare.',
        }, { quoted: msg });
      }
      target = mentioned[0];
    } else {
      target = key.remoteJid; // In DM, block the person messaging the bot
    }

    try {
      await sock.updateBlockStatus(target, 'block');
      await delay(1000);
      await sock.sendMessage(key.remoteJid, {
        text: `🕸️ The Wolf has ensnared ${target}.\n\n❌ *Blocked successfully.*`,
      }, { quoted: msg });
    } catch (err) {
      console.error('Error blocking user:', err);
      await sock.sendMessage(key.remoteJid, {
        text: '⚠️ Failed to snare the target. Wolf lost the scent...',
      }, { quoted: msg });
    }
  },
};
