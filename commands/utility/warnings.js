// commands/group/warnings.js
export default {
  name: 'warnings',
  description: 'View warnings for a user or list all warned users',
  category: 'group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { 
        text: '❌ Groups only.' 
      }, { quoted: msg });
    }
    
    // Get target user if mentioned
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentions[0];
    
    if (targetUser) {
      // Show warnings for specific user
      const userKey = `${jid}:${targetUser}`;
      const userWarnings = warnings.get(userKey) || 0;
      const warnLimit = groupWarnLimits.get(jid) || 3;
      
      const userNum = targetUser.split('@')[0];
      return sock.sendMessage(jid, {
        text: `📊 @${userNum} has ${userWarnings}/${warnLimit} warnings`,
        mentions: [targetUser]
      }, { quoted: msg });
    } else {
      // List all warned users in this group
      const groupWarnings = [];
      for (const [key, count] of warnings) {
        if (key.startsWith(jid)) {
          const userId = key.split(':')[1];
          const userNum = userId.split('@')[0];
          groupWarnings.push(`@${userNum}: ${count} warnings`);
        }
      }
      
      const warnLimit = groupWarnLimits.get(jid) || 3;
      let response = `📊 *Group Warnings*\nLimit: ${warnLimit}\n\n`;
      
      if (groupWarnings.length === 0) {
        response += 'No users have warnings yet.';
      } else {
        response += groupWarnings.join('\n');
      }
      
      // Extract user IDs for mentions
      const mentionedUsers = [];
      for (const [key] of warnings) {
        if (key.startsWith(jid)) {
          mentionedUsers.push(key.split(':')[1]);
        }
      }
      
      await sock.sendMessage(jid, {
        text: response,
        mentions: mentionedUsers
      }, { quoted: msg });
    }
  }
};