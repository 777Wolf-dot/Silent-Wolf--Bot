


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

// const PREFIX = process.env.PREFIX || '.';
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




















// // ====== WOLF BOT - index.js ======
// // Fixed to prevent "Bad MAC" errors and improve stability

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

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '2.0.1'; // Updated version
// const SESSION_DIR = './auth_info_baileys';

// // Session repair flag to prevent loops
// let SESSION_REPAIR_ATTEMPTED = false;

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let CONNECTION_ATTEMPTS = 0;
// const MAX_CONNECTION_ATTEMPTS = 3;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session : Fixed to prevent "Bad MAC" errors
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

// // ====== SESSION VALIDATION & REPAIR ======
// async function validateAndRepairSession() {
//     const sessionFiles = [
//         'creds.json',
//         'pre-key-1.json', 'pre-key-2.json', 'pre-key-3.json', 'pre-key-4.json', 'pre-key-5.json',
//         'session-1.json', 'session-2.json', 'session-3.json', 'session-4.json', 'session-5.json',
//         'sender-key-1.json', 'sender-key-2.json', 'sender-key-3.json', 'sender-key-4.json', 'sender-key-5.json'
//     ];
    
//     let validSession = false;
    
//     // Check if creds.json exists and is valid
//     if (fs.existsSync(`${SESSION_DIR}/creds.json`)) {
//         try {
//             const creds = JSON.parse(fs.readFileSync(`${SESSION_DIR}/creds.json`, 'utf8'));
//             validSession = creds && creds.me && creds.me.id && creds.noiseKey;
            
//             // Additional validation for encryption keys
//             if (creds.noiseKey && creds.noiseKey.private && creds.noiseKey.public) {
//                 console.log(chalk.green('✅ Session encryption keys are valid'));
//             } else {
//                 console.log(chalk.yellow('⚠️ Session encryption keys may be invalid'));
//                 validSession = false;
//             }
            
//         } catch (error) {
//             console.log(chalk.red('❌ Corrupted creds.json file'));
//             validSession = false;
//         }
//     }
    
//     if (!validSession) {
//         console.log(chalk.yellow('🔄 Session validation failed, performing cleanup...'));
        
//         // Backup old session if it exists
//         if (fs.existsSync(SESSION_DIR)) {
//             const backupDir = `${SESSION_DIR}_backup_${Date.now()}`;
//             fs.cpSync(SESSION_DIR, backupDir, { recursive: true });
//             console.log(chalk.gray(`📁 Backed up old session to: ${backupDir}`));
//         }
        
//         // Clean session directory
//         if (fs.existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//         }
        
//         // Recreate directory
//         ensureSessionDir();
        
//         console.log(chalk.green('✅ Session directory cleaned and ready for new session'));
//     }
    
//     return validSession;
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
//                 await loadCommandsFromFolder(fullPath);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default;
                    
//                     if (command && command.name) {
//                         commands.set(command.name.toLowerCase(), command);
//                         console.log(chalk.green(`✅ Loaded command: ${command.name}`));
                        
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
//         return false;
//     }
    
//     try {
//         await command.execute(sock, msg, args, null, {});
//         return true;
//     } catch (error) {
//         console.error(chalk.red(`❌ Error executing command ${commandName}:`), error);
        
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

// // ====== CLEAN AUTH FUNCTION - ENHANCED ======
// function cleanAuth(force = false) {
//     try {
//         if (fs.existsSync(SESSION_DIR)) {
//             // Backup before cleaning
//             if (!force) {
//                 const backupDir = `${SESSION_DIR}_backup_${Date.now()}`;
//                 fs.cpSync(SESSION_DIR, backupDir, { recursive: true });
//                 console.log(chalk.gray(`📁 Session backed up to: ${backupDir}`));
//             }
            
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared auth session data'));
//         }
        
//         // Remove owner cache
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
        
//         // Reset session repair flag
//         SESSION_REPAIR_ATTEMPTED = false;
        
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data:'), error.message);
//     }
// }

// // ====== HANDLE BAD MAC ERRORS ======
// async function handleBadMACError(sock, reason) {
//     console.log(chalk.red('🔐 Bad MAC Error detected - Session encryption issue'));
    
//     if (!SESSION_REPAIR_ATTEMPTED) {
//         SESSION_REPAIR_ATTEMPTED = true;
//         console.log(chalk.yellow('🔄 Attempting to repair session...'));
        
//         // Clean and restart
//         cleanAuth(true);
        
//         console.log(chalk.blue('🔄 Restarting with fresh session in 3 seconds...'));
//         setTimeout(() => {
//             startBot('qr', null).catch(console.error);
//         }, 3000);
        
//         return true;
//     } else {
//         console.log(chalk.red('❌ Session repair already attempted. Full cleanup needed.'));
//         cleanAuth(true);
        
//         console.log(chalk.blue('🔄 Restarting with completely fresh session in 5 seconds...'));
//         setTimeout(() => {
//             startBot('qr', null).catch(console.error);
//         }, 5000);
        
//         return true;
//     }
// }

// // ====== BOT INITIALIZATION - UPDATED ======
// async function startBot(loginMode = 'qr', phoneNumber = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));
    
//     // Increment connection attempts
//     CONNECTION_ATTEMPTS++;
    
