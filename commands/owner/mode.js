// // export default {
// //     name: 'mode',
// //     alias: ['botmode', 'setmode'],
// //     category: 'owner',
// //     description: 'Change bot operating mode (Owner only)',
// //     ownerOnly: true,
    
// //     async execute(sock, msg, args, PREFIX, extra) {
// //         const chatId = msg.key.remoteJid;
        
// //         const fs = require('fs');
// //         const modeFile = './bot_mode.json';
        
// //         // Available modes
// //         const modes = {
// //             'public': {
// //                 name: '🌍 Public Mode',
// //                 description: 'Bot responds to everyone',
// //                 commands: 'All commands available'
// //             },
// //             'private': {
// //                 name: '🔒 Private Mode',
// //                 description: 'Bot responds only to owner',
// //                 commands: 'Owner commands only'
// //             },
// //             'group-only': {
// //                 name: '👥 Group Only',
// //                 description: 'Bot works in groups only',
// //                 commands: 'All commands in groups only'
// //             },
// //             'maintenance': {
// //                 name: '🔧 Maintenance',
// //                 description: 'Bot is in maintenance mode',
// //                 commands: 'Only status/ping commands'
// //             }
// //         };
        
// //         // Show current mode if no args
// //         if (!args[0]) {
// //             const current = modes['public']; // Default
            
// //             let modeList = '';
// //             Object.keys(modes).forEach(mode => {
// //                 modeList += `• *${mode}* - ${modes[mode].description}\n`;
// //             });
            
// //             return sock.sendMessage(chatId, {
// //                 text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Available modes:\n${modeList}\nUsage: *${PREFIX}mode <mode_name>*\nExample: *${PREFIX}mode private*`
// //             }, { quoted: msg });
// //         }
        
// //         const requestedMode = args[0].toLowerCase();
        
// //         // Check if mode exists
// //         if (!modes[requestedMode]) {
// //             const validModes = Object.keys(modes).join(', ');
// //             return sock.sendMessage(chatId, {
// //                 text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: *${PREFIX}mode private*`
// //             }, { quoted: msg });
// //         }
        
// //         // Save new mode
// //         try {
// //             const modeData = {
// //                 mode: requestedMode,
// //                 modeName: modes[requestedMode].name,
// //                 setBy: extra.normalizeJid(msg.key.participant || chatId).cleanNumber,
// //                 setAt: new Date().toISOString(),
// //                 description: modes[requestedMode].description
// //             };
            
// //             fs.writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
// //             await sock.sendMessage(chatId, {
// //                 text: `✅ *Mode Updated*\n\nNew mode: *${modes[requestedMode].name}*\n📝 ${modes[requestedMode].description}\n\nChanges will apply immediately.`
// //             }, { quoted: msg });
            
// //         } catch (error) {
// //             await sock.sendMessage(chatId, {
// //                 text: `❌ Error saving mode: ${error.message}`
// //             }, { quoted: msg });
// //         }
// //     }
// // };









// // File: ./commands/owner/mode.js
// import { writeFileSync } from 'fs';

// export default {
//     name: 'mode',
//     alias: ['botmode'],
//     category: 'owner',
//     description: 'Change bot operating mode',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
        
//         const modeFile = './bot_mode.json';
        
//         // Available modes
//         const modes = {
//             'public': {
//                 name: '🌍 Public Mode',
//                 description: 'Bot responds to everyone',
//                 commands: 'All commands available'
//             },
//             'private': {
//                 name: '🔒 Private Mode',
//                 description: 'Bot responds only to owner',
//                 commands: 'Owner commands only'
//             },
//             'group-only': {
//                 name: '👥 Group Only',
//                 description: 'Bot works in groups only',
//                 commands: 'All commands in groups only'
//             },
//             'maintenance': {
//                 name: '🔧 Maintenance',
//                 description: 'Bot is in maintenance mode',
//                 commands: 'Only basic commands'
//             }
//         };
        
