export default {
    name: 'revoke',
    alias: [],
    description: 'Revoke the group invite link',
    async execute(sock, msg, args) {
        const jid = msg.key.remoteJid;

        // Check if it's a group
        if (!jid.endsWith('@g.us')) {
            await sock.sendMessage(jid, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
            return;
        }

        try {
            // Fetch group metadata
            const groupMetadata = await sock.groupMetadata(jid);

            if (!groupMetadata?.participants) {
                await sock.sendMessage(jid, { text: '⚠️ Could not fetch group participants.' }, { quoted: msg });
                return;
            }

            // Ensure the user is an admin
            const sender = msg.key.participant || jid;
            const isAdmin = groupMetadata.participants.some(
                p => p.id === sender && ['admin', 'superadmin'].includes(p.admin)
            );

            if (!isAdmin) {
                await sock.sendMessage(jid, { text: '❌ Only group admins can use this command.' }, { quoted: msg });
                return;
            }

            // Revoke invite link
            await sock.groupRevokeInvite(jid);
            await sock.sendMessage(jid, { text: '✅ Group invite link has been revoked.' });
        } catch (err) {
            console.error('Error in revoke command:', err);
            await sock.sendMessage(jid, { text: '❌ Failed to revoke group link.' }, { quoted: msg });
        }
    }
};
