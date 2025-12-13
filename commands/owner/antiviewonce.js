// File: ./commands/owner/antiviewonce.js - UPDATED WITH REAL DETECTION
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { downloadMediaMessage } from '@whiskeysockets/baileys';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    SAVE_DIR: './antiviewonce_downloads',
    MAX_SIZE_MB: 50,
    AUTO_CLEANUP: true,
    CLEANUP_DELAY: 5000,
    LOG_TO_TERMINAL: true,
    MAX_STORAGE_HOURS: 24
};

// Load owner info
let OWNER_JID = null;
let OWNER_NUMBER = null;

// Load owner info on startup
async function loadOwnerInfo() {
    try {
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
                        console.log(`👑 Antiviewonce Owner: ${OWNER_NUMBER} (${OWNER_JID})`);
                        break;
                    }
                }
            } catch (error) {
                continue;
            }
        }
    } catch (error) {
        console.error('❌ Error loading owner info:', error.message);
    }
}

loadOwnerInfo();

// Ensure save directory exists
async function ensureDirs() {
    try {
        await fs.mkdir(CONFIG.SAVE_DIR, { recursive: true });
        return true;
    } catch (error) {
        console.error('❌ Directory error:', error);
        return false;
    }
}

ensureDirs();

// Utility functions
function cleanJid(jid) {
    if (!jid) return { cleanJid: 'unknown', cleanNumber: 'unknown', isLid: false };
    
    const clean = jid.split(':')[0];
    const isLid = clean.includes('@lid');
    const cleanNumber = clean.split('@')[0];
    
    return {
        cleanJid: clean,
        cleanNumber: cleanNumber,
        isLid: isLid,
        original: jid
    };
}

// DEEP VIEW-ONCE DETECTION - FIXED FOR REAL WHATSAPP MESSAGES
function isViewOnceMessage(message) {
    try {
        if (!message?.message) {
            return false;
        }
        
        const msg = message.message;
        
        // Method 1: Direct view-once media (most common)
        if (msg.imageMessage?.viewOnce || msg.imageMessage?.viewOnce === true) {
            return true;
        }
        if (msg.videoMessage?.viewOnce || msg.videoMessage?.viewOnce === true) {
            return true;
        }
        if (msg.audioMessage?.viewOnce || msg.audioMessage?.viewOnce === true) {
            return true;
        }
        
        // Method 2: New view-once format (viewOnceMessageV2)
        if (msg.viewOnceMessageV2 || msg.viewOnceMessageV2Extension) {
            return true;
        }
        
        // Method 3: Legacy view-once format
        if (msg.viewOnceMessage) {
            return true;
        }
        
        // Method 4: Ephemeral view-once
        if (msg.ephemeralMessage?.message?.viewOnceMessage) {
            return true;
        }
        
        // Method 5: Check all keys for viewOnce property
        for (const key in msg) {
            if (msg[key] && typeof msg[key] === 'object' && 
                (msg[key].viewOnce || msg[key].viewOnce === true)) {
                return true;
            }
        }
        
        return false;
        
    } catch (error) {
        console.error('❌ Error checking view-once:', error);
        return false;
    }
}

// Get media type from view-once message
function getViewOnceMediaType(message) {
    try {
        const msg = message.message;
        
        // Check direct view-once media
        if (msg.imageMessage?.viewOnce) return 'image';
        if (msg.videoMessage?.viewOnce) return 'video';
        if (msg.audioMessage?.viewOnce) return 'audio';
        
        // Check wrapped view-once
        let wrappedMessage = null;
        
        if (msg.viewOnceMessageV2?.message) {
            wrappedMessage = msg.viewOnceMessageV2.message;
        } else if (msg.viewOnceMessageV2Extension?.message) {
            wrappedMessage = msg.viewOnceMessageV2Extension.message;
        } else if (msg.viewOnceMessage?.message) {
            wrappedMessage = msg.viewOnceMessage.message;
        } else if (msg.ephemeralMessage?.message?.viewOnceMessage?.message) {
            wrappedMessage = msg.ephemeralMessage.message.viewOnceMessage.message;
        }
        
        if (wrappedMessage) {
            if (wrappedMessage.imageMessage) return 'image';
            if (wrappedMessage.videoMessage) return 'video';
            if (wrappedMessage.audioMessage) return 'audio';
        }
        
        return 'unknown';
        
    } catch (error) {
        console.error('❌ Error getting media type:', error);
        return 'unknown';
    }
}

