import fs from 'fs';
const banFile = '../../lib/banned.json';

// ===== Helper functions =====
function loadBans() {
    try {
        if (!fs.existsSync(banFile)) return [];
        const data = JSON.parse(fs.readFileSync(banFile, 'utf8'));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

function saveBans(bans) {
    fs.writeFileSync(banFile, JSON.stringify(bans, null, 2));
}

export default {
    name: 'unban',
    description: 'Unban a user from the group ban list',
    category: 'group',
    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        if (!isGroup) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        // ✅ Check admin status from metadata
        const metadata = await sock.groupMetadata(chatId);
        const senderId = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.some(
            p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!isAdmin) {
            return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
        }

        // ===== Get target user =====
        let targetJid;

        // 1️⃣ Mentioned user
        if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0]) {
            targetJid = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
        }

        // 2️⃣ Reply to a message
        else if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
            targetJid = msg.message.extendedTextMessage.contextInfo.participant;
        }

        // 3️⃣ Number provided as argument
        else if (args[0]) {
            let num = args[0].replace(/[^0-9]/g, ''); // Remove non-digits
            if (num.length < 8) {
                return sock.sendMessage(chatId, { text: '⚠️ Invalid number format.' }, { quoted: msg });
            }
            if (!num.endsWith('@s.whatsapp.net')) {
                num += '@s.whatsapp.net';
            }
            targetJid = num;
        }

        if (!targetJid) {
            return sock.sendMessage(chatId, { text: '⚠️ Please tag, reply, or provide a number to unban.' }, { quoted: msg });
        }

        let bans = loadBans();
        if (bans.includes(targetJid)) {
            bans = bans.filter(id => id !== targetJid);
            saveBans(bans);
            await sock.sendMessage(chatId, { 
                text: `✅ @${targetJid.split('@')[0]} has been unbanned!`,
                mentions: [targetJid]
            }, { quoted: msg });
        } else {
            await sock.sendMessage(chatId, { 
                text: `ℹ️ @${targetJid.split('@')[0]} is not banned.`,
                mentions: [targetJid]
            }, { quoted: msg });
        }
    }
};
