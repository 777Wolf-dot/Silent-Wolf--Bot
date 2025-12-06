// // // // ====== SETPREFIX COMMAND MODULE ======
// // // // Fixed version that works with your bot
// // // import fs from 'fs';
// // // import chalk from 'chalk';

// // // const PREFIX_FILE = './prefix.json';

// // // // Simple function to get stored prefix
// // // function getStoredPrefix() {
// // //     try {
// // //         if (fs.existsSync(PREFIX_FILE)) {
// // //             const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
// // //             return data.prefix;
// // //         }
// // //     } catch (error) {
// // //         // Silent error
// // //     }
// // //     return null;
// // // }

// // // // Simple function to save prefix
// // // function savePrefix(newPrefix, ownerNumber) {
// // //     try {
// // //         const prefixData = {
// // //             prefix: newPrefix,
// // //             changedAt: new Date().toISOString(),
// // //             owner: ownerNumber,
// // //             version: '1.0'
// // //         };
// // //         fs.writeFileSync(PREFIX_FILE, JSON.stringify(prefixData, null, 2));
// // //         return true;
// // //     } catch (error) {
// // //         console.error(chalk.red('❌ Error saving prefix:'), error);
// // //         return false;
// // //     }
// // // }

// // // // Validate prefix
// // // function isValidPrefix(prefix) {
// // //     if (!prefix || typeof prefix !== 'string') return false;
// // //     if (prefix.length > 3) return false;
// // //     if (prefix.includes(' ')) return false;
// // //     return /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?a-zA-Z0-9]{1,3}$/.test(prefix);
// // // }

// // // // Command module
// // // export default {
// // //     name: 'setprefix',
// // //     alias: ['prefix', 'changeprefix'],
// // //     description: 'Change bot command prefix',
    
// // //     async execute(sock, msg, args, currentPrefix, chatBot) {
// // //         const chatId = msg.key.remoteJid;
// // //         const fromNumber = chatId.split('@')[0];
        
// // //         console.log(chalk.blue(`🔧 Setprefix from: +${fromNumber}`));
        
// // //         // DEBUG: Show what numbers we're comparing
// // //         console.log(chalk.yellow(`🔍 Owner check debug:`));
// // //         console.log(chalk.yellow(`  From: +${fromNumber}`));
// // //         console.log(chalk.yellow(`  Bot Owner: +${chatBot.OWNER_NUMBER || 'Unknown'}`));
        
// // //         // SIMPLIFIED OWNER CHECK - Use chatBot's isUserAllowed function
// // //         // This matches how your mode command works
// // //         try {
// // //             // First try using chatBot's isUserAllowed if available
// // //             if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
// // //                 const isAllowed = chatBot.isUserAllowed();
// // //                 console.log(chalk.blue(`🔐 chatBot.isUserAllowed() = ${isAllowed}`));
                
// // //                 if (!isAllowed) {
// // //                     console.log(chalk.red(`❌ chatBot says user not allowed`));
                    
// // //                     await sock.sendMessage(chatId, {
// // //                         text: `❌ *Permission Denied*\n\nThis command is owner-only.\n\nBot Owner: +${chatBot.OWNER_NUMBER || 'Unknown'}\nYour Number: +${fromNumber}\n\n*Note:* If you just linked this device:\n1. Restart the bot completely\n2. Send any message first\n3. Then try this command`
// // //                     }, { quoted: msg });
// // //                     return;
// // //                 }
// // //             } 
// // //             // Fallback: Direct number comparison
// // //             else if (chatBot.OWNER_NUMBER) {
// // //                 // Simple normalization
// // //                 const cleanOwner = chatBot.OWNER_NUMBER.replace(/[^0-9]/g, '');
// // //                 const cleanSender = fromNumber.replace(/[^0-9]/g, '');
                
// // //                 console.log(chalk.blue(`🔐 Comparing: ${cleanOwner} vs ${cleanSender}`));
                
// // //                 if (cleanSender !== cleanOwner) {
// // //                     console.log(chalk.red(`❌ Number mismatch`));
// // //                     await sock.sendMessage(chatId, {
// // //                         text: `❌ Only bot owner can use this.\nOwner: +${cleanOwner}\nYou: +${cleanSender}`
// // //                     }, { quoted: msg });
// // //                     return;
// // //                 }
// // //             } else {
// // //                 console.log(chalk.red(`❌ No owner info available`));
// // //                 await sock.sendMessage(chatId, {
// // //                     text: '❌ Bot owner information not available. Please restart bot.'
// // //                 }, { quoted: msg });
// // //                 return;
// // //             }
// // //         } catch (error) {
// // //             console.error(chalk.red('❌ Owner check error:'), error);
// // //             await sock.sendMessage(chatId, {
// // //                 text: '❌ Error checking permissions. Please try again.'
// // //             }, { quoted: msg });
// // //             return;
// // //         }
        
// // //         console.log(chalk.green(`✅ Owner verified: +${fromNumber}`));
        
// // //         // ==== COMMAND LOGIC ====
// // //         const storedPrefix = getStoredPrefix();
// // //         const effectivePrefix = storedPrefix || currentPrefix || '.';
        
// // //         // Show help if no args
// // //         if (args.length === 0) {
// // //             await sock.sendMessage(chatId, {
// // //                 text: `🔤 *PREFIX COMMAND*\n\n*Current Prefix:* \`${effectivePrefix}\`\n*Stored Prefix:* ${storedPrefix ? `\`${storedPrefix}\`` : 'None (using default)'}\n\n*Usage:*\n• ${effectivePrefix}setprefix <new_prefix>\n• ${effectivePrefix}setprefix reset\n• ${effectivePrefix}setprefix status\n\n*Examples:*\n${effectivePrefix}setprefix !\n${effectivePrefix}setprefix #\n${effectivePrefix}setprefix reset`
// // //             }, { quoted: msg });
// // //             return;
// // //         }
        
// // //         const action = args[0].toLowerCase();
        
// // //         // Show status
// // //         if (action === 'status') {
// // //             await sock.sendMessage(chatId, {
// // //                 text: `📊 *PREFIX STATUS*\n\n*Bot Using:* \`${effectivePrefix}\`\n*Stored in File:* ${storedPrefix ? `\`${storedPrefix}\`` : 'None'}\n*Default:* \`.\`\n*Owner:* +${fromNumber}\n\n*Next Commands:*\n\`${effectivePrefix}info\` - Test current prefix\n\`${effectivePrefix}setprefix !\` - Change to !`
// // //             }, { quoted: msg });
// // //             return;
// // //         }
        
// // //         // Reset prefix
// // //         if (action === 'reset') {
// // //             if (fs.existsSync(PREFIX_FILE)) {
// // //                 fs.unlinkSync(PREFIX_FILE);
// // //             }
            
// // //             await sock.sendMessage(chatId, {
// // //                 text: `🔄 *PREFIX RESET*\n\n✅ Prefix reset to default: \`.\`\n\nBot will use \`.\` after restart.\nExample: \`.info\` - Show bot info`
// // //             }, { quoted: msg });
            
// // //             console.log(chalk.green(`✅ Prefix reset by owner +${fromNumber}`));
// // //             return;
// // //         }
        
// // //         // Validate new prefix
// // //         if (!isValidPrefix(action)) {
// // //             await sock.sendMessage(chatId, {
// // //                 text: `❌ *Invalid Prefix*\n\nPrefix must be:\n• 1-3 characters\n• No spaces\n• Can be: ! @ # $ % ^ & *\n• Or letters/numbers\n\n*Good:* ! # $ & *\n*Bad:* spaced prefix\n*Bad:* verylongprefix`
// // //             }, { quoted: msg });
// // //             return;
// // //         }
        
// // //         // Save new prefix
// // //         if (savePrefix(action, fromNumber)) {
// // //             console.log(chalk.green(`✅ Prefix saved as "${action}" by +${fromNumber}`));
            
// // //             await sock.sendMessage(chatId, {
// // //                 text: `✅ *PREFIX SAVED*\n\n✅ New prefix: \`${action}\`\n\n*IMPORTANT:* Restart the bot for changes to take effect!\n\nAfter restart, use:\n\`${action}info\` - Show bot info\n\`${action}help\` - Show help\n\`${action}mode\` - Change mode`
// // //             }, { quoted: msg });
            
