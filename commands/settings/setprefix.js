// // File: ./commands/owner/setprefix.js
// import { writeFileSync, existsSync, readFileSync } from 'fs';

// export default {
//     name: 'setprefix',
//     alias: ['prefix'],
//     category: 'owner',
//     description: 'Change bot prefix',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
        
//         if (!args[0]) {
//             return sock.sendMessage(chatId, {
//                 text: `🔧 *SET PREFIX*\n\nCurrent prefix: "${PREFIX}"\n\nUsage: ${PREFIX}setprefix <new_prefix>\nExample: ${PREFIX}setprefix !\n\n⚠️ Prefix must be 1-2 characters.`
//             }, { quoted: msg });
//         }
        
//         const newPrefix = args[0].trim();
        
//         if (newPrefix.length > 2) {
//             return sock.sendMessage(chatId, {
//                 text: '❌ Prefix too long! Use 1-2 characters maximum.\nExample: `.` `!` `#` `>>`'
//             }, { quoted: msg });
//         }
        
//         const configFile = './prefix_config.json';
        
//         try {
//             let config = {};
//             if (existsSync(configFile)) {
//                 config = JSON.parse(readFileSync(configFile, 'utf8'));
//             }
            
//             config.prefix = newPrefix;
//             config.updatedAt = new Date().toISOString();
//             config.updatedBy = extra.OWNER_NUMBER;
            
//             writeFileSync(configFile, JSON.stringify(config, null, 2));
            
//             // Update global variable (optional)
//             if (typeof global !== 'undefined') {
//                 global.CURRENT_PREFIX = newPrefix;
//             }
            
//             await sock.sendMessage(chatId, {
//                 text: `✅ *Prefix Updated*\n\nOld prefix: "${PREFIX}"\nNew prefix: "${newPrefix}"\n\nChanges applied immediately!`
//             }, { quoted: msg });
            
//         } catch (error) {
//             await sock.sendMessage(chatId, {
//                 text: `❌ Error saving prefix: ${error.message}`
//             }, { quoted: msg });
//         }
//     }
// };


// File: ./commands/owner/setprefix.js
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'setprefix',
    alias: ['prefix', 'setpre'],
    category: 'owner',
    description: 'Change bot prefix',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        
        if (!args[0]) {
            return sock.sendMessage(chatId, {
                text: `🔧 *SET PREFIX*\n\nCurrent prefix: "${PREFIX}"\n\nUsage: ${PREFIX}setprefix <new_prefix>\nExample: ${PREFIX}setprefix !\n\n⚠️ Prefix must be 1-2 characters.`
            }, { quoted: msg });
        }
        
        const newPrefix = args[0].trim();
        
        if (newPrefix.length > 2) {
            return sock.sendMessage(chatId, {
                text: '❌ Prefix too long! Use 1-2 characters maximum.\nExample: `.` `!` `#` `>>`'
            }, { quoted: msg });
        }
        
        const configFile = './prefix_config.json';
        
        try {
            let config = {};
            if (existsSync(configFile)) {
                config = JSON.parse(readFileSync(configFile, 'utf8'));
            }
            
            config.prefix = newPrefix;
            config.updatedAt = new Date().toISOString();
            config.updatedBy = extra.OWNER_NUMBER;
            
            writeFileSync(configFile, JSON.stringify(config, null, 2));
            
            // Update global prefix immediately
            if (typeof global !== 'undefined') {
                global.CURRENT_PREFIX = newPrefix;
            }
            
            await sock.sendMessage(chatId, {
                text: `✅ *Prefix Updated*\n\nOld prefix: "${PREFIX}"\nNew prefix: "${newPrefix}"\n\nChanges applied immediately!\n\nUse *${newPrefix}ping* to test.`
            }, { quoted: msg });
            
        } catch (error) {
            await sock.sendMessage(chatId, {
                text: `❌ Error saving prefix: ${error.message}`
            }, { quoted: msg });
        }
    }
};