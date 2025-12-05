// // ====== IMPORTS ======
// import pkg from '@whiskeysockets/baileys';
// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion
// } = pkg;

// import P from 'pino';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';

// dotenv.config();

// // ====== CONFIG ======
// const PREFIX = process.env.PREFIX || '.';
// console.log(chalk.green('✅ Current PREFIX:'), `"${PREFIX}"`);

// const commands = new Map();
// const messageCache = {};

// // ====== COMMAND LOADER ======
// function loadCommandsFromFolder(folderPath) {
//     const absolutePath = path.resolve(folderPath);
//     fs.readdirSync(absolutePath).forEach((file) => {
//         const fullPath = path.join(absolutePath, file);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//             loadCommandsFromFolder(fullPath);
//         } else if (file.endsWith('.js')) {
//             import(`file://${fullPath}`)
//                 .then((cmdModule) => {
//                     const cmd = cmdModule.default;
//                     if (cmd?.name) {
//                         commands.set(cmd.name.toLowerCase(), cmd);
//                         if (Array.isArray(cmd.alias)) {
//                             cmd.alias.forEach(alias => commands.set(alias.toLowerCase(), cmd));
//                         }
//                         console.log(chalk.blueBright(`✅ Loaded command: ${cmd.name}`));
//                     }
//                 })
//                 .catch((err) => {
//                     console.error(`❌ Failed to load command file: ${file}`, err);
//                 });
//         }
//     });
// }

// // Load commands initially
// loadCommandsFromFolder('./commands');

// // ====== COMMAND HANDLER ======
// async function handleCommand(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const command = commands.get(commandName.toLowerCase());

//     if (!command) return;

//     try {
//         let metadata = null;
//         if (chatId.endsWith('@g.us')) {
//             try {
//                 metadata = await sock.groupMetadata(chatId);
//             } catch (err) {
//                 console.error(`⚠️ Failed to fetch group metadata for ${chatId}`, err);
//             }
//         }
//         await command.execute(sock, msg, args, metadata);
//     } catch (err) {
//         console.error(`❌ Error executing ${commandName}:`, err);
//         await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}* command.` }, { quoted: msg });
//     }
// }

// // ====== MAIN SOCKET ======
// const startSock = async () => {
//     const { state, saveCreds } = await useMultiFileAuthState('auth');
//     const { version } = await fetchLatestBaileysVersion();

//     const sock = makeWASocket({
//         version,
//         auth: state,
//         logger: P({ level: 'silent' }),
//         browser: ['Silent Wolf', 'Safari', '1.0']
//     });

//     // ====== QR CODE HANDLING ======
//     sock.ev.on('connection.update', (update) => {
//         const { connection, lastDisconnect, qr } = update;

//         if (qr) {
//             console.log(chalk.yellow('📲 Scan this QR code to connect:'));
//             qrcode.generate(qr, { small: true });
//         }

//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode;
//             if (reason === DisconnectReason.loggedOut) {
//                 console.log(chalk.red('❌ Logged out. Please scan the QR again.'));
//                 fs.rmSync('./auth', { recursive: true, force: true });
//                 startSock();
//             } else {
//                 console.log(chalk.red(`Connection closed. Reconnecting...`));
//                 startSock();
//             }
//         } else if (connection === 'open') {
//             console.log(chalk.green('✅ Connected to WhatsApp!'));
//         }
//     });

//     sock.ev.on('creds.update', saveCreds);

//     // ====== MESSAGE LISTENER ======
//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message) return;

//         if (!messageCache[msg.key.remoteJid]) messageCache[msg.key.remoteJid] = {};
//         messageCache[msg.key.remoteJid][msg.key.id] = msg;

//         const textMsg =
//             msg.message?.conversation ||
//             msg.message?.extendedTextMessage?.text;

//         const sender = msg.key.remoteJid;

//         if (textMsg?.startsWith(PREFIX)) {
//             const parts = textMsg.trim().slice(PREFIX.length).split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);

//             console.log(`📩 Command from ${msg.key.fromMe ? 'SELF 🐺' : sender}: ${textMsg}`);

//             if (commandName === 'menu') {
//                 const imported = await import(`./commands/menus/settingMenu.js?update=${Date.now()}`);
//                 const getMenu = imported.default || imported;
//                 const menuText = typeof getMenu === 'function' ? getMenu() : String(getMenu);
//                 await sock.sendMessage(sender, { text: menuText }, { quoted: msg });
//             } else {
//                 await handleCommand(commandName, sock, msg, args);
//             }
//         }
//     });

//     return sock;
// };

// // Start bot
// startSock();







// // ====== WOLF BOT - index.js ======
// // Fast, stable & themed. Supports QR or Pair Code login.
// // Owner: Auto-detected 🐺

// import menu from './commands/menus/menu.js';
// import { withPerformance } from './commands/speed/performanceWrapper.js';
// import { loadImages, images } from './commands/speed/imageLoader.js';
// import { saveSession, loadSession } from './supabase.js'; // <-- Supabase integration
// import autoreactstatus from "./commands/owner/autoreactstatus.js";


// import pkg from '@whiskeysockets/baileys';
// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore
// } = pkg;

// import P from 'pino';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment'; // for time formatting

// dotenv.config();

// // ====== CONFIG ======
// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// // 🐺 AUTO OWNER UPDATE - load previous owner if saved
// let OWNER_NUMBER = null;
// let OWNER_JID = null;

// if (fs.existsSync('./owner.json')) {
//     const data = JSON.parse(fs.readFileSync('./owner.json'));
//     OWNER_NUMBER = data.OWNER_NUMBER;
//     OWNER_JID = data.OWNER_JID;
// }

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ONLINE MODE')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   👑 Owner   : ${OWNER_NUMBER ? '+' + OWNER_NUMBER : chalk.yellow('Not yet linked')}
// ╚════════════════════════════════════════════════╝
// `));

// const commands = new Map();
// const messageCache = {};

// // ====== LOAD COMMANDS ======
// function loadCommandsFromFolder(folderPath) {
//     const absolutePath = path.resolve(folderPath);
//     fs.readdirSync(absolutePath).forEach((file) => {
//         const fullPath = path.join(absolutePath, file);
//         const stat = fs.statSync(fullPath);

//         if (stat.isDirectory()) {
//             loadCommandsFromFolder(fullPath);
//         } else if (file.endsWith('.js')) {
//             import(`file://${fullPath}?v=${Date.now()}`)
//                 .then((cmdModule) => {
//                     let cmd = cmdModule.default;
//                     if (cmd?.name) {
//                         cmd = withPerformance(cmd);
//                         commands.set(cmd.name.toLowerCase(), cmd);
//                         if (Array.isArray(cmd.alias)) {
//                             cmd.alias.forEach(alias =>
//                                 commands.set(alias.toLowerCase(), cmd)
//                             );
//                         }
//                     }
//                 })
//                 .catch((err) => {
//                     console.error(`❌ Failed to load command: ${file}`, err);
//                 });
//         }
//     });
// }

// loadCommandsFromFolder('./commands');

// // ====== HANDLE COMMANDS ======
// async function handleCommand(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const command = commands.get(commandName.toLowerCase());
//     if (!command) return;

//     try {
//         let metadata = null;
//         if (chatId.endsWith('@g.us')) {
//             try {
//                 metadata = await sock.groupMetadata(chatId);
//             } catch {
//                 console.warn(`⚠️ Failed to fetch group metadata for ${chatId}`);
//             }
//         }
//         await command.execute(sock, msg, args, metadata, images);
//     } catch (err) {
//         console.error(`❌ Error executing ${commandName}:`, err);
//         await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}*.` }, { quoted: msg });
//     }
// }

// // ====== START SOCKET WITH SUPABASE SESSION ======
// async function startSock(mode = 'qr', phoneNumber = null) {
//     let supaState = await loadSession('main');
//     let state, saveCreds;

//     if (supaState) {
//         console.log(chalk.green('✅ Loaded session from Supabase!'));
//         state = supaState;
//         saveCreds = async () => await saveSession('main', state);
//     } else {
//         const localState = await useMultiFileAuthState('auth');
//         state = localState.state;
//         saveCreds = localState.saveCreds;
//     }

//     const { version } = await fetchLatestBaileysVersion();

//     console.log(chalk.magentaBright(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 Initializing ${chalk.bold(BOT_NAME.toUpperCase())}...                   
// ║   ⚙️ Preparing secure connection to WhatsApp...    
// ║   🚀 Version: ${VERSION} | Browser: Chrome        
// ╚════════════════════════════════════════════════╝
// `));

//     const sock = makeWASocket({
//         version,
//         logger: P({ level: 'silent' }),
//         browser: [BOT_NAME, 'Chrome', VERSION],
//         printQRInTerminal: false,
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
//         },
//     });

//     console.log(chalk.cyanBright(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold('WOLF ENGINE ONLINE')}                    
// ║   🔄 Socket created successfully                  
// ║   🕸️ Establishing link with WhatsApp servers...  
// ╚════════════════════════════════════════════════╝
// `));

//     // ====== CONNECTION HANDLING ======
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         if (qr && mode === 'qr') {
//             console.log(chalk.yellow('\n📲 Scan this QR to connect your WolfBot:\n'));
//             qrcode.generate(qr, { small: true });
//         }

//         if (connection === 'open') {
//             const currentTime = moment().format('h:mm:ss A');

//             OWNER_JID = sock.user.id;
//             OWNER_NUMBER = OWNER_JID.split('@')[0];
//             fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));

//             console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ╚════════════════════════════════════════════════════════╝
// `));

//             try {
//                 await sock.sendMessage(OWNER_JID, {
//                     text: `╔══════════════╗
// ║ 🐺 *${BOT_NAME.toUpperCase()} ONLINE*                            
// ╠══════════════╣
// ║ ✅ *Connected successfully!*                        
// ║ 👑 *Owner:* +${OWNER_NUMBER}
// ║ 📱 *Device:* ${BOT_NAME} - Chrome
// ║ 🕒 *Time:* ${currentTime}
// ║ 🔥 *Status:* Ready to Hunt! 
// ╚══════════════╝`,
//                 });
//             } catch (err) {
//                 console.log('⚠️ Failed to DM owner:', err);
//             }
//         }

//         if (connection === 'close') {
//             const reason = lastDisconnect?.error?.output?.statusCode;
//             console.log(chalk.red(`\n❌ Connection closed. Reconnecting...\n`));
//             if (reason === DisconnectReason.loggedOut) {
//                 fs.rmSync('./auth', { recursive: true, force: true });
//             }
//             setTimeout(() => startSock(mode, phoneNumber), 3000);
//         }
//     });

//     sock.ev.on('creds.update', async () => {
//         await saveCreds();
//         console.log(chalk.green('💾 Credentials updated and saved to Supabase.'));
//     });

//     // ====== MESSAGE HANDLER ======
//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message) return;

//         const chatId = msg.key.remoteJid;
//         const textMsg =
//             msg.message.conversation ||
//             msg.message.extendedTextMessage?.text ||
//             msg.message.imageMessage?.caption ||
//             msg.message.videoMessage?.caption ||
//             '';

//         if (!textMsg.startsWith(PREFIX)) return;

//         const parts = textMsg.trim().slice(PREFIX.length).split(/\s+/);
//         const commandName = parts[0].toLowerCase();
//         const args = parts.slice(1);

//         console.log(chalk.magenta(`📩 ${chatId} → ${commandName} ${args.join(' ')}`));

//         try {
//             if (commandName === 'menu') {
//                 await menu.execute(sock, msg, args, images);
//             } else {
//                 await handleCommand(commandName, sock, msg, args);
//             }
//         } catch (err) {
//             console.error(`❌ Error executing ${commandName}:`, err);
//             await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}*.` }, { quoted: msg });





            
//         }
//     });






    
//     // ====== AUTO REACT TO STATUS ======
//     sock.ev.on('messages.update', async (updates) => {
//         try {
//             for (const update of updates) {
//                 const jid = update.key?.remoteJid;
//                 if (!jid || !jid.endsWith('@status')) continue;
//                 await autoreactstatus.onStatus(sock, update);
//             }
//         } catch (err) {
//             console.error("❌ AutoReactStatus error:", err);
//         }
//     });

//     // ====== PAIR CODE LOGIN ======
//     if (mode === 'pair' && phoneNumber) {
//         console.log(chalk.cyan(`\n🔗 Generating Pair Code for ${phoneNumber}...`));
//         try {
//             const code = await sock.requestPairingCode(phoneNumber);
//             console.log(chalk.green(`✅ Pair Code: ${chalk.bold(code)}`));
//             console.log(chalk.gray('\n👉 Enter this code on WhatsApp: Linked Devices > Link with phone number.'));
//         } catch (err) {
//             console.error(chalk.red('❌ Failed to generate pair code:'), err);
//         }
//     }

//     return sock;
// }

// // ====== LOGIN CHOICE ======
// const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
// const ask = (q) => new Promise((r) => rl.question(q, (ans) => r(ans.trim())));

// (async () => {
//     await loadImages(); // preload all images first

//     console.log(chalk.yellow('\n🐺 WOLF BOT INITIALIZER 🐺'));
//     console.log('1) QR Code Login');
//     console.log('2) Pair Code Login');
//     const choice = await ask('Enter 1 or 2 (default 1): ');
//     let mode = 'qr';
//     let phone = null;

//     if (choice === '2') {
//         mode = 'pair';
//         const num = await ask('📱 Enter your WhatsApp number (e.g., 2547XXXXXXX): ');
//         phone = num.replace(/\s+/g, '');
//     }

//     console.log(chalk.gray('\nStarting WolfBot...'));
//     await startSock(mode, phone);
// })();
















































































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
// import pkg from '@whiskeysockets/baileys';


// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

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
//         await command.execute(sock, msg, args, null, {}); // You can pass additional parameters as needed
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
//         if (fs.existsSync('./auth')) {
//             fs.rmSync('./auth', { recursive: true, force: true });
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

//     // For pair mode, always start fresh
//     if (loginMode === 'pair') {
//         console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
//         cleanAuth();
//     }

//     // Load or create auth state
//     let state, saveCreds;
//     try {
//         const authState = await useMultiFileAuthState('./auth');
//         state = authState.state;
//         saveCreds = authState.saveCreds;
//         console.log(chalk.green('✅ Auth state loaded'));
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         return;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: false,
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

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
//             }, 2000);
//         }

//         if (connection === 'open') {
//             await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//         }

//         if (connection === 'close') {
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
    
//     console.log(chalk.blue('🔄 Restarting in 3 seconds...'));
//     setTimeout(() => startBot(loginMode, phoneNumber), 3000);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
        
        
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
//         process.exit(1);
//     }
// }

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });








