// // //             // Send reminder after 3 seconds
// // //             setTimeout(async () => {
// // //                 try {
// // //                     await sock.sendMessage(chatId, {
// // //                         text: `💡 *REMINDER*\n\nDon't forget to restart the bot!\nAfter restart, prefix will be: \`${action}\`\n\nUntil restart, bot still uses: \`${effectivePrefix}\``
// // //                     });
// // //                 } catch (error) {
// // //                     // Ignore
// // //                 }
// // //             }, 3000);
// // //         } else {
// // //             await sock.sendMessage(chatId, {
// // //                 text: '❌ Failed to save prefix. Please try again.'
// // //             }, { quoted: msg });
// // //         }
// // //     }
// // // };















// // // ====== SETPREFIX COMMAND MODULE ======
// // // Auto-restart version for panel hosting
// // import fs from 'fs';
// // import { exec } from 'child_process';
// // import chalk from 'chalk';

// // const PREFIX_FILE = './prefix.json';
// // const LOG_FILE = './bot_restart.log';
// // const PID_FILE = './bot.pid';

// // // Simple function to get stored prefix
// // function getStoredPrefix() {
// //     try {
// //         if (fs.existsSync(PREFIX_FILE)) {
// //             const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
// //             return data.prefix;
// //         }
// //     } catch (error) {
// //         // Silent error
// //     }
// //     return null;
// // }

// // // Save prefix and trigger auto-restart
// // function savePrefixWithRestart(newPrefix, ownerNumber) {
// //     try {
// //         const prefixData = {
// //             prefix: newPrefix,
// //             changedAt: new Date().toISOString(),
// //             owner: ownerNumber,
// //             version: '2.0',
// //             restartTriggered: true,
// //             restartTime: null
// //         };
        
// //         fs.writeFileSync(PREFIX_FILE, JSON.stringify(prefixData, null, 2));
        
// //         // Log the change
// //         const logEntry = `[${new Date().toISOString()}] PREFIX_CHANGE: "${newPrefix}" by ${ownerNumber}\n`;
// //         fs.appendFileSync(LOG_FILE, logEntry);
        
// //         return true;
// //     } catch (error) {
// //         console.error(chalk.red('❌ Error saving prefix:'), error);
// //         return false;
// //     }
// // }

// // // Trigger bot restart
// // function triggerBotRestart() {
// //     return new Promise((resolve) => {
// //         console.log(chalk.yellow('🔄 Triggering auto-restart...'));
        
// //         // Method 1: If we have a PID file, send restart signal
// //         if (fs.existsSync(PID_FILE)) {
// //             try {
// //                 const pid = parseInt(fs.readFileSync(PID_FILE, 'utf8'));
// //                 console.log(chalk.blue(`📌 Sending restart signal to PID: ${pid}`));
                
// //                 // Send SIGUSR1 for graceful restart
// //                 process.kill(pid, 'SIGUSR1');
                
// //                 const logEntry = `[${new Date().toISOString()}] RESTART_SIGNAL: Sent to PID ${pid}\n`;
// //                 fs.appendFileSync(LOG_FILE, logEntry);
                
// //                 console.log(chalk.green('✅ Restart signal sent'));
// //                 resolve(true);
// //                 return;
// //             } catch (error) {
// //                 console.log(chalk.yellow('⚠️ Could not send signal, trying fallback...'));
// //             }
// //         }
        
// //         // Method 2: Try to use pm2 if available
// //         exec('pm2 list | grep wolf-bot', (err, stdout) => {
// //             if (!err && stdout.includes('wolf-bot')) {
// //                 console.log(chalk.blue('📌 Restarting via PM2...'));
// //                 exec('pm2 restart wolf-bot', (err) => {
// //                     if (err) {
// //                         console.log(chalk.yellow('⚠️ PM2 restart failed'));
// //                         triggerDirectRestart().then(resolve);
// //                     } else {
// //                         console.log(chalk.green('✅ PM2 restart initiated'));
// //                         resolve(true);
// //                     }
// //                 });
// //             } else {
// //                 triggerDirectRestart().then(resolve);
// //             }
// //         });
// //     });
// // }

// // // Direct restart method
// // function triggerDirectRestart() {
// //     return new Promise((resolve) => {
// //         console.log(chalk.blue('📌 Using direct restart method...'));
        
// //         // Create restart script
// //         const restartScript = `
// // // Auto-generated restart script
// // setTimeout(() => {
// //     console.log('🤖 Bot restarting...');
// //     process.exit(0);
// // }, 2000);
// // `;
        
// //         fs.writeFileSync('./_restart_timer.js', restartScript);
        
// //         // Schedule restart
// //         setTimeout(() => {
// //             console.log(chalk.yellow('⏰ Restart timer expired, exiting...'));
// //             process.exit(0); // Exit with code 0 for auto-restart
// //         }, 2000);
        
// //         resolve(true);
// //     });
// // }

// // // Validate prefix
// // function isValidPrefix(prefix) {
// //     if (!prefix || typeof prefix !== 'string') return false;
// //     if (prefix.length > 3) return false;
// //     if (prefix.includes(' ')) return false;
// //     return /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?a-zA-Z0-9]{1,3}$/.test(prefix);
// // }

// // // Check if auto-restart is available
// // function isAutoRestartAvailable() {
// //     // Check various restart methods
// //     const methods = {
// //         hasPidFile: fs.existsSync(PID_FILE),
// //         hasPm2: false, // Will check async
// //         canExit: true // Always can exit process
// //     };
    
// //     return methods;
// // }

// // // Command module
// // export default {
// //     name: 'setprefix',
// //     alias: ['prefix', 'changeprefix', 'botprefix'],
// //     description: 'Change bot command prefix (auto-restarts)',
    
// //     async execute(sock, msg, args, currentPrefix, chatBot) {
// //         const chatId = msg.key.remoteJid;
// //         const fromNumber = chatId.split('@')[0];
        
// //         console.log(chalk.blue(`🔧 Setprefix from: +${fromNumber}`));
        
// //         // Owner verification
// //         let isOwner = false;
        
// //         // Method 1: Use chatBot's function
// //         if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
// //             isOwner = chatBot.isUserAllowed();
// //         }
        
// //         // Method 2: Direct comparison
// //         if (!isOwner && chatBot.OWNER_NUMBER) {
// //             const normalize = (num) => num.replace(/[^0-9]/g, '');
// //             isOwner = normalize(fromNumber) === normalize(chatBot.OWNER_NUMBER);
// //         }
        
// //         if (!isOwner) {
// //             console.log(chalk.red(`❌ Access denied: +${fromNumber} is not owner`));
            
// //             await sock.sendMessage(chatId, {
// //                 text: `❌ *Permission Denied*\n\nOnly bot owner can change prefix.\n\nOwner: +${chatBot.OWNER_NUMBER || 'Unknown'}\nYou: +${fromNumber}`
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         console.log(chalk.green(`✅ Owner verified: +${fromNumber}`));
        
// //         // Check restart availability
// //         const restartMethods = isAutoRestartAvailable();
        
// //         // Show help if no args
// //         if (args.length === 0) {
// //             const storedPrefix = getStoredPrefix();
// //             const effectivePrefix = storedPrefix || currentPrefix || '.';
            
// //             let restartInfo = '';
// //             if (restartMethods.hasPidFile) {
// //                 restartInfo = '✅ Auto-restart: Available (PID detected)';
// //             } else {
// //                 restartInfo = '⚠️ Auto-restart: May require manual restart';
// //             }
            
// //             await sock.sendMessage(chatId, {
// //                 text: `🔤 *PREFIX COMMAND*\n\n*Current Prefix:* \`${effectivePrefix}\`\n${restartInfo}\n\n*Usage:*\n• ${effectivePrefix}setprefix <new_prefix>\n• ${effectivePrefix}setprefix reset\n• ${effectivePrefix}setprefix status\n\n*Examples:*\n${effectivePrefix}setprefix !\n${effectivePrefix}setprefix #\n${effectivePrefix}setprefix reset\n\n*Note:* Bot auto-restarts in 2 seconds after change!`
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         const action = args[0].toLowerCase();
        
// //         // Show status
// //         if (action === 'status') {
// //             const storedPrefix = getStoredPrefix();
// //             const effectivePrefix = storedPrefix || currentPrefix || '.';
            
