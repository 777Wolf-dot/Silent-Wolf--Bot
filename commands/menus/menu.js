// // // // // import settingMenu from './settingMenu.js';
// // // // // import fs from 'fs';
// // // // // import path from 'path';
// // // // // import { fileURLToPath } from 'url';

// // // // // const __filename = fileURLToPath(import.meta.url);
// // // // // const __dirname = path.dirname(__filename);

// // // // // export default {
// // // // //   name: 'menu',
// // // // //   description: 'Displays the command menu',
// // // // //   async execute(sock, message, args, prefix) {
// // // // //     try {
// // // // //       const jid = message.key.remoteJid;
// // // // //       console.log("🐺 Menu command triggered by:", jid);

// // // // //       // 🕐 Step 1: Send loading message
// // // // //       await sock.sendMessage(jid, { text: '🕐 Summoning the *Wolf Command Center*... 🌕🐺' });

// // // // //       // 🖼️ Step 2: Locate the image file
// // // // //       const imagePath = path.join(__dirname, '../media/_wolfbo.png');
// // // // //       console.log("📁 Image path:", imagePath);

// // // // //       // Step 3: Check if image exists
// // // // //       if (!fs.existsSync(imagePath)) {
// // // // //         console.error("❌ Image not found at:", imagePath);
// // // // //         await sock.sendMessage(jid, { text: '⚠️ Could not find the wolf image at ' + imagePath });
// // // // //         return;
// // // // //       }

// // // // //       // Step 4: Read the image as a buffer
// // // // //       const imageBuffer = fs.readFileSync(imagePath);
// // // // //       console.log("✅ Image buffer loaded:", imageBuffer.length, "bytes");

// // // // //       // Step 5: Send the image with menu caption
// // // // //       await sock.sendMessage(
// // // // //         jid,
// // // // //         {
// // // // //           image: imageBuffer,
// // // // //           caption: settingMenu(prefix),
// // // // //           mimetype: 'image/png',
// // // // //         }
// // // // //       );

// // // // //       console.log("✅ Image with menu sent successfully!");

// // // // //     } catch (error) {
// // // // //       console.error("❌ Error sending menu:", error);
// // // // //       await sock.sendMessage(message.key.remoteJid, {
// // // // //         text: '❌ Error showing the Wolf Command Center. Check logs.',
// // // // //       });
// // // // //     }
// // // // //   },
// // // // // };















// // // // import fs from "fs";
// // // // import path from "path";

// // // // const menu = async (sock, m) => {
// // // //   try {
// // // //     // ✅ Automatically resolve absolute path to your image
// // // //     const __dirname = path.resolve();
// // // //     const imagePath = path.join(__dirname, "commands", "media", "wolfmenu.jpg");

// // // //     if (!fs.existsSync(imagePath)) {
// // // //       await sock.sendMessage(m.chat, {
// // // //         text: `⚠ Menu image not found at:\n${imagePath}`,
// // // //       });
// // // //       return;
// // // //     }

// // // //     const menuImage = fs.readFileSync(imagePath);

// // // //     const caption = `
// // // // 🐺🌕 *SILENT WOLF MENU* 🌕🐺

// // // // ┌───────────────
// // // // │ ⚔️ *GROUP COMMANDS*
// // // // ├───────────────
// // // // │ 🐺 .kick
// // // // │ 🐺 .add
// // // // │ 🐺 .promote
// // // // │ 🐺 .demote
// // // // │ 🐺 .mute
// // // // │ 🐺 .unmute
// // // // │ 🐺 .link
// // // // └───────────────

// // // // 🧠 *AI FEATURES*
// // // // │ 🤖 .ask
// // // // │ 🖋️ .summarize
// // // // │ 🗣️ .tts
// // // // │ 🐺 .wolfai

// // // // 🎵 *AUDIO TOOLS*
// // // // │ 🎧 .bass
// // // // │ 🎶 .pitch
// // // // │ 🎙️ .slow
// // // // │ ⚡ .fast

// // // // 🌐 *MEDIA*
// // // // │ 📥 .ytmp3
// // // // │ 🎬 .ytmp4
// // // // │ 📸 .igdl
// // // // │ 🐦 .twitdl

// // // // 🐾 *More power, more silence...* 🌕
// // // //     `;

// // // //     await sock.sendMessage(m.chat, {
// // // //       image: menuImage,
// // // //       caption: caption.trim(),
// // // //     });
// // // //   } catch (err) {
// // // //     console.error("❌ Error sending menu:", err);
// // // //     await sock.sendMessage(m.chat, { text: "⚠ Failed to load menu." });
// // // //   }
// // // // };

// // // // export default menu;


 


// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // export default {
// //   name: "menu",
// //   description: "Shows the Wolf Command Center (image + caption)",
// //   async execute(sock, m) {
// //     const jid = m.key.remoteJid;

// //     console.log("\n🐺 [MENU] Command received from:", jid);

// //     try {
// //       // Step 1: Notify user
// //       await sock.sendMessage(jid, { text: "🕐 Summoning the *Wolf Command Center*... 🌕🐺" }, { quoted: m });
// //       console.log("✅ Step 1: Sent loading message");

// //       // Step 2: Try image paths
// //       const path1 = path.join(__dirname, "media", "wolfbot.jpg");
// //       const path2 = path.join(__dirname, "../media", "wolfbot.jpg");

// //       console.log("🔍 Checking paths:\n1️⃣", path1, "\n2️⃣", path2);

// //       let imagePath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : null;

// //       if (!imagePath) {
// //         console.error("❌ Step 2: Image not found in both paths!");
// //         await sock.sendMessage(jid, { text: "⚠️ Image 'wolfmenu.jpg' not found in /commands/media/ or /media/." }, { quoted: m });
// //         return;
// //       }

// //       console.log("✅ Step 2: Found image at:", imagePath);

// //       // Step 3: Read image buffer
// //       const imageBuffer = fs.readFileSync(imagePath);
// //       console.log("✅ Step 3: Image loaded successfully (" + imageBuffer.length + " bytes)");

// //       // Step 4: Prepare caption
// //       const caption = `
// // 🐺🌕 *WOLF BOT* 🌕🐺

