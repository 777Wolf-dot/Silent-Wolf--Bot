// commands/group/setwarn.js

const groupWarnLimits = new Map();
const warnings = new Map(); // Keep this separate from warn.js or import it

export default {
  name: 'setwarn',
  description: 'Set custom warning limit for the group (admin only)',
  category: 'group',
  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    
    // Check if it's a group
    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { 
        text: '❌ This command only works in groups.' 
      }, { quoted: msg });
    }
    
    // Check if sender is admin
    try {
      const groupMetadata = await sock.groupMetadata(jid);
      const senderParticipant = groupMetadata.participants.find(p => p.id === sender);
      const isAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
      
      if (!isAdmin) {
        return sock.sendMessage(jid, { 
          text: '🛑 Only admins can set warning limits.' 
        }, { quoted: msg });
      }
    } catch (error) {
      console.error('Error checking admin:', error);
      return sock.sendMessage(jid, { 
        text: '❌ Failed to verify permissions.' 
      }, { quoted: msg });
    }
    
    // Check if a limit was provided
    if (args.length === 0) {
      const currentLimit = groupWarnLimits.get(jid) || 3;
      return sock.sendMessage(jid, { 
        text: `📊 Current warning limit: ${currentLimit}\n\nUsage: .setwarn <number>\nExample: .setwarn 5 (sets limit to 5 warnings)` 
      }, { quoted: msg });
    }
    
    // Parse the limit
    const limit = parseInt(args[0]);
    
    if (isNaN(limit) || limit < 1 || limit > 10) {
      return sock.sendMessage(jid, { 
        text: '⚠️ Please enter a valid number between 1 and 10.' 
      }, { quoted: msg });
    }
    
    // Save the limit for this group
    groupWarnLimits.set(jid, limit);
    
    // Clear existing warnings if limit is changed (optional)
    // This clears all warnings when limit changes
    // Remove this if you want to keep existing warnings
    for (const [key] of warnings) {
      if (key.startsWith(jid)) {
        warnings.delete(key);
      }
    }
    
    await sock.sendMessage(jid, { 
      text: `✅ Warning limit set to ${limit}.\nUsers will be banned after ${limit} warning(s).` 
    }, { quoted: msg });
  }
};