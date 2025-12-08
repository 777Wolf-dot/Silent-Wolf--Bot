







































// ====== ENHANCED WOLF BOT - index.js ======
// Updated version with PairCode and enhanced SessionID - QR Code removed

import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import chalk from 'chalk';
import readline from 'readline';
import moment from 'moment';
import { spawn, execSync } from 'child_process';
import crypto from 'crypto';

// ====== AUTO-UPDATE SYSTEM ======
const AUTO_UPDATE_ENABLED = process.env.AUTO_UPDATE !== 'false';
const UPDATE_BRANCH = 'main';

async function checkAndUpdateCodebase() {
    if (!AUTO_UPDATE_ENABLED) return;
    
    try {
        console.log(chalk.cyan('🔄 Checking for updates...'));
        
        if (!fs.existsSync('.git')) {
            console.log(chalk.yellow('⚠️ Not a git repository, skipping auto-update'));
            return;
        }
        
        execSync('git fetch origin', { stdio: 'ignore' });
        
        const currentCommit = execSync('git rev-parse HEAD').toString().trim();
        const remoteCommit = execSync('git rev-parse origin/' + UPDATE_BRANCH).toString().trim();
        
        if (currentCommit !== remoteCommit) {
            console.log(chalk.green('📥 Update available! Downloading...'));
            
            const configFiles = ['prefix.json', 'bot_mode.json', 'message_history.json', 'owner.json', '.env'];
            const hasChanges = configFiles.some(file => {
                try {
                    execSync(`git diff --quiet ${file}`, { stdio: 'ignore' });
                    return false;
                } catch {
                    return true;
                }
            });
            
            if (hasChanges) {
                console.log(chalk.yellow('📋 Stashing config file changes...'));
                execSync('git stash push -m "wolf-bot-config-backup"', { stdio: 'ignore' });
            }
            
            execSync(`git pull origin ${UPDATE_BRANCH} --no-rebase`, { stdio: 'inherit' });
            
            try {
                execSync('git stash pop', { stdio: 'ignore' });
                console.log(chalk.green('✅ Config changes restored'));
            } catch (error) {
                console.log(chalk.yellow('⚠️ No stashed changes to restore'));
            }
            
            console.log(chalk.green('✨ Update completed! Restarting...'));
            
            setTimeout(() => {
                process.exit(1);
            }, 2000);
        } else {
            console.log(chalk.gray('✅ Already up to date'));
        }
    } catch (error) {
        console.error(chalk.red('❌ Update check failed:'), error.message);
    }
}

