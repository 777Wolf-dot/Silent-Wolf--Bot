// // restart.js - GUARANTEED WORKING RESTART COMMAND
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import fs from 'fs';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const execAsync = promisify(exec);

// export default {
//   name: "restart",
//   aliases: ["reboot", "refresh", "r"],
//   description: "Restart the bot - GUARANTEED WORKING",
//   category: "owner",
//   isOwner: true,
  
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
    
//     try {
//       // ============================================
//       // STEP 1: AUTHORIZATION CHECK
//       // ============================================
//       let isAuthorized = false;
      
//       // Method 1: Check if message is from bot itself
//       if (m.key.fromMe) isAuthorized = true;
      
//       // Method 2: Check settings for owner number
//       try {
//         const settings = await import(`file://${path.join(__dirname, '../settings.js')}`);
//         const ownerNumber = settings.default?.ownerNumber || settings.default?.botOwner;
        
//         if (ownerNumber) {
//           const senderId = m.key.participant || m.key.remoteJid;
//           if (senderId.includes(ownerNumber.replace('@s.whatsapp.net', ''))) {
//             isAuthorized = true;
//           }
//         }
//       } catch (e) {
//         console.log('[RESTART] Could not load settings:', e.message);
//       }
      
//       // Method 3: Hardcoded owner check (SAFEST)
//       const HARDCODED_OWNERS = [
//         '919876543210@s.whatsapp.net', // Replace with YOUR number
//         // Add more numbers if needed
//       ];
      
//       const senderId = m.key.participant || m.key.remoteJid;
//       if (HARDCODED_OWNERS.some(owner => senderId.includes(owner.replace('@s.whatsapp.net', '')))) {
//         isAuthorized = true;
//       }
      
//       if (!isAuthorized) {
//         await sock.sendMessage(jid, { 
//           text: '❌ *PERMISSION DENIED*\n\nOnly bot owner can use this command!' 
//         }, { quoted: m });
//         return;
//       }
      
//       console.log(`🚀 [RESTART] Initiated by: ${m.pushName || 'Unknown'}`);
      
//       // ============================================
//       // STEP 2: SEND INITIAL MESSAGE
//       // ============================================
//       const statusMsg = await sock.sendMessage(jid, { 
//         text: `🔁 *BOT RESTART INITIATED*\n\n✅ Owner verified\n⏳ Starting restart sequence...` 
//       }, { quoted: m });
      
//       // ============================================
//       // STEP 3: CRITICAL SESSION CLEANUP (PREVENTS 428 ERROR)
//       // ============================================
//       await sock.sendMessage(jid, { 
//         text: `🔁 *BOT RESTART INITIATED*\n\n✅ Owner verified ✅\n🧹 Cleaning session data...`,
//         edit: statusMsg.key
//       });
      
//       const sessionPath = path.join(process.cwd(), 'session');
//       if (fs.existsSync(sessionPath)) {
//         console.log(`[RESTART] Cleaning session: ${sessionPath}`);
        
//         // Files that cause 428 error - MUST DELETE
//         const criticalFiles = [
//           'app-state-sync-version.json',  // MAIN CULPRIT for 428 error
//           'message-history.json',          // Also causes issues
//           'sender-key-memory.json',        // Security data
//           'creds.json',                    // Force fresh login
//         ];
        
//         // Optional files to clean
//         const optionalFiles = [
//           'baileys_store.json',
//           'baileys_store_multi.json',
//           'pre-key-ids.json',
//           'session-ids.json'
//         ];
        
//         let deletedCount = 0;
        
//         // Delete critical files
//         for (const file of criticalFiles) {
//           const filePath = path.join(sessionPath, file);
//           if (fs.existsSync(filePath)) {
//             try {
//               fs.unlinkSync(filePath);
//               deletedCount++;
//               console.log(`✓ Deleted: ${file}`);
//             } catch (e) {
//               console.log(`✗ Failed to delete ${file}:`, e.message);
//             }
//           }
//         }
        
