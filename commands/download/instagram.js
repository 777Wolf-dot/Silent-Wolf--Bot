import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "tiktokdl",
  alias: ["ttdl", "tiktok"],
  desc: "Download TikTok videos without watermark 🐺",
  category: "Downloader",
  async execute(sock, m, args) {
    try {
      if (!args[0]) {
        return await sock.sendMessage(m.chat, { text: "⚠️ Please provide a TikTok video URL." }, { quoted: m });
      }

      const url = args[0];
      await sock.sendMessage(m.chat, { text: "🐺 Fetching your TikTok video..." }, { quoted: m });

      // ✅ Use a reliable API
      const apiUrl = `https://api.tiklydown.me/api/download?url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(apiUrl);

      if (!data || !data.video || !data.video.noWatermark) {
        return await sock.sendMessage(m.chat, { text: "❌ Failed to fetch video. Try another link." }, { quoted: m });
      }

      const videoUrl = data.video.noWatermark;
      const videoPath = path.join(__dirname, "tiktok.mp4");

      // ✅ Download video buffer
      const response = await axios.get(videoUrl, { responseType: "arraybuffer" });
      fs.writeFileSync(videoPath, response.data);

      // ✅ Send as video message
      await sock.sendMessage(
        m.chat,
        {
          video: fs.readFileSync(videoPath),
          caption: `🎬 *TikTok Downloader*\n🐺 Silent Wolf processed your request.`,
        },
        { quoted: m }
      );

      // Clean up
      fs.unlinkSync(videoPath);
    } catch (err) {
      console.error("TikTokDL Error:", err);
      await sock.sendMessage(
        m.chat,
        { text: `❌ Error fetching TikTok video.\n\n${err.message}` },
        { quoted: m }
      );
    }
  },
};