// ====== ENVIRONMENT SETUP ======
dotenv.config({ path: './.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ====== ENHANCED SESSION MANAGEMENT ======
const SESSION_DIR = './auth_info_baileys';
const SESSION_BACKUP_DIR = './session_backups';
const SESSION_ERROR_FILE = './session_errors.json';
const LOGIN_METHOD_FILE = './login_method.json';
const SESSION_ID_FILE = './session_id.json';

// ====== DYNAMIC PREFIX SYSTEM ======
function loadBotPrefix() {
    try {
        if (process.env.PREFIX && process.env.PREFIX.trim()) {
            console.log(chalk.cyan(`🔤 Using env prefix: "${process.env.PREFIX}"`));
            return process.env.PREFIX;
        }
        
        if (fs.existsSync('./prefix.json')) {
            const prefixData = JSON.parse(fs.readFileSync('./prefix.json', 'utf8'));
            if (prefixData.prefix && prefixData.prefix.trim()) {
                console.log(chalk.cyan(`🔤 Using config prefix: "${prefixData.prefix}"`));
                return prefixData.prefix;
            }
        }
    } catch (error) {
        console.error(chalk.red('❌ Error loading prefix:'), error.message);
    }
    
    return '.';
}

const PREFIX = loadBotPrefix();
const BOT_NAME = process.env.BOT_NAME || 'Silent Wolf';
const VERSION = '3.1.0'; // Enhanced version with PairCode & SessionID
const MEMORY_CLEAR_INTERVAL = 10000;
const MESSAGE_HISTORY_FILE = './message_history.json';
const BOT_MODE_FILE = './bot_mode.json';
const OWNER_FILE = './owner.json';

// Global variables
let OWNER_NUMBER = null;
let OWNER_JID = null;
let SOCKET_INSTANCE = null;
let isConnected = false;
let messageHistory = new Map();
let memoryClearTimer = null;
let store = null;
let SESSION_ID = null;

console.log(chalk.cyan(`
╔════════════════════════════════════════════════╗
║   🐺 ${chalk.bold(BOT_NAME.toUpperCase())} — ${chalk.green('STARTING')}  
║   ⚙️ Version : ${VERSION} ${AUTO_UPDATE_ENABLED ? chalk.green('(Auto-Update ON)') : chalk.red('(Auto-Update OFF)')}
║   💬 Prefix  : "${PREFIX}"
║   🧠 Memory  : Persistent auto-clear every 10s
║   🔄 Updates: ${AUTO_UPDATE_ENABLED ? 'Enabled' : 'Disabled'}
║   🔐 Login  : PairCode & SessionID Enhanced
╚════════════════════════════════════════════════╝
`));

// ====== UTILITY FUNCTIONS ======
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ====== ENHANCED SESSION ID SYSTEM ======
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex').toUpperCase();
}

function loadSessionId() {
    try {
        if (fs.existsSync(SESSION_ID_FILE)) {
            const data = JSON.parse(fs.readFileSync(SESSION_ID_FILE, 'utf8'));
            SESSION_ID = data.sessionId;
            console.log(chalk.cyan(`🔑 Loaded Session ID: ${SESSION_ID}`));
            return SESSION_ID;
        }
    } catch (error) {
        console.error(chalk.red('❌ Error loading Session ID:'), error);
    }
    
    // Generate new Session ID
    SESSION_ID = generateSessionId();
    saveSessionId();
    return SESSION_ID;
}

function saveSessionId() {
    try {
        const data = {
            sessionId: SESSION_ID,
            created: new Date().toISOString(),
            version: VERSION,
            botName: BOT_NAME
        };
        fs.writeFileSync(SESSION_ID_FILE, JSON.stringify(data, null, 2));
        console.log(chalk.green(`✅ Session ID saved: ${SESSION_ID}`));
    } catch (error) {
        console.error(chalk.red('❌ Error saving Session ID:'), error);
    }
}

function getSessionInfo() {
    return {
        sessionId: SESSION_ID,
        created: fs.existsSync(SESSION_ID_FILE) ? 
            JSON.parse(fs.readFileSync(SESSION_ID_FILE, 'utf8')).created : 
            new Date().toISOString(),
        version: VERSION
    };
}

// ====== MEMORY MANAGEMENT FUNCTIONS ======
function loadMessageHistory() {
    try {
        if (fs.existsSync(MESSAGE_HISTORY_FILE)) {
            const data = JSON.parse(fs.readFileSync(MESSAGE_HISTORY_FILE, 'utf8'));
            const now = Date.now();
            const tenSecondsAgo = now - 10000;
            
            for (const [messageId, timestamp] of Object.entries(data)) {
                if (timestamp > tenSecondsAgo) {
                    messageHistory.set(messageId, timestamp);
                }
            }
            console.log(chalk.green(`✅ Loaded ${messageHistory.size} recent messages`));
        }
    } catch (error) {
        console.error(chalk.red('❌ Error loading message history:'), error);
    }
}

function saveMessageHistory() {
    try {
        const data = Object.fromEntries(messageHistory);
        fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
        console.error(chalk.red('❌ Error saving message history:'), error);
    }
}

function startMemoryClearing() {
    if (memoryClearTimer) {
        clearInterval(memoryClearTimer);
    }
    
    loadMessageHistory();
    
    memoryClearTimer = setInterval(() => {
        clearMessageHistory();
        saveMessageHistory();
    }, MEMORY_CLEAR_INTERVAL);
    
    console.log(chalk.green(`✅ Memory clearing activated (every ${MEMORY_CLEAR_INTERVAL/1000}s)`));
}

function stopMemoryClearing() {
    if (memoryClearTimer) {
        clearInterval(memoryClearTimer);
        saveMessageHistory();
        memoryClearTimer = null;
        console.log(chalk.yellow('🛑 Memory clearing stopped'));
    }
}

function clearMessageHistory() {
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    let clearedCount = 0;
    
    for (const [messageId, timestamp] of messageHistory.entries()) {
        if (timestamp < tenSecondsAgo) {
            messageHistory.delete(messageId);
            clearedCount++;
        }
    }
    
    if (clearedCount > 0) {
        console.log(chalk.gray(`🧹 Cleared ${clearedCount} old messages from memory`));
    }
}

function addToMessageHistory(messageId) {
    const now = Date.now();
    messageHistory.set(messageId, now);
    saveMessageHistory();
}

function isMessageRecent(messageId) {
    if (!messageHistory.has(messageId)) {
        return false;
    }
    
    const timestamp = messageHistory.get(messageId);
    const now = Date.now();
    const tenSecondsAgo = now - 10000;
    
    return timestamp >= tenSecondsAgo;
}

// ====== OWNER VERIFICATION ======
function isOwner(senderJid) {
    if (!OWNER_JID || !senderJid) {
        return false;
    }
    
    const normalizeJid = (jid) => {
        if (!jid) return '';
        const numberPart = jid.split('@')[0].replace(/[^0-9]/g, '');
        return numberPart.startsWith('0') ? numberPart.substring(1) : numberPart;
    };
    
    const normalizedSender = normalizeJid(senderJid);
    const normalizedOwner = normalizeJid(OWNER_JID);
    
    if (OWNER_NUMBER) {
        const normalizedOwnerNumber = OWNER_NUMBER.replace(/[^0-9]/g, '');
        const cleanOwnerNumber = normalizedOwnerNumber.startsWith('0') 
            ? normalizedOwnerNumber.substring(1) 
            : normalizedOwnerNumber;
        
        if (normalizedSender === cleanOwnerNumber) {
            return true;
        }
    }
    
    return normalizedSender === normalizedOwner;
}

function ensureSessionDir() {
    if (!fs.existsSync(SESSION_DIR)) {
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        console.log(chalk.green(`✅ Created session directory: ${SESSION_DIR}`));
    }
}

// ====== SESSION INTEGRITY CHECK ======
async function checkSessionIntegrity() {
    console.log(chalk.blue('🔍 Checking session integrity...'));
    
    if (!fs.existsSync(SESSION_DIR)) {
        console.log(chalk.yellow('⚠️ No session directory found'));
        return { valid: false, reason: 'no_session_dir' };
    }
    
    try {
        const files = fs.readdirSync(SESSION_DIR);
        const hasCreds = files.some(f => f.includes('creds'));
        const hasKeys = files.some(f => f.includes('key') || f.includes('session'));
        
        if (!hasCreds || !hasKeys) {
            console.log(chalk.red('❌ Session files incomplete'));
            return { valid: false, reason: 'incomplete_session' };
        }
        
        console.log(chalk.green('✅ Session integrity check passed'));
        return { valid: true };
    } catch (error) {
        console.error(chalk.red('❌ Session check error:'), error.message);
        return { valid: false, reason: 'check_error' };
    }
}

// ====== SESSION BACKUP SYSTEM ======
async function backupSession() {
    try {
        if (!fs.existsSync(SESSION_DIR)) return;
        
        if (!fs.existsSync(SESSION_BACKUP_DIR)) {
            fs.mkdirSync(SESSION_BACKUP_DIR, { recursive: true });
        }
        
        const backupName = `session_backup_${SESSION_ID}_${moment().format('YYYY-MM-DD_HH-mm')}`;
        const backupPath = path.join(SESSION_BACKUP_DIR, backupName);
        
        fs.mkdirSync(backupPath, { recursive: true });
        
        const files = fs.readdirSync(SESSION_DIR);
        files.forEach(file => {
            const src = path.join(SESSION_DIR, file);
            const dest = path.join(backupPath, file);
            fs.copyFileSync(src, dest);
        });
        
        // Also backup session ID
        fs.writeFileSync(
            path.join(backupPath, 'session_id_backup.json'),
            JSON.stringify(getSessionInfo(), null, 2)
        );
        
        console.log(chalk.green(`✅ Session backed up: ${backupName}`));
        
        // Clean old backups (keep last 5)
        const backups = fs.readdirSync(SESSION_BACKUP_DIR)
            .filter(f => f.startsWith('session_backup_'))
            .sort()
            .reverse();
        
        if (backups.length > 5) {
            const toDelete = backups.slice(5);
            toDelete.forEach(backup => {
                const backupDir = path.join(SESSION_BACKUP_DIR, backup);
                fs.rmSync(backupDir, { recursive: true, force: true });
                console.log(chalk.gray(`🧹 Deleted old backup: ${backup}`));
            });
        }
    } catch (error) {
        console.error(chalk.red('❌ Backup failed:'), error.message);
    }
}

// ====== ERROR TRACKING ======
function trackError(errorType, details = {}) {
    try {
        let errorData = { count: 0, last_error: null, history: [] };
        
        if (fs.existsSync(SESSION_ERROR_FILE)) {
            errorData = JSON.parse(fs.readFileSync(SESSION_ERROR_FILE, 'utf8'));
        }
        
        errorData.count++;
        errorData.last_error = {
            type: errorType,
            timestamp: new Date().toISOString(),
            details: details,
            sessionId: SESSION_ID
        };
        
        errorData.history.push(errorData.last_error);
        if (errorData.history.length > 50) {
            errorData.history = errorData.history.slice(-50);
        }
        
        fs.writeFileSync(SESSION_ERROR_FILE, JSON.stringify(errorData, null, 2));
    } catch (error) {
        console.error('Error tracking error:', error);
    }
}

// ====== LOGIN METHOD MANAGEMENT ======
function saveLoginMethod(method, phone = null) {
    try {
        const data = {
            method: method,
            phone: phone,
            timestamp: new Date().toISOString(),
            version: VERSION,
            sessionId: SESSION_ID
        };
        fs.writeFileSync(LOGIN_METHOD_FILE, JSON.stringify(data, null, 2));
        console.log(chalk.blue(`📝 Login method saved: ${method}`));
    } catch (error) {
        console.error('Failed to save login method:', error);
    }
}

function getLastLoginMethod() {
    try {
        if (fs.existsSync(LOGIN_METHOD_FILE)) {
            return JSON.parse(fs.readFileSync(LOGIN_METHOD_FILE, 'utf8'));
        }
    } catch (error) {
        console.error('Failed to read login method:', error);
    }
    return null;
}

// ====== MODE MANAGEMENT ======
function getBotMode() {
    try {
        if (fs.existsSync(BOT_MODE_FILE)) {
            const modeData = JSON.parse(fs.readFileSync(BOT_MODE_FILE, 'utf8'));
            return modeData.mode || 'public';
        }
    } catch (error) {
        console.error(chalk.red('❌ Error reading bot mode:'), error);
    }
    return 'public';
}

function setBotMode(mode, reason = 'user_command') {
    try {
        const modeData = {
            mode: mode,
            ownerNumber: OWNER_NUMBER,
            ownerJid: OWNER_JID,
            changedAt: new Date().toISOString(),
            changedBy: reason,
            previousMode: getBotMode(),
            sessionId: SESSION_ID
        };
        fs.writeFileSync(BOT_MODE_FILE, JSON.stringify(modeData, null, 2));
        console.log(chalk.blue(`🔧 Bot mode changed: ${modeData.previousMode} → ${mode} (${reason})`));
        return true;
    } catch (error) {
        console.error(chalk.red('❌ Error setting bot mode:'), error);
        return false;
    }
}

function isUserAllowed(senderJid) {
    const mode = getBotMode();
    
    if (mode === 'public') return true;
    if (mode === 'private') return isOwner(senderJid);
    
    if (mode === 'group_only') {
        return senderJid.endsWith('@g.us') || isOwner(senderJid);
    }
    
    return false;
}

// ====== ENHANCED CLEAN AUTH FUNCTION ======
function cleanAuth(force = false) {
    try {
        console.log(chalk.yellow('🧹 Cleaning auth data...'));
        
        if (!force) {
            backupSession();
        }
        
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
            console.log(chalk.green('✅ Cleared session directory'));
        }
        
        if (fs.existsSync(LOGIN_METHOD_FILE)) {
            fs.unlinkSync(LOGIN_METHOD_FILE);
        }
        
        // Generate new session ID
        SESSION_ID = generateSessionId();
        saveSessionId();
        
        console.log(chalk.cyan(`🆕 New Session ID generated: ${SESSION_ID}`));
        
        return true;
    } catch (error) {
        console.error(chalk.red('❌ Cleanup error:'), error);
        return false;
    }
}

