











// // File: ./commands/utility/antidelete.js - CLEAN FIXED VERSION
// export default {
//     name: 'antidelete',
//     alias: ['undelete', 'antidel'],
//     description: 'Capture deleted messages with proper media handling',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX) {
//         const chatId = msg.key.remoteJid;
        
//         console.log('🚫 Antidelete System');
        
//         // Initialize global tracker
//         if (!global.antideleteTerminal) {
//             global.antideleteTerminal = {
//                 active: false,
//                 messageCache: new Map(), // Stores all messages
//                 listenerSetup: false,
//                 notifyInChat: true,
//                 stats: {
//                     deletionsDetected: 0,
//                     retrievedSuccessfully: 0,
//                     mediaRetrieved: 0,
//                     falsePositives: 0
//                 },
//                 // FIX: Track seen messages to avoid false positives
//                 seenMessages: new Map(), // messageId -> timestamp
//                 // FIX: Track which messages we've already processed for deletion
//                 processedDeletions: new Set(),
//                 // Media handling
//                 mediaBufferCache: new Map(), // messageId -> buffer
//                 lastCleanup: Date.now()
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // Clean log helper
//         function cleanLog(message, type = 'info') {
//             const prefixes = {
//                 'info': '📝',
//                 'success': '✅',
//                 'error': '❌',
//                 'warning': '⚠️',
//                 'system': '🚫',
//                 'media': '📷',
//                 'deletion': '🗑️'
//             };
            
//             console.log(`${prefixes[type] || '📝'} ${message}`);
//         }
        
//         // Cleanup old data periodically
//         function cleanupOldData() {
//             const now = Date.now();
//             const fiveMinutes = 5 * 60 * 1000;
            
//             // Clean seen messages older than 5 minutes
//             for (const [msgId, timestamp] of tracker.seenMessages.entries()) {
//                 if (now - timestamp > fiveMinutes) {
//                     tracker.seenMessages.delete(msgId);
//                 }
//             }
            
//             // Clean message cache older than 10 minutes
//             for (const [msgId, data] of tracker.messageCache.entries()) {
//                 if (now - data.timestamp > 10 * 60 * 1000) {
//                     tracker.messageCache.delete(msgId);
//                     tracker.mediaBufferCache.delete(msgId);
//                 }
//             }
            
//             // Clean processed deletions older than 1 minute
//             if (tracker.processedDeletions.size > 1000) {
//                 // Just clear if too large
//                 tracker.processedDeletions.clear();
//             }
            
//             tracker.lastCleanup = now;
//         }
        
//         // Setup listener with proper deletion detection
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog('Setting up antidelete listener...', 'system');
//             cleanLog(`Chat notifications: ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`, 'info');
            
//             // Store ALL incoming messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     // FIX: Only store non-bot messages that are being notified
//                     if (type === 'notify') {
//                         for (const message of messages) {
//                             // Skip bot's own messages
//                             if (message.key?.fromMe) continue;
                            
//                             const msgId = message.key?.id;
//                             if (!msgId) continue;
                            
//                             // Mark as seen
//                             tracker.seenMessages.set(msgId, Date.now());
                            
//                             // Store the message
//                             await storeMessage(message);
//                         }
//                     }
                    
//                     // Periodic cleanup
//                     if (Date.now() - tracker.lastCleanup > 60000) { // Every minute
//                         cleanupOldData();
//                     }
                    
//                 } catch (error) {
//                     cleanLog(`Storage error: ${error.message}`, 'error');
//                 }
//             });
            
//             // FIXED: Better deletion detection - only trigger on actual deletions
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
//                         const messageId = update.key?.id;
//                         const chatId = update.key?.remoteJid;
                        
//                         if (!messageId || !chatId) continue;
                        
//                         // FIX: Check if this is an actual deletion
//                         // WhatsApp Web sends status=6 when message is deleted
//                         const isDeleted = 
//                             updateData.status === 6 || // Message revoked
//                             updateData.message === null || // Message removed
//                             (updateData.messageStubType === 7) || // Message deleted for me
//                             (updateData.messageStubType === 8); // Message deleted for everyone
                        
//                         if (isDeleted) {
//                             // Avoid processing the same deletion multiple times
//                             if (tracker.processedDeletions.has(messageId)) {
//                                 continue;
//                             }
                            
//                             tracker.processedDeletions.add(messageId);
                            
//                             // Remove from processed deletions after 10 seconds
//                             setTimeout(() => {
//                                 tracker.processedDeletions.delete(messageId);
//                             }, 10000);
                            
//                             cleanLog(`Deletion detected: ${messageId.substring(0, 8)}...`, 'deletion');
//                             tracker.stats.deletionsDetected++;
                            
//                             await handleDeletedMessage(update.key);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Detection error: ${error.message}`, 'error');
//                 }
//             });
            
//             tracker.listenerSetup = true;
//             cleanLog('Antidelete listener ready', 'success');
//         }
        
//         // Store message with media buffer capture
//         async function storeMessage(message) {
//             try {
//                 const msgId = message.key.id;
//                 const msgChat = message.key.remoteJid;
                
//                 // Don't store if already in cache
//                 if (tracker.messageCache.has(msgId)) {
//                     return;
//                 }
                
//                 const sender = message.key.participant || msgChat;
//                 const isGroup = msgChat.endsWith('@g.us');
//                 const isLid = msgChat.includes('@lid');
                
//                 // Extract message content
//                 let text = '';
//                 let type = 'text';
//                 let fileName = '';
//                 let caption = '';
//                 let hasMedia = false;
//                 let mediaBuffer = null;
                
//                 const msgContent = message.message;
                
//                 // Extract text and determine type
//                 if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 } 
                
//                 // Check for media types
//                 if (msgContent?.imageMessage) {
//                     type = 'image';
//                     caption = msgContent.imageMessage.caption || '';
//                     hasMedia = true;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     caption = msgContent.videoMessage.caption || '';
//                     hasMedia = true;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     hasMedia = true;
//                     if (!text) text = 'Audio message';
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     fileName = msgContent.documentMessage.fileName || 'Document';
//                     hasMedia = true;
//                     if (!text) text = fileName;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     hasMedia = true;
//                     if (!text) text = 'Sticker';
//                 } else if (msgContent?.contactMessage) {
//                     type = 'contact';
//                     if (!text) text = 'Contact';
//                 } else if (msgContent?.locationMessage) {
//                     type = 'location';
//                     if (!text) text = 'Location';
//                 }
                
//                 // Use caption if no text
//                 if (!text && caption) {
//                     text = caption;
//                 }
                
//                 // FIX: Try to download media immediately and store buffer
//                 if (hasMedia && msgContent) {
//                     try {
//                         // Use the correct method to download media
//                         mediaBuffer = await downloadMediaMessage(message);
//                         if (mediaBuffer) {
//                             tracker.mediaBufferCache.set(msgId, {
//                                 buffer: mediaBuffer,
//                                 type: type,
//                                 timestamp: Date.now()
//                             });
//                             cleanLog(`Media downloaded: ${type} (${msgId.substring(0, 8)}...)`, 'media');
//                         }
//                     } catch (mediaError) {
//                         cleanLog(`Media download failed: ${mediaError.message}`, 'warning');
//                     }
//                 }
                
//                 const messageDetails = {
//                     id: msgId,
//                     chat: msgChat,
//                     sender: sender,
//                     senderShort: sender.split('@')[0],
//                     isGroup: isGroup,
//                     isLid: isLid,
//                     timestamp: Date.now(),
//                     messageTimestamp: message.messageTimestamp || Date.now(),
//                     pushName: message.pushName || 'Unknown',
//                     text: text,
//                     type: type,
//                     hasMedia: hasMedia,
//                     fileName: fileName,
//                     caption: caption,
//                     originalMessage: message,
//                     hasBuffer: !!mediaBuffer
//                 };
                
//                 tracker.messageCache.set(msgId, messageDetails);
                
//                 // Log storage
//                 if (hasMedia) {
//                     cleanLog(`Stored ${type}: ${msgId.substring(0, 8)}...`, 'info');
//                 }
                
//             } catch (error) {
//                 cleanLog(`Store error: ${error.message}`, 'error');
//             }
//         }
        
//         // FIXED: Correct media download function
//         async function downloadMediaMessage(message) {
//             try {
//                 // Method 1: Try using downloadMediaMessage if available
//                 if (typeof sock.downloadMediaMessage === 'function') {
//                     return await sock.downloadMediaMessage(message);
//                 }
                
//                 // Method 2: Try using message.download() if available
//                 if (message.download && typeof message.download === 'function') {
//                     return await message.download();
//                 }
                
//                 // Method 3: Extract media data and download manually
//                 const msgContent = message.message;
//                 let mediaMessage = null;
                
//                 if (msgContent?.imageMessage) {
//                     mediaMessage = msgContent.imageMessage;
//                 } else if (msgContent?.videoMessage) {
//                     mediaMessage = msgContent.videoMessage;
//                 } else if (msgContent?.audioMessage) {
//                     mediaMessage = msgContent.audioMessage;
//                 } else if (msgContent?.documentMessage) {
//                     mediaMessage = msgContent.documentMessage;
//                 } else if (msgContent?.stickerMessage) {
//                     mediaMessage = msgContent.stickerMessage;
//                 }
                
//                 if (mediaMessage && sock.downloadAndSaveMediaMessage) {
//                     return await sock.downloadAndSaveMediaMessage(mediaMessage);
//                 }
                
//                 // Method 4: Last resort - try generic download
//                 if (mediaMessage && mediaMessage.url) {
//                     // This would need proper implementation based on your library
//                     cleanLog('Advanced media download required', 'warning');
//                 }
                
//                 return null;
                
//             } catch (error) {
//                 cleanLog(`Download error: ${error.message}`, 'error');
//                 return null;
//             }
//         }
        
//         // Handle deleted message
//         async function handleDeletedMessage(deletedKey) {
//             try {
//                 const deletedId = deletedKey.id;
//                 const chatId = deletedKey.remoteJid;
                
//                 if (!deletedId) {
//                     cleanLog('No message ID in deletion event', 'error');
//                     return;
//                 }
                
//                 cleanLog(`Looking for message: ${deletedId.substring(0, 8)}...`, 'info');
                
//                 // Check cache for the deleted message
//                 const cachedMessage = tracker.messageCache.get(deletedId);
                
//                 if (cachedMessage) {
//                     cleanLog(`Found in cache: ${deletedId.substring(0, 8)}...`, 'success');
//                     cleanLog(`Type: ${cachedMessage.type}`, 'info');
                    
//                     // Remove from cache
//                     tracker.messageCache.delete(deletedId);
                    
//                     // Show and resend the message
//                     await processDeletedMessage(cachedMessage);
                    
//                     tracker.stats.retrievedSuccessfully++;
//                     if (cachedMessage.hasMedia) {
//                         tracker.stats.mediaRetrieved++;
//                     }
                    
//                     return;
//                 }
                
//                 // Message not found in cache
//                 cleanLog(`Not found in cache: ${deletedId.substring(0, 8)}...`, 'warning');
//                 cleanLog(`Cache size: ${tracker.messageCache.size} messages`, 'info');
                
//                 // Check if this might be a false positive
//                 const wasSeen = tracker.seenMessages.has(deletedId);
//                 if (!wasSeen) {
//                     tracker.stats.falsePositives++;
//                     cleanLog(`Possible false positive - message never seen`, 'warning');
//                 }
                
//                 showFailedNotification(deletedKey, chatId, wasSeen);
                
//             } catch (error) {
//                 cleanLog(`Retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Process and resend deleted message
//         async function processDeletedMessage(messageDetails) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const chatType = messageDetails.isGroup ? 'GROUP' : 
//                                 (messageDetails.isLid ? 'LID' : 'DM');
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 // Terminal display
//                 console.log('\n' + '─'.repeat(60));
//                 console.log('🚫  DELETED MESSAGE CAPTURED  🚫');
//                 console.log('─'.repeat(60));
                
//                 console.log(`Chat: ${chatType}`);
//                 console.log(`From: ${senderName} (${messageDetails.senderShort})`);
//                 console.log(`Time: ${time}`);
//                 console.log(`Type: ${messageDetails.type.toUpperCase()}`);
                
//                 if (messageDetails.text) {
//                     console.log('\nContent:');
//                     console.log('─'.repeat(40));
//                     const displayText = messageDetails.text.length > 200 ? 
//                         messageDetails.text.substring(0, 200) + '...' : messageDetails.text;
//                     console.log(displayText);
//                     console.log('─'.repeat(40));
//                 }
                
//                 if (messageDetails.fileName) {
//                     console.log(`File: ${messageDetails.fileName}`);
//                 }
                
//                 console.log(`ID: ${messageDetails.id.substring(0, 12)}...`);
//                 console.log('─'.repeat(60) + '\n');
                
//                 // Send to chat
//                 if (tracker.notifyInChat && tracker.active) {
//                     await resendMessageToChat(messageDetails);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Display error: ${error.message}`, 'error');
//             }
//         }
        
//         // Resend message to chat with media support
//         async function resendMessageToChat(messageDetails) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 let headerMessage = `🚫 *DELETED MESSAGE*\n\n`;
//                 headerMessage += `👤 *From:* ${senderName}\n`;
//                 headerMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//                 headerMessage += `🕒 *Time:* ${time}\n`;
//                 headerMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
                
//                 // Check if we have media buffer
//                 const mediaCache = tracker.mediaBufferCache.get(messageDetails.id);
                
//                 if (messageDetails.hasMedia && mediaCache?.buffer) {
//                     await resendMediaWithBuffer(messageDetails, mediaCache, headerMessage);
//                 } else {
//                     // Text-only or media without buffer
//                     await sendTextNotification(messageDetails, headerMessage);
//                 }
                
//                 // Clean up buffer cache
//                 tracker.mediaBufferCache.delete(messageDetails.id);
                
//             } catch (error) {
//                 cleanLog(`Resend error: ${error.message}`, 'error');
                
//                 // Fallback to simple text notification
//                 try {
//                     await sock.sendMessage(messageDetails.chat, {
//                         text: `🚫 *Deleted ${messageDetails.type.toUpperCase()}*\n\nFrom: ${messageDetails.senderShort}\nTime: ${time}\n\n(Could not retrieve full content)`
//                     });
//                 } catch (fallbackError) {
//                     cleanLog(`Fallback also failed: ${fallbackError.message}`, 'error');
//                 }
//             }
//         }
        
//         // Resend media using stored buffer
//         async function resendMediaWithBuffer(messageDetails, mediaCache, headerMessage) {
//             try {
//                 cleanLog(`Resending ${messageDetails.type}...`, 'media');
                
//                 const buffer = mediaCache.buffer;
//                 const caption = messageDetails.caption ? 
//                     `${headerMessage}\n💬 *Caption:* ${messageDetails.caption}\n\n🔍 *Captured by antidelete*` :
//                     `${headerMessage}\n\n🔍 *Captured by antidelete*`;
                
