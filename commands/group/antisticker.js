// import fs from 'fs';

// const antiStickerFile = './antisticker.json';

// // Load settings
// function loadAntiSticker() {
//     if (!fs.existsSync(antiStickerFile)) return [];
//     return JSON.parse(fs.readFileSync(antiStickerFile, 'utf8'));
// }

// // Save settings
// function saveAntiSticker(data) {
//     fs.writeFileSync(antiStickerFile, JSON.stringify(data, null, 2));
// }

// export default {
//     name: 'antisticker',
//     description: 'Enable or disable sticker blocking in the group',
//     category: 'group',
//     async execute(sock, msg, args, metadata) {
//         const chatId = msg.key.remoteJid;
//         const isGroup = chatId.endsWith('@g.us');
//         const sender = msg.key.participant;
//         const isAdmin = metadata?.participants?.find(p => p.id === sender)?.admin;

//         if (!isGroup) {
//             return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
//         }

//         if (!isAdmin) {
//             return sock.sendMessage(chatId, { text: '🛑 Only group admins can use this command.' }, { quoted: msg });
//         }

//         let settings = loadAntiSticker();

//         if (args[0] === 'on') {
//             if (!settings.includes(chatId)) {
//                 settings.push(chatId);
//                 saveAntiSticker(settings);
//             }
//             await sock.sendMessage(chatId, { text: '✅ Anti-sticker is now *enabled* in this group.' }, { quoted: msg });
//         } 
//         else if (args[0] === 'off') {
//             settings = settings.filter(id => id !== chatId);
//             saveAntiSticker(settings);
//             await sock.sendMessage(chatId, { text: '❌ Anti-sticker is now *disabled* in this group.' }, { quoted: msg });
//         } 
//         else {
//             await sock.sendMessage(chatId, { text: '⚙️ Usage: `.antisticker on` or `.antisticker off`' }, { quoted: msg });
//         }

//         // Attach listener once
//         if (!sock._antiStickerListenerAttached) {
//             sock.ev.on('messages.upsert', async ({ messages }) => {
//                 const newMsg = messages[0];
//                 const groupId = newMsg.key.remoteJid;

//                 if (newMsg.key.fromMe) return; // Ignore bot's own messages
//                 const antiStickerGroups = loadAntiSticker();

//                 // If anti-sticker is enabled and message is sticker
//                 if (antiStickerGroups.includes(groupId) && newMsg.message?.stickerMessage) {
//                     try {
//                         await sock.sendMessage(groupId, { 
//                             text: `🚫 Stickers are not allowed here, @${newMsg.key.participant.split('@')[0]}`, 
//                             mentions: [newMsg.key.participant] 
//                         });
//                         await sock.sendMessage(groupId, { delete: newMsg.key });
//                     } catch (err) {
//                         console.error('Failed to delete sticker:', err);
//                     }
//                 }
//             });

//             sock._antiStickerListenerAttached = true;
//         }
//     }
// };




















// import fs from 'fs';
// import path from 'path';

// const antiStickerFile = './antisticker.json';

// // Ensure JSON file exists
// if (!fs.existsSync(antiStickerFile)) {
//     fs.writeFileSync(antiStickerFile, '[]');
// }

// // Load settings
// function loadAntiSticker() {
//     try {
//         if (!fs.existsSync(antiStickerFile)) return [];
//         const data = fs.readFileSync(antiStickerFile, 'utf8');
//         return JSON.parse(data);
//     } catch (error) {
//         console.error('Error loading anti-sticker settings:', error);
//         return [];
//     }
// }

// // Save settings
// function saveAntiSticker(data) {
//     try {
//         fs.writeFileSync(antiStickerFile, JSON.stringify(data, null, 2));
//     } catch (error) {
//         console.error('Error saving anti-sticker settings:', error);
//     }
// }

// export default {
//     name: 'antisticker',
//     description: 'Enable or disable sticker blocking for non-admins in the group',
//     category: 'group',
//     async execute(sock, msg, args, metadata) {
//         const chatId = msg.key.remoteJid;
//         const isGroup = chatId.endsWith('@g.us');
        
//         if (!isGroup) {
//             return sock.sendMessage(chatId, { text: '❌ This command can only be used in groups.' }, { quoted: msg });
//         }

//         // Get the sender's JID properly
//         let sender = msg.key.participant || msg.key.fromMe ? sock.user.id : msg.key.remoteJid;
        
