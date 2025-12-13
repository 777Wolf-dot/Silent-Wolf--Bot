// // File: ./commands/owner/online.js
// import { writeFileSync, readFileSync, existsSync } from 'fs';

// export default {
//     name: 'online',
//     alias: ['ghost', 'presence', 'fakeonline', 'alwaysonline'],
//     category: 'owner',
//     description: 'Simulate online presence and activity',
//     ownerOnly: true,
    
//     async execute(sock, msg, args, PREFIX, extra) {
//         const chatId = msg.key.remoteJid;
//         const { jidManager, BOT_NAME, VERSION } = extra;
        
//         console.log('\n👻 ========= ONLINE PRESENCE COMMAND =========');
//         console.log('Command:', args);
//         console.log('Chat ID:', chatId);
//         console.log('========================================\n');
        
//         // ====== PRESENCE CONFIG FILE ======
//         const PRESENCE_FILE = './presence_config.json';
        
//         // Default presence configuration
//         const defaultConfig = {
//             enabled: false,
//             mode: 'active', // active, composing, recording, paused
//             interval: 2, // minutes
//             lastSeen: null,
//             nextUpdate: null,
//             fakeLastSeen: null,
//             alwaysOnline: false,
//             autoReply: false,
//             replyMessages: [],
//             typingSimulation: false,
//             typingDuration: 5, // seconds
//             createdAt: new Date().toISOString(),
//             stealthLevel: 'medium', // low, medium, high, ghost
//             activityLog: []
//         };
        
//         // Load or create config
//         let config = defaultConfig;
//         if (existsSync(PRESENCE_FILE)) {
//             try {
//                 config = JSON.parse(readFileSync(PRESENCE_FILE, 'utf8'));
//                 // Merge with defaults for missing fields
//                 config = { ...defaultConfig, ...config };
//             } catch (error) {
//                 config = defaultConfig;
//             }
//         }
        
//         // ====== PRESENCE FUNCTIONS ======
//         async function updatePresence() {
//             try {
//                 if (!config.enabled) return { success: false, error: 'Presence simulation disabled' };
                
//                 const modes = {
//                     'active': 'available',
//                     'composing': 'composing',
//                     'recording': 'recording',
//                     'paused': 'paused'
//                 };
                
//                 const presenceMode = modes[config.mode] || 'available';
                
//                 // Update presence
//                 await sock.sendPresenceUpdate(presenceMode);
                
//                 // Update last seen timestamp
//                 const now = new Date();
//                 config.lastSeen = now.toISOString();
//                 config.fakeLastSeen = now.toLocaleString();
//                 config.nextUpdate = new Date(now.getTime() + config.interval * 60000).toISOString();
                
//                 // Log activity
//                 config.activityLog.push({
//                     timestamp: now.toISOString(),
//                     mode: presenceMode,
//                     action: 'presence_update',
//                     from: 'auto'
//                 });
                
//                 // Keep only last 100 activities
//                 if (config.activityLog.length > 100) {
//                     config.activityLog = config.activityLog.slice(-100);
//                 }
                
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 console.log(`👻 Presence updated: ${presenceMode}`);
//                 return { success: true, mode: presenceMode, timestamp: config.fakeLastSeen };
                
//             } catch (error) {
//                 console.error('Presence update error:', error);
//                 return { success: false, error: error.message };
//             }
//         }
        
//         async function simulateTyping(chatId, duration = 5) {
//             try {
//                 if (!config.typingSimulation) return false;
                
//                 // Start typing
//                 await sock.sendPresenceUpdate('composing', chatId);
//                 console.log(`⌨️ Simulating typing in ${chatId} for ${duration}s`);
                
//                 // Wait
//                 await new Promise(resolve => setTimeout(resolve, duration * 1000));
                
//                 // Stop typing
//                 await sock.sendPresenceUpdate('paused', chatId);
                
//                 // Log activity
//                 config.activityLog.push({
//                     timestamp: new Date().toISOString(),
//                     mode: 'typing_simulation',
//                     action: 'typing',
//                     duration: duration,
//                     chat: chatId,
//                     from: 'manual'
//                 });
                
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 return true;
//             } catch (error) {
//                 console.error('Typing simulation error:', error);
//                 return false;
//             }
//         }
        
//         async function sendRandomReadReceipt() {
//             try {
//                 if (!config.enabled) return false;
                
//                 // This would simulate reading messages
//                 // Note: Actual read receipts require message IDs
//                 console.log('📖 Simulating read receipt');
                
//                 config.activityLog.push({
//                     timestamp: new Date().toISOString(),
//                     mode: 'read_receipt',
//                     action: 'message_read',
//                     from: 'auto'
//                 });
                
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 return true;
//             } catch (error) {
//                 console.error('Read receipt simulation error:', error);
//                 return false;
//             }
//         }
        
//         async function updateProfileForPresence() {
//             try {
//                 if (config.stealthLevel === 'high' || config.stealthLevel === 'ghost') {
//                     // Update profile picture periodically (if you want to appear active)
//                     const now = new Date();
//                     const statusText = `🟢 Online • ${now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
                    
//                     // Update profile status
//                     await sock.updateProfile(BOT_NAME, statusText);
//                     console.log(`📱 Profile updated: ${statusText}`);
                    
//                     return true;
//                 }
//                 return false;
//             } catch (error) {
//                 console.error('Profile update error:', error);
//                 return false;
//             }
//         }
        
//         // ====== COMMAND HANDLING ======
//         const command = args[0]?.toLowerCase() || 'status';
        
//         switch (command) {
//             case 'on':
//             case 'start':
//             case 'enable':
//                 config.enabled = true;
//                 config.lastSeen = new Date().toISOString();
//                 config.fakeLastSeen = new Date().toLocaleString();
                
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 // Start presence interval
//                 clearInterval(global.PRESENCE_INTERVAL);
//                 global.PRESENCE_INTERVAL = setInterval(async () => {
//                     if (config.enabled) {
//                         await updatePresence();
                        
//                         // Occasionally simulate other activities
//                         const random = Math.random();
//                         if (random > 0.7) {
//                             await sendRandomReadReceipt();
//                         }
//                         if (random > 0.8 && config.stealthLevel === 'high') {
//                             await updateProfileForPresence();
//                         }
//                     }
//                 }, config.interval * 60000);
                
