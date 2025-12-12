





























// // ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// // Production-ready with 24/7 reliability and clean terminal

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';
// import { spawn } from 'child_process';

// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '4.0.0'; // Ultimate stable version
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const EXTERNAL_SESSION_URL = process.env.SESSION_URL || '';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();
// console.log = (function() {
//     const original = console.log;
//     return function(...args) {
//         // Filter out unwanted logs
//         const message = args.join(' ');
//         if (message.includes('Buffer timeout reached') ||
//             message.includes('transaction failed, rolling back') ||
//             message.includes('failed to decrypt message') ||
//             message.includes('received error in ack') ||
//             message.includes('Closing session: SessionEntry') ||
//             message.includes('SessionError') ||
//             message.includes('Bad MAC')) {
//             return; // Suppress these logs
//         }
        
//         // Format clean logs
//         const timestamp = new Date().toLocaleTimeString();
//         const formatted = `[${timestamp}] ${message}`;
//         original.call(console, formatted);
//     };
// })();

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let EXTERNAL_SESSION_ID = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session: Enhanced Signal Handling
// ║   ⏰ Uptime : 24/7 Reliable
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Enhanced logging with suppression
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white
//     };
    
//     const color = colors[type] || chalk.white;
//     console.log(color(message));
// }

// // ====== EXTERNAL SESSION ID SYSTEM ======
// async function fetchExternalSessionId() {
//     if (!EXTERNAL_SESSION_URL) {
//         log('⚠️ No external session URL configured', 'warning');
//         return null;
//     }
    
//     try {
//         log('🌐 Fetching Session ID from external source...', 'info');
        
//         const { default: fetch } = await import('node-fetch');
        
