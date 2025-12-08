export const name = 'ping';
export const category = 'Utility';
export const description = 'Check bot response time';
export const alias = ['pong', 'test'];
export const execute = async (sock, msg, args, metadata) => {
    const start = Date.now();
    await sock.sendMessage(msg.key.remoteJid, { text: '🏓 Pong!' }, { quoted: msg });
    const latency = Date.now() - start;
    await sock.sendMessage(msg.key.remoteJid, { 
        text: `📶 Response Time: ${latency}ms\n⚡ Bot is running smoothly!`
    });
};