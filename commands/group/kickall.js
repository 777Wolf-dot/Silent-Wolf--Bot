import dotenv from "dotenv";
dotenv.config();

const OWNER_NUMBER = (process.env.OWNER_NUMBER || "").replace(/[^0-9]/g, "");

export default {
  name: "kickall",
  alias: ["banall", "wolfpurge"],
  description: "Kicks everyone from the pack except the Alpha and other admins.",
  category: "group",

  async execute(sock, m, args) {
    try {
      const jid = m.key.remoteJid;
      if (!jid || !jid.endsWith("@g.us")) {
        await sock.sendMessage(jid || (m.key && m.key.remoteJid), { text: "🐺 This command only works inside a pack (group chat)." }, { quoted: m });
        return;
      }

      // ----- SENDER / OWNER CHECK -----
      const rawSender = m.key.participant || m.key.remoteJid || "";
      const senderNumber = String(rawSender).split("@")[0];
      const isOwner = senderNumber === OWNER_NUMBER;

      // ----- FETCH GROUP METADATA -----
      const metadata = await sock.groupMetadata(jid);
      const participants = Array.isArray(metadata?.participants) ? metadata.participants : [];

      // ----- FIND SENDER PARTICIPANT ENTRY -----
      const senderEntry = participants.find(p => {
        const pid = (p?.id || p?.jid || p).toString();
        return pid.split?.("@")?.[0] === senderNumber;
      });

      const senderIsAdmin = !!(senderEntry && (senderEntry.admin === "admin" || senderEntry.admin === "superadmin" || senderEntry.isAdmin || senderEntry.isSuperAdmin));

      if (!isOwner && !senderIsAdmin) {
        await sock.sendMessage(jid, { text: "🐺 You dare command the Wolf’s will? Only the Alpha or the pack leaders can purge the den!" }, { quoted: m });
        return;
      }

      // ----- ROBUST BOT JID DETECTION -----
      let botJid = "";

      try {
        // 1) Common: sock.user.id or sock.user.jid
        if (sock.user) {
          if (typeof sock.user === "string") botJid = sock.user;
          else if (sock.user.id) botJid = sock.user.id;
          else if (sock.user.jid) botJid = sock.user.jid;
        }
        // 2) Older / alternative: sock.conn.user
        if (!botJid && sock.conn && sock.conn.user) {
          botJid = sock.conn.user.jid || sock.conn.user.id || botJid;
        }
        // 3) authState creds (some setups expose creds.myServer or creds.me)
        if (!botJid && sock.authState && sock.authState.creds && sock.authState.creds.me) {
          const me = sock.authState.creds.me;
          botJid = me.id || me.jid || me;
        }
      } catch (e) {
        console.warn("botJid detection minor error:", e && e.message);
      }

      // Normalize botJid and ensure it contains @
      if (botJid) {
        if (!botJid.includes("@")) {
          // If we have id like "12345:6789" or "12345", try to fix
          if (botJid.includes(":")) botJid = botJid.split(":")[0] + "@s.whatsapp.net";
          else botJid = botJid + "@s.whatsapp.net";
        }
      } else {
        // As last resort, try to extract from sock.userId-like props
        try {
          if (sock.user && typeof sock.user === "object" && (sock.user.id || sock.user.jid)) {
            botJid = (sock.user.id || sock.user.jid).toString();
            if (!botJid.includes("@")) botJid = botJid.split(":")[0] + "@s.whatsapp.net";
          }
        } catch (e) {}
      }

      // ----- DEBUG LOGGING (useful while testing) -----
      console.log("kickall debug → senderNumber:", senderNumber);
      console.log("kickall debug → OWNER_NUMBER:", OWNER_NUMBER);
      console.log("kickall debug → detected botJid:", botJid);
      console.log("kickall debug → group participant count:", participants.length);

      // ----- FIND BOT ENTRY IN PARTICIPANTS -----
      const botEntry = participants.find(p => {
        const pid = (p?.id || p?.jid || p).toString();
        // compare only the numeric prefix for robustness
        const pidNum = pid.split?.("@")?.[0];
        const botNum = botJid ? botJid.split("@")[0] : "";
        return botNum && pidNum === botNum;
      });

      const botIsAdmin = !!(botEntry && (botEntry.admin === "admin" || botEntry.admin === "superadmin" || botEntry.isAdmin || botEntry.isSuperAdmin));

      console.log("kickall debug → botIsAdmin:", botIsAdmin, "botEntry:", botEntry);

      if (!botIsAdmin) {
        await sock.sendMessage(jid, { text: "⚠️ Wolf is bound — make me admin to unleash the purge." }, { quoted: m });
        return;
      }

      // ----- BUILD TARGETS: non-admins excluding owner & bot -----
      const ownerFull = OWNER_NUMBER ? `${OWNER_NUMBER}@s.whatsapp.net` : null;
      const botNum = botJid ? botJid.split("@")[0] : null;

      const kickTargets = participants
        .filter(p => {
          const pid = (p?.id || p?.jid || p).toString();
          const pidNum = pid.split?.("@")?.[0];

          // exclude bot
          if (botNum && pidNum === botNum) return false;
          // exclude owner
          if (ownerFull && pidNum === OWNER_NUMBER) return false;
          // exclude admins (any admin flag)
          const isPAdmin = !!(p.admin === "admin" || p.admin === "superadmin" || p.isAdmin || p.isSuperAdmin);
          if (isPAdmin) return false;

          return true;
        })
        .map(p => (p?.id || p?.jid || p).toString());

      if (kickTargets.length === 0) {
        await sock.sendMessage(jid, { text: "🐺 Nothing to purge — only admins, the Alpha, and the Wolf remain." }, { quoted: m });
        return;
      }

      // ----- INFORM & EXECUTE -----
      await sock.sendMessage(jid, { text: `🐺 The Alpha commands a purge. Removing ${kickTargets.length} members now...` }, { quoted: m });

      const errors = [];
      let removed = 0;
      for (const t of kickTargets) {
        try {
          await sock.groupParticipantsUpdate(jid, [t], "remove");
          removed++;
          await new Promise(r => setTimeout(r, 700)); // gentle pace
        } catch (err) {
          console.error("kick error for", t, err?.message || err);
          errors.push({ t, err: err?.message || String(err) });
        }
      }

      let summary = `💀 Purge complete. Removed: ${removed}. Failures: ${errors.length}`;
      if (errors.length) summary += `\n• ${errors.slice(0,5).map(e => `${e.t.split("@")[0]} (${e.err})`).join("\n• ")}`;

      await sock.sendMessage(jid, { text: summary }, { quoted: m });

    } catch (err) {
      console.error("kickall fatal error:", err);
      try {
        await sock.sendMessage(m.key.remoteJid, { text: "⚠️ Wolf tripped during the purge. Something went wrong." }, { quoted: m });
      } catch (e) {}
    }
  },
};
