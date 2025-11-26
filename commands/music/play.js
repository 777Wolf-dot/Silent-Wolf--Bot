import playdl from "play-dl";

export default {
  name: "play",
  alias: ["music"],
  category: "fun",
  desc: "Plays requested music",
  use: "<song name>",

  execute: async (sock, m, args) => {
    const jid = m.key.remoteJid;
    if (!args.length) return await sock.sendMessage(jid, { text: "🐺 Please provide a song name!" }, { quoted: m });

    try {
      // Search YouTube
      const query = args.join(" ");
      const results = await playdl.search(query, { limit: 1 });
      if (!results.length) return await sock.sendMessage(jid, { text: "❌ No results found!" }, { quoted: m });

      const song = results[0];

      // Get audio stream
      const stream = await playdl.stream(song.url);

      await sock.sendMessage(
        jid,
        {
          audio: stream.stream,
          mimetype: "audio/mpeg",
          fileName: `${song.title}.mp3`,
          caption: `🐺 Here’s your tune: ${song.title}`
        },
        { quoted: m }
      );
    } catch (err) {
      console.error("❌ Play command error:", err);
      await sock.sendMessage(jid, { text: `🐺 Could not fetch your song.\nError: ${err.message}` }, { quoted: m });
    }
  }
};
