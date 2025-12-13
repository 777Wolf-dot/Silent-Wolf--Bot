













// // File: ./commands/utility/antidelete.js - MEDIA SUPPORT WITH CLEAN LOGS
// export default {
//     name: 'antidelete',
//     alias: ['undelete', 'antidel'],
//     description: 'Capture deleted messages including media',
//     category: 'utility',
    
//     async execute(sock, msg, args, PREFIX) {
//         const chatId = msg.key.remoteJid;
        
//         console.log('🚫 Antidelete System');
        
//         // Initialize global tracker
//         if (!global.antideleteTerminal) {
//             global.antideleteTerminal = {
//                 active: false,
//                 messageCache: new Map(),
//                 mediaCache: new Map(), // Separate cache for media
//                 listenerSetup: false,
//                 notifyInChat: true,
//                 deletionCount: 0,
//                 retrievedCount: 0,
//                 mediaRetrieved: 0,
//                 recentDeletionIds: new Set(),
//                 processedMessages: new Set(),
//                 lastMessagePerChat: new Map(),
//                 // Clean log tracking
//                 lastLogTime: 0,
//                 logThrottle: 1000 // 1 second between logs
//             };
//         }
        
//         const tracker = global.antideleteTerminal;
//         const command = args[0]?.toLowerCase() || 'help';
        
//         // Clean log helper
//         function cleanLog(message, type = 'info') {
//             const now = Date.now();
//             if (now - tracker.lastLogTime < tracker.logThrottle && type === 'info') {
//                 return; // Throttle frequent logs
//             }
            
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
//             tracker.lastLogTime = now;
//         }
        
//         // Setup listener
//         function setupTerminalListener() {
//             if (tracker.listenerSetup) return;
            
//             cleanLog('Setting up antidelete listener...', 'system');
//             cleanLog(`Chat notifications: ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`, 'info');
            
//             // Capture incoming messages
//             sock.ev.on('messages.upsert', async ({ messages, type }) => {
//                 try {
//                     if (!tracker.active || type !== 'notify') return;
                    
//                     for (const message of messages) {
//                         await storeMessage(message);
//                     }
                    
//                 } catch (error) {
//                     cleanLog(`Storage error: ${error.message}`, 'error');
//                 }
//             });
            
//             // Deletion detection
//             sock.ev.on('messages.update', async (updates) => {
//                 try {
//                     if (!tracker.active) return;
                    
//                     for (const update of updates) {
//                         const updateData = update.update || {};
                        
//                         if (!update.key || !update.key.id) continue;
                        
//                         const messageId = update.key.id;
                        
//                         const isDeleted = 
//                             updateData.message === null ||
//                             updateData.message === undefined ||
//                             updateData.status === 6 ||
//                             updateData.messageStubType === 7 ||
//                             updateData.messageStubType === 8;
                        
//                         if (isDeleted) {
//                             cleanLog(`Deletion detected: ${messageId.substring(0, 8)}...`, 'deletion');
                            
//                             tracker.recentDeletionIds.add(messageId);
                            
//                             setTimeout(() => {
//                                 tracker.recentDeletionIds.delete(messageId);
//                             }, 10000);
                            
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
        
//         // Store message with media support
//         async function storeMessage(message) {
//             try {
//                 if (message.key.fromMe) return;
                
//                 const msgId = message.key.id;
//                 const msgChat = message.key.remoteJid;
                
//                 if (tracker.processedMessages.has(msgId)) return;
//                 tracker.processedMessages.add(msgId);
                
//                 // Clean old processed messages
//                 if (tracker.processedMessages.size > 10000) {
//                     const firstItem = tracker.processedMessages.values().next().value;
//                     if (firstItem) tracker.processedMessages.delete(firstItem);
//                 }
                
//                 const sender = message.key.participant || msgChat;
//                 const isGroup = msgChat.endsWith('@g.us');
//                 const isLid = msgChat.includes('@lid');
                
//                 // Extract message content and type
//                 let text = '';
//                 let type = 'text';
//                 let mediaData = null;
//                 let fileName = '';
//                 let caption = '';
                
//                 const msgContent = message.message;
                
//                 // Check for media types
//                 if (msgContent?.imageMessage) {
//                     type = 'image';
//                     caption = msgContent.imageMessage.caption || '';
//                     mediaData = msgContent.imageMessage;
//                 } else if (msgContent?.videoMessage) {
//                     type = 'video';
//                     caption = msgContent.videoMessage.caption || '';
//                     mediaData = msgContent.videoMessage;
//                 } else if (msgContent?.audioMessage) {
//                     type = 'audio';
//                     mediaData = msgContent.audioMessage;
//                     text = 'Audio message';
//                 } else if (msgContent?.documentMessage) {
//                     type = 'document';
//                     fileName = msgContent.documentMessage.fileName || 'Document';
//                     text = fileName;
//                     mediaData = msgContent.documentMessage;
//                 } else if (msgContent?.stickerMessage) {
//                     type = 'sticker';
//                     text = 'Sticker';
//                     mediaData = msgContent.stickerMessage;
//                 } else if (msgContent?.contactMessage) {
//                     type = 'contact';
//                     text = 'Contact';
//                 } else if (msgContent?.locationMessage) {
//                     type = 'location';
//                     text = 'Location';
//                 } else if (msgContent?.conversation) {
//                     text = msgContent.conversation;
//                 } else if (msgContent?.extendedTextMessage?.text) {
//                     text = msgContent.extendedTextMessage.text;
//                 }
                
//                 // If we have caption from media, use it as text
//                 if (caption && !text) {
//                     text = caption;
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
//                     hasMedia: type !== 'text' && type !== 'contact' && type !== 'location',
//                     fileName: fileName,
//                     caption: caption,
//                     originalMessage: message
//                 };
                
//                 // Store in cache
//                 tracker.messageCache.set(msgId, messageDetails);
                
//                 // If it has media, store media data separately
//                 if (mediaData) {
//                     tracker.mediaCache.set(msgId, {
//                         type: type,
//                         data: mediaData,
//                         timestamp: Date.now()
//                     });
                    
//                     cleanLog(`Media stored: ${type} (${msgId.substring(0, 8)}...)`, 'media');
//                 }
                
//                 // Track last message per chat
//                 tracker.lastMessagePerChat.set(msgChat, {
//                     id: msgId,
//                     timestamp: Date.now(),
//                     sender: sender,
//                     type: type
//                 });
                