//         // Show current mode if no args
//         if (!args[0]) {
//             let modeList = '';
//             Object.keys(modes).forEach(mode => {
//                 modeList += `• *${mode}* - ${modes[mode].description}\n`;
//             });
            
//             return sock.sendMessage(chatId, {
//                 text: `🤖 *BOT MODE MANAGEMENT*\n\n📋 Available modes:\n${modeList}\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode private`
//             }, { quoted: msg });
//         }
        
//         const requestedMode = args[0].toLowerCase();
        
//         if (!modes[requestedMode]) {
//             const validModes = Object.keys(modes).join(', ');
//             return sock.sendMessage(chatId, {
//                 text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode private`
//             }, { quoted: msg });
//         }
        
//         try {
//             const modeData = {
//                 mode: requestedMode,
//                 modeName: modes[requestedMode].name,
//                 setBy: extra.OWNER_NUMBER,
//                 setAt: new Date().toISOString(),
//                 description: modes[requestedMode].description
//             };
            
//             writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
//             // Update global variable (optional)
//             if (typeof global !== 'undefined') {
//                 global.BOT_MODE = requestedMode;
//             }
            
//             await sock.sendMessage(chatId, {
//                 text: `✅ *Mode Updated*\n\nNew mode: *${modes[requestedMode].name}*\n📝 ${modes[requestedMode].description}\n\nChanges applied immediately.`
//             }, { quoted: msg });
            
//         } catch (error) {
//             await sock.sendMessage(chatId, {
//                 text: `❌ Error saving mode: ${error.message}`
//             }, { quoted: msg });
//         }
//     }
// };
















// // File: ./commands/owner/mode.js
// import { writeFileSync, readFileSync, existsSync } from 'fs';

// export default {
//     name: 'mode',
//     alias: ['botmode', 'setmode'],
//     category: 'owner',
//     description: 'Change bot operating mode',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
        
//         // Available modes
//         const modes = {
//             'public': {
//                 name: '🌍 Public Mode',
//                 description: 'Bot responds to everyone',
//                 icon: '🌍'
//             },
//             'private': {
//                 name: '🔒 Private Mode',
//                 description: 'Bot responds only to owner (sends messages)',
//                 icon: '🔒'
//             },
//             'silent': {
//                 name: '🔇 Silent Mode',
//                 description: 'Bot ignores non-owners completely (no messages sent)',
//                 icon: '🔇'
//             },
//             'group-only': {
//                 name: '👥 Group Only',
//                 description: 'Bot works in groups only',
//                 icon: '👥'
//             },
//             'maintenance': {
//                 name: '🔧 Maintenance',
//                 description: 'Only basic commands available',
//                 icon: '🔧'
//             }
//         };
        
//         // Show current mode if no args
//         if (!args[0]) {
//             let modeList = '';
//             for (const [mode, info] of Object.entries(modes)) {
//                 modeList += `${info.icon} *${mode}* - ${info.description}\n`;
//             }
            
//             // Get current mode
//             let currentMode = 'public';
//             if (existsSync('./bot_mode.json')) {
//                 try {
//                     const modeData = JSON.parse(readFileSync('./bot_mode.json', 'utf8'));
//                     currentMode = modeData.mode || 'public';
//                 } catch (error) {
//                     // Default to public
//                 }
//             }
            
//             return sock.sendMessage(chatId, {
//                 text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Current Mode: ${modes[currentMode]?.name || currentMode}\n\n📋 Available modes:\n${modeList}\n\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode silent`
//             }, { quoted: msg });
//         }
        
//         const requestedMode = args[0].toLowerCase();
        
//         if (!modes[requestedMode]) {
//             const validModes = Object.keys(modes).join(', ');
//             return sock.sendMessage(chatId, {
//                 text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode silent`
//             }, { quoted: msg });
//         }
        
//         const modeFile = './bot_mode.json';
        