//         const response = await fetch(EXTERNAL_SESSION_URL, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//                 'Accept': 'application/json'
//             },
//             timeout: 10000
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}`);
//         }
        
//         const data = await response.json();
//         let sessionId = data.sessionId || data.session_id || data.sessionID || data.id;
        
//         if (!sessionId && typeof data === 'string') {
//             const match = data.match(/[A-F0-9]{32}/i);
//             if (match) sessionId = match[0];
//         }
        
//         if (sessionId) {
//             EXTERNAL_SESSION_ID = sessionId;
//             log(`✅ External Session ID loaded: ${sessionId.substring(0, 16)}...`, 'success');
//             return EXTERNAL_SESSION_ID;
//         } else {
//             log('⚠️ No Session ID found in response', 'warning');
//             return null;
//         }
//     } catch (error) {
//         log(`❌ Error fetching external Session ID: ${error.message}`, 'error');
//         return null;
//     }
// }

// // ====== CONNECTION MANAGEMENT ======
// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 // Send presence update to keep connection alive
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 // Clear old messages from store every hour
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
                
//                 // Log connection status every 30 minutes
//                 if (Date.now() % (30 * 60 * 1000) < 1000) {
//                     const uptime = process.uptime();
//                     const hours = Math.floor(uptime / 3600);
//                     const minutes = Math.floor((uptime % 3600) / 60);
//                     log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
//                 }
//             } catch (error) {
//                 log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
//             }
//         }
//     }, 60 * 1000); // 1 minute intervals
    
//     log('💓 Heartbeat system started', 'success');
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// // ====== SESSION MANAGEMENT ======
// function isOwner(senderJid) {
//     if (!OWNER_JID || !senderJid) return false;
    
//     const normalizeJid = (jid) => {
//         if (!jid) return '';
//         const numberPart = jid.split('@')[0].replace(/[^0-9]/g, '');
//         return numberPart.startsWith('0') ? numberPart.substring(1) : numberPart;
//     };
    
//     return normalizeJid(senderJid) === normalizeJid(OWNER_JID);
// }

// function ensureSessionDir() {
//     if (!fs.existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
//     }
// }

// function cleanSession() {
//     try {
//         log('🧹 Cleaning session data...', 'warning');
        
//         if (fs.existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             log('✅ Cleared session directory', 'success');
//         }
        
//         EXTERNAL_SESSION_ID = null;
//         return true;
//     } catch (error) {
//         log(`❌ Cleanup error: ${error}`, 'error');
//         return false;
//     }
// }

// // ====== LIGHTWEIGHT MESSAGE STORE ======
// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             // Limit store size
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch (error) {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// // ====== COMMAND LOADER ======
// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!fs.existsSync(absolutePath)) {
//         log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`✅ [${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     log(`❌ Failed to load: ${item}`, 'error');
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch (error) {
//         log(`❌ Error reading folder: ${folderPath}`, 'error');
//     }
// }

// // ====== SIMPLIFIED LOGIN SYSTEM ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.selectMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== MAIN BOT INITIALIZATION ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('🔧 Initializing WhatsApp connection...', 'info');
        
//         // Load commands
//         log('📂 Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`✅ Loaded ${commands.size} commands`, 'success');
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         // Import Baileys with minimal logging
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         // Custom minimal logger that suppresses all noise
//         const customLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => customLogger
//         };
        
//         let state, saveCreds;
//         try {
//             log('🔐 Loading authentication...', 'info');
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             log('✅ Auth loaded', 'success');
//         } catch (error) {
//             log(`❌ Auth error: ${error.message}`, 'error');
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         // Create socket with enhanced stability options
//         const sock = makeWASocket({
//             version,
//             logger: customLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, customLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000, // Keep connection alive
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             // Enhanced stability options
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             // Handle message decryption gracefully
//             shouldIgnoreJid: (jid) => {
//                 // Ignore certain jids that cause decryption errors
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0; // Reset attempts on successful connection
        
//         // ====== EVENT HANDLERS ======
        
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
//                 await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//             }
            
//             // Handle pairing code
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         log(`❌ Pairing failed: ${error.message}`, 'error');
//                     }
//                 }, 3000);
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         // Message handling
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             // Skip status broadcasts and other problematic messages
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             // Store message briefly
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         log(`❌ Bot initialization failed: ${error.message}`, 'error');
//         throw error;
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     const ownerData = {
//         OWNER_NUMBER,
//         OWNER_JID,
//         linkedAt: new Date().toISOString(),
//         loginMethod: loginMode,
//         phoneNumber: phoneNumber,
//         version: VERSION
//     };
    
//     fs.writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_NUMBER}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  💓 Heartbeat: ${chalk.green('Active (1min intervals)')}
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n💓 Heartbeat: Active\n\nUse *${PREFIX}help* for commands.`
//         });
//     } catch (error) {
//         // Silent fail
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
//     connectionAttempts++;
    
//     log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
//     // Handle different disconnect reasons
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         log('🔓 Session invalid, cleaning...', 'warning');
//         cleanSession();
//     }
    
//     // Calculate retry delay with exponential backoff
//     const baseDelay = 5000; // 5 seconds
//     const maxDelay = 60000; // 1 minute
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             log('❌ Max retry attempts reached. Restarting process...', 'error');
//             connectionAttempts = 0;
//             process.exit(1); // Let process manager restart
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         if (textMsg.startsWith(PREFIX)) {
//             const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${PREFIX}${commandName}`, 'command');
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     await command.execute(sock, msg, args, PREFIX, {
//                         OWNER_NUMBER,
//                         OWNER_JID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => isOwner(chatId),
//                         store
//                     });
//                 } catch (error) {
//                     log(`❌ Command error: ${error.message}`, 'error');
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch (error) {
//         // Silent fail for message handling errors
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: ${PREFIX}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${OWNER_NUMBER}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${OWNER_NUMBER}\n⚡ Version: ${VERSION}\n📊 Commands: ${commands.size}\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clean':
//                 if (!isOwner(chatId)) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
//         }
//     } catch (error) {
//         // Silent fail for command errors
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('🚀 Starting Silent Wolf Bot...', 'info');
        
//         // Select login mode
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         log(`💥 Fatal error: ${error.message}`, 'error');
//         log('🔄 Restarting in 10s...', 'info');
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     // Suppress all unwanted errors
//     if (error.message.includes('SessionError') || 
//         error.message.includes('Bad MAC') ||
//         error.message.includes('decrypt') ||
//         error.message.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
// });

// process.on('unhandledRejection', (error) => {
//     // Suppress all unwanted rejections
//     if (error?.message?.includes('SessionError') || 
//         error?.message?.includes('Bad MAC') ||
//         error?.message?.includes('decrypt') ||
//         error?.message?.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
// });

// // Start the bot
// main().catch(error => {
//     log(`💥 Critical startup error: ${error.message}`, 'error');
//     process.exit(1);
// });

// // Auto-restart if process hangs
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000); // Check every minute































// // ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// // Production-ready with 24/7 reliability and clean terminal

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';
// import { spawn } from 'child_process';

// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '4.0.0'; // Ultimate stable version
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const EXTERNAL_SESSION_URL = process.env.SESSION_URL || '';
// const PREFIX_CONFIG_FILE = './prefix_config.json';
// const BOT_MODE_FILE = './bot_mode.json';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();
// console.log = (function() {
//     const original = console.log;
//     return function(...args) {
//         // Filter out unwanted logs
//         const message = args.join(' ');
//         if (message.includes('Buffer timeout reached') ||
//             message.includes('transaction failed, rolling back') ||
//             message.includes('failed to decrypt message') ||
//             message.includes('received error in ack') ||
//             message.includes('Closing session: SessionEntry') ||
//             message.includes('SessionError') ||
//             message.includes('Bad MAC')) {
//             return; // Suppress these logs
//         }
        
//         // Format clean logs
//         const timestamp = new Date().toLocaleTimeString();
//         const formatted = `[${timestamp}] ${message}`;
//         original.call(console, formatted);
//     };
// })();

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let OWNER_CLEAN_JID = null; // JID without device suffix
// let OWNER_CLEAN_NUMBER = null; // Number without device suffix
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let EXTERNAL_SESSION_ID = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;
// let CURRENT_PREFIX = PREFIX;
// let BOT_MODE = 'public'; // Default mode

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session: Enhanced Signal Handling
// ║   ⏰ Uptime : 24/7 Reliable
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Enhanced logging with suppression
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white
//     };
    
//     const color = colors[type] || chalk.white;
//     console.log(color(message));
// }

// // ====== JID NORMALIZATION ======
// function normalizeJid(jid) {
//     if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid };
    
//     // Remove device suffix (e.g., :7) if present
//     const [numberPart, suffix] = jid.split('@')[0].split(':');
//     const serverPart = jid.split('@')[1] || 's.whatsapp.net';
    
//     // Clean number: remove all non-digits
//     const cleanNumber = numberPart.replace(/[^0-9]/g, '');
    
//     // Remove leading 0 if present
//     const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
    
//     // Reconstruct clean JID without device suffix
//     const cleanJid = `${normalizedNumber}@${serverPart}`;
    
//     return {
//         raw: jid,
//         cleanJid: cleanJid,
//         cleanNumber: normalizedNumber,
//         hasDeviceSuffix: suffix !== undefined,
//         deviceSuffix: suffix
//     };
// }

// // ====== OWNER DETECTION ======
// function isOwner(msg) {
//     if (!OWNER_CLEAN_JID || !msg || !msg.key) return false;
    
//     const chatJid = msg.key.remoteJid;
//     const participant = msg.key.participant;
    
//     // Determine the actual sender JID
//     let senderJid = participant || chatJid;
    
//     // Normalize sender JID
//     const senderNormalized = normalizeJid(senderJid);
    
//     // Log for debugging (can be disabled in production)
//     log(`🔍 Owner Check: Owner=${OWNER_CLEAN_JID}, Sender=${senderNormalized.cleanJid}`, 'system');
    
//     // Compare clean JIDs
//     return senderNormalized.cleanJid === OWNER_CLEAN_JID;
// }

// // ====== BOT MODE CHECK ======
// function checkBotMode(msg, commandName) {
//     try {
//         if (!fs.existsSync(BOT_MODE_FILE)) {
//             BOT_MODE = 'public';
//             return true;
//         }
        
//         const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8'));
//         BOT_MODE = modeData.mode || 'public';
        
//         const chatJid = msg.key.remoteJid;
//         const isOwnerUser = isOwner(msg);
        
//         // Always allow owner in any mode
//         if (isOwnerUser) return true;
        
//         // Check mode restrictions
//         switch(BOT_MODE) {
//             case 'public':
//                 return true;
//             case 'private':
//                 return false; // Only owner allowed
//             case 'group-only':
//                 return chatJid.includes('@g.us');
//             case 'maintenance':
//                 // Only allow basic commands in maintenance
//                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
//                 return allowedCommands.includes(commandName);
//             default:
//                 return true;
//         }
//     } catch (error) {
//         log(`❌ Mode check error: ${error.message}`, 'error');
//         return true; // Default to public on error
//     }
// }

// // ====== PREFIX MANAGEMENT ======
// function loadPrefix() {
//     try {
//         if (fs.existsSync(PREFIX_CONFIG_FILE)) {
//             const config = JSON.parse(fs.readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
//             if (config.prefix && config.prefix.length <= 2) {
//                 CURRENT_PREFIX = config.prefix;
//                 log(`✅ Loaded custom prefix: "${CURRENT_PREFIX}"`, 'success');
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Failed to load prefix config: ${error.message}`, 'warning');
//     }
// }

// // ====== EXTERNAL SESSION ID SYSTEM ======
// async function fetchExternalSessionId() {
//     if (!EXTERNAL_SESSION_URL) {
//         log('⚠️ No external session URL configured', 'warning');
//         return null;
//     }
    
//     try {
//         log('🌐 Fetching Session ID from external source...', 'info');
        
//         const { default: fetch } = await import('node-fetch');
        
//         const response = await fetch(EXTERNAL_SESSION_URL, {
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//                 'Accept': 'application/json'
//             },
//             timeout: 10000
//         });
        
//         if (!response.ok) {
//             throw new Error(`HTTP ${response.status}`);
//         }
        
//         const data = await response.json();
//         let sessionId = data.sessionId || data.session_id || data.sessionID || data.id;
        
//         if (!sessionId && typeof data === 'string') {
//             const match = data.match(/[A-F0-9]{32}/i);
//             if (match) sessionId = match[0];
//         }
        
//         if (sessionId) {
//             EXTERNAL_SESSION_ID = sessionId;
//             log(`✅ External Session ID loaded: ${sessionId.substring(0, 16)}...`, 'success');
//             return EXTERNAL_SESSION_ID;
//         } else {
//             log('⚠️ No Session ID found in response', 'warning');
//             return null;
//         }
//     } catch (error) {
//         log(`❌ Error fetching external Session ID: ${error.message}`, 'error');
//         return null;
//     }
// }

// // ====== CONNECTION MANAGEMENT ======
// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 // Send presence update to keep connection alive
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 // Clear old messages from store every hour
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
                
//                 // Log connection status every 30 minutes
//                 if (Date.now() % (30 * 60 * 1000) < 1000) {
//                     const uptime = process.uptime();
//                     const hours = Math.floor(uptime / 3600);
//                     const minutes = Math.floor((uptime % 3600) / 60);
//                     log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
//                 }
//             } catch (error) {
//                 log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
//             }
//         }
//     }, 60 * 1000); // 1 minute intervals
    
//     log('💓 Heartbeat system started', 'success');
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// // ====== SESSION MANAGEMENT ======
// function ensureSessionDir() {
//     if (!fs.existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
//     }
// }

// function cleanSession() {
//     try {
//         log('🧹 Cleaning session data...', 'warning');
        
//         if (fs.existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             log('✅ Cleared session directory', 'success');
//         }
        
//         EXTERNAL_SESSION_ID = null;
//         return true;
//     } catch (error) {
//         log(`❌ Cleanup error: ${error}`, 'error');
//         return false;
//     }
// }

// // ====== LIGHTWEIGHT MESSAGE STORE ======
// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             // Limit store size
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch (error) {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// // ====== COMMAND LOADER ======
// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!fs.existsSync(absolutePath)) {
//         log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`✅ [${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     log(`❌ Failed to load: ${item}`, 'error');
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch (error) {
//         log(`❌ Error reading folder: ${folderPath}`, 'error');
//     }
// }

// // ====== SIMPLIFIED LOGIN SYSTEM ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.selectMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== MAIN BOT INITIALIZATION ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('🔧 Initializing WhatsApp connection...', 'info');
        
//         // Load custom prefix
//         loadPrefix();
        
//         // Load commands
//         log('📂 Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`✅ Loaded ${commands.size} commands`, 'success');
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         // Import Baileys with minimal logging
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         // Custom minimal logger that suppresses all noise
//         const customLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => customLogger
//         };
        
//         let state, saveCreds;
//         try {
//             log('🔐 Loading authentication...', 'info');
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             log('✅ Auth loaded', 'success');
//         } catch (error) {
//             log(`❌ Auth error: ${error.message}`, 'error');
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         // Create socket with enhanced stability options
//         const sock = makeWASocket({
//             version,
//             logger: customLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, customLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000, // Keep connection alive
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             // Enhanced stability options
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             // Handle message decryption gracefully
//             shouldIgnoreJid: (jid) => {
//                 // Ignore certain jids that cause decryption errors
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0; // Reset attempts on successful connection
        
//         // ====== EVENT HANDLERS ======
        
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
//                 await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//             }
            
//             // Handle pairing code
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         log(`❌ Pairing failed: ${error.message}`, 'error');
//                     }
//                 }, 3000);
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         // Message handling
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             // Skip status broadcasts and other problematic messages
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             // Store message briefly
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         log(`❌ Bot initialization failed: ${error.message}`, 'error');
//         throw error;
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     // Normalize owner JID for proper comparison
//     const normalizedOwner = normalizeJid(OWNER_JID);
//     OWNER_CLEAN_JID = normalizedOwner.cleanJid;
//     OWNER_CLEAN_NUMBER = normalizedOwner.cleanNumber;
    
//     const ownerData = {
//         OWNER_NUMBER,
//         OWNER_JID,
//         OWNER_CLEAN_JID,
//         OWNER_CLEAN_NUMBER,
//         normalized: normalizedOwner,
//         linkedAt: new Date().toISOString(),
//         loginMethod: loginMode,
//         phoneNumber: phoneNumber,
//         version: VERSION
//     };
    
//     fs.writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${OWNER_CLEAN_NUMBER}
// ║  🔧 Clean JID : ${OWNER_CLEAN_JID}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  💬 Prefix : "${CURRENT_PREFIX}"
// ║  🎛️ Mode   : ${BOT_MODE}
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  💓 Heartbeat: ${chalk.green('Active (1min intervals)')}
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_CLEAN_NUMBER}\n💬 Prefix: ${CURRENT_PREFIX}\n🎛️ Mode: ${BOT_MODE}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n💓 Heartbeat: Active\n\nUse *${CURRENT_PREFIX}help* for commands.`
//         });
//     } catch (error) {
//         // Silent fail
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
//     connectionAttempts++;
    
//     log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
//     // Handle different disconnect reasons
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         log('🔓 Session invalid, cleaning...', 'warning');
//         cleanSession();
//     }
    
//     // Calculate retry delay with exponential backoff
//     const baseDelay = 5000; // 5 seconds
//     const maxDelay = 60000; // 1 minute
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             log('❌ Max retry attempts reached. Restarting process...', 'error');
//             connectionAttempts = 0;
//             process.exit(1); // Let process manager restart
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         // Check if message starts with current prefix
//         if (textMsg.startsWith(CURRENT_PREFIX)) {
//             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
//             // Check bot mode restrictions
//             if (!checkBotMode(msg, commandName)) {
//                 log(`⛔ Command blocked by ${BOT_MODE} mode`, 'warning');
//                 return;
//             }
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     // Check if command is owner-only
//                     if (command.ownerOnly && !isOwner(msg)) {
//                         await sock.sendMessage(chatId, { 
//                             text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
//                         }, { quoted: msg });
//                         return;
//                     }
                    
//                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
//                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
//                         OWNER_JID: OWNER_CLEAN_JID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => isOwner(msg),
//                         store,
//                         normalizeJid
//                     });
//                 } catch (error) {
//                     log(`❌ Command error: ${error.message}`, 'error');
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch (error) {
//         // Silent fail for message handling errors
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const isOwnerUser = isOwner(msg);
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
//                 helpText += `Mode: ${BOT_MODE}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${OWNER_CLEAN_NUMBER}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${OWNER_CLEAN_NUMBER}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clean':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
                
//             case 'ownerinfo':
//                 const senderJid = msg.key.participant || chatId;
//                 const normalizedSender = normalizeJid(senderJid);
                
//                 let ownerInfo = `👑 *OWNER INFORMATION*\n\n`;
//                 ownerInfo += `📱 Your JID: ${senderJid}\n`;
//                 ownerInfo += `🔧 Clean JID: ${normalizedSender.cleanJid}\n`;
//                 ownerInfo += `👑 Owner JID: ${OWNER_CLEAN_JID}\n`;
//                 ownerInfo += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
//                 ownerInfo += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
//                 ownerInfo += `🎛️ Bot Mode: ${BOT_MODE}\n`;
//                 ownerInfo += `💬 Prefix: "${CURRENT_PREFIX}"`;
                
//                 if (!isOwnerUser) {
//                     ownerInfo += `\n\n⚠️ You are not the owner. Contact +${OWNER_CLEAN_NUMBER} for assistance.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: ownerInfo
//                 }, { quoted: msg });
//                 break;
//         }
//     } catch (error) {
//         // Silent fail for command errors
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('🚀 Starting Silent Wolf Bot...', 'info');
        
//         // Select login mode
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         log(`💥 Fatal error: ${error.message}`, 'error');
//         log('🔄 Restarting in 10s...', 'info');
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     // Suppress all unwanted errors
//     if (error.message.includes('SessionError') || 
//         error.message.includes('Bad MAC') ||
//         error.message.includes('decrypt') ||
//         error.message.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
// });

// process.on('unhandledRejection', (error) => {
//     // Suppress all unwanted rejections
//     if (error?.message?.includes('SessionError') || 
//         error?.message?.includes('Bad MAC') ||
//         error?.message?.includes('decrypt') ||
//         error?.message?.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
// });

// // Start the bot
// main().catch(error => {
//     log(`💥 Critical startup error: ${error.message}`, 'error');
//     process.exit(1);
// });

// // Auto-restart if process hangs
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000; // 5 minutes
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000); // Check every minute













// // ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// // Production-ready with 24/7 reliability and clean terminal

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';
// import { spawn } from 'child_process';

// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '4.0.0'; // Ultimate stable version
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const EXTERNAL_SESSION_URL = process.env.SESSION_URL || '';
// const PREFIX_CONFIG_FILE = './prefix_config.json';
// const BOT_MODE_FILE = './bot_mode.json';
// const WHITELIST_FILE = './whitelist.json';
// const BLOCKED_USERS_FILE = './blocked_users.json';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();
// console.log = (function() {
//     const original = console.log;
//     return function(...args) {
//         // Filter out unwanted logs
//         const message = args.join(' ');
//         if (message.includes('Buffer timeout reached') ||
//             message.includes('transaction failed, rolling back') ||
//             message.includes('failed to decrypt message') ||
//             message.includes('received error in ack') ||
//             message.includes('Closing session: SessionEntry') ||
//             message.includes('SessionError') ||
//             message.includes('Bad MAC')) {
//             return; // Suppress these logs
//         }
        
//         // Format clean logs
//         const timestamp = new Date().toLocaleTimeString();
//         const formatted = `[${timestamp}] ${message}`;
//         original.call(console, formatted);
//     };
// })();

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let OWNER_CLEAN_JID = null;
// let OWNER_CLEAN_NUMBER = null;
// let OWNER_LID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let EXTERNAL_SESSION_ID = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;
// let CURRENT_PREFIX = PREFIX;
// let BOT_MODE = 'public';
// let WHITELIST = new Set();

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session: Enhanced Signal Handling
// ║   ⏰ Uptime : 24/7 Reliable
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Enhanced logging with suppression
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white
//     };
    
//     const color = colors[type] || chalk.white;
//     console.log(color(message));
// }

// // ====== HELPER FUNCTIONS ======
// function existsSync(path) {
//     return fs.existsSync(path);
// }

// function readFileSync(path, encoding = 'utf8') {
//     return fs.readFileSync(path, encoding);
// }

// function writeFileSync(path, data) {
//     return fs.writeFileSync(path, data);
// }

// // ====== JID/LID HANDLING SYSTEM ======
// class JidManager {
//     constructor() {
//         this.ownerJids = new Set();
//         this.ownerLids = new Set();
//         this.loadOwnerData();
//         this.loadWhitelist();
//     }
    
//     loadOwnerData() {
//         try {
//             if (existsSync(OWNER_FILE)) {
//                 const ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
//                 OWNER_JID = ownerData.OWNER_JID;
//                 OWNER_NUMBER = ownerData.OWNER_NUMBER;
                
//                 const cleanJid = this.cleanJid(OWNER_JID);
//                 OWNER_CLEAN_JID = cleanJid.cleanJid;
//                 OWNER_CLEAN_NUMBER = cleanJid.cleanNumber;
                
//                 this.ownerJids.add(OWNER_CLEAN_JID);
//                 this.ownerJids.add(OWNER_JID);
                
//                 if (ownerData.ownerLID) {
//                     OWNER_LID = ownerData.ownerLID;
//                     this.ownerLids.add(OWNER_LID);
//                 }
                
//                 if (ownerData.verifiedLIDs && Array.isArray(ownerData.verifiedLIDs)) {
//                     ownerData.verifiedLIDs.forEach(lid => {
//                         this.ownerLids.add(lid);
//                         if (lid.includes('@lid')) {
//                             this.ownerLids.add(lid.split('@')[0]);
//                         }
//                     });
//                 }
                
//                 log(`✅ Loaded owner data: ${OWNER_CLEAN_JID}`, 'success');
//                 if (OWNER_LID) {
//                     log(`✅ Loaded owner LID: ${OWNER_LID}`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`❌ Failed to load owner data: ${error.message}`, 'error');
//         }
//     }
    
//     loadWhitelist() {
//         try {
//             if (existsSync(WHITELIST_FILE)) {
//                 const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
//                 if (data.whitelist && Array.isArray(data.whitelist)) {
//                     data.whitelist.forEach(item => {
//                         WHITELIST.add(item);
//                         if (item.includes('@lid')) {
//                             this.ownerLids.add(item);
//                         } else {
//                             this.ownerJids.add(this.cleanJid(item).cleanJid);
//                         }
//                     });
//                     log(`✅ Loaded ${WHITELIST.size} whitelisted IDs`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`⚠️ Could not load whitelist: ${error.message}`, 'warning');
//         }
//     }
    
//     cleanJid(jid) {
//         if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
//         const isLid = jid.includes('@lid');
        
//         if (isLid) {
//             const lidNumber = jid.split('@')[0];
//             return {
//                 raw: jid,
//                 cleanJid: jid,
//                 cleanNumber: lidNumber,
//                 isLid: true,
//                 server: 'lid'
//             };
//         }
        
//         const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
//         const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
//         const cleanNumber = numberPart.replace(/[^0-9]/g, '');
//         const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
//         const cleanJid = `${normalizedNumber}@${serverPart}`;
        
//         return {
//             raw: jid,
//             cleanJid: cleanJid,
//             cleanNumber: normalizedNumber,
//             isLid: false,
//             hasDeviceSuffix: deviceSuffix !== undefined,
//             deviceSuffix: deviceSuffix,
//             server: serverPart
//         };
//     }
    
//     // SMART OWNER DETECTION
//     isOwner(msg) {
//         if (!msg || !msg.key) return false;
        
//         const chatJid = msg.key.remoteJid;
//         const participant = msg.key.participant;
//         const senderJid = participant || chatJid;
        
//         const cleaned = this.cleanJid(senderJid);
        
//         log(`🔍 Owner Check:\n  Sender: ${senderJid}\n  Cleaned: ${cleaned.cleanJid}\n  Is LID: ${cleaned.isLid}`, 'system');
        
//         // METHOD 1: Direct JID match
//         if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
//             log('✅ Owner detected via JID match', 'success');
//             return true;
//         }
        
//         // METHOD 2: LID match
//         if (cleaned.isLid) {
//             const lidNumber = cleaned.cleanNumber;
            
//             if (this.ownerLids.has(senderJid)) {
//                 log('✅ Owner detected via LID match', 'success');
//                 return true;
//             }
            
//             if (this.ownerLids.has(lidNumber)) {
//                 log('✅ Owner detected via LID number match', 'success');
//                 return true;
//             }
            
//             if (WHITELIST.has(senderJid) || WHITELIST.has(lidNumber)) {
//                 log('✅ Owner detected via whitelist', 'success');
//                 return true;
//             }
            
//             if (this.ownerLids.size === 0 && !OWNER_LID) {
//                 log('⚠️ First LID detected - auto-whitelisting as owner', 'warning');
//                 this.addOwnerLid(senderJid);
//                 return true;
//             }
//         }
        
//         log('❌ Not recognized as owner', 'warning');
//         return false;
//     }
    
//     addOwnerJid(jid) {
//         const cleaned = this.cleanJid(jid);
//         this.ownerJids.add(cleaned.cleanJid);
//         this.saveToOwnerFile();
//         log(`✅ Added JID to owner list: ${cleaned.cleanJid}`, 'success');
//     }
    
//     addOwnerLid(lid) {
//         this.ownerLids.add(lid);
//         OWNER_LID = lid;
        
//         const lidNumber = lid.split('@')[0];
//         this.ownerLids.add(lidNumber);
        
//         this.saveToOwnerFile();
//         log(`✅ Added LID to owner list: ${lid}`, 'success');
//     }
    
//     addToWhitelist(id) {
//         WHITELIST.add(id);
//         this.saveWhitelist();
        
//         if (id.includes('@lid')) {
//             this.ownerLids.add(id);
//             const lidNumber = id.split('@')[0];
//             this.ownerLids.add(lidNumber);
//         } else {
//             const cleaned = this.cleanJid(id);
//             this.ownerJids.add(cleaned.cleanJid);
//         }
        
//         log(`✅ Added to whitelist: ${id}`, 'success');
//     }
    
//     saveToOwnerFile() {
//         try {
//             let ownerData = {};
//             if (existsSync(OWNER_FILE)) {
//                 ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
//             }
            
//             ownerData.ownerLID = OWNER_LID;
//             ownerData.verifiedLIDs = Array.from(this.ownerLids).filter(lid => lid.includes('@lid'));
//             ownerData.ownerJIDs = Array.from(this.ownerJids);
//             ownerData.updatedAt = new Date().toISOString();
            
//             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save owner data: ${error.message}`, 'error');
//         }
//     }
    
//     saveWhitelist() {
//         try {
//             const data = {
//                 whitelist: Array.from(WHITELIST),
//                 updatedAt: new Date().toISOString()
//             };
//             writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save whitelist: ${error.message}`, 'error');
//         }
//     }
    
//     getOwnerInfo() {
//         return {
//             ownerJid: OWNER_CLEAN_JID,
//             ownerNumber: OWNER_CLEAN_NUMBER,
//             ownerLid: OWNER_LID,
//             jidCount: this.ownerJids.size,
//             lidCount: this.ownerLids.size,
//             whitelistCount: WHITELIST.size
//         };
//     }
// }

// // Initialize JID Manager
// const jidManager = new JidManager();

// // ====== BLOCKED USERS CHECK ======
// function isUserBlocked(jid) {
//     try {
//         if (existsSync(BLOCKED_USERS_FILE)) {
//             const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
//             return data.users && data.users.includes(jid);
//         }
//     } catch (error) {
//         // Silent fail
//     }
//     return false;
// }

// // ====== BOT MODE CHECK ======
// function checkBotMode(msg, commandName) {
//     try {
//         // Always allow owner
//         if (jidManager.isOwner(msg)) {
//             log('✅ Owner bypassing mode restrictions', 'success');
//             return true;
//         }
        
//         // Load mode
//         if (existsSync(BOT_MODE_FILE)) {
//             const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
//             BOT_MODE = modeData.mode || 'public';
//         } else {
//             BOT_MODE = 'public';
//         }
        
//         const chatJid = msg.key.remoteJid;
        
//         // Check mode restrictions
//         switch(BOT_MODE) {
//             case 'public':
//                 return true;
//             case 'private':
//                 return false;
//             case 'silent':
//                 // Silent mode: ignore non-owners completely (no messages sent)
//                 log(`🔇 Silent mode - ignoring non-owner: ${chatJid}`, 'warning');
//                 return false;
//             case 'group-only':
//                 return chatJid.includes('@g.us');
//             case 'maintenance':
//                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
//                 return allowedCommands.includes(commandName);
//             default:
//                 return true;
//         }
//     } catch (error) {
//         log(`❌ Mode check error: ${error.message}`, 'error');
//         return true;
//     }
// }

// // ====== PREFIX MANAGEMENT ======
// function loadPrefix() {
//     try {
//         if (existsSync(PREFIX_CONFIG_FILE)) {
//             const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
//             if (config.prefix && config.prefix.length <= 2) {
//                 CURRENT_PREFIX = config.prefix;
//                 log(`✅ Loaded custom prefix: "${CURRENT_PREFIX}"`, 'success');
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Failed to load prefix config: ${error.message}`, 'warning');
//     }
// }

// // ====== CONNECTION MANAGEMENT ======
// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
                
//                 if (Date.now() % (30 * 60 * 1000) < 1000) {
//                     const uptime = process.uptime();
//                     const hours = Math.floor(uptime / 3600);
//                     const minutes = Math.floor((uptime % 3600) / 60);
//                     log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
//                 }
//             } catch (error) {
//                 log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
//             }
//         }
//     }, 60 * 1000);
    
//     log('💓 Heartbeat system started', 'success');
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// // ====== SESSION MANAGEMENT ======
// function ensureSessionDir() {
//     if (!existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
//     }
// }

// function cleanSession() {
//     try {
//         log('🧹 Cleaning session data...', 'warning');
        
//         if (existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             log('✅ Cleared session directory', 'success');
//         }
        
//         EXTERNAL_SESSION_ID = null;
//         return true;
//     } catch (error) {
//         log(`❌ Cleanup error: ${error}`, 'error');
//         return false;
//     }
// }

// // ====== LIGHTWEIGHT MESSAGE STORE ======
// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch (error) {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// // ====== COMMAND LOADER ======
// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!existsSync(absolutePath)) {
//         log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default || commandModule;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`✅ [${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     log(`❌ Failed to load: ${item}`, 'error');
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch (error) {
//         log(`❌ Error reading folder: ${folderPath}`, 'error');
//     }
// }

// // ====== SIMPLIFIED LOGIN SYSTEM ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.pairingCodeMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== MAIN BOT INITIALIZATION ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('🔧 Initializing WhatsApp connection...', 'info');
        
//         loadPrefix();
        
//         log('📂 Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`✅ Loaded ${commands.size} commands`, 'success');
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         const customLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => customLogger
//         };
        
//         let state, saveCreds;
//         try {
//             log('🔐 Loading authentication...', 'info');
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             log('✅ Auth loaded', 'success');
//         } catch (error) {
//             log(`❌ Auth error: ${error.message}`, 'error');
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         const sock = makeWASocket({
//             version,
//             logger: customLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, customLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000,
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             shouldIgnoreJid: (jid) => {
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0;
        
//         // ====== EVENT HANDLERS ======
        
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
//                 await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//             }
            
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         log(`❌ Pairing failed: ${error.message}`, 'error');
//                     }
//                 }, 3000);
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         // Message handling
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         log(`❌ Bot initialization failed: ${error.message}`, 'error');
//         throw error;
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     jidManager.addOwnerJid(OWNER_JID);
    
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     const ownerData = {
//         OWNER_NUMBER,
//         OWNER_JID,
//         OWNER_CLEAN_JID: ownerInfo.ownerJid,
//         OWNER_CLEAN_NUMBER: ownerInfo.ownerNumber,
//         OWNER_LID: ownerInfo.ownerLid,
//         linkedAt: new Date().toISOString(),
//         loginMethod: loginMode,
//         phoneNumber: phoneNumber,
//         version: VERSION
//     };
    
//     writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${ownerInfo.ownerNumber}
// ║  🔧 Clean JID : ${ownerInfo.ownerJid}
// ║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  💬 Prefix : "${CURRENT_PREFIX}"
// ║  🎛️ Mode   : ${BOT_MODE}
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  📋 Whitelist: ${ownerInfo.whitelistCount} IDs
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: ${CURRENT_PREFIX}\n🎛️ Mode: ${BOT_MODE}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n\nUse *${CURRENT_PREFIX}help* for commands.`
//         });
//     } catch (error) {
//         // Silent fail
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
//     connectionAttempts++;
    
//     log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
//     // Handle "conflict" differently
//     if (reason.includes('conflict') || statusCode === 409) {
//         log('⚠️ Device conflict detected - waiting before reconnect', 'warning');
//         const conflictDelay = 30000;
//         log(`🔄 Waiting ${conflictDelay/1000}s due to conflict...`, 'info');
        
//         setTimeout(async () => {
//             await startBot(loginMode, phoneNumber);
//         }, conflictDelay);
//         return;
//     }
    
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         log('🔓 Session invalid, cleaning...', 'warning');
//         cleanSession();
//     }
    
//     const baseDelay = 5000;
//     const maxDelay = 60000;
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             log('❌ Max retry attempts reached. Restarting process...', 'error');
//             connectionAttempts = 0;
//             process.exit(1);
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const senderJid = msg.key.participant || chatId;
        
//         // Check if sender is blocked
//         if (isUserBlocked(senderJid)) {
//             log(`⛔ Message from blocked user: ${senderJid}`, 'warning');
//             return;
//         }
        
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         if (textMsg.startsWith(CURRENT_PREFIX)) {
//             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
//             // Check bot mode restrictions
//             if (!checkBotMode(msg, commandName)) {
//                 log(`⛔ Command blocked by ${BOT_MODE} mode`, 'warning');
//                 // In silent mode, don't send any messages to non-owners
//                 if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
//                     return;
//                 }
//                 try {
//                     await sock.sendMessage(chatId, { 
//                         text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
//                     });
//                 } catch (error) {
//                     log(`⚠️ Failed to send mode block message: ${error.message}`, 'warning');
//                 }
//                 return;
//             }
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     // Check if command is owner-only
//                     if (command.ownerOnly && !jidManager.isOwner(msg)) {
//                         log(`⛔ Non-owner tried to use owner command: ${commandName}`, 'warning');
//                         try {
//                             await sock.sendMessage(chatId, { 
//                                 text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
//                             });
//                         } catch (error) {
//                             log(`⚠️ Failed to send owner-only warning: ${error.message}`, 'warning');
//                         }
//                         return;
//                     }
                    
//                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
//                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
//                         OWNER_JID: OWNER_CLEAN_JID,
//                         OWNER_LID: OWNER_LID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => jidManager.isOwner(msg),
//                         jidManager,
//                         store
//                     });
//                 } catch (error) {
//                     log(`❌ Command error: ${error.message}`, 'error');
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Message handler error: ${error.message}`, 'warning');
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const isOwnerUser = jidManager.isOwner(msg);
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
//                 helpText += `Mode: ${BOT_MODE}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n🔗 LID: ${ownerInfo.ownerLid || 'None'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${ownerInfo.ownerNumber}\n🔗 Owner LID: ${ownerInfo.ownerLid || 'None'}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clean':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
                
//             case 'ownerinfo':
//                 const senderJid = msg.key.participant || chatId;
//                 const cleaned = jidManager.cleanJid(senderJid);
                
//                 let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
//                 ownerInfoText += `📱 Your JID: ${senderJid}\n`;
//                 ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
//                 ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
//                 ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
//                 ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
//                 ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
//                 ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n\n`;
                
//                 ownerInfoText += `*BOT OWNER DETAILS:*\n`;
//                 ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
//                 ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
//                 ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
//                 ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
//                 ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
//                 if (!isOwnerUser) {
//                     ownerInfoText += `\n\n⚠️ You are not recognized as owner.\nUse ${CURRENT_PREFIX}iamowner to claim ownership.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: ownerInfoText
//                 }, { quoted: msg });
//                 break;
//         }
//     } catch (error) {
//         // Silent fail for command errors
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('🚀 Starting Silent Wolf Bot...', 'info');
        
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         log(`💥 Fatal error: ${error.message}`, 'error');
//         log('🔄 Restarting in 10s...', 'info');
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     if (error.message.includes('SessionError') || 
//         error.message.includes('Bad MAC') ||
//         error.message.includes('decrypt') ||
//         error.message.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
// });

// process.on('unhandledRejection', (error) => {
//     if (error?.message?.includes('SessionError') || 
//         error?.message?.includes('Bad MAC') ||
//         error?.message?.includes('decrypt') ||
//         error?.message?.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
// });

// // Start the bot
// main().catch(error => {
//     log(`💥 Critical startup error: ${error.message}`, 'error');
//     process.exit(1);
// });

// // Auto-restart if process hangs
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000;
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000);

































// // ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// // Production-ready with 24/7 reliability and clean terminal

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';
// import { spawn } from 'child_process';







// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '4.0.0'; // Ultimate stable version
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const EXTERNAL_SESSION_URL = process.env.SESSION_URL || '';
// const PREFIX_CONFIG_FILE = './prefix_config.json';
// const BOT_MODE_FILE = './bot_mode.json';
// const WHITELIST_FILE = './whitelist.json';
// const BLOCKED_USERS_FILE = './blocked_users.json';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();
// console.log = (function() {
//     const original = console.log;
//     return function(...args) {
//         // Filter out unwanted logs
//         const message = args.join(' ');
//         if (message.includes('Buffer timeout reached') ||
//             message.includes('transaction failed, rolling back') ||
//             message.includes('failed to decrypt message') ||
//             message.includes('received error in ack') ||
//             message.includes('Closing session: SessionEntry') ||
//             message.includes('SessionError') ||
//             message.includes('Bad MAC')) {
//             return; // Suppress these logs
//         }
        
//         // Format clean logs
//         const timestamp = new Date().toLocaleTimeString();
//         const formatted = `[${timestamp}] ${message}`;
//         original.call(console, formatted);
//     };
// })();

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let OWNER_CLEAN_JID = null;
// let OWNER_CLEAN_NUMBER = null;
// let OWNER_LID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let EXTERNAL_SESSION_ID = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;
// let CURRENT_PREFIX = PREFIX;
// let BOT_MODE = 'public';
// let WHITELIST = new Set();
// let AUTO_VERIFICATION_ENABLED = true; // Enable automatic owner verification

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session: Enhanced Signal Handling
// ║   ⏰ Uptime : 24/7 Reliable
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Enhanced logging with suppression
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white
//     };
    
//     const color = colors[type] || chalk.white;
//     console.log(color(message));
// }

// // ====== HELPER FUNCTIONS ======
// function existsSync(path) {
//     return fs.existsSync(path);
// }

// function readFileSync(path, encoding = 'utf8') {
//     return fs.readFileSync(path, encoding);
// }

// function writeFileSync(path, data) {
//     return fs.writeFileSync(path, data);
// }

// // ====== AUTO VERIFICATION SYSTEM ======
// class AutoVerification {
//     constructor() {
//         this.verificationQueue = new Map();
//         this.MAX_VERIFICATION_ATTEMPTS = 3;
//         this.VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
//     }
    
//     // Check if user should be auto-verified
//     shouldAutoVerify(senderNumber, ownerNumber) {
//         // Simple rule: If last 6 digits match, auto-verify
//         if (senderNumber.length >= 6 && ownerNumber.length >= 6) {
//             const senderLast6 = senderNumber.slice(-6);
//             const ownerLast6 = ownerNumber.slice(-6);
            
//             if (senderLast6 === ownerLast6) {
//                 log(`🔐 Auto-verification: Last 6 digits match (${senderLast6})`, 'success');
//                 return true;
//             }
//         }
        
//         // Check if sender number contains owner number or vice versa
//         if (senderNumber.includes(ownerNumber) || ownerNumber.includes(senderNumber)) {
//             log(`🔐 Auto-verification: Number similarity detected`, 'success');
//             return true;
//         }
        
//         return false;
//     }
    
//     // Auto-verify user and send success message
//     async autoVerifyAndNotify(sock, senderJid, senderNumber, ownerNumber) {
//         try {
//             const cleaned = jidManager.cleanJid(senderJid);
            
//             // Add to owner lists
//             if (cleaned.isLid) {
//                 jidManager.addOwnerLid(senderJid);
//             } else {
//                 jidManager.addOwnerJid(senderJid);
//             }
            
//             jidManager.addToWhitelist(senderJid);
            
//             // Send verification success message
//             const currentTime = new Date().toLocaleTimeString();
//             const successMessage = `✅ *AUTO-VERIFICATION SUCCESSFUL!*\n\n` +
//                                  `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n` +
//                                  `🔐 Verification: COMPLETE\n` +
//                                  `👤 Verified as: OWNER\n` +
//                                  `📱 Your Number: +${senderNumber}\n` +
//                                  `🔗 Device Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
//                                  `💬 Prefix: "${CURRENT_PREFIX}"\n` +
//                                  `🎛️ Mode: ${BOT_MODE}\n` +
//                                  `🕒 Time: ${currentTime}\n\n` +
//                                  `✅ You can now use all owner commands!\n` +
//                                  `📋 Use *${CURRENT_PREFIX}help* to see available commands.`;
            
//             await sock.sendMessage(senderJid, { text: successMessage });
            
//             log(`✅ Auto-verified and notified: ${senderJid}`, 'success');
            
//             // Also log to console
//             console.log(chalk.green(`
// ╔════════════════════════════════════════════════╗
// ║         🔐 AUTO-VERIFICATION SUCCESS           ║
// ╠════════════════════════════════════════════════╣
// ║  ✅ Verified: +${senderNumber}                  
// ║  🔗 JID: ${senderJid.substring(0, 30)}...
// ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// ║  🕒 Time: ${currentTime}                 
// ╚════════════════════════════════════════════════╝
// `));
            
//             return true;
//         } catch (error) {
//             log(`❌ Auto-verification failed: ${error.message}`, 'error');
//             return false;
//         }
//     }
    
//     // Check and auto-verify on first message
//     async checkAndAutoVerify(sock, msg) {
//         if (!AUTO_VERIFICATION_ENABLED || !OWNER_CLEAN_NUMBER) {
//             return false;
//         }
        
//         const senderJid = msg.key.participant || msg.key.remoteJid;
//         const cleaned = jidManager.cleanJid(senderJid);
//         const senderNumber = cleaned.cleanNumber;
        
//         // Skip if already verified
//         if (jidManager.isOwner(msg)) {
//             return true;
//         }
        
//         // Check if should auto-verify
//         if (this.shouldAutoVerify(senderNumber, OWNER_CLEAN_NUMBER)) {
//             return await this.autoVerifyAndNotify(sock, senderJid, senderNumber, OWNER_CLEAN_NUMBER);
//         }
        
//         return false;
//     }
// }

// // Initialize Auto Verification
// const autoVerification = new AutoVerification();

// // ====== JID/LID HANDLING SYSTEM ======
// class JidManager {
//     constructor() {
//         this.ownerJids = new Set();
//         this.ownerLids = new Set();
//         this.loadOwnerData();
//         this.loadWhitelist();
//     }
    
//     loadOwnerData() {
//         try {
//             if (existsSync(OWNER_FILE)) {
//                 const ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
//                 OWNER_JID = ownerData.OWNER_JID;
//                 OWNER_NUMBER = ownerData.OWNER_NUMBER;
                
//                 const cleanJid = this.cleanJid(OWNER_JID);
//                 OWNER_CLEAN_JID = cleanJid.cleanJid;
//                 OWNER_CLEAN_NUMBER = cleanJid.cleanNumber;
                
//                 this.ownerJids.add(OWNER_CLEAN_JID);
//                 this.ownerJids.add(OWNER_JID);
                
//                 if (ownerData.ownerLID) {
//                     OWNER_LID = ownerData.ownerLID;
//                     this.ownerLids.add(OWNER_LID);
//                 }
                
//                 if (ownerData.verifiedLIDs && Array.isArray(ownerData.verifiedLIDs)) {
//                     ownerData.verifiedLIDs.forEach(lid => {
//                         this.ownerLids.add(lid);
//                         if (lid.includes('@lid')) {
//                             this.ownerLids.add(lid.split('@')[0]);
//                         }
//                     });
//                 }
                
//                 log(`✅ Loaded owner data: ${OWNER_CLEAN_JID}`, 'success');
//                 if (OWNER_LID) {
//                     log(`✅ Loaded owner LID: ${OWNER_LID}`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`❌ Failed to load owner data: ${error.message}`, 'error');
//         }
//     }
    
//     loadWhitelist() {
//         try {
//             if (existsSync(WHITELIST_FILE)) {
//                 const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
//                 if (data.whitelist && Array.isArray(data.whitelist)) {
//                     data.whitelist.forEach(item => {
//                         WHITELIST.add(item);
//                         if (item.includes('@lid')) {
//                             this.ownerLids.add(item);
//                         } else {
//                             this.ownerJids.add(this.cleanJid(item).cleanJid);
//                         }
//                     });
//                     log(`✅ Loaded ${WHITELIST.size} whitelisted IDs`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`⚠️ Could not load whitelist: ${error.message}`, 'warning');
//         }
//     }
    
//     cleanJid(jid) {
//         if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
//         const isLid = jid.includes('@lid');
        
//         if (isLid) {
//             const lidNumber = jid.split('@')[0];
//             return {
//                 raw: jid,
//                 cleanJid: jid,
//                 cleanNumber: lidNumber,
//                 isLid: true,
//                 server: 'lid'
//             };
//         }
        
//         const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
//         const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
//         const cleanNumber = numberPart.replace(/[^0-9]/g, '');
//         const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
//         const cleanJid = `${normalizedNumber}@${serverPart}`;
        
//         return {
//             raw: jid,
//             cleanJid: cleanJid,
//             cleanNumber: normalizedNumber,
//             isLid: false,
//             hasDeviceSuffix: deviceSuffix !== undefined,
//             deviceSuffix: deviceSuffix,
//             server: serverPart
//         };
//     }
    
//     // SMART OWNER DETECTION WITH AUTO-VERIFICATION
//     isOwner(msg) {
//         if (!msg || !msg.key) return false;
        
//         const chatJid = msg.key.remoteJid;
//         const participant = msg.key.participant;
//         const senderJid = participant || chatJid;
        
//         const cleaned = this.cleanJid(senderJid);
        
//         // METHOD 1: Direct JID match
//         if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
//             log('✅ Owner detected via JID match', 'success');
//             return true;
//         }
        
//         // METHOD 2: LID match
//         if (cleaned.isLid) {
//             const lidNumber = cleaned.cleanNumber;
            
//             if (this.ownerLids.has(senderJid)) {
//                 log('✅ Owner detected via LID match', 'success');
//                 return true;
//             }
            
//             if (this.ownerLids.has(lidNumber)) {
//                 log('✅ Owner detected via LID number match', 'success');
//                 return true;
//             }
            
//             if (WHITELIST.has(senderJid) || WHITELIST.has(lidNumber)) {
//                 log('✅ Owner detected via whitelist', 'success');
//                 return true;
//             }
            
//             // Auto-verification for first LID
//             if (this.ownerLids.size === 0 && !OWNER_LID) {
//                 log('⚠️ First LID detected - auto-whitelisting as owner', 'warning');
//                 this.addOwnerLid(senderJid);
//                 return true;
//             }
//         }
        
//         // METHOD 3: Number-based verification (for auto-verification)
//         if (OWNER_CLEAN_NUMBER && cleaned.cleanNumber) {
//             const senderNumber = cleaned.cleanNumber;
            
//             // Check number similarity for auto-verification
//             if (this.isSimilarNumber(senderNumber, OWNER_CLEAN_NUMBER)) {
//                 log(`🔐 Number similarity detected: ${senderNumber} vs ${OWNER_CLEAN_NUMBER}`, 'system');
//                 // Don't auto-verify here, let the message handler do it
//                 return false;
//             }
//         }
        
//         return false;
//     }
    
//     // Check if numbers are similar enough for auto-verification
//     isSimilarNumber(num1, num2) {
//         if (!num1 || !num2) return false;
        
//         // Exact match
//         if (num1 === num2) return true;
        
//         // Check if one contains the other (for country code differences)
//         if (num1.includes(num2) || num2.includes(num1)) {
//             return true;
//         }
        
//         // Check last 6 digits (common pattern for same number)
//         if (num1.length >= 6 && num2.length >= 6) {
//             const last6Num1 = num1.slice(-6);
//             const last6Num2 = num2.slice(-6);
//             if (last6Num1 === last6Num2) {
//                 return true;
//             }
//         }
        
//         return false;
//     }
    
//     addOwnerJid(jid) {
//         const cleaned = this.cleanJid(jid);
//         this.ownerJids.add(cleaned.cleanJid);
//         this.saveToOwnerFile();
//         log(`✅ Added JID to owner list: ${cleaned.cleanJid}`, 'success');
//     }
    
//     addOwnerLid(lid) {
//         this.ownerLids.add(lid);
//         OWNER_LID = lid;
        
//         const lidNumber = lid.split('@')[0];
//         this.ownerLids.add(lidNumber);
        
//         this.saveToOwnerFile();
//         log(`✅ Added LID to owner list: ${lid}`, 'success');
//     }
    
//     addToWhitelist(id) {
//         WHITELIST.add(id);
//         this.saveWhitelist();
        
//         if (id.includes('@lid')) {
//             this.ownerLids.add(id);
//             const lidNumber = id.split('@')[0];
//             this.ownerLids.add(lidNumber);
//         } else {
//             const cleaned = this.cleanJid(id);
//             this.ownerJids.add(cleaned.cleanJid);
//         }
        
//         log(`✅ Added to whitelist: ${id}`, 'success');
//     }
    
//     saveToOwnerFile() {
//         try {
//             let ownerData = {};
//             if (existsSync(OWNER_FILE)) {
//                 ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
//             }
            
//             ownerData.ownerLID = OWNER_LID;
//             ownerData.verifiedLIDs = Array.from(this.ownerLids).filter(lid => lid.includes('@lid'));
//             ownerData.ownerJIDs = Array.from(this.ownerJids);
//             ownerData.updatedAt = new Date().toISOString();
            
//             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save owner data: ${error.message}`, 'error');
//         }
//     }
    
//     saveWhitelist() {
//         try {
//             const data = {
//                 whitelist: Array.from(WHITELIST),
//                 updatedAt: new Date().toISOString()
//             };
//             writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save whitelist: ${error.message}`, 'error');
//         }
//     }
    
//     getOwnerInfo() {
//         return {
//             ownerJid: OWNER_CLEAN_JID,
//             ownerNumber: OWNER_CLEAN_NUMBER,
//             ownerLid: OWNER_LID,
//             jidCount: this.ownerJids.size,
//             lidCount: this.ownerLids.size,
//             whitelistCount: WHITELIST.size
//         };
//     }
// }

// // Initialize JID Manager
// const jidManager = new JidManager();

// // ====== BLOCKED USERS CHECK ======
// function isUserBlocked(jid) {
//     try {
//         if (existsSync(BLOCKED_USERS_FILE)) {
//             const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
//             return data.users && data.users.includes(jid);
//         }
//     } catch (error) {
//         // Silent fail
//     }
//     return false;
// }

// // ====== BOT MODE CHECK ======
// function checkBotMode(msg, commandName) {
//     try {
//         // Always allow owner
//         if (jidManager.isOwner(msg)) {
//             log('✅ Owner bypassing mode restrictions', 'success');
//             return true;
//         }
        
//         // Load mode
//         if (existsSync(BOT_MODE_FILE)) {
//             const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
//             BOT_MODE = modeData.mode || 'public';
//         } else {
//             BOT_MODE = 'public';
//         }
        
//         const chatJid = msg.key.remoteJid;
        
//         // Check mode restrictions
//         switch(BOT_MODE) {
//             case 'public':
//                 return true;
//             case 'private':
//                 return false;
//             case 'silent':
//                 // Silent mode: ignore non-owners completely (no messages sent)
//                 log(`🔇 Silent mode - ignoring non-owner: ${chatJid}`, 'warning');
//                 return false;
//             case 'group-only':
//                 return chatJid.includes('@g.us');
//             case 'maintenance':
//                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
//                 return allowedCommands.includes(commandName);
//             default:
//                 return true;
//         }
//     } catch (error) {
//         log(`❌ Mode check error: ${error.message}`, 'error');
//         return true;
//     }
// }

// // ====== PREFIX MANAGEMENT ======
// function loadPrefix() {
//     try {
//         if (existsSync(PREFIX_CONFIG_FILE)) {
//             const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
//             if (config.prefix && config.prefix.length <= 2) {
//                 CURRENT_PREFIX = config.prefix;
//                 log(`✅ Loaded custom prefix: "${CURRENT_PREFIX}"`, 'success');
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Failed to load prefix config: ${error.message}`, 'warning');
//     }
// }

// // ====== CONNECTION MANAGEMENT ======
// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
                
//                 if (Date.now() % (30 * 60 * 1000) < 1000) {
//                     const uptime = process.uptime();
//                     const hours = Math.floor(uptime / 3600);
//                     const minutes = Math.floor((uptime % 3600) / 60);
//                     log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
//                 }
//             } catch (error) {
//                 log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
//             }
//         }
//     }, 60 * 1000);
    
//     log('💓 Heartbeat system started', 'success');
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// // ====== SESSION MANAGEMENT ======
// function ensureSessionDir() {
//     if (!existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
//     }
// }

// function cleanSession() {
//     try {
//         log('🧹 Cleaning session data...', 'warning');
        
//         if (existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             log('✅ Cleared session directory', 'success');
//         }
        
//         EXTERNAL_SESSION_ID = null;
//         return true;
//     } catch (error) {
//         log(`❌ Cleanup error: ${error}`, 'error');
//         return false;
//     }
// }

// // ====== LIGHTWEIGHT MESSAGE STORE ======
// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch (error) {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// // ====== COMMAND LOADER ======
// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!existsSync(absolutePath)) {
//         log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default || commandModule;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`✅ [${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     log(`❌ Failed to load: ${item}`, 'error');
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch (error) {
//         log(`❌ Error reading folder: ${folderPath}`, 'error');
//     }
// }

// // ====== SIMPLIFIED LOGIN SYSTEM ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.pairingCodeMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== MAIN BOT INITIALIZATION ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('🔧 Initializing WhatsApp connection...', 'info');
        
//         loadPrefix();
        
//         log('📂 Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`✅ Loaded ${commands.size} commands`, 'success');
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         const customLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => customLogger
//         };
        
//         let state, saveCreds;
//         try {
//             log('🔐 Loading authentication...', 'info');
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             log('✅ Auth loaded', 'success');
//         } catch (error) {
//             log(`❌ Auth error: ${error.message}`, 'error');
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         const sock = makeWASocket({
//             version,
//             logger: customLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, customLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000,
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             shouldIgnoreJid: (jid) => {
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0;
        
//         // ====== EVENT HANDLERS ======
        
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
//                 await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//             }
            
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         log(`❌ Pairing failed: ${error.message}`, 'error');
//                     }
//                 }, 3000);
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         // Message handling
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         log(`❌ Bot initialization failed: ${error.message}`, 'error');
//         throw error;
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     jidManager.addOwnerJid(OWNER_JID);
    
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     const ownerData = {
//         OWNER_NUMBER,
//         OWNER_JID,
//         OWNER_CLEAN_JID: ownerInfo.ownerJid,
//         OWNER_CLEAN_NUMBER: ownerInfo.ownerNumber,
//         OWNER_LID: ownerInfo.ownerLid,
//         linkedAt: new Date().toISOString(),
//         loginMethod: loginMode,
//         phoneNumber: phoneNumber,
//         version: VERSION
//     };
    
//     writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${ownerInfo.ownerNumber}
// ║  🔧 Clean JID : ${ownerInfo.ownerJid}
// ║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  💬 Prefix : "${CURRENT_PREFIX}"
// ║  🎛️ Mode   : ${BOT_MODE}
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  📋 Whitelist: ${ownerInfo.whitelistCount} IDs
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     // Send connection success message to owner
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: ${CURRENT_PREFIX}\n🎛️ Mode: ${BOT_MODE}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n\nUse *${CURRENT_PREFIX}help* for commands.`
//         });
//     } catch (error) {
//         // Silent fail
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
//     connectionAttempts++;
    
//     log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
//     // Handle "conflict" differently
//     if (reason.includes('conflict') || statusCode === 409) {
//         log('⚠️ Device conflict detected - waiting before reconnect', 'warning');
//         const conflictDelay = 30000;
//         log(`🔄 Waiting ${conflictDelay/1000}s due to conflict...`, 'info');
        
//         setTimeout(async () => {
//             await startBot(loginMode, phoneNumber);
//         }, conflictDelay);
//         return;
//     }
    
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         log('🔓 Session invalid, cleaning...', 'warning');
//         cleanSession();
//     }
    
//     const baseDelay = 5000;
//     const maxDelay = 60000;
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             log('❌ Max retry attempts reached. Restarting process...', 'error');
//             connectionAttempts = 0;
//             process.exit(1);
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const senderJid = msg.key.participant || chatId;
        
//         // Check if sender is blocked
//         if (isUserBlocked(senderJid)) {
//             log(`⛔ Message from blocked user: ${senderJid}`, 'warning');
//             return;
//         }
        
//         // ====== AUTO-VERIFICATION CHECK ======
//         // Check if this is the first message from a potential owner
//         if (!jidManager.isOwner(msg) && OWNER_CLEAN_NUMBER) {
//             const cleaned = jidManager.cleanJid(senderJid);
//             const senderNumber = cleaned.cleanNumber;
            
//             // Check if sender number is similar to owner number
//             if (jidManager.isSimilarNumber(senderNumber, OWNER_CLEAN_NUMBER)) {
//                 log(`🔐 Potential owner detected: ${senderNumber}`, 'info');
                
//                 // Auto-verify and notify
//                 await autoVerification.autoVerifyAndNotify(sock, senderJid, senderNumber, OWNER_CLEAN_NUMBER);
//             }
//         }
        
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         if (textMsg.startsWith(CURRENT_PREFIX)) {
//             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
//             // Check bot mode restrictions
//             if (!checkBotMode(msg, commandName)) {
//                 log(`⛔ Command blocked by ${BOT_MODE} mode`, 'warning');
//                 // In silent mode, don't send any messages to non-owners
//                 if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
//                     return;
//                 }
//                 try {
//                     await sock.sendMessage(chatId, { 
//                         text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
//                     });
//                 } catch (error) {
//                     log(`⚠️ Failed to send mode block message: ${error.message}`, 'warning');
//                 }
//                 return;
//             }
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     // Check if command is owner-only
//                     if (command.ownerOnly && !jidManager.isOwner(msg)) {
//                         log(`⛔ Non-owner tried to use owner command: ${commandName}`, 'warning');
//                         try {
//                             await sock.sendMessage(chatId, { 
//                                 text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
//                             });
//                         } catch (error) {
//                             log(`⚠️ Failed to send owner-only warning: ${error.message}`, 'warning');
//                         }
//                         return;
//                     }
                    
//                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
//                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
//                         OWNER_JID: OWNER_CLEAN_JID,
//                         OWNER_LID: OWNER_LID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => jidManager.isOwner(msg),
//                         jidManager,
//                         store
//                     });
//                 } catch (error) {
//                     log(`❌ Command error: ${error.message}`, 'error');
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Message handler error: ${error.message}`, 'warning');
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const isOwnerUser = jidManager.isOwner(msg);
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
//                 helpText += `Mode: ${BOT_MODE}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n🔗 LID: ${ownerInfo.ownerLid || 'None'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${ownerInfo.ownerNumber}\n🔗 Owner LID: ${ownerInfo.ownerLid || 'None'}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clean':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
                
//             case 'ownerinfo':
//                 const senderJid = msg.key.participant || chatId;
//                 const cleaned = jidManager.cleanJid(senderJid);
                
//                 let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
//                 ownerInfoText += `📱 Your JID: ${senderJid}\n`;
//                 ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
//                 ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
//                 ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
//                 ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
//                 ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
//                 ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n\n`;
                
//                 ownerInfoText += `*BOT OWNER DETAILS:*\n`;
//                 ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
//                 ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
//                 ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
//                 ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
//                 ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
//                 if (!isOwnerUser) {
//                     ownerInfoText += `\n\n⚠️ You are not recognized as owner.\nAuto-verification will trigger on first message.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: ownerInfoText
//                 }, { quoted: msg });
//                 break;
//         }
//     } catch (error) {
//         // Silent fail for command errors
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('🚀 Starting Silent Wolf Bot...', 'info');
        
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         log(`💥 Fatal error: ${error.message}`, 'error');
//         log('🔄 Restarting in 10s...', 'info');
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     if (error.message.includes('SessionError') || 
//         error.message.includes('Bad MAC') ||
//         error.message.includes('decrypt') ||
//         error.message.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
// });

// process.on('unhandledRejection', (error) => {
//     if (error?.message?.includes('SessionError') || 
//         error?.message?.includes('Bad MAC') ||
//         error?.message?.includes('decrypt') ||
//         error?.message?.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
// });

// // Start the bot
// main().catch(error => {
//     log(`💥 Critical startup error: ${error.message}`, 'error');
//     process.exit(1);
// });

// // Auto-restart if process hangs
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000;
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000);



































// // ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// // Production-ready with 24/7 reliability and clean terminal

// import { fileURLToPath } from 'url';
// import { dirname } from 'path';
// import fs from 'fs';
// import path from 'path';
// import dotenv from 'dotenv';
// import chalk from 'chalk';
// import readline from 'readline';

// // ====== ENVIRONMENT SETUP ======
// dotenv.config({ path: './.env' });

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = dirname(__filename);

// // ====== CONFIGURATION ======
// const SESSION_DIR = './session';
// const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
// const VERSION = '4.0.0'; // Ultimate stable version
// const PREFIX = process.env.PREFIX || '.';
// const OWNER_FILE = './owner.json';
// const PREFIX_CONFIG_FILE = './prefix_config.json';
// const BOT_MODE_FILE = './bot_mode.json';
// const WHITELIST_FILE = './whitelist.json';
// const BLOCKED_USERS_FILE = './blocked_users.json';

// // ====== CLEAN CONSOLE SETUP ======
// console.clear();
// console.log = (function() {
//     const original = console.log;
//     return function(...args) {
//         // Filter out unwanted logs
//         const message = args.join(' ');
//         if (message.includes('Buffer timeout reached') ||
//             message.includes('transaction failed, rolling back') ||
//             message.includes('failed to decrypt message') ||
//             message.includes('received error in ack') ||
//             message.includes('Closing session: SessionEntry') ||
//             message.includes('SessionError') ||
//             message.includes('Bad MAC')) {
//             return; // Suppress these logs
//         }
        
//         // Format clean logs
//         const timestamp = new Date().toLocaleTimeString();
//         const formatted = `[${timestamp}] ${message}`;
//         original.call(console, formatted);
//     };
// })();

// // Global variables
// let OWNER_NUMBER = null;
// let OWNER_JID = null;
// let OWNER_CLEAN_JID = null;
// let OWNER_CLEAN_NUMBER = null;
// let OWNER_LID = null;
// let SOCKET_INSTANCE = null;
// let isConnected = false;
// let store = null;
// let heartbeatInterval = null;
// let lastActivityTime = Date.now();
// let connectionAttempts = 0;
// let MAX_RETRY_ATTEMPTS = 10;
// let CURRENT_PREFIX = PREFIX;
// let BOT_MODE = 'public';
// let WHITELIST = new Set();
// let AUTO_VERIFICATION_ENABLED = true; // Enable automatic owner verification

// console.log(chalk.cyan(`
// ╔════════════════════════════════════════════════╗
// ║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
// ║   ⚙️ Version : ${VERSION}
// ║   💬 Prefix  : "${PREFIX}"
// ║   🔒 Session: Enhanced Signal Handling
// ║   ⏰ Uptime : 24/7 Reliable
// ╚════════════════════════════════════════════════╝
// `));

// // ====== UTILITY FUNCTIONS ======
// const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// // Enhanced logging with suppression
// function log(message, type = 'info') {
//     const colors = {
//         info: chalk.blue,
//         success: chalk.green,
//         warning: chalk.yellow,
//         error: chalk.red,
//         event: chalk.magenta,
//         command: chalk.cyan,
//         system: chalk.white
//     };
    
//     const color = colors[type] || chalk.white;
//     console.log(color(message));
// }

// // ====== HELPER FUNCTIONS ======
// function existsSync(path) {
//     return fs.existsSync(path);
// }

// function readFileSync(path, encoding = 'utf8') {
//     return fs.readFileSync(path, encoding);
// }

// function writeFileSync(path, data) {
//     return fs.writeFileSync(path, data);
// }

// // ====== AUTOMATIC OWNER FIX SYSTEM ======
// function applyAutomaticOwnerFix(jidManager) {
//     console.log('\n🔧 ===== APPLYING AUTOMATIC OWNER FIX =====');
    
//     // Store original methods
//     const originalIsOwner = jidManager.isOwner;
//     const originalCleanJid = jidManager.cleanJid;
    
//     // ===== FIX 1: Enhanced isOwner() method =====
//     jidManager.isOwner = function(message) {
//         try {
//             if (!message || !message.key) return false;
            
//             const participant = message.key.participant;
//             const remoteJid = message.key.remoteJid;
//             const senderJid = participant || remoteJid;
//             const isFromMe = message.key.fromMe;
            
//             // ===== CRITICAL FIX: Any message from bot itself is owner =====
//             if (isFromMe) {
//                 console.log(`🔍 AUTO-FIX: fromMe = OWNER (${senderJid})`);
                
//                 // Auto-set owner data if not set
//                 if (senderJid && (!this.owner || !this.owner.cleanJid)) {
//                     const cleaned = this.cleanJid(senderJid);
//                     this.owner = {
//                         cleanNumber: cleaned.cleanNumber,
//                         cleanJid: cleaned.cleanJid,
//                         rawJid: senderJid,
//                         isLid: cleaned.isLid
//                     };
//                     console.log(`   ✅ Auto-set owner data from fromMe message`);
                    
//                     // Update global variables
//                     global.OWNER_NUMBER = cleaned.cleanNumber;
//                     global.OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
//                     global.OWNER_JID = cleaned.cleanJid;
//                     global.OWNER_CLEAN_JID = cleaned.cleanJid;
//                 }
                
//                 return true;
//             }
            
//             // ===== FIX 2: Load owner data if not loaded =====
//             if (!this.owner || !this.owner.cleanNumber) {
//                 this.loadOwnerDataFromFile();
//             }
            
//             // Fall back to original logic
//             return originalIsOwner.call(this, message);
            
//         } catch (error) {
//             console.error('Error in auto-fixed isOwner:', error);
//             // Emergency fallback: if fromMe, return true
//             return message?.key?.fromMe || false;
//         }
//     };
    
//     // ===== FIX 2: Add loadOwnerDataFromFile method =====
//     if (!jidManager.loadOwnerDataFromFile) {
//         jidManager.loadOwnerDataFromFile = function() {
//             try {
//                 if (existsSync('./owner.json')) {
//                     const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                    
//                     let cleanNumber = data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER;
//                     let cleanJid = data.OWNER_CLEAN_JID || data.OWNER_JID;
                    
//                     // Fix formatting
//                     if (cleanNumber && cleanNumber.includes(':')) {
//                         cleanNumber = cleanNumber.split(':')[0];
//                     }
//                     if (cleanJid && cleanJid.includes(':74')) {
//                         cleanJid = cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
//                     }
                    
//                     this.owner = {
//                         cleanNumber: cleanNumber,
//                         cleanJid: cleanJid,
//                         rawJid: data.OWNER_JID,
//                         isLid: cleanJid?.includes('@lid') || false
//                     };
                    
//                     // Update global variables
//                     global.OWNER_NUMBER = cleanNumber;
//                     global.OWNER_CLEAN_NUMBER = cleanNumber;
//                     global.OWNER_JID = cleanJid;
//                     global.OWNER_CLEAN_JID = cleanJid;
                    
//                     console.log('✅ AUTO-FIX: Loaded owner data:', this.owner);
//                     return true;
//                 }
//             } catch (error) {
//                 console.error('AUTO-FIX: Failed to load owner:', error);
//             }
//             return false;
//         };
//     }
    
//     // ===== FIX 3: Enhanced cleanJid method =====
//     if (originalCleanJid) {
//         jidManager.cleanJid = function(jid) {
//             const result = originalCleanJid.call(this, jid);
            
//             // Add LID recognition
//             if (jid && jid.includes('@lid')) {
//                 result.isLid = true;
//                 result.lidNumber = jid.replace('@lid', '');
//             }
            
//             return result;
//         };
//     }
    
//     // ===== FIX 4: Add getOwnerInfo method if missing =====
//     if (!jidManager.getOwnerInfo) {
//         jidManager.getOwnerInfo = function() {
//             return {
//                 cleanNumber: this.owner?.cleanNumber || null,
//                 cleanJid: this.owner?.cleanJid || null,
//                 rawJid: this.owner?.rawJid || null,
//                 jidCount: this.ownerJids?.size || 0,
//                 lidCount: this.ownerLids?.size || 0,
//                 whitelistCount: WHITELIST?.size || 0
//             };
//         };
//     }
    
//     // ===== FIX 5: Add setOwner method if missing =====
//     if (!jidManager.setOwner) {
//         jidManager.setOwner = function(ownerData) {
//             try {
//                 this.owner = {
//                     cleanNumber: ownerData.cleanNumber || ownerData.rawNumber,
//                     cleanJid: ownerData.cleanJid || ownerData.rawJid,
//                     rawJid: ownerData.rawJid,
//                     isLid: (ownerData.cleanJid || ownerData.rawJid)?.includes('@lid') || false
//                 };
                
//                 // Also add to sets
//                 if (this.owner.cleanJid) {
//                     this.ownerJids.add(this.owner.cleanJid);
//                 }
//                 if (this.owner.isLid && this.owner.cleanJid) {
//                     this.ownerLids.add(this.owner.cleanJid);
//                 }
                
//                 // Update global variables
//                 global.OWNER_NUMBER = this.owner.cleanNumber;
//                 global.OWNER_CLEAN_NUMBER = this.owner.cleanNumber;
//                 global.OWNER_JID = this.owner.cleanJid;
//                 global.OWNER_CLEAN_JID = this.owner.cleanJid;
                
//                 console.log('✅ AUTO-FIX: Set owner data:', this.owner);
//                 return { success: true, owner: this.owner };
//             } catch (error) {
//                 console.error('AUTO-FIX: Failed to set owner:', error);
//                 return { success: false, error: error.message };
//             }
//         };
//     }
    
//     // ===== FIX 6: Add addOwnerLid method =====
//     if (!jidManager.addOwnerLid) {
//         jidManager.addOwnerLid = function(lidJid) {
//             try {
//                 this.ownerLids.add(lidJid);
//                 const lidNumber = lidJid.replace('@lid', '');
//                 this.ownerLids.add(lidNumber);
                
//                 // Update owner.json
//                 if (existsSync('./owner.json')) {
//                     const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
//                     if (!data.verifiedLIDs) data.verifiedLIDs = [];
//                     if (!data.verifiedLIDs.includes(lidJid)) {
//                         data.verifiedLIDs.push(lidJid);
//                     }
//                     data.lastUpdated = new Date().toISOString();
//                     writeFileSync('./owner.json', JSON.stringify(data, null, 2));
//                 }
                
//                 console.log(`✅ AUTO-FIX: Added LID to registry: ${lidJid}`);
//                 return true;
//             } catch (error) {
//                 console.error('AUTO-FIX: Failed to add LID:', error);
//                 return false;
//             }
//         };
//     }
    
//     // ===== FIX 7: Initialize owner data on startup =====
//     setTimeout(() => {
//         if (!jidManager.owner || !jidManager.owner.cleanNumber) {
//             console.log('🔧 AUTO-FIX: Initializing owner data...');
//             jidManager.loadOwnerDataFromFile();
//         }
//     }, 1000);
    
//     console.log('✅ ===== AUTOMATIC OWNER FIX APPLIED =====\n');
//     return jidManager;
// }

// // ====== AUTO VERIFICATION SYSTEM ======
// class AutoVerification {
//     constructor() {
//         this.verificationQueue = new Map();
//         this.MAX_VERIFICATION_ATTEMPTS = 3;
//         this.VERIFICATION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
//     }
    
//     // Check if user should be auto-verified
//     shouldAutoVerify(senderNumber, ownerNumber) {
//         // Simple rule: If last 6 digits match, auto-verify
//         if (senderNumber.length >= 6 && ownerNumber.length >= 6) {
//             const senderLast6 = senderNumber.slice(-6);
//             const ownerLast6 = ownerNumber.slice(-6);
            
//             if (senderLast6 === ownerLast6) {
//                 log(`🔐 Auto-verification: Last 6 digits match (${senderLast6})`, 'success');
//                 return true;
//             }
//         }
        
//         // Check if sender number contains owner number or vice versa
//         if (senderNumber.includes(ownerNumber) || ownerNumber.includes(senderNumber)) {
//             log(`🔐 Auto-verification: Number similarity detected`, 'success');
//             return true;
//         }
        
//         return false;
//     }
    
//     // Auto-verify user and send success message
//     async autoVerifyAndNotify(sock, senderJid, senderNumber, ownerNumber) {
//         try {
//             const cleaned = jidManager.cleanJid(senderJid);
            
//             // Add to owner lists
//             if (cleaned.isLid) {
//                 jidManager.addOwnerLid(senderJid);
//             } else {
//                 jidManager.addOwnerJid(senderJid);
//             }
            
//             jidManager.addToWhitelist(senderJid);
            
//             // Send verification success message
//             const currentTime = new Date().toLocaleTimeString();
//             const successMessage = `✅ *AUTO-VERIFICATION SUCCESSFUL!*\n\n` +
//                                  `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n` +
//                                  `🔐 Verification: COMPLETE\n` +
//                                  `👤 Verified as: OWNER\n` +
//                                  `📱 Your Number: +${senderNumber}\n` +
//                                  `🔗 Device Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
//                                  `💬 Prefix: "${CURRENT_PREFIX}"\n` +
//                                  `🎛️ Mode: ${BOT_MODE}\n` +
//                                  `🕒 Time: ${currentTime}\n\n` +
//                                  `✅ You can now use all owner commands!\n` +
//                                  `📋 Use *${CURRENT_PREFIX}help* to see available commands.`;
            
//             await sock.sendMessage(senderJid, { text: successMessage });
            
//             log(`✅ Auto-verified and notified: ${senderJid}`, 'success');
            
//             // Also log to console
//             console.log(chalk.green(`
// ╔════════════════════════════════════════════════╗
// ║         🔐 AUTO-VERIFICATION SUCCESS           ║
// ╠════════════════════════════════════════════════╣
// ║  ✅ Verified: +${senderNumber}                  
// ║  🔗 JID: ${senderJid.substring(0, 30)}...
// ║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
// ║  🕒 Time: ${currentTime}                 
// ╚════════════════════════════════════════════════╝
// `));
            
//             return true;
//         } catch (error) {
//             log(`❌ Auto-verification failed: ${error.message}`, 'error');
//             return false;
//         }
//     }
    
//     // Check and auto-verify on first message
//     async checkAndAutoVerify(sock, msg) {
//         if (!AUTO_VERIFICATION_ENABLED || !OWNER_CLEAN_NUMBER) {
//             return false;
//         }
        
//         const senderJid = msg.key.participant || msg.key.remoteJid;
//         const cleaned = jidManager.cleanJid(senderJid);
//         const senderNumber = cleaned.cleanNumber;
        
//         // Skip if already verified
//         if (jidManager.isOwner(msg)) {
//             return true;
//         }
        
//         // Check if should auto-verify
//         if (this.shouldAutoVerify(senderNumber, OWNER_CLEAN_NUMBER)) {
//             return await this.autoVerifyAndNotify(sock, senderJid, senderNumber, OWNER_CLEAN_NUMBER);
//         }
        
//         return false;
//     }
// }

// // Initialize Auto Verification
// const autoVerification = new AutoVerification();

// // ====== JID/LID HANDLING SYSTEM ======
// class JidManager {
//     constructor() {
//         this.ownerJids = new Set();
//         this.ownerLids = new Set();
//         this.owner = null; // Initialize owner object
//         this.loadOwnerData();
//         this.loadWhitelist();
        
//         // Apply automatic fix
//         applyAutomaticOwnerFix(this);
//     }
    
//     loadOwnerData() {
//         try {
//             if (existsSync(OWNER_FILE)) {
//                 const ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
//                 OWNER_JID = ownerData.OWNER_JID;
//                 OWNER_NUMBER = ownerData.OWNER_NUMBER;
                
//                 const cleanJid = this.cleanJid(OWNER_JID);
//                 OWNER_CLEAN_JID = cleanJid.cleanJid;
//                 OWNER_CLEAN_NUMBER = cleanJid.cleanNumber;
                
//                 this.ownerJids.add(OWNER_CLEAN_JID);
//                 this.ownerJids.add(OWNER_JID);
                
//                 if (ownerData.ownerLID) {
//                     OWNER_LID = ownerData.ownerLID;
//                     this.ownerLids.add(OWNER_LID);
//                 }
                
//                 if (ownerData.verifiedLIDs && Array.isArray(ownerData.verifiedLIDs)) {
//                     ownerData.verifiedLIDs.forEach(lid => {
//                         this.ownerLids.add(lid);
//                         if (lid.includes('@lid')) {
//                             this.ownerLids.add(lid.split('@')[0]);
//                         }
//                     });
//                 }
                
//                 // Set owner object
//                 this.owner = {
//                     cleanNumber: OWNER_CLEAN_NUMBER,
//                     cleanJid: OWNER_CLEAN_JID,
//                     rawJid: OWNER_JID,
//                     isLid: OWNER_CLEAN_JID?.includes('@lid') || false
//                 };
                
//                 log(`✅ Loaded owner data: ${OWNER_CLEAN_JID}`, 'success');
//                 if (OWNER_LID) {
//                     log(`✅ Loaded owner LID: ${OWNER_LID}`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`❌ Failed to load owner data: ${error.message}`, 'error');
//         }
//     }
    
//     loadWhitelist() {
//         try {
//             if (existsSync(WHITELIST_FILE)) {
//                 const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
//                 if (data.whitelist && Array.isArray(data.whitelist)) {
//                     data.whitelist.forEach(item => {
//                         WHITELIST.add(item);
//                         if (item.includes('@lid')) {
//                             this.ownerLids.add(item);
//                         } else {
//                             this.ownerJids.add(this.cleanJid(item).cleanJid);
//                         }
//                     });
//                     log(`✅ Loaded ${WHITELIST.size} whitelisted IDs`, 'success');
//                 }
//             }
//         } catch (error) {
//             log(`⚠️ Could not load whitelist: ${error.message}`, 'warning');
//         }
//     }
    
//     cleanJid(jid) {
//         if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
//         const isLid = jid.includes('@lid');
        
//         if (isLid) {
//             const lidNumber = jid.split('@')[0];
//             return {
//                 raw: jid,
//                 cleanJid: jid,
//                 cleanNumber: lidNumber,
//                 isLid: true,
//                 server: 'lid'
//             };
//         }
        
//         const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
//         const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
//         const cleanNumber = numberPart.replace(/[^0-9]/g, '');
//         const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
//         const cleanJid = `${normalizedNumber}@${serverPart}`;
        
//         return {
//             raw: jid,
//             cleanJid: cleanJid,
//             cleanNumber: normalizedNumber,
//             isLid: false,
//             hasDeviceSuffix: deviceSuffix !== undefined,
//             deviceSuffix: deviceSuffix,
//             server: serverPart
//         };
//     }
    
//     // SMART OWNER DETECTION WITH AUTO-VERIFICATION
//     isOwner(msg) {
//         if (!msg || !msg.key) return false;
        
//         const chatJid = msg.key.remoteJid;
//         const participant = msg.key.participant;
//         const senderJid = participant || chatJid;
        
//         const cleaned = this.cleanJid(senderJid);
        
//         // METHOD 1: Direct JID match
//         if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
//             log('✅ Owner detected via JID match', 'success');
//             return true;
//         }
        
//         // METHOD 2: LID match
//         if (cleaned.isLid) {
//             const lidNumber = cleaned.cleanNumber;
            
//             if (this.ownerLids.has(senderJid)) {
//                 log('✅ Owner detected via LID match', 'success');
//                 return true;
//             }
            
//             if (this.ownerLids.has(lidNumber)) {
//                 log('✅ Owner detected via LID number match', 'success');
//                 return true;
//             }
            
//             if (WHITELIST.has(senderJid) || WHITELIST.has(lidNumber)) {
//                 log('✅ Owner detected via whitelist', 'success');
//                 return true;
//             }
            
//             // Auto-verification for first LID
//             if (this.ownerLids.size === 0 && !OWNER_LID) {
//                 log('⚠️ First LID detected - auto-whitelisting as owner', 'warning');
//                 this.addOwnerLid(senderJid);
//                 return true;
//             }
//         }
        
//         // METHOD 3: Number-based verification (for auto-verification)
//         if (OWNER_CLEAN_NUMBER && cleaned.cleanNumber) {
//             const senderNumber = cleaned.cleanNumber;
            
//             // Check number similarity for auto-verification
//             if (this.isSimilarNumber(senderNumber, OWNER_CLEAN_NUMBER)) {
//                 log(`🔐 Number similarity detected: ${senderNumber} vs ${OWNER_CLEAN_NUMBER}`, 'system');
//                 // Don't auto-verify here, let the message handler do it
//                 return false;
//             }
//         }
        
//         return false;
//     }
    
//     // Check if numbers are similar enough for auto-verification
//     isSimilarNumber(num1, num2) {
//         if (!num1 || !num2) return false;
        
//         // Exact match
//         if (num1 === num2) return true;
        
//         // Check if one contains the other (for country code differences)
//         if (num1.includes(num2) || num2.includes(num1)) {
//             return true;
//         }
        
//         // Check last 6 digits (common pattern for same number)
//         if (num1.length >= 6 && num2.length >= 6) {
//             const last6Num1 = num1.slice(-6);
//             const last6Num2 = num2.slice(-6);
//             if (last6Num1 === last6Num2) {
//                 return true;
//             }
//         }
        
//         return false;
//     }
    
//     addOwnerJid(jid) {
//         const cleaned = this.cleanJid(jid);
//         this.ownerJids.add(cleaned.cleanJid);
//         this.saveToOwnerFile();
//         log(`✅ Added JID to owner list: ${cleaned.cleanJid}`, 'success');
//     }
    
//     addOwnerLid(lid) {
//         this.ownerLids.add(lid);
//         OWNER_LID = lid;
        
//         const lidNumber = lid.split('@')[0];
//         this.ownerLids.add(lidNumber);
        
//         this.saveToOwnerFile();
//         log(`✅ Added LID to owner list: ${lid}`, 'success');
//     }
    
//     addToWhitelist(id) {
//         WHITELIST.add(id);
//         this.saveWhitelist();
        
//         if (id.includes('@lid')) {
//             this.ownerLids.add(id);
//             const lidNumber = id.split('@')[0];
//             this.ownerLids.add(lidNumber);
//         } else {
//             const cleaned = this.cleanJid(id);
//             this.ownerJids.add(cleaned.cleanJid);
//         }
        
//         log(`✅ Added to whitelist: ${id}`, 'success');
//     }
    
//     saveToOwnerFile() {
//         try {
//             let ownerData = {};
//             if (existsSync(OWNER_FILE)) {
//                 ownerData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
//             }
            
//             ownerData.ownerLID = OWNER_LID;
//             ownerData.verifiedLIDs = Array.from(this.ownerLids).filter(lid => lid.includes('@lid'));
//             ownerData.ownerJIDs = Array.from(this.ownerJids);
//             ownerData.updatedAt = new Date().toISOString();
            
//             writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save owner data: ${error.message}`, 'error');
//         }
//     }
    
//     saveWhitelist() {
//         try {
//             const data = {
//                 whitelist: Array.from(WHITELIST),
//                 updatedAt: new Date().toISOString()
//             };
//             writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
//         } catch (error) {
//             log(`❌ Failed to save whitelist: ${error.message}`, 'error');
//         }
//     }
    
//     getOwnerInfo() {
//         return {
//             ownerJid: OWNER_CLEAN_JID,
//             ownerNumber: OWNER_CLEAN_NUMBER,
//             ownerLid: OWNER_LID,
//             jidCount: this.ownerJids.size,
//             lidCount: this.ownerLids.size,
//             whitelistCount: WHITELIST.size
//         };
//     }
// }

// // Initialize JID Manager (with automatic fix applied in constructor)
// const jidManager = new JidManager();

// // ====== BLOCKED USERS CHECK ======
// function isUserBlocked(jid) {
//     try {
//         if (existsSync(BLOCKED_USERS_FILE)) {
//             const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
//             return data.users && data.users.includes(jid);
//         }
//     } catch (error) {
//         // Silent fail
//     }
//     return false;
// }

// // ====== BOT MODE CHECK ======
// function checkBotMode(msg, commandName) {
//     try {
//         // Always allow owner (using the patched isOwner method)
//         if (jidManager.isOwner(msg)) {
//             log('✅ Owner bypassing mode restrictions', 'success');
//             return true;
//         }
        
//         // Load mode
//         if (existsSync(BOT_MODE_FILE)) {
//             const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
//             BOT_MODE = modeData.mode || 'public';
//         } else {
//             BOT_MODE = 'public';
//         }
        
//         const chatJid = msg.key.remoteJid;
        
//         // Check mode restrictions
//         switch(BOT_MODE) {
//             case 'public':
//                 return true;
//             case 'private':
//                 return false;
//             case 'silent':
//                 // Silent mode: ignore non-owners completely (no messages sent)
//                 log(`🔇 Silent mode - ignoring non-owner: ${chatJid}`, 'warning');
//                 return false;
//             case 'group-only':
//                 return chatJid.includes('@g.us');
//             case 'maintenance':
//                 const allowedCommands = ['ping', 'status', 'uptime', 'help'];
//                 return allowedCommands.includes(commandName);
//             default:
//                 return true;
//         }
//     } catch (error) {
//         log(`❌ Mode check error: ${error.message}`, 'error');
//         return true;
//     }
// }

// // ====== PREFIX MANAGEMENT ======
// function loadPrefix() {
//     try {
//         if (existsSync(PREFIX_CONFIG_FILE)) {
//             const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
//             if (config.prefix && config.prefix.length <= 2) {
//                 CURRENT_PREFIX = config.prefix;
//                 log(`✅ Loaded custom prefix: "${CURRENT_PREFIX}"`, 'success');
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Failed to load prefix config: ${error.message}`, 'warning');
//     }
// }

// // ====== CONNECTION MANAGEMENT ======
// function startHeartbeat(sock) {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//     }
    
//     heartbeatInterval = setInterval(async () => {
//         if (isConnected && sock) {
//             try {
//                 await sock.sendPresenceUpdate('available');
//                 lastActivityTime = Date.now();
                
//                 if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
//                     store.clear();
//                 }
                
//                 if (Date.now() % (30 * 60 * 1000) < 1000) {
//                     const uptime = process.uptime();
//                     const hours = Math.floor(uptime / 3600);
//                     const minutes = Math.floor((uptime % 3600) / 60);
//                     log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
//                 }
//             } catch (error) {
//                 log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
//             }
//         }
//     }, 60 * 1000);
    
//     log('💓 Heartbeat system started', 'success');
// }

// function stopHeartbeat() {
//     if (heartbeatInterval) {
//         clearInterval(heartbeatInterval);
//         heartbeatInterval = null;
//     }
// }

// // ====== SESSION MANAGEMENT ======
// function ensureSessionDir() {
//     if (!existsSync(SESSION_DIR)) {
//         fs.mkdirSync(SESSION_DIR, { recursive: true });
//         log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
//     }
// }

// function cleanSession() {
//     try {
//         log('🧹 Cleaning session data...', 'warning');
        
//         if (existsSync(SESSION_DIR)) {
//             fs.rmSync(SESSION_DIR, { recursive: true, force: true });
//             log('✅ Cleared session directory', 'success');
//         }
        
//         return true;
//     } catch (error) {
//         log(`❌ Cleanup error: ${error}`, 'error');
//         return false;
//     }
// }

// // ====== LIGHTWEIGHT MESSAGE STORE ======
// class MessageStore {
//     constructor() {
//         this.messages = new Map();
//         this.maxMessages = 100;
//     }
    
//     addMessage(jid, messageId, message) {
//         try {
//             const key = `${jid}|${messageId}`;
//             this.messages.set(key, {
//                 ...message,
//                 timestamp: Date.now()
//             });
            
//             if (this.messages.size > this.maxMessages) {
//                 const oldestKey = this.messages.keys().next().value;
//                 this.messages.delete(oldestKey);
//             }
//         } catch (error) {
//             // Silent fail
//         }
//     }
    
//     getMessage(jid, messageId) {
//         try {
//             const key = `${jid}|${messageId}`;
//             return this.messages.get(key) || null;
//         } catch (error) {
//             return null;
//         }
//     }
    
//     clear() {
//         this.messages.clear();
//     }
// }

// // ====== COMMAND LOADER ======
// const commands = new Map();
// const commandCategories = new Map();

// async function loadCommandsFromFolder(folderPath, category = 'general') {
//     const absolutePath = path.resolve(folderPath);
    
//     if (!existsSync(absolutePath)) {
//         log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
//         return;
//     }
    
//     try {
//         const items = fs.readdirSync(absolutePath);
//         let categoryCount = 0;
        
//         for (const item of items) {
//             const fullPath = path.join(absolutePath, item);
//             const stat = fs.statSync(fullPath);
            
//             if (stat.isDirectory()) {
//                 await loadCommandsFromFolder(fullPath, item);
//             } else if (item.endsWith('.js')) {
//                 try {
//                     if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
//                     const commandModule = await import(`file://${fullPath}`);
//                     const command = commandModule.default || commandModule;
                    
//                     if (command && command.name) {
//                         command.category = category;
//                         commands.set(command.name.toLowerCase(), command);
                        
//                         if (!commandCategories.has(category)) {
//                             commandCategories.set(category, []);
//                         }
//                         commandCategories.get(category).push(command.name);
                        
//                         log(`✅ [${category}] Loaded: ${command.name}`, 'success');
//                         categoryCount++;
                        
//                         if (Array.isArray(command.alias)) {
//                             command.alias.forEach(alias => {
//                                 commands.set(alias.toLowerCase(), command);
//                             });
//                         }
//                     }
//                 } catch (error) {
//                     log(`❌ Failed to load: ${item}`, 'error');
//                 }
//             }
//         }
        
//         if (categoryCount > 0) {
//             log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
//         }
//     } catch (error) {
//         log(`❌ Error reading folder: ${folderPath}`, 'error');
//     }
// }

// // ====== SIMPLIFIED LOGIN SYSTEM ======
// class LoginManager {
//     constructor() {
//         this.rl = readline.createInterface({
//             input: process.stdin,
//             output: process.stdout
//         });
//     }
    
//     async selectMode() {
//         console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
//         console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
//         console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
//         const choice = await this.ask('Choose option (1-2, default 1): ');
        
//         switch (choice.trim()) {
//             case '1':
//                 return await this.pairingCodeMode();
//             case '2':
//                 return await this.cleanStartMode();
//             default:
//                 return await this.pairingCodeMode();
//         }
//     }
    
//     async pairingCodeMode() {
//         console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
//         console.log(chalk.gray('Enter phone number with country code (without +)'));
//         console.log(chalk.gray('Example: 254788710904'));
        
//         const phone = await this.ask('Phone number: ');
//         const cleanPhone = phone.replace(/[^0-9]/g, '');
        
//         if (!cleanPhone || cleanPhone.length < 10) {
//             console.log(chalk.red('❌ Invalid phone number'));
//             return await this.selectMode();
//         }
        
//         return { mode: 'pair', phone: cleanPhone };
//     }
    
//     async cleanStartMode() {
//         console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
//         console.log(chalk.red('This will delete all session data!'));
        
//         const confirm = await this.ask('Are you sure? (y/n): ');
        
//         if (confirm.toLowerCase() === 'y') {
//             cleanSession();
//             console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
//             return await this.pairingCodeMode();
//         } else {
//             return await this.pairingCodeMode();
//         }
//     }
    
//     ask(question) {
//         return new Promise((resolve) => {
//             this.rl.question(chalk.yellow(question), (answer) => {
//                 resolve(answer);
//             });
//         });
//     }
    
//     close() {
//         if (this.rl) this.rl.close();
//     }
// }

// // ====== BOT HANDLER AUTO-PATCH ======
// function patchBotHandlerForOwnerFix() {
//     console.log('🔧 Applying bot handler patches...');
    
//     // This function patches the global message handler behavior
//     // The main fix is already in jidManager.isOwner()
    
//     console.log('✅ Bot handler patches applied');
// }

// // ====== MAIN BOT INITIALIZATION ======
// async function startBot(loginMode = 'pair', phoneNumber = null) {
//     try {
//         log('🔧 Initializing WhatsApp connection...', 'info');
        
//         loadPrefix();
        
//         log('📂 Loading commands...', 'info');
//         commands.clear();
//         commandCategories.clear();
        
//         await loadCommandsFromFolder('./commands');
//         log(`✅ Loaded ${commands.size} commands`, 'success');
        
//         // Apply bot handler patches
//         patchBotHandlerForOwnerFix();
        
//         store = new MessageStore();
//         ensureSessionDir();
        
//         const { default: makeWASocket } = await import('@whiskeysockets/baileys');
//         const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
//         const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
//         const customLogger = {
//             level: 'silent',
//             trace: () => {},
//             debug: () => {},
//             info: () => {},
//             warn: () => {},
//             error: () => {},
//             fatal: () => {},
//             child: () => customLogger
//         };
        
//         let state, saveCreds;
//         try {
//             log('🔐 Loading authentication...', 'info');
//             const authState = await useMultiFileAuthState(SESSION_DIR);
//             state = authState.state;
//             saveCreds = authState.saveCreds;
//             log('✅ Auth loaded', 'success');
//         } catch (error) {
//             log(`❌ Auth error: ${error.message}`, 'error');
//             cleanSession();
//             const freshAuth = await useMultiFileAuthState(SESSION_DIR);
//             state = freshAuth.state;
//             saveCreds = freshAuth.saveCreds;
//         }
        
//         const { version } = await fetchLatestBaileysVersion();
        
//         const sock = makeWASocket({
//             version,
//             logger: customLogger,
//             browser: Browsers.ubuntu('Chrome'),
//             printQRInTerminal: false,
//             auth: {
//                 creds: state.creds,
//                 keys: makeCacheableSignalKeyStore(state.keys, customLogger),
//             },
//             markOnlineOnConnect: true,
//             generateHighQualityLinkPreview: true,
//             connectTimeoutMs: 60000,
//             keepAliveIntervalMs: 20000,
//             emitOwnEvents: true,
//             mobile: false,
//             getMessage: async (key) => {
//                 return store?.getMessage(key.remoteJid, key.id) || null;
//             },
//             defaultQueryTimeoutMs: 30000,
//             retryRequestDelayMs: 1000,
//             maxRetryCount: 3,
//             syncFullHistory: false,
//             fireInitQueries: true,
//             transactionOpts: {
//                 maxCommitRetries: 3,
//                 delayBetweenTriesMs: 1000
//             },
//             shouldIgnoreJid: (jid) => {
//                 return jid.includes('status@broadcast') || 
//                        jid.includes('broadcast') ||
//                        jid.includes('newsletter');
//             }
//         });
        
//         SOCKET_INSTANCE = sock;
//         connectionAttempts = 0;
        
//         // ====== EVENT HANDLERS ======
        
//         sock.ev.on('connection.update', async (update) => {
//             const { connection, lastDisconnect } = update;
            
//             if (connection === 'open') {
//                 isConnected = true;
//                 startHeartbeat(sock);
//                 await handleSuccessfulConnection(sock, loginMode, phoneNumber);
//             }
            
//             if (connection === 'close') {
//                 isConnected = false;
//                 stopHeartbeat();
//                 await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
//             }
            
//             if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
//                 setTimeout(async () => {
//                     try {
//                         const code = await sock.requestPairingCode(phoneNumber);
//                         const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
//                         console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════╗
// ║              🔗 PAIRING CODE                   ║
// ╠════════════════════════════════════════════════╣
// ║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
// ║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
// ║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
// ╚════════════════════════════════════════════════╝
// `));
//                     } catch (error) {
//                         log(`❌ Pairing failed: ${error.message}`, 'error');
//                     }
//                 }, 3000);
//             }
//         });
        
//         sock.ev.on('creds.update', saveCreds);
        
//         // Message handling
//         sock.ev.on('messages.upsert', async ({ messages, type }) => {
//             if (type !== 'notify') return;
            
//             const msg = messages[0];
//             if (!msg.message) return;
            
//             lastActivityTime = Date.now();
            
//             if (msg.key.remoteJid === 'status@broadcast' || 
//                 msg.key.remoteJid.includes('broadcast')) {
//                 return;
//             }
            
//             const messageId = msg.key.id;
            
//             if (store) {
//                 store.addMessage(msg.key.remoteJid, messageId, {
//                     message: msg.message,
//                     key: msg.key,
//                     timestamp: Date.now()
//                 });
//             }
            
//             await handleIncomingMessage(sock, msg);
//         });
        
//         return sock;
        
//     } catch (error) {
//         log(`❌ Bot initialization failed: ${error.message}`, 'error');
//         throw error;
//     }
// }

// // ====== CONNECTION HANDLERS ======
// async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
//     const currentTime = new Date().toLocaleTimeString();
    
//     OWNER_JID = sock.user.id;
//     OWNER_NUMBER = OWNER_JID.split('@')[0];
    
//     jidManager.addOwnerJid(OWNER_JID);
    
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     const ownerData = {
//         OWNER_NUMBER,
//         OWNER_JID,
//         OWNER_CLEAN_JID: ownerInfo.ownerJid,
//         OWNER_CLEAN_NUMBER: ownerInfo.ownerNumber,
//         OWNER_LID: ownerInfo.ownerLid,
//         linkedAt: new Date().toISOString(),
//         loginMethod: loginMode,
//         phoneNumber: phoneNumber,
//         version: VERSION
//     };
    
//     writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
//     // Ensure global variables are set
//     global.OWNER_NUMBER = OWNER_CLEAN_NUMBER;
//     global.OWNER_CLEAN_NUMBER = OWNER_CLEAN_NUMBER;
//     global.OWNER_JID = OWNER_CLEAN_JID;
//     global.OWNER_CLEAN_JID = OWNER_CLEAN_JID;
    
//     console.clear();
//     console.log(chalk.greenBright(`
// ╔════════════════════════════════════════════════════════╗
// ║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
// ╠════════════════════════════════════════════════════════╣
// ║  ✅ Connected successfully!                            
// ║  👑 Owner : +${ownerInfo.ownerNumber}
// ║  🔧 Clean JID : ${ownerInfo.ownerJid}
// ║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
// ║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
// ║  🕒 Time   : ${chalk.yellow(currentTime)}                 
// ║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
// ║  💬 Prefix : "${CURRENT_PREFIX}"
// ║  🎛️ Mode   : ${BOT_MODE}
// ║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
// ║  📊 Commands: ${commands.size} commands loaded
// ║  📋 Whitelist: ${ownerInfo.whitelistCount} IDs
// ║  🔧 AUTO-FIX : ✅ ENABLED
// ╚════════════════════════════════════════════════════════╝
// `));
    
//     // Send connection success message to owner
//     try {
//         await sock.sendMessage(OWNER_JID, {
//             text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: ${CURRENT_PREFIX}\n🎛️ Mode: ${BOT_MODE}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n🔧 Auto-fix: ✅ ENABLED\n\nUse *${CURRENT_PREFIX}help* for commands.`
//         });
//     } catch (error) {
//         // Silent fail
//     }
// }

// async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
//     const statusCode = lastDisconnect?.error?.output?.statusCode;
//     const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
//     connectionAttempts++;
    
//     log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
//     // Handle "conflict" differently
//     if (reason.includes('conflict') || statusCode === 409) {
//         log('⚠️ Device conflict detected - waiting before reconnect', 'warning');
//         const conflictDelay = 30000;
//         log(`🔄 Waiting ${conflictDelay/1000}s due to conflict...`, 'info');
        
//         setTimeout(async () => {
//             await startBot(loginMode, phoneNumber);
//         }, conflictDelay);
//         return;
//     }
    
//     if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
//         log('🔓 Session invalid, cleaning...', 'warning');
//         cleanSession();
//     }
    
//     const baseDelay = 5000;
//     const maxDelay = 60000;
//     const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
//     log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
//     setTimeout(async () => {
//         if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
//             log('❌ Max retry attempts reached. Restarting process...', 'error');
//             connectionAttempts = 0;
//             process.exit(1);
//         } else {
//             await startBot(loginMode, phoneNumber);
//         }
//     }, delayTime);
// }

// // ====== MESSAGE HANDLER ======
// async function handleIncomingMessage(sock, msg) {
//     try {
//         const chatId = msg.key.remoteJid;
//         const senderJid = msg.key.participant || chatId;
        
//         // Check if sender is blocked
//         if (isUserBlocked(senderJid)) {
//             log(`⛔ Message from blocked user: ${senderJid}`, 'warning');
//             return;
//         }
        
//         // ====== AUTO-VERIFICATION CHECK ======
//         // Check if this is the first message from a potential owner
//         if (!jidManager.isOwner(msg) && OWNER_CLEAN_NUMBER) {
//             const cleaned = jidManager.cleanJid(senderJid);
//             const senderNumber = cleaned.cleanNumber;
            
//             // Check if sender number is similar to owner number
//             if (jidManager.isSimilarNumber(senderNumber, OWNER_CLEAN_NUMBER)) {
//                 log(`🔐 Potential owner detected: ${senderNumber}`, 'info');
                
//                 // Auto-verify and notify
//                 await autoVerification.autoVerifyAndNotify(sock, senderJid, senderNumber, OWNER_CLEAN_NUMBER);
//             }
//         }
        
//         const textMsg = msg.message.conversation || 
//                        msg.message.extendedTextMessage?.text || 
//                        msg.message.imageMessage?.caption || 
//                        msg.message.videoMessage?.caption || '';
        
//         if (!textMsg) return;
        
//         if (textMsg.startsWith(CURRENT_PREFIX)) {
//             const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
//             const commandName = parts[0].toLowerCase();
//             const args = parts.slice(1);
            
//             log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
//             // Check bot mode restrictions
//             if (!checkBotMode(msg, commandName)) {
//                 log(`⛔ Command blocked by ${BOT_MODE} mode`, 'warning');
//                 // In silent mode, don't send any messages to non-owners
//                 if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
//                     return;
//                 }
//                 try {
//                     await sock.sendMessage(chatId, { 
//                         text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
//                     });
//                 } catch (error) {
//                     log(`⚠️ Failed to send mode block message: ${error.message}`, 'warning');
//                 }
//                 return;
//             }
            
//             const command = commands.get(commandName);
//             if (command) {
//                 try {
//                     // Check if command is owner-only
//                     if (command.ownerOnly && !jidManager.isOwner(msg)) {
//                         log(`⛔ Non-owner tried to use owner command: ${commandName}`, 'warning');
//                         try {
//                             await sock.sendMessage(chatId, { 
//                                 text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
//                             });
//                         } catch (error) {
//                             log(`⚠️ Failed to send owner-only warning: ${error.message}`, 'warning');
//                         }
//                         return;
//                     }
                    
//                     await command.execute(sock, msg, args, CURRENT_PREFIX, {
//                         OWNER_NUMBER: OWNER_CLEAN_NUMBER,
//                         OWNER_JID: OWNER_CLEAN_JID,
//                         OWNER_LID: OWNER_LID,
//                         BOT_NAME,
//                         VERSION,
//                         isOwner: () => jidManager.isOwner(msg),
//                         jidManager,
//                         store
//                     });
//                 } catch (error) {
//                     log(`❌ Command error: ${error.message}`, 'error');
//                 }
//             } else {
//                 await handleDefaultCommands(commandName, sock, msg, args);
//             }
//         }
//     } catch (error) {
//         log(`⚠️ Message handler error: ${error.message}`, 'warning');
//     }
// }

// // ====== DEFAULT COMMANDS ======
// async function handleDefaultCommands(commandName, sock, msg, args) {
//     const chatId = msg.key.remoteJid;
//     const isOwnerUser = jidManager.isOwner(msg);
//     const ownerInfo = jidManager.getOwnerInfo();
    
//     try {
//         switch (commandName) {
//             case 'ping':
//                 const start = Date.now();
//                 const latency = Date.now() - start;
//                 await sock.sendMessage(chatId, { 
//                     text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
//                 helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
//                 helpText += `Mode: ${BOT_MODE}\n`;
//                 helpText += `Commands: ${commands.size}\n\n`;
                
//                 for (const [category, cmds] of commandCategories.entries()) {
//                     helpText += `*${category.toUpperCase()}*\n`;
//                     helpText += `${cmds.slice(0, 6).join(', ')}`;
//                     if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
//                     helpText += '\n\n';
//                 }
                
//                 helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
//                 await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
//                 break;
                
//             case 'uptime':
//                 const uptime = process.uptime();
//                 const hours = Math.floor(uptime / 3600);
//                 const minutes = Math.floor((uptime % 3600) / 60);
//                 const seconds = Math.floor(uptime % 60);
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n🔗 LID: ${ownerInfo.ownerLid || 'None'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//                 await sock.sendMessage(chatId, {
//                     text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${ownerInfo.ownerNumber}\n🔗 Owner LID: ${ownerInfo.ownerLid || 'None'}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
//                 }, { quoted: msg });
//                 break;
                
//             case 'clean':
//                 if (!isOwnerUser) {
//                     await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
//                     return;
//                 }
                
//                 await sock.sendMessage(chatId, { 
//                     text: '🧹 Cleaning session and restarting...' 
//                 });
                
//                 setTimeout(() => {
//                     cleanSession();
//                     process.exit(1);
//                 }, 2000);
//                 break;
                
//             case 'ownerinfo':
//                 const senderJid = msg.key.participant || chatId;
//                 const cleaned = jidManager.cleanJid(senderJid);
                
//                 let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
//                 ownerInfoText += `📱 Your JID: ${senderJid}\n`;
//                 ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
//                 ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
//                 ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
//                 ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
//                 ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
//                 ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n\n`;
                
//                 ownerInfoText += `*BOT OWNER DETAILS:*\n`;
//                 ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
//                 ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
//                 ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
//                 ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
//                 ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
//                 if (!isOwnerUser) {
//                     ownerInfoText += `\n\n⚠️ You are not recognized as owner.\nAuto-verification will trigger on first message.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: ownerInfoText
//                 }, { quoted: msg });
//                 break;
//         }
//     } catch (error) {
//         // Silent fail for command errors
//     }
// }

// // ====== MAIN APPLICATION ======
// async function main() {
//     try {
//         log('🚀 Starting Silent Wolf Bot...', 'info');
        
//         const loginManager = new LoginManager();
//         const { mode, phone } = await loginManager.selectMode();
//         loginManager.close();
        
//         await startBot(mode, phone);
        
//     } catch (error) {
//         log(`💥 Fatal error: ${error.message}`, 'error');
//         log('🔄 Restarting in 10s...', 'info');
//         await delay(10000);
//         main();
//     }
// }

// // ====== PROCESS HANDLERS ======
// process.on('SIGINT', () => {
//     console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
//     stopHeartbeat();
//     if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
//     process.exit(0);
// });

// process.on('uncaughtException', (error) => {
//     if (error.message.includes('SessionError') || 
//         error.message.includes('Bad MAC') ||
//         error.message.includes('decrypt') ||
//         error.message.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
// });

// process.on('unhandledRejection', (error) => {
//     if (error?.message?.includes('SessionError') || 
//         error?.message?.includes('Bad MAC') ||
//         error?.message?.includes('decrypt') ||
//         error?.message?.includes('transaction failed')) {
//         return;
//     }
//     log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
// });

// // Start the bot
// main().catch(error => {
//     log(`💥 Critical startup error: ${error.message}`, 'error');
//     process.exit(1);
// });

// // Auto-restart if process hangs
// setInterval(() => {
//     const now = Date.now();
//     const inactivityThreshold = 5 * 60 * 1000;
    
//     if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
//         log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
//         if (SOCKET_INSTANCE) {
//             SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
//         }
//     }
// }, 60000);






























// ====== SILENT WOLF BOT - ULTIMATE VERSION ======
// Production-ready with 24/7 reliability and clean terminal

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';

// ====== ENVIRONMENT SETUP ======
dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====== CONFIGURATION ======
const SESSION_DIR = './session';
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '4.0.0'; // Ultimate stable version
const PREFIX = process.env.PREFIX || '.';
const OWNER_FILE = './owner.json';
const PREFIX_CONFIG_FILE = './prefix_config.json';
const BOT_MODE_FILE = './bot_mode.json';
const WHITELIST_FILE = './whitelist.json';
const BLOCKED_USERS_FILE = './blocked_users.json';

// ====== CLEAN CONSOLE SETUP ======
console.clear();
console.log = (function() {
    const original = console.log;
    return function(...args) {
        // Filter out unwanted logs
        const message = args.join(' ');
        if (message.includes('Buffer timeout reached') ||
            message.includes('transaction failed, rolling back') ||
            message.includes('failed to decrypt message') ||
            message.includes('received error in ack') ||
            message.includes('Closing session: SessionEntry') ||
            message.includes('SessionError') ||
            message.includes('Bad MAC')) {
            return; // Suppress these logs
        }
        
        // Format clean logs
        const timestamp = new Date().toLocaleTimeString();
        const formatted = `[${timestamp}] ${message}`;
        original.call(console, formatted);
    };
})();

// Global variables
let OWNER_NUMBER = null;
let OWNER_JID = null;
let OWNER_CLEAN_JID = null;
let OWNER_CLEAN_NUMBER = null;
let OWNER_LID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;
let store = null;
let heartbeatInterval = null;
let lastActivityTime = Date.now();
let connectionAttempts = 0;
let MAX_RETRY_ATTEMPTS = 10;
let CURRENT_PREFIX = PREFIX;
let BOT_MODE = 'public';
let WHITELIST = new Set();
let AUTO_LINK_ENABLED = true; // Enable automatic owner linking

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('ULTIMATE EDITION')}  
║   ⚙️ Version : ${VERSION}
║   💬 Prefix  : "${PREFIX}"
║   🔒 Session: Enhanced Signal Handling
║   ⏰ Uptime : 24/7 Reliable
╚════════════════════════════════════════════════╝
`));

// ====== UTILITY FUNCTIONS ======
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Enhanced logging with suppression
function log(message, type = 'info') {
    const colors = {
        info: chalk.blue,
        success: chalk.green,
        warning: chalk.yellow,
        error: chalk.red,
        event: chalk.magenta,
        command: chalk.cyan,
        system: chalk.white
    };
    
    const color = colors[type] || chalk.white;
    console.log(color(message));
}

// ====== HELPER FUNCTIONS ======
function existsSync(path) {
    return fs.existsSync(path);
}

function readFileSync(path, encoding = 'utf8') {
    return fs.readFileSync(path, encoding);
}

function writeFileSync(path, data) {
    return fs.writeFileSync(path, data);
}

// ====== JID/LID HANDLING SYSTEM ======
class JidManager {
    constructor() {
        this.ownerJids = new Set(); // Store current owner's JIDs only
        this.ownerLids = new Set(); // Store current owner's LIDs only
        this.owner = null; // Current owner object
        this.ownerFileData = {}; // Data from owner.json
        
        this.loadOwnerData();
        this.loadWhitelist();
        
        log(`✅ JID Manager initialized. Current owner: ${this.owner?.cleanNumber || 'None'}`, 'success');
    }
    
    // Load owner data from file
    loadOwnerData() {
        try {
            if (existsSync(OWNER_FILE)) {
                this.ownerFileData = JSON.parse(readFileSync(OWNER_FILE, 'utf8'));
                
                const ownerJid = this.ownerFileData.OWNER_JID;
                const ownerNumber = this.ownerFileData.OWNER_NUMBER;
                
                if (ownerJid) {
                    const cleaned = this.cleanJid(ownerJid);
                    
                    // Set current owner
                    this.owner = {
                        rawJid: ownerJid,
                        cleanJid: cleaned.cleanJid,
                        cleanNumber: cleaned.cleanNumber,
                        isLid: cleaned.isLid,
                        linkedAt: this.ownerFileData.linkedAt || new Date().toISOString()
                    };
                    
                    // Clear previous data and set ONLY current owner
                    this.ownerJids.clear();
                    this.ownerLids.clear();
                    
                    // Add owner's JID
                    this.ownerJids.add(cleaned.cleanJid);
                    this.ownerJids.add(ownerJid);
                    
                    // Add owner's LID if exists
                    if (cleaned.isLid) {
                        this.ownerLids.add(ownerJid);
                        const lidNumber = ownerJid.split('@')[0];
                        this.ownerLids.add(lidNumber);
                        OWNER_LID = ownerJid;
                    }
                    
                    // Load verified LIDs for current owner only
                    if (this.ownerFileData.verifiedLIDs && Array.isArray(this.ownerFileData.verifiedLIDs)) {
                        this.ownerFileData.verifiedLIDs.forEach(lid => {
                            if (lid && lid.includes('@lid')) {
                                this.ownerLids.add(lid);
                                const lidNum = lid.split('@')[0];
                                this.ownerLids.add(lidNum);
                            }
                        });
                    }
                    
                    // Update global variables
                    OWNER_JID = ownerJid;
                    OWNER_NUMBER = ownerNumber;
                    OWNER_CLEAN_JID = cleaned.cleanJid;
                    OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
                    
                    log(`✅ Loaded owner data: ${cleaned.cleanJid}`, 'success');
                }
            }
        } catch (error) {
            log(`❌ Failed to load owner data: ${error.message}`, 'error');
        }
    }
    
    // Load whitelist
    loadWhitelist() {
        try {
            if (existsSync(WHITELIST_FILE)) {
                const data = JSON.parse(readFileSync(WHITELIST_FILE, 'utf8'));
                if (data.whitelist && Array.isArray(data.whitelist)) {
                    data.whitelist.forEach(item => {
                        WHITELIST.add(item);
                    });
                    log(`✅ Loaded ${WHITELIST.size} whitelisted IDs`, 'success');
                }
            }
        } catch (error) {
            log(`⚠️ Could not load whitelist: ${error.message}`, 'warning');
        }
    }
    
    // Clean JID function
    cleanJid(jid) {
        if (!jid) return { cleanJid: '', cleanNumber: '', raw: jid, isLid: false };
        
        const isLid = jid.includes('@lid');
        
        if (isLid) {
            const lidNumber = jid.split('@')[0];
            return {
                raw: jid,
                cleanJid: jid,
                cleanNumber: lidNumber,
                isLid: true,
                server: 'lid'
            };
        }
        
        const [numberPart, deviceSuffix] = jid.split('@')[0].split(':');
        const serverPart = jid.split('@')[1] || 's.whatsapp.net';
        
        const cleanNumber = numberPart.replace(/[^0-9]/g, '');
        const normalizedNumber = cleanNumber.startsWith('0') ? cleanNumber.substring(1) : cleanNumber;
        const cleanJid = `${normalizedNumber}@${serverPart}`;
        
        return {
            raw: jid,
            cleanJid: cleanJid,
            cleanNumber: normalizedNumber,
            isLid: false,
            hasDeviceSuffix: deviceSuffix !== undefined,
            deviceSuffix: deviceSuffix,
            server: serverPart
        };
    }
    
    // ====== OWNER DETECTION - STRICT MODE ======
    isOwner(msg) {
        if (!msg || !msg.key) return false;
        
        const chatJid = msg.key.remoteJid;
        const participant = msg.key.participant;
        const senderJid = participant || chatJid;
        const cleaned = this.cleanJid(senderJid);
        
        // If no owner is set yet, auto-link this user
        if (!this.owner || !this.owner.cleanNumber) {
            log(`⚠️ No owner set, will auto-link: ${cleaned.cleanJid}`, 'warning');
            return false;
        }
        
        // ====== METHOD 1: Direct JID match with CURRENT owner ======
        if (this.ownerJids.has(cleaned.cleanJid) || this.ownerJids.has(senderJid)) {
            return true;
        }
        
        // ====== METHOD 2: LID match with CURRENT owner ======
        if (cleaned.isLid) {
            const lidNumber = cleaned.cleanNumber;
            
            // Check if this LID belongs to current owner
            if (this.ownerLids.has(senderJid) || this.ownerLids.has(lidNumber)) {
                return true;
            }
            
            // Check if current owner has this LID
            if (OWNER_LID && (senderJid === OWNER_LID || lidNumber === OWNER_LID.split('@')[0])) {
                return true;
            }
        }
        
        // ====== METHOD 3: Number similarity check (for auto-linking) ======
        if (this.owner.cleanNumber && cleaned.cleanNumber) {
            // Check if numbers are similar (auto-linking logic)
            if (this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
                log(`🔍 Number similarity detected: ${cleaned.cleanNumber} vs ${this.owner.cleanNumber}`, 'system');
                // This triggers auto-linking in message handler
                return false;
            }
        }
        
        return false;
    }
    
    // Check if numbers are similar (for auto-linking)
    isSimilarNumber(num1, num2) {
        if (!num1 || !num2) return false;
        
        // Exact match
        if (num1 === num2) return true;
        
        // Check if one contains the other
        if (num1.includes(num2) || num2.includes(num1)) {
            return true;
        }
        
        // Check last 6 digits
        if (num1.length >= 6 && num2.length >= 6) {
            const last6Num1 = num1.slice(-6);
            const last6Num2 = num2.slice(-6);
            if (last6Num1 === last6Num2) {
                return true;
            }
        }
        
        return false;
    }
    
    // ====== CRITICAL: CLEAR ALL PREVIOUS DATA & SET NEW OWNER ======
    setNewOwner(newJid, isAutoLinked = false) {
        try {
            log(`🔄 Setting new owner: ${newJid}`, 'warning');
            
            const cleaned = this.cleanJid(newJid);
            
            // ====== CLEAR ALL PREVIOUS DATA ======
            this.ownerJids.clear();
            this.ownerLids.clear();
            WHITELIST.clear();
            
            // ====== SET NEW OWNER DATA ======
            this.owner = {
                rawJid: newJid,
                cleanJid: cleaned.cleanJid,
                cleanNumber: cleaned.cleanNumber,
                isLid: cleaned.isLid,
                linkedAt: new Date().toISOString(),
                autoLinked: isAutoLinked
            };
            
            // Add to sets
            this.ownerJids.add(cleaned.cleanJid);
            this.ownerJids.add(newJid);
            
            if (cleaned.isLid) {
                this.ownerLids.add(newJid);
                const lidNumber = newJid.split('@')[0];
                this.ownerLids.add(lidNumber);
                OWNER_LID = newJid;
            } else {
                OWNER_LID = null;
            }
            
            // ====== UPDATE GLOBAL VARIABLES ======
            OWNER_JID = newJid;
            OWNER_NUMBER = cleaned.cleanNumber;
            OWNER_CLEAN_JID = cleaned.cleanJid;
            OWNER_CLEAN_NUMBER = cleaned.cleanNumber;
            
            // ====== SAVE TO FILES ======
            const ownerData = {
                OWNER_JID: newJid,
                OWNER_NUMBER: cleaned.cleanNumber,
                OWNER_CLEAN_JID: cleaned.cleanJid,
                OWNER_CLEAN_NUMBER: cleaned.cleanNumber,
                ownerLID: cleaned.isLid ? newJid : null,
                verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
                linkedAt: new Date().toISOString(),
                autoLinked: isAutoLinked,
                previousOwnerCleared: true,
                version: VERSION
            };
            
            writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            
            // Clear whitelist file
            const whitelistData = {
                whitelist: [],
                updatedAt: new Date().toISOString(),
                note: "Cleared by new owner linking"
            };
            writeFileSync(WHITELIST_FILE, JSON.stringify(whitelistData, null, 2));
            
            log(`✅ New owner set successfully: ${cleaned.cleanJid}`, 'success');
            log(`📊 Previous data cleared, only this owner is registered now`, 'system');
            
            return {
                success: true,
                owner: this.owner,
                isLid: cleaned.isLid
            };
            
        } catch (error) {
            log(`❌ Failed to set new owner: ${error.message}`, 'error');
            return { success: false, error: error.message };
        }
    }
    
    // Add additional JID/LID for current owner (for multi-device)
    addAdditionalDevice(jid) {
        try {
            if (!this.owner) {
                log(`❌ No owner set, cannot add device`, 'error');
                return false;
            }
            
            const cleaned = this.cleanJid(jid);
            
            // Check if this device belongs to current owner
            if (!this.isSimilarNumber(cleaned.cleanNumber, this.owner.cleanNumber)) {
                log(`❌ Device number doesn't match owner: ${cleaned.cleanNumber} vs ${this.owner.cleanNumber}`, 'error');
                return false;
            }
            
            if (cleaned.isLid) {
                this.ownerLids.add(jid);
                const lidNumber = jid.split('@')[0];
                this.ownerLids.add(lidNumber);
                log(`✅ Added LID device for owner: ${jid}`, 'success');
            } else {
                this.ownerJids.add(cleaned.cleanJid);
                this.ownerJids.add(jid);
                log(`✅ Added JID device for owner: ${cleaned.cleanJid}`, 'success');
            }
            
            // Update owner file
            this.saveOwnerData();
            
            return true;
        } catch (error) {
            log(`❌ Failed to add device: ${error.message}`, 'error');
            return false;
        }
    }
    
    // Save current owner data to file
    saveOwnerData() {
        try {
            if (!this.owner) return false;
            
            const ownerData = {
                OWNER_JID: this.owner.rawJid,
                OWNER_NUMBER: this.owner.cleanNumber,
                OWNER_CLEAN_JID: this.owner.cleanJid,
                OWNER_CLEAN_NUMBER: this.owner.cleanNumber,
                ownerLID: this.owner.isLid ? this.owner.rawJid : OWNER_LID,
                verifiedLIDs: Array.from(this.ownerLids).filter(lid => lid.includes('@lid')),
                ownerJIDs: Array.from(this.ownerJids),
                linkedAt: this.owner.linkedAt,
                updatedAt: new Date().toISOString(),
                version: VERSION
            };
            
            writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
            return true;
        } catch (error) {
            log(`❌ Failed to save owner data: ${error.message}`, 'error');
            return false;
        }
    }
    
    // Save whitelist
    saveWhitelist() {
        try {
            const data = {
                whitelist: Array.from(WHITELIST),
                updatedAt: new Date().toISOString()
            };
            writeFileSync(WHITELIST_FILE, JSON.stringify(data, null, 2));
        } catch (error) {
            log(`❌ Failed to save whitelist: ${error.message}`, 'error');
        }
    }
    
    // Get owner info
    getOwnerInfo() {
        return {
            ownerJid: this.owner?.cleanJid || null,
            ownerNumber: this.owner?.cleanNumber || null,
            ownerLid: OWNER_LID || null,
            jidCount: this.ownerJids.size,
            lidCount: this.ownerLids.size,
            whitelistCount: WHITELIST.size,
            isLid: this.owner?.isLid || false,
            linkedAt: this.owner?.linkedAt || null
        };
    }
    
    // Clear all data (for reset)
    clearAllData() {
        this.ownerJids.clear();
        this.ownerLids.clear();
        WHITELIST.clear();
        this.owner = null;
        
        OWNER_JID = null;
        OWNER_NUMBER = null;
        OWNER_CLEAN_JID = null;
        OWNER_CLEAN_NUMBER = null;
        OWNER_LID = null;
        
        log(`🧹 Cleared all owner data`, 'warning');
        return true;
    }
}

// Initialize JID Manager
const jidManager = new JidManager();

// ====== AUTO-LINKING SYSTEM ======
class AutoLinkSystem {
    constructor() {
        this.linkAttempts = new Map();
        this.MAX_ATTEMPTS = 3;
    }
    
    // Check if we should auto-link a new owner
    async shouldAutoLink(sock, msg) {
        if (!AUTO_LINK_ENABLED) return false;
        
        const senderJid = msg.key.participant || msg.key.remoteJid;
        const cleaned = jidManager.cleanJid(senderJid);
        const senderNumber = cleaned.cleanNumber;
        
        // If no owner is set yet, auto-link the first user
        if (!jidManager.owner || !jidManager.owner.cleanNumber) {
            log(`🔄 No owner set, auto-linking first user: ${cleaned.cleanJid}`, 'warning');
            return await this.autoLinkNewOwner(sock, senderJid, cleaned, true);
        }
        
        // Check if message is from the bot itself
        if (msg.key.fromMe) {
            log(`🤖 Message from bot itself: ${cleaned.cleanJid}`, 'system');
            
            // If bot sent message and no owner is set, set bot as owner
            if (!jidManager.owner) {
                return await this.autoLinkNewOwner(sock, senderJid, cleaned, false);
            }
            return false;
        }
        
        // Check if sender is already owner
        if (jidManager.isOwner(msg)) {
            return false;
        }
        
        // Check number similarity with current owner
        const currentOwnerNumber = jidManager.owner.cleanNumber;
        if (jidManager.isSimilarNumber(senderNumber, currentOwnerNumber)) {
            log(`🔍 Similar number detected: ${senderNumber} vs ${currentOwnerNumber}`, 'system');
            
            // Check if this is a different device of same owner
            const isDifferentDevice = !jidManager.ownerJids.has(cleaned.cleanJid) && 
                                     !jidManager.ownerLids.has(senderJid);
            
            if (isDifferentDevice) {
                log(`📱 Different device detected for same owner: ${cleaned.cleanJid}`, 'info');
                
                // Add as additional device
                jidManager.addAdditionalDevice(senderJid);
                
                // Notify user
                await this.sendDeviceLinkedMessage(sock, senderJid, cleaned);
                return true;
            }
        }
        
        return false;
    }
    
    // Auto-link a new owner
    async autoLinkNewOwner(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            log(`🔄 Auto-linking new owner: ${cleaned.cleanJid}`, 'warning');
            
            // Clear ALL previous data and set new owner
            const result = jidManager.setNewOwner(senderJid, true);
            
            if (!result.success) {
                log(`❌ Auto-linking failed`, 'error');
                return false;
            }
            
            // Send welcome message
            await this.sendWelcomeMessage(sock, senderJid, cleaned, isFirstUser);
            
            log(`✅ Auto-linked new owner: ${cleaned.cleanJid}`, 'success');
            
            // Log to console
            console.log(chalk.green(`
╔════════════════════════════════════════════════╗
║         🔗 AUTO-LINKING SUCCESS                ║
╠════════════════════════════════════════════════╣
║  ✅ New Owner: +${cleaned.cleanNumber}                  
║  🔗 JID: ${cleaned.cleanJid}
║  📱 Type: ${cleaned.isLid ? 'LID' : 'Regular'}        
║  🕒 Time: ${new Date().toLocaleTimeString()}                 
╚════════════════════════════════════════════════╝
`));
            
            return true;
        } catch (error) {
            log(`❌ Auto-linking failed: ${error.message}`, 'error');
            return false;
        }
    }
    
    // Send welcome message to new owner
    async sendWelcomeMessage(sock, senderJid, cleaned, isFirstUser = false) {
        try {
            const currentTime = new Date().toLocaleTimeString();
            
            let welcomeMsg = `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n`;
            
            if (isFirstUser) {
                welcomeMsg += `🎉 *WELCOME TO ${BOT_NAME.toUpperCase()}!*\n\n`;
                welcomeMsg += `✅ You have been automatically set as the bot owner!\n\n`;
            } else {
                welcomeMsg += `🔄 *NEW OWNER LINKED!*\n\n`;
                welcomeMsg += `✅ You are now the bot owner!\n\n`;
            }
            
            welcomeMsg += `📋 *Owner Information:*\n`;
            welcomeMsg += `├─ Your Number: +${cleaned.cleanNumber}\n`;
            welcomeMsg += `├─ Device Type: ${cleaned.isLid ? 'Linked Device (LID) 🔗' : 'Regular Device 📱'}\n`;
            welcomeMsg += `├─ JID: ${cleaned.cleanJid}\n`;
            welcomeMsg += `├─ Prefix: "${CURRENT_PREFIX}"\n`;
            welcomeMsg += `├─ Mode: ${BOT_MODE}\n`;
            welcomeMsg += `└─ Linked: ${currentTime}\n\n`;
            
            if (!isFirstUser) {
                welcomeMsg += `⚠️ *Important:*\n`;
                welcomeMsg += `• Previous owner data has been cleared\n`;
                welcomeMsg += `• Only YOU can use owner commands now\n`;
                welcomeMsg += `• Previous numbers can no longer access commands\n\n`;
            }
            
            welcomeMsg += `📚 Use *${CURRENT_PREFIX}help* to see available commands.\n`;
            welcomeMsg += `🔧 Use *${CURRENT_PREFIX}ownerinfo* to verify your status.`;
            
            await sock.sendMessage(senderJid, { text: welcomeMsg });
            
        } catch (error) {
            log(`⚠️ Failed to send welcome message: ${error.message}`, 'warning');
        }
    }
    
    // Send device linked message
    async sendDeviceLinkedMessage(sock, senderJid, cleaned) {
        try {
            const message = `📱 *Device Linked!*\n\n` +
                          `✅ Your device has been added to owner devices:\n` +
                          `├─ Number: +${cleaned.cleanNumber}\n` +
                          `├─ Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n` +
                          `└─ JID: ${cleaned.cleanJid}\n\n` +
                          `🔒 You can now use owner commands from this device.\n` +
                          `🔄 Other devices of the same number will also work.`;
            
            await sock.sendMessage(senderJid, { text: message });
        } catch (error) {
            log(`⚠️ Failed to send device linked message: ${error.message}`, 'warning');
        }
    }
}

// Initialize Auto Link System
const autoLinkSystem = new AutoLinkSystem();

// ====== BLOCKED USERS CHECK ======
function isUserBlocked(jid) {
    try {
        if (existsSync(BLOCKED_USERS_FILE)) {
            const data = JSON.parse(readFileSync(BLOCKED_USERS_FILE, 'utf8'));
            return data.users && data.users.includes(jid);
        }
    } catch (error) {
        // Silent fail
    }
    return false;
}

// ====== BOT MODE CHECK ======
function checkBotMode(msg, commandName) {
    try {
        // Always allow owner
        if (jidManager.isOwner(msg)) {
            return true;
        }
        
        // Load mode
        if (existsSync(BOT_MODE_FILE)) {
            const modeData = JSON.parse(readFileSync(BOT_MODE_FILE, 'utf8'));
            BOT_MODE = modeData.mode || 'public';
        } else {
            BOT_MODE = 'public';
        }
        
        const chatJid = msg.key.remoteJid;
        
        // Check mode restrictions
        switch(BOT_MODE) {
            case 'public':
                return true;
            case 'private':
                return false;
            case 'silent':
                log(`🔇 Silent mode - ignoring non-owner: ${chatJid}`, 'warning');
                return false;
            case 'group-only':
                return chatJid.includes('@g.us');
            case 'maintenance':
                const allowedCommands = ['ping', 'status', 'uptime', 'help'];
                return allowedCommands.includes(commandName);
            default:
                return true;
        }
    } catch (error) {
        log(`❌ Mode check error: ${error.message}`, 'error');
        return true;
    }
}

// ====== PREFIX MANAGEMENT ======
function loadPrefix() {
    try {
        if (existsSync(PREFIX_CONFIG_FILE)) {
            const config = JSON.parse(readFileSync(PREFIX_CONFIG_FILE, 'utf8'));
            if (config.prefix && config.prefix.length <= 2) {
                CURRENT_PREFIX = config.prefix;
                log(`✅ Loaded custom prefix: "${CURRENT_PREFIX}"`, 'success');
            }
        }
    } catch (error) {
        log(`⚠️ Failed to load prefix config: ${error.message}`, 'warning');
    }
}

// ====== CONNECTION MANAGEMENT ======
function startHeartbeat(sock) {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
    }
    
    heartbeatInterval = setInterval(async () => {
        if (isConnected && sock) {
            try {
                await sock.sendPresenceUpdate('available');
                lastActivityTime = Date.now();
                
                if (Date.now() % (60 * 60 * 1000) < 1000 && store) {
                    store.clear();
                }
                
                if (Date.now() % (30 * 60 * 1000) < 1000) {
                    const uptime = process.uptime();
                    const hours = Math.floor(uptime / 3600);
                    const minutes = Math.floor((uptime % 3600) / 60);
                    log(`🟢 Connection stable - Uptime: ${hours}h ${minutes}m`, 'system');
                }
            } catch (error) {
                log(`⚠️ Heartbeat failed: ${error.message}`, 'warning');
            }
        }
    }, 60 * 1000);
    
    log('💓 Heartbeat system started', 'success');
}

function stopHeartbeat() {
    if (heartbeatInterval) {
        clearInterval(heartbeatInterval);
        heartbeatInterval = null;
    }
}

// ====== SESSION MANAGEMENT ======
function ensureSessionDir() {
    if (!existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        log(`✅ Created session directory: ${SESSION_DIR}`, 'success');
    }
}

function cleanSession() {
    try {
        log('🧹 Cleaning session data...', 'warning');
        
        if (existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            log('✅ Cleared session directory', 'success');
        }
        
        return true;
    } catch (error) {
        log(`❌ Cleanup error: ${error}`, 'error');
        return false;
    }
}

// ====== LIGHTWEIGHT MESSAGE STORE ======
class MessageStore {
    constructor() {
        this.messages = new Map();
        this.maxMessages = 100;
    }
    
    addMessage(jid, messageId, message) {
        try {
            const key = `${jid}|${messageId}`;
            this.messages.set(key, {
                ...message,
                timestamp: Date.now()
            });
            
            if (this.messages.size > this.maxMessages) {
                const oldestKey = this.messages.keys().next().value;
                this.messages.delete(oldestKey);
            }
        } catch (error) {
            // Silent fail
        }
    }
    
    getMessage(jid, messageId) {
        try {
            const key = `${jid}|${messageId}`;
            return this.messages.get(key) || null;
        } catch (error) {
            return null;
        }
    }
    
    clear() {
        this.messages.clear();
    }
}

// ====== COMMAND LOADER ======
const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    
    if (!existsSync(absolutePath)) {
        log(`⚠️ Command folder not found: ${absolutePath}`, 'warning');
        return;
    }
    
    try {
        const items = fs.readdirSync(absolutePath);
        let categoryCount = 0;
        
        for (const item of items) {
            const fullPath = path.join(absolutePath, item);
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                await loadCommandsFromFolder(fullPath, item);
            } else if (item.endsWith('.js')) {
                try {
                    if (item.includes('.test.') || item.includes('.disabled.')) continue;
                    
                    const commandModule = await import(`file://${fullPath}`);
                    const command = commandModule.default || commandModule;
                    
                    if (command && command.name) {
                        command.category = category;
                        commands.set(command.name.toLowerCase(), command);
                        
                        if (!commandCategories.has(category)) {
                            commandCategories.set(category, []);
                        }
                        commandCategories.get(category).push(command.name);
                        
                        log(`✅ [${category}] Loaded: ${command.name}`, 'success');
                        categoryCount++;
                        
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                            });
                        }
                    }
                } catch (error) {
                    log(`❌ Failed to load: ${item}`, 'error');
                }
            }
        }
        
        if (categoryCount > 0) {
            log(`📦 ${categoryCount} commands loaded from ${category}`, 'info');
        }
    } catch (error) {
        log(`❌ Error reading folder: ${folderPath}`, 'error');
    }
}

// ====== SIMPLIFIED LOGIN SYSTEM ======
class LoginManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    async selectMode() {
        console.log(chalk.yellow('\n🐺 SILENT WOLF - LOGIN SYSTEM'));
        console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        console.log(chalk.blue('2) Clean Session & Start Fresh'));
        
        const choice = await this.ask('Choose option (1-2, default 1): ');
        
        switch (choice.trim()) {
            case '1':
                return await this.pairingCodeMode();
            case '2':
                return await this.cleanStartMode();
            default:
                return await this.pairingCodeMode();
        }
    }
    
    async pairingCodeMode() {
        console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN'));
        console.log(chalk.gray('Enter phone number with country code (without +)'));
        console.log(chalk.gray('Example: 254788710904'));
        
        const phone = await this.ask('Phone number: ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        
        if (!cleanPhone || cleanPhone.length < 10) {
            console.log(chalk.red('❌ Invalid phone number'));
            return await this.selectMode();
        }
        
        return { mode: 'pair', phone: cleanPhone };
    }
    
    async cleanStartMode() {
        console.log(chalk.yellow('\n⚠️ CLEAN SESSION'));
        console.log(chalk.red('This will delete all session data!'));
        
        const confirm = await this.ask('Are you sure? (y/n): ');
        
        if (confirm.toLowerCase() === 'y') {
            cleanSession();
            console.log(chalk.green('✅ Session cleaned. Starting fresh...'));
            return await this.pairingCodeMode();
        } else {
            return await this.pairingCodeMode();
        }
    }
    
    ask(question) {
        return new Promise((resolve) => {
            this.rl.question(chalk.yellow(question), (answer) => {
                resolve(answer);
            });
        });
    }
    
    close() {
        if (this.rl) this.rl.close();
    }
}

// ====== MAIN BOT INITIALIZATION ======
async function startBot(loginMode = 'pair', phoneNumber = null) {
    try {
        log('🔧 Initializing WhatsApp connection...', 'info');
        
        loadPrefix();
        
        log('📂 Loading commands...', 'info');
        commands.clear();
        commandCategories.clear();
        
        await loadCommandsFromFolder('./commands');
        log(`✅ Loaded ${commands.size} commands`, 'success');
        
        store = new MessageStore();
        ensureSessionDir();
        
        const { default: makeWASocket } = await import('@whiskeysockets/baileys');
        const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
        const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
        
        const customLogger = {
            level: 'silent',
            trace: () => {},
            debug: () => {},
            info: () => {},
            warn: () => {},
            error: () => {},
            fatal: () => {},
            child: () => customLogger
        };
        
        let state, saveCreds;
        try {
            log('🔐 Loading authentication...', 'info');
            const authState = await useMultiFileAuthState(SESSION_DIR);
            state = authState.state;
            saveCreds = authState.saveCreds;
            log('✅ Auth loaded', 'success');
        } catch (error) {
            log(`❌ Auth error: ${error.message}`, 'error');
            cleanSession();
            const freshAuth = await useMultiFileAuthState(SESSION_DIR);
            state = freshAuth.state;
            saveCreds = freshAuth.saveCreds;
        }
        
        const { version } = await fetchLatestBaileysVersion();
        
        const sock = makeWASocket({
            version,
            logger: customLogger,
            browser: Browsers.ubuntu('Chrome'),
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, customLogger),
            },
            markOnlineOnConnect: true,
            generateHighQualityLinkPreview: true,
            connectTimeoutMs: 60000,
            keepAliveIntervalMs: 20000,
            emitOwnEvents: true,
            mobile: false,
            getMessage: async (key) => {
                return store?.getMessage(key.remoteJid, key.id) || null;
            },
            defaultQueryTimeoutMs: 30000,
            retryRequestDelayMs: 1000,
            maxRetryCount: 3,
            syncFullHistory: false,
            fireInitQueries: true,
            transactionOpts: {
                maxCommitRetries: 3,
                delayBetweenTriesMs: 1000
            },
            shouldIgnoreJid: (jid) => {
                return jid.includes('status@broadcast') || 
                       jid.includes('broadcast') ||
                       jid.includes('newsletter');
            }
        });
        
        SOCKET_INSTANCE = sock;
        connectionAttempts = 0;
        
        // ====== EVENT HANDLERS ======
        
        sock.ev.on('connection.update', async (update) => {
            const { connection, lastDisconnect } = update;
            
            if (connection === 'open') {
                isConnected = true;
                startHeartbeat(sock);
                await handleSuccessfulConnection(sock, loginMode, phoneNumber);
            }
            
            if (connection === 'close') {
                isConnected = false;
                stopHeartbeat();
                await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
            }
            
            if (loginMode === 'pair' && phoneNumber && !state.creds.registered && connection === 'connecting') {
                setTimeout(async () => {
                    try {
                        const code = await sock.requestPairingCode(phoneNumber);
                        const formatted = code.match(/.{1,4}/g)?.join('-') || code;
                        
                        console.log(chalk.greenBright(`
╔════════════════════════════════════════════════╗
║              🔗 PAIRING CODE                   ║
╠════════════════════════════════════════════════╣
║ 📞 Phone: ${chalk.cyan(phoneNumber.padEnd(30))}║
║ 🔑 Code: ${chalk.yellow(formatted.padEnd(31))}║
║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
╚════════════════════════════════════════════════╝
`));
                    } catch (error) {
                        log(`❌ Pairing failed: ${error.message}`, 'error');
                    }
                }, 3000);
            }
        });
        
        sock.ev.on('creds.update', saveCreds);
        
        // Message handling
        sock.ev.on('messages.upsert', async ({ messages, type }) => {
            if (type !== 'notify') return;
            
            const msg = messages[0];
            if (!msg.message) return;
            
            lastActivityTime = Date.now();
            
            if (msg.key.remoteJid === 'status@broadcast' || 
                msg.key.remoteJid.includes('broadcast')) {
                return;
            }
            
            const messageId = msg.key.id;
            
            if (store) {
                store.addMessage(msg.key.remoteJid, messageId, {
                    message: msg.message,
                    key: msg.key,
                    timestamp: Date.now()
                });
            }
            
            await handleIncomingMessage(sock, msg);
        });
        
        return sock;
        
    } catch (error) {
        log(`❌ Bot initialization failed: ${error.message}`, 'error');
        throw error;
    }
}

// ====== CONNECTION HANDLERS ======
async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
    const currentTime = new Date().toLocaleTimeString();
    
    OWNER_JID = sock.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    
    // Clear any existing owner data first, then set new owner
    jidManager.clearAllData();
    const result = jidManager.setNewOwner(OWNER_JID, false);
    
    if (!result.success) {
        log(`❌ Failed to set owner on connection`, 'error');
    }
    
    const ownerInfo = jidManager.getOwnerInfo();
    
    console.clear();
    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${ownerInfo.ownerNumber}
║  🔧 Clean JID : ${ownerInfo.ownerJid}
║  🔗 LID : ${ownerInfo.ownerLid || 'Not set'}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('24/7 Ready!')}         
║  💬 Prefix : "${CURRENT_PREFIX}"
║  🎛️ Mode   : ${BOT_MODE}
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION')}  
║  📊 Commands: ${commands.size} commands loaded
║  📋 Whitelist: ${ownerInfo.whitelistCount} IDs
║  🔗 AUTO-LINK : ✅ ENABLED
╚════════════════════════════════════════════════════════╝
`));
    
    // Send connection success message to owner
    try {
        await sock.sendMessage(OWNER_JID, {
            text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: ${CURRENT_PREFIX}\n🎛️ Mode: ${BOT_MODE}\n🕒 Time: ${currentTime}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n🔗 Auto-link: ✅ ENABLED\n\nUse *${CURRENT_PREFIX}help* for commands.`
        });
    } catch (error) {
        // Silent fail
    }
}

async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
    connectionAttempts++;
    
    log(`🔌 Disconnected (Attempt ${connectionAttempts}/${MAX_RETRY_ATTEMPTS}): ${reason}`, 'error');
    
    // Handle "conflict" differently
    if (reason.includes('conflict') || statusCode === 409) {
        log('⚠️ Device conflict detected - waiting before reconnect', 'warning');
        const conflictDelay = 30000;
        log(`🔄 Waiting ${conflictDelay/1000}s due to conflict...`, 'info');
        
        setTimeout(async () => {
            await startBot(loginMode, phoneNumber);
        }, conflictDelay);
        return;
    }
    
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
        log('🔓 Session invalid, cleaning...', 'warning');
        cleanSession();
    }
    
    const baseDelay = 5000;
    const maxDelay = 60000;
    const delayTime = Math.min(baseDelay * Math.pow(2, connectionAttempts - 1), maxDelay);
    
    log(`🔄 Reconnecting in ${delayTime/1000}s...`, 'info');
    
    setTimeout(async () => {
        if (connectionAttempts >= MAX_RETRY_ATTEMPTS) {
            log('❌ Max retry attempts reached. Restarting process...', 'error');
            connectionAttempts = 0;
            process.exit(1);
        } else {
            await startBot(loginMode, phoneNumber);
        }
    }, delayTime);
}

