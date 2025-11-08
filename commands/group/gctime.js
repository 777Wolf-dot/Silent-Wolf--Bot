export default {
  name: "gctime",
  description: "Get group creation time",
  category: "group",
  async execute(sock, m, args) {
    try {
      // Get chat ID safely
      const chatId = m.key?.remoteJid;
      if (!chatId) {
        console.error("❌ Error: chatId is undefined");
        return;
      }

      // Only works for group chats
      if (!chatId.endsWith("@g.us")) {
        await sock.sendMessage(chatId, { text: "❌ This command works only in groups." }, { quoted: m });
        return;
      }

      // Fetch group metadata
      const metadata = await sock.groupMetadata(chatId);
      if (!metadata?.creation) {
        await sock.sendMessage(chatId, { text: "❌ Couldn't fetch group metadata." }, { quoted: m });
        return;
      }

      // Format creation time
      const creationTime = metadata.creation; // Unix timestamp (seconds)
      const date = new Date(creationTime * 1000);
      const formattedDate = date.toLocaleString("en-KE", {
        timeZone: "Africa/Nairobi",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

      // Send result
      await sock.sendMessage(chatId, {
        text: `📅 Group was created on: *${formattedDate}*`,
      }, { quoted: m });

    } catch (err) {
      console.error("❌ Error in gctime:", err);
      const chatId = m.key?.remoteJid;
      if (chatId) {
        await sock.sendMessage(chatId, { text: "❌ Failed to get group creation time." }, { quoted: m });
      }
    }
  },
};