// // ====== WOLF BOT - index.js ======
// // Katabump-compatible version with QR login only

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';
// import http from 'http';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🚀 Platform: ${chalk.yellow('Katabump')}
// ╚════════════════════════════════════════════════╝
// `));

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

// // ====== CLEAN AUTH FUNCTION ======
// function cleanAuth() {
//     try {
//         if (fs.existsSync('./auth')) {
//             fs.rmSync('./auth', { recursive: true, force: true });
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
// async function startBot() {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//     // Load commands first
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     // Load or create auth state
//     let state, saveCreds;
//     try {
//         const authState = await useMultiFileAuthState('./auth');
//         state = authState.state;
//         saveCreds = authState.saveCreds;
//         console.log(chalk.green('✅ Auth state loaded'));
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         return;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: true, // Always show QR in terminal for Katabump
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));
//     console.log(chalk.yellow('\n📲 QR Code will appear below - Scan to connect:\n'));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

//         if (connection === 'open') {
//             await handleSuccessfulConnection(sock);
//         }

//         if (connection === 'close') {
//             await handleConnectionClose(lastDisconnect);
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
// async function handleSuccessfulConnection(sock) {
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
// ║              🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ║  🚀 Platform: ${chalk.cyan('Katabump')}                  
// ╚════════════════════════════════════════════════════════╝
// `));

//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🚀 Platform: Katabump\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
//         });
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// async function handleConnectionClose(lastDisconnect) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth();
//     }
    
//     console.log(chalk.blue('🔄 Restarting in 3 seconds...'));
//     setTimeout(() => startBot(), 3000);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
//     }
// }

// // ====== KATABUMP COMPATIBILITY ======

// // Health check endpoint for Katabump
// function startHealthCheck() {
//     const server = http.createServer((req, res) => {
//         if (req.url === '/health') {
//             res.writeHead(200, { 'Content-Type': 'application/json' });
//             res.end(JSON.stringify({ 
//                 status: 'ok', 
//                 bot: BOT_NAME,
//                 connected: SOCKET_INSTANCE ? true : false,
//                 timestamp: new Date().toISOString()
//             }));
//         } else {
//             res.writeHead(404, { 'Content-Type': 'application/json' });
//             res.end(JSON.stringify({ error: 'Not found' }));
//         }
//     });
    
//     const PORT = process.env.PORT || 3000;
//     server.listen(PORT, () => {
//         console.log(chalk.blue(`🏥 Health check server running on port ${PORT}`));
//     });
    
//     return server;
// }

// // Graceful shutdown handler
// function setupGracefulShutdown(healthServer) {
//     process.on('SIGTERM', () => {
//         console.log(chalk.yellow('\n🔄 Received SIGTERM - Graceful shutdown'));
//         gracefulShutdown(healthServer);
//     });

//     process.on('SIGINT', () => {
//         console.log(chalk.yellow('\n🔄 Received SIGINT - Graceful shutdown'));
//         gracefulShutdown(healthServer);
//     });
// }

// function gracefulShutdown(healthServer) {
//     console.log(chalk.yellow('👋 Shutting down Wolf Bot gracefully...'));
    
//     // Close health check server
//     if (healthServer) {
//         healthServer.close(() => {
//             console.log(chalk.green('✅ Health check server closed'));
//         });
//     }
    
//     // Close WhatsApp connection
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
    
//     setTimeout(() => {
//         console.log(chalk.green('✅ Wolf Bot shutdown complete'));
//         process.exit(0);
//     }, 2000);
// }

// // ====== MAIN APPLICATION START ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot on Katabump...'));
        
//         // Start health check server
//         const healthServer = startHealthCheck();
        
//         // Setup graceful shutdown
//         setupGracefulShutdown(healthServer);
        
//         // Start the bot with QR code mode only
//         await startBot();
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         process.exit(1);
//     }
// }

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });







































// // ====== WOLF BOT - index.js ======
// // Fast, stable & themed. Supports QR, Pair Code, or Session ID login.

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';
// const SESSION_SERVER_URL = process.env.SESSION_SERVER_URL || 'http://localhost:5000';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;
// let RECONNECT_ATTEMPTS = 0;
// const MAX_RECONNECT_ATTEMPTS = 5;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🌐 Session Server: ${SESSION_SERVER_URL}
// ╚════════════════════════════════════════════════╝
// `));

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
//         await command.execute(sock, msg, args, null, {}); // You can pass additional parameters as needed
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

// // ====== SESSION ID MANAGER ======
// class SessionIdManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }

//     async getSessionId() {
//         return new Promise((resolve) => {
//             console.log(chalk.yellow('\n🌐 SESSION ID LOGIN'));
//             console.log(chalk.white('1. Visit your session generator website'));
//             console.log(chalk.white('2. Generate a new session using QR or Pair Code'));
//             console.log(chalk.white('3. Copy the Session ID sent to your WhatsApp'));
//             console.log(chalk.white('4. Paste the Session ID below\n'));
            
//             this.rl.question(chalk.cyan('📋 Paste your Session ID here: '), (sessionId) => {
//                 const cleanedSessionId = sessionId.trim();
                
//                 if (!cleanedSessionId) {
//                     console.log(chalk.red('❌ Session ID cannot be empty. Please try again.'));
//                     this.getSessionId().then(resolve);
//                     return;
//                 }
                
//                 resolve(cleanedSessionId);
//             });
//         });
//     }

//     close() {
//         if (this.rl) {
//             this.rl.close();
//         }
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

// // ====== SESSION DOWNLOADER ======
// async function downloadSessionFromServer(sessionId) {
//     try {
//         console.log(chalk.blue(`🔗 Downloading session data for: ${sessionId}`));
        
//         // Check session status first
//         const statusResponse = await fetch(`${SESSION_SERVER_URL}/status/${sessionId}`);
//         const statusData = await statusResponse.json();
        
//         if (!statusData.success || statusData.status !== 'connected') {
//             throw new Error(`Session not connected or not found. Status: ${statusData.status}`);
//         }
        
//         console.log(chalk.green('✅ Session is connected on server'));
        
//         // Download session files
//         const sessionPath = `./auth_${sessionId}`;
        
//         // Create directory for this session
//         if (fs.existsSync(sessionPath)) {
//             fs.rmSync(sessionPath, { recursive: true, force: true });
//         }
//         fs.mkdirSync(sessionPath, { recursive: true });
        
//         // Copy session files from server's session directory
//         const serverSessionPath = `./sessions/${sessionId}`;
//         if (!fs.existsSync(serverSessionPath)) {
//             throw new Error('Session files not found on server');
//         }
        
//         // Copy all files from server session to local auth directory
//         const files = fs.readdirSync(serverSessionPath);
//         for (const file of files) {
//             const sourcePath = path.join(serverSessionPath, file);
//             const destPath = path.join(sessionPath, file);
            
//             if (fs.statSync(sourcePath).isFile()) {
//                 fs.copyFileSync(sourcePath, destPath);
//             }
//         }
        
//         console.log(chalk.green(`✅ Downloaded ${files.length} session files`));
        
//         // Set this as the active auth directory
//         return sessionPath;
        
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to download session:'), error.message);
        
//         // Clean up on error
//         const sessionPath = `./auth_${sessionId}`;
//         if (fs.existsSync(sessionPath)) {
//             fs.rmSync(sessionPath, { recursive: true, force: true });
//         }
        
//         throw error;
//     }
// }

// // ====== SESSION ID AUTH HANDLER ======
// async function useSessionIdAuth(sessionId) {
//     try {
//         console.log(chalk.blue('🔑 Processing session ID...'));
        
//         // Download session files from server
//         const sessionPath = await downloadSessionFromServer(sessionId);
        
//         console.log(chalk.green('✅ Session files downloaded successfully'));
//         return true;
        
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to apply session ID:'), error.message);
//         return false;
//     }
// }

// // ====== CLEAN AUTH FUNCTION ======
// function cleanAuth() {
//     try {
//         // Remove all auth directories
//         const items = fs.readdirSync('./');
//         for (const item of items) {
//             if (item.startsWith('auth_') && fs.statSync(item).isDirectory()) {
//                 fs.rmSync(item, { recursive: true, force: true });
//                 console.log(chalk.yellow(`🧹 Cleared auth directory: ${item}`));
//             }
//         }
        
//         if (fs.existsSync('./auth')) {
//             fs.rmSync('./auth', { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared default auth session'));
//         }
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data'));
//     }
// }

// // ====== BOT INITIALIZATION ======
// async function startBot(loginMode = 'qr', phoneNumber = null, sessionId = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//     // Load commands first
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     let authPath = './auth'; // Default auth path

//     // For session ID mode, download and use the session files
//     if (loginMode === 'session' && sessionId) {
//         console.log(chalk.yellow('🔑 Applying session ID authentication...'));
//         const sessionApplied = await useSessionIdAuth(sessionId);
//         if (sessionApplied) {
//             authPath = `./auth_${sessionId}`; // Use the downloaded session
//             console.log(chalk.green(`✅ Using session: ${sessionId}`));
//         } else {
//             console.log(chalk.red('❌ Failed to apply session ID. Switching to QR code mode.'));
//             loginMode = 'qr';
//             cleanAuth(); // Clear any partial auth data
//         }
//     }

//     // For pair mode, always start fresh
//     if (loginMode === 'pair') {
//         console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
//         cleanAuth();
//     }

//     // Load or create auth state
//     let state, saveCreds;
//     try {
//         const authState = await useMultiFileAuthState(authPath);
//         state = authState.state;
//         saveCreds = authState.saveCreds;
//         console.log(chalk.green('✅ Auth state loaded'));
        
//         // Check if we have valid credentials
//         if (!state.creds || !state.creds.me) {
//             console.log(chalk.yellow('⚠️ No valid credentials found, starting fresh...'));
//             if (loginMode === 'session') {
//                 console.log(chalk.red('❌ Downloaded session appears to be invalid'));
//                 loginMode = 'qr';
//             }
//             cleanAuth();
//             const freshAuth = await useMultiFileAuthState('./auth');
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         } else if (state.creds.me) {
//             console.log(chalk.green(`✅ Found existing session for: ${state.creds.me.id}`));
//         }
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         console.log(chalk.yellow('🔄 Creating fresh auth state...'));
//         cleanAuth();
//         const freshAuth = await useMultiFileAuthState('./auth');
//         state = freshAuth.state;
//         saveCreds = freshAuth.saveCreds;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
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
//         retryRequestDelayMs: 2000,
//         maxRetries: 5,
//         emitOwnEvents: true,
//         defaultQueryTimeoutMs: 60000,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));

//     // ====== IMPROVED EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect, isNewLogin } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

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
//                 }
//             }, 2000);
//         }

//         if (connection === 'open') {
//             RECONNECT_ATTEMPTS = 0; // Reset reconnect attempts on successful connection
//             await handleSuccessfulConnection(sock, loginMode, phoneNumber, sessionId);
//         }

//         if (connection === 'close') {
//             await handleConnectionClose(lastDisconnect, loginMode, phoneNumber, sessionId);
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
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber, sessionId) {
//     const currentTime = moment().format('h:mm:ss A');
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     try {
//         fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not save owner data'));
//     }

//     const methodDisplay = loginMode === 'session' ? `Session ID (${sessionId})` : 
//                          loginMode === 'pair' ? 'Pair Code' : 'QR Code';

//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ║  🔐 Method : ${chalk.cyan(methodDisplay)}         
// ╚════════════════════════════════════════════════════════╝
// `));

//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${methodDisplay}\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
//         });
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber, sessionId) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     RECONNECT_ATTEMPTS++;
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth();
//         RECONNECT_ATTEMPTS = 0; // Reset for fresh start
//     }
    
//     if (RECONNECT_ATTEMPTS >= MAX_RECONNECT_ATTEMPTS) {
//         console.log(chalk.red(`💥 Maximum reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached.`));
//         console.log(chalk.yellow('🔄 Restarting with fresh session...'));
//         cleanAuth();
//         RECONNECT_ATTEMPTS = 0;
        
//         // Switch to QR code mode if session/pair mode keeps failing
//         if (loginMode !== 'qr') {
//             console.log(chalk.yellow('💡 Switching to QR code mode for fresh connection...'));
//             loginMode = 'qr';
//             sessionId = null;
//         }
//     }
    
//     const delay = Math.min(3000 * RECONNECT_ATTEMPTS, 15000); // Exponential backoff, max 15 seconds
//     console.log(chalk.blue(`🔄 Restarting in ${delay/1000} seconds... (Attempt ${RECONNECT_ATTEMPTS}/${MAX_RECONNECT_ATTEMPTS})`));
//     setTimeout(() => startBot(loginMode, phoneNumber, sessionId), delay);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
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
//     console.log('3) Session ID Login (From Session Generator)');
    
//     try {
//         const choice = await ask('Enter 1, 2, or 3 (default 1): ');
//         let mode = 'qr';
//         let phone = null;
//         let sessionId = null;

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
//         } else if (choice === '3') {
//             mode = 'session';
//             const sessionManager = new SessionIdManager();
//             sessionId = await sessionManager.getSessionId();
//             sessionManager.close();
            
//             if (!sessionId) {
//                 console.log(chalk.red('❌ Invalid session ID. Using QR code mode.'));
//                 mode = 'qr';
//             }
//         }

//         rl.close();
//         return { mode, phone, sessionId };
//     } catch (error) {
//         rl.close();
//         console.log(chalk.yellow('⚠️ Using default QR code mode'));
//         return { mode: 'qr', phone: null, sessionId: null };
//     }
// }

// // ====== MAIN APPLICATION START ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        
//         const { mode, phone, sessionId } = await selectLoginMode();
        
//         console.log(chalk.gray(`\nStarting with ${mode === 'qr' ? 'QR Code' : mode === 'pair' ? 'Pair Code' : 'Session ID'} mode...`));
        
//         await startBot(mode, phone, sessionId);
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         process.exit(1);
//     }
// }

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });




















