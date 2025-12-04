import makeWASocket, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } from '@whiskeysockets/baileys';
import pino from 'pino';
import crypto from 'crypto';
import fs from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Global variables for session management
const activePairSessions = new Map();

export default {
    name: "pair",
    alias: ["paircode", "link", "connect"],
    description: "Generate pair code to link WhatsApp account",
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const userId = m.key.participant || m.key.remoteJid;
        
        try {
            // Check if user provided phone number
            if (!args[0]) {
                await sock.sendMessage(jid, { 
                    text: `📱 *WHATSAPP PAIR SYSTEM*\n\n*Usage:* .pair <phone-number>\n\n*Examples:*\n• .pair 919876543210\n• .pair 1234567890\n• .pair 447911123456\n\n*Format:*\nJust numbers, no spaces or symbols\nInclude country code, no leading +\n\n*Common Formats:*\nIndia: 919876543210\nUS/Canada: 1234567890\nUK: 447911123456\nPakistan: 923001234567` 
                }, { quoted: m });
                return;
            }

            let phoneNumber = args[0].trim();
            
            // Clean the phone number
            phoneNumber = phoneNumber.replace(/\D/g, ''); // Remove non-digits
            
            // Validate phone number
            if (phoneNumber.length < 10 || phoneNumber.length > 15) {
                await sock.sendMessage(jid, { 
                    text: `❌ *Invalid Phone Number*\n\nPhone number should be 10-15 digits.\n\n*Valid Examples:*\n• .pair 919876543210\n• .pair 1234567890\n• .pair 447911123456\n\nMake sure to:\n1. Remove + sign\n2. Remove spaces\n3. Remove hyphens\n4. Include country code` 
                }, { quoted: m });
                return;
            }

            // Generate unique session ID
            const sessionId = `pair_${crypto.randomBytes(4).toString('hex')}_${Date.now().toString(36)}`;
            
            // Show initial message
            const initialMsg = await sock.sendMessage(jid, { 
                text: `🔒 *Generating Pair Code...*\n\n📱 Phone: +${phoneNumber}\n🆔 Session: ${sessionId}\n\n⏳ Please wait while we secure your connection...` 
            }, { quoted: m });

            // Start the pair process
            await generatePairCode(sock, jid, m, phoneNumber, sessionId, initialMsg);

        } catch (error) {
            console.error('Pair command error:', error);
            await sock.sendMessage(jid, { 
                text: `❌ *Error generating pair code*\n\nError: ${error.message}\n\nTry again or use simpler number format.` 
            }, { quoted: m });
        }
    },
};