// // ┌────────────────
// // │ 🏠 *GROUP MANAGEMENT* 🏠 
// // ├────────────────
// // │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// // ├────────────────
// // │ • add                     
// // │ • promote                 
// // │ • demote                  
// // │ • kick                    
// // │ • ban                     
// // │ • unban                   
// // │ • banlist                 
// // │ • clearbanlist            
// // │ • warn                    
// // │ • unwarn                  
// // │ • clearwarns              
// // │ • mute                    
// // │ • unmute                  
// // │ • gctime                  
// // │ • lock                    
// // │ • unlock                  
// // ├────────────────
// // │ 🚫 *AUTO-MODERATION* 🚫   
// // ├────────────────
// // │ • antilink                
// // │ • antisticker             
// // │ • antiimage               
// // │ • antivideo               
// // ├────────────────
// // │ 📊 *GROUP INFO & TOOLS* 📊 
// // ├────────────────
// // │ • groupinfo               
// // │ • tagadmin                
// // │ • tagall                  
// // │ • hidetag                 
// // │ • link                    
// // │ • invite                  
// // │ • revoke                  
// // │ • setname                 
// // │ • setdesc                 
// // │ • setgcpp                 
// // │ • welcome                 
// // │ • goodbye                 
// // │ • fangtrace               
// // │ • disp                    
// // └────────────────

// // ┌────────────────
// // │ 👑 *OWNER CONTROLS* 👑    
// // ├────────────────
// // │ ⚡ *CORE MANAGEMENT* ⚡    
// // ├────────────────
// // │ • setprefix               
// // │ • setantilink             
// // │ • block                   
// // │ • unblock                 
// // │ • silent                  
// // │ • default                 
// // │ • runcode                 
// // ├────────────────
// // │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// // ├────────────────
// // │ • restart                 
// // │ • update                  
// // │ • gcrestart               
// // │ • backup                  
// // │ • restore                 
// // │ • cleardb                 
// // │ • cleartemp               
// // └────────────────

// // ┌────────────────
// // │ ✨ *GENERAL UTILITIES* ✨  
// // ├────────────────
// // │ 🔍 *INFO & SEARCH* 🔎     
// // ├────────────────
// // │ • ping                    
// // │ • time                    
// // │ • calc                    
// // │ • define                  
// // │ • dictionary              
// // │ • wiki                    
// // │ • news                    
// // │ • weather                 
// // │ • covid                    
// // │ • stock                   
// // │ • currency                
// // ├───────────────
// // │ 🔗 *CONVERSION & MEDIA* 📁 
// // ├───────────────
// // │ • translate               
// // │ • convert                 
// // │ • shorturl                
// // │ • expandurl               
// // │ • qrencode                
// // │ • qrdecode                
// // │ • reverseimage            
// // │ • tomp3                   
// // │ • tovideo                 
// // │ • tosticker               
// // ├───────────────
// // │ 📝 *PERSONAL TOOLS* 📅    
// // ├───────────────
// // │ • reminder                
// // │ • todo                    
// // └───────────────

// // ├────────────────
// // │ 🎵 *MUSIC & FUN* 🎶
// // ├────────────────
// // │ • play



// // ┌───────────────
// // │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// // ├───────────────
// // │ ⬇️ *MEDIA DOWNLOADS* 📥     
// // ├───────────────
// // │ • ytdl                    
// // │ • spotifydl               
// // │ • tiktokdl                
// // │ • instadl                 
// // │ • twitterdl               
// // │ • mediafire               
// // ├───────────────
// // │ 🎨 *AI GENERATION* 💡    
// // ├───────────────
// // │ • gemini                  
// // │ • gpt                     
// // │ • deepseek                
// // │ • chat                    
// // │ • summary                 
// // │ • imagine                 
// // │ • dalle                   
// // └───────────────

// // ┌───────────────
// // │ 🛡️ *SECURITY & HACKING* 🔒 
// // ├───────────────
// // │ 🌐 *NETWORK & INFO* 📡   
// // ├───────────────
// // │ • ipinfo              
// // │ • whois               
// // │ • dnslookup           
// // │ • host                
// // │ • reverseip           
// // │ • ssllabs             
// // │ • shodan              
// // ├────────────────
// // │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// // ├────────────────
// // │ • pwcheck             
// // │ • breach              
// // │ • portscan            
// // │ • httpheaders         
// // │ • subdomains          
// // │ • encode              
// // │ • decode              
// // │ • consent             
// // │ • scan-now            
// // │ • scan-status         
// // │ • security-tips       
// // └────────────────

// // 🐺🌕*POWERED BY WOLF TECH*🌕🐺

// // `;

// //       console.log("✅ Step 4: Caption prepared");

// //       // Step 5: Send image with caption
// //       await sock.sendMessage(
// //         jid,
// //         {
// //           image: imageBuffer,
// //           caption,
// //           mimetype: "image/jpeg",
// //         },
// //         { quoted: m }
// //       );

// //       console.log("✅ Step 5: Menu sent successfully with image + caption");

// //     } catch (err) {
// //       console.error("❌ [MENU] ERROR CAUGHT:");
// //       console.error(err);
// //       await sock.sendMessage(
// //         m.key.remoteJid,
// //         { text: "⚠ Failed to load menu. Check console logs for details." },
// //         { quoted: m }
// //       );
// //     }
// //   },
// // };






// import os from "os";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// // per-menu toggles
// // import { getCurrentMenuStyle, menuToggles } from "./menustyle.js";
// import { getCurrentMenuStyle } from "./menustyle.js";
// //import { currentMenu } from "../menus/menuToggles.js";
// import { setLastMenu, menuToggles } from "../menus/menuToggles.js";




// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   name: "menu",
//   description: "Shows the Wolf Command Center in various styles",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const style = getCurrentMenuStyle();

//     console.log(`\n🐺 [MENU] Command received from: ${jid} | Using style: ${style}`);

//     try {
//       switch (style) {
//         case 1: {
//           // ✅ Image Menu
//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media", "wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;

//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }

//           const buffer = fs.readFileSync(imagePath);
//           const caption = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// *`; // Use your full command list here

//           await sock.sendMessage(jid, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }

//         case 2: {
//           // 📝 Text Only
//           const text = `🐺🌕 *WOLF BOT* 🌕🐺
// ────────────────
// > 🏠 *GROUP MANAGEMENT* — manage members & group
// > • add — add user
// > • promote — make admin
// > • demote — remove admin
// > • kick — remove user
// > • ban — ban user
// > • unban — unban user
// > • banlist — show banned
// > • clearbanlist — clear bans
// > • warn — warn user
// > • unwarn — remove warning
// > • clearwarns — reset warnings
// > • mute — mute user
// > • unmute — unmute user
// > • gctime — group time settings
// > • lock — lock group
// > • unlock — unlock group

// > 🚫 *AUTO-MODERATION* — auto-protect group
// > • antilink — block links
// > • antisticker — block stickers
// > • antiimage — block images
// > • antivideo — block videos