//                 let mediaMessage = {};
                
//                 switch(messageDetails.type) {
//                     case 'image':
//                         mediaMessage = {
//                             image: buffer,
//                             caption: caption,
//                             mimetype: 'image/jpeg'
//                         };
//                         break;
                        
//                     case 'video':
//                         mediaMessage = {
//                             video: buffer,
//                             caption: caption,
//                             mimetype: 'video/mp4'
//                         };
//                         break;
                        
//                     case 'audio':
//                         mediaMessage = {
//                             audio: buffer,
//                             mimetype: 'audio/mp4',
//                             ptt: false
//                         };
//                         break;
                        
//                     case 'document':
//                         mediaMessage = {
//                             document: buffer,
//                             fileName: messageDetails.fileName || 'document',
//                             caption: caption,
//                             mimetype: 'application/octet-stream'
//                         };
//                         break;
                        
//                     case 'sticker':
//                         mediaMessage = {
//                             sticker: buffer,
//                             mimetype: 'image/webp'
//                         };
//                         break;
                        
//                     default:
//                         throw new Error(`Unsupported media type: ${messageDetails.type}`);
//                 }
                
//                 await sock.sendMessage(messageDetails.chat, mediaMessage);
//                 cleanLog(`${messageDetails.type.toUpperCase()} resent successfully`, 'success');
                
//             } catch (error) {
//                 cleanLog(`Media resend failed: ${error.message}`, 'error');
//                 throw error; // Let it fall back to text notification
//             }
//         }
        
//         // Send text notification
//         async function sendTextNotification(messageDetails, headerMessage) {
//             if (messageDetails.text && messageDetails.text.trim()) {
//                 const displayText = messageDetails.text.length > 500 ? 
//                     messageDetails.text.substring(0, 500) + '...' : messageDetails.text;
//                 headerMessage += `\n💬 *Message:*\n${displayText}\n`;
//             }
            
//             if (messageDetails.fileName) {
//                 headerMessage += `\n📄 *File:* ${messageDetails.fileName}\n`;
//             }
            
//             if (messageDetails.hasMedia && !messageDetails.text) {
//                 headerMessage += `\n📎 *Media file (content not retrievable)*\n`;
//             }
            
//             headerMessage += `\n────────────\n`;
//             headerMessage += `🔍 *Captured by antidelete*`;
            
//             await sock.sendMessage(messageDetails.chat, { text: headerMessage });
//             cleanLog('Text notification sent', 'success');
//         }
        
//         // Show failed notification
//         function showFailedNotification(deletedKey, chatId, wasSeen) {
//             const now = new Date().toLocaleTimeString();
//             const chatShort = chatId.split('@')[0];
            
//             console.log('\n' + '─'.repeat(50));
//             console.log('⚠️  DELETION NOT CAPTURED  ⚠️');
//             console.log('─'.repeat(50));
//             console.log(`Time: ${now}`);
//             console.log(`Chat: ${chatShort}`);
//             console.log(`ID: ${deletedKey.id?.substring(0, 8) || 'unknown'}...`);
//             console.log(`Previously seen: ${wasSeen ? 'YES' : 'NO'}`);
//             console.log('─'.repeat(50) + '\n');
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 tracker.active = true;
//                 tracker.stats.deletionsDetected = 0;
//                 tracker.stats.retrievedSuccessfully = 0;
//                 tracker.stats.mediaRetrieved = 0;
//                 tracker.stats.falsePositives = 0;
                
//                 setupTerminalListener();
                
//                 cleanLog('Antidelete ENABLED', 'success');
//                 cleanLog('False positive detection: ACTIVE', 'info');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\nNow capturing deleted messages with:\n• Text messages\n• Images 📷\n• Videos 🎥\n• Audio 🔊\n• Documents 📄\n• Stickers 😄\n\nUse \`${PREFIX}antidelete test\` to verify.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'disable':
//             case 'stop':
//                 tracker.active = false;
//                 cleanLog('Antidelete DISABLED', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE DISABLED*\n\nUse \`${PREFIX}antidelete on\` to enable again.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//                 cleanLog('Sending test messages...', 'info');
                
//                 // Send text test
//                 await sock.sendMessage(chatId, {
//                     text: `🧪 *TEXT TEST*\n\nDelete this message to test text retrieval!\n\nTimestamp: ${Date.now()}`
//                 });
                
//                 // Send image test (if URL is available)
//                 try {
//                     await sock.sendMessage(chatId, {
//                         image: { url: 'https://picsum.photos/200/300' },
//                         caption: '🧪 *IMAGE TEST*\n\nDelete this image to test media retrieval!'
//                     });
//                 } catch (e) {
//                     cleanLog('Image test skipped (URL not available)', 'warning');
//                 }
                
//                 cleanLog('Test messages sent - Delete them to test!', 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Test Messages Sent*\n\n1. Text message\n2. Image (if supported)\n\nDelete each one to test antidelete!`
//                 });
//                 break;
                
//             case 'stats':
//                 console.log('\n📊 ANTIDELETE STATISTICS');
//                 console.log('─'.repeat(50));
//                 console.log(`Status: ${tracker.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
//                 console.log(`Messages in cache: ${tracker.messageCache.size}`);
//                 console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
//                 console.log(`Seen messages: ${tracker.seenMessages.size}`);
//                 console.log(`\n📈 PERFORMANCE:`);
//                 console.log(`Deletions detected: ${tracker.stats.deletionsDetected}`);
//                 console.log(`Successfully retrieved: ${tracker.stats.retrievedSuccessfully}`);
//                 console.log(`Media retrieved: ${tracker.stats.mediaRetrieved}`);
//                 console.log(`False positives: ${tracker.stats.falsePositives}`);
                
//                 if (tracker.stats.deletionsDetected > 0) {
//                     const successRate = Math.round((tracker.stats.retrievedSuccessfully / tracker.stats.deletionsDetected) * 100);
//                     const falsePositiveRate = Math.round((tracker.stats.falsePositives / tracker.stats.deletionsDetected) * 100);
//                     console.log(`\n📊 RATES:`);
//                     console.log(`Success rate: ${successRate}%`);
//                     console.log(`False positive rate: ${falsePositiveRate}%`);
//                 }
                
//                 console.log('─'.repeat(50));
                
//                 await sock.sendMessage(chatId, {
//                     text: `📊 Stats sent to terminal\n\nSuccess rate: ${tracker.stats.deletionsDetected > 0 ? Math.round((tracker.stats.retrievedSuccessfully / tracker.stats.deletionsDetected) * 100) : 0}%`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 console.log('\n🔧 SYSTEM DEBUG');
//                 console.log('─'.repeat(60));
//                 console.log(`Active: ${tracker.active ? '✅ YES' : '❌ NO'}`);
//                 console.log(`Listener: ${tracker.listenerSetup ? '✅ SETUP' : '❌ NOT SETUP'}`);
//                 console.log(`Message cache: ${tracker.messageCache.size}`);
//                 console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
//                 console.log(`Seen messages: ${tracker.seenMessages.size}`);
//                 console.log(`Processed deletions: ${tracker.processedDeletions.size}`);
                
//                 // Show cache sample
//                 if (tracker.messageCache.size > 0) {
//                     console.log('\n📋 CACHE SAMPLE (first 3):');
//                     let count = 0;
//                     for (const [id, data] of tracker.messageCache.entries()) {
//                         if (count >= 3) break;
//                         const hasBuffer = tracker.mediaBufferCache.has(id) ? '✅' : '❌';
//                         console.log(`  ${id.substring(0, 8)}... - ${data.type} ${hasBuffer} buffer`);
//                         count++;
//                     }
//                 }
                
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clear':
//                 if (args[1] === 'cache') {
//                     const msgCount = tracker.messageCache.size;
//                     const bufferCount = tracker.mediaBufferCache.size;
                    
//                     tracker.messageCache.clear();
//                     tracker.mediaBufferCache.clear();
//                     tracker.seenMessages.clear();
//                     tracker.processedDeletions.clear();
                    
//                     cleanLog(`Cleared ${msgCount} messages and ${bufferCount} media buffers`, 'success');
                    
//                     await sock.sendMessage(chatId, {
//                         text: `🧹 Cleared ${msgCount} messages and ${bufferCount} media buffers`
//                     }, { quoted: msg });
//                 } else {
//                     console.clear();
//                     console.log('🚫 ANTIDELETE SYSTEM');
//                     console.log('─'.repeat(40));
//                     console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                     console.log(`Cache: ${tracker.messageCache.size} messages`);
//                     console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
                    
//                     await sock.sendMessage(chatId, {
//                         text: '🧹 Terminal cleared'
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'notify':
//                 const setting = args[1]?.toLowerCase();
//                 if (setting === 'on') {
//                     tracker.notifyInChat = true;
//                     cleanLog('Chat notifications ON', 'success');
//                     await sock.sendMessage(chatId, {
//                         text: '🔔 *Chat notifications ENABLED*'
//                     }, { quoted: msg });
//                 } else if (setting === 'off') {
//                     tracker.notifyInChat = false;
//                     cleanLog('Chat notifications OFF', 'info');
//                     await sock.sendMessage(chatId, {
//                         text: '🔕 *Chat notifications DISABLED*'
//                     }, { quoted: msg });
//                 } else {
//                     cleanLog(`Notifications: ${tracker.notifyInChat ? 'ON' : 'OFF'}`, 'info');
//                     await sock.sendMessage(chatId, {
//                         text: `🔔 *Notifications:* ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'help':
//                 console.log('\n🆘 ANTIDELETE HELP');
//                 console.log('─'.repeat(60));
//                 console.log('Commands:');
//                 console.log(`• ${PREFIX}antidelete on/off      - Enable/disable`);
//                 console.log(`• ${PREFIX}antidelete test        - Test the system`);
//                 console.log(`• ${PREFIX}antidelete stats       - Show statistics`);
//                 console.log(`• ${PREFIX}antidelete debug       - System debug info`);
//                 console.log(`• ${PREFIX}antidelete clear cache - Clear all cache`);
//                 console.log(`• ${PREFIX}antidelete notify on/off - Toggle notifications`);
//                 console.log(`• ${PREFIX}antidelete help        - This help`);
//                 console.log('');
//                 console.log('Features:');
//                 console.log('• Text message retrieval');
//                 console.log('• Media retrieval (images, videos, audio, etc.)');
//                 console.log('• False positive detection');
//                 console.log('• Clean terminal logs');
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🆘 *Antidelete Help*\n\nCaptures deleted messages including media.\nFalse positive detection helps avoid incorrect alerts.\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 console.log('\n🚫 ANTIDELETE SYSTEM');
//                 console.log('');
//                 console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Cache: ${tracker.messageCache.size} messages`);
//                 console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
//                 console.log(`False positives prevented: ${tracker.stats.falsePositives}`);
//                 console.log('');
//                 console.log(`Use \`${PREFIX}antidelete on\` to enable`);
//                 console.log(`Use \`${PREFIX}antidelete test\` to test`);
                
//                 await sock.sendMessage(chatId, {
//                     text: `🚫 *Antidelete System*\n\nStatus: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\nFalse positive detection: ✅ ENABLED\n\nUse \`${PREFIX}antidelete help\` for commands.`
//                 }, { quoted: msg });
//         }
//     }
// };





















// // File: ./commands/utility/antidelete.js - ENHANCED MEDIA RETRIEVAL VERSION
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';

// // Get current directory for file storage
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');

// export default {
//     name: 'antidelete',
//     alias: ['undelete', 'antidel'],
//     description: 'Capture deleted messages with proper media handling and auto-cleanup',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX) {
//         const chatId = msg.key.remoteJid;
        
//         console.log('🚫 Antidelete System');
        
//         // Initialize global tracker
//         if (!global.antideleteTerminal) {
//             global.antideleteTerminal = {
//                 active: false,
//                 messageCache: new Map(), // Stores all messages
//                 listenerSetup: false,
//                 notifyInChat: true,
//                 stats: {
//                     deletionsDetected: 0,
//                     retrievedSuccessfully: 0,
//                     mediaRetrieved: 0,
//                     falsePositives: 0
//                 },
//                 seenMessages: new Map(),
//                 processedDeletions: new Set(),
//                 mediaBufferCache: new Map(), // messageId -> {buffer, type, mimetype}
//                 fileStorageCache: new Map(), // messageId -> {filePath, type, mimetype}
//                 cleanupInterval: null,
//                 lastCleanup: Date.now()
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // Ensure media storage directory exists
//         async function ensureMediaDir() {
//             try {
//                 await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
//             } catch (error) {
//                 console.error('❌ Failed to create media directory:', error.message);
//             }
//         }
        
//         // Clean log helper
//         function cleanLog(message, type = 'info') {
//             const prefixes = {
//                 'info': '📝',
//                 'success': '✅',
//                 'error': '❌',
//                 'warning': '⚠️',
//                 'system': '🚫',
//                 'media': '📷',
//                 'deletion': '🗑️'
//             };
            
//             console.log(`${prefixes[type] || '📝'} ${message}`);
//         }
        
//         // Setup cleanup interval for old files
//         function setupCleanupInterval() {
//             if (tracker.cleanupInterval) {
//                 clearInterval(tracker.cleanupInterval);
//             }
            
//             // Clean up every 5 minutes
//             tracker.cleanupInterval = setInterval(async () => {
//                 await cleanupOldDataAndFiles();
//             }, 5 * 60 * 1000);
//         }
        
//         // Cleanup old data and files
//         async function cleanupOldDataAndFiles() {
//             const now = Date.now();
//             const tenMinutes = 10 * 60 * 1000;
            
//             // Clean seen messages older than 5 minutes
//             for (const [msgId, timestamp] of tracker.seenMessages.entries()) {
//                 if (now - timestamp > tenMinutes) {
//                     tracker.seenMessages.delete(msgId);
//                 }
//             }
            
//             // Clean message cache older than 15 minutes
//             for (const [msgId, data] of tracker.messageCache.entries()) {
//                 if (now - data.timestamp > 15 * 60 * 1000) {
//                     tracker.messageCache.delete(msgId);
//                     tracker.mediaBufferCache.delete(msgId);
                    
//                     // Also clean up stored file if exists
//                     if (tracker.fileStorageCache.has(msgId)) {
//                         const fileInfo = tracker.fileStorageCache.get(msgId);
//                         try {
//                             await fs.unlink(fileInfo.filePath).catch(() => {});
//                         } catch (error) {
//                             // Ignore file not found errors
//                         }
//                         tracker.fileStorageCache.delete(msgId);
//                     }
//                 }
//             }
            
//             // Clean up old media files in storage directory
//             try {
//                 const files = await fs.readdir(MEDIA_STORAGE_PATH);
//                 for (const file of files) {
//                     const filePath = path.join(MEDIA_STORAGE_PATH, file);
//                     try {
//                         const stats = await fs.stat(filePath);
//                         if (now - stats.mtimeMs > 30 * 60 * 1000) { // 30 minutes old
//                             await fs.unlink(filePath);
//                             cleanLog(`Cleaned old file: ${file}`, 'info');
//                         }
//                     } catch (error) {
//                         // Ignore errors
//                     }
//                 }
//             } catch (error) {
//                 // Directory might not exist yet
//             }
            
