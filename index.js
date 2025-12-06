


// // ====== WOLF BOT - index.js ======
// // Fast, stable & themed. Supports QR or Pair Code login.

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';

// // CORRECT BAILEYS IMPORT
// import makeWASocket from '@whiskeysockets/baileys';
// import { useMultiFileAuthState } from '@whiskeysockets/baileys';
// import { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = (() => {
//     try {
//         if (fs.existsSync('./prefix.json')) {
//             const data = JSON.parse(fs.readFileSync('./prefix.json', 'utf8'));
//             return data.prefix || process.env.PREFIX || '.';
//         }
//     } catch (error) {
//         console.error(chalk.red('❌ Error reading prefix file:'), error);
//     }
//     return process.env.PREFIX || '.';
// })();
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '2.0.0';
// const SESSION_DIR = './auth_info_baileys'; // Fixed session directory

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// function ensureSessionDir() {
//     if (!fs.existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         console.log(chalk.green(`✅ Created session directory: ${SESSION_DIR}`));
//     }
// }

// // ====== COMMAND SYSTEM ======
// const commands = new Map();

// async function loadCommandsFromFolder(folderPath) {
//     const absolutePath = path.resolve(folderPath);
    
//     try {
//         const items = fs.readdirSync(absolutePath);
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 // Recursively load commands from subdirectories
//                 await loadCommandsFromFolder(fullPath);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     // Import the command module
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default;
                    
//                     if (command && command.name) {
//                         // Add main command name
//                         commands.set(command.name.toLowerCase(), command);
//                         console.log(chalk.green(`✅ Loaded command: ${command.name}`));
                        
//                         // Add aliases if they exist
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                                 console.log(chalk.gray(`   ↳ Alias: ${alias}`));
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     console.error(chalk.red(`❌ Failed to load command: ${item}`), error);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error(chalk.red(`❌ Error reading commands folder: ${folderPath}`), error);
//     }
// }

// async function executeCommand(commandName, sock, msg, args) {
//     const command = commands.get(commandName.toLowerCase());
    
//     if (!command) {
//         return false; // Command not found
//     }
    
//     try {
//         // Execute the command with proper parameters
//         await command.execute(sock, msg, args, null, {});
//         return true;
//     } catch (error) {
//         console.error(chalk.red(`❌ Error executing command ${commandName}:`), error);
        
//         // Send error message to user
//         try {
//             await sock.sendMessage(msg.key.remoteJid, { 
//                 text: `❌ Error running *${commandName}*. Please try again later.` 
//             }, { quoted: msg });
//         } catch (sendError) {
//             // Ignore send errors
//         }
        
//         return false;
//     }
// }

// // ====== PAIRING CODE MANAGER ======
// class PairCodeManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }

//     async getPhoneNumber() {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow('📱 Enter your WhatsApp number (e.g., 254788710904): '), (number) => {
//                 const cleanedNumber = number.trim().replace(/[^0-9]/g, '');
                
//                 if (!cleanedNumber || cleanedNumber.length < 10) {
//                     console.log(chalk.red('❌ Invalid phone number. Please try again.'));
//                     this.getPhoneNumber().then(resolve);
//                     return;
//                 }
                
//                 resolve(cleanedNumber);
//             });
//         });
//     }

//     close() {
//         if (this.rl) {
//             this.rl.close();
//         }
//     }
// }

// // ====== CLEAN AUTH FUNCTION ======
// function cleanAuth() {
//     try {
//         if (fs.existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared previous auth session'));
//         }
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data'));
//     }
// }

// // ====== BOT INITIALIZATION ======
// async function startBot(loginMode = 'qr', phoneNumber = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//     // Load commands first
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     // Ensure session directory exists
//     ensureSessionDir();

//     // For pair mode, always start fresh
//     if (loginMode === 'pair') {
//         console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
//         cleanAuth();
//         ensureSessionDir();
//     }

//     // Load or create auth state
//     let state, saveCreds;
//     try {
//         console.log(chalk.blue('🔐 Loading authentication state...'));
//         const authState = await useMultiFileAuthState(SESSION_DIR);
//         state = authState.state;
//         saveCreds = authState.saveCreds;
//         console.log(chalk.green('✅ Auth state loaded successfully'));
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         console.log(chalk.yellow('🔄 Creating fresh auth state...'));
//         cleanAuth();
//         ensureSessionDir();
        
//         const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//         state = freshAuth.state;
//         saveCreds = freshAuth.saveCreds;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration - UPDATED for stability
//     const socketConfig = {
//         version,
//         logger: P({ level: 'warn' }),
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: loginMode === 'qr',
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//         connectTimeoutMs: 60000,
//         keepAliveIntervalMs: 10000,
//         defaultQueryTimeoutMs: 0,
//         emitOwnEvents: true,
//         mobile: false,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.green('✅ WhatsApp client created successfully'));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'connecting...'}`));

//         // Handle QR code for QR mode
//         if (qr && loginMode === 'qr') {
//             console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
//             qrcode.generate(qr, { small: true });
//             console.log(chalk.gray('💡 Scan with WhatsApp mobile app'));
//         }

