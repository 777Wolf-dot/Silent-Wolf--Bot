// commands/ai/gemini.js
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

export default {
  name: "gemini",
  desc: "Silent Wolf summons Google's Gemini 🌌",
  usage: ".gemini <your question>",
  async execute(sock, m, args) {
    const prompt = args.join(" ");
    if (!prompt) {
      return sock.sendMessage(m.key.remoteJid, { text: "🌌 *Silent Wolf Gemini*\nUsage: *.gemini Tell me a story*" }, { quoted: m });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return sock.sendMessage(m.key.remoteJid, { text: "⚠️ Missing GEMINI_API_KEY in `.env`" }, { quoted: m });

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const json = await res.json();
      const reply = json.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Gemini gave no reply.";
      await sock.sendMessage(m.key.remoteJid, { text: `🌌 *Silent Wolf Gemini*\n\n${reply}` }, { quoted: m });

    } catch (err) {
      console.error("Gemini Error:", err);
      await sock.sendMessage(m.key.remoteJid, { text: "❌ Gemini request failed." }, { quoted: m });
    }
  }
};
