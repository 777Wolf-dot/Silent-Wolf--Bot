// File: ./commands/owner/patchowner.js
export default {
    name: 'patchowner',
    alias: ['fixownercheck', 'emergencypatch'],
    category: 'owner',
    description: 'Emergency patch for owner check in other DMs',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // Get current handler (you need to access your command handler)
        const handler = extra.handler || global.handler;
        
        if (!handler) {
            return sock.sendMessage(chatId, {
                text: '❌ Cannot access command handler'
            });
        }
        
        let patchLog = `🔧 *OWNER CHECK PATCH*\n\n`;
        
        // PATCH 1: Fix jidManager.isOwner() for LID + fromMe
        const originalIsOwner = jidManager.isOwner;
        
        jidManager.isOwner = function(message) {
            const participant = message?.key?.participant;
            const chatId = message?.key?.remoteJid;
            const senderJid = participant || chatId;
            const isFromMe = message?.key?.fromMe;
            
            console.log(`🔍 PATCHED isOwner() called:`);
            console.log(`   Sender: ${senderJid}`);
            console.log(`   From Me: ${isFromMe}`);
            
            // CRITICAL FIX: If from LID and fromMe, grant owner access
            if (senderJid && senderJid.includes('@lid') && isFromMe) {
                console.log(`   ✅ PATCH: LID + fromMe = OWNER`);
                return true;
            }
            
            // Also check if sender is in someone else's DM (not group)
            const isGroup = chatId.includes('@g.us');
            if (!isGroup && isFromMe) {
                console.log(`   🔍 In someone else's DM, checking special case`);
                // This might be owner messaging someone else
                // We need additional checks here
            }
            
            // Fall back to original logic
            return originalIsOwner.call(this, message);
        };
        
        patchLog += `✅ Patch 1: Modified jidManager.isOwner()\n`;
        patchLog += `   ↳ LID + fromMe = automatic owner\n\n`;
        
        // PATCH 2: Ensure owner data is loaded
        if (!jidManager.loadOwnerData && existsSync('./owner.json')) {
            jidManager.loadOwnerData = function() {
                try {
                    const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                    this.owner = {
                        cleanNumber: data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER,
                        cleanJid: data.OWNER_CLEAN_JID || data.OWNER_JID,
                        rawJid: data.OWNER_JID
                    };
                    
                    // Fix formatting
                    if (this.owner.cleanNumber?.includes(':')) {
                        this.owner.cleanNumber = this.owner.cleanNumber.split(':')[0];
                    }
                    if (this.owner.cleanJid?.includes(':74')) {
                        this.owner.cleanJid = this.owner.cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
                    }
                    
                    console.log('✅ Loaded owner data via patch');
                    return true;
                } catch (error) {
                    console.error('❌ Patch load failed:', error);
                    return false;
                }
            };
            
            // Load now
            jidManager.loadOwnerData();
            patchLog += `✅ Patch 2: Added loadOwnerData() method\n`;
        }
        
        // PATCH 3: Set global variables
        const ownerInfo = jidManager.getOwnerInfo();
        if (ownerInfo.cleanNumber) {
            global.OWNER_NUMBER = ownerInfo.cleanNumber;
            global.OWNER_CLEAN_NUMBER = ownerInfo.cleanNumber;
            global.OWNER_JID = ownerInfo.cleanJid;
            global.OWNER_CLEAN_JID = ownerInfo.cleanJid;
            patchLog += `✅ Patch 3: Set global variables\n`;
        }
        
        // PATCH 4: Modify command handler's owner check
        // This depends on your handler structure
        // Look for where commands are checked for ownerOnly
        
        patchLog += `\n🎯 *Testing Patch:*\n`;
        patchLog += `Try using ${PREFIX}mode command now.\n`;
        patchLog += `It should work in:\n`;
        patchLog += `✅ Your DM\n`;
        patchLog += `✅ Groups\n`;
        patchLog += `✅ Someone else's DM\n\n`;
        patchLog += `⚠️ *Note:* This patch is temporary.\n`;
        patchLog += `Restart will revert changes.`;
        
        await sock.sendMessage(chatId, {
            text: patchLog
        });
        
        console.log('🔧 Owner check patch applied');
    }
};