// commands/ai/gemini-enhanced.js
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

// Simple in-memory chat history
const chatHistory = new Map();

export default {
  name: "gemini",
  desc: "Silent Wolf summons Google's Gemini 🌌 (Supports images & chat memory)",
  usage: ".gemini <question> - Reply to an image with .gemini 'describe this image'\n.gemini clear - Clear chat history",
  async execute(sock, m, args) {
    const sender = m.key.remoteJid;
    const prompt = args.join(" ");
    
    // Clear history command
    if (prompt.toLowerCase() === "clear") {
      chatHistory.delete(sender);
      return sock.sendMessage(
        sender,
        { text: "🗑️ Chat history cleared!" },
        { quoted: m }
      );
    }

    if (!prompt && !m.message?.imageMessage) {
      return sock.sendMessage(
        sender,
        { 
          text: "🌌 *Silent Wolf Gemini*\n\n" +
                "Usage:\n" +
                "• *.gemini <question>* - Ask anything\n" +
                "• Reply to an image with *.gemini 'describe this'*\n" +
                "• *.gemini clear* - Clear chat history\n\n" +
                "Models: gemini-pro (text), gemini-pro-vision (images)"
        }, 
        { quoted: m }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return sock.sendMessage(
        sender,
        { text: "⚠️ Missing GEMINI_API_KEY in `.env`" },
        { quoted: m }
      );
    }

    await sock.sendPresenceUpdate('composing', sender);

    try {
      // Check if we're processing an image
      const isImage = m.message?.imageMessage || m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;
      const model = isImage ? "gemini-pro-vision" : (process.env.GEMINI_MODEL || "gemini-pro");
      
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      let contents = [];
      
      // Get chat history if exists
      if (chatHistory.has(sender)) {
        contents = [...chatHistory.get(sender)];
      }
      
      // Prepare message parts
      const messageParts = [];
      
      // Add image if present
      if (isImage) {
        try {
          // Get the image message
          const imgMsg = m.message.imageMessage || 
                         m.message.extendedTextMessage.contextInfo.quotedMessage.imageMessage;
          
          // Download image
          const stream = await sock.downloadMediaMessage({
            key: m.key,
            message: { ...m.message, ...m.message.extendedTextMessage?.contextInfo?.quotedMessage }
          });
          
          // Convert to base64
          const buffer = Buffer.from(await stream.arrayBuffer());
          const base64Image = buffer.toString('base64');
          const mimeType = imgMsg.mimetype || 'image/jpeg';
          
          messageParts.push({
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          });
        } catch (imgErr) {
          console.error("Image processing error:", imgErr);
        }
      }
      
      // Add text prompt
      if (prompt) {
        messageParts.push({ text: prompt });
      } else if (isImage) {
        // Default prompt for images if none provided
        messageParts.push({ text: "Describe this image in detail" });
      }
      
      // Add user message to contents
      contents.push({
        role: "user",
        parts: messageParts
      });
      
      const requestBody = {
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
          topP: 0.8,
          topK: 40
        }
      };
      
      if (isImage) {
        requestBody.systemInstruction = {
          parts: [{ 
            text: "You are a helpful AI assistant that can analyze images. Describe what you see accurately and in detail." 
          }]
        };
      }

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        timeout: 30000
      });

      const json = await res.json();
      
      // Handle safety blocks
      if (json.candidates?.[0]?.finishReason === "SAFETY") {
        return sock.sendMessage(
          sender,
          { text: "🚫 *Content Blocked*\nMy response was blocked by safety filters." },
          { quoted: m }
        );
      }

      let reply = json.candidates?.[0]?.content?.parts?.[0]?.text || 
                 "⚠️ No response received from Gemini.";
      
      // Add model's response to history
      contents.push({
        role: "model",
        parts: [{ text: reply }]
      });
      
      // Keep last 10 messages in history
      if (contents.length > 20) {
        contents = contents.slice(-20);
      }
      chatHistory.set(sender, contents);
      
      // Format reply
      const prefix = isImage ? "🖼️ *Gemini Vision*\n\n" : "🌌 *Silent Wolf Gemini*\n\n";
      const suffix = `\n\n💭 _Model: ${model}_ | 📝 _Tokens: ${json.usageMetadata?.totalTokenCount || "unknown"}_`;
      
      // Truncate if needed
      if (reply.length > 3500) {
        reply = reply.substring(0, 3500) + "\n\n📝 *Response truncated*";
      }

      await sock.sendMessage(
        sender,
        { text: prefix + reply + suffix },
        { quoted: m }
      );

    } catch (err) {
      console.error("Gemini Error:", err);
      
      let errorMessage = "❌ Gemini request failed.";
      if (err.name === 'TimeoutError' || err.code === 'ECONNABORTED') {
        errorMessage = "⏱️ Request timeout. Try again.";
      } else if (err.message.includes("API key")) {
        errorMessage = "🔑 Invalid API key. Check your .env file.";
      }
      
      await sock.sendMessage(
        sender,
        { text: errorMessage },
        { quoted: m }
      );
    } finally {
      await sock.sendPresenceUpdate('paused', sender);
    }
  }
};