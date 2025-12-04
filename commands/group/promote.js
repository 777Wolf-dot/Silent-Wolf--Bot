// export default {
//   name: 'promote',
//   description: 'Promote a member to admin',
//   category: 'group',
//   async execute(sock, msg, args, metadata) {
//     const sender = msg.key.remoteJid;
//     const isGroup = sender.endsWith('@g.us');
//     const isAdmin = metadata?.participants?.find(p => p.id === msg.key.participant)?.admin;

//     if (!isGroup) {
//       await sock.sendMessage(sender, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
//       return;
//     }

//     if (!isAdmin) {
//       await sock.sendMessage(sender, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
//       return;
//     }

//     const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];

//     if (!mentionedJid) {
//       await sock.sendMessage(sender, { text: '⚠️ Please mention the member you want to promote.' }, { quoted: msg });
//       return;
//     }

//     try {
//       await sock.groupParticipantsUpdate(sender, [mentionedJid], 'promote');
//       await sock.sendMessage(sender, { text: `🆙 @${mentionedJid.split('@')[0]} has been promoted to *An Alpha*!`, mentions: [mentionedJid] }, { quoted: msg });
//     } catch (error) {
//       console.error('Promote Error:', error);
//       await sock.sendMessage(sender, { text: '❌ Failed to promote member. Try again later.' }, { quoted: msg });
//     }
//   }
// };





























export default {
  name: 'promote',
  description: 'Promote a member to admin',
  category: 'group',
  async execute(sock, msg, args, metadata) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    
    // Check if it's a group
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, { text: '❌ This command only works in groups.' }, { quoted: msg });
      return;
    }

    // Get fresh group metadata to ensure accurate admin status
    let groupMetadata;
    try {
      groupMetadata = await sock.groupMetadata(jid);
    } catch (error) {
      console.error('Error fetching group metadata:', error);
      await sock.sendMessage(jid, { text: '❌ Failed to fetch group information.' }, { quoted: msg });
      return;
    }

    // Check if sender is admin
    const senderParticipant = groupMetadata.participants.find(p => p.id === sender);
    const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';

    if (!isAdmin) {
      await sock.sendMessage(jid, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
      return;
    }

    // Get target user
    let targetUser;
    
    // Method 1: Check mentions
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
    if (mentions && mentions.length > 0) {
      targetUser = mentions[0];
    }
    // Method 2: Check reply
    else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
      targetUser = msg.message.extendedTextMessage.contextInfo.participant;
    }
    // Method 3: Check args (phone number)
    else if (args.length > 0) {
      const possibleNumber = args[0].replace(/[^0-9]/g, '');
      if (possibleNumber.length > 8) {
        targetUser = possibleNumber + '@s.whatsapp.net';
      }
    }

    if (!targetUser) {
      await sock.sendMessage(jid, { 
        text: '⚠️ Please mention or reply to the member you want to promote.\nExample: .promote @user' 
      }, { quoted: msg });
      return;
    }

    // Check if target is already admin
    const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
    if (targetParticipant?.admin) {
      await sock.sendMessage(jid, { 
        text: `⚠️ @${targetUser.split('@')[0]} is already an admin!`, 
        mentions: [targetUser] 
      }, { quoted: msg });
      return;
    }

    try {
      // Promote the user
      await sock.groupParticipantsUpdate(jid, [targetUser], 'promote');
      
      // Send success message
      await sock.sendMessage(jid, { 
        text: `🆙 @${targetUser.split('@')[0]} has been promoted to *Alpha* rank! 🐺`, 
        mentions: [targetUser] 
      }, { quoted: msg });
      
      // Optional: Send DM to the promoted user
      try {
        await sock.sendMessage(targetUser, {
          text: `🎉 Congratulations! You've been promoted to admin in the group!\n\nLead with wisdom, Alpha! 🐺`
        });
      } catch (dmError) {
        console.log('Could not send promotion DM');
      }
      
    } catch (error) {
      console.error('Promote Error:', error);
      
      let errorMsg = '❌ Failed to promote member. ';
      if (error.message.includes('not authorized')) {
        errorMsg += 'I need admin permissions to promote members.';
      } else if (error.message.includes('not in group')) {
        errorMsg += 'The user is not in this group.';
      } else {
        errorMsg += 'Try again later.';
      }
      
      await sock.sendMessage(jid, { text: errorMsg }, { quoted: msg });
    }
  }
};