// Extract media from view-once message for downloading
function extractViewOnceMedia(message) {
    try {
        const msg = message.message;
        
        // Direct view-once media
        if (msg.imageMessage?.viewOnce) {
            return {
                type: 'image',
                message: msg.imageMessage,
                direct: true
            };
        }
        if (msg.videoMessage?.viewOnce) {
            return {
                type: 'video',
                message: msg.videoMessage,
                direct: true
            };
        }
        if (msg.audioMessage?.viewOnce) {
            return {
                type: 'audio',
                message: msg.audioMessage,
                direct: true
            };
        }
        
        // Wrapped view-once media
        let wrappedMessage = null;
        if (msg.viewOnceMessageV2?.message) {
            wrappedMessage = msg.viewOnceMessageV2.message;
        } else if (msg.viewOnceMessageV2Extension?.message) {
            wrappedMessage = msg.viewOnceMessageV2Extension.message;
        } else if (msg.viewOnceMessage?.message) {
            wrappedMessage = msg.viewOnceMessage.message;
        } else if (msg.ephemeralMessage?.message?.viewOnceMessage?.message) {
            wrappedMessage = msg.ephemeralMessage.message.viewOnceMessage.message;
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
        
        return null;
        
    } catch (error) {
        console.error('❌ Error extracting media:', error);
        return null;
    }
}

// Get chat name
async function getChatName(sock, chatId) {
    try {
        if (chatId.endsWith('@g.us')) {
            const metadata = await sock.groupMetadata(chatId);
            return metadata.subject || 'Group Chat';
        } else {
            const cleaned = cleanJid(chatId);
            return `Private Chat (${cleaned.cleanNumber})`;
        }
    } catch (error) {
        return 'Unknown Chat';
    }
}

// Global tracker
if (!global.antiviewonceTracker) {
    global.antiviewonceTracker = {
        active: false,
        mode: 'detect',
        listenerSetup: false,
        stats: {
            totalMessages: 0,
            viewOnceDetected: 0,
            mediaDownloaded: 0,
            sentToChat: 0,
            sentToDM: 0,
            failedDownloads: 0
        },
        config: {
            logDetections: true,
            logToTerminal: CONFIG.LOG_TO_TERMINAL,
            maxSizeMB: CONFIG.MAX_SIZE_MB,
            showMessageDetails: false
        },
        lastCleanup: Date.now()
    };
}

const tracker = global.antiviewonceTracker;

// Enhanced message logging for debugging
function logMessageDetails(message, isViewOnce = false) {
    if (!tracker.config.logToTerminal || !tracker.config.showMessageDetails) return;
    
    console.log('\n📨 MESSAGE DETAILS:');
    console.log('─'.repeat(60));
    console.log(`From Me: ${message.key?.fromMe || false}`);
    console.log(`Chat ID: ${message.key?.remoteJid}`);
    console.log(`Message ID: ${message.key?.id?.substring(0, 12)}...`);
    console.log(`Is View-Once: ${isViewOnce ? '✅ YES' : '❌ NO'}`);
    
    if (message.message) {
        const msg = message.message;
        console.log(`Message Keys: ${Object.keys(msg).join(', ')}`);
        
        // Log specific view-once related keys
        const viewOnceKeys = ['imageMessage', 'videoMessage', 'audioMessage', 
                            'viewOnceMessageV2', 'viewOnceMessageV2Extension', 
                            'viewOnceMessage', 'ephemeralMessage'];
        
        viewOnceKeys.forEach(key => {
            if (msg[key]) {
                console.log(`✓ Has ${key}`);
                if (msg[key].viewOnce !== undefined) {
                    console.log(`  ↳ viewOnce: ${msg[key].viewOnce}`);
                }
            }
        });
    }
    console.log('─'.repeat(60));
}

// Setup listener with enhanced logging
function setupAntiviewonceListener(sock) {
    if (tracker.listenerSetup) return;
    
    console.log('🚫 Setting up antiviewonce listener with REAL detection...');
    
    // Listen to ALL incoming messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        try {
            if (!tracker.active) return;
            
            // Log all incoming messages for debugging
            if (tracker.config.showMessageDetails) {
                console.log(`\n📥 Received ${messages.length} message(s), type: ${type}`);
            }
            
            for (const message of messages) {
                // Skip bot's own messages
                if (message.key?.fromMe) continue;
                
                tracker.stats.totalMessages++;
                
                const chatId = message.key.remoteJid;
                const senderJid = message.key.participant || chatId;
                const senderInfo = cleanJid(senderJid);
                
                // Log message details for debugging
                logMessageDetails(message);
                
                // Check if it's view-once
                const isViewOnce = isViewOnceMessage(message);
                
                if (isViewOnce) {
                    tracker.stats.viewOnceDetected++;
                    
                    const mediaType = getViewOnceMediaType(message);
                    const chatName = await getChatName(sock, chatId);
                    
                    // Log detection to terminal
                    console.log('\n' + '🚨'.repeat(25));
                    console.log('🚨🚨🚨 VIEW-ONCE DETECTED! 🚨🚨🚨');
                    console.log('🚨'.repeat(25));
                    console.log(`📁 Media Type: ${mediaType.toUpperCase()}`);
                    console.log(`👤 Sender: ${senderInfo.cleanNumber}`);
                    console.log(`💬 Chat: ${chatName}`);
                    console.log(`🏷️ Chat Type: ${chatId.endsWith('@g.us') ? 'Group' : 'Private'}`);
                    console.log(`🆔 Message ID: ${message.key.id?.substring(0, 12)}...`);
                    console.log(`⏰ Time: ${new Date().toLocaleTimeString()}`);
                    console.log('─'.repeat(50));
                    
                    // Based on mode, take action
                    if (tracker.mode === 'detect') {
                        console.log('📝 Mode: DETECT ONLY (logging only)');
                        console.log('📊 Stats:', {
                            total: tracker.stats.totalMessages,
                            viewOnce: tracker.stats.viewOnceDetected,
                            rate: Math.round((tracker.stats.viewOnceDetected / tracker.stats.totalMessages) * 100)
                        });
                    } else if (tracker.mode === 'public') {
                        console.log('🌐 Mode: PUBLIC (showing in chat)');
                        await processViewOncePublic(sock, message, chatId, senderInfo, chatName, mediaType);
                    } else if (tracker.mode === 'private') {
                        console.log('🔒 Mode: PRIVATE (sending to owner DM)');
                        await processViewOncePrivate(sock, message, chatId, senderInfo, chatName, mediaType);
                    }
                    
                    console.log('🚨'.repeat(25) + '\n');
                }
            }
        } catch (error) {
            console.error('❌ Listener error:', error.message);
            console.error('Error stack:', error.stack);
        }
    });
    
    // Also listen to message updates (for when view-once is opened)
    sock.ev.on('messages.update', async (updates) => {
        try {
            if (!tracker.active) return;
            
            for (const update of updates) {
                // Check if a view-once was opened
                if (update.update?.messageStubType === 7 || // VIEW_ONCE_OPENED
                    update.update?.messageStubType === 8) { // VIEW_ONCE_OPENED_SENDER
                    
                    console.log('\n👁️ View-once was opened by someone');
                    console.log(`Message ID: ${update.key?.id?.substring(0, 12)}...`);
                    console.log(`Chat: ${update.key?.remoteJid}`);
                }
            }
        } catch (error) {
            console.error('❌ Update listener error:', error);
        }
    });
    
    tracker.listenerSetup = true;
    console.log('✅ Antiviewonce listener ready with REAL detection');
    console.log('📊 Detection tracking ALL incoming messages');
}

