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




















// index.js — Silent Wolf (SESSION_ID support, Heroku-ready)
// Paste this file into your project root (ESM). Node 18+ recommended.

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import moment from 'moment';
import pkg from '@whiskeysockets/baileys';
import P from 'pino';

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
  Browsers
} = pkg;

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '1.0.0';

let OWNER_NUMBER = null;
let OWNER_JID = null;
let SOCKET_INSTANCE = null;

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
╚════════════════════════════════════════════════╝
`));

// ----------------- Command loader -----------------
const commands = new Map();

async function loadCommandsFromFolder(folderPath) {
  try {
    const absolutePath = path.resolve(folderPath);
    if (!fs.existsSync(absolutePath)) {
      console.log(chalk.yellow(`📁 Commands folder not found: ${absolutePath}`));
      return;
    }
    const items = fs.readdirSync(absolutePath);
    for (const item of items) {
      const fullPath = path.join(absolutePath, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        await loadCommandsFromFolder(fullPath);
      } else if (item.endsWith('.js')) {
        try {
          const cmdModule = await import(`file://${fullPath}`);
          const cmd = cmdModule.default;
          if (cmd && cmd.name) {
            commands.set(cmd.name.toLowerCase(), cmd);
            console.log(chalk.green(`✅ Loaded command: ${cmd.name}`));
            if (Array.isArray(cmd.alias)) {
              cmd.alias.forEach(a => {
                commands.set(a.toLowerCase(), cmd);
                console.log(chalk.gray(`   ↳ Alias: ${a}`));
              });
            }
          }
        } catch (err) {
          console.error(chalk.red(`❌ Failed to load command ${item}:`), err?.message || err);
        }
      }
    }
  } catch (err) {
    console.error(chalk.red(`❌ Error reading commands folder ${folderPath}:`), err?.message || err);
  }
}

async function executeCommand(commandName, sock, msg, args) {
  const cmd = commands.get(commandName.toLowerCase());
  if (!cmd) return false;
  try {
    await cmd.execute(sock, msg, args, null, {});
    return true;
  } catch (err) {
    console.error(chalk.red(`❌ Error executing command ${commandName}:`), err);
    try { await sock.sendMessage(msg.key.remoteJid, { text: `❌ Error running *${commandName}*.` }, { quoted: msg }); } catch(e){}
    return false;
  }
}

// ----------------- Session helpers -----------------

// If SESSION_TOKEN_EXCHANGE_URL is set, POST { token } to it to get back JSON or { session: "<string>" }.
// Set SESSION_API_KEY for Authorization header if needed.
async function exchangeTokenForSession(token) {
  const url = process.env.SESSION_TOKEN_EXCHANGE_URL;
  if (!url) return null;
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.SESSION_API_KEY) headers['Authorization'] = `Bearer ${process.env.SESSION_API_KEY}`;
    const resp = await fetch(url, { method: 'POST', headers, body: JSON.stringify({ token }) });
    if (!resp.ok) {
      console.warn(chalk.yellow(`⚠️ Session exchange HTTP ${resp.status}`));
      return null;
    }
    const contentType = resp.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const j = await resp.json();
      // Return the nested session if present
      if (j.session) return j.session;
      if (j.data && (j.data.session || j.data.creds)) {
        return j.data.session || j.data;
      }
      // If j itself contains creds/keys, return that object
      if (j.creds || j.keys) return j;
      // try to find first long string
      for (const v of Object.values(j)) if (typeof v === 'string' && v.length > 20) return v;
      return null;
    } else {
      const text = (await resp.text()).trim();
      return text.length ? text : null;
    }
  } catch (err) {
    console.warn(chalk.yellow('⚠️ Error exchanging session token:'), err?.message || err);
    return null;
  }
}

function tryReadLocalSessionFiles() {
  // session.json
  const sj = path.join(__dirname, 'session.json');
  if (fs.existsSync(sj)) {
    const raw = fs.readFileSync(sj, 'utf8').trim();
    if (raw) return raw;
  }
  // session.txt
  const st = path.join(__dirname, 'session.txt');
  if (fs.existsSync(st)) {
    const raw = fs.readFileSync(st, 'utf8').trim();
    if (raw) return raw;
  }
  return null;
}

