// File: ./commands/owner/debugblock.js
export default {
    name: 'debugblock',
    alias: ['whyblocked'],
    category: 'owner',
    description: 'Debug why owner commands are blocked',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager, handler } = extra;
        
        let debug = `🔍 *WHY ARE OWNER COMMANDS BLOCKED?*\n\n`;
        
        // Get current message info
        const senderJid = msg.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        const isFromMe = msg.key.fromMe;
        const isLid = senderJid.includes('@lid');
        
        debug += `📱 *Your Info:*\n`;
        debug += `├─ JID: ${cleaned.cleanJid}\n`;
        debug += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
        debug += `├─ Is LID: ${isLid ? '✅ YES' : '❌ NO'}\n`;
        debug += `└─ Chat Type: ${chatId.includes('@g.us') ? 'Group' : 'DM'}\n\n`;
        
        // Check jidManager.isOwner
        const isOwner = jidManager.isOwner(msg);
        debug += `👑 *jidManager.isOwner():*\n`;
        debug += `├─ Result: ${isOwner ? '✅ YES' : '❌ NO'}\n`;
        
        // Get owner info
        const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : {};
        debug += `├─ Owner Number: ${ownerInfo.cleanNumber || '❌ Not set'}\n`;
        debug += `└─ Owner JID: ${ownerInfo.cleanJid || '❌ Not set'}\n\n`;
        
        // Check command handler
        debug += `🛡️ *Command Handler Check:*\n`;
        
        if (handler) {
            // Check if handler has owner check logic
            if (handler.checkOwner) {
                const handlerResult = handler.checkOwner(msg, { name: 'test', ownerOnly: true });
                debug += `├─ handler.checkOwner(): ${handlerResult ? '✅ ALLOWS' : '❌ BLOCKS'}\n`;
            }
            
            // Check mode
            const currentMode = global.BOT_MODE || 'public';
            debug += `├─ Bot Mode: ${currentMode}\n`;
            
            // Check if in someone else's DM
            const isOthersDM = !chatId.includes('@g.us') && !isFromMe;
            debug += `└─ In other's DM: ${isOthersDM ? '✅ YES' : '❌ NO'}\n\n`;
        }
        
        // Root cause analysis
        debug += `🎯 *ROOT CAUSE:*\n`;
        
        if (!isOwner && isFromMe && isLid) {
            debug += `⚠️ *LID + fromMe bug*\n`;
            debug += `The bot sees your message as from itself but doesn't recognize you as owner.\n`;
            debug += `This is a jidManager bug.\n\n`;
            debug += `🚀 *SOLUTION:* Run ${PREFIX}ultimatefix\n`;
        } else if (!ownerInfo.cleanNumber) {
            debug += `⚠️ *Owner data not loaded*\n`;
            debug += `jidManager doesn't have owner information.\n\n`;
            debug += `🚀 *SOLUTION:* Run ${PREFIX}debugchat fix\n`;
        } else if (isOthersDM) {
            debug += `⚠️ *Other person's DM issue*\n`;
            debug += `The command handler might treat other DMs differently.\n\n`;
            debug += `🚀 *SOLUTION:* Use ${PREFIX}emode as workaround\n`;
        } else {
            debug += `❓ *Unknown issue*\n`;
            debug += `Try ${PREFIX}ultimatefix then ${PREFIX}testowner\n`;
        }
        
        debug += `\n⚡ *IMMEDIATE WORKAROUND:*\n`;
        debug += `Use ${PREFIX}emode instead of ${PREFIX}mode\n`;
        debug += `(Emergency command bypasses all checks)`;
        
        await sock.sendMessage(chatId, {
            text: debug
        });
    }
};