//                 // Do initial update
//                 const initialResult = await updatePresence();
                
//                 let response = `👻 *ONLINE PRESENCE ACTIVATED*\n\n`;
//                 response += `✅ Fake online status: ENABLED\n`;
//                 response += `⚡ Mode: ${config.mode}\n`;
//                 response += `⏰ Update interval: ${config.interval} minutes\n`;
//                 response += `🕵️ Stealth level: ${config.stealthLevel}\n`;
//                 response += `⌨️ Typing simulation: ${config.typingSimulation ? '✅ ON' : '❌ OFF'}\n\n`;
                
//                 if (initialResult.success) {
//                     response += `📡 *Current Presence:* ${initialResult.mode}\n`;
//                     response += `🕒 Last seen: ${config.fakeLastSeen}\n\n`;
//                 }
                
//                 response += `📱 *To others, you will appear:*\n`;
//                 response += `├─ 🔴 Online indicator: ON\n`;
//                 response += `├─ 📝 Last seen: Recently\n`;
//                 response += `├─ 💬 Typing indicator: ${config.typingSimulation ? 'Occasionally' : 'Normal'}\n`;
//                 response += `└─ 👁️ Read receipts: Simulated\n\n`;
                
//                 response += `⚡ *Quick Commands:*\n`;
//                 response += `├─ ${PREFIX}online off - Disable\n`;
//                 response += `├─ ${PREFIX}online mode typing - Change mode\n`;
//                 response += `├─ ${PREFIX}online stealth high - Increase stealth\n`;
//                 response += `└─ ${PREFIX}online type [chat] - Simulate typing`;
                
//                 await sock.sendMessage(chatId, {
//                     text: response
//                 }, { quoted: msg });
//                 break;
                
//             case 'off':
//             case 'stop':
//             case 'disable':
//                 config.enabled = false;
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 // Clear interval
//                 clearInterval(global.PRESENCE_INTERVAL);
//                 global.PRESENCE_INTERVAL = null;
                
//                 // Set actual offline presence
//                 await sock.sendPresenceUpdate('unavailable');
                
//                 await sock.sendMessage(chatId, {
//                     text: `👻 *ONLINE PRESENCE DEACTIVATED*\n\n✅ Fake online status: DISABLED\n\nYou will now appear with your actual online status.\n\nUse ${PREFIX}online on to enable again.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'status':
//             case 'info':
//                 let statusMessage = `👻 *ONLINE PRESENCE STATUS*\n\n`;
                
//                 statusMessage += `📊 *Current Status:* ${config.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\n\n`;
                
//                 if (config.enabled) {
//                     statusMessage += `⚙️ *Configuration:*\n`;
//                     statusMessage += `├─ Mode: ${config.mode}\n`;
//                     statusMessage += `├─ Interval: ${config.interval} minutes\n`;
//                     statusMessage += `├─ Stealth: ${config.stealthLevel}\n`;
//                     statusMessage += `├─ Typing sim: ${config.typingSimulation ? '✅ ON' : '❌ OFF'}\n`;
//                     statusMessage += `└─ Auto reply: ${config.autoReply ? '✅ ON' : '❌ OFF'}\n\n`;
                    
//                     statusMessage += `📡 *Current Simulation:*\n`;
//                     statusMessage += `├─ Last update: ${config.lastSeen ? new Date(config.lastSeen).toLocaleString() : 'Never'}\n`;
//                     statusMessage += `├─ Fake last seen: ${config.fakeLastSeen || 'Not set'}\n`;
//                     statusMessage += `└─ Next update: ${config.nextUpdate ? new Date(config.nextUpdate).toLocaleString() : 'Pending'}\n\n`;
                    
//                     statusMessage += `📈 *Activity Log:* ${config.activityLog.length} entries\n`;
                    
//                     // Show recent activities
//                     if (config.activityLog.length > 0) {
//                         const recent = config.activityLog.slice(-3).reverse();
//                         statusMessage += `Recent activities:\n`;
//                         recent.forEach(activity => {
//                             const time = new Date(activity.timestamp).toLocaleTimeString();
//                             statusMessage += `├─ ${time}: ${activity.mode} (${activity.action})\n`;
//                         });
//                     }
//                 }
                
//                 statusMessage += `\n🎭 *Stealth Levels:*\n`;
//                 statusMessage += `├─ *low* - Basic presence updates\n`;
//                 statusMessage += `├─ *medium* - + Typing simulation\n`;
//                 statusMessage += `├─ *high* - + Profile updates\n`;
//                 statusMessage += `└─ *ghost* - Maximum stealth (undetectable)\n\n`;
                
//                 statusMessage += `⚡ *Usage:*\n`;
//                 statusMessage += `├─ ${PREFIX}online on - Enable\n`;
//                 statusMessage += `├─ ${PREFIX}online off - Disable\n`;
//                 statusMessage += `├─ ${PREFIX}online mode [mode] - Change mode\n`;
//                 statusMessage += `├─ ${PREFIX}online stealth [level] - Change stealth\n`;
//                 statusMessage += `└─ ${PREFIX}online type [chat] - Simulate typing`;
                
//                 await sock.sendMessage(chatId, {
//                     text: statusMessage
//                 }, { quoted: msg });
//                 break;
                
//             case 'mode':
//                 const mode = args[1]?.toLowerCase();
//                 const validModes = ['active', 'composing', 'recording', 'paused', 'available', 'unavailable'];
                
