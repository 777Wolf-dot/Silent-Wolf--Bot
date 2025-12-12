// File: ./commands/owner/fixowner.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'fixowner',
    alias: ['forceowner', 'claimthischat'],
    category: 'owner',
    description: 'Force claim ownership in this chat using owner.json',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        const { jidManager } = extra;
        
        const cleaned = jidManager.cleanJid(senderJid);
        
        // Read owner.json to get owner number
        if (!existsSync('./owner.json')) {
            return sock.sendMessage(chatId, {
                text: '❌ owner.json not found! Bot needs to reconnect.'
            }, { quoted: msg });
        }
        
        let ownerData = {};
        try {
            ownerData = JSON.parse(readFileSync('./owner.json', 'utf8'));
        } catch (error) {
            return sock.sendMessage(chatId, {
                text: `❌ Error reading owner.json: ${error.message}`
            }, { quoted: msg });
        }
        
        // Get owner number from owner.json
        const ownerNumber = ownerData.OWNER_NUMBER;
        const ownerCleanNumber = ownerData.OWNER_CLEAN_NUMBER;
        
        if (!ownerNumber && !ownerCleanNumber) {
            return sock.sendMessage(chatId, {
                text: '❌ Owner number not found in owner.json'
            }, { quoted: msg });
        }
        
        // Use whichever owner number is available
        const targetOwnerNumber = ownerCleanNumber || ownerNumber.split(':')[0];
        
        // Check if number matches owner
        if (!cleaned.cleanNumber || !targetOwnerNumber) {
            return sock.sendMessage(chatId, {
                text: '❌ Cannot extract numbers for comparison'
            }, { quoted: msg });
        }
        
        // Simple number comparison
        const senderNum = cleaned.cleanNumber;
        const ownerNum = targetOwnerNumber.replace(/\D/g, '');
        
        // Check if numbers match (various methods)
        const exactMatch = senderNum === ownerNum;
        const endsWithMatch = senderNum.endsWith(ownerNum) || ownerNum.endsWith(senderNum);
        const containsMatch = senderNum.includes(ownerNum) || ownerNum.includes(senderNum);
        
        let last6Match = false;
        if (senderNum.length >= 6 && ownerNum.length >= 6) {
            const senderLast6 = senderNum.slice(-6);
            const ownerLast6 = ownerNum.slice(-6);
            last6Match = senderLast6 === ownerLast6;
        }
        
        if (!exactMatch && !endsWithMatch && !containsMatch && !last6Match) {
            return sock.sendMessage(chatId, {
                text: `❌ Number mismatch!\n\nYour number: ${senderNum}\nOwner number: ${ownerNum}\n\nYou cannot claim ownership.`
            }, { quoted: msg });
        }
        
        // Add to owner lists
        if (cleaned.isLid) {
            jidManager.addOwnerLid(senderJid);
        } else {
            jidManager.addOwnerJid(senderJid);
        }
        
        jidManager.addToWhitelist(senderJid);
        
        // Also update owner.json with this new JID
        ownerData.verifiedLIDs = ownerData.verifiedLIDs || [];
        if (cleaned.isLid && !ownerData.verifiedLIDs.includes(senderJid)) {
            ownerData.verifiedLIDs.push(senderJid);
        }
        
        ownerData.ownerJIDs = ownerData.ownerJIDs || [];
        if (!ownerData.ownerJIDs.includes(senderJid)) {
            ownerData.ownerJIDs.push(senderJid);
        }
        
        ownerData.updatedAt = new Date().toISOString();
        
        try {
            writeFileSync('./owner.json', JSON.stringify(ownerData, null, 2));
        } catch (error) {
            // Continue anyway
        }
        
        await sock.sendMessage(chatId, {
            text: `✅ *OWNERSHIP CLAIMED FOR THIS CHAT*\n\n` +
                  `🔗 Chat JID: ${chatId}\n` +
                  `📱 Your JID: ${senderJid}\n` +
                  `🔢 Your Number: ${senderNum}\n` +
                  `👑 Owner Number: ${ownerNum}\n` +
                  `🔧 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n\n` +
                  `✅ Match Type: ${exactMatch ? 'Exact' : endsWithMatch ? 'Ends With' : containsMatch ? 'Contains' : 'Last 6 digits'}\n\n` +
                  `You are now recognized as owner in this chat!\n\n` +
                  `Try using ${PREFIX}mode again.`
        }, { quoted: msg });
    }
};