//         try {
//             const modeData = {
//                 mode: requestedMode,
//                 modeName: modes[requestedMode].name,
//                 setBy: extra.OWNER_NUMBER,
//                 setAt: new Date().toISOString(),
//                 description: modes[requestedMode].description
//             };
            
//             writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
//             // Update global mode immediately
//             if (typeof global !== 'undefined') {
//                 global.BOT_MODE = requestedMode;
//             }
            
//             const modeInfo = modes[requestedMode];
            
//             await sock.sendMessage(chatId, {
//                 text: `✅ *Mode Updated*\n\n${modeInfo.icon} New mode: *${modeInfo.name}*\n📝 ${modeInfo.description}\n\nChanges applied immediately.\n\n⚠️ Note: In SILENT mode, non-owners will be completely ignored (no messages sent).`
//             }, { quoted: msg });
            
//         } catch (error) {
//             await sock.sendMessage(chatId, {
//                 text: `❌ Error saving mode: ${error.message}`
//             }, { quoted: msg });
//         }
//     }
// };
















// File: ./commands/owner/mode.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'mode',
    alias: ['botmode', 'setmode'],
    category: 'owner',
    description: 'Change bot operating mode',
    ownerOnly: true, // This is what's failing in someone else's DM
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager } = extra;
        
        // ==================== DEBUG LOGGING ====================
        console.log('\n🔍 ========= MODE COMMAND DEBUG =========');
        console.log('Chat ID:', chatId);
        console.log('From Me:', msg.key.fromMe);
        console.log('Participant:', msg.key.participant);
        console.log('Remote JID:', msg.key.remoteJid);
        
        // Get sender info
        const senderJid = msg.key.participant || chatId;
        const cleaned = jidManager.cleanJid(senderJid);
        console.log('Sender JID:', senderJid);
        console.log('Cleaned JID:', cleaned.cleanJid);
        console.log('Cleaned Number:', cleaned.cleanNumber);
        console.log('Is LID:', cleaned.isLid);
        
        // Check owner status
        const isOwner = jidManager.isOwner(msg);
        console.log('isOwner():', isOwner);
        
        // Check owner info in jidManager
        const ownerInfo = jidManager.getOwnerInfo();
        console.log('jidManager Owner:', ownerInfo.cleanNumber);
        console.log('Global OWNER_NUMBER:', global.OWNER_NUMBER);
        console.log('========================================\n');
        // ==================== END DEBUG ====================
        
        // ==================== EMERGENCY BYPASS ====================
        // If message is from LID and fromMe, it's likely the owner
        // This is a temporary fix until we solve the root issue
        const isFromMe = msg.key.fromMe;
        const isLid = senderJid.includes('@lid');
        
        if (!isOwner && isFromMe && isLid) {
            console.log('⚠️ EMERGENCY BYPASS: LID + fromMe detected, granting access');
            // We'll proceed but log this
        } else if (!isOwner) {
            // Normal owner check failed
            console.log('❌ Owner check failed!');
            
            // Send helpful error message
            let errorMsg = `❌ *Owner Only Command!*\n\n`;
            errorMsg += `Only the bot owner can use this command.\n\n`;
            errorMsg += `🔍 *Debug Info:*\n`;
            errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
            errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
            errorMsg += `├─ Type: ${isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
            errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
            errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
            
            if (isLid && isFromMe) {
                errorMsg += `⚠️ *Issue Detected:*\n`;
                errorMsg += `You're using a linked device (LID).\n`;
                errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
            } else if (!ownerInfo.cleanNumber) {
                errorMsg += `⚠️ *Issue Detected:*\n`;
                errorMsg += `Owner not set in jidManager!\n`;
                errorMsg += `Try using ${PREFIX}debugchat fix\n`;
            }
            
            return sock.sendMessage(chatId, {
                text: errorMsg
            }, { quoted: msg });
        }
        // ==================== END EMERGENCY BYPASS ====================
        
        // Available modes
        const modes = {
            'public': {
                name: '🌍 Public Mode',
                description: 'Bot responds to everyone',
                icon: '🌍'
            },
            'private': {
                name: '🔒 Private Mode',
                description: 'Bot responds only to owner (sends messages)',
                icon: '🔒'
            },
            'silent': {
                name: '🔇 Silent Mode',
                description: 'Bot ignores non-owners completely (no messages sent)',
                icon: '🔇'
            },
            'group-only': {
                name: '👥 Group Only',
                description: 'Bot works in groups only',
                icon: '👥'
            },
            'maintenance': {
                name: '🔧 Maintenance',
                description: 'Only basic commands available',
                icon: '🔧'
            }
        };
        
        // Show current mode if no args
        if (!args[0]) {
            let modeList = '';
            for (const [mode, info] of Object.entries(modes)) {
                modeList += `${info.icon} *${mode}* - ${info.description}\n`;
            }
            
            // Get current mode
            let currentMode = 'public';
            if (existsSync('./bot_mode.json')) {
                try {
                    const modeData = JSON.parse(readFileSync('./bot_mode.json', 'utf8'));
                    currentMode = modeData.mode || 'public';
                } catch (error) {
                    // Default to public
                }
            }
            
            return sock.sendMessage(chatId, {
                text: `🤖 *BOT MODE MANAGEMENT*\n\n📊 Current Mode: ${modes[currentMode]?.name || currentMode}\n\n📋 Available modes:\n${modeList}\n\nUsage: ${PREFIX}mode <mode_name>\nExample: ${PREFIX}mode silent`
            }, { quoted: msg });
        }
        
        const requestedMode = args[0].toLowerCase();
        
        if (!modes[requestedMode]) {
            const validModes = Object.keys(modes).join(', ');
            return sock.sendMessage(chatId, {
                text: `❌ Invalid mode!\n\nValid modes: ${validModes}\n\nExample: ${PREFIX}mode silent`
            }, { quoted: msg });
        }
        
        const modeFile = './bot_mode.json';
        
        try {
            // Get owner number for logging
            let setBy = 'Unknown';
            if (extra.OWNER_NUMBER) {
                setBy = extra.OWNER_NUMBER;
            } else if (ownerInfo.cleanNumber) {
                setBy = ownerInfo.cleanNumber;
            } else if (cleaned.cleanNumber) {
                setBy = cleaned.cleanNumber;
            }
            
            const modeData = {
                mode: requestedMode,
                modeName: modes[requestedMode].name,
                setBy: setBy,
                setAt: new Date().toISOString(),
                description: modes[requestedMode].description,
                setFrom: isLid ? 'LID Device' : 'Regular Device',
                chatType: chatId.includes('@g.us') ? 'Group' : 'DM',
                originalSender: cleaned.cleanJid
            };
            
            writeFileSync(modeFile, JSON.stringify(modeData, null, 2));
            
            // Update global mode immediately
            if (typeof global !== 'undefined') {
                global.BOT_MODE = requestedMode;
            }
            
            const modeInfo = modes[requestedMode];
            
            let successMsg = `✅ *Mode Updated*\n\n`;
            successMsg += `${modeInfo.icon} New mode: *${modeInfo.name}*\n`;
            successMsg += `📝 ${modeInfo.description}\n\n`;
            successMsg += `🔧 Changes applied immediately.\n\n`;
            
            if (isLid) {
                successMsg += `📱 *Note:* Changed from linked device\n`;
            }
            
            successMsg += `⚠️ In SILENT mode, non-owners will be completely ignored (no messages sent).`;
            
            await sock.sendMessage(chatId, {
                text: successMsg
            }, { quoted: msg });
            
            // Log success
            console.log(`✅ Mode changed to ${requestedMode} by ${cleaned.cleanJid}`);
            if (isLid) {
                console.log(`   ↳ Changed from LID device`);
            }
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error saving mode: ${error.message}`
            }, { quoted: msg });
        }
    }
};
