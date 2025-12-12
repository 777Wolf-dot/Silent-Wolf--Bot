// export default {
//   name: 'groupinfo',
//   description: 'Shows detailed group information',
//   category: 'group',
//   async execute(sock, msg, args, metadata) {
//     const sender = msg.key.remoteJid;
//     const isGroup = sender.endsWith('@g.us');

//     if (!isGroup) {
//       await sock.sendMessage(sender, { 
//         text: '❌ This command can only be used in groups.' 
//       }, { quoted: msg });
//       return;
//     }

//     try {
//       // Ensure metadata has group data; if not, fetch it
//       let groupInfo = metadata;
      
//       // If metadata doesn't contain expected group info, fetch it directly
//       if (!groupInfo || !groupInfo.id) {
//         groupInfo = await sock.groupMetadata(sender);
//       }

//       const groupName = groupInfo.subject || 'N/A';
//       const groupDesc = groupInfo.desc || 'No Description';
//       const groupOwner = groupInfo.owner || groupInfo.participants?.find(p => p.admin === 'superadmin')?.id || 'Unknown';
//       const memberCount = groupInfo.participants?.length || 0;

//       // Extract admins and filter properly
//       const admins = (groupInfo.participants || [])
//         .filter(p => p.admin && p.admin !== 'member')
//         .map(p => p.id.split('@')[0]);
      
//       const adminList = admins.length ? admins.map(id => `• @${id}`).join('\n') : 'None';

//       // Format owner for mention
//       const ownerFormatted = typeof groupOwner === 'string' ? 
//         groupOwner.split('@')[0] : 
//         (groupOwner.id || groupOwner).split('@')[0];

//       // Prepare mentions array
//       const mentions = [groupOwner];
      
//       // Add admins to mentions if they're not the owner
//       const adminMentions = admins
//         .filter(id => id !== ownerFormatted)
//         .map(id => `${id}@s.whatsapp.net`);
      
//       if (adminMentions.length > 0) {
//         mentions.push(...adminMentions);
//       }

//       const infoText = `🐺 *Group Info*\n\n` +
//         `📛 *Name:* ${groupName}\n` +
//         `👤 *Owner:* @${ownerFormatted}\n` +
//         `👥 *Members:* ${memberCount}\n` +
//         `📜 *Description:* ${groupDesc}\n\n` +
//         `🛡 *Admins:*\n${adminList}`;

//       await sock.sendMessage(sender, {
//         text: infoText,
//         mentions: mentions
//       }, { quoted: msg });

//     } catch (err) {
//       console.error('GroupInfo Error:', err);
//       await sock.sendMessage(sender, { 
//         text: '❌ Failed to fetch group info. Please try again.' 
//       }, { quoted: msg });
//     }
//   }
// };













export default {
  name: 'groupinfo',
  description: 'Shows detailed group information',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const isGroup = sender.endsWith('@g.us');

    if (!isGroup) {
      await sock.sendMessage(sender, { 
        text: '❌ This command can only be used in groups.' 
      }, { quoted: msg });
      return;
    }

    try {
      // Ensure metadata has group data; if not, fetch it
      let groupInfo = metadata;
      
      // If metadata doesn't contain expected group info, fetch it directly
      if (!groupInfo || !groupInfo.id) {
        groupInfo = await sock.groupMetadata(sender);
      }

      const groupName = groupInfo.subject || 'N/A';
      const groupDesc = groupInfo.desc || 'No Description';
      const groupOwner = groupInfo.owner || groupInfo.participants?.find(p => p.admin === 'superadmin')?.id || 'Unknown';
      const memberCount = groupInfo.participants?.length || 0;
      
      // Get group creation date
      const creationTimestamp = groupInfo.creation || groupInfo.createdAt || null;
      let creationDate = 'Unknown';
      
      if (creationTimestamp) {
        const date = new Date(creationTimestamp * 1000); // Convert from seconds to milliseconds
        creationDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }

      // Format owner for mention
      const ownerFormatted = typeof groupOwner === 'string' ? 
        groupOwner.split('@')[0] : 
        (groupOwner.id || groupOwner).split('@')[0];

      // Prepare mentions (only owner)
      const mentions = [groupOwner];

      const infoText = `🐺 *Group Info*\n\n` +
        `📛 *Name:* ${groupName}\n` +
        `👤 *Owner:* @${ownerFormatted}\n` +
        `👥 *Members:* ${memberCount}\n` +
        `📜 *Description:* ${groupDesc}\n` +
        `📅 *Created:* ${creationDate}`;

      await sock.sendMessage(sender, {
        text: infoText,
        mentions: mentions
      }, { quoted: msg });

    } catch (err) {
      console.error('GroupInfo Error:', err);
      await sock.sendMessage(sender, { 
        text: '❌ Failed to fetch group info. Please try again.' 
      }, { quoted: msg });
    }
  }
};