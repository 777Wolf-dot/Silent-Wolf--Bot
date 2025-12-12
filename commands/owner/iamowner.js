import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OWNER_FILE = path.join(__dirname, '..', 'owner.json');
const MAPPING_FILE = path.join(__dirname, '..', 'lid_owner_mappings.json');

function loadOwnerInfo() {
  try {
    if (fs.existsSync(OWNER_FILE)) {
      const data = fs.readFileSync(OWNER_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading owner.json:', error);
  }
  return { number: '254733961184' };
}

function loadMappings() {
  try {
    if (fs.existsSync(MAPPING_FILE)) {
      const data = fs.readFileSync(MAPPING_FILE, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.log('Error loading mappings:', error.message);
  }
  return { lidToPhone: {}, directDMs: {}, lastUpdated: new Date().toISOString() };
}

function saveMappings(mappings) {
  try {
    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mappings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving mappings:', error);
    return false;
  }
}

export default {
  name: "iamowner",
  description: "Force verify yourself as bot owner",
  category: "config",
  
  async execute(sock, msg, args) {
    const jid = msg.key.remoteJid;
    const sender = msg.key.participant || jid;
    
    try {
      console.log('\n=== I AM OWNER COMMAND ===');
      console.log('Sender:', sender);
      
      // Get owner info
      const ownerInfo = loadOwnerInfo();
      const ownerPhone = ownerInfo.number.replace(/\D/g, '');
      console.log('Owner phone:', ownerPhone);
      
      // Ask for owner phone verification
      if (!args[0]) {
        await sock.sendMessage(jid, {
          text: `🔐 *Verify Ownership*\n\nTo prove you're the owner, please provide the owner phone number.\n\nOwner number ends with: ***${ownerPhone.slice(-4)}***\n\nUsage: .iamowner <full_owner_phone>\nExample: .iamowner 254733961184`
        }, { quoted: msg });
        return;
      }
      
      const providedPhone = args[0].replace(/\D/g, '');
      
      if (providedPhone !== ownerPhone) {
        await sock.sendMessage(jid, {
          text: `❌ *Incorrect Phone*\n\nProvided: ${providedPhone}\nExpected: ${ownerPhone}\n\nTry again with the correct owner phone number.`
        }, { quoted: msg });
        return;
      }
      
      // Phone matches! Force add mappings
      const mappings = loadMappings();
      
      // Add DM mapping
      mappings.directDMs[ownerPhone] = sender;
      
      // If sender is LID, add LID mapping
      if (sender.endsWith('@lid')) {
        mappings.lidToPhone[sender] = ownerPhone;
      }
      
      mappings.lastUpdated = new Date().toISOString();
      saveMappings(mappings);
      
      await sock.sendMessage(jid, {
        text: `✅ *OWNERSHIP VERIFIED!*\n\n👑 *You are now verified as:* ${ownerInfo.name || 'Bot Owner'}\n📱 *Phone:* ${ownerPhone}\n💬 *Your ID:* ${sender}\n🔒 *Verified at:* ${new Date().toLocaleString()}\n\n⚙️ *Owner commands now unlocked:*\n• .setprefix - Change prefix\n• .restart - Restart bot\n• .broadcast - Broadcast messages`
      }, { quoted: msg });
      
      console.log(`✅ User ${sender} force-verified as owner ${ownerPhone}`);
      
    } catch (error) {
      console.error('❌ Iamowner error:', error);
      await sock.sendMessage(jid, {
        text: `❌ Error: ${error.message}`
      }, { quoted: msg });
    }
  }
};