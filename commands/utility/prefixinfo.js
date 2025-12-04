// ====== prefixinfo.js - Check Current Prefix ======
// Save as: ./commands/info/prefixinfo.js

import fs from 'fs';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PREFIX_FILE = path.join(__dirname, '../../data/prefix.json');

// Function to read current prefix
function getCurrentPrefix() {
    try {
        if (fs.existsSync(PREFIX_FILE)) {
            const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
            return data.prefix || '.';
        }
    } catch (error) {
        console.error('Error reading prefix file:', error);
    }
    return '.';
}

export default {
    name: 'prefixinfo',
    alias: ['prefix', 'myprefix', 'botprefix'],
    description: 'Check the current bot prefix',
    category: 'info',
    usage: 'prefixinfo',
    
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        const currentPrefix = getCurrentPrefix();
        
        const commands = [
            `${currentPrefix}ping - Check bot response`,
            `${currentPrefix}help - Show all commands`,
            `${currentPrefix}menu - Command menu`,
            `${currentPrefix}owner - Bot owner info`
        ];
        
        await sock.sendMessage(remoteJid, {
            text: `🔧 *Bot Prefix Information*\n\n` +
                  `Current prefix: *${currentPrefix}*\n\n` +
                  `*Example commands:*\n${commands.join('\n')}\n\n` +
                  `To change prefix: *${currentPrefix}setprefix <new_prefix>*\n` +
                  `Example: *${currentPrefix}setprefix ?*`
        }, { quoted: msg });
    }
};