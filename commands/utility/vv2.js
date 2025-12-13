import fs from 'fs';
import path from 'path';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

// Configuration
const CONFIG = {
    SAVE_DIR: './viewonce_stealth',
    MAX_SIZE_MB: 50,
    AUTO_CLEANUP: true,
    CLEANUP_DELAY: 5000,
    STEALTH_MODE: true,
    SEND_CONFIRMATION_TO_OWNER: true
};

// Ensure save directory exists
if (!fs.existsSync(CONFIG.SAVE_DIR)) {
    fs.mkdirSync(CONFIG.SAVE_DIR, { recursive: true });
}

// Fallback jidManager functions if not provided
const fallbackJidManager = {
    cleanJid: function(jid) {
        if (!jid) return { cleanJid: 'unknown', cleanNumber: 'unknown', isLid: false };
        
        console.log(`🔄 fallbackJidManager.cleanJid called with: ${jid}`);
        
        // Remove device suffix
        let clean = jid.split(':')[0];
        const isLid = clean.includes('@lid');
        
        // Extract number
        let cleanNumber = clean.split('@')[0];
        
        return {
            cleanJid: clean,
            cleanNumber: cleanNumber,
            isLid: isLid,
            original: jid
        };
    },
    
    isOwner: function(msg) {
        if (!msg) return false;
        
        console.log(`🔄 fallbackJidManager.isOwner called`);
        
        // Check if fromMe (bot sending to itself)
        if (msg.key.fromMe) {
            console.log(`✅ fromMe = true, assuming owner`);
            return true;
        }
        
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = this.cleanJid(senderJid);
        
        // Try to read owner from owner.json as fallback
        try {
            if (fs.existsSync('./owner.json')) {
                const ownerData = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                const ownerNumber = ownerData.OWNER_NUMBER || ownerData.ownerNumber || 
                                   (ownerData.OWNER_JID ? ownerData.OWNER_JID.split('@')[0] : null);
                
                if (ownerNumber && cleaned.cleanNumber === ownerNumber) {
                    console.log(`✅ Owner match: ${cleaned.cleanNumber} = ${ownerNumber}`);
                    return true;
                }
            }
        } catch (error) {
            console.error('Error reading owner.json:', error);
        }
        
        return false;
    },
    
    getOwnerInfo: function() {
        console.log(`🔄 fallbackJidManager.getOwnerInfo called`);
        
        try {
            if (fs.existsSync('./owner.json')) {
                const ownerData = JSON.parse(fs.readFileSync('./owner.json', 'utf8'));
                
                let cleanJid = ownerData.OWNER_JID || ownerData.ownerLID || 
                              (ownerData.OWNER_NUMBER ? ownerData.OWNER_NUMBER + '@s.whatsapp.net' : null);
                
                let cleanNumber = ownerData.OWNER_NUMBER || ownerData.ownerNumber ||
                                 (cleanJid ? cleanJid.split('@')[0] : null);
                
                return {
                    cleanJid: cleanJid || 'Not configured',
                    cleanNumber: cleanNumber || 'Not configured',
                    isLid: cleanJid ? cleanJid.includes('@lid') : false
                };
            }
        } catch (error) {
            console.error('Error getting owner info:', error);
        }
        
        return { cleanJid: 'Not configured', cleanNumber: 'Not configured', isLid: false };
    }
};

// Utility functions
function generateFilename(type, mimetype = '') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    
    let extension = '.bin';
    if (mimetype) {
        const parts = mimetype.split('/');
        if (parts.length > 1) {
            const subtype = parts[1].split(';')[0];
            if (subtype.includes('jpeg') || subtype.includes('jpg')) extension = '.jpg';
            else if (subtype.includes('png')) extension = '.png';
            else if (subtype.includes('gif')) extension = '.gif';
            else if (subtype.includes('webp')) extension = '.webp';
            else if (subtype.includes('mp4')) extension = '.mp4';
            else if (subtype.includes('3gp')) extension = '.3gp';
            else if (subtype.includes('mov')) extension = '.mov';
            else if (subtype.includes('ogg')) extension = '.ogg';
            else if (subtype.includes('mpeg') || subtype.includes('mp3')) extension = '.mp3';
            else if (subtype.includes('aac')) extension = '.aac';
            else if (subtype.includes('m4a')) extension = '.m4a';
            else extension = '.' + subtype;
        }
    }
    
    return `${type}_${timestamp}_${random}${extension}`;
}