//         // Handle pair code generation
//         if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//             console.log(chalk.cyan(`\n🔗 Attempting to generate pair code for: ${phoneNumber}`));
            
//             setTimeout(async () => {
//                 try {
//                     console.log(chalk.cyan('📞 Requesting pairing code from WhatsApp servers...'));
//                     const code = await sock.requestPairingCode(phoneNumber);
//                     const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
                    
//                     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));

//                     console.log(chalk.blue('\n📱 How to use this code:'));
//                     console.log(chalk.white('1. Open WhatsApp on your phone'));
//                     console.log(chalk.white('2. Go to Settings → Linked Devices → Link a Device'));
//                     console.log(chalk.white(`3. Enter this code: ${chalk.yellow.bold(formattedCode)}`));
//                     console.log(chalk.white('4. Wait for connection confirmation\n'));
                    
//                     console.log(chalk.gray('⏳ Waiting for you to enter the code in WhatsApp...'));

//                 } catch (error) {
//                     console.error(chalk.red('❌ Failed to generate pairing code:'), error.message);
//                     console.log(chalk.yellow('💡 The connection might not be ready yet. Retrying QR code mode...'));
                    
//                     loginMode = 'qr';
//                     console.log(chalk.yellow('\n📲 Generating QR Code instead:\n'));
                    
//                     if (update.qr) {
//                         qrcode.generate(update.qr, { small: true });
//                     }
//                 }
//             }, 5000); // Increased delay for stability
//         }

//         if (connection === 'open') {
//             isConnected = true;
//             await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//         }

//         if (connection === 'close') {
//             isConnected = false;
//             await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//         }
//     });

//     sock.ev.on('creds.update', saveCreds);

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
        
//         const msg = messages[0];
//         if (!msg.message) return;

//         await handleIncomingMessage(sock, msg);
//     });

//     return sock;
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = moment().format('h:mm:ss A');
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     try {
//         fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not save owner data'));
//     }

//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'Pair Code' : 'QR Code')}         
// ╚════════════════════════════════════════════════════════╝
// `));

//     // Send welcome message to owner
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${loginMode === 'pair' ? 'Pair Code' : 'QR Code'}\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
//         });
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth();
//     }
    
//     if (loginMode === 'pair' && statusCode) {
//         console.log(chalk.yellow('💡 Pair code mode failed. Switching to QR code mode...'));
//         loginMode = 'qr';
//         phoneNumber = null;
//     }
    
//     console.log(chalk.blue('🔄 Restarting in 5 seconds...'));
//     setTimeout(() => startBot(loginMode, phoneNumber), 5000);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     const chatId = msg.key.remoteJid;
//     const textMsg = msg.message.conversation || 
//                    msg.message.extendedTextMessage?.text || 
//                    msg.message.imageMessage?.caption || 
//                    msg.message.videoMessage?.caption ||
//                    '';
    
//     if (!textMsg) return;

//     const fromNumber = chatId.split('@')[0];

//     if (textMsg.startsWith(PREFIX)) {
//         const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
//         const commandName = parts[0].toLowerCase();
//         const args = parts.slice(1);
        
//         console.log(chalk.magenta(`📩 +${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
        
//         if (!commandExecuted) {
//             // Default commands if not found in commands folder
//             await handleDefaultCommands(commandName, sock, msg, args);
//         }
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 await sock.sendMessage(chatId, { text: '🏓 Pong!' }, { quoted: msg });
//                 break;
                
//             case 'menu':
//                 await sock.sendMessage(chatId, { 
//                     text: `🐺 *${BOT_NAME} MENU*\n\n` +
//                           `⚡ *Core Commands*\n` +
//                           `• ${PREFIX}ping - Test connection\n` +
//                           `• ${PREFIX}menu - Show this menu\n` +
//                           `• ${PREFIX}info - Bot information\n` +
//                           `• ${PREFIX}owner - Owner details\n\n` +
//                           `🔧 *Session Commands*\n` +
//                           `• ${PREFIX}session - Session info\n` +
//                           `• ${PREFIX}status - Connection status`
//                 }, { quoted: msg });
//                 break;
                
//             case 'info':
//                 await sock.sendMessage(chatId, { 
//                     text: `🐺 *${BOT_NAME} INFORMATION*\n\n` +
//                           `⚙️ Version: ${VERSION}\n` +
//                           `💬 Prefix: ${PREFIX}\n` +
//                           `👑 Owner: Silent Wolf\n` +
//                           `📱 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `🔥 Status: ${isConnected ? 'Online ✅' : 'Offline ❌'}\n` +
//                           `📊 Commands: ${commands.size} loaded`
//                 }, { quoted: msg });
//                 break;
                
//             case 'owner':
//                 await sock.sendMessage(chatId, { 
//                     text: `👑 *BOT OWNER*\n\n` +
//                           `🐺 Name: Silent Wolf\n` +
//                           `📱 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `⚡ Version: ${VERSION}\n` +
//                           `🔧 Status: ${isConnected ? 'Active' : 'Inactive'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'session':
//                 await sock.sendMessage(chatId, { 
//                     text: `📁 *SESSION INFORMATION*\n\n` +
//                           `📞 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `📁 Directory: ${SESSION_DIR}\n` +
//                           `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
//                           `🐺 Bot: ${BOT_NAME} v${VERSION}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, { 
//                     text: `📊 *CONNECTION STATUS*\n\n` +
//                           `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
//                           `📱 Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `🐺 Bot: ${BOT_NAME}\n` +
//                           `⚡ Version: ${VERSION}`
//                 }, { quoted: msg });
//                 break;
//         }
//     } catch (error) {
//         console.error(chalk.red('❌ Default command error:'), error.message);
//     }
// }

// // ====== LOGIN SELECTION ======
// async function selectLoginMode() {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });

//     const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

//     console.log(chalk.yellow('\n🐺 WOLF BOT LOGIN OPTIONS'));
//     console.log('1) QR Code Login (Recommended)');
//     console.log('2) Pair Code Login (Experimental)');
    
//     try {
//         const choice = await ask('Enter 1 or 2 (default 1): ');
//         let mode = 'qr';
//         let phone = null;

//         if (choice === '2') {
//             mode = 'pair';
//             const pairManager = new PairCodeManager();
//             phone = await pairManager.getPhoneNumber();
//             pairManager.close();
            
//             if (!phone.match(/^\d{10,15}$/)) {
//                 console.log(chalk.red('❌ Invalid phone number. Using QR code mode.'));
//                 mode = 'qr';
//                 phone = null;
//             }
//         }

//         rl.close();
//         return { mode, phone };
//     } catch (error) {
//         rl.close();
//         console.log(chalk.yellow('⚠️ Using default QR code mode'));
//         return { mode: 'qr', phone: null };
//     }
// }

// // ====== MAIN APPLICATION START ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        
//         const { mode, phone } = await selectLoginMode();
        
//         console.log(chalk.gray(`\nStarting with ${mode === 'qr' ? 'QR Code' : 'Pair Code'} mode...`));
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         console.log(chalk.blue('🔄 Restarting in 10 seconds...'));
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });









































 // ====== WOLF BOT - index.js ======