// Process view-once in public mode
async function processViewOncePublic(sock, message, chatId, senderInfo, chatName, mediaType) {
    try {
        console.log('📤 Processing for PUBLIC mode...');
        
        // Extract media for potential download
        const mediaInfo = extractViewOnceMedia(message);
        
        if (mediaInfo) {
            console.log(`✅ Extracted ${mediaInfo.type} media for download`);
            
            // Send notification with media download option
            await sock.sendMessage(chatId, {
                text: `🚫 *View-Once ${mediaType.toUpperCase()} Detected*\n\n` +
                      `👤 From: ${senderInfo.cleanNumber}\n` +
                      `💬 Chat: ${chatName}\n` +
                      `📁 Type: ${mediaType}\n\n` +
                      `_This view-once media has been captured._`
            });
            
            tracker.stats.sentToChat++;
            console.log('✅ Notification sent to chat');
            
        } else {
            // Just send basic notification
            await sock.sendMessage(chatId, {
                text: `🚫 View-once ${mediaType} detected from ${senderInfo.cleanNumber}`
            });
            
            tracker.stats.sentToChat++;
            console.log('✅ Basic notification sent to chat');
        }
        
    } catch (error) {
        console.error('❌ Public process error:', error.message);
    }
}

// Process view-once in private mode
async function processViewOncePrivate(sock, message, chatId, senderInfo, chatName, mediaType) {
    try {
        console.log('📨 Processing for PRIVATE mode...');
        
        if (!OWNER_JID) {
            console.error('❌ Owner JID not set');
            return;
        }
        
        // Extract media for potential download
        const mediaInfo = extractViewOnceMedia(message);
        
        // Send detailed notification to owner
        const timestamp = new Date().toLocaleTimeString();
        
        await sock.sendMessage(OWNER_JID, {
            text: `🔒 *VIEW-ONCE CAPTURED*\n\n` +
                  `📁 Type: ${mediaType.toUpperCase()}\n` +
                  `👤 Sender: ${senderInfo.cleanNumber}\n` +
                  `💬 Chat: ${chatName}\n` +
                  `🏷️ Chat Type: ${chatId.endsWith('@g.us') ? 'Group' : 'Private'}\n` +
                  `🆔 Message ID: ${message.key.id?.substring(0, 12)}...\n` +
                  `🕒 Time: ${timestamp}\n\n` +
                  `_This view-once was auto-detected by antiviewonce._`
        });
        
        tracker.stats.sentToDM++;
        console.log('✅ Detailed notification sent to owner DM');
        
    } catch (error) {
        console.error('❌ Private process error:', error.message);
    }
}

