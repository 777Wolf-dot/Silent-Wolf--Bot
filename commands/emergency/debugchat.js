// File: ./commands/owner/debugchat.js
import { readFileSync, writeFileSync, existsSync } from 'fs';

export default {
    name: 'debugchat',
    alias: ['chatinfo', 'debugjid', 'fixjid'],
    category: 'owner',
    description: 'Debug and fix JID/LID issues with owner.json data',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const participant = msg.key.participant;
        const senderJid = participant || chatId;
        const { jidManager } = extra;
        const isFromMe = msg.key.fromMe;
        
        const cleaned = jidManager.cleanJid(senderJid);
        const isOwner = jidManager.isOwner(msg);
        
        // Check if user wants to auto-fix
        const autoFix = args[0] === 'fix' || args[0] === 'auto';
        
        // Read owner.json directly
        let ownerData = {};
        let ownerFileExists = false;
        let ownerNumber = 'Not found';
        let ownerJid = 'Not found';
        let ownerCleanNumber = 'Not found';
        let ownerCleanJid = 'Not found';
        
        // Special fix for your case: Check if we need to initialize jidManager
        let shouldForceInit = false;
        
        if (existsSync('./owner.json')) {
            try {
                ownerFileExists = true;
                ownerData = JSON.parse(readFileSync('./owner.json', 'utf8'));
                
                // Extract owner information
                ownerNumber = ownerData.OWNER_NUMBER || 'Not set';
                ownerJid = ownerData.OWNER_JID || 'Not set';
                ownerCleanNumber = ownerData.OWNER_CLEAN_NUMBER || 'Not set';
                ownerCleanJid = ownerData.OWNER_CLEAN_JID || 'Not set';
                
                // Fix the JID format (remove :74 if present)
                if (ownerJid.includes(':74')) {
                    ownerJid = ownerJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
                    ownerCleanJid = ownerCleanJid || ownerJid;
                }
                
                if (ownerNumber.includes(':')) {
                    ownerNumber = ownerNumber.split(':')[0];
                    ownerCleanNumber = ownerCleanNumber || ownerNumber;
                }
                
                // Check if jidManager needs initialization
                const ownerInfo = jidManager.getOwnerInfo();
                if (!ownerInfo.cleanNumber) {
                    shouldForceInit = true;
                }
                
            } catch (error) {
                console.log(`❌ Error reading owner.json: ${error.message}`, 'error');
            }
        }
        
        // Initialize jidManager if needed
        let initActions = [];
        if (shouldForceInit || autoFix) {
            try {
                // Method 1: Try to call setOwner
                if (jidManager.setOwner && ownerCleanNumber) {
                    const result = jidManager.setOwner({
                        rawNumber: ownerCleanNumber,
                        rawJid: ownerCleanJid
                    });
                    if (result?.success) {
                        initActions.push('✅ Initialized jidManager owner data');
                    }
                }
                
                // Method 2: Direct property assignment (if possible)
                if (ownerCleanNumber && jidManager.owner) {
                    jidManager.owner = {
                        cleanNumber: ownerCleanNumber,
                        cleanJid: ownerCleanJid,
                        rawJid: ownerJid
                    };
                    initActions.push('✅ Directly set jidManager.owner');
                }
                
                // Method 3: Update global variables
                if (ownerCleanNumber) {
                    global.OWNER_NUMBER = ownerCleanNumber;
                    global.OWNER_CLEAN_NUMBER = ownerCleanNumber;
                    global.OWNER_JID = ownerCleanJid;
                    global.OWNER_CLEAN_JID = ownerCleanJid;
                    initActions.push('✅ Set global owner variables');
                }
                
                // Save updated owner.json
                if (ownerFileExists) {
                    ownerData.OWNER_CLEAN_NUMBER = ownerCleanNumber;
                    ownerData.OWNER_CLEAN_JID = ownerCleanJid;
                    ownerData.lastUpdated = new Date().toISOString();
                    writeFileSync('./owner.json', JSON.stringify(ownerData, null, 2));
                    initActions.push('✅ Updated owner.json');
                }
                
            } catch (error) {
                initActions.push(`❌ Error: ${error.message}`);
            }
        }
        
        let debugInfo = `🔍 *CHAT DEBUG INFORMATION*\n`;
        if (autoFix) debugInfo += `⚡ *AUTO-FIX MODE*\n`;
        debugInfo += `\n`;
        
        // Chat Information
        debugInfo += `📱 *CHAT INFO:*\n`;
        debugInfo += `├─ 💬 Chat: ${chatId}\n`;
        debugInfo += `├─ 📱 Sender: ${senderJid}\n`;
        debugInfo += `├─ 🔧 Cleaned: ${cleaned.cleanJid}\n`;
        debugInfo += `├─ 🔗 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
        debugInfo += `├─ 📍 From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
        debugInfo += `└─ 💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n\n`;
        
        // LID Analysis
        if (cleaned.isLid) {
            debugInfo += `🔗 *LID ANALYSIS:*\n`;
            debugInfo += `├─ LID Number: ${cleaned.cleanNumber}\n`;
            debugInfo += `├─ Length: ${cleaned.cleanNumber.length} digits\n`;
            
            // Check if this LID could be derived from your number
            if (ownerCleanNumber !== 'Not set') {
                const ownerLast9 = ownerCleanNumber.slice(-9);
                const lidLast9 = cleaned.cleanNumber.slice(-9);
                const possibleMatch = lidLast9.includes(ownerLast9) || ownerLast9.includes(lidLast9);
                
                debugInfo += `├─ Owner last 9: ${ownerLast9}\n`;
                debugInfo += `├─ LID last 9: ${lidLast9}\n`;
                debugInfo += `└─ Possible match: ${possibleMatch ? '🔍 Maybe' : '❌ No'}\n`;
            }
            debugInfo += `\n`;
        }
        
        // Owner Information
        debugInfo += `👑 *OWNER INFO:*\n`;
        debugInfo += `├─ 📁 File: ${ownerFileExists ? '✅' : '❌'}\n`;
        debugInfo += `├─ 📞 Number: ${ownerCleanNumber}\n`;
        debugInfo += `├─ 🔗 JID: ${ownerCleanJid}\n`;
        debugInfo += `└─ 🆔 Type: ${ownerCleanJid?.includes('@lid') ? 'LID 🔗' : 'Regular 📱'}\n\n`;
        
        // jidManager Status
        const ownerInfo = jidManager.getOwnerInfo();
        debugInfo += `🔧 *JID MANAGER STATUS:*\n`;
        debugInfo += `├─ Owner set: ${ownerInfo.cleanNumber ? '✅ YES' : '❌ NO'}\n`;
        debugInfo += `├─ Clean Number: ${ownerInfo.cleanNumber || 'Not set'}\n`;
        debugInfo += `└─ Clean JID: ${ownerInfo.cleanJid || 'Not set'}\n\n`;
        
        // Owner Status Analysis
        debugInfo += `✅ *OWNER STATUS ANALYSIS:*\n`;
        debugInfo += `├─ isOwner(): ${isOwner ? '✅ YES' : '❌ NO'}\n`;
        debugInfo += `├─ fromMe: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
        
        // Check why isOwner() returns what it does
        if (isFromMe && isOwner) {
            debugInfo += `└─ 🔍 Reason: Bot sees message as from itself (fromMe=true)\n`;
        } else if (!isFromMe && !isOwner) {
            debugInfo += `└─ 🔍 Reason: Not from bot and not matching owner data\n`;
        } else if (isFromMe && !isOwner) {
            debugInfo += `└─ ⚠️ WARNING: fromMe=true but isOwner=false!\n`;
        }
        debugInfo += `\n`;
        
        // Global Variables Status
        debugInfo += `⚙️ *GLOBAL VARIABLES STATUS:*\n`;
        debugInfo += `├─ OWNER_NUMBER: ${global.OWNER_NUMBER ? '✅ Set' : '❌ Not set'}\n`;
        debugInfo += `├─ OWNER_CLEAN_NUMBER: ${global.OWNER_CLEAN_NUMBER ? '✅ Set' : '❌ Not set'}\n`;
        debugInfo += `├─ OWNER_JID: ${global.OWNER_JID ? '✅ Set' : '❌ Not set'}\n`;
        debugInfo += `└─ OWNER_CLEAN_JID: ${global.OWNER_CLEAN_JID ? '✅ Set' : '❌ Not set'}\n\n`;
        
        // Initialization Results
        if (initActions.length > 0) {
            debugInfo += `🔧 *INITIALIZATION ACTIONS:*\n`;
            initActions.forEach(action => {
                debugInfo += `├─ ${action}\n`;
            });
            debugInfo += `\n`;
        }
        
        // THE FIX: For LID + fromMe messages
        if (cleaned.isLid && isFromMe) {
            debugInfo += `🎯 *SPECIAL LID FIX AVAILABLE:*\n`;
            debugInfo += `This message is from a linked device (LID) and from the bot itself.\n`;
            debugInfo += `This means YOU are controlling the bot from this device.\n\n`;
            
            debugInfo += `💡 *QUICK FIX:* Use this command to grant owner access:\n`;
            debugInfo += `${PREFIX}lidowner\n\n`;
        }
        
        // Recommendations
        debugInfo += `💡 *RECOMMENDATIONS:*\n`;
        
        if (!ownerInfo.cleanNumber) {
            debugInfo += `1. Run ${PREFIX}debugchat fix to initialize jidManager\n`;
        }
        
        if (!global.OWNER_NUMBER) {
            debugInfo += `2. Run ${PREFIX}debugchat fix to set global variables\n`;
        }
        
        if (cleaned.isLid && isFromMe) {
            debugInfo += `3. Use ${PREFIX}lidowner to grant owner access to this LID\n`;
        }
        
        debugInfo += `4. Check if jidManager.isOwner() checks fromMe properly\n`;
        debugInfo += `5. Restart bot after fixes\n`;
        
        await sock.sendMessage(chatId, {
            text: debugInfo
        });
        
        // Critical fix suggestion for someone else's DM
        if (cleaned.isLid && isFromMe && !isOwner && !chatId.includes('@g.us')) {
            setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: `⚠️ *CRITICAL ISSUE DETECTED*\n\nYou're messaging from a linked device in someone else's DM.\nThe bot sees "fromMe: true" but doesn't recognize you as owner.\n\n🚨 *EMERGENCY FIX:* Use ${PREFIX}forceownerlid`
                });
            }, 1000);
        }
        
        console.log(`
╔════════════════════════════════════════════════╗
║                LID DEBUG ANALYSIS              ║
╠════════════════════════════════════════════════╣
║ Chat: ${chatId.includes('@g.us') ? 'Group' : 'DM'}
║ Sender: ${senderJid}
║ Type: LID (Linked Device)
║ fromMe: ${isFromMe}
║ isOwner(): ${isOwner}
║ jidManager Owner: ${ownerInfo.cleanNumber ? 'SET' : 'NOT SET'}
║ Issue: ${isFromMe && !isOwner ? 'CRITICAL' : 'Normal'}
╚════════════════════════════════════════════════╝
`);
    }
};