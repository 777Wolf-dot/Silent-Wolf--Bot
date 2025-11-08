// ipinfo.js
import axios from "axios";

/**
 * ipinfo.js
 * Usage:
 *   .ipinfo                -> info about the bot/server IP
 *   .ipinfo 8.8.8.8        -> info about that IP
 *   .ipinfo example.com    -> info about domain (ipinfo will resolve)
 *   .ipinfo 8.8.8.8 --raw  -> return full JSON (may be long)
 *
 * Requires optional environment variable:
 *   IPINFO_TOKEN=your_token_here
 *
 * Example:
 *   export IPINFO_TOKEN="abc123"
 */

const MAX_TEXT_LEN = 1500; // WhatsApp safe length for a single message body

function chatIdFromMsg(m) {
  return m?.key?.remoteJid || null;
}

function prettyOutput(obj) {
  // Flatten some commonly useful fields and present them pretty
  const parts = [];
  if (obj.ip) parts.push(`🔹 IP: ${obj.ip}`);
  if (obj.hostname) parts.push(`🔹 Hostname: ${obj.hostname}`);
  if (obj.city || obj.region || obj.country) {
    const place = [obj.city, obj.region, obj.country].filter(Boolean).join(", ");
    parts.push(`📍 Location: ${place}`);
  }
  if (obj.loc) parts.push(`📌 Coordinates: ${obj.loc} (lat,long)`);
  if (obj.org) parts.push(`🏢 Org: ${obj.org}`);
  if (obj.postal) parts.push(`🔢 Postal: ${obj.postal}`);
  if (obj.timezone) parts.push(`⏰ Timezone: ${obj.timezone}`);
  if (obj.readme) parts.push(`ℹ️ Info: ${obj.readme}`);
  if (obj.country) {
    // quick Google Maps link for location if loc exists
    if (obj.loc) {
      parts.push(`🗺 Map: https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(obj.loc)}`);
    }
  }
  return parts.join("\n");
}

export default {
  name: "ipinfo",
  alias: ["ip", "geoip"],
  category: "network",
  desc: "Get IP / geolocation information using ipinfo.io",
  use: "<ip|domain> [--raw]",
  execute: async (sock, m, args) => {
    const chatId = chatIdFromMsg(m);
    if (!chatId) {
      console.error("ipinfo: chatId is undefined");
      return;
    }

    // parse args and flags
    const flags = args.filter(a => a.startsWith("--")).map(f => f.toLowerCase());
    const raw = flags.includes("--raw");
    const target = args.find(a => !a.startsWith("--")) || "json";

    const token = process.env.IPINFO_TOKEN; // optional

    // Build request URL
    const url = target === "json" ? `https://ipinfo.io/json` : `https://ipinfo.io/${encodeURIComponent(target)}/json`;
    const requestUrl = token ? `${url}?token=${encodeURIComponent(token)}` : url;

    try {
      await sock.sendMessage(chatId, {
        text: `🔎 Fetching info for: *${target === "json" ? "server IP" : target}* — please wait…`
      }, { quoted: m });

      const res = await axios.get(requestUrl, { timeout: 15000 });
      const data = res.data;

      if (!data || typeof data !== "object") {
        return await sock.sendMessage(chatId, { text: "❌ No data returned from ipinfo." }, { quoted: m });
      }

      if (raw) {
        // send full JSON but trim to safe size
        const jsonStr = JSON.stringify(data, null, 2);
        const safe = jsonStr.length > MAX_TEXT_LEN ? jsonStr.slice(0, MAX_TEXT_LEN) + "\n\n...truncated..." : jsonStr;
        return await sock.sendMessage(chatId, { text: `\`\`\`json\n${safe}\n\`\`\`` }, { quoted: m });
      }

      // Pretty summary
      const summary = prettyOutput(data) || "No readable fields returned.";
      const jsonSnippet = JSON.stringify(data, null, 2).slice(0, 600); // small snippet if user wants details

      let message = `🔎 *IPINFO: ${target === "json" ? "server IP" : target}*\n\n${summary}\n\n\`\`\`json\n${jsonSnippet}${jsonSnippet.length >= 600 ? "\n...truncated..." : ""}\n\`\`\``;

      if (message.length > MAX_TEXT_LEN) message = message.slice(0, MAX_TEXT_LEN - 20) + "\n\n...truncated...";

      await sock.sendMessage(chatId, { text: message }, { quoted: m });

    } catch (err) {
      console.error("ipinfo error:", err?.message || err);
      let errMsg = err?.response?.data?.error || err?.message || String(err);
      // friendly user message
      await sock.sendMessage(chatId, {
        text: `❌ Failed to fetch ipinfo for *${target}*.\nError: ${errMsg}\n\nTip: Set IPINFO_TOKEN env var for higher rate limits.`
      }, { quoted: m });
    }
  },
};