// // index.js — Silent Wolf (SESSION_ID support, Heroku-ready)
// // Paste this file into your project root (ESM). Node 18+ recommended.

// import { fileURLToPath } from 'url';
// import { dirname, join } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';
// import P from 'pino';

// const {
//   default: makeWASocket,
//   useMultiFileAuthState,
//   DisconnectReason,
//   fetchLatestBaileysVersion,
//   makeCacheableSignalKeyStore,
//   Browsers
// } = pkg;

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

// // ----------------- Command loader -----------------
// const commands = new Map();

// async function loadCommandsFromFolder(folderPath) {
//   try {
//     const absolutePath = path.resolve(folderPath);
//     if (!fs.existsSync(absolutePath)) {
//       console.log(chalk.yellow(`📁 Commands folder not found: ${absolutePath}`));
//       return;
//     }
//     const items = fs.readdirSync(absolutePath);
//     for (const item of items) {
//       const fullPath = path.join(absolutePath, item);
//       const stat = fs.statSync(fullPath);
//       if (stat.isDirectory()) {
//         await loadCommandsFromFolder(fullPath);
//       } else if (item.endsWith('.js')) {
//         try {
//           const cmdModule = await import(`file://${fullPath}`);
//           const cmd = cmdModule.default;
//           if (cmd && cmd.name) {
//             commands.set(cmd.name.toLowerCase(), cmd);
//             console.log(chalk.green(`✅ Loaded command: ${cmd.name}`));
//             if (Array.isArray(cmd.alias)) {
//               cmd.alias.forEach(a => {
//                 commands.set(a.toLowerCase(), cmd);
//                 console.log(chalk.gray(`   ↳ Alias: ${a}`));
//               });
//             }
//           }
//         } catch (err) {
//           console.error(chalk.red(`❌ Failed to load command ${item}:`), err?.message || err);
//         }
//       }
//     }
//   } catch (err) {
//     console.error(chalk.red(`❌ Error reading commands folder ${folderPath}:`), err?.message || err);
//   }
// }

// async function executeCommand(commandName, sock, msg, args) {
//   const cmd = commands.get(commandName.toLowerCase());
//   if (!cmd) return false;
//   try {
//     await cmd.execute(sock, msg, args, null, {});
//     return true;
//   } catch (err) {
//     console.error(chalk.red(`❌ Error executing command ${commandName}:`), err);
//     try { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error running *${commandName}*.` }, { quoted: msg }); } catch(e){}
//     return false;
//   }
// }

// // ----------------- Session helpers -----------------

// // If SESSION_TOKEN_EXCHANGE_URL is set, POST { token } to it to get back JSON or { session: "<string>" }.
// // Set SESSION_API_KEY for Authorization header if needed.
// async function exchangeTokenForSession(token) {
//   const url = process.env.SESSION_TOKEN_EXCHANGE_URL;
//   if (!url) return null;
//   try {
//     const headers = { 'Content-Type': 'application/json' };
//     if (process.env.SESSION_API_KEY) headers['Authorization'] = `Bearer ${process.env.SESSION_API_KEY}`;
//     const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ token }) });
//     if (!resp.ok) {
//       console.warn(chalk.yellow(`⚠️ Session exchange HTTP ${resp.status}`));
//       return null;
//     }
//     const contentType = resp.headers.get('content-type') || '';
//     if (contentType.includes('application/json')) {
//       const j = await resp.json();
//       // Return the nested session if present
//       if (j.session) return j.session;
//       if (j.data && (j.data.session || j.data.creds)) {
//         return j.data.session || j.data;
//       }
//       // If j itself contains creds/keys, return that object
//       if (j.creds || j.keys) return j;
//       // try to find first long string
//       for (const v of Object.values(j)) if (typeof v === 'string' && v.length > 20) return v;
//       return null;
//     } else {
//       const text = (await resp.text()).trim();
//       return text.length ? text : null;
//     }
//   } catch (err) {
//     console.warn(chalk.yellow('⚠️ Error exchanging session token:'), err?.message || err);
//     return null;
//   }
// }

// function tryReadLocalSessionFiles() {
//   // session.json
//   const sj = path.join(__dirname, 'session.json');
//   if (fs.existsSync(sj)) {
//     const raw = fs.readFileSync(sj, 'utf8').trim();
//     if (raw) return raw;
//   }
//   // session.txt
//   const st = path.join(__dirname, 'session.txt');
//   if (fs.existsSync(st)) {
//     const raw = fs.readFileSync(st, 'utf8').trim();
//     if (raw) return raw;
//   }
//   return null;
// }

// // Convert a session string (JSON or base64(JSON) or file path) to ./auth multi-file layout
// async function convertSessionStringToAuth(sessionString) {
//   if (!sessionString || typeof sessionString !== 'string') throw new Error('Empty session string');

//   let sessionData = null;

//   // 1) if path to file on disk
//   if (fs.existsSync(sessionString)) {
//     const raw = fs.readFileSync(sessionString, 'utf8');
//     try { sessionData = JSON.parse(raw); } catch (e) { throw new Error('Session file exists but is not valid JSON'); }
//   } else {
//     // 2) try parse as JSON
//     try { sessionData = JSON.parse(sessionString); } catch (e1) {
//       // 3) try base64 decode then parse
//       try {
//         const dec = Buffer.from(sessionString, 'base64').toString('utf8');
//         sessionData = JSON.parse(dec);
//       } catch (e2) {
//         sessionData = null;
//       }
//     }
//   }

//   if (!sessionData || (!sessionData.creds && !sessionData.keys)) {
//     throw new Error('Session string is not a valid Baileys auth state (JSON or base64 JSON).');
//   }

//   const authDir = path.join(__dirname, 'auth');
//   if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

//   // write creds.json
//   if (sessionData.creds) {
//     fs.writeFileSync(path.join(authDir, 'creds.json'), JSON.stringify(sessionData.creds, null, 2), 'utf8');
//   }

//   // write keys into a keys folder (best-effort)
//   const keysDir = path.join(authDir, 'keys');
//   if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

//   if (sessionData.keys && typeof sessionData.keys === 'object') {
//     for (const [k, v] of Object.entries(sessionData.keys)) {
//       const safe = k.replace(/[\/\\]/g, '_');
//       fs.writeFileSync(path.join(keysDir, `${safe}.json`), JSON.stringify(v, null, 2), 'utf8');
//     }
//   }

//   // Return multi-file auth state using ./auth
//   return await useMultiFileAuthState(authDir);
// }

// // If token looks like an opaque "wolf_xxx_..." string we try to exchange it
// async function obtainAuthStateFromProvidedSession(sessionString) {
//   // Try direct JSON or base64 first
//   try {
//     return await convertSessionStringToAuth(sessionString);
//   } catch (err) {
//     // not JSON/base64 — attempt exchange if configured
//     console.log(chalk.gray('🔎 Provided session looks like an opaque token — attempting to exchange via SESSION_TOKEN_EXCHANGE_URL (if set)'));
//     const exchanged = await exchangeTokenForSession(sessionString);
//     if (!exchanged) throw new Error('Token exchange failed or no exchange URL configured.');
//     // exchanged may be JSON string or object or base64
//     if (typeof exchanged === 'object') {
//       // stringify to pass through convertSessionStringToAuth
//       return await convertSessionStringToAuth(JSON.stringify(exchanged));
//     } else {
//       return await convertSessionStringToAuth(String(exchanged));
//     }
//   }
// }

// // ----------------- Bot startup -----------------
// async function startBot({ sessionString = null, loginMode = 'session', phoneNumber = null } = {}) {
//   console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//   // load commands
//   console.log(chalk.blue('📂 Loading commands...'));
//   await loadCommandsFromFolder('./commands');
//   console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//   let state, saveCreds;

//   try {
//     if (loginMode === 'session' && sessionString) {
//       const authState = await obtainAuthStateFromProvidedSession(sessionString);
//       state = authState.state;
//       saveCreds = authState.saveCreds;
//       console.log(chalk.green('✅ Session auth state ready (from SESSION_ID)'));
//     } else {
//       const authState = await useMultiFileAuthState(path.join(__dirname, 'auth'));
//       state = authState.state;
//       saveCreds = authState.saveCreds;
//       console.log(chalk.green('✅ Auth state loaded from ./auth (multi-file)'));
//     }
//   } catch (err) {
//     console.error(chalk.red('❌ Auth error:'), err?.message || err);
//     if (loginMode === 'session') {
//       console.log(chalk.yellow('💡 Failed to load provided session — falling back to QR mode (if interactive)'));
//       // If running on Heroku, we should not fall back to interactive — just exit with error
//       if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
//         console.error(chalk.red('❌ Production environment detected and session loading failed. Exiting.'));
//         process.exit(1);
//       }
//       // else try interactive QR
//       return startBot({ loginMode: 'qr' });
//     }
//     return;
//   }

//   // fetch baileys version
//   const { version } = await fetchLatestBaileysVersion();
//   console.log(chalk.blue(`📦 Baileys version: ${version}`));

//   const sock = makeWASocket({
//     version,
//     logger: P({ level: 'silent' }),
//     browser: Browsers.ubuntu('Chrome'),
//     printQRInTerminal: false,
//     auth: {
//       creds: state.creds,
//       keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//     },
//     markOnlineOnConnect: true,
//     generateHighQualityLinkPreview: true,
//   });

//   SOCKET_INSTANCE = sock;

//   sock.ev.on('connection.update', async (update) => {
//     const { connection, qr, lastDisconnect } = update;
//     console.log(chalk.gray(`🔗 Connection update: ${connection || 'unknown'}`));

//     if (qr && loginMode === 'qr') {
//       console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
//       qrcode.generate(qr, { small: true });
//     }

//     if (connection === 'open') {
//       const now = moment().format('h:mm:ss A');
//       OWNER_JID = sock.user.id;
//       OWNER_NUMBER = OWNER_JID.split('@')[0];
//       try { fs.writeFileSync(path.join(__dirname, 'owner.json'), JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2)); } catch(e){}
//       console.log(chalk.greenBright(`🐺 ${BOT_NAME} connected as ${OWNER_NUMBER} at ${now}`));
//       try { await sock.sendMessage(OWNER_JID, { text: `🐺 ${BOT_NAME} is online — ${now}` }); } catch(e){}
//     }

//     if (connection === 'close') {
//       const statusCode = lastDisconnect?.error?.output?.statusCode;
//       console.log(chalk.red(`❌ Connection closed. Status: ${statusCode || 'unknown'}`));
//       if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out — clearing auth state and exiting'));
//         // clear auth so future restarts won't try invalid creds
//         try { fs.rmSync(path.join(__dirname, 'auth'), { recursive: true, force: true }); } catch(e){}
//         process.exit(1);
//       }
//       console.log(chalk.blue('🔄 Reconnecting in 3s...'));
//       setTimeout(async () => {
//         try { await startBot({ sessionString, loginMode, phoneNumber }); } catch(e){ console.error(e); }
//       }, 3000);
//     }
//   });

//   sock.ev.on('creds.update', saveCreds);

//   sock.ev.on('messages.upsert', async ({ messages, type }) => {
//     if (type !== 'notify') return;
//     const msg = messages[0];
//     if (!msg.message) return;
//     const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
//     if (!text) return;
//     if (!text.startsWith(PREFIX)) return;
//     const parts = text.slice(PREFIX.length).trim().split(/\s+/);
//     const name = parts[0].toLowerCase();
//     const args = parts.slice(1);
//     console.log(chalk.magenta(`📩 ${msg.key.remoteJid} → ${PREFIX}${name} ${args.join(' ')}`));
//     await executeCommand(name, sock, msg, args);
//   });

//   return sock;
// }

// // --------------- Startup: read session and launch ---------------
// async function findAndStart() {
//   try {
//     // 1) explicit SESSION_ID env var
//     if (process.env.SESSION_ID && process.env.SESSION_ID.trim().length > 0) {
//       const s = process.env.SESSION_ID.trim();
//       console.log(chalk.gray('🔎 Found SESSION_ID env var — attempting to use it'));
//       await startBot({ sessionString: s, loginMode: 'session' });
//       return;
//     }

//     // 2) If SESSION_TOKEN_EXCHANGE_URL present, try to fetch using an env token variable name
//     // (this is optional; many users set SESSION_ID directly)
//     if (process.env.SESSION_TOKEN_EXCHANGE_URL && process.env.SESSION_TOKEN && process.env.SESSION_TOKEN.trim().length > 0) {
//       console.log(chalk.gray('🔎 Attempting to exchange SESSION_TOKEN via SESSION_TOKEN_EXCHANGE_URL...'));
//       const exchanged = await exchangeTokenForSession(process.env.SESSION_TOKEN.trim());
//       if (exchanged) {
//         await startBot({ sessionString: exchanged, loginMode: 'session' });
//         return;
//       } else {
//         console.warn(chalk.yellow('⚠️ Exchange did not return a usable session'));
//       }
//     }

//     // 3) local session files (session.json / session.txt)
//     const local = tryReadLocalSessionFiles();
//     if (local) {
//       console.log(chalk.gray('🔎 Found local session file — using it'));
//       await startBot({ sessionString: local, loginMode: 'session' });
//       return;
//     }

//     // 4) fall back to interactive QR/pair (only for local use)
//     console.log(chalk.gray('🔎 No session found — falling back to interactive login (QR/Pair)'));
//     if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
//       console.error(chalk.red('❌ No usable session found in production environment. Set SESSION_ID (full JSON/base64) or provide SESSION_TOKEN_EXCHANGE_URL to convert your token.'));
//       process.exit(1);
//     }