// //             let restartStatus = '🟡 Partial';
// //             if (restartMethods.hasPidFile) restartStatus = '🟢 Available';
            
// //             await sock.sendMessage(chatId, {
// //                 text: `📊 *PREFIX STATUS*\n\n*Active Prefix:* \`${effectivePrefix}\`\n*Stored Prefix:* ${storedPrefix ? `\`${storedPrefix}\`` : 'None'}\n*Auto-restart:* ${restartStatus}\n*Owner:* +${fromNumber}\n\n*Restart Methods:*\n${restartMethods.hasPidFile ? '✅ PID file found' : '⚠️ No PID file'}\n${restartMethods.canExit ? '✅ Process exit' : '❌ Cannot exit'}\n\n*After restart:* \`${storedPrefix || '.'}command\``
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         // Reset prefix
// //         if (action === 'reset') {
// //             if (fs.existsSync(PREFIX_FILE)) {
// //                 fs.unlinkSync(PREFIX_FILE);
                
// //                 // Log reset
// //                 const logEntry = `[${new Date().toISOString()}] PREFIX_RESET: by ${fromNumber}\n`;
// //                 fs.appendFileSync(LOG_FILE, logEntry);
// //             }
            
// //             await sock.sendMessage(chatId, {
// //                 text: `🔄 *PREFIX RESET*\n\n✅ Reset to default: \`.\`\n\n🤖 *Auto-restarting in 2 seconds...*\nAfter restart, use: \`.menu\``
// //             }, { quoted: msg });
            
// //             console.log(chalk.green(`✅ Prefix reset by owner +${fromNumber}`));
            
// //             // Trigger restart after delay
// //             setTimeout(async () => {
// //                 await triggerBotRestart();
// //                 console.log(chalk.yellow('🔄 Restart sequence initiated'));
// //             }, 2000);
            
// //             return;
// //         }
        
// //         // Validate new prefix
// //         if (!isValidPrefix(action)) {
// //             await sock.sendMessage(chatId, {
// //                 text: `❌ *Invalid Prefix*\n\nPrefix must be:\n• 1-3 characters\n• No spaces\n• Valid: ! @ # $ % ^ & *\n• Or letters/numbers\n\n*Good:* ! # $ & **\n*Bad:* spaced prefix\n*Bad:* verylongprefix\n\n*Current:* \`${currentPrefix || '.'}\``
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         // Save new prefix
// //         if (savePrefixWithRestart(action, fromNumber)) {
// //             console.log(chalk.green(`✅ Prefix saved as "${action}" by +${fromNumber}`));
            
// //             // Send success message
// //             const successMessage = `✅ *PREFIX CHANGED*\n\nNew prefix: \`${action}\`\n\n🤖 *Auto-restarting in 2 seconds...*\n\n*After restart, use:*\n\`${action}menu\` - Show menu\n\`${action}info\` - Bot info\n\`${action}help\` - Help\n\n*Restart log:* ${LOG_FILE}`;
            
// //             await sock.sendMessage(chatId, { text: successMessage });
            
// //             // Send countdown
// //             for (let i = 2; i > 0; i--) {
// //                 setTimeout(async () => {
// //                     try {
// //                         await sock.sendMessage(chatId, {
// //                             text: `⏳ Restarting in ${i} second${i !== 1 ? 's' : ''}...`
// //                         });
// //                     } catch (error) {
// //                         // Ignore send errors during restart
// //                     }
// //                 }, (2 - i) * 1000);
// //             }
            
// //             console.log(chalk.yellow(`🔄 Auto-restart scheduled for prefix: "${action}"`));
            
// //             // Trigger restart after 2 seconds
// //             setTimeout(async () => {
// //                 console.log(chalk.yellow('🔄 Executing auto-restart...'));
                
// //                 // Update prefix data with restart time
// //                 try {
// //                     const prefixData = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
// //                     prefixData.restartTime = new Date().toISOString();
// //                     fs.writeFileSync(PREFIX_FILE, JSON.stringify(prefixData, null, 2));
// //                 } catch (error) {
// //                     // Ignore
// //                 }
                
// //                 // Trigger restart
// //                 const restartSuccess = await triggerBotRestart();
                
// //                 if (restartSuccess) {
// //                     console.log(chalk.green('✅ Restart initiated successfully'));
// //                 } else {
// //                     console.log(chalk.yellow('⚠️ Restart may require manual intervention'));
                    
// //                     // Send fallback message
// //                     setTimeout(async () => {
// //                         try {
// //                             await sock.sendMessage(chatId, {
// //                                 text: `⚠️ *Manual Restart Needed*\n\nPrefix saved as: \`${action}\`\n\nPlease restart your bot/server manually.\nAfter restart, use: \`${action}command\``
// //                             });
// //                         } catch (error) {
// //                             // Ignore
// //                         }
// //                     }, 3000);
// //                 }
// //             }, 2000);
            
// //         } else {
// //             await sock.sendMessage(chatId, {
// //                 text: '❌ Failed to save prefix. Please try again.'
// //             }, { quoted: msg });
// //         }
// //     }
// // };






// // // ====== COMPLETE PREFIX SYSTEM ======
// // // All-in-one: Auto-start, auto-restart, background watcher
// // import fs from 'fs';
// // import { spawn } from 'child_process';
// // import chalk from 'chalk';

// // // ====== CONFIG ======
// // const CONFIG = {
// //     PREFIX_FILE: './prefix.json',
// //     WATCHER_PID: './.prefix_watcher.pid',
// //     SETUP_FLAG: './.prefix_ready',
// //     RESTART_DELAY: 2000
// // };

// // // ====== PREFIX MANAGER ======
// // class PrefixSystem {
// //     constructor() {
// //         this.currentPrefix = this.loadPrefix();
// //         this.isWatcherRunning = false;
// //         this.startup();
// //     }
    
// //     loadPrefix() {
// //         try {
// //             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
// //                 const data = JSON.parse(fs.readFileSync(CONFIG.PREFIX_FILE, 'utf8'));
// //                 return data.prefix || '.';
// //             }
// //         } catch (error) {
// //             console.error(chalk.red('Prefix load error:'), error.message);
// //         }
// //         return '.';
// //     }
    
// //     savePrefix(newPrefix, owner) {
// //         try {
// //             const data = {
// //                 prefix: newPrefix,
// //                 owner: owner,
// //                 timestamp: new Date().toISOString(),
// //                 autoRestart: true
// //             };
            
// //             fs.writeFileSync(CONFIG.PREFIX_FILE, JSON.stringify(data, null, 2));
// //             this.currentPrefix = newPrefix;
// //             return true;
// //         } catch (error) {
// //             console.error(chalk.red('Prefix save error:'), error.message);
// //             return false;
// //         }
// //     }
    
// //     resetPrefix() {
// //         try {
// //             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
// //                 fs.unlinkSync(CONFIG.PREFIX_FILE);
// //             }
// //             this.currentPrefix = '.';
// //             return true;
// //         } catch (error) {
// //             return false;
// //         }
// //     }
    
// //     startup() {
// //         // Run auto-setup on first command execution
// //         if (!fs.existsSync(CONFIG.SETUP_FLAG)) {
// //             this.autoSetup();
// //         }
        
// //         // Start background watcher if not running
// //         this.startWatcher();
// //     }
    
// //     autoSetup() {
// //         console.log(chalk.blue('[Prefix] Running auto-setup...'));
        
// //         // Create setup flag
// //         fs.writeFileSync(CONFIG.SETUP_FLAG, JSON.stringify({
// //             setupTime: new Date().toISOString(),
// //             version: '1.0'
// //         }, null, 2));
        
// //         console.log(chalk.green('[Prefix] Auto-setup complete'));
// //     }
    
// //     startWatcher() {
// //         // Check if watcher already running
// //         if (fs.existsSync(CONFIG.WATCHER_PID)) {
// //             try {
// //                 const pid = parseInt(fs.readFileSync(CONFIG.WATCHER_PID, 'utf8'));
// //                 process.kill(pid, 0); // Check if process exists
// //                 this.isWatcherRunning = true;
// //                 return;
// //             } catch (error) {
// //                 // PID file exists but process is dead
// //                 fs.unlinkSync(CONFIG.WATCHER_PID);
// //             }
// //         }
        
