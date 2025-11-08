import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "../../config/autoreactstatus.json");
const reactedPath = path.join(__dirname, "../../config/reactedStatus.json");

// Ensure config files exist
if (!fs.existsSync(configPath)) {
  fs.mkdirSync(path.dirname(configPath), { recursive: true });
  fs.writeFileSync(configPath, JSON.stringify({ enabled: false, emoji: "random" }, null, 2));
}

if (!fs.existsSync(reactedPath)) {
  fs.writeFileSync(reactedPath, JSON.stringify([]));
}

function loadConfig() {
  return JSON.parse(fs.readFileSync(configPath, "utf8"));
}
function saveConfig(config) {
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
}

function loadReacted() {
  return JSON.parse(fs.readFileSync(reactedPath, "utf8"));
}
function saveReacted(data) {
  fs.writeFileSync(reactedPath, JSON.stringify(data, null, 2));
}

export default {
  name: "autoreactstatus",
  alias: ["autostatusreact", "reactstatus"],
  desc: "Toggle or configure automatic emoji reactions to WhatsApp statuses.",
  category: "Owner",

  async execute(sock, m, args) {
    const from = m.key.remoteJid;
    const config = loadConfig();
    const text = args.join(" ").trim().toLowerCase();

    // Help message
    if (!text) {
      return sock.sendMessage(
        from,
        {
          text: `🐺 *Silent Wolf - Auto React Status*\n\nStatus: *${config.enabled ? "ON ✅" : "OFF ❌"}*\nEmoji: *${config.emoji}*\n\nUsage:\n.autoreactstatus on/off\n.autoreactstatus set 😎\n.autoreactstatus set random`,
        },
        { quoted: m }
      );
    }

    // Turn ON
    if (text === "on") {
      config.enabled = true;
      saveConfig(config);
      sock.sendMessage(from, { text: "✅ AutoReactStatus is *ON* — I’ll now start reacting to statuses!" }, { quoted: m });

      startStatusListener(sock);
      return;
    }

    // Turn OFF
    if (text === "off") {
      config.enabled = false;
      saveConfig(config);
      sock.sendMessage(from, { text: "❌ AutoReactStatus is now *OFF!*" }, { quoted: m });
      return;
    }

    // Set custom emoji
    if (text.startsWith("set")) {
      const emoji = text.replace("set", "").trim();
      if (!emoji) {
        return sock.sendMessage(from, { text: "Please specify an emoji. Example:\n.autoreactstatus set 😎" }, { quoted: m });
      }
      config.emoji = emoji;
      saveConfig(config);
      return sock.sendMessage(from, { text: `✅ Reaction emoji set to *${emoji}*.` }, { quoted: m });
    }

    sock.sendMessage(from, { text: "Unknown option. Use `.autoreactstatus on/off/set`" }, { quoted: m });
  },
};

// 🧠 Auto status listener (avoids repeating)
function startStatusListener(sock) {
  const config = loadConfig();
  if (!config.enabled) return;

  const emojis = ["🔥", "😁", "💫", "😎", "🥶", "🐺", "✨", "❤️", "💖"];

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg || msg.key.remoteJid !== "status@broadcast") return;

    const conf = loadConfig();
    if (!conf.enabled) return;

    // Skip if already reacted to this message
    const reacted = loadReacted();
    if (reacted.includes(msg.key.id)) return;

    const chosenEmoji =
      conf.emoji === "random"
        ? emojis[Math.floor(Math.random() * emojis.length)]
        : conf.emoji;

    try {
      await sock.sendMessage(msg.key.remoteJid, {
        react: { text: chosenEmoji, key: msg.key },
      });
      console.log(`💫 Auto-reacted to status with ${chosenEmoji}`);

      reacted.push(msg.key.id);
      saveReacted(reacted);
    } catch (err) {
      console.error("⚠️ Failed to react to status:", err.message);
    }
  });
}
