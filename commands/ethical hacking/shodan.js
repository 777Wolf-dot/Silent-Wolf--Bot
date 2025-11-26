// commands/security/shodan.js
// ESModule for Node 18+ (uses global fetch). If your Node version lacks fetch, install node-fetch and uncomment import.
// Features:
// - Loads .env (if present)
// - OWNER_NUMBER env var support
// - Flexible group/admin detection across Baileys versions
// - Per-user rate limit (in-memory, globalThis)
// - Requires the explicit "consent" keyword to run
// - "help" / "menu" submode for compact menu entry
// - Passive-only output (no scanning/exploitation)
// Usage examples:
//   .shodan 8.8.8.8 consent
//   .shodan "apache" consent
//   .shodan help
// Environment:
//   SHODAN_API_KEY=your_key_here
//   OWNER_NUMBER=2547XXXXXXXX   # no @s.whatsapp.net, just digits

import fs from "fs";
import path from "path";

try {
  const dotenvPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(dotenvPath)) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require("dotenv").config({ path: dotenvPath });
    console.log("[shodan] Loaded .env from", dotenvPath);
  }
} catch (e) {
  console.warn("[shodan] dotenv load failed:", e && e.message);
}

// If Node lacks global fetch, uncomment and install node-fetch:
// import fetch from "node-fetch";