// //         // Start background watcher
// //         try {
// //             const watcherCode = `
// // const fs = require('fs');
// // const PREFIX_FILE = '${CONFIG.PREFIX_FILE}';
// // let currentPrefix = '.';

// // // Load initial prefix
// // try {
// //     if (fs.existsSync(PREFIX_FILE)) {
// //         const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
// //         currentPrefix = data.prefix || '.';
// //     }
// // } catch (error) {
// //     // Silent
// // }

// // // Watch for changes
// // fs.watchFile(PREFIX_FILE, { interval: 1000 }, () => {
// //     try {
// //         if (!fs.existsSync(PREFIX_FILE)) return;
        
// //         const data = JSON.parse(fs.readFileSync(PREFIX_FILE, 'utf8'));
// //         const newPrefix = data.prefix || '.';
        
// //         if (newPrefix !== currentPrefix) {
// //             console.log('[Watcher] Prefix changed:', currentPrefix, '->', newPrefix);
// //             currentPrefix = newPrefix;
            
// //             // Wait then restart
// //             setTimeout(() => {
// //                 console.log('[Watcher] Auto-restarting bot...');
// //                 process.exit(0);
// //             }, ${CONFIG.RESTART_DELAY});
// //         }
// //     } catch (error) {
// //         // Silent error
// //     }
// // });

// // // Save PID
// // fs.writeFileSync('${CONFIG.WATCHER_PID}', process.pid.toString());

// // // Keep alive
// // console.log('[Watcher] Background watcher started');
// // setInterval(() => {}, 60000);
// // `;
            
// //             // Create watcher file
// //             fs.writeFileSync('./prefix_watcher_temp.js', watcherCode);
            
// //             // Start in background
// //             const watcher = spawn('node', ['prefix_watcher_temp.js'], {
// //                 detached: true,
// //                 stdio: 'ignore'
// //             });
            
// //             watcher.unref();
// //             this.isWatcherRunning = true;
            
// //             // Cleanup temp file after startup
// //             setTimeout(() => {
// //                 if (fs.existsSync('./prefix_watcher_temp.js')) {
// //                     fs.unlinkSync('./prefix_watcher_temp.js');
// //                 }
// //             }, 3000);
            
// //             console.log(chalk.green('[Prefix] Background watcher started'));
            
// //         } catch (error) {
// //             console.error(chalk.red('[Prefix] Watcher error:'), error.message);
// //         }
// //     }
    
// //     scheduleRestart() {
// //         console.log(chalk.yellow('[Prefix] Scheduling auto-restart...'));
        
// //         // Method 1: Use background watcher (if running)
// //         if (this.isWatcherRunning) {
// //             // Watcher will detect file change and restart
// //             return true;
// //         }
        
// //         // Method 2: Direct exit (fallback)
// //         setTimeout(() => {
// //             console.log(chalk.yellow('[Prefix] Auto-restarting now...'));
// //             process.exit(0);
// //         }, CONFIG.RESTART_DELAY);
        
// //         return true;
// //     }
// // }

// // // ====== GLOBAL INSTANCE ======
// // const prefixSystem = new PrefixSystem();

// // // ====== COMMAND MODULE ======
// // export default {
// //     name: 'setprefix',
// //     alias: ['prefix', 'changeprefix', 'botprefix'],
// //     description: 'Change bot prefix (auto-restarts)',
    
// //     async execute(sock, msg, args, currentPrefix, chatBot) {
// //         const chatId = msg.key.remoteJid;
// //         const sender = chatId.split('@')[0];
        
// //         // ====== OWNER VERIFICATION ======
// //         let isOwner = false;
        
// //         // Method 1: Use bot's function
// //         if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
// //             isOwner = chatBot.isUserAllowed();
// //         }
        
// //         // Method 2: Direct number comparison
// //         if (!isOwner && chatBot.OWNER_NUMBER) {
// //             const normalize = (num) => num.replace(/[^0-9]/g, '');
// //             isOwner = normalize(sender) === normalize(chatBot.OWNER_NUMBER);
// //         }
        
// //         if (!isOwner) {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '🔒 *Permission Denied*\nOnly bot owner can change prefix.' 
// //                 }, { quoted: msg });
// //             } catch (error) {
// //                 // Ignore send errors
// //             }
// //             return;
// //         }
        
// //         console.log(chalk.blue(`[Prefix] Command from owner: +${sender}`));
        
// //         // ====== COMMAND LOGIC ======
// //         const storedPrefix = prefixSystem.currentPrefix;
        
// //         // 1. NO ARGUMENTS - Show help
// //         if (args.length === 0) {
// //             const helpText = 
// //                 '🔤 *PREFIX COMMAND*\n\n' +
// //                 'Current: `' + storedPrefix + '`\n' +
// //                 'Usage: `' + storedPrefix + 'setprefix <new>`\n' +
// //                 'Example: `' + storedPrefix + 'setprefix !`\n' +
// //                 'Reset: `' + storedPrefix + 'setprefix reset`\n\n' +
// //                 '⚠️ *Bot auto-restarts after change*';
            
// //             try {
// //                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //             return;
// //         }
        
// //         const action = args[0];
        
// //         // 2. STATUS COMMAND
// //         if (action.toLowerCase() === 'status') {
// //             const statusText = 
// //                 '📊 *PREFIX STATUS*\n\n' +
// //                 'Current: `' + storedPrefix + '`\n' +
// //                 'Saved: ' + (fs.existsSync(CONFIG.PREFIX_FILE) ? '✅ Yes' : '❌ No') + '\n' +
// //                 'Watcher: ' + (prefixSystem.isWatcherRunning ? '✅ Active' : '⚠️ Inactive') + '\n' +
// //                 'Auto-restart: ✅ Enabled\n' +
// //                 'Owner: +' + sender;
            
// //             try {
// //                 await sock.sendMessage(chatId, { text: statusText });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //             return;
// //         }
        
// //         // 3. RESET COMMAND
// //         if (action.toLowerCase() === 'reset') {
// //             const success = prefixSystem.resetPrefix();
            
// //             if (success) {
// //                 try {
// //                     await sock.sendMessage(chatId, { 
// //                         text: '🔄 *PREFIX RESET*\n\n✅ Reset to default: `.`\n\n🤖 Auto-restarting in 2 seconds...' 
// //                     });
// //                 } catch (error) {
// //                     // Ignore
// //                 }
                
// //                 // Schedule auto-restart
// //                 prefixSystem.scheduleRestart();
                
// //             } else {
// //                 try {
// //                     await sock.sendMessage(chatId, { 
// //                         text: '❌ Failed to reset prefix' 
// //                     });
// //                 } catch (error) {
// //                     // Ignore
// //                 }
// //             }
// //             return;
// //         }
        
// //         // 4. VALIDATE NEW PREFIX
// //         if (action.length > 3 || action.includes(' ') || !action.trim()) {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '❌ *INVALID PREFIX*\n\nMust be:\n• 1-3 characters\n• No spaces\n• Examples: ! # $ & *' 
// //                 }, { quoted: msg });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //             return;
// //         }
        
// //         // 5. SAVE NEW PREFIX
// //         const success = prefixSystem.savePrefix(action, sender);
        
// //         if (!success) {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '❌ Failed to save prefix' 
// //                 });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //             return;
// //         }
        
// //         console.log(chalk.green(`[Prefix] Changed to: "${action}" by +${sender}`));
        
// //         // 6. SEND CONFIRMATION
// //         const confirmText = 
// //             '✅ *PREFIX CHANGED*\n\n' +
// //             'New prefix: `' + action + '`\n\n' +
// //             '🤖 *AUTO-RESTARTING IN 2 SECONDS...*\n\n' +
// //             'After restart, use:\n' +
// //             '• `' + action + 'menu` - Show menu\n' +
// //             '• `' + action + 'info` - Bot info\n' +
// //             '• `' + action + 'help` - Get help';
        
// //         try {
// //             await sock.sendMessage(chatId, { text: confirmText });
// //         } catch (error) {
// //             // Ignore send errors
// //         }
        
// //         // 7. COUNTDOWN MESSAGES (Optional)
// //         setTimeout(async () => {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '⏳ Restarting in 1 second...' 
// //                 });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //         }, 1000);
        
