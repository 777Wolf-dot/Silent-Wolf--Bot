// export default {
//   name: 'unmute',
//   description: 'Unmute the group and allow all members to send messages',
//   category: 'group',
//   async execute(sock, msg, args, metadata) {
//     const sender = msg.key.remoteJid;
//     const isGroup = sender.endsWith('@g.us');

//     if (!isGroup) {
//       await sock.sendMessage(sender, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
//       return;
//     }

//     const user = msg.key.participant || msg.participant || msg.key.remoteJid;
//     const groupAdmins = metadata.participants.filter(p => p.admin);
//     const isAdmin = groupAdmins.some(p => p.id === user);

//     if (!isAdmin) {
//       await sock.sendMessage(sender, { text: '⛔ Only group admins can unmute the group.' }, { quoted: msg });
//       return;
//     }

//     try {
//       await sock.groupSettingUpdate(sender, 'not_announcement'); // 'not_announcement' = all members can send messages
//       await sock.sendMessage(sender, { text: '🔊 *Group has been unmuted. Everyone can now send messages.*' }, { quoted: msg });
//     } catch (err) {
//       console.error('Unmute Error:', err);
//       await sock.sendMessage(sender, { text: '❌ Failed to unmute the group.' }, { quoted: msg });
//     }
//   }
// };









// unmute.js
export default {
  name: 'unmute',
  description: 'Unmute the group (allow everyone to speak)',
  category: 'group',
  alias: ['unlock', 'speak'],
  async execute(sock, msg, args) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { 
        text: '❌ This command can only be used within a pack (group).' 
      }, { quoted: msg });
      return;
    }

    try {
      // Get group metadata
      const groupMetadata = await sock.groupMetadata(sender);
      
      // Get the user who sent the message
      const user = msg.key.participant || msg.key.remoteJid;
      
      // Check if user is an admin
      const participant = groupMetadata.participants.find(p => p.id === user);
      const isAdmin = participant && (participant.admin === 'admin' || participant.admin === 'superadmin');

      if (!isAdmin) {
        await sock.sendMessage(sender, { 
          text: '⛔ Only the Alpha wolves (admins) can unleash the pack.' 
        }, { quoted: msg });
        return;
      }

      // Check if already unmuted
      const currentSetting = groupMetadata.announce;
      if (!currentSetting) {
        await sock.sendMessage(sender, { 
          text: '🔊 *The pack can already speak freely.*\nAll wolves may roar.'
        }, { quoted: msg });
        return;
      }

      // Unmute the group (set to not_announcement)
      await sock.groupSettingUpdate(sender, 'not_announcement');
      
      await sock.sendMessage(sender, {
        text: '🔊 *The pack has been unleashed!*\n\n' +
              'All wolves may now speak freely.\n' +
              'To silence again, use: *.mute*'
      }, { quoted: msg });

    } catch (error) {
      console.error('Unmute command error:', error);
      
      let errorMessage = '⚠️ Failed to unmute the pack. ';
      if (error.message?.includes('not authorized')) {
        errorMessage += 'Bot needs admin permissions.';
      } else {
        errorMessage += 'Try again later.';
      }
      
      await sock.sendMessage(sender, { text: errorMessage }, { quoted: msg });
    }
  }
};