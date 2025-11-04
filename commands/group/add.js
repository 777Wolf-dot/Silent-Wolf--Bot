export default {
  name: 'add',
  description: 'Add a member to the group',
  category: 'group',

  async execute(sock, msg, args, metadata) {
    const groupId = msg.key.remoteJid;
    const isGroup = groupId.endsWith('@g.us');
    const senderId = msg.key.participant;
    const botNumber = sock.user.id.split(':')[0] + '@s.whatsapp.net';

    if (!isGroup) {
      return await sock.sendMessage(groupId, { text: '❌ This command can only be used in packs(Groups).' }, { quoted: msg });
    }

    const participants = metadata?.participants || [];

    const isUserAdmin = participants.find(p => p.id === senderId)?.admin !== null;
    const isBotAdmin = participants.find(p => p.id === botNumber)?.admin !== null;

    if (!isUserAdmin) {
      return await sock.sendMessage(groupId, { text: '🛑 Only Alphas can use this command.' }, { quoted: msg });
    }

    if (!isBotAdmin) {
      return await sock.sendMessage(groupId, { text: '⚠️ I must be an Alpha (admin) to add members.' }, { quoted: msg });
    }

    if (!args[0]) {
      return await sock.sendMessage(groupId, {
        text: '⚠️ Please provide a phone number to add.\nExample: *.add 2547xxxxxxxx*'
      }, { quoted: msg });
    }

    const number = args[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net';

    try {
      await sock.groupParticipantsUpdate(groupId, [number], 'add');
      await sock.sendMessage(groupId, {
        text: `✅ Member @${args[0]} added successfully!`,
        mentions: [number]
      }, { quoted: msg });
    } catch (error) {
      console.error('Add Error:', error);
      await sock.sendMessage(groupId, {
        text: '❌ Failed to add member. They may have privacy settings enabled or you may have reached the group limit.',
      }, { quoted: msg });
    }
  }
};
