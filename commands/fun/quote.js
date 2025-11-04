export default {
  name: "quote",
  alias: ["wolfquote", "howl"],
  desc: "Summon a random wolf-themed quote.",
  use: ".quote",

  execute: async (client, msg) => {
    try {
      const jid = msg.key.remoteJid;

      // 🐺 Border styles
      const borders = [
        { top: "╔═══════════════════════════════╗", bottom: "╚═══════════════════════════════╝" },
        { top: "┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓", bottom: "┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛" },
        { top: "╭───────────────────────────────╮", bottom: "╰───────────────────────────────╯" },
        { top: "═══════🐺🌕═══════", bottom: "═══════🌕🐺═══════" },
        { top: "━━━━━━🐾━━━━━━", bottom: "━━━━━━🐾━━━━━━" },
      ];
      const { top, bottom } = borders[Math.floor(Math.random() * borders.length)];

      // 🐾 Wolf quotes
      const quotes = [
        "🐺 “Throw me to the wolves, and I’ll return leading the pack.”",
        "🌕 “The wolf on the hill is never as hungry as the wolf climbing it.”",
        "🔥 “The moon taught the wolf to embrace darkness without fear.”",
        "🐾 “A lone wolf doesn’t lose his way — he creates his own trail.”",
        "🌑 “In the silence of the forest, the wolf finds his strength.”",
        "🐺 “I was born to fight battles others fear to face.”",
        "🌕 “The moonlight doesn’t ask for permission to shine.”",
        "🔥 “Wolves don’t chase approval; they chase purpose.”",
        "🐾 “You can cage a wolf, but you’ll never tame his spirit.”",
        "🐺 “Even the fiercest storm bows to a determined soul.”",
        "🌑 “Scars are proof that the wolf survived the hunt.”",
        "🌕 “When you walk alone, every step echoes strength.”",
        "🐾 “True power is calm — like a wolf before the strike.”",
        "🔥 “The alpha doesn’t roar, he commands with silence.”",
        "🐺 “Don’t mistake my silence for weakness. It’s strategy.”",
        "🐾 “Some wolves are meant to be legends, not followers.”",
        "🔥 “Pain doesn’t break a wolf — it teaches him to hunt smarter.”",
        "🌕 “Not all who wander are lost — some are just hunting.”",
        "🐺 “If you run from the wolf, you’ll never learn to howl.”",
        "🌑 “Dark nights make the wolf’s soul brighter.”",
        "🐾 “Respect is earned when your silence speaks louder than your bark.”",
        "🌕 “The wolf does not fear the night — he *is* the night.”",
        "🐺 “Stay wild, stay free, stay untamed.”",
        "🔥 “The alpha doesn’t need to prove his dominance — his presence does.”",
        "🐾 “I howl not for help, but to remind the night I’m still here.”",
        "🌕 “Even the lone wolf dances with the moon.”",
        "🐺 “Hunt quietly. Strike loudly.”",
        "🔥 “The full moon never hides. Neither should your power.”",
        "🐾 “Every wolf has a story. Mine’s written in scars.”",
        "🌕 “The forest listens when a wolf howls.”",
        "🐺 “Real wolves move in silence and let success howl for them.”",
        "🐾 “A wolf’s loyalty is as fierce as his bite.”",
        "🌕 “The moon knows every secret the wolf ever whispered.”",
        "🔥 “Wolves run together, but legends walk alone.”",
        "🐺 “Even a lone wolf howls to remind the pack he still breathes.”",
        "🌑 “There’s a wild fire in every wolf’s heart.”",
        "🐾 “Run with the wolves or get left behind.”",
        "🌕 “No crown needed when you were born an alpha.”",
        "🔥 “I don’t need permission to be powerful.”",
        "🐺 “Let them talk. Wolves don’t lose sleep over sheep opinions.”",
        "🌑 “Moonlight sharpens a wolf’s instincts.”",
        "🐾 “Strength isn’t loud — it’s quiet, patient, and unbreakable.”",
        "🌕 “When I howl, it’s not for pain. It’s for power.”",
        "🔥 “Every full moon reminds me: I’m not tamed. I’m timeless.”",
        "🐺 “A true wolf never forgets the scent of betrayal.”",
        "🌑 “Born from the storm, raised by the wild.”",
        "🐾 “Fear the wolf that walks alone.”",
        "🌕 “Silence is my weapon; the night is my ally.”",
        "🔥 “Not every wolf seeks a pack — some are born kings.”",
      ];

      // 🎲 Random selection
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

      // 🐺 Send quote message
      await client.sendMessage(jid, {
        text: `${top}\n${randomQuote}\n${bottom}`,
      });

    } catch (error) {
      console.error("❌ WolfQuote Error:", error.message);
      await client.sendMessage(msg.key.remoteJid, {
        text: `❌ *WolfBot growls:* Something interfered with my instincts.\nError: ${error.message}`,
      });
    }
  },
};
