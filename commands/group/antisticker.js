import fs from 'fs';

const antiStickerFile = './antisticker.json';

// Load settings
function loadAntiSticker() {
    if (!fs.existsSync(antiStickerFile)) return [];
    return JSON.parse(fs.readFileSync(antiStickerFile, 'utf8'));
}

// Save settings
function saveAntiSticker(data) {
    fs.writeFileSync(antiStickerFile, JSON.stringify(data, null, 2));
}

export default {
    name: 'antisticker',
    description: 'Enable or disable sticker blocking in the group',
    category: 'group',
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        const sender = msg.key.participant;
        const isAdmin = metadata?.participants?.find(p => p.id === sender)?.admin;

        if (!isGroup) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        if (!isAdmin) {
            return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
        }

        let settings = loadAntiSticker();

        if (args[0] === 'on') {
            if (!settings.includes(chatId)) {
                settings.push(chatId);
                saveAntiSticker(settings);
            }
            await sock.sendMessage(chatId, { text: '✅ Anti-sticker is now *enabled* in this group.' }, { quoted: msg });
        } 
        else if (args[0] === 'off') {
            settings = settings.filter(id => id !== chatId);
            saveAntiSticker(settings);
            await sock.sendMessage(chatId, { text: '❌ Anti-sticker is now *disabled* in this group.' }, { quoted: msg });
        } 
        else {
            await sock.sendMessage(chatId, { text: '⚙️ Usage: `.antisticker on` or `.antisticker off`' }, { quoted: msg });
        }

        // Attach listener once
        if (!sock._antiStickerListenerAttached) {
            sock.ev.on('messages.upsert', async ({ messages }) => {
                const newMsg = messages[0];
                const groupId = newMsg.key.remoteJid;

                if (newMsg.key.fromMe) return; // Ignore bot's own messages
                const antiStickerGroups = loadAntiSticker();

                // If anti-sticker is enabled and message is sticker
                if (antiStickerGroups.includes(groupId) && newMsg.message?.stickerMessage) {
                    try {
                        await sock.sendMessage(groupId, { 
                            text: `🚫 Stickers are not allowed here, @${newMsg.key.participant.split('@')[0]}`, 
                            mentions: [newMsg.key.participant] 
                        });
                        await sock.sendMessage(groupId, { delete: newMsg.key });
                    } catch (err) {
                        console.error('Failed to delete sticker:', err);
                    }
                }
            });

            sock._antiStickerListenerAttached = true;
        }
    }
};
