import pkg from "@whiskeysockets/baileys";
const { delay } = pkg; 

import settings from '../../settings.js'; 

// --- Configuration from settings.js ---
const OWNER_NUMBER_BASE = settings.ownerNumber; // e.g., '254712345678'
const OWNER_JID_SUFFIX = '@s.whatsapp.net';
const OWNER_JID = `${OWNER_NUMBER_BASE}${OWNER_JID_SUFFIX}`;
// --------------------------------------

// Function to normalize JID: Strips LIDs and device suffixes, leaving only the base number JID.
const normalizeJid = (jid) => {
    if (!jid) return '';
    // This handles: 1234567890@s.whatsapp.net:123456 -> 1234567890@s.whatsapp.net
    let base = jid.split('@')[0].split(':')[0];
    return `${base.trim()}${OWNER_JID_SUFFIX}`;
};

export default {
    name: "autotype",
    alias: ["type"],
    desc: "Simulates typing in the current chat for a duration or toggles it ON/OFF (Owner only).",
    category: "owner",
    usage: ".autotype <seconds | on | off>",

    async execute(sock, m, args) {
        const chatId = m.key.remoteJid;
        
        // --- Owner Authorization Check (Robust) ---
        // participant for groups, remoteJid for DMs.
        const senderJid = m.key.participant || m.key.remoteJid; 
        
        const normalizedSender = normalizeJid(senderJid);
        const normalizedOwnerJid = normalizeJid(OWNER_JID); 
        
        if (normalizedSender !== normalizedOwnerJid) {
            // Use the generic reply defined in settings for consistency
            return await sock.sendMessage(chatId, {
                text: settings.ownerOnlyReply,
            }, { quoted: m });
        }

        const input = args[0]?.toLowerCase();

        // ------------------------------------
        // MODE 1: PERMANENT TOGGLE (ON/OFF)
        // ------------------------------------
        if (input === 'on' || input === 'off') {
            const presenceState = input === 'on' ? 'composing' : 'paused';
            const actionText = input === 'on' ? 'started' : 'stopped';
            
            // Send the presence update
            await sock.sendPresenceUpdate(presenceState, chatId);
            
            return await sock.sendMessage(chatId, { 
                text: `✅ Permanent typing simulation ${actionText}.` 
            }, { quoted: m });
        }

        // ------------------------------------
        // MODE 2: TIMED DURATION (e.g., .autotype 15)
        // ------------------------------------
        const durationInSeconds = parseInt(input);

        if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ Please specify a valid duration in seconds (e.g., `.autotype 15`) OR use `.autotype on` / `.autotype off`.",
            }, { quoted: m });
        }
        
        const durationInMs = durationInSeconds * 1000;

        // 1. Send the 'Typing' presence update
        await sock.sendPresenceUpdate('composing', chatId);
        
        await sock.sendMessage(chatId, { 
            text: `⏳ Simulating typing for ${durationInSeconds} seconds...` 
        }, { quoted: m });

        // 2. Wait for the specified duration
        await delay(durationInMs);

        // 3. Send the 'Paused' presence update (stops typing)
        await sock.sendPresenceUpdate('paused', chatId);
        
        await sock.sendMessage(chatId, { 
            text: `✅ Timed typing simulation complete.` 
        }, { quoted: m });
    },
};