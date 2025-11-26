import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { execa } from "execa";

const borders = [
  { top: '╔══════════╗', bottom: '╚══════════╝' },
  { top: '┏━━━━━━━━━━┓', bottom: '┗━━━━━━━━━━┛' },
];

function pickBorder() {
  return borders[Math.floor(Math.random() * borders.length)];
}

export default {
  name: "song",
  alias: ["playaudio"],
  category: "fun",
  desc: "WolfBot plays the requested song directly in chat",
  use: "<song name>",

  execute: async (sock, m, args) => {
    const { top, bottom } = pickBorder();
    const jid = m.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(jid, {
        text: `${top}\n🐺 Alpha, which tune shall I play?\nUsage: .song <song name>\n${bottom}`
      }, { quoted: m });
    }

    const query = args.join(" ");
    let tempPath = null;

    try {
      await sock.sendMessage(jid, {
        text: `${top}\n🐺 Fetching your audio… ⏳\n${bottom}`
      }, { quoted: m });

      const safeTitle = query.replace(/[\/\\:*?"<>|]/g, "").slice(0, 40);
      const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
      tempPath = path.join(tmpdir(), `${safeTitle}_${uniqueSuffix}.mp3`);

      await execa("yt-dlp", [
        "-x",
        "--audio-format", "mp3",
        "--output", tempPath,
        `ytsearch1:${query}`
      ]);

      // Send as AUDIO (playable in chat)
      await sock.sendMessage(
        jid,
        {
          audio: fs.readFileSync(tempPath),
          mimetype: 'audio/mpeg',
          ptt: false,
          caption: `${top}\n🐺 Here’s your requested tune: "${query}"\n${bottom}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Song command error:", err);
      await sock.sendMessage(jid, {
        text: `${top}\n🐺 Something went wrong, Alpha…\nError: ${err.message}\n${bottom}`
      }, { quoted: m });
    } finally {
      if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    }
  },
};