// Check if message is view-once
function isViewOnceMessage(message) {
    if (!message?.message) return false;
    
    if (message.message.imageMessage?.viewOnce) return true;
    if (message.message.videoMessage?.viewOnce) return true;
    if (message.message.audioMessage?.viewOnce) return true;
    
    if (message.message.viewOnceMessageV2) return true;
    if (message.message.viewOnceMessageV2Extension) return true;
    if (message.message.viewOnceMessage) return true;
    
    if (message.message.ephemeralMessage?.message?.viewOnceMessage) return true;
    
    return false;
}

// Extract media from view-once message
function extractViewOnceMedia(message) {
    try {
        // Direct view-once media
        if (message.message?.imageMessage?.viewOnce) {
            return {
                type: 'image',
                message: message.message.imageMessage,
                direct: true
            };
        }
        if (message.message?.videoMessage?.viewOnce) {
            return {
                type: 'video',
                message: message.message.videoMessage,
                direct: true
            };
        }
        if (message.message?.audioMessage?.viewOnce) {
            return {
                type: 'audio',
                message: message.message.audioMessage,
                direct: true
            };
        }
        
        // Wrapped view-once media
        let wrappedMessage = null;
        if (message.message?.viewOnceMessageV2?.message) {
            wrappedMessage = message.message.viewOnceMessageV2.message;
        } else if (message.message?.viewOnceMessageV2Extension?.message) {
            wrappedMessage = message.message.viewOnceMessageV2Extension.message;
        } else if (message.message?.viewOnceMessage?.message) {
            wrappedMessage = message.message.viewOnceMessage.message;
        } else if (message.message?.ephemeralMessage?.message?.viewOnceMessage?.message) {
            wrappedMessage = message.message.ephemeralMessage.message.viewOnceMessage.message;
        }
        
        if (wrappedMessage?.imageMessage) {
            return {
                type: 'image',
                message: wrappedMessage.imageMessage,
                direct: false
            };
        }
        if (wrappedMessage?.videoMessage) {
            return {
                type: 'video',
                message: wrappedMessage.videoMessage,
                direct: false
            };
        }
        if (wrappedMessage?.audioMessage) {
            return {
                type: 'audio',
                message: wrappedMessage.audioMessage,
                direct: false
            };
        }
    } catch (error) {
        console.error('Error extracting view-once media:', error);
    }
    
    return null;
}

// Get the message being replied to
function getQuotedMessage(contextInfo) {
    if (!contextInfo) return null;
    
    const quotedMessage = {
        key: {
            remoteJid: contextInfo.remoteJid,
            id: contextInfo.stanzaId,
            participant: contextInfo.participant,
            fromMe: contextInfo.fromMe
        },
        message: contextInfo.quotedMessage
    };
    
    return quotedMessage;
}

// Delete file after delay
function cleanupFile(filepath, delay = CONFIG.CLEANUP_DELAY) {
    if (!CONFIG.AUTO_CLEANUP) return;
    
    setTimeout(() => {
        try {
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
                console.log(`🗑️ Cleaned up: ${path.basename(filepath)}`);
            }
        } catch (error) {
            console.error('Error cleaning up file:', error);
        }
    }, delay);
}

// Get group info for logging
async function getGroupInfo(sock, chatId) {
    try {
        if (!chatId.endsWith('@g.us')) {
            return { name: 'Private Chat', isGroup: false };
        }
        
        const metadata = await sock.groupMetadata(chatId);
        return {
            name: metadata.subject || 'Unknown Group',
            isGroup: true,
            participants: metadata.participants?.length || 0
        };
    } catch (error) {
        console.error('Error getting group info:', error);
        return { name: 'Unknown Chat', isGroup: false };
    }
}

