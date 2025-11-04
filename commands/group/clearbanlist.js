import fs from 'fs';
const banFile = '../../lib/banned.json';

function saveBans(bans) {
    fs.writeFileSync(banFile, JSON.stringify(bans, null, 2));
}

export default {
    name: 'clearbanlist',
    description: 'Clear all banned users',
    category: 'group',
    async execute(sock, msg) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        if (!isGroup) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        // ✅ Check admin status
        const metadata = await sock.groupMetadata(chatId);
        const senderId = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.some(
            p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!isAdmin) {
            return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
        }

        saveBans([]);
        await sock.sendMessage(chatId, { text: '✅ Ban list has been cleared.' }, { quoted: msg });
    }
};
