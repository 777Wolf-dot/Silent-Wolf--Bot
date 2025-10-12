// const { exec } = require('child_process');
// const fs = require('fs');

// module.exports = async (sock, msg, mediaPath) => {
//   const { from } = msg;

//   const bassPath = './temp/bass.mp3';

//   exec(`ffmpeg -i ${mediaPath} -af "bass=g=20" ${bassPath}`, async (err) => {
//     if (err) {
//       await sock.sendMessage(from, { text: '🐺 Failed to apply bass effect.' }, { quoted: msg });
//       return;
//     }

//     const audio = fs.readFileSync(bassPath);
//     await sock.sendMessage(from, { audio, mimetype: 'audio/mpeg', ptt: false }, { quoted: msg });

//     fs.unlinkSync(bassPath);
//     fs.unlinkSync(mediaPath);
//   });
// };
