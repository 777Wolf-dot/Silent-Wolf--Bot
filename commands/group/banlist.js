import fs from 'fs';
const banFile = '../../lib/banned.json';

function loadBans() {
    try {
        if (!fs.existsSync(banFile)) return [];
        const data = JSON.parse(fs.readFileSync(banFile, 'utf8'));
        return Array.isArray(data) ? data : [];
    } catch {
        return [];
    }
}

export default {
    name: 'banlist',
    description: 'Show all banned users in this group',
    category: 'group',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        if (!isGroup) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        // ✅ Admin check
        const metadata = await sock.groupMetadata(chatId);
        const senderId = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.some(
            p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!isAdmin) {
            return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
        }

        const bans = loadBans();
        if (bans.length === 0) {
            return sock.sendMessage(chatId, { text: '📭 No banned users.' }, { quoted: msg });
        }

        let text = `🚫 *Banned Users List (${bans.length})*\n\n`;
        text += bans.map((jid, i) => `${i + 1}. @${jid.split('@')[0]}`).join('\n');

        await sock.sendMessage(chatId, { 
            text, 
            mentions: bans 
        }, { quoted: msg });
    }
};
