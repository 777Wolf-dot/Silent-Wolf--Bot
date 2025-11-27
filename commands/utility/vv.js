import { downloadMediaMessage } from '@whiskeysockets/baileys';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global storage for view once messages
if (!global.viewOnceMessages) {
    global.viewOnceMessages = new Map();
}

export default {
    name: 'vv',
    description: 'Download view once media and handle emoji replies to user DM',
    category: 'utility',
    
    // Use execute instead of handle to match your bot's structure
    async execute(message, bot, args) {
        try {
            const chat = await message.getChat();
            const quotedMessage = message.hasQuotedMsg ? await message.getQuotedMessage() : null;

            // Handle direct vv command on view once media
            if (quotedMessage && quotedMessage.type === 'view_once') {
                await this.downloadAndSendViewOnce(quotedMessage, message, bot, 'command');
            } 
            // Handle view once message directly
            else if (message.type === 'view_once') {
                await this.downloadAndSendViewOnce(message, message, bot, 'command');
            }
            else {
                await message.reply('❌ Please reply to a view once message with `.vv` or use this command on a view once message.');
            }

        } catch (error) {
            console.error('Error in vv command:', error);
            await message.reply('❌ An error occurred while processing the media.');
        }
    },

    // Main function to download and handle view once media
    async downloadAndSendViewOnce(targetMessage, originalMessage, bot, triggerType = 'command') {
        try {
            // Download the media
            const media = await downloadMediaMessage(targetMessage, 'buffer', {});
            
            if (!media) {
                await originalMessage.reply('❌ Failed to download media.');
                return;
            }

            // Get file extension and create filename
            const mimeType = targetMessage.mimetype || 'image/jpeg';
            const ext = mimeType.split('/')[1] || 'jpg';
            const timestamp = Date.now();
            const filename = `view_once_${timestamp}.${ext}`;
            const filePath = path.join(process.cwd(), 'media', 'view_once', filename);

            // Ensure directory exists
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            // Save file
            fs.writeFileSync(filePath, media);

            // Store message info for emoji reply handling
            this.storeViewOnceMessage(targetMessage.id._serialized, {
                filename: filename,
                filePath: filePath,
                sender: originalMessage.author || originalMessage.from,
                timestamp: timestamp,
                chatId: (await originalMessage.getChat()).id._serialized,
                mimeType: mimeType,
                mediaBuffer: media // Store buffer for immediate use
            });

            if (triggerType === 'command') {
                // Send confirmation with media to current chat
                await originalMessage.reply(`✅ View once media saved!\n📁 Filename: ${filename}`);
                
                // Send the actual media back to chat
                const mediaMessage = {
                    [mimeType.split('/')[0]]: media
                };
                
                await originalMessage.reply(mediaMessage, (await originalMessage.getChat()).id._serialized, {
                    caption: `📸 View Once Media\n⏰ ${new Date().toLocaleString()}`
                });
            } else if (triggerType === 'emoji') {
                // For emoji replies, send to user's DM only
                await this.sendToUserDM(media, filename, mimeType, targetMessage, originalMessage, bot);
                await originalMessage.react('✅');
            }

        } catch (error) {
            console.error('Error downloading view once media:', error);
            if (triggerType === 'command') {
                await originalMessage.reply('❌ Failed to process view once media.');
            }
        }
    },

    // Send media to user's DM (the person who sent the emoji)
    async sendToUserDM(media, filename, mimeType, targetMessage, originalMessage, bot) {
        try {
            const userId = originalMessage.author || originalMessage.from;
            
            if (!userId) {
                console.error('User ID not found');
                return false;
            }

            const mediaType = mimeType.split('/')[0];
            const mediaMessage = {
                [mediaType]: media
            };

            const caption = `🔒 View Once Media Saved\n\n` +
                           `💬 Triggered by: ${originalMessage.body}\n` +
                           `⏰ Time: ${new Date().toLocaleString()}\n` +
                           `📁 Filename: ${filename}`;

            // Send to user's DM (private chat)
            await bot.sendMessage(userId, mediaMessage, { caption: caption });
            
            console.log(`View once media sent to user DM via emoji reply: ${filename}`);
            return true;

        } catch (error) {
            console.error('Error sending to user DM:', error);
            return false;
        }
    },

    // Store view once message info for emoji reply handling
    storeViewOnceMessage(messageId, messageInfo) {
        // Store for 2 hours (longer for reply handling)
        global.viewOnceMessages.set(messageId, messageInfo);
        
        // Auto cleanup after 2 hours
        setTimeout(() => {
            if (global.viewOnceMessages.has(messageId)) {
                const storedInfo = global.viewOnceMessages.get(messageId);
                // Optional: Delete the file too
                try {
                    if (fs.existsSync(storedInfo.filePath)) {
                        fs.unlinkSync(storedInfo.filePath);
                    }
                } catch (e) {
                    console.log('Error deleting file during cleanup:', e);
                }
                global.viewOnceMessages.delete(messageId);
            }
        }, 2 * 60 * 60 * 1000);
    },

    // Check if text contains only emojis
    isEmojiOnly(text) {
        if (!text) return false;
        
        // Common emojis that trigger the feature
        const triggerEmojis = [
            '⭐', '💾', '📥', '🔖', '📸', '❤️', '🔥', '😍', 
            '👍', '📷', '🎥', '📹', '😊', '😂', '🤩', '👏',
            '🎉', '💯', '👌', '🫡', '🙏', '🥰', '🤗', '😎'
        ];
        
        // Check if message is exactly one of the trigger emojis
        const trimmedText = text.trim();
        return triggerEmojis.includes(trimmedText) || 
               (trimmedText.length <= 3 && /^\p{Emoji}+$/u.test(trimmedText)); // Any emoji (1-3 chars)
    },

    // Auto-initialize when command is loaded
    init(bot) {
        console.log('🔄 vv.js command initialized with auto-reply detection');
        
        // Store bot instance for event listeners
        this.bot = bot;
        
        // Listen to all messages to detect emoji replies
        if (bot.ev) {
            bot.ev.on('messages.upsert', async ({ messages }) => {
                try {
                    for (const message of messages) {
                        if (message.key && message.message) {
                            await this.checkForEmojiReply(message, bot);
                        }
                    }
                } catch (error) {
                    console.error('Error in vv.js auto-reply detection:', error);
                }
            });
        }
    },

    // Check if message is an emoji reply to view once media
    async checkForEmojiReply(message, bot) {
        try {
            // Check if message has quoted message
            const contextInfo = message.message.extendedTextMessage?.contextInfo;
            if (!contextInfo || !contextInfo.stanzaId) return;

            const quotedMessageId = contextInfo.stanzaId;
            const replyText = message.message.conversation || 
                             message.message.extendedTextMessage?.text || 
                             '';

            // Check if reply is emoji-only
            if (!this.isEmojiOnly(replyText)) return;

            // Check if quoted message is view once
            const quotedMessageInfo = global.viewOnceMessages.get(quotedMessageId);
            if (quotedMessageInfo) {
                console.log(`🎯 Auto-detected emoji reply to view once: ${replyText}`);
                
                // Use stored media buffer to send to user's DM
                await this.sendToUserDM(
                    quotedMessageInfo.mediaBuffer,
                    quotedMessageInfo.filename,
                    quotedMessageInfo.mimeType,
                    { id: { _serialized: quotedMessageId } },
                    message,
                    bot
                );

                // React with ✅ to confirm
                try {
                    await bot.sendMessage(message.key.remoteJid, {
                        react: {
                            text: '✅',
                            key: message.key
                        }
                    });
                } catch (reactError) {
                    console.log('Could not send reaction:', reactError);
                }
            }

        } catch (error) {
            console.error('Error checking for emoji reply:', error);
        }
    }
};