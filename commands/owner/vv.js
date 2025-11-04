import { BOT_NAME, COMMAND_PREFIX } from '../../settings.js'; 

export default {
    name: "vv",
    alias: ["viewonce", "readonce"],
    category: "Utility",
    desc: `Downloads and displays a View Once message as a permanent media reply. Usage: Reply to the message with ${COMMAND_PREFIX}vv`,
    use: `Reply to a View Once message with ${COMMAND_PREFIX}vv`,

    execute: async (client, msg, args) => {
        const jid = msg.key.remoteJid;
        
        const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return client.sendMessage(jid, { 
                text: `❌ *${BOT_NAME} Error:* Please reply to the **View Once** message you want to view, Alpha.`
            }, { quoted: msg });
        }

        let mediaPayload = null;

        // 1. **Robust Detection** Check for known view-once containers
        if (quotedMsg.viewOnceMessage) {
            // Baileys structure for older view-once
            mediaPayload = quotedMsg.viewOnceMessage.message;
        } else if (quotedMsg.viewOnceMessageV2) {
            // Baileys structure for newer view-once
            mediaPayload = quotedMsg.viewOnceMessageV2.message;
        } 
        
        // Final check: Did we successfully extract the inner media object?
        const isViewOnce = mediaPayload && 
                           (mediaPayload.imageMessage || 
                            mediaPayload.videoMessage || 
                            mediaPayload.audioMessage);
        
        if (!isViewOnce) {
            return client.sendMessage(jid, { 
                text: `❌ *${BOT_NAME} Error:* That doesn't look like a View Once message. It's either a standard message or an unknown media format.`
            }, { quoted: msg });
        }

        // The actual media object is now inside mediaPayload
        const media = mediaPayload; 

        // 2. Identify Media Type
        let type;
        if (media.imageMessage) type = 'imageMessage';
        else if (media.videoMessage) type = 'videoMessage';
        else if (media.audioMessage) type = 'audioMessage';
        else {
             return client.sendMessage(jid, { 
                text: `❌ *${BOT_NAME} Error:* Unsupported view-once media type found inside the container.`
            }, { quoted: msg });
        }

        await client.sendMessage(jid, { 
            text: `*${BOT_NAME}* is retrieving the media...`
        }, { quoted: msg });

        try {
            // 3. Download the media buffer (Adjust this function if not using Baileys)
            const buffer = await client.downloadMediaMessage(media); 
            
            // 4. Prepare the message payload for permanent re-sending
            let sendPayload = {};
            let mimeType = media[type].mimetype;

            if (type === 'imageMessage') {
                sendPayload = { image: buffer, caption: `👁️‍🗨️ View Once Media retrieved by ${BOT_NAME}.` };
            } else if (type === 'videoMessage') {
                sendPayload = { video: buffer, caption: `👁️‍🗨️ View Once Media retrieved by ${BOT_NAME}.` };
            } else if (type === 'audioMessage' && mimeType.includes('ogg')) {
                // Treat OGG audio as a Voice Note (PTT)
                sendPayload = { audio: buffer, ptt: true };
            } else {
                 sendPayload = { audio: buffer };
            }
            
            // 5. Send the media back as a reply to the original command message
            await client.sendMessage(jid, sendPayload, { quoted: msg });

        } catch (error) {
            console.error("View Once Download Error:", error);
            await client.sendMessage(jid, { 
                text: `❌ *${BOT_NAME} Snarls:* Could not process the View Once message. It may have already been viewed or the media key is corrupted. Error: ${error.message}` 
            }, { quoted: msg });
        }
    }
};