// Fast, stable & themed. Supports QR or Pair Code login.

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import moment from 'moment'; 
// ====== AUTO-START BACKGROUND WATCHER ======
// Add this after your imports but before PREFIX declaration

import { spawn } from 'child_process';


// Auto-start background watcher on bot start
if (!fs.existsSync('./.prefix_setup_done')) {
    // First run, setup will be done by npm start
    console.log(chalk.gray('[System] First run - prefix setup will run automatically'));
} else {
    // Check if watcher is running
    if (!fs.existsSync('./prefix_bot.pid')) {
        try {
            const watcher = spawn('node', ['restart_watcher.js'], {
                detached: true,
                stdio: 'ignore'
            });
            watcher.unref();
            console.log(chalk.gray('[System] Background prefix watcher started'));
        } catch (error) {
            // Silent error
        }
    }
}

// CORRECT BAILEYS IMPORT
import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';

import P from 'pino';

// ====== CONFIGURATION ======
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====== DYNAMIC PREFIX SYSTEM ======
function loadBotPrefix() {
    try {
        // Load custom prefix from file
        if (fs.existsSync('./prefix.json')) {
            const prefixData = JSON.parse(fs.readFileSync('./prefix.json', 'utf8'));
            if (prefixData.prefix && prefixData.prefix.trim()) {
                console.log(chalk.cyan(`🔤 Using custom prefix: "${prefixData.prefix}"`));
                return prefixData.prefix;
            }
        }
    } catch (error) {
        console.error(chalk.red('❌ Error loading prefix:'), error.message);
    }
    // Fallback to default
    return process.env.PREFIX || '.';
}

const PREFIX = loadBotPrefix();
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '2.0.0';
const SESSION_DIR = './auth_info_baileys';
const MEMORY_CLEAR_INTERVAL = 10000; // Clear memory every 10 seconds
const MESSAGE_HISTORY_FILE = './message_history.json';
const BOT_MODE_FILE = './bot_mode.json';

