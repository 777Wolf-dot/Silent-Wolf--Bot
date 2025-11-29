import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Sticker storage management with proper file handling
class StickerManager {
    constructor() {
        this.dataFile = path.join(__dirname, 'sticker_data.json');
        this.stickerPacks = {};
        this.userPreferences = {};
        this.ensureDataFile();
    }

    async ensureDataFile() {
        try {
            await fs.access(this.dataFile);
            // File exists, load data
            await this.loadData();
        } catch (error) {
            // File doesn't exist, create with default data
            this.stickerPacks = { 'WolfBot': [] };
            this.userPreferences = {};
            await this.saveData();
        }
    }

    async loadData() {
        try {
            const data = await fs.readFile(this.dataFile, 'utf8');
            const parsed = JSON.parse(data);
            this.stickerPacks = parsed.stickerPacks || { 'WolfBot': [] };
            this.userPreferences = parsed.userPreferences || {};
            console.log('📦 Loaded sticker data:', {
                packs: Object.keys(this.stickerPacks).length,
                users: Object.keys(this.userPreferences).length
            });
        } catch (error) {
            console.error('Error loading sticker data:', error);
            this.stickerPacks = { 'WolfBot': [] };
            this.userPreferences = {};
            await this.saveData();
        }
    }

    async saveData() {
        try {
            const data = {
                stickerPacks: this.stickerPacks,
                userPreferences: this.userPreferences,
                lastUpdated: new Date().toISOString()
            };
            await fs.writeFile(this.dataFile, JSON.stringify(data, null, 2));
            console.log('💾 Saved sticker data');
        } catch (error) {
            console.error('Error saving sticker data:', error);
        }
    }

    getUserPack(userId) {
        return this.userPreferences[userId] || 'WolfBot';
    }

    setUserPack(userId, packName) {
        this.userPreferences[userId] = packName;
        // Create pack if it doesn't exist
        if (!this.stickerPacks[packName]) {
            this.stickerPacks[packName] = [];
            console.log(`📦 Created new pack: ${packName}`);
        }
        this.saveData();
        return !this.stickerPacks[packName]; // Return true if newly created
    }

    getPackStickers(packName) {
        return this.stickerPacks[packName] || [];
    }

    listPacks() {
        return Object.keys(this.stickerPacks);
    }

