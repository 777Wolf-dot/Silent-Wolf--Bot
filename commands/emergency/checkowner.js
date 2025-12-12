// File: ./commands/owner/checkowner.js
import { readFileSync, existsSync } from 'fs';

export default {
    name: 'checkowner',
    alias: ['viewowner', 'ownerfile'],
    category: 'owner',
    description: 'Check owner.json file contents',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        
        if (!existsSync('./owner.json')) {
            return sock.sendMessage(chatId, {
                text: '❌ owner.json file does not exist!\n\nBot needs to reconnect to create this file.'
            }, { quoted: msg });
        }
        
        try {
            const ownerData = JSON.parse(readFileSync('./owner.json', 'utf8'));
            
            let info = `📁 *OWNER.JSON CONTENTS*\n\n`;
            
            // Basic info
            info += `📊 *BASIC INFO:*\n`;
            info += `├─ File exists: ✅ YES\n`;
            info += `├─ Last updated: ${ownerData.updatedAt || 'Unknown'}\n`;
            info += `├─ Version: ${ownerData.version || 'Unknown'}\n`;
            info += `└─ Login method: ${ownerData.loginMethod || 'Unknown'}\n\n`;
            
            // Owner details
            info += `👑 *OWNER DETAILS:*\n`;
            info += `├─ RAW Number: ${ownerData.OWNER_NUMBER || 'Not set'}\n`;
            info += `├─ RAW JID: ${ownerData.OWNER_JID || 'Not set'}\n`;
            info += `├─ Clean Number: ${ownerData.OWNER_CLEAN_NUMBER || 'Not set'}\n`;
            info += `├─ Clean JID: ${ownerData.OWNER_CLEAN_JID || 'Not set'}\n`;
            info += `└─ Owner LID: ${ownerData.OWNER_LID || 'Not set'}\n\n`;
            
            // Phone number used for login
            if (ownerData.phoneNumber) {
                info += `📱 *LOGIN PHONE:* ${ownerData.phoneNumber}\n\n`;
            }
            
            // Verified devices
            if (ownerData.verifiedLIDs && ownerData.verifiedLIDs.length > 0) {
                info += `✅ *VERIFIED LIDs (${ownerData.verifiedLIDs.length}):*\n`;
                ownerData.verifiedLIDs.forEach((lid, index) => {
                    info += `${index + 1}. ${lid}\n`;
                });
                info += `\n`;
            }
            
            // Known JIDs
            if (ownerData.ownerJIDs && ownerData.ownerJIDs.length > 0) {
                info += `🔗 *KNOWN JIDs (${ownerData.ownerJIDs.length}):*\n`;
                ownerData.ownerJIDs.slice(0, 5).forEach((jid, index) => {
                    info += `${index + 1}. ${jid}\n`;
                });
                if (ownerData.ownerJIDs.length > 5) {
                    info += `... and ${ownerData.ownerJIDs.length - 5} more\n`;
                }
                info += `\n`;
            }
            
            // Normalized data (if exists)
            if (ownerData.normalized) {
                info += `🔧 *NORMALIZED DATA:*\n`;
                info += `├─ Clean JID: ${ownerData.normalized.cleanJid || 'N/A'}\n`;
                info += `├─ Clean Number: ${ownerData.normalized.cleanNumber || 'N/A'}\n`;
                info += `└─ Has device suffix: ${ownerData.normalized.hasDeviceSuffix ? 'Yes' : 'No'}\n\n`;
            }
            
            // Recommendations
            info += `💡 *RECOMMENDATIONS:*\n`;
            
            if (!ownerData.OWNER_NUMBER) {
                info += `1. ❌ Owner number missing! Bot needs restart\n`;
            } else if (!ownerData.OWNER_CLEAN_NUMBER) {
                info += `1. ⚠️ Clean number missing, may cause issues\n`;
            } else {
                info += `1. ✅ Owner data looks good\n`;
            }
            
            info += `2. Use ${PREFIX}debugchat to check current chat\n`;
            info += `3. Use ${PREFIX}fixowner if not recognized\n`;
            
            await sock.sendMessage(chatId, {
                text: info
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error reading owner.json: ${error.message}`
            }, { quoted: msg });
        }
    }
};