import makeWASocket, {
  DisconnectReason,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  downloadMediaMessage,
} from '@whiskeysockets/baileys';

import P from 'pino';
import qrcode from 'qrcode-terminal';
import fs from 'fs';
import path from 'path';

const commands = new Map();
let banned = {};

const loadBannedList = () => {
  try {
    banned = JSON.parse(fs.readFileSync('./banned.json', 'utf-8'));
  } catch {
    banned = {};
  }
};

const saveBannedList = () => {
  fs.writeFileSync('./banned.json', JSON.stringify(banned, null, 2));
};

const loadCommandsFromFolder = async (folder) => {
  const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = await import(`./commands/${folder}/${file}`);
    commands.set(command.default.name, command.default);
    console.log(`📦 Loaded ${folder} command: ${command.default.name}`);
  }
};

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();
  loadBannedList();

  const sock = makeWASocket.default({
    version,
    auth: state,
    logger: P({ level: 'silent' }),
  });

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });
    if (connection === 'close') {
      const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
      if (shouldReconnect) startSock();
    } else if (connection === 'open') {
      console.log('✅ Bot connected successfully!');
    }
  });

  await loadCommandsFromFolder('group');
  await loadCommandsFromFolder('settings');
  await loadCommandsFromFolder('owner');

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action === 'add') {
      for (const user of participants) {
        if (banned[id]?.includes(user)) {
          console.log(`🚫 ${user} is banned. Removing from ${id}`);
          await sock.groupParticipantsUpdate(id, [user], 'remove');
        }
      }
    }
  });

  const handleCommand = async (commandName, sock, msg, args) => {
    const sender = msg.key.remoteJid;

    try {
      // Group, Setting, and Owner Commands
      if (commands.has(commandName)) {
        const metadata = sender.endsWith('@g.us') ? await sock.groupMetadata(sender) : {};
        return await commands.get(commandName).execute(sock, msg, args, metadata, banned, saveBannedList);
      }

      // AI Commands
      const aiPath = path.join('./commands/ai', `${commandName}.js`);
      if (fs.existsSync(aiPath)) {
        const command = await import(aiPath);
        return await command.default(sock, msg, args);
      }

      // Audio Commands
      const audioPath = path.join('./commands/audio', `${commandName}.js`);
      if (fs.existsSync(audioPath)) {
        const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        if (!quoted || (!quoted.audioMessage && !msg.message.audioMessage)) {
          return await sock.sendMessage(sender, { text: '🐺 Quote or send an audio file to apply audio effects.' }, { quoted: msg });
        }

        const stream = await downloadMediaMessage(
          msg.message.audioMessage ? msg : msg.message.extendedTextMessage.contextInfo,
          'buffer', {}, { logger: P({ level: 'silent' }) }
        );

        const inputPath = `./temp/audio-${Date.now()}.mp3`;
        fs.writeFileSync(inputPath, stream);

        const command = await import(audioPath);
        await command.default(sock, msg, inputPath);
        return;
      }

      await sock.sendMessage(sender, { text: '❓ *Unknown command.* Try *.menu*' }, { quoted: msg });

    } catch (err) {
      console.error('❌ Error in command:', err);
      await sock.sendMessage(sender, { text: '🐺 *Even the alpha stumbles...* Try again later.' }, { quoted: msg });
    }
  };

  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message) return;

    const textMsg =
      msg.message?.conversation ||
      msg.message?.extendedTextMessage?.text;

    const sender = msg.key.remoteJid;

    if (textMsg?.startsWith('.')) {
      const parts = textMsg.trim().slice(1).split(/\s+/);
      const commandName = parts[0].toLowerCase();
      const args = parts.slice(1);

      console.log(`📩 Command from ${msg.key.fromMe ? 'SELF 🐺' : sender}: ${textMsg}`);

      if (commandName === 'menu') {
        const menuText = (await import('./commands/menus/settingMenu.js')).default();
        await sock.sendMessage(sender, { text: menuText }, { quoted: msg });
      } else {
        await handleCommand(commandName, sock, msg, args);
      }
    }
  });
};

startSock();
