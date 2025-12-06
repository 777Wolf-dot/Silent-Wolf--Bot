// test.js - Sample command for testing
export default {
    name: 'test',
    alias: ['testcmd', 'sample', 'demo'],
    description: 'Test command for reload system',
    
    async execute(sock, msg, args, currentPrefix, chatBot) {
        const chatId = msg.key.remoteJid;
        
        const testMessage = 
            '🧪 *TEST COMMAND*\n\n' +
            '✅ This is a test command\n' +
            '✅ Used to test the reload system\n\n' +
            '📊 *Bot Status:*\n' +
            '• Working: ✅ Yes\n' +
            '• Reload: ✅ Supported\n' +
            '• Updates: ✅ Detected\n\n' +
            '💡 *Try:* `.reload` *to see updates*';
        
        await sock.sendMessage(chatId, { 
            text: testMessage 
        }, { quoted: msg });
        
        console.log('[Test] Command executed');
    }
};