//         // Clean the sender JID (remove any suffixes)
//         if (sender && sender.includes(':')) {
//             sender = sender.split(':')[0];
//         }
        
//         // Ensure it's a full JID
//         if (sender && !sender.includes('@')) {
//             sender = sender + '@s.whatsapp.net';
//         }

//         // Check if user is admin - ONLY FOR USING THE COMMAND
//         let isAdmin = false;
//         let botIsAdmin = false;
        
//         try {
//             const groupMetadata = await sock.groupMetadata(chatId);
            
//             // Check if sender is admin (for command permission)
//             const participant = groupMetadata.participants.find(p => {
//                 const cleanParticipantId = p.id.split(':')[0];
//                 const cleanSenderId = sender?.split('@')[0];
//                 return cleanParticipantId === cleanSenderId || p.id === sender;
//             });
            
//             isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            
//             // Check if bot is admin
//             const botParticipant = groupMetadata.participants.find(p => 
//                 p.id.includes(sock.user?.id?.split(':')[0] || sock.user?.id)
//             );
//             botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            
//         } catch (error) {
//             console.error('Error fetching group metadata:', error);
//             return sock.sendMessage(chatId, { text: '❌ Failed to fetch group information. Please try again.' }, { quoted: msg });
//         }

//         // ONLY admins can use the command
       

//         const subCommand = args[0]?.toLowerCase();
//         let settings = loadAntiSticker();

//         if (subCommand === 'on') {
//             if (!settings.includes(chatId)) {
//                 settings.push(chatId);
//                 saveAntiSticker(settings);
//                 await sock.sendMessage(chatId, { text: '✅ *Anti-sticker enabled!*\n\nNow only admins can send stickers.\nRegular members\' stickers will be deleted automatically.' }, { quoted: msg });
//             } else {
//                 await sock.sendMessage(chatId, { text: 'ℹ️ Anti-sticker is already enabled in this group.\nOnly admins can send stickers.' }, { quoted: msg });
//             }
//         } 
//         else if (subCommand === 'off') {
//             if (settings.includes(chatId)) {
//                 settings = settings.filter(id => id !== chatId);
//                 saveAntiSticker(settings);
//                 await sock.sendMessage(chatId, { text: '❌ *Anti-sticker disabled!*\n\nEveryone can now send stickers in this group.' }, { quoted: msg });
//             } else {
//                 await sock.sendMessage(chatId, { text: 'ℹ️ Anti-sticker is already disabled in this group.\nEveryone can send stickers.' }, { quoted: msg });
//             }
//         } 
//         else if (subCommand === 'status') {
//             const status = settings.includes(chatId) ? 'ENABLED ✅\n(Only admins can send stickers)' : 'DISABLED ❌\n(Everyone can send stickers)';
//             await sock.sendMessage(chatId, { text: `📊 *Anti-sticker Status*\n\n${status}\n\nUsage:\n• \`.antisticker on\` - Enable (only admins can send stickers)\n• \`.antisticker off\` - Disable (everyone can send stickers)\n• \`.antisticker status\` - Check current status` }, { quoted: msg });
//         }
//         else {
//             await sock.sendMessage(chatId, { text: '⚙️ *Anti-sticker Command*\n\nThis feature allows only admins to send stickers.\n\nUsage:\n• \`.antisticker on\` - Enable (only admins can send stickers)\n• \`.antisticker off\` - Disable (everyone can send stickers)\n• \`.antisticker status\` - Check current status\n\n⚠️ *Note:* I need admin permissions to delete stickers.' }, { quoted: msg });
//         }

//         // Setup sticker listener (only once)
//         if (!sock._antiStickerListenerAttached) {
//             setupAntiStickerListener(sock);
//             sock._antiStickerListenerAttached = true;
//             console.log('✅ Anti-sticker listener attached');
//         }
//     }
// };

// function setupAntiStickerListener(sock) {
//     sock.ev.on('messages.upsert', async ({ messages }) => {
//         const newMsg = messages[0];
        
//         // Skip if no message or not a group message
//         if (!newMsg || !newMsg.key.remoteJid?.endsWith('@g.us')) return;
        
//         // Skip bot's own messages
//         if (newMsg.key.fromMe) return;
        
//         const chatId = newMsg.key.remoteJid;
        
//         // Load current settings
//         const antiStickerGroups = loadAntiSticker();
        
