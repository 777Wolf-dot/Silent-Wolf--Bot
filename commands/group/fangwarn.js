// // commands/group/warn.js

// const warnings = new Map();

// export default {
//   name: 'warn',
//   execute: async (sock, msg, args, metadata) => {
//     const jid = msg.key.remoteJid;
//     const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];

//     if (!mentions.length) {
//       return sock.sendMessage(jid, { text: '⚠️ Mention a user to warn!' }, { quoted: msg });
//     }

//     const user = mentions[0];
//     const current = warnings.get(user) || 0;
//     const updated = current + 1;
//     warnings.set(user, updated);

//     let text = `⚠️ <@${user.split('@')[0]}> has been warned. (${updated}/3)`;
//     if (updated >= 3) {
//       try {
//         await sock.groupParticipantsUpdate(jid, [user], 'remove');
//         text = `❌ <@${user.split('@')[0]}> was banned after 3 warnings!`;
//         warnings.delete(user);
//       } catch (err) {
//         text = `❌ Tried to ban <@${user.split('@')[0]}>, but failed.`;
//         console.error('Warn auto-ban error:', err);
//       }
//     }

//     await sock.sendMessage(jid, {
//       text,
//       mentions: [user]
//     }, { quoted: msg });
//   }
// };
































// commands/group/warn.js - Simplified version

const warnings = new Map();

export default {
  name: 'warn',
  description: 'Warn a user (reply or mention)',
  category: 'group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    
    // Get target user
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const replyUser = msg.message?.extendedTextMessage?.contextInfo?.participant;
    
    const targetUser = mentions[0] || replyUser;
    
    if (!targetUser) {
      return sock.sendMessage(jid, { 
        text: '⚠️ Reply to a user or mention them!\nExample: .warn @user' 
      }, { quoted: msg });
    }
    
    // Warning logic
    const userKey = `${jid}:${targetUser}`;
    const current = warnings.get(userKey) || 0;
    const updated = current + 1;
    warnings.set(userKey, updated);
    
    const userNum = targetUser.split('@')[0];
    let response = `⚠️ @${userNum} warned. (${updated}/3)`;
    
    if (updated >= 3) {
      try {
        await sock.groupParticipantsUpdate(jid, [targetUser], 'remove');
        response = `❌ @${userNum} banned after 3 warnings!`;
        warnings.delete(userKey);
      } catch (err) {
        response = `❌ Failed to ban @${userNum}`;
      }
    }
    
    await sock.sendMessage(jid, {
      text: response,
      mentions: [targetUser]
    }, { quoted: msg });
  }
};
