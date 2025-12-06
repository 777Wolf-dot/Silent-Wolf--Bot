// working_reload.js - Working reload that doesn't need access to command store
import fs from 'fs';
import { createRequire } from 'module';
import chalk from 'chalk';

const require = createRequire(import.meta.url);

export default {
    name: 'workingreload',
    alias: ['wr', 'reloadwork', 'fixreload'],
    description: 'Working reload using file system',
    
    async execute(sock, msg, args, currentPrefix, chatBot) {
        const chatId = msg.key.remoteJid;
        
        // Owner check
        if (!chatBot.isUserAllowed || !chatBot.isUserAllowed()) {
            await sock.sendMessage(chatId, { text: '🔒 Owner only' }, { quoted: msg });
            return;
        }
        
        console.log(chalk.blue('[WorkingReload] Starting...'));
        
        // Send starting message
        await sock.sendMessage(chatId, { 
            text: '🔄 *WORKING RELOAD STARTING...*\n\nPlease wait...' 
        });
        
        try {
            // Step 1: Clear require cache for commands
            console.log(chalk.yellow('[1] Clearing Node.js module cache...'));
            
            const commandFiles = [];
            if (fs.existsSync('./commands')) {
                const files = fs.readdirSync('./commands');
                files.forEach(file => {
                    if (file.endsWith('.js')) {
                        try {
                            const filePath = `./commands/${file}`;
                            const resolvedPath = require.resolve(filePath, { paths: [process.cwd()] });
                            
                            // Delete from require cache
                            if (require.cache[resolvedPath]) {
                                delete require.cache[resolvedPath];
                                commandFiles.push(file);
                                console.log(chalk.gray(`   Cleared: ${file}`));
                            }
                        } catch (error) {
                            console.log(chalk.red(`   Skipped: ${file} (${error.message})`));
                        }
                    }
                });
            }
            
            // Step 2: Send progress
            await sock.sendMessage(chatId, { 
                text: `✅ *Step 1 Complete*\n\nCleared cache for ${commandFiles.length} command files\n\nMoving to step 2...` 
            });
            
            console.log(chalk.green(`[2] Cleared ${commandFiles.length} command files from cache`));
            
            // Step 3: Force bot to reload commands
            console.log(chalk.yellow('[3] Forcing command reload...'));
            
            // Try to trigger command reload by modifying a file the bot watches
            const triggerFile = './.reload_trigger';
            const triggerData = {
                timestamp: new Date().toISOString(),
                triggeredBy: 'workingreload',
                commandFiles: commandFiles
            };
            
            fs.writeFileSync(triggerFile, JSON.stringify(triggerData, null, 2));
            
            // Step 4: Send completion
            const completionMessage = 
                '✅ *WORKING RELOAD COMPLETE!*\n\n' +
                '📊 *Results:*\n' +
                `• Cleared: ${commandFiles.length} command files\n` +
                `• Trigger: Created reload trigger file\n\n` +
                '🎯 *What happens now:*\n' +
                '1. Bot may auto-reload commands\n' +
                '2. Try using new commands\n' +
                '3. If not working, bot needs restart\n\n' +
                '💡 *Test new command:*\n' +
                'Try using any newly added command now';
            
            await sock.sendMessage(chatId, { text: completionMessage });
            
            console.log(chalk.green('[WorkingReload] Completed'));
            console.log(chalk.blue('Next: Try using a new command immediately'));
            
            // Auto-clean trigger file after 10 seconds
            setTimeout(() => {
                if (fs.existsSync(triggerFile)) {
                    fs.unlinkSync(triggerFile);
                    console.log(chalk.gray('Cleaned up trigger file'));
                }
            }, 10000);
            
        } catch (error) {
            console.error(chalk.red('[WorkingReload] Error:'), error.message);
            
            await sock.sendMessage(chatId, { 
                text: `❌ *Reload Error*\n\n${error.message}\n\n` +
                      '💡 *Alternative:*\n' +
                      '1. Add new command file\n' +
                      '2. Use `.refresh` command\n' +
                      '3. Or restart bot normally'
            });
        }
    }
};