// Global variables
let OWNER_NUMBER = null;
let OWNER_JID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;
let messageHistory = new Map(); // Store recent message timestamps
let memoryClearTimer = null; // Timer for clearing memory

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
║   🧠 Memory  : Persistent auto-clear every 10s
╚════════════════════════════════════════════════╝
`));

// ====== UTILITY FUNCTIONS ======
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ADD THIS FUNCTION - Check if user is owner
function isOwner(senderJid) {
    if (!OWNER_JID || !senderJid) {
        return false;
    }
    
    // Normalize both JIDs for comparison
    const normalizeJid = (jid) => {
        if (!jid) return '';
        // Remove any suffix and get just the number
        const numberPart = jid.split('@')[0].replace(/[^0-9]/g, '');
        // If number starts with 0, remove it for consistency
        return numberPart.startsWith('0') ? numberPart.substring(1) : numberPart;
    };
    
    const normalizedSender = normalizeJid(senderJid);
    const normalizedOwner = normalizeJid(OWNER_JID);
    
    // Also check against OWNER_NUMBER directly
    if (OWNER_NUMBER) {
        const normalizedOwnerNumber = OWNER_NUMBER.replace(/[^0-9]/g, '');
        const cleanOwnerNumber = normalizedOwnerNumber.startsWith('0') 
            ? normalizedOwnerNumber.substring(1) 
            : normalizedOwnerNumber;
        
        if (normalizedSender === cleanOwnerNumber) {
            return true;
        }
    }
    
    return normalizedSender === normalizedOwner;
}

function ensureSessionDir() {
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        console.log(chalk.green(`✅ Created session directory: ${SESSION_DIR}`));
    }
}

// ====== PERSISTENT MEMORY MANAGEMENT FUNCTIONS ======
function loadMessageHistory() {
    try {
        if (fs.existsSync(MESSAGE_HISTORY_FILE)) {
            const data = JSON.parse(fs.readFileSync(MESSAGE_HISTORY_FILE, 'utf8'));
            const now = Date.now();
            const tenSecondsAgo = now - 10000;
            
            // Only load recent messages (last 30 seconds max)
            for (const [messageId, timestamp] of Object.entries(data)) {
                if (timestamp > tenSecondsAgo) {
                    messageHistory.set(messageId, timestamp);
                }
            }
            console.log(chalk.green(`✅ Loaded ${messageHistory.size} recent messages from history`));
        }
    } catch (error) {
        console.error(chalk.red('❌ Error loading message history:'), error);
    }
}

function saveMessageHistory() {
    try {
        const data = Object.fromEntries(messageHistory);
        fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(chalk.red('❌ Error saving message history:'), error);
    }
}

function startMemoryClearing() {
    if (memoryClearTimer) {
        clearInterval(memoryClearTimer);
    }
    
    // Load existing history first
    loadMessageHistory();
    
    memoryClearTimer = setInterval(() => {
        clearMessageHistory();
        saveMessageHistory(); // Save after clearing
    }, MEMORY_CLEAR_INTERVAL);
    
    console.log(chalk.green(`✅ Memory clearing activated (every ${MEMORY_CLEAR_INTERVAL/1000}s)`));
}

function stopMemoryClearing() {
    if (memoryClearTimer) {
        clearInterval(memoryClearTimer);
        saveMessageHistory(); // Save before stopping
        memoryClearTimer = null;
        console.log(chalk.yellow('🛑 Memory clearing stopped'));
    }
}

function clearMessageHistory() {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    let clearedCount = 0;
    
    // Clear messages older than 10 seconds
    for (const [messageId, timestamp] of messageHistory.entries()) {
        if (timestamp < tenSecondsAgo) {
            messageHistory.delete(messageId);
            clearedCount++;
        }
    }
    
    if (clearedCount > 0) {
        console.log(chalk.gray(`🧹 Cleared ${clearedCount} old messages from memory`));
    }
}

function addToMessageHistory(messageId) {
    const now = Date.now();
    messageHistory.set(messageId, now);
    saveMessageHistory(); // Save immediately after adding
}

function isMessageRecent(messageId) {
    if (!messageHistory.has(messageId)) {
        return false;
    }
    
    const timestamp = messageHistory.get(messageId);
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    
    return timestamp >= tenSecondsAgo;
}

// ====== MODE MANAGEMENT FUNCTIONS ======
function getBotMode() {
    try {
        if (fs.existsSync(BOT_MODE_FILE)) {
            const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8'));
            return modeData.mode || 'public';
        }
    } catch (error) {
        console.error(chalk.red('❌ Error reading bot mode:'), error);
    }
    return 'public'; // Default mode
}

function setBotMode(mode) {
    try {
        const modeData = {
            mode: mode,
            ownerNumber: OWNER_NUMBER,
            ownerJid: OWNER_JID,
            changedAt: new Date().toISOString()
        };
        fs.writeFileSync(BOT_MODE_FILE, JSON.stringify(modeData, null, 2));
        console.log(chalk.blue(`🔧 Bot mode set to: ${mode}`));
        return true;
    } catch (error) {
        console.error(chalk.red('❌ Error setting bot mode:'), error);
        return false;
    }
}

function isUserAllowed(senderJid) {
    const mode = getBotMode();
    
    // Public mode - everyone allowed
    if (mode === 'public') {
        return true;
    }
    
    // Private mode - only owner allowed
    if (!OWNER_JID || !senderJid) {
        return false;
    }
    
    // Check if sender is owner
    const isOwner = senderJid === OWNER_JID || 
                    senderJid.replace(/[^0-9]/g, '') === OWNER_NUMBER;
    
    return isOwner;
}

// ====== COMMAND SYSTEM ======
const commands = new Map();

async function loadCommandsFromFolder(folderPath) {
    const absolutePath = path.resolve(folderPath);
    
    try {
        const items = fs.readdirSync(absolutePath);
        
        for (const item of items) {
            const fullPath = path.join(absolutePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                // Recursively load commands from subdirectories
                await loadCommandsFromFolder(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    // Import the command module
                    const commandModule = await import(`file://${fullPath}`);
                    const command = commandModule.default;
                    
                    if (command && command.name) {
                        // Add main command name
                        commands.set(command.name.toLowerCase(), command);
                        console.log(chalk.green(`✅ Loaded command: ${command.name}`));
                        
                        // Add aliases if they exist
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                                console.log(chalk.gray(`   ↳ Alias: ${alias}`));
                            });
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`❌ Failed to load command: ${item}`), error);
                }
            }
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error reading commands folder: ${folderPath}`), error);
    }
}

async function executeCommand(commandName, sock, msg, args) {
    const command = commands.get(commandName.toLowerCase());
    
    if (!command) {
        return false; // Command not found
    }
    
    try {
        // Create chatBot context with mode info
        const chatBot = {
            OWNER_NUMBER: OWNER_NUMBER,
            OWNER_JID: OWNER_JID,
            PREFIX: PREFIX,
            BOT_NAME: BOT_NAME,
            getMode: getBotMode,
            setMode: setBotMode,
            isUserAllowed: () => isUserAllowed(msg.key.remoteJid)
        };
        
        // Execute the command with proper parameters
        await command.execute(sock, msg, args, PREFIX, chatBot);
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Error executing command ${commandName}:`), error);
        
        // Send error message to user
        try {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Error running *${commandName}*. Please try again later.` 
            }, { quoted: msg });
        } catch (sendError) {
            // Ignore send errors
        }
        
        return false;
    }
}

// ====== PAIRING CODE MANAGER ======
class PairCodeManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async getPhoneNumber() {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow('📱 Enter your WhatsApp number (e.g., 254788710904): '), (number) => {
                const cleanedNumber = number.trim().replace(/[^0-9]/g, '');
                
                if (!cleanedNumber || cleanedNumber.length < 10) {
                    console.log(chalk.red('❌ Invalid phone number. Please try again.'));
                    this.getPhoneNumber().then(resolve);
                    return;
                }
                
                resolve(cleanedNumber);
            });
        });
    }

    close() {
        if (this.rl) {
            this.rl.close();
        }
    }
}

// ====== CLEAN AUTH FUNCTION ======
function cleanAuth() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            console.log(chalk.yellow('🧹 Cleared previous auth session'));
        }
        if (fs.existsSync('./owner.json')) {
            fs.unlinkSync('./owner.json');
        }
        // Don't clear message history or mode file on auth clean
    } catch (error) {
        console.log(chalk.yellow('⚠️ Could not clear auth data'));
    }
}

// ====== BOT INITIALIZATION ======
async function startBot(loginMode = 'qr', phoneNumber = null) {
    console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

    // Load commands first
    console.log(chalk.blue('📂 Loading commands...'));
    await loadCommandsFromFolder('./commands');
    console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

    // Ensure session directory exists
    ensureSessionDir();

    // For pair mode, always start fresh
    if (loginMode === 'pair') {
        console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
        cleanAuth();
        ensureSessionDir();
    }

    // Load or create auth state
    let state, saveCreds;
    try {
        console.log(chalk.blue('🔐 Loading authentication state...'));
        const authState = await useMultiFileAuthState(SESSION_DIR);
        state = authState.state;
        saveCreds = authState.saveCreds;
        console.log(chalk.green('✅ Auth state loaded successfully'));
    } catch (error) {
        console.error(chalk.red('❌ Auth error:'), error.message);
        console.log(chalk.yellow('🔄 Creating fresh auth state...'));
        cleanAuth();
        ensureSessionDir();
        
        const freshAuth = await useMultiFileAuthState(SESSION_DIR);
        state = freshAuth.state;
        saveCreds = freshAuth.saveCreds;
    }

    // Fetch latest version
    const { version } = await fetchLatestBaileysVersion();
    console.log(chalk.blue(`📦 Baileys version: ${version}`));

    // Socket configuration - UPDATED for stability
    const socketConfig = {
        version,
        logger: P({ level: 'warn' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: loginMode === 'qr',
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 10000,
        defaultQueryTimeoutMs: 0,
        emitOwnEvents: true,
        mobile: false,
    };

    // Create socket
    const sock = makeWASocket(socketConfig);
    SOCKET_INSTANCE = sock;

    console.log(chalk.green('✅ WhatsApp client created successfully'));

    // ====== EVENT HANDLERS ======
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        console.log(chalk.gray(`🔗 Connection state: ${connection || 'connecting...'}`));

        // Handle QR code for QR mode
        if (qr && loginMode === 'qr') {
            console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
            qrcode.generate(qr, { small: true });
            console.log(chalk.gray('💡 Scan with WhatsApp mobile app'));
        }

        // Handle pair code generation
        if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
            console.log(chalk.cyan(`\n🔗 Attempting to generate pair code for: ${phoneNumber}`));
            
            setTimeout(async () => {
                try {
                    console.log(chalk.cyan('📞 Requesting pairing code from WhatsApp servers...'));
                    const code = await sock.requestPairingCode(phoneNumber);
                    const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
                    
                    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════╗
║              🔗 PAIRING CODE                   ║
╠════════════════════════════════════════════════╣
║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
╚════════════════════════════════════════════════╝
`));

                    console.log(chalk.blue('\n📱 How to use this code:'));
                    console.log(chalk.white('1. Open WhatsApp on your phone'));
                    console.log(chalk.white('2. Go to Settings → Linked Devices → Link a Device'));
                    console.log(chalk.white(`3. Enter this code: ${chalk.yellow.bold(formattedCode)}`));
                    console.log(chalk.white('4. Wait for connection confirmation\n'));
                    
                    console.log(chalk.gray('⏳ Waiting for you to enter the code in WhatsApp...'));

                } catch (error) {
                    console.error(chalk.red('❌ Failed to generate pairing code:'), error.message);
                    console.log(chalk.yellow('💡 The connection might not be ready yet. Retrying QR code mode...'));
                    
                    loginMode = 'qr';
                    console.log(chalk.yellow('\n📲 Generating QR Code instead:\n'));
                    
                    if (update.qr) {
                        qrcode.generate(update.qr, { small: true });
                    }
                }
            }, 5000); // Increased delay for stability
        }

        if (connection === 'open') {
            isConnected = true;
            // Start memory clearing timer
            startMemoryClearing();
            await handleSuccessfulConnection(sock, loginMode, phoneNumber);
        }

        if (connection === 'close') {
            isConnected = false;
            // Stop memory clearing timer
            stopMemoryClearing();
            await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;

        // Check if message is recent (within 10 seconds)
        const messageId = msg.key.id;
        
        if (isMessageRecent(messageId)) {
            console.log(chalk.gray(`⏱️  Ignoring duplicate/recent message: ${messageId}`));
            return;
        }
        
        // Add message to history
        addToMessageHistory(messageId);
        
        await handleIncomingMessage(sock, msg);
    });

    return sock;
}