    async addSticker(userId, packName) {
        // Ensure pack exists
        if (!this.stickerPacks[packName]) {
            this.stickerPacks[packName] = [];
        }

        const sticker = {
            id: `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            addedBy: userId,
            timestamp: Date.now(),
            date: new Date().toLocaleString()
        };

        this.stickerPacks[packName].push(sticker);
        await this.saveData();
        console.log(`✅ Added sticker to pack ${packName}, total: ${this.stickerPacks[packName].length}`);
        return sticker.id;
    }

    getPackCount() {
        return Object.keys(this.stickerPacks).length;
    }

    getTotalStickers() {
        return Object.values(this.stickerPacks).reduce((total, pack) => total + pack.length, 0);
    }

    // Debug method to show current state
    getDebugInfo() {
        return {
            packs: this.stickerPacks,
            users: this.userPreferences,
            totalPacks: this.getPackCount(),
            totalStickers: this.getTotalStickers()
        };
    }
}

const stickerManager = new StickerManager();

export default {
    name: 'take',
    description: 'Save and manage WhatsApp stickers in packs',
    category: 'utility',
    aliases: ['sticker', 'pack'],
    
    async execute(client, message, args) {
        try {
            const chatId = message.key.remoteJid;
            const userId = message.key.participant || message.key.remoteJid;

            console.log(`🎨 Take command executed by ${userId}, args:`, args);

            // Help command
            if (!args.length || args[0] === 'help') {
                const helpText = `🎨 *Take Command - Sticker Manager* 🎨

*Commands:*
!take pack <name> - Switch/create sticker pack
!take mypack - Show current pack  
!take list - List all packs
!take save - Save replied sticker
!take stats - Show sticker statistics
!take debug - Show debug information

*Default Pack:* WolfBot
*Usage:* Reply to a sticker with "!take save"`;

                await client.sendMessage(chatId, { text: helpText });
                return;
            }

            // Handle different subcommands
            switch (args[0]) {
                case 'pack':
                    if (args[1]) {
                        const packName = args.slice(1).join(' ');
                        const wasNewPack = !stickerManager.stickerPacks[packName];
                        stickerManager.setUserPack(userId, packName);
                        
                        const stickerCount = stickerManager.getPackStickers(packName).length;
                        let response = `✅ Sticker pack ${wasNewPack ? 'created and ' : ''}set to: *${packName}*`;
                        response += `\n📊 Stickers in pack: ${stickerCount}`;
                        
                        if (wasNewPack) {
                            response += `\n🎉 New pack created! Start saving stickers with !take save`;
                        }
                        
                        await client.sendMessage(chatId, { text: response });
                    } else {
                        await client.sendMessage(chatId, {
                            text: '❌ Please specify a pack name. Usage: !take pack PackName'
                        });
                    }
                    break;
                    
                case 'mypack':
                    const currentPack = stickerManager.getUserPack(userId);
                    const stickerCount = stickerManager.getPackStickers(currentPack).length;
                    const responseText = `📦 Your current sticker pack: *${currentPack}*\n📊 Stickers in pack: ${stickerCount}`;
                    await client.sendMessage(chatId, { text: responseText });
                    break;
                    
                case 'list':
                    const packs = stickerManager.listPacks();
                    const currentUserPack = stickerManager.getUserPack(userId);
                    
                    if (packs.length === 0) {
                        await client.sendMessage(chatId, {
                            text: '📭 No sticker packs found. Use *!take pack Name* to create one!'
                        });
                        return;
                    }
                    
                    let listResponse = `📚 Available Sticker Packs (${packs.length}):\n\n`;
                    packs.forEach(pack => {
                        const count = stickerManager.getPackStickers(pack).length;
                        const indicator = pack === currentUserPack ? '⭐ ' : '📁 ';
                        listResponse += `${indicator}*${pack}* - ${count} stickers\n`;
                    });
                    
                    listResponse += `\nUse *!take pack Name* to switch packs`;
                    await client.sendMessage(chatId, { text: listResponse });
                    break;
                    
                case 'save':
                    if (!message.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
                        await client.sendMessage(chatId, {
                            text: '❌ Please reply to a sticker with this command to save it.\nExample: Reply to a sticker and type "!take save"'
                        });
                        return;
                    }

                    const quotedMsg = message.message.extendedTextMessage.contextInfo.quotedMessage;
                    if (!quotedMsg.stickerMessage) {
                        await client.sendMessage(chatId, {
                            text: '❌ Please reply to a *sticker* message. This message is not a sticker.'
                        });
                        return;
                    }

                    const userPack = stickerManager.getUserPack(userId);
                    
                    try {
                        const stickerId = await stickerManager.addSticker(userId, userPack);
                        const newStickerCount = stickerManager.getPackStickers(userPack).length;
                        
                        await client.sendMessage(chatId, {
                            text: `✅ Sticker saved successfully!\n\n` +
                                  `📦 Pack: *${userPack}*\n` +
                                  `🆔 ID: ${stickerId}\n` +
                                  `📊 Total in pack: ${newStickerCount}\n\n` +
                                  `Use *!take mypack* to see your collection`
                        });
                    } catch (error) {
                        console.error('Error saving sticker:', error);
                        await client.sendMessage(chatId, {
                            text: '❌ Failed to save sticker. Please try again.'
                        });
                    }
                    break;

                case 'stats':
                    const totalPacks = stickerManager.getPackCount();
                    const totalStickers = stickerManager.getTotalStickers();
                    const userCurrentPack = stickerManager.getUserPack(userId);
                    const userStickerCount = stickerManager.getPackStickers(userCurrentPack).length;
                    
                    await client.sendMessage(chatId, {
                        text: `📊 *Sticker Statistics*\n\n` +
                              `📦 Total Packs: ${totalPacks}\n` +
                              `🎨 Total Stickers: ${totalStickers}\n` +
                              `👤 Your Pack: *${userCurrentPack}*\n` +
                              `📎 Your Stickers: ${userStickerCount}`
                    });
                    break;

                case 'debug':
                    // Only allow debug for admins or in specific chats if needed
                    const debugInfo = stickerManager.getDebugInfo();
                    await client.sendMessage(chatId, {
                        text: `🔧 *Debug Information*\n\n` +
                              `Packs: ${debugInfo.totalPacks}\n` +
                              `Stickers: ${debugInfo.totalStickers}\n` +
                              `Your ID: ${userId}\n` +
                              `Your Pack: ${stickerManager.getUserPack(userId)}`
                    });
                    break;
                    
                default:
                    await client.sendMessage(chatId, {
                        text: '❌ Unknown command. Use *!take help* for available commands.'
                    });
            }

        } catch (error) {
            console.error('Take command error:', error);
            try {
                await client.sendMessage(message.key.remoteJid, {
                    text: '❌ An error occurred. Please try again.'
                });
            } catch (sendError) {
                console.error('Failed to send error message:', sendError);
            }
        }
    }
};