import fs from 'fs';
const banFile = './lib/banned.json';


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
    name: 'ban',
    description: 'Ban a user from the group',
    category: 'group',
    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');

        if (!isGroup) {
            return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
        }

        // ✅ Get group metadata to check admin status
        const metadata = await sock.groupMetadata(chatId);
        const senderId = msg.key.participant || msg.participant || msg.key.remoteJid;
        const isAdmin = metadata.participants.some(
            p => p.id === senderId && (p.admin === 'admin' || p.admin === 'superadmin')
        );

        if (!isAdmin) {
            return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
        }

        const mentionedJid = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0];
        if (!mentionedJid) {
            return sock.sendMessage(chatId, { text: '⚠️ Please mention the user you want to ban.' }, { quoted: msg });
        }

        let bans = loadBans();
        if (!bans.includes(mentionedJid)) {
            bans.push(mentionedJid);
            saveBans(bans);
        }

        try {
            await sock.groupParticipantsUpdate(chatId, [mentionedJid], 'remove');
            await sock.sendMessage(chatId, { 
                text: `🚫 @${mentionedJid.split('@')[0]} has been banned!`, 
                mentions: [mentionedJid] 
            });
        } catch (err) {
            console.error('Ban error:', err);
            await sock.sendMessage(chatId, { text: '❌ Failed to ban user.' }, { quoted: msg });
        }

        // ===== AUTO-KICK HOOK (attach once) =====
        if (!sock._banListenerAttached) {
            sock.ev.on('group-participants.update', async (update) => {
                const bansList = loadBans();
                if (update.action === 'add') {
                    for (const participant of update.participants) {
                        if (bansList.includes(participant)) {
                            console.log(`🚫 Auto-kicking banned user ${participant}`);
                            try {
                                await sock.groupParticipantsUpdate(update.id, [participant], 'remove');
                                await sock.sendMessage(update.id, { 
                                    text: `🚫 @${participant.split('@')[0]} is banned and has been removed.`,
                                    mentions: [participant]
                                });
                            } catch (err) {
                                console.error('Auto-kick error:', err);
                            }
                        }
                    }
                }
            });
            sock._banListenerAttached = true;
        }
    }
};
