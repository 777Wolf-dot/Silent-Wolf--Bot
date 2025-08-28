// import dotenv from 'dotenv';
// dotenv.config();

// import { ChatGPTAPI } from 'chatgpt';

// // Load API key from environment variable
// const apiKey = process.env.OPENAI_API_KEY;

// if (!apiKey) {
//   throw new Error('Missing OPENAI_API_KEY in .env file');
// }

// const api = new ChatGPTAPI({ apiKey });

// export default async (sock, msg) => {
//   const sender = msg.key.remoteJid;
//   const textMsg = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
  
//   // Extract the prompt by removing the command '.gpt'
//   const prompt = textMsg.trim().slice(4).trim();

//   if (!prompt) {
//     await sock.sendMessage(sender, {
//       text: `🐺 *Silent Wolf GPT*\n\nPlease ask me something.\nUsage: *.gpt What is the meaning of life?*`
//     }, { quoted: msg });
//     return;
//   }

//   try {
//     // Send prompt to ChatGPT API
//     const response = await api.sendMessage(prompt);

//     await sock.sendMessage(sender, {
//       text: `🐺 *Silent Wolf's Wisdom*\n\n🔮 *The Wolf Responds:*\n${response.text}`
//     }, { quoted: msg });

//   } catch (error) {
//     console.error('GPT command error:', error);
//     await sock.sendMessage(sender, {
//       text: `⚠️ *Oops! Something went wrong.*\nCheck your API key and try again.`
//     }, { quoted: msg });
//   }
// };