//     // interactive fallback for local dev
//     const readlineSync = await import('readline');
//     const rl = readlineSync.createInterface({ input: process.stdin, output: process.stdout });
//     const ask = (q) => new Promise(res => rl.question(q, res));
//     console.log(chalk.yellow('\n🐺 LOGIN OPTIONS:\n1) QR Code (default)\n2) Pair Code\n'));
//     const ans = (await ask('Enter 1 or 2 (default 1): ')).trim();
//     rl.close();
//     if (ans === '2') {
//       const phone = (await ask('Enter phone (e.g. 2547...): ')).trim().replace(/\D/g, '');
//       await startBot({ loginMode: 'pair', phoneNumber: phone });
//     } else {
//       await startBot({ loginMode: 'qr' });
//     }
//   } catch (err) {
//     console.error(chalk.red('💥 Fatal error at startup:'), err);
//     process.exit(1);
//   }
// }

// findAndStart();

// // --------------- Graceful shutdown ----------------
// process.on('SIGINT', async () => {
//   console.log(chalk.yellow('\n👋 Shutting down Wolf Bot...'));
//   try { if (SOCKET_INSTANCE?.ws) SOCKET_INSTANCE.ws.close(); } catch(e){}
//   process.exit(0);
// });

// process.on('uncaughtException', (err) => {
//   console.error(chalk.red('💥 Uncaught Exception:'), err);
// });
// process.on('unhandledRejection', (err) => {
//   console.error(chalk.red('💥 Unhandled Rejection:'), err);
// });



















// //===== WOLF BOT - index.js ======
// //Fast, stable & themed. Supports QR, Pair Code, or REAL Base64 Session login.

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';
// const WEBSITE_URL = process.env.WEBSITE_URL || 'https://wolfbot-pair-1.onrender.com';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🌐 Website : ${WEBSITE_URL}
// ╚════════════════════════════════════════════════╝
// `));

// // ====== ENHANCED BASE64 SESSION HANDLER ======
// function decodeRealBase64Session(base64String) {
//     try {
//         if (!base64String || base64String === 'paste_real_base64_here') {
//             console.log(chalk.yellow('⚠️ No Base64 session found in .env'));
//             return null;
//         }
        
//         console.log(chalk.cyan('🔓 Decoding REAL Base64 WhatsApp session...'));
//         console.log(chalk.gray(`📏 Base64 length: ${base64String.length} characters`));
        
//         // Check if it looks like a real Base64 WhatsApp session
//         if (base64String.length < 500) {
//             console.log(chalk.yellow('⚠️ Base64 seems too short for a real WhatsApp session'));
//         }
        
//         // Decode Base64 to string
//         const decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
        
//         // Parse JSON
//         const session = JSON.parse(decodedString);
        
//         // Validate it's a real WhatsApp session
//         if (!session.creds || !session.creds.noiseKey || !session.creds.signedIdentityKey) {
//             console.log(chalk.red('❌ Invalid WhatsApp session structure'));
//             return null;
//         }
        
//         console.log(chalk.green('✅ REAL Base64 session decoded successfully'));
//         console.log(chalk.gray(`📱 Session owner: ${session.creds?.me?.id?.split('@')[0] || 'Unknown'}`));
//         console.log(chalk.gray(`🔑 Registration ID: ${session.creds?.registrationId || 'Unknown'}`));
//         console.log(chalk.gray(`📊 Keys available: ${Object.keys(session.keys || {}).length}`));
        
//         return session;
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to decode REAL Base64 session:'), error.message);
        
//         if (error.message.includes('not valid base64')) {
//             console.log(chalk.yellow('💡 Base64 string might be corrupted or incomplete'));
//             console.log(chalk.yellow('💡 Make sure you copied the ENTIRE Base64 string'));
//         } else if (error.message.includes('Unexpected token')) {
//             console.log(chalk.yellow('💡 Base64 might be incomplete or missing parts'));
//             console.log(chalk.yellow('💡 Try getting a fresh Base64 session from the website'));
//         }
        
//         return null;
//     }
// }

// // Check for session at startup
// const BASE64_SESSION_FROM_ENV = process.env.BASE64_SESSION;
// const DECODED_SESSION = decodeRealBase64Session(BASE64_SESSION_FROM_ENV);
// const OWNER_FROM_ENV = process.env.OWNER_NUMBER;

// // ====== WEBSITE SESSION FETCHER ======
// async function fetchSessionFromWebsite(sessionId) {
//     try {
//         if (!sessionId) {
//             console.log(chalk.yellow('⚠️ No session ID provided for website fetch'));
//             return null;
//         }
        
//         console.log(chalk.cyan(`🌐 Fetching session from website: ${WEBSITE_URL}`));
        
//         // Try to fetch from website
//         const response = await fetch(`${WEBSITE_URL}/base64-session/${sessionId}`);
        
//         if (!response.ok) {
//             console.log(chalk.yellow(`⚠️ Website returned status: ${response.status}`));
//             return null;
//         }
        
//         const data = await response.json();
        
//         if (data.success && data.base64Session) {
//             console.log(chalk.green('✅ Session fetched successfully from website'));
//             console.log(chalk.gray(`📏 Website Base64 length: ${data.base64Session.length} chars`));
            
//             // Decode the website Base64
//             return decodeRealBase64Session(data.base64Session);
//         } else {
//             console.log(chalk.yellow('⚠️ No session data found on website'));
//             return null;
//         }
        
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to fetch from website:'), error.message);
//         return null;
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
//                     console.error(chalk.red('❌ Failed to load command: ${item}'), error);
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
//         await command.execute(sock, msg, args, null, {}); // You can pass additional parameters as needed
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
//         if (fs.existsSync('./auth')) {
//             fs.rmSync('./auth', { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared previous auth session'));
//         }
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data'));
//     }
// }

// // ====== SEND CONNECTION SUCCESS MESSAGE ======
// async function sendConnectionSuccessMessage(sock, loginMode) {
//     try {
//         if (!OWNER_JID) {
//             console.log(chalk.yellow('⚠️ No owner JID found. Cannot send success message.'));
//             return;
//         }
        
//         const currentTime = moment().format('h:mm:ss A');
//         let methodText = '';
//         let extraInfo = '';
        
//         if (loginMode === 'base64') {
//             methodText = 'REAL Base64 Session';
//             extraInfo = `🔐 Using REAL Base64 session (${BASE64_SESSION_FROM_ENV?.length || 0} chars)`;
//         } else if (loginMode === 'pair') {
//             methodText = 'Pair Code';
//             extraInfo = '🔗 Connected via pairing code';
//         } else {
//             methodText = 'QR Code';
//             extraInfo = '📱 Connected via QR scan';
//         }
        
//         const successMessage = `┏━🐺 BOT CONNECTED 🐺━━┓

// ✅ *CONNECTION SUCCESSFUL*

// ${extraInfo}
// 👑 *Owner:* +${OWNER_NUMBER}
// 📱 *Device:* ${BOT_NAME}
// 🕒 *Time:* ${currentTime}
// 🔐 *Method:* ${methodText}
// 🔥 *Status:* Ready to Hunt!

// 📂 *Commands loaded:* ${commands.size}

// 💡 *Bot is now online and ready!*
// ┗━━━━━━━━━━━━━━━━━━━━━┛`;
        
//         await sock.sendMessage(OWNER_JID, { text: successMessage });
//         console.log(chalk.green('📨 Success message sent to owner!'));
        
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to send success message:'), error.message);
//     }
// }

// // ====== BOT INITIALIZATION ======
// async function startBot(loginMode = 'base64', phoneNumber = null, websiteSessionId = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//     // Load commands
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     let state = { creds: {}, keys: {} };
//     let saveCreds = () => {};
//     let sessionSource = 'unknown';

//     // If using Base64 session from .env
//     if (loginMode === 'base64' && DECODED_SESSION) {
//         console.log(chalk.green('🎯 Using REAL Base64 session from .env file'));
//         sessionSource = '.env file';
        
//         // Use the decoded session
//         state.creds = DECODED_SESSION.creds || {};
//         state.keys = DECODED_SESSION.keys || {};
        
//         // If session has owner info, use it
//         if (DECODED_SESSION.creds?.me?.id) {
//             OWNER_JID = DECODED_SESSION.creds.me.id;
//             OWNER_NUMBER = OWNER_JID.split('@')[0];
//             console.log(chalk.cyan(`👑 Session owner detected: +${OWNER_NUMBER}`));
//         }
//         // Otherwise use .env owner number
//         else if (OWNER_FROM_ENV) {
//             OWNER_NUMBER = OWNER_FROM_ENV.replace(/[^0-9]/g, '');
//             OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;
//             console.log(chalk.cyan(`👑 Owner from .env: +${OWNER_NUMBER}`));
//         }
//     }
//     // If using session ID from website
//     else if (loginMode === 'website' && websiteSessionId) {
//         console.log(chalk.cyan(`🌐 Fetching session from website: ${websiteSessionId}`));
//         const websiteSession = await fetchSessionFromWebsite(websiteSessionId);
        
//         if (websiteSession) {
//             console.log(chalk.green('✅ Using session from website'));
//             sessionSource = 'website';
            
//             state.creds = websiteSession.creds || {};
//             state.keys = websiteSession.keys || {};
            
//             if (websiteSession.creds?.me?.id) {
//                 OWNER_JID = websiteSession.creds.me.id;
//                 OWNER_NUMBER = OWNER_JID.split('@')[0];
//                 console.log(chalk.cyan(`👑 Session owner from website: +${OWNER_NUMBER}`));
//             }
//         } else {
//             console.log(chalk.yellow('⚠️ Could not fetch from website. Falling back to QR mode.'));
//             loginMode = 'qr';
//         }
//     }
//     else {
//         // Use file-based auth for QR/Pair mode
//         console.log(chalk.yellow('🔄 Using file-based authentication...'));
//         sessionSource = 'file auth';
        
//         if (loginMode === 'pair') {
//             console.log(chalk.yellow('🧹 Clearing old session for pair code...'));
//             cleanAuth();
//         }

//         try {
//             const authState = await useMultiFileAuthState('./auth');
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             console.log(chalk.green('✅ Auth state loaded from file'));
//         } catch (error) {
//             console.error(chalk.red('❌ Auth error:'), error.message);
//             return;
//         }
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: false,
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));
//     console.log(chalk.gray(`📁 Session source: ${sessionSource}`));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

//         // Handle QR code for QR mode (only if not using base64 session)
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
//             }, 2000);
//         }

//         if (connection === 'open') {
//             await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//         }

//         if (connection === 'close') {
//             await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//         }
//     });

//     // Save creds only if using file auth
//     if (loginMode !== 'base64' && loginMode !== 'website') {
//         sock.ev.on('creds.update', saveCreds);
//     }

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
    
//     // Set owner info if not already set (for QR/Pair mode)
//     if (!OWNER_JID) {
//         OWNER_JID = sock.user.id;
//         OWNER_NUMBER = OWNER_JID.split('@')[0];
        
//         try {
//             fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));
//         } catch (error) {
//             console.log(chalk.yellow('⚠️ Could not save owner data'));
//         }
//     }

//     // Determine connection method text
//     let methodText = '';
//     if (loginMode === 'base64') {
//         methodText = 'REAL Base64 Session';
//     } else if (loginMode === 'website') {
//         methodText = 'Website Session';
//     } else if (loginMode === 'pair') {
//         methodText = 'Pair Code';
//     } else {
//         methodText = 'QR Code';
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
// ║  🔐 Method : ${chalk.cyan(methodText)}         
// ║  📁 Source : ${loginMode === 'base64' ? 'Base64 .env' : loginMode === 'website' ? 'Website' : 'File Auth'}         
// ╚════════════════════════════════════════════════════════╝
// `));

//     // Send success message to owner
//     await sendConnectionSuccessMessage(sock, loginMode);
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth();
//     }
    
//     // If using base64 session and got logged out, switch to QR mode
//     if ((loginMode === 'base64' || loginMode === 'website') && (statusCode === DisconnectReason.loggedOut || statusCode === 401)) {
//         console.log(chalk.yellow('💡 Base64 session expired. Switching to QR code mode...'));
//         loginMode = 'qr';
//     }
    
//     if (loginMode === 'pair' && statusCode) {
//         console.log(chalk.yellow('💡 Pair code mode failed. Switching to QR code mode...'));
//         loginMode = 'qr';
//         phoneNumber = null;
//     }
    
//     console.log(chalk.blue('🔄 Restarting in 3 seconds...'));
//     setTimeout(() => startBot(loginMode, phoneNumber), 3000);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
        
        
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
//     console.log('3) Website Session ID Login');
    
//     try {
//         const choice = await ask('Enter 1, 2, or 3 (default 1): ');
//         let mode = 'qr';
//         let phone = null;
//         let websiteSessionId = null;

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
//         } else if (choice === '3') {
//             mode = 'website';
//             websiteSessionId = await ask(chalk.yellow('🔗 Enter website session ID (e.g., wolf_...): '));
            
//             if (!websiteSessionId || !websiteSessionId.startsWith('wolf_')) {
//                 console.log(chalk.red('❌ Invalid session ID. Using QR code mode.'));
//                 mode = 'qr';
//                 websiteSessionId = null;
//             }
//         }

//         rl.close();
//         return { mode, phone, websiteSessionId };
//     } catch (error) {
//         rl.close();
//         console.log(chalk.yellow('⚠️ Using default QR code mode'));
//         return { mode: 'qr', phone: null, websiteSessionId: null };
//     }
// }

// // ====== SESSION INSTRUCTIONS ======
// function showSessionInstructions() {
//     console.log(chalk.cyan('\n📋 REAL BASE64 SESSION INSTRUCTIONS:'));
//     console.log(chalk.white('To use REAL Base64 session from your website:'));
//     console.log(chalk.white('1. Visit your website:'));
//     console.log(chalk.yellow(`   ${WEBSITE_URL}`));
//     console.log(chalk.white('2. Scan QR code or use pair code'));
//     console.log(chalk.white('3. Wait for connection'));
//     console.log(chalk.white('4. Get the LONG Base64 session from WhatsApp DM'));
//     console.log(chalk.white('5. Add to .env file:'));
//     console.log(chalk.yellow('   BASE64_SESSION=eyJjcmVkcyI6eyJub2lzZUtle... [LONG STRING]'));
//     console.log(chalk.white('6. Add owner number:'));
//     console.log(chalk.yellow('   OWNER_NUMBER=254788710904'));
//     console.log(chalk.white('7. Restart bot'));
//     console.log(chalk.white('\n💡 The Base64 should be VERY long (1000+ characters)'));
// }

