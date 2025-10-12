// ./commands/group/howlinvite.js
export default {
  name: 'invite',
  description: 'Add users to group by their numbers',
  async execute(sock, msg, args, metadata, banned, saveBannedList) {
    const groupId = msg.key.remoteJid;

    if (!groupId.endsWith('@g.us')) {
      return await sock.sendMessage(groupId, {
        text: '🐺 This command can only be used in groups.'
      }, { quoted: msg });
    }

    if (!args.length) {
      return await sock.sendMessage(groupId, {
        text: '🐺 Provide numbers like: `.howlinvite 254712345678 254798765432`'
      }, { quoted: msg });
    }

    const rawNumbers = args.map(n => n.replace(/[^0-9]/g, '')).filter(n => n.length >= 10);

    const validJIDs = [];
    for (const num of rawNumbers) {
      const jid = num + '@s.whatsapp.net';
      const exists = await sock.onWhatsApp(jid);
      if (exists?.[0]?.exists) validJIDs.push(jid);
    }

    if (!validJIDs.length) {
      return await sock.sendMessage(groupId, {
        text: '🚫 No valid contacts found to invite.'
      }, { quoted: msg });
    }

    try {
      await sock.groupParticipantsUpdate(groupId, validJIDs, 'add');
      await sock.sendMessage(groupId, {
        text: `✅ Invited: ${validJIDs.map(j => `@${j.split('@')[0]}`).join(', ')}`,
        mentions: validJIDs
      }, { quoted: msg });
    } catch (error) {
      console.error('❌ Error adding participants:', error);
      await sock.sendMessage(groupId, {
        text: '⚠️ Couldn\'t add some participants. They might restrict group invites.'
      }, { quoted: msg });
    }
  }
};