// //         // 8. SCHEDULE AUTO-RESTART
// //         prefixSystem.scheduleRestart();
// //     }
// // };

// // // ====== AUTO-START WATCHER ON MODULE LOAD ======
// // // This runs when the module is loaded by the bot
// // console.log(chalk.blue('[Prefix] System initialized'));

























// // // ====== COMPLETE PREFIX SYSTEM - FIXED ======
// // // Forces full bot restart when prefix changes
// // import fs from 'fs';
// // import { spawn } from 'child_process';
// // import chalk from 'chalk';

// // // ====== CONFIG ======
// // const CONFIG = {
// //     PREFIX_FILE: './prefix.json',
// //     RESTART_DELAY: 3000,
// //     RESTART_SIGNAL: 'SIGTERM',
// //     MAX_PREFIX_LENGTH: 3
// // };

// // // ====== FORCE RESTART SYSTEM ======
// // class ForceRestarter {
// //     // Method 1: Send signal to main process
// //     static signalRestart() {
// //         console.log(chalk.yellow('[Restart] Sending restart signal...'));
        
// //         // Send signal to current process
// //         setTimeout(() => {
// //             console.log(chalk.green('[Restart] Force restarting bot...'));
            
// //             // Method 1: Exit with restart code
// //             process.exit(10); // Special exit code for restart
            
// //         }, CONFIG.RESTART_DELAY);
// //     }
    
// //     // Method 2: Create restart script
// //     static createRestartScript() {
// //         const restartScript = `
// // // Auto-restart script
// // console.log('🤖 Bot restart initiated...');
// // setTimeout(() => {
// //     console.log('🔁 Force restarting...');
    
// //     // Try to kill parent process
// //     try {
// //         process.kill(process.ppid, '${CONFIG.RESTART_SIGNAL}');
// //     } catch (error) {
// //         // Ignore
// //     }
    
// //     // Exit with restart code
// //     process.exit(10);
// // }, 1000);
// // `;
        
// //         fs.writeFileSync('./_force_restart.js', restartScript);
        
// //         // Execute restart script
// //         spawn('node', ['_force_restart.js'], {
// //             detached: true,
// //             stdio: 'ignore'
// //         }).unref();
        
// //         // Cleanup
// //         setTimeout(() => {
// //             if (fs.existsSync('./_force_restart.js')) {
// //                 fs.unlinkSync('./_force_restart.js');
// //             }
// //         }, 5000);
// //     }
    
// //     // Method 3: Direct process kill (most effective)
// //     static killAndRestart() {
// //         console.log(chalk.red('[Restart] Killing bot process for restart...'));
        
// //         // Save restart flag
// //         fs.writeFileSync('./.restarting', new Date().toISOString());
        
// //         // Schedule the kill
// //         setTimeout(() => {
// //             console.log(chalk.green('[Restart] Executing force restart NOW'));
            
// //             // Force exit
// //             if (typeof process.exit === 'function') {
// //                 process.exit(0); // Clean exit
// //             }
// //         }, CONFIG.RESTART_DELAY);
// //     }
// // }

// // // ====== PREFIX MANAGER ======
// // class PrefixManager {
// //     constructor() {
// //         this.currentPrefix = this.loadPrefix();
// //         this.hasChanges = false;
// //     }
    
// //     loadPrefix() {
// //         try {
// //             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
// //                 const data = JSON.parse(fs.readFileSync(CONFIG.PREFIX_FILE, 'utf8'));
// //                 return data.prefix || '.';
// //             }
// //         } catch (error) {
// //             console.error(chalk.red('[Prefix] Load error:'), error.message);
// //         }
// //         return '.';
// //     }
    
// //     savePrefix(newPrefix, owner) {
// //         try {
// //             const data = {
// //                 prefix: newPrefix,
// //                 owner: owner,
// //                 timestamp: new Date().toISOString(),
// //                 requiresRestart: true,
// //                 restartScheduled: false
// //             };
            
// //             fs.writeFileSync(CONFIG.PREFIX_FILE, JSON.stringify(data, null, 2));
// //             this.currentPrefix = newPrefix;
// //             this.hasChanges = true;
            
// //             // Mark that restart is required
// //             this.markForRestart();
            
// //             return true;
// //         } catch (error) {
// //             console.error(chalk.red('[Prefix] Save error:'), error.message);
// //             return false;
// //         }
// //     }
    
// //     markForRestart() {
// //         // Create restart flag file
// //         const restartData = {
// //             restartTime: new Date().toISOString(),
// //             newPrefix: this.currentPrefix,
// //             scheduled: true
// //         };
        
// //         fs.writeFileSync('./.prefix_restart', JSON.stringify(restartData, null, 2));
// //     }
    
// //     resetPrefix() {
// //         try {
// //             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
// //                 fs.unlinkSync(CONFIG.PREFIX_FILE);
// //             }
            
// //             // Also remove restart flag
// //             if (fs.existsSync('./.prefix_restart')) {
// //                 fs.unlinkSync('./.prefix_restart');
// //             }
            
// //             this.currentPrefix = '.';
// //             this.hasChanges = true;
// //             this.markForRestart();
            
// //             return true;
// //         } catch (error) {
// //             return false;
// //         }
// //     }
    
// //     forceRestart() {
// //         console.log(chalk.yellow('[Prefix] FORCING FULL BOT RESTART...'));
        
// //         // Show countdown in console
// //         console.log(chalk.cyan(`[Prefix] Restarting in ${CONFIG.RESTART_DELAY/1000} seconds...`));
        
// //         // Method 1: Use the most effective restart method
// //         ForceRestarter.killAndRestart();
        
// //         return true;
// //     }
// // }

// // // ====== GLOBAL INSTANCE ======
// // const prefixManager = new PrefixManager();

// // // ====== COMMAND MODULE ======
// // export default {
// //     name: 'setprefix',
// //     alias: ['prefix', 'changeprefix'],
    
// //     async execute(sock, msg, args, currentPrefix, chatBot) {
// //         const chatId = msg.key.remoteJid;
// //         const sender = chatId.split('@')[0];
        
// //         // ====== OWNER CHECK ======
// //         let isOwner = false;
        
// //         if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
// //             isOwner = chatBot.isUserAllowed();
// //         }
        
// //         if (!isOwner && chatBot.OWNER_NUMBER) {
// //             const normalize = (num) => num.replace(/[^0-9]/g, '');
// //             isOwner = normalize(sender) === normalize(chatBot.OWNER_NUMBER);
// //         }
        
// //         if (!isOwner) {
// //             await sock.sendMessage(chatId, { 
// //                 text: '🔒 Owner only command' 
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         console.log(chalk.blue(`[Prefix] Command from owner: +${sender}`));
        
// //         // ====== LOAD CURRENT PREFIX ======
// //         const storedPrefix = prefixManager.currentPrefix;
        
// //         // ====== NO ARGUMENTS - SHOW HELP ======
// //         if (args.length === 0) {
// //             const helpText = 
// //                 '🔤 *PREFIX COMMAND*\n\n' +
// //                 'Current: `' + storedPrefix + '`\n' +
// //                 'Usage: `' + storedPrefix + 'setprefix <new>`\n' +
// //                 'Example: `' + storedPrefix + 'setprefix !`\n' +
// //                 'Reset: `' + storedPrefix + 'setprefix reset`\n\n' +
// //                 '⚠️ *Bot performs FULL RESTART after change*';
            
// //             await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
// //             return;
// //         }
        
// //         const action = args[0];
        
// //         // ====== STATUS COMMAND ======
// //         if (action.toLowerCase() === 'status') {
// //             const needsRestart = fs.existsSync('./.prefix_restart');
// //             const statusText = 
// //                 '📊 *PREFIX STATUS*\n\n' +
// //                 'Current: `' + storedPrefix + '`\n' +
// //                 'Saved: ' + (fs.existsSync(CONFIG.PREFIX_FILE) ? '✅ Yes' : '❌ No') + '\n' +
// //                 'Restart Pending: ' + (needsRestart ? '⚠️ Yes' : '✅ No') + '\n' +
// //                 'Force Restart: ✅ Enabled\n' +
// //                 'Owner: +' + sender;
            