// // ====== CHECK ENV FILE ======
// function checkEnvFile() {
//     const envPath = path.join(__dirname, '.env');
    
//     if (fs.existsSync(envPath)) {
//         const envContent = fs.readFileSync(envPath, 'utf8');
//         const hasBase64 = envContent.includes('BASE64_SESSION=');
//         const hasOwner = envContent.includes('OWNER_NUMBER=');
        
//         console.log(chalk.cyan('\n📁 .env File Check:'));
//         console.log(chalk.white(`✅ .env file exists`));
//         console.log(chalk.white(`📄 Base64 session: ${hasBase64 ? '✅ Found' : '❌ Missing'}`));
//         console.log(chalk.white(`👑 Owner number: ${hasOwner ? '✅ Found' : '❌ Missing'}`));
        
//         if (hasBase64) {
//             const match = envContent.match(/BASE64_SESSION=(.*)/);
//             if (match && match[1]) {
//                 const base64Value = match[1].trim();
//                 console.log(chalk.gray(`📏 Base64 length: ${base64Value.length} characters`));
//                 console.log(chalk.gray(`🔍 First 50 chars: ${base64Value.substring(0, 50)}...`));
//             }
//         }
//     } else {
//         console.log(chalk.yellow('⚠️ .env file not found. Create one with:'));
//         console.log(chalk.white('   BASE64_SESSION=your_base64_string'));
//         console.log(chalk.white('   OWNER_NUMBER=254788710904'));
//     }
// }

// // ====== MAIN APPLICATION START ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        
//         // Check .env file
//         checkEnvFile();
        
//         // Show instructions if no session found
//         if (!DECODED_SESSION) {
//             showSessionInstructions();
//         }
        
//         // Check if Base64 session exists
//         if (DECODED_SESSION) {
//             console.log(chalk.green('✅ REAL Base64 session detected and decoded'));
//             console.log(chalk.green('🔄 Starting bot with REAL Base64 session...'));
//             await startBot('base64');
//         } else {
//             console.log(chalk.yellow('📱 No Base64 session found in .env'));
//             const { mode, phone, websiteSessionId } = await selectLoginMode();
            
//             if (mode === 'website' && websiteSessionId) {
//                 console.log(chalk.gray(`\nStarting with Website Session mode...`));
//                 await startBot('website', null, websiteSessionId);
//             } else {
//                 console.log(chalk.gray(`\nStarting with ${mode === 'qr' ? 'QR Code' : 'Pair Code'} mode...`));
//                 await startBot(mode, phone);
//             }
//         }
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         process.exit(1);
//     }
// }

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });




































// // ====== WOLF BOT - index.js ======
// // FIXED version - Handles corrupted sessions and :53 issue

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

// // ====== FIXED BASE64 SESSION HANDLER ======
// function decodeAndFixBase64Session() {
//     try {
//         // Get Base64 from any possible source
//         let base64String = process.env.SESSION_ID || 
//                           process.env.BASE64_SESSION || 
//                           process.env.WHATSAPP_SESSION || 
//                           '';
        
//         if (!base64String.trim()) {
//             console.log(chalk.yellow('⚠️ No session found in environment variables'));
//             return null;
//         }
        
//         console.log(chalk.cyan('🔧 Processing session...'));
        
//         // Clean the Base64 string thoroughly
//         base64String = base64String
//             .replace(/["']/g, '')  // Remove quotes
//             .replace(/\s/g, '')     // Remove all whitespace
//             .replace(/\\n/g, '')    // Remove \n
//             .replace(/\\r/g, '')    // Remove \r
//             .replace(/\\/g, '')     // Remove backslashes
//             .trim();
        
//         console.log(chalk.gray(`📏 Cleaned length: ${base64String.length} chars`));
        
//         // Check if it's actually Base64
//         if (!base64String.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
//             console.log(chalk.yellow('⚠️ String does not look like valid Base64'));
//             console.log(chalk.gray(`First 50 chars: ${base64String.substring(0, 50)}`));
            
//             // Try to extract Base64 from the string
//             const base64Match = base64String.match(/[A-Za-z0-9+/]{100,}={0,2}/);
//             if (base64Match) {
//                 base64String = base64Match[0];
//                 console.log(chalk.green(`✅ Extracted Base64 (${base64String.length} chars)`));
//             }
//         }
        
//         // Decode Base64
//         let decodedString;
//         try {
//             decodedString = Buffer.from(base64String, 'base64').toString('utf-8');
//             console.log(chalk.green('✅ Base64 decoded successfully'));
//         } catch (decodeError) {
//             console.error(chalk.red('❌ Failed to decode Base64:'), decodeError.message);
            
//             // Maybe it's already JSON?
//             if (base64String.includes('creds') || base64String.includes('noiseKey')) {
//                 console.log(chalk.yellow('⚠️ Trying to parse as JSON directly...'));
//                 try {
//                     const session = JSON.parse(base64String);
//                     return session;
//                 } catch (jsonError) {
//                     console.error(chalk.red('❌ Also failed to parse as JSON'));
//                 }
//             }
//             return null;
//         }
        
//         // Parse JSON
//         let session;
//         try {
//             session = JSON.parse(decodedString);
//             console.log(chalk.green('✅ JSON parsed successfully'));
//         } catch (parseError) {
//             console.error(chalk.red('❌ Failed to parse JSON:'), parseError.message);
            
//             // Try to fix common JSON issues
//             console.log(chalk.yellow('⚠️ Attempting to fix JSON...'));
            
//             // Fix 1: Remove trailing commas
//             let fixedJson = decodedString.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
            
//             // Fix 2: Fix :53 issue in owner number
//             fixedJson = fixedJson.replace(/"id"\s*:\s*"(\d+)@s\.whatsapp\.net:53"/g, '"id":"$1@s.whatsapp.net"');
//             fixedJson = fixedJson.replace(/"id"\s*:\s*"(\d+):53@s\.whatsapp\.net"/g, '"id":"$1@s.whatsapp.net"');
//             fixedJson = fixedJson.replace(/\+(\d+):53/g, '+$1');
            
//             try {
//                 session = JSON.parse(fixedJson);
//                 console.log(chalk.green('✅ Fixed JSON parsed successfully'));
//             } catch (fixedError) {
//                 console.error(chalk.red('❌ Could not fix JSON'));
//                 return null;
//             }
//         }
        
//         // Validate session structure
//         if (!session.creds) {
//             console.log(chalk.red('❌ Session missing "creds" object'));
            
//             // Try to find creds in nested structure
//             if (session.session && session.session.creds) {
//                 session.creds = session.session.creds;
//                 session.keys = session.session.keys;
//                 console.log(chalk.green('✅ Found creds in nested structure'));
//             } else {
//                 return null;
//             }
//         }
        
//         // FIX the owner number if it has :53
//         if (session.creds.me && session.creds.me.id) {
//             const originalId = session.creds.me.id;
            
//             // Remove :53 suffix if present
//             if (originalId.includes(':53')) {
//                 session.creds.me.id = originalId.replace(/:53/g, '');
//                 console.log(chalk.yellow(`⚠️ Fixed owner ID: ${originalId} → ${session.creds.me.id}`));
//             }
            
//             // Extract clean owner number
//             const match = session.creds.me.id.match(/(\d+)@s\.whatsapp\.net/);
//             if (match) {
//                 const cleanNumber = match[1];
//                 console.log(chalk.cyan(`👑 Session owner: +${cleanNumber}`));
//             }
//         }
        
//         // Ensure required fields exist
//         if (!session.creds.noiseKey) {
//             console.log(chalk.yellow('⚠️ Session missing noiseKey, adding placeholder'));
//             session.creds.noiseKey = { private: { type: 'Buffer', data: [] }, public: { type: 'Buffer', data: [] } };
//         }
        
//         if (!session.creds.signedIdentityKey) {
//             console.log(chalk.yellow('⚠️ Session missing signedIdentityKey, adding placeholder'));
//             session.creds.signedIdentityKey = { private: { type: 'Buffer', data: [] }, public: { type: 'Buffer', data: [] } };
//         }
        
//         if (!session.creds.registrationId) {
//             console.log(chalk.yellow('⚠️ Session missing registrationId, setting default'));
//             session.creds.registrationId = 123;
//         }
        
//         console.log(chalk.green('✅ Session prepared successfully'));
//         return session;
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL error in session processing:'), error.message);
//         return null;
//     }
// }

// // ====== SESSION VALIDATOR ======
// async function validateSession(session) {
//     if (!session || !session.creds) {
//         console.log(chalk.red('❌ Invalid session object'));
//         return false;
//     }
    
//     console.log(chalk.cyan('🔍 Validating session...'));
    
//     // Check required fields
//     const requiredFields = ['noiseKey', 'signedIdentityKey', 'registrationId'];
//     const missingFields = requiredFields.filter(field => !session.creds[field]);
    
//     if (missingFields.length > 0) {
//         console.log(chalk.yellow(`⚠️ Missing fields: ${missingFields.join(', ')}`));
//         console.log(chalk.yellow('⚠️ Session may be incomplete'));
//     }
    
//     // Check owner number format
//     if (session.creds.me && session.creds.me.id) {
//         const isValidJid = session.creds.me.id.match(/^\d+@s\.whatsapp\.net$/);
//         if (!isValidJid) {
//             console.log(chalk.yellow(`⚠️ Invalid JID format: ${session.creds.me.id}`));
            
//             // Try to fix it
//             const numberMatch = session.creds.me.id.match(/(\d+)/);
//             if (numberMatch) {
//                 const fixedJid = `${numberMatch[1]}@s.whatsapp.net`;
//                 console.log(chalk.yellow(`⚠️ Attempting to fix JID: ${fixedJid}`));
//                 session.creds.me.id = fixedJid;
//             }
//         }
//     }
    
//     return true;
// }

// // ====== SIMPLE CONNECTION TEST ======
// async function testSessionQuick(session) {
//     try {
//         console.log(chalk.cyan('⚡ Quick session test...'));
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         const testConfig = {
//             version,
//             logger: P({ level: 'silent' }),
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: session.creds,
//                 keys: makeCacheableSignalKeyStore(session.keys || {}, P({ level: 'fatal' })),
//             },
//             markOnlineOnConnect: false,
//             connectTimeoutMs: 15000,
//         };
        
//         return new Promise((resolve) => {
//             const sock = makeWASocket(testConfig);
//             let timeout;
            
//             sock.ev.on('connection.update', (update) => {
//                 const { connection } = update;
                
//                 if (connection === 'open') {
//                     clearTimeout(timeout);
//                     sock.ws.close();
//                     console.log(chalk.green('✅ Session test PASSED'));
//                     resolve(true);
//                 }
                
//                 if (connection === 'close') {
//                     clearTimeout(timeout);
//                     console.log(chalk.red('❌ Session test FAILED - Connection closed'));
//                     resolve(false);
//                 }
//             });
            
//             timeout = setTimeout(() => {
//                 sock.ws.close();
//                 console.log(chalk.yellow('⏰ Session test timeout'));
//                 resolve(false);
//             }, 15000);
//         });
        
//     } catch (error) {
//         console.error(chalk.red('❌ Session test error:'), error.message);
//         return false;
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

// // ====== BOT CORE ======
// async function startBot(mode = 'auto', phoneNumber = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));
    
//     // Load commands
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));
    
//     let state = { creds: {}, keys: {} };
//     let saveCreds = () => {};
//     let connectionMethod = 'Unknown';
    
//     // ====== TRY SESSION FIRST ======
//     if (mode === 'auto' || mode === 'session') {
//         console.log(chalk.cyan('🔄 Attempting to use session...'));
        
//         const session = decodeAndFixBase64Session();
        
//         if (session) {
//             // Validate session
//             const isValid = await validateSession(session);
            
//             if (isValid) {
//                 console.log(chalk.cyan('🧪 Testing session connection...'));
//                 const testPassed = await testSessionQuick(session);
                
//                 if (testPassed) {
//                     console.log(chalk.green('✅ Session is valid and working!'));
                    
//                     state.creds = session.creds;
//                     state.keys = session.keys || {};
//                     connectionMethod = 'Base64 Session';
                    
//                     // Set owner info
//                     if (session.creds.me?.id) {
//                         OWNER_JID = session.creds.me.id;
//                         OWNER_NUMBER = OWNER_JID.split('@')[0];
//                         console.log(chalk.cyan(`👑 Using owner from session: +${OWNER_NUMBER}`));
//                     } else if (process.env.OWNER_NUMBER) {
//                         OWNER_NUMBER = process.env.OWNER_NUMBER.replace(/[^0-9]/g, '');
//                         OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;
//                         console.log(chalk.cyan(`👑 Using owner from env: +${OWNER_NUMBER}`));
//                     }
//                 } else {
//                     console.log(chalk.red('❌ Session test failed, using QR mode'));
//                     mode = 'qr';
//                 }
//             } else {
//                 console.log(chalk.red('❌ Session validation failed, using QR mode'));
//                 mode = 'qr';
//             }
//         } else {
//             console.log(chalk.yellow('⚠️ No session found, using QR mode'));
//             mode = 'qr';
//         }
//     }
    
//     // ====== QR/PAIR MODE ======
//     if (mode === 'qr' || mode === 'pair') {
//         connectionMethod = mode === 'pair' ? 'Pair Code' : 'QR Code';
//         console.log(chalk.yellow(`🔗 Using ${connectionMethod} authentication...`));
        
//         if (mode === 'pair') {
//             console.log(chalk.yellow('🧹 Clearing old auth data...'));
//             try {
//                 if (fs.existsSync('./auth')) {
//                     fs.rmSync('./auth', { recursive: true, force: true });
//                 }
//             } catch (error) {
//                 console.log(chalk.yellow('⚠️ Could not clear auth data'));
//             }
//         }
        
//         try {
//             const authState = await useMultiFileAuthState('./auth');
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             console.log(chalk.green('✅ Auth state ready'));
//         } catch (error) {
//             console.error(chalk.red('❌ Auth error:'), error.message);
//             return;
//         }
//     }
    
