// File: ./commands/group/welcome.js - STANDALONE VERSION
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'welcome',
    alias: ['welcomer'],
    category: 'group',
    description: 'Welcome new group members',
    
    async execute(sock, msg, args, PREFIX) {
        const chatId = msg.key.remoteJid;
        
        if (!chatId.endsWith('@g.us')) {
            return sock.sendMessage(chatId, {
                text: 'This command only works in groups!'
            }, { quoted: msg });
        }
        
        // Simple config
        const WELCOME_FILE = './welcome_simple.json';
        let config = {};
        
        if (existsSync(WELCOME_FILE)) {
            try {
                config = JSON.parse(readFileSync(WELCOME_FILE, 'utf8'));
            } catch (error) {
                config = {};
            }
        }
        
        if (!config[chatId]) {
            config[chatId] = {
                enabled: false,
                message: 'Welcome {name} to the group! 🎉'
            };
        }
        
        const groupConfig = config[chatId];
        const command = args[0]?.toLowerCase() || 'status';
        
        switch (command) {
            case 'on':
                groupConfig.enabled = true;
                writeFileSync(WELCOME_FILE, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ Welcome messages ENABLED!\n\nNew members will be welcomed automatically.`
                }, { quoted: msg });
                break;
                
            case 'off':
                groupConfig.enabled = false;
                writeFileSync(WELCOME_FILE, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `✅ Welcome messages DISABLED.`
                }, { quoted: msg });
                break;
                
            case 'test':
                // Send test welcome
                const testName = 'New Member';
                const testMessage = groupConfig.message.replace(/{name}/g, testName);
                
                await sock.sendMessage(chatId, {
                    text: `👋 *Test Welcome:*\n\n${testMessage}`
                }, { quoted: msg });
                break;
                
            case 'status':
                await sock.sendMessage(chatId, {
                    text: `👋 Welcome Status: ${groupConfig.enabled ? '✅ ENABLED' : '❌ DISABLED'}\n\nMessage: ${groupConfig.message}\n\nCommands:\n• .welcome on/off\n• .welcome test`
                }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `Welcome Command\n\nUsage:\n• .welcome on - Enable\n• .welcome off - Disable\n• .welcome test - Test\n• .welcome status - Check status`
                }, { quoted: msg });
        }
    }
};

// Simple event handler that can be added anywhere
export function setupWelcomeHandler(sock) {
    sock.ev.on('group-participants.update', async (update) => {
        try {
            const { id, participants, action } = update;
            
            if (action !== 'add') return;
            
            // Load config
            const WELCOME_FILE = './welcome_simple.json';
            if (!existsSync(WELCOME_FILE)) return;
            
            const config = JSON.parse(readFileSync(WELCOME_FILE, 'utf8'));
            if (!config[id] || !config[id].enabled) return;
            
            // Welcome each new member
            for (const participant of participants) {
                const groupConfig = config[id];
                let userName = participant.split('@')[0];
                
                try {
                    const contact = await sock.onWhatsApp(participant);
                    if (contact && contact[0] && contact[0].name) {
                        userName = contact[0].name;
                    }
                } catch (error) {
                    // Use default name
                }
                
                const welcomeMessage = groupConfig.message.replace(/{name}/g, userName);
                
                await sock.sendMessage(id, {
                    text: welcomeMessage
                });
                
                console.log(`👋 Welcomed ${userName} to group ${id}`);
            }
            
        } catch (error) {
            console.error('Welcome handler error:', error);
        }
    });
    
    console.log('✅ Welcome handler setup complete');
}