// > 📊 *GROUP INFO & TOOLS* — group info commands
// > • groupinfo — show info
// > • tagadmin — mention admins
// > • tagall — mention all
// > • hidetag — hide mentions
// > • link — show group link
// > • invite — generate invite
// > • revoke — revoke link
// > • setname — change name
// > • setdesc — change description
// > • setgcpp — change group picture
// > • welcome — set welcome message
// > • goodbye — set goodbye message
// > • fangtrace — trace user
// > • disp — display group stats

// > 👑 *OWNER CONTROLS* — bot owner commands
// > • setprefix — change prefix
// > • setantilink — toggle antilink
// > • block — block user
// > • unblock — unblock user
// > • silent — silent mode
// > • default — reset settings
// > • runcode — run code

// > 🔄 *SYSTEM & MAINTENANCE* — bot maintenance
// > • restart — restart bot
// > • update — update bot
// > • gcrestart — restart group
// > • backup — backup data
// > • restore — restore data
// > • cleardb — clear database
// > • cleartemp — clear temp files

// > ✨ *GENERAL UTILITIES* — info & conversions
// > • ping — bot ping
// > • time — current time
// > • calc — calculator
// > • define — word definition
// > • dictionary — word lookup
// > • wiki — search wiki
// > • news — latest news
// > • weather — weather info
// > • covid — covid stats
// > • stock — stock info
// > • currency — convert currency
// > • translate — translate text
// > • convert — convert formats
// > • shorturl — shorten URL
// > • expandurl — expand URL
// > • qrencode — QR encode
// > • qrdecode — QR decode
// > • reverseimage — reverse image search
// > • tomp3 — video to mp3
// > • tovideo — convert to video
// > • tosticker — convert to sticker
// > • reminder — set reminder
// > • todo — add todo

// > 🎵 *MUSIC & FUN* — entertainment
// > • play — play music

// > 🤖 *MEDIA & AI* — media & AI tools
// > • ytdl — download YouTube
// > • spotifydl — download Spotify
// > • tiktokdl — download TikTok
// > • instadl — download Instagram
// > • twitterdl — download Twitter
// > • mediafire — download Mediafire
// > • gemini — AI chat
// > • gpt — AI chat
// > • deepseek — AI search
// > • chat — AI conversation
// > • summary — text summary
// > • imagine — generate images
// > • dalle — generate images

// > 🛡️ *SECURITY & HACKING* — network & scans
// > • ipinfo — IP info
// > • whois — domain info
// > • dnslookup — DNS lookup
// > • host — host info
// > • reverseip — reverse IP lookup
// > • ssllabs — SSL check
// > • shodan — scan device
// > • pwcheck — password check
// > • breach — check breach
// > • portscan — scan ports
// > • httpheaders — fetch headers
// > • subdomains — list subdomains
// > • encode — encode text
// > • decode — decode text
// > • consent — consent check
// > • scan-now — run full scan
// > • scan-status — scan status
// > • security-tips — show tips

// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `; 
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//         case 3: {
//           // 📄 Full description
//           const text = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺`; 
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//         case 4: {
//           // 🔥 Ad Style
//           const text = `🐺 *WOLF BOT POWER MENU* 🌕\n\n🔥 Boost your group management\n💎 Unlock exclusive admin tools\n✨ Use AI & Media features\n*Style 4: Ad Style*`;
//           await sock.sendMessage(jid, { text }, { quoted: m });
//           break;
//         }

//      case 5: {
//   // 📝 Full info + commands (image removed)

//   const start = performance.now();
//   const uptime = process.uptime();
//   const h = Math.floor(uptime / 3600);
//   const mnt = Math.floor((uptime % 3600) / 60);
//   const s = Math.floor(uptime % 60);
//   const uptimeStr = `${h}h ${mnt}m ${s}s`;
//   const speed = (performance.now() - start).toFixed(2);
//   const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//   const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//   const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//   const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//   const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//   const host = process.env.REPL_ID
//     ? "Replit"
//     : process.env.HEROKU_APP_NAME
//     ? "Heroku"
//     : process.env.RENDER
//     ? "Render"
//     : "Panel";
//   const prefix = global.prefix || ".";
//   const version = global.version || "v2.6.2";

//   const infoText = `
// > ────────────────
// > ┃ User: ${m.pushName || "Anonymous"}
// > ┃ Owner: ${ownerNumber}
// > ┃ Mode: ${global.mode || "private"}
// > ┃ Host: ${host}
// > ┃ Speed: ${speed} ms
// > ┃ Prefix: [ ${prefix} ]
// > ┃ Uptime: ${uptimeStr}
// > ┃ Version: ${version}
// > ┃ Usage: ${usedMem} MB of ${totalMem} GB
// > ┃ RAM: ${memBar} ${memPercent}%
// > └────────────────
// `;

//   const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//   await sock.sendMessage(jid, { text: infoText + commandsText }, { quoted: m });
//   break;
// }


//         case 6: {
//           // 🖼️ Full info + image + commands



//           const start = performance.now();
//           const uptime = process.uptime();
//           const h = Math.floor(uptime / 3600);
//           const mnt = Math.floor((uptime % 3600) / 60);
//           const s = Math.floor(uptime % 60);
//           const uptimeStr = `${h}h ${mnt}m ${s}s`;
//           const speed = (performance.now() - start).toFixed(2);
//           const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//           const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//           const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//           const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//           const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//           const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//           const prefix = global.prefix || ".";
//           const version = global.version || "v2.6.2";

//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }
//           const buffer = fs.readFileSync(imagePath);

//           const infoCaption = `
// ────────────────
// ┃ User: ${m.pushName || "Anonymous"}
// ┃ Owner: ${ownerNumber}
// ┃ Mode: ${global.mode || "private"}
// ┃ Host: ${host}
// ┃ Speed: ${speed} ms
// ┃ Prefix: [ ${prefix} ]
// ┃ Uptime: ${uptimeStr}
// ┃ Version: ${version}
// ┃ Usage: ${usedMem} MB of ${totalMem} GB
// ┃ RAM: ${memBar} ${memPercent}%
// └────────────────
// `;

//           const commandsText = `
// 🐺🌕 *WOLF BOT* 🌕🐺

// ┌───────────────
// │ 🏠 *GROUP MANAGEMENT*
// ├───────────────
// │ • add
// │ • promote
// │ • demote
// │ • kick
// │ • ban
// │ • unban
// │ • banlist
// │ • clearbanlist
// │ • warn
// │ • unwarn
// │ • clearwarns
// │ • mute
// │ • unmute
// │ • gctime
// │ • lock
// │ • unlock
// └───────────────

// ... (rest of commands here) ...

// 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//           await sock.sendMessage(jid, { image: buffer, caption: infoCaption + commandsText, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }


//  case 7: {
//           // 🖼️ Full info + image + commands
 
    


