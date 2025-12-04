// export default {
//   name: 'autotyping',
//   description: 'Toggle auto-typing simulation in chats',
//   category: 'fun',
//   async execute(sock, msg, args, metadata) {
//     const sender = msg.key.remoteJid;
//     const text = msg.message?.conversation || msg.message?.extendedTextMessage?.text || '';
//     const [action, intervalArg] = args;
    
//     // Store active typing intervals
//     if (!global.typingIntervals) global.typingIntervals = new Map();
    
//     const currentChat = sender;
//     const currentInterval = global.typingIntervals.get(currentChat);

//     // Help command
//     if (action === 'help' || !action) {
//       const helpText = `🎮 *AutoTyping Command*\n\n` +
//         `*Usage:*\n` +
//         `• !autotyping start [seconds] - Start auto-typing\n` +
//         `• !autotyping stop - Stop auto-typing\n` +
//         `• !autotyping status - Check if active\n` +
//         `• !autotyping help - Show this help\n\n` +
//         `*Examples:*\n` +
//         `!autotyping start 5 - Typing every 5 seconds\n` +
//         `!autotyping start - Typing every 10 seconds (default)\n\n` +
//         `*What is AutoTyping?*\n` +
//         `• Makes bot show "typing..." indicator\n` +
//         `• Appears more human-like\n` +
//         `• Great for roleplay/trolling`;
      
//       await sock.sendMessage(sender, { text: helpText }, { quoted: msg });
//       return;
//     }

//     // Status command
//     if (action === 'status') {
//       const isActive = currentInterval !== undefined;
//       const statusText = isActive 
//         ? '✅ *AutoTyping is ACTIVE* in this chat\n\nBot will show typing indicator periodically.'
//         : '❌ *AutoTyping is NOT ACTIVE* in this chat\n\nUse !autotyping start to enable.';
      
//       await sock.sendMessage(sender, { text: statusText }, { quoted: msg });
//       return;
//     }

//     // Stop command
//     if (action === 'stop') {
//       if (!currentInterval) {
//         await sock.sendMessage(sender, { 
//           text: '❌ AutoTyping is not active in this chat.' 
//         }, { quoted: msg });
//         return;
//       }
      
//       clearInterval(currentInterval);
//       global.typingIntervals.delete(currentChat);
      
//       await sock.sendMessage(sender, { 
//         text: '✅ AutoTyping stopped. Bot will no longer show typing indicator.'
//       }, { quoted: msg });
//       return;
//     }

//     // Start command
//     if (action === 'start') {
//       if (currentInterval) {
//         await sock.sendMessage(sender, { 
//           text: '⚠️ AutoTyping is already active in this chat. Use "!autotyping stop" to stop it first.'
//         }, { quoted: msg });
//         return;
//       }

//       // Parse interval (default: 10 seconds, min: 3 seconds, max: 60 seconds)
//       const intervalSeconds = parseInt(intervalArg) || 10;
//       const safeInterval = Math.max(3, Math.min(60, intervalSeconds));
      
//       await sock.sendMessage(sender, { 
//         text: `✅ AutoTyping started!\n\nBot will show typing indicator every *${safeInterval} seconds*.\n\nUse "!autotyping stop" to disable.`
//       }, { quoted: msg });

//       // Start the typing simulation
//       const typingInterval = setInterval(async () => {
//         try {
//           // Send typing indicator
//           await sock.sendPresenceUpdate('composing', currentChat);
          
//           // Wait random time between 1-3 seconds (simulating actual typing)
//           const typingDuration = 1000 + Math.random() * 2000;
          
//           setTimeout(async () => {
//             // Stop typing indicator
//             await sock.sendPresenceUpdate('paused', currentChat);
//           }, typingDuration);
          
//         } catch (err) {
//           console.error('AutoTyping error:', err);
//           // Clean up if there's an error
//           clearInterval(typingInterval);
//           global.typingIntervals.delete(currentChat);
//         }
//       }, safeInterval * 1000);

//       // Store the interval
//       global.typingIntervals.set(currentChat, typingInterval);
      
//       // Send an immediate typing indicator to show it's working
//       await sock.sendPresenceUpdate('composing', currentChat);
//       setTimeout(() => sock.sendPresenceUpdate('paused', currentChat), 1500);
      
//       return;
//     }

//     // Invalid command
//     await sock.sendMessage(sender, { 
//       text: '❌ Invalid command. Use "!autotyping help" for usage instructions.'
//     }, { quoted: msg });
//   }
// };






