//         // Check if anti-sticker is enabled for this group AND message is a sticker
//         if (antiStickerGroups.includes(chatId) && newMsg.message?.stickerMessage) {
//             try {
//                 // Get the sticker sender
//                 const stickerSender = newMsg.key.participant || newMsg.key.remoteJid;
                
//                 // Fetch group metadata to check if sender is admin
//                 const groupMetadata = await sock.groupMetadata(chatId);
                
//                 // Check if sticker sender is admin
//                 let isStickerSenderAdmin = false;
//                 const senderParticipant = groupMetadata.participants.find(p => {
//                     const cleanParticipantId = p.id.split(':')[0];
//                     const cleanStickerSenderId = stickerSender.split('@')[0];
//                     return cleanParticipantId === cleanStickerSenderId || p.id === stickerSender;
//                 });
                
//                 isStickerSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
                
//                 // If sender is NOT admin, delete the sticker
//                 if (!isStickerSenderAdmin) {
//                     const senderNumber = stickerSender.split('@')[0];
                    
//                     // Send warning message
//                     await sock.sendMessage(chatId, { 
//                         text: `🚫 *Sticker Blocked!*\n@${senderNumber}, only admins can send stickers in this group.`,
//                         mentions: [stickerSender]
//                     });
                    
//                     // Delete the sticker
//                     await sock.sendMessage(chatId, { delete: newMsg.key });
//                 }
//                 // If sender IS admin, do nothing (allow the sticker)
                
//             } catch (error) {
//                 console.error('Error handling sticker:', error);
//                 // If we can't delete (no admin), send a warning
//                 if (error.message?.includes('not an admin')) {
//                     try {
//                         await sock.sendMessage(chatId, { 
//                             text: '⚠️ *Admin Required*\nI need admin permissions to delete stickers. Please make me an admin.'
//                         });
//                     } catch (e) {
//                         console.error('Failed to send admin warning:', e);
//                     }
//                 }
//             }
//         }
//     });
// }















import fs from 'fs';
import path from 'path';

const antiStickerFile = './antisticker.json';

// Ensure JSON file exists
if (!fs.existsSync(antiStickerFile)) {
    fs.writeFileSync(antiStickerFile, '[]');
}

