// commands/ai/gpt.js
import fetch from "node-fetch";

export default {
  name: "gpt",
  alias: ["chatgpt", "wolfgpt"],
  desc: "Talk with Silent Wolf's GPT AI 🐺",
  category: "AI",
  usage: ".gpt <your question>",
  async execute(sock, m, args) {
    try {
      const query = args.join(" ");
      if (!query) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "🐺✨ Silent Wolf says: What do you want me to think about?\n\nUsage: *.gpt Who created you?*"
        }, { quoted: m });
      }

      // Load API Key
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        return sock.sendMessage(m.key.remoteJid, {
          text: "⚠️ Silent Wolf error: No API key found in .env!"
        }, { quoted: m });
      }

      // Call OpenAI
      const response = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: query
        })
      });

      const data = await response.json();
      let reply = data.output?.[0]?.content?.[0]?.text || "⚠️ Silent Wolf could not fetch a reply...";

      const wolfReply = `
🌑🌲 *Silent Wolf GPT* 🌲🌑
━━━━━━━━━━━━━━
${reply}
━━━━━━━━━━━━━━
🐺✨ *Silent Wolf at your service* ✨🐺
`;

      await sock.sendMessage(m.key.remoteJid, { text: wolfReply }, { quoted: m });

    } catch (err) {
      console.error("GPT Error:", err);
      await sock.sendMessage(m.key.remoteJid, {
        text: "❌ Silent Wolf stumbled in the forest... try again!"
      }, { quoted: m });
    }
  }
};