//                 if (!mode || !validModes.includes(mode)) {
//                     const modesList = validModes.join(', ');
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Invalid Mode*\n\nAvailable modes: ${modesList}\n\nExample: ${PREFIX}online mode composing`
//                     }, { quoted: msg });
//                 }
                
//                 config.mode = mode;
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 // Update immediately if enabled
//                 let modeResult = { success: false };
//                 if (config.enabled) {
//                     modeResult = await updatePresence();
//                 }
                
//                 let modeMsg = `✅ *Presence Mode Changed*\n\n`;
//                 modeMsg += `📱 New mode: *${mode}*\n\n`;
                
//                 if (mode === 'active' || mode === 'available') {
//                     modeMsg += `👁️ *Appears as:* Online/available\n`;
//                 } else if (mode === 'composing') {
//                     modeMsg += `👁️ *Appears as:* Typing...\n`;
//                 } else if (mode === 'recording') {
//                     modeMsg += `👁️ *Appears as:* Recording audio...\n`;
//                 } else if (mode === 'paused') {
//                     modeMsg += `👁️ *Appears as:* Online but inactive\n`;
//                 } else if (mode === 'unavailable') {
//                     modeMsg += `👁️ *Appears as:* Offline\n`;
//                 }
                
//                 if (modeResult.success) {
//                     modeMsg += `\n✅ Presence updated immediately\n`;
//                 } else if (config.enabled) {
//                     modeMsg += `\n⚠️ Update failed: ${modeResult.error}\n`;
//                 } else {
//                     modeMsg += `\nℹ️ Enable presence for changes to take effect\n`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: modeMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'stealth':
//                 const level = args[1]?.toLowerCase();
//                 const validLevels = ['low', 'medium', 'high', 'ghost'];
                
//                 if (!level || !validLevels.includes(level)) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Invalid Stealth Level*\n\nAvailable levels: low, medium, high, ghost\n\nExample: ${PREFIX}online stealth high`
//                     }, { quoted: msg });
//                 }
                
//                 config.stealthLevel = level;
                
//                 // Adjust other settings based on stealth level
//                 switch (level) {
//                     case 'low':
//                         config.typingSimulation = false;
//                         config.interval = 5;
//                         break;
//                     case 'medium':
//                         config.typingSimulation = true;
//                         config.interval = 3;
//                         break;
//                     case 'high':
//                         config.typingSimulation = true;
//                         config.interval = 2;
//                         break;
//                     case 'ghost':
//                         config.typingSimulation = true;
//                         config.interval = 1;
//                         config.autoReply = false; // Ghosts don't reply
//                         break;
//                 }
                
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 let stealthMsg = `🕵️ *Stealth Level Changed*\n\n`;
//                 stealthMsg += `🎭 New level: *${level}*\n\n`;
                
//                 stealthMsg += `📊 *Settings applied:*\n`;
//                 stealthMsg += `├─ Typing simulation: ${config.typingSimulation ? '✅ ON' : '❌ OFF'}\n`;
//                 stealthMsg += `├─ Update interval: ${config.interval} minutes\n`;
//                 stealthMsg += `└─ Auto reply: ${config.autoReply ? '✅ ON' : '❌ OFF'}\n\n`;
                
//                 stealthMsg += `👁️ *What this means:*\n`;
                
//                 switch (level) {
//                     case 'low':
//                         stealthMsg += `├─ Basic presence updates\n`;
//                         stealthMsg += `├─ Easy to detect if monitored\n`;
//                         stealthMsg += `└─ Low battery/data usage\n`;
//                         break;
//                     case 'medium':
//                         stealthMsg += `├─ + Typing indicators\n`;
//                         stealthMsg += `├─ Looks more natural\n`;
//                         stealthMsg += `└─ Moderate battery usage\n`;
//                         break;
//                     case 'high':
//                         stealthMsg += `├─ + Profile updates\n`;
//                         stealthMsg += `├─ + Random activities\n`;
//                         stealthMsg += `└─ Hard to detect as fake\n`;
//                         break;
//                     case 'ghost':
//                         stealthMsg += `├─ Maximum stealth\n`;
//                         stealthMsg += `├─ Undetectable as fake\n`;
//                         stealthMsg += `├─ Frequent updates\n`;
//                         stealthMsg += `└─ High battery usage\n`;
//                         break;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: stealthMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'type':
//             case 'typing':
//                 const targetChat = args[1] || chatId;
//                 const duration = parseInt(args[2]) || config.typingDuration;
                
//                 if (!config.typingSimulation && !config.enabled) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Typing Simulation Disabled*\n\nEnable typing simulation first:\n${PREFIX}online stealth medium\n\nOr enable presence: ${PREFIX}online on`
//                     }, { quoted: msg });
//                 }
                
//                 // Enable typing simulation temporarily if needed
//                 const wasEnabled = config.typingSimulation;
//                 if (!wasEnabled) {
//                     config.typingSimulation = true;
//                 }
                
//                 const typingResult = await simulateTyping(targetChat, duration);
                
//                 if (!wasEnabled) {
//                     config.typingSimulation = false;
//                     writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
//                 }
                
//                 let typingMsg = `⌨️ *Typing Simulation*\n\n`;
                
//                 if (typingResult) {
//                     typingMsg += `✅ Successfully simulated typing\n`;
//                     typingMsg += `📱 Chat: ${targetChat}\n`;
//                     typingMsg += `⏱️ Duration: ${duration} seconds\n\n`;
//                     typingMsg += `👁️ *To the recipient:*\n`;
//                     typingMsg += `They will see "typing..." indicator\n`;
//                 } else {
//                     typingMsg += `❌ Typing simulation failed\n`;
//                     typingMsg += `Make sure you're connected and the chat is valid.\n`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: typingMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'interval':
//                 const interval = parseInt(args[1]);
//                 if (!interval || interval < 1 || interval > 60) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Invalid Interval*\n\nPlease specify a number between 1 and 60 minutes.\n\nExample: ${PREFIX}online interval 3`
//                     }, { quoted: msg });
//                 }
                
//                 config.interval = interval;
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 // Restart interval if enabled
//                 if (config.enabled) {
//                     clearInterval(global.PRESENCE_INTERVAL);
//                     global.PRESENCE_INTERVAL = setInterval(async () => {
//                         if (config.enabled) {
//                             await updatePresence();
//                         }
//                     }, config.interval * 60000);
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: `⏰ *Update Interval Changed*\n\nNew interval: ${interval} minutes\n\n${config.enabled ? 'Interval restarted with new timing.' : 'Enable presence for changes to take effect.'}`
//                 }, { quoted: msg });
//                 break;
                
//             case 'fake':
//             case 'lastseen':
//                 const fakeTime = args.slice(1).join(' ');
                
//                 if (!fakeTime) {
//                     // Show current fake last seen
//                     let fakeMsg = `🕒 *Fake Last Seen*\n\n`;
                    
