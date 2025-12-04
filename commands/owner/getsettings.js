// // ====== getsettings.js - Bot Settings Viewer ======
// // Save as: ./commands/owner/getsettings.js

// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import dotenv from 'dotenv';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// // Load environment variables
// dotenv.config({ path: path.join(__dirname, '../../.env') });

// export default {
//     name: 'getsettings',
//     alias: ['settings', 'config', 'botconfig', 'showconfig'],
//     description: 'View all bot settings and configuration',
//     category: 'owner',
    
//     async execute(sock, msg, args) {
//         const { remoteJid } = msg.key;
//         const userJid = msg.key.participant || remoteJid;
//         const ownerJid = sock.user.id;
        
//         // Check if user is owner
//         if (userJid !== ownerJid) {
//             return await sock.sendMessage(remoteJid, {
//                 text: '❌ This command is only available to the bot owner!'
//             }, { quoted: msg });
//         }
        
//         try {
//             // Collect all settings
//             const settings = await this.collectAllSettings(sock);
            
//             // Format settings for display
//             const settingsText = this.formatSettings(settings);
            
//             // Send settings
//             await sock.sendMessage(remoteJid, {
//                 text: settingsText
//             }, { quoted: msg });
            
//             // Send additional info if needed
//             if (settings.advanced) {
//                 setTimeout(async () => {
//                     await sock.sendMessage(remoteJid, {
//                         text: `⚙️ *Advanced Settings*\n\n${settings.advanced}`
//                     });
//                 }, 1000);
//             }
            
//         } catch (error) {
//             console.error('Settings error:', error);
//             await sock.sendMessage(remoteJid, {
//                 text: '❌ Failed to load settings. Check console for errors.'
//             }, { quoted: msg });
//         }
//     },
    
//     // Collect all settings from various sources
//     async collectAllSettings(sock) {
//         const settings = {
//             basic: {},
//             connection: {},
//             features: {},
//             paths: {},
//             limits: {},
//             advanced: {}
//         };
        
//         // ====== BASIC SETTINGS ======
//         settings.basic = {
//             'Bot Name': process.env.BOT_NAME || 'Silent Wolf',
//             'Bot Version': process.env.VERSION || '1.0.0',
//             'Prefix': this.getCurrentPrefix(),
//             'Owner Number': sock.user.id.split('@')[0] || 'Not set',
//             'Owner JID': sock.user.id || 'Not connected',
//             'Bot Mode': process.env.MODE || 'public',
//             'Language': process.env.LANGUAGE || 'en'
//         };
        
//         // ====== CONNECTION SETTINGS ======
//         settings.connection = {
//             'Login Method': this.getLoginMethod(),
//             'Auto Reconnect': process.env.AUTO_RECONNECT || 'true',
//             'Connection Status': sock.state?.connection || 'Unknown',
//             'QR Timeout': process.env.QR_TIMEOUT || '60000ms',
//             'Pair Code Expiry': '10 minutes',
//             'Max Retries': process.env.MAX_RETRIES || '5'
//         };
        
//         // ====== FEATURE SETTINGS ======
//         settings.features = {
//             'Auto Reply': process.env.AUTO_REPLY || 'false',
//             'Anti-Spam': process.env.ANTI_SPAM || 'true',
//             'Welcome Message': process.env.WELCOME_MSG || 'true',
//             'Goodbye Message': process.env.GOODBYE_MSG || 'true',
//             'Auto Sticker': process.env.AUTO_STICKER || 'false',
//             'NSFW Filter': process.env.NSFW_FILTER || 'true',
//             'Anti-Link': process.env.ANTI_LINK || 'false',
//             'Auto Read': process.env.AUTO_READ || 'true',
//             'Auto Typing': process.env.AUTO_TYPING || 'false'
//         };
        
//         // ====== MENU & MEDIA SETTINGS ======
//         const menuSettings = {
//             'Menu Image URL': process.env.MENU_IMAGE || 'Not set',
//             'Menu Type': process.env.MENU_TYPE || 'text',
//             'Menu Style': process.env.MENU_STYLE || 'simple',
//             'Menu Footer': process.env.MENU_FOOTER || 'Powered by Wolf Bot',
//             'Thumbnail URL': process.env.THUMBNAIL_URL || 'Not set',
//             'Welcome Image': process.env.WELCOME_IMAGE || 'Not set',
//             'Goodbye Image': process.env.GOODBYE_IMAGE || 'Not set'
//         };
        
