// commands/security/antiviewonce.js
import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "database/antiviewonce.json");

// Ensure DB exists
if (!fs.existsSync(dbPath)) {
    fs.writeFileSync(dbPath, JSON.stringify({
        mode: "off",   // "off" | "on" | "dm"
        owner: ""
    }, null, 2));
}

// Load DB
function loadDB() {
    return JSON.parse(fs.readFileSync(dbPath));
}

// Save DB
function saveDB(data) {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

export default {
    name: "antiviewonce",
    alias: ["avo", "antivo"],
    category: "security",
    description: "Silently capture View-Once media and send to DM or reveal publicly.",

    // Command execution (toggle)
    execute: async ({ sock, m, args }) => {
        const sender = m.sender;
        const db = loadDB();

        // Assign owner on first use
        if (!db.owner) {
            db.owner = sender;
            saveDB(db);
        }

        if (sender !== db.owner) {
            return m.reply("❌ Only the bot owner can control Anti-ViewOnce.");
        }

        const mode = args[0]?.toLowerCase();

        if (mode === "on") {
            db.mode = "on";
            saveDB(db);
            return m.reply("🟢 *AntiViewOnce PUBLIC MODE enabled*\nView-once media will now be revealed in chats.");
        }

        if (mode === "dm") {
            db.mode = "dm";
            saveDB(db);
            return m.reply("🔒 *AntiViewOnce PRIVATE MODE enabled*\nView-once media will be sent ONLY to your DM silently.");
        }

        if (mode === "off") {
            db.mode = "off";
            saveDB(db);
            return m.reply("🔴 *AntiViewOnce disabled.*");
        }

        // Info message
        return m.reply(
            `🐺 *AntiViewOnce Settings*\n\n` +
            `Mode: ${db.mode === "off" ? "🔴 OFF" : db.mode === "on" ? "🟢 PUBLIC" : "🔒 DM"}\n\n` +
            `Use:\n` +
            `• .antiviewonce on   → Show in chats\n` +
            `• .antiviewonce dm   → Send to DM only\n` +
            `• .antiviewonce off  → Disable`
        );
    },

    // Auto-run for all incoming messages
    onMessage: async ({ sock, m }) => {
        const db = loadDB();

        if (db.mode === "off") return;                     // Feature disabled
        if (!m.message?.viewOnceMessageV2) return;        // Not view-once

        const payload = m.message.viewOnceMessageV2.message;

        // PUBLIC MODE → reveal in same chat
        if (db.mode === "on") {
            await sock.sendMessage(m.key.remoteJid, payload, { quoted: m });
            return;
        }

        // DM MODE → send to owner DM only
        if (db.mode === "dm") {
            await sock.sendMessage(db.owner, payload);
            return;
        }
    }
};
