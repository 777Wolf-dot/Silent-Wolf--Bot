// commands/checkmode.js
export default {
    name: 'checkmode',
    alias: ['status', 'botstatus', 'modestatus'],
    description: 'Check current bot mode and status',
    category: 'General',
    usage: '.checkmode',
    
    async execute(sock, msg, args, serializeM, store) {
        const chatId = msg.key.remoteJid;
        
        const modeFile = './mode.json';
        let currentMode = 'private';
        let changedAt = 'Never';
        let changedBy = 'System';
        
        try {
            if (fs.existsSync(modeFile)) {
                const data = fs.readFileSync(modeFile, 'utf-8');
                const modeData = JSON.parse(data);
                currentMode = modeData.mode || 'private';
                changedAt = modeData.changedAt ? new Date(modeData.changedAt).toLocaleString() : 'Unknown';
                changedBy = modeData.changedBy || 'System';
            }
        } catch (e) {
            console.log('Mode file error:', e.message);
        }
        
        const modeEmoji = currentMode === 'public' ? '🌍' : '🔒';
        const modeText = currentMode === 'public' ? 'PUBLIC' : 'PRIVATE';
        const accessInfo = currentMode === 'public' ? 
            '✅ Everyone can use commands' : 
            '🔒 Only owner can use commands';
        
        const ownerNumber = process.env.OWNER_NUMBER || 'Not set';
        
        await sock.sendMessage(chatId, { 
            text: `${modeEmoji} *BOT MODE STATUS*\n\n` +
                  `📊 *Current Mode:* ${modeText}\n` +
                  `🔐 *Access Level:* ${accessInfo}\n` +
                  `👑 *Owner:* ${ownerNumber}\n` +
                  `📅 *Last Changed:* ${changedAt}\n` +
                  `👤 *Changed By:* ${changedBy}\n\n` +
                  `ℹ️ *Note:* Use .mode command (owner only) to change mode`
        }, { quoted: msg });
    }
};