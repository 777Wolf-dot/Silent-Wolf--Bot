// File: ./commands/owner/testowner.js
export default {
    name: 'testowner',
    alias: ['testaccess', 'checkowneraccess'],
    category: 'owner',
    description: 'Test if you have owner access in current chat',
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        const senderJid = msg.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        const isOwner = jidManager.isOwner(msg);
        const isFromMe = msg.key.fromMe;
        const isLid = senderJid.includes('@lid');
        const isGroup = chatId.includes('@g.us');
        
        let testResult = `🔍 *OWNER ACCESS TEST*\n\n`;
        
        testResult += `📱 *Chat Info:*\n`;
        testResult += `├─ Type: ${isGroup ? 'Group 👥' : 'DM 📱'}\n`;
        testResult += `├─ Chat ID: ${chatId}\n`;
        testResult += `└─ Your JID: ${cleaned.cleanJid}\n\n`;
        
        testResult += `👤 *Your Status:*\n`;
        testResult += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
        testResult += `├─ Is LID: ${isLid ? '✅ YES' : '❌ NO'}\n`;
        testResult += `├─ Number: ${cleaned.cleanNumber || 'N/A'}\n`;
        testResult += `└─ isOwner(): ${isOwner ? '✅ YES' : '❌ NO'}\n\n`;
        
        // Check jidManager owner data
        const ownerInfo = jidManager.getOwnerInfo();
        testResult += `👑 *Bot Owner Info:*\n`;
        testResult += `├─ Clean Number: ${ownerInfo.cleanNumber || '❌ Not set'}\n`;
        testResult += `├─ Clean JID: ${ownerInfo.cleanJid || '❌ Not set'}\n`;
        testResult += `└─ Known JIDs: ${ownerInfo.jidCount || 0}\n\n`;
        
        // Test specific scenarios
        testResult += `🎯 *Access Analysis:*\n`;
        
        if (isOwner) {
            testResult += `✅ You SHOULD have owner command access\n`;
        } else if (isLid && isFromMe) {
            testResult += `⚠️ You're using LID + fromMe but NOT owner\n`;
            testResult += `   This is the bug! Use ${PREFIX}patchowner\n`;
        } else if (!ownerInfo.cleanNumber) {
            testResult += `❌ Owner data not loaded in jidManager\n`;
            testResult += `   Use ${PREFIX}debugchat fix\n`;
        } else {
            testResult += `❌ You are NOT recognized as owner\n`;
        }
        
        testResult += `\n🔧 *Quick Fixes:*\n`;
        testResult += `1. ${PREFIX}patchowner - Apply emergency fix\n`;
        testResult += `2. ${PREFIX}debugchat fix - Fix jidManager data\n`;
        testResult += `3. ${PREFIX}forceownerlid - Force LID owner\n`;
        
        // Immediate test: Try to trigger the mode command check
        testResult += `\n🎬 *Test Now:* Try ${PREFIX}mode command`;
        
        await sock.sendMessage(chatId, {
            text: testResult
        });
        
        // Log for debugging
        console.log(`🧪 Owner test in ${isGroup ? 'group' : 'DM'}:`);
        console.log(`   isOwner: ${isOwner}`);
        console.log(`   isLid: ${isLid}`);
        console.log(`   fromMe: ${isFromMe}`);
        console.log(`   Chat: ${chatId}`);
    }
};