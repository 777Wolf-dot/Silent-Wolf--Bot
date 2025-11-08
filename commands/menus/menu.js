// // // import settingMenu from './settingMenu.js';
// // // import fs from 'fs';
// // // import path from 'path';
// // // import { fileURLToPath } from 'url';

// // // const __filename = fileURLToPath(import.meta.url);
// // // const __dirname = path.dirname(__filename);

// // // export default {
// // //   name: 'menu',
// // //   description: 'Displays the command menu',
// // //   async execute(sock, message, args, prefix) {
// // //     try {
// // //       const jid = message.key.remoteJid;
// // //       console.log("🐺 Menu command triggered by:", jid);

// // //       // 🕐 Step 1: Send loading message
// // //       await sock.sendMessage(jid, { text: '🕐 Summoning the *Wolf Command Center*... 🌕🐺' });

// // //       // 🖼️ Step 2: Locate the image file
// // //       const imagePath = path.join(__dirname, '../media/_wolfbo.png');
// // //       console.log("📁 Image path:", imagePath);

// // //       // Step 3: Check if image exists
// // //       if (!fs.existsSync(imagePath)) {
// // //         console.error("❌ Image not found at:", imagePath);
// // //         await sock.sendMessage(jid, { text: '⚠️ Could not find the wolf image at ' + imagePath });
// // //         return;
// // //       }

// // //       // Step 4: Read the image as a buffer
// // //       const imageBuffer = fs.readFileSync(imagePath);
// // //       console.log("✅ Image buffer loaded:", imageBuffer.length, "bytes");

// // //       // Step 5: Send the image with menu caption
// // //       await sock.sendMessage(
// // //         jid,
// // //         {
// // //           image: imageBuffer,
// // //           caption: settingMenu(prefix),
// // //           mimetype: 'image/png',
// // //         }
// // //       );

// // //       console.log("✅ Image with menu sent successfully!");

// // //     } catch (error) {
// // //       console.error("❌ Error sending menu:", error);
// // //       await sock.sendMessage(message.key.remoteJid, {
// // //         text: '❌ Error showing the Wolf Command Center. Check logs.',
// // //       });
// // //     }
// // //   },
// // // };















// // import fs from "fs";
// // import path from "path";

// // const menu = async (sock, m) => {
// //   try {
// //     // ✅ Automatically resolve absolute path to your image
// //     const __dirname = path.resolve();
// //     const imagePath = path.join(__dirname, "commands", "media", "wolfmenu.jpg");

// //     if (!fs.existsSync(imagePath)) {
// //       await sock.sendMessage(m.chat, {
// //         text: `⚠ Menu image not found at:\n${imagePath}`,
// //       });
// //       return;
// //     }

// //     const menuImage = fs.readFileSync(imagePath);

// //     const caption = `
// // 🐺🌕 *SILENT WOLF MENU* 🌕🐺

// // ┌───────────────
// // │ ⚔️ *GROUP COMMANDS*
// // ├───────────────
// // │ 🐺 .kick
// // │ 🐺 .add
// // │ 🐺 .promote
// // │ 🐺 .demote
// // │ 🐺 .mute
// // │ 🐺 .unmute
// // │ 🐺 .link
// // └───────────────

// // 🧠 *AI FEATURES*
// // │ 🤖 .ask
// // │ 🖋️ .summarize
// // │ 🗣️ .tts
// // │ 🐺 .wolfai

// // 🎵 *AUDIO TOOLS*
// // │ 🎧 .bass
// // │ 🎶 .pitch
// // │ 🎙️ .slow
// // │ ⚡ .fast

// // 🌐 *MEDIA*
// // │ 📥 .ytmp3
// // │ 🎬 .ytmp4
// // │ 📸 .igdl
// // │ 🐦 .twitdl

// // 🐾 *More power, more silence...* 🌕
// //     `;

// //     await sock.sendMessage(m.chat, {
// //       image: menuImage,
// //       caption: caption.trim(),
// //     });
// //   } catch (err) {
// //     console.error("❌ Error sending menu:", err);
// //     await sock.sendMessage(m.chat, { text: "⚠ Failed to load menu." });
// //   }
// // };

// // export default menu;