// ====== SIMPLIFIED MESSAGE STORE SYSTEM ======
class MessageStore {
    constructor() {
        this.messages = {};
        this.filePath = './message_store.json';
        this.load();
    }
    
    load() {
        try {
            if (fs.existsSync(this.filePath)) {
                this.messages = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));
                console.log(chalk.green(`📚 Loaded message store with ${Object.keys(this.messages).length} chats`));
            }
        } catch (error) {
            console.error('Failed to load message store:', error);
            this.messages = {};
        }
    }
    
    save() {
        try {
            fs.writeFileSync(this.filePath, JSON.stringify(this.messages, null, 2));
        } catch (error) {
            console.error('Failed to save message store:', error);
        }
    }
    
    addMessage(jid, messageId, message) {
        try {
            if (!this.messages[jid]) {
                this.messages[jid] = {};
            }
            
            this.messages[jid][messageId] = {
                ...message,
                timestamp: Date.now(),
                sessionId: SESSION_ID
            };
            
            // Auto-save periodically (every 10 messages per chat)
            const chatMessageCount = Object.keys(this.messages[jid]).length;
            if (chatMessageCount % 10 === 0) {
                this.save();
            }
        } catch (error) {
            console.error('Error adding message to store:', error);
        }
    }
    
    getMessage(jid, messageId) {
        try {
            return this.messages[jid]?.[messageId] || null;
        } catch (error) {
            console.error('Error getting message from store:', error);
            return null;
        }
    }
    
    cleanup(maxAgeHours = 24) {
        try {
            const cutoff = Date.now() - (maxAgeHours * 60 * 60 * 1000);
            let clearedCount = 0;
            
            for (const jid in this.messages) {
                const chatMessages = this.messages[jid];
                for (const messageId in chatMessages) {
                    if (chatMessages[messageId].timestamp < cutoff) {
                        delete chatMessages[messageId];
                        clearedCount++;
                    }
                }
                
                // Remove empty chat objects
                if (Object.keys(chatMessages).length === 0) {
                    delete this.messages[jid];
                }
            }
            
            if (clearedCount > 0) {
                this.save();
                console.log(chalk.gray(`🧹 Cleaned ${clearedCount} old messages from store`));
            }
        } catch (error) {
            console.error('Error cleaning message store:', error);
        }
    }
}