//           const start = performance.now();
//           const uptime = process.uptime();
//           const h = Math.floor(uptime / 3600);
//           const mnt = Math.floor((uptime % 3600) / 60);
//           const s = Math.floor(uptime % 60);
//           const uptimeStr = `${h}h ${mnt}m ${s}s`;
//           const speed = (performance.now() - start).toFixed(2);
//           const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
//           const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
//           const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
//           const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

//           const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
//           const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
//           const prefix = global.prefix || ".";
//           const version = global.version || "v2.6.2";

//           const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
//           const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
//           const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
//           if (!imagePath) {
//             await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
//             return;
//           }
//           const buffer = fs.readFileSync(imagePath);

//           const infoCaption = `
// ────────────────
// ┃ User: ${m.pushName || "Anonymous"}
// ┃ Owner: ${ownerNumber}
// ┃ Mode: ${global.mode || "private"}
// ┃ Host: ${host}
// ┃ Speed: ${speed} ms
// ┃ Prefix: [ ${prefix} ]
// ┃ Uptime: ${uptimeStr}
// ┃ Version: ${version}
// ┃ Usage: ${usedMem} MB of ${totalMem} GB
// ┃ RAM: ${memBar} ${memPercent}%
// └────────────────
// `;

//           const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
// > ┌────────────────
// > │ 🏠 *GROUP MANAGEMENT* 🏠 
// > ├────────────────
// > │ 🛡️ *ADMIN & MODERATION* 🛡️ 
// > ├────────────────
// > │ • add                     
// > │ • promote                 
// > │ • demote                  
// > │ • kick                    
// > │ • ban                     
// > │ • unban                   
// > │ • banlist                 
// > │ • clearbanlist            
// > │ • warn                    
// > │ • unwarn                  
// > │ • clearwarns              
// > │ • mute                    
// > │ • unmute                  
// > │ • gctime                  
// > │ • lock                    
// > │ • unlock                  
// > ├────────────────
// > │ 🚫 *AUTO-MODERATION* 🚫   
// > ├────────────────
// > │ • antilink               
// > │ • antisticker            
// > │ • antiimage              
// > │ • antivideo             
// > ├────────────────
// > │ 📊 *GROUP INFO & TOOLS* 📊 
// > ├────────────────
// > │ • groupinfo               
// > │ • tagadmin                
// > │ • tagall                  
// > │ • hidetag                 
// > │ • link                    
// > │ • invite                  
// > │ • revoke                  
// > │ • setname                 
// > │ • setdesc                 
// > │ • setgcpp                 
// > │ • welcome                 
// > │ • goodbye                 
// > │ • fangtrace               
// > │ • disp                    
// > └────────────────
// > 
// > ┌────────────────
// > │ 👑 *OWNER CONTROLS* 👑    
// > ├────────────────
// > │ ⚡ *CORE MANAGEMENT* ⚡    
// > ├────────────────
// > │ • setprefix               
// > │ • setantilink             
// > │ • block                   
// > │ • unblock                 
// > │ • silent                  
// > │ • default                 
// > │ • runcode                 
// > ├────────────────
// > │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
// > ├────────────────
// > │ • restart                 
// > │ • update                  
// > │ • gcrestart               
// > │ • backup                  
// > │ • restore                 
// > │ • cleardb                 
// > │ • cleartemp               
// > └────────────────
// > 
// > ┌────────────────
// > │ ✨ *GENERAL UTILITIES* ✨  
// > ├────────────────
// > │ 🔍 *INFO & SEARCH* 🔎     
// > ├────────────────
// > │ • ping                    
// > │ • time                    
// > │ • calc                    
// > │ • define                  
// > │ • dictionary              
// > │ • wiki                    
// > │ • news                    
// > │ • weather                 
// > │ • covid                   
// > │ • stock                   
// > │ • currency               
// > ├───────────────
// > │ 🔗 *CONVERSION & MEDIA* 📁 
// > ├───────────────
// > │ • translate               
// > │ • convert                 
// > │ • shorturl                
// > │ • expandurl               
// > │ • qrencode                
// > │ • qrdecode                
// > │ • reverseimage            
// > │ • tomp3                   
// > │ • tovideo                 
// > │ • tosticker               
// > ├───────────────
// > │ 📝 *PERSONAL TOOLS* 📅    
// > ├───────────────
// > │ • reminder                
// > │ • todo                   
// > └───────────────
// > 
// > ├────────────────
// > │ 🎵 *MUSIC & FUN* 🎶
// > ├────────────────
// > │ • play
// > 
// > 
// > ┌───────────────
// > │ 🤖 *MEDIA & AI COMMANDS* 🧠 
// > ├───────────────
// > │ ⬇️ *MEDIA DOWNLOADS* 📥     
// > ├───────────────
// > │ • ytdl                    
// > │ • spotifydl               
// > │ • tiktokdl                
// > │ • instadl                 
// > │ • twitterdl               
// > │ • mediafire               
// > ├───────────────
// > │ 🎨 *AI GENERATION* 💡    
// > ├───────────────
// > │ • gemini                  
// > │ • gpt                     
// > │ • deepseek                
// > │ • chat                    
// > │ • summary                 
// > │ • imagine                 
// > │ • dalle                   
// > └───────────────
// > 
// > ┌───────────────
// > │ 🛡️ *SECURITY & HACKING* 🔒 
// > ├───────────────
// > │ 🌐 *NETWORK & INFO* 📡   
// > ├───────────────
// > │ • ipinfo              
// > │ • whois               
// > │ • dnslookup          
// > │ • host               
// > │ • reverseip           
// > │ • ssllabs             
// > │ • shodan              
// > ├────────────────
// > │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
// > ├────────────────
// > │ • pwcheck             
// > │ • breach              
// > │ • portscan            
// > │ • httpheaders         
// > │ • subdomains          
// > │ • encode              
// > │ • decode              
// > │ • consent             
// > │ • scan-now            
// > │ • scan-status         
// > │ • security-tips       
// > └────────────────
// > 
// > 🐺🌕*POWERED BY WOLF TECH*🌕🐺
// `;

//           await sock.sendMessage(jid, { image: buffer, caption: infoCaption + commandsText, mimetype: "image/jpeg" }, { quoted: m });
//           break;
//         }


//         default:
//           await sock.sendMessage(jid, { text: "❌ Unknown menu style. Reverting to default (Style 1)." }, { quoted: m });
//           break;
//       }

//       console.log("✅ Menu sent successfully");

//     } catch (err) {
//       console.error("❌ [MENU] ERROR:", err);
//       await sock.sendMessage(jid, { text: "⚠ Failed to load menu." }, { quoted: m });
//     }
//   },
// };













