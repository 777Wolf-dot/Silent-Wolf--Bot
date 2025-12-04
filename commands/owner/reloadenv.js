// ====== reloadenv.js - Reload Environment ======
// Save as: ./commands/owner/reloadenv.js

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'reloadenv',
    alias: ['reloadconfig', 'refreshconfig'],
    description: 'Reload environment variables without restart',
    category: 'owner',
    
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        const userJid = msg.key.participant || remoteJid;
        const ownerJid = sock.user.id;
        
        // Check if user is owner
        if (userJid !== ownerJid) {
            return await sock.sendMessage(remoteJid, {
                text: '❌ Owner only command!'
            }, { quoted: msg });
        }
        
        try {
            // Reload .env file
            const envPath = path.join(__dirname, '../../.env');
            dotenv.config({ path: envPath, override: true });
            
            await sock.sendMessage(remoteJid, {
                text: '✅ Environment variables reloaded!\n\nSome settings may require restart to take full effect.'
            }, { quoted: msg });
            
        } catch (error) {
            console.error('Reload env error:', error);
            await sock.sendMessage(remoteJid, {
                text: '❌ Failed to reload environment variables'
            }, { quoted: msg });
        }
    }
};