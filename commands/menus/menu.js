// commands/menus/menu.js
import settingMenu from './settingMenu.js';

export default {
  name: 'menu',
  description: 'Displays the command menu',
  async execute(sock, message, args, prefix) {
    try {
      const jid = message.key.remoteJid;

      // Send the menu
      await sock.sendMessage(jid, { text: settingMenu(prefix) });
      
    } 
    
    catch (error) {
      console.error('❌ Error sending menu:', error);
      await sock.sendMessage(
        message.key.remoteJid,
        { text: '⚠️ Failed to load menu. Please try again.' }
      );
    }
  },
  
};


// import { default as settingMenu } from '../menus/settingMenu.js';

// export const command = '.menu';
// export const description = 'Display the main menu';

// export async function execute(sock, msg) {
//   try {
//     const loadingMsg = await sock.sendMessage(msg.key.remoteJid, {
//       text: '⏳ WolfBot is loading menu...'
//     });

//     // Send the actual menu after a short delay (optional)
//     await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay

//     await sock.sendMessage(msg.key.remoteJid, {
//       text: settingMenu
//     }, { quoted: loadingMsg });
    
//   } catch (error) {
//     console.error('❌ Error sending menu:', error);
//     await sock.sendMessage(msg.key.remoteJid, {
//       text: '❌ Error loading menu. Please try again.'
//     });
//   }
// }