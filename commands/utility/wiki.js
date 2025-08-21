import fetch from "node-fetch";

export default {
  name: "wiki",
  alias: ["wikipedia"],
  category: "tools",
  desc: "Search Wikipedia and get a brief summary",
  execute: async (sock, msg, args) => {
    try {
      const chatId = msg.key.remoteJid;

      // Determine the search term
      let searchTerm = args.join(" ").trim();

      // Check if it's a reply
      const quoted = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      if (!searchTerm && quoted) {
        searchTerm =
          quoted.conversation ||
          quoted.extendedTextMessage?.text ||
          quoted.imageMessage?.caption ||
          quoted.videoMessage?.caption ||
          "";
      }

      if (!searchTerm) {
        return await sock.sendMessage(chatId, {
          text: "⚠️ Usage: .wiki <search term>\nOr reply to a message with .wiki",
          quoted: msg
        });
      }

      // Special default for "Silent Wolf"
      if (searchTerm.toLowerCase() === "silent wolf") {
        return await sock.sendMessage(chatId, {
          text: "🐺 *Silent Wolf* — The Alpha of Bots!\n\n🌟 He outshined Meiser Hex, one of the greatest bots ever — bow down and fear the legend! 😎",
          quoted: msg
        });
      }

      // Fetch from Wikipedia API
      const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(searchTerm)}`);
      if (!response.ok) throw new Error("Article not found");

      const data = await response.json();

      const resultMessage = `
🌐 *Wikipedia Search Result*

📌 *Title:* ${data.title}
📝 *Description:* ${data.description || "N/A"}
📄 *Summary:* ${data.extract}

🔗 [Read More](${data.content_urls?.desktop?.page || "https://en.wikipedia.org/wiki/" + encodeURIComponent(searchTerm)})
      `;

      await sock.sendMessage(chatId, { text: resultMessage, quoted: msg, linkPreview: true });

    } catch {
      // Friendly error message for WhatsApp
      await sock.sendMessage(msg.key.remoteJid, {
        text: "❌ Could not find a Wikipedia article for your search term. Please try another keyword.",
        quoted: msg
      });
    }
  }
};