const IP_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export default {
  name: "shodan",
  description: "Passive Shodan lookup (IP/host or query). Requires consent. Owner/admin only in groups.",
  usage: "shodan <ip|query> consent  —  shodan help",
  async execute(sock, m, args = []) {
    try {
      const SHODAN_KEY = (process.env.SHODAN_API_KEY || "").trim();
      const OWNER_RAW = (process.env.OWNER_NUMBER || "").replace(/\D/g, "");
      const OWNER_JID = OWNER_RAW ? `${OWNER_RAW}@s.whatsapp.net` : "";

      const jid = m?.key?.remoteJid;
      // Different Baileys shapes: m.sender, m.participant, m.key.participant
      const sender = (m?.sender || m?.participant || m?.key?.participant || "").toString();
      const isGroup = !!(jid && jid.endsWith && jid.endsWith("@g.us"));

      console.log("[shodan] invoked by:", { sender, jid, isGroup });

      // Help / menu submode (compact)
      const lowerArgs = (args || []).map(a => String(a).toLowerCase());
      if (lowerArgs.includes("help") || lowerArgs.includes("menu") || lowerArgs.includes("info")) {
        const menuText =
          "🔐 *shodan* — passive lookup (owner/admin only in groups)\n\n" +
          "Usage:\n" +
          "• .shodan <ip|host|query> consent — run a passive lookup\n" +
          "• .shodan help — this message\n\n" +
          "Notes: Requires SHODAN_API_KEY in env. Returns passive OSINT only.\n";
        return await sock.sendMessage(jid, { text: menuText }, { quoted: m });
      }

      if (!SHODAN_KEY) {
        console.warn("[shodan] missing SHODAN_API_KEY");
        return await sock.sendMessage(jid, { text: "❌ Shodan API key not configured. Set SHODAN_API_KEY in your environment (.env) and restart the bot." }, { quoted: m });
      }

      // Permission check: owner OR (group && admin) OR (private chat)
      const isOwner = OWNER_JID && sender === OWNER_JID;
      if (isOwner) console.log("[shodan] caller is OWNER - bypassing admin checks");

      let isAdmin = false;
      if (isGroup) {
        try {
          const meta = await sock.groupMetadata(jid);
          console.log("[shodan] groupMetadata fetched:", meta?.id);
          const parts = meta?.participants || meta?.participants || [];
          // Try to find the participant info
          const participantRecord = parts.find(p => {
            const pid = (p?.id || p?.jid || "").toString();
            if (!pid) return false;
            if (pid === sender) return true;
            // some versions: participant ids may be stored without @s.whatsapp.net or in .id fields
            const senderShort = sender.split?.("@")?.[0] ?? sender;
            return pid.includes && pid.includes(senderShort);
          });

          if (participantRecord) {
            // Admin flags vary across Baileys versions
            isAdmin = !!(participantRecord.admin === "admin"
                      || participantRecord.admin === "superadmin"
                      || participantRecord.isAdmin
                      || participantRecord.isSuperAdmin
                      || participantRecord.admin === true);
            console.log("[shodan] participant record:", { id: participantRecord.id || participantRecord.jid, admin: participantRecord.admin, isAdmin: participantRecord.isAdmin });
          } else {
            // fallback: check if any participant entry indicates admin and matches sender substring
            const fallback = parts.find(p => (p?.admin && (p?.id || p?.jid || "").includes((sender || "").split?.("@")?.[0] || "")));
            if (fallback) {
              isAdmin = !!(fallback.admin === "admin" || fallback.isAdmin);
              console.log("[shodan] fallback admin match:", { id: fallback.id || fallback.jid, admin: fallback.admin });
            } else {
              console.log("[shodan] no participant record matched sender");
            }
          }
        } catch (err) {
          console.warn("[shodan] groupMetadata fetch failed:", err && err.message);
          // don't throw — we'll apply conservative permission rules below
        }
      }

      const allowed = isOwner || (!isGroup) || (isGroup && isAdmin);
      if (!allowed) {
        let reason = isGroup ? "You must be a group admin to use this command here." : "Permission denied.";
        // if metadata fetch failed, mention that in the message
        await sock.sendMessage(jid, {
          text: `⛔ ${reason}\n\nTips:\n• Ensure the bot is in the group and has permission to fetch metadata.\n• If metadata fetch failed, check the bot console for [shodan] logs.\n• Owner always allowed (set OWNER_NUMBER in env).`
        }, { quoted: m });
        console.log("[shodan] permission denied:", { isOwner, isGroup, isAdmin });
        return;
      }

      // Require explicit consent keyword to avoid accidental misuse
      if (!args || !args.length || !lowerArgs.includes("consent")) {
        return await sock.sendMessage(jid, {
          text:
            "⚠️ This command requires *consent* to run. Include the keyword `consent` to confirm you have authorization to query the target.\n\n" +
            "Examples:\n• .shodan 8.8.8.8 consent\n• .shodan \"apache\" consent"
        }, { quoted: m });
      }

      // Simple per-user cooldown (in-memory)
      if (!globalThis._shodanRate) globalThis._shodanRate = {};
      const last = globalThis._shodanRate[sender] || 0;
      const now = Date.now();
      const COOLDOWN_MS = 20 * 1000; // 20 seconds
      if (now - last < COOLDOWN_MS) {
        const wait = Math.ceil((COOLDOWN_MS - (now - last)) / 1000);
        return await sock.sendMessage(jid, { text: `⏳ Rate limit: try again in ${wait}s.` }, { quoted: m });
      }
      globalThis._shodanRate[sender] = now;

      // Build query (remove the 'consent' token)
      const rawQuery = args.filter(a => String(a).toLowerCase() !== "consent").join(" ").trim();
      if (!rawQuery) {
        return await sock.sendMessage(jid, { text: "❗ Provide an IP, hostname, or search query. Example: `.shodan 8.8.8.8 consent`" }, { quoted: m });
      }

      // Determine endpoint
      const isIP = IP_REGEX.test(rawQuery);
      let endpoint;
      if (isIP) {
        endpoint = `https://api.shodan.io/shodan/host/${encodeURIComponent(rawQuery)}?key=${SHODAN_KEY}`;
      } else {
        // Shodan search (passive)
        endpoint = `https://api.shodan.io/shodan/host/search?key=${SHODAN_KEY}&query=${encodeURIComponent(rawQuery)}&page=1`;
      }

      await sock.sendMessage(jid, { text: "🔎 Querying Shodan — fetching passive information..." }, { quoted: m });

      const res = await fetch(endpoint);
      if (!res.ok) {
        const body = await res.text().catch(() => "");
        console.warn("[shodan] API error:", res.status, res.statusText, body.slice?.(0, 400));
        return await sock.sendMessage(jid, { text: `❌ Shodan API error: ${res.status} ${res.statusText}\n${body.slice?.(0,600)}` }, { quoted: m });
      }
      const data = await res.json();

      // Format response (passive-only)
      let out = "🛡️ *Shodan Lookup (Passive Info Only)*\n\n";
      if (isIP) {
        out += `• IP: ${data.ip_str || rawQuery}\n`;
        if (data.hostnames?.length) out += `• Hostnames: ${data.hostnames.join(", ")}\n`;
        if (data.org) out += `• Org: ${data.org}\n`;
        if (data.os) out += `• OS: ${data.os}\n`;
        if (data.city || data.country_name) out += `• Location: ${[data.city, data.region_code, data.country_name].filter(Boolean).join(", ")}\n`;
        if (data.last_update) out += `• Last Update: ${data.last_update}\n`;
        if (Array.isArray(data.ports) && data.ports.length) out += `• Open ports: ${data.ports.join(", ")}\n`;

        if (Array.isArray(data.data) && data.data.length) {
          out += `\n• Services (sample):\n`;
          for (const s of data.data.slice(0, 5)) {
            const product = s.product || s.server || s._shodan || "unknown";
            const port = s.port || "n/a";
            let title = `  - port ${port}: ${product}`;
            if (s.banner || s.data) {
              const snippet = (s.banner || s.data || "").toString().slice(0, 240).replace(/\s+/g, " ");
              title += ` — ${snippet}...`;
            }
            out += `${title}\n`;
          }
        }
      } else {
        out += `• Query: ${rawQuery}\n`;
        out += `• Matches: ${data.total || 0}\n\n`;
        const matches = (data.matches || []).slice(0, 3);
        if (!matches.length) out += "No matches found (top results empty).\n";
        else {
          out += "Top matches (passive):\n";
          for (const mItem of matches) {
            out += `\n— IP: ${mItem.ip_str || "n/a"}\n`;
            if (mItem.hostnames?.length) out += `  Hostnames: ${mItem.hostnames.join(", ")}\n`;
            if (mItem.org) out += `  Org: ${mItem.org}\n`;
            if (mItem.port) out += `  Port: ${mItem.port}\n`;
            if (mItem.product) out += `  Product: ${mItem.product}\n`;
            if (mItem.timestamp) out += `  Seen: ${mItem.timestamp}\n`;
          }
        }
      }

      out += `\n⚠️ *Responsible use:* Passive OSINT only. Do NOT scan, probe, or exploit systems without explicit authorization from the owner. Misuse may be illegal.`;
      out += `\n🔗 View on Shodan: https://www.shodan.io/search?query=${encodeURIComponent(rawQuery)}`;

      // Send result
      await sock.sendMessage(jid, { text: out }, { quoted: m });
      return;
    } catch (err) {
      console.error("[shodan] unexpected error:", err);
      try { await sock.sendMessage(m.key.remoteJid, { text: `❌ Unexpected error: ${err.message || err}` }, { quoted: m }); } catch {}
    }
  }
};