// Convert a session string (JSON or base64(JSON) or file path) to ./auth multi-file layout
async function convertSessionStringToAuth(sessionString) {
  if (!sessionString || typeof sessionString !== 'string') throw new Error('Empty session string');

  let sessionData = null;

  // 1) if path to file on disk
  if (fs.existsSync(sessionString)) {
    const raw = fs.readFileSync(sessionString, 'utf8');
    try { sessionData = JSON.parse(raw); } catch (e) { throw new Error('Session file exists but is not valid JSON'); }
  } else {
    // 2) try parse as JSON
    try { sessionData = JSON.parse(sessionString); } catch (e1) {
      // 3) try base64 decode then parse
      try {
        const dec = Buffer.from(sessionString, 'base64').toString('utf8');
        sessionData = JSON.parse(dec);
      } catch (e2) {
        sessionData = null;
      }
    }
  }

  if (!sessionData || (!sessionData.creds && !sessionData.keys)) {
    throw new Error('Session string is not a valid Baileys auth state (JSON or base64 JSON).');
  }

  const authDir = path.join(__dirname, 'auth');
  if (!fs.existsSync(authDir)) fs.mkdirSync(authDir, { recursive: true });

  // write creds.json
  if (sessionData.creds) {
    fs.writeFileSync(path.join(authDir, 'creds.json'), JSON.stringify(sessionData.creds, null, 2), 'utf8');
  }

  // write keys into a keys folder (best-effort)
  const keysDir = path.join(authDir, 'keys');
  if (!fs.existsSync(keysDir)) fs.mkdirSync(keysDir, { recursive: true });

  if (sessionData.keys && typeof sessionData.keys === 'object') {
    for (const [k, v] of Object.entries(sessionData.keys)) {
      const safe = k.replace(/[\/\\]/g, '_');
      fs.writeFileSync(path.join(keysDir, `${safe}.json`), JSON.stringify(v, null, 2), 'utf8');
    }
  }

  // Return multi-file auth state using ./auth
  return await useMultiFileAuthState(authDir);
}

// If token looks like an opaque "wolf_xxx_..." string we try to exchange it
async function obtainAuthStateFromProvidedSession(sessionString) {
  // Try direct JSON or base64 first
  try {
    return await convertSessionStringToAuth(sessionString);
  } catch (err) {
    // not JSON/base64 — attempt exchange if configured
    console.log(chalk.gray('🔎 Provided session looks like an opaque token — attempting to exchange via SESSION_TOKEN_EXCHANGE_URL (if set)'));
    const exchanged = await exchangeTokenForSession(sessionString);
    if (!exchanged) throw new Error('Token exchange failed or no exchange URL configured.');
    // exchanged may be JSON string or object or base64
    if (typeof exchanged === 'object') {
      // stringify to pass through convertSessionStringToAuth
      return await convertSessionStringToAuth(JSON.stringify(exchanged));
    } else {
      return await convertSessionStringToAuth(String(exchanged));
    }
  }
}

// ----------------- Bot startup -----------------
async function startBot({ sessionString = null, loginMode = 'session', phoneNumber = null } = {}) {
  console.log(chalk.magenta('\n🔧 Initializing WhatsApp connection...'));

  // load commands
  console.log(chalk.blue('📂 Loading commands...'));
  await loadCommandsFromFolder('./commands');
  console.log(chalk.green(`✅ Loaded ${commands.size} commands`));

  let state, saveCreds;

  try {
    if (loginMode === 'session' && sessionString) {
      const authState = await obtainAuthStateFromProvidedSession(sessionString);
      state = authState.state;
      saveCreds = authState.saveCreds;
      console.log(chalk.green('✅ Session auth state ready (from SESSION_ID)'));
    } else {
      const authState = await useMultiFileAuthState(path.join(__dirname, 'auth'));
      state = authState.state;
      saveCreds = authState.saveCreds;
      console.log(chalk.green('✅ Auth state loaded from ./auth (multi-file)'));
    }
  } catch (err) {
    console.error(chalk.red('❌ Auth error:'), err?.message || err);
    if (loginMode === 'session') {
      console.log(chalk.yellow('💡 Failed to load provided session — falling back to QR mode (if interactive)'));
      // If running on Heroku, we should not fall back to interactive — just exit with error
      if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
        console.error(chalk.red('❌ Production environment detected and session loading failed. Exiting.'));
        process.exit(1);
      }
      // else try interactive QR
      return startBot({ loginMode: 'qr' });
    }
    return;
  }

  // fetch baileys version
  const { version } = await fetchLatestBaileysVersion();
  console.log(chalk.blue(`📦 Baileys version: ${version}`));

  const sock = makeWASocket({
    version,
    logger: P({ level: 'silent' }),
    browser: Browsers.ubuntu('Chrome'),
    printQRInTerminal: false,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
    },
    markOnlineOnConnect: true,
    generateHighQualityLinkPreview: true,
  });

  SOCKET_INSTANCE = sock;

  sock.ev.on('connection.update', async (update) => {
    const { connection, qr, lastDisconnect } = update;
    console.log(chalk.gray(`🔗 Connection update: ${connection || 'unknown'}`));

    if (qr && loginMode === 'qr') {
      console.log(chalk.yellow('\n📲 QR Code Generated - Scan to connect:\n'));
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      const now = moment().format('h:mm:ss A');
      OWNER_JID = sock.user.id;
      OWNER_NUMBER = OWNER_JID.split('@')[0];
      try { fs.writeFileSync(path.join(__dirname, 'owner.json'), JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2)); } catch(e){}
      console.log(chalk.greenBright(`🐺 ${BOT_NAME} connected as ${OWNER_NUMBER} at ${now}`));
      try { await sock.sendMessage(OWNER_JID, { text: `🐺 ${BOT_NAME} is online — ${now}` }); } catch(e){}
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      console.log(chalk.red(`❌ Connection closed. Status: ${statusCode || 'unknown'}`));
      if (statusCode === DisconnectReason.loggedOut || statusCode === 401 || statusCode === 403) {
        console.log(chalk.yellow('🔓 Logged out — clearing auth state and exiting'));
        // clear auth so future restarts won't try invalid creds
        try { fs.rmSync(path.join(__dirname, 'auth'), { recursive: true, force: true }); } catch(e){}
        process.exit(1);
      }
      console.log(chalk.blue('🔄 Reconnecting in 3s...'));
      setTimeout(async () => {
        try { await startBot({ sessionString, loginMode, phoneNumber }); } catch(e){ console.error(e); }
      }, 3000);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || msg.message.imageMessage?.caption || msg.message.videoMessage?.caption || '';
    if (!text) return;
    if (!text.startsWith(PREFIX)) return;
    const parts = text.slice(PREFIX.length).trim().split(/\s+/);
    const name = parts[0].toLowerCase();
    const args = parts.slice(1);
    console.log(chalk.magenta(`📩 ${msg.key.remoteJid} → ${PREFIX}${name} ${args.join(' ')}`));
    await executeCommand(name, sock, msg, args);
  });

  return sock;
}