//                     if (config.fakeLastSeen) {
//                         fakeMsg += `Current fake last seen: ${config.fakeLastSeen}\n`;
//                         fakeMsg += `Actual last update: ${config.lastSeen ? new Date(config.lastSeen).toLocaleString() : 'Never'}\n\n`;
//                     } else {
//                         fakeMsg += `No fake last seen set\n\n`;
//                     }
                    
//                     fakeMsg += `⚡ *Usage:*\n`;
//                     fakeMsg += `${PREFIX}online fake "2 minutes ago"\n`;
//                     fakeMsg += `${PREFIX}online fake "Today at 14:30"\n`;
//                     fakeMsg += `${PREFIX}online fake clear (to remove)`;
                    
//                     return sock.sendMessage(chatId, {
//                         text: fakeMsg
//                     }, { quoted: msg });
//                 }
                
//                 if (fakeTime.toLowerCase() === 'clear') {
//                     config.fakeLastSeen = null;
//                     writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                    
//                     await sock.sendMessage(chatId, {
//                         text: `✅ *Fake Last Seen Cleared*\n\nFake timestamp removed. Actual timestamps will be used.`
//                     }, { quoted: msg });
//                     return;
//                 }
                
//                 config.fakeLastSeen = fakeTime;
//                 writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
//                 await sock.sendMessage(chatId, {
//                     text: `✅ *Fake Last Seen Set*\n\nNew fake last seen: "${fakeTime}"\n\nThis will be shown to others when they check your last seen time.\n\nUse ${PREFIX}online fake clear to remove.`
//                 }, { quoted: msg });
//                 break;
                
//             case 'test':
//             case 'simulate':
//                 // Test the presence simulation
//                 if (!config.enabled) {
//                     return sock.sendMessage(chatId, {
//                         text: `❌ *Presence Not Enabled*\n\nEnable presence first: ${PREFIX}online on\n\nThen test with: ${PREFIX}online test`
//                     }, { quoted: msg });
//                 }
                
//                 const testResult = await updatePresence();
                
//                 let testMsg = `🧪 *Presence Simulation Test*\n\n`;
                
//                 if (testResult.success) {
//                     testMsg += `✅ Test successful!\n`;
//                     testMsg += `📱 Mode: ${testResult.mode}\n`;
//                     testMsg += `🕒 Timestamp: ${testResult.timestamp}\n\n`;
//                     testMsg += `👁️ *You now appear as:*\n`;
                    
//                     switch (config.mode) {
//                         case 'active':
//                             testMsg += `🟢 Online and active\n`;
//                             break;
//                         case 'composing':
//                             testMsg += `⌨️ Typing a message...\n`;
//                             break;
//                         case 'recording':
//                             testMsg += `🎤 Recording audio...\n`;
//                             break;
//                         case 'paused':
//                             testMsg += `⏸️ Online but inactive\n`;
//                             break;
//                     }
                    
//                     testMsg += `\n⚡ This will update every ${config.interval} minutes automatically.`;
//                 } else {
//                     testMsg += `❌ Test failed\n`;
//                     testMsg += `Error: ${testResult.error}\n\n`;
//                     testMsg += `Check your connection and try again.`;
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: testMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'log':
//             case 'activity':
//                 const logCount = parseInt(args[1]) || 10;
                
//                 if (config.activityLog.length === 0) {
//                     return sock.sendMessage(chatId, {
//                         text: `📊 *Activity Log*\n\nNo activity recorded yet.\n\nEnable presence and wait for some activity.`
//                     }, { quoted: msg });
//                 }
                
//                 let logMsg = `📊 *PRESENCE ACTIVITY LOG*\n\n`;
//                 logMsg += `Total entries: ${config.activityLog.length}\n\n`;
                
//                 // Show recent activities
//                 const recentLogs = config.activityLog.slice(-logCount).reverse();
                
//                 recentLogs.forEach((log, index) => {
//                     const time = new Date(log.timestamp).toLocaleTimeString();
//                     const date = new Date(log.timestamp).toLocaleDateString();
                    
//                     logMsg += `#${config.activityLog.length - index}\n`;
//                     logMsg += `├─ 📅 ${date} ${time}\n`;
//                     logMsg += `├─ 🎭 ${log.mode}\n`;
//                     logMsg += `├─ ⚡ ${log.action}\n`;
                    
//                     if (log.chat) {
//                         logMsg += `├─ 💬 Chat: ${log.chat}\n`;
//                     }
                    
//                     if (log.duration) {
//                         logMsg += `├─ ⏱️ ${log.duration}s\n`;
//                     }
                    
//                     logMsg += `└─ 🚀 ${log.from}\n\n`;
//                 });
                
//                 if (logMsg.length > 4000) {
//                     logMsg = logMsg.substring(0, 3997) + '...';
//                 }
                
//                 await sock.sendMessage(chatId, {
//                     text: logMsg
//                 }, { quoted: msg });
//                 break;
                
//             case 'help':
//                 let helpText = `👻 *ONLINE PRESENCE COMMAND HELP*\n\n`;
                
//                 helpText += `🎯 *What this does:*\n`;
//                 helpText += `Makes you appear online even when you\'re not\nSimulates typing, recording, and other activities\nControls how others see your online status\n\n`;
                
//                 helpText += `📋 *Available Commands:*\n`;
//                 helpText += `├─ ${PREFIX}online on - Enable fake online status\n`;
//                 helpText += `├─ ${PREFIX}online off - Disable fake online status\n`;
//                 helpText += `├─ ${PREFIX}online status - Current status\n`;
//                 helpText += `├─ ${PREFIX}online mode [mode] - Change presence mode\n`;
//                 helpText += `├─ ${PREFIX}online stealth [level] - Change stealth level\n`;
//                 helpText += `├─ ${PREFIX}online type [chat] - Simulate typing\n`;
//                 helpText += `├─ ${PREFIX}online interval [mins] - Change update interval\n`;
//                 helpText += `├─ ${PREFIX}online fake [time] - Set fake last seen\n`;
//                 helpText += `├─ ${PREFIX}online test - Test presence update\n`;
//                 helpText += `├─ ${PREFIX}online log [count] - Show activity log\n`;
//                 helpText += `└─ ${PREFIX}online help - This help\n\n`;
                
