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
  name: "song",
  alias: ["play", "music"],
  category: "fun",
  desc: "WolfBot fetches and sends the requested song",
  use: "<song name>",

  execute: async (sock, m, args) => {
    const { top, bottom } = pickBorder();
    const jid = m.key.remoteJid;

    if (!args.length) {
      return await sock.sendMessage(jid, {
        text: `${top}\n🐺 Alpha, which tune shall I fetch?\nUsage: .song <song name>\n${bottom}`
      }, { quoted: m });
    }

    const query = args.join(" ");
    let tempPath = null;

    try {
      // Step 1: Notify user
      await sock.sendMessage(jid, {
        text: `${top}\n🐺 Fetching your song… This may take a few moments ⏳\n${bottom}`
      }, { quoted: m });

      // Step 2: Prepare temporary path
      const safeTitle = query.replace(/[\/\\:*?"<>|]/g, "").slice(0, 40);
      const uniqueSuffix = Date.now() + Math.floor(Math.random() * 1000);
      tempPath = path.join(tmpdir(), `${safeTitle}_${uniqueSuffix}.webm`);

      // Step 3: Download audio using yt-dlp (raw, no conversion)
      await execa("yt-dlp", [
        "-f", "bestaudio",
        "--output", tempPath,
        `ytsearch1:${query}`
      ]);

      // Step 4: Send audio to WhatsApp
      await sock.sendMessage(
        jid,
        {
          audio: fs.readFileSync(tempPath),
          mimetype: 'audio/webm',
          fileName: `${safeTitle}.webm`,
          caption: `${top}\n🐺 Here’s your requested song: "${query}"\n${bottom}`
        },
        { quoted: m }
      );

    } catch (err) {
      console.error("❌ Song command error:", err);
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