// //             await sock.sendMessage(chatId, { text: statusText });
// //             return;
// //         }
        
// //         // ====== RESET COMMAND ======
// //         if (action.toLowerCase() === 'reset') {
// //             const success = prefixManager.resetPrefix();
            
// //             if (success) {
// //                 const successText = 
// //                     '🔄 *PREFIX RESET*\n\n' +
// //                     '✅ Successfully reset to default: `.`\n\n' +
// //                     '🤖 *FULL BOT RESTART IN 3 SECONDS...*\n\n' +
// //                     '✅ *Reset successful! Bot will restart completely.*';
                
// //                 await sock.sendMessage(chatId, { text: successText });
                
// //                 // Force full restart
// //                 prefixManager.forceRestart();
                
// //             } else {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '❌ Failed to reset prefix' 
// //                 });
// //             }
// //             return;
// //         }
        
// //         // ====== VALIDATE NEW PREFIX ======
// //         if (action.length > CONFIG.MAX_PREFIX_LENGTH || 
// //             action.includes(' ') || 
// //             !action.trim()) {
// //             await sock.sendMessage(chatId, { 
// //                 text: '❌ *INVALID PREFIX*\n\nMust be:\n• 1-3 characters\n• No spaces\n• Examples: ! # $ & *' 
// //             }, { quoted: msg });
// //             return;
// //         }
        
// //         // ====== SAVE NEW PREFIX ======
// //         const success = prefixManager.savePrefix(action, sender);
        
// //         if (!success) {
// //             await sock.sendMessage(chatId, { 
// //                 text: '❌ Failed to save prefix' 
// //             });
// //             return;
// //         }
        
// //         console.log(chalk.green(`[Prefix] Changed to: "${action}" by +${sender}`));
        
// //         // ====== SEND SUCCESS MESSAGE ======
// //         const successText = 
// //             '✅ *PREFIX SUCCESSFULLY CHANGED*\n\n' +
// //             '✅ Successfully changed to: `' + action + '`\n\n' +
// //             '🤖 *FULL BOT RESTART IN 3 SECONDS...*\n\n' +
// //             'After restart, use:\n' +
// //             '• `' + action + 'menu` - Show menu\n' +
// //             '• `' + action + 'info` - Bot info\n' +
// //             '• `' + action + 'help` - Get help\n\n' +
// //             '✅ *Prefix change complete! Bot will restart.*';
        
// //         await sock.sendMessage(chatId, { text: successText });
        
// //         // ====== COUNTDOWN MESSAGES ======
// //         setTimeout(async () => {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '⏳ Restarting in 2 seconds...' 
// //                 });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //         }, 1000);
        
// //         setTimeout(async () => {
// //             try {
// //                 await sock.sendMessage(chatId, { 
// //                     text: '⏳ Restarting in 1 second...' 
// //                 });
// //             } catch (error) {
// //                 // Ignore
// //             }
// //         }, 2000);
        
// //         // ====== FORCE FULL RESTART ======
// //         prefixManager.forceRestart();
// //     }
// // };

// // // ====== CHECK FOR PENDING RESTART ======
// // // This runs when module loads
// // console.log(chalk.blue('[Prefix] System loaded'));
// // console.log(chalk.gray('[Prefix] Force restart system: ACTIVE'));

// // // Check if there's a pending restart from previous session
// // if (fs.existsSync('./.prefix_restart')) {
// //     console.log(chalk.yellow('[Prefix] Restart flag found from previous session'));
// //     console.log(chalk.yellow('[Prefix] Bot may need manual restart'));
// // }







// // ====== LIVE PREFIX SYSTEM ======
// // Changes prefix immediately without restarting
// import fs from 'fs';
// import chalk from 'chalk';

// // ====== CONFIG ======
// const CONFIG = {
//     PREFIX_FILE: './prefix.json',
//     MAX_PREFIX_LENGTH: 3
// };

// // ====== LIVE PREFIX MANAGER ======
// class LivePrefixManager {
//     constructor() {
//         this.currentPrefix = this.loadPrefix();
//         this.listeners = new Set();
//     }
    
//     loadPrefix() {
//         try {
//             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
//                 const data = JSON.parse(fs.readFileSync(CONFIG.PREFIX_FILE, 'utf8'));
//                 return data.prefix || '.';
//             }
//         } catch (error) {
//             console.error(chalk.red('[Prefix] Load error:'), error.message);
//         }
//         return '.';
//     }
    
//     savePrefix(newPrefix, owner) {
//         try {
//             const data = {
//                 prefix: newPrefix,
//                 owner: owner,
//                 timestamp: new Date().toISOString(),
//                 version: 'live'
//             };
            
//             fs.writeFileSync(CONFIG.PREFIX_FILE, JSON.stringify(data, null, 2));
            
//             // Update current prefix
//             const oldPrefix = this.currentPrefix;
//             this.currentPrefix = newPrefix;
            
//             // Notify all listeners about the change
//             this.notifyListeners(oldPrefix, newPrefix);
            
//             console.log(chalk.green(`[Prefix] Live change: "${oldPrefix}" → "${newPrefix}"`));
//             return true;
            
//         } catch (error) {
//             console.error(chalk.red('[Prefix] Save error:'), error.message);
//             return false;
//         }
//     }
    
//     resetPrefix() {
//         try {
//             if (fs.existsSync(CONFIG.PREFIX_FILE)) {
//                 fs.unlinkSync(CONFIG.PREFIX_FILE);
//             }
            
//             const oldPrefix = this.currentPrefix;
//             this.currentPrefix = '.';
            
//             // Notify listeners
//             this.notifyListeners(oldPrefix, '.');
            
//             console.log(chalk.green(`[Prefix] Reset: "${oldPrefix}" → "."`));
//             return true;
//         } catch (error) {
//             return false;
//         }
//     }
    
//     addListener(listener) {
//         this.listeners.add(listener);
//     }
    
//     removeListener(listener) {
//         this.listeners.delete(listener);
//     }
    
//     notifyListeners(oldPrefix, newPrefix) {
//         this.listeners.forEach(listener => {
//             try {
//                 listener(oldPrefix, newPrefix);
//             } catch (error) {
//                 // Ignore listener errors
//             }
//         });
//     }
    
//     getPrefix() {
//         return this.currentPrefix;
//     }
// }

// // ====== GLOBAL INSTANCE ======
// const prefixManager = new LivePrefixManager();

// // ====== COMMAND MODULE ======
// export default {
//     name: 'setprefix',
//     alias: ['prefix', 'changeprefix', 'liveprefix'],
//     description: 'Change prefix immediately (no restart)',
    
//     async execute(sock, msg, args, currentPrefix, chatBot) {
//         const chatId = msg.key.remoteJid;
//         const sender = chatId.split('@')[0];
        
//         // ====== OWNER CHECK ======
//         let isOwner = false;
        
//         if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
//             isOwner = chatBot.isUserAllowed();
//         }
        
//         if (!isOwner && chatBot.OWNER_NUMBER) {
//             const normalize = (num) => num.replace(/[^0-9]/g, '');
//             isOwner = normalize(sender) === normalize(chatBot.OWNER_NUMBER);
//         }
        
//         if (!isOwner) {
//             await sock.sendMessage(chatId, { 
//                 text: '🔒 Owner only command' 
//             }, { quoted: msg });
//             return;
//         }
        
//         console.log(chalk.blue(`[Prefix] Command from owner: +${sender}`));
        
//         // ====== LOAD CURRENT PREFIX ======
//         const storedPrefix = prefixManager.getPrefix();
        
//         // ====== NO ARGUMENTS - SHOW HELP ======
//         if (args.length === 0) {
//             const helpText = 
//                 '🔤 *LIVE PREFIX SYSTEM*\n\n' +
//                 'Current: `' + storedPrefix + '`\n' +
//                 'Usage: `' + storedPrefix + 'setprefix <new>`\n' +
//                 'Example: `' + storedPrefix + 'setprefix !`\n' +
//                 'Reset: `' + storedPrefix + 'setprefix reset`\n' +
//                 'Status: `' + storedPrefix + 'setprefix status`\n\n' +
//                 '⚡ *No restart required!*';
            
//             await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//             return;
//         }
        
//         const action = args[0];
        
