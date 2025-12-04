// ====== setsetting.js - Change Settings ======
// Save as: ./commands/owner/setsetting.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
    name: 'setsetting',
    alias: ['configset', 'changeconfig', 'updateconfig'],
    description: 'Change bot settings',
    category: 'owner',
    usage: 'setsetting <key> <value>',
    example: 'setsetting BOT_NAME "Wolf Bot"\nsetsetting PREFIX !',
    
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        const userJid = msg.key.participant || remoteJid;
        const ownerJid = sock.user.id;
        
        // Check if user is owner
        // if (userJid !== ownerJid) {
        //     return await sock.sendMessage(remoteJid, {
        //         text: '❌ This command is only available to the bot owner!'
        //     }, { quoted: msg });
        // }
        
        if (args.length < 2) {
            return await sock.sendMessage(remoteJid, {
                text: `⚙️ *SET SETTING*\n\nUsage: .setsetting <key> <value>\n\nExamples:\n• .setsetting BOT_NAME "My Bot"\n• .setsetting PREFIX !\n• .setsetting AUTO_REPLY true\n\nUse .getsettings to see all available settings`
            }, { quoted: msg });
        }
        
        const key = args[0].toUpperCase();
        const value = args.slice(1).join(' ');
        
        try {
            const result = await this.updateSetting(key, value, sock);
            
            await sock.sendMessage(remoteJid, {
                text: result
            }, { quoted: msg });
            
        } catch (error) {
            console.error('Set setting error:', error);
            await sock.sendMessage(remoteJid, {
                text: `❌ Failed to update setting: ${error.message}`
            }, { quoted: msg });
        }
    },
    
    async updateSetting(key, value, sock) {
        const envPath = path.join(__dirname, '../../.env');
        
        // Special cases
        if (key === 'PREFIX') {
            return await this.updatePrefix(value);
        }
        
        // Update .env file
        if (fs.existsSync(envPath)) {
            let envContent = fs.readFileSync(envPath, 'utf8');
            const lines = envContent.split('\n');
            let found = false;
            
            const newLines = lines.map(line => {
                if (line.startsWith(`${key}=`)) {
                    found = true;
                    return `${key}=${value}`;
                }
                return line;
            });
            
            if (!found) {
                newLines.push(`${key}=${value}`);
            }
            
            fs.writeFileSync(envPath, newLines.join('\n'));
            
            // Reload environment variables
            delete process.env[key];
            dotenv.config({ path: envPath, override: true });
            
            return `✅ Setting updated:\n${key}=${value}\n\n⚠️ Restart bot for changes to take effect`;
        } else {
            return `❌ .env file not found at: ${envPath}`;
        }
    },
    
    async updatePrefix(newPrefix) {
        const prefixFile = path.join(__dirname, '../../data/prefix.json');
        const dataDir = path.join(__dirname, '../../data');
        
        // Validate prefix
        if (newPrefix.length < 1 || newPrefix.length > 3) {
            return '❌ Prefix must be 1-3 characters';
        }
        
        if (newPrefix.includes(' ') || newPrefix.includes('\n')) {
            return '❌ Prefix cannot contain spaces or newlines';
        }
        
        // Create data directory if it doesn't exist
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }
        
        // Save new prefix
        try {
            fs.writeFileSync(prefixFile, JSON.stringify({ prefix: newPrefix }, null, 2));
            
            // Also update .env for consistency
            const envPath = path.join(__dirname, '../../.env');
            if (fs.existsSync(envPath)) {
                let envContent = fs.readFileSync(envPath, 'utf8');
                const lines = envContent.split('\n');
                const newLines = lines.map(line => 
                    line.startsWith('PREFIX=') ? `PREFIX=${newPrefix}` : line
                );
                fs.writeFileSync(envPath, newLines.join('\n'));
            }
            
            return `✅ Prefix updated to: *${newPrefix}*\n\nChanges take effect immediately!\nTry: *${newPrefix}ping*`;
            
        } catch (error) {
            console.error('Prefix update error:', error);
            return `❌ Failed to update prefix: ${error.message}`;
        }
    }
};