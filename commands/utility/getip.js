// // commands/utility/getip.js
// import fetch from 'node-fetch';

// export default {
//   name: 'getip',
//   alias: ['myip'],
//   description: '🌐 Get the public IP of the bot/server',
//   category: 'utility',
//   usage: '.getip',

//   async execute(sock, m, args, from, isGroup, sender) {
//     const jid = typeof from === 'string' ? from : m.key.remoteJid;

//     try {
//       const response = await fetch('https://api.ipify.org?format=json');
//       const data = await response.json();

//       const ipText = `🌐 Bot Public IP: ${data.ip}`;
//       await sock.sendMessage(jid, { text: ipText }, { quoted: m });

//     } catch (error) {
//       console.error('[GetIP Error]', error);
//       await sock.sendMessage(jid, { text: '❌ Failed to fetch public IP. Please try again later.' }, { quoted: m });
//     }
//   },
// };































// getip.js
import axios from "axios";

/**
 * getip.js
 *
 * Usage:
 *   .getip 1.2.3.4         -> geo/IP info for that IP
 *   .getip example.com     -> ipinfo for domain (ipinfo resolves)
 *   (reply to a contact or mention them) .getip  -> shows contact JID/phone/profile (NO IP)
 *
 * Notes:
 *  - This command will NOT attempt to discover or expose other people's IP addresses.
 *  - If you want to check an IP or domain, paste it as an argument.
 *  - Optional env var: IPINFO_TOKEN for higher rate limits.
 */

const MAX_TEXT_LEN = 1500;

function chatIdFromMsg(m) {
  return m?.key?.remoteJid || null;
}

function extractMentionedJids(m) {
  try {
    const ctx = m?.message?.extendedTextMessage?.contextInfo;
    if (!ctx) return [];
    return ctx.mentionedJid || [];
  } catch (e) {
    return [];
  }
}

function isIPorDomain(input) {
  if (!input) return false;
  input = input.trim();
  // simple IPv4/IPv6 heuristics
  const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
  const ipv6 = /^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$/;
  const domain = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return ipv4.test(input) || ipv6.test(input) || domain.test(input) || /^https?:\/\//i.test(input);
}

async function fetchIpinfo(target) {
  const token = process.env.IPINFO_TOKEN;
  const url = target === "json"
    ? `https://ipinfo.io/json${token ? `?token=${encodeURIComponent(token)}` : ""}`
    : `https://ipinfo.io/${encodeURIComponent(target)}/json${token ? `?token=${encodeURIComponent(token)}` : ""}`;
  const res = await axios.get(url, { timeout: 15000 });
  return res.data;
}

function prettyIpinfo(obj) {
  if (!obj || typeof obj !== "object") return "No data";
  const parts = [];
  if (obj.ip) parts.push(`🔹 IP: ${obj.ip}`);
  if (obj.hostname) parts.push(`🔹 Hostname: ${obj.hostname}`);
  if (obj.org) parts.push(`🏢 Org: ${obj.org}`);
  if (obj.city || obj.region || obj.country) {
    const place = [obj.city, obj.region, obj.country].filter(Boolean).join(", ");
    parts.push(`📍 Location: ${place}`);
  }
  if (obj.loc) parts.push(`📌 Coordinates: ${obj.loc}`);
  if (obj.timezone) parts.push(`⏰ Timezone: ${obj.timezone}`);
  if (obj.postal) parts.push(`🔢 Postal: ${obj.postal}`);
  if (obj.readme) parts.push(`ℹ️ Info: ${obj.readme}`);
  return parts.join("\n") || JSON.stringify(obj, null, 2).slice(0, 800);
}

export default {
  name: "getip",
  alias: ["getipinfo", "getipaddr"],
  category: "network",
  desc: "Get IP/domain info, or show contact JID/phone/profile when tagging a user. (Won't expose IPs of other users.)",
  use: "<ip|domain> or mention a contact (no args)",
  execute: async (sock, m, args) => {
    const chatId = chatIdFromMsg(m);
    if (!chatId) {
      console.error("getip: chatId is undefined");
      return;
    }

    try {
      // 1) If user mentioned someone (or replied to someone), show harmless contact info
      const mentions = extractMentionedJids(m);
      // also check for reply context (if message is a reply to a contact message)
      const replyJid = m?.message?.extendedTextMessage?.contextInfo?.stanzaId ? (m?.message?.extendedTextMessage?.contextInfo?.participant || null) : null;

      if (mentions.length > 0 || replyJid) {
        const targetJid = mentions[0] || replyJid;
        // normalize numeric phone part
        const phone = targetJid.split("@")[0];
        // get profile name & picture if available (Baileys method may vary)
        let profileName = "Unknown";
        let ppUrl = null;
        try {
          // try to get vCard / pushName or profile picture url if available
          // Note: sock.getName / sock.profilePictureUrl may differ by Baileys version.
          if (typeof sock.getName === "function") {
            profileName = await sock.getName(targetJid);
          } else if (typeof sock.fetchPushname === "function") {
            profileName = await sock.fetchPushname(targetJid);
          } else {
            // fallback to participant JID extraction
            profileName = targetJid;
          }
        } catch (e) {
          // ignore fetch errors
        }
        try {
          if (typeof sock.profilePictureUrl === "function") {
            ppUrl = await sock.profilePictureUrl(targetJid, "image");
          }
        } catch (e) {
          ppUrl = null;
        }

        const out = [
          "🔐 Contact info (safe):",
          `• JID: ${targetJid}`,
          `• Phone: ${phone}`,
          `• Name: ${profileName || "N/A"}`,
          ppUrl ? `• Profile picture: ${ppUrl}` : "• Profile picture: (not available)",
          "",
          "⚠️ Note: This command will NOT reveal IP addresses. To obtain IP-based data, paste an IP address or domain as the command argument."
        ].join("\n");

        return await sock.sendMessage(chatId, { text: out }, { quoted: m });
      }

      // 2) If args provided and it looks like IP/domain -> query ipinfo
      const targetArg = args.find(a => !a.startsWith("--")) || null;
      if (!targetArg) {
        return await sock.sendMessage(chatId, {
          text: "Usage:\n• .getip <ip|domain>\n• .getip (mention a contact to get their safe JID/phone/profile)\n\nNote: I will not retrieve other users' IP addresses."
        }, { quoted: m });
      }

      const target = targetArg.trim();
      if (!isIPorDomain(target)) {
        return await sock.sendMessage(chatId, { text: "Please provide a valid IP address or domain (e.g., 8.8.8.8 or example.com)." }, { quoted: m });
      }

      await sock.sendMessage(chatId, { text: `🔎 Looking up: *${target}* — please wait…` }, { quoted: m });

      const data = await fetchIpinfo(target);
      const pretty = prettyIpinfo(data);
      const rawJson = JSON.stringify(data, null, 2);
      const msg = `${pretty}\n\n\`\`\`json\n${rawJson.length > 800 ? rawJson.slice(0, 800) + "\n...truncated..." : rawJson}\n\`\`\``;
      return await sock.sendMessage(chatId, { text: msg.slice(0, MAX_TEXT_LEN) }, { quoted: m });

    } catch (err) {
      console.error("getip error:", err);
      const errMsg = err?.response?.data?.error || err?.message || String(err);
      await sock.sendMessage(chatId, { text: `❌ Failed to fetch info.\nError: ${errMsg}` }, { quoted: m });
    }
  },
};