//         // ====== STATUS COMMAND ======
//         if (action.toLowerCase() === 'status') {
//             const statusText = 
//                 '📊 *LIVE PREFIX STATUS*\n\n' +
//                 'Current: `' + storedPrefix + '`\n' +
//                 'Saved: ' + (fs.existsSync(CONFIG.PREFIX_FILE) ? '✅ Yes' : '❌ No') + '\n' +
//                 'Mode: ⚡ Live (no restart)\n' +
//                 'Owner: +' + sender + '\n\n' +
//                 '💡 *Test immediately:*\n' +
//                 '`' + storedPrefix + 'menu`';
            
//             await sock.sendMessage(chatId, { text: statusText });
//             return;
//         }
        
//         // ====== RESET COMMAND ======
//         if (action.toLowerCase() === 'reset') {
//             const success = prefixManager.resetPrefix();
            
//             if (success) {
//                 const successText = 
//                     '🔄 *PREFIX RESET*\n\n' +
//                     '✅ Successfully reset to default: `.`\n\n' +
//                     '🎯 *Ready to use immediately!*\n' +
//                     'No restart required.\n\n' +
//                     '💡 *Test:* `.menu`';
                
//                 await sock.sendMessage(chatId, { text: successText });
                
//                 // Also update the bot's current prefix if we can
//                 try {
//                     if (global.PREFIX) {
//                         global.PREFIX = '.';
//                         console.log(chalk.green('[Prefix] Updated global.PREFIX to "."'));
//                     }
//                 } catch (error) {
//                     // Ignore
//                 }
                
//             } else {
//                 await sock.sendMessage(chatId, { 
//                     text: '❌ Failed to reset prefix' 
//                 });
//             }
//             return;
//         }
        
//         // ====== VALIDATE NEW PREFIX ======
//         if (action.length > CONFIG.MAX_PREFIX_LENGTH || 
//             action.includes(' ') || 
//             !action.trim()) {
//             await sock.sendMessage(chatId, { 
//                 text: '❌ *INVALID PREFIX*\n\nMust be:\n• 1-3 characters\n• No spaces\n• Examples: ! # $ & *' 
//             }, { quoted: msg });
//             return;
//         }
        
//         // ====== SAVE NEW PREFIX ======
//         const success = prefixManager.savePrefix(action, sender);
        
//         if (!success) {
//             await sock.sendMessage(chatId, { 
//                 text: '❌ Failed to save prefix' 
//             });
//             return;
//         }
        
//         console.log(chalk.green(`[Prefix] Live change to: "${action}" by +${sender}`));
        
//         // ====== SEND SUCCESS MESSAGE ======
//         const successText = 
//             '✅ *PREFIX CHANGED LIVE!*\n\n' +
//             '✅ Successfully changed to: `' + action + '`\n\n' +
//             '⚡ *NO RESTART REQUIRED!*\n' +
//             'Use immediately:\n' +
//             '• `' + action + 'menu` - Show menu\n' +
//             '• `' + action + 'info` - Bot info\n' +
//             '• `' + action + 'help` - Get help\n\n' +
//             '🎯 *Ready to use now!*';
        
//         await sock.sendMessage(chatId, { text: successText });
        
//         // ====== TRY TO UPDATE BOT'S PREFIX IMMEDIATELY ======
//         try {
//             // Method 1: Update global.PREFIX if it exists
//             if (global.PREFIX) {
//                 global.PREFIX = action;
//                 console.log(chalk.green(`[Prefix] Updated global.PREFIX to "${action}"`));
//             }
            
//             // Method 2: Update chatBot.PREFIX if it exists
//             if (chatBot.PREFIX) {
//                 chatBot.PREFIX = action;
//             }
            
//             // Method 3: Create a global prefix getter
//             if (!global.getCurrentPrefix) {
//                 global.getCurrentPrefix = () => {
//                     try {
//                         if (fs.existsSync(CONFIG.PREFIX_FILE)) {
//                             const data = JSON.parse(fs.readFileSync(CONFIG.PREFIX_FILE, 'utf8'));
//                             return data.prefix || '.';
//                         }
//                     } catch (error) {
//                         // Silent
//                     }
//                     return '.';
//                 };
//                 console.log(chalk.green('[Prefix] Created global.getCurrentPrefix()'));
//             }
            
//         } catch (error) {
//             console.log(chalk.yellow('[Prefix] Could not update bot prefix directly'));
//             console.log(chalk.yellow('[Prefix] User will need to use new prefix manually'));
//         }
        
//         // ====== SEND TEST REMINDER ======
//         setTimeout(async () => {
//             try {
//                 await sock.sendMessage(chatId, { 
//                     text: '💡 *Test it now:*\n`' + action + 'menu`' 
//                 });
//             } catch (error) {
//                 // Ignore
//             }
//         }, 2000);
//     }
// };

// // ====== ADD LISTENER TO UPDATE BOT ======
// // This tries to update the bot's command handler when prefix changes
// prefixManager.addListener((oldPrefix, newPrefix) => {
//     console.log(chalk.blue(`[Prefix] Listener: "${oldPrefix}" → "${newPrefix}"`));
    
//     // Try to patch the message handler
//     try {
//         // Look for message handler in global scope
//         if (global.handleIncomingMessage) {
//             // Store original handler
//             const originalHandler = global.handleIncomingMessage.toString();
            
//             // Replace old prefix with new prefix in the function
//             if (originalHandler.includes(`startsWith('${oldPrefix}')`)) {
//                 const updatedHandler = originalHandler.replace(
//                     new RegExp(`startsWith\\('${oldPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'\\)`, 'g'),
//                     `startsWith('${newPrefix}')`
//                 );
                
//                 // Update the function
//                 eval(`global.handleIncomingMessage = ${updatedHandler}`);
//                 console.log(chalk.green(`[Prefix] Patched handleIncomingMessage to use "${newPrefix}"`));
//             }
//         }
//     } catch (error) {
//         console.log(chalk.yellow('[Prefix] Could not patch handler:', error.message));
//     }
// });

// // ====== INITIALIZE ======
// console.log(chalk.blue('[Prefix] Live prefix system loaded'));
// console.log(chalk.green('[Prefix] Current prefix:', prefixManager.getPrefix()));
// console.log(chalk.gray('[Prefix] No restart required for changes'));














// ====== REAL-TIME PREFIX SYSTEM ======
// Makes bot actually read from prefix.json
import fs from 'fs';
import chalk from 'chalk';

// ====== CONFIG ======
const CONFIG = {
    PREFIX_FILE: './prefix.json',
    MAX_PREFIX_LENGTH: 3
};

// ====== GLOBAL PREFIX OVERRIDE ======
// This will override how the bot checks for prefix
function installPrefixOverride() {
    console.log(chalk.yellow('[Prefix] Installing global prefix override...'));
    
    try {
        // Create a global function that checks against saved prefix
        if (!global.checkPrefix) {
            global.checkPrefix = function(textMsg) {
                // Get live prefix from file
                const livePrefix = getLivePrefix();
                return textMsg.startsWith(livePrefix);
            };
            console.log(chalk.green('[Prefix] Created global.checkPrefix()'));
        }
        
        // Create easy access to current prefix
        if (!global.getCurrentPrefix) {
            global.getCurrentPrefix = getLivePrefix;
            console.log(chalk.green('[Prefix] Created global.getCurrentPrefix()'));
        }
        
        // Store prefix in global for easy access
        global.LIVE_PREFIX = getLivePrefix();
        console.log(chalk.green(`[Prefix] Set global.LIVE_PREFIX = "${global.LIVE_PREFIX}"`));
        
        return true;
        
    } catch (error) {
        console.log(chalk.red('[Prefix] Override failed:', error.message));
        return false;
    }
}

// ====== UTILITY FUNCTIONS ======
function getLivePrefix() {
    try {
        if (fs.existsSync(CONFIG.PREFIX_FILE)) {
            const data = JSON.parse(fs.readFileSync(CONFIG.PREFIX_FILE, 'utf8'));
            return data.prefix || '.';
        }
    } catch (error) {
        console.error(chalk.red('[Prefix] Read error:'), error.message);
    }
    return '.';
}

