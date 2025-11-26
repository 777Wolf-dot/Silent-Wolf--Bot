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
import pkg from '@whiskeysockets/baileys';

const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    Browsers
} = pkg;

import P from 'pino';

// ====== CONFIGURATION ======
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '1.0.0';

// Global variables
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
        await command.execute(sock, msg, args, null, {}); // You can pass additional parameters as needed
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
        if (fs.existsSync('./auth')) {
            fs.rmSync('./auth', { recursive: true, force: true });
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

    // For pair mode, always start fresh
    if (loginMode === 'pair') {
        console.log(chalk.yellow('🔄 Starting fresh session for pair code...'));
        cleanAuth();
    }

    // Load or create auth state
    let state, saveCreds;
    try {
        const authState = await useMultiFileAuthState('./auth');
        state = authState.state;
        saveCreds = authState.saveCreds;
        console.log(chalk.green('✅ Auth state loaded'));
    } catch (error) {
        console.error(chalk.red('❌ Auth error:'), error.message);
        return;
    }

    // Fetch latest version
    const { version } = await fetchLatestBaileysVersion();
    console.log(chalk.blue(`📦 Baileys version: ${version}`));

    // Socket configuration
    const socketConfig = {
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
    };

    // Create socket
    const sock = makeWASocket(socketConfig);
    SOCKET_INSTANCE = sock;

    console.log(chalk.cyan('✅ WhatsApp client created successfully'));

    // ====== EVENT HANDLERS ======
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        console.log(chalk.gray(`🔗 Connection state: ${connection || 'undefined'}`));

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
            }, 2000);
        }

        if (connection === 'open') {
            await handleSuccessfulConnection(sock, loginMode, phoneNumber);
        }

        if (connection === 'close') {
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
    
    console.log(chalk.blue('🔄 Restarting in 3 seconds...'));
    setTimeout(() => startBot(loginMode, phoneNumber), 3000);
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
        
        console.log(chalk.magenta(`📩 ${fromNumber} → ${PREFIX}${commandName} ${args.join(' ')}`));

        const commandExecuted = await executeCommand(commandName, sock, msg, args);
        
        
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
        process.exit(1);
    }
}

// Start the application
main().catch(error => {
    console.error(chalk.red('💥 CRITICAL ERROR:'), error);
    process.exit(1);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught Exception:'), error);
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('💥 Unhandled Rejection:'), error);
});

process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Shutting down Wolf Bot...'));
    if (SOCKET_INSTANCE) {
        SOCKET_INSTANCE.ws.close();
    }
    process.exit(0);
});