//     if (CONNECTION_ATTEMPTS > MAX_CONNECTION_ATTEMPTS) {
//         console.log(chalk.red(`❌ Too many connection attempts (${CONNECTION_ATTEMPTS}). Resetting...`));
//         CONNECTION_ATTEMPTS = 0;
//         cleanAuth(true);
        
//         await delay(5000);
//         return startBot('qr', null);
//     }

//     // Validate session before loading
//     console.log(chalk.blue('🔐 Validating session integrity...'));
//     await validateAndRepairSession();

//     // Load commands
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     // Ensure session directory exists
//     ensureSessionDir();

//     // For pair mode, always start fresh
//     if (loginMode === 'pair') {
//         console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
//         cleanAuth(true);
//         ensureSessionDir();
//     }

//     // Load auth state
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
//         cleanAuth(true);
//         ensureSessionDir();
        
//         const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//         state = freshAuth.state;
//         saveCreds = freshAuth.saveCreds;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration - ENHANCED for stability
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }), // Reduced logging to prevent noise
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: loginMode === 'qr',
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//         connectTimeoutMs: 60000,
//         keepAliveIntervalMs: 15000, // Increased keep-alive
//         defaultQueryTimeoutMs: 60000, // Set a reasonable timeout
//         emitOwnEvents: true,
//         mobile: false,
//         retryRequestDelayMs: 250, // Added retry delay
//         maxRetries: 3, // Added max retries
//         syncFullHistory: false, // Disable full history sync
//         transactionOpts: {
//             maxCommitRetries: 3, // Reduced retries
//         },
//         // Encryption settings
//         patchMessageBeforeSending: (message) => {
//             // Ensure proper message formatting
//             return message;
//         }
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.green('✅ WhatsApp client created successfully'));

//     // ====== EVENT HANDLERS - UPDATED ======
    
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
//             }, 10000); // Increased delay for stability
//         }

//         if (connection === 'open') {
//             isConnected = true;
//             CONNECTION_ATTEMPTS = 0; // Reset attempts on successful connection
//             SESSION_REPAIR_ATTEMPTED = false; // Reset repair flag
//             await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//         }

//         if (connection === 'close') {
//             isConnected = false;
//             const shouldRestart = await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
            
//             if (shouldRestart) {
//                 console.log(chalk.blue('🔄 Restarting in 10 seconds...'));
//                 setTimeout(() => startBot(loginMode, phoneNumber), 10000);
//             }
//         }
//     });

//     sock.ev.on('creds.update', saveCreds);

//     // Handle message decryption errors
//     sock.ev.on('messages.update', async (updates) => {
//         for (const update of updates) {
//             if (update.update?.messageStubType === 68) {
//                 console.log(chalk.yellow('⚠️ Message decryption issue detected'));
//             }
//         }
//     });

//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
        
//         const msg = messages[0];
//         if (!msg.message) return;

//         await handleIncomingMessage(sock, msg);
//     });

//     return sock;
// }

// // ====== CONNECTION HANDLERS - UPDATED ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = moment().format('h:mm:ss A');
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     try {
//         fs.writeFileSync('./owner.json', JSON.stringify({ 
//             OWNER_NUMBER, 
//             OWNER_JID,
//             lastConnected: currentTime,
//             version: VERSION
//         }, null, 2));
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
// ║  🔒 Session: ${chalk.green('Validated & Stable')}        
// ╚════════════════════════════════════════════════════════╝
// `));

//     // Send welcome message to owner
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${loginMode === 'pair' ? 'Pair Code' : 'QR Code'}\n🔒 Session: Validated & Stable\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
//         });
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode || 'N/A'})`));
    
//     // Check for Bad MAC errors
//     if (reason.includes('Bad MAC') || reason.includes('MAC') || (statusCode && [401, 403, 500].includes(statusCode))) {
//         console.log(chalk.red('🔐 Encryption/session error detected'));
//         const handled = await handleBadMACError(SOCKET_INSTANCE, reason);
//         if (handled) return false; // Don't restart from here, handledBadMACError will restart
//     }
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth(true);
        
//         if (loginMode === 'pair') {
//             console.log(chalk.yellow('💡 Pair code mode failed. Switching to QR code mode...'));
//             loginMode = 'qr';
//             phoneNumber = null;
//         }
//     }
    
//     return true; // Allow restart
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
//             await handleDefaultCommands(commandName, sock, msg, args);
//         }
//     }
// }

// // ====== DEFAULT COMMANDS - ENHANCED ======
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
//                           `• ${PREFIX}owner - Owner details\n` +
//                           `• ${PREFIX}fixsession - Fix session issues\n\n` +
//                           `🔧 *Session Commands*\n` +
//                           `• ${PREFIX}session - Session info\n` +
//                           `• ${PREFIX}status - Connection status\n` +
//                           `• ${PREFIX}restart - Restart bot`
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
//                           `🔒 Session: ${SESSION_REPAIR_ATTEMPTED ? 'Repaired 🔧' : 'Stable ✅'}\n` +
//                           `📊 Commands: ${commands.size} loaded\n` +
//                           `🔄 Connection Attempts: ${CONNECTION_ATTEMPTS}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'owner':
//                 await sock.sendMessage(chatId, { 
//                     text: `👑 *BOT OWNER*\n\n` +
//                           `🐺 Name: Silent Wolf\n` +
//                           `📱 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `⚡ Version: ${VERSION}\n` +
//                           `🔒 Session: ${SESSION_REPAIR_ATTEMPTED ? 'Repaired' : 'Stable'}\n` +
//                           `🔧 Status: ${isConnected ? 'Active ✅' : 'Inactive ❌'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'session':
//                 const sessionStatus = SESSION_REPAIR_ATTEMPTED ? 'Repaired 🔧' : 'Valid ✅';
//                 await sock.sendMessage(chatId, { 
//                     text: `📁 *SESSION INFORMATION*\n\n` +
//                           `📞 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `📁 Directory: ${SESSION_DIR}\n` +
//                           `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
//                           `🔒 Session: ${sessionStatus}\n` +
//                           `🐺 Bot: ${BOT_NAME} v${VERSION}\n` +
//                           `🔄 Attempts: ${CONNECTION_ATTEMPTS}/${MAX_CONNECTION_ATTEMPTS}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, { 
//                     text: `📊 *CONNECTION STATUS*\n\n` +
//                           `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
//                           `📱 Number: +${OWNER_NUMBER || 'Unknown'}\n` +
//                           `🐺 Bot: ${BOT_NAME}\n` +
//                           `⚡ Version: ${VERSION}\n` +
//                           `🔒 Session: ${SESSION_REPAIR_ATTEMPTED ? 'Repaired' : 'Stable'}\n` +
//                           `🔄 Connection Attempts: ${CONNECTION_ATTEMPTS}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'fixsession':
//                 console.log(chalk.yellow('🔄 Manual session repair requested'));
//                 cleanAuth(true);
//                 SESSION_REPAIR_ATTEMPTED = true;
//                 await sock.sendMessage(chatId, { 
//                     text: `🔧 *Session Repair Initiated*\n\nSession has been cleaned. Bot will restart automatically.`
//                 }, { quoted: msg });
                
