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
// // Owner: +254788710904 🐺

// import menu from './commands/menus/menu.js';
// import { withPerformance } from './commands/speed/performanceWrapper.js';
// import { loadImages, images } from './commands/speed/imageLoader.js';
// import { saveSession, loadSession } from './supabase.js'; // <-- Supabase integration

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
// const OWNER_NUMBER = '254788710904';
// const OWNER_JID = `${OWNER_NUMBER}@s.whatsapp.net`;
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '1.0.0';

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ONLINE MODE')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   👑 Owner   : +${OWNER_NUMBER}
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
//     // Attempt to load session from Supabase
//     let supaState = await loadSession('main'); // 'main' is session name
//     let state, saveCreds;

//     if (supaState) {
//         console.log(chalk.green('✅ Loaded session from Supabase!'));
//         state = supaState;
//         saveCreds = async () => await saveSession('main', state); // save updates to Supabase
//     } else {
//         const localState = await useMultiFileAuthState('auth'); // fallback local
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

//             console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
// ╚════════════════════════════════════════════════════════╝
// `));

//             // 📨 Send DM to Owner
//             try {
//                 await sock.sendMessage(OWNER_JID, {
//                     text: `╔══════════════╗
// ║ 🐺 *${BOT_NAME.toUpperCase()} ONLINE*                            
// ╠══════════════╣
// ║ ✅ *Connected successfully!*                        
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

//     // ====== MESSAGES ======
//     sock.ev.on('messages.upsert', async ({ messages, type }) => {
//         if (type !== 'notify') return;
//         const msg = messages[0];
//         if (!msg.message) return;

//         const chatId = msg.key.remoteJid;
//         const sender = msg.key.participant || msg.key.remoteJid;
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
//             if (err.message.includes('Bad MAC')) {
//                 console.warn(`⚠️ Failed to decrypt message from ${chatId} due to session mismatch.`);
//             } else if (err.message.includes('Closing open session')) {
//                 console.info(`ℹ️ Session replaced by new prekey bundle for ${chatId}.`);
//             } else {
//                 console.error(`❌ Error executing ${commandName}:`, err);
//                 await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}*.` }, { quoted: msg });
//             }
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
// Owner: Auto-detected 🐺

import menu from './commands/menus/menu.js';
import { withPerformance } from './commands/speed/performanceWrapper.js';
import { loadImages, images } from './commands/speed/imageLoader.js';
import { saveSession, loadSession } from './supabase.js'; // <-- Supabase integration

import pkg from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore
} = pkg;

import P from 'pino';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';
import readline from 'readline';
import moment from 'moment'; // for time formatting

dotenv.config();

// ====== CONFIG ======
const PREFIX = process.env.PREFIX || '.';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '1.0.0';

// 🐺 AUTO OWNER UPDATE - load previous owner if saved
let OWNER_NUMBER = null;
let OWNER_JID = null;

if (fs.existsSync('./owner.json')) {
    const data = JSON.parse(fs.readFileSync('./owner.json'));
    OWNER_NUMBER = data.OWNER_NUMBER;
    OWNER_JID = data.OWNER_JID;
}

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ONLINE MODE')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
║   👑 Owner   : ${OWNER_NUMBER ? '+' + OWNER_NUMBER : chalk.yellow('Not yet linked')}
╚════════════════════════════════════════════════╝
`));

const commands = new Map();
const messageCache = {};

// ====== LOAD COMMANDS ======
function loadCommandsFromFolder(folderPath) {
    const absolutePath = path.resolve(folderPath);
    fs.readdirSync(absolutePath).forEach((file) => {
        const fullPath = path.join(absolutePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommandsFromFolder(fullPath);
        } else if (file.endsWith('.js')) {
            import(`file://${fullPath}?v=${Date.now()}`)
                .then((cmdModule) => {
                    let cmd = cmdModule.default;
                    if (cmd?.name) {
                        cmd = withPerformance(cmd);
                        commands.set(cmd.name.toLowerCase(), cmd);
                        if (Array.isArray(cmd.alias)) {
                            cmd.alias.forEach(alias =>
                                commands.set(alias.toLowerCase(), cmd)
                            );
                        }
                    }
                })
                .catch((err) => {
                    console.error(`❌ Failed to load command: ${file}`, err);
                });
        }
    });
}

loadCommandsFromFolder('./commands');