import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "menu",
  description: "Shows the Wolf Command Center (image + caption)",
  async execute(sock, m) {
    const jid = m.key.remoteJid;

    console.log("\n🐺 [MENU] Command received from:", jid);

    try {
      // Step 1: Notify user
      await sock.sendMessage(jid, { text: "🕐 Summoning the *Wolf Command Center*... 🌕🐺" }, { quoted: m });
      console.log("✅ Step 1: Sent loading message");

      // Step 2: Try image paths
      const path1 = path.join(__dirname, "media", "wolfbot.jpg");
      const path2 = path.join(__dirname, "../media", "wolfbot.jpg");

      console.log("🔍 Checking paths:\n1️⃣", path1, "\n2️⃣", path2);

      let imagePath = fs.existsSync(path1) ? path1 : fs.existsSync(path2) ? path2 : null;

      if (!imagePath) {
        console.error("❌ Step 2: Image not found in both paths!");
        await sock.sendMessage(jid, { text: "⚠️ Image 'wolfmenu.jpg' not found in /commands/media/ or /media/." }, { quoted: m });
        return;
      }

      console.log("✅ Step 2: Found image at:", imagePath);

      // Step 3: Read image buffer
      const imageBuffer = fs.readFileSync(imagePath);
      console.log("✅ Step 3: Image loaded successfully (" + imageBuffer.length + " bytes)");

      // Step 4: Prepare caption
      const caption = `
🐺🌕 *WOLF BOT* 🌕🐺

┌────────────────
│ 🏠 *GROUP MANAGEMENT* 🏠 
├────────────────
│ 🛡️ *ADMIN & MODERATION* 🛡️ 
├────────────────
│ • add                     
│ • promote                 
│ • demote                  
│ • kick                    
│ • ban                     
│ • unban                   
│ • banlist                 
│ • clearbanlist            
│ • warn                    
│ • unwarn                  
│ • clearwarns              
│ • mute                    
│ • unmute                  
│ • gctime                  
│ • lock                    
│ • unlock                  
├────────────────
│ 🚫 *AUTO-MODERATION* 🚫   
├────────────────
│ • antilink                
│ • antisticker             
│ • antiimage               
│ • antivideo               
├────────────────
│ 📊 *GROUP INFO & TOOLS* 📊 
├────────────────
│ • groupinfo               
│ • tagadmin                
│ • tagall                  
│ • hidetag                 
│ • link                    
│ • invite                  
│ • revoke                  
│ • setname                 
│ • setdesc                 
│ • setgcpp                 
│ • welcome                 
│ • goodbye                 
│ • fangtrace               
│ • disp                    
└────────────────

┌────────────────
│ 👑 *OWNER CONTROLS* 👑    
├────────────────
│ ⚡ *CORE MANAGEMENT* ⚡    
├────────────────
│ • setprefix               
│ • setantilink             
│ • block                   
│ • unblock                 
│ • silent                  
│ • default                 
│ • runcode                 
├────────────────
│ 🔄 *SYSTEM & MAINTENANCE* 🛠️ 
├────────────────
│ • restart                 
│ • update                  
│ • gcrestart               
│ • backup                  
│ • restore                 
│ • cleardb                 
│ • cleartemp               
└────────────────

┌────────────────
│ ✨ *GENERAL UTILITIES* ✨  
├────────────────
│ 🔍 *INFO & SEARCH* 🔎     
├────────────────
│ • ping                    
│ • time                    
│ • calc                    
│ • define                  
│ • dictionary              
│ • wiki                    
│ • news                    
│ • weather                 
│ • covid                    
│ • stock                   
│ • currency                
├───────────────
│ 🔗 *CONVERSION & MEDIA* 📁 
├───────────────
│ • translate               
│ • convert                 
│ • shorturl                
│ • expandurl               
│ • qrencode                
│ • qrdecode                
│ • reverseimage            
│ • tomp3                   
│ • tovideo                 
│ • tosticker               
├───────────────
│ 📝 *PERSONAL TOOLS* 📅    
├───────────────
│ • reminder                
│ • todo                    
└───────────────

├────────────────
│ 🎵 *MUSIC & FUN* 🎶
├────────────────
│ • play



┌───────────────
│ 🤖 *MEDIA & AI COMMANDS* 🧠 
├───────────────
│ ⬇️ *MEDIA DOWNLOADS* 📥     
├───────────────
│ • ytdl                    
│ • spotifydl               
│ • tiktokdl                
│ • instadl                 
│ • twitterdl               
│ • mediafire               
├───────────────
│ 🎨 *AI GENERATION* 💡    
├───────────────
│ • gemini                  
│ • gpt                     
│ • deepseek                
│ • chat                    
│ • summary                 
│ • imagine                 
│ • dalle                   
└───────────────

┌───────────────
│ 🛡️ *SECURITY & HACKING* 🔒 
├───────────────
│ 🌐 *NETWORK & INFO* 📡   
├───────────────
│ • ipinfo              
│ • whois               
│ • dnslookup           
│ • host                
│ • reverseip           
│ • ssllabs             
│ • shodan              
├────────────────
│ 🔑 *VULNERABILITY & SCAN* ⚙️ 
├────────────────
│ • pwcheck             
│ • breach              
│ • portscan            
│ • httpheaders         
│ • subdomains          
│ • encode              
│ • decode              
│ • consent             
│ • scan-now            
│ • scan-status         
│ • security-tips       
└────────────────

🐺🌕*POWERED BY WOLF TECH*🌕🐺

`;

      console.log("✅ Step 4: Caption prepared");

      // Step 5: Send image with caption
      await sock.sendMessage(
        jid,
        {
          image: imageBuffer,
          caption,
          mimetype: "image/jpeg",
        },
        { quoted: m }
      );

      console.log("✅ Step 5: Menu sent successfully with image + caption");

    } catch (err) {
      console.error("❌ [MENU] ERROR CAUGHT:");
      console.error(err);
      await sock.sendMessage(
        m.key.remoteJid,
        { text: "⚠ Failed to load menu. Check console logs for details." },
        { quoted: m }
      );
    }
  },
};