//                 // Auto-clean old cache (10 minutes)
//                 if (tracker.messageCache.size > 2000) {
//                     cleanupOldCache();
//                 }
                
//             } catch (error) {
//                 cleanLog(`Store error: ${error.message}`, 'error');
//             }
//         }
        
//         // Clean old cache
//         function cleanupOldCache() {
//             const now = Date.now();
//             const tenMinutes = 10 * 60 * 1000;
//             let deleted = 0;
//             let mediaDeleted = 0;
            
//             for (const [msgId, msgData] of tracker.messageCache.entries()) {
//                 if (now - msgData.timestamp > tenMinutes) {
//                     tracker.messageCache.delete(msgId);
//                     tracker.mediaCache.delete(msgId);
//                     deleted++;
//                     if (msgData.hasMedia) mediaDeleted++;
//                 }
//             }
            
//             if (deleted > 0) {
//                 cleanLog(`Cleaned ${deleted} old entries (${mediaDeleted} media)`, 'info');
//             }
//         }
        
//         // Handle deleted message with media support
//         async function handleDeletedMessage(deletedKey) {
//             try {
//                 const deletedId = deletedKey.id;
//                 const chatId = deletedKey.remoteJid;
                
//                 if (!deletedId) {
//                     cleanLog('No message ID in deletion event', 'error');
//                     return;
//                 }
                
//                 cleanLog(`Looking for: ${deletedId.substring(0, 8)}...`, 'info');
                
//                 // 1. Try exact ID match
//                 let cachedMessage = tracker.messageCache.get(deletedId);
                
//                 if (cachedMessage) {
//                     cleanLog(`Found exact match: ${deletedId.substring(0, 8)}...`, 'success');
                    
//                     // Remove from caches
//                     tracker.messageCache.delete(deletedId);
//                     const hadMedia = tracker.mediaCache.has(deletedId);
//                     tracker.mediaCache.delete(deletedId);
                    
//                     // Show the message
//                     await showDeletedMessage(cachedMessage, hadMedia);
                    
//                     tracker.deletionCount++;
//                     tracker.retrievedCount++;
//                     if (hadMedia) tracker.mediaRetrieved++;
//                     return;
//                 }
                
//                 // 2. Check for potential match (last message in chat)
//                 cleanLog(`No exact match for ${deletedId.substring(0, 8)}...`, 'warning');
                
//                 const now = Date.now();
//                 const fiveSeconds = 5000;
//                 let potentialMatch = null;
//                 let hadMedia = false;
                
//                 for (const [msgId, msgData] of tracker.messageCache.entries()) {
//                     if (msgData.chat !== chatId) continue;
//                     if (now - msgData.timestamp > fiveSeconds) continue;
                    
//                     const lastMsg = tracker.lastMessagePerChat.get(chatId);
//                     if (lastMsg && lastMsg.id === msgId) {
//                         potentialMatch = msgData;
//                         hadMedia = tracker.mediaCache.has(msgId);
//                         break;
//                     }
//                 }
                
//                 if (potentialMatch) {
//                     cleanLog(`Potential match: ${potentialMatch.id.substring(0, 8)}...`, 'warning');
                    
//                     tracker.messageCache.delete(potentialMatch.id);
//                     tracker.mediaCache.delete(potentialMatch.id);
                    
//                     await showDeletedMessage(potentialMatch, hadMedia, true);
                    
//                     tracker.deletionCount++;
//                     tracker.retrievedCount++;
//                     if (hadMedia) tracker.mediaRetrieved++;
//                     return;
//                 }
                
//                 // 3. Log failure
//                 cleanLog(`Could not retrieve: ${deletedId.substring(0, 8)}...`, 'error');
//                 cleanLog(`Cache: ${tracker.messageCache.size} messages, ${tracker.mediaCache.size} media`, 'info');
                
//                 showFailedAlert(deletedKey, chatId);
//                 tracker.deletionCount++;
                
//                 tracker.failedRetrievals.push({
//                     id: deletedId,
//                     chat: chatId,
//                     timestamp: Date.now(),
//                     cacheSize: tracker.messageCache.size
//                 });
                
//                 if (tracker.failedRetrievals.length > 50) {
//                     tracker.failedRetrievals = tracker.failedRetrievals.slice(-30);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Retrieval error: ${error.message}`, 'error');
//             }
//         }
        
//         // Show deleted message with media support
//         async function showDeletedMessage(messageDetails, hasMediaData = false, isPotentialMatch = false) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const chatType = messageDetails.isGroup ? 'GROUP' : 
//                                 (messageDetails.isLid ? 'LID' : 'DM');
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 // Clean terminal display
//                 console.log('\n' + '─'.repeat(60));
//                 if (isPotentialMatch) {
//                     console.log('⚠️  POTENTIAL DELETED MESSAGE  ⚠️');
//                 } else {
//                     console.log('🚫  DELETED MESSAGE CAPTURED  🚫');
//                 }
//                 console.log('─'.repeat(60));
                
//                 console.log(`Chat: ${chatType}`);
//                 console.log(`From: ${senderName} (${messageDetails.senderShort})`);
//                 console.log(`Time: ${time}`);
//                 console.log(`Type: ${messageDetails.type.toUpperCase()}`);
                
//                 if (messageDetails.text) {
//                     console.log('\nMessage:');
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
                
//                 // Send to chat with media if available
//                 if (tracker.notifyInChat && tracker.active) {
//                     await sendChatNotification(messageDetails, hasMediaData, isPotentialMatch);
//                 }
                
//             } catch (error) {
//                 cleanLog(`Display error: ${error.message}`, 'error');
//             }
//         }
        
//         // Send chat notification with media support
//         async function sendChatNotification(messageDetails, hasMediaData, isPotentialMatch) {
//             try {
//                 const time = new Date(messageDetails.timestamp).toLocaleTimeString();
//                 const senderName = messageDetails.pushName || messageDetails.senderShort;
                
//                 let chatMessage = '';
                
//                 if (isPotentialMatch) {
//                     chatMessage += `⚠️ *POTENTIAL DELETED MESSAGE*\n`;
//                     chatMessage += `*(Not 100% guaranteed)*\n\n`;
//                 } else {
//                     chatMessage += `🚫 *DELETED MESSAGE*\n\n`;
//                 }
                
//                 chatMessage += `👤 *From:* ${senderName}\n`;
//                 chatMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
//                 chatMessage += `🕒 *Time:* ${time}\n`;
//                 chatMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
                