//                 helpText += `⚡ *Examples:*\n`;
//                 helpText += `├─ ${PREFIX}online on\n`;
//                 helpText += `├─ ${PREFIX}online mode composing\n`;
//                 helpText += `├─ ${PREFIX}online stealth high\n`;
//                 helpText += `├─ ${PREFIX}online type ${chatId.split('@')[0]}\n`;
//                 helpText += `└─ ${PREFIX}online fake "2 minutes ago"\n\n`;
                
//                 helpText += `⚠️ *Important Notes:*\n`;
//                 helpText += `• This only affects WhatsApp online indicators\n`;
//                 helpText += `• Last seen time can be faked\n`;
//                 helpText += `• Use responsibly and ethically\n`;
//                 helpText += `• May increase battery/data usage`;
                
//                 await sock.sendMessage(chatId, {
//                     text: helpText
//                 }, { quoted: msg });
//                 break;
                
//             default:
//                 await sock.sendMessage(chatId, {
//                     text: `❌ *Unknown online command*\n\nUse ${PREFIX}online help to see all available commands.\n\nQuick start: ${PREFIX}online on`
//                 }, { quoted: msg });
//         }
//     }
// };





















// File: ./commands/owner/online.js - FIXED VERSION
import { writeFileSync, readFileSync, existsSync } from 'fs';