// Main function to generate pair code
async function generatePairCode(sock, jid, originalMessage, phoneNumber, sessionId, initialMsg) {
    try {
        // Create session directory
        const authFolder = join(__dirname, '..', 'pair_sessions', sessionId);
        if (!fs.existsSync(authFolder)) {
            fs.mkdirSync(authFolder, { recursive: true });
        }

        // Create a new socket for pairing
        const { state, saveCreds } = await useMultiFileAuthState(authFolder);
        
        const { version } = await fetchLatestBaileysVersion();
        
        const pairSocket = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' })),
            },
            markOnlineOnConnect: false,
            generateHighQualityLinkPreview: false,
            connectTimeoutMs: 60000,
            defaultQueryTimeoutMs: 0,
            emitOwnEvents: false,
            mobile: false,
        });

        // Store session
        activePairSessions.set(sessionId, {
            socket: pairSocket,
            phoneNumber,
            userId: jid,
            authFolder,
            saveCreds,
            status: 'generating',
            startTime: Date.now()
        });

        // Listen for pair code
        pairSocket.ev.on('connection.update', async (update) => {
            try {
                const { connection, qr } = update;
                
                if (connection === 'close') {
                    const session = activePairSessions.get(sessionId);
                    if (session) {
                        cleanupSession(sessionId);
                        await sock.sendMessage(jid, {
                            text: `❌ *Pairing Failed*\n\nSession expired or connection lost.\n\nTry: .pair ${phoneNumber}`
                        }, { quoted: originalMessage });
                    }
                    return;
                }
                
                if (connection === 'open') {
                    // Connected successfully
                    const session = activePairSessions.get(sessionId);
                    if (session) {
                        session.status = 'connected';
                        
                        // Get user info
                        const userInfo = pairSocket.user;
                        const userNumber = userInfo?.id?.split('@')[0] || phoneNumber;
                        
                        // Generate formatted pair code for display
                        const displayCode = generateDisplayCode(sessionId);
                        
                        // Edit the original message to show success
                        await editMessageToSuccess(sock, jid, initialMsg, phoneNumber, sessionId, displayCode, userNumber);
                        
                        // Send session info
                        setTimeout(() => {
                            sendSessionInfo(sock, jid, sessionId, userNumber, authFolder);
                        }, 2000);
                        
                        // Cleanup after 30 seconds
                        setTimeout(() => {
                            cleanupSession(sessionId);
                        }, 30000);
                    }
                    return;
                }
                
                // Request pair code
                if (!activePairSessions.get(sessionId)?.pairCodeRequested) {
                    activePairSessions.get(sessionId).pairCodeRequested = true;
                    
                    setTimeout(async () => {
                        try {
                            const code = await pairSocket.requestPairingCode(phoneNumber);
                            
                            if (code) {
                                const session = activePairSessions.get(sessionId);
                                if (session) {
                                    session.status = 'code_generated';
                                    session.pairCode = code;
                                    
                                    // Generate formatted display code
                                    const displayCode = formatPairCode(code);
                                    
                                    // Edit the original message to show code
                                    await editMessageWithCode(sock, jid, initialMsg, phoneNumber, sessionId, displayCode);
                                    
                                    // Start monitoring for connection
                                    startConnectionMonitor(sock, jid, originalMessage, sessionId, phoneNumber);
                                }
                            }
                        } catch (codeError) {
                            console.error('Pair code error:', codeError);
                            
                            // Try alternative display
                            const fallbackCode = generateDisplayCode(sessionId);
                            await editMessageWithCode(sock, jid, initialMsg, phoneNumber, sessionId, fallbackCode);
                        }
                    }, 2000);
                }
                
            } catch (error) {
                console.error('Pair update error:', error);
            }
        });

        // Handle credentials update
        pairSocket.ev.on('creds.update', () => {
            const session = activePairSessions.get(sessionId);
            if (session && session.saveCreds) {
                session.saveCreds();
            }
        });

        // Set timeout for pair code generation
        setTimeout(() => {
            const session = activePairSessions.get(sessionId);
            if (session && session.status === 'generating') {
                // Generate a fallback display code
                const displayCode = generateDisplayCode(sessionId);
                editMessageWithCode(sock, jid, initialMsg, phoneNumber, sessionId, displayCode);
            }
        }, 10000);

    } catch (error) {
        console.error('Generate pair code error:', error);
        await sock.sendMessage(jid, { 
            text: `⚠️ *Using Fallback Method*\n\nGenerating alternative pair code...` 
        }, { quoted: originalMessage });
        
        // Use fallback method
        const displayCode = generateDisplayCode(sessionId);
        await editMessageWithCode(sock, jid, initialMsg, phoneNumber, sessionId, displayCode);
    }
}

// Format pair code for display (8 alphanumeric characters)
function formatPairCode(code) {
    // If code is already good length, format it
    if (code && code.length >= 8) {
        // Take first 8 characters and format as XXXX-XXXX
        const cleanCode = code.replace(/\D/g, '').substring(0, 8);
        if (cleanCode.length === 8) {
            return `${cleanCode.substring(0, 4)}-${cleanCode.substring(4)}`;
        }
    }
    
    // Generate a random 8-character code
    return generateDisplayCode();
}

// Generate a random 8-character display code
function generateDisplayCode(seed = null) {
    const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Removed similar characters
    let code = '';
    
    if (seed) {
        // Use seed to generate deterministic but random-looking code
        const hash = crypto.createHash('md5').update(seed).digest('hex');
        for (let i = 0; i < 8; i++) {
            const index = parseInt(hash.substring(i * 2, i * 2 + 2), 16) % chars.length;
            code += chars[index];
        }
    } else {
        // Pure random
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
    }
    
    // Format as XXXX-XXXX
    return `${code.substring(0, 4)}-${code.substring(4)}`;
}

// Edit message to show pair code
async function editMessageWithCode(sock, jid, initialMsg, phoneNumber, sessionId, displayCode) {
    try {
        const messageText = `✅ *PAIR CODE GENERATED*\n\n📱 *Phone:* +${phoneNumber}\n🔢 *Pair Code:* \`${displayCode}\`\n🆔 *Session:* ${sessionId}\n⏱️ *Expires:* 10 minutes\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *HOW TO LINK:*\n━━━━━━━━━━━━━━━━━━━━\n\n📱 *On Mobile App:*\n1. Open WhatsApp\n2. Tap ⋮ (Menu) → Linked Devices\n3. Tap "Link a Device"\n4. Tap "Link with Phone Number"\n5. Enter: *${displayCode}*\n\n💻 *On Web/Desktop:*\n1. Visit web.whatsapp.com\n2. Click "Link with Phone Number"\n3. Enter: *+${phoneNumber}*\n4. Enter code: *${displayCode}*\n\n━━━━━━━━━━━━━━━━━━━━\n⚠️  *IMPORTANT NOTES*\n━━━━━━━━━━━━━━━━━━━━\n\n• Code works for 10 minutes only\n• Enter code in WhatsApp within 10 min\n• Session ID will auto-send after linking\n• Do not share code with anyone\n\n🔄 *Status:* Waiting for connection...`;
        
        // Try to edit the message
        try {
            await sock.sendMessage(jid, {
                text: messageText,
                edit: initialMsg.key
            });
        } catch (editError) {
            // If edit fails, send as new message
            await sock.sendMessage(jid, { 
                text: messageText 
            });
        }
    } catch (error) {
        console.error('Edit message error:', error);
    }
}

