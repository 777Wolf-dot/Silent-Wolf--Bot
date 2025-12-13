import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const antiViewOnceFile = './antiviewonce.json';

// Ensure JSON file exists
if (!fs.existsSync(antiViewOnceFile)) {
    fs.writeFileSync(antiViewOnceFile, JSON.stringify([], null, 2));
}

// Directory to store retrieved media
const RETRIEVAL_DIR = './retrieved_media';
if (!fs.existsSync(RETRIEVAL_DIR)) {
    fs.mkdirSync(RETRIEVAL_DIR, { recursive: true });
}

// Load settings
function loadAntiViewOnce() {
    try {
        if (!fs.existsSync(antiViewOnceFile)) return [];
        const data = fs.readFileSync(antiViewOnceFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading anti-view-once settings:', error);
        return [];
    }
}

// Save settings
function saveAntiViewOnce(data) {
    try {
        fs.writeFileSync(antiViewOnceFile, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error saving anti-view-once settings:', error);
    }
}

// Utility function to clean JID
function cleanJid(jid) {
    if (!jid) return jid;
    // Remove device suffix and ensure proper format
    const clean = jid.split(':')[0];
    return clean.includes('@') ? clean : clean + '@s.whatsapp.net';
}

// Check if message is view-once (updated detection)
function isViewOnceMessage(message) {
    try {
        // Log message structure for debugging
        console.log('Checking message for view-once:', {
            hasMessage: !!message?.message,
            messageKeys: message?.message ? Object.keys(message.message) : [],
            hasViewOnceV2: !!message?.message?.viewOnceMessageV2,
            hasViewOnceV2Ext: !!message?.message?.viewOnceMessageV2Extension,
            hasViewOnce: !!message?.message?.viewOnceMessage,
            hasEphemeral: !!message?.message?.ephemeralMessage
        });
        
        // Check all possible view-once message structures
        return (
            message?.message?.viewOnceMessageV2 ||
            message?.message?.viewOnceMessageV2Extension ||
            message?.message?.viewOnceMessage ||
            (message?.message?.ephemeralMessage?.message?.viewOnceMessage) ||
            // Also check for direct media with viewOnce flag
            (message?.message?.imageMessage?.viewOnce) ||
            (message?.message?.videoMessage?.viewOnce) ||
            (message?.message?.audioMessage?.viewOnce)
        );
    } catch (error) {
        console.error('Error in isViewOnceMessage:', error);
        return false;
    }
}

// Extract media type and content from view-once message
function getViewOnceContent(message) {
    try {
        console.log('Extracting view-once content from:', JSON.stringify(message, null, 2));
        
        let viewOnceContent = null;
        
        // Try different message structures
        if (message?.message?.viewOnceMessageV2?.message) {
            viewOnceContent = message.message.viewOnceMessageV2.message;
        } else if (message?.message?.viewOnceMessageV2Extension?.message) {
            viewOnceContent = message.message.viewOnceMessageV2Extension.message;
        } else if (message?.message?.viewOnceMessage?.message) {
            viewOnceContent = message.message.viewOnceMessage.message;
        } else if (message?.message?.ephemeralMessage?.message?.viewOnceMessage?.message) {
            viewOnceContent = message.message.ephemeralMessage.message.viewOnceMessage.message;
        }
        
        console.log('Found viewOnceContent:', viewOnceContent ? Object.keys(viewOnceContent) : 'null');
        
        if (!viewOnceContent) {
            // Check for direct view-once media
            if (message?.message?.imageMessage?.viewOnce) {
                return {
                    type: 'image',
                    caption: message.message.imageMessage.caption,
                    mimetype: message.message.imageMessage.mimetype,
                    mediaKey: message.message.imageMessage.mediaKey,
                    fileSha256: message.message.imageMessage.fileSha256,
                    fileLength: message.message.imageMessage.fileLength,
                    height: message.message.imageMessage.height,
                    width: message.message.imageMessage.width,
                    content: message.message.imageMessage,
                    direct: true
                };
            } else if (message?.message?.videoMessage?.viewOnce) {
                return {
                    type: 'video',
                    caption: message.message.videoMessage.caption,
                    mimetype: message.message.videoMessage.mimetype,
                    mediaKey: message.message.videoMessage.mediaKey,
                    fileSha256: message.message.videoMessage.fileSha256,
                    fileLength: message.message.videoMessage.fileLength,
                    height: message.message.videoMessage.height,
                    width: message.message.videoMessage.width,
                    seconds: message.message.videoMessage.seconds,
                    content: message.message.videoMessage,
                    direct: true
                };
            }
            return null;
        }
        
        // Determine media type
        if (viewOnceContent.imageMessage) {
            return {
                type: 'image',
                caption: viewOnceContent.imageMessage.caption,
                mimetype: viewOnceContent.imageMessage.mimetype,
                mediaKey: viewOnceContent.imageMessage.mediaKey,
                fileSha256: viewOnceContent.imageMessage.fileSha256,
                fileLength: viewOnceContent.imageMessage.fileLength,
                height: viewOnceContent.imageMessage.height,
                width: viewOnceContent.imageMessage.width,
                content: viewOnceContent.imageMessage,
                direct: false
            };
        } else if (viewOnceContent.videoMessage) {
            return {
                type: 'video',
                caption: viewOnceContent.videoMessage.caption,
                mimetype: viewOnceContent.videoMessage.mimetype,
                mediaKey: viewOnceContent.videoMessage.mediaKey,
                fileSha256: viewOnceContent.videoMessage.fileSha256,
                fileLength: viewOnceContent.videoMessage.fileLength,
                height: viewOnceContent.videoMessage.height,
                width: viewOnceContent.videoMessage.width,
                seconds: viewOnceContent.videoMessage.seconds,
                content: viewOnceContent.videoMessage,
                direct: false
            };
        } else if (viewOnceContent.audioMessage) {
            return {
                type: 'audio',
                mimetype: viewOnceContent.audioMessage.mimetype,
                mediaKey: viewOnceContent.audioMessage.mediaKey,
                fileSha256: viewOnceContent.audioMessage.fileSha256,
                fileLength: viewOnceContent.audioMessage.fileLength,
                seconds: viewOnceContent.audioMessage.seconds,
                content: viewOnceContent.audioMessage,
                direct: false
            };
        }
        
        return null;
    } catch (error) {
        console.error('Error in getViewOnceContent:', error);
        return null;
    }
}

// Save retrieved media to file
async function saveRetrievedMedia(mediaBuffer, metadata) {
    try {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substr(2, 9);
        const filename = `${metadata.type}_${timestamp}_${randomStr}`;
        
        let extension = '.bin'; // Default extension
        if (metadata.mimetype) {
            const parts = metadata.mimetype.split('/');
            if (parts.length > 1) {
                extension = '.' + parts[1].split(';')[0];
            }
        }
        
        // Special handling for common types
        if (metadata.type === 'image') {
            if (metadata.mimetype?.includes('jpeg') || metadata.mimetype?.includes('jpg')) {
                extension = '.jpg';
            } else if (metadata.mimetype?.includes('png')) {
                extension = '.png';
            } else if (metadata.mimetype?.includes('gif')) {
                extension = '.gif';
            }
        } else if (metadata.type === 'video') {
            if (metadata.mimetype?.includes('mp4')) {
                extension = '.mp4';
            }
        } else if (metadata.type === 'audio') {
            if (metadata.mimetype?.includes('ogg')) {
                extension = '.ogg';
            } else if (metadata.mimetype?.includes('mpeg')) {
                extension = '.mp3';
            }
        }
        
        const filepath = path.join(RETRIEVAL_DIR, `${filename}${extension}`);
        fs.writeFileSync(filepath, mediaBuffer);
        
        return {
            filepath,
            filename: `${filename}${extension}`,
            metadata
        };
    } catch (error) {
        console.error('Error saving media:', error);
        return null;
    }
}

// Setup listener once globally
let antiViewOnceListenerAttached = false;

export default {
    name: 'antiviewonce',
    description: 'Control view-once messages with different actions (works in groups and DMs)',
    category: 'moderation',
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        
        console.log(`Anti-view-once command called in ${isGroup ? 'group' : 'DM'}: ${chatId}`);
        
        // Get sender's JID
        let sender = msg.key.participant || (msg.key.fromMe ? sock.user.id : msg.key.remoteJid);
        sender = cleanJid(sender);

        // For groups, check if user is admin
        if (isGroup) {
            let isAdmin = false;
            
            try {
                const groupMetadata = await sock.groupMetadata(chatId);
                const cleanSender = cleanJid(sender);
                
                // Check if sender is admin
                const participant = groupMetadata.participants.find(p => {
                    const cleanParticipantJid = cleanJid(p.id);
                    return cleanParticipantJid === cleanSender;
                });
                
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                
            } catch (error) {
                console.error('Error fetching group metadata:', error);
            }
            
            // In groups, only admins can use the command
            if (!isAdmin) {
                return sock.sendMessage(chatId, { 
                    text: '❌ Only group admins can use this command!' 
                }, { quoted: msg });
            }
        }

        const settings = loadAntiViewOnce();
        const chatSettingsIndex = settings.findIndex(s => s.chatId === chatId);
        const currentSettings = chatSettingsIndex !== -1 ? settings[chatSettingsIndex] : null;

        const subCommand = args[0]?.toLowerCase();
        const mode = args[1]?.toLowerCase();

        // Enable debug mode if requested
        if (args.includes('debug')) {
            console.log('Debug mode enabled');
            console.log('Current settings:', currentSettings);
            console.log('All settings:', settings);
        }

        if (subCommand === 'on') {
            if (!mode || !['warn', 'retrieve', 'delete'].includes(mode)) {
                const helpText = `
⚡ *Anti View-Once Setup*

Usage: \`.antiviewonce on [mode]\`

Available modes:
• \`warn\` - Warn users who send view-once messages
• \`retrieve\` - Retrieve and save view-once media
• \`delete\` - Delete view-once messages automatically

Example: \`.antiviewonce on retrieve\`

📝 *Note:* 
- Works in both groups and private chats
- Retrieved media is saved locally
- In groups, only admins can use this command
                `.trim();
                
                return sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
            }

            const newSettings = {
                chatId,
                enabled: true,
                mode: mode,
                logRetrieved: true,
                notifySender: mode === 'retrieve' || mode === 'warn',
                exemptUsers: [],
                retrievalCount: 0,
                lastUpdated: new Date().toISOString()
            };

            if (chatSettingsIndex !== -1) {
                settings[chatSettingsIndex] = newSettings;
            } else {
                settings.push(newSettings);
            }

            saveAntiViewOnce(settings);
            
            // Attach listener if not already attached
            if (!antiViewOnceListenerAttached) {
                console.log('Attaching anti-view-once listener...');
                setupAntiViewOnceListener(sock);
                antiViewOnceListenerAttached = true;
            }

            const modeDescriptions = {
                'warn': 'Users will receive warnings when sending view-once messages',
                'retrieve': 'View-once media will be retrieved and saved',
                'delete': 'View-once messages will be automatically deleted'
            };

            const locationText = isGroup ? 'this group' : 'our chat';
            
            await sock.sendMessage(chatId, { 
                text: `✅ *Anti View-Once enabled!*\n\nMode: *${mode.toUpperCase()}*\n${modeDescriptions[mode]}\n\nEnabled in: ${locationText}\n\nTo disable: \`.antiviewonce off\`\n\nDebug: Add \`debug\` to any command for troubleshooting.` 
            }, { quoted: msg });

        } 
        else if (subCommand === 'off') {
            if (chatSettingsIndex !== -1) {
                settings.splice(chatSettingsIndex, 1);
                saveAntiViewOnce(settings);
                const locationText = isGroup ? 'this group' : 'our chat';
                await sock.sendMessage(chatId, { 
                    text: `❌ *Anti View-Once disabled!*\n\nView-once messages are now allowed in ${locationText}.` 
                }, { quoted: msg });
            } else {
                const locationText = isGroup ? 'this group' : 'our chat';
                await sock.sendMessage(chatId, { 
                    text: `ℹ️ Anti View-Once is already disabled in ${locationText}.\nView-once messages are allowed.` 
                }, { quoted: msg });
            }
        } 
        else if (subCommand === 'status') {
            if (currentSettings) {
                const status = currentSettings.enabled ? 
                    `✅ ENABLED (${currentSettings.mode.toUpperCase()} mode)` : 
                    '❌ DISABLED';
                
                const locationType = isGroup ? 'Group' : 'Private Chat';
                const retrievalCount = currentSettings.retrievalCount || 0;
                
                let statusText = `📊 *Anti View-Once Status*\n\n`;
                statusText += `• Feature: ${status}\n`;
                statusText += `• Chat type: ${locationType}\n`;
                
                if (currentSettings.enabled) {
                    statusText += `• Mode: ${currentSettings.mode}\n`;
                    statusText += `• Notify sender: ${currentSettings.notifySender ? 'Yes' : 'No'}\n`;
                    statusText += `• Media retrieved: ${retrievalCount}\n`;
                    statusText += `• Exempt users: ${currentSettings.exemptUsers?.length || 0}\n`;
                    statusText += `• Last updated: ${currentSettings.lastUpdated ? new Date(currentSettings.lastUpdated).toLocaleString() : 'Unknown'}\n\n`;
                }
                
                statusText += `*Usage:*\n`;
                statusText += `• \`.antiviewonce on warn\` - Warn users\n`;
                statusText += `• \`.antiviewonce on retrieve\` - Retrieve media\n`;
                statusText += `• \`.antiviewonce on delete\` - Delete messages\n`;
                statusText += `• \`.antiviewonce off\` - Disable\n`;
                statusText += `• \`.antiviewonce status\` - Check status\n`;
                statusText += `• \`.antiviewonce test\` - Send test view-once\n`;
                statusText += `• \`.antiviewonce debug\` - Enable debug mode`;
                
                await sock.sendMessage(chatId, { text: statusText }, { quoted: msg });
            } else {
                const locationText = isGroup ? 'this group' : 'our chat';
                await sock.sendMessage(chatId, { 
                    text: `📊 *Anti View-Once Status*\n\n❌ DISABLED\nView-once messages are allowed in ${locationText}.\n\n*To enable:*\n\`.antiviewonce on [mode]\`\n\nModes: warn, retrieve, delete` 
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'test') {
            // Send a test view-once message
            try {
                console.log('Sending test view-once message...');
                
                // Test with a simple image
                await sock.sendMessage(chatId, {
                    image: { 
                        url: 'https://via.placeholder.com/300x300/0088cc/FFFFFF?text=Test+View+Once'
                    },
                    caption: 'Test view-once image sent by bot',
                    viewOnce: true
                });
                
                await sock.sendMessage(chatId, {
                    text: '📸 *Test View-Once Sent*\n\nI\'ve sent a test view-once image to this chat.\n\nIf anti-view-once is enabled, it should:\n1. Detect the view-once message\n2. Take action based on your mode setting\n\nCheck console for debug logs.'
                }, { quoted: msg });
                
            } catch (error) {
                console.error('Error sending test view-once:', error);
                await sock.sendMessage(chatId, {
                    text: `❌ Failed to send test view-once:\n${error.message}`
                }, { quoted: msg });
            }
        }
        else if (subCommand === 'debug') {
            // Show debug information
            const debugInfo = {
                chatId,
                isGroup,
                listenerAttached: antiViewOnceListenerAttached,
                currentSettings,
                retrievalDir: RETRIEVAL_DIR,
                exists: fs.existsSync(RETRIEVAL_DIR),
                files: fs.readdirSync(RETRIEVAL_DIR).slice(0, 10) // Show first 10 files
            };
            
            console.log('Debug info:', debugInfo);
            
            let debugText = `🐛 *Debug Information*\n\n`;
            debugText += `• Chat ID: ${chatId}\n`;
            debugText += `• Chat type: ${isGroup ? 'Group' : 'Private'}\n`;
            debugText += `• Listener attached: ${antiViewOnceListenerAttached ? 'Yes' : 'No'}\n`;
            debugText += `• Anti-view-once enabled: ${currentSettings?.enabled ? 'Yes' : 'No'}\n`;
            debugText += `• Mode: ${currentSettings?.mode || 'Not set'}\n`;
            debugText += `• Retrieval directory: ${RETRIEVAL_DIR}\n`;
            debugText += `• Directory exists: ${debugInfo.exists ? 'Yes' : 'No'}\n`;
            debugText += `• Files in directory: ${debugInfo.files.length}\n\n`;
            debugText += `Check console for detailed debug information.`;
            
            await sock.sendMessage(chatId, { text: debugText }, { quoted: msg });
        }
        else {
            // Show help
            const helpText = `
👁️ *Anti View-Once Command*

Control view-once messages in both groups and private chats.

📌 *Main Commands:*
• \`.antiviewonce on [mode]\` - Enable anti-view-once
• \`.antiviewonce off\` - Disable anti-view-once
• \`.antiviewonce status\` - Check current status
• \`.antiviewonce test\` - Send test view-once message
• \`.antiviewonce debug\` - Show debug information

🎯 *Modes (choose one when enabling):*
• \`warn\` - Warn users who send view-once messages
• \`retrieve\` - Retrieve and save view-once media
• \`delete\` - Delete view-once messages automatically

📝 *Examples:*
• \`.antiviewonce on retrieve\` - Enable retrieve mode
• \`.antiviewonce on delete\` - Enable delete mode
• \`.antiviewonce test\` - Test if it's working

📁 *Storage:*
- Retrieved media is saved in: \`${RETRIEVAL_DIR}\`

⚠️ *Troubleshooting:*
1. Enable with \`.antiviewonce on retrieve\`
2. Send a view-once message to the chat
3. Check console for debug logs
4. Use \`.antiviewonce debug\` for diagnostics
            `.trim();
            
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
        }
    }
};

function setupAntiViewOnceListener(sock) {
    console.log('🔧 Setting up anti-view-once listener...');
    
    // Remove existing listener if any
    if (sock._antiViewOnceListener) {
        sock.ev.removeListener('messages.upsert', sock._antiViewOnceListener);
    }
    
    const listener = async ({ messages }) => {
        const newMsg = messages[0];
        
        // Skip if no message
        if (!newMsg) return;
        
        const chatId = newMsg.key.remoteJid;
        
        // Skip bot's own messages
        if (newMsg.key.fromMe) return;
        
        console.log('\n=== New Message Received ===');
        console.log('Chat ID:', chatId);
        console.log('From:', newMsg.key.participant || newMsg.key.remoteJid);
        console.log('Message ID:', newMsg.key.id);
        
        // Load current settings
        const settings = loadAntiViewOnce();
        const chatSettings = settings.find(s => s.chatId === chatId);
        
        // Skip if anti-view-once not enabled for this chat
        if (!chatSettings || !chatSettings.enabled) {
            console.log('Anti-view-once not enabled for this chat');
            return;
        }
        
        console.log('Anti-view-once enabled for this chat, mode:', chatSettings.mode);
        
        // Check if message is view-once
        const isViewOnce = isViewOnceMessage(newMsg);
        console.log('Is view-once message:', isViewOnce);
        
        if (!isViewOnce) {
            console.log('Not a view-once message, skipping');
            return;
        }
        
        console.log('View-once message detected!');
        
        // Get sender
        const sender = newMsg.key.participant || newMsg.key.remoteJid;
        const cleanSender = cleanJid(sender);
        const senderNumber = cleanSender.split('@')[0];
        
        console.log('Sender:', senderNumber);
        
        // Check if sender is exempt
        if (chatSettings.exemptUsers && chatSettings.exemptUsers.includes(senderNumber)) {
            console.log('Sender is exempt, allowing view-once');
            return;
        }
        
        try {
            // Get view-once content details
            const viewOnceContent = getViewOnceContent(newMsg);
            console.log('View-once content:', viewOnceContent?.type || 'Unknown');
            
            if (!viewOnceContent) {
                console.log('Could not extract view-once content');
                return;
            }
            
            // Handle based on mode
            console.log('Handling with mode:', chatSettings.mode);
            
            switch (chatSettings.mode) {
                case 'warn':
                    console.log('Warning mode triggered');
                    let warningText = `⚠️ *View-Once Warning*`;
                    
                    if (chatSettings.notifySender) {
                        warningText += ` @${senderNumber}`;
                    }
                    
                    warningText += `\n\nView-once messages are not allowed in this chat!\n`;
                    warningText += `Type: ${viewOnceContent.type}\n`;
                    
                    if (viewOnceContent.caption) {
                        warningText += `Caption: ${viewOnceContent.caption}\n`;
                    }
                    
                    warningText += `\nPlease send media without the view-once feature.`;
                    
                    const messageOptions = { quoted: newMsg };
                    if (chatSettings.notifySender) {
                        messageOptions.mentions = [cleanSender];
                    }
                    
                    await sock.sendMessage(chatId, { 
                        text: warningText
                    }, messageOptions);
                    console.log('Warning sent successfully');
                    break;
                    
                case 'retrieve':
                    console.log('Retrieve mode triggered');
                    try {
                        // Download the media
                        console.log('Attempting to download media...');
                        const mediaBuffer = await downloadMediaMessage(
                            newMsg,
                            'buffer',
                            {},
                            {
                                logger: console,
                                reuploadRequest: sock.updateMediaMessage
                            }
                        );
                        
                        if (!mediaBuffer) {
                            throw new Error('Failed to download media - buffer is empty');
                        }
                        
                        console.log(`Media downloaded, size: ${mediaBuffer.length} bytes`);
                        
                        // Save the media locally
                        console.log('Saving media to file...');
                        const savedMedia = await saveRetrievedMedia(mediaBuffer, viewOnceContent);
                        
                        if (savedMedia) {
                            // Update retrieval count
                            chatSettings.retrievalCount = (chatSettings.retrievalCount || 0) + 1;
                            chatSettings.lastUpdated = new Date().toISOString();
                            
                            // Update settings
                            const settingsIndex = settings.findIndex(s => s.chatId === chatId);
                            if (settingsIndex !== -1) {
                                settings[settingsIndex] = chatSettings;
                                saveAntiViewOnce(settings);
                            }
                            
                            console.log(`Media saved to: ${savedMedia.filepath}`);
                            
                            // Prepare notification
                            let notificationText = `🔍 *View-Once Media Retrieved*`;
                            
                            if (chatSettings.notifySender) {
                                notificationText += ` @${senderNumber}`;
                            }
                            
                            notificationText += `\n\nSaved a view-once ${viewOnceContent.type}:\n`;
                            notificationText += `• File: ${savedMedia.filename}\n`;
                            notificationText += `• Type: ${viewOnceContent.type}\n`;
                            
                            if (viewOnceContent.caption) {
                                notificationText += `• Caption: ${viewOnceContent.caption}\n`;
                            }
                            
                            notificationText += `• Size: ${Math.round(mediaBuffer.length / 1024)} KB\n`;
                            notificationText += `• Total retrieved: ${chatSettings.retrievalCount}`;
                            
                            const notifyOptions = { quoted: newMsg };
                            if (chatSettings.notifySender) {
                                notifyOptions.mentions = [cleanSender];
                            }
                            
                            await sock.sendMessage(chatId, { 
                                text: notificationText
                            }, notifyOptions);
                            console.log('Retrieval notification sent');
                        }
                        
                    } catch (retrieveError) {
                        console.error('Error retrieving view-once media:', retrieveError);
                        
                        await sock.sendMessage(chatId, { 
                            text: `❌ *Retrieval Failed*\n\nCould not retrieve the view-once ${viewOnceContent.type}.\nError: ${retrieveError.message}`
                        }, { quoted: newMsg });
                    }
                    break;
                    
                case 'delete':
                    console.log('Delete mode triggered');
                    // Send notification before deletion
                    let deleteText = `🚫 *View-Once Message Deleted*`;
                    
                    if (chatSettings.notifySender) {
                        deleteText += ` @${senderNumber}`;
                    }
                    
                    deleteText += `\n\nView-once messages are not allowed in this chat.\n`;
                    deleteText += `Your ${viewOnceContent.type} has been removed.`;
                    
                    const deleteOptions = { quoted: newMsg };
                    if (chatSettings.notifySender) {
                        deleteOptions.mentions = [cleanSender];
                    }
                    
                    await sock.sendMessage(chatId, { 
                        text: deleteText
                    }, deleteOptions);
                    console.log('Delete notification sent');
                    
                    // Try to delete the message
                    try {
                        await sock.sendMessage(chatId, { 
                            delete: newMsg.key
                        });
                        console.log('View-once message deleted successfully');
                    } catch (deleteError) {
                        console.error('Failed to delete view-once message:', deleteError);
                        await sock.sendMessage(chatId, { 
                            text: `⚠️ *Could not delete message*\n\nI need admin permissions to delete messages in groups.`
                        }, { quoted: newMsg });
                    }
                    break;
                    
                default:
                    console.log('Unknown mode:', chatSettings.mode);
            }
            
        } catch (error) {
            console.error('Error handling view-once message:', error);
            console.error('Error stack:', error.stack);
        }
        
        console.log('=== Message handling complete ===\n');
    };
    
    // Store the listener reference
    sock._antiViewOnceListener = listener;
    
    // Attach the listener
    sock.ev.on('messages.upsert', listener);
    
    console.log('✅ Anti-view-once listener attached and ready');
}

// Auto-attach listener on module load
console.log('🔄 Anti-view-once module loaded, checking if listener needs to be attached...');

// Note: We'll attach the listener when the command is first used
// This is handled in the execute function