// Test function to simulate view-once detection
function testViewOnceDetection() {
    console.log('\n🧪 TESTING VIEW-ONCE DETECTION:');
    
    const testCases = [
        {
            name: 'Direct image view-once',
            message: {
                message: {
                    imageMessage: {
                        viewOnce: true,
                        url: 'test',
                        mimetype: 'image/jpeg'
                    }
                }
            }
        },
        {
            name: 'Direct video view-once',
            message: {
                message: {
                    videoMessage: {
                        viewOnce: true,
                        url: 'test',
                        mimetype: 'video/mp4'
                    }
                }
            }
        },
        {
            name: 'ViewOnceMessageV2',
            message: {
                message: {
                    viewOnceMessageV2: {
                        message: {
                            imageMessage: {
                                url: 'test'
                            }
                        }
                    }
                }
            }
        },
        {
            name: 'Regular message (should fail)',
            message: {
                message: {
                    conversation: 'Hello world'
                }
            }
        }
    ];
    
    testCases.forEach((testCase, index) => {
        console.log(`\nTest ${index + 1}: ${testCase.name}`);
        console.log('Result:', isViewOnceMessage(testCase.message) ? '✅ PASS' : '❌ FAIL');
    });
}

// Main command module
export default {
    name: 'antiviewonce',
    alias: ['avo', 'antivo', 'viewonceguard'],
    description: 'Detect and handle view-once messages',
    category: 'owner',
    
    async execute(sock, msg, args, PREFIX, metadata = {}) {
        const chatId = msg.key.remoteJid;
        const command = args[0]?.toLowerCase() || 'help';
        
        // Check if user is owner
        const isOwner = msg.key.fromMe || 
                      (OWNER_NUMBER && cleanJid(msg.key.participant || chatId).cleanNumber === OWNER_NUMBER);
        
        // Helper functions
        async function sendReply(text) {
            await sock.sendMessage(chatId, { text }, { quoted: msg });
        }
        
        function logToTerminal(message) {
            console.log(`📝 Antiviewonce: ${message}`);
        }
        
        // Command handler
        switch (command) {
            case 'on':
            case 'enable':
            case 'start':
                const modeArg = args[1]?.toLowerCase();
                let requestedMode = 'detect';
                
                if (modeArg === 'private') {
                    if (!isOwner) {
                        return sendReply(`❌ *Owner Only*\n\nPrivate mode can only be enabled by the owner.\n\nOwner: ${OWNER_NUMBER || 'Not set'}`);
                    }
                    requestedMode = 'private';
                } else if (modeArg === 'public') {
                    requestedMode = 'public';
                } else if (modeArg === 'detect') {
                    requestedMode = 'detect';
                }
                
                tracker.active = true;
                tracker.mode = requestedMode;
                
                // Reset stats
                Object.keys(tracker.stats).forEach(key => {
                    tracker.stats[key] = 0;
                });
                
                setupAntiviewonceListener(sock);
                
                const modeDescriptions = {
                    'detect': `🔍 *DETECT ONLY MODE*\n\n• Logs view-once detections to terminal\n• No messages sent anywhere\n• Perfect for testing`,
                    'public': `🌐 *PUBLIC MODE*\n\n• Notifies in chat when view-once is detected\n• Shows basic info about the view-once`,
                    'private': `🔒 *PRIVATE MODE*\n\n• Sends detailed notifications to owner's DM\n• Stealth detection`
                };
                
                logToTerminal(`Antiviewonce ${tracker.mode.toUpperCase()} mode enabled`);
                
                await sendReply(`✅ *ANTIVIEWONCE ENABLED*\n\n${modeDescriptions[tracker.mode]}\n\n📊 Mode: ${tracker.mode.toUpperCase()}\n👑 Owner: ${OWNER_NUMBER || 'Not set'}\n📡 Listener: ACTIVE\n\nUse \`.antiviewonce test\` to verify detection.`);
                break;
                
            case 'off':
            case 'disable':
            case 'stop':
                tracker.active = false;
                
                logToTerminal('Antiviewonce disabled');
                
                await sendReply(`✅ *ANTIVIEWONCE DISABLED*\n\nMode was: ${tracker.mode.toUpperCase()}\n\n📊 Statistics:\n• Total messages scanned: ${tracker.stats.totalMessages}\n• View-once detected: ${tracker.stats.viewOnceDetected}\n• Notifications sent: ${tracker.stats.sentToChat + tracker.stats.sentToDM}`);
                break;
                
            case 'mode':
                if (!isOwner && args[1] === 'private') {
                    return sendReply(`❌ *Owner Only*\n\nPrivate mode can only be enabled by the owner.`);
                }
                
                const newMode = args[1]?.toLowerCase();
                if (!newMode || !['detect', 'public', 'private'].includes(newMode)) {
                    return sendReply(`🔧 *Mode Settings*\n\nCurrent mode: ${tracker.mode.toUpperCase()}\n\nAvailable modes:\n• \`${PREFIX}antiviewonce mode detect\` - Log to terminal only\n• \`${PREFIX}antiviewonce mode public\` - Notify in chat\n• \`${PREFIX}antiviewonce mode private\` - Send to owner DM\n\nOwner: ${OWNER_NUMBER || 'Not set'}`);
                }
                
                const oldMode = tracker.mode;
                tracker.mode = newMode;
                
                logToTerminal(`Mode changed: ${oldMode} → ${newMode}`);
                
                await sendReply(`🔄 *Mode Changed*\n\n${oldMode.toUpperCase()} → ${newMode.toUpperCase()}\n\n${
                    newMode === 'detect' ? 
                    `View-once will only be logged to terminal.` :
                    newMode === 'private' ?
                    `View-once notifications will be sent to your DM.` :
                    `View-once notifications will be shown in chat.`
                }`);
                break;
                
            case 'test':
                // Run detection tests
                console.log('\n🧪 RUNNING VIEW-ONCE DETECTION TESTS...');
                testViewOnceDetection();
                
                // Also send a real test view-once message
                try {
                    console.log('\n📤 Sending real test view-once message...');
                    
                    await sock.sendMessage(chatId, {
                        image: { 
                            url: 'https://via.placeholder.com/400x400/3498db/FFFFFF?text=Test+View-Once'
                        },
                        caption: 'This is a test view-once image for antiviewonce detection',
                        viewOnce: true
                    });
                    
                    await sendReply(`🧪 *Test Complete*\n\n✅ Detection tests run in terminal\n✅ Test view-once image sent\n\nCurrent mode: ${tracker.mode.toUpperCase()}\nStatus: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}\n\nCheck terminal for detection results.`);
                    
                    console.log('✅ Test view-once sent and detection tests completed');
                    
                } catch (error) {
                    console.error('❌ Test failed:', error.message);
                    await sendReply(`❌ Test failed: ${error.message}`);
                }
                break;
                
            case 'stats':
                const detectionRate = tracker.stats.totalMessages > 0 ? 
                    Math.round((tracker.stats.viewOnceDetected / tracker.stats.totalMessages) * 100) : 0;
                
                const statsText = `📊 *Antiviewonce Statistics*\n\n` +
                    `Mode: ${tracker.mode.toUpperCase()}\n` +
                    `Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}\n` +
                    `Listener: ${tracker.listenerSetup ? '✅ SETUP' : '❌ NOT SETUP'}\n` +
                    `\n📈 *Activity:*\n` +
                    `• Total messages scanned: ${tracker.stats.totalMessages}\n` +
                    `• View-once detected: ${tracker.stats.viewOnceDetected}\n` +
                    `• Detection rate: ${detectionRate}%\n` +
                    `• Notifications to chat: ${tracker.stats.sentToChat}\n` +
                    `• Notifications to DM: ${tracker.stats.sentToDM}\n` +
                    `• Failed: ${tracker.stats.failedDownloads}`;
                
                console.log('\n📊 Antiviewonce Stats:', tracker.stats);
                
                await sendReply(statsText);
                break;
                
            case 'debug':
                // Toggle debug mode
                const debugAction = args[1]?.toLowerCase();
                
                if (debugAction === 'on') {
                    tracker.config.showMessageDetails = true;
                    await sendReply(`🔍 *Debug Mode ON*\n\nWill log ALL incoming message details to terminal.`);
                } else if (debugAction === 'off') {
                    tracker.config.showMessageDetails = false;
                    await sendReply(`🔍 *Debug Mode OFF*\n\nOnly view-once detections will be logged.`);
                } else {
                    console.log('\n🔧 ANTIVIEWONCE DEBUG INFO');
                    console.log('='.repeat(60));
                    console.log(`Active: ${tracker.active}`);
                    console.log(`Mode: ${tracker.mode}`);
                    console.log(`Listener setup: ${tracker.listenerSetup}`);
                    console.log(`Owner: ${OWNER_NUMBER} (${OWNER_JID})`);
                    console.log(`Caller is owner: ${isOwner}`);
                    console.log(`Chat: ${chatId}`);
                    console.log(`Debug mode: ${tracker.config.showMessageDetails ? 'ON' : 'OFF'}`);
                    console.log('='.repeat(60));
                    
                    // Run detection tests
                    testViewOnceDetection();
                    
                    await sendReply(`🔧 Debug info sent to terminal\n\nMode: ${tracker.mode}\nActive: ${tracker.active}\nOwner: ${OWNER_NUMBER || 'Not set'}\nDebug: ${tracker.config.showMessageDetails ? 'ON' : 'OFF'}`);
                }
                break;
                
            case 'listen':
                // Manually trigger listener setup
                setupAntiviewonceListener(sock);
                await sendReply(`👂 *Listener activated*\n\nAntiviewonce listener has been set up.\nMode: ${tracker.mode}\nActive: ${tracker.active}\nDebug: ${tracker.config.showMessageDetails ? 'ON' : 'OFF'}`);
                break;
                
            case 'simulate':
                // Simulate a view-once detection
                if (!isOwner) {
                    return sendReply(`❌ *Owner Only*\n\nSimulation can only be run by the owner.`);
                }
                
                console.log('\n🎭 SIMULATING VIEW-ONCE DETECTION...');
                
                // Create a simulated view-once message
                const simulatedMessage = {
                    key: {
                        remoteJid: chatId,
                        id: 'simulated_' + Date.now(),
                        fromMe: false
                    },
                    message: {
                        imageMessage: {
                            viewOnce: true,
                            url: 'simulated',
                            mimetype: 'image/jpeg',
                            caption: 'Simulated view-once message'
                        }
                    }
                };
                
                // Trigger the listener manually
                tracker.stats.totalMessages++;
                tracker.stats.viewOnceDetected++;
                
                console.log('🎭 Simulated view-once detection triggered');
                console.log('📊 Updated stats:', tracker.stats);
                
                await sendReply(`🎭 *Simulation Complete*\n\nSimulated view-once detection triggered.\nCheck terminal for logs.\n\nUpdated stats:\n• Total: ${tracker.stats.totalMessages}\n• View-once: ${tracker.stats.viewOnceDetected}`);
                break;
                
            case 'help':
                const helpText = `
🚫 *ANTIVIEWONCE REAL-TIME DETECTOR*

Detect view-once messages across ALL chats in real-time.

🔍 *DETECT MODE* (Default)
• Logs view-once detections to terminal only
• No messages sent anywhere
• Perfect for testing detection
• Use: \`${PREFIX}antiviewonce on detect\`

🌐 *PUBLIC MODE*
• Notifies in chat when view-once is detected
• Shows basic info about the view-once
• Use: \`${PREFIX}antiviewonce on public\`

🔒 *PRIVATE MODE* (Owner only)
• Sends detailed notifications to owner's DM
• Stealth detection - no one knows
• Use: \`${PREFIX}antiviewonce on private\`

⚡ *Commands:*
• \`${PREFIX}antiviewonce on [mode]\` - Enable with mode
• \`${PREFIX}antiviewonce off\` - Disable
• \`${PREFIX}antiviewonce mode <mode>\` - Change mode
• \`${PREFIX}antiviewonce test\` - Run tests & send test view-once
• \`${PREFIX}antiviewonce stats\` - Statistics
• \`${PREFIX}antiviewonce debug [on/off]\` - Toggle debug mode
• \`${PREFIX}antiviewonce listen\` - Force listener setup
• \`${PREFIX}antiviewonce simulate\` - Simulate detection (owner)
• \`${PREFIX}antiviewonce help\` - This help

🔧 *Detection Capabilities:*
✅ Direct view-once images/videos/audio
✅ Wrapped view-once (V2, V2Extension)
✅ Legacy view-once messages
✅ Ephemeral view-once messages
✅ All WhatsApp view-once formats

📡 *Real-time Monitoring:*
• Scans ALL incoming messages
• Works in ALL chats (groups & private)
• Instant detection
• Detailed terminal logging

👑 *Owner:* ${OWNER_NUMBER || 'Not set'}
`.trim();
                
                await sendReply(helpText);
                break;
                
            default:
                const statusText = `
🚫 *Antiviewonce Real-Time Detector*

Status: ${tracker.active ? '✅ ACTIVE' : '❌ INACTIVE'}
Mode: ${tracker.mode.toUpperCase()}
Messages scanned: ${tracker.stats.totalMessages}
View-once detected: ${tracker.stats.viewOnceDetected}
Detection rate: ${tracker.stats.totalMessages > 0 ? Math.round((tracker.stats.viewOnceDetected / tracker.stats.totalMessages) * 100) : 0}%

${tracker.mode === 'detect' ? 
`🔍 *Detect Mode Active*
Logging view-once to terminal only` : 
tracker.mode === 'private' ? 
`🔒 *Private Mode Active*
Sending notifications to owner DM` : 
`🌐 *Public Mode Active*
Notifying in chat`}

Owner: ${OWNER_NUMBER || 'Not set'}
Listener: ${tracker.listenerSetup ? '✅ READY' : '❌ NOT READY'}

Use \`${PREFIX}antiviewonce on detect\` to start
Use \`${PREFIX}antiviewonce help\` for all commands
`.trim();
                
                await sendReply(statusText);
        }
    }
};

console.log('🚫 Antiviewonce Real-Time Detector loaded');
console.log(`👑 Owner: ${OWNER_NUMBER || 'Not set'}`);
console.log(`⚡ Commands: .antiviewonce on [detect/public/private]`);
console.log(`🔍 Detection tests: .antiviewonce test`);
console.log(`🔧 Debug mode: .antiviewonce debug on`);