// ====== CONNECTION HANDLERS ======
async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
    const currentTime = moment().format('h:mm:ss A');
    
    OWNER_JID = sock.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    
    try {
        // Save owner data
        fs.writeFileSync('./owner.json', JSON.stringify({ 
            OWNER_NUMBER, 
            OWNER_JID,
            linkedAt: new Date().toISOString()
        }, null, 2));
        
        // Initialize mode if not exists
        if (!fs.existsSync(BOT_MODE_FILE)) {
            setBotMode('public'); // Default to public mode
        }
        
    } catch (error) {
        console.log(chalk.yellow('⚠️ Could not save owner data'));
    }

    const currentMode = getBotMode();
    
    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${OWNER_NUMBER}
║  🔒 Mode  : ${currentMode === 'private' ? chalk.red('PRIVATE 🔒') : chalk.green('PUBLIC 🌍')}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'Pair Code' : 'QR Code')}  
║  🧠 Memory : Persistent auto-clear ${MEMORY_CLEAR_INTERVAL/1000}s     
╚════════════════════════════════════════════════════════╝
`));

    // Send welcome message to owner
    try {
        await sock.sendMessage(OWNER_JID, {
            text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n🔒 Mode: ${currentMode.toUpperCase()}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${loginMode === 'pair' ? 'Pair Code' : 'QR Code'}\n🧠 Memory: Persistent auto-clear every ${MEMORY_CLEAR_INTERVAL/1000}s\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}\n\nUse *${PREFIX}mode* to change bot mode.`
        });
    } catch (error) {
        console.log(chalk.yellow('⚠️ Could not send welcome message'));
    }
}