//         // Try to delete optional files
//         for (const file of optionalFiles) {
//           const filePath = path.join(sessionPath, file);
//           if (fs.existsSync(filePath)) {
//             try {
//               fs.unlinkSync(filePath);
//               console.log(`✓ Deleted (optional): ${file}`);
//             } catch (e) {}
//           }
//         }
        
//         console.log(`[RESTART] Deleted ${deletedCount} session files`);
        
//         if (deletedCount === 0) {
//           console.log('[RESTART] No session files found to delete');
//         }
//       } else {
//         console.log('[RESTART] No session folder found');
//       }
      
//       // ============================================
//       // STEP 4: DETERMINE RESTART METHOD
//       // ============================================
//       await sock.sendMessage(jid, { 
//         text: `🔁 *BOT RESTART INITIATED*\n\n✅ Owner verified ✅\n🧹 Cleaning session data... ✅\n🔍 Detecting restart method...`,
//         edit: statusMsg.key
//       });
      
//       let restartMethod = 'process_exit';
//       let restartCommand = '';
      
//       try {
//         // Check for PM2
//         await execAsync('pm2 --version');
//         restartMethod = 'pm2';
//         restartCommand = 'pm2 restart all';
//         console.log('[RESTART] Using PM2 method');
        
//       } catch (e) {
//         // Check for Forever
//         try {
//           await execAsync('forever --version');
//           restartMethod = 'forever';
//           restartCommand = 'forever restartall';
//           console.log('[RESTART] Using Forever method');
          
//         } catch (e2) {
//           // Check for package.json restart script
//           const packagePath = path.join(process.cwd(), 'package.json');
//           if (fs.existsSync(packagePath)) {
//             const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
//             if (pkg.scripts && pkg.scripts.restart) {
//               restartMethod = 'npm_restart';
//               restartCommand = 'npm run restart';
//               console.log('[RESTART] Using npm restart method');
//             } else if (pkg.scripts && pkg.scripts.start) {
//               restartMethod = 'npm_start';
//               restartCommand = 'npm start';
//               console.log('[RESTART] Using npm start method');
//             }
//           }
          
//           // Fallback to nodemon if exists
//           const nodemonPath = path.join(process.cwd(), 'nodemon.json');
//           if (fs.existsSync(nodemonPath)) {
//             restartMethod = 'nodemon';
//             restartCommand = 'npx nodemon';
//             console.log('[RESTART] Using nodemon method');
//           }
//         }
//       }
      
//       // ============================================
//       // STEP 5: EXECUTE RESTART
//       // ============================================
//       await sock.sendMessage(jid, { 
//         text: `🔁 *BOT RESTART INITIATED*\n\n✅ Owner verified ✅\n🧹 Cleaning session data... ✅\n🔍 Detecting restart method... ✅\n🚀 Method: ${restartMethod.toUpperCase()}\n\n⏳ Executing restart...`,
//         edit: statusMsg.key
//       });
      
//       // Send final goodbye message
//       await sock.sendMessage(jid, { 
//         text: `👋 *Goodbye!*\n\nBot is restarting now...\n🔄 Will reconnect in 10-15 seconds\n📱 Status: ${restartMethod.toUpperCase()} method` 
//       });
      
//       console.log(`[RESTART] Executing: ${restartCommand || 'Process exit'}`);
      
//       // ============================================
//       // STEP 6: GRACEFUL SHUTDOWN & RESTART
//       // ============================================
//       setTimeout(async () => {
//         try {
//           // 1. Close WhatsApp connection
//           console.log('[RESTART] Closing WhatsApp connection...');
//           await sock.end();
//           console.log('[RESTART] Connection closed successfully');
          
//         } catch (sockError) {
//           console.log('[RESTART] Error closing socket:', sockError.message);
//         }
        
//         // 2. Execute restart command
//         setTimeout(() => {
//           if (restartCommand) {
//             console.log(`[RESTART] Running: ${restartCommand}`);
            
