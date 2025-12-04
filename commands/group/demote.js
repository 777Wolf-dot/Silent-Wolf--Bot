export default {
  name: 'demote',
  description: 'Demote a group admin to member',
  category: 'group',
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    
    // Check if it's a group
    if (!jid.endsWith('@g.us')) {
      await sock.sendMessage(jid, { text: '❌ This command only works in groups.' }, { quoted: msg });
      return;
    }

    // Get fresh group metadata for accurate admin status
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
        text: '⚠️ Please mention or reply to the admin you want to demote.\nExample: .demote @user' 
      }, { quoted: msg });
      return;
    }

    // Check if target is actually an admin
    const targetParticipant = groupMetadata.participants.find(p => p.id === targetUser);
    if (!targetParticipant) {
      await sock.sendMessage(jid, { 
        text: `⚠️ @${targetUser.split('@')[0]} is not in this group.`, 
        mentions: [targetUser] 
      }, { quoted: msg });
      return;
    }

    if (!targetParticipant.admin) {
      await sock.sendMessage(jid, { 
        text: `⚠️ @${targetUser.split('@')[0]} is not an admin!`, 
        mentions: [targetUser] 
      }, { quoted: msg });
      return;
    }

    // Prevent demoting self (optional)
    if (targetUser === sender) {
      await sock.sendMessage(jid, { 
        text: `🤨 You cannot demote yourself!` 
      }, { quoted: msg });
      return;
    }

    // Prevent demoting the bot
    if (targetUser === sock.user.id) {
      await sock.sendMessage(jid, { 
        text: `⚠️ I cannot demote myself!` 
      }, { quoted: msg });
      return;
    }

    try {
      // Demote the user
      await sock.groupParticipantsUpdate(jid, [targetUser], 'demote');
      
      // Send success message
      await sock.sendMessage(jid, { 
        text: `⬇️ @${targetUser.split('@')[0]} has been demoted from admin position!`, 
        mentions: [targetUser] 
      }, { quoted: msg });
      
      // Optional: Send DM to the demoted user
      try {
        await sock.sendMessage(targetUser, {
          text: `📉 You have been demoted from admin in the group.\n\nYou can still participate as a regular member.`
        });
      } catch (dmError) {
        console.log('Could not send demotion DM');
      }
      
    } catch (error) {
      console.error('Demote Error:', error);
      
      let errorMsg = '❌ Failed to demote member. ';
      if (error.message.includes('not authorized')) {
        errorMsg += 'I need admin permissions to demote members.';
      } else if (error.message.includes('not an admin')) {
        errorMsg += 'The user is not an admin.';
      } else if (error.message.includes('not in group')) {
        errorMsg += 'The user is not in this group.';
      } else {
        errorMsg += 'Try again later.';
      }
      
      await sock.sendMessage(jid, { text: errorMsg }, { quoted: msg });
    }
  }
};