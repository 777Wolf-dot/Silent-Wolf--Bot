// commands/group/resetwarn.js
export default {
  name: 'resetwarn',
  description: 'Reset warnings for a user (admin only)',
  category: 'group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { 
        text: '❌ Groups only.' 
      }, { quoted: msg });
    }
    
    // Check admin
    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const senderParticipant = groupMetadata.participants.find(p => p.id === sender);
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
      
      if (!isAdmin) {
        return sock.sendMessage(jid, { 
          text: '🛑 Admin only.' 
        }, { quoted: msg });
      }
    } catch (error) {
      console.error('Error checking admin:', error);
    }
    
    // Get target user
    const mentions = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    const targetUser = mentions[0];
    
    if (!targetUser) {
      return sock.sendMessage(jid, { 
        text: '⚠️ Mention a user to reset their warnings.' 
      }, { quoted: msg });
    }
    
    const userKey = `${jid}:${targetUser}`;
    const hadWarnings = warnings.has(userKey);
    
    if (hadWarnings) {
      warnings.delete(userKey);
      const userNum = targetUser.split('@')[0];
      await sock.sendMessage(jid, {
        text: `✅ @${userNum}'s warnings have been reset.`,
        mentions: [targetUser]
      }, { quoted: msg });
    } else {
      const userNum = targetUser.split('@')[0];
      await sock.sendMessage(jid, {
        text: `ℹ️ @${userNum} has no warnings to reset.`,
        mentions: [targetUser]
      }, { quoted: msg });
    }
  }
};