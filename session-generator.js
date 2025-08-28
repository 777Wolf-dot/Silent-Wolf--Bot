import makeWASocket, {
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
} from '@whiskeysockets/baileys';
import P from 'pino';
import qrcode from 'qrcode-terminal';

async function startSessionGenerator() {
  const { state, saveCreds } = await useMultiFileAuthState('./auth');
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false,
    logger: P({ level: 'silent' }),
    browser: ['SessionGenBot', 'Safari', '1.0'],
  });

  sock.ev.on('connection.update', (update) => {
    const { connection, qr, lastDisconnect } = update;

    if (qr) {
      console.log('📲 Scan this QR code with your WhatsApp mobile app:');
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      if (statusCode === DisconnectReason.loggedOut) {
        console.log('❌ Logged out. Please delete the auth folder and restart this script to generate new session.');
        process.exit(0);
      } else {
        console.log('❌ Connection closed. Reconnecting...');
      }
    }

    if (connection === 'open') {
      console.log('✅ Successfully connected! Session saved in ./auth folder');
    }
  });

  sock.ev.on('creds.update', saveCreds);
}

startSessionGenerator().catch((err) => {
  console.error('Error starting session generator:', err);
});