//     // ====== CREATE WHATSAPP CONNECTION ======
//     try {
//         const { version } = await fetchLatestBaileysVersion();
//         console.log(chalk.blue(`📦 Baileys version: ${version}`));
        
//         const socketConfig = {
//             version,
//             logger: P({ level: 'warn' }),
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: mode === 'qr',
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000,
//         };
        
//         const sock = makeWASocket(socketConfig);
//         SOCKET_INSTANCE = sock;
        
//         console.log(chalk.cyan('✅ WhatsApp client created'));
//         console.log(chalk.gray(`📁 Connection method: ${connectionMethod}`));
        
//         // ====== EVENT HANDLERS ======
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, qr, lastDisconnect } = update;
            
//             console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));
            
//             if (qr && mode === 'qr') {
//                 console.log(chalk.yellow('\n📲 QR Code Generated:\n'));
//                 qrcode.generate(qr, { small: true });
//                 console.log(chalk.gray('💡 Scan with WhatsApp mobile app'));
//             }
            
//             if (mode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formattedCode.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         console.error(chalk.red('❌ Pair code error:'), error.message);
//                     }
//                 }, 2000);
//             }
            
//             if (connection === 'open') {
//                 await handleConnectionSuccess(sock, connectionMethod);
//             }
            
//             if (connection === 'close') {
//                 const statusCode = lastDisconnect?.error?.output?.statusCode;
//                 console.log(chalk.red(`\n❌ Connection closed (Status: ${statusCode})`));
                
//                 if (statusCode === DisconnectReason.loggedOut || statusCode === 401) {
//                     console.log(chalk.yellow('🔓 Logged out'));
//                 }
                
//                 console.log(chalk.blue('🔄 Restarting in 5 seconds...'));
//                 setTimeout(() => startBot(mode, phoneNumber), 5000);
//             }
//         });
        
//         if (mode === 'qr' || mode === 'pair') {
//             sock.ev.on('creds.update', saveCreds);
//         }
        
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             await handleMessage(sock, msg);
//         });
        
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to create connection:'), error.message);
        
//         if (mode !== 'qr') {
//             console.log(chalk.yellow('💡 Falling back to QR mode...'));
//             setTimeout(() => startBot('qr'), 3000);
//         } else {
//             setTimeout(() => startBot(mode, phoneNumber), 5000);
//         }
//     }
// }

// // ====== CONNECTION SUCCESS ======
// async function handleConnectionSuccess(sock, method) {
//     const currentTime = moment().format('h:mm:ss A');
    
//     if (!OWNER_JID) {
//         OWNER_JID = sock.user.id;
//         OWNER_NUMBER = OWNER_JID.split('@')[0];
        
//         try {
//             fs.writeFileSync('./owner.json', JSON.stringify({ 
//                 OWNER_NUMBER, 
//                 OWNER_JID,
//                 connectedAt: new Date().toISOString()
//             }, null, 2));
//         } catch (error) {
//             console.log(chalk.yellow('⚠️ Could not save owner data'));
//         }
//     }
    
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME}`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ║  🔐 Method : ${chalk.cyan(method)}         
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${method}\n🔥 Status: Ready to Hunt!`
//         });
//         console.log(chalk.green('📨 Welcome message sent'));
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// // ====== MESSAGE HANDLER ======
// async function handleMessage(sock, msg) {
//     const chatId = msg.key.remoteJid;
//     const textMsg = msg.message.conversation || 
//                    msg.message.extendedTextMessage?.text || 
//                    msg.message.imageMessage?.caption || 
//                    '';
    
//     if (!textMsg || !textMsg.startsWith(PREFIX)) return;
    
//     const fromNumber = chatId.split('@')[0];
//     const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
//     const commandName = parts[0].toLowerCase();
    
//     console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName}`));
// }

// // ====== LOGIN SELECTION ======
// async function selectLoginMode() {
//     const rl = readline.createInterface({
//         input: process.stdin,
//         output: process.stdout
//     });
    
//     console.log(chalk.yellow('\n🐺 WOLF BOT LOGIN OPTIONS'));
//     console.log('1) Try Session (Auto-detect)');
//     console.log('2) QR Code Login');
//     console.log('3) Pair Code Login');
    
//     try {
//         const choice = await new Promise(resolve => {
//             rl.question('Enter 1, 2, or 3 (default 1): ', resolve);
//         });
        
//         let mode = 'auto';
//         let phone = null;
        
//         if (choice === '2') {
//             mode = 'qr';
//         } else if (choice === '3') {
//             mode = 'pair';
//             const number = await new Promise(resolve => {
//                 rl.question(chalk.yellow('📱 Enter phone number (e.g., 254788710904): '), resolve);
//             });
            
//             const cleanedNumber = number.trim().replace(/[^0-9]/g, '');
//             if (cleanedNumber.match(/^\d{10,15}$/)) {
//                 phone = cleanedNumber;
//             } else {
//                 console.log(chalk.red('❌ Invalid number, using QR mode'));
//                 mode = 'qr';
//             }
//         }
        
//         rl.close();
//         return { mode, phone };
//     } catch (error) {
//         rl.close();
//         console.log(chalk.yellow('⚠️ Using auto mode'));
//         return { mode: 'auto', phone: null };
//     }
// }

// // ====== SESSION DIAGNOSTICS ======
// function diagnoseSessionIssue() {
//     console.log(chalk.cyan('\n🔧 Session Diagnostics:'));
    
//     // Check session source
//     const sessionSources = ['SESSION_ID', 'BASE64_SESSION', 'WHATSAPP_SESSION'];
//     let foundSession = false;
    
//     sessionSources.forEach(source => {
//         if (process.env[source]) {
//             foundSession = true;
//             const value = process.env[source];
//             console.log(chalk.green(`✅ Found ${source} (${value.length} chars)`));
            
//             // Check for :53 issue
//             if (value.includes(':53')) {
//                 console.log(chalk.red(`❌ ${source} contains ':53' - This is the problem!`));
//                 console.log(chalk.yellow('💡 The session has corrupted owner number format'));
//             }
            
//             // Show preview
//             const preview = value.substring(0, 100);
//             console.log(chalk.gray(`   Preview: ${preview}...`));
//         }
//     });
    
//     if (!foundSession) {
//         console.log(chalk.yellow('⚠️ No session found in environment variables'));
//     }
    
//     // Suggest solution
//     console.log(chalk.cyan('\n💡 Solution:'));
//     console.log(chalk.white('1. Get a NEW Base64 session from your website'));
//     console.log(chalk.white('2. Make sure it does NOT contain ":53"'));
//     console.log(chalk.white('3. Update your .env file or Heroku config vars'));
//     console.log(chalk.white('4. Restart the bot'));
// }

// // ====== MAIN ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        
//         // Run diagnostics
//         diagnoseSessionIssue();
        
//         // Ask for mode
//         const { mode, phone } = await selectLoginMode();
        
//         console.log(chalk.gray(`\nStarting with ${mode} mode...`));
//         await startBot(mode, phone);
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         process.exit(1);
//     }
// }

// // Start
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });





















// // ====== WOLF BOT - index.js ======
// // Fast, stable & themed. Supports QR, Pair Code, or Session ID login.

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

// // ====== SESSION ID MANAGER ======
// class SessionIDManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//         this.sessionIDs = [];
//     }

//     async selectSessionMode() {
//         console.log(chalk.yellow('\n🔐 SESSION ID LOGIN OPTIONS'));
//         console.log(chalk.cyan('1)') + ' QR Code Login (Recommended)');
//         console.log(chalk.cyan('2)') + ' Pair Code Login (Experimental)');
//         console.log(chalk.cyan('3)') + ' Use Session ID (Manual)');
//         console.log(chalk.red('4)') + ' Exit\n');

//         return new Promise((resolve) => {
//             this.rl.question(chalk.green('📝 Select option (1-4): '), (answer) => {
//                 resolve(answer.trim());
//             });
//         });
//     }

//     async getSessionCount() {
//         console.log(chalk.yellow('\n🔢 HOW MANY SESSION IDs?'));
//         console.log(chalk.cyan('1)') + ' Two sessions');
//         console.log(chalk.cyan('2)') + ' Three sessions');
//         console.log(chalk.red('3)') + ' Go back\n');

//         return new Promise((resolve) => {
//             this.rl.question(chalk.green('📝 Select option (1-3): '), (answer) => {
//                 const count = parseInt(answer.trim());
//                 if ([1, 2, 3].includes(count)) {
//                     resolve(count);
//                 } else {
//                     console.log(chalk.red('❌ Invalid option. Please select 1-3.'));
//                     this.getSessionCount().then(resolve);
//                 }
//             });
//         });
//     }

//     async inputSessionID(sessionNumber, totalSessions) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.cyan(`\n📝 Enter Session ID ${sessionNumber}/${totalSessions}: `), (sessionId) => {
//                 if (!sessionId.trim()) {
//                     console.log(chalk.red('❌ Session ID cannot be empty.'));
//                     this.inputSessionID(sessionNumber, totalSessions).then(resolve);
//                     return;
//                 }
//                 console.log(chalk.green(`✅ Session ${sessionNumber} saved`));
//                 resolve(sessionId.trim());
//             });
//         });
//     }

//     async collectSessionIDs(count) {
//         this.sessionIDs = [];
        
//         for (let i = 1; i <= count; i++) {
//             const sessionID = await this.inputSessionID(i, count);
//             this.sessionIDs.push(sessionID);
//         }
        
//         console.log(chalk.green(`\n✅ Successfully collected ${count} session ID(s)`));
        
//         // Save session IDs to file
//         this.saveSessionIDs();
        
//         return this.sessionIDs;
//     }

//     saveSessionIDs() {
//         try {
//             const sessionData = {
//                 sessions: this.sessionIDs,
//                 timestamp: new Date().toISOString(),
//                 count: this.sessionIDs.length
//             };
            
//             fs.writeFileSync('./session_ids.json', JSON.stringify(sessionData, null, 2));
//             console.log(chalk.green('💾 Session IDs saved to session_ids.json'));
//         } catch (error) {
//             console.log(chalk.red('❌ Could not save session IDs:'), error.message);
//         }
//     }

//     loadSessionIDs() {
//         try {
//             if (fs.existsSync('./session_ids.json')) {
//                 const data = JSON.parse(fs.readFileSync('./session_ids.json', 'utf8'));
//                 this.sessionIDs = data.sessions || [];
//                 console.log(chalk.green(`📂 Loaded ${this.sessionIDs.length} session IDs from file`));
//                 return this.sessionIDs;
//             }
//         } catch (error) {
//             console.log(chalk.yellow('⚠️ Could not load session IDs from file'));
//         }
//         return [];
//     }

//     async getSessionModeAndIDs() {
//         while (true) {
//             const mode = await this.selectSessionMode();
            
//             switch (mode) {
//                 case '1':
//                     console.log(chalk.blue('\n📲 Starting QR Code mode...'));
//                     this.close();
//                     return { mode: 'qr', sessions: [] };
                
//                 case '2':
//                     console.log(chalk.blue('\n🔗 Starting Pair Code mode...'));
//                     const phoneNumber = await this.getPhoneNumber();
//                     this.close();
//                     return { mode: 'pair', phoneNumber, sessions: [] };
                
//                 case '3':
//                     console.log(chalk.blue('\n🔐 Starting Session ID mode...'));
                    
//                     // Check if session IDs exist
//                     const existingSessions = this.loadSessionIDs();
//                     if (existingSessions.length > 0) {
//                         const useExisting = await this.askYesNo(`📂 Found ${existingSessions.length} saved session IDs. Use existing? (y/n): `);
//                         if (useExisting) {
//                             console.log(chalk.green('✅ Using saved session IDs'));
//                             this.close();
//                             return { mode: 'session', sessions: existingSessions };
//                         }
//                     }
                    
//                     // Get new session IDs
//                     const sessionCount = await this.getSessionCount();
                    
//                     if (sessionCount === 3) {
//                         // Go back
//                         continue;
//                     }
                    
//                     const sessions = await this.collectSessionIDs(sessionCount === 1 ? 2 : 3);
//                     this.close();
//                     return { mode: 'session', sessions };
                
//                 case '4':
//                     console.log(chalk.yellow('\n👋 Exiting...'));
//                     this.close();
//                     process.exit(0);
                
//                 default:
//                     console.log(chalk.red('❌ Invalid option. Please select 1-4.'));
//             }
//         }
//     }

//     async askYesNo(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer.toLowerCase().trim() === 'y' || answer.toLowerCase().trim() === 'yes');
//             });
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

// // ====== SESSION ID AUTH HANDLER ======
// async function useSessionIDAuth(sessionIDs) {
//     try {
//         // Create auth directory if it doesn't exist
//         if (!fs.existsSync('./auth')) {
//             fs.mkdirSync('./auth', { recursive: true });
//         }

//         // For each session ID, create auth files
//         for (let i = 0; i < sessionIDs.length; i++) {
//             const sessionID = sessionIDs[i];
//             const sessionDir = `./auth/session_${i + 1}`;
            
//             if (!fs.existsSync(sessionDir)) {
//                 fs.mkdirSync(sessionDir, { recursive: true });
//             }
            
//             // In a real implementation, you would parse the session ID
//             // and create the appropriate auth files
//             console.log(chalk.cyan(`📁 Setting up session ${i + 1}...`));
            
//             // This is a simplified example - you would need to implement
//             // the actual session ID parsing based on your auth system
//             const authData = {
//                 sessionId: sessionID,
//                 timestamp: Date.now(),
//                 index: i + 1
//             };
            
//             fs.writeFileSync(path.join(sessionDir, 'creds.json'), JSON.stringify(authData, null, 2));
//         }
        
//         // Use the first session for authentication
//         const { state, saveCreds } = await useMultiFileAuthState('./auth/session_1');
        
//         console.log(chalk.green(`✅ Loaded ${sessionIDs.length} session(s)`));
        
//         // Save the active session index
//         fs.writeFileSync('./active_session.json', JSON.stringify({
//             activeIndex: 1,
//             totalSessions: sessionIDs.length,
//             lastUpdated: new Date().toISOString()
//         }, null, 2));
        
