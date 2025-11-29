// ====== CANCEL PAIRING SESSION COMMAND ======
// Cancels an active pairing session

import chalk from 'chalk';

export default {
    name: 'cancelpair',
    alias: ['stoppair', 'removepair'],
    description: 'Cancel an active pairing session',
    category: 'utility',
    
    async execute(sock, msg, args) {
        const chatId = msg.key.remoteJid;
        
        try {
            if (!global.pairingSessions || global.pairingSessions.size === 0) {
                await sock.sendMessage(chatId, { 
                    text: `❌ *No Active Sessions*\n\nNo active pairing sessions to cancel.`
                }, { quoted: msg });
                return;
            }

            if (args.length === 0) {
                // Show list of active sessions to cancel
                let sessionsList = `❌ *Cancel Pairing Session*\n\nActive sessions:\n\n`;
                
                for (const [number, session] of global.pairingSessions.entries()) {
                    sessionsList += `🔹 *+${number}* - Code: ${session.code}\n`;
                }
                
                sessionsList += `\nUsage: *${process.env.PREFIX || '.'}cancelpair <number>*\nExample: *${process.env.PREFIX || '.'}cancelpair 254788710904*`;
                
                await sock.sendMessage(chatId, { 
                    text: sessionsList
                }, { quoted: msg });
                return;
            }

            let phoneNumber = args[0].trim().replace(/[^0-9]/g, '');
            
            if (!global.pairingSessions.has(phoneNumber)) {
                await sock.sendMessage(chatId, { 
                    text: `❌ *Session Not Found*\n\nNo active pairing session found for +${phoneNumber}`
                }, { quoted: msg });
                return;
            }

            const session = global.pairingSessions.get(phoneNumber);
            global.pairingSessions.delete(phoneNumber);

            await sock.sendMessage(chatId, { 
                text: `✅ *Pairing Session Cancelled*\n\n📱 Number: +${phoneNumber}\n🔑 Code: ${session.code}\n\nThis pairing code is now invalid.`
            }, { quoted: msg });

            console.log(chalk.yellow(`❌ Pairing session cancelled for +${phoneNumber}`));

        } catch (error) {
            console.error(chalk.red('❌ Error in cancelpair command:'), error);
            await sock.sendMessage(chatId, { 
                text: '❌ Failed to cancel pairing session'
            }, { quoted: msg });
        }
    }
};