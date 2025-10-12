// export default {
//   name: "calc",
//   alias: ["calculate", "math", "c"],
//   category: "tools",
//   desc: "Perform calculations with a wolf-themed flair.",
//   async execute({ sock, m, args = [] }) {
//     if (!sock || !m) return; // Ensure sock and message exist

//     try {
//       let expression = "";

//       // Check if replying to a message
//       const quoted = m?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
//       if (quoted) {
//         expression =
//           quoted.conversation ||
//           quoted.extendedTextMessage?.text ||
//           quoted.imageMessage?.caption ||
//           quoted.videoMessage?.caption ||
//           "";
//       } else {
//         expression = Array.isArray(args) ? args.join(" ") : "";
//       }

//       if (!expression) {
//         return await sock.sendMessage(m.chat, {
//           text: "🟢 *Wolf Calculator*\n\nUsage:\n.calc <expression>\nExample: .calc 12 + 34 * 2\nOr reply to a message with .calc",
//         }, { quoted: m });
//       }

//       // Wolf-themed loading
//       const loading = ["🐺 Sensing numbers...", "🐾 Hunting for the answer...", "🌲 Crunching the digits..."];
//       for (const msg of loading) {
//         await sock.sendMessage(m.chat, { text: msg }, { quoted: m });
//         await new Promise(r => setTimeout(r, 500));
//       }

//       // Safe evaluation
//       let result;
//       try {
//         const sanitized = expression.replace(/\^/g, "**");
//         if (!/^[0-9+\-*/().%\s^]+$/.test(sanitized)) throw new Error("Invalid characters");
//         result = eval(sanitized);
//       } catch {
//         return await sock.sendMessage(m.chat, {
//           text: "❌ Invalid expression. Only numbers and + - * / % ^ ( ) are allowed.",
//         }, { quoted: m });
//       }

//       await sock.sendMessage(m.chat, {
//         text: `🟢 *Wolf Calculator*\n\n🐺 Expression: ${expression}\n🌲 Result: ${result}\n\n⚡ The Wolf hunted the answer for you!`,
//       }, { quoted: m });

//     } catch (err) {
//       console.error("❌ Error in calc command:", err);
//       if (m?.chat && sock) {
//         await sock.sendMessage(m.chat, {
//           text: "❌ Something went wrong while calculating. The wolf is confused... Try again.",
//         }, { quoted: m });
//       }
//     }
//   }
// };
