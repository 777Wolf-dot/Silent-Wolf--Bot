
const messageCache = {};

import fs from 'fs';
import P from 'pino';
import qrcode from 'qrcode-terminal';
import { Boom } from '@hapi/boom';
import pkg from '@whiskeysockets/baileys';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeInMemoryStore,
  downloadMediaMessage,
  jidNormalizedUser
} = pkg;

const commands = new Map();

// const antideleteSettings = {};
let banned = {};
let ownerJid = null;

const loadBannedList = () => {
  if (fs.existsSync('./banned.json')) {
    banned = JSON.parse(fs.readFileSync('./banned.json'));
  } else {
    banned = {};
  }
};

const saveBannedList = () => {
  fs.writeFileSync('./banned.json', JSON.stringify(banned, null, 2));
};

// const loadAntideleteSettings = () => {
//   try {
//     const data = fs.readFileSync('./antideleteSettings.json', 'utf-8');
//     Object.assign(antideleteSettings, JSON.parse(data));
//   } catch {}
// };

// const saveAntideleteSettings = () => {
//   fs.writeFileSync('./antideleteSettings.json', JSON.stringify(antideleteSettings, null, 2));
// };

const loadCommandsFromFolder = async (folder) => {
  const files = fs.readdirSync(`./commands/${folder}`).filter(file => file.endsWith('.js'));
  for (const file of files) {
    const command = await import(`./commands/${folder}/${file}`);
    if (!command.default?.name) {
      console.warn(`⚠️ Skipping command without a name: ${file}`);
      continue;
    }
    commands.set(command.default.name, command.default);
    console.log(`📦 Loaded ${folder} command: ${command.default.name}`);
  }
};

const startSock = async () => {
  const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
  const { version } = await fetchLatestBaileysVersion();

  loadBannedList();
  // loadAntideleteSettings();

  const sock = makeWASocket({
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
      ownerJid = sock.user.id;
      console.log('🤖 Bot Owner Detected as:', ownerJid);
    }
  });

  await loadCommandsFromFolder('group');
  await loadCommandsFromFolder('settings');
  await loadCommandsFromFolder('owner');
  await loadCommandsFromFolder('utility');

  sock.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (action === 'add' && banned[id]) {
      for (const user of participants) {
        if (banned[id].includes(user)) {
          console.log(`🚫 Auto-removing banned user: ${user}`);
          await sock.groupParticipantsUpdate(id, [user], 'remove');
          await sock.sendMessage(id, {
            text: `🚫 @${user.split('@')[0]} is *banned* and has been auto-removed.`,
            mentions: [user],
          });
        }
      }
    }
  });

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

  // sock.ev.on('messages.update', async updates => {

  //   for (const update of updates) {
  //     const { key, message } = update;
  //     const jid = key.remoteJid;
  //     const id = key.id;
  //     const participant = key.participant || jid;
  //     const setting = antideleteSettings[jid];

  //     if (!setting?.enabled) continue;

  //     const cachedMsg = messageCache[jid]?.[id];
  //     if (!cachedMsg) continue;

  //     let text = `🗑️ *Antidelete Alert*\nFrom: @${participant.split('@')[0]}\n\nRecovered Message:\n`;

  //     const msgContent = cachedMsg.message?.conversation || cachedMsg.message?.extendedTextMessage?.text || '[Media/Sticker]';
  //     text += msgContent;

  //     const forwardTo = setting.mode === 'chat' ? jid : (ownerJid || participant);
  //     await sock.sendMessage(forwardTo, { text, mentions: [participant] });
  //   }
  // });
   








  const handleCommand = async (commandName, sock, msg, args) => {
    const sender = msg.key.remoteJid;

    try {
      if (commands.has(commandName)) {
        const metadata = sender.endsWith('@g.us') ? await sock.groupMetadata(sender) : {};
        return await commands.get(commandName).execute(sock, msg, args, metadata, banned, saveBannedList, antideleteSettings, saveAntideleteSettings);
      }

      const aiPath = path.join('./commands/ai', `${commandName}.js`);
      if (fs.existsSync(aiPath)) {
        const command = await import(aiPath);
        return await command.default(sock, msg, args);
      }

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

    } catch (err) {
      console.error('❌ Error in command:', err);
      await sock.sendMessage(sender, { text: '🐺 *Even the alpha stumbles...* Try again later.' }, { quoted: msg });
    }
  };
};

startSock();