//                 // Handle media or text
//                 if (hasMediaData && tracker.mediaCache.has(messageDetails.id)) {
//                     const mediaInfo = tracker.mediaCache.get(messageDetails.id);
                    
//                     // Try to download and send media
//                     try {
//                         const mediaBuffer = await downloadMedia(mediaInfo.data);
                        
//                         if (mediaBuffer) {
//                             let mediaMessage = {
//                                 ...getMediaMessageConfig(mediaInfo.type, mediaBuffer, messageDetails)
//                             };
                            
//                             // Add caption if available
//                             if (messageDetails.caption || messageDetails.text) {
//                                 mediaMessage.caption = chatMessage + 
//                                     (messageDetails.caption ? `\n💬 *Caption:* ${messageDetails.caption}` : '') +
//                                     (messageDetails.fileName ? `\n📄 *File:* ${messageDetails.fileName}` : '') +
//                                     `\n\n🔍 *Captured by antidelete*`;
//                             }
                            
//                             await sock.sendMessage(messageDetails.chat, mediaMessage);
//                             cleanLog(`Media sent: ${mediaInfo.type}`, 'media');
//                             return;
//                         }
//                     } catch (mediaError) {
//                         cleanLog(`Media download failed: ${mediaError.message}`, 'error');
//                         // Fall back to text notification
//                     }
//                 }
                
//                 // Text-only notification
//                 if (messageDetails.text && messageDetails.text.trim()) {
//                     const displayText = messageDetails.text.length > 500 ? 
//                         messageDetails.text.substring(0, 500) + '...' : messageDetails.text;
//                     chatMessage += `\n💬 *Message:*\n${displayText}\n`;
//                 }
                
//                 if (messageDetails.fileName) {
//                     chatMessage += `\n📄 *File:* ${messageDetails.fileName}\n`;
//                 }
                
//                 chatMessage += `\n────────────\n`;
//                 chatMessage += `🔍 *Captured by antidelete*`;
                
//                 await sock.sendMessage(messageDetails.chat, { text: chatMessage });
//                 cleanLog('Notification sent to chat', 'success');
                
//             } catch (error) {
//                 cleanLog(`Chat notification error: ${error.message}`, 'error');
//             }
//         }
        
//         // Download media
//         async function downloadMedia(mediaData) {
//             try {
//                 const stream = await sock.downloadMediaMessage(mediaData);
//                 return stream;
//             } catch (error) {
//                 cleanLog(`Download failed: ${error.message}`, 'error');
//                 return null;
//             }
//         }
        
//         // Get media message configuration
//         function getMediaMessageConfig(type, buffer, messageDetails) {
//             const baseConfig = {
//                 mimetype: getMimeType(type),
//                 caption: messageDetails.caption || ''
//             };
            
//             switch(type) {
//                 case 'image':
//                     return { image: buffer, ...baseConfig };
//                 case 'video':
//                     return { video: buffer, ...baseConfig };
//                 case 'audio':
//                     return { 
//                         audio: buffer, 
//                         mimetype: 'audio/mp4',
//                         ptt: false 
//                     };
//                 case 'document':
//                     return { 
//                         document: buffer,
//                         fileName: messageDetails.fileName || 'document',
//                         mimetype: baseConfig.mimetype 
//                     };
//                 case 'sticker':
//                     return { sticker: buffer };
//                 default:
//                     return null;
//             }
//         }
        
//         // Get MIME type
//         function getMimeType(type) {
//             const mimeTypes = {
//                 'image': 'image/jpeg',
//                 'video': 'video/mp4',
//                 'audio': 'audio/mp4',
//                 'document': 'application/octet-stream',
//                 'sticker': 'image/webp'
//             };
//             return mimeTypes[type] || 'application/octet-stream';
//         }
        
//         // Show failed alert
//         function showFailedAlert(deletedKey, chatId) {
//             const now = new Date().toLocaleTimeString();
//             const chatShort = chatId.split('@')[0];
            
//             console.log('\n' + '─'.repeat(50));
//             console.log('⚠️  DELETION NOT CAPTURED  ⚠️');
//             console.log('─'.repeat(50));
//             console.log(`Time: ${now}`);
//             console.log(`Chat: ${chatShort}`);
//             console.log(`ID: ${deletedKey.id?.substring(0, 8) || 'unknown'}...`);
//             console.log('─'.repeat(50) + '\n');
//         }
        
//         // ====== COMMAND HANDLER ======
//         switch (command) {
//             case 'on':
//             case 'enable':
//             case 'start':
//                 tracker.active = true;
//                 setupTerminalListener();
                
//                 cleanLog('Antidelete ENABLED', 'success');
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *ANTIDELETE ENABLED*\n\nNow capturing deleted messages including media.\n\nUse \`${PREFIX}antidelete test\` to verify.`
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
//                 cleanLog('Sending test message...', 'info');
                
//                 const testMsg = await sock.sendMessage(chatId, {
//                     text: `🧪 *ANTIDELETE TEST*\n\nDelete this message to test the system!\n\nTimestamp: ${Date.now()}`
//                 });
                
//                 if (testMsg?.key?.id) {
//                     // Store immediately
//                     const testDetails = {
//                         id: testMsg.key.id,
//                         chat: chatId,
//                         sender: sock.user.id,
//                         senderShort: sock.user.id.split('@')[0],
//                         isGroup: chatId.endsWith('@g.us'),
//                         isLid: chatId.includes('@lid'),
//                         timestamp: Date.now(),
//                         pushName: 'Bot',
//                         type: 'text',
//                         text: 'ANTIDELETE TEST - Delete this message to test the system!',
//                         hasMedia: false,
//                         originalMessage: testMsg
//                     };
                    
//                     tracker.messageCache.set(testMsg.key.id, testDetails);
                    
//                     cleanLog(`Test stored: ${testMsg.key.id.substring(0, 8)}...`, 'success');
                    
//                     await sock.sendMessage(chatId, {
//                         text: `✅ *Test Ready*\n\nDelete the previous message to test antidelete!`
//                     });
//                 }
//                 break;
                
//             case 'stats':
//                 console.log('\n📊 ANTIDELETE STATISTICS');
//                 console.log('─'.repeat(50));
//                 console.log(`Status: ${tracker.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
//                 console.log(`Messages cached: ${tracker.messageCache.size}`);
//                 console.log(`Media cached: ${tracker.mediaCache.size}`);
//                 console.log(`Deletions detected: ${tracker.deletionCount}`);
//                 console.log(`Successfully retrieved: ${tracker.retrievedCount}`);
//                 console.log(`Media retrieved: ${tracker.mediaRetrieved}`);
                