// ====== COMMAND SYSTEM ======
const commands = new Map();
const commandCategories = new Map();

async function loadCommandsFromFolder(folderPath, category = 'general') {
    const absolutePath = path.resolve(folderPath);
    
    if (!fs.existsSync(absolutePath)) {
        console.log(chalk.yellow(`⚠️ Command folder not found: ${absolutePath}`));
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
                    const command = commandModule.default;
                    
                    if (command && command.name) {
                        command.category = category;
                        commands.set(command.name.toLowerCase(), command);
                        
                        if (!commandCategories.has(category)) {
                            commandCategories.set(category, []);
                        }
                        commandCategories.get(category).push(command.name);
                        
                        console.log(chalk.green(`✅ [${category}] Loaded: ${command.name}`));
                        categoryCount++;
                        
                        if (Array.isArray(command.alias)) {
                            command.alias.forEach(alias => {
                                commands.set(alias.toLowerCase(), command);
                            });
                        }
                    }
                } catch (error) {
                    console.error(chalk.red(`❌ Failed to load: ${item}`), error.message);
                }
            }
        }
        
        if (categoryCount > 0) {
            console.log(chalk.blue(`📦 ${categoryCount} commands loaded from ${category}`));
        }
    } catch (error) {
        console.error(chalk.red(`❌ Error reading folder: ${folderPath}`), error);
    }
}

// ====== ENHANCED MULTI-LOGIN SYSTEM (QR REMOVED) ======
class LoginManager {
    constructor() {
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }
    
    async selectMode() {
        console.log(chalk.yellow('\n🐺 WOLF BOT - ENHANCED LOGIN SYSTEM'));
        console.log(chalk.blue('1) Pairing Code Login (Recommended)'));
        console.log(chalk.blue('2) Session ID Import/Restore'));
        console.log(chalk.blue('3) Restore from Backup'));
        console.log(chalk.cyan(`🔑 Current Session ID: ${SESSION_ID}`));
        
        const lastMethod = getLastLoginMethod();
        if (lastMethod) {
            console.log(chalk.gray(`📝 Last used: ${lastMethod.method} at ${lastMethod.timestamp}`));
        }
        
        const choice = await this.ask('Choose option (1-3, default 1): ');
        
        switch (choice.trim()) {
            case '1':
                return await this.pairingCodeMode();
            case '2':
                return await this.sessionImportMode();
            case '3':
                return await this.restoreMode();
            default:
                return await this.pairingCodeMode();
        }
    }
    
    async pairingCodeMode() {
        console.log(chalk.cyan('\n📱 PAIRING CODE LOGIN SYSTEM'));
        console.log(chalk.gray('Enter phone number with country code (without +)'));
        console.log(chalk.gray('Example: 254788710904 for Kenya'));
        
        const phone = await this.ask('Phone number: ');
        const cleanPhone = phone.replace(/[^0-9]/g, '');
        
        if (!cleanPhone || cleanPhone.length < 10) {
            console.log(chalk.red('❌ Invalid phone number'));
            return await this.selectMode();
        }
        
        saveLoginMethod('pairing', cleanPhone);
        
        // Show session ID info
        console.log(chalk.cyan(`\n🔑 Session ID: ${SESSION_ID}`));
        console.log(chalk.gray('This ID will be used to track your session'));
        
        return { mode: 'pair', phone: cleanPhone, sessionData: null };
    }
    
    async sessionImportMode() {
        console.log(chalk.cyan('\n🔑 SESSION IMPORT SYSTEM'));
        console.log(chalk.yellow(`Current Session ID: ${SESSION_ID}`));
        
        console.log(chalk.blue('\nOptions:'));
        console.log('1) Import session from file/string');
        console.log('2) Restore session with Session ID');
        console.log('3) Generate new Session ID');
        
        const option = await this.ask('Choose option (1-3): ');
        
        switch (option.trim()) {
            case '1':
                return await this.importSessionData();
            case '2':
                return await this.restoreWithSessionId();
            case '3':
                return await this.generateNewSessionId();
            default:
                return await this.importSessionData();
        }
    }
    
    async importSessionData() {
        console.log(chalk.gray('\nPaste your session data (base64 or JSON):'));
        
        const sessionData = await this.ask('Session data: ');
        
        if (!sessionData.trim()) {
            console.log(chalk.red('❌ No session data provided'));
            return await this.sessionImportMode();
        }
        
        saveLoginMethod('session_import');
        
        try {
            let sessionJson;
            if (sessionData.startsWith('{')) {
                sessionJson = JSON.parse(sessionData);
            } else {
                const decoded = Buffer.from(sessionData, 'base64').toString();
                sessionJson = JSON.parse(decoded);
            }
            
            if (!fs.existsSync(SESSION_DIR)) {
                fs.mkdirSync(SESSION_DIR, { recursive: true });
            }
            
            fs.writeFileSync(path.join(SESSION_DIR, 'creds.json'), JSON.stringify(sessionJson, null, 2));
            
            console.log(chalk.green('✅ Session imported successfully'));
            console.log(chalk.cyan(`🔑 New Session ID: ${SESSION_ID}`));
            
            return { mode: 'session', phone: null, sessionData };
        } catch (error) {
            console.error(chalk.red('❌ Invalid session data:'), error.message);
            return await this.sessionImportMode();
        }
    }
    
    async restoreWithSessionId() {
        console.log(chalk.gray('\nEnter Session ID to restore:'));
        const inputSessionId = await this.ask('Session ID: ');
        
        if (!inputSessionId.trim()) {
            console.log(chalk.red('❌ No Session ID provided'));
            return await this.sessionImportMode();
        }
        
        // Look for backups with this session ID
        if (!fs.existsSync(SESSION_BACKUP_DIR)) {
            console.log(chalk.red('❌ No backups available'));
            return await this.sessionImportMode();
        }
        
        const backups = fs.readdirSync(SESSION_BACKUP_DIR)
            .filter(f => f.includes(inputSessionId))
            .sort()
            .reverse();
        
        if (backups.length === 0) {
            console.log(chalk.red(`❌ No backups found for Session ID: ${inputSessionId}`));
            return await this.sessionImportMode();
        }
        
        console.log(chalk.cyan(`\n📂 Found ${backups.length} backup(s) for Session ID: ${inputSessionId}`));
        
        // Use the most recent backup
        const backupPath = path.join(SESSION_BACKUP_DIR, backups[0]);
        
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
        
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        
        const backupFiles = fs.readdirSync(backupPath);
        backupFiles.forEach(file => {
            if (!file.includes('session_id_backup')) {
                const src = path.join(backupPath, file);
                const dest = path.join(SESSION_DIR, file);
                fs.copyFileSync(src, dest);
            }
        });
        
        // Update session ID
        SESSION_ID = inputSessionId;
        saveSessionId();
        
        console.log(chalk.green(`✅ Restored session: ${backups[0]}`));
        console.log(chalk.cyan(`🔑 Session ID: ${SESSION_ID}`));
        
        saveLoginMethod('restore_session_id');
        
        return { mode: 'restore', phone: null, sessionData: null };
    }
    