//             // Clean processed deletions
//             if (tracker.processedDeletions.size > 1000) {
//                 tracker.processedDeletions.clear();
//             }
            
//             tracker.lastCleanup = now;
//         }
        
//         // Setup listener
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog('Setting up antidelete listener...', 'system');
//             cleanLog(`Chat notifications: ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`, 'info');
            
//             // Ensure media directory exists
//             ensureMediaDir();
            
//             // Setup cleanup interval
//             setupCleanupInterval();
            
//             // Store ALL incoming messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     if (type === 'notify') {
//                         for (const message of messages) {
//                             if (message.key?.fromMe) continue;
                            
//                             const msgId = message.key?.id;
//                             if (!msgId) continue;
                            
//                             tracker.seenMessages.set(msgId, Date.now());
//                             await storeMessageWithMedia(message);
//                         }
//                     }
                    
//                 } catch (error) {
//                     cleanLog(`Storage error: ${error.message}`, 'error');
//                 }
//             });
            
//             // Handle deletions
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
//                         const messageId = update.key?.id;
//                         const chatId = update.key?.remoteJid;
                        
//                         if (!messageId || !chatId) continue;
                        
//                         const isDeleted = 
//                             updateData.status === 6 ||
//                             updateData.message === null ||
//                             (updateData.messageStubType === 7) ||
//                             (updateData.messageStubType === 8);
                        
//                         if (isDeleted) {
//                             if (tracker.processedDeletions.has(messageId)) {
//                                 continue;
//                             }
                            
//                             tracker.processedDeletions.add(messageId);
                            
//                             setTimeout(() => {
//                                 tracker.processedDeletions.delete(messageId);
//                             }, 10000);
                            
//                             cleanLog(`Deletion detected: ${messageId.substring(0, 8)}...`, 'deletion');
//                             tracker.stats.deletionsDetected++;
                            
//                             await handleDeletedMessage(update.key);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Detection error: ${error.message}`, 'error');
//                 }
//             });
            
//             tracker.listenerSetup = true;
//             cleanLog('Antidelete listener ready', 'success');
//         }
        
//         // Store message with media file storage
//         async function storeMessageWithMedia(message) {
//             try {
//                 const msgId = message.key.id;
//                 const msgChat = message.key.remoteJid;
                
//                 if (tracker.messageCache.has(msgId)) {
//                     return;
//                 }
                
//                 const sender = message.key.participant || msgChat;
//                 const isGroup = msgChat.endsWith('@g.us');
//                 const isLid = msgChat.includes('@lid');
                
//                 // Extract message content
//                 let text = '';
//                 let type = 'text';
//                 let fileName = '';
//                 let caption = '';
//                 let hasMedia = false;
//                 let mimetype = '';
                
//                 const msgContent = message.message;
                
//                 // Extract text and determine type
//                 if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 } 
                
//                 // Check for media types
//                 if (msgContent?.imageMessage) {
//                     type = 'image';
//                     caption = msgContent.imageMessage.caption || '';
//                     mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
//                     hasMedia = true;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     caption = msgContent.videoMessage.caption || '';
//                     mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
//                     hasMedia = true;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     mimetype = msgContent.audioMessage.mimetype || 'audio/mp4';
//                     hasMedia = true;
//                     if (!text) text = 'Audio message';
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     fileName = msgContent.documentMessage.fileName || 'Document';
//                     mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
//                     hasMedia = true;
//                     if (!text) text = fileName;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
//                     hasMedia = true;
//                     if (!text) text = 'Sticker';
//                 } else if (msgContent?.contactMessage) {
//                     type = 'contact';
//                     if (!text) text = 'Contact';
//                 } else if (msgContent?.locationMessage) {
//                     type = 'location';
//                     if (!text) text = 'Location';
//                 }
                
//                 // Use caption if no text
//                 if (!text && caption) {
//                     text = caption;
//                 }
                
//                 // Store file if media exists
//                 let filePath = null;
//                 if (hasMedia && msgContent) {
//                     try {
//                         filePath = await saveMediaToFile(message, msgId, type, mimetype);
//                         if (filePath) {
//                             tracker.fileStorageCache.set(msgId, {
//                                 filePath: filePath,
//                                 type: type,
//                                 mimetype: mimetype,
//                                 timestamp: Date.now()
//                             });
//                             cleanLog(`Media saved to file: ${type} (${msgId.substring(0, 8)}...)`, 'media');
//                         }
//                     } catch (mediaError) {
//                         cleanLog(`Media save failed: ${mediaError.message}`, 'warning');
//                     }
//                 }
                
//                 const messageDetails = {
//                     id: msgId,
//                     chat: msgChat,
//                     sender: sender,
//                     senderShort: sender.split('@')[0],
//                     isGroup: isGroup,
//                     isLid: isLid,
//                     timestamp: Date.now(),
//                     messageTimestamp: message.messageTimestamp || Date.now(),
//                     pushName: message.pushName || 'Unknown',
//                     text: text,
//                     type: type,
//                     hasMedia: hasMedia,
//                     fileName: fileName,
//                     caption: caption,
//                     mimetype: mimetype,
//                     originalMessage: message,
//                     hasFileStorage: !!filePath
//                 };
                
//                 tracker.messageCache.set(msgId, messageDetails);
                
//             } catch (error) {
//                 cleanLog(`Store error: ${error.message}`, 'error');
//             }
//         }
        
//         // Save media to file system
//         async function saveMediaToFile(message, msgId, type, mimetype) {
//             try {
//                 // Ensure directory exists
//                 await ensureMediaDir();
                
//                 let mediaBuffer = null;
                
//                 // Try different methods to download media
//                 if (typeof sock.downloadMediaMessage === 'function') {
//                     mediaBuffer = await sock.downloadMediaMessage(message);
//                 } else if (message.download && typeof message.download === 'function') {
//                     mediaBuffer = await message.download();
//                 }
                
//                 if (!mediaBuffer) {
//                     return null;
//                 }
                
//                 // Determine file extension
//                 let extension = '.bin';
//                 if (type === 'image') {
//                     extension = mimetype.includes('png') ? '.png' : 
//                                mimetype.includes('gif') ? '.gif' : 
//                                mimetype.includes('webp') ? '.webp' : '.jpg';
//                 } else if (type === 'video') {
//                     extension = mimetype.includes('gif') ? '.gif' : 
//                                mimetype.includes('webm') ? '.webm' : '.mp4';
//                 } else if (type === 'audio') {
//                     extension = mimetype.includes('ogg') ? '.ogg' : 
//                                mimetype.includes('mp3') ? '.mp3' : '.mp4';
//                 } else if (type === 'sticker') {
//                     extension = '.webp';
//                 } else if (type === 'document') {
//                     const originalExt = message.message.documentMessage?.fileName?.split('.').pop();
//                     extension = originalExt ? `.${originalExt}` : '.bin';
//                 }
                
//                 // Create filename
//                 const timestamp = Date.now();
//                 const filename = `${msgId.substring(0, 8)}_${timestamp}${extension}`;
//                 const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
//                 // Save to file
//                 await fs.writeFile(filePath, mediaBuffer);
                
//                 // Also store in buffer cache for quick access
//                 tracker.mediaBufferCache.set(msgId, {
//                     buffer: mediaBuffer,
//                     type: type,
//                     mimetype: mimetype,
//                     timestamp: timestamp
//                 });
                
//                 return filePath;
                
//             } catch (error) {
//                 cleanLog(`File save error: ${error.message}`, 'error');
//                 return null;
//             }
//         }
        
//         // Handle deleted message
//         async function handleDeletedMessage(deletedKey) {
//             try {
//                 const deletedId = deletedKey.id;
//                 const chatId = deletedKey.remoteJid;
                
//                 if (!deletedId) {
//                     cleanLog('No message ID in deletion event', 'error');
//                     return;
//                 }
                
//                 cleanLog(`Looking for message: ${deletedId.substring(0, 8)}...`, 'info');
                
//                 // Check cache for the deleted message
//                 const cachedMessage = tracker.messageCache.get(deletedId);
                
//                 if (cachedMessage) {
//                     cleanLog(`Found in cache: ${deletedId.substring(0, 8)}...`, 'success');
//                     cleanLog(`Type: ${cachedMessage.type}`, 'info');
                    
//                     // Remove from cache
//                     tracker.messageCache.delete(deletedId);
                    
//                     // Show and resend the message
//                     await processDeletedMessage(cachedMessage);
                    
//                     // Clean up file after sending
//                     if (cachedMessage.hasFileStorage) {
//                         setTimeout(async () => {
//                             await cleanupMediaFile(deletedId);
//                         }, 5000); // Clean up 5 seconds after sending
//                     }
                    
//                     tracker.stats.retrievedSuccessfully++;
//                     if (cachedMessage.hasMedia) {
//                         tracker.stats.mediaRetrieved++;
//                     }
                    
//                     return;
//                 }
                
//                 // Message not found in cache
//                 cleanLog(`Not found in cache: ${deletedId.substring(0, 8)}...`, 'warning');
//                 tracker.stats.falsePositives++;
                
//             } catch (error) {
//                 cleanLog(`Retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Clean up media file after use
//         async function cleanupMediaFile(msgId) {
//             try {
//                 // Remove from buffer cache
//                 tracker.mediaBufferCache.delete(msgId);
                
//                 // Delete file from storage
//                 if (tracker.fileStorageCache.has(msgId)) {
//                     const fileInfo = tracker.fileStorageCache.get(msgId);
//                     await fs.unlink(fileInfo.filePath).catch(() => {});
//                     tracker.fileStorageCache.delete(msgId);
//                     cleanLog(`Cleaned up media file for ${msgId.substring(0, 8)}...`, 'info');
//                 }
//             } catch (error) {
//                 // Ignore cleanup errors
//             }
//         }
        
//         // Process and resend deleted message
//         async function processDeletedMessage(messageDetails) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const chatType = messageDetails.isGroup ? 'GROUP' : 
//                                 (messageDetails.isLid ? 'LID' : 'DM');
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 // Terminal display
//                 console.log('\n' + '─'.repeat(60));
//                 console.log('🚫  DELETED MESSAGE CAPTURED  🚫');
//                 console.log('─'.repeat(60));
                
//                 console.log(`Chat: ${chatType}`);
//                 console.log(`From: ${senderName} (${messageDetails.senderShort})`);
//                 console.log(`Time: ${time}`);
//                 console.log(`Type: ${messageDetails.type.toUpperCase()}`);
                
//                 if (messageDetails.text) {
//                     console.log('\nContent:');
//                     console.log('─'.repeat(40));
//                     const displayText = messageDetails.text.length > 200 ? 
//                         messageDetails.text.substring(0, 200) + '...' : messageDetails.text;
//                     console.log(displayText);
//                     console.log('─'.repeat(40));
//                 }
                
//                 if (messageDetails.fileName) {
//                     console.log(`File: ${messageDetails.fileName}`);
//                 }
                
//                 console.log(`ID: ${messageDetails.id.substring(0, 12)}...`);
//                 console.log('─'.repeat(60) + '\n');
                
//                 // Send to chat
//                 if (tracker.notifyInChat && tracker.active) {
//                     await resendMessageToChat(messageDetails);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Display error: ${error.message}`, 'error');
//             }
//         }
        
//         // Resend message to chat with media from file
//         async function resendMessageToChat(messageDetails) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 let headerMessage = `🚫 *DELETED MESSAGE*\n\n`;
//                 headerMessage += `👤 *From:* ${senderName}\n`;
//                 headerMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//                 headerMessage += `🕒 *Time:* ${time}\n`;
//                 headerMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
                
//                 // Check if we have media file or buffer
//                 const mediaBuffer = tracker.mediaBufferCache.get(messageDetails.id);
//                 const fileInfo = tracker.fileStorageCache.get(messageDetails.id);
                
//                 if (messageDetails.hasMedia && (mediaBuffer?.buffer || fileInfo)) {
//                     await resendMedia(messageDetails, mediaBuffer, fileInfo, headerMessage);
//                 } else {
//                     // Text-only or media without buffer/file
//                     await sendTextNotification(messageDetails, headerMessage);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Resend error: ${error.message}`, 'error');
                
//                 // Fallback
//                 try {
//                     await sock.sendMessage(messageDetails.chat, {
//                         text: `🚫 *Deleted ${messageDetails.type.toUpperCase()}*\n\nFrom: ${messageDetails.senderShort}\nTime: ${time}\n\n(Could not retrieve full content)`
//                     });
//                 } catch (fallbackError) {
//                     cleanLog(`Fallback also failed: ${fallbackError.message}`, 'error');
//                 }
//             }
//         }
        
//         // Resend media using buffer or file
//         async function resendMedia(messageDetails, mediaBuffer, fileInfo, headerMessage) {
//             try {
//                 cleanLog(`Resending ${messageDetails.type}...`, 'media');
                
//                 let buffer = null;
                
//                 // Try to get buffer from cache first
//                 if (mediaBuffer?.buffer) {
//                     buffer = mediaBuffer.buffer;
//                 }
//                 // If no buffer, try to read from file
//                 else if (fileInfo?.filePath) {
//                     try {
//                         buffer = await fs.readFile(fileInfo.filePath);
//                     } catch (fileError) {
//                         cleanLog(`File read failed: ${fileError.message}`, 'warning');
//                     }
//                 }
                
//                 if (!buffer) {
//                     throw new Error('No media data available');
//                 }
                
//                 const caption = messageDetails.caption ? 
//                     `${headerMessage}\n💬 *Caption:* ${messageDetails.caption}\n\n🔍 *Captured by antidelete*` :
//                     `${headerMessage}\n\n🔍 *Captured by antidelete*`;
                
//                 let mediaMessage = {};
//                 const mimetype = messageDetails.mimetype || fileInfo?.mimetype || 'application/octet-stream';
                
//                 switch(messageDetails.type) {
//                     case 'image':
//                         mediaMessage = {
//                             image: buffer,
//                             caption: caption,
//                             mimetype: mimetype
//                         };
//                         break;
                        
//                     case 'video':
//                         mediaMessage = {
//                             video: buffer,
//                             caption: caption,
//                             mimetype: mimetype
//                         };
//                         break;
                        
//                     case 'audio':
//                         mediaMessage = {
//                             audio: buffer,
//                             mimetype: mimetype,
//                             ptt: messageDetails.mimetype?.includes('audio/ogg;')
//                         };
//                         break;
                        
//                     case 'document':
//                         mediaMessage = {
//                             document: buffer,
//                             fileName: messageDetails.fileName || 'document',
//                             caption: caption,
//                             mimetype: mimetype
//                         };
//                         break;
                        
//                     case 'sticker':
//                         mediaMessage = {
//                             sticker: buffer,
//                             mimetype: mimetype
//                         };
//                         break;
                        