import os from "os";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { getCurrentMenuStyle } from "./menustyle.js";
import { setLastMenu, getAllFieldsStatus } from "../menus/menuToggles.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "menu",
  description: "Shows the Wolf Command Center in various styles",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const style = getCurrentMenuStyle();
    
    // Set the last used menu for toggle commands
    setLastMenu(style);

    console.log(`\n🐺 [MENU] Command received from: ${jid} | Using style: ${style}`);

    try {
      switch (style) {
        case 1: {
          //... existing style 1 code (no info by default) ...


          const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
          const imgPath2 = path.join(__dirname, "../media", "wolfbot.jpg");
          const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;

          if (!imagePath) {
            await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
            return;
          }

          const buffer = fs.readFileSync(imagePath);
          const caption = `*🐺🌕 *WOLF BOT* 🌕🐺*
┌────────────────
│ 🏠 GROUP MANAGEMENT 🏠 
├────────────────
│ 🛡️ ADMIN & MODERATION 🛡️ 
├────────────────
│ add                     
│ promote                 
│ demote                  
│ kick                    
│ ban                     
│ unban                   
│ banlist                 
│ clearbanlist            
│ warn                    
│ mute                    
│ unmute                  
│ gctime                  
├────────────────
│ 🚫 AUTO-MODERATION 🚫   
├────────────────
│ antisticker            
├────────────────
│ 📊 GROUP INFO & TOOLS 📊 
├────────────────
│ groupinfo               
│ tagadmin                
│ tagall                  
│ hidetag                 
│ link                    
│ invite                  
│ revoke                  
│ setdesc                 
│ fangtrace               
│ disp                    
│ kickall                 
│ getgpp                  
│ vcf                     
└────────────────

┌────────────────
│ 👑 OWNER CONTROLS 👑    
├────────────────
│ ⚡ CORE MANAGEMENT ⚡    
├────────────────
│ setprefix               
│ block                   
│ unblock                 
│ silent                  
│ setownername            
│ setpp                   
├────────────────
│ 🔄 SYSTEM & MAINTENANCE 🛠️ 
├────────────────
│ restart                 
│ autotype                
└────────────────

┌────────────────
│ ✨ GENERAL UTILITIES ✨  
├────────────────
│ 🔍 INFO & SEARCH 🔎     
├────────────────
│ ping                    
│ time                    
│ uptime                  
│ about                   
│ repo                    
│ alive                   
│ define                  
│ wiki                    
│ news                    
│ weather                 
│ covid                   
│ quote                   
├───────────────
│ 🔗 CONVERSION & MEDIA 📁 
├───────────────
│ translate               
│ shorturl                
│ qrencode                
│ qrdecode                
│ reverseimage            
│ toaudio                 
│ tovoice                 
│ save                    
├───────────────
│ 📝 PERSONAL TOOLS 📅    
├───────────────
│ goodmorning             
│ goodnight               
└───────────────

├────────────────
│ 🎵 MUSIC & FUN 🎶
├────────────────
│ play                    
│ song                    
│ bassboost               
│ trebleboost             
└────────────────

┌───────────────
│ 🤖 MEDIA & AI COMMANDS 🧠 
├───────────────
│ ⬇️ MEDIA DOWNLOADS 📥     
├───────────────
│ tiktokdl                
├───────────────
│ 🎨 AI GENERATION 💡    
├───────────────
│ gemini                  
│ gpt                     
│ deepseek                
│ wolfbot                 
└───────────────

┌───────────────
│ 🛡️ SECURITY & HACKING 🔒 
├───────────────
│ 🌐 NETWORK & INFO 📡   
├───────────────
│ ipinfo                  
│ shodan                  
│ iplookup                
│ getip                   
└───────────────

🐺🌕 POWERED BY WOLF TECH 🌕🐺
*`; // Use your full command list here

          await sock.sendMessage(jid, { image: buffer, caption, mimetype: "image/jpeg" }, { quoted: m });


          break;
        }

        case 2: {
          // ... existing style 2 code (no info by default) ...

          
          // 📝 Text Only
          const text = `🐺🌕 *WOLF BOT* 🌕🐺
────────────────
> 🏠 *GROUP MANAGEMENT* — manage members & group
> • add — add user
> • promote — make admin
> • demote — remove admin
> • kick — remove user
> • ban — ban user
> • unban — unban user
> • banlist — show banned
> • clearbanlist — clear bans
> • warn — warn user
> • unwarn — remove warning
> • clearwarns — reset warnings
> • mute — mute user
> • unmute — unmute user
> • gctime — group time settings
> • lock — lock group
> • unlock — unlock group

> 🚫 *AUTO-MODERATION* — auto-protect group
> • antilink — block links
> • antisticker — block stickers
> • antiimage — block images
> • antivideo — block videos

> 📊 *GROUP INFO & TOOLS* — group info commands
> • groupinfo — show info
> • tagadmin — mention admins
> • tagall — mention all
> • hidetag — hide mentions
> • link — show group link
> • invite — generate invite
> • revoke — revoke link
> • setname — change name
> • setdesc — change description
> • setgcpp — change group picture
> • welcome — set welcome message
> • goodbye — set goodbye message
> • fangtrace — trace user
> • disp — display group stats

> 👑 *OWNER CONTROLS* — bot owner commands
> • setprefix — change prefix
> • setantilink — toggle antilink
> • block — block user
> • unblock — unblock user
> • silent — silent mode
> • default — reset settings
> • runcode — run code

> 🔄 *SYSTEM & MAINTENANCE* — bot maintenance
> • restart — restart bot
> • update — update bot
> • gcrestart — restart group
> • backup — backup data
> • restore — restore data
> • cleardb — clear database
> • cleartemp — clear temp files

> ✨ *GENERAL UTILITIES* — info & conversions
> • ping — bot ping
> • time — current time
> • calc — calculator
> • define — word definition
> • dictionary — word lookup
> • wiki — search wiki
> • news — latest news
> • weather — weather info
> • covid — covid stats
> • stock — stock info
> • currency — convert currency
> • translate — translate text
> • convert — convert formats
> • shorturl — shorten URL
> • expandurl — expand URL
> • qrencode — QR encode
> • qrdecode — QR decode
> • reverseimage — reverse image search
> • tomp3 — video to mp3
> • tovideo — convert to video
> • tosticker — convert to sticker
> • reminder — set reminder
> • todo — add todo

> 🎵 *MUSIC & FUN* — entertainment
> • play — play music

> 🤖 *MEDIA & AI* — media & AI tools
> • ytdl — download YouTube
> • spotifydl — download Spotify
> • tiktokdl — download TikTok
> • instadl — download Instagram
> • twitterdl — download Twitter
> • mediafire — download Mediafire
> • gemini — AI chat
> • gpt — AI chat
> • deepseek — AI search
> • chat — AI conversation
> • summary — text summary
> • imagine — generate images
> • dalle — generate images

> 🛡️ *SECURITY & HACKING* — network & scans
> • ipinfo — IP info
> • whois — domain info
> • dnslookup — DNS lookup
> • host — host info
> • reverseip — reverse IP lookup
> • ssllabs — SSL check
> • shodan — scan device
> • pwcheck — password check
> • breach — check breach
> • portscan — scan ports
> • httpheaders — fetch headers
> • subdomains — list subdomains
> • encode — encode text
> • decode — decode text
> • consent — consent check
> • scan-now — run full scan
> • scan-status — scan status
> • security-tips — show tips

> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`; 
          await sock.sendMessage(jid, { text }, { quoted: m });
          break;
        }

        case 3: {
          // ... existing style 3 code (no info by default) ...
          break;
        }

        case 4: {
          // ... existing style 4 code (no info by default) ...
          break;
        }

        case 5: {
          // 📝 Full info + commands (with individual toggles)
          let finalText = "";
          
          // Add info section only if any field is enabled
          const fieldsStatus = getAllFieldsStatus(style);
          if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
            const start = performance.now();
            const uptime = process.uptime();
            const h = Math.floor(uptime / 3600);
            const mnt = Math.floor((uptime % 3600) / 60);
            const s = Math.floor(uptime % 60);
            const uptimeStr = `${h}h ${mnt}m ${s}s`;
            const speed = (performance.now() - start).toFixed(2);
            const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
            const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
            const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
            const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

            const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
            const host = process.env.REPL_ID
              ? "Replit"
              : process.env.HEROKU_APP_NAME
              ? "Heroku"
              : process.env.RENDER
              ? "Render"
              : "Panel";
            const prefix = global.prefix || ".";
            const version = global.version || "v2.6.2";

            const infoLines = [];
            if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
            if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
            if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${global.mode || "private"}`);
            if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
            if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
            if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
            if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
            if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
            if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
            if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

            if (infoLines.length > 0) {
              const infoText = `> ────────────────\n${infoLines.join('\n')}\n> └────────────────\n`;
              finalText += infoText;
            }
          }

          const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
> ┌────────────────
> │ 🏠 *GROUP MANAGEMENT* 🏠 
> ├────────────────
> │ 🛡️ *ADMIN & MODERATION* 🛡️ 
> ├────────────────
> │ • add                     
> │ • promote                 
> │ • demote                  
> │ • kick                    
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • unwarn                  
> │ • clearwarns              
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • lock                    
> │ • unlock                  
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antilink               
> │ • antisticker            
> │ • antiimage              
> │ • antivideo             
> ├────────────────
> │ 📊 *GROUP INFO & TOOLS* 📊 
> ├────────────────
> │ • groupinfo               
> │ • tagadmin                
> │ • tagall                  
> │ • hidetag                 
> │ • link                    
> │ • invite                  
> │ • revoke                  
> │ • setname                 
> │ • setdesc                 
> │ • setgcpp                 
> │ • welcome                 
> │ • goodbye                 
> │ • fangtrace               
> │ • disp                    
> └────────────────
> 
> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setprefix               
> │ • setantilink             
> │ • block                   
> │ • unblock                 
> │ • silent                  
> │ • default                 
> │ • runcode                 
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • update                  
> │ • gcrestart               
> │ • backup                  
> │ • restore                 
> │ • cleardb                 
> │ • cleartemp               
> └────────────────
> 
> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨  
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎     
> ├────────────────
> │ • ping                    
> │ • time                    
> │ • calc                    
> │ • define                  
> │ • dictionary              
> │ • wiki                    
> │ • news                    
> │ • weather                 
> │ • covid                   
> │ • stock                   
> │ • currency               
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁 
> ├───────────────
> │ • translate               
> │ • convert                 
> │ • shorturl                
> │ • expandurl               
> │ • qrencode                
> │ • qrdecode                
> │ • reverseimage            
> │ • tomp3                   
> │ • tovideo                 
> │ • tosticker               
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅    
> ├───────────────
> │ • reminder                
> │ • todo                   
> └───────────────
> 
> ├────────────────
> │ 🎵 *MUSIC & FUN* 🎶
> ├────────────────
> │ • play
> 
> 
> ┌───────────────
> │ 🤖 *MEDIA & AI COMMANDS* 🧠 
> ├───────────────
> │ ⬇️ *MEDIA DOWNLOADS* 📥     
> ├───────────────
> │ • ytdl                    
> │ • spotifydl               
> │ • tiktokdl                
> │ • instadl                 
> │ • twitterdl               
> │ • mediafire               
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gemini                  
> │ • gpt                     
> │ • deepseek                
> │ • chat                    
> │ • summary                 
> │ • imagine                 
> │ • dalle                   
> └───────────────
> 
> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo              
> │ • whois               
> │ • dnslookup          
> │ • host               
> │ • reverseip           
> │ • ssllabs             
> │ • shodan              
> ├────────────────
> │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
> ├────────────────
> │ • pwcheck             
> │ • breach              
> │ • portscan            
> │ • httpheaders         
> │ • subdomains          
> │ • encode              
> │ • decode              
> │ • consent             
> │ • scan-now            
> │ • scan-status         
> │ • security-tips       
> └────────────────
> 
> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`;

          finalText += commandsText;
          await sock.sendMessage(jid, { text: finalText }, { quoted: m });
          break;
        }

        case 6: {
          // 🖼️ Full info + image + commands (with individual toggles)
          let finalCaption = "";
          
          // Add info section only if any field is enabled
          const fieldsStatus = getAllFieldsStatus(style);
          if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
            const start = performance.now();
            const uptime = process.uptime();
            const h = Math.floor(uptime / 3600);
            const mnt = Math.floor((uptime % 3600) / 60);
            const s = Math.floor(uptime % 60);
            const uptimeStr = `${h}h ${mnt}m ${s}s`;
            const speed = (performance.now() - start).toFixed(2);
            const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
            const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
            const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
            const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

            const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
            const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
            const prefix = global.prefix || ".";
            const version = global.version || "v2.6.2";

            const infoLines = [];
            if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
            if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
            if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${global.mode || "private"}`);
            if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
            if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
            if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
            if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
            if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
            if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
            if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

            if (infoLines.length > 0) {
              const infoCaption = `────────────────\n${infoLines.join('\n')}\n└────────────────\n`;
              finalCaption += infoCaption;
            }
          }

          const commandsText = `> *🐺🌕 *WOLF BOT* 🌕🐺*
> ┌────────────────
> │ 🏠 *GROUP MANAGEMENT* 🏠 
> ├────────────────
> │ 🛡️ *ADMIN & MODERATION* 🛡️ 
> ├────────────────
> │ • add                     
> │ • promote                 
> │ • demote                  
> │ • kick                    
> │ • ban                     
> │ • unban                   
> │ • banlist                 
> │ • clearbanlist            
> │ • warn                    
> │ • unwarn                  
> │ • clearwarns              
> │ • mute                    
> │ • unmute                  
> │ • gctime                  
> │ • lock                    
> │ • unlock                  
> ├────────────────
> │ 🚫 *AUTO-MODERATION* 🚫   
> ├────────────────
> │ • antilink               
> │ • antisticker            
> │ • antiimage              
> │ • antivideo             
> ├────────────────
> │ 📊 *GROUP INFO & TOOLS* 📊 
> ├────────────────
> │ • groupinfo               
> │ • tagadmin                
> │ • tagall                  
> │ • hidetag                 
> │ • link                    
> │ • invite                  
> │ • revoke                  
> │ • setname                 
> │ • setdesc                 
> │ • setgcpp                 
> │ • welcome                 
> │ • goodbye                 
> │ • fangtrace               
> │ • disp                    
> └────────────────

> ┌────────────────
> │ 👑 *OWNER CONTROLS* 👑    
> ├────────────────
> │ ⚡ *CORE MANAGEMENT* ⚡    
> ├────────────────
> │ • setprefix               
> │ • setantilink             
> │ • block                   
> │ • unblock                 
> │ • silent                  
> │ • default                 
> │ • runcode                 
> ├────────────────
> │ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
> ├────────────────
> │ • restart                 
> │ • update                  
> │ • gcrestart               
> │ • backup                  
> │ • restore                 
> │ • cleardb                 
> │ • cleartemp               
> └────────────────

> ┌────────────────
> │ ✨ *GENERAL UTILITIES* ✨  
> ├────────────────
> │ 🔍 *INFO & SEARCH* 🔎     
> ├────────────────
> │ • ping                    
> │ • time                    
> │ • calc                    
> │ • define                  
> │ • dictionary              
> │ • wiki                    
> │ • news                    
> │ • weather                 
> │ • covid                   
> │ • stock                   
> │ • currency               
> ├───────────────
> │ 🔗 *CONVERSION & MEDIA* 📁 
> ├───────────────
> │ • translate               
> │ • convert                 
> │ • shorturl                
> │ • expandurl               
> │ • qrencode                
> │ • qrdecode                
> │ • reverseimage            
> │ • tomp3                   
> │ • tovideo                 
> │ • tosticker               
> ├───────────────
> │ 📝 *PERSONAL TOOLS* 📅    
> ├───────────────
> │ • reminder                
> │ • todo                   
> └───────────────
> 
> ├────────────────
> │ 🎵 *MUSIC & FUN* 🎶
> ├────────────────
> │ • play


> ┌───────────────
> │ 🤖 *MEDIA & AI COMMANDS* 🧠 
> ├───────────────
> │ ⬇️ *MEDIA DOWNLOADS* 📥     
> ├───────────────
> │ • ytdl                    
> │ • spotifydl               
> │ • tiktokdl                
> │ • instadl                 
> │ • twitterdl               
> │ • mediafire               
> ├───────────────
> │ 🎨 *AI GENERATION* 💡    
> ├───────────────
> │ • gemini                  
> │ • gpt                     
> │ • deepseek                
> │ • chat                    
> │ • summary                 
> │ • imagine                 
> │ • dalle                   
> └───────────────

> ┌───────────────
> │ 🛡️ *SECURITY & HACKING* 🔒 
> ├───────────────
> │ 🌐 *NETWORK & INFO* 📡   
> ├───────────────
> │ • ipinfo              
> │ • whois               
> │ • dnslookup          
> │ • host               
> │ • reverseip           
> │ • ssllabs             
> │ • shodan              
> ├────────────────
> │ 🔑 *VULNERABILITY & SCAN* ⚙️ 
> ├────────────────
> │ • pwcheck             
> │ • breach              
> │ • portscan            
> │ • httpheaders         
> │ • subdomains          
> │ • encode              
> │ • decode              
> │ • consent             
> │ • scan-now            
> │ • scan-status         
> │ • security-tips       
> └────────────────

> 🐺🌕*POWERED BY WOLF TECH*🌕🐺
`;

          finalCaption += commandsText;

          const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
          const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
          const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
          if (!imagePath) {
            await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
            return;
          }
          const buffer = fs.readFileSync(imagePath);

          await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
          break;
        }

        case 7: {
          // Similar to case 6 - apply the same individual toggle logic
          // ... (same pattern as case 6)
          
          // 🖼️ Full info + image + commands (with individual toggles)
          let finalCaption = "";
          
          // Add info section only if any field is enabled
          const fieldsStatus = getAllFieldsStatus(style);
          if (fieldsStatus && Object.values(fieldsStatus).some(val => val)) {
            const start = performance.now();
            const uptime = process.uptime();
            const h = Math.floor(uptime / 3600);
            const mnt = Math.floor((uptime % 3600) / 60);
            const s = Math.floor(uptime % 60);
            const uptimeStr = `${h}h ${mnt}m ${s}s`;
            const speed = (performance.now() - start).toFixed(2);
            const usedMem = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);
            const totalMem = (os.totalmem() / 1024 / 1024 / 1024).toFixed(0);
            const memPercent = Math.min(((usedMem / (totalMem * 1024)) * 100).toFixed(0), 100);
            const memBar = "█".repeat(Math.floor(memPercent / 10)) + "░".repeat(10 - Math.floor(memPercent / 10));

            const ownerNumber = global.owner || process.env.OWNER_NUMBER || "Unknown";
            const host = process.env.REPL_ID ? "Replit" : process.env.HEROKU_APP_NAME ? "Heroku" : process.env.RENDER ? "Render" : "Panel";
            const prefix = global.prefix || ".";
            const version = global.version || "v2.6.2";

            const infoLines = [];
            if (fieldsStatus.user) infoLines.push(`┃ User: ${m.pushName || "Anonymous"}`);
            if (fieldsStatus.owner) infoLines.push(`┃ Owner: ${ownerNumber}`);
            if (fieldsStatus.mode) infoLines.push(`┃ Mode: ${global.mode || "private"}`);
            if (fieldsStatus.host) infoLines.push(`┃ Host: ${host}`);
            if (fieldsStatus.speed) infoLines.push(`┃ Speed: ${speed} ms`);
            if (fieldsStatus.prefix) infoLines.push(`┃ Prefix: [ ${prefix} ]`);
            if (fieldsStatus.uptime) infoLines.push(`┃ Uptime: ${uptimeStr}`);
            if (fieldsStatus.version) infoLines.push(`┃ Version: ${version}`);
            if (fieldsStatus.usage) infoLines.push(`┃ Usage: ${usedMem} MB of ${totalMem} GB`);
            if (fieldsStatus.ram) infoLines.push(`┃ RAM: ${memBar} ${memPercent}%`);

            if (infoLines.length > 0) {
              const infoCaption = `────────────────\n${infoLines.join('\n')}\n└────────────────\n`;
              finalCaption += infoCaption;
            }
          }

          const commandsText = `┌────────────────
│ 🏠 GROUP MANAGEMENT 🏠 
├────────────────
│ 🛡️ ADMIN & MODERATION 🛡️ 
├────────────────
│ add                     
│ promote                 
│ demote                  
│ kick                    
│ ban                     
│ unban                   
│ banlist                 
│ clearbanlist            
│ warn                    
│ mute                    
│ unmute                  
│ gctime                  
├────────────────
│ 🚫 AUTO-MODERATION 🚫   
├────────────────
│ antisticker            
├────────────────
│ 📊 GROUP INFO & TOOLS 📊 
├────────────────
│ groupinfo               
│ tagadmin                
│ tagall                  
│ hidetag                 
│ link                    
│ invite                  
│ revoke                  
│ setdesc                 
│ fangtrace               
│ disp                    
│ kickall                 
│ getgpp                  
│ vcf                     
└────────────────

┌────────────────
│ 👑 OWNER CONTROLS 👑    
├────────────────
│ ⚡ CORE MANAGEMENT ⚡    
├────────────────
│ setprefix               
│ block                   
│ unblock                 
│ silent                  
│ setownername            
│ setpp                   
├────────────────
│ 🔄 SYSTEM & MAINTENANCE 🛠️ 
├────────────────
│ restart                 
│ autotype                
└────────────────

┌────────────────
│ ✨ GENERAL UTILITIES ✨  
├────────────────
│ 🔍 INFO & SEARCH 🔎     
├────────────────
│ ping                    
│ time                    
│ uptime                  
│ about                   
│ repo                    
│ alive                   
│ define                  
│ wiki                    
│ news                    
│ weather                 
│ covid                   
│ quote                   
├───────────────
│ 🔗 CONVERSION & MEDIA 📁 
├───────────────
│ translate               
│ shorturl                
│ qrencode                
│ qrdecode                
│ reverseimage            
│ toaudio                 
│ tovoice                 
│ save                    
├───────────────
│ 📝 PERSONAL TOOLS 📅    
├───────────────
│ goodmorning             
│ goodnight               
└───────────────

├────────────────
│ 🎵 MUSIC & FUN 🎶
├────────────────
│ play                    
│ song                    
│ bassboost               
│ trebleboost             
└────────────────

┌───────────────
│ 🤖 MEDIA & AI COMMANDS 🧠 
├───────────────
│ ⬇️ MEDIA DOWNLOADS 📥     
├───────────────
│ tiktokdl                
├───────────────
│ 🎨 AI GENERATION 💡    
├───────────────
│ gemini                  
│ gpt                     
│ deepseek                
│ wolfbot                 
└───────────────

┌───────────────
│ 🛡️ SECURITY & HACKING 🔒 
├───────────────
│ 🌐 NETWORK & INFO 📡   
├───────────────
│ ipinfo                  
│ shodan                  
│ iplookup                
│ getip                   
└───────────────

┌────────────────
│ 🎨 LOGO DESIGN STUDIO 🎨
├────────────────
│ 🌟 PREMIUM METALS 🌟    
├────────────────
│ goldlogo                
│ silverlogo              
│ platinumlogo            
│ chromelogo              
│ diamondlogo             
│ bronzelogo              
│ steelogo                
│ copperlogo              
│ titaniumlogo            
├────────────────
│ 🔥 ELEMENTAL EFFECTS 🔥  
├────────────────
│ firelogo                
│ icelogo                 
│ iceglowlogo             
│ lightninglogo           
│ aqualogo                
│ rainbowlogo             
│ sunlogo                 
│ moonlogo                
│ volcanologo             
│ thunderlogo             
│ windlogo                
│ earthlogo               
│ waterlogo               
│ forestlogo              
├────────────────
│ 🎭 MYTHICAL & MAGICAL 🧙  
├────────────────
│ dragonlogo              
│ phoenixlogo             
│ wizardlogo              
│ crystallogo             
│ magiclogo               
│ darkmagiclogo           
├────────────────
│ 🌌 DARK & GOTHIC 🌑     
├────────────────
│ shadowlogo              
│ smokelogo               
│ bloodlogo               
│ shadowflamelogo         
│ venomlogo               
│ skullogo                
│ nightlogo               
│ hellfirelogo            
├────────────────
│ 💫 GLOW & NEON EFFECTS 🌈  
├────────────────
│ neonlogo                
│ glowlogo                
│ lightlogo               
│ neonflamelogo           
├────────────────
│ 🤖 TECH & FUTURISTIC 🚀  
├────────────────
│ cyberlogo               
│ matrixlogo              
│ techlogo                
│ hologramlogo            
│ vaporlogo               
│ pixelogo                
│ futuristiclogo          
│ digitalogo              
├────────────────
│ 🎪 ART & POP CULTURE 🎭  
├────────────────
│ cartoonlogo             
│ comiclogo               
│ graffitilogo            
│ retrologo               
│ popartlogo              
└────────────────

🐺🌕 POWERED BY WOLF TECH 🌕🐺
`;

          finalCaption += commandsText;

          const imgPath1 = path.join(__dirname, "media", "wolfbot.jpg");
          const imgPath2 = path.join(__dirname, "../media/wolfbot.jpg");
          const imagePath = fs.existsSync(imgPath1) ? imgPath1 : fs.existsSync(imgPath2) ? imgPath2 : null;
          if (!imagePath) {
            await sock.sendMessage(jid, { text: "⚠️ Image 'wolfbot.jpg' not found!" }, { quoted: m });
            return;
          }
          const buffer = fs.readFileSync(imagePath);

          await sock.sendMessage(jid, { image: buffer, caption: finalCaption, mimetype: "image/jpeg" }, { quoted: m });
          break;
        }

        default:
          await sock.sendMessage(jid, { text: "❌ Unknown menu style. Reverting to default (Style 1)." }, { quoted: m });
          break;
      }

      console.log("✅ Menu sent successfully");

    } catch (err) {
      console.error("❌ [MENU] ERROR:", err);
      await sock.sendMessage(jid, { text: "⚠ Failed to load menu." }, { quoted: m });
    }
  },
};