//         // ====== PATH SETTINGS ======
//         settings.paths = {
//             'Auth Directory': './auth',
//             'Commands Directory': './commands',
//             'Data Directory': './data',
//             'Cache Directory': './cache',
//             'Temp Directory': './temp',
//             'Session Path': './auth/creds.json',
//             'Prefix File': './data/prefix.json',
//             'Owner File': './owner.json'
//         };
        
//         // ====== LIMIT SETTINGS ======
//         settings.limits = {
//             'Max Download Size': process.env.MAX_DOWNLOAD_SIZE || '100MB',
//             'Max Upload Size': process.env.MAX_UPLOAD_SIZE || '50MB',
//             'Command Cooldown': process.env.COOLDOWN || '3 seconds',
//             'Daily Limits': process.env.DAILY_LIMITS || 'unlimited',
//             'Max Group Members': process.env.MAX_GROUP_SIZE || '100',
//             'Rate Limit': process.env.RATE_LIMIT || '10/60s'
//         };
        
//         // ====== ADVANCED SETTINGS ======
//         settings.advanced = {
//             'Log Level': process.env.LOG_LEVEL || 'info',
//             'Debug Mode': process.env.DEBUG || 'false',
//             'Web Server': process.env.WEB_SERVER || 'false',
//             'API Enabled': process.env.API_ENABLED || 'false',
//             'Database Type': process.env.DB_TYPE || 'json',
//             'Backup Interval': process.env.BACKUP_INTERVAL || '24h',
//             'Auto Update': process.env.AUTO_UPDATE || 'false',
//             'Memory Limit': process.env.MEMORY_LIMIT || '512MB',
//             'Timeout': process.env.TIMEOUT || '30000ms'
//         };
        
//         // ====== BOT STATISTICS ======
//         settings.stats = await this.getBotStats(sock);
        
//         // ====== FILE EXISTENCE CHECKS ======
//         settings.fileChecks = this.checkFiles();
        
//         return settings;
//     },
    
//     // Get current prefix from file
//     getCurrentPrefix() {
//         try {
//             const prefixFile = path.join(__dirname, '../../data/prefix.json');
//             if (fs.existsSync(prefixFile)) {
//                 const data = JSON.parse(fs.readFileSync(prefixFile, 'utf8'));
//                 return data.prefix || '.';
//             }
//         } catch (error) {
//             console.error('Prefix read error:', error);
//         }
//         return process.env.PREFIX || '.';
//     },
    
//     // Determine login method
//     getLoginMethod() {
//         const authDir = path.join(__dirname, '../../auth');
//         if (fs.existsSync(authDir)) {
//             const files = fs.readdirSync(authDir);
//             if (files.length > 0) {
//                 return 'Session (Saved)';
//             }
//         }
//         return 'QR/Pair Code';
//     },
    
//     // Get bot statistics
//     async getBotStats(sock) {
//         try {
//             const commandsDir = path.join(__dirname, '../../commands');
//             let commandCount = 0;
            
//             if (fs.existsSync(commandsDir)) {
//                 commandCount = this.countCommands(commandsDir);
//             }
            
//             return {
//                 'Total Commands': commandCount,
//                 'Uptime': this.formatUptime(process.uptime()),
//                 'Memory Usage': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
//                 'Node Version': process.version,
//                 'Platform': process.platform,
//                 'Architecture': process.arch,
//                 'Connected Chats': Object.keys(sock.chats || {}).length || 'Unknown'
//             };
            
//         } catch (error) {
//             return { 'Error': 'Could not load stats' };
//         }
//     },
    
//     // Count total commands
//     countCommands(dir) {
//         let count = 0;
        
//         const countFiles = (directory) => {
//             if (!fs.existsSync(directory)) return;
            
//             const items = fs.readdirSync(directory);
            
//             for (const item of items) {
//                 const fullPath = path.join(directory, item);
//                 const stat = fs.statSync(fullPath);
                
//                 if (stat.isDirectory()) {
//                     countFiles(fullPath);
//                 } else if (item.endsWith('.js')) {
//                     count++;
//                 }
//             }
//         };
        
//         countFiles(dir);
//         return count;
//     },
    
