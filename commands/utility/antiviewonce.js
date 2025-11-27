// commands/utility/antiviewonce.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const dbPath = path.join(__dirname, '../../database/antiviewonce.json');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
}

// Initialize database if it doesn't exist
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({ 
        enabled: true,  // Changed to true by default for testing
        groups: {},
        users: {} 
    }, null, 2));
}

// Load database
function loadDB() {
    try {
        return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch (error) {
        console.error('Error loading antiviewonce database:', error);
        return { enabled: true, groups: {}, users: {} };
    }
}

// Save database
function saveDB(data) {
    try {
        fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
        return true;
    } catch (error) {
        console.error('Error saving antiviewonce database:', error);
        return false;
    }
}

// Main command handler
export default {
    name: "antiviewonce",
    description: "Detect and retrieve view-once media automatically in DMs and groups",
    category: "utility",
    
    async execute(sock, m, args) {
        const jid = m.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const sender = m.sender;
        const db = loadDB();
        
        console.log(`🐺 [ANTIVIEWONCE] Command received from ${sender} in ${isGroup ? 'group' : 'DM'}`);
        
        // Check if user is admin in groups
        let isAdmin = false;
        if (isGroup) {
            try {
                const groupMetadata = await sock.groupMetadata(jid);
                const participant = groupMetadata.participants.find(p => p.id === sender);
                isAdmin = participant?.admin === 'admin' || participant?.admin === 'superadmin';
                console.log(`🐺 [ANTIVIEWONCE] User ${sender} is admin: ${isAdmin}`);
            } catch (error) {
                console.error('Error checking admin status:', error);
            }
        }

        // Handle commands
        if (args[0]) {
            const command = args[0].toLowerCase();
            
            if (command === 'on' || command === 'enable') {
                if (isGroup) {
                    if (!isAdmin && !m.key.fromMe) {
                        await sock.sendMessage(jid, { text: "❌ You need to be an admin to enable antiviewonce in groups." }, { quoted: m });
                        return;
                    }
                    
                    db.enabled = true;
                    db.groups[jid] = true;
                    
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "✅ *Antiviewonce Enabled*\n\nView-once media will now be automatically retrieved and saved in this group." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Enabled for group: ${jid}`);
                    } else {
                        await sock.sendMessage(jid, { text: "❌ Failed to enable antiviewonce." }, { quoted: m });
                    }
                } else {
                    db.enabled = true;
                    db.users[sender] = true;
                    
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "✅ *Antiviewonce Enabled*\n\nView-once media will now be automatically retrieved and saved in your DMs." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Enabled for user: ${sender}`);
                    } else {
                        await sock.sendMessage(jid, { text: "❌ Failed to enable antiviewonce." }, { quoted: m });
                    }
                }
                return;
                
            } else if (command === 'off' || command === 'disable') {
                if (isGroup) {
                    if (!isAdmin && !m.key.fromMe) {
                        await sock.sendMessage(jid, { text: "❌ You need to be an admin to disable antiviewonce in groups." }, { quoted: m });
                        return;
                    }
                    
                    db.enabled = true; // Keep global enabled, just disable for this group
                    delete db.groups[jid];
                    
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "❌ *Antiviewonce Disabled*\n\nView-once media will no longer be retrieved in this group." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Disabled for group: ${jid}`);
                    } else {
                        await sock.sendMessage(jid, { text: "❌ Failed to disable antiviewonce." }, { quoted: m });
                    }
                } else {
                    db.enabled = true; // Keep global enabled, just disable for this user
                    delete db.users[sender];
                    
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "❌ *Antiviewonce Disabled*\n\nView-once media will no longer be retrieved in your DMs." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Disabled for user: ${sender}`);
                    } else {
                        await sock.sendMessage(jid, { text: "❌ Failed to disable antiviewonce." }, { quoted: m });
                    }
                }
                return;
                
            } else if (command === 'status') {
                let status = 'disabled';
                if (isGroup) {
                    status = db.enabled && db.groups[jid] ? 'enabled' : 'disabled';
                } else {
                    status = db.enabled && db.users[sender] ? 'enabled' : 'disabled';
                }
                
                await sock.sendMessage(jid, { text: `📊 *Antiviewonce Status:* ${status}\n*Global Enabled:* ${db.enabled}` }, { quoted: m });
                console.log(`🐺 [ANTIVIEWONCE] Status check: ${status}`);
                return;
                
            } else if (command === 'global' && (m.key.fromMe || global.owner?.includes(sender))) {
                if (args[1] === 'on') {
                    db.enabled = true;
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "✅ *Antiviewonce Globally Enabled*\n\nView-once media will be retrieved everywhere." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Globally enabled by ${sender}`);
                    }
                } else if (args[1] === 'off') {
                    db.enabled = false;
                    if (saveDB(db)) {
                        await sock.sendMessage(jid, { text: "❌ *Antiviewonce Globally Disabled*\n\nView-once media retrieval is turned off everywhere." }, { quoted: m });
                        console.log(`🐺 [ANTIVIEWONCE] Globally disabled by ${sender}`);
                    }
                }
                return;
            }
        }

        // Show help if no valid command
        const helpText = `🐺 *Antiviewonce Command*\n
*For Groups:*
• *${global.prefix || '.'}antiviewonce on* - Enable in this group (Admin only)
• *${global.prefix || '.'}antiviewonce off* - Disable in this group (Admin only)  
• *${global.prefix || '.'}antiviewonce status* - Check status

*For Private Chats:*
• *${global.prefix || '.'}antiviewonce on* - Enable in your DMs
• *${global.prefix || '.'}antiviewonce off* - Disable in your DMs
• *${global.prefix || '.'}antiviewonce status* - Check status

*Owner Only:*
• *${global.prefix || '.'}antiviewonce global on* - Enable globally
• *${global.prefix || '.'}antiviewonce global off* - Disable globally

Current Global Status: ${db.enabled ? '✅ Enabled' : '❌ Disabled'}`;
        
        await sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
};

// Enhanced view-once media handler
export async function handleViewOnceMedia(sock, m) {
    try {
        const jid = m.key.remoteJid;
        const isGroup = jid.endsWith('@g.us');
        const sender = m.sender;
        const db = loadDB();
        
        console.log(`🐺 [ANTIVIEWONCE] Checking message from ${sender} in ${isGroup ? 'group' : 'DM'}`);
        
        // Check if antiviewonce is enabled globally
        if (!db.enabled) {
            console.log('🐺 [ANTIVIEWONCE] Global antiviewonce is disabled');
            return;
        }
        
        // Check if enabled for this specific chat
        let isEnabled = false;
        if (isGroup) {
            isEnabled = db.groups[jid];
            console.log(`🐺 [ANTIVIEWONCE] Group ${jid} enabled: ${isEnabled}`);
        } else {
            isEnabled = db.users[sender];
            console.log(`🐺 [ANTIVIEWONCE] User ${sender} enabled: ${isEnabled}`);
        }
        
        if (!isEnabled) {
            console.log('🐺 [ANTIVIEWONCE] Not enabled for this chat');
            return;
        }
        
        // Enhanced view-once detection
        let viewOnceMessage = null;
        let mediaType = '';
        
        // Check for view-once messages in different formats
        if (m.message?.viewOnceMessage) {
            viewOnceMessage = m.message.viewOnceMessage;
            console.log('🐺 [ANTIVIEWONCE] Found viewOnceMessage');
        } else if (m.message?.viewOnceMessageV2) {
            viewOnceMessage = m.message.viewOnceMessageV2;
            console.log('🐺 [ANTIVIEWONCE] Found viewOnceMessageV2');
        } else if (m.message?.viewOnceMessageV2Extension) {
            viewOnceMessage = m.message.viewOnceMessageV2Extension;
            console.log('🐺 [ANTIVIEWONCE] Found viewOnceMessageV2Extension');
        } else if (m.message?.ephemeralMessage?.message?.viewOnceMessage) {
            viewOnceMessage = m.message.ephemeralMessage.message.viewOnceMessage;
            console.log('🐺 [ANTIVIEWONCE] Found ephemeral viewOnceMessage');
        } else if (m.message?.ephemeralMessage?.message?.viewOnceMessageV2) {
            viewOnceMessage = m.message.ephemeralMessage.message.viewOnceMessageV2;
            console.log('🐺 [ANTIVIEWONCE] Found ephemeral viewOnceMessageV2');
        }
        
        if (!viewOnceMessage) {
            console.log('🐺 [ANTIVIEWONCE] No view-once message detected');
            return;
        }
        
        console.log('🐺 [ANTIVIEWONCE] View-once message detected, processing...');
        
        // Extract media from view-once message
        let mediaMessage = null;
        if (viewOnceMessage.message) {
            mediaMessage = viewOnceMessage.message;
        }
        
        if (!mediaMessage) {
            console.log('🐺 [ANTIVIEWONCE] No media message found in view-once');
            return;
        }
        
        // Determine media type and download
        let buffer, mimetype, fileName;
        
        if (mediaMessage.imageMessage) {
            mediaType = 'image';
            mimetype = mediaMessage.imageMessage.mimetype || 'image/jpeg';
            console.log('🐺 [ANTIVIEWONCE] Detected view-once image');
        } else if (mediaMessage.videoMessage) {
            mediaType = 'video';
            mimetype = mediaMessage.videoMessage.mimetype || 'video/mp4';
            console.log('🐺 [ANTIVIEWONCE] Detected view-once video');
        } else if (mediaMessage.audioMessage) {
            mediaType = 'audio';
            mimetype = mediaMessage.audioMessage.mimetype || 'audio/mpeg';
            console.log('🐺 [ANTIVIEWONCE] Detected view-once audio');
        } else if (mediaMessage.documentMessage) {
            mediaType = 'document';
            mimetype = mediaMessage.documentMessage.mimetype || 'application/octet-stream';
            fileName = mediaMessage.documentMessage.fileName || `retrieved_${Date.now()}.${getFileExtension(mediaMessage.documentMessage)}`;
            console.log('🐺 [ANTIVIEWONCE] Detected view-once document');
        } else {
            console.log('🐺 [ANTIVIEWONCE] Unknown media type in view-once message');
            return;
        }
        
        // Download the media
        console.log('🐺 [ANTIVIEWONCE] Downloading media...');
        buffer = await sock.downloadMediaMessage(m);
        
        if (!buffer) {
            console.log('🐺 [ANTIVIEWONCE] Failed to download media');
            return;
        }
        
        console.log(`🐺 [ANTIVIEWONCE] Successfully downloaded ${mediaType}, size: ${buffer.length} bytes`);
        
        // Create caption
        const context = isGroup ? `Group` : `DM`;
        const caption = `🐺 *Retrieved by WolfBot*\n\n*Sender:* ${m.pushName || 'Unknown'}\n*Type:* ${mediaType.toUpperCase()}\n*Time:* ${new Date().toLocaleString()}\n*Context:* ${context}`;
        
        const messageOptions = {
            caption: caption,
            quoted: m
        };
        
        // Send the retrieved media
        console.log(`🐺 [ANTIVIEWONCE] Sending retrieved ${mediaType}...`);
        
        switch (mediaType) {
            case 'image':
                await sock.sendMessage(jid, { image: buffer, mimetype: mimetype, ...messageOptions });
                break;
            case 'video':
                await sock.sendMessage(jid, { video: buffer, mimetype: mimetype, ...messageOptions });
                break;
            case 'audio':
                await sock.sendMessage(jid, { audio: buffer, mimetype: mimetype, ...messageOptions });
                break;
            case 'document':
                await sock.sendMessage(jid, { 
                    document: buffer, 
                    fileName: fileName,
                    mimetype: mimetype,
                    ...messageOptions 
                });
                break;
        }
        
        console.log(`🐺 [ANTIVIEWONCE] Successfully retrieved and sent ${mediaType} from ${m.pushName}`);
        
    } catch (error) {
        console.error('❌ [ANTIVIEWONCE] Error:', error);
    }
}

// Helper function to get file extension
function getFileExtension(documentMessage) {
    if (documentMessage?.fileName) {
        const parts = documentMessage.fileName.split('.');
        return parts.length > 1 ? parts.pop() : 'bin';
    }
    if (documentMessage?.mimetype) {
        const parts = documentMessage.mimetype.split('/');
        return parts.length > 1 ? parts[1] : 'bin';
    }
    return 'bin';
}