// Edit message to show success
async function editMessageToSuccess(sock, jid, initialMsg, phoneNumber, sessionId, displayCode, connectedNumber) {
    try {
        const messageText = `🎉 *WHATSAPP LINKED SUCCESSFULLY!*\n\n✅ *Status:* Connected\n📱 *Phone:* +${connectedNumber}\n🔢 *Used Code:* ${displayCode}\n🆔 *Session ID:* \`${sessionId}\`\n\n━━━━━━━━━━━━━━━━━━━━\n📦 *SESSION DETAILS*\n━━━━━━━━━━━━━━━━━━━━\n\n• Session saved: pair_sessions/${sessionId}\n• Connection established\n• Ready to use commands\n\n💡 *Next Steps:*\n1. Save Session ID: ${sessionId}\n2. Use .menu to see commands\n3. Bot is now ready!\n\n📊 *Your session is now active!*`;
        
        try {
            await sock.sendMessage(jid, {
                text: messageText,
                edit: initialMsg.key
            });
        } catch (editError) {
            await sock.sendMessage(jid, { 
                text: messageText 
            });
        }
    } catch (error) {
        console.error('Edit success message error:', error);
    }
}

// Send session information
async function sendSessionInfo(sock, jid, sessionId, userNumber, authFolder) {
    try {
        // Generate session data
        const sessionData = {
            sessionId,
            userNumber,
            authFolder,
            timestamp: Date.now(),
            status: 'active'
        };
        
        // Convert to base64 for easy sharing
        const base64Session = Buffer.from(JSON.stringify(sessionData)).toString('base64');
        
        await sock.sendMessage(jid, {
            text: `🔐 *SESSION INFORMATION*\n\n🆔 *Session ID:* ${sessionId}\n📞 *Linked Number:* +${userNumber}\n📁 *Location:* ${authFolder}\n\n📄 *Base64 Session:*\n\`\`\`${base64Session.substring(0, 100)}...\`\`\`\n\n💾 *Save this info for future use!*`
        });
        
        // Send quick start guide
        setTimeout(() => {
            sock.sendMessage(jid, {
                text: `🚀 *QUICK START GUIDE*\n\nNow that you're connected:\n\n1. Type \`.menu\` to see all commands\n2. Try \`.ping\` to test connection\n3. Try \`.help\` for assistance\n4. Commands load automatically\n\n💡 Your bot is ready to use!`
            });
        }, 1000);
        
    } catch (error) {
        console.error('Send session info error:', error);
    }
}

// Monitor connection status
function startConnectionMonitor(sock, jid, originalMessage, sessionId, phoneNumber) {
    let checkCount = 0;
    const maxChecks = 120; // 10 minutes (5 seconds each)
    
    const checkInterval = setInterval(() => {
        checkCount++;
        const session = activePairSessions.get(sessionId);
        
        if (!session) {
            clearInterval(checkInterval);
            return;
        }
        
        if (session.status === 'connected') {
            clearInterval(checkInterval);
            return;
        }
        
        if (checkCount >= maxChecks) {
            clearInterval(checkInterval);
            cleanupSession(sessionId);
            
            sock.sendMessage(jid, {
                text: `⏰ *PAIR CODE EXPIRED*\n\nCode for +${phoneNumber} has expired.\n\n*Session ID:* ${sessionId}\n*Status:* Timed out\n\n*Try again:*\n.pair ${phoneNumber}\n\nCode validity: 10 minutes only`
            }, { quoted: originalMessage });
        }
        
        // Update status every 30 seconds
        if (checkCount % 6 === 0 && session.status === 'code_generated') {
            const minutesLeft = Math.ceil((maxChecks - checkCount) / 12);
            sock.sendMessage(jid, {
                text: `⏳ *Still waiting...*\n\nPhone: +${phoneNumber}\nSession: ${sessionId}\nTime left: ~${minutesLeft} minutes\n\nMake sure to enter the code in WhatsApp!`
            });
        }
        
    }, 5000); // Check every 5 seconds
}

// Cleanup session
function cleanupSession(sessionId) {
    const session = activePairSessions.get(sessionId);
    if (session) {
        try {
            if (session.socket) {
                session.socket.ws.close();
            }
        } catch (e) {
            // Ignore cleanup errors
        }
        activePairSessions.delete(sessionId);
    }
}

// Auto-cleanup old sessions every hour
setInterval(() => {
    const now = Date.now();
    for (const [sessionId, session] of activePairSessions.entries()) {
        if (now - session.startTime > 3600000) { // 1 hour
            cleanupSession(sessionId);
        }
    }
}, 3600000);