export default {
    name: 'online',
    alias: ['ghost', 'presence', 'fakeonline', 'alwaysonline'],
    category: 'owner',
    description: 'Simulate online presence and activity',
    ownerOnly: true,
    
    async execute(sock, msg, args, PREFIX, extra) {
        const chatId = msg.key.remoteJid;
        const { jidManager, BOT_NAME, VERSION } = extra;
        
        console.log('\n👻 ========= ONLINE PRESENCE COMMAND =========');
        console.log('Command:', args);
        console.log('Chat ID:', chatId);
        console.log('========================================\n');
        
        // ====== PRESENCE CONFIG FILE ======
        const PRESENCE_FILE = './presence_config.json';
        
        // Default presence configuration
        const defaultConfig = {
            enabled: false,
            mode: 'active', // active, composing, recording, paused
            interval: 2, // minutes
            lastSeen: null,
            nextUpdate: null,
            fakeLastSeen: null,
            alwaysOnline: false,
            autoReply: false,
            replyMessages: [],
            typingSimulation: false,
            typingDuration: 5, // seconds
            recordingDuration: 10, // seconds
            createdAt: new Date().toISOString(),
            stealthLevel: 'medium', // low, medium, high, ghost
            activityLog: [],
            targetChats: [] // Chats to show activity in
        };
        
        // Load or create config
        let config = defaultConfig;
        if (existsSync(PRESENCE_FILE)) {
            try {
                config = JSON.parse(readFileSync(PRESENCE_FILE, 'utf8'));
                // Merge with defaults for missing fields
                config = { ...defaultConfig, ...config };
            } catch (error) {
                config = defaultConfig;
            }
        }
        
        // ====== FIXED PRESENCE FUNCTIONS ======
        async function updatePresence() {
            try {
                if (!config.enabled) return { success: false, error: 'Presence simulation disabled' };
                
                // General presence update (shows you're online)
                await sock.sendPresenceUpdate('available');
                
                // Update last seen timestamp
                const now = new Date();
                config.lastSeen = now.toISOString();
                config.fakeLastSeen = now.toLocaleString();
                config.nextUpdate = new Date(now.getTime() + config.interval * 60000).toISOString();
                
                // Log activity
                config.activityLog.push({
                    timestamp: now.toISOString(),
                    mode: 'available',
                    action: 'general_presence_update',
                    from: 'auto'
                });
                
                // Keep only last 100 activities
                if (config.activityLog.length > 100) {
                    config.activityLog = config.activityLog.slice(-100);
                }
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                console.log(`👻 General presence updated: available`);
                return { success: true, mode: 'available', timestamp: config.fakeLastSeen };
                
            } catch (error) {
                console.error('Presence update error:', error);
                return { success: false, error: error.message };
            }
        }
        
        async function simulateTyping(chatId, duration = 5) {
            try {
                // Start typing in SPECIFIC chat (this is the fix)
                await sock.sendPresenceUpdate('composing', chatId);
                console.log(`⌨️ Started typing in ${chatId}`);
                
                // Log activity
                config.activityLog.push({
                    timestamp: new Date().toISOString(),
                    mode: 'composing',
                    action: 'typing_started',
                    duration: duration,
                    chat: chatId,
                    from: 'manual'
                });
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                // Wait for duration
                await new Promise(resolve => setTimeout(resolve, duration * 1000));
                
                // Stop typing
                await sock.sendPresenceUpdate('paused', chatId);
                console.log(`⏸️ Stopped typing in ${chatId}`);
                
                config.activityLog.push({
                    timestamp: new Date().toISOString(),
                    mode: 'paused',
                    action: 'typing_stopped',
                    chat: chatId,
                    from: 'auto'
                });
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                return { success: true, chat: chatId, duration: duration };
                
            } catch (error) {
                console.error('Typing simulation error:', error);
                return { success: false, error: error.message, chat: chatId };
            }
        }
        
        async function simulateRecording(chatId, duration = 10) {
            try {
                // Start recording in SPECIFIC chat
                await sock.sendPresenceUpdate('recording', chatId);
                console.log(`🎤 Started recording in ${chatId}`);
                
                // Log activity
                config.activityLog.push({
                    timestamp: new Date().toISOString(),
                    mode: 'recording',
                    action: 'recording_started',
                    duration: duration,
                    chat: chatId,
                    from: 'manual'
                });
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                // Wait for duration
                await new Promise(resolve => setTimeout(resolve, duration * 1000));
                
                // Stop recording
                await sock.sendPresenceUpdate('paused', chatId);
                console.log(`⏸️ Stopped recording in ${chatId}`);
                
                config.activityLog.push({
                    timestamp: new Date().toISOString(),
                    mode: 'paused',
                    action: 'recording_stopped',
                    chat: chatId,
                    from: 'auto'
                });
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                return { success: true, chat: chatId, duration: duration };
                
            } catch (error) {
                console.error('Recording simulation error:', error);
                return { success: false, error: error.message, chat: chatId };
            }
        }
        
        async function simulateRandomActivity() {
            try {
                if (!config.enabled || config.targetChats.length === 0) return false;
                
                // Pick a random chat
                const randomChat = config.targetChats[Math.floor(Math.random() * config.targetChats.length)];
                const randomAction = Math.random();
                
                if (randomAction < 0.3) {
                    // Simulate typing for 2-5 seconds
                    const duration = 2 + Math.random() * 3;
                    await simulateTyping(randomChat, duration);
                    
                } else if (randomAction < 0.4) {
                    // Simulate recording for 3-8 seconds
                    const duration = 3 + Math.random() * 5;
                    await simulateRecording(randomChat, duration);
                }
                
                return true;
            } catch (error) {
                console.error('Random activity error:', error);
                return false;
            }
        }
        
        async function addTargetChat(chatId) {
            try {
                if (!config.targetChats.includes(chatId)) {
                    config.targetChats.push(chatId);
                    writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                    return { success: true, chat: chatId, action: 'added' };
                }
                return { success: false, chat: chatId, error: 'Already in target chats' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        async function removeTargetChat(chatId) {
            try {
                const index = config.targetChats.indexOf(chatId);
                if (index > -1) {
                    config.targetChats.splice(index, 1);
                    writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                    return { success: true, chat: chatId, action: 'removed' };
                }
                return { success: false, chat: chatId, error: 'Not in target chats' };
            } catch (error) {
                return { success: false, error: error.message };
            }
        }
        
        // ====== COMMAND HANDLING ======
        const command = args[0]?.toLowerCase() || 'status';
        
        switch (command) {
            case 'on':
            case 'start':
            case 'enable':
                config.enabled = true;
                config.lastSeen = new Date().toISOString();
                config.fakeLastSeen = new Date().toLocaleString();
                
                // Add current chat to target chats if not already
                await addTargetChat(chatId);
                
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                // Start presence interval
                clearInterval(global.PRESENCE_INTERVAL);
                global.PRESENCE_INTERVAL = setInterval(async () => {
                    if (config.enabled) {
                        await updatePresence();
                        
                        // Simulate random activities in target chats
                        if (config.stealthLevel !== 'low' && config.targetChats.length > 0) {
                            await simulateRandomActivity();
                        }
                    }
                }, config.interval * 60000);
                
                // Do initial update
                const initialResult = await updatePresence();
                
                let response = `👻 *ONLINE PRESENCE ACTIVATED*\n\n`;
                response += `✅ Fake online status: ENABLED\n`;
                response += `⚡ Mode: ${config.mode}\n`;
                response += `⏰ Update interval: ${config.interval} minutes\n`;
                response += `🕵️ Stealth level: ${config.stealthLevel}\n`;
                response += `⌨️ Typing simulation: ${config.typingSimulation ? '✅ ON' : '❌ OFF'}\n`;
                response += `💬 Target chats: ${config.targetChats.length}\n\n`;
                
                if (initialResult.success) {
                    response += `📡 *Current Presence:* ${initialResult.mode}\n`;
                    response += `🕒 Last seen: ${config.fakeLastSeen}\n\n`;
                }
                
                response += `📱 *To others, you will appear:*\n`;
                response += `├─ 🟢 Online indicator: Always online\n`;
                response += `├─ ⌨️ Typing: In ${config.targetChats.length} chat(s)\n`;
                response += `├─ 🎤 Recording: Occasionally\n`;
                response += `├─ 🕒 Last seen: Recently\n`;
                response += `└─ 👁️ Read receipts: Normal\n\n`;
                
                response += `⚡ *Quick Commands:*\n`;
                response += `├─ ${PREFIX}online off - Disable\n`;
                response += `├─ ${PREFIX}online type [chat] - Simulate typing\n`;
                response += `├─ ${PREFIX}online record [chat] - Simulate recording\n`;
                response += `├─ ${PREFIX}online addchat - Add this chat\n`;
                response += `└─ ${PREFIX}online test - Test presence`;
                
                await sock.sendMessage(chatId, {
                    text: response
                }, { quoted: msg });
                break;
                
            case 'off':
            case 'stop':
            case 'disable':
                config.enabled = false;
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                // Clear interval
                clearInterval(global.PRESENCE_INTERVAL);
                global.PRESENCE_INTERVAL = null;
                
                // Set actual offline presence
                await sock.sendPresenceUpdate('unavailable');
                
                await sock.sendMessage(chatId, {
                    text: `👻 *ONLINE PRESENCE DEACTIVATED*\n\n✅ Fake online status: DISABLED\n\nYou will now appear with your actual online status.\n\nUse ${PREFIX}online on to enable again.`
                }, { quoted: msg });
                break;
                
            case 'type':
            case 'typing':
                const targetChat = args[1] || chatId;
                const duration = parseInt(args[2]) || 5;
                
                console.log(`⌨️ Attempting typing simulation in ${targetChat} for ${duration}s`);
                
                const typingResult = await simulateTyping(targetChat, duration);
                
                let typingMsg = `⌨️ *Typing Simulation*\n\n`;
                
                if (typingResult.success) {
                    typingMsg += `✅ Successfully simulated typing!\n`;
                    typingMsg += `📱 Chat: ${targetChat}\n`;
                    typingMsg += `⏱️ Duration: ${duration} seconds\n\n`;
                    typingMsg += `👁️ *To the recipient:*\n`;
                    typingMsg += `They will see "typing..." for ${duration} seconds\n`;
                    typingMsg += `Then it will show "online"\n\n`;
                    typingMsg += `✅ Check their WhatsApp - they should see you typing!`;
                } else {
                    typingMsg += `❌ Typing simulation failed\n`;
                    typingMsg += `Error: ${typingResult.error}\n\n`;
                    typingMsg += `🔧 *Troubleshooting:*\n`;
                    typingMsg += `1. Make sure bot is connected\n`;
                    typingMsg += `2. Check chat ID is correct\n`;
                    typingMsg += `3. Try shorter duration (3 seconds)\n`;
                    typingMsg += `4. Use: ${PREFIX}online type ${chatId} 3`;
                }
                
                await sock.sendMessage(chatId, {
                    text: typingMsg
                }, { quoted: msg });
                break;
                
            case 'record':
            case 'recording':
            case 'audio':
                const recordChat = args[1] || chatId;
                const recordDuration = parseInt(args[2]) || 8;
                
                console.log(`🎤 Attempting recording simulation in ${recordChat} for ${recordDuration}s`);
                
                const recordResult = await simulateRecording(recordChat, recordDuration);
                
                let recordMsg = `🎤 *Recording Simulation*\n\n`;
                
                if (recordResult.success) {
                    recordMsg += `✅ Successfully simulated recording!\n`;
                    recordMsg += `📱 Chat: ${recordChat}\n`;
                    recordMsg += `⏱️ Duration: ${recordDuration} seconds\n\n`;
                    recordMsg += `👁️ *To the recipient:*\n`;
                    recordMsg += `They will see "recording audio..." for ${recordDuration} seconds\n`;
                    recordMsg += `Then it will show "online"\n\n`;
                    recordMsg += `✅ Check their WhatsApp - they should see you recording!`;
                } else {
                    recordMsg += `❌ Recording simulation failed\n`;
                    recordMsg += `Error: ${recordResult.error}\n\n`;
                    recordMsg += `🔧 *Troubleshooting:*\n`;
                    recordMsg += `1. Make sure bot is connected\n`;
                    recordMsg += `2. Check chat ID is correct\n`;
                    typingMsg += `3. Try shorter duration (5 seconds)\n`;
                    typingMsg += `4. Use: ${PREFIX}online record ${chatId} 5`;
                }
                
                await sock.sendMessage(chatId, {
                    text: recordMsg
                }, { quoted: msg });
                break;
                
            case 'addchat':
            case 'add':
                const addResult = await addTargetChat(chatId);
                
                let addMsg = `💬 *Add Target Chat*\n\n`;
                
                if (addResult.success) {
                    addMsg += `✅ Chat added to target list!\n`;
                    addMsg += `📱 Chat: ${chatId}\n`;
                    addMsg += `📊 Total target chats: ${config.targetChats.length}\n\n`;
                    addMsg += `⚡ *What this means:*\n`;
                    addMsg += `This chat will receive random typing/recording simulations\n`;
                    addMsg += `when auto-presence is enabled.\n\n`;
                    addMsg += `🔧 *To remove:* ${PREFIX}online removechat`;
                } else {
                    addMsg += `ℹ️ ${addResult.error}\n`;
                    addMsg += `📱 Chat already in target list\n`;
                    addMsg += `📊 Total target chats: ${config.targetChats.length}`;
                }
                
                await sock.sendMessage(chatId, {
                    text: addMsg
                }, { quoted: msg });
                break;
                
            case 'removechat':
            case 'remove':
                const removeResult = await removeTargetChat(chatId);
                
                let removeMsg = `💬 *Remove Target Chat*\n\n`;
                
                if (removeResult.success) {
                    removeMsg += `✅ Chat removed from target list\n`;
                    removeMsg += `📱 Chat: ${chatId}\n`;
                    removeMsg += `📊 Total target chats: ${config.targetChats.length}\n\n`;
                    removeMsg += `⚡ *What this means:*\n`;
                    removeMsg += `This chat will no longer receive random simulations\n`;
                } else {
                    removeMsg += `ℹ️ ${removeResult.error}\n`;
                    removeMsg += `📊 Total target chats: ${config.targetChats.length}`;
                }
                
                await sock.sendMessage(chatId, {
                    text: removeMsg
                }, { quoted: msg });
                break;
                
            case 'chats':
            case 'list':
                let chatsMsg = `💬 *TARGET CHATS LIST*\n\n`;
                chatsMsg += `📊 Total: ${config.targetChats.length}\n\n`;
                
                if (config.targetChats.length > 0) {
                    config.targetChats.forEach((chat, index) => {
                        const chatNumber = chat.split('@')[0];
                        chatsMsg += `${index + 1}. ${chatNumber}\n`;
                    });
                } else {
                    chatsMsg += `No target chats set.\n`;
                    chatsMsg += `Add this chat: ${PREFIX}online addchat\n`;
                }
                
                chatsMsg += `\n⚡ *Commands:*\n`;
                chatsMsg += `├─ ${PREFIX}online addchat - Add current chat\n`;
                chatsMsg += `├─ ${PREFIX}online removechat - Remove current chat\n`;
                chatsMsg += `└─ ${PREFIX}online clearall - Remove all chats`;
                
                await sock.sendMessage(chatId, {
                    text: chatsMsg
                }, { quoted: msg });
                break;
                
            case 'clearall':
                config.targetChats = [];
                writeFileSync(PRESENCE_FILE, JSON.stringify(config, null, 2));
                
                await sock.sendMessage(chatId, {
                    text: `🧹 *All Target Chats Cleared*\n\n✅ Removed all ${config.targetChats.length} target chats\n\nUse ${PREFIX}online addchat to add chats again.`
                }, { quoted: msg });
                break;
                
            case 'test':
                // Test both typing and recording
                await sock.sendMessage(chatId, {
                    text: `🧪 *Testing Presence Features*\n\nStarting tests...\n1. General presence update\n2. Typing simulation (3s)\n3. Recording simulation (3s)`
                }, { quoted: msg });
                
                // Test 1: General presence
                const presenceTest = await updatePresence();
                
                // Test 2: Typing
                await new Promise(resolve => setTimeout(resolve, 1000));
                const typingTest = await simulateTyping(chatId, 3);
                
                // Test 3: Recording
                await new Promise(resolve => setTimeout(resolve, 1000));
                const recordingTest = await simulateRecording(chatId, 3);
                
                let testMsg = `🧪 *TEST RESULTS*\n\n`;
                
                testMsg += `1. General Presence: ${presenceTest.success ? '✅ PASS' : '❌ FAIL'}\n`;
                if (!presenceTest.success) testMsg += `   Error: ${presenceTest.error}\n`;
                
                testMsg += `2. Typing Simulation: ${typingTest.success ? '✅ PASS' : '❌ FAIL'}\n`;
                if (!typingTest.success) testMsg += `   Error: ${typingTest.error}\n`;
                
                testMsg += `3. Recording Simulation: ${recordingTest.success ? '✅ PASS' : '❌ FAIL'}\n`;
                if (!recordingTest.success) testMsg += `   Error: ${recordingTest.error}\n\n`;
                
                if (presenceTest.success && typingTest.success && recordingTest.success) {
                    testMsg += `🎉 ALL TESTS PASSED!\n\n`;
                    testMsg += `✅ Your fake presence is working correctly.\n`;
                    testMsg += `✅ Others will see you as online with activity.\n`;
                    testMsg += `✅ Try it on someone's WhatsApp now!`;
                } else {
                    testMsg += `⚠️ Some tests failed.\n\n`;
                    testMsg += `🔧 *Troubleshooting:*\n`;
                    testMsg += `1. Make sure bot is properly connected\n`;
                    testMsg += `2. Check internet connection\n`;
                    testMsg += `3. Try restarting the bot\n`;
                    testMsg += `4. Update Baileys library: npm update @whiskeysockets/baileys`;
                }
                
                await sock.sendMessage(chatId, {
                    text: testMsg
                }, { quoted: msg });
                break;
                
            case 'quick':
            case 'demo':
                // Quick demo of all features
                await sock.sendMessage(chatId, {
                    text: `🚀 *QUICK DEMO STARTING*\n\nI will simulate:\n1. Typing for 2 seconds\n2. Recording for 3 seconds\n3. Typing for 2 seconds\n\nWatch your WhatsApp status!`
                }, { quoted: msg });
                
                // Step 1: Typing
                await simulateTyping(chatId, 2);
                await sock.sendMessage(chatId, {
                    text: `✅ Step 1: You should have seen "typing..."\n\nNext: Recording...`
                });
                
                // Step 2: Recording
                await simulateRecording(chatId, 3);
                await sock.sendMessage(chatId, {
                    text: `✅ Step 2: You should have seen "recording..."\n\nNext: Final typing...`
                });
                
                // Step 3: Final typing
                await simulateTyping(chatId, 2);
                await sock.sendMessage(chatId, {
                    text: `🎉 *DEMO COMPLETE!*\n\nIf you saw all three indicators, the system is working!\n\nTo enable auto-mode: ${PREFIX}online on\nTo simulate in other chats: ${PREFIX}online type [chat-id]`
                });
                break;
                
            case 'status':
            case 'info':
                let statusMessage = `👻 *ONLINE PRESENCE STATUS*\n\n`;
                
                statusMessage += `📊 *Current Status:* ${config.enabled ? '✅ ACTIVE' : '❌ INACTIVE'}\n\n`;
                
                if (config.enabled) {
                    statusMessage += `⚙️ *Configuration:*\n`;
                    statusMessage += `├─ Mode: ${config.mode}\n`;
                    statusMessage += `├─ Interval: ${config.interval} minutes\n`;
                    statusMessage += `├─ Stealth: ${config.stealthLevel}\n`;
                    statusMessage += `├─ Target chats: ${config.targetChats.length}\n`;
                    statusMessage += `└─ Auto activities: ${config.stealthLevel !== 'low' ? '✅ ON' : '❌ OFF'}\n\n`;
                    
                    statusMessage += `📡 *Current Simulation:*\n`;
                    statusMessage += `├─ Last update: ${config.lastSeen ? new Date(config.lastSeen).toLocaleTimeString() : 'Never'}\n`;
                    statusMessage += `├─ Fake last seen: ${config.fakeLastSeen || 'Not set'}\n`;
                    statusMessage += `└─ Next update: ${config.nextUpdate ? new Date(config.nextUpdate).toLocaleTimeString() : 'Pending'}\n\n`;
                }
                
                statusMessage += `⚡ *Quick Actions:*\n`;
                statusMessage += `├─ ${PREFIX}online type - Simulate typing here\n`;
                statusMessage += `├─ ${PREFIX}online record - Simulate recording here\n`;
                statusMessage += `├─ ${PREFIX}online test - Test all features\n`;
                statusMessage += `├─ ${PREFIX}online quick - Quick demo\n`;
                statusMessage += `└─ ${PREFIX}online chats - List target chats`;
                
                await sock.sendMessage(chatId, {
                    text: statusMessage
                }, { quoted: msg });
                break;
                
            case 'help':
                let helpText = `👻 *ONLINE PRESENCE COMMAND HELP*\n\n`;
                
                helpText += `🎯 *What this does:*\n`;
                helpText += `Makes you appear online even when you're not\nShows typing/recording indicators in chats\nControls how others see your online status\n\n`;
                
                helpText += `📋 *Available Commands:*\n`;
                helpText += `├─ ${PREFIX}online on - Enable fake online status\n`;
                helpText += `├─ ${PREFIX}online off - Disable\n`;
                helpText += `├─ ${PREFIX}online type [chat] - Simulate typing\n`;
                helpText += `├─ ${PREFIX}online record [chat] - Simulate recording\n`;
                helpText += `├─ ${PREFIX}online addchat - Add chat for auto activities\n`;
                helpText += `├─ ${PREFIX}online removechat - Remove chat\n`;
                helpText += `├─ ${PREFIX}online chats - List target chats\n`;
                helpText += `├─ ${PREFIX}online test - Test all features\n`;
                helpText += `├─ ${PREFIX}online quick - Quick demo\n`;
                helpText += `├─ ${PREFIX}online status - Current status\n`;
                helpText += `└─ ${PREFIX}online help - This help\n\n`;
                
                helpText += `⚡ *Examples:*\n`;
                helpText += `├─ ${PREFIX}online on\n`;
                helpText += `├─ ${PREFIX}online type 1234567890@s.whatsapp.net\n`;
                helpText += `├─ ${PREFIX}online record (current chat)\n`;
                helpText += `├─ ${PREFIX}online test\n`;
                helpText += `└─ ${PREFIX}online quick\n\n`;
                
                helpText += `⚠️ *Important Notes:*\n`;
                helpText += `• Typing/recording must be sent to specific chats\n`;
                helpText += `• Add chats for automatic activities\n`;
                helpText += `• Test with ${PREFIX}online test first\n`;
                helpText += `• Use responsibly`;
                
                await sock.sendMessage(chatId, {
                    text: helpText
                }, { quoted: msg });
                break;
                
            default:
                await sock.sendMessage(chatId, {
                    text: `❌ *Unknown online command*\n\nUse ${PREFIX}online help to see all commands.\n\nQuick test: ${PREFIX}online test\nOr: ${PREFIX}online quick`
                }, { quoted: msg });
        }
    }
};