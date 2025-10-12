import fs from 'fs';
import path from 'path';

// Settings file path (auto-created if missing)
const settingsFile = path.resolve('./disp_settings.json');

// Ensure settings file exists
function ensureFile(file, defaultContent) {
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(defaultContent, null, 2));
}

// Load JSON from file safely
function loadJSON(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return {};
  }
}

// Save JSON to file
function saveJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Convert duration keyword to WhatsApp disappearing messages duration code (seconds)
// WhatsApp supports durations: 0 (off), 86400 (24h), 604800 (7 days), 2592000 (30 days)
const durationMap = {
  off: 0,
  0: 0,
  '24h': 86400,
  day: 86400,
  1: 86400,
  week: 604800,
  7: 604800,
  month: 2592000,
  30: 2592000,
};

export default {
  name: 'disp',
  description: 'Toggle disappearing messages for this chat. Usage: .disp on [duration], .disp off',
  category: 'utility',

  async execute(sock, msg, args, metadata) {
    const chatId = msg.key.remoteJid;
    const isGroup = chatId.endsWith('@g.us');

    // Check admin for groups
    if (isGroup) {
      const senderId = msg.key.participant || msg.key.remoteJid;
      try {
        const meta = metadata || (await sock.groupMetadata(chatId));
        const senderInfo = meta?.participants?.find(p => p.id === senderId);
        const isAdmin = senderInfo && (senderInfo.admin === 'admin' || senderInfo.admin === 'superadmin');
        if (!isAdmin) {
          return sock.sendMessage(chatId, { text: '🛑 Only group admins can toggle disappearing messages.' }, { quoted: msg });
        }
      } catch (err) {
        console.error('disp: failed to fetch group metadata', err);
        return sock.sendMessage(chatId, { text: '⚠️ Could not verify admin status. Try again later.' }, { quoted: msg });
      }
    }

    ensureFile(settingsFile, {});
    const settings = loadJSON(settingsFile);

    if (!args.length) {
      // Show current status
      const currentDuration = settings[chatId];
      const currentLabel = Object.entries(durationMap).find(([, v]) => v === currentDuration)?.[0] || 'off';
      return sock.sendMessage(chatId, {
        text: `📌 Disappearing messages are currently *${currentLabel}*.\n\nUsage:\n• .disp on [duration]\n• .disp off\n\nSupported durations: off, 24h, week, month`,
      }, { quoted: msg });
    }

    const action = args[0].toLowerCase();

    if (action === 'off') {
      try {
        await sock.sendMessage(chatId, { disappearingMessagesInChat: 0 });
        delete settings[chatId];
        saveJSON(settingsFile, settings);
        return sock.sendMessage(chatId, { text: '✅ Disappearing messages turned OFF for this chat.' }, { quoted: msg });
      } catch (err) {
        console.error('disp off error:', err);
        return sock.sendMessage(chatId, { text: '❌ Failed to disable disappearing messages.' }, { quoted: msg });
      }
    }

    if (action === 'on') {
      let durArg = args[1] ? args[1].toLowerCase() : '24h'; // default 24h
      if (!(durArg in durationMap)) {
        return sock.sendMessage(chatId, { text: '❌ Invalid duration. Supported: off, 24h, week, month' }, { quoted: msg });
      }

      const durationSeconds = durationMap[durArg];

      try {
        await sock.sendMessage(chatId, { disappearingMessagesInChat: durationSeconds });
        settings[chatId] = durationSeconds;
        saveJSON(settingsFile, settings);
        return sock.sendMessage(chatId, { text: `✅ Disappearing messages turned ON (${durArg}) for this chat.` }, { quoted: msg });
      } catch (err) {
        console.error('disp on error:', err);
        return sock.sendMessage(chatId, { text: '❌ Failed to enable disappearing messages.' }, { quoted: msg });
      }
    }

    return sock.sendMessage(chatId, { text: '❌ Invalid usage. Use `.disp on [duration]` or `.disp off`.' }, { quoted: msg });
  }
};