async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
    console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
    if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
        console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
        cleanAuth();
    }
    
    if (loginMode === 'pair' && statusCode) {
        console.log(chalk.yellow('💡 Pair code mode failed. Switching to QR code mode...'));
        loginMode = 'qr';
        phoneNumber = null;
    }
    
    console.log(chalk.blue('🔄 Restarting in 5 seconds...'));
    setTimeout(() => startBot(loginMode, phoneNumber), 5000);
}

// ====== MESSAGE HANDLER ======
async function handleIncomingMessage(sock, msg) {
    const chatId = msg.key.remoteJid;
    const textMsg = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption ||
                   '';
    
    if (!textMsg) return;

    const fromNumber = chatId.split('@')[0];

    if (textMsg.startsWith(PREFIX)) {
        // Check bot mode before processing command
        if (!isUserAllowed(chatId)) {
            console.log(chalk.yellow(`🚫 Blocked command from ${fromNumber} (private mode)`));
            await sock.sendMessage(chatId, {
                text: `🔒 *BOT IN PRIVATE MODE*\n\nThis bot is currently in private mode.\nOnly the owner (+${OWNER_NUMBER}) can use commands.\n\nUse *${PREFIX}mode public* to enable public access.`
            }, { quoted: msg });
            return;
        }
        
        const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        console.log(chalk.magenta(`📩 +${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

        const commandExecuted = await executeCommand(commandName, sock, msg, args);
        
        if (!commandExecuted) {
            // Default commands if not found in commands folder
            await handleDefaultCommands(commandName, sock, msg, args);
        }
    }
}

// ====== DEFAULT COMMANDS ======
async function handleDefaultCommands(commandName, sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const fromNumber = chatId.split('@')[0];
    
    // Create chatBot context
    const chatBot = {
        OWNER_NUMBER: OWNER_NUMBER,
        OWNER_JID: OWNER_JID,
        PREFIX: PREFIX,
        BOT_NAME: BOT_NAME,
        getMode: getBotMode,
        setMode: setBotMode,
        isUserAllowed: () => isUserAllowed(chatId)
    };
    
    try {
        switch (commandName) {
           
                
            
                
            case 'info':
                const botMode = getBotMode();
                await sock.sendMessage(chatId, { 
                    text: `🐺 *${BOT_NAME} INFORMATION*\n\n` +
                          `⚙️ Version: ${VERSION}\n` +
                          `💬 Prefix: ${PREFIX}\n` +
                          `👑 Owner: Silent Wolf\n` +
                          `📱 Owner Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `🔒 Mode: ${botMode.toUpperCase()} ${botMode === 'private' ? '🔒' : '🌍'}\n` +
                          `🔥 Status: ${isConnected ? 'Online ✅' : 'Offline ❌'}\n` +
                          `🧠 Memory: Persistent auto-clear ${MEMORY_CLEAR_INTERVAL/1000}s\n` +
                          `📊 Commands: ${commands.size} loaded\n` +
                          `💾 Recent Msgs: ${messageHistory.size}`
                }, { quoted: msg });
                break;
                
            case 'owner':
                await sock.sendMessage(chatId, { 
                    text: `👑 *BOT OWNER*\n\n` +
                          `🐺 Name: Silent Wolf\n` +
                          `📱 Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `⚡ Version: ${VERSION}\n` +
                          `🔧 Status: ${isConnected ? 'Active' : 'Inactive'}\n` +
                          `🧠 Memory: Persistent auto-clear ${MEMORY_CLEAR_INTERVAL/1000}s\n` +
                          `🔒 Mode: ${getBotMode().toUpperCase()}`
                }, { quoted: msg });
                break;
            
                
            case 'status':
                await sock.sendMessage(chatId, { 
                    text: `📊 *CONNECTION STATUS*\n\n` +
                          `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
                          `📱 Owner: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `🐺 Bot: ${BOT_NAME}\n` +
                          `⚡ Version: ${VERSION}\n` +
                          `🔒 Mode: ${getBotMode().toUpperCase()}\n` +
                          `🧠 Memory: ${messageHistory.size} messages tracked\n` +
                          `⏱️  Clear Interval: ${MEMORY_CLEAR_INTERVAL/1000}s`
                }, { quoted: msg });
                break;
                
            case 'clear':
                const beforeCount = messageHistory.size;
                messageHistory.clear();
                saveMessageHistory();
                console.log(chalk.green(`🧹 Manually cleared ${beforeCount} messages from memory`));
                await sock.sendMessage(chatId, { 
                    text: `🧹 *MEMORY CLEARED*\n\nCleared ${beforeCount} messages from memory.\nBot will only respond to new messages.`
                }, { quoted: msg });
                break;
      case 'mode':
    console.log(chalk.blue(`🔧 Mode command from: +${fromNumber}`));
    
    // ====== STEP 1: CHECK IF USER IS OWNER ======
    const ownerCheck = isOwner(chatId);
    
    if (!ownerCheck) {
        console.log(chalk.red(`❌ Access denied: +${fromNumber} is not owner`));
        
        // Get current owner info for the error message
        let currentOwner = "Unknown";
        try {
            if (fs.existsSync('./owner.json')) {
                const ownerData = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                currentOwner = ownerData.OWNER_NUMBER || "Unknown";
            }
        } catch (error) {
            console.error('Error reading owner file:', error);
        }
        
        await sock.sendMessage(chatId, {
            text: `❌ *Permission Denied*\n\nOnly the bot owner can change mode.\n\n*Current Owner:* +${currentOwner}\n*Your Number:* +${fromNumber}\n\nIf you just linked the bot and this is your number, please:\n1. Restart the bot completely\n2. Send any message first\n3. Then try .mode again`
        }, { quoted: msg });
        return;
    }
    
    console.log(chalk.green(`✅ Owner verified: +${fromNumber}`));
    
    // ====== STEP 2: ENSURE OWNER INFO IS SAVED ======
    if (!OWNER_NUMBER || !OWNER_JID) {
        // Save the current user as owner since they passed the check
        OWNER_NUMBER = fromNumber;
        OWNER_JID = chatId;
        
        try {
            const ownerData = {
                OWNER_NUMBER: OWNER_NUMBER,
                OWNER_JID: OWNER_JID,
                confirmedAt: new Date().toISOString(),
                confirmedBy: 'mode_command_check'
            };
            fs.writeFileSync('./owner.json', JSON.stringify(ownerData, null, 2));
            console.log(chalk.green(`✅ Owner info saved: +${OWNER_NUMBER}`));
        } catch (error) {
            console.error('Error saving owner info:', error);
        }
    }
    
    // ====== STEP 3: HANDLE MODE COMMAND ARGUMENTS ======
    if (args.length === 0) {
        // Show current mode
        const currentMode = getBotMode();
        const statusText = currentMode === 'private' 
            ? '🔒 *PRIVATE MODE*\nOnly you (owner) can use commands.'
            : '🌍 *PUBLIC MODE*\nEveryone can use commands.';
        
        await sock.sendMessage(chatId, {
            text: `🤖 *BOT MODE*\n\n${statusText}\n\n*Usage:*\n• ${PREFIX}mode public\n• ${PREFIX}mode private\n• ${PREFIX}mode status\n\nOwner: +${OWNER_NUMBER}`
        }, { quoted: msg });
        return;
    }
    
    const newMode = args[0].toLowerCase();
    
    // Handle status check
    if (newMode === 'status') {
        const currentMode = getBotMode();
        const statusText = currentMode === 'private' 
            ? '🔒 *PRIVATE MODE*\nOnly you (owner) can use commands.'
            : '🌍 *PUBLIC MODE*\nEveryone can use commands.';
        
        await sock.sendMessage(chatId, {
            text: `📊 *BOT MODE STATUS*\n\n${statusText}\n\nOwner: +${OWNER_NUMBER}`
        }, { quoted: msg });
        return;
    }
    
    // Validate mode
    if (newMode !== 'public' && newMode !== 'private') {
        await sock.sendMessage(chatId, {
            text: `❌ *Invalid Mode*\n\nPlease use:\n• ${PREFIX}mode public\n• ${PREFIX}mode private\n• ${PREFIX}mode status\n\nCurrent Mode: ${getBotMode().toUpperCase()}`
        }, { quoted: msg });
        return;
    }
    
    // Save new mode
    const success = setBotMode(newMode);
    
    if (!success) {
        await sock.sendMessage(chatId, {
            text: '❌ Error saving mode. Please try again.'
        }, { quoted: msg });
        return;
    }
    
    // Send success message
    const modeEmoji = newMode === 'private' ? '🔒' : '🌍';
    const modeDescription = newMode === 'private' 
        ? 'Only you (owner) can use commands.'
        : 'Everyone can use commands.';
    
    await sock.sendMessage(chatId, {
        text: `${modeEmoji} *MODE CHANGED*\n\nBot mode changed to: *${newMode.toUpperCase()}*\n\n${modeDescription}\n\n✅ Mode saved successfully!\n\nOwner: +${OWNER_NUMBER}`
    }, { quoted: msg });
    
    console.log(chalk.blue(`🔧 Mode changed to ${newMode} by owner +${OWNER_NUMBER}`));
    break;
        }
    } catch (error) {
        console.error(chalk.red('❌ Default command error:'), error.message);
    }
}

// ====== LOGIN SELECTION ======
async function selectLoginMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

    console.log(chalk.yellow('\n🐺 WOLF BOT LOGIN OPTIONS'));
    console.log('1) QR Code Login (Recommended)');
    console.log('2) Pair Code Login (Experimental)');
    
    try {
        const choice = await ask('Enter 1 or 2 (default 1): ');
        let mode = 'qr';
        let phone = null;

        if (choice === '2') {
            mode = 'pair';
            const pairManager = new PairCodeManager();
            phone = await pairManager.getPhoneNumber();
            pairManager.close();
            
            if (!phone.match(/^\d{10,15}$/)) {
                console.log(chalk.red('❌ Invalid phone number. Using QR code mode.'));
                mode = 'qr';
                phone = null;
            }
        }

        rl.close();
        return { mode, phone };
    } catch (error) {
        rl.close();
        console.log(chalk.yellow('⚠️ Using default QR code mode'));
        return { mode: 'qr', phone: null };
    }
}

// ====== MAIN APPLICATION START ======
async function main() {
    try {
        console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        console.log(chalk.gray(`🧠 Memory uses persistent storage (auto-clear every ${MEMORY_CLEAR_INTERVAL/1000}s)`));
        
        // Clean old message history on startup (older than 1 hour)
        try {
            if (fs.existsSync(MESSAGE_HISTORY_FILE)) {
                const data = JSON.parse(fs.readFileSync(MESSAGE_HISTORY_FILE, 'utf8'));
                const now = Date.now();
                const oneHourAgo = now - (60 * 60 * 1000);
                const filteredData = {};
                
                for (const [messageId, timestamp] of Object.entries(data)) {
                    if (timestamp > oneHourAgo) {
                        filteredData[messageId] = timestamp;
                    }
                }
                
                fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify(filteredData, null, 2));
                console.log(chalk.gray(`🧹 Cleaned old message history (keeping last hour)`));
            }
        } catch (error) {
            console.log(chalk.yellow('⚠️ Could not clean old message history'));
        }
        
        const { mode, phone } = await selectLoginMode();
        
        console.log(chalk.gray(`\nStarting with ${mode === 'qr' ? 'QR Code' : 'Pair Code'} mode...`));
        
        await startBot(mode, phone);
        
    } catch (error) {
        console.error(chalk.red('💥 FATAL ERROR:'), error);
        console.log(chalk.blue('🔄 Restarting in 10 seconds...'));
        await delay(10000);
        main();
    }
}

// ====== PROCESS HANDLERS ======
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
    stopMemoryClearing(); // This will save message history
    if (SOCKET_INSTANCE) {
        SOCKET_INSTANCE.ws.close();
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught Exception:'), error);
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('💥 Unhandled Rejection:'), error);
});

// Start the application
main().catch(error => {
    console.error(chalk.red('💥 CRITICAL ERROR:'), error);
    process.exit(1);
});

