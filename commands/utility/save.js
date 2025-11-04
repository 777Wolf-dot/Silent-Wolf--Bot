import { downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";
import fs from "fs/promises";
import fsSync from "fs"; 
import path from "path";

// Define extensions based on message type
const mediaExtensions = {
  imageMessage: ".jpg",
  videoMessage: ".mp4",
  documentMessage: ".bin", 
};

// Helper function to send media synchronously (required for Baileys buffer)
const sendMediaAsync = (sock, chatId, filePath, type, caption, quotedMsg) => {
    return new Promise((resolve, reject) => {
        try {
            const mediaBuffer = fsSync.readFileSync(filePath); 
            const mediaSendObject = { caption: caption };

            // Determine the key for the send message object
            const typeKey = type.replace('Message', '');

            if (typeKey === 'document') {
                mediaSendObject.document = mediaBuffer;
                mediaSendObject.mimetype = 'application/octet-stream'; // Default MIME
                mediaSendObject.fileName = `saved_status${path.extname(filePath)}`;
            } else {
                mediaSendObject[typeKey] = mediaBuffer;
            }

            sock.sendMessage(chatId, mediaSendObject, { quoted: quotedMsg })
                .then(resolve)
                .catch(reject);
        } catch (e) {
            reject(e);
        }
    });
};


export default {
    name: "save",
    alias: ["story", "status"],
    desc: "Downloads and sends a replied-to WhatsApp Status/Post/Story.",
    category: "utility",
    usage: ".save [reply to a status/story]",

    async execute(sock, m) {
        const chatId = m.key.remoteJid;
        
        // --- Quoted Message Retrieval ---
        const contextInfo = m.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ Please reply to the **Status** you want to save.",
            }, { quoted: m });
        }
        
        // --- Status Detection ---
        // Status messages are often wrapped in viewOnceMessage or are regular media
        let mediaMessage = quotedMsg.viewOnceMessage?.message || quotedMsg.viewOnceMessageV2?.message || quotedMsg;
        
        const messageType = getContentType(mediaMessage);
        const mediaContent = mediaMessage[messageType];
        
        const isMedia = messageType in mediaExtensions;

        if (!isMedia) {
            return await sock.sendMessage(chatId, {
                text: "❌ The replied message is not a recognizable media status (Image, Video, or Document).",
            }, { quoted: m });
        }
        
        let filePath = null;

        try {
            const tempDir = path.join(process.cwd(), "tmp");
            await fs.mkdir(tempDir, { recursive: true });
            
            const fileExtension = mediaExtensions[messageType] || ".bin";
            filePath = path.join(tempDir, `saved_status_${m.key.id}${fileExtension}`);

            // 1. Send initial message
            await sock.sendMessage(chatId, { text: "⏳ Downloading status, please wait..." }, { quoted: m });
            
            // 2. Download the media file
    // Download the media file
            const typeForDownload = messageType.replace("Message", "");
            const stream = await downloadContentFromMessage(mediaContent, typeForDownload);
            const buffer = [];
            for await (const chunk of stream) {
                buffer.push(chunk);
            }
            // THIS LINE CAN BE SLOW OR FAIL SILENTLY:
            await fs.writeFile(filePath, Buffer.concat(buffer)); 

            // 3. Send the saved media back
            const originalCaption = mediaMessage.caption || mediaMessage.text || '';
            const caption = `✅ Status saved and sent!${originalCaption ? `\n\n*Original Caption:* ${originalCaption}` : ''}`;
            
            await sendMediaAsync(
                sock, 
                chatId, 
                filePath, 
                messageType, 
                caption, 
                m // reply to the original command
            );

            // --- CLEANUP ---
            if (fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
            }

        } catch (error) {
            console.error("Error in .save:", error);
            await sock.sendMessage(chatId, {
                text: `❌ Failed to save the status: ${error.message}`,
            }, { quoted: m });

            // --- CLEANUP on ERROR ---
            if (filePath && fsSync.existsSync(filePath)) {
                await fs.unlink(filePath);
            }
        }
    },
};