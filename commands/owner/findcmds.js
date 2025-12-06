// findcommands.js - Find where commands are stored
import fs from 'fs';
import chalk from 'chalk';

export default {
    name: 'findcommands',
    alias: ['findcmds', 'debugcmds', 'systeminfo'],
    description: 'Find where commands are stored in bot',
    
    async execute(sock, msg, args, currentPrefix, chatBot) {
        const chatId = msg.key.remoteJid;
        
        // Send processing message
        await sock.sendMessage(chatId, { 
            text: '🔍 *SEARCHING FOR COMMAND SYSTEM...*\n\nPlease wait...' 
        });
        
        console.log(chalk.blue('[FindCommands] Searching for command system...'));
        
        // Check all possible locations
        const locations = [];
        
        // 1. Check global.commands
        if (global.commands) {
            locations.push(`global.commands (${global.commands.size} commands)`);
            console.log(chalk.green('✅ Found: global.commands'));
        }
        
        // 2. Check chatBot.commands
        if (chatBot.commands) {
            locations.push(`chatBot.commands (${chatBot.commands.size} commands)`);
            console.log(chalk.green('✅ Found: chatBot.commands'));
        }
        
        // 3. Check global.COMMANDS
        if (global.COMMANDS) {
            locations.push(`global.COMMANDS (${global.COMMANDS.size} commands)`);
            console.log(chalk.green('✅ Found: global.COMMANDS'));
        }
        
        // 4. Check for commands array
        if (global.commandsList) {
            locations.push(`global.commandsList (${global.commandsList.length} commands)`);
            console.log(chalk.green('✅ Found: global.commandsList'));
        }
        
        // 5. Check if commands are stored elsewhere
        const globalKeys = Object.keys(global);
        const commandKeys = globalKeys.filter(key => 
            key.toLowerCase().includes('command') || 
            key.toLowerCase().includes('cmd')
        );
        
        commandKeys.forEach(key => {
            const value = global[key];
            if (value && typeof value === 'object') {
                const size = value.size || value.length || '?';
                locations.push(`global.${key} (${size} items)`);
                console.log(chalk.cyan(`⚠️ Found: global.${key}`));
            }
        });
        
        // 6. Check chatBot properties
        const chatBotKeys = Object.keys(chatBot);
        chatBotKeys.forEach(key => {
            if (key.toLowerCase().includes('command') || key.toLowerCase().includes('cmd')) {
                const value = chatBot[key];
                if (value && typeof value === 'object') {
                    const size = value.size || value.length || '?';
                    locations.push(`chatBot.${key} (${size} items)`);
                    console.log(chalk.cyan(`⚠️ Found: chatBot.${key}`));
                }
            }
        });
        
        // 7. Check if commands are loaded from folder
        const commandsDir = './commands';
        const hasCommandsDir = fs.existsSync(commandsDir);
        let commandFiles = [];
        
        if (hasCommandsDir) {
            try {
                commandFiles = fs.readdirSync(commandsDir)
                    .filter(file => file.endsWith('.js'));
                locations.push(`File System: ${commandFiles.length} .js files in commands/`);
                console.log(chalk.green(`✅ Found: ${commandFiles.length} command files`));
            } catch (error) {
                console.log(chalk.red(`❌ Error reading commands directory: ${error.message}`));
            }
        }
        
        // Create report
        let report = '🔍 *COMMAND SYSTEM REPORT*\n\n';
        
        if (locations.length > 0) {
            report += '✅ *FOUND COMMAND STORAGE:*\n';
            locations.forEach(loc => {
                report += `• ${loc}\n`;
            });
            report += '\n';
        } else {
            report += '❌ *NO COMMAND STORAGE FOUND*\n\n';
        }
        
        report += '📁 *COMMAND FILES:*\n';
        if (commandFiles.length > 0) {
            commandFiles.forEach(file => {
                report += `• ${file}\n`;
            });
            report += `Total: ${commandFiles.length} files\n\n`;
        } else {
            report += 'No command files found\n\n';
        }
        
        report += '💡 *NEXT STEPS:*\n';
        report += '1. Use this info to fix hotreload\n';
        report += '2. Or use alternative reload method\n';
        report += '3. Check bot console for more details';
        
        await sock.sendMessage(chatId, { text: report });
        
        console.log(chalk.green('[FindCommands] Report sent'));
    }
};