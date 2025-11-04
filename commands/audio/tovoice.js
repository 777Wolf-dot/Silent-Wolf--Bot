import { downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";
import fs from "fs/promises";
import fsSync from "fs"; 
import path from "path";

// ⚠️ NOTE: This function is a PLACEHOLDER for your actual FFmpeg conversion logic.
// When you implement the real FFmpeg conversion (e.g., using fluent-ffmpeg), 
// replace the entire contents of this function with your FFmpeg pipeline.
async function convertToVoiceNote(inputPath, outputPath) {
    return new Promise(async (resolve, reject) => {
        // --- REAL FFmpeg CODE WILL GO HERE ---
        /*
        // Example using fluent-ffmpeg:
        ffmpeg(inputPath)
            .audioCodec('libopus')
            .audioChannels(1) // Mono channel is common for VNs
            .audioFrequency(24000) // 24000 Hz sample rate is common
            .save(outputPath)
            .on('end', () => resolve(outputPath))
            .on('error', (err) => reject(new Error('FFmpeg processing error: ' + err.message)));
        */
        
        // Simulating the conversion process: Rename the input file to the output file (.ogg)
        try {
            if (!fsSync.existsSync(inputPath)) {
                return reject(new Error("Input file for conversion was not found."));
            }
            // Use the .ogg extension defined below
            await fs.rename(inputPath, outputPath); 
            resolve(outputPath);
        } catch (error) {
            reject(new Error("FFmpeg Voice Note conversion failed (Placeholder error)."));
        }
    });
}
// -------------------------------------------------------------

export default {
    name: "tovoice",
    alias: ["tovn"],
    desc: "Converts a replied audio/MP3 file into a WhatsApp Voice Note (VN).",
    category: "audio",
    usage: ".tovoice [reply to audio/MP3]",

    async execute(sock, m) {
        const chatId = m.key.remoteJid;
        
        const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ Please reply to an **Audio** or **MP3 file** to convert it to a Voice Note.",
            }, { quoted: m });
        }
        
        const messageType = getContentType(quotedMsg);
        const mediaContent = quotedMsg[messageType];
        
        const isConvertible = messageType === 'audioMessage' || 
                              (messageType === 'documentMessage' && mediaContent.mimetype.includes('audio'));

        if (!isConvertible) {
            return await sock.sendMessage(chatId, {
                text: "❌ The replied message is not a recognizable audio file.",
            }, { quoted: m });
        }
        
        let rawFilePath = null;
        let outputFilePath = null;
        
        // Helper function to send file synchronously (required for Baileys audio buffer)
        const sendFileAsync = (filePath, caption) => {
            return new Promise((resolve, reject) => {
                try {
                    const audioBuffer = fsSync.readFileSync(filePath); 
                    sock.sendMessage(chatId, {
                        audio: audioBuffer,
                        mimetype: 'audio/ogg; codecs=opus', // CRITICAL: Tells WhatsApp the file type
                        ptt: true,                          // CRITICAL: Tells WhatsApp to show it as a Voice Note
                        caption: caption,
                    }, { quoted: m }).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        };

        try {
            const tempDir = path.join(process.cwd(), "tmp");
            await fs.mkdir(tempDir, { recursive: true });
            
            rawFilePath = path.join(tempDir, `raw_vn_${m.key.id}`);
            // Voice Notes MUST be OGG/Opus format for Baileys to handle correctly
            outputFilePath = path.join(tempDir, `converted_vn_${m.key.id}.ogg`); 

            // Download and write the raw media file asynchronously
            const stream = await downloadContentFromMessage(mediaContent, messageType.replace("Message", ""));
            const buffer = [];
            for await (const chunk of stream) {
                buffer.push(chunk);
            }
            await fs.writeFile(rawFilePath, Buffer.concat(buffer));
            
            await sock.sendMessage(chatId, { text: "⏳ Converting to Voice Note, please wait..." }, { quoted: m });
            
            // --- Convert to Voice Note ---
            const finalFilePath = await convertToVoiceNote(rawFilePath, outputFilePath);

            // --- Send the final OGG/Opus file as a Voice Note ---
            await sendFileAsync(
                finalFilePath, 
                "✅ Converted to Voice Note successfully!"
            );

            // --- CLEANUP (Async) ---
            if (finalFilePath && fsSync.existsSync(finalFilePath)) {
                await fs.unlink(finalFilePath);
            }
            if (rawFilePath && fsSync.existsSync(rawFilePath)) {
                 await fs.unlink(rawFilePath);
            }

        } catch (error) {
            console.error("Error in .tovoice:", error);
            await sock.sendMessage(chatId, {
                text: `❌ Conversion to Voice Note failed: ${error.message}`,
            }, { quoted: m });

            // --- CLEANUP on ERROR (Async) ---
            if (outputFilePath && fsSync.existsSync(outputFilePath)) {
                await fs.unlink(outputFilePath);
            }
            if (rawFilePath && fsSync.existsSync(rawFilePath)) {
                await fs.unlink(rawFilePath);
            }
        }
    },
};