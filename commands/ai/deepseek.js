// commands/ai/deepseek.js
import dotenv from "dotenv";
dotenv.config();
import fetch from "node-fetch";

export default {
  name: "deepseek",
  desc: "Silent Wolf communes with DeepSeek 🐾 for logic, code, and wisdom.",
  usage: ".deepseek <your prompt>",
  async execute(sock, m, args) {
    const prompt = args.join(" ");
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!prompt)
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "🐺 *Silent Wolf DeepSeek*\nUsage: `.deepseek Explain recursion.`" },
        { quoted: m }
      );

    if (!apiKey)
      return sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠️ Missing `DEEPSEEK_API_KEY` in `.env` file!" },
        { quoted: m }
      );

    const models = [
      { name: "deepseek-chat", endpoint: "https://api.deepseek.com/v1/chat/completions" },
      { name: "deepseek-coder", endpoint: "https://api.deepseek.com/v1/completions" },
      { name: "deepseek-reasoner", endpoint: "https://api.deepseek.com/v1/chat/completions" }
    ];

    let reply = null;

    for (const model of models) {
      try {
        const res = await fetch(model.endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: model.name,
            messages: [
              {
                role: "system",
                content:
                  "You are Silent Wolf’s DeepSeek — a wise and calm coding and reasoning assistant. Always reply with clarity and detail.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.7
          })
        });

        const data = await res.json();
        console.log("DeepSeek Raw Response:", data); // For debugging

        reply =
          data?.choices?.[0]?.message?.content ||
          data?.output_text ||
          data?.text ||
          null;

        if (reply) break; // Stop if we got a valid response
      } catch (err) {
        console.error(`DeepSeek Model ${model.name} Error:`, err);
      }
    }

    if (!reply) reply = "⚠️ DeepSeek returned no response.";

    await sock.sendMessage(
      m.key.remoteJid,
      {
        text: `🐾 *Silent Wolf DeepSeek*\n\n${reply}\n\n🌘 *— Whisper of the Code.*`,
      },
      { quoted: m }
    );
  },
};