//         return { state, saveCreds, totalSessions: sessionIDs.length };
        
//     } catch (error) {
//         console.error(chalk.red('❌ Session ID auth error:'), error.message);
//         throw error;
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

// // ====== CLEAN AUTH FUNCTION ======
// function cleanAuth() {
//     try {
//         if (fs.existsSync('./auth')) {
//             fs.rmSync('./auth', { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared previous auth session'));
//         }
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
//         if (fs.existsSync('./session_ids.json')) {
//             fs.unlinkSync('./session_ids.json');
//         }
//         if (fs.existsSync('./active_session.json')) {
//             fs.unlinkSync('./active_session.json');
//         }
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data'));
//     }
// }

// // ====== BOT INITIALIZATION ======
// async function startBot(loginData) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));
    
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     let state, saveCreds, totalSessions = 1;

//     // Clean auth for non-session modes
//     if (loginData.mode !== 'session') {
//         console.log(chalk.yellow('🔄 Starting fresh session...'));
//         cleanAuth();
//     }

//     try {
//         if (loginData.mode === 'session') {
//             // Use session ID authentication
//             const sessionAuth = await useSessionIDAuth(loginData.sessions);
//             state = sessionAuth.state;
//             saveCreds = sessionAuth.saveCreds;
//             totalSessions = sessionAuth.totalSessions;
//         } else {
//             // Use normal auth
//             const authState = await useMultiFileAuthState('./auth');
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//         }
//         console.log(chalk.green('✅ Auth state loaded'));
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         return;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
//         browser: Browsers.ubuntu('Chrome'),
//         printQRInTerminal: false,
//         auth: {
//             creds: state.creds,
//             keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
//         },
//         markOnlineOnConnect: true,
//         generateHighQualityLinkPreview: true,
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

//         // Handle QR code for QR mode
//         if (qr && loginData.mode === 'qr') {
//             console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
//             qrcode.generate(qr, { small: true });
//             console.log(chalk.gray('💡 Scan with WhatsApp mobile app'));
//         }

//         // Handle pair code generation
//         if (loginData.mode === 'pair' && loginData.phoneNumber && !state.creds.registered && connection === 'connecting') {
//             console.log(chalk.cyan(`\n🔗 Attempting to generate pair code for: ${loginData.phoneNumber}`));
            
//             setTimeout(async () => {
//                 try {
//                     console.log(chalk.cyan('📞 Requesting pairing code from WhatsApp servers...'));
//                     const code = await sock.requestPairingCode(loginData.phoneNumber);
//                     const formattedCode = code.match(/.{1,4}/g)?.join('-') || code;
                    
//                     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(loginData.phoneNumber.padEnd(30))}║
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
                    
//                     loginData.mode = 'qr';
//                     console.log(chalk.yellow('\n📲 Generating QR Code instead:\n'));
                    
//                     if (update.qr) {
//                         qrcode.generate(update.qr, { small: true });
//                     }
//                 }
//             }, 2000);
//         }

//         if (connection === 'open') {
//             await handleSuccessfulConnection(sock, loginData);
//         }

//         if (connection === 'close') {
//             await handleConnectionClose(lastDisconnect, loginData);
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
// async function handleSuccessfulConnection(sock, loginData) {
//     const currentTime = moment().format('h:mm:ss A');
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     try {
//         fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not save owner data'));
//     }

//     const methodName = loginData.mode === 'qr' ? 'QR Code' : 
//                       loginData.mode === 'pair' ? 'Pair Code' : 
//                       'Session ID';
    
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ║  🔐 Method : ${chalk.cyan(methodName)}         
// ╚════════════════════════════════════════════════════════╝
// `));

//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${methodName}\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
//         });
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginData) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Clearing auth data...'));
//         cleanAuth();
//     }
    
//     if (loginData.mode === 'pair' && statusCode) {
//         console.log(chalk.yellow('💡 Pair code mode failed. Switching to QR code mode...'));
//         loginData.mode = 'qr';
//         loginData.phoneNumber = null;
//     }
    
//     console.log(chalk.blue('🔄 Restarting in 3 seconds...'));
//     setTimeout(() => startBot(loginData), 3000);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         const commandExecuted = await executeCommand(commandName, sock, msg, args);
//         // Command execution handled
//     }
// }

// // ====== MAIN APPLICATION START ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 Starting Wolf Bot...'));
        
//         const sessionManager = new SessionIDManager();
//         const loginData = await sessionManager.getSessionModeAndIDs();
        
//         console.log(chalk.gray(`\nStarting with ${loginData.mode === 'qr' ? 'QR Code' : loginData.mode === 'pair' ? 'Pair Code' : 'Session ID'} mode...`));
        
//         await startBot(loginData);
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         process.exit(1);
//     }
// }

// // Start the application
// main().catch(error => {
//     console.error(chalk.red('💥 CRITICAL ERROR:'), error);
//     process.exit(1);
// });

// process.on('uncaughtException', (error) => {
//     console.error(chalk.red('💥 Uncaught Exception:'), error);
// });

// process.on('unhandledRejection', (error) => {
//     console.error(chalk.red('💥 Unhandled Rejection:'), error);
// });

// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
//     if (SOCKET_INSTANCE) {
//         SOCKET_INSTANCE.ws.close();
//     }
//     process.exit(0);
// });




























// // ====== WOLF BOT - index.js ======

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import qrcode from 'qrcode-terminal';
// import readline from 'readline';
// import moment from 'moment';
// import pkg from '@whiskeysockets/baileys';

// const {
//     default: makeWASocket,
//     useMultiFileAuthState,
//     DisconnectReason,
//     fetchLatestBaileysVersion,
//     makeCacheableSignalKeyStore,
//     Browsers,
//     delay
// } = pkg;

// import P from 'pino';

// // ====== CONFIGURATION ======
// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// const PREFIX = process.env.PREFIX || '.';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '2.0.0';

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;
// let RECONNECT_ATTEMPTS = 0;
// const MAX_RECONNECT_ATTEMPTS = 5;
// let isBotConnected = false;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ╚════════════════════════════════════════════════╝
// `));

// // ====== PATHS ======
// const SESSION_DIR = path.join(__dirname, 'session');
// const CREDS_PATH = path.join(SESSION_DIR, 'creds.json');
// const LOGIN_FILE = path.join(SESSION_DIR, 'login.json');

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

// // ====== LOGIN PERSISTENCE  ======
// async function saveLoginMethod(method) {
//     await fs.promises.mkdir(SESSION_DIR, { recursive: true });
//     await fs.promises.writeFile(LOGIN_FILE, JSON.stringify({ method }, null, 2));
// }

// async function getLastLoginMethod() {
//     if (fs.existsSync(LOGIN_FILE)) {
//         const data = JSON.parse(fs.readFileSync(LOGIN_FILE, 'utf-8'));
//         return data.method;
//     }
//     return null;
// }

// function sessionExists() {
//     return fs.existsSync(CREDS_PATH);
// }

// // ====== LOGIN MANAGER ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }

//     async showMenu() {
//         console.log(chalk.yellow('\n🔐 WOLF BOT LOGIN OPTIONS'));
//         console.log(chalk.cyan('1)') + ' QR Code Login (Recommended)');
//         console.log(chalk.cyan('2)') + ' Pair Code Login (Improved)');
//         console.log(chalk.cyan('3)') + ' Session ID Login (Advanced)');
//         console.log(chalk.red('4)') + ' Exit\n');

//         return new Promise((resolve) => {
//             this.rl.question(chalk.green('📝 Select option (1-4): '), (answer) => {
//                 resolve(answer.trim());
//             });
//         });
//     }

//     async getPhoneNumber() {
//         console.log(chalk.cyan('\n📱 PAIR CODE LOGIN'));
//         console.log(chalk.white('• Enter your WhatsApp number'));
//         console.log(chalk.white('• You will receive a 6-digit code'));
//         console.log(chalk.white('• Enter that code in WhatsApp\n'));
        
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow('Enter phone number (e.g., 254788710904): '), (number) => {
//                 const cleanedNumber = number.trim().replace(/[^0-9]/g, '');
                
//                 if (!cleanedNumber || cleanedNumber.length < 10) {
//                     console.log(chalk.red('❌ Invalid number. Minimum 10 digits.'));
//                     this.getPhoneNumber().then(resolve);
//                     return;
//                 }
                
//                 // Auto-add country code if missing
//                 let finalNumber = cleanedNumber;
//                 if (!cleanedNumber.startsWith('254') && cleanedNumber.length === 9) {
//                     finalNumber = '254' + cleanedNumber;
//                 }
                
//                 console.log(chalk.green(`✅ Number registered: +${finalNumber}`));
//                 resolve(finalNumber);
//             });
//         });
//     }

//     async getSessionID() {
//         console.log(chalk.cyan('\n🔐 SESSION ID LOGIN'));
//         console.log(chalk.white('• Get session from generator website'));
//         console.log(chalk.white('• Session must start with "SILENT-WOLF:"'));
//         console.log(chalk.white('• Paste the full session string below\n'));

//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow('Paste your Session ID here: '), (sessionId) => {
//                 const cleanedSessionId = sessionId.trim();
                
//                 if (!cleanedSessionId) {
//                     console.log(chalk.red('❌ Session ID cannot be empty.'));
//                     this.getSessionID().then(resolve);
//                     return;
//                 }
                
//                 //  - must contain prefix
//                 if (!cleanedSessionId.includes("SILENT-WOLF:")) {
//                     console.log(chalk.red('❌ Invalid Session ID! Must contain "SILENT-WOLF:" prefix.'));
//                     process.exit(1);
//                 }
                
//                 console.log(chalk.green(`✅ Received valid session ID (${cleanedSessionId.length} chars)`));
//                 resolve(cleanedSessionId);
//             });
//         });
//     }

//     close() {
//         if (this.rl) {
//             this.rl.close();
//         }
//     }
// }

// // ====== SESSION DOWNLOADER  ======
// async function downloadSessionData() {
//     try {
//         await fs.promises.mkdir(SESSION_DIR, { recursive: true });
        
//         if (!fs.existsSync(CREDS_PATH) && global.SESSION_ID) {
//             // Extract base64 data after "SILENT-WOLF:" prefix
//             const base64Data = global.SESSION_ID.includes("SILENT-WOLF:") 
//                 ? global.SESSION_ID.split("SILENT-WOLF:")[1] 
//                 : global.SESSION_ID;
            
//             const sessionData = Buffer.from(base64Data, 'base64');
//             await fs.promises.writeFile(CREDS_PATH, sessionData);
//             console.log(chalk.green('✅ Session successfully saved to session/creds.json'));
//         }
//     } catch (err) {
//         console.error(chalk.red('❌ Error downloading session data:'), err.message);
//         throw err;
//     }
// }

// // ====== CHECK SESSION FORMAT  ======
// async function checkAndHandleSessionFormat() {
//     const sessionId = process.env.SESSION_ID;
    
//     if (sessionId && sessionId.trim() !== '') {
//         // Only check if it's set and non-empty
//         if (!sessionId.trim().startsWith('SILENT-WOLF:')) {
//             console.log(chalk.red.bgBlack('══════════════════════════════════════════════════'), 'white');
//             console.log(chalk.white.bgRed('❌ ERROR: Invalid SESSION_ID format in .env'), 'white');
//             console.log(chalk.white.bgRed('The session ID MUST start with "SILENT-WOLF:".'), 'white');
//             console.log(chalk.white.bgRed('Please update your .env file.'), 'white');
//             console.log(chalk.red.bgBlack('══════════════════════════════════════════════════'), 'white');
            
//             // Clean .env SESSION_ID line
//             try {
//                 const envPath = path.join(__dirname, '.env');
//                 if (fs.existsSync(envPath)) {
//                     let envContent = fs.readFileSync(envPath, 'utf8');
//                     envContent = envContent.replace(/^SESSION_ID=.*$/m, 'SESSION_ID=');
//                     fs.writeFileSync(envPath, envContent);
//                     console.log(chalk.green('✅ Cleaned SESSION_ID entry in .env file.'));
//                 }
//             } catch (e) {
//                 console.log(chalk.yellow('⚠️ Could not modify .env file.'));
//             }
            
//             console.log(chalk.magenta('🤖 Waiting 30 seconds before restart...'));
//             await delay(30000);
//             process.exit(1);
//         }
//     }
// }

// // ====== CLEAN AUTH FUNCTION ======
// function cleanAuth() {
//     try {
//         // Remove session directory
//         if (fs.existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             console.log(chalk.yellow('🧹 Cleared session directory'));
//         }
        
//         // Remove owner file
//         if (fs.existsSync('./owner.json')) {
//             fs.unlinkSync('./owner.json');
//         }
        
//         // Remove any auth_* directories
//         const items = fs.readdirSync('./');
//         for (const item of items) {
//             if (item.startsWith('auth_') && fs.statSync(item).isDirectory()) {
//                 fs.rmSync(item, { recursive: true, force: true });
//                 console.log(chalk.yellow(`🧹 Cleared auth directory: ${item}`));
//             }
//         }
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not clear auth data'));
//     }
// }

// // ====== PAIR CODE FUNCTION  ======
// async function requestPairingCode(socket, phoneNumber) {
//     try {
//         console.log(chalk.yellow("⏳ Waiting 3 seconds for socket stabilization..."));
//         await delay(3000);

//         let code = await socket.requestPairingCode(phoneNumber);
//         code = code?.match(/.{1,4}/g)?.join("-") || code;
        
//         console.log(chalk.bgGreen.black(`\n📱 YOUR PAIRING CODE: ${code}\n`));
//         console.log(chalk.cyan(`
// ════════════════════════════════════════
//         HOW TO USE PAIRING CODE
// ════════════════════════════════════════
// 1. Open WhatsApp on your phone
// 2. Go to Settings → Linked Devices
// 3. Tap "Link a Device"
// 4. Enter this code: ${chalk.yellow.bold(code)}
// 5. Wait for connection confirmation
// ════════════════════════════════════════
// `));
//         return true;
//     } catch (error) {
//         console.error(chalk.red('❌ Failed to get pairing code:'), error.message);
        
//         // Try one more time with longer delay
//         console.log(chalk.yellow('🔄 Retrying in 5 seconds...'));
//         await delay(5000);
        
//         try {
//             let retryCode = await socket.requestPairingCode(phoneNumber);
//             retryCode = retryCode?.match(/.{1,4}/g)?.join("-") || retryCode;
//             console.log(chalk.green(`✅ Pair code after retry: ${retryCode}`));
//             return true;
//         } catch (retryError) {
//             console.error(chalk.red('❌ Retry failed:'), retryError.message);
//             return false;
//         }
//     }
// }

// // ====== WELCOME MESSAGE FUNCTION ======
// async function sendWelcomeMessage(sock, loginMode, phoneNumber, sessionId) {
//     // Wait for connection to stabilize 
//     await delay(10000);
    
//     try {
//         if (!sock.user || !sock.user.id) return;
        
//         isBotConnected = true;
//         OWNER_JID = sock.user.id;
//         OWNER_NUMBER = OWNER_JID.split('@')[0];
//         const currentTime = moment().format('h:mm:ss A');
        
//         // Save owner info
//         try {
//             fs.writeFileSync('./owner.json', JSON.stringify({ 
//                 OWNER_NUMBER, 
//                 OWNER_JID,
//                 connectedAt: new Date().toISOString() 
//             }, null, 2));
//         } catch (error) {
//             // Silent save
//         }

//         const methodDisplay = loginMode === 'session' ? 'Session ID' : 
//                              loginMode === 'pair' ? 'Pair Code' : 'QR Code';

//         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ CONNECTED VIA ${methodDisplay.toUpperCase()}!
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('ACTIVE & HUNTING')}         
// ╚════════════════════════════════════════════════════════╝
// `));

