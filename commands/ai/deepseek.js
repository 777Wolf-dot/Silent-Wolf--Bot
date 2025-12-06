// commands/ai/deepseek.js
import fetch from "node-fetch";

export default {
  name: "deepseek",
  alias: ["ds", "deep", "seek"],
  desc: "Talk with Silent Wolf's DeepSeek AI 🐺 (Free & Powerful)",
  category: "AI",
  usage: ".deepseek <your question>",
  async execute(sock, m, args) {
    try {
      const query = args.join(" ");
      if (!query) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "🐺🌌 Silent Wolf says: What mysteries shall we explore?\n\nUsage: *.deepseek Explain quantum computing*"
        }, { quoted: m });
      }

      // Load API Key
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Silent Wolf error: No DeepSeek API key found in .env!\nGet one from: https://platform.deepseek.com/api_keys"
        }, { quoted: m });
      }

      // Call DeepSeek API
      const response = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            {
              role: "system",
              content: "You are Silent Wolf, a mysterious and wise AI assistant. Answer in a mystical yet helpful tone. Keep responses concise but meaningful."
            },
            {
              role: "user",
              content: query
            }
          ],
          stream: false,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("DeepSeek API Error:", errorText);
        throw new Error(`API returned ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let reply = data.choices?.[0]?.message?.content || "⚠️ Silent Wolf's vision is clouded... no response received.";

      // Format the reply with Silent Wolf's signature
      const wolfReply = `
🌌🐺 *Silent Wolf (DeepSeek)* 🐺🌌
━━━━━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━━━━━
🔮 *Whispered from the digital forest* 🌲✨
`;

      await sock.sendMessage(m.key.remoteJid, { text: wolfReply }, { quoted: m });

    } catch (err) {
      console.error("DeepSeek Error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ Silent Wolf lost its way in the data streams...\nError: ${err.message || "Unknown error"}`
      }, { quoted: m });
    }
  }
};