//                 if (tracker.deletionCount > 0) {
//                     const successRate = Math.round((tracker.retrievedCount / tracker.deletionCount) * 100);
//                     console.log(`Success rate: ${successRate}%`);
//                 }
                
//                 console.log('─'.repeat(50));
                
//                 await sock.sendMessage(chatId, {
//                     text: `📊 Stats sent to terminal\n\nCache: ${tracker.messageCache.size} messages\nMedia: ${tracker.mediaCache.size} files`
//                 }, { quoted: msg });
//                 break;
                
//             case 'debug':
//                 console.log('\n🔧 SYSTEM DEBUG');
//                 console.log('─'.repeat(60));
//                 console.log(`Active: ${tracker.active ? '✅ YES' : '❌ NO'}`);
//                 console.log(`Listener: ${tracker.listenerSetup ? '✅ SETUP' : '❌ NOT SETUP'}`);
//                 console.log(`Message cache: ${tracker.messageCache.size}`);
//                 console.log(`Media cache: ${tracker.mediaCache.size}`);
//                 console.log(`Processed: ${tracker.processedMessages.size}`);
//                 console.log(`Recent deletions: ${tracker.recentDeletionIds.size}`);
//                 console.log(`Last messages: ${tracker.lastMessagePerChat.size}`);
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🔧 Debug info sent to terminal`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clear':
//                 if (args[1] === 'cache') {
//                     const msgCount = tracker.messageCache.size;
//                     const mediaCount = tracker.mediaCache.size;
                    
//                     tracker.messageCache.clear();
//                     tracker.mediaCache.clear();
//                     tracker.processedMessages.clear();
//                     tracker.recentDeletionIds.clear();
//                     tracker.lastMessagePerChat.clear();
//                     tracker.failedRetrievals = [];
                    
//                     cleanLog(`Cleared ${msgCount} messages and ${mediaCount} media files`, 'success');
                    
//                     await sock.sendMessage(chatId, {
//                         text: `🧹 Cleared ${msgCount} messages and ${mediaCount} media files`
//                     }, { quoted: msg });
//                 } else {
//                     console.clear();
//                     console.log('🚫 ANTIDELETE SYSTEM');
//                     console.log('─'.repeat(40));
//                     console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                     console.log(`Cache: ${tracker.messageCache.size} messages`);
//                     console.log(`Retrieved: ${tracker.retrievedCount}`);
                    
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
//                 console.log(`• ${PREFIX}antidelete on/off    - Enable/disable`);
//                 console.log(`• ${PREFIX}antidelete test      - Test the system`);
//                 console.log(`• ${PREFIX}antidelete stats     - Show statistics`);
//                 console.log(`• ${PREFIX}antidelete debug     - System debug info`);
//                 console.log(`• ${PREFIX}antidelete clear     - Clear terminal`);
//                 console.log(`• ${PREFIX}antidelete clear cache - Clear all cache`);
//                 console.log(`• ${PREFIX}antidelete notify on/off - Toggle notifications`);
//                 console.log(`• ${PREFIX}antidelete help      - This help`);
//                 console.log('');
//                 console.log('Features:');
//                 console.log('• Captures text, images, videos, audio');
//                 console.log('• Media preview in chat');
//                 console.log('• Clean terminal logs');
//                 console.log('─'.repeat(60));
                
//                 await sock.sendMessage(chatId, {
//                     text: `🆘 *Antidelete Help*\n\nCaptures text, images, videos, audio.\n\nUse \`${PREFIX}antidelete on\` to enable.`
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 console.log('\n🚫 ANTIDELETE SYSTEM');
//                 console.log('');
//                 console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
//                 console.log(`Cache: ${tracker.messageCache.size} messages`);
//                 console.log(`Retrieved: ${tracker.retrievedCount} deletions`);
//                 console.log('');
//                 console.log(`Use \`${PREFIX}antidelete on\` to enable`);
//                 console.log(`Use \`${PREFIX}antidelete test\` to test`);
                
//                 await sock.sendMessage(chatId, {
//                     text: `🚫 *Antidelete System*\n\nStatus: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\n\nUse \`${PREFIX}antidelete help\` for commands.`
//                 }, { quoted: msg });
//         }
//     }
// };
