//             // Execute the restart command
//             const child = exec(restartCommand, {
//               windowsHide: true,
//               detached: true,
//               stdio: 'ignore'
//             });
            
//             child.unref();
            
//             // Exit current process
//             setTimeout(() => {
//               console.log('[RESTART] Exiting current process...');
//               process.exit(0);
//             }, 1000);
            
//           } else {
//             // No restart command found, just exit
//             console.log('[RESTART] No restart method found, exiting process...');
            
//             // Exit with code 1 to signal need for restart
//             // (Useful if you have auto-restart script)
//             process.exit(1);
//           }
//         }, 1000);
        
//       }, 3000); // Wait 3 seconds before shutting down
      
//     } catch (error) {
//       console.error("❌ [RESTART] FATAL ERROR:", error);
      
//       try {
//         await sock.sendMessage(jid, { 
//           text: `❌ *RESTART FAILED!*\n\nError: ${error.message}\n\n⚠️ Please restart manually!` 
//         }, { quoted: m });
//       } catch (sendError) {
//         console.log('[RESTART] Could not send error message:', sendError.message);
//       }
//     }
//   },
// };











// // restart.js — CLEAN + PANEL-SAFE VERSION
// import { exec } from "child_process";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Simple RUN helper
// function run(cmd) {
//   return new Promise((resolve, reject) => {
//     exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
//       if (err) return reject(stderr || stdout || err.message);
//       resolve(stdout);
//     });
//   });
// }

// export default {
//   name: "restart",
//   aliases: ["reboot", "refresh", "r"],
//   description: "Restart bot safely without affecting session",
//   category: "owner",
//   isOwner: true,

//   async execute(sock, m) {
//     const jid = m.key.remoteJid;

//     try {
//       // Owner verification
//       if (!m.key.fromMe) {
//         let isOwner = false;

//         try {
//           const settings = await import(`file://${path.join(__dirname, "../settings.js")}`);
//           const ownerNumber = settings.default?.ownerNumber;

//           if (ownerNumber) {
//             const sender = m.key.participant || m.key.remoteJid;
//             if (sender.includes(ownerNumber.replace("@s.whatsapp.net", ""))) {
//               isOwner = true;
//             }
//           }
//         } catch {}

//         if (!isOwner) {
//           await sock.sendMessage(jid, { text: "❌ Only owner can restart the bot." });
//           return;
//         }
//       }

//       // Feedback
//       await sock.sendMessage(jid, { text: "_Restarting bot... 🔄_" }, { quoted: m });
//       try {
//         await sock.sendMessage(jid, { react: { text: "♻️", key: m.key } });
//       } catch {}

//       // Call restart process
//       await restartProcess(sock, jid);

//     } catch (e) {
//       console.error("[RESTART ERROR]:", e);
//       await sock.sendMessage(jid, { text: `❌ Restart failed: ${e.message}` });
//     }
//   },
// };

// // ======================================
// //            RESTART PROCESS
// // ======================================

// async function restartProcess(sock, chatId) {
//   try {
//     await sock.sendMessage(chatId, { text: "🔄 Cleaning cache & closing connection..." });
//   } catch {}

//   // Close Baileys socket gracefully
//   try {
//     await sock.end();
//   } catch {}

//   // CLEAN ONLY SAFE FILES (DO NOT DELETE creds.json)
//   const sessionDir = path.join(process.cwd(), "session");

//   const safeFiles = [
//     "sender-key-memory.json",
//     "app-state-sync-version.json",
//     "message-history.json",
//     "baileys_store.json",
//     "baileys_store_multi.json"
//   ];

//   if (fs.existsSync(sessionDir)) {
//     safeFiles.forEach(file => {
//       const filePath = path.join(sessionDir, file);
//       if (fs.existsSync(filePath)) {
//         try {
//           fs.rmSync(filePath, { force: true });
//           console.log("[RESTART] Deleted", file);
//         } catch {}
//       }
//     });
//   }

