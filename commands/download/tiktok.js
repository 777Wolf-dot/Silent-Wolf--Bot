


import axios from "axios";

const processedMessages = new Set();


async function tiktokCommand(sock, message) {
  try {
    // 1️⃣ Safely get chat ID
    const chatId = typeof message.key?.remoteJid === "string"
      ? message.key.remoteJid
      : typeof message.from === "string"
      ? message.from
      : null;

    if (!chatId) return console.log("Cannot process message: chatId undefined");

    // 2️⃣ Prevent duplicate processing
    const msgId = message.key?.id;
    if (!msgId || processedMessages.has(msgId)) return;
    processedMessages.add(msgId);
    setTimeout(() => processedMessages.delete(msgId), 5 * 60 * 1000); // 5 min

    // 3️⃣ Extract text
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text;
    if (!text) return await sock.sendMessage(chatId, { text: "Please provide a TikTok video link." });

    // 4️⃣ Extract URL from command
    let url = text.split(" ").slice(1).join(" ").trim();
    if (!url) return await sock.sendMessage(chatId, { text: "Please provide a TikTok video link." });

    // 5️⃣ Resolve short URLs (tiktok short links)
    try {
      const headResp = await axios.head(url, { maxRedirects: 0, validateStatus: s => s >= 200 && s < 400 });
      if ([301, 302].includes(headResp.status)) url = headResp.headers.location;
    } catch (err) {
      if ([301, 302].includes(err.response?.status)) url = err.response.headers.location;
    }

    if (!url.includes("tiktok.com")) {
      return await sock.sendMessage(chatId, { text: "Invalid TikTok link." });
    }

    // 6️⃣ Optional reaction
    await sock.sendMessage(chatId, { react: { text: "🔄", key: message.key } });

    // 7️⃣ Fetch video from TikDown API
    const apiUrl = `https://api.tikdown.org/api/download?url=${encodeURIComponent(url)}`;
    const apiResp = await axios.get(apiUrl);

    const videoUrl = apiResp.data?.video?.no_watermark;
    if (!videoUrl) return await sock.sendMessage(chatId, { text: "Could not fetch TikTok video." });

    // 8️⃣ Download video buffer
    const videoBuffer = Buffer.from((await axios.get(videoUrl, { responseType: "arraybuffer" })).data);

    // 9️⃣ Send video
    await sock.sendMessage(chatId, {
      video: videoBuffer,
      mimetype: "video/mp4",
      fileName: "tiktok_video.mp4",
      caption: "🎬 TikTok Video"
    }, { quoted: message });

  } catch (error) {
    console.error("TikTok command error:", error);

    const chatId = typeof message.key?.remoteJid === "string"
      ? message.key.remoteJid
      : typeof message.from === "string"
      ? message.from
      : null;

    if (chatId) {
      await sock.sendMessage(chatId, { text: "❌ Failed to download TikTok video. Check the link or try again later." });
    }
  }
}

export default {
  name: "tiktok",
  description: "Download TikTok video",
  category: "download",
  execute: tiktokCommand
};