// --------------- Startup: read session and launch ---------------
async function findAndStart() {
  try {
    // 1) explicit SESSION_ID env var
    if (process.env.SESSION_ID && process.env.SESSION_ID.trim().length > 0) {
      const s = process.env.SESSION_ID.trim();
      console.log(chalk.gray('🔎 Found SESSION_ID env var — attempting to use it'));
      await startBot({ sessionString: s, loginMode: 'session' });
      return;
    }

    // 2) If SESSION_TOKEN_EXCHANGE_URL present, try to fetch using an env token variable name
    // (this is optional; many users set SESSION_ID directly)
    if (process.env.SESSION_TOKEN_EXCHANGE_URL && process.env.SESSION_TOKEN && process.env.SESSION_TOKEN.trim().length > 0) {
      console.log(chalk.gray('🔎 Attempting to exchange SESSION_TOKEN via SESSION_TOKEN_EXCHANGE_URL...'));
      const exchanged = await exchangeTokenForSession(process.env.SESSION_TOKEN.trim());
      if (exchanged) {
        await startBot({ sessionString: exchanged, loginMode: 'session' });
        return;
      } else {
        console.warn(chalk.yellow('⚠️ Exchange did not return a usable session'));
      }
    }

    // 3) local session files (session.json / session.txt)
    const local = tryReadLocalSessionFiles();
    if (local) {
      console.log(chalk.gray('🔎 Found local session file — using it'));
      await startBot({ sessionString: local, loginMode: 'session' });
      return;
    }

    // 4) fall back to interactive QR/pair (only for local use)
    console.log(chalk.gray('🔎 No session found — falling back to interactive login (QR/Pair)'));
    if (process.env.NODE_ENV === 'production' || process.env.HEROKU) {
      console.error(chalk.red('❌ No usable session found in production environment. Set SESSION_ID (full JSON/base64) or provide SESSION_TOKEN_EXCHANGE_URL to convert your token.'));
      process.exit(1);
    }

    // interactive fallback for local dev
    const readlineSync = await import('readline');
    const rl = readlineSync.createInterface({ input: process.stdin, output: process.stdout });
    const ask = (q) => new Promise(res => rl.question(q, res));
    console.log(chalk.yellow('\n🐺 LOGIN OPTIONS:\n1) QR Code (default)\n2) Pair Code\n'));
    const ans = (await ask('Enter 1 or 2 (default 1): ')).trim();
    rl.close();
    if (ans === '2') {
      const phone = (await ask('Enter phone (e.g. 2547...): ')).trim().replace(/\D/g, '');
      await startBot({ loginMode: 'pair', phoneNumber: phone });
    } else {
      await startBot({ loginMode: 'qr' });
    }
  } catch (err) {
    console.error(chalk.red('💥 Fatal error at startup:'), err);
    process.exit(1);
  }
}

findAndStart();

// --------------- Graceful shutdown ----------------
process.on('SIGINT', async () => {
  console.log(chalk.yellow('\n👋 Shutting down Wolf Bot...'));
  try { if (SOCKET_INSTANCE?.ws) SOCKET_INSTANCE.ws.close(); } catch(e){}
  process.exit(0);
});

process.on('uncaughtException', (err) => {
  console.error(chalk.red('💥 Uncaught Exception:'), err);
});
process.on('unhandledRejection', (err) => {
  console.error(chalk.red('💥 Unhandled Rejection:'), err);
});