//     // Format uptime
//     formatUptime(seconds) {
//         const days = Math.floor(seconds / (24 * 60 * 60));
//         const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
//         const minutes = Math.floor((seconds % (60 * 60)) / 60);
//         const secs = Math.floor(seconds % 60);
        
//         const parts = [];
//         if (days > 0) parts.push(`${days}d`);
//         if (hours > 0) parts.push(`${hours}h`);
//         if (minutes > 0) parts.push(`${minutes}m`);
//         if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
        
//         return parts.join(' ');
//     },
    
//     // Check if important files exist
//     checkFiles() {
//         const files = {
//             '.env File': './.env',
//             'Package.json': './package.json',
//             'Commands Folder': './commands',
//             'Auth Folder': './auth',
//             'Data Folder': './data'
//         };
        
//         const results = {};
//         for (const [name, filePath] of Object.entries(files)) {
//             const fullPath = path.join(__dirname, '../..', filePath);
//             results[name] = fs.existsSync(fullPath) ? '✅ Exists' : '❌ Missing';
//         }
        
//         return results;
//     },
    
//     // Format settings for display
//     formatSettings(settings) {
//         let text = `⚙️ *BOT SETTINGS & CONFIGURATION*\n\n`;
        
//         // Basic Settings
//         text += `📋 *BASIC SETTINGS*\n`;
//         for (const [key, value] of Object.entries(settings.basic)) {
//             text += `• ${key}: *${value}*\n`;
//         }
//         text += `\n`;
        
//         // Connection Settings
//         text += `🔗 *CONNECTION*\n`;
//         for (const [key, value] of Object.entries(settings.connection)) {
//             text += `• ${key}: *${value}*\n`;
//         }
//         text += `\n`;
        
//         // Feature Settings
//         text += `✨ *FEATURES*\n`;
//         for (const [key, value] of Object.entries(settings.features)) {
//             const icon = value === 'true' ? '✅' : value === 'false' ? '❌' : '⚙️';
//             text += `• ${key}: ${icon} *${value}*\n`;
//         }
//         text += `\n`;
        
//         // Path Settings
//         text += `📁 *PATHS*\n`;
//         for (const [key, value] of Object.entries(settings.paths)) {
//             text += `• ${key}: \`${value}\`\n`;
//         }
//         text += `\n`;
        
//         // Limit Settings
//         text += `📊 *LIMITS*\n`;
//         for (const [key, value] of Object.entries(settings.limits)) {
//             text += `• ${key}: *${value}*\n`;
//         }
//         text += `\n`;
        
//         // Statistics
//         text += `📈 *STATISTICS*\n`;
//         for (const [key, value] of Object.entries(settings.stats)) {
//             text += `• ${key}: *${value}*\n`;
//         }
//         text += `\n`;
        
//         // File Checks
//         text += `📄 *FILES CHECK*\n`;
//         for (const [key, value] of Object.entries(settings.fileChecks)) {
//             text += `• ${key}: ${value}\n`;
//         }
        
//         // Footer
//         text += `\n🕒 *Last Updated:* ${new Date().toLocaleString()}`;
//         text += `\n🔧 *Use .setsetting <key> <value> to change settings*`;
        
//         return text;
//     }
// };














// ====== getsettings.js - FIXED VERSION ======
// Save as: ./commands/owner/getsettings.js

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