// File: ./commands/utility/antidelete.js - CLEAN FIXED VERSION
export default {
    name: 'antidelete',
    alias: ['undelete', 'antidel'],
    description: 'Capture deleted messages with proper media handling',
    category: 'utility',
    
    async execute(sock, msg, args, PREFIX) {
        const chatId = msg.key.remoteJid;
        
        console.log('🚫 Antidelete System');
        
        // Initialize global tracker
        if (!global.antideleteTerminal) {
            global.antideleteTerminal = {
                active: false,
                messageCache: new Map(), // Stores all messages
                listenerSetup: false,
                notifyInChat: true,
                stats: {
                    deletionsDetected: 0,
                    retrievedSuccessfully: 0,
                    mediaRetrieved: 0,
                    falsePositives: 0
                },
                // FIX: Track seen messages to avoid false positives
                seenMessages: new Map(), // messageId -> timestamp
                // FIX: Track which messages we've already processed for deletion
                processedDeletions: new Set(),
                // Media handling
                mediaBufferCache: new Map(), // messageId -> buffer
                lastCleanup: Date.now()
            };
        }
        
        const tracker = global.antideleteTerminal;
        const command = args[0]?.toLowerCase() || 'help';
        
        // Clean log helper
        function cleanLog(message, type = 'info') {
            const prefixes = {
                'info': '📝',
                'success': '✅',
                'error': '❌',
                'warning': '⚠️',
                'system': '🚫',
                'media': '📷',
                'deletion': '🗑️'
            };
            
            console.log(`${prefixes[type] || '📝'} ${message}`);
        }
        
        // Cleanup old data periodically
        function cleanupOldData() {
            const now = Date.now();
            const fiveMinutes = 5 * 60 * 1000;
            
            // Clean seen messages older than 5 minutes
            for (const [msgId, timestamp] of tracker.seenMessages.entries()) {
                if (now - timestamp > fiveMinutes) {
                    tracker.seenMessages.delete(msgId);
                }
            }
            
            // Clean message cache older than 10 minutes
            for (const [msgId, data] of tracker.messageCache.entries()) {
                if (now - data.timestamp > 10 * 60 * 1000) {
                    tracker.messageCache.delete(msgId);
                    tracker.mediaBufferCache.delete(msgId);
                }
            }
            
            // Clean processed deletions older than 1 minute
            if (tracker.processedDeletions.size > 1000) {
                // Just clear if too large
                tracker.processedDeletions.clear();
            }
            
            tracker.lastCleanup = now;
        }
        
        // Setup listener with proper deletion detection
        function setupTerminalListener() {
            if (tracker.listenerSetup) return;
            
            cleanLog('Setting up antidelete listener...', 'system');
            cleanLog(`Chat notifications: ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`, 'info');
            
            // Store ALL incoming messages
            sock.ev.on('messages.upsert', async ({ messages, type }) => {
                try {
                    if (!tracker.active) return;
                    
                    // FIX: Only store non-bot messages that are being notified
                    if (type === 'notify') {
                        for (const message of messages) {
                            // Skip bot's own messages
                            if (message.key?.fromMe) continue;
                            
                            const msgId = message.key?.id;
                            if (!msgId) continue;
                            
                            // Mark as seen
                            tracker.seenMessages.set(msgId, Date.now());
                            
                            // Store the message
                            await storeMessage(message);
                        }
                    }
                    
                    // Periodic cleanup
                    if (Date.now() - tracker.lastCleanup > 60000) { // Every minute
                        cleanupOldData();
                    }
                    
                } catch (error) {
                    cleanLog(`Storage error: ${error.message}`, 'error');
                }
            });
            
            // FIXED: Better deletion detection - only trigger on actual deletions
            sock.ev.on('messages.update', async (updates) => {
                try {
                    if (!tracker.active) return;
                    
                    for (const update of updates) {
                        const updateData = update.update || {};
                        const messageId = update.key?.id;
                        const chatId = update.key?.remoteJid;
                        
                        if (!messageId || !chatId) continue;
                        
                        // FIX: Check if this is an actual deletion
                        // WhatsApp Web sends status=6 when message is deleted
                        const isDeleted = 
                            updateData.status === 6 || // Message revoked
                            updateData.message === null || // Message removed
                            (updateData.messageStubType === 7) || // Message deleted for me
                            (updateData.messageStubType === 8); // Message deleted for everyone
                        
                        if (isDeleted) {
                            // Avoid processing the same deletion multiple times
                            if (tracker.processedDeletions.has(messageId)) {
                                continue;
                            }
                            
                            tracker.processedDeletions.add(messageId);
                            
                            // Remove from processed deletions after 10 seconds
                            setTimeout(() => {
                                tracker.processedDeletions.delete(messageId);
                            }, 10000);
                            
                            cleanLog(`Deletion detected: ${messageId.substring(0, 8)}...`, 'deletion');
                            tracker.stats.deletionsDetected++;
                            
                            await handleDeletedMessage(update.key);
                        }
                    }
                } catch (error) {
                    cleanLog(`Detection error: ${error.message}`, 'error');
                }
            });
            
            tracker.listenerSetup = true;
            cleanLog('Antidelete listener ready', 'success');
        }
        
        // Store message with media buffer capture
        async function storeMessage(message) {
            try {
                const msgId = message.key.id;
                const msgChat = message.key.remoteJid;
                
                // Don't store if already in cache
                if (tracker.messageCache.has(msgId)) {
                    return;
                }
                
                const sender = message.key.participant || msgChat;
                const isGroup = msgChat.endsWith('@g.us');
                const isLid = msgChat.includes('@lid');
                
                // Extract message content
                let text = '';
                let type = 'text';
                let fileName = '';
                let caption = '';
                let hasMedia = false;
                let mediaBuffer = null;
                
                const msgContent = message.message;
                
                // Extract text and determine type
                if (msgContent?.conversation) {
                    text = msgContent.conversation;
                } else if (msgContent?.extendedTextMessage?.text) {
                    text = msgContent.extendedTextMessage.text;
                } 
                
                // Check for media types
                if (msgContent?.imageMessage) {
                    type = 'image';
                    caption = msgContent.imageMessage.caption || '';
                    hasMedia = true;
                } else if (msgContent?.videoMessage) {
                    type = 'video';
                    caption = msgContent.videoMessage.caption || '';
                    hasMedia = true;
                } else if (msgContent?.audioMessage) {
                    type = 'audio';
                    hasMedia = true;
                    if (!text) text = 'Audio message';
                } else if (msgContent?.documentMessage) {
                    type = 'document';
                    fileName = msgContent.documentMessage.fileName || 'Document';
                    hasMedia = true;
                    if (!text) text = fileName;
                } else if (msgContent?.stickerMessage) {
                    type = 'sticker';
                    hasMedia = true;
                    if (!text) text = 'Sticker';
                } else if (msgContent?.contactMessage) {
                    type = 'contact';
                    if (!text) text = 'Contact';
                } else if (msgContent?.locationMessage) {
                    type = 'location';
                    if (!text) text = 'Location';
                }
                
                // Use caption if no text
                if (!text && caption) {
                    text = caption;
                }
                
                // FIX: Try to download media immediately and store buffer
                if (hasMedia && msgContent) {
                    try {
                        // Use the correct method to download media
                        mediaBuffer = await downloadMediaMessage(message);
                        if (mediaBuffer) {
                            tracker.mediaBufferCache.set(msgId, {
                                buffer: mediaBuffer,
                                type: type,
                                timestamp: Date.now()
                            });
                            cleanLog(`Media downloaded: ${type} (${msgId.substring(0, 8)}...)`, 'media');
                        }
                    } catch (mediaError) {
                        cleanLog(`Media download failed: ${mediaError.message}`, 'warning');
                    }
                }
                
                const messageDetails = {
                    id: msgId,
                    chat: msgChat,
                    sender: sender,
                    senderShort: sender.split('@')[0],
                    isGroup: isGroup,
                    isLid: isLid,
                    timestamp: Date.now(),
                    messageTimestamp: message.messageTimestamp || Date.now(),
                    pushName: message.pushName || 'Unknown',
                    text: text,
                    type: type,
                    hasMedia: hasMedia,
                    fileName: fileName,
                    caption: caption,
                    originalMessage: message,
                    hasBuffer: !!mediaBuffer
                };
                
                tracker.messageCache.set(msgId, messageDetails);
                
                // Log storage
                if (hasMedia) {
                    cleanLog(`Stored ${type}: ${msgId.substring(0, 8)}...`, 'info');
                }
                
            } catch (error) {
                cleanLog(`Store error: ${error.message}`, 'error');
            }
        }
        
        // FIXED: Correct media download function
        async function downloadMediaMessage(message) {
            try {
                // Method 1: Try using downloadMediaMessage if available
                if (typeof sock.downloadMediaMessage === 'function') {
                    return await sock.downloadMediaMessage(message);
                }
                
                // Method 2: Try using message.download() if available
                if (message.download && typeof message.download === 'function') {
                    return await message.download();
                }
                
                // Method 3: Extract media data and download manually
                const msgContent = message.message;
                let mediaMessage = null;
                
                if (msgContent?.imageMessage) {
                    mediaMessage = msgContent.imageMessage;
                } else if (msgContent?.videoMessage) {
                    mediaMessage = msgContent.videoMessage;
                } else if (msgContent?.audioMessage) {
                    mediaMessage = msgContent.audioMessage;
                } else if (msgContent?.documentMessage) {
                    mediaMessage = msgContent.documentMessage;
                } else if (msgContent?.stickerMessage) {
                    mediaMessage = msgContent.stickerMessage;
                }
                
                if (mediaMessage && sock.downloadAndSaveMediaMessage) {
                    return await sock.downloadAndSaveMediaMessage(mediaMessage);
                }
                
                // Method 4: Last resort - try generic download
                if (mediaMessage && mediaMessage.url) {
                    // This would need proper implementation based on your library
                    cleanLog('Advanced media download required', 'warning');
                }
                
                return null;
                
            } catch (error) {
                cleanLog(`Download error: ${error.message}`, 'error');
                return null;
            }
        }
        
        // Handle deleted message
        async function handleDeletedMessage(deletedKey) {
            try {
                const deletedId = deletedKey.id;
                const chatId = deletedKey.remoteJid;
                
                if (!deletedId) {
                    cleanLog('No message ID in deletion event', 'error');
                    return;
                }
                
                cleanLog(`Looking for message: ${deletedId.substring(0, 8)}...`, 'info');
                
                // Check cache for the deleted message
                const cachedMessage = tracker.messageCache.get(deletedId);
                
                if (cachedMessage) {
                    cleanLog(`Found in cache: ${deletedId.substring(0, 8)}...`, 'success');
                    cleanLog(`Type: ${cachedMessage.type}`, 'info');
                    
                    // Remove from cache
                    tracker.messageCache.delete(deletedId);
                    
                    // Show and resend the message
                    await processDeletedMessage(cachedMessage);
                    
                    tracker.stats.retrievedSuccessfully++;
                    if (cachedMessage.hasMedia) {
                        tracker.stats.mediaRetrieved++;
                    }
                    
                    return;
                }
                
                // Message not found in cache
                cleanLog(`Not found in cache: ${deletedId.substring(0, 8)}...`, 'warning');
                cleanLog(`Cache size: ${tracker.messageCache.size} messages`, 'info');
                
                // Check if this might be a false positive
                const wasSeen = tracker.seenMessages.has(deletedId);
                if (!wasSeen) {
                    tracker.stats.falsePositives++;
                    cleanLog(`Possible false positive - message never seen`, 'warning');
                }
                
                showFailedNotification(deletedKey, chatId, wasSeen);
                
            } catch (error) {
                cleanLog(`Retrieval error: ${error.message}`, 'error');
            }
        }
        
        // Process and resend deleted message
        async function processDeletedMessage(messageDetails) {
            try {
                const time = new Date(messageDetails.timestamp).toLocaleTimeString();
                const chatType = messageDetails.isGroup ? 'GROUP' : 
                                (messageDetails.isLid ? 'LID' : 'DM');
                const senderName = messageDetails.pushName || messageDetails.senderShort;
                
                // Terminal display
                console.log('\n' + '─'.repeat(60));
                console.log('🚫  DELETED MESSAGE CAPTURED  🚫');
                console.log('─'.repeat(60));
                
                console.log(`Chat: ${chatType}`);
                console.log(`From: ${senderName} (${messageDetails.senderShort})`);
                console.log(`Time: ${time}`);
                console.log(`Type: ${messageDetails.type.toUpperCase()}`);
                
                if (messageDetails.text) {
                    console.log('\nContent:');
                    console.log('─'.repeat(40));
                    const displayText = messageDetails.text.length > 200 ? 
                        messageDetails.text.substring(0, 200) + '...' : messageDetails.text;
                    console.log(displayText);
                    console.log('─'.repeat(40));
                }
                
                if (messageDetails.fileName) {
                    console.log(`File: ${messageDetails.fileName}`);
                }
                
                console.log(`ID: ${messageDetails.id.substring(0, 12)}...`);
                console.log('─'.repeat(60) + '\n');
                
                // Send to chat
                if (tracker.notifyInChat && tracker.active) {
                    await resendMessageToChat(messageDetails);
                }
                
            } catch (error) {
                cleanLog(`Display error: ${error.message}`, 'error');
            }
        }
        
        // Resend message to chat with media support
        async function resendMessageToChat(messageDetails) {
            try {
                const time = new Date(messageDetails.timestamp).toLocaleTimeString();
                const senderName = messageDetails.pushName || messageDetails.senderShort;
                
                let headerMessage = `🚫 *DELETED MESSAGE*\n\n`;
                headerMessage += `👤 *From:* ${senderName}\n`;
                headerMessage += `📞 *Number:* ${messageDetails.senderShort}\n`;
                headerMessage += `🕒 *Time:* ${time}\n`;
                headerMessage += `📊 *Type:* ${messageDetails.type.toUpperCase()}\n`;
                
                // Check if we have media buffer
                const mediaCache = tracker.mediaBufferCache.get(messageDetails.id);
                
                if (messageDetails.hasMedia && mediaCache?.buffer) {
                    await resendMediaWithBuffer(messageDetails, mediaCache, headerMessage);
                } else {
                    // Text-only or media without buffer
                    await sendTextNotification(messageDetails, headerMessage);
                }
                
                // Clean up buffer cache
                tracker.mediaBufferCache.delete(messageDetails.id);
                
            } catch (error) {
                cleanLog(`Resend error: ${error.message}`, 'error');
                
                // Fallback to simple text notification
                try {
                    await sock.sendMessage(messageDetails.chat, {
                        text: `🚫 *Deleted ${messageDetails.type.toUpperCase()}*\n\nFrom: ${messageDetails.senderShort}\nTime: ${time}\n\n(Could not retrieve full content)`
                    });
                } catch (fallbackError) {
                    cleanLog(`Fallback also failed: ${fallbackError.message}`, 'error');
                }
            }
        }
        
        // Resend media using stored buffer
        async function resendMediaWithBuffer(messageDetails, mediaCache, headerMessage) {
            try {
                cleanLog(`Resending ${messageDetails.type}...`, 'media');
                
                const buffer = mediaCache.buffer;
                const caption = messageDetails.caption ? 
                    `${headerMessage}\n💬 *Caption:* ${messageDetails.caption}\n\n🔍 *Captured by antidelete*` :
                    `${headerMessage}\n\n🔍 *Captured by antidelete*`;
                
                let mediaMessage = {};
                
                switch(messageDetails.type) {
                    case 'image':
                        mediaMessage = {
                            image: buffer,
                            caption: caption,
                            mimetype: 'image/jpeg'
                        };
                        break;
                        
                    case 'video':
                        mediaMessage = {
                            video: buffer,
                            caption: caption,
                            mimetype: 'video/mp4'
                        };
                        break;
                        
                    case 'audio':
                        mediaMessage = {
                            audio: buffer,
                            mimetype: 'audio/mp4',
                            ptt: false
                        };
                        break;
                        
                    case 'document':
                        mediaMessage = {
                            document: buffer,
                            fileName: messageDetails.fileName || 'document',
                            caption: caption,
                            mimetype: 'application/octet-stream'
                        };
                        break;
                        
                    case 'sticker':
                        mediaMessage = {
                            sticker: buffer,
                            mimetype: 'image/webp'
                        };
                        break;
                        
                    default:
                        throw new Error(`Unsupported media type: ${messageDetails.type}`);
                }
                
                await sock.sendMessage(messageDetails.chat, mediaMessage);
                cleanLog(`${messageDetails.type.toUpperCase()} resent successfully`, 'success');
                
            } catch (error) {
                cleanLog(`Media resend failed: ${error.message}`, 'error');
                throw error; // Let it fall back to text notification
            }
        }
        
        // Send text notification
        async function sendTextNotification(messageDetails, headerMessage) {
            if (messageDetails.text && messageDetails.text.trim()) {
                const displayText = messageDetails.text.length > 500 ? 
                    messageDetails.text.substring(0, 500) + '...' : messageDetails.text;
                headerMessage += `\n💬 *Message:*\n${displayText}\n`;
            }
            
            if (messageDetails.fileName) {
                headerMessage += `\n📄 *File:* ${messageDetails.fileName}\n`;
            }
            
            if (messageDetails.hasMedia && !messageDetails.text) {
                headerMessage += `\n📎 *Media file (content not retrievable)*\n`;
            }
            
            headerMessage += `\n────────────\n`;
            headerMessage += `🔍 *Captured by antidelete*`;
            
            await sock.sendMessage(messageDetails.chat, { text: headerMessage });
            cleanLog('Text notification sent', 'success');
        }
        
        // Show failed notification
        function showFailedNotification(deletedKey, chatId, wasSeen) {
            const now = new Date().toLocaleTimeString();
            const chatShort = chatId.split('@')[0];
            
            console.log('\n' + '─'.repeat(50));
            console.log('⚠️  DELETION NOT CAPTURED  ⚠️');
            console.log('─'.repeat(50));
            console.log(`Time: ${now}`);
            console.log(`Chat: ${chatShort}`);
            console.log(`ID: ${deletedKey.id?.substring(0, 8) || 'unknown'}...`);
            console.log(`Previously seen: ${wasSeen ? 'YES' : 'NO'}`);
            console.log('─'.repeat(50) + '\n');
        }
        
        // ====== COMMAND HANDLER ======
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                tracker.active = true;
                tracker.stats.deletionsDetected = 0;
                tracker.stats.retrievedSuccessfully = 0;
                tracker.stats.mediaRetrieved = 0;
                tracker.stats.falsePositives = 0;
                
                setupTerminalListener();
                
                cleanLog('Antidelete ENABLED', 'success');
                cleanLog('False positive detection: ACTIVE', 'info');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE ENABLED*\n\nNow capturing deleted messages with:\n• Text messages\n• Images 📷\n• Videos 🎥\n• Audio 🔊\n• Documents 📄\n• Stickers 😄\n\nUse \`${PREFIX}antidelete test\` to verify.`
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'disable':
            case 'stop':
                tracker.active = false;
                cleanLog('Antidelete DISABLED', 'system');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *ANTIDELETE DISABLED*\n\nUse \`${PREFIX}antidelete on\` to enable again.`
                }, { quoted: msg });
                break;
                
            case 'test':
                cleanLog('Sending test messages...', 'info');
                
                // Send text test
                await sock.sendMessage(chatId, {
                    text: `🧪 *TEXT TEST*\n\nDelete this message to test text retrieval!\n\nTimestamp: ${Date.now()}`
                });
                
                // Send image test (if URL is available)
                try {
                    await sock.sendMessage(chatId, {
                        image: { url: 'https://picsum.photos/200/300' },
                        caption: '🧪 *IMAGE TEST*\n\nDelete this image to test media retrieval!'
                    });
                } catch (e) {
                    cleanLog('Image test skipped (URL not available)', 'warning');
                }
                
                cleanLog('Test messages sent - Delete them to test!', 'success');
                
                await sock.sendMessage(chatId, {
                    text: `✅ *Test Messages Sent*\n\n1. Text message\n2. Image (if supported)\n\nDelete each one to test antidelete!`
                });
                break;
                
            case 'stats':
                console.log('\n📊 ANTIDELETE STATISTICS');
                console.log('─'.repeat(50));
                console.log(`Status: ${tracker.active ? 'ACTIVE ✅' : 'INACTIVE ❌'}`);
                console.log(`Messages in cache: ${tracker.messageCache.size}`);
                console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
                console.log(`Seen messages: ${tracker.seenMessages.size}`);
                console.log(`\n📈 PERFORMANCE:`);
                console.log(`Deletions detected: ${tracker.stats.deletionsDetected}`);
                console.log(`Successfully retrieved: ${tracker.stats.retrievedSuccessfully}`);
                console.log(`Media retrieved: ${tracker.stats.mediaRetrieved}`);
                console.log(`False positives: ${tracker.stats.falsePositives}`);
                
                if (tracker.stats.deletionsDetected > 0) {
                    const successRate = Math.round((tracker.stats.retrievedSuccessfully / tracker.stats.deletionsDetected) * 100);
                    const falsePositiveRate = Math.round((tracker.stats.falsePositives / tracker.stats.deletionsDetected) * 100);
                    console.log(`\n📊 RATES:`);
                    console.log(`Success rate: ${successRate}%`);
                    console.log(`False positive rate: ${falsePositiveRate}%`);
                }
                
                console.log('─'.repeat(50));
                
                await sock.sendMessage(chatId, {
                    text: `📊 Stats sent to terminal\n\nSuccess rate: ${tracker.stats.deletionsDetected > 0 ? Math.round((tracker.stats.retrievedSuccessfully / tracker.stats.deletionsDetected) * 100) : 0}%`
                }, { quoted: msg });
                break;
                
            case 'debug':
                console.log('\n🔧 SYSTEM DEBUG');
                console.log('─'.repeat(60));
                console.log(`Active: ${tracker.active ? '✅ YES' : '❌ NO'}`);
                console.log(`Listener: ${tracker.listenerSetup ? '✅ SETUP' : '❌ NOT SETUP'}`);
                console.log(`Message cache: ${tracker.messageCache.size}`);
                console.log(`Media buffers: ${tracker.mediaBufferCache.size}`);
                console.log(`Seen messages: ${tracker.seenMessages.size}`);
                console.log(`Processed deletions: ${tracker.processedDeletions.size}`);
                
                // Show cache sample
                if (tracker.messageCache.size > 0) {
                    console.log('\n📋 CACHE SAMPLE (first 3):');
                    let count = 0;
                    for (const [id, data] of tracker.messageCache.entries()) {
                        if (count >= 3) break;
                        const hasBuffer = tracker.mediaBufferCache.has(id) ? '✅' : '❌';
                        console.log(`  ${id.substring(0, 8)}... - ${data.type} ${hasBuffer} buffer`);
                        count++;
                    }
                }
                
                console.log('─'.repeat(60));
                
                await sock.sendMessage(chatId, {
                    text: `🔧 Debug info sent to terminal`
                }, { quoted: msg });
                break;
                
            case 'clear':
                if (args[1] === 'cache') {
                    const msgCount = tracker.messageCache.size;
                    const bufferCount = tracker.mediaBufferCache.size;
                    
                    tracker.messageCache.clear();
                    tracker.mediaBufferCache.clear();
                    tracker.seenMessages.clear();
                    tracker.processedDeletions.clear();
                    
                    cleanLog(`Cleared ${msgCount} messages and ${bufferCount} media buffers`, 'success');
                    
                    await sock.sendMessage(chatId, {
                        text: `🧹 Cleared ${msgCount} messages and ${bufferCount} media buffers`
                    }, { quoted: msg });
                } else {
                    console.clear();
                    console.log('🚫 ANTIDELETE SYSTEM');
                    console.log('─'.repeat(40));
                    console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
                    console.log(`Cache: ${tracker.messageCache.size} messages`);
                    console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
                    
                    await sock.sendMessage(chatId, {
                        text: '🧹 Terminal cleared'
                    }, { quoted: msg });
                }
                break;
                
            case 'notify':
                const setting = args[1]?.toLowerCase();
                if (setting === 'on') {
                    tracker.notifyInChat = true;
                    cleanLog('Chat notifications ON', 'success');
                    await sock.sendMessage(chatId, {
                        text: '🔔 *Chat notifications ENABLED*'
                    }, { quoted: msg });
                } else if (setting === 'off') {
                    tracker.notifyInChat = false;
                    cleanLog('Chat notifications OFF', 'info');
                    await sock.sendMessage(chatId, {
                        text: '🔕 *Chat notifications DISABLED*'
                    }, { quoted: msg });
                } else {
                    cleanLog(`Notifications: ${tracker.notifyInChat ? 'ON' : 'OFF'}`, 'info');
                    await sock.sendMessage(chatId, {
                        text: `🔔 *Notifications:* ${tracker.notifyInChat ? 'ENABLED' : 'DISABLED'}`
                    }, { quoted: msg });
                }
                break;
                
            case 'help':
                console.log('\n🆘 ANTIDELETE HELP');
                console.log('─'.repeat(60));
                console.log('Commands:');
                console.log(`• ${PREFIX}antidelete on/off      - Enable/disable`);
                console.log(`• ${PREFIX}antidelete test        - Test the system`);
                console.log(`• ${PREFIX}antidelete stats       - Show statistics`);
                console.log(`• ${PREFIX}antidelete debug       - System debug info`);
                console.log(`• ${PREFIX}antidelete clear cache - Clear all cache`);
                console.log(`• ${PREFIX}antidelete notify on/off - Toggle notifications`);
                console.log(`• ${PREFIX}antidelete help        - This help`);
                console.log('');
                console.log('Features:');
                console.log('• Text message retrieval');
                console.log('• Media retrieval (images, videos, audio, etc.)');
                console.log('• False positive detection');
                console.log('• Clean terminal logs');
                console.log('─'.repeat(60));
                
                await sock.sendMessage(chatId, {
                    text: `🆘 *Antidelete Help*\n\nCaptures deleted messages including media.\nFalse positive detection helps avoid incorrect alerts.\n\nUse \`${PREFIX}antidelete on\` to enable.`
                }, { quoted: msg });
                break;
                
            default:
                console.log('\n🚫 ANTIDELETE SYSTEM');
                console.log('');
                console.log(`Status: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}`);
                console.log(`Cache: ${tracker.messageCache.size} messages`);
                console.log(`Retrieved: ${tracker.stats.retrievedSuccessfully}`);
                console.log(`False positives prevented: ${tracker.stats.falsePositives}`);
                console.log('');
                console.log(`Use \`${PREFIX}antidelete on\` to enable`);
                console.log(`Use \`${PREFIX}antidelete test\` to test`);
                
                await sock.sendMessage(chatId, {
                    text: `🚫 *Antidelete System*\n\nStatus: ${tracker.active ? 'ACTIVE' : 'INACTIVE'}\nFalse positive detection: ✅ ENABLED\n\nUse \`${PREFIX}antidelete help\` for commands.`
                }, { quoted: msg });
        }
    }
};