//                     default:
//                         throw new Error(`Unsupported media type: ${messageDetails.type}`);
//                 }
                
//                 await sock.sendMessage(messageDetails.chat, mediaMessage);
//                 cleanLog(`${messageDetails.type.toUpperCase()} resent successfully`, 'success');
                
//             } catch (error) {
//                 cleanLog(`Media resend failed: ${error.message}`, 'error');
//                 throw error;
//             }
//         }
        
//         // Send text notification
//         async function sendTextNotification(messageDetails, headerMessage) {
//             if (messageDetails.text && messageDetails.text.trim()) {
//                 const displayText = messageDetails.text.length > 500 ? 
//                     messageDetails.text.substring(0, 500) + '...' : messageDetails.text;
//                 headerMessage += `\n💬 *Message:*\n${displayText}\n`;
//             }
            
//             if (messageDetails.fileName) {
//                 headerMessage += `\n📄 *File:* ${messageDetails.fileName}\n`;
//             }
            
//             if (messageDetails.hasMedia && !messageDetails.text) {
//                 headerMessage += `\n📎 *Media file (content not retrievable)*\n`;
//             }
            
//             headerMessage += `\n────────────\n`;
//             headerMessage += `🔍 *Captured by antidelete*`;
            
//             await sock.sendMessage(messageDetails.chat, { text: headerMessage });
//             cleanLog('Text notification sent', 'success');
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 tracker.active = true;
//                 tracker.stats.deletionsDetected = 0;
//                 tracker.stats.retrievedSuccessfully = 0;
//                 tracker.stats.mediaRetrieved = 0;
//                 tracker.stats.falsePositives = 0;
                
//                 setupTerminalListener();
                
//                 cleanLog('Antidelete ENABLED', 'success');
//                 cleanLog('Media file storage: ACTIVE', 'info');
//                 cleanLog('Auto-cleanup: ENABLED', 'info');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\nNow capturing deleted messages with:\n• Text messages\n• Images 📷\n• Videos 🎥\n• Audio 🔊\n• Documents 📄\n• Stickers 😄\n\n*Features:*\n• Media files saved locally\n• Auto-cleanup after sending\n• File system storage\n\nUse \`${PREFIX}antidelete test\` to verify.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'disable':
//             case 'stop':
//                 tracker.active = false;
//                 if (tracker.cleanupInterval) {
//                     clearInterval(tracker.cleanupInterval);
//                     tracker.cleanupInterval = null;
//                 }
                
//                 // Clean up all files on disable
//                 await cleanupOldDataAndFiles();
                