// Download media and send to owner
async function downloadAndSendToOwner(sock, message, mediaInfo, originalChatId, originalSender, ownerJid, jidManager) {
    try {
        console.log(`⬇️ Stealth downloading ${mediaInfo.type}...`);
        
        // Download the media
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
            throw new Error('Download failed: empty buffer');
        }
        
        // Check file size
        const fileSizeMB = buffer.length / (1024 * 1024);
        if (fileSizeMB > CONFIG.MAX_SIZE_MB) {
            throw new Error(`File too large: ${fileSizeMB.toFixed(2)}MB (max: ${CONFIG.MAX_SIZE_MB}MB)`);
        }
        
        // Generate temporary filename
        const mimetype = mediaInfo.message.mimetype || '';
        const filename = generateFilename(mediaInfo.type, mimetype);
        const filepath = path.join(CONFIG.SAVE_DIR, filename);
        
        // Save temporarily
        fs.writeFileSync(filepath, buffer);
        const fileSizeKB = (buffer.length / 1024).toFixed(2);
        
        console.log(`✅ Downloaded for owner: ${filename} (${fileSizeKB} KB)`);
        
        // Get sender info using jidManager or fallback
        let senderInfo;
        if (jidManager && jidManager.cleanJid) {
            senderInfo = jidManager.cleanJid(originalSender);
        } else {
            senderInfo = fallbackJidManager.cleanJid(originalSender);
        }
        
        const senderNumber = senderInfo.cleanNumber || 'Unknown';
        const originalCaption = mediaInfo.message.caption || '';
        
        // Get chat info
        const chatInfo = await getGroupInfo(sock, originalChatId);
        const chatName = chatInfo.name;
        const isGroup = chatInfo.isGroup;
        
        // Prepare caption for owner
        let ownerCaption = `🔒 *Stealth View-Once Capture*\n\n`;
        ownerCaption += `👤 *Sender:* ${senderNumber}\n`;
        ownerCaption += `💬 *Chat:* ${chatName}\n`;
        ownerCaption += `🏷️ *Type:* ${isGroup ? 'Group' : 'Private'}\n`;
        ownerCaption += `📊 *Size:* ${fileSizeKB} KB\n`;
        
        if (mediaInfo.type === 'video' && mediaInfo.message.seconds) {
            ownerCaption += `⏱️ *Duration:* ${mediaInfo.message.seconds}s\n`;
        }
        
        if (mediaInfo.message.width && mediaInfo.message.height) {
            ownerCaption += `📐 *Resolution:* ${mediaInfo.message.width}x${mediaInfo.message.height}\n`;
        }
        
        if (originalCaption) {
            ownerCaption += `📝 *Original Caption:* ${originalCaption}\n`;
        }
        
        ownerCaption += `\n🕒 *Captured:* ${new Date().toLocaleString()}`;
        
        let mediaOptions = {};
        if (ownerCaption) {
            mediaOptions.caption = ownerCaption;
        }
        
        let sentMessage = null;
        
        // Send to owner based on media type
        switch (mediaInfo.type) {
            case 'image':
                sentMessage = await sock.sendMessage(ownerJid, {
                    image: fs.readFileSync(filepath),
                    ...mediaOptions
                });
                break;
                
            case 'video':
                mediaOptions.seconds = mediaInfo.message.seconds || 0;
                sentMessage = await sock.sendMessage(ownerJid, {
                    video: fs.readFileSync(filepath),
                    ...mediaOptions
                });
                break;
                
            case 'audio':
                sentMessage = await sock.sendMessage(ownerJid, {
                    audio: fs.readFileSync(filepath),
                    mimetype: mimetype || 'audio/mpeg',
                    ...(ownerCaption ? { caption: ownerCaption } : {})
                });
                break;
        }
        
        if (sentMessage) {
            console.log(`✅ Media sent to owner's DM: ${filename}`);
            
            // Clean up the file after sending
            cleanupFile(filepath);
            
            // Send confirmation to owner if requested
            if (CONFIG.SEND_CONFIRMATION_TO_OWNER) {
                await sock.sendMessage(ownerJid, {
                    text: `✅ *Stealth Download Complete*\n\nSuccessfully captured view-once ${mediaInfo.type} from ${senderNumber} in ${chatName}.`
                });
            }
            
            return {
                success: true,
                filename,
                filepath,
                type: mediaInfo.type,
                sizeKB: fileSizeKB,
                sizeMB: fileSizeMB.toFixed(2),
                mimetype,
                caption: originalCaption,
                sender: senderNumber,
                chatName,
                isGroup,
                sentTo: ownerJid
            };
        } else {
            throw new Error('Failed to send media to owner');
        }
        
    } catch (error) {
        console.error('Stealth download/send failed:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
}

// Clean old files from directory
function cleanOldFiles(maxAgeHours = 24) {
    try {
        const files = fs.readdirSync(CONFIG.SAVE_DIR);
        const now = Date.now();
        const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
        let deletedCount = 0;
        
        for (const file of files) {
            const filepath = path.join(CONFIG.SAVE_DIR, file);
            const stats = fs.statSync(filepath);
            const fileAge = now - stats.mtimeMs;
            
            if (fileAge > maxAgeMs) {
                fs.unlinkSync(filepath);
                deletedCount++;
                console.log(`🧹 Cleaned old file: ${file}`);
            }
        }
        
        if (deletedCount > 0) {
            console.log(`🧹 Cleaned ${deletedCount} old files from ${CONFIG.SAVE_DIR}`);
        }
    } catch (error) {
        console.error('Error cleaning old files:', error);
    }
}

// Clean old files on startup
cleanOldFiles();

// Main command module
export default {
    name: 'vv2',
    description: 'Stealth download view-once media to owner\'s DM (no notifications)',
    category: 'owner',
    ownerOnly: true,
    
    async execute(sock, msg, args, metadata) {
        const chatId = msg.key.remoteJid;
        
        // Extract jidManager from metadata or use fallback
        let jidManager = metadata?.jidManager;
        const PREFIX = metadata?.PREFIX || '.';
        
        console.log(`\n🔍 ========= VV2 COMMAND DEBUG =========`);
        console.log(`Chat ID: ${chatId}`);
        console.log(`From Me: ${msg.key.fromMe}`);
        console.log(`Participant: ${msg.key.participant}`);
        console.log(`Remote JID: ${msg.key.remoteJid}`);
        console.log(`jidManager provided: ${!!jidManager}`);
        console.log(`========================================\n`);
        
        // Get sender info
        const senderJid = msg.key.participant || chatId;
        let cleaned;
        
        if (jidManager && jidManager.cleanJid) {
            cleaned = jidManager.cleanJid(senderJid);
            console.log(`✅ Using provided jidManager`);
        } else {
            console.log(`⚠️ jidManager not provided, using fallback`);
            jidManager = fallbackJidManager;
            cleaned = jidManager.cleanJid(senderJid);
        }
        
        console.log(`Sender JID: ${senderJid}`);
        console.log(`Cleaned JID: ${cleaned.cleanJid}`);
        console.log(`Cleaned Number: ${cleaned.cleanNumber}`);
        console.log(`Is LID: ${cleaned.isLid}`);
        
        // Check owner status
        const isOwner = jidManager.isOwner(msg);
        console.log(`isOwner(): ${isOwner}`);
        
        // Get owner info
        const ownerInfo = jidManager.getOwnerInfo();
        console.log(`Owner from jidManager: ${ownerInfo.cleanNumber}`);
        
        // ==================== OWNER CHECK ====================
        const isFromMe = msg.key.fromMe;
        const isLid = senderJid.includes('@lid');
        
        // ULTIMATE FIX: fromMe = OWNER (based on your logs)
        if (isFromMe) {
            console.log(`🔍 ULTIMATE FIX: fromMe = OWNER (${cleaned.cleanJid})`);
            // Grant access immediately
        } else if (!isOwner) {
            console.log('❌ Owner check failed!');
            
            // Emergency bypass for LID + fromMe
            if (isFromMe && isLid) {
                console.log('⚠️ EMERGENCY BYPASS: LID + fromMe detected, granting access');
            } else {
                // Send helpful error message
                let errorMsg = `❌ *Owner Only Command!*\n\n`;
                errorMsg += `Only the bot owner can use this command.\n\n`;
                errorMsg += `🔍 *Debug Info:*\n`;
                errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
                errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
                errorMsg += `├─ Type: ${isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
                errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
                errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
                
                if (isLid && isFromMe) {
                    errorMsg += `⚠️ *Issue Detected:*\n`;
                    errorMsg += `You're using a linked device (LID).\n`;
                    errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
                } else if (!ownerInfo.cleanNumber) {
                    errorMsg += `⚠️ *Issue Detected:*\n`;
                    errorMsg += `Owner not set in jidManager!\n`;
                    errorMsg += `Try using ${PREFIX}debugchat fix\n`;
                }
                
                return sock.sendMessage(chatId, {
                    text: errorMsg
                }, { quoted: msg });
            }
        }
        // ==================== END OWNER CHECK ====================
        
        // Check if this is a reply to another message
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo;
        
        // Handle subcommands first
        const subCommand = args[0]?.toLowerCase();
        
        if (!quotedMsg || !contextInfo) {
            if (subCommand === 'clean' || subCommand === 'clear') {
                try {
                    const files = fs.readdirSync(CONFIG.SAVE_DIR);
                    let deletedCount = 0;
                    
                    for (const file of files) {
                        const filepath = path.join(CONFIG.SAVE_DIR, file);
                        fs.unlinkSync(filepath);
                        deletedCount++;
                    }
                    
                    return sock.sendMessage(chatId, { 
                        text: `🗑️ *Cleared Stealth Files*\n\nDeleted ${deletedCount} files from stealth storage.` 
                    }, { quoted: msg });
                    
                } catch (error) {
                    return sock.sendMessage(chatId, { 
                        text: `❌ Error clearing files: ${error.message}` 
                    }, { quoted: msg });
                }
            } 
            else if (subCommand === 'owner' || subCommand === 'whoami') {
                return sock.sendMessage(chatId, { 
                    text: `👑 *Bot Owner*\n\nOwner Number: ${ownerInfo.cleanNumber}\nOwner JID: \`${ownerInfo.cleanJid}\`\n\nThis command will send view-once media to your DM when you reply to them.` 
                }, { quoted: msg });
            }
            else if (subCommand === 'debug') {
                let debugText = `🐛 *VV2 Debug Info*\n\n`;
                debugText += `• Sender: ${cleaned.cleanJid}\n`;
                debugText += `• Owner: ${ownerInfo.cleanJid}\n`;
                debugText += `• Is owner: ${isOwner ? '✅ YES' : '❌ NO'}\n`;
                debugText += `• From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
                debugText += `• Is LID: ${isLid ? '✅ YES' : '❌ NO'}\n`;
                debugText += `• jidManager: ${jidManager === fallbackJidManager ? 'Fallback' : 'Provided'}\n`;
                debugText += `• Storage: ${CONFIG.SAVE_DIR}\n`;
                debugText += `• Auto cleanup: ${CONFIG.AUTO_CLEANUP ? '✅ ON' : '❌ OFF'}\n`;
                debugText += `• Max file size: ${CONFIG.MAX_SIZE_MB}MB`;
                
                return sock.sendMessage(chatId, { text: debugText }, { quoted: msg });
            }
            else if (subCommand === 'test') {
                try {
                    await sock.sendMessage(chatId, {
                        image: { 
                            url: 'https://via.placeholder.com/400x400/9b59b6/FFFFFF?text=Stealth+Test'
                        },
                        caption: 'Test view-once for stealth download',
                        viewOnce: true
                    });
                    
                    return sock.sendMessage(chatId, { 
                        text: `📸 *Stealth Test Sent*\n\nReply to the view-once image above with \`.vv2\` to test.\n\nIt will be sent to your DM without notifying anyone.` 
                    }, { quoted: msg });
                    
                } catch (error) {
                    return sock.sendMessage(chatId, { 
                        text: `❌ Failed to send test: ${error.message}` 
                    }, { quoted: msg });
                }
            }
            else if (subCommand === 'help') {
                const helpText = `
🔒 *Stealth View-Once Downloader (VV2)*

Secretly download view-once media to owner's DM without notifications.

👑 *Owner:* ${ownerInfo.cleanNumber}

⚡ *How to use:*
1. Someone sends a view-once photo/video/audio
2. Owner replies to it with \`.vv2\`
3. Media is secretly downloaded and sent to owner's DM
4. Original sender sees NOTHING

✨ *Features:*
• Completely stealth - no notifications in original chat
• Media sent directly to owner's DM
• Shows detailed info (sender, chat, size, etc.)
• Files auto-delete after sending
• Only owner can use this command

🔧 *Commands:*
• \`.vv2\` - Reply to view-once to download stealthily
• \`.vv2 owner\` - Show owner info
• \`.vv2 debug\` - Debug owner authentication
• \`.vv2 test\` - Send test view-once
• \`.vv2 clean\` - Clear temporary files
• \`.vv2 help\` - Show this help

📁 *Storage:* \`${CONFIG.SAVE_DIR}\`
⚠️ *Max file size:* ${CONFIG.MAX_SIZE_MB}MB
👑 *Owner only command*
                `.trim();
                
                return sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
            }
            
            return sock.sendMessage(chatId, { 
                text: `🔒 *Stealth VV2*\n\nReply to a view-once message with \`.vv2\` to secretly download it to your DM.\n\nOnly the bot owner can use this command.\n\nUse \`.vv2 help\` for more info.\n\nOwner: ${ownerInfo.cleanNumber || 'Not set'}` 
            }, { quoted: msg });
        }
        
        // Get the quoted message object
        const quotedMessage = getQuotedMessage(contextInfo);
        if (!quotedMessage) {
            return sock.sendMessage(chatId, { 
                text: '❌ Could not retrieve the quoted message.' 
            }, { quoted: msg });
        }
        
        // Check if quoted message is view-once
        if (!isViewOnceMessage(quotedMessage)) {
            return sock.sendMessage(chatId, { 
                text: '❌ The quoted message is not a view-once media.\n\nReply only to view-once photos, videos, or audio messages.' 
            }, { quoted: msg });
        }
        
        // Extract media info
        const mediaInfo = extractViewOnceMedia(quotedMessage);
        if (!mediaInfo) {
            return sock.sendMessage(chatId, { 
                text: '❌ Could not extract media from the view-once message.' 
            }, { quoted: msg });
        }
        
        // Get owner JID
        const ownerJid = ownerInfo.cleanJid;
        
        if (!ownerJid || ownerJid === 'Not configured') {
            return sock.sendMessage(chatId, { 
                text: '❌ Owner JID not found.\n\nPlease set owner first using appropriate commands.' 
            }, { quoted: msg });
        }
        
      
        
        try {
            // Download and send to owner
            const originalSender = quotedMessage.key.participant || quotedMessage.key.remoteJid;
            const result = await downloadAndSendToOwner(sock, quotedMessage, mediaInfo, chatId, originalSender, ownerJid, jidManager);
            
            if (result.success) {
               
                
              
                
            } else {
                // Delete processing message
                try {
                    await sock.sendMessage(chatId, { 
                        delete: processingMsg.key 
                    });
                } catch (e) {
                    // Ignore if can't delete
                }
                
                // Send error message
                await sock.sendMessage(chatId, { 
                    text: `❌ *Stealth Download Failed!*\n\nError: ${result.error}\n\nPossible reasons:\n• Media has expired\n• File too large (max ${CONFIG.MAX_SIZE_MB}MB)\n• Network issues\n• Invalid media format` 
                }, { quoted: msg });
            }
            
        } catch (error) {
            console.error('Unexpected error:', error);
            
            await sock.sendMessage(chatId, { 
                text: `❌ *Unexpected Error!*\n\n${error.message}\n\nPlease try again.` 
            }, { quoted: msg });
        }
    }
};

// Auto-cleanup every hour
setInterval(() => {
    cleanOldFiles(1);
}, 60 * 60 * 1000);

console.log('🔒 Stealth View-Once Downloader (VV2) module loaded');
console.log(`📁 Stealth storage: ${path.resolve(CONFIG.SAVE_DIR)}`);
console.log(`⚠️ Includes fallback jidManager for when not provided`);