    async generateNewSessionId() {
        const newSessionId = generateSessionId();
        console.log(chalk.cyan(`\n🆕 New Session ID generated: ${newSessionId}`));
        
        const confirm = await this.ask('Use this Session ID? (y/n): ');
        
        if (confirm.toLowerCase() === 'y') {
            SESSION_ID = newSessionId;
            saveSessionId();
            
            console.log(chalk.green('✅ New Session ID saved'));
            return await this.pairingCodeMode();
        } else {
            return await this.sessionImportMode();
        }
    }
    
    async restoreMode() {
        if (!fs.existsSync(SESSION_BACKUP_DIR)) {
            console.log(chalk.red('❌ No backups available'));
            return await this.selectMode();
        }
        
        const backups = fs.readdirSync(SESSION_BACKUP_DIR)
            .filter(f => f.startsWith('session_backup_'))
            .sort()
            .reverse();
        
        if (backups.length === 0) {
            console.log(chalk.red('❌ No backups available'));
            return await this.selectMode();
        }
        
        console.log(chalk.cyan('\n💾 AVAILABLE BACKUPS:'));
        backups.forEach((backup, index) => {
            const backupPath = path.join(SESSION_BACKUP_DIR, backup);
            const stats = fs.statSync(backupPath);
            
            // Try to read session ID from backup
            let sessionIdInfo = 'Unknown';
            try {
                const sessionIdFile = path.join(backupPath, 'session_id_backup.json');
                if (fs.existsSync(sessionIdFile)) {
                    const sessionData = JSON.parse(fs.readFileSync(sessionIdFile, 'utf8'));
                    sessionIdInfo = sessionData.sessionId.substring(0, 8) + '...';
                }
            } catch (e) {}
            
            console.log(chalk.blue(`${index + 1}) ${backup}`));
            console.log(chalk.gray(`   Session ID: ${sessionIdInfo} - ${moment(stats.mtime).fromNow()}`));
        });
        
        const choice = await this.ask(`Select backup (1-${backups.length}, or 0 to cancel): `);
        const index = parseInt(choice) - 1;
        
        if (isNaN(index) || index < 0 || index >= backups.length) {
            console.log(chalk.yellow('↩️ Returning to main menu'));
            return await this.selectMode();
        }
        
        const backupPath = path.join(SESSION_BACKUP_DIR, backups[index]);
        
        if (fs.existsSync(SESSION_DIR)) {
            fs.rmSync(SESSION_DIR, { recursive: true, force: true });
        }
        
        fs.mkdirSync(SESSION_DIR, { recursive: true });
        
        const backupFiles = fs.readdirSync(backupPath);
        backupFiles.forEach(file => {
            const src = path.join(backupPath, file);
            const dest = path.join(SESSION_DIR, file);
            fs.copyFileSync(src, dest);
        });
        
        // Try to restore session ID
        try {
            const sessionIdFile = path.join(backupPath, 'session_id_backup.json');
            if (fs.existsSync(sessionIdFile)) {
                const sessionData = JSON.parse(fs.readFileSync(sessionIdFile, 'utf8'));
                SESSION_ID = sessionData.sessionId;
                saveSessionId();
                console.log(chalk.cyan(`🔑 Restored Session ID: ${SESSION_ID}`));
            }
        } catch (e) {}
        
        console.log(chalk.green(`✅ Restored backup: ${backups[index]}`));
        saveLoginMethod('backup_restore');
        
        return { mode: 'restore', phone: null, sessionData: null };
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

// ====== BOT INITIALIZATION ======
async function startBot(loginMode = 'pair', phoneNumber = null, sessionData = null) {
    console.log(chalk.magenta('\n🔧 INITIALIZING WHATSAPP CONNECTION...'));
    
    await checkAndUpdateCodebase();
    
    // Load or generate Session ID
    loadSessionId();
    
    const sessionCheck = await checkSessionIntegrity();
    if (!sessionCheck.valid && loginMode !== 'pair') {
        console.log(chalk.yellow(`⚠️ Session invalid (${sessionCheck.reason}), forcing clean login`));
        cleanAuth(true);
    }
    
    console.log(chalk.blue('📂 Loading commands...'));
    commands.clear();
    commandCategories.clear();
    
    await loadCommandsFromFolder('./commands');
    
    console.log(chalk.green(`✅ Loaded ${commands.size} commands in ${commandCategories.size} categories`));
    
    store = new MessageStore();
    
    ensureSessionDir();
    
    // Import Baileys
    const { default: makeWASocket } = await import('@whiskeysockets/baileys');
    const { useMultiFileAuthState } = await import('@whiskeysockets/baileys');
    const { fetchLatestBaileysVersion, makeCacheableSignalKeyStore, Browsers } = await import('@whiskeysockets/baileys');
    const P = (await import('pino')).default;
    
    let state, saveCreds;
    try {
        console.log(chalk.blue('🔐 Loading authentication...'));
        const authState = await useMultiFileAuthState(SESSION_DIR);
        state = authState.state;
        saveCreds = authState.saveCreds;
        console.log(chalk.green('✅ Auth loaded'));
    } catch (error) {
        console.error(chalk.red('❌ Auth error:'), error.message);
        cleanAuth(true);
        const freshAuth = await useMultiFileAuthState(SESSION_DIR);
        state = freshAuth.state;
        saveCreds = freshAuth.saveCreds;
    }
    
    const { version } = await fetchLatestBaileysVersion();
    
    const sock = makeWASocket({
        version,
        logger: P({ level: 'warn' }),
        browser: Browsers.ubuntu('Chrome'),
        printQRInTerminal: false, // QR Code disabled
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, P({ level: 'fatal' })),
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        connectTimeoutMs: 60000,
        keepAliveIntervalMs: 15000,
        defaultQueryTimeoutMs: 0,
        emitOwnEvents: true,
        mobile: false,
        getMessage: async (key) => {
            return store?.getMessage(key.remoteJid, key.id) || null;
        }
    });
    
    SOCKET_INSTANCE = sock;
    
    // ====== EVENT HANDLERS ======
    
    sock.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        
        console.log(chalk.gray(`🔗 Connection: ${connection || 'connecting'}`));
        
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
║ 🆔 Session ID: ${chalk.cyan(SESSION_ID.substring(0, 16).padEnd(23))}║
║ ⏰ Expires: ${chalk.red('10 minutes'.padEnd(27))}║
╚════════════════════════════════════════════════╝
`));
                } catch (error) {
                    console.error(chalk.red('❌ Pairing failed:'), error.message);
                }
            }, 5000);
        }
        
        if (connection === 'open') {
            isConnected = true;
            startMemoryClearing();
            await handleSuccessfulConnection(sock, loginMode, phoneNumber);
        }
        
        if (connection === 'close') {
            isConnected = false;
            stopMemoryClearing();
            await handleConnectionClose(lastDisconnect, loginMode, phoneNumber);
        }
    });
    
    sock.ev.on('creds.update', saveCreds);
    
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;
        
        const msg = messages[0];
        if (!msg.message) return;
        
        const messageId = msg.key.id;
        
        if (isMessageRecent(messageId)) {
            console.log(chalk.gray(`⏱️  Ignoring duplicate message: ${messageId}`));
            return;
        }
        
        addToMessageHistory(messageId);
        
        if (store) {
            store.addMessage(msg.key.remoteJid, messageId, {
                message: msg.message,
                key: msg.key,
                timestamp: Date.now()
            });
        }
        
        await handleIncomingMessage(sock, msg);
    });
    
    // Auto-cleanup intervals
    setInterval(() => {
        if (store) store.cleanup(24);
    }, 3600000);
    
    setInterval(() => {
        backupSession();
    }, 3600000 * 6);
    
    return sock;
}

// ====== CONNECTION HANDLERS ======
async function handleSuccessfulConnection(sock, loginMode, phoneNumber) {
    const currentTime = moment().format('h:mm:ss A');
    
    OWNER_JID = sock.user.id;
    OWNER_NUMBER = OWNER_JID.split('@')[0];
    
    const ownerData = {
        OWNER_NUMBER,
        OWNER_JID,
        linkedAt: new Date().toISOString(),
        loginMethod: loginMode,
        phoneNumber: phoneNumber,
        version: VERSION,
        sessionId: SESSION_ID
    };
    
    fs.writeFileSync(OWNER_FILE, JSON.stringify(ownerData, null, 2));
    
    if (!fs.existsSync(BOT_MODE_FILE)) {
        setBotMode('public', 'initial_setup');
    }
    
    const currentMode = getBotMode();
    
    console.log(chalk.greenBright(`
╔════════════════════════════════════════════════════════╗
║                    🐺 ${chalk.bold('SILENT WOLF ONLINE')}                    ║
╠════════════════════════════════════════════════════════╣
║  ✅ Connected successfully!                            
║  👑 Owner : +${OWNER_NUMBER}
║  🔑 Session ID: ${chalk.cyan(SESSION_ID)}
║  🔒 Mode  : ${currentMode === 'private' ? chalk.red('PRIVATE 🔒') : 
                currentMode === 'group_only' ? chalk.blue('GROUP ONLY 👥') : 
                chalk.green('PUBLIC 🌍')}
║  📱 Device : ${chalk.cyan(`${BOT_NAME} - Chrome`)}       
║  🕒 Time   : ${chalk.yellow(currentTime)}                 
║  🔥 Status : ${chalk.redBright('Ready to Hunt!')}         
║  🔐 Method : ${chalk.cyan(loginMode === 'pair' ? 'PAIR CODE' : 'SESSION IMPORT')}  
║  🧠 Memory : Store + ${MEMORY_CLEAR_INTERVAL/1000}s clear     
║  📊 Commands: ${commands.size} commands
╚════════════════════════════════════════════════════════╝
`));
    
    try {
        await sock.sendMessage(OWNER_JID, {
            text: `🐺 *${BOT_NAME.toUpperCase()} v${VERSION}*\n\n✅ Connected successfully!\n👑 Owner: +${OWNER_NUMBER}\n🔑 Session ID: ${SESSION_ID}\n🔒 Mode: ${currentMode.toUpperCase()}\n📱 Device: ${BOT_NAME}\n🕒 Time: ${currentTime}\n🔐 Method: ${loginMode === 'pair' ? 'Pair Code' : 'Session Import'}\n📊 Commands: ${commands.size}\n🧠 Memory: Store + auto-clear\n\nUse *${PREFIX}help* for commands.`
        });
    } catch (error) {
        console.log(chalk.yellow('⚠️ Could not send welcome message'));
    }
}

async function handleConnectionClose(lastDisconnect, loginMode, phoneNumber) {
    const statusCode = lastDisconnect?.error?.output?.statusCode;
    const reason = lastDisconnect?.error?.output?.payload?.message || 'Unknown';
    
    console.log(chalk.red(`\n❌ Disconnected: ${reason} (${statusCode})`));
    console.log(chalk.cyan(`🔑 Session ID: ${SESSION_ID}`));
    
    trackError('connection_close', { statusCode, reason, loginMode, sessionId: SESSION_ID });
    
    if (statusCode === 401 || statusCode === 403 || statusCode === 419) {
        console.log(chalk.yellow('🔓 Logged out/invalid session. Cleaning...'));
        cleanAuth();
    } else if (statusCode === 408) {
        console.log(chalk.yellow('⏱️ Connection timeout'));
    }
    
    console.log(chalk.blue('🔄 Reconnecting in 5s...'));
    setTimeout(() => startBot(loginMode, phoneNumber), 5000);
}

// ====== MESSAGE HANDLER ======
async function handleIncomingMessage(sock, msg) {
    const chatId = msg.key.remoteJid;
    const textMsg = msg.message.conversation || 
                   msg.message.extendedTextMessage?.text || 
                   msg.message.imageMessage?.caption || 
                   msg.message.videoMessage?.caption || '';
    
    if (!textMsg) return;
    
    if (textMsg.startsWith(PREFIX)) {
        if (!isUserAllowed(chatId)) {
            console.log(chalk.yellow(`🚫 Blocked command from ${chatId.split('@')[0]}`));
            await sock.sendMessage(chatId, {
                text: `🔒 *PRIVATE MODE*\n\nOnly authorized users can use commands.\nCurrent mode: ${getBotMode().toUpperCase()}\n🔑 Session ID: ${SESSION_ID}`
            }, { quoted: msg });
            return;
        }
        
        const parts = textMsg.slice(PREFIX.length).trim().split(/\s+/);
        const commandName = parts[0].toLowerCase();
        const args = parts.slice(1);
        
        console.log(chalk.magenta(`📩 ${chatId.split('@')[0]} → ${PREFIX}${commandName} ${args.join(' ')}`));
        
        const command = commands.get(commandName);
        if (command) {
            try {
                await command.execute(sock, msg, args, PREFIX, {
                    OWNER_NUMBER,
                    OWNER_JID,
                    BOT_NAME,
                    VERSION,
                    SESSION_ID,
                    getMode: getBotMode,
                    setMode: setBotMode,
                    isOwner: () => isOwner(chatId),
                    store
                });
            } catch (error) {
                console.error(chalk.red(`❌ Command error ${commandName}:`), error);
            }
        } else {
            await handleDefaultCommands(commandName, sock, msg, args);
        }
    }
}

// ====== ENHANCED DEFAULT COMMANDS ======
async function handleDefaultCommands(commandName, sock, msg, args) {
    const chatId = msg.key.remoteJid;
    
    switch (commandName) {
        case 'help':
            let helpText = `🐺 *${BOT_NAME} HELP*\n\n`;
            helpText += `Prefix: ${PREFIX}\n`;
            helpText += `Mode: ${getBotMode().toUpperCase()}\n`;
            helpText += `Session ID: ${SESSION_ID}\n`;
            helpText += `Commands: ${commands.size}\n\n`;
            
            for (const [category, cmds] of commandCategories.entries()) {
                helpText += `*${category.toUpperCase()}*\n`;
                helpText += `${cmds.slice(0, 10).join(', ')}`;
                if (cmds.length > 10) helpText += `... (+${cmds.length - 10} more)`;
                helpText += '\n\n';
            }
            
            helpText += `Use ${PREFIX}help <command> for details`;
            await sock.sendMessage(chatId, { text: helpText }, { quoted: msg });
            break;
            
        case 'info':
            const botMode = getBotMode();
            await sock.sendMessage(chatId, { 
                text: `🐺 *${BOT_NAME} INFORMATION*\n\n` +
                      `⚙️ Version: ${VERSION}\n` +
                      `💬 Prefix: ${PREFIX}\n` +
                      `🔑 Session ID: ${SESSION_ID}\n` +
                      `👑 Owner: Silent Wolf\n` +
                      `📱 Owner Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                      `🔒 Mode: ${botMode.toUpperCase()} ${botMode === 'private' ? '🔒' : '🌍'}\n` +
                      `🔥 Status: ${isConnected ? 'Online ✅' : 'Offline ❌'}\n` +
                      `🧠 Memory: Persistent auto-clear ${MEMORY_CLEAR_INTERVAL/1000}s\n` +
                      `📊 Commands: ${commands.size} loaded\n` +
                      `💾 Recent Msgs: ${messageHistory.size}`
            }, { quoted: msg });
            break;
            
        case 'owner':
            await sock.sendMessage(chatId, { 
                text: `👑 *BOT OWNER*\n\n` +
                      `🐺 Name: Silent Wolf\n` +
                      `📱 Number: +${OWNER_NUMBER || 'Unknown'}\n` +
                      `🔑 Session ID: ${SESSION_ID}\n` +
                      `⚡ Version: ${VERSION}\n` +
                      `🔧 Status: ${isConnected ? 'Active' : 'Inactive'}\n` +
                      `🧠 Memory: Persistent auto-clear ${MEMORY_CLEAR_INTERVAL/1000}s\n` +
                      `🔒 Mode: ${getBotMode().toUpperCase()}`
            }, { quoted: msg });
            break;
            
        case 'status':
            await sock.sendMessage(chatId, { 
                text: `📊 *CONNECTION STATUS*\n\n` +
                      `🟢 Status: ${isConnected ? 'Connected ✅' : 'Disconnected ❌'}\n` +
                      `📱 Owner: +${OWNER_NUMBER || 'Unknown'}\n` +
                      `🔑 Session ID: ${SESSION_ID}\n` +
                      `🐺 Bot: ${BOT_NAME}\n` +
                      `⚡ Version: ${VERSION}\n` +
                      `🔒 Mode: ${getBotMode().toUpperCase()}\n` +
                      `🧠 Memory: ${messageHistory.size} messages tracked\n` +
                      `⏱️  Clear Interval: ${MEMORY_CLEAR_INTERVAL/1000}s`
            }, { quoted: msg });
            break;
            
        case 'clear':
            const beforeCount = messageHistory.size;
            messageHistory.clear();
            saveMessageHistory();
            console.log(chalk.green(`🧹 Manually cleared ${beforeCount} messages from memory`));
            await sock.sendMessage(chatId, { 
                text: `🧹 *MEMORY CLEARED*\n\nCleared ${beforeCount} messages from memory.\n🔑 Session ID: ${SESSION_ID}\nBot will only respond to new messages.`
            }, { quoted: msg });
            break;
            
        case 'mode':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, {
                    text: `❌ *Permission Denied*\n\nOnly the bot owner can change mode.\n\n*Current Owner:* +${OWNER_NUMBER}\n*Your Number:* ${chatId.split('@')[0]}\n🔑 Session ID: ${SESSION_ID}`
                }, { quoted: msg });
                return;
            }
            
            if (args.length === 0) {
                const currentMode = getBotMode();
                const statusText = currentMode === 'private' 
                    ? '🔒 *PRIVATE MODE*\nOnly you (owner) can use commands.'
                    : '🌍 *PUBLIC MODE*\nEveryone can use commands.';
                
                await sock.sendMessage(chatId, {
                    text: `🤖 *BOT MODE*\n\n${statusText}\n🔑 Session ID: ${SESSION_ID}\n\n*Usage:*\n• ${PREFIX}mode public\n• ${PREFIX}mode private\n• ${PREFIX}mode group_only\n\nOwner: +${OWNER_NUMBER}`
                }, { quoted: msg });
                return;
            }
            
            const newMode = args[0].toLowerCase();
            
            if (newMode !== 'public' && newMode !== 'private' && newMode !== 'group_only') {
                await sock.sendMessage(chatId, {
                    text: `❌ *Invalid Mode*\n\nPlease use:\n• ${PREFIX}mode public\n• ${PREFIX}mode private\n• ${PREFIX}mode group_only\n\nCurrent Mode: ${getBotMode().toUpperCase()}\n🔑 Session ID: ${SESSION_ID}`
                }, { quoted: msg });
                return;
            }
            
            const success = setBotMode(newMode);
            
            if (!success) {
                await sock.sendMessage(chatId, {
                    text: '❌ Error saving mode. Please try again.'
                }, { quoted: msg });
                return;
            }
            
            const modeEmoji = newMode === 'private' ? '🔒' : (newMode === 'group_only' ? '👥' : '🌍');
            const modeDescription = newMode === 'private' 
                ? 'Only you (owner) can use commands.'
                : (newMode === 'group_only' 
                    ? 'Only group chats can use commands.'
                    : 'Everyone can use commands.');
            
            await sock.sendMessage(chatId, {
                text: `${modeEmoji} *MODE CHANGED*\n\nBot mode changed to: *${newMode.toUpperCase()}*\n🔑 Session ID: ${SESSION_ID}\n\n${modeDescription}\n\n✅ Mode saved successfully!\n\nOwner: +${OWNER_NUMBER}`
            }, { quoted: msg });
            
            console.log(chalk.blue(`🔧 Mode changed to ${newMode} by owner +${OWNER_NUMBER}`));
            break;
            
        case 'backup':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                return;
            }
            await backupSession();
            await sock.sendMessage(chatId, { 
                text: `✅ Session backed up\n🔑 Session ID: ${SESSION_ID}` 
            }, { quoted: msg });
            break;
            
        case 'restart':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                return;
            }
            await sock.sendMessage(chatId, { 
                text: `🔄 Restarting bot...\n🔑 Session ID: ${SESSION_ID}` 
            });
            process.exit(1);
            break;
            
        case 'update':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                return;
            }
            await sock.sendMessage(chatId, { text: '🔄 Checking for updates...' });
            await checkAndUpdateCodebase();
            break;
            
        case 'session':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                return;
            }
            
            const sessionCheck = await checkSessionIntegrity();
            const sessionInfo = getSessionInfo();
            const sessionText = `🔐 *SESSION INFORMATION*\n\n` +
                               `🔑 Session ID: ${SESSION_ID}\n` +
                               `📅 Created: ${new Date(sessionInfo.created).toLocaleString()}\n` +
                               `⚙️ Version: ${sessionInfo.version}\n` +
                               `Status: ${sessionCheck.valid ? '✅ Valid' : '❌ Invalid'}\n` +
                               `Reason: ${sessionCheck.reason || 'N/A'}\n` +
                               `Backups: ${fs.existsSync(SESSION_BACKUP_DIR) ? 
                                   fs.readdirSync(SESSION_BACKUP_DIR)
                                       .filter(f => f.includes(SESSION_ID)).length : 0} with this ID\n\n` +
                               `Use ${PREFIX}backup to create backup\n` +
                               `Use ${PREFIX}clean to force new session`;
            
            await sock.sendMessage(chatId, { text: sessionText }, { quoted: msg });
            break;
            
        case 'sessionid':
            await sock.sendMessage(chatId, { 
                text: `🔑 *SESSION ID*\n\n${SESSION_ID}\n\nKeep this safe for session restoration.`
            }, { quoted: msg });
            break;
            
        case 'clean':
            if (!isOwner(chatId)) {
                await sock.sendMessage(chatId, { text: '❌ Owner only command' }, { quoted: msg });
                return;
            }
            
            cleanAuth(true);
            await sock.sendMessage(chatId, { 
                text: `🧹 Session cleaned. New Session ID generated.\nBot will restart for fresh login.\n🔑 New Session ID: ${SESSION_ID}` 
            });
            
            setTimeout(() => {
                process.exit(1);
            }, 2000);
            break;
    }
}