//                 cleanLog('Antidelete DISABLED - All files cleaned up', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE DISABLED*\n\nAll temporary media files have been cleaned up.\nUse \`${PREFIX}antidelete on\` to enable again.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//                 cleanLog('Sending test messages...', 'info');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧪 *TEXT TEST*\n\nDelete this message to test text retrieval!\n\nTimestamp: ${Date.now()}`
//                 });
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧪 *MEDIA TEST*\n\nNow sending a test image - delete it to test media retrieval!`
//                 });
                
//                 try {
//                     // Send a simple text-based image (works without URL)
//                     await sock.sendMessage(chatId, {
//                         text: '📸 Test Image Placeholder\n\nThis represents an image. Delete to test media capture!'
//                     });
//                 } catch (e) {
//                     cleanLog('Test image skipped', 'warning');
//                 }
                
//                 cleanLog('Test messages sent - Delete them to test!', 'success');
//                 break;
                
//             case 'stats':
//                 console.log('\n📊 ANTIDELETE STATISTICS');
//                 console.log('─'.repeat(50));
//                 console.log(`Status: ${tracker.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
//                 console.log(`Messages in cache: ${tracker.messageCache.size}`);
//                 console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
//                 console.log(`Files stored: ${tracker.fileStorageCache.size}`);
//                 console.log(`\n📈 PERFORMANCE:`);
//                 console.log(`Deletions detected: ${tracker.stats.deletionsDetected}`);
//                 console.log(`Successfully retrieved: ${tracker.stats.retrievedSuccessfully}`);
//                 console.log(`Media retrieved: ${tracker.stats.mediaRetrieved}`);
//                 console.log(`False positives: ${tracker.stats.falsePositives}`);
                
//                 if (tracker.stats.deletionsDetected > 0) {
//                     const successRate = Math.round((tracker.stats.retrievedSuccessfully / tracker.stats.deletionsDetected) * 100);
//                     console.log(`\n📊 SUCCESS RATE: ${successRate}%`);
//                 }
                
//                 console.log('─'.repeat(50));
                
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *Antidelete Stats*\n\nSuccess: ${tracker.stats.retrievedSuccessfully}/${tracker.stats.deletionsDetected}\nMedia: ${tracker.stats.mediaRetrieved}\nFiles stored: ${tracker.fileStorageCache.size}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'cleanup':
//                 cleanLog('Manual cleanup started...', 'info');
//                 const filesBefore = tracker.fileStorageCache.size;
//                 await cleanupOldDataAndFiles();
//                 const filesAfter = tracker.fileStorageCache.size;
//                 cleanLog(`Cleaned ${filesBefore - filesAfter} files`, 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧹 *Cleanup Complete*\n\nRemoved ${filesBefore - filesAfter} old files`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 console.log('\n🔧 SYSTEM DEBUG');
//                 console.log('─'.repeat(60));
//                 console.log(`Active: ${tracker.active}`);
//                 console.log(`Cleanup interval: ${tracker.cleanupInterval ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Message cache: ${tracker.messageCache.size}`);
//                 console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
//                 console.log(`File storage: ${tracker.fileStorageCache.size}`);
                
//                 // Show stored files
//                 if (tracker.fileStorageCache.size > 0) {
//                     console.log('\n📁 STORED FILES:');
//                     let count = 0;
//                     for (const [id, info] of tracker.fileStorageCache.entries()) {
//                         if (count >= 5) break;
//                         const filename = path.basename(info.filePath);
//                         console.log(`  ${id.substring(0, 8)}... - ${info.type} (${filename})`);
//                         count++;
//                     }
//                 }
                
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal\nFiles stored: ${tracker.fileStorageCache.size}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clear':
//                 if (args[1] === 'cache') {
//                     const msgCount = tracker.messageCache.size;
//                     const bufferCount = tracker.mediaBufferCache.size;
//                     const fileCount = tracker.fileStorageCache.size;
                    
//                     // Clean up all files
//                     for (const [id, fileInfo] of tracker.fileStorageCache.entries()) {
//                         try {
//                             await fs.unlink(fileInfo.filePath).catch(() => {});
//                         } catch (error) {
//                             // Ignore
//                         }
//                     }
                    
//                     tracker.messageCache.clear();
//                     tracker.mediaBufferCache.clear();
//                     tracker.fileStorageCache.clear();
//                     tracker.seenMessages.clear();
//                     tracker.processedDeletions.clear();
                    
//                     cleanLog(`Cleared ${msgCount} messages, ${bufferCount} buffers, ${fileCount} files`, 'success');
                    
//                     await sock.sendMessage(chatId, {
//                         text: `🧹 *Cache Cleared*\n\nMessages: ${msgCount}\nBuffers: ${bufferCount}\nFiles: ${fileCount}`
//                     }, { quoted: msg });
//                 } else {
//                     console.clear();
//                     console.log('🚫 ANTIDELETE SYSTEM');
//                     console.log('─'.repeat(40));
//                     console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                     console.log(`Cache: ${tracker.messageCache.size} messages`);
//                     console.log(`Files: ${tracker.fileStorageCache.size} stored`);
                    
//                     await sock.sendMessage(chatId, {
//                         text: '🧹 Terminal cleared'
//                     }, { quoted: msg });
//                 }
//                 break;
                
//             case 'help':
//                 console.log('\n🆘 ANTIDELETE HELP');
//                 console.log('─'.repeat(60));
//                 console.log('Commands:');
//                 console.log(`• ${PREFIX}antidelete on/off      - Enable/disable`);
//                 console.log(`• ${PREFIX}antidelete test        - Test the system`);
//                 console.log(`• ${PREFIX}antidelete stats       - Show statistics`);
//                 console.log(`• ${PREFIX}antidelete debug       - System debug info`);
//                 console.log(`• ${PREFIX}antidelete clear cache - Clear all cache`);
//                 console.log(`• ${PREFIX}antidelete cleanup     - Manual cleanup`);
//                 console.log(`• ${PREFIX}antidelete help        - This help`);
//                 console.log('');
//                 console.log('Features:');
//                 console.log('• Text & media retrieval');
//                 console.log('• File system storage');
//                 console.log('• Auto-cleanup after sending');
//                 console.log('• Manual cleanup available');
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🆘 *Antidelete Help*\n\nCaptures deleted messages including media.\nMedia files are saved locally and auto-cleaned.\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 console.log('\n🚫 ANTIDELETE SYSTEM');
//                 console.log('');
//                 console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Cache: ${tracker.messageCache.size} messages`);
//                 console.log(`Files: ${tracker.fileStorageCache.size} stored`);
//                 console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
//                 console.log('');
//                 console.log(`Use \`${PREFIX}antidelete on\` to enable`);
//                 console.log(`Use \`${PREFIX}antidelete help\` for commands`);
                
//                 await sock.sendMessage(chatId, {
//                     text: `🚫 *Antidelete System*\n\nStatus: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\nFiles stored: ${tracker.fileStorageCache.size}\nAuto-cleanup: ✅ ENABLED\n\nUse \`${PREFIX}antidelete help\` for commands.`
//                 }, { quoted: msg });
//         }
//     }
// };


































// // File: ./commands/utility/antidelete.js - FIXED WITH PROPER MEDIA DOWNLOAD
// import fs from 'fs/promises';
// import path from 'path';
// import { fileURLToPath } from 'url';
// import { downloadMediaMessage } from '@whiskeysockets/baileys';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');

// export default {
//     name: 'antidelete',
//     alias: ['undelete', 'antidel'],
//     description: 'Capture deleted messages with guaranteed media retrieval',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX) {
//         const chatId = msg.key.remoteJid;
        
//         console.log('🚫 Antidelete System - FIXED Media');
        
//         // Initialize global tracker
//         if (!global.antideleteTerminal) {
//             global.antideleteTerminal = {
//                 active: false,
//                 messageCache: new Map(),
//                 listenerSetup: false,
//                 notifyInChat: true,
//                 stats: {
//                     deletionsDetected: 0,
//                     retrievedSuccessfully: 0,
//                     mediaRetrieved: 0,
//                     falsePositives: 0,
//                     mediaDownloaded: 0,
//                     mediaSent: 0
//                 },
//                 seenMessages: new Map(),
//                 processedDeletions: new Set(),
//                 mediaStorage: new Map(), // messageId -> media data
//                 cleanupInterval: null,
//                 lastCleanup: Date.now()
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // ====== PROPER MEDIA HANDLING ======
        
//         // Ensure media directory
//         async function ensureMediaDir() {
//             try {
//                 await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
//                 return true;
//             } catch (error) {
//                 console.error('❌ Directory error:', error.message);
//                 return false;
//             }
//         }
        
//         // PROPER media download using downloadMediaMessage from baileys
//         async function downloadMediaProperly(message) {
//             try {
//                 const msgId = message.key?.id;
//                 if (!msgId) return null;
                
//                 console.log(`📥 Downloading media for: ${msgId.substring(0, 8)}...`);
                
//                 // Use the SAME method as view-once module
//                 const buffer = await downloadMediaMessage(
//                     message,
//                     'buffer',
//                     {},
//                     {
//                         logger: { level: 'silent' },
//                         reuploadRequest: sock.updateMediaMessage
//                     }
//                 );
                
//                 if (!buffer || buffer.length === 0) {
//                     console.log('❌ Empty buffer returned');
//                     return null;
//                 }
                
//                 console.log(`✅ Downloaded: ${buffer.length} bytes`);
//                 return buffer;
                
//             } catch (error) {
//                 console.error('❌ Download error:', error.message);
//                 return null;
//             }
//         }
        
//         // Save media to file
//         async function saveMediaFile(messageId, buffer, type, mimetype, originalMessage) {
//             try {
//                 await ensureMediaDir();
                
//                 // Generate filename with proper extension
//                 const timestamp = Date.now();
//                 let extension = getFileExtension(type, mimetype);
//                 const filename = `antidelete_${messageId.substring(0, 8)}_${timestamp}${extension}`;
//                 const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
//                 // Write file
//                 await fs.writeFile(filePath, buffer);
                
//                 // Store metadata
//                 tracker.mediaStorage.set(messageId, {
//                     filePath: filePath,
//                     buffer: buffer, // Keep buffer in memory
//                     type: type,
//                     mimetype: mimetype || getMimeType(type),
//                     filename: filename,
//                     size: buffer.length,
//                     timestamp: timestamp,
//                     originalMessage: originalMessage
//                 });
                
//                 console.log(`💾 Saved: ${filename} (${Math.round(buffer.length/1024)}KB)`);
//                 tracker.stats.mediaDownloaded++;
//                 return true;
                
//             } catch (error) {
//                 console.error('❌ Save error:', error.message);
//                 return false;
//             }
//         }
        
//         // Get file extension
//         function getFileExtension(type, mimetype = '') {
//             switch(type) {
//                 case 'image':
//                     if (mimetype.includes('png')) return '.png';
//                     if (mimetype.includes('gif')) return '.gif';
//                     if (mimetype.includes('webp')) return '.webp';
//                     return '.jpg';
//                 case 'video':
//                     if (mimetype.includes('gif')) return '.gif';
//                     if (mimetype.includes('webm')) return '.webm';
//                     return '.mp4';
//                 case 'audio':
//                     if (mimetype.includes('ogg')) return '.ogg';
//                     if (mimetype.includes('mp3')) return '.mp3';
//                     return '.m4a';
//                 case 'sticker':
//                     return '.webp';
//                 case 'document':
//                     const originalExt = mimetype.split('/')[1];
//                     return originalExt ? `.${originalExt.split(';')[0]}` : '.bin';
//                 default:
//                     return '.dat';
//             }
//         }
        
//         // Get mime type
//         function getMimeType(type) {
//             switch(type) {
//                 case 'image': return 'image/jpeg';
//                 case 'video': return 'video/mp4';
//                 case 'audio': return 'audio/mp4';
//                 case 'sticker': return 'image/webp';
//                 case 'document': return 'application/octet-stream';
//                 default: return 'application/octet-stream';
//             }
//         }
        
//         // Send media properly
//         async function sendMediaProperly(messageDetails) {
//             try {
//                 const messageId = messageDetails.id;
                
//                 if (!tracker.mediaStorage.has(messageId)) {
//                     console.log('❌ No media stored');
//                     return false;
//                 }
                
//                 const mediaInfo = tracker.mediaStorage.get(messageId);
//                 console.log(`📤 Sending ${mediaInfo.type}: ${mediaInfo.filename}`);
                
//                 // Read buffer (from memory or file)
//                 let buffer = mediaInfo.buffer;
//                 if (!buffer) {
//                     try {
//                         buffer = await fs.readFile(mediaInfo.filePath);
//                     } catch (error) {
//                         console.error('❌ File read error:', error.message);
//                         return false;
//                     }
//                 }
                
//                 // Check buffer
//                 if (!buffer || buffer.length === 0) {
//                     console.error('❌ Empty buffer');
//                     return false;
//                 }
                
//                 // Create message
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 let caption = `🚫 *DELETED ${messageDetails.type.toUpperCase()}*\n\n`;
//                 caption += `👤 From: ${senderName}\n`;
//                 caption += `📞 Number: ${messageDetails.senderShort}\n`;
//                 caption += `🕒 Time: ${time}\n`;
                
//                 if (messageDetails.caption) {
//                     caption += `💬 Caption: ${messageDetails.caption}\n`;
//                 }
                
//                 caption += `\n🔍 *Captured by antidelete*`;
                
//                 // Send based on type
//                 let sent = false;
                
//                 switch(messageDetails.type) {
//                     case 'image':
//                         await sock.sendMessage(messageDetails.chat, {
//                             image: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype || 'image/jpeg'
//                         });
//                         sent = true;
//                         break;
                        
//                     case 'video':
//                         await sock.sendMessage(messageDetails.chat, {
//                             video: buffer,
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype || 'video/mp4'
//                         });
//                         sent = true;
//                         break;
                        
//                     case 'audio':
//                         await sock.sendMessage(messageDetails.chat, {
//                             audio: buffer,
//                             mimetype: mediaInfo.mimetype || 'audio/mp4',
//                             ptt: mediaInfo.mimetype?.includes('ogg')
//                         });
//                         sent = true;
//                         break;
                        
//                     case 'document':
//                         await sock.sendMessage(messageDetails.chat, {
//                             document: buffer,
//                             fileName: messageDetails.fileName || 'document',
//                             caption: caption,
//                             mimetype: mediaInfo.mimetype || 'application/octet-stream'
//                         });
//                         sent = true;
//                         break;
                        
//                     case 'sticker':
//                         await sock.sendMessage(messageDetails.chat, {
//                             sticker: buffer,
//                             mimetype: mediaInfo.mimetype || 'image/webp'
//                         });
//                         sent = true;
//                         break;
                        
//                     default:
//                         console.error(`❌ Unknown type: ${messageDetails.type}`);
//                         return false;
//                 }
                
//                 if (sent) {
//                     console.log(`✅ ${messageDetails.type.toUpperCase()} sent successfully!`);
//                     tracker.stats.mediaSent++;
//                     return true;
//                 }
                
//                 return false;
                
//             } catch (error) {
//                 console.error('❌ Send error:', error.message);
//                 return false;
//             }
//         }
        
//         // Clean up media
//         async function cleanupMedia(messageId) {
//             try {
//                 if (tracker.mediaStorage.has(messageId)) {
//                     const mediaInfo = tracker.mediaStorage.get(messageId);
//                     try {
//                         await fs.unlink(mediaInfo.filePath);
//                         console.log(`🧹 Cleaned: ${mediaInfo.filename}`);
//                     } catch (error) {
//                         // File might already be deleted
//                     }
//                     tracker.mediaStorage.delete(messageId);
//                 }
//             } catch (error) {
//                 // Silent cleanup
//             }
//         }
        
//         // ====== EXISTING FUNCTIONS (UPDATED) ======
        
//         function cleanLog(message, type = 'info') {
//             const prefixes = {
//                 'info': '📝',
//                 'success': '✅',
//                 'error': '❌',
//                 'warning': '⚠️',
//                 'system': '🚫',
//                 'media': '📷',
//                 'deletion': '🗑️'
//             };
            
//             console.log(`${prefixes[type] || '📝'} ${message}`);
//         }
        
//         // Setup cleanup
//         function setupCleanupInterval() {
//             if (tracker.cleanupInterval) {
//                 clearInterval(tracker.cleanupInterval);
//             }
            
//             tracker.cleanupInterval = setInterval(async () => {
//                 await cleanupOldData();
//             }, 10 * 60 * 1000);
//         }
        
//         // Cleanup old data
//         async function cleanupOldData() {
//             const now = Date.now();
//             const thirtyMinutes = 30 * 60 * 1000;
            
//             for (const [msgId, mediaInfo] of tracker.mediaStorage.entries()) {
//                 if (now - mediaInfo.timestamp > thirtyMinutes) {
//                     await cleanupMedia(msgId);
//                 }
//             }
            
//             // Clean old messages
//             for (const [msgId, data] of tracker.messageCache.entries()) {
//                 if (now - data.timestamp > thirtyMinutes) {
//                     tracker.messageCache.delete(msgId);
//                 }
//             }
            
//             tracker.lastCleanup = now;
//         }
        
//         // Setup listener
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog('Setting up antidelete with PROPER media...', 'system');
            
//             ensureMediaDir();
//             setupCleanupInterval();
            
//             // Store messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     if (type === 'notify') {
//                         for (const message of messages) {
//                             if (message.key?.fromMe) continue;
                            
//                             const msgId = message.key?.id;
//                             if (!msgId) continue;
                            
//                             tracker.seenMessages.set(msgId, Date.now());
//                             await storeMessageWithMedia(message);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Storage error: ${error.message}`, 'error');
//                 }
//             });
            
//             // Handle deletions
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
//                         const messageId = update.key?.id;
//                         const chatId = update.key?.remoteJid;
                        
//                         if (!messageId || !chatId) continue;
                        
//                         const isDeleted = 
//                             updateData.status === 6 ||
//                             updateData.message === null ||
//                             (updateData.messageStubType === 7) ||
//                             (updateData.messageStubType === 8);
                        
//                         if (isDeleted) {
//                             if (tracker.processedDeletions.has(messageId)) continue;
                            
//                             tracker.processedDeletions.add(messageId);
//                             setTimeout(() => {
//                                 tracker.processedDeletions.delete(messageId);
//                             }, 10000);
                            
//                             cleanLog(`Deletion detected: ${messageId.substring(0, 8)}...`, 'deletion');
//                             tracker.stats.deletionsDetected++;
                            
//                             await handleDeletedMessage(update.key);
//                         }
//                     }
//                 } catch (error) {
//                     cleanLog(`Detection error: ${error.message}`, 'error');
//                 }
//             });
            
//             tracker.listenerSetup = true;
//             cleanLog('Listener ready with PROPER media download', 'success');
//         }
        
//         // Store message with media
//         async function storeMessageWithMedia(message) {
//             try {
//                 const msgId = message.key.id;
//                 const msgChat = message.key.remoteJid;
                
//                 if (tracker.messageCache.has(msgId)) return;
                
//                 const sender = message.key.participant || msgChat;
                
//                 // Extract message info
//                 let text = '';
//                 let type = 'text';
//                 let fileName = '';
//                 let caption = '';
//                 let hasMedia = false;
//                 let mimetype = '';
                
//                 const msgContent = message.message;
                
//                 // Extract text
//                 if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 }
                
//                 // Detect media type
//                 if (msgContent?.imageMessage) {
//                     type = 'image';
//                     caption = msgContent.imageMessage.caption || '';
//                     mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
//                     hasMedia = true;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     caption = msgContent.videoMessage.caption || '';
//                     mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
//                     hasMedia = true;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     mimetype = msgContent.audioMessage.mimetype || 'audio/mp4';
//                     hasMedia = true;
//                     if (!text) text = 'Audio message';
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     fileName = msgContent.documentMessage.fileName || 'Document';
//                     mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
//                     hasMedia = true;
//                     if (!text) text = fileName;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
//                     hasMedia = true;
//                     if (!text) text = 'Sticker';
//                 }
                
//                 if (!text && caption) text = caption;
                
//                 // Download and save media in background if it exists
//                 if (hasMedia) {
//                     setTimeout(async () => {
//                         try {
//                             console.log(`🔄 Downloading media for ${msgId.substring(0, 8)}...`);
//                             const buffer = await downloadMediaProperly(message);
                            
//                             if (buffer) {
//                                 await saveMediaFile(msgId, buffer, type, mimetype, message);
//                                 console.log(`✅ Media saved for ${msgId.substring(0, 8)}`);
//                             } else {
//                                 console.log(`❌ Could not download media for ${msgId.substring(0, 8)}`);
//                             }
//                         } catch (error) {
//                             console.error(`❌ Background download error:`, error.message);
//                         }
//                     }, 1000); // Small delay
//                 }
                
//                 // Store message details
//                 const messageDetails = {
//                     id: msgId,
//                     chat: msgChat,
//                     sender: sender,
//                     senderShort: sender.split('@')[0],
//                     timestamp: Date.now(),
//                     messageTimestamp: message.messageTimestamp || Date.now(),
//                     pushName: message.pushName || 'Unknown',
//                     text: text,
//                     type: type,
//                     hasMedia: hasMedia,
//                     fileName: fileName,
//                     caption: caption,
//                     mimetype: mimetype,
//                     originalMessage: message,
//                     mediaDownloaded: false // Will update when downloaded
//                 };
                
//                 tracker.messageCache.set(msgId, messageDetails);
                
//             } catch (error) {
//                 cleanLog(`Store error: ${error.message}`, 'error');
//             }
//         }
        
//         // Handle deleted message
//         async function handleDeletedMessage(deletedKey) {
//             try {
//                 const deletedId = deletedKey.id;
                
//                 if (!deletedId) return;
                
//                 cleanLog(`Looking for: ${deletedId.substring(0, 8)}...`, 'info');
                
//                 const cachedMessage = tracker.messageCache.get(deletedId);
                
//                 if (cachedMessage) {
//                     cleanLog(`Found: ${cachedMessage.type}`, 'success');
//                     tracker.messageCache.delete(deletedId);
                    
//                     await processDeletedMessage(cachedMessage);
                    
//                     tracker.stats.retrievedSuccessfully++;
//                     if (cachedMessage.hasMedia) {
//                         tracker.stats.mediaRetrieved++;
//                     }
                    
//                     // Clean up media after 10 seconds
//                     setTimeout(() => {
//                         cleanupMedia(deletedId);
//                     }, 10000);
                    
//                     return;
//                 }
                
//                 cleanLog(`Not found: ${deletedId.substring(0, 8)}...`, 'warning');
//                 tracker.stats.falsePositives++;
                
//             } catch (error) {
//                 cleanLog(`Retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Process deleted message
//         async function processDeletedMessage(messageDetails) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 console.log('\n' + '─'.repeat(60));
//                 console.log('🚫  DELETED MESSAGE CAPTURED  🚫');
//                 console.log('─'.repeat(60));
//                 console.log(`From: ${senderName} (${messageDetails.senderShort})`);
//                 console.log(`Time: ${time}`);
//                 console.log(`Type: ${messageDetails.type.toUpperCase()}`);
                
//                 if (messageDetails.text) {
//                     console.log('\nContent:');
//                     console.log('─'.repeat(40));
//                     const displayText = messageDetails.text.length > 200 ? 
//                         messageDetails.text.substring(0, 200) + '...' : messageDetails.text;
//                     console.log(displayText);
//                     console.log('─'.repeat(40));
//                 }
                
//                 if (messageDetails.hasMedia) {
//                     const hasMediaFile = tracker.mediaStorage.has(messageDetails.id);
//                     console.log(`📁 Media file: ${hasMediaFile ? '✅ DOWNLOADED' : '❌ NOT AVAILABLE'}`);
//                 }
                
//                 console.log(`ID: ${messageDetails.id.substring(0, 12)}...`);
//                 console.log('─'.repeat(60) + '\n');
                
//                 // Send to chat
//                 if (tracker.notifyInChat && tracker.active) {
//                     await resendMessageToChat(messageDetails);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Display error: ${error.message}`, 'error');
//             }
//         }
        
//         // Resend message
//         async function resendMessageToChat(messageDetails) {
//             try {
//                 if (messageDetails.hasMedia && tracker.mediaStorage.has(messageDetails.id)) {
//                     // Send media
//                     const success = await sendMediaProperly(messageDetails);
                    
//                     if (!success) {
//                         // Fallback to text
//                         await sendTextNotification(messageDetails);
//                     }
//                 } else {
//                     // Text-only
//                     await sendTextNotification(messageDetails);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Resend error: ${error.message}`, 'error');
//                 await sendFallbackNotification(messageDetails);
//             }
//         }
        
//         // Send text notification
//         async function sendTextNotification(messageDetails) {
//             const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//             const senderName = messageDetails.pushName || messageDetails.senderShort;
            
//             let textMessage = `🚫 *DELETED MESSAGE*\n\n`;
//             textMessage += `👤 *From:* ${senderName}\n`;
//             textMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//             textMessage += `🕒 *Time:* ${time}\n`;
//             textMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
            
//             if (messageDetails.text) {
//                 textMessage += `\n💬 *Message:*\n${messageDetails.text.substring(0, 500)}`;
//                 if (messageDetails.text.length > 500) textMessage += '...';
//             }
            
//             if (messageDetails.hasMedia) {
//                 const hasMediaFile = tracker.mediaStorage.has(messageDetails.id);
//                 textMessage += `\n\n📎 *Media ${hasMediaFile ? 'available but could not be sent' : 'not retrievable'}*`;
//             }
            
//             textMessage += `\n\n────────────\n`;
//             textMessage += `🔍 *Captured by antidelete*`;
            
//             await sock.sendMessage(messageDetails.chat, { text: textMessage });
//             cleanLog('Text notification sent', 'success');
//         }
        
//         // Fallback notification
//         async function sendFallbackNotification(messageDetails) {
//             const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//             await sock.sendMessage(messageDetails.chat, {
//                 text: `🚫 *Deleted ${messageDetails.type.toUpperCase()}*\n\nFrom: ${messageDetails.senderShort}\nTime: ${time}\n\n(Could not retrieve content)`
//             });
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 tracker.active = true;
//                 Object.keys(tracker.stats).forEach(key => {
//                     tracker.stats[key] = 0;
//                 });
                
//                 setupTerminalListener();
                
//                 cleanLog('Antidelete ENABLED with PROPER media download', 'success');
//                 cleanLog('Using downloadMediaMessage from baileys', 'info');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\n*Now using proper media download*\n• Uses WhatsApp library's download function\n• Saves actual media files\n• Auto-cleanup after sending\n\nMedia success rate: Will be tracked\n\nUse \`${PREFIX}antidelete test\` to verify.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'disable':
//             case 'stop':
//                 tracker.active = false;
//                 if (tracker.cleanupInterval) {
//                     clearInterval(tracker.cleanupInterval);
//                     tracker.cleanupInterval = null;
//                 }
                
//                 // Clean up all files
//                 for (const msgId of tracker.mediaStorage.keys()) {
//                     await cleanupMedia(msgId);
//                 }
                
//                 cleanLog('Antidelete DISABLED', 'system');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE DISABLED*\n\nAll media files cleaned up.\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//                 cleanLog('Sending test messages...', 'info');
                
//                 // Send text test
//                 await sock.sendMessage(chatId, {
//                     text: `🧪 *ANTIDELETE TEST*\n\n1. Delete this text message\n2. Send an actual image\n3. Delete the image\n4. See if it gets retrieved\n\nThe system now uses proper media download!`
//                 });
                
//                 cleanLog('Test instructions sent', 'success');
//                 break;
                
//             case 'stats':
//                 const successRate = tracker.stats.mediaDownloaded > 0 ? 
//                     Math.round((tracker.stats.mediaSent / tracker.stats.mediaDownloaded) * 100) : 0;
                
//                 console.log('\n📊 ANTIDELETE STATISTICS');
//                 console.log('─'.repeat(60));
//                 console.log(`Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
//                 console.log(`Messages cached: ${tracker.messageCache.size}`);
//                 console.log(`Media files stored: ${tracker.mediaStorage.size}`);
//                 console.log(`\n📈 PERFORMANCE:`);
//                 console.log(`Deletions detected: ${tracker.stats.deletionsDetected}`);
//                 console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
//                 console.log(`Media downloaded: ${tracker.stats.mediaDownloaded}`);
//                 console.log(`Media sent: ${tracker.stats.mediaSent}`);
//                 console.log(`Media success rate: ${successRate}%`);
//                 console.log(`False positives: ${tracker.stats.falsePositives}`);
                
//                 // Show file sizes
//                 let totalSize = 0;
//                 for (const mediaInfo of tracker.mediaStorage.values()) {
//                     totalSize += mediaInfo.size || 0;
//                 }
//                 console.log(`Total media size: ${Math.round(totalSize/1024)}KB`);
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *Antidelete Stats*\n\nMedia downloaded: ${tracker.stats.mediaDownloaded}\nMedia sent: ${tracker.stats.mediaSent}\nSuccess rate: ${successRate}%`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 console.log('\n🔧 DEBUG INFORMATION');
//                 console.log('─'.repeat(70));
//                 console.log(`System: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Messages in cache: ${tracker.messageCache.size}`);
//                 console.log(`Media files: ${tracker.mediaStorage.size}`);
                
//                 // Show media files
//                 if (tracker.mediaStorage.size > 0) {
//                     console.log('\n📂 STORED MEDIA FILES:');
//                     let index = 1;
//                     for (const [msgId, mediaInfo] of tracker.mediaStorage.entries()) {
//                         const age = Math.round((Date.now() - mediaInfo.timestamp) / 1000);
//                         console.log(`${index}. ${mediaInfo.filename}`);
//                         console.log(`   Type: ${mediaInfo.type}, Size: ${Math.round(mediaInfo.size/1024)}KB`);
//                         console.log(`   Age: ${age}s, ID: ${msgId.substring(0, 12)}...`);
//                         console.log('   ─'.repeat(20));
//                         index++;
//                         if (index > 5) break;
//                     }
//                 }
                
//                 console.log('─'.repeat(70));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal\nMedia files: ${tracker.mediaStorage.size}`
//                 });
//                 break;
                
//             case 'clear':
//             case 'clean':
//                 const msgCount = tracker.messageCache.size;
//                 const fileCount = tracker.mediaStorage.size;
                
//                 // Clean files
//                 for (const msgId of tracker.mediaStorage.keys()) {
//                     await cleanupMedia(msgId);
//                 }
                
//                 tracker.messageCache.clear();
//                 tracker.mediaStorage.clear();
//                 tracker.seenMessages.clear();
//                 tracker.processedDeletions.clear();
                
//                 cleanLog(`Cleaned: ${msgCount} messages, ${fileCount} files`, 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `🧹 *Cache Cleared*\n\nMessages: ${msgCount}\nFiles: ${fileCount}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 console.log('\n🆘 ANTIDELETE HELP');
//                 console.log('─'.repeat(60));
//                 console.log('Commands:');
//                 console.log(`• ${PREFIX}antidelete on/off  - Enable/disable`);
//                 console.log(`• ${PREFIX}antidelete test    - Test system`);
//                 console.log(`• ${PREFIX}antidelete stats   - Statistics`);
//                 console.log(`• ${PREFIX}antidelete debug   - Debug info`);
//                 console.log(`• ${PREFIX}antidelete clear   - Clear cache`);
//                 console.log(`• ${PREFIX}antidelete help    - This help`);
//                 console.log('');
//                 console.log('Features:');
//                 console.log('• Uses proper media download (same as .vv)');
//                 console.log('• Saves actual media files');
//                 console.log('• Auto-cleanup after sending');
//                 console.log('• Text message capture');
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🆘 *Antidelete Help*\n\nNow uses the SAME media download method as .vv command!\nGuaranteed media retrieval when possible.\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 const downloaded = tracker.stats.mediaDownloaded;
//                 const sent = tracker.stats.mediaSent;
//                 const rate = downloaded > 0 ? Math.round((sent / downloaded) * 100) : 0;
                
//                 console.log('\n🚫 ANTIDELETE SYSTEM');
//                 console.log('');
//                 console.log(`Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}`);
//                 console.log(`Messages: ${tracker.messageCache.size}`);
//                 console.log(`Media files: ${tracker.mediaStorage.size}`);
//                 console.log(`Media success: ${rate}%`);
//                 console.log('');
//                 console.log(`Use \`${PREFIX}antidelete on\` to enable`);
//                 console.log(`Use \`${PREFIX}antidelete help\` for help`);
                
//                 await sock.sendMessage(chatId, {
//                     text: `🚫 *Antidelete System*\n\nStatus: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\nMedia files: ${tracker.mediaStorage.size}\nSuccess rate: ${rate}%\n\nUses same download method as .vv command!`
//                 }, { quoted: msg });
//         }
//     }
// };















// File: ./commands/utility/antidelete.js - UPDATED WITH PUBLIC/PRIVATE MODES
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MEDIA_STORAGE_PATH = path.join(__dirname, '../../../temp/antidelete_media');

// Owner JID configuration
let OWNER_JID = null;
let OWNER_NUMBER = null;

// Load owner info
async function loadOwnerInfo() {
    try {
        // Try multiple possible locations
        const possiblePaths = [
            './owner.json',
            '../owner.json',
            '../../owner.json',
            '../../../owner.json',
            path.join(__dirname, '../../../owner.json')
        ];
        
        for (const ownerPath of possiblePaths) {
            try {
                if (await fs.access(ownerPath).then(() => true).catch(() => false)) {
                    const ownerData = JSON.parse(await fs.readFile(ownerPath, 'utf8'));
                    OWNER_JID = ownerData.OWNER_JID || ownerData.ownerLID || 
                               (ownerData.OWNER_NUMBER ? ownerData.OWNER_NUMBER + '@s.whatsapp.net' : null);
                    OWNER_NUMBER = ownerData.OWNER_NUMBER || ownerData.ownerNumber;
                    
                    if (OWNER_JID) {
                        console.log(`👑 Owner loaded: ${OWNER_NUMBER} (${OWNER_JID})`);
                        break;
                    }
                }
            } catch (error) {
                // Continue to next path
            }
        }
    } catch (error) {
        console.error('❌ Error loading owner info:', error.message);
    }
}

// Call on import
loadOwnerInfo();

export default {
    name: 'antidelete',
    alias: ['undelete', 'antidel', 'ad'],
    description: 'Capture deleted messages with public/private modes',
    category: 'utility',
    
    async execute(sock, msg, args, PREFIX, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const isGroup = chatId.endsWith('@g.us');
        
        console.log('🚫 Antidelete System - Public/Private Modes');
        
        // Extract jidManager if available
        const jidManager = metadata.jidManager || {
            cleanJid: (jid) => {
                if (!jid) return { cleanJid: 'unknown', cleanNumber: 'unknown', isLid: false };
                let clean = jid.split(':')[0];
                let cleanNumber = clean.split('@')[0];
                return {
                    cleanJid: clean,
                    cleanNumber: cleanNumber,
                    isLid: clean.includes('@lid'),
                    original: jid
                };
            },
            isOwner: (msg) => {
                const senderJid = msg.key.participant || msg.key.remoteJid;
                const cleaned = this.cleanJid(senderJid);
                return cleaned.cleanNumber === OWNER_NUMBER || msg.key.fromMe;
            },
            getOwnerInfo: () => ({
                cleanJid: OWNER_JID || 'Not configured',
                cleanNumber: OWNER_NUMBER || 'Not configured',
                isLid: OWNER_JID ? OWNER_JID.includes('@lid') : false
            })
        };
        
        // Initialize global tracker
        if (!global.antideleteTerminal) {
            global.antideleteTerminal = {
                active: false,
                mode: 'public', // 'public' or 'private'
                messageCache: new Map(),
                listenerSetup: false,
                notifyInChat: true,
                stats: {
                    deletionsDetected: 0,
                    retrievedSuccessfully: 0,
                    mediaRetrieved: 0,
                    falsePositives: 0,
                    mediaDownloaded: 0,
                    mediaSent: 0,
                    sentToDm: 0,
                    sentToChat: 0
                },
                seenMessages: new Map(),
                processedDeletions: new Set(),
                mediaStorage: new Map(),
                cleanupInterval: null,
                lastCleanup: Date.now(),
                // Track DMs sent to owner
                ownerDmLog: new Map(),
                // Configuration
                config: {
                    autoCleanup: true,
                    maxStorageHours: 24,
                    notifyOnModeChange: true,
                    stealthMode: false,
                    logToTerminal: true
                }
            };
        }
        
        const tracker = global.antideleteTerminal;
        const command = args[0]?.toLowerCase() || 'help';
        
        // ====== UTILITY FUNCTIONS ======
        
        // Check if sender is owner
        function isOwner(msg) {
            if (!msg) return false;
            
            // fromMe is always owner
            if (msg.key.fromMe) return true;
            
            const senderJid = msg.key.participant || msg.key.remoteJid;
            const cleaned = jidManager.cleanJid(senderJid);
            
            // Check against stored owner
            if (OWNER_NUMBER && cleaned.cleanNumber === OWNER_NUMBER) return true;
            
            // Check using jidManager
            if (jidManager.isOwner) {
                return jidManager.isOwner(msg);
            }
            
            return false;
        }
        
        // Get owner JID
        function getOwnerJid() {
            if (OWNER_JID) return OWNER_JID;
            if (jidManager.getOwnerInfo) {
                const info = jidManager.getOwnerInfo();
                return info.cleanJid !== 'Not configured' ? info.cleanJid : null;
            }
            return null;
        }
        
        // Log messages
        function cleanLog(message, type = 'info') {
            if (!tracker.config.logToTerminal) return;
            
            const prefixes = {
                'info': '📝',
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'system': '🚫',
                'media': '📷',
                'deletion': '🗑️',
                'dm': '📨',
                'mode': '🔄'
            };
            
            const prefix = prefixes[type] || '📝';
            console.log(`${prefix} Antidelete: ${message}`);
        }
        
        // Ensure media directory
        async function ensureMediaDir() {
            try {
                await fs.mkdir(MEDIA_STORAGE_PATH, { recursive: true });
                return true;
            } catch (error) {
                cleanLog(`Directory error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // ====== MEDIA HANDLING FUNCTIONS ======
        
        // Download media properly
        async function downloadMediaProperly(message) {
            try {
                const msgId = message.key?.id;
                if (!msgId) return null;
                
                cleanLog(`Downloading media for: ${msgId.substring(0, 8)}...`, 'media');
                
                const buffer = await downloadMediaMessage(
                    message,
                    'buffer',
                    {},
                    {
                        logger: { level: 'silent' },
                        reuploadRequest: sock.updateMediaMessage
                    }
                );
                
                if (!buffer || buffer.length === 0) {
                    cleanLog('Empty buffer returned', 'warning');
                    return null;
                }
                
                cleanLog(`Downloaded: ${buffer.length} bytes`, 'success');
                return buffer;
                
            } catch (error) {
                cleanLog(`Download error: ${error.message}`, 'error');
                return null;
            }
        }
        
        // Save media to file
        async function saveMediaFile(messageId, buffer, type, mimetype, originalMessage) {
            try {
                await ensureMediaDir();
                
                // Generate filename
                const timestamp = Date.now();
                let extension = getFileExtension(type, mimetype);
                const filename = `antidelete_${messageId.substring(0, 8)}_${timestamp}${extension}`;
                const filePath = path.join(MEDIA_STORAGE_PATH, filename);
                
                // Write file
                await fs.writeFile(filePath, buffer);
                
                // Store metadata
                tracker.mediaStorage.set(messageId, {
                    filePath: filePath,
                    buffer: buffer,
                    type: type,
                    mimetype: mimetype || getMimeType(type),
                    filename: filename,
                    size: buffer.length,
                    timestamp: timestamp,
                    originalMessage: originalMessage
                });
                
                cleanLog(`Saved: ${filename} (${Math.round(buffer.length/1024)}KB)`, 'media');
                tracker.stats.mediaDownloaded++;
                return true;
                
            } catch (error) {
                cleanLog(`Save error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Get file extension
        function getFileExtension(type, mimetype = '') {
            switch(type) {
                case 'image':
                    if (mimetype.includes('png')) return '.png';
                    if (mimetype.includes('gif')) return '.gif';
                    if (mimetype.includes('webp')) return '.webp';
                    return '.jpg';
                case 'video':
                    if (mimetype.includes('gif')) return '.gif';
                    if (mimetype.includes('webm')) return '.webm';
                    return '.mp4';
                case 'audio':
                    if (mimetype.includes('ogg')) return '.ogg';
                    if (mimetype.includes('mp3')) return '.mp3';
                    return '.m4a';
                case 'sticker':
                    return '.webp';
                case 'document':
                    const originalExt = mimetype.split('/')[1];
                    return originalExt ? `.${originalExt.split(';')[0]}` : '.bin';
                default:
                    return '.dat';
            }
        }
        
        // Get mime type
        function getMimeType(type) {
            switch(type) {
                case 'image': return 'image/jpeg';
                case 'video': return 'video/mp4';
                case 'audio': return 'audio/mp4';
                case 'sticker': return 'image/webp';
                case 'document': return 'application/octet-stream';
                default: return 'application/octet-stream';
            }
        }
        
        // Send media to chat (public mode)
        async function sendMediaToChat(messageDetails) {
            try {
                const messageId = messageDetails.id;
                const mediaInfo = tracker.mediaStorage.get(messageId);
                
                if (!mediaInfo) {
                    return sendTextNotification(messageDetails);
                }
                
                const time = new Date(messageDetails.timestamp).toLocaleTimeString();
                const senderName = messageDetails.pushName || messageDetails.senderShort;
                
                let caption = `🚫 *DELETED ${messageDetails.type.toUpperCase()}*\n\n`;
                caption += `👤 From: ${senderName}\n`;
                caption += `📞 Number: ${messageDetails.senderShort}\n`;
                caption += `🕒 Time: ${time}\n`;
                
                if (messageDetails.caption) {
                    caption += `💬 Caption: ${messageDetails.caption}\n`;
                }
                
                caption += `\n🔍 *Captured by antidelete*`;
                
                // Read buffer
                let buffer = mediaInfo.buffer;
                if (!buffer) {
                    buffer = await fs.readFile(mediaInfo.filePath);
                }
                
                if (!buffer || buffer.length === 0) {
                    return sendTextNotification(messageDetails);
                }
                
                // Send based on type
                switch(messageDetails.type) {
                    case 'image':
                        await sock.sendMessage(messageDetails.chat, {
                            image: buffer,
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'video':
                        await sock.sendMessage(messageDetails.chat, {
                            video: buffer,
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'audio':
                        await sock.sendMessage(messageDetails.chat, {
                            audio: buffer,
                            mimetype: mediaInfo.mimetype,
                            ptt: mediaInfo.mimetype?.includes('ogg')
                        });
                        break;
                        
                    case 'document':
                        await sock.sendMessage(messageDetails.chat, {
                            document: buffer,
                            fileName: messageDetails.fileName || 'document',
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'sticker':
                        await sock.sendMessage(messageDetails.chat, {
                            sticker: buffer,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    default:
                        return sendTextNotification(messageDetails);
                }
                
                tracker.stats.mediaSent++;
                tracker.stats.sentToChat++;
                cleanLog(`Media sent to chat: ${messageDetails.type}`, 'success');
                return true;
                
            } catch (error) {
                cleanLog(`Send to chat error: ${error.message}`, 'error');
                return sendTextNotification(messageDetails);
            }
        }
        
        // Send media to owner's DM (private mode)
        async function sendMediaToOwnerDM(messageDetails) {
            try {
                const ownerJid = getOwnerJid();
                if (!ownerJid) {
                    cleanLog('Owner JID not found', 'error');
                    return false;
                }
                
                const messageId = messageDetails.id;
                const mediaInfo = tracker.mediaStorage.get(messageId);
                
                if (!mediaInfo) {
                    return sendTextToOwnerDM(messageDetails);
                }
                
                const time = new Date(messageDetails.timestamp).toLocaleString();
                const senderName = messageDetails.pushName || messageDetails.senderShort;
                const chatName = messageDetails.chatName || 'Unknown Chat';
                
                // Read buffer
                let buffer = mediaInfo.buffer;
                if (!buffer) {
                    buffer = await fs.readFile(mediaInfo.filePath);
                }
                
                if (!buffer || buffer.length === 0) {
                    return sendTextToOwnerDM(messageDetails);
                }
                
                // Create detailed caption for owner
                let caption = `🔒 *PRIVATE ANTIDELETE - DELETED ${messageDetails.type.toUpperCase()}*\n\n`;
                caption += `👤 Sender: ${senderName}\n`;
                caption += `📞 Number: ${messageDetails.senderShort}\n`;
                caption += `💬 Chat: ${chatName}\n`;
                caption += `🏷️ Type: ${messageDetails.chatType}\n`;
                caption += `🕒 Time: ${time}\n`;
                caption += `📊 Size: ${Math.round(mediaInfo.size/1024)}KB\n`;
                
                if (messageDetails.caption) {
                    caption += `📝 Caption: ${messageDetails.caption}\n`;
                }
                
                caption += `\n🔐 *Sent to your DM via private antidelete*`;
                
                // Send based on type
                switch(messageDetails.type) {
                    case 'image':
                        await sock.sendMessage(ownerJid, {
                            image: buffer,
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'video':
                        await sock.sendMessage(ownerJid, {
                            video: buffer,
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'audio':
                        await sock.sendMessage(ownerJid, {
                            audio: buffer,
                            mimetype: mediaInfo.mimetype,
                            ptt: mediaInfo.mimetype?.includes('ogg'),
                            caption: caption
                        });
                        break;
                        
                    case 'document':
                        await sock.sendMessage(ownerJid, {
                            document: buffer,
                            fileName: `${messageDetails.fileName || 'document'}_${Date.now()}`,
                            caption: caption,
                            mimetype: mediaInfo.mimetype
                        });
                        break;
                        
                    case 'sticker':
                        await sock.sendMessage(ownerJid, {
                            sticker: buffer,
                            mimetype: mediaInfo.mimetype
                        });
                        // Send caption separately for stickers
                        await sock.sendMessage(ownerJid, {
                            text: caption
                        });
                        break;
                        
                    default:
                        return sendTextToOwnerDM(messageDetails);
                }
                
                tracker.stats.mediaSent++;
                tracker.stats.sentToDm++;
                
                // Log this DM
                tracker.ownerDmLog.set(messageId, {
                    timestamp: Date.now(),
                    sender: messageDetails.senderShort,
                    type: messageDetails.type,
                    chat: chatName
                });
                
                cleanLog(`Media sent to owner DM: ${messageDetails.type}`, 'dm');
                return true;
                
            } catch (error) {
                cleanLog(`Send to DM error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Send text notification to chat
        async function sendTextNotification(messageDetails) {
            const time = new Date(messageDetails.timestamp).toLocaleTimeString();
            const senderName = messageDetails.pushName || messageDetails.senderShort;
            
            let textMessage = `🚫 *DELETED MESSAGE*\n\n`;
            textMessage += `👤 *From:* ${senderName}\n`;
            textMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
            textMessage += `🕒 *Time:* ${time}\n`;
            textMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
            
            if (messageDetails.text) {
                textMessage += `\n💬 *Message:*\n${messageDetails.text.substring(0, 500)}`;
                if (messageDetails.text.length > 500) textMessage += '...';
            }
            
            if (messageDetails.hasMedia) {
                textMessage += `\n\n📎 *Media captured but not retrievable*`;
            }
            
            textMessage += `\n\n────────────\n`;
            textMessage += `🔍 *Captured by antidelete*`;
            
            await sock.sendMessage(messageDetails.chat, { text: textMessage });
            tracker.stats.sentToChat++;
            cleanLog('Text notification sent to chat', 'info');
        }
        
        // Send text to owner DM
        async function sendTextToOwnerDM(messageDetails) {
            try {
                const ownerJid = getOwnerJid();
                if (!ownerJid) return false;
                
                const time = new Date(messageDetails.timestamp).toLocaleString();
                const senderName = messageDetails.pushName || messageDetails.senderShort;
                const chatName = messageDetails.chatName || 'Unknown Chat';
                
                let textMessage = `🔒 *PRIVATE ANTIDELETE - DELETED MESSAGE*\n\n`;
                textMessage += `👤 *Sender:* ${senderName}\n`;
                textMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
                textMessage += `💬 *Chat:* ${chatName}\n`;
                textMessage += `🏷️ *Type:* ${messageDetails.chatType}\n`;
                textMessage += `🕒 *Time:* ${time}\n`;
                textMessage += `📊 *Message Type:* ${messageDetails.type.toUpperCase()}\n`;
                
                if (messageDetails.text) {
                    textMessage += `\n📝 *Content:*\n${messageDetails.text.substring(0, 800)}`;
                    if (messageDetails.text.length > 800) textMessage += '...';
                }
                
                if (messageDetails.hasMedia) {
                    textMessage += `\n\n📎 *Media:* ${tracker.mediaStorage.has(messageDetails.id) ? 'Captured ✓' : 'Not retrievable'}`;
                }
                
                textMessage += `\n\n────────────\n`;
                textMessage += `🔐 *Private antidelete capture*`;
                
                await sock.sendMessage(ownerJid, { text: textMessage });
                tracker.stats.sentToDm++;
                
                // Log this DM
                tracker.ownerDmLog.set(messageDetails.id, {
                    timestamp: Date.now(),
                    sender: messageDetails.senderShort,
                    type: messageDetails.type,
                    chat: chatName
                });
                
                cleanLog('Text sent to owner DM', 'dm');
                return true;
                
            } catch (error) {
                cleanLog(`DM text error: ${error.message}`, 'error');
                return false;
            }
        }
        
        // Clean up media
        async function cleanupMedia(messageId) {
            try {
                if (tracker.mediaStorage.has(messageId)) {
                    const mediaInfo = tracker.mediaStorage.get(messageId);
                    try {
                        await fs.unlink(mediaInfo.filePath);
                        cleanLog(`Cleaned: ${mediaInfo.filename}`, 'info');
                    } catch (error) {
                        // File might already be deleted
                    }
                    tracker.mediaStorage.delete(messageId);
                }
            } catch (error) {
                // Silent cleanup
            }
        }
        
        // ====== CORE FUNCTIONS ======
        
        // Setup cleanup
        function setupCleanupInterval() {
            if (tracker.cleanupInterval) {
                clearInterval(tracker.cleanupInterval);
            }
            
            tracker.cleanupInterval = setInterval(async () => {
                await cleanupOldData();
            }, 10 * 60 * 1000); // Every 10 minutes
        }
        
        // Cleanup old data
        async function cleanupOldData() {
            const now = Date.now();
            const maxAge = tracker.config.maxStorageHours * 60 * 60 * 1000;
            
            // Clean media files
            for (const [msgId, mediaInfo] of tracker.mediaStorage.entries()) {
                if (now - mediaInfo.timestamp > maxAge) {
                    await cleanupMedia(msgId);
                }
            }
            
            // Clean old messages
            for (const [msgId, data] of tracker.messageCache.entries()) {
                if (now - data.timestamp > maxAge) {
                    tracker.messageCache.delete(msgId);
                }
            }
            
            // Clean old DM logs
            for (const [msgId, log] of tracker.ownerDmLog.entries()) {
                if (now - log.timestamp > maxAge) {
                    tracker.ownerDmLog.delete(msgId);
                }
            }
            
            tracker.lastCleanup = now;
        }
        
        // Get chat name
        async function getChatName(chatId) {
            try {
                if (chatId.endsWith('@g.us')) {
                    const metadata = await sock.groupMetadata(chatId);
                    return metadata.subject || 'Group Chat';
                }
                return 'Private Chat';
            } catch (error) {
                return 'Unknown Chat';
            }
        }
        
        // Store message with media
        async function storeMessageWithMedia(message) {
            try {
                const msgId = message.key.id;
                const msgChat = message.key.remoteJid;
                
                if (tracker.messageCache.has(msgId)) return;
                
                const sender = message.key.participant || msgChat;
                const senderShort = sender.split('@')[0];
                
                // Extract message info
                let text = '';
                let type = 'text';
                let fileName = '';
                let caption = '';
                let hasMedia = false;
                let mimetype = '';
                
                const msgContent = message.message;
                
                // Extract text
                if (msgContent?.conversation) {
                    text = msgContent.conversation;
                } else if (msgContent?.extendedTextMessage?.text) {
                    text = msgContent.extendedTextMessage.text;
                }
                
                // Detect media type
                if (msgContent?.imageMessage) {
                    type = 'image';
                    caption = msgContent.imageMessage.caption || '';
                    mimetype = msgContent.imageMessage.mimetype || 'image/jpeg';
                    hasMedia = true;
                } else if (msgContent?.videoMessage) {
                    type = 'video';
                    caption = msgContent.videoMessage.caption || '';
                    mimetype = msgContent.videoMessage.mimetype || 'video/mp4';
                    hasMedia = true;
                } else if (msgContent?.audioMessage) {
                    type = 'audio';
                    mimetype = msgContent.audioMessage.mimetype || 'audio/mp4';
                    hasMedia = true;
                    if (!text) text = 'Audio message';
                } else if (msgContent?.documentMessage) {
                    type = 'document';
                    fileName = msgContent.documentMessage.fileName || 'Document';
                    mimetype = msgContent.documentMessage.mimetype || 'application/octet-stream';
                    hasMedia = true;
                    if (!text) text = fileName;
                } else if (msgContent?.stickerMessage) {
                    type = 'sticker';
                    mimetype = msgContent.stickerMessage.mimetype || 'image/webp';
                    hasMedia = true;
                    if (!text) text = 'Sticker';
                }
                
                if (!text && caption) text = caption;
                
                // Get chat name
                const chatName = await getChatName(msgChat);
                const chatType = msgChat.endsWith('@g.us') ? 'Group' : 'Private';
                
                // Store message details
                const messageDetails = {
                    id: msgId,
                    chat: msgChat,
                    sender: sender,
                    senderShort: senderShort,
                    timestamp: Date.now(),
                    messageTimestamp: message.messageTimestamp || Date.now(),
                    pushName: message.pushName || 'Unknown',
                    text: text,
                    type: type,
                    hasMedia: hasMedia,
                    fileName: fileName,
                    caption: caption,
                    mimetype: mimetype,
                    originalMessage: message,
                    mediaDownloaded: false,
                    chatName: chatName,
                    chatType: chatType
                };
                
                tracker.messageCache.set(msgId, messageDetails);
                
                // Download media in background if it exists
                if (hasMedia) {
                    setTimeout(async () => {
                        try {
                            cleanLog(`Downloading media for ${msgId.substring(0, 8)}...`, 'media');
                            const buffer = await downloadMediaProperly(message);
                            
                            if (buffer) {
                                await saveMediaFile(msgId, buffer, type, mimetype, message);
                                messageDetails.mediaDownloaded = true;
                                cleanLog(`Media saved for ${msgId.substring(0, 8)}`, 'success');
                            } else {
                                cleanLog(`Could not download media for ${msgId.substring(0, 8)}`, 'warning');
                            }
                        } catch (error) {
                            cleanLog(`Background download error: ${error.message}`, 'error');
                        }
                    }, 1000);
                }
                
            } catch (error) {
                cleanLog(`Store error: ${error.message}`, 'error');
            }
        }
        
        // Handle deleted message
        async function handleDeletedMessage(deletedKey) {
            try {
                const deletedId = deletedKey.id;
                
                if (!deletedId || tracker.processedDeletions.has(deletedId)) return;
                
                tracker.processedDeletions.add(deletedId);
                setTimeout(() => {
                    tracker.processedDeletions.delete(deletedId);
                }, 10000);
                
                cleanLog(`Deletion detected: ${deletedId.substring(0, 8)}...`, 'deletion');
                tracker.stats.deletionsDetected++;
                
                const cachedMessage = tracker.messageCache.get(deletedId);
                
                if (cachedMessage) {
                    tracker.messageCache.delete(deletedId);
                    
                    // Process based on mode
                    if (tracker.mode === 'private') {
                        await sendMediaToOwnerDM(cachedMessage);
                    } else {
                        await sendMediaToChat(cachedMessage);
                    }
                    
                    tracker.stats.retrievedSuccessfully++;
                    if (cachedMessage.hasMedia) {
                        tracker.stats.mediaRetrieved++;
                    }
                    
                    // Clean up after delay
                    setTimeout(() => {
                        cleanupMedia(deletedId);
                    }, 30000);
                    
                } else {
                    cleanLog(`Not found in cache: ${deletedId.substring(0, 8)}...`, 'warning');
                    tracker.stats.falsePositives++;
                }
                
            } catch (error) {
                cleanLog(`Retrieval error: ${error.message}`, 'error');
            }
        }
        
        // Setup listener
        function setupTerminalListener() {
            if (tracker.listenerSetup) return;
            
            cleanLog(`Setting up antidelete in ${tracker.mode} mode...`, 'system');
            
            ensureMediaDir();
            setupCleanupInterval();
            
            // Store messages
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                try {
                    if (!tracker.active) return;
                    
                    if (type === 'notify') {
                        for (const message of messages) {
                            if (message.key?.fromMe) continue;
                            
                            const msgId = message.key?.id;
                            if (!msgId) continue;
                            
                            tracker.seenMessages.set(msgId, Date.now());
                            await storeMessageWithMedia(message);
                        }
                    }
                } catch (error) {
                    cleanLog(`Storage error: ${error.message}`, 'error');
                }
            });
            
            // Handle deletions
            sock.ev.on('messages.update', async (updates) => {
                try {
                    if (!tracker.active) return;
                    
                    for (const update of updates) {
                        const updateData = update.update || {};
                        const messageId = update.key?.id;
                        const chatId = update.key?.remoteJid;
                        
                        if (!messageId || !chatId) continue;
                        
                        const isDeleted = 
                            updateData.status === 6 ||
                            updateData.message === null ||
                            (updateData.messageStubType === 7) ||
                            (updateData.messageStubType === 8);
                        
                        if (isDeleted) {
                            await handleDeletedMessage(update.key);
                        }
                    }
                } catch (error) {
                    cleanLog(`Detection error: ${error.message}`, 'error');
                }
            });
            
            tracker.listenerSetup = true;
            cleanLog(`Listener ready in ${tracker.mode} mode`, 'success');
        }
        
        // ====== COMMAND HANDLER ======
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                // Check if user is owner for private mode
                if (args[1]?.toLowerCase() === 'private') {
                    if (!isOwner(msg)) {
                        return sock.sendMessage(chatId, {
                            text: `❌ *Owner Only*\n\nOnly the bot owner can enable private mode.\n\nCurrent owner: ${OWNER_NUMBER || 'Not set'}`
                        }, { quoted: msg });
                    }
                    tracker.mode = 'private';
                } else {
                    tracker.mode = 'public';
                }
                
                tracker.active = true;
                
                // Reset stats
                Object.keys(tracker.stats).forEach(key => {
                    tracker.stats[key] = 0;
                });
                
                setupTerminalListener();
                
                const modeText = tracker.mode === 'private' ? 
                    `🔒 *PRIVATE MODE*\n\nAll deleted messages will be sent to owner's DM:\n${getOwnerJid() || 'Owner not set'}` :
                    `🌐 *PUBLIC MODE*\n\nDeleted messages will be shown in the original chat.`;
                
                cleanLog(`Antidelete ${tracker.mode.toUpperCase()} mode enabled`, 'success');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE ENABLED*\n\n${modeText}\n\nFeatures:\n• Uses proper media download\n• Auto-cleanup after sending\n• Captures all message types\n\nUse \`${PREFIX}antidelete test\` to verify.`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
            case 'stop':
                tracker.active = false;
                if (tracker.cleanupInterval) {
                    clearInterval(tracker.cleanupInterval);
                    tracker.cleanupInterval = null;
                }
                
                // Clean up all files
                for (const msgId of tracker.mediaStorage.keys()) {
                    await cleanupMedia(msgId);
                }
                
                cleanLog('Antidelete disabled', 'system');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE DISABLED*\n\nAll media files cleaned up.\nMode was: ${tracker.mode.toUpperCase()}\n\nUse \`${PREFIX}antidelete on\` to enable.`
                }, { quoted: msg });
                break;
                
            case 'mode':
                if (!isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nOnly the bot owner can change modes.`
                    }, { quoted: msg });
                }
                
                const newMode = args[1]?.toLowerCase();
                if (!newMode || !['public', 'private'].includes(newMode)) {
                    return sock.sendMessage(chatId, {
                        text: `🔧 *Mode Settings*\n\nCurrent mode: ${tracker.mode.toUpperCase()}\n\nAvailable modes:\n• \`${PREFIX}antidelete mode public\` - Show in chat\n• \`${PREFIX}antidelete mode private\` - Send to owner DM\n\nOwner: ${OWNER_NUMBER || 'Not set'}`
                    }, { quoted: msg });
                }
                
                const oldMode = tracker.mode;
                tracker.mode = newMode;
                
                cleanLog(`Mode changed: ${oldMode} → ${newMode}`, 'mode');
                
                await sock.sendMessage(chatId, {
                    text: `🔄 *Mode Changed*\n\n${oldMode.toUpperCase()} → ${newMode.toUpperCase()}\n\n${
                        newMode === 'private' ? 
                        `Deleted messages will now be sent to your DM.` :
                        `Deleted messages will now be shown in the original chat.`
                    }`
                }, { quoted: msg });
                break;
                
            case 'test':
                if (tracker.mode === 'private' && !isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nPrivate mode tests can only be run by the owner.\n\nCurrent owner: ${OWNER_NUMBER || 'Not set'}`
                    }, { quoted: msg });
                }
                
                cleanLog('Sending test messages...', 'info');
                
                // Send test messages based on mode
                if (tracker.mode === 'private') {
                    await sock.sendMessage(chatId, {
                        text: `🔒 *PRIVATE MODE TEST*\n\n1. Send any message in this chat\n2. Delete it\n3. It will be sent to owner's DM\n\nOwner: ${OWNER_NUMBER || 'Not set'}`
                    });
                    
                    // Also send a DM to owner if available
                    const ownerJid = getOwnerJid();
                    if (ownerJid) {
                        await sock.sendMessage(ownerJid, {
                            text: `🔒 *Private Antidelete Test*\n\nIf someone deletes a message, it will appear here.\n\nCurrent chat: ${await getChatName(chatId)}`
                        });
                    }
                } else {
                    await sock.sendMessage(chatId, {
                        text: `🌐 *PUBLIC MODE TEST*\n\n1. Delete this message\n2. It should reappear in this chat\n3. Try with images/videos too!`
                    });
                }
                
                cleanLog('Test instructions sent', 'success');
                break;
                
            case 'stats':
                const successRate = tracker.stats.mediaDownloaded > 0 ? 
                    Math.round((tracker.stats.mediaSent / tracker.stats.mediaDownloaded) * 100) : 0;
                
                const statsText = `📊 *Antidelete Statistics*\n\n` +
                    `Mode: ${tracker.mode.toUpperCase()}\n` +
                    `Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}\n` +
                    `Messages cached: ${tracker.messageCache.size}\n` +
                    `Media files: ${tracker.mediaStorage.size}\n\n` +
                    `📈 *Performance:*\n` +
                    `• Deletions detected: ${tracker.stats.deletionsDetected}\n` +
                    `• Successfully retrieved: ${tracker.stats.retrievedSuccessfully}\n` +
                    `• Media downloaded: ${tracker.stats.mediaDownloaded}\n` +
                    `• Media sent: ${tracker.stats.mediaSent}\n` +
                    `• Success rate: ${successRate}%\n` +
                    `• Sent to DM: ${tracker.stats.sentToDm}\n` +
                    `• Sent to chat: ${tracker.stats.sentToChat}\n` +
                    `• False positives: ${tracker.stats.falsePositives}`;
                
                console.log('\n📊 ANTIDELETE STATISTICS');
                console.log('─'.repeat(60));
                console.log(`Mode: ${tracker.mode}`);
                console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
                console.log(`Messages cached: ${tracker.messageCache.size}`);
                console.log(`Media files: ${tracker.mediaStorage.size}`);
                console.log(`Owner DMs sent: ${tracker.stats.sentToDm}`);
                console.log(`Chat messages sent: ${tracker.stats.sentToChat}`);
                console.log(`Media success rate: ${successRate}%`);
                console.log('─'.repeat(60));
                
                await sock.sendMessage(chatId, {
                    text: statsText
                }, { quoted: msg });
                break;
                
            case 'owner':
            case 'whoami':
                const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : {
                    cleanJid: getOwnerJid(),
                    cleanNumber: OWNER_NUMBER,
                    isLid: false
                };
                
                const isUserOwner = isOwner(msg);
                
                await sock.sendMessage(chatId, {
                    text: `👑 *Owner Information*\n\n` +
                        `Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n` +
                        `Owner JID: \`${ownerInfo.cleanJid || 'Not set'}\`\n` +
                        `You are ${isUserOwner ? '✅ THE OWNER' : '❌ NOT THE OWNER'}\n\n` +
                        `Current antidelete mode: ${tracker.mode.toUpperCase()}\n` +
                        `Private mode ${isUserOwner ? 'available ✓' : 'locked 🔒'}`
                }, { quoted: msg });
                break;
                
            case 'debug':
                if (!isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nDebug info is only available to the owner.`
                    }, { quoted: msg });
                }
                
                console.log('\n🔧 ANTIDELETE DEBUG');
                console.log('─'.repeat(70));
                console.log(`System: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
                console.log(`Mode: ${tracker.mode}`);
                console.log(`Messages in cache: ${tracker.messageCache.size}`);
                console.log(`Media files: ${tracker.mediaStorage.size}`);
                console.log(`Owner JID: ${getOwnerJid()}`);
                console.log(`Owner number: ${OWNER_NUMBER}`);
                console.log(`Listener setup: ${tracker.listenerSetup}`);
                console.log(`Cleanup interval: ${tracker.cleanupInterval ? 'ACTIVE' : 'INACTIVE'}`);
                console.log(`Last cleanup: ${new Date(tracker.lastCleanup).toLocaleTimeString()}`);
                
                // Show recent DMs
                if (tracker.ownerDmLog.size > 0) {
                    console.log('\n📨 RECENT OWNER DMs:');
                    let index = 1;
                    for (const [msgId, log] of tracker.ownerDmLog.entries()) {
                        const age = Math.round((Date.now() - log.timestamp) / 1000);
                        console.log(`${index}. From: ${log.sender}`);
                        console.log(`   Chat: ${log.chat}`);
                        console.log(`   Type: ${log.type}, Age: ${age}s`);
                        console.log(`   ID: ${msgId.substring(0, 12)}...`);
                        console.log('   ─'.repeat(20));
                        index++;
                        if (index > 5) break;
                    }
                }
                
                console.log('─'.repeat(70));
                
                await sock.sendMessage(chatId, {
                    text: `🔧 Debug info sent to terminal\n\nMode: ${tracker.mode}\nMedia files: ${tracker.mediaStorage.size}\nOwner DMs: ${tracker.ownerDmLog.size}`
                });
                break;
                
            case 'clear':
            case 'clean':
                if (args[1] === 'dm' && !isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nOnly the owner can clear DM logs.`
                    }, { quoted: msg });
                }
                
                const msgCount = tracker.messageCache.size;
                const fileCount = tracker.mediaStorage.size;
                const dmCount = tracker.ownerDmLog.size;
                
                // Clean files
                for (const msgId of tracker.mediaStorage.keys()) {
                    await cleanupMedia(msgId);
                }
                
                tracker.messageCache.clear();
                tracker.mediaStorage.clear();
                tracker.seenMessages.clear();
                tracker.processedDeletions.clear();
                
                if (args[1] === 'dm') {
                    tracker.ownerDmLog.clear();
                }
                
                cleanLog(`Cleaned: ${msgCount} messages, ${fileCount} files${args[1] === 'dm' ? `, ${dmCount} DM logs` : ''}`, 'success');
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *Cache Cleared*\n\nMessages: ${msgCount}\nFiles: ${fileCount}${args[1] === 'dm' ? `\nDM logs: ${dmCount}` : ''}`
                }, { quoted: msg });
                break;
                
            case 'config':
                if (!isOwner(msg)) {
                    return sock.sendMessage(chatId, {
                        text: `❌ *Owner Only*\n\nConfiguration can only be changed by the owner.`
                    }, { quoted: msg });
                }
                
                const setting = args[1];
                const value = args[2];
                
                if (!setting) {
                    // Show current config
                    let configText = `⚙️ *Antidelete Configuration*\n\n`;
                    for (const [key, val] of Object.entries(tracker.config)) {
                        configText += `• ${key}: ${val}\n`;
                    }
                    configText += `\nTo change: \`${PREFIX}antidelete config <key> <value>\``;
                    
                    await sock.sendMessage(chatId, {
                        text: configText
                    }, { quoted: msg });
                    return;
                }
                
                if (value === undefined) {
                    await sock.sendMessage(chatId, {
                        text: `❌ Need value\n\nUsage: \`${PREFIX}antidelete config ${setting} <value>\``
                    }, { quoted: msg });
                    return;
                }
                
                // Parse value
                let parsedValue;
                if (value.toLowerCase() === 'true') parsedValue = true;
                else if (value.toLowerCase() === 'false') parsedValue = false;
                else if (!isNaN(value)) parsedValue = Number(value);
                else parsedValue = value;
                
                if (tracker.config.hasOwnProperty(setting)) {
                    tracker.config[setting] = parsedValue;
                    
                    // Special handling
                    if (setting === 'autoCleanup' && parsedValue === true) {
                        setupCleanupInterval();
                    } else if (setting === 'autoCleanup' && parsedValue === false) {
                        if (tracker.cleanupInterval) {
                            clearInterval(tracker.cleanupInterval);
                            tracker.cleanupInterval = null;
                        }
                    }
                    
                    await sock.sendMessage(chatId, {
                        text: `✅ Config updated\n\n${setting}: ${parsedValue}`
                    }, { quoted: msg });
                } else {
                    await sock.sendMessage(chatId, {
                        text: `❌ Invalid setting\n\nAvailable: ${Object.keys(tracker.config).join(', ')}`
                    }, { quoted: msg });
                }
                break;
                
            case 'help':
                const helpText = `
🚫 *ANTIDELETE SYSTEM HELP*
⚡ *Commands:*
• \`${PREFIX}antidelete on [private/public]\`
• \`${PREFIX}antidelete off\`
• \`${PREFIX}antidelete mode <public/private>\`

👑 *Owner:* ${OWNER_NUMBER || 'Not set'}
`.trim();
                
                await sock.sendMessage(chatId, {
                    text: helpText
                }, { quoted: msg });
                break;
                
            default:
                const downloaded = tracker.stats.mediaDownloaded;
                const sent = tracker.stats.mediaSent;
                const rate = downloaded > 0 ? Math.round((sent / downloaded) * 100) : 0;
                
                const statusText = `
🚫 *Antidelete System*

Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
Mode: ${tracker.mode.toUpperCase()}
Media files: ${tracker.mediaStorage.size}
Success rate: ${rate}%

${tracker.mode === 'private' ? 
`🔒 *Private Mode Active*
Deleted messages sent to owner's DM` : 
`🌐 *Public Mode Active*
Deleted messages shown in chat`}

Owner: ${OWNER_NUMBER || 'Not set'}

Use \`${PREFIX}antidelete on\` to enable
Use \`${PREFIX}antidelete help\` for all commands
`.trim();
                
                await sock.sendMessage(chatId, {
                    text: statusText
                }, { quoted: msg });
        }
    }
};