function saveLivePrefix(newPrefix, owner) {
    try {
        const data = {
            prefix: newPrefix,
            owner: owner,
            timestamp: new Date().toISOString(),
            version: 'real-time'
        };
        
        fs.writeFileSync(CONFIG.PREFIX_FILE, JSON.stringify(data, null, 2));
        
        // Update global prefix immediately
        global.LIVE_PREFIX = newPrefix;
        console.log(chalk.green(`[Prefix] Updated global.LIVE_PREFIX to "${newPrefix}"`));
        
        return true;
    } catch (error) {
        console.error(chalk.red('[Prefix] Save error:'), error.message);
        return false;
    }
}

// ====== PATCH THE BOT'S MESSAGE HANDLER ======
function patchMessageHandler() {
    console.log(chalk.yellow('[Prefix] Attempting to patch message handler...'));
    
    try {
        // Find and patch the handleIncomingMessage function
        // This is a bit hacky but works
        
        // First, let's create a wrapper for textMsg.startsWith
        const originalStartsWith = String.prototype.startsWith;
        
        if (!String.prototype._originalStartsWith) {
            String.prototype._originalStartsWith = originalStartsWith;
        }
        
        // Create patched version
        String.prototype.startsWith = function(searchString, position) {
            // If checking for PREFIX, use live prefix instead
            if (searchString === global.PREFIX || searchString === (global.PREFIX || '.')) {
                const livePrefix = getLivePrefix();
                return this._originalStartsWith(livePrefix, position);
            }
            return this._originalStartsWith(searchString, position);
        };
        
        console.log(chalk.green('[Prefix] Patched String.prototype.startsWith'));
        return true;
        
    } catch (error) {
        console.log(chalk.red('[Prefix] Patch failed:', error.message));
        return false;
    }
}

// ====== COMMAND MODULE ======
export default {
    name: 'setprefix',
    alias: ['prefix', 'realprefix', 'fixprefix'],
    description: 'Change prefix - bot reads from prefix.json',
    
    async execute(sock, msg, args, currentPrefix, chatBot) {
        const chatId = msg.key.remoteJid;
        const sender = chatId.split('@')[0];
        
        // ====== OWNER CHECK ======
        let isOwner = false;
        
        if (chatBot.isUserAllowed && typeof chatBot.isUserAllowed === 'function') {
            isOwner = chatBot.isUserAllowed();
        }
        
        if (!isOwner && chatBot.OWNER_NUMBER) {
            const normalize = (num) => num.replace(/[^0-9]/g, '');
            isOwner = normalize(sender) === normalize(chatBot.OWNER_NUMBER);
        }
        
        if (!isOwner) {
            await sock.sendMessage(chatId, { 
                text: '🔒 Owner only command' 
            }, { quoted: msg });
            return;
        }
        
        console.log(chalk.blue(`[Prefix] Command from: +${sender}`));
        
        // ====== INSTALL OVERRIDE ON FIRST USE ======
        if (!global.checkPrefix) {
            installPrefixOverride();
            patchMessageHandler();
        }
        
        // ====== LOAD CURRENT PREFIX ======
        const livePrefix = getLivePrefix();
        
        // ====== NO ARGUMENTS - SHOW HELP ======
        if (args.length === 0) {
            const helpText = 
                '🔤 *REAL-TIME PREFIX*\n\n' +
                '✅ *Live Prefix:* `' + livePrefix + '`\n' +
                '🤖 *Bot Prefix:* `' + (currentPrefix || '.') + '`\n\n' +
                'Usage: `' + livePrefix + 'setprefix <new>`\n' +
                'Example: `' + livePrefix + 'setprefix !`\n' +
                'Reset: `' + livePrefix + 'setprefix reset`\n\n' +
                '⚡ *Bot reads from prefix.json*';
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
            return;
        }
        
        const action = args[0];
        
        // ====== STATUS COMMAND ======
        if (action.toLowerCase() === 'status') {
            const isPatched = !!global.checkPrefix;
            const hasOverride = !!global.LIVE_PREFIX;
            
            const statusText = 
                '📊 *PREFIX SYSTEM STATUS*\n\n' +
                '✅ *Live Prefix:* `' + livePrefix + '`\n' +
                '🤖 *Bot Prefix:* `' + (currentPrefix || '.') + '`\n' +
                '📁 *File Exists:* ' + (fs.existsSync(CONFIG.PREFIX_FILE) ? '✅ Yes' : '❌ No') + '\n' +
                '⚡ *System Patched:* ' + (isPatched ? '✅ Yes' : '❌ No') + '\n' +
                '🎯 *Override Active:* ' + (hasOverride ? '✅ Yes' : '❌ No') + '\n\n' +
                '💡 *Bot should respond to:*\n' +
                '`' + livePrefix + 'command`';
            
            await sock.sendMessage(chatId, { text: statusText });
            return;
        }
        
        // ====== RESET COMMAND ======
        if (action.toLowerCase() === 'reset') {
            if (fs.existsSync(CONFIG.PREFIX_FILE)) {
                fs.unlinkSync(CONFIG.PREFIX_FILE);
            }
            
            // Update global
            global.LIVE_PREFIX = '.';
            
            const successText = 
                '🔄 *PREFIX RESET*\n\n' +
                '✅ Reset to default: `.`\n\n' +
                '🎯 *Bot should now respond to:*\n' +
                '• `.menu`\n' +
                '• `.info`\n' +
                '• `.help`\n\n' +
                '🧪 *Test it:* `.menu`';
            
            await sock.sendMessage(chatId, { text: successText });
            return;
        }
        
        // ====== VALIDATE NEW PREFIX ======
        if (action.length > CONFIG.MAX_PREFIX_LENGTH || 
            action.includes(' ') || 
            !action.trim()) {
            await sock.sendMessage(chatId, { 
                text: '❌ *INVALID PREFIX*\n\nMust be:\n• 1-3 characters\n• No spaces\n• Examples: ! # $ & *' 
            }, { quoted: msg });
            return;
        }
        
        // ====== SAVE NEW PREFIX ======
        const saveSuccess = saveLivePrefix(action, sender);
        
        if (!saveSuccess) {
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to save prefix' 
            });
            return;
        }
        
        console.log(chalk.green(`[Prefix] Saved to prefix.json: "${action}"`));
        
        // ====== SEND SUCCESS MESSAGE ======
        const successText = 
            '✅ *PREFIX UPDATED IN REAL-TIME!*\n\n' +
            '✅ New prefix: `' + action + '`\n\n' +
            '📁 *Saved to:* prefix.json\n' +
            '⚡ *Bot reading from file*\n\n' +
            '🎯 *TEST IMMEDIATELY:*\n' +
            'Type: `' + action + 'menu`\n\n' +
            '🤖 *Bot should respond!*';
        
        await sock.sendMessage(chatId, { text: successText });
        
        // ====== TEST IT FOR THE USER ======
        setTimeout(async () => {
            try {
                // Auto-test by sending a test command
                const testMessage = 
                    '🧪 *AUTO-TESTING...*\n\n' +
                    'Trying: `' + action + 'menu`\n' +
                    'Bot should respond below ⬇️';
                
                await sock.sendMessage(chatId, { text: testMessage });
                
                // Send the actual command as if user typed it
                setTimeout(async () => {
                    try {
                        // Simulate the command
                        await sock.sendMessage(chatId, { 
                            text: action + 'menu'
                        });
                    } catch (error) {
                        // Ignore
                    }
                }, 1000);
                
            } catch (error) {
                // Ignore test errors
            }
        }, 2000);
        
        // ====== SEND INSTRUCTIONS ======
        setTimeout(async () => {
            try {
                const instructions = 
                    '💡 *HOW IT WORKS:*\n\n' +
                    '1. Prefix saved to `prefix.json`\n' +
                    '2. Bot reads from that file\n' +
                    '3. Commands check against saved prefix\n' +
                    '4. No restart needed!\n\n' +
                    '🎯 *USE:* `' + action + 'command`';
                
                await sock.sendMessage(chatId, { text: instructions });
            } catch (error) {
                // Ignore
            }
        }, 5000);
    }
};

// ====== INITIAL SETUP ======
console.log(chalk.blue('[Prefix] Real-time prefix system loaded'));
console.log(chalk.green('[Prefix] Reading from prefix.json'));

// Auto-install override when module loads
setTimeout(() => {
    installPrefixOverride();
    patchMessageHandler();
}, 1000);