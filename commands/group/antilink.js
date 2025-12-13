import fs from 'fs';
import path from 'path';

const antiLinkFile = './antilink.json';

// Ensure JSON file exists
if (!fs.existsSync(antiLinkFile)) {
    fs.writeFileSync(antiLinkFile, JSON.stringify([], null, 2));
}

// Load settings
function loadAntiLink() {
    try {
        if (!fs.existsSync(antiLinkFile)) return [];
        const data = fs.readFileSync(antiLinkFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading anti-link settings:', error);
        return [];
    }
}

// Save settings
function saveAntiLink(data) {
    try {
        fs.writeFileSync(antiLinkFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving anti-link settings:', error);
    }
}

// Utility function to clean JID
function cleanJid(jid) {
    if (!jid) return jid;
    // Remove device suffix and ensure proper format
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// List of URL patterns to detect
const URL_PATTERNS = [
    /https?:\/\/[^\s]+/gi,  // HTTP/HTTPS links
    /www\.[^\s]+/gi,        // www links
    /t\.me\/[^\s]+/gi,      // Telegram links
    /instagram\.com\/[^\s]+/gi,
    /facebook\.com\/[^\s]+/gi,
    /twitter\.com\/[^\s]+/gi,
    /x\.com\/[^\s]+/gi,
    /youtube\.com\/[^\s]+/gi,
    /youtu\.be\/[^\s]+/gi,
    /whatsapp\.com\/[^\s]+/gi,
    /chat\.whatsapp\.com\/[^\s]+/gi,  // WhatsApp group links
    /discord\.gg\/[^\s]+/gi,
    /discord\.com\/[^\s]+/gi,
    /snapchat\.com\/[^\s]+/gi,
    /tiktok\.com\/[^\s]+/gi,
    /reddit\.com\/[^\s]+/gi,
    /linkedin\.com\/[^\s]+/gi
];

// Check if message contains links
function containsLink(text) {
    if (!text) return false;
    for (const pattern of URL_PATTERNS) {
        if (pattern.test(text)) {
            return true;
        }
    }
    return false;
}

// Extract links from message
function extractLinks(text) {
    const links = [];
    for (const pattern of URL_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            links.push(...matches);
        }
    }
    return links;
}

// Setup listener once globally
let antiLinkListenerAttached = false;

export default {
    name: 'antilink',
    description: 'Control link sharing in the group with different actions',
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
        let botIsSuperAdmin = false;
        
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
            botIsSuperAdmin = botParticipant?.admin === 'superadmin';
            
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

        const settings = loadAntiLink();
        const groupIndex = settings.findIndex(g => g.chatId === chatId);
        const currentGroupSettings = groupIndex !== -1 ? settings[groupIndex] : null;

        const subCommand = args[0]?.toLowerCase();
        const mode = args[1]?.toLowerCase();

        // Warn if bot is not admin for certain modes
        if (!botIsAdmin && (mode === 'delete' || mode === 'kick')) {
            await sock.sendMessage(chatId, { 
                text: '⚠️ *Warning:* I need admin permissions for delete/kick modes!\n\nPlease make me an admin for these features to work properly.' 
            }, { quoted: msg });
        }

        // Warn if bot is not superadmin for kick mode
        if (!botIsSuperAdmin && mode === 'kick') {
            await sock.sendMessage(chatId, { 
                text: '⚠️ *Important:* I need *superadmin* permissions to kick members!\n\nPlease make me a superadmin for kick mode to work.' 
            }, { quoted: msg });
        }

        if (subCommand === 'on') {
            if (!mode || !['warn', 'delete', 'kick'].includes(mode)) {
                return sock.sendMessage(chatId, { 
                    text: '⚙️ *Anti-link Setup*\n\nUsage: `.antilink on [mode]`\n\nAvailable modes:\n• `warn` - Warn users who share links\n• `delete` - Delete links automatically\n• `kick` - Kick users who share links\n\nExample: `.antilink on delete`' 
                }, { quoted: msg });
            }

            const newSettings = {
                chatId,
                enabled: true,
                mode: mode,
                exemptAdmins: true,
                exemptLinks: [], // List of allowed links
                warningCount: {} // Track warnings per user
            };

            if (groupIndex !== -1) {
                settings[groupIndex] = newSettings;
            } else {
                settings.push(newSettings);
            }

            saveAntiLink(settings);
            
            // Attach listener if not already attached
            if (!antiLinkListenerAttached) {
                setupAntiLinkListener(sock);
                antiLinkListenerAttached = true;
            }

            const modeDescriptions = {
                'warn': 'Users will receive warnings when sharing links',
                'delete': 'Links will be automatically deleted',
                'kick': 'Users will be kicked for sharing links'
            };

            await sock.sendMessage(chatId, { 
                text: `✅ *Anti-link enabled!*\n\nMode: *${mode.toUpperCase()}*\n${modeDescriptions[mode]}\n\nAdmins are exempt from this rule.\n\nTo disable: \`.antilink off\`` 
            }, { quoted: msg });

        } 
        else if (subCommand === 'off') {
            if (groupIndex !== -1) {
                settings.splice(groupIndex, 1);
                saveAntiLink(settings);
                await sock.sendMessage(chatId, { 
                    text: '❌ *Anti-link disabled!*\n\nEveryone can now share links in this group.' 
                }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: 'ℹ️ Anti-link is already disabled in this group.\nEveryone can share links.' 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'status') {
            if (currentGroupSettings) {
                const status = currentGroupSettings.enabled ? 
                    `✅ ENABLED (${currentGroupSettings.mode.toUpperCase()} mode)` : 
                    '❌ DISABLED';
                
                const botStatus = botIsAdmin ? '✅ I am admin' : '❌ I am NOT admin';
                const botSuperStatus = botIsSuperAdmin ? '✅ I am superadmin' : '❌ I am NOT superadmin';
                
                let statusText = `📊 *Anti-link Status*\n\n`;
                statusText += `• Feature: ${status}\n`;
                statusText += `• Bot admin: ${botStatus}\n`;
                statusText += `• Bot superadmin: ${botSuperStatus}\n\n`;
                
                if (currentGroupSettings.enabled) {
                    const exemptLinksCount = currentGroupSettings.exemptLinks?.length || 0;
                    statusText += `• Allowed links: ${exemptLinksCount}\n`;
                    statusText += `• Admins exempt: ${currentGroupSettings.exemptAdmins ? 'Yes' : 'No'}\n\n`;
                }
                
                ;
                
                await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
            } else {
                await sock.sendMessage(chatId, { 
                    text: `📊 *Anti-link Status*\n\n❌ DISABLED\nEveryone can share links.\n\n*To enable:*\n\`.antilink on [mode]\`\n\nModes: warn, delete, kick` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'allow') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-link is not enabled in this group.\nEnable it first with `.antilink on [mode]`' 
                }, { quoted: msg });
            }

            const linkToAllow = args.slice(1).join(' ').trim();
            if (!linkToAllow) {
                return sock.sendMessage(chatId, { 
                    text: 'Usage: `.antilink allow [link]`\nExample: `.antilink allow https://allowed-site.com`' 
                }, { quoted: msg });
            }

            if (!currentGroupSettings.exemptLinks) {
                currentGroupSettings.exemptLinks = [];
            }

            // Clean the link (remove protocol for matching)
            const cleanLink = linkToAllow.replace(/^https?:\/\//, '').toLowerCase();
            
            if (currentGroupSettings.exemptLinks.includes(cleanLink)) {
                await sock.sendMessage(chatId, { 
                    text: `✅ Link is already allowed:\n\`${cleanLink}\`` 
                }, { quoted: msg });
            } else {
                currentGroupSettings.exemptLinks.push(cleanLink);
                settings[groupIndex] = currentGroupSettings;
                saveAntiLink(settings);
                await sock.sendMessage(chatId, { 
                    text: `✅ Link added to allowed list:\n\`${cleanLink}\`\n\nThis link can now be shared without restrictions.` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'disallow') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-link is not enabled in this group.' 
                }, { quoted: msg });
            }

            const linkToRemove = args.slice(1).join(' ').trim();
            if (!linkToRemove) {
                return sock.sendMessage(chatId, { 
                    text: 'Usage: `.antilink disallow [link]`\nExample: `.antilink disallow https://site.com`' 
                }, { quoted: msg });
            }

            if (!currentGroupSettings.exemptLinks || currentGroupSettings.exemptLinks.length === 0) {
                return sock.sendMessage(chatId, { 
                    text: '❌ There are no allowed links to remove.' 
                }, { quoted: msg });
            }

            const cleanLink = linkToRemove.replace(/^https?:\/\//, '').toLowerCase();
            const index = currentGroupSettings.exemptLinks.indexOf(cleanLink);
            
            if (index === -1) {
                await sock.sendMessage(chatId, { 
                    text: `❌ Link not found in allowed list:\n\`${cleanLink}\`` 
                }, { quoted: msg });
            } else {
                currentGroupSettings.exemptLinks.splice(index, 1);
                settings[groupIndex] = currentGroupSettings;
                saveAntiLink(settings);
                await sock.sendMessage(chatId, { 
                    text: `✅ Link removed from allowed list:\n\`${cleanLink}\`\n\nThis link will now be blocked.` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'listallowed') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-link is not enabled in this group.' 
                }, { quoted: msg });
            }

            const allowedLinks = currentGroupSettings.exemptLinks || [];
            if (allowedLinks.length === 0) {
                await sock.sendMessage(chatId, { 
                    text: '📋 *Allowed Links*\n\nNo links are currently allowed.\n\nAdd links with:\n`.antilink allow [link]`' 
                }, { quoted: msg });
            } else {
                let listText = '📋 *Allowed Links*\n\n';
                allowedLinks.forEach((link, index) => {
                    listText += `${index + 1}. \`${link}\`\n`;
                });
                listText += `\nTotal: ${allowedLinks.length} links\n\nRemove links with:\n\`.antilink disallow [link]\``;
                await sock.sendMessage(chatId, { text: listText }, { quoted: msg });
            }
        }
        else if (subCommand === 'exemptadmins') {
            if (!currentGroupSettings || !currentGroupSettings.enabled) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Anti-link is not enabled in this group.' 
                }, { quoted: msg });
            }

            const toggle = args[1]?.toLowerCase();
            if (toggle === 'off') {
                currentGroupSettings.exemptAdmins = false;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Admin exemption disabled*\n\nAdmins will now be subject to anti-link rules.' 
                }, { quoted: msg });
            } else if (toggle === 'on') {
                currentGroupSettings.exemptAdmins = true;
                await sock.sendMessage(chatId, { 
                    text: '⚙️ *Admin exemption enabled*\n\nAdmins can now share links freely.' 
                }, { quoted: msg });
            } else {
                const currentStatus = currentGroupSettings.exemptAdmins ? 'enabled' : 'disabled';
                await sock.sendMessage(chatId, { 
                    text: `⚙️ *Admin Exemption Status*\n\nCurrently: *${currentStatus}*\n\nTo change:\n\`.antilink exemptadmins on\` - Enable\n\`.antilink exemptadmins off\` - Disable` 
                }, { quoted: msg });
            }
            
            settings[groupIndex] = currentGroupSettings;
            saveAntiLink(settings);
        }
        else {
            // Show help
            const helpText = `
🔗 *Anti-link Command*

Control link sharing in the group with different actions.

📌 *Main Commands:*
• \`.antilink on [mode]\`
• \`.antilink off\` 
• \`.antilink allow\` 
• \`.antilink disallow\` 
• \`.antilink status\` 
 `.trim();
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }
    }
};

