// utils/performanceWrapper.js
const groupCache = new Map();
const CACHE_DURATION = 30 * 1000; // 30 seconds

export function withPerformance(command) {
  return {
    ...command,
    async execute(sock, m, args, metadata) {
      const start = Date.now();

      // === Cache sender/admin info ===
      const sender = m.key.participant || m.key.remoteJid;
      const fromGroup = m.key.remoteJid.endsWith("@g.us");
      let isAdmin = false;

      if (fromGroup) {
        const groupId = m.key.remoteJid;
        const cached = groupCache.get(groupId);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          isAdmin = cached.admins.includes(sender);
        } else {
          try {
            const meta = await sock.groupMetadata(groupId);
            const admins = meta.participants
              .filter(p => p.admin)
              .map(p => p.id);
            groupCache.set(groupId, { admins, timestamp: Date.now() });
            isAdmin = admins.includes(sender);
          } catch (err) {
            console.error("⚠️ Failed to fetch group metadata:", err);
          }
        }
      }

      // Add helper to command
      m._isAdmin = isAdmin;

      // Execute original command
      try {
        await command.execute(sock, m, args, metadata);
      } catch (err) {
        console.error(`❌ Command "${command.name}" failed:`, err);
      }

      const end = Date.now();
      console.log(`⏱️ Command "${command.name}" executed in ${end - start}ms`);
    },
  };
}