//                 // Restart after delay
//                 setTimeout(() => {
//                     startBot('qr', null).catch(console.error);
//                 }, 3000);
//                 break;
                
//             case 'restart':
//                 await sock.sendMessage(chatId, { 
//                     text: `🔄 *Restarting Bot...*\n\nBot will restart in 3 seconds.`
//                 }, { quoted: msg });
                
//                 setTimeout(() => {
//                     console.log(chalk.yellow('🔄 Manual restart requested'));
//                     startBot('qr', null).catch(console.error);
//                 }, 3000);
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
//     console.log('1) QR Code Login (Recommended & Stable)');
//     console.log('2) Pair Code Login (Experimental)');
//     console.log(chalk.gray('Note: QR code is more reliable and avoids "Bad MAC" errors'));
    
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
//         console.log(chalk.yellow('⚠️ Using default QR code mode for stability'));
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

// // ====== PROCESS HANDLERS - ENHANCED ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         try {
//             SOCKET_INSTANCE.ws.close();
//         } catch (e) {
//             // Ignore
//         }
//     }
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
    
//     // Attempt to restart on critical errors
//     if (error.message.includes('Bad MAC') || error.message.includes('Session')) {
//         console.log(chalk.yellow('🔄 Session error detected, attempting restart...'));
//         setTimeout(() => {
//             startBot('qr', null).catch(console.error);
//         }, 5000);
//     }
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
// Fully fixed for SILENT-WOLF session ID support

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import moment from 'moment';
import crypto from 'crypto';

// CORRECT BAILEYS IMPORT
import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers, initAuthCreds } from '@whiskeysockets/baileys';

import P from 'pino';

// ====== CONFIGURATION ======
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '2.3.1';
const SESSION_DIR = './auth_info_baileys';
const SESSION_FILE = './session.json';
const SESSION_PREFIX = 'SILENT-WOLF';