//   // Give panel/terminal time to catch up
//   setTimeout(() => {
//     console.log("[RESTART] Exiting process now...");
//     process.exit(0); // PANEL AUTO-RESTARTS
//   }, 800);
// }


















// restart.js - Works EXACTLY like your existing system
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Your existing run function converted to ES6
function run(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, { windowsHide: true }, (err, stdout, stderr) => {
            if (err) return reject(new Error((stderr || stdout || err.message || '').toString()));
            resolve((stdout || '').toString());
        });
    });
}

// Your existing restartProcess function converted to ES6
async function restartProcess(sock, chatId, message) {
    try {
        // Send final confirmation message to the user
        await sock.sendMessage(chatId, { text: '_Silent Wolf restarting... Cleaning session data..._' }, { quoted: message });
    } catch {}
    
    // 1. Gracefully close the Baileys socket
    try {
        await sock.end(); 
    } catch (e) {
        console.error('Error during graceful Baileys shutdown:', e.message);
    }
    
    // 🛑 2. CRITICAL STEP: DELETE VOLATILE SESSION FILES
    // Delete files that track message state and history sync, as these are the source of 428 errors.
    const sessionPath = path.join(process.cwd(), 'session');
    
    const filesToDelete = [
        'app-state-sync-version.json',
        'message-history.json',
        'sender-key-memory.json',
        'baileys_store_multi.json', // Included for comprehensive cleanup
        'baileys_store.json', // Included if a non-multi store is used
        'creds.json' // Added to handle login prompt issue
    ];

    if (fs.existsSync(sessionPath)) {
        console.log(`[RESTART] Clearing volatile session data in: ${sessionPath}`);
        
        filesToDelete.forEach(fileName => {
            const filePath = path.join(sessionPath, fileName);
            if (fs.existsSync(filePath)) {
                try {
                    fs.rmSync(filePath, { force: true });
                    console.log(`[RESTART] Deleted: ${fileName}`);
                } catch (e) {
                    console.error(`[RESTART] Failed to delete ${fileName}:`, e.message);
                }
            }
        });
    }

    // 3. Trigger restart via PM2 or Process Exit
    try {
        // Preferred: PM2 (This is the original logic, keep it)
        await run('pm2 restart all');
        return;
    } catch {}
    
    // Panels usually auto-restart when the process exits.
    // Exit immediately now that cleanup is complete.
    setTimeout(() => {
        process.exit(0);
    }, 0); 
}

