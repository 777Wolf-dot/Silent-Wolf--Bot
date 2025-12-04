// ====== setprefix.js ======
// Save as: ./commands/admin/setprefix.js

import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const PREFIX_FILE = path.join(__dirname, '../../data/prefix.json');

// Create data directory if it doesn't exist
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize prefix file if it doesn't exist
if (!fs.existsSync(PREFIX_FILE)) {
    fs.writeFileSync(PREFIX_FILE, JSON.stringify({ prefix: '.' }, null, 2));
}

// Function to read current prefix
function getCurrentPrefix() {
    try {
        const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
        return data.prefix || '.';
    } catch (error) {
        console.error(chalk.red('❌ Error reading prefix file:'), error);
        return '.';
    }
}

// Function to save new prefix
function savePrefix(newPrefix) {
    try {
        const data = { prefix: newPrefix };
        fs.writeFileSync(PREFIX_FILE, JSON.stringify(data, null, 2));
        console.log(chalk.green(`✅ Prefix changed to: "${newPrefix}"`));
        
        // Also save to a backup file
        const backupFile = path.join(__dirname, '../../data/prefix_backup.json');
        fs.writeFileSync(backupFile, JSON.stringify({
            prefix: newPrefix,
            changed_at: new Date().toISOString(),
            changed_by: 'setprefix command'
        }, null, 2));
        
        return true;
    } catch (error) {
        console.error(chalk.red('❌ Error saving prefix:'), error);
        return false;
    }
}

export default {
    name: 'setprefix',
    alias: ['prefix', 'changeprefix', 'setp', 'sp'],
    description: 'Change the bot command prefix',
    category: 'admin',
    usage: 'setprefix <new_prefix>',
    example: 'setprefix ?',
    
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        const currentPrefix = getCurrentPrefix();
        
        // Check if user is owner
        const userJid = msg.key.participant || remoteJid;
        const ownerJid = sock.user.id;
        
        if (userJid !== ownerJid) {
            return await sock.sendMessage(remoteJid, {
                text: '❌ This command is only available to the bot owner!'
            }, { quoted: msg });
        }
        
        // Show current prefix if no arguments
        if (args.length === 0) {
            const validPrefixes = ['.', '?', '!', '#', '$', '%', '&', '*', '+', '-', '=', '^', '~'];
            
            return await sock.sendMessage(remoteJid, {
                text: `🔧 *Prefix Configuration*\n\n` +
                      `Current prefix: *${currentPrefix}*\n\n` +
                      `*Usage:* ${currentPrefix}setprefix <new_prefix>\n\n` +
                      `*Examples:*\n` +
                      `• ${currentPrefix}setprefix ?\n` +
                      `• ${currentPrefix}setprefix !\n` +
                      `• ${currentPrefix}setprefix #\n` +
                      `• ${currentPrefix}setprefix $\n\n` +
                      `*Valid prefixes:* ${validPrefixes.join(' ')}\n\n` +
                      `*Note:* Prefix must be 1-3 characters, no spaces.`
            }, { quoted: msg });
        }
        
        const newPrefix = args[0].trim();
        
        // Validate prefix
        if (newPrefix.length < 1 || newPrefix.length > 3) {
            return await sock.sendMessage(remoteJid, {
                text: '❌ Prefix must be 1-3 characters long!\n' +
                      'Example: . ? ! # $ % & *'
            }, { quoted: msg });
        }
        
        if (newPrefix.includes(' ') || newPrefix.includes('\n') || newPrefix.includes('\t')) {
            return await sock.sendMessage(remoteJid, {
                text: '❌ Prefix cannot contain spaces, tabs, or newlines!'
            }, { quoted: msg });
        }
        
        // Prevent using the same prefix
        if (newPrefix === currentPrefix) {
            return await sock.sendMessage(remoteJid, {
                text: `❌ Prefix is already set to *${currentPrefix}*!\n` +
                      `No changes needed.`
            }, { quoted: msg });
        }
        
        // Save new prefix
        if (savePrefix(newPrefix)) {
            await sock.sendMessage(remoteJid, {
                text: `✅ *Prefix Successfully Changed!*\n\n` +
                      `Old prefix: *${currentPrefix}*\n` +
                      `New prefix: *${newPrefix}*\n\n` +
                      `*Examples:*\n` +
                      `• ${newPrefix}ping\n` +
                      `• ${newPrefix}help\n` +
                      `• ${newPrefix}menu\n` +
                      `• ${newPrefix}owner\n\n` +
                      `✨ *The change takes effect immediately!*\n` +
                      `Try: *${newPrefix}ping*`
            }, { quoted: msg });
            
            // Send immediate test message
            setTimeout(async () => {
                try {
                    await sock.sendMessage(remoteJid, {
                        text: `*Test new prefix:* ${newPrefix}ping`
                    });
                } catch (error) {
                    // Ignore errors
                }
            }, 1000);
            
        } else {
            await sock.sendMessage(remoteJid, {
                text: '❌ Failed to save new prefix. Please check console for errors.'
            }, { quoted: msg });
        }
    }
};