export default {
    name: 'getsettings',
    alias: ['settings', 'config', 'botconfig', 'showconfig'],
    description: 'View all bot settings and configuration',
    category: 'owner',
    
    // async execute(sock, msg, args) {
    //     const { remoteJid, participant, fromMe } = msg.key;
        
    //     // Better owner detection
    //     let isOwner = false;
        
    //     // Method 1: Check if message is from bot itself (when owner uses bot)
    //     if (fromMe) {
    //         isOwner = true;
    //     }
        
    //     // Method 2: Check if sender JID matches bot owner JID
    //     // const senderJid = participant || remoteJid;
    //     // const botOwnerJid = sock.user?.id;
        
    //     // if (senderJid === botOwnerJid) {
    //     //     isOwner = true;
    //     // }
        
    //     // Method 3: Check saved owner file
    //     const ownerFile = path.join(__dirname, '../../owner.json');
    //     if (fs.existsSync(ownerFile)) {
    //         try {
    //             const ownerData = JSON.parse(fs.readFileSync(ownerFile, 'utf8'));
    //             const ownerNumber = ownerData.OWNER_NUMBER;
    //             const senderNumber = senderJid.split('@')[0];
                
    //             if (senderNumber === ownerNumber) {
    //                 isOwner = true;
    //             }
    //         } catch (error) {
    //             console.error('Owner file read error:', error);
    //         }
    //     }
        
    //     // Method 4: Check environment variable
    //     const envOwner = process.env.OWNER_NUMBER;
    //     if (envOwner) {
    //         const senderNumber = senderJid.split('@')[0];
    //         const cleanEnvOwner = envOwner.replace('+', '').trim();
            
    //         if (senderNumber === cleanEnvOwner || senderNumber.endsWith(cleanEnvOwner)) {
    //             isOwner = true;
    //         }
    //     }
        
    //     if (!isOwner) {
    //         console.log('Owner check failed:', {
    //             senderJid,
    //             botOwnerJid,
    //             fromMe,
    //             participant,
    //             remoteJid
    //         });
            
    //         return await sock.sendMessage(remoteJid, {
    //             text: '❌ This command is only available to the bot owner!'
    //         }, { quoted: msg });
    //     }
        
    //     try {
    //         // Collect all settings
    //         const settings = await this.collectAllSettings(sock);
            
    //         // Format settings for display
    //         const settingsText = this.formatSettings(settings);
            
    //         // Send settings
    //         await sock.sendMessage(remoteJid, {
    //             text: settingsText
    //         }, { quoted: msg });
            
    //     } catch (error) {
    //         console.error('Settings error:', error);
    //         await sock.sendMessage(remoteJid, {
    //             text: '❌ Failed to load settings. Check console for errors.'
    //         }, { quoted: msg });
    //     }
    // },
    
    // Collect all settings from various sources
    async collectAllSettings(sock) {
        const settings = {
            basic: {},
            connection: {},
            features: {},
            paths: {},
            limits: {},
            advanced: {}
        };
        
        // Get bot owner info
        const ownerFile = path.join(__dirname, '../../owner.json');
        let ownerNumber = 'Not set';
        let ownerJid = 'Not set';
        
        if (fs.existsSync(ownerFile)) {
            try {
                const ownerData = JSON.parse(fs.readFileSync(ownerFile, 'utf8'));
                ownerNumber = ownerData.OWNER_NUMBER || 'Not set';
                ownerJid = ownerData.OWNER_JID || 'Not set';
            } catch (error) {
                console.error('Owner file read error:', error);
            }
        }
        
        // ====== BASIC SETTINGS ======
        settings.basic = {
            'Bot Name': process.env.BOT_NAME || 'Silent Wolf',
            'Bot Version': process.env.VERSION || '1.0.0',
            'Prefix': this.getCurrentPrefix(),
            'Owner Number': ownerNumber,
            'Owner JID': ownerJid,
            'Bot Mode': process.env.MODE || 'public',
            'Language': process.env.LANGUAGE || 'en',
            'Bot JID': sock.user?.id || 'Not connected'
        };
        
        // ====== CONNECTION SETTINGS ======
        settings.connection = {
            'Login Method': this.getLoginMethod(),
            'Auto Reconnect': process.env.AUTO_RECONNECT || 'true',
            'Connection Status': sock.state?.connection || 'Unknown',
            'QR Timeout': process.env.QR_TIMEOUT || '60000ms',
            'Pair Code Expiry': '10 minutes',
            'Max Retries': process.env.MAX_RETRIES || '5'
        };
        
        // ====== FEATURE SETTINGS ======
        settings.features = {
            'Auto Reply': process.env.AUTO_REPLY || 'false',
            'Anti-Spam': process.env.ANTI_SPAM || 'true',
            'Welcome Message': process.env.WELCOME_MSG || 'true',
            'Goodbye Message': process.env.GOODBYE_MSG || 'true',
            'Auto Sticker': process.env.AUTO_STICKER || 'false',
            'NSFW Filter': process.env.NSFW_FILTER || 'true',
            'Anti-Link': process.env.ANTI_LINK || 'false',
            'Auto Read': process.env.AUTO_READ || 'true',
            'Auto Typing': process.env.AUTO_TYPING || 'false'
        };
        
        // ====== MENU & MEDIA SETTINGS ======
        settings.menu = {
            'Menu Image URL': process.env.MENU_IMAGE || 'Not set',
            'Menu Type': process.env.MENU_TYPE || 'text',
            'Menu Style': process.env.MENU_STYLE || 'simple',
            'Menu Footer': process.env.MENU_FOOTER || 'Powered by Wolf Bot',
            'Thumbnail URL': process.env.THUMBNAIL_URL || 'Not set',
            'Welcome Image': process.env.WELCOME_IMAGE || 'Not set',
            'Goodbye Image': process.env.GOODBYE_IMAGE || 'Not set'
        };
        
        // ====== PATH SETTINGS ======
        settings.paths = {
            'Auth Directory': './auth',
            'Commands Directory': './commands',
            'Data Directory': './data',
            'Cache Directory': './cache',
            'Temp Directory': './temp',
            'Session Path': './auth/creds.json',
            'Prefix File': './data/prefix.json',
            'Owner File': './owner.json',
            'Env File': './.env'
        };
        
        // ====== LIMIT SETTINGS ======
        settings.limits = {
            'Max Download Size': process.env.MAX_DOWNLOAD_SIZE || '100MB',
            'Max Upload Size': process.env.MAX_UPLOAD_SIZE || '50MB',
            'Command Cooldown': process.env.COOLDOWN || '3 seconds',
            'Daily Limits': process.env.DAILY_LIMITS || 'unlimited',
            'Max Group Members': process.env.MAX_GROUP_SIZE || '100',
            'Rate Limit': process.env.RATE_LIMIT || '10/60s'
        };
        
        // ====== ADVANCED SETTINGS ======
        settings.advanced = {
            'Log Level': process.env.LOG_LEVEL || 'info',
            'Debug Mode': process.env.DEBUG || 'false',
            'Web Server': process.env.WEB_SERVER || 'false',
            'API Enabled': process.env.API_ENABLED || 'false',
            'Database Type': process.env.DB_TYPE || 'json',
            'Backup Interval': process.env.BACKUP_INTERVAL || '24h',
            'Auto Update': process.env.AUTO_UPDATE || 'false',
            'Memory Limit': process.env.MEMORY_LIMIT || '512MB',
            'Timeout': process.env.TIMEOUT || '30000ms'
        };
        
        // ====== BOT STATISTICS ======
        settings.stats = await this.getBotStats(sock);
        
        // ====== FILE EXISTENCE CHECKS ======
        settings.fileChecks = this.checkFiles();
        
        return settings;
    },
    
    // Get current prefix from file
    getCurrentPrefix() {
        try {
            const prefixFile = path.join(__dirname, '../../data/prefix.json');
            if (fs.existsSync(prefixFile)) {
                const data = JSON.parse(fs.readFileSync(prefixFile, 'utf8'));
                return data.prefix || '.';
            }
        } catch (error) {
            console.error('Prefix read error:', error);
        }
        return process.env.PREFIX || '.';
    },
    
    // Determine login method
    getLoginMethod() {
        const authDir = path.join(__dirname, '../../auth');
        if (fs.existsSync(authDir)) {
            const files = fs.readdirSync(authDir);
            if (files.length > 0) {
                return 'Session (Saved)';
            }
        }
        return 'QR/Pair Code';
    },
    
    // Get bot statistics
    async getBotStats(sock) {
        try {
            const commandsDir = path.join(__dirname, '../../commands');
            let commandCount = 0;
            
            if (fs.existsSync(commandsDir)) {
                commandCount = this.countCommands(commandsDir);
            }
            
            // Count connected chats
            let chatCount = 0;
            try {
                chatCount = Object.keys(sock.chats || {}).length;
            } catch (e) {
                chatCount = 'Unknown';
            }
            
            return {
                'Total Commands': commandCount,
                'Uptime': this.formatUptime(process.uptime()),
                'Memory Usage': `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`,
                'Node Version': process.version,
                'Platform': process.platform,
                'Architecture': process.arch,
                'Connected Chats': chatCount
            };
            
        } catch (error) {
            return { 'Error': 'Could not load stats' };
        }
    },
    
    // Count total commands
    countCommands(dir) {
        let count = 0;
        
        const countFiles = (directory) => {
            if (!fs.existsSync(directory)) return;
            
            const items = fs.readdirSync(directory);
            
            for (const item of items) {
                const fullPath = path.join(directory, item);
                const stat = fs.statSync(fullPath);
                
                if (stat.isDirectory()) {
                    countFiles(fullPath);
                } else if (item.endsWith('.js')) {
                    count++;
                }
            }
        };
        
        countFiles(dir);
        return count;
    },
    
    // Format uptime
    formatUptime(seconds) {
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = Math.floor(seconds % 60);
        
        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);
        if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
        
        return parts.join(' ');
    },
    
    // Check if important files exist
    checkFiles() {
        const files = {
            '.env File': './.env',
            'Package.json': './package.json',
            'Commands Folder': './commands',
            'Auth Folder': './auth',
            'Data Folder': './data',
            'Owner File': './owner.json'
        };
        
        const results = {};
        for (const [name, filePath] of Object.entries(files)) {
            const fullPath = path.join(__dirname, '../..', filePath);
            results[name] = fs.existsSync(fullPath) ? '✅' : '❌';
        }
        
        return results;
    },
    
    // Format settings for display
    formatSettings(settings) {
        let text = `⚙️ *BOT SETTINGS & CONFIGURATION*\n`;
        text += `════════════════════════════\n\n`;
        
        // Basic Settings
        text += `📋 *BASIC SETTINGS*\n`;
        text += `├─ Bot Name: *${settings.basic['Bot Name']}*\n`;
        text += `├─ Version: *${settings.basic['Bot Version']}*\n`;
        text += `├─ Prefix: *${settings.basic['Prefix']}*\n`;
        text += `├─ Owner: *${settings.basic['Owner Number']}*\n`;
        text += `├─ Mode: *${settings.basic['Bot Mode']}*\n`;
        text += `└─ Language: *${settings.basic['Language']}*\n\n`;
        
        // Connection Settings
        text += `🔗 *CONNECTION*\n`;
        text += `├─ Method: *${settings.connection['Login Method']}*\n`;
        text += `├─ Status: *${settings.connection['Connection Status']}*\n`;
        text += `├─ Auto Reconnect: *${settings.connection['Auto Reconnect']}*\n`;
        text += `└─ Max Retries: *${settings.connection['Max Retries']}*\n\n`;
        
        // Feature Settings
        text += `✨ *FEATURES*\n`;
        const featureEntries = Object.entries(settings.features);
        for (let i = 0; i < featureEntries.length; i++) {
            const [key, value] = featureEntries[i];
            const icon = value === 'true' ? '✅' : value === 'false' ? '❌' : '⚙️';
            const prefix = i === featureEntries.length - 1 ? '└─' : '├─';
            text += `${prefix} ${key}: ${icon}\n`;
        }
        text += `\n`;
        
        // Menu Settings
        text += `📱 *MENU SETTINGS*\n`;
        text += `├─ Type: *${settings.menu['Menu Type']}*\n`;
        text += `├─ Style: *${settings.menu['Menu Style']}*\n`;
        if (settings.menu['Menu Image URL'] !== 'Not set') {
            text += `├─ Image: ${settings.menu['Menu Image URL']}\n`;
        }
        text += `└─ Footer: *${settings.menu['Menu Footer']}*\n\n`;
        
        // Statistics
        text += `📈 *STATISTICS*\n`;
        const statEntries = Object.entries(settings.stats);
        for (let i = 0; i < statEntries.length; i++) {
            const [key, value] = statEntries[i];
            const prefix = i === statEntries.length - 1 ? '└─' : '├─';
            text += `${prefix} ${key}: *${value}*\n`;
        }
        text += `\n`;
        
        // File Checks
        text += `📄 *FILE STATUS*\n`;
        const fileEntries = Object.entries(settings.fileChecks);
        for (let i = 0; i < fileEntries.length; i++) {
            const [key, value] = fileEntries[i];
            const prefix = i === fileEntries.length - 1 ? '└─' : '├─';
            text += `${prefix} ${key}: ${value}\n`;
        }
        
        // Footer
        text += `\n════════════════════════════\n`;
        text += `🕒 *Updated:* ${new Date().toLocaleTimeString()}`;
        text += `\n🔧 *Use .setsetting to modify*`;
        
        return text;
    }
};