// Main command handler - EXACTLY like your updateCommand but for restart only
export default {
  name: "restart",
  aliases: ["reboot", "refresh", "start"],
  description: "Restart the bot (like .update but without git/zip)",
  category: "owner",
  isOwner: true,
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const commandText = m.message.extendedTextMessage?.text || m.message.conversation || '';
    
    // Check if it's a simple restart or update
    const isSimpleRestart = commandText.toLowerCase().includes('restart') && 
                           !commandText.toLowerCase().includes('update');
    
    // Check if user is sudo/owner
    let senderIsSudo = false;
    
    if (m.key.fromMe) {
        senderIsSudo = true;
    } else {
        // Try to load settings to check owner
        try {
            // Dynamic import for ES modules
            const settings = await import(`file://${path.join(__dirname, '../settings.js')}`);
            const ownerNumber = settings.default?.ownerNumber || settings.default?.botOwner;
            
            if (ownerNumber) {
                const senderId = m.key.participant || m.key.remoteJid;
                if (senderId.includes(ownerNumber.replace('@s.whatsapp.net', ''))) {
                    senderIsSudo = true;
                }
            }
        } catch (e) {
            console.log('[RESTART] Could not load settings:', e.message);
        }
        
        // Hardcoded owner check as fallback
        const HARDCODED_OWNERS = [
            '919876543210' // REPLACE WITH YOUR NUMBER
        ];
        
        const senderId = m.key.participant || m.key.remoteJid;
        if (HARDCODED_OWNERS.some(num => senderId.includes(num))) {
            senderIsSudo = true;
        }
    }
    
    if (!m.key.fromMe && !senderIsSudo) {
        await sock.sendMessage(jid, { text: 'Only bot owner or sudo can use .restart or .Start command' }, { quoted: m });
        return;
    }

    try {
        // ============================================
        // STEP 1: SEND INITIAL MESSAGES (like your system)
        // ============================================
        await sock.sendMessage(jid, { text: '_Restarting bot ...🏂_' }, { quoted: m });
        
        // Add reaction ✅
        try {
            await sock.sendMessage(jid, {
                react: { text: '💓', key: m.key }
            });
        } catch (e) {}
        
        // ============================================
        // STEP 2: CHECK IF IT'S UPDATE OR RESTART
        // ============================================
        // If it's NOT a simple restart (means it's .update command)
        // We'll implement both in one command for convenience
        const wantsUpdate = commandText.toLowerCase().includes('update') || 
                          args.includes('--update') || 
                          args.includes('--git');
        
        if (wantsUpdate && !isSimpleRestart) {
            // ============================================
            // UPDATE LOGIC (from your existing system)
            // ============================================
            await sock.sendMessage(jid, { text: '_Updating 💉 bot database. please wait…_' }, { quoted: m });
            
            // Add reaction ✅
            try {
                await sock.sendMessage(jid, {
                    react: { text: '🆙', key: m.key }
                });
            } catch (e) {}
            
            // Check for git repo
            async function hasGitRepo() {
                const gitDir = path.join(process.cwd(), '.git');
                if (!fs.existsSync(gitDir)) return false;
                try {
                    await run('git --version');
                    return true;
                } catch {
                    return false;
                }
            }
            
            async function updateViaGit() {
                const oldRev = (await run('git rev-parse HEAD').catch(() => 'unknown')).trim();
                await run('git fetch --all --prune');
                const newRev = (await run('git rev-parse origin/main')).trim();
                const alreadyUpToDate = oldRev === newRev;
                const commits = alreadyUpToDate ? '' : await run(`git log --pretty=format:"%h %s (%an)" ${oldRev}..${newRev}`).catch(() => '');
                const files = alreadyUpToDate ? '' : await run(`git diff --name-status ${oldRev} ${newRev}`).catch(() => '');
                await run(`git reset --hard ${newRev}`);
                await run('git clean -fd');
                return { oldRev, newRev, alreadyUpToDate, commits, files };
            }
            
            if (await hasGitRepo()) {
                const { oldRev, newRev, alreadyUpToDate, commits, files } = await updateViaGit();
                const summary = alreadyUpToDate ? `✅ Already up to date: ${newRev}` : `✅ Updated to ${newRev}`;
                console.log('[RESTART/UPDATE] Git update summary:', summary);
                await run('npm install --no-audit --no-fund');
            } else {
                // ZIP update logic (simplified)
                await sock.sendMessage(jid, { text: '⚠️ Git not available. Using simple restart.' });
            }
        }
        
        // ============================================
        // STEP 3: SEND FINAL MESSAGE BEFORE RESTART
        // ============================================
        try {
            // Try to get version from settings
            let versionText = '';
            try {
                const settings = await import(`file://${path.join(__dirname, '../settings.js')}`);
                versionText = settings.default?.version ? ` v${settings.default.version}` : '';
            } catch {}
            
            await sock.sendMessage(jid, { text: `_Finalizing restart${versionText}..._` });
            
        } catch {
            await sock.sendMessage(jid, { text: '_Finalizing restart..._' });
        }
        
        // ============================================
        // STEP 4: EXECUTE THE RESTART
        // ============================================
        // This is where the actual restart logic is executed.
        await restartProcess(sock, jid, m); 
        
    } catch (err) {
        console.error('[RESTART] Failed:', err);
        await sock.sendMessage(jid, { text: `❌ Restart failed:\n${String(err.message || err)}` }, { quoted: m });
    }
  },
};

// Export additional functions if needed by other modules
export { restartProcess, run };