// Load settings
function loadAntiSticker() {
    try {
        if (!fs.existsSync(antiStickerFile)) return [];
        const data = fs.readFileSync(antiStickerFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading anti-sticker settings:', error);
        return [];
    }
}

// Save settings
function saveAntiSticker(data) {
    try {
        fs.writeFileSync(antiStickerFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving anti-sticker settings:', error);
    }
}

// Utility function to clean JID
function cleanJid(jid) {
    if (!jid) return jid;
    // Remove device suffix and ensure proper format
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// Setup listener once globally
let listenerAttached = false;

export default {
    name: 'antisticker',
    description: 'Enable or disable sticker blocking for non-admins in the group',
    category: 'group',
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        
        if (!isGroup) {
            return sock.sendMessage(chatId, { 
                text: '❌ This command can only be used in groups.' 
            }, { quoted: msg });
        }

        // Get sender's JID
        let sender = msg.key.participant || (msg.key.fromMe ? sock.user.id : msg.key.remoteJid);
        sender = cleanJid(sender);

        // Check if user is admin
        let isAdmin = false;
        let botIsAdmin = false;
        
        try {
            const groupMetadata = await sock.groupMetadata(chatId);
            const cleanSender = cleanJid(sender);
            
            // Check if sender is admin
            const participant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === cleanSender;
            });
            
            isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
            
            // Check if bot is admin
            const botJid = cleanJid(sock.user?.id);
            const botParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === botJid;
            });
            botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin';
            
        } catch (error) {
            console.error('Error fetching group metadata:', error);
            return sock.sendMessage(chatId, { 
                text: '❌ Failed to fetch group information. Please try again.' 
            }, { quoted: msg });
        }

        // ONLY admins can use the command
        if (!isAdmin) {
            return sock.sendMessage(chatId, { 
                text: '❌ Only group admins can use this command!' 
            }, { quoted: msg });
        }

        // Warn if bot is not admin
        if (!botIsAdmin) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ *Warning:* I need admin permissions to delete stickers!\n\nPlease make me an admin for this feature to work properly.' 
            }, { quoted: msg });
        }

        const subCommand = args[0]?.toLowerCase();
        let settings = loadAntiSticker();

        if (subCommand === 'on') {
            if (!settings.includes(chatId)) {
                settings.push(chatId);
                saveAntiSticker(settings);
                // Attach listener if not already attached
                if (!listenerAttached) {
                    setupAntiStickerListener(sock);
                    listenerAttached = true;
                }
                await sock.sendMessage(chatId, { 
                    text: '✅ *Anti-sticker enabled!*\n\nNow only admins can send stickers.\nRegular members\' stickers will be deleted automatically.' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'ℹ️ Anti-sticker is already enabled in this group.\nOnly admins can send stickers.' 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'off') {
            if (settings.includes(chatId)) {
                settings = settings.filter(id => id !== chatId);
                saveAntiSticker(settings);
                await sock.sendMessage(chatId, { 
                    text: '❌ *Anti-sticker disabled!*\n\nEveryone can now send stickers in this group.' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'ℹ️ Anti-sticker is already disabled in this group.\nEveryone can send stickers.' 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'status') {
            const status = settings.includes(chatId) ? 
                '✅ ENABLED\n(Only admins can send stickers)' : 
                '❌ DISABLED\n(Everyone can send stickers)';
            const botStatus = botIsAdmin ? '✅ I am admin' : '❌ I am NOT admin (feature won\'t work)';
            
            await sock.sendMessage(chatId, { 
                text: `📊 *Anti-sticker Status*\n\n• Feature: ${status}\n• Bot status: ${botStatus}\n\n*Usage:*\n• \`.antisticker on\` - Enable (only admins can send stickers)\n• \`.antisticker off\` - Disable (everyone can send stickers)\n• \`.antisticker status\` - Check current status` 
            }, { quoted: msg });
        }
        else {
            await sock.sendMessage(chatId, { 
                text: '⚙️ *Anti-sticker Command*\n\nThis feature allows only admins to send stickers.\n\n*Usage:*\n• \`.antisticker on\` - Enable\n• \`.antisticker off\` - Disable\n• \`.antisticker status\` - Check status\n\n⚠️ *Note:* I need admin permissions to delete stickers.' 
            }, { quoted: msg });
        }
    }
};

function setupAntiStickerListener(sock) {
    console.log('🔧 Setting up anti-sticker listener...');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const newMsg = messages[0];
        
        // Skip if no message or not a group message
        if (!newMsg || !newMsg.key.remoteJid?.endsWith('@g.us')) return;
        
        // Skip bot's own messages
        if (newMsg.key.fromMe) return;
        
        const chatId = newMsg.key.remoteJid;
        
        // Load current settings
        const antiStickerGroups = loadAntiSticker();
        
        // Check if anti-sticker is enabled for this group AND message is a sticker
        if (antiStickerGroups.includes(chatId) && newMsg.message?.stickerMessage) {
            try {
                // Get the sticker sender
                const stickerSender = newMsg.key.participant || newMsg.key.remoteJid;
                const cleanStickerSender = cleanJid(stickerSender);
                
                // Fetch group metadata
                const groupMetadata = await sock.groupMetadata(chatId);
                
                // Check if sticker sender is admin
                let isStickerSenderAdmin = false;
                const senderParticipant = groupMetadata.participants.find(p => {
                    const cleanParticipantJid = cleanJid(p.id);
                    return cleanParticipantJid === cleanStickerSender;
                });
                
                isStickerSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
                
                // If sender is NOT admin, delete the sticker
                if (!isStickerSenderAdmin) {
                    // Send warning message
                    await sock.sendMessage(chatId, { 
                        text: `🚫 *Sticker Blocked!*\nOnly admins can send stickers in this group.`,
                        mentions: [cleanStickerSender]
                    });
                    
                    // Try to delete the sticker
                    try {
                        await sock.sendMessage(chatId, { 
                            delete: {
                                id: newMsg.key.id,
                                participant: stickerSender,
                                remoteJid: chatId,
                                fromMe: false
                            }
                        });
                        console.log(`Deleted sticker from ${cleanStickerSender} in ${chatId}`);
                    } catch (deleteError) {
                        if (deleteError.message?.includes('not an admin')) {
                            console.log(`Cannot delete sticker - bot is not admin in ${chatId}`);
                        }
                    }
                }
                
            } catch (error) {
                console.error('Error handling sticker:', error);
            }
        }
    });
    
    console.log('✅ Anti-sticker listener attached');
}