// ====== HANDLE COMMANDS ======
async function handleCommand(commandName, sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const command = commands.get(commandName.toLowerCase());
    if (!command) return;

    try {
        let metadata = null;
        if (chatId.endsWith('@g.us')) {
            try {
                metadata = await sock.groupMetadata(chatId);
            } catch {
                console.warn(`⚠️ Failed to fetch group metadata for ${chatId}`);
            }
        }
        await command.execute(sock, msg, args, metadata, images);
    } catch (err) {
        console.error(`❌ Error executing ${commandName}:`, err);
        await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}*.` }, { quoted: msg });
    }
}

// ====== START SOCKET WITH SUPABASE SESSION ======
async function startSock(mode = 'qr', phoneNumber = null) {
    let supaState = await loadSession('main');
    let state, saveCreds;

    if (supaState) {
        console.log(chalk.green('✅ Loaded session from Supabase!'));
        state = supaState;
        saveCreds = async () => await saveSession('main', state);
    } else {
        const localState = await useMultiFileAuthState('auth');
        state = localState.state;
        saveCreds = localState.saveCreds;
    }

    const { version } = await fetchLatestBaileysVersion();

    console.log(chalk.magentaBright(`
╔════════════════════════════════════════════════╗
║   🐺 Initializing ${chalk.bold(BOT_NAME.toUpperCase())}...                   
║   ⚙️ Preparing secure connection to WhatsApp...    
║   🚀 Version: ${VERSION} | Browser: Chrome        
╚════════════════════════════════════════════════╝
`));

    const sock = makeWASocket({
        version,
        logger: P({ level: 'silent' }),
        browser: [BOT_NAME, 'Chrome', VERSION],
        printQRInTerminal: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'silent' })),
        },
    });

    console.log(chalk.cyanBright(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold('WOLF ENGINE ONLINE')}                    
║   🔄 Socket created successfully                  
║   🕸️ Establishing link with WhatsApp servers...  
╚════════════════════════════════════════════════╝
`));

    // ====== CONNECTION HANDLING ======
    sock.ev.on('connection.update', async (update) => {
        const { connection, qr, lastDisconnect } = update;

        if (qr && mode === 'qr') {
            console.log(chalk.yellow('\n📲 Scan this QR to connect your WolfBot:\n'));
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'open') {
            const currentTime = moment().format('h:mm:ss A');

            // 🐺 AUTO OWNER UPDATE — detect the number of the linked account
            OWNER_JID = sock.user.id;
            OWNER_NUMBER = OWNER_JID.split('@')[0];
            fs.writeFileSync('./owner.json', JSON.stringify({ OWNER_NUMBER, OWNER_JID }, null, 2));

            console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${OWNER_NUMBER}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
╚════════════════════════════════════════════════════════╝
`));

            // 📨 Send DM to Owner
            try {
                await sock.sendMessage(OWNER_JID, {
                    text: `╔══════════════╗
║ 🐺 *${BOT_NAME.toUpperCase()} ONLINE*                            
╠══════════════╣
║ ✅ *Connected successfully!*                        
║ 👑 *Owner:* +${OWNER_NUMBER}
║ 📱 *Device:* ${BOT_NAME} - Chrome
║ 🕒 *Time:* ${currentTime}
║ 🔥 *Status:* Ready to Hunt! 
╚══════════════╝`,
                });
            } catch (err) {
                console.log('⚠️ Failed to DM owner:', err);
            }
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            console.log(chalk.red(`\n❌ Connection closed. Reconnecting...\n`));
            if (reason === DisconnectReason.loggedOut) {
                fs.rmSync('./auth', { recursive: true, force: true });
            }
            setTimeout(() => startSock(mode, phoneNumber), 3000);
        }
    });

    sock.ev.on('creds.update', async () => {
        await saveCreds();
        console.log(chalk.green('💾 Credentials updated and saved to Supabase.'));
    });

    // ====== MESSAGES ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message) return;

        const chatId = msg.key.remoteJid;
        const sender = msg.key.participant || msg.key.remoteJid;
        const textMsg =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text ||
            msg.message.imageMessage?.caption ||
            msg.message.videoMessage?.caption ||
            '';

        if (!textMsg.startsWith(PREFIX)) return;

        const parts = textMsg.trim().slice(PREFIX.length).split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);

        console.log(chalk.magenta(`📩 ${chatId} → ${commandName} ${args.join(' ')}`));

        try {
            if (commandName === 'menu') {
                await menu.execute(sock, msg, args, images);
            } else {
                await handleCommand(commandName, sock, msg, args);
            }
        } catch (err) {
            if (err.message.includes('Bad MAC')) {
                console.warn(`⚠️ Failed to decrypt message from ${chatId} due to session mismatch.`);
            } else if (err.message.includes('Closing open session')) {
                console.info(`ℹ️ Session replaced by new prekey bundle for ${chatId}.`);
            } else {
                console.error(`❌ Error executing ${commandName}:`, err);
                await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}*.` }, { quoted: msg });
            }
        }
    });

    // ====== PAIR CODE LOGIN ======
    if (mode === 'pair' && phoneNumber) {
        console.log(chalk.cyan(`\n🔗 Generating Pair Code for ${phoneNumber}...`));
        try {
            const code = await sock.requestPairingCode(phoneNumber);
            console.log(chalk.green(`✅ Pair Code: ${chalk.bold(code)}`));
            console.log(chalk.gray('\n👉 Enter this code on WhatsApp: Linked Devices > Link with phone number.'));
        } catch (err) {
            console.error(chalk.red('❌ Failed to generate pair code:'), err);
        }
    }

    return sock;
}

// ====== LOGIN CHOICE ======
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise((r) => rl.question(q, (ans) => r(ans.trim())));

(async () => {
    await loadImages(); // preload all images first

    console.log(chalk.yellow('\n🐺 WOLF BOT INITIALIZER 🐺'));
    console.log('1) QR Code Login');
    console.log('2) Pair Code Login');
    const choice = await ask('Enter 1 or 2 (default 1): ');
    let mode = 'qr';
    let phone = null;

    if (choice === '2') {
        mode = 'pair';
        const num = await ask('📱 Enter your WhatsApp number (e.g., 2547XXXXXXX): ');
        phone = num.replace(/\s+/g, '');
    }

    console.log(chalk.gray('\nStarting WolfBot...'));
    await startSock(mode, phone);
})();