export default {
  name: 'autotyping',
  description: 'Toggle auto-typing simulation in chats',
  category: 'fun',
  async execute(sock, msg, args, metadata) {
    const sender = msg.key.remoteJid;
    const [action, intervalArg] = args;
    
    // Initialize typing intervals storage if not exists
    if (!global.typingIntervals) {
      global.typingIntervals = new Map();
    }
    
    const currentInterval = global.typingIntervals.get(sender);

    // Help command
    if (action === 'help' || !action) {
      const helpText = `🎮 *AutoTyping Command*\n\n` +
        `*Usage:*\n` +
        `• !autotyping start [seconds] - Start auto-typing\n` +
        `• !autotyping stop - Stop auto-typing\n` +
        `• !autotyping status - Check if active\n` +
        `• !autotyping help - Show this help\n\n` +
        `*Examples:*\n` +
        `!autotyping start 5 - Typing every 5 seconds\n` +
        `!autotyping start - Typing every 10 seconds (default)\n\n` +
        `*Note:* Works in both private chats and groups!`;
      
      await sock.sendMessage(sender, { text: helpText }, { quoted: msg });
      return;
    }

    // Status command
    if (action === 'status') {
      const isActive = currentInterval !== undefined;
      const statusText = isActive 
        ? '✅ *AutoTyping is ACTIVE* in this chat\n\nBot will show typing indicator periodically.'
        : '❌ *AutoTyping is NOT ACTIVE* in this chat\n\nUse !autotyping start to enable.';
      
      await sock.sendMessage(sender, { text: statusText }, { quoted: msg });
      return;
    }

    // Stop command
    if (action === 'stop') {
      if (!currentInterval) {
        await sock.sendMessage(sender, { 
          text: '❌ AutoTyping is not active in this chat.' 
        }, { quoted: msg });
        return;
      }
      
      clearInterval(currentInterval);
      global.typingIntervals.delete(sender);
      
      // Make sure typing is stopped
      try {
        await sock.sendPresenceUpdate('paused', sender);
      } catch (e) {
        // Ignore errors when stopping
      }
      
      await sock.sendMessage(sender, { 
        text: '✅ AutoTyping stopped. Bot will no longer show typing indicator.'
      }, { quoted: msg });
      return;
    }

    // Start command
    if (action === 'start') {
      if (currentInterval) {
        await sock.sendMessage(sender, { 
          text: '⚠️ AutoTyping is already active in this chat. Use "!autotyping stop" to stop it first.'
        }, { quoted: msg });
        return;
      }

      // Parse interval (default: 10 seconds, min: 3 seconds, max: 60 seconds)
      let intervalSeconds = 10;
      if (intervalArg && !isNaN(intervalArg)) {
        intervalSeconds = parseInt(intervalArg);
      }
      
      // Ensure interval is within limits
      intervalSeconds = Math.max(3, Math.min(60, intervalSeconds));
      
      await sock.sendMessage(sender, { 
        text: `✅ AutoTyping started!\n\nBot will show typing indicator every *${intervalSeconds} seconds*.\n\nUse "!autotyping stop" to disable.`
      }, { quoted: msg });

      // Function to simulate typing
      const simulateTyping = async () => {
        try {
          // Start typing
          await sock.sendPresenceUpdate('composing', sender);
          
          // Simulate typing for 1-2 seconds
          const typingDuration = 1000 + Math.random() * 1000;
          
          setTimeout(async () => {
            try {
              // Stop typing
              await sock.sendPresenceUpdate('paused', sender);
            } catch (e) {
              console.error('Error stopping typing:', e);
            }
          }, typingDuration);
          
        } catch (err) {
          console.error('AutoTyping simulation error:', err);
          // Clean up if there's an error
          if (global.typingIntervals.has(sender)) {
            clearInterval(global.typingIntervals.get(sender));
            global.typingIntervals.delete(sender);
          }
        }
      };

      // Start the typing simulation immediately
      simulateTyping();
      
      // Set up interval for continuous typing
      const typingInterval = setInterval(simulateTyping, intervalSeconds * 1000);
      
      // Store the interval reference
      global.typingIntervals.set(sender, typingInterval);
      
      // Auto-cleanup after 30 minutes to prevent memory leaks
      setTimeout(() => {
        if (global.typingIntervals.has(sender)) {
          clearInterval(global.typingIntervals.get(sender));
          global.typingIntervals.delete(sender);
          console.log(`Auto-typing cleaned up for ${sender}`);
        }
      }, 30 * 60 * 1000); // 30 minutes
      
      return;
    }

    // Invalid command
    await sock.sendMessage(sender, { 
      text: '❌ Invalid command. Use "!autotyping help" for usage instructions.'
    }, { quoted: msg });
  }
};