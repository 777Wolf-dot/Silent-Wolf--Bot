import makeWASocket, { useSingleFileAuthState } from '@whiskeysockets/baileys';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const SESSIONS_DIR = './sessions';
if (!fs.existsSync(SESSIONS_DIR)) fs.mkdirSync(SESSIONS_DIR);

export async function generateSession(number) {
  return new Promise(async (resolve, reject) => {
    try {
      const sessionFile = path.join(SESSIONS_DIR, `${number}.json`);
      const { state, saveState } = useSingleFileAuthState(sessionFile);

      const sock = makeWASocket({
        auth: state,
        printQRInTerminal: false
      });

      sock.ev.on('connection.update', async (update) => {
        const { qr, connection } = update;
        if (qr) {
          const qrDataUrl = await QRCode.toDataURL(qr);
          resolve({ qr: qrDataUrl });
        }

        if (connection === 'open') {
          // Once connected, send session string to the user's number
          const sessionData = fs.readFileSync(sessionFile, 'utf-8');
          await sock.sendMessage(`${number}@s.whatsapp.net`, {
            text: `✅ Your session is ready!\n\n\`\`\`${sessionData}\`\`\``
          });
          sock.end();
        }
      });

      sock.ev.on('creds.update', saveState);

    } catch (err) {
      reject(err);
    }
  });
}