//         // Send welcome message to owner
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${methodDisplay}\n🔥 Status: Active & Hunting!\n\n📂 Commands loaded: ${commands.size}`
//         });
        
//         return true;
//     } catch (error) {
//         console.log(chalk.yellow('⚠️ Could not send welcome message'));
//         return false;
//     }
// }

// // ====== BOT INITIALIZATION ======
// async function startBot(loginMode = 'qr', phoneNumber = null, sessionId = null) {
//     console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

//     // Load commands
//     console.log(chalk.blue('📂 Loading commands...'));
//     await loadCommandsFromFolder('./commands');
//     console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

//     // Check session integrity 
//     const isSessionFolderPresent = fs.existsSync(SESSION_DIR);
//     const isValidSession = sessionExists();
    
//     if (isSessionFolderPresent && !isValidSession) {
//         console.log(chalk.yellow('⚠️ Detected incomplete session files. Cleaning up...'));
//         cleanAuth();
//         await delay(3000);
//     }

//     // For session mode, set global SESSION_ID and download
//     if (loginMode === 'session' && sessionId) {
//         global.SESSION_ID = sessionId;
//         await downloadSessionData();
//     }

//     // For pair mode, clean auth
//     if (loginMode === 'pair') {
//         console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
//         cleanAuth();
//     }

//     // Load or create auth state
//     let state, saveCreds;
//     try {
//         const authState = await useMultiFileAuthState(SESSION_DIR);
//         state = authState.state;
//         saveCreds = authState.saveCreds;
//         console.log(chalk.green('✅ Auth state loaded'));
        
//         if (!state.creds || !state.creds.me) {
//             console.log(chalk.yellow('⚠️ No valid credentials found, starting fresh...'));
//             cleanAuth();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         } else if (state.creds.me) {
//             console.log(chalk.green(`✅ Found existing session for: ${state.creds.me.id}`));
//         }
//     } catch (error) {
//         console.error(chalk.red('❌ Auth error:'), error.message);
//         console.log(chalk.yellow('🔄 Creating fresh auth state...'));
//         cleanAuth();
//         const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//         state = freshAuth.state;
//         saveCreds = freshAuth.saveCreds;
//     }

//     // Fetch latest version
//     const { version } = await fetchLatestBaileysVersion();
//     console.log(chalk.blue(`📦 Baileys version: ${version.join('.')}`));

//     // Socket configuration
//     const socketConfig = {
//         version,
//         logger: P({ level: 'silent' }),
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
//     };

//     // Create socket
//     const sock = makeWASocket(socketConfig);
//     SOCKET_INSTANCE = sock;

//     console.log(chalk.cyan('✅ WhatsApp client created successfully'));

//     // ====== EVENT HANDLERS ======
    
//     sock.ev.on('connection.update', async (update) => {
//         const { connection, qr, lastDisconnect } = update;

//         console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

//         // Handle QR code for QR mode
//         if (qr && loginMode === 'qr') {
//             console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
//             qrcode.generate(qr, { small: true });
//             console.log(chalk.gray('💡 Scan with WhatsApp mobile app'));
//         }

//         // Handle pair code generation 
//         if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//             console.log(chalk.cyan(`\n🔗 Preparing pair code for: ${phoneNumber}`));
            
//             setTimeout(async () => {
//                 try {
//                     const pairSuccess = await requestPairingCode(sock, phoneNumber);
                    
//                     if (!pairSuccess) {
//                         console.log(chalk.yellow('💡 Pair code generation failed.'));
//                         console.log(chalk.cyan('🔄 Please restart and try again'));
//                     }
//                 } catch (error) {
//                     console.error(chalk.red('❌ Pair code error:'), error.message);
//                 }
//             }, 3000);
//         }

//         if (connection === 'open') {
//             RECONNECT_ATTEMPTS = 0;
//             isBotConnected = true;
//             await sendWelcomeMessage(sock, loginMode, phoneNumber, sessionId);
//         }

//         if (connection === 'close') {
//             isBotConnected = false;
//             await handleConnectionClose(lastDisconnect, loginMode, phoneNumber, sessionId);
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

// // ====== CONNECTION HANDLERS  ======
// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber, sessionId) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown reason';
    
//     console.log(chalk.red(`\n❌ Connection closed: ${reason} (Status: ${statusCode})`));
    
//     RECONNECT_ATTEMPTS++;
    
//     // Handle logged out/invalid session
//     if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
//         console.log(chalk.yellow('🔓 Logged out. Deleting session folder...'));
        
//         // Delete session completely
//         cleanAuth();
//         RECONNECT_ATTEMPTS = 0;
        
//         console.log(chalk.blue('🔄 Initiating full process restart in 5 seconds...'));
//         await delay(5000);
//         process.exit(1); // Force restart
//     }
    
//     // Handle other errors
//     if (RECONNECT_ATTEMPTS >= MAX_RECONNECT_ATTEMPTS) {
//         console.log(chalk.red(`💥 Max reconnect attempts (${MAX_RECONNECT_ATTEMPTS}) reached.`));
//         console.log(chalk.yellow('🔄 Restarting with fresh session...'));
//         cleanAuth();
//         RECONNECT_ATTEMPTS = 0;
//     }
    
//     const delayTime = Math.min(3000 * RECONNECT_ATTEMPTS, 15000);
//     console.log(chalk.blue(`🔄 Restarting ${loginMode} mode in ${delayTime/1000} seconds... (Attempt ${RECONNECT_ATTEMPTS}/${MAX_RECONNECT_ATTEMPTS})`));
//     setTimeout(() => startBot(loginMode, phoneNumber, sessionId), delayTime);
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
        
//         console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

//         await executeCommand(commandName, sock, msg, args);
//     }
// }

// // ====== GET LOGIN METHOD  ======
// async function getLoginMethod() {
//     const lastMethod = await getLastLoginMethod();
//     if (lastMethod && sessionExists()) {
//         console.log(chalk.yellow(`📂 Last login method detected: ${lastMethod}. Using it automatically.`));
//         return lastMethod;
//     }
    
//     if (!sessionExists() && fs.existsSync(LOGIN_FILE)) {
//         console.log(chalk.yellow('⚠️ Session files missing. Removing old login preference.'));
//         fs.unlinkSync(LOGIN_FILE);
//     }

//     const manager = new LoginManager();
    
//     while (true) {
//         const choice = await manager.showMenu();
        
//         switch (choice) {
//             case '1': // QR
//                 console.log(chalk.blue('\n📲 Starting QR Code mode...'));
//                 manager.close();
//                 await saveLoginMethod('qr');
//                 return { mode: 'qr' };
                
//             case '2': // PAIR
//                 console.log(chalk.blue('\n🔗 Starting Pair Code mode...'));
//                 const phone = await manager.getPhoneNumber();
//                 manager.close();
//                 await saveLoginMethod('pair');
//                 return { mode: 'pair', phoneNumber: phone };
                
//             case '3': // SESSION
//                 console.log(chalk.blue('\n🔐 Starting Session ID mode...'));
//                 const sessionID = await manager.getSessionID();
//                 manager.close();
//                 await saveLoginMethod('session');
//                 return { mode: 'session', sessionId: sessionID };
                
//             case '4': // EXIT
//                 console.log(chalk.yellow('\n👋 Exiting...'));
//                 manager.close();
//                 process.exit(0);
                
//             default:
//                 console.log(chalk.red('❌ Invalid option. Please select 1-4.'));
//         }
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         console.log(chalk.blue('\n🚀 LAUNCHING WOLF BOT...'));
        
//         // Check session format first 
//         await checkAndHandleSessionFormat();
        
//         // Check for .env SESSION_ID first (Priority mode)
//         const envSessionID = process.env.SESSION_ID?.trim();
        
//         if (envSessionID && envSessionID.startsWith('SILENT-WOLF:')) {
//             console.log(chalk.magenta('🔥 PRIORITY MODE: Found SESSION_ID in .env'));
            
//             // Force use of new session
//             cleanAuth();
            
//             // Set global and download
//             global.SESSION_ID = envSessionID;
//             await downloadSessionData();
//             await saveLoginMethod('session');
            
//             console.log(chalk.green('✅ Session from .env applied. Starting bot...'));
//             await delay(3000);
//             await startBot('session', null, envSessionID);
//             return;
//         }
        
//         // Normal login flow
//         const loginData = await getLoginMethod();
//         console.log(chalk.gray(`\nStarting with ${loginData.mode === 'qr' ? 'QR Code' : loginData.mode === 'pair' ? 'Pair Code' : 'Session ID'} mode...`));
        
//         await startBot(loginData.mode, loginData.phoneNumber, loginData.sessionId);
        
//     } catch (error) {
//         console.error(chalk.red('💥 FATAL ERROR:'), error);
//         console.log(chalk.blue('🔄 Restarting in 10 seconds...'));
//         await delay(10000);
//         main();
//     }
// }

// // Graceful shutdown
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

// // Start the bot
// main();












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

// CORRECT BAILEYS IMPORT
import makeWASocket from '@whiskeysockets/baileys';
import { useMultiFileAuthState } from '@whiskeysockets/baileys';
import { DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';

import P from 'pino';

// ====== CONFIGURATION ======
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '2.0.0';
const SESSION_DIR = './auth_info_baileys'; // Fixed session directory

// Global variables
let OWNER_NUMBER = null;
let OWNER_JID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
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
        // Execute the command with proper parameters
        await command.execute(sock, msg, args, null, {});
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
            await handleSuccessfulConnection(sock, loginMode, phoneNumber);
        }

        if (connection === 'close') {
            isConnected = false;
            await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
        }
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;

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
        fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));
    } catch (error) {
        console.log(chalk.yellow('⚠️ Could not save owner data'));
    }

    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${OWNER_NUMBER}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'Pair Code' : 'QR Code')}         
╚════════════════════════════════════════════════════════╝
`));

    // Send welcome message to owner
    try {
        await sock.sendMessage(OWNER_JID, {
            text: `🐺 *${BOT_NAME.toUpperCase()} ONLINE*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${loginMode === 'pair' ? 'Pair Code' : 'QR Code'}\n🔥 Status: Ready to Hunt!\n\n📂 Commands loaded: ${commands.size}`
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
    
    try {
        switch (commandName) {
            case 'ping':
                await sock.sendMessage(chatId, { text: '🏓 Pong!' }, { quoted: msg });
                break;
                
            case 'menu':
                await sock.sendMessage(chatId, { 
                    text: `🐺 *${BOT_NAME} MENU*\n\n` +
                          `⚡ *Core Commands*\n` +
                          `• ${PREFIX}ping - Test connection\n` +
                          `• ${PREFIX}menu - Show this menu\n` +
                          `• ${PREFIX}info - Bot information\n` +
                          `• ${PREFIX}owner - Owner details\n\n` +
                          `🔧 *Session Commands*\n` +
                          `• ${PREFIX}session - Session info\n` +
                          `• ${PREFIX}status - Connection status`
                }, { quoted: msg });
                break;
                
            case 'info':
                await sock.sendMessage(chatId, { 
                    text: `🐺 *${BOT_NAME} INFORMATION*\n\n` +
                          `⚙️ Version: ${VERSION}\n` +
                          `💬 Prefix: ${PREFIX}\n` +
                          `👑 Owner: Silent Wolf\n` +
                          `📱 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `🔥 Status: ${isConnected ? 'Online ✅' : 'Offline ❌'}\n` +
                          `📊 Commands: ${commands.size} loaded`
                }, { quoted: msg });
                break;
                
            case 'owner':
                await sock.sendMessage(chatId, { 
                    text: `👑 *BOT OWNER*\n\n` +
                          `🐺 Name: Silent Wolf\n` +
                          `📱 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `⚡ Version: ${VERSION}\n` +
                          `🔧 Status: ${isConnected ? 'Active' : 'Inactive'}`
                }, { quoted: msg });
                break;
                
            case 'session':
                await sock.sendMessage(chatId, { 
                    text: `📁 *SESSION INFORMATION*\n\n` +
                          `📞 Your Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `📁 Directory: ${SESSION_DIR}\n` +
                          `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
                          `🐺 Bot: ${BOT_NAME} v${VERSION}`
                }, { quoted: msg });
                break;
                
            case 'status':
                await sock.sendMessage(chatId, { 
                    text: `📊 *CONNECTION STATUS*\n\n` +
                          `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
                          `📱 Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                          `🐺 Bot: ${BOT_NAME}\n` +
                          `⚡ Version: ${VERSION}`
                }, { quoted: msg });
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