let SESSION_REPAIR_ATTEMPTED = false;
let OWNER_NUMBER = null;
let OWNER_JID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;
let CONNECTION_ATTEMPTS = 0;
const MAX_CONNECTION_ATTEMPTS = 3;

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
║   🔒 Session : Supports QR/Pair/SessionID
║   🔑 Format  : SILENT-WOLF-[base64]
╚════════════════════════════════════════════════╝
`));

// ====== UTILITY FUNCTIONS ======
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function ensureSessionDir() {
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        console.log(chalk.green(`✅ Created session directory: ${SESSION_DIR}`));
    }
}

// ====== CUSTOM SINGLE FILE AUTH STATE ======
function useSingleFileAuthState(filename) {
    let creds;
    let keys = {};
    let metadata = {};
    
    const saveCreds = () => {
        if (creds) {
            const data = { creds, keys, metadata };
            fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        }
    };
    
    if (fs.existsSync(filename)) {
        try {
            const data = JSON.parse(fs.readFileSync(filename, 'utf-8'));
            creds = data.creds || initAuthCreds();
            keys = data.keys || {};
            metadata = data.metadata || {};
            console.log(chalk.green('✅ Loaded session file'));
        } catch (error) {
            console.error(chalk.red('❌ Failed to load session:'), error.message);
            creds = initAuthCreds();
        }
    } else {
        creds = initAuthCreds();
    }
    
    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => keys[`${type}-${ids.join('-')}`] || null,
                set: (data) => {
                    Object.entries(data).forEach(([key, value]) => keys[key] = value);
                    saveCreds();
                }
            },
            metadata
        },
        saveCreds
    };
}

// ====== DEBUG SESSION ID ======
async function debugSessionID(sessionID) {
    console.log(chalk.cyan('\n🔧 DEBUG SESSION ID:'));
    console.log(chalk.gray('Type:'), typeof sessionID);
    console.log(chalk.gray('Length:'), sessionID?.length || 0);
    
    if (typeof sessionID === 'string') {
        console.log(chalk.gray('Starts with SILENT-WOLF:'), sessionID.startsWith('SILENT-WOLF-'));
        console.log(chalk.gray('First 80 chars:'), sessionID.substring(0, 80) + '...');
        
        if (sessionID.startsWith('SILENT-WOLF-')) {
            const base64Part = sessionID.substring('SILENT-WOLF-'.length).replace(/\s/g, '');
            console.log(chalk.gray('Base64 length:'), base64Part.length);
            
            try {
                const decoded = Buffer.from(base64Part, 'base64').toString('utf8');
                console.log(chalk.green('✅ Base64 decoded'));
                console.log(chalk.gray('Decoded length:'), decoded.length);
                
                try {
                    const parsed = JSON.parse(decoded);
                    console.log(chalk.green('✅ JSON parsed'));
                    console.log(chalk.gray('Keys:'), Object.keys(parsed));
                    return parsed;
                } catch (e) {
                    console.log(chalk.red('❌ JSON parse failed:'), e.message);
                }
            } catch (e) {
                console.log(chalk.red('❌ Base64 decode failed:'), e.message);
            }
        }
    }
    
    return null;
}

// ====== PARSE SILENT-WOLF SESSION ======
function parseSilentWolfSession(sessionID) {
    try {
        if (typeof sessionID !== 'string') {
            sessionID = String(sessionID);
        }
        
        sessionID = sessionID.trim();
        
        if (sessionID.startsWith('SILENT-WOLF-')) {
            const base64Data = sessionID.substring('SILENT-WOLF-'.length).replace(/\s/g, '');
            
            const decodedString = Buffer.from(base64Data, 'base64').toString('utf8');
            const sessionObject = JSON.parse(decodedString);
            
            if (sessionObject.prefix !== SESSION_PREFIX) {
                console.log(chalk.yellow('⚠️ Invalid SILENT-WOLF prefix'));
                return null;
            }
            
            console.log(chalk.green(`✅ SILENT-WOLF v${sessionObject.version}`));
            console.log(chalk.gray('Generated:'), new Date(sessionObject.timestamp).toLocaleString());
            
            return sessionObject.data;
        }
        
        return null;
        
    } catch (error) {
        console.error(chalk.red('❌ Parse failed:'), error.message);
        return null;
    }
}

// ====== SAVE SESSION FROM ID ======
async function saveSessionFromID(sessionID) {
    try {
        let sessionData;
        
        console.log(chalk.blue('\n🔍 Processing session ID...'));
        await debugSessionID(sessionID);
        
        const silentWolfSession = parseSilentWolfSession(sessionID);
        if (silentWolfSession) {
            sessionData = silentWolfSession;
            console.log(chalk.green('✅ Parsed as SILENT-WOLF'));
        }
        
        if (!sessionData) {
            let sessionString = sessionID;
            if (typeof sessionID !== 'string') {
                sessionString = String(sessionID);
            }
            
            sessionString = sessionString.trim().replace(/^['"]|['"]$/g, '');
            
            try {
                sessionData = JSON.parse(sessionString);
                console.log(chalk.green('✅ Parsed as JSON'));
            } catch {
                try {
                    if (sessionString.match(/^[A-Za-z0-9+/]+=*$/)) {
                        const decoded = Buffer.from(sessionString, 'base64').toString('utf8');
                        sessionData = JSON.parse(decoded);
                        console.log(chalk.green('✅ Decoded from base64'));
                    } else {
                        throw new Error('Not base64');
                    }
                } catch {
                    console.log(chalk.yellow('⚠️ Unrecognized format, creating minimal session'));
                    sessionData = {
                        creds: {
                            ...initAuthCreds(),
                            me: { id: `${Date.now()}@s.whatsapp.net` },
                            phoneId: `phone_${Date.now()}`,
                            platform: 'chrome',
                        }
                    };
                }
            }
        }
        
        const fullSession = {
            creds: {
                ...initAuthCreds(),
                me: sessionData.creds?.me || { id: `${Date.now()}@s.whatsapp.net` },
                phoneId: sessionData.creds?.phoneId || `phone_${Date.now()}`,
                platform: sessionData.creds?.platform || 'chrome',
                noiseKey: sessionData.creds?.noiseKey || { private: {}, public: {} },
                signedIdentityKey: sessionData.creds?.signedIdentityKey || { private: {}, public: {} },
                signedPreKey: sessionData.creds?.signedPreKey || {},
                registrationId: sessionData.creds?.registrationId || 1234,
                advSecretKey: sessionData.creds?.advSecretKey || 'secret'
            },
            keys: sessionData.keys || sessionData.key || {},
            metadata: {
                source: silentWolfSession ? 'SILENT-WOLF' : 'other',
                importedAt: Date.now(),
                version: VERSION
            }
        };
        
        fs.writeFileSync(SESSION_FILE, JSON.stringify(fullSession, null, 2));
        console.log(chalk.green(`✅ Saved to: ${SESSION_FILE}`));
        
        ensureSessionDir();
        fs.writeFileSync(`${SESSION_DIR}/creds.json`, JSON.stringify(fullSession.creds, null, 2));
        
        if (Object.keys(fullSession.keys).length > 0) {
            Object.entries(fullSession.keys).forEach(([key, value]) => {
                fs.writeFileSync(`${SESSION_DIR}/${key}.json`, JSON.stringify(value, null, 2));
            });
            console.log(chalk.green(`✅ Saved ${Object.keys(fullSession.keys).length} keys`));
        }
        
        console.log(chalk.gray(`👤 User: ${fullSession.creds.me?.id || 'Unknown'}`));
        
        return true;
        
    } catch (error) {
        console.error(chalk.red('❌ Save failed:'), error.message);
        return false;
    }
}

function loadSessionFromID() {
    try {
        if (!fs.existsSync(SESSION_FILE)) {
            return null;
        }
        
        const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
        
        if (!sessionData.creds || !sessionData.creds.me) {
            console.log(chalk.red('❌ Invalid session file'));
            return null;
        }
        
        console.log(chalk.green('✅ Session loaded'));
        console.log(chalk.gray('Source:'), sessionData.metadata?.source || 'unknown');
        
        return sessionData;
        
    } catch (error) {
        console.error(chalk.red('❌ Load failed:'), error.message);
        return null;
    }
}

// ====== SESSION VALIDATION ======
async function validateAndRepairSession(loginMode = 'multi') {
    if (loginMode === 'sessionid') {
        if (fs.existsSync(SESSION_FILE)) {
            try {
                const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
                if (session.creds && session.creds.me && session.creds.me.id) {
                    console.log(chalk.green('✅ Session file valid'));
                    return true;
                }
            } catch (error) {
                console.log(chalk.red('❌ Invalid session file'));
            }
        }
        return false;
    }
    
    if (fs.existsSync(`${SESSION_DIR}/creds.json`)) {
        try {
            const creds = JSON.parse(fs.readFileSync(`${SESSION_DIR}/creds.json`, 'utf8'));
            if (creds && creds.me && creds.me.id) {
                console.log(chalk.green('✅ Multi-file session valid'));
                return true;
            }
        } catch (error) {
            console.log(chalk.red('❌ Corrupted creds.json'));
        }
    }
    
    console.log(chalk.yellow('🔄 Cleaning session...'));
    
    if (fs.existsSync(SESSION_DIR)) {
        const backupDir = `${SESSION_DIR}_backup_${Date.now()}`;
        try {
            fs.cpSync(SESSION_DIR, backupDir, { recursive: true });
            console.log(chalk.gray(`📁 Backed up to: ${backupDir}`));
        } catch {}
        
        fs.rmSync(SESSION_DIR, { recursive: true, force: true });
    }
    
    if (fs.existsSync(SESSION_FILE)) {
        fs.unlinkSync(SESSION_FILE);
    }
    
    ensureSessionDir();
    console.log(chalk.green('✅ Session cleaned'));
    
    return false;
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
                await loadCommandsFromFolder(fullPath);
            } else if (item.endsWith('.js')) {
                try {
                    const commandModule = await import(`file://${fullPath}`);
                    const command = commandModule.default;
                    
                    if (command && command.name) {
                        commands.set(command.name.toLowerCase(), command);
                        console.log(chalk.green(`✅ Loaded: ${command.name}`));
                        
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                                console.log(chalk.gray(`   ↳ Alias: ${alias}`));
                            });
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`❌ Failed: ${item}`), error);
                }
            }
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error reading: ${folderPath}`), error);
    }
}

async function executeCommand(commandName, sock, msg, args) {
    const command = commands.get(commandName.toLowerCase());
    
    if (!command) {
        return false;
    }
    
    try {
        await command.execute(sock, msg, args, null, {});
        return true;
    } catch (error) {
        console.error(chalk.red(`❌ Command error ${commandName}:`), error);
        
        try {
            await sock.sendMessage(msg.key.remoteJid, { 
                text: `❌ Error running *${commandName}*.` 
            }, { quoted: msg });
        } catch {}
        
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
            this.rl.question(chalk.yellow('📱 Enter number (e.g., 254788710904): '), (number) => {
                const cleanedNumber = number.trim().replace(/[^0-9]/g, '');
                
                if (!cleanedNumber || cleanedNumber.length < 10) {
                    console.log(chalk.red('❌ Invalid number.'));
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

// ====== SESSION ID MANAGER ======
class SessionIDManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    async getSessionID() {
        return new Promise((resolve) => {
            console.log(chalk.cyan('\n📋 PASTE SESSION ID:'));
            console.log(chalk.gray('═'.repeat(50)));
            console.log(chalk.green('📌 MUST start with: SILENT-WOLF-'));
            console.log(chalk.yellow('💡 Copy from WhatsApp message'));
            console.log(chalk.gray('═'.repeat(50)));
            console.log(chalk.cyan('📝 Paste below (Ctrl+V, then Enter):\n'));
            
            this.rl.question('Session ID: ', (input) => {
                this.rl.close();
                
                let sessionID = input.trim();
                sessionID = sessionID.replace(/^['"]|['"]$/g, '');
                sessionID = sessionID.replace(/\n/g, '').replace(/\r/g, '');
                
                console.log(chalk.gray('Length:'), sessionID.length);
                console.log(chalk.gray('Starts with SILENT-WOLF:'), sessionID.startsWith('SILENT-WOLF-'));
                
                resolve(sessionID);
            });
            
            setTimeout(() => {
                if (this.rl) {
                    console.log(chalk.yellow('\n⏰ Timeout.'));
                    this.rl.close();
                    resolve('');
                }
            }, 60000);
        });
    }

    close() {
        if (this.rl) {
            this.rl.close();
        }
    }
}

// ====== CLEAN AUTH ======
function cleanAuth(force = false, loginMode = 'multi') {
    try {
        console.log(chalk.blue('🧹 Cleaning auth...'));
        
        if (loginMode === 'sessionid' || force) {
            if (fs.existsSync(SESSION_FILE)) {
                if (!force) {
                    const backupFile = `${SESSION_FILE}_backup_${Date.now()}.json`;
                    fs.copyFileSync(SESSION_FILE, backupFile);
                    console.log(chalk.gray(`📁 Backed up: ${backupFile}`));
                }
                fs.unlinkSync(SESSION_FILE);
                console.log(chalk.yellow('🗑️  Removed session file'));
            }
        }
        
        if (loginMode === 'multi' || force) {
            if (fs.existsSync(SESSION_DIR)) {
                if (!force) {
                    const backupDir = `${SESSION_DIR}_backup_${Date.now()}`;
                    try {
                        fs.cpSync(SESSION_DIR, backupDir, { recursive: true });
                        console.log(chalk.gray(`📁 Backed up: ${backupDir}`));
                    } catch {}
                }
                
                fs.rmSync(SESSION_DIR, { recursive: true, force: true });
                console.log(chalk.yellow('🗑️  Cleared multi-file'));
            }
        }
        
        if (fs.existsSync('./owner.json')) {
            fs.unlinkSync('./owner.json');
            console.log(chalk.yellow('🗑️  Removed owner cache'));
        }
        
        SESSION_REPAIR_ATTEMPTED = false;
        console.log(chalk.green('✅ Cleanup complete'));
        
    } catch (error) {
        console.log(chalk.yellow('⚠️ Clean error:'), error.message);
    }
}

// ====== BAD MAC HANDLER ======
async function handleBadMACError(sock, reason, loginMode) {
    console.log(chalk.red('🔐 Bad MAC Error'));
    
    if (!SESSION_REPAIR_ATTEMPTED) {
        SESSION_REPAIR_ATTEMPTED = true;
        console.log(chalk.yellow('🔄 Repairing session...'));
        
        cleanAuth(true, loginMode);
        
        console.log(chalk.blue('🔄 Restarting in 3s...'));
        setTimeout(() => {
            startBot('qr', null).catch(console.error);
        }, 3000);
        
        return true;
    } else {
        console.log(chalk.red('❌ Already repaired. Full cleanup.'));
        cleanAuth(true, loginMode);
        
        console.log(chalk.blue('🔄 Restarting in 5s...'));
        setTimeout(() => {
            startBot('qr', null).catch(console.error);
        }, 5000);
        
        return true;
    }
}

// ====== BOT INITIALIZATION ======
async function startBot(loginMode = 'qr', credentials = null) {
    console.log(chalk.magenta('\n🔧 Initializing...'));
    
    CONNECTION_ATTEMPTS++;
    
    if (CONNECTION_ATTEMPTS > MAX_CONNECTION_ATTEMPTS) {
        console.log(chalk.red(`❌ Too many attempts (${CONNECTION_ATTEMPTS}).`));
        CONNECTION_ATTEMPTS = 0;
        cleanAuth(true, loginMode);
        
        await delay(5000);
        return startBot('qr', null);
    }

    // CHECK SESSION FILE FOR SESSION ID MODE
    if (loginMode === 'sessionid') {
        console.log(chalk.blue('🔐 Checking session file...'));
        
        if (!fs.existsSync(SESSION_FILE)) {
            console.log(chalk.red('❌ No session file found.'));
            console.log(chalk.yellow('🔄 Switching to QR mode...'));
            loginMode = 'qr';
        } else {
            try {
                const sessionData = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf8'));
                if (!sessionData.creds || !sessionData.creds.me || !sessionData.creds.me.id) {
                    console.log(chalk.red('❌ Invalid session file.'));
                    console.log(chalk.yellow('🔄 Switching to QR mode...'));
                    loginMode = 'qr';
                } else {
                    console.log(chalk.green('✅ Session file valid'));
                    console.log(chalk.gray('Source:'), sessionData.metadata?.source || 'unknown');
                }
            } catch (error) {
                console.log(chalk.red('❌ Corrupted session file.'));
                console.log(chalk.yellow('🔄 Switching to QR mode...'));
                loginMode = 'qr';
            }
        }
    }

    // LOAD COMMANDS
    console.log(chalk.blue('📂 Loading commands...'));
    await loadCommandsFromFolder('./commands');
    console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

    if (loginMode !== 'sessionid') {
        ensureSessionDir();
    }

    if (loginMode === 'pair') {
        console.log(chalk.yellow('🔄 Fresh session for pair...'));
        cleanAuth(true, 'multi');
        ensureSessionDir();
    }

    // LOAD AUTH STATE
    let state, saveCreds;
    try {
        console.log(chalk.blue('🔐 Loading auth...'));
        
        if (loginMode === 'sessionid') {
            const authState = useSingleFileAuthState(SESSION_FILE);
            state = authState.state;
            saveCreds = authState.saveCreds;
            
            if (!state.creds.me || !state.creds.me.id) {
                throw new Error('No valid credentials');
            }
            
            console.log(chalk.green('✅ Session loaded'));
            console.log(chalk.gray('Phone:'), state.creds.me.id);
            
        } else {
            const authState = await useMultiFileAuthState(SESSION_DIR);
            state = authState.state;
            saveCreds = authState.saveCreds;
            console.log(chalk.green('✅ Multi-file loaded'));
        }
    } catch (error) {
        console.error(chalk.red('❌ Auth error:'), error.message);
        
        if (loginMode === 'sessionid') {
            console.log(chalk.yellow('🔄 Session failed, switching to QR...'));
            loginMode = 'qr';
            credentials = null;
        }
        
        console.log(chalk.yellow('🔄 Creating fresh auth...'));
        cleanAuth(true, loginMode);
        ensureSessionDir();
        
        const freshAuth = await useMultiFileAuthState(SESSION_DIR);
        state = freshAuth.state;
        saveCreds = freshAuth.saveCreds;
    }

    const { version } = await fetchLatestBaileysVersion();
    console.log(chalk.blue(`📦 Baileys: ${version}`));

    // SOCKET CONFIG - NO QR FOR SESSION ID
    const socketConfig = {
        version,
        logger: P({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: loginMode === 'qr', // FALSE for sessionid
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 30000,
        keepAliveIntervalMs: 15000,
        defaultQueryTimeoutMs: 60000,
        emitOwnEvents: true,
        mobile: false,
        retryRequestDelayMs: 250,
        maxRetries: 3,
        syncFullHistory: false,
    };

    let phoneNumber = null;
    if (loginMode === 'pair' && typeof credentials === 'string') {
        phoneNumber = credentials;
    }

    const sock = makeWASocket(socketConfig);
    SOCKET_INSTANCE = sock;

    console.log(chalk.green('✅ WhatsApp client created'));
    console.log(chalk.gray(`🔗 Mode: ${loginMode}`));

    // ====== EVENT HANDLERS ======
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        console.log(chalk.gray(`🔗 State: ${connection || 'connecting...'}`));

        // QR CODE ONLY FOR QR MODE
        if (qr && loginMode === 'qr') {
            console.log(chalk.yellow('\n📲 QR Code:\n'));
            qrcode.generate(qr, { small: true });
            console.log(chalk.gray('💡 Scan with WhatsApp'));
        } else if (qr && loginMode === 'sessionid') {
            // THIS SHOULD NOT HAPPEN - SESSION ID FAILED
            console.log(chalk.red('\n❌ SESSION ID FAILED!'));
            console.log(chalk.red('QR appeared - session invalid'));
            console.log(chalk.yellow('🔄 Cleaning session and using QR...'));
            
            cleanAuth(true, 'sessionid');
            loginMode = 'qr';
            
            console.log(chalk.yellow('\n📲 QR Code instead:\n'));
            qrcode.generate(qr, { small: true });
        }

        if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
            setTimeout(async () => {
                try {
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

                    console.log(chalk.blue('\n📱 How to use:'));
                    console.log(chalk.white('1. WhatsApp → Settings → Linked Devices'));
                    console.log(chalk.white(`2. Enter: ${chalk.yellow.bold(formattedCode)}`));
                    console.log(chalk.gray('\n⏳ Waiting...'));

                } catch (error) {
                    console.error(chalk.red('❌ Pair code failed:'), error.message);
                    loginMode = 'qr';
                    
                    if (update.qr) {
                        console.log(chalk.yellow('\n📲 QR Code:\n'));
                        qrcode.generate(update.qr, { small: true });
                    }
                }
            }, 5000);
        }

        if (connection === 'open') {
            isConnected = true;
            CONNECTION_ATTEMPTS = 0;
            SESSION_REPAIR_ATTEMPTED = false;
            
            OWNER_JID = sock.user.id;
            OWNER_NUMBER = OWNER_JID.split('@')[0];
            
            console.log(chalk.greenBright(`