// ====== MESSAGE HANDLER ======
async function handleIncomingMessage(sock, msg) {
    try {
        const chatId = msg.key.remoteJid;
        const senderJid = msg.key.participant || chatId;
        
        // ====== STEP 1: AUTO-LINK CHECK ======
        await autoLinkSystem.shouldAutoLink(sock, msg);
        
        // ====== STEP 2: Check if sender is blocked ======
        if (isUserBlocked(senderJid)) {
            log(`⛔ Message from blocked user: ${senderJid}`, 'warning');
            return;
        }
        
        const textMsg = msg.message.conversation || 
                       msg.message.extendedTextMessage?.text || 
                       msg.message.imageMessage?.caption || 
                       msg.message.videoMessage?.caption || '';
        
        if (!textMsg) return;
        
        if (textMsg.startsWith(CURRENT_PREFIX)) {
            const parts = textMsg.slice(CURRENT_PREFIX.length).trim().split(/\s+/);
            const commandName = parts[0].toLowerCase();
            const args = parts.slice(1);
            
            log(`${chatId.split('@')[0]} → ${CURRENT_PREFIX}${commandName}`, 'command');
            
            // Check bot mode restrictions
            if (!checkBotMode(msg, commandName)) {
                log(`⛔ Command blocked by ${BOT_MODE} mode`, 'warning');
                // In silent mode, don't send any messages to non-owners
                if (BOT_MODE === 'silent' && !jidManager.isOwner(msg)) {
                    return;
                }
                try {
                    await sock.sendMessage(chatId, { 
                        text: `❌ *Command Blocked*\nBot is in ${BOT_MODE} mode.\nOnly owner can use commands.`
                    });
                } catch (error) {
                    log(`⚠️ Failed to send mode block message: ${error.message}`, 'warning');
                }
                return;
            }
            
            const command = commands.get(commandName);
            if (command) {
                try {
                    // Check if command is owner-only
                    if (command.ownerOnly && !jidManager.isOwner(msg)) {
                        log(`⛔ Non-owner tried to use owner command: ${commandName}`, 'warning');
                        try {
                            await sock.sendMessage(chatId, { 
                                text: '❌ *Owner Only Command*\nThis command can only be used by the bot owner.'
                            });
                        } catch (error) {
                            log(`⚠️ Failed to send owner-only warning: ${error.message}`, 'warning');
                        }
                        return;
                    }
                    
                    await command.execute(sock, msg, args, CURRENT_PREFIX, {
                        OWNER_NUMBER: OWNER_CLEAN_NUMBER,
                        OWNER_JID: OWNER_CLEAN_JID,
                        OWNER_LID: OWNER_LID,
                        BOT_NAME,
                        VERSION,
                        isOwner: () => jidManager.isOwner(msg),
                        jidManager,
                        store
                    });
                } catch (error) {
                    log(`❌ Command error: ${error.message}`, 'error');
                }
            } else {
                await handleDefaultCommands(commandName, sock, msg, args);
            }
        }
    } catch (error) {
        log(`⚠️ Message handler error: ${error.message}`, 'warning');
    }
}

