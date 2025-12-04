import { downloadContentFromMessage } from '@whiskeysockets/baileys';

// Helper function to check if text is emoji
function isEmoji(text) {
    if (!text || typeof text !== 'string') return false;
    const trimmed = text.trim();
    
    // Common emoji patterns
    const emojiRegex = /^[\p{Emoji}\u200d]+$/u;
    const commonEmojis = ['😂', '❤️', '😍', '🔥', '👍', '👎', '😮', '😢', '😡', '🎉', '🤔', '👀'];
    
    return (emojiRegex.test(trimmed) && trimmed.length <= 5) || commonEmojis.includes(trimmed);
}

export default {
    name: 'vv',
    description: 'Download view once media and auto-send to DM when replied with emoji',
    category: 'utility',
    
    // Universal handler that detects both command and emoji replies
    async execute(sock, chatId, message, args, m) {
        try {
            const msgText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           '';
            
            // Check if it's the .vv command
            const isVvCommand = msgText.startsWith('.vv');
            
            // Check if it's an emoji reply
            const isEmojiReply = !isVvCommand && isEmoji(msgText);
            
            // Get quoted message
            const quoted = m?.quoted || message.message?.extendedTextMessage?.contextInfo?.quotedMessage;
            
            if (!quoted) {
                if (isVvCommand) {
                    await sock.sendMessage(chatId, { text: '❌ Please reply to a view-once image or video.' });
                }
                return;
            }
            
            const quotedMsg = quoted.message || quoted;
            const imageMsg = quotedMsg.imageMessage;
            const videoMsg = quotedMsg.videoMessage;
            
            // Check if quoted is view-once
            const isViewOnceImage = imageMsg?.viewOnce;
            const isViewOnceVideo = videoMsg?.viewOnce;
            
            if (!isViewOnceImage && !isViewOnceVideo) {
                if (isVvCommand) {
                    await sock.sendMessage(chatId, { text: '❌ The replied message is not a view-once media.' });
                }
                return;
            }
            
            let buffer, type, caption;
            
            // Download media
            if (isViewOnceImage) {
                const stream = await downloadContentFromMessage(imageMsg, 'image');
                buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                type = 'image';
                caption = imageMsg.caption || '📸 Downloaded from view-once';
            } else {
                const stream = await downloadContentFromMessage(videoMsg, 'video');
                buffer = Buffer.from([]);
                for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);
                type = 'video';
                caption = videoMsg.caption || '🎥 Downloaded from view-once';
            }
            
            // If it's .vv command, send to current chat
            if (isVvCommand) {
                if (type === 'image') {
                    await sock.sendMessage(chatId, { image: buffer, caption: caption });
                } else {
                    await sock.sendMessage(chatId, { video: buffer, caption: caption });
                }
                return { success: true, type: type };
            }
            
            // If it's emoji reply, send to sender's DM
            if (isEmojiReply) {
                const senderJid = message.key?.participant || message.key?.remoteJid;
                
                if (type === 'image') {
                    await sock.sendMessage(senderJid, {
                        image: buffer,
                        caption: `${caption}\n\nReplied with: ${msgText}`
                    });
                } else {
                    await sock.sendMessage(senderJid, {
                        video: buffer,
                        caption: `${caption}\n\nReplied with: ${msgText}`
                    });
                }
                
                // Optional: Send confirmation in chat
                const senderName = senderJid.split('@')[0];
                await sock.sendMessage(chatId, {
                    text: `✅ View-once media sent to @${senderName}'s DM! (Replied with ${msgText})`,
                    mentions: [senderJid]
                });
                
                return { success: true, type: 'emoji-reply', dm: true };
            }
            
        } catch (error) {
            console.error('ViewOnce handler error:', error);
            
            // Only send error if it was a .vv command
            const msgText = message.message?.conversation || 
                           message.message?.extendedTextMessage?.text || 
                           '';
            
            if (msgText.startsWith('.vv')) {
                await sock.sendMessage(chatId, { 
                    text: '❌ Failed to process. Media may have expired.' 
                });
            }
            
            return { success: false, error: error.message };
        }
    }
};