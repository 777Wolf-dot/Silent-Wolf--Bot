import { downloadContentFromMessage, getContentType } from "@whiskeysockets/baileys";
import fs from "fs/promises"; // 💡 Changed to fs/promises for async file operations
import fsSync from "fs";      // Need fs-sync for the conversion placeholder check
import path from "path";

// ⚠️ NOTE: This function is a PLACEHOLDER for your actual FFmpeg conversion logic.
async function convertToMp3(inputPath, outputPath) {
    // 💡 If using fluent-ffmpeg, this part is entirely replaced.
    // Ensure you use the FFmpeg optimizations mentioned above (libmp3lame, -q:a 4).
    
    return new Promise(async (resolve, reject) => {
        try {
            // Simulating the conversion process: Rename the input file to the output file
            // We use fs.rename here for the async operation.
            await fs.rename(inputPath, outputPath); 
            resolve(outputPath);
        } catch (error) {
            reject(new Error("FFmpeg conversion failed (Placeholder error)."));
        }
    });
}
// -------------------------------------------------------------

export default {
    name: "toaudio",
    alias: ["tomp3"],
    desc: "Converts a replied video or voice note into a standard MP3 audio file.",
    category: "audio",
    usage: ".toaudio [reply to video/VN]",

    async execute(sock, m) {
        const chatId = m.key.remoteJid;
        
        const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
        
        if (!quotedMsg) {
            return await sock.sendMessage(chatId, {
                text: "⚠️ Please reply to a **Video** or **Voice Note** to convert it to MP3.",
            }, { quoted: m });
        }
        
        const messageType = getContentType(quotedMsg);
        const mediaContent = quotedMsg[messageType];
        
        const isConvertible = messageType === 'videoMessage' || messageType === 'audioMessage';

        if (!isConvertible) {
            return await sock.sendMessage(chatId, {
                text: "❌ The replied message is not a video or voice note.",
            }, { quoted: m });
        }
        
        let rawFilePath = null;
        let outputFilePath = null;
        
        // Use an inner function or closure to read file synchronously for sending (required by Baileys)
        const sendFileAsync = (filePath, mimetype, fileName, caption) => {
            return new Promise((resolve, reject) => {
                try {
                    const audioBuffer = fsSync.readFileSync(filePath); // Send using sync read for Baileys
                    sock.sendMessage(chatId, {
                        audio: audioBuffer,
                        mimetype: mimetype, 
                        fileName: fileName,
                        caption: caption,
                    }, { quoted: m }).then(resolve).catch(reject);
                } catch (e) {
                    reject(e);
                }
            });
        };

        try {
            const tempDir = path.join(process.cwd(), "tmp");
            // Use async mkdir
            await fs.mkdir(tempDir, { recursive: true });
            
            rawFilePath = path.join(tempDir, `raw_${m.key.id}`);
            outputFilePath = path.join(tempDir, `converted_${m.key.id}.mp3`);

            // Download and write the raw media file asynchronously
            const stream = await downloadContentFromMessage(mediaContent, messageType.replace("Message", ""));
            const buffer = [];
            for await (const chunk of stream) {
                buffer.push(chunk);
            }
            await fs.writeFile(rawFilePath, Buffer.concat(buffer)); // 💡 Async write
            
            await sock.sendMessage(chatId, { text: "⏳ Converting to MP3, please wait..." }, { quoted: m });
            
            // --- Convert to MP3 ---
            const finalFilePath = await convertToMp3(rawFilePath, outputFilePath);

            // --- Send the final MP3 file ---
            await sendFileAsync(
                finalFilePath, 
                'audio/mp4', 
                'converted.mp3', 
                "✅ Converted to MP3 successfully!"
            );

            // --- CLEANUP (Async) ---
            if (finalFilePath && fsSync.existsSync(finalFilePath)) {
                await fs.unlink(finalFilePath);
            }
            // rawFilePath should only exist if conversion failed or if it wasn't renamed
            if (rawFilePath && fsSync.existsSync(rawFilePath)) {
                 await fs.unlink(rawFilePath);
            }

        } catch (error) {
            console.error("Error in .toaudio:", error);
            await sock.sendMessage(chatId, {
                text: `❌ Conversion failed: ${error.message}`,
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