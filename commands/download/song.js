import yts from 'yt-search';
import axios from 'axios';

export default {
  name: 'song',
  description: 'Download a song from YouTube as MP3',
  category: 'download',
  async execute(sock, msg, args) {
    const chatId = msg.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(chatId, { 
        text: "❌ Please provide a song name." 
      }, { quoted: msg });
    }

    const searchQuery = args.join(' ').trim();

    try {
      // Search YouTube
      const { videos } = await yts(searchQuery);
      if (!videos || videos.length === 0) {
        return await sock.sendMessage(chatId, { 
          text: "⚠️ No songs found!" 
        }, { quoted: msg });
      }

      const video = videos[0];

      // Notify user
      await sock.sendMessage(chatId, {
  text: "_⏳ Your song is being prepared, this may take a few seconds..._"
}, { quoted: msg });


      // Fetch MP3 from API
      const { data } = await axios.get(`https://apis.davidcyriltech.my.id/youtube/mp3?url=${video.url}`);
      if (!data?.status || !data?.result?.downloadUrl) {
        return await sock.sendMessage(chatId, { text: "⚠️ Failed to fetch audio from API." }, { quoted: msg });
      }

      const audioUrl = data.result.downloadUrl;
      const title = data.result.title.replace(/[^a-zA-Z0-9 ]/g, '');

      // Send MP3 to user
      await sock.sendMessage(chatId, {
        audio: { url: audioUrl },
        mimetype: "audio/mpeg",
        fileName: `${title}.mp3`
      }, { quoted: msg });

    } catch (err) {
      console.error('Error in song command:', err);
      await sock.sendMessage(chatId, { 
        text: "⚠️ Download failed. Try again later." 
      }, { quoted: msg });
    }
  }
};
