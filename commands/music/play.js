import fs from "fs";
import path from "path";
import { tmpdir } from "os";
import { execa } from "execa";

// Simple WolfBot borders
const borders = [
  { top: '╔══════════╗', bottom: '╚══════════╝' },
  { top: '┏━━━━━━━━━━┓', bottom: '┗━━━━━━━━━━┛' },
];

function pickBorder() {
  return borders[Math.floor(Math.random() * borders.length)];
}

export default {
  name: "play",
  alias: ["music", "song"],
  category: "fun",
  desc: "WolfBot mocks you first, then plays the requested music",
  use: "<song name>",

  execute: async (sock, m, args) => {
    const { top, bottom } = pickBorder();
    const jid = m.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(jid, {
        text: `${top}\n🐺 Alpha, which tune shall I fetch?\nUsage: .play <song name>\n${bottom}`
      }, { quoted: m });
    }

    const query = args.join(" ");
    let tempPath = null;

    try {
      // Step 1: Notify user
      await sock.sendMessage(jid, {
        text: `${top}\n🐺 Summoning your melody… This may take a few moments ⏳\n${bottom}`
      }, { quoted: m });

      // Step 2: Download audio using yt-dlp
      const safeTitle = query.replace(/[\/\\:*?"<>|]/g, "").slice(0, 40);
      const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
      tempPath = path.join(tmpdir(), `${safeTitle}_${uniqueSuffix}.mp3`);

      // yt-dlp command to fetch best audio as mp3
      await execa("yt-dlp", [
        "-x",
        "--audio-format", "mp3",
        "--output", tempPath,
        `ytsearch1:${query}` // searches YouTube and downloads first result
      ]);

      // Step 3: Send audio with caption
      await sock.sendMessage(
        jid,
        {
          audio: fs.readFileSync(tempPath),
          mimetype: 'audio/mpeg',
          fileName: `${safeTitle}.mp3`,
          caption: `${top}\n🐺 Here’s your requested tune: "${query}"\n${bottom}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Play command error:", err);
      await sock.sendMessage(jid, {
        text: `${top}\n🐺 Something went wrong, Alpha…\nError: ${err.message}\n${bottom}`
      }, { quoted: m });
    } finally {
      if (tempPath && fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
        console.log("🧹 Temporary audio deleted.");
      }
    }
  },
};