╔════════════════════════════════════════════════╗
║              🐺 ${chalk.bold('SILENT WOLF ONLINE')}          ║
╠════════════════════════════════════════════════╣
║  ✅ Connected!                                 
║  👑 Owner : +${OWNER_NUMBER}
║  🔐 Method: ${loginMode === 'qr' ? 'QR Code' : loginMode === 'pair' ? 'Pair Code' : 'Session ID'}
║  🔥 Status: ${chalk.redBright('Ready!')}         
╚════════════════════════════════════════════════╝
`));

            try {
                fs.writeFileSync('./owner.json', JSON.stringify({ 
                    OWNER_NUMBER, OWNER_JID, 
                    loginMode, botName: BOT_NAME 
                }, null, 2));
                
                await sock.sendMessage(OWNER_JID, {
                    text: `🐺 *${BOT_NAME} ONLINE*\n\n✅ Connected!\n👑 +${OWNER_NUMBER}\n🔐 ${loginMode === 'qr' ? 'QR' : loginMode === 'pair' ? 'Pair' : 'Session ID'}\n🔥 Ready!`
                });
            } catch {}
        }

        if (connection === 'close') {
            isConnected = false;
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const reason = lastDisconnect?.error?.output?.payload?.message || lastDisconnect?.error?.message || 'Unknown';
            
            console.log(chalk.red(`\n❌ Disconnected: ${reason} (${statusCode || 'N/A'})`));
            
            if (reason.includes('Bad MAC') || reason.includes('MAC') || [401, 403, 500].includes(statusCode)) {
                const handled = await handleBadMACError(SOCKET_INSTANCE, reason, loginMode);
                if (handled) return;
            }
            
            if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
                console.log(chalk.yellow('🔓 Logged out. Cleaning...'));
                cleanAuth(true, loginMode);
                
                if (loginMode === 'pair' || loginMode === 'sessionid') {
                    console.log(chalk.yellow('💡 Switching to QR...'));
                    loginMode = 'qr';
                }
            }
            
            console.log(chalk.blue('🔄 Restarting in 10s...'));
            setTimeout(() => startBot(loginMode, phoneNumber || credentials), 10000);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;

        const chatId = msg.key.remoteJid;
        const textMsg = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || 
                       msg.message.videoMessage?.caption || '';
        
        if (!textMsg) return;

        if (textMsg.startsWith(PREFIX)) {
            const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
            const commandName = parts[0].toLowerCase();
            const args = parts.slice(1);
            
            console.log(chalk.magenta(`📩 ${chatId.split('@')[0]} → ${PREFIX}${commandName}`));
            
            await executeCommand(commandName, sock, msg, args);
        }
    });

    return sock;
}

// ====== LOGIN SELECTION ======
async function selectLoginMode() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

    console.log(chalk.yellow('\n🐺 LOGIN OPTIONS'));
    console.log(chalk.gray('═'.repeat(50)));
    console.log('1) QR Code (Recommended)');
    console.log('2) Pair Code');
    console.log('3) Session ID (SILENT-WOLF)');
    console.log(chalk.gray('═'.repeat(50)));
    console.log(chalk.cyan('Session ID MUST start with: SILENT-WOLF-'));
    console.log(chalk.gray('═'.repeat(50)));
    
    try {
        const choice = await ask('Enter 1, 2, or 3 (default 1): ');
        let mode = 'qr';
        let credentials = null;

        if (choice === '2') {
            mode = 'pair';
            const pairManager = new PairCodeManager();
            credentials = await pairManager.getPhoneNumber();
            pairManager.close();
            
            if (!credentials.match(/^\d{10,15}$/)) {
                console.log(chalk.red('❌ Invalid. Using QR.'));
                mode = 'qr';
                credentials = null;
            }
            
        } else if (choice === '3') {
            mode = 'sessionid';
            const sessionManager = new SessionIDManager();
            credentials = await sessionManager.getSessionID();
            sessionManager.close();
            
            if (!credentials || credentials.trim() === '') {
                console.log(chalk.red('❌ Empty. Using QR.'));
                mode = 'qr';
                credentials = null;
            } else if (!credentials.startsWith('SILENT-WOLF-')) {
                console.log(chalk.red('❌ Not SILENT-WOLF format.'));
                console.log(chalk.red('Got:'), credentials.substring(0, 50) + '...');
                console.log(chalk.yellow('💡 Copy entire session ID from WhatsApp'));
                mode = 'qr';
                credentials = null;
            } else {
                console.log(chalk.blue('💾 Saving session...'));
                const saved = await saveSessionFromID(credentials);
                if (!saved) {
                    console.log(chalk.red('❌ Save failed. Using QR.'));
                    mode = 'qr';
                    credentials = null;
                } else {
                    console.log(chalk.green('✅ Session saved'));
                }
            }
        }

        rl.close();
        return { mode, credentials };
        
    } catch (error) {
        rl.close();
        console.log(chalk.yellow('⚠️ Using QR mode'));
        return { mode: 'qr', credentials: null };
    }
}

// ====== MAIN ======
async function main() {
    try {
        console.log(chalk.blue('\n🚀 Starting...'));
        
        const { mode, credentials } = await selectLoginMode();
        
        console.log(chalk.gray(`\nStarting: ${mode === 'qr' ? 'QR' : mode === 'pair' ? 'Pair' : 'Session ID'}`));
        
        await startBot(mode, credentials);
        
    } catch (error) {
        console.error(chalk.red('💥 FATAL:'), error);
        console.log(chalk.blue('🔄 Restarting in 10s...'));
        await delay(10000);
        main();
    }
}

// ====== PROCESS HANDLERS ======
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down...'));
    if (SOCKET_INSTANCE) {
        try { SOCKET_INSTANCE.ws.close(); } catch {}
    }
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught:'), error);
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('💥 Unhandled:'), error);
});

// START
main().catch(error => {
    console.error(chalk.red('💥 CRITICAL:'), error);
    process.exit(1);
});