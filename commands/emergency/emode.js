// File: ./commands/owner/emode.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'emode',
    alias: ['emergencymode'],
    category: 'owner',
    description: 'Emergency mode command (bypasses all checks)',
    ownerOnly: false, // NO CHECK!
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        
        console.log('🚨 EMERGENCY MODE COMMAND USED!');
        console.log('Chat:', chatId);
        console.log('From Me:', msg.key.fromMe);
        
        // Available modes
        const modes = {
            'public': { name: '🌍 Public Mode', description: 'Bot responds to everyone' },
            'private': { name: '🔒 Private Mode', description: 'Bot responds only to owner' },
            'silent': { name: '🔇 Silent Mode', description: 'Bot ignores non-owners' },
            'group-only': { name: '👥 Group Only', description: 'Bot works in groups only' },
            'maintenance': { name: '🔧 Maintenance', description: 'Only basic commands' }
        };
        
        // Show modes if no args
        if (!args[0]) {
            let modeList = '';
            for (const [mode, info] of Object.entries(modes)) {
                modeList += `${info.name} - ${info.description}\n`;
            }
            
            let currentMode = 'public';
            if (existsSync('./bot_mode.json')) {
                try {
                    const modeData = JSON.parse(readFileSync('./bot_mode.json', 'utf8'));
                    currentMode = modeData.mode || 'public';
                } catch (error) {}
            }
            
            return sock.sendMessage(chatId, {
                text: `🚨 *EMERGENCY MODE COMMAND*\n\n📊 Current: ${modes[currentMode]?.name}\n\n📋 Modes:\n${modeList}\n\nUsage: ${PREFIX}emode <mode>\nExample: ${PREFIX}emode silent`
            });
        }
        
        const requestedMode = args[0].toLowerCase();
        
        if (!modes[requestedMode]) {
            return sock.sendMessage(chatId, {
                text: `❌ Invalid mode! Try: ${Object.keys(modes).join(', ')}`
            });
        }
        
        // Save mode
        const modeData = {
            mode: requestedMode,
            modeName: modes[requestedMode].name,
            setBy: 'EMERGENCY_COMMAND',
            setAt: new Date().toISOString(),
            description: modes[requestedMode].description,
            emergency: true,
            fromChat: chatId,
            fromMe: msg.key.fromMe
        };
        
        writeFileSync('./bot_mode.json', JSON.stringify(modeData, null, 2));
        
        if (typeof global !== 'undefined') {
            global.BOT_MODE = requestedMode;
        }
        
        await sock.sendMessage(chatId, {
            text: `✅ *EMERGENCY MODE SET*\n\n${modes[requestedMode].name}\n${modes[requestedMode].description}\n\n⚠️ Set via emergency command`
        });
        
        console.log(`🚨 Emergency mode set to ${requestedMode} in ${chatId}`);
    }
};