// ====== MAIN APPLICATION ======
async function main() {
    try {
        console.log(chalk.blue('\n🚀 Starting Enhanced Wolf Bot...'));
        
        // Load Session ID
        loadSessionId();
        
        // Clean old messages on startup
        if (fs.existsSync(MESSAGE_HISTORY_FILE)) {
            const data = JSON.parse(fs.readFileSync(MESSAGE_HISTORY_FILE, 'utf8'));
            const now = Date.now();
            const filteredData = {};
            
            for (const [messageId, timestamp] of Object.entries(data)) {
                if (timestamp > now - (60 * 60 * 1000)) {
                    filteredData[messageId] = timestamp;
                }
            }
            
            fs.writeFileSync(MESSAGE_HISTORY_FILE, JSON.stringify(filteredData, null, 2));
            console.log(chalk.gray('🧹 Cleaned old message history'));
        }
        
        // Select login mode
        const loginManager = new LoginManager();
        const { mode, phone, sessionData } = await loginManager.selectMode();
        loginManager.close();
        
        console.log(chalk.gray(`Starting with ${mode} mode... Session ID: ${SESSION_ID}`));
        await startBot(mode, phone, sessionData);
        
    } catch (error) {
        console.error(chalk.red('💥 Fatal error:'), error);
        console.log(chalk.blue('🔄 Restarting in 10s...'));
        await delay(10000);
        main();
    }
}

// ====== PROCESS HANDLERS ======
process.on('SIGINT', () => {
    console.log(chalk.yellow('\n👋 Shutting down...'));
    console.log(chalk.cyan(`🔑 Session ID: ${SESSION_ID}`));
    stopMemoryClearing();
    if (SOCKET_INSTANCE) SOCKET_INSTANCE.ws.close();
    if (store) store.save();
    process.exit(0);
});

process.on('uncaughtException', (error) => {
    console.error(chalk.red('💥 Uncaught Exception:'), error);
    trackError('uncaught_exception', { error: error.message, sessionId: SESSION_ID });
});

process.on('unhandledRejection', (error) => {
    console.error(chalk.red('💥 Unhandled Rejection:'), error);
    trackError('unhandled_rejection', { error: error.message, sessionId: SESSION_ID });
});

// Start
main().catch(error => {
    console.error(chalk.red('💥 Critical:'), error);
    process.exit(1);
});