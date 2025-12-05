// // commands/utility/qrdecode.js
// import Jimp from 'jimp';
// import QrCode from 'qrcode-reader';
// import { downloadContentFromMessage } from '@whiskeysockets/baileys';

// export default {
//   name: 'qrdecode',
//   alias: ['decodeqr'],
//   description: '🕵️ Decode a QR code from an image',
//   category: 'utility',
//   usage: '.qrdecode <reply to image>',

//   async execute(sock, m, args, from, isGroup, sender) {
//     try {
//       const jid = typeof from === 'string' ? from : m.key.remoteJid;
//       const quoted = m.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

//       if (!quoted) {
//         return sock.sendMessage(jid, { text: '❌ Please reply to an image containing a QR code.' }, { quoted: m });
//       }

//       // Download image buffer
//       const stream = await downloadContentFromMessage(quoted, 'image');
//       let buffer = Buffer.from([]);
//       for await (const chunk of stream) {
//         buffer = Buffer.concat([buffer, chunk]);
//       }

//       const image = await Jimp.read(buffer);
//       const qr = new QrCode();

//       const qrResult = await new Promise((resolve, reject) => {
//         qr.callback = (err, value) => {
//           if (err) reject(err);
//           else resolve(value?.result);
//         };
//         qr.decode(image.bitmap);
//       });

//       if (!qrResult) {
//         return sock.sendMessage(jid, { text: '❌ Could not decode QR code. Make sure it is clear and valid.' }, { quoted: m });
//       }

//       await sock.sendMessage(jid, { text: `🔍 QR Code Content:\n\n${qrResult}` }, { quoted: m });

//     } catch (error) {
//       console.error('[QR Decode Error]', error);
//       const jid = typeof from === 'string' ? from : m.key.remoteJid;
//       await sock.sendMessage(jid, { text: '❌ Failed to decode QR code. Please try again.' }, { quoted: m });
//     }
//   },
// };
