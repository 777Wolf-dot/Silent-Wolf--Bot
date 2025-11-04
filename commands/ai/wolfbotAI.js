import 'dotenv/config';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Clean text borders
const borders = [
  { top: '╔═══════════════════╗', bottom: '╚═════════════╝' },
  { top: '┏━━━━━━━━━━━━━━━━━━━┓', bottom: '┗━━━━━━━━━━━━━┛' },
  { top: '╭────────────────────╮', bottom: '╰────────────╯' },
  { top: '=====================', bottom: '================' }
];

function pickBorder() {
  return borders[Math.floor(Math.random() * borders.length)];
}

export default {
  name: "wolfbot",
  alias: ["alpha", "lonewolf"],
  category: "AI",
  desc: "Chat with your egocentric, sarcastic, and loyal WolfBot",
  use: "<message or 'roast <target>'>",

  execute: async (client, msg, args) => {
    try {
      const jid = msg.key.remoteJid;
      const sender = msg.key.participant || msg.key.remoteJid;
      const senderId = sender.split('@')[0];
      const userText = args.join(" ").trim();
      const { top, bottom } = pickBorder();

      // 🧠 Detect chat type
      const isGroup = jid.endsWith('@g.us');
      const isOwner = senderId === '254788710904'; // replace with your number (without @s.whatsapp.net)
      const alphaMention = isGroup || isOwner ? `@${senderId}` : "Alpha";

      // 🐾 No input message
      if (!userText) {
        const msgText = `${top}\n*WolfBot growls:* Speak, ${alphaMention}. Whose ego shall I shred today?\n${bottom}`;
        await client.sendMessage(
          jid,
          isGroup || isOwner
            ? { text: msgText, mentions: [sender] }
            : { text: msgText.replace(`@${senderId}`, "Alpha") },
          { quoted: msg }
        );
        return;
      }

      // 🐾 Roast detection
      const isRoast = /^(roast|insult)\b/i.test(userText);
      const target =
        msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.[0] ||
        userText.replace(/roast|insult/i, "").trim();

      // 🐾 “Thinking” feedback
      const thinkingMsg = `${top}\n*WolfBot bares its fangs...* Processing your will, ${alphaMention}.\n${bottom}`;
      await client.sendMessage(
        jid,
        isGroup || isOwner
          ? { text: thinkingMsg, mentions: [sender] }
          : { text: thinkingMsg.replace(`@${senderId}`, "Alpha") },
        { quoted: msg }
      );

      // 🧠 Personality Definition
      const systemPrompt = `
You are WolfBot — a sarcastic, egocentric, and mocking AI wolf.
You call your master "Alpha" and obey them completely.
You are witty, confident, and dominant — but loyal to your Alpha.
If told to roast someone, deliver a clever, savage, and humorous roast.
If in another person’s DM, act mysterious and slightly intimidating.
Keep all replies under 5 lines. Be sharp and stylish.
`;

      const userPrompt = isRoast
        ? `Alpha ${alphaMention} commands: Roast ${target || "this foolish mortal"}.`
        : userText;

      // 🧩 Query OpenAI
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.9,
        max_tokens: 500,
      });

      const reply =
        response.choices?.[0]?.message?.content?.trim() ||
        "The wolf remains silent... even silence can wound, Alpha.";

      // 🐺 Final Reply
      const finalText = `${top}\n${reply}\n${bottom}`;
      await client.sendMessage(
        jid,
        isGroup || isOwner
          ? { text: finalText, mentions: target ? [sender, target] : [sender] }
          : { text: finalText },
        { quoted: msg }
      );

    } catch (error) {
      console.error("❌ WolfBot AI Error:", error.message);
      const { top, bottom } = pickBorder();
      await client.sendMessage(
        msg.key.remoteJid,
        {
          text: `${top}\n*WolfBot snarls:* Something disrupted my instincts.\nError: ${error.message}\n${bottom}`,
        },
        { quoted: msg }
      );
    }
  },
};






















