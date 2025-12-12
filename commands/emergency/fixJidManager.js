// File: ./patches/fixJidManager.js
import { readFileSync, existsSync } from 'fs';

export function patchJidManager(jidManager) {
    console.log('🔧 Patching jidManager for LID support...');
    
    // Store original method
    const originalIsOwner = jidManager.isOwner;
    
    // Patch isOwner method
    jidManager.isOwner = function(message) {
        const participant = message?.key?.participant;
        const chatId = message?.key?.remoteJid;
        const senderJid = participant || chatId;
        const isFromMe = message?.key?.fromMe;
        
        // EMERGENCY FIX: If message is from LID and fromMe, grant owner access
        if (senderJid && senderJid.includes('@lid') && isFromMe) {
            console.log(`🔗 LID + fromMe detected, granting owner access`);
            return true;
        }
        
        // Try to load owner data if not set
        if (!this.owner || !this.owner.cleanNumber) {
            this.loadOwnerData();
        }
        
        // Call original logic
        return originalIsOwner.call(this, message);
    };
    
    // Add loadOwnerData method if it doesn't exist
    if (!jidManager.loadOwnerData) {
        jidManager.loadOwnerData = function() {
            if (existsSync('./owner.json')) {
                try {
                    const data = JSON.parse(readFileSync('./owner.json', 'utf8'));
                    this.owner = {
                        cleanNumber: data.OWNER_CLEAN_NUMBER || data.OWNER_NUMBER,
                        cleanJid: data.OWNER_CLEAN_JID || data.OWNER_JID,
                        rawJid: data.OWNER_JID
                    };
                    
                    // Fix format
                    if (this.owner.cleanNumber && this.owner.cleanNumber.includes(':')) {
                        this.owner.cleanNumber = this.owner.cleanNumber.split(':')[0];
                    }
                    if (this.owner.cleanJid && this.owner.cleanJid.includes(':74')) {
                        this.owner.cleanJid = this.owner.cleanJid.replace(':74@s.whatsapp.net', '@s.whatsapp.net');
                    }
                    
                    console.log('✅ Loaded owner data:', this.owner);
                    return true;
                } catch (error) {
                    console.error('❌ Failed to load owner data:', error);
                    return false;
                }
            }
            return false;
        };
        
        // Load immediately
        jidManager.loadOwnerData();
    }
    
    // Also set global variables
    if (jidManager.owner && jidManager.owner.cleanNumber) {
        global.OWNER_NUMBER = jidManager.owner.cleanNumber;
        global.OWNER_CLEAN_NUMBER = jidManager.owner.cleanNumber;
        global.OWNER_JID = jidManager.owner.cleanJid;
        global.OWNER_CLEAN_JID = jidManager.owner.cleanJid;
    }
    
    console.log('✅ jidManager patched successfully');
    return jidManager;
}