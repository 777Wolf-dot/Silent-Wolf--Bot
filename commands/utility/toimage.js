// File: ./commands/media/toimage.js - ULTRA SIMPLE WORKING VERSION
export default {
    name: 'toimage',
    alias: ['sticker2img'],
    category: 'media',
    description: 'Convert stickers to images - SIMPLE & WORKING',
    
    async execute(sock, msg, args, PREFIX) {
        const chatId = msg.key.remoteJid;
        
        // Get sticker
        const stickerMsg = msg.message?.stickerMessage || 
                          msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.stickerMessage;
        
        if (!stickerMsg) {
            return sock.sendMessage(chatId, {
                text: `Reply to a sticker with ${PREFIX}toimage`
            }, { quoted: msg });
        }
        
        try {
            // Send processing message
            await sock.sendMessage(chatId, {
                text: `Downloading...`
            }, { quoted: msg });
            
            // Download sticker
            const stream = await sock.downloadMediaMessage(msg);
            const chunks = [];
            
            for await (const chunk of stream) {
                chunks.push(chunk);
            }
            
            const buffer = Buffer.concat(chunks);
            
            if (buffer.length === 0) {
                throw new Error('Empty download');
            }
            
            // THE KEY: Use very simple parameters
            const imageParams = {
                image: buffer,
                caption: 'Sticker converted to image',
                fileName: 'sticker.webp'
            };
            
            console.log(`Sending ${buffer.length} bytes as image...`);
            
            // Send with timeout
            const sendPromise = sock.sendMessage(chatId, imageParams);
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => reject(new Error('Send timeout')), 10000);
            });
            
            const result = await Promise.race([sendPromise, timeoutPromise]);
            
            if (result && result.key && result.key.id) {
                console.log('✅ Image sent successfully!');
                // Optional: Send confirmation
                await sock.sendMessage(chatId, {
                    text: '✅ Image sent! Check your chat.'
                });
            } else {
                throw new Error('No send confirmation');
            }
            
        } catch (error) {
            console.error('Error:', error);
            
            // Try alternative method as document
            try {
                // Re-download
                const stream = await sock.downloadMediaMessage(msg);
                const chunks = [];
                for await (const chunk of stream) chunks.push(chunk);
                const buffer = Buffer.concat(chunks);
                
                // Send as document
                await sock.sendMessage(chatId, {
                    document: buffer,
                    fileName: 'sticker.webp',
                    mimetype: 'image/webp',
                    caption: 'Sticker (sent as document)'
                });
                
                console.log('✅ Sent as document instead');
                
            } catch (finalError) {
                console.error('Final error:', finalError);
                
                await sock.sendMessage(chatId, {
                    text: `Failed: ${error.message}\n\nTry a different sticker.`
                }, { quoted: msg });
            }
        }
    }
};