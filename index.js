// ====== IMPORTS ======
import pkg from '@whiskeysockets/baileys';
const {
    default: makeWASocket,
    useMultiFileAuthState,
    DisconnectReason,
    fetchLatestBaileysVersion
} = pkg;

import P from 'pino';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import qrcode from 'qrcode-terminal';

dotenv.config();

// ====== CONFIG ======
const PREFIX = process.env.PREFIX || '.';
console.log(chalk.green('✅ Current PREFIX:'), `"${PREFIX}"`);

const commands = new Map();
const messageCache = {};

// ====== COMMAND LOADER ======
function loadCommandsFromFolder(folderPath) {
    const absolutePath = path.resolve(folderPath);
    fs.readdirSync(absolutePath).forEach((file) => {
        const fullPath = path.join(absolutePath, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            loadCommandsFromFolder(fullPath);
        } else if (file.endsWith('.js')) {
            import(`file://${fullPath}`)
                .then((cmdModule) => {
                    const cmd = cmdModule.default;
                    if (cmd?.name) {
                        commands.set(cmd.name.toLowerCase(), cmd);
                        if (Array.isArray(cmd.alias)) {
                            cmd.alias.forEach(alias => commands.set(alias.toLowerCase(), cmd));
                        }
                        console.log(chalk.blueBright(`✅ Loaded command: ${cmd.name}`));
                    }
                })
                .catch((err) => {
                    console.error(`❌ Failed to load command file: ${file}`, err);
                });
        }
    });
}

// Load commands initially
loadCommandsFromFolder('./commands');

// ====== COMMAND HANDLER ======
async function handleCommand(commandName, sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const command = commands.get(commandName.toLowerCase());

    if (!command) return;

    try {
        let metadata = null;
        if (chatId.endsWith('@g.us')) {
            try {
                metadata = await sock.groupMetadata(chatId);
            } catch (err) {
                console.error(`⚠️ Failed to fetch group metadata for ${chatId}`, err);
            }
        }
        await command.execute(sock, msg, args, metadata);
    } catch (err) {
        console.error(`❌ Error executing ${commandName}:`, err);
        await sock.sendMessage(chatId, { text: `❌ Error running *${commandName}* command.` }, { quoted: msg });
    }
}

// ====== MAIN SOCKET ======
const startSock = async () => {
    const { state, saveCreds } = await useMultiFileAuthState('auth');
    const { version } = await fetchLatestBaileysVersion();

    const sock = makeWASocket({
        version,
        auth: state,
        logger: P({ level: 'silent' }),
        browser: ['Silent Wolf', 'Safari', '1.0']
    });

    // ====== QR CODE HANDLING ======
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;

        if (qr) {
            console.log(chalk.yellow('📲 Scan this QR code to connect:'));
            qrcode.generate(qr, { small: true });
        }

        if (connection === 'close') {
            const reason = lastDisconnect?.error?.output?.statusCode;
            if (reason === DisconnectReason.loggedOut) {
                console.log(chalk.red('❌ Logged out. Please scan the QR again.'));
                fs.rmSync('./auth', { recursive: true, force: true });
                startSock();
            } else {
                console.log(chalk.red(`Connection closed. Reconnecting...`));
                startSock();
            }
        } else if (connection === 'open') {
            console.log(chalk.green('✅ Connected to WhatsApp!'));
        }
    });

    sock.ev.on('creds.update', saveCreds);

    // ====== MESSAGE LISTENER ======
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        const msg = messages[0];
        if (!msg.message) return;

        if (!messageCache[msg.key.remoteJid]) messageCache[msg.key.remoteJid] = {};
        messageCache[msg.key.remoteJid][msg.key.id] = msg;

        const textMsg =
            msg.message?.conversation ||
            msg.message?.extendedTextMessage?.text;

        const sender = msg.key.remoteJid;

        if (textMsg?.startsWith(PREFIX)) {
            const parts = textMsg.trim().slice(PREFIX.length).split(/\s+/);
            const commandName = parts[0].toLowerCase();
            const args = parts.slice(1);

            console.log(`📩 Command from ${msg.key.fromMe ? 'SELF 🐺' : sender}: ${textMsg}`);

            if (commandName === 'menu') {
                const imported = await import(`./commands/menus/settingMenu.js?update=${Date.now()}`);
                const getMenu = imported.default || imported;
                const menuText = typeof getMenu === 'function' ? getMenu() : String(getMenu);
                await sock.sendMessage(sender, { text: menuText }, { quoted: msg });
            } else {
                await handleCommand(commandName, sock, msg, args);
            }
        }
    });

    return sock;
};

// Start bot
startSock();