function setupAntiLinkListener(sock) {
    console.log('🔧 Setting up anti-link listener...');
    
    sock.ev.on('messages.upsert', async ({ messages }) => {
        const newMsg = messages[0];
        
        // Skip if no message or not a group message
        if (!newMsg || !newMsg.key.remoteJid?.endsWith('@g.us')) return;
        
        // Skip bot's own messages
        if (newMsg.key.fromMe) return;
        
        const chatId = newMsg.key.remoteJid;
        
        // Load current settings
        const settings = loadAntiLink();
        const groupSettings = settings.find(g => g.chatId === chatId);
        
        // Skip if anti-link not enabled for this group
        if (!groupSettings || !groupSettings.enabled) return;
        
        // Get message text
        const messageText = newMsg.message?.conversation || 
                           newMsg.message?.extendedTextMessage?.text || 
                           newMsg.message?.imageMessage?.caption ||
                           newMsg.message?.videoMessage?.caption ||
                           '';
        
        // Check if message contains links
        if (!containsLink(messageText)) return;
        
        // Get sender
        const stickerSender = newMsg.key.participant || newMsg.key.remoteJid;
        const cleanStickerSender = cleanJid(stickerSender);
        const senderNumber = cleanStickerSender.split('@')[0];
        
        try {
            // Fetch group metadata
            const groupMetadata = await sock.groupMetadata(chatId);
            
            // Check if sender is admin
            let isSenderAdmin = false;
            const senderParticipant = groupMetadata.participants.find(p => {
                const cleanParticipantJid = cleanJid(p.id);
                return cleanParticipantJid === cleanStickerSender;
            });
            
            isSenderAdmin = senderParticipant?.admin === 'admin' || senderParticipant?.admin === 'superadmin';
            
            // Skip if sender is admin and exemptAdmins is true
            if (isSenderAdmin && groupSettings.exemptAdmins) {
                return;
            }
            
            // Extract links from message
            const foundLinks = extractLinks(messageText);
            
            // Check if any links are in exempt list
            const isLinkAllowed = foundLinks.some(link => {
                const cleanLink = link.replace(/^https?:\/\//, '').toLowerCase();
                return groupSettings.exemptLinks?.includes(cleanLink);
            });
            
            if (isLinkAllowed) {
                return; // Allow this link
            }
            
            // Initialize warning count for user if not exists
            if (!groupSettings.warningCount) {
                groupSettings.warningCount = {};
            }
            
            const userId = cleanStickerSender;
            if (!groupSettings.warningCount[userId]) {
                groupSettings.warningCount[userId] = 0;
            }
            
            // Handle based on mode
            switch (groupSettings.mode) {
                case 'warn':
                    groupSettings.warningCount[userId]++;
                    const warnings = groupSettings.warningCount[userId];
                    
                    await sock.sendMessage(chatId, { 
                        text: `⚠️ *Link Warning* @${senderNumber}\n\nLinks are not allowed in this group!\nWarning #${warnings}\n\nYour message contains: ${foundLinks.length} link(s)\n\nRepeated violations may result in stricter actions.`,
                        mentions: [cleanStickerSender]
                    });
                    
                    // Update settings with warning count
                    const settingsIndex = settings.findIndex(g => g.chatId === chatId);
                    if (settingsIndex !== -1) {
                        settings[settingsIndex] = groupSettings;
                        saveAntiLink(settings);
                    }
                    break;
                    
                case 'delete':
                    // Send warning
                    await sock.sendMessage(chatId, { 
                        text: `🚫 *Link Deleted* @${senderNumber}\n\nLinks are not allowed in this group!\nYour message has been removed.`,
                        mentions: [cleanStickerSender]
                    });
                    
                    // Try to delete the message
                    try {
                        await sock.sendMessage(chatId, { 
                            delete: {
                                id: newMsg.key.id,
                                participant: stickerSender,
                                remoteJid: chatId,
                                fromMe: false
                            }
                        });
                        console.log(`Deleted link message from ${cleanStickerSender} in ${chatId}`);
                    } catch (deleteError) {
                        console.error('Failed to delete message:', deleteError);
                    }
                    break;
                    
                case 'kick':
                    // Check if bot is superadmin
                    const botJid = cleanJid(sock.user?.id);
                    const botParticipant = groupMetadata.participants.find(p => {
                        const cleanParticipantJid = cleanJid(p.id);
                        return cleanParticipantJid === botJid;
                    });
                    const botIsSuperAdmin = botParticipant?.admin === 'superadmin';
                    
                    if (!botIsSuperAdmin) {
                        await sock.sendMessage(chatId, { 
                            text: `⚠️ *Cannot Kick*\n\nI need superadmin permissions to kick members.\n\nUser @${senderNumber} shared a link but I cannot kick them.`,
                            mentions: [cleanStickerSender]
                        });
                        return;
                    }
                    
                    // Send warning before kick
                    await sock.sendMessage(chatId, { 
                        text: `🚫 *Violation Detected* @${senderNumber}\n\nSharing links is not allowed in this group!\nYou will be kicked for this violation.`,
                        mentions: [cleanStickerSender]
                    });
                    
                    // Wait a moment then kick
                    setTimeout(async () => {
                        try {
                            await sock.groupParticipantsUpdate(chatId, [cleanStickerSender], 'remove');
                            await sock.sendMessage(chatId, { 
                                text: `👢 *User Kicked*\n\n@${senderNumber} was removed for sharing links.`
                            });
                        } catch (kickError) {
                            console.error('Failed to kick user:', kickError);
                            await sock.sendMessage(chatId, { 
                                text: `❌ *Failed to kick user*\n\nCould not remove @${senderNumber}. Please check my permissions.`,
                                mentions: [cleanStickerSender]
                            });
                        }
                    }, 2000);
                    break;
            }
            
        } catch (error) {
            console.error('Error handling link detection:', error);
        }
    });
    
    console.log('✅ Anti-link listener attached');
}