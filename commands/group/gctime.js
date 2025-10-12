export default {
  name: "gctime",
  description: "Get group creation time",
  category: "group",
  async execute(sock, m, args) {
    try {
      if (!m.chat) {
        return console.error("❌ Error: m.chat is undefined");
      }

      const metadata = await sock.groupMetadata(m.chat);
      if (!metadata || !metadata.creation) {
        await sock.sendMessage(m.chat, { text: "❌ Couldn't fetch group metadata." });
        return;
      }

      const creationTime = metadata.creation;
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

      await sock.sendMessage(m.chat, {
        text: `📅 Group was created on: *${formattedDate}*`,
      }, { quoted: m.key ? m : undefined }); // Only quote if safe
    } catch (err) {
      console.error("❌ Error in gctime:", err);
      if (m.chat) {
        await sock.sendMessage(m.chat, { text: "❌ Failed to get group creation time." });
      }
    }
  },
};
