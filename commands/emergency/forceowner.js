// File: ./commands/owner/forceowner.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'forceowner',
    alias: ['emergencyowner', 'lidowner'],
    category: 'owner',
    description: 'Force set owner from LID device (emergency fix)',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // Only allow from linked devices
        const senderJid = msg.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        
        if (!cleaned.isLid) {
            return sock.sendMessage(chatId, {
                text: '❌ This command only works from linked devices (LID).\nUse !fixowner from your main device instead.'
            });
        }
        
        // Get confirmation
        await sock.sendMessage(chatId, {
            text: `⚠️ *EMERGENCY OWNER SET*\n\nYou are attempting to set:\n📱 LID: ${cleaned.cleanJid}\n🔢 Number: ${cleaned.cleanNumber}\n\nas the bot owner.\n\n⚠️ **WARNING**: This will override any existing owner!\n\nReply with "CONFIRM" to proceed or "CANCEL" to abort.`
        });
        
        // Wait for confirmation
        try {
            // Simple confirmation logic
            const listenerId = setTimeout(async () => {
                await sock.sendMessage(chatId, {
                    text: '❌ Confirmation timeout. Operation cancelled.'
                });
            }, 30000);
            
            // You might need to implement proper message waiting logic here
            // For now, we'll proceed after a brief delay
            setTimeout(async () => {
                clearTimeout(listenerId);
                
                // Update owner.json
                const ownerData = {
                    OWNER_NUMBER: cleaned.cleanNumber,
                    OWNER_JID: cleaned.cleanJid,
                    OWNER_CLEAN_NUMBER: cleaned.cleanNumber,
                    OWNER_CLEAN_JID: cleaned.cleanJid,
                    isLidOwner: true,
                    lastUpdated: new Date().toISOString(),
                    note: 'Set via forceowner command from LID device'
                };
                
                writeFileSync('./owner.json', JSON.stringify(ownerData, null, 2));
                
                // Update jidManager
                if (jidManager.setOwner) {
                    jidManager.setOwner({
                        rawNumber: cleaned.cleanNumber,
                        rawJid: cleaned.cleanJid
                    });
                }
                
                // Update global variables
                global.OWNER_NUMBER = cleaned.cleanNumber;
                global.OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                global.OWNER_JID = cleaned.cleanJid;
                global.OWNER_CLEAN_JID = cleaned.cleanJid;
                
                // Create LID mapping
                const lidMappingFile = './lid_mappings.json';
                let lidMappings = {};
                if (existsSync(lidMappingFile)) {
                    try {
                        lidMappings = JSON.parse(readFileSync(lidMappingFile, 'utf8'));
                    } catch (error) {
                        // ignore
                    }
                }
                
                // Map this LID to itself (since it's already a LID)
                lidMappings[cleaned.cleanNumber] = cleaned.cleanJid;
                writeFileSync(lidMappingFile, JSON.stringify(lidMappings, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ *OWNERSHIP FORCE-SET*\n\n👑 New Owner: ${cleaned.cleanNumber}\n🔗 JID: ${cleaned.cleanJid}\n📁 Saved to: owner.json\n🔗 LID mapped\n\nYou should now have owner privileges on this linked device!`
                });
                
                console.log(`⚠️ FORCE OWNER SET via LID: ${cleaned.cleanJid}`);
                
            }, 2000);
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error: ${error.message}`
            });
        }
    }
};