// commands/group/setdesc.js

export default {
  name: 'setdesc',
  execute: async (sock, msg, args, metadata) => {
    const jid = msg.key.remoteJid;
    const text = args.join(' ');

    if (!jid.endsWith('@g.us')) {
      return sock.sendMessage(jid, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
    }

    if (!text) {
      return sock.sendMessage(jid, { text: '✏️ Please provide a description to set.\nUsage: `.setdesc Your new group description`' }, { quoted: msg });
    }

    try {
      await sock.groupUpdateDescription(jid, text);
      await sock.sendMessage(jid, { text: '📝 Group description updated successfully!' }, { quoted: msg });
    } catch (err) {
      console.error('❌ setdesc error:', err);
      await sock.sendMessage(jid, { text: '❌ Failed to update group description.' }, { quoted: msg });
    }
  }
};