// ====== DEFAULT COMMANDS ======
async function handleDefaultCommands(commandName, sock, msg, args) {
    const chatId = msg.key.remoteJid;
    const isOwnerUser = jidManager.isOwner(msg);
    const ownerInfo = jidManager.getOwnerInfo();
    
    try {
        switch (commandName) {
            case 'ping':
                const start = Date.now();
                const latency = Date.now() - start;
                await sock.sendMessage(chatId, { 
                    text: `🏓 *Pong!*\nLatency: ${latency}ms\nPrefix: "${CURRENT_PREFIX}"\nMode: ${BOT_MODE}\nOwner: ${isOwnerUser ? 'Yes ✅' : 'No ❌'}\nStatus: Connected ✅`
                }, { quoted: msg });
                break;
                
            case 'help':
                let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
                helpText += `Prefix: "${CURRENT_PREFIX}"\n`;
                helpText += `Mode: ${BOT_MODE}\n`;
                helpText += `Commands: ${commands.size}\n\n`;
                
                for (const [category, cmds] of commandCategories.entries()) {
                    helpText += `*${category.toUpperCase()}*\n`;
                    helpText += `${cmds.slice(0, 6).join(', ')}`;
                    if (cmds.length > 6) helpText += `... (+${cmds.length - 6} more)`;
                    helpText += '\n\n';
                }
                
                helpText += `Use ${CURRENT_PREFIX}help <command> for details`;
                await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
                break;
                
            case 'uptime':
                const uptime = process.uptime();
                const hours = Math.floor(uptime / 3600);
                const minutes = Math.floor((uptime % 3600) / 60);
                const seconds = Math.floor(uptime % 60);
                
                await sock.sendMessage(chatId, {
                    text: `⏰ *UPTIME*\n\n${hours}h ${minutes}m ${seconds}s\n📊 Commands: ${commands.size}\n👑 Owner: +${ownerInfo.ownerNumber}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n🔗 LID: ${ownerInfo.ownerLid || 'None'}`
                }, { quoted: msg });
                break;
                
            case 'status':
                await sock.sendMessage(chatId, {
                    text: `📊 *BOT STATUS*\n\n🟢 Status: Connected\n👑 Owner: +${ownerInfo.ownerNumber}\n🔗 Owner LID: ${ownerInfo.ownerLid || 'None'}\n⚡ Version: ${VERSION}\n💬 Prefix: "${CURRENT_PREFIX}"\n🎛️ Mode: ${BOT_MODE}\n📊 Commands: ${commands.size}\n📋 Whitelist: ${ownerInfo.whitelistCount} IDs\n⏰ Uptime: ${Math.floor(process.uptime()/60)} minutes`
                }, { quoted: msg });
                break;
                
            case 'clean':
                if (!isOwnerUser) {
                    await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                    return;
                }
                
                await sock.sendMessage(chatId, { 
                    text: '🧹 Cleaning session and restarting...' 
                });
                
                setTimeout(() => {
                    cleanSession();
                    process.exit(1);
                }, 2000);
                break;
                
            case 'ownerinfo':
                const senderJid = msg.key.participant || chatId;
                const cleaned = jidManager.cleanJid(senderJid);
                
                let ownerInfoText = `👑 *OWNER INFORMATION*\n\n`;
                ownerInfoText += `📱 Your JID: ${senderJid}\n`;
                ownerInfoText += `🔧 Cleaned: ${cleaned.cleanJid}\n`;
                ownerInfoText += `📞 Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
                ownerInfoText += `✅ Owner Status: ${isOwnerUser ? 'YES ✅' : 'NO ❌'}\n`;
                ownerInfoText += `💬 Chat Type: ${chatId.includes('@g.us') ? 'Group 👥' : 'DM 📱'}\n`;
                ownerInfoText += `🎛️ Bot Mode: ${BOT_MODE}\n`;
                ownerInfoText += `💬 Prefix: "${CURRENT_PREFIX}"\n\n`;
                
                ownerInfoText += `*BOT OWNER DETAILS:*\n`;
                ownerInfoText += `├─ Number: +${ownerInfo.ownerNumber}\n`;
                ownerInfoText += `├─ JID: ${ownerInfo.ownerJid}\n`;
                ownerInfoText += `├─ LID: ${ownerInfo.ownerLid || 'Not set'}\n`;
                ownerInfoText += `├─ Known JIDs: ${ownerInfo.jidCount}\n`;
                ownerInfoText += `└─ Known LIDs: ${ownerInfo.lidCount}`;
                
                if (!isOwnerUser) {
                    ownerInfoText += `\n\n⚠️ You are not recognized as owner.\nFirst message will auto-link if number matches.`;
                }
                
                await sock.sendMessage(chatId, {
                    text: ownerInfoText
                }, { quoted: msg });
                break;
                
            case 'resetowner':
                if (!isOwnerUser) {
                    await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                    return;
                }
                
                await sock.sendMessage(chatId, {
                    text: '🔄 Resetting owner data...\nNext message will set new owner automatically.'
                });
                
                jidManager.clearAllData();
                log(`🧹 Owner data cleared by command`, 'warning');
                break;
        }
    } catch (error) {
        // Silent fail for command errors
    }
}

// ====== MAIN APPLICATION ======
async function main() {
    try {
        log('🚀 Starting Silent Wolf Bot...', 'info');
        
        const loginManager = new LoginManager();
        const { mode, phone } = await loginManager.selectMode();
        loginManager.close();
        
        await startBot(mode, phone);
        
    } catch (error) {
        log(`💥 Fatal error: ${error.message}`, 'error');
        log('🔄 Restarting in 10s...', 'info');
        await delay(10000);
        main();
    }
}

// ====== PROCESS HANDLERS ======
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down gracefully...'));
    stopHeartbeat();
    if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    if (error.message.includes('SessionError') || 
        error.message.includes('Bad MAC') ||
        error.message.includes('decrypt') ||
        error.message.includes('transaction failed')) {
        return;
    }
    log(`⚠️ Uncaught Exception: ${error.message}`, 'error');
});

process.on('unhandledRejection', (error) => {
    if (error?.message?.includes('SessionError') || 
        error?.message?.includes('Bad MAC') ||
        error?.message?.includes('decrypt') ||
        error?.message?.includes('transaction failed')) {
        return;
    }
    log(`⚠️ Unhandled Rejection: ${error?.message || error}`, 'error');
});

// Start the bot
main().catch(error => {
    log(`💥 Critical startup error: ${error.message}`, 'error');
    process.exit(1);
});

// Auto-restart if process hangs
setInterval(() => {
    const now = Date.now();
    const inactivityThreshold = 5 * 60 * 1000;
    
    if (isConnected && (now - lastActivityTime) > inactivityThreshold) {
        log('⚠️ No activity for 5 minutes, sending heartbeat...', 'warning');
        if (SOCKET_INSTANCE) {
            SOCKET_INSTANCE.sendPresenceUpdate('available').catch(() => {});
        }
    }
}, 60000);