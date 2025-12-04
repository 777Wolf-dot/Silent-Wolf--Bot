// // // // ====== apk.js - APK Download Command ======
// // // // Save as: ./commands/downloads/apk.js

// // // import axios from 'axios';
// // // import cheerio from 'cheerio';
// // // import fs from 'fs';
// // // import path from 'path';
// // // import { exec } from 'child_process';
// // // import { promisify } from 'util';
// // // import { tmpdir } from 'os';

// // // const execAsync = promisify(exec);

// // // export default {
// // //     name: 'apk',
// // //     alias: ['app', 'downloadapk', 'apkdownload'],
// // //     description: 'Download APK files from trusted sources',
// // //     category: 'downloads',
// // //     usage: 'apk <app_name>',
// // //     example: 'apk facebook\napk termux\napk whatsapp',
    
// // //     async execute(sock, msg, args) {
// // //         const { remoteJid } = msg.key;
        
// // //         if (args.length === 0) {
// // //             return await sock.sendMessage(remoteJid, {
// // //                 text: `📱 *APK Downloader*\n\n*Usage:* .apk <app_name>\n\n*Examples:*\n• .apk facebook\n• .apk termux\n• .apk whatsapp\n• .apk instagram\n\n*Popular apps:* facebook, whatsapp, instagram, youtube, termux, spotify, tiktok, telegram`
// // //             }, { quoted: msg });
// // //         }
        
// // //         const appName = args.join(' ').toLowerCase();
// // //         const searchQuery = encodeURIComponent(`${appName} apk latest version`);
        
// // //         try {
// // //             // Send searching message
// // //             await sock.sendMessage(remoteJid, {
// // //                 text: `🔍 Searching for *${appName}* APK...\n⏳ Please wait...`
// // //             }, { quoted: msg });
            
// // //             // Get APK download links from reliable sources
// // //             const apkData = await searchAPK(appName);
            
// // //             if (!apkData || !apkData.downloadUrl) {
// // //                 return await sock.sendMessage(remoteJid, {
// // //                     text: `❌ Could not find *${appName}* APK.\n\nTry:\n• Check app name spelling\n• Try different keywords\n• Or visit: apkpure.com`
// // //                 }, { quoted: msg });
// // //             }
            
// // //             // Send APK information
// // //             const messageText = `📱 *${apkData.name || appName.toUpperCase()}*\n\n` +
// // //                                `📦 *Version:* ${apkData.version || 'Latest'}\n` +
// // //                                `📊 *Size:* ${apkData.size || 'Unknown'}\n` +
// // //                                `📅 *Updated:* ${apkData.updated || 'Recently'}\n` +
// // //                                `⭐ *Rating:* ${apkData.rating || '4.0+'}\n\n` +
// // //                                `🔗 *Download Link:*\n${apkData.downloadUrl}\n\n` +
// // //                                `📝 *How to install:*\n1. Download APK\n2. Allow "Install from unknown sources"\n3. Install & Enjoy!\n\n` +
// // //                                `⚠️ *Disclaimer:* Only download from trusted sources.`;
            
// // //             await sock.sendMessage(remoteJid, {
// // //                 text: messageText
// // //             }, { quoted: msg });
            
// // //             // Try to send direct APK file if small enough
// // //             if (apkData.directUrl && apkData.size && apkData.size.includes('MB')) {
// // //                 const sizeMB = parseInt(apkData.size);
// // //                 if (sizeMB < 50) { // Only for APKs under 50MB
// // //                     await sock.sendMessage(remoteJid, {
// // //                         text: `⬇️ Attempting to send APK file directly...\n⏳ This may take a moment...`
// // //                     });
                    
// // //                     try {
// // //                         await sendAPKFile(sock, remoteJid, apkData);
// // //                     } catch (fileError) {
// // //                         console.log('File send failed, link already provided');
// // //                     }
// // //                 }
// // //             }
            
// // //         } catch (error) {
// // //             console.error('APK command error:', error);
            
// // //             // Fallback to APKPure search
// // //             const apkpureUrl = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
            
// // //             await sock.sendMessage(remoteJid, {
// // //                 text: `⚠️ *Alternative Download Method*\n\nCould not fetch APK directly.\n\n🔍 Search on APKPure:\n${apkpureUrl}\n\n📱 Popular APK Sites:\n• apkpure.com\n• apkmirror.com\n• uptodown.com\n\n💡 *Tip:* Always download from trusted sources!`
// // //             }, { quoted: msg });
// // //         }
// // //     }
// // // };

// // // // Search for APK from reliable sources
// // // async function searchAPK(appName) {
// // //     try {
// // //         // Map common app names to their package names
// // //         const appMap = {
// // //             'facebook': 'com.facebook.katana',
// // //             'whatsapp': 'com.whatsapp',
// // //             'instagram': 'com.instagram.android',
// // //             'youtube': 'com.google.android.youtube',
// // //             'termux': 'com.termux',
// // //             'spotify': 'com.spotify.music',
// // //             'tiktok': 'com.zhiliaoapp.musically',
// // //             'telegram': 'org.telegram.messenger',
// // //             'twitter': 'com.twitter.android',
// // //             'snapchat': 'com.snapchat.android',
// // //             'messenger': 'com.facebook.orca',
// // //             'chrome': 'com.android.chrome',
// // //             'firefox': 'org.mozilla.firefox',
// // //             'gmail': 'com.google.android.gm',
// // //             'maps': 'com.google.android.apps.maps',
// // //             'drive': 'com.google.android.apps.docs',
// // //             'photos': 'com.google.android.apps.photos',
// // //             'netflix': 'com.netflix.mediaclient',
// // //             'amazon': 'com.amazon.mShop.android.shopping',
// // //             'paypal': 'com.paypal.android.p2pmobile',
// // //             'shazam': 'com.shazam.android',
// // //             'discord': 'com.discord',
// // //             'reddit': 'com.reddit.frontpage',
// // //             'pinterest': 'com.pinterest',
// // //             'zoom': 'us.zoom.videomeetings',
// // //             'signal': 'org.thoughtcrime.securesms',
// // //             'vsco': 'com.vsco.cam',
// // //             'pubg': 'com.tencent.ig',
// // //             'free fire': 'com.dts.freefireth',
// // //             'cod': 'com.activision.callofduty.shooter',
// // //             'mlbb': 'com.mobile.legends',
// // //             'clash of clans': 'com.supercell.clashofclans',
// // //             'clash royale': 'com.supercell.clashroyale',
// // //             'among us': 'com.innersloth.spacemafia',
// // //             'minecraft': 'com.mojang.minecraftpe',
// // //             'roblox': 'com.roblox.client',
// // //             'subway surfers': 'com.kiloo.subwaysurf',
// // //             'temple run': 'com.imangi.templerun',
// // //             'candy crush': 'com.king.candycrushsaga',
// // //             '8 ball pool': 'com.miniclip.eightballpool',
// // //             'ludo king': 'com.ludo.king',
// // //             'chess': 'com.chess',
// // //             'adobe': 'com.adobe.reader',
// // //             'vpn': 'com.expressvpn.vpn',
// // //             'office': 'com.microsoft.office.officehubrow',
// // //             'word': 'com.microsoft.office.word',
// // //             'excel': 'com.microsoft.office.excel',
// // //             'powerpoint': 'com.microsoft.office.powerpoint',
// // //             'pdf': 'com.adobe.reader',
// // //             'calculator': 'com.google.android.calculator',
// // //             'camera': 'com.google.android.GoogleCamera',
// // //             'gallery': 'com.google.android.apps.photos',
// // //             'music': 'com.google.android.apps.youtube.music',
// // //             'weather': 'com.google.android.apps.weather',
// // //             'clock': 'com.google.android.deskclock',
// // //             'calendar': 'com.google.android.calendar',
// // //             'contacts': 'com.google.android.contacts',
// // //             'dialer': 'com.google.android.dialer',
// // //             'messages': 'com.google.android.apps.messaging',
// // //             'files': 'com.google.android.apps.nbu.files',
// // //             'settings': 'com.android.settings',
// // //             'play store': 'com.android.vending',
// // //             'google': 'com.google.android.googlequicksearchbox',
// // //             'surebet': 'com.surebet', // Adding surebet as requested
// // //             'bet': 'com.bet',
// // //             'sportybet': 'com.sportybet',
// // //             '1xbet': 'com.xbet',
// // //             'betway': 'com.betway',
// // //             'betking': 'com.betking',
// // //             'bet9ja': 'com.bet9ja',
// // //             'nairabet': 'com.nairabet',
// // //             'merrybet': 'com.merrybet'
// // //         };
        
// // //         // Find package name
// // //         let packageName = appMap[appName];
// // //         if (!packageName) {
// // //             // Try to find similar
// // //             for (const [key, value] of Object.entries(appMap)) {
// // //                 if (appName.includes(key)) {
// // //                     packageName = value;
// // //                     break;
// // //                 }
// // //             }
// // //         }
        
// // //         if (!packageName) {
// // //             packageName = appName.toLowerCase().replace(/[^a-z0-9]/g, '');
// // //         }
        
// // //         // Try multiple sources
// // //         const sources = [
// // //             await searchAPKPure(packageName, appName),
// // //             await searchAPKMirror(packageName, appName),
// // //             await searchUptodown(packageName, appName)
// // //         ];
        
// // //         // Return the first valid result
// // //         for (const source of sources) {
// // //             if (source && source.downloadUrl) {
// // //                 return source;
// // //             }
// // //         }
        
// // //         // Fallback to APKPure search
// // //         return await searchAPKPure(packageName, appName, true);
        
// // //     } catch (error) {
// // //         console.error('APK search error:', error);
// // //         return null;
// // //     }
// // // }

// // // // Search APKPure
// // // async function searchAPKPure(packageName, appName, isSearch = false) {
// // //     try {
// // //         let url;
// // //         if (isSearch) {
// // //             url = `https://apkpure.com/search?q=${encodeURIComponent(appName)}`;
// // //             const response = await axios.get(url, {
// // //                 headers: {
// // //                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
// // //                 }
// // //             });
            
// // //             const $ = cheerio.load(response.data);
// // //             const firstResult = $('.search-title a').first();
// // //             if (firstResult.length) {
// // //                 const appUrl = 'https://apkpure.com' + firstResult.attr('href');
// // //                 return {
// // //                     name: firstResult.text().trim(),
// // //                     downloadUrl: appUrl + '/download?from=details',
// // //                     source: 'APKPure'
// // //                 };
// // //             }
// // //         } else {
// // //             url = `https://apkpure.com/${packageName}/${packageName}`;
// // //             const response = await axios.get(url, {
// // //                 headers: {
// // //                     'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
// // //                 }
// // //             });
            
// // //             if (response.data.includes('404 Not Found')) {
// // //                 return null;
// // //             }
            
// // //             const $ = cheerio.load(response.data);
// // //             const appNameText = $('.title-like h1').text().trim() || appName;
// // //             const version = $('.details-sdk span').first().text().trim();
// // //             const size = $('.details-sdk span').eq(1).text().trim();
// // //             const updated = $('.details-sdk span').eq(2).text().trim();
// // //             const rating = $('.rating-like .average').text().trim();
            
// // //             return {
// // //                 name: appNameText,
// // //                 version: version,
// // //                 size: size,
// // //                 updated: updated,
// // //                 rating: rating,
// // //                 downloadUrl: url + '/download?from=details',
// // //                 directUrl: `https://d.apkpure.com/b/APK/${packageName}?version=latest`,
// // //                 source: 'APKPure'
// // //             };
// // //         }
// // //     } catch (error) {
// // //         return null;
// // //     }
// // // }

// // // // Search APKMirror
// // // async function searchAPKMirror(packageName, appName) {
// // //     try {
// // //         const url = `https://www.apkmirror.com/?s=${encodeURIComponent(appName)}`;
// // //         const response = await axios.get(url, {
// // //             headers: {
// // //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
// // //             }
// // //         });
        
// // //         const $ = cheerio.load(response.data);
// // //         const firstResult = $('.appRow h5 a').first();
// // //         if (firstResult.length) {
// // //             const appUrl = 'https://www.apkmirror.com' + firstResult.attr('href');
// // //             return {
// // //                 name: firstResult.text().trim(),
// // //                 downloadUrl: appUrl,
// // //                 source: 'APKMirror'
// // //             };
// // //         }
// // //     } catch (error) {
// // //         return null;
// // //     }
// // // }

// // // // Search Uptodown
// // // async function searchUptodown(packageName, appName) {
// // //     try {
// // //         const url = `https://${appName}.en.uptodown.com/android`;
// // //         const response = await axios.get(url, {
// // //             headers: {
// // //                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
// // //             }
// // //         });
        
// // //         const $ = cheerio.load(response.data);
// // //         const downloadBtn = $('.button.download').first();
// // //         if (downloadBtn.length) {
// // //             const downloadUrl = downloadBtn.attr('href');
// // //             const version = $('.version').text().trim();
// // //             const size = $('.size').text().trim();
            
// // //             return {
// // //                 name: appName.charAt(0).toUpperCase() + appName.slice(1),
// // //                 version: version,
// // //                 size: size,
// // //                 downloadUrl: downloadUrl.startsWith('http') ? downloadUrl : 'https:' + downloadUrl,
// // //                 source: 'Uptodown'
// // //             };
// // //         }
// // //     } catch (error) {
// // //         return null;
// // //     }
// // // }

// // // // Send APK file directly
// // // async function sendAPKFile(sock, remoteJid, apkData) {
// // //     try {
// // //         // Create temp directory
// // //         const tempDir = path.join(tmpdir(), 'apk_download');
// // //         if (!fs.existsSync(tempDir)) {
// // //             fs.mkdirSync(tempDir, { recursive: true });
// // //         }
        
// // //         const apkPath = path.join(tempDir, `${apkData.name.replace(/[^a-z0-9]/gi, '_')}.apk`);
        
// // //         // Download APK using wget or curl
// // //         if (apkData.directUrl) {
// // //             try {
// // //                 await execAsync(`wget -O "${apkPath}" "${apkData.directUrl}"`);
// // //             } catch (wgetError) {
// // //                 // Try curl if wget fails
// // //                 await execAsync(`curl -L -o "${apkPath}" "${apkData.directUrl}"`);
// // //             }
            
// // //             // Check if file was downloaded
// // //             if (fs.existsSync(apkPath) && fs.statSync(apkPath).size > 0) {
// // //                 // Send as document
// // //                 await sock.sendMessage(remoteJid, {
// // //                     document: fs.readFileSync(apkPath),
// // //                     fileName: `${apkData.name}.apk`,
// // //                     mimetype: 'application/vnd.android.package-archive',
// // //                     caption: `📱 *${apkData.name}*\n📦 Version: ${apkData.version || 'Latest'}\n⚙️ Source: ${apkData.source}`
// // //                 });
                
// // //                 // Clean up
// // //                 fs.unlinkSync(apkPath);
// // //                 return true;
// // //             }
// // //         }
// // //     } catch (error) {
// // //         console.error('File send error:', error);
// // //         return false;
// // //     }
// // // }






















// // // ====== apk.js - SIMPLE WORKING VERSION ======
// // // Save as: ./commands/downloads/apk.js

// // export default {
// //     name: 'apk',
// //     alias: ['app', 'download', 'apkdownload'],
// //     description: 'Get APK download links from trusted sources',
// //     category: 'downloads',
// //     usage: 'apk <app_name>',
// //     example: 'apk facebook\napk termux\napk whatsapp',
    
// //     async execute(sock, msg, args) {
// //         const { remoteJid } = msg.key;
        
// //         if (args.length === 0) {
// //             return await sock.sendMessage(remoteJid, {
// //                 text: `📱 *APK DOWNLOADER*\n\n*Usage:* .apk <app_name>\n\n*Examples:*\n• .apk facebook\n• .apk termux\n• .apk whatsapp\n• .apk instagram\n• .apk youtube\n• .apk spotify\n\n💡 I'll provide safe download links from trusted sources.`
// //             }, { quoted: msg });
// //         }
        
// //         const appName = args.join(' ').toLowerCase().trim();
        
// //         // Send searching message
// //         await sock.sendMessage(remoteJid, {
// //             text: `🔍 *Searching for ${appName} APK...*\n⏳ Please wait...`
// //         }, { quoted: msg });
        
// //         // Get APK data
// //         const apkData = this.getAPKData(appName);
        
// //         if (!apkData) {
// //             // Generic search link
// //             const searchQuery = encodeURIComponent(`${appName} apk latest version`);
// //             const searchUrl = `https://apkpure.com/search?q=${searchQuery}`;
            
// //             return await sock.sendMessage(remoteJid, {
// //                 text: `❌ *${appName.toUpperCase()} APK*\n\nI couldn't find direct links for this app.\n\n🔍 *Search manually:*\n${searchUrl}\n\n📱 *Trusted APK Sites:*\n1. apkpure.com\n2. apkmirror.com\n3. uptodown.com\n4. f-droid.org (open source)\n\n⚠️ *Safety Tips:*\n• Check app permissions\n• Read user reviews\n• Scan with antivirus\n• Download from trusted sites only`
// //             }, { quoted: msg });
// //         }
        
// //         // Create response message
// //         let message = `📱 *${apkData.name}*\n`;
// //         if (apkData.package) message += `📦 Package: ${apkData.package}\n`;
// //         if (apkData.version) message += `🔄 Version: ${apkData.version}\n`;
// //         if (apkData.size) message += `📊 Size: ${apkData.size}\n`;
        
// //         message += `\n🔗 *Download Links:*\n`;
        
// //         if (apkData.apkpure) {
// //             message += `• APKPure: ${apkData.apkpure}\n`;
// //         }
        
// //         if (apkData.apkmirror) {
// //             message += `• APKMirror: ${apkData.apkmirror}\n`;
// //         }
        
// //         if (apkData.fdroid) {
// //             message += `• F-Droid: ${apkData.fdroid}\n`;
// //         }
        
// //         if (apkData.official) {
// //             message += `• Official: ${apkData.official}\n`;
// //         }
        
// //         message += `\n📲 *How to Install:*\n`;
// //         message += `1. Download APK from any link above\n`;
// //         message += `2. Go to Settings → Security\n`;
// //         message += `3. Enable "Unknown Sources"\n`;
// //         message += `4. Open downloaded file\n`;
// //         message += `5. Tap "Install"\n\n`;
        
// //         message += `⚠️ *Safety First:*\n`;
// //         message += `• Only download from trusted sources\n`;
// //         message += `• Check app permissions before installing\n`;
// //         message += `• Keep "Unknown Sources" disabled when not needed\n`;
        
// //         if (apkData.note) {
// //             message += `\n📝 *Note:* ${apkData.note}\n`;
// //         }
        
// //         // Send the message
// //         await sock.sendMessage(remoteJid, { text: message }, { quoted: msg });
        
// //         // Send installation guide separately
// //         setTimeout(async () => {
// //             await sock.sendMessage(remoteJid, {
// //                 text: `⚡ *Quick Installation Tips*\n\n1️⃣ *For New Users:*\n- Use APKPure app for easier downloads\n- It handles updates automatically\n\n2️⃣ *For Security:*\n- Install Malwarebytes to scan APKs\n- Read reviews before downloading\n\n3️⃣ *Troubleshooting:*\n- If app won't install: Clear storage\n- If crashes: Try older version\n- Check Android version compatibility`
// //             });
// //         }, 1500);
// //     },
    
// //     // Predefined APK data for common apps
// //     getAPKData(appName) {
// //         const apkDatabase = {
// //             // Social Media
// //             'facebook': {
// //                 name: 'Facebook',
// //                 package: 'com.facebook.katana',
// //                 version: 'Latest',
// //                 size: '~40MB',
// //                 apkpure: 'https://apkpure.com/facebook/com.facebook.katana',
// //                 apkmirror: 'https://www.apkmirror.com/apk/facebook-2/facebook/',
// //                 official: 'https://play.google.com/store/apps/details?id=com.facebook.katana'
// //             },
// //             'whatsapp': {
// //                 name: 'WhatsApp',
// //                 package: 'com.whatsapp',
// //                 version: 'Latest',
// //                 size: '~45MB',
// //                 apkpure: 'https://apkpure.com/whatsapp/com.whatsapp',
// //                 apkmirror: 'https://www.apkmirror.com/apk/whatsapp-inc/whatsapp/',
// //                 official: 'https://play.google.com/store/apps/details?id=com.whatsapp'
// //             },
// //             'instagram': {
// //                 name: 'Instagram',
// //                 package: 'com.instagram.android',
// //                 version: 'Latest',
// //                 size: '~50MB',
// //                 apkpure: 'https://apkpure.com/instagram/com.instagram.android',
// //                 apkmirror: 'https://www.apkmirror.com/apk/instagram/instagram-instagram/',
// //                 official: 'https://play.google.com/store/apps/details?id=com.instagram.android'
// //             },
// //             'messenger': {
// //                 name: 'Facebook Messenger',
// //                 package: 'com.facebook.orca',
// //                 version: 'Latest',
// //                 size: '~35MB',
// //                 apkpure: 'https://apkpure.com/messenger/com.facebook.orca',
// //                 apkmirror: 'https://www.apkmirror.com/apk/facebook-2/messenger/'
// //             },
            
// //             // Communication
// //             'telegram': {
// //                 name: 'Telegram',
// //                 package: 'org.telegram.messenger',
// //                 version: 'Latest',
// //                 size: '~45MB',
// //                 apkpure: 'https://apkpure.com/telegram/org.telegram.messenger',
// //                 official: 'https://telegram.org/dl/android/apk',
// //                 note: 'Official APK from Telegram website'
// //             },
// //             'signal': {
// //                 name: 'Signal',
// //                 package: 'org.thoughtcrime.securesms',
// //                 version: 'Latest',
// //                 size: '~30MB',
// //                 apkpure: 'https://apkpure.com/signal/org.thoughtcrime.securesms',
// //                 official: 'https://signal.org/android/apk/'
// //             },
            
// //             // Media & Entertainment
// //             'youtube': {
// //                 name: 'YouTube',
// //                 package: 'com.google.android.youtube',
// //                 version: 'Latest',
// //                 size: '~35MB',
// //                 apkpure: 'https://apkpure.com/youtube/com.google.android.youtube',
// //                 apkmirror: 'https://www.apkmirror.com/apk/google-inc/youtube/'
// //             },
// //             'spotify': {
// //                 name: 'Spotify',
// //                 package: 'com.spotify.music',
// //                 version: 'Latest',
// //                 size: '~55MB',
// //                 apkpure: 'https://apkpure.com/spotify/com.spotify.music',
// //                 apkmirror: 'https://www.apkmirror.com/apk/spotify-ltd/spotify/'
// //             },
// //             'tiktok': {
// //                 name: 'TikTok',
// //                 package: 'com.zhiliaoapp.musically',
// //                 version: 'Latest',
// //                 size: '~100MB',
// //                 apkpure: 'https://apkpure.com/tiktok/com.zhiliaoapp.musically',
// //                 apkmirror: 'https://www.apkmirror.com/apk/tiktok-pte-ltd/tik-tok/'
// //             },
// //             'netflix': {
// //                 name: 'Netflix',
// //                 package: 'com.netflix.mediaclient',
// //                 version: 'Latest',
// //                 size: '~25MB',
// //                 apkpure: 'https://apkpure.com/netflix/com.netflix.mediaclient',
// //                 apkmirror: 'https://www.apkmirror.com/apk/netflix-inc/netflix/'
// //             },
            
// //             // Tools & Utilities
// //             'termux': {
// //                 name: 'Termux',
// //                 package: 'com.termux',
// //                 version: 'Latest',
// //                 size: '~85MB',
// //                 fdroid: 'https://f-droid.org/repo/com.termux_118.apk',
// //                 github: 'https://github.com/termux/termux-app/releases',
// //                 note: 'Terminal emulator for Android'
// //             },
// //             'chrome': {
// //                 name: 'Google Chrome',
// //                 package: 'com.android.chrome',
// //                 version: 'Latest',
// //                 size: '~90MB',
// //                 apkpure: 'https://apkpure.com/chrome/com.android.chrome',
// //                 apkmirror: 'https://www.apkmirror.com/apk/google-inc/chrome/'
// //             },
// //             'firefox': {
// //                 name: 'Firefox Browser',
// //                 package: 'org.mozilla.firefox',
// //                 version: 'Latest',
// //                 size: '~70MB',
// //                 apkpure: 'https://apkpure.com/firefox-browser-fast-private/org.mozilla.firefox',
// //                 official: 'https://www.mozilla.org/firefox/android/'
// //             },
            
// //             // Betting Apps (as requested)
// //             'surebet': {
// //                 name: 'SureBet',
// //                 package: 'com.surebet',
// //                 version: 'Latest',
// //                 size: '~25MB',
// //                 apkpure: 'https://apkpure.com/surebet/com.surebet',
// //                 note: 'Betting application - Download from official sources only'
// //             },
// //             'sportybet': {
// //                 name: 'SportyBet',
// //                 package: 'com.sportybet',
// //                 version: 'Latest',
// //                 size: '~30MB',
// //                 apkpure: 'https://apkpure.com/sportybet/com.sportybet',
// //                 official: 'https://www.sportybet.com/download'
// //             },
// //             'betway': {
// //                 name: 'Betway',
// //                 package: 'com.betway',
// //                 version: 'Latest',
// //                 size: '~28MB',
// //                 apkpure: 'https://apkpure.com/betway/com.betway',
// //                 official: 'https://www.betway.com/download'
// //             },
// //             '1xbet': {
// //                 name: '1xBet',
// //                 package: 'com.xbet',
// //                 version: 'Latest',
// //                 size: '~35MB',
// //                 apkpure: 'https://apkpure.com/1xbet/com.xbet',
// //                 official: 'https://1xbet.com/mobile/'
// //             },
// //             'bet9ja': {
// //                 name: 'Bet9ja',
// //                 package: 'com.bet9ja',
// //                 version: 'Latest',
// //                 size: '~22MB',
// //                 apkpure: 'https://apkpure.com/bet9ja/com.bet9ja',
// //                 official: 'https://www.bet9ja.com/mobile-download'
// //             },
            
// //             // Gaming
// //             'pubg': {
// //                 name: 'PUBG Mobile',
// //                 package: 'com.tencent.ig',
// //                 version: 'Latest',
// //                 size: '~1.5GB',
// //                 apkpure: 'https://apkpure.com/pubg-mobile/com.tencent.ig',
// //                 note: 'Large file size - Use Wi-Fi'
// //             },
// //             'freefire': {
// //                 name: 'Free Fire',
// //                 package: 'com.dts.freefireth',
// //                 version: 'Latest',
// //                 size: '~800MB',
// //                 apkpure: 'https://apkpure.com/free-fire/com.dts.freefireth'
// //             },
// //             'mlbb': {
// //                 name: 'Mobile Legends',
// //                 package: 'com.mobile.legends',
// //                 version: 'Latest',
// //                 size: '~120MB',
// //                 apkpure: 'https://apkpure.com/mobile-legends-bang-bang/com.mobile.legends'
// //             },
// //             'coc': {
// //                 name: 'Clash of Clans',
// //                 package: 'com.supercell.clashofclans',
// //                 version: 'Latest',
// //                 size: '~150MB',
// //                 apkpure: 'https://apkpure.com/clash-of-clans/com.supercell.clashofclans'
// //             },
            
// //             // Productivity
// //             'adobe': {
// //                 name: 'Adobe Acrobat Reader',
// //                 package: 'com.adobe.reader',
// //                 version: 'Latest',
// //                 size: '~65MB',
// //                 apkpure: 'https://apkpure.com/adobe-acrobat-reader-pdf-editor/com.adobe.reader'
// //             },
// //             'office': {
// //                 name: 'Microsoft Office',
// //                 package: 'com.microsoft.office.officehubrow',
// //                 version: 'Latest',
// //                 size: '~180MB',
// //                 apkpure: 'https://apkpure.com/microsoft-office/com.microsoft.office.officehubrow'
// //             },
// //             'whatsapp business': {
// //                 name: 'WhatsApp Business',
// //                 package: 'com.whatsapp.w4b',
// //                 version: 'Latest',
// //                 size: '~45MB',
// //                 apkpure: 'https://apkpure.com/whatsapp-business/com.whatsapp.w4b'
// //             }
// //         };
        
// //         // Exact match
// //         if (apkDatabase[appName]) {
// //             return apkDatabase[appName];
// //         }
        
// //         // Partial match
// //         for (const [key, data] of Object.entries(apkDatabase)) {
// //             if (appName.includes(key) || key.includes(appName)) {
// //                 return data;
// //             }
// //         }
        
// //         // Try common variations
// //         const variations = {
// //             'fb': 'facebook',
// //             'ig': 'instagram',
// //             'yt': 'youtube',
// //             'wa': 'whatsapp',
// //             'tg': 'telegram',
// //             'sp': 'spotify',
// //             'tt': 'tiktok',
// //             'termux terminal': 'termux',
// //             'chrome browser': 'chrome',
// //             'firefox browser': 'firefox',
// //             'pubg mobile': 'pubg',
// //             'free fire max': 'freefire',
// //             'mobile legends': 'mlbb',
// //             'clash of clans': 'coc',
// //             'pdf reader': 'adobe',
// //             'microsoft word': 'office',
// //             'whatsapp biz': 'whatsapp business'
// //         };
        
// //         if (variations[appName]) {
// //             return apkDatabase[variations[appName]];
// //         }
        
// //         return null;
// //     }
// // };




















// // ====== apk.js - DIRECT FILE DOWNLOAD VERSION ======
// // Save as: ./commands/downloads/apk.js

// import fs from 'fs';
// import https from 'https';
// import { tmpdir } from 'os';
// import path from 'path';
// import { fileURLToPath } from 'url';

// const __dirname = path.dirname(fileURLToPath(import.meta.url));

// export default {
//     name: 'apk',
//     alias: ['app', 'download', 'getapk'],
//     description: 'Download APK files directly',
//     category: 'downloads',
    
//     async execute(sock, msg, args) {
//         const { remoteJid } = msg.key;
        
//         if (!args.length) {
//             return await sock.sendMessage(remoteJid, {
//                 text: `📱 *APK DOWNLOADER*\n\nUsage: .apk <app>\n\nExamples:\n• .apk facebook\n• .apk whatsapp\n• .apk termux\n\nAvailable: facebook, whatsapp, instagram, youtube, termux, telegram, spotify, pubg, surebet`
//             }, { quoted: msg });
//         }
        
//         const app = args.join(' ').toLowerCase();
        
//         await sock.sendMessage(remoteJid, {
//             text: `⬇️ Downloading ${app}...`
//         }, { quoted: msg });
        
//         const result = await this.downloadAPK(sock, remoteJid, app);
        
//         if (!result) {
//             await sock.sendMessage(remoteJid, {
//                 text: `❌ ${app.toUpperCase()} not available.\nTry: .apk list`
//             });
//         }
//     },
    
//     async downloadAPK(sock, remoteJid, appName) {
//         const apps = {
//             // Small apps (<25MB) that can be sent directly
//             'facebook': {
//                 name: 'Facebook Lite',
//                 url: 'https://fb.me/facebooklite',
//                 fallback: 'https://d.apkpure.com/b/APK/com.facebook.lite?version=latest',
//                 size: '2MB'
//             },
//             'whatsapp': {
//                 name: 'WhatsApp',
//                 url: 'https://d.apkpure.com/b/APK/com.whatsapp?version=latest',
//                 size: '45MB',
//                 note: 'Large file - sending link instead'
//             },
//             'termux': {
//                 name: 'Termux',
//                 url: 'https://f-droid.org/repo/com.termux_118.apk',
//                 size: '85MB',
//                 note: 'Large file - sending link instead'
//             },
//             'telegram': {
//                 name: 'Telegram',
//                 url: 'https://telegram.org/dl/android/apk',
//                 size: '45MB',
//                 note: 'Large file - sending link instead'
//             },
//             'spotify': {
//                 name: 'Spotify Lite',
//                 url: 'https://d.apkpure.com/b/APK/com.spotify.lite?version=latest',
//                 size: '15MB'
//             },
//             'surebet': {
//                 name: 'SureBet',
//                 url: 'https://apkpure.com/surebet/com.surebet/download?from=details',
//                 size: '25MB',
//                 note: 'Betting app - download from official site'
//             },
//             'calculator': {
//                 name: 'Calculator',
//                 url: 'https://d.apkpure.com/b/APK/com.google.android.calculator?version=latest',
//                 size: '5MB'
//             },
//             'notepad': {
//                 name: 'Notepad',
//                 url: 'https://d.apkpure.com/b/APK/com.farmerbb.notepad?version=latest',
//                 size: '3MB'
//             },
//             'vpn': {
//                 name: 'VPN',
//                 url: 'https://d.apkpure.com/b/APK/com.vpn?version=latest',
//                 size: '10MB'
//             },
//             'adblock': {
//                 name: 'AdBlock',
//                 url: 'https://d.apkpure.com/b/APK/com.adblock?version=latest',
//                 size: '8MB'
//             },
            
//             // Test apps (very small)
//             'test': {
//                 name: 'Test App',
//                 url: 'https://github.com/termux/termux-app/raw/master/app/build/outputs/apk/debug/app-debug.apk',
//                 size: '500KB'
//             }
//         };
        
//         // Find app
//         let appData = null;
//         for (const [key, data] of Object.entries(apps)) {
//             if (appName.includes(key) || key.includes(appName)) {
//                 appData = data;
//                 break;
//             }
//         }
        
//         if (!appData) {
//             // Try variations
//             const variations = {
//                 'fb': 'facebook',
//                 'wa': 'whatsapp',
//                 'ig': 'instagram',
//                 'yt': 'youtube',
//                 'tg': 'telegram',
//                 'sp': 'spotify',
//                 'calc': 'calculator',
//                 'notes': 'notepad'
//             };
            
//             if (variations[appName]) {
//                 appData = apps[variations[appName]];
//             }
//         }
        
//         if (!appData) {
//             if (appName === 'list') {
//                 const appList = Object.keys(apps).map(k => `• ${k}`).join('\n');
//                 await sock.sendMessage(remoteJid, {
//                     text: `📱 *Available Apps*\n\n${appList}\n\nUsage: .apk <name>`
//                 });
//                 return true;
//             }
//             return false;
//         }
        
//         // Check file size
//         const sizeMB = parseInt(appData.size);
//         if (sizeMB > 20) {
//             // Send as link for large files
//             await sock.sendMessage(remoteJid, {
//                 text: `📱 *${appData.name}*\n📦 Size: ${appData.size}\n\n🔗 Download: ${appData.url}\n\n${appData.note || 'Click link to download'}`
//             });
//             return true;
//         }
        
//         // Try to download and send small files
//         try {
//             await sock.sendMessage(remoteJid, {
//                 text: `⬇️ Downloading ${appData.name} (${appData.size})...`
//             });
            
//             const apkBuffer = await this.downloadFile(appData.url);
            
//             if (apkBuffer && apkBuffer.length > 0) {
//                 await sock.sendMessage(remoteJid, {
//                     document: apkBuffer,
//                     fileName: `${appData.name.replace(/\s+/g, '_')}.apk`,
//                     mimetype: 'application/vnd.android.package-archive',
//                     caption: `📱 ${appData.name}\n⚙️ Ready to install`
//                 });
                
//                 return true;
//             } else {
//                 throw new Error('Download failed');
//             }
            
//         } catch (error) {
//             console.error('APK download error:', error);
            
//             // Fallback to link
//             await sock.sendMessage(remoteJid, {
//                 text: `📱 *${appData.name}*\n\n⚠️ Couldn't send file directly.\n\n🔗 Download here:\n${appData.url}\n\n📦 Size: ${appData.size}`
//             });
            
//             return true;
//         }
//     },
    
//     async downloadFile(url) {
//         return new Promise((resolve, reject) => {
//             https.get(url, (response) => {
//                 if (response.statusCode !== 200) {
//                     reject(new Error(`HTTP ${response.statusCode}`));
//                     return;
//                 }
                
//                 const chunks = [];
//                 response.on('data', (chunk) => chunks.push(chunk));
//                 response.on('end', () => resolve(Buffer.concat(chunks)));
//                 response.on('error', reject);
                
//             }).on('error', reject);
//         });
//     }
// };

































// ====== apk.js - DIRECT FILE SENDER ======
// Save as: ./commands/downloads/apk.js

import fs from 'fs';
import https from 'https';
import http from 'http';
import { tmpdir } from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
    name: 'apk',
    alias: ['app', 'apkdownload'],
    description: 'Download and send APK files',
    category: 'downloads',
    
    async execute(sock, msg, args) {
        const { remoteJid } = msg.key;
        
        if (!args.length) {
            return await sock.sendMessage(remoteJid, {
                text: `📱 *APK DOWNLOADER*\n\n.apk <name>\n\nExamples:\n• .apk facebook\n• .apk whatsapp\n• .apk termux\n• .apk surebet\n\n.apk list - Show all apps`
            }, { quoted: msg });
        }
        
        const appName = args.join(' ').toLowerCase().trim();
        
        // Show app list
        if (appName === 'list') {
            const apps = Object.keys(this.apkDatabase).map(a => `• ${a}`).join('\n');
            return await sock.sendMessage(remoteJid, {
                text: `📱 *AVAILABLE APPS*\n\n${apps}\n\nTotal: ${Object.keys(this.apkDatabase).length} apps\n\n.apk <name> to download`
            }, { quoted: msg });
        }
        
        // Get app data
        const appData = this.getAppData(appName);
        
        if (!appData) {
            return await sock.sendMessage(remoteJid, {
                text: `❌ *${appName.toUpperCase()}* not found.\nType .apk list for available apps`
            }, { quoted: msg });
        }
        
        // Send downloading message
        await sock.sendMessage(remoteJid, {
            text: `⬇️ *Downloading ${appData.name}...*\n📦 ${appData.size}\n⏳ Please wait...`
        }, { quoted: msg });
        
        try {
            // Download APK
            const apkBuffer = await this.downloadAPK(appData.url);
            
            if (!apkBuffer || apkBuffer.length === 0) {
                throw new Error('Download failed');
            }
            
            // Send APK as document
            await sock.sendMessage(remoteJid, {
                document: apkBuffer,
                fileName: `${appData.name.replace(/\s+/g, '_')}.apk`,
                mimetype: 'application/vnd.android.package-archive',
                caption: `📱 *${appData.name}*\n📦 ${appData.size}\n✅ Ready to install`
            }, { quoted: msg });
            
        } catch (error) {
            console.error('APK Error:', error);
            
            // Fallback to sending link
            await sock.sendMessage(remoteJid, {
                text: `❌ *Couldn't send APK file*\n\n📱 *${appData.name}*\n🔗 Download: ${appData.url}\n📦 ${appData.size}\n\n⚠️ Tap link to download`
            }, { quoted: msg });
        }
    },
    
    // APK Database with direct download URLs
    apkDatabase: {
        'facebook': {
            name: 'Facebook Lite',
            url: 'https://fb.me/facebooklite',
            size: '2.3 MB',
            type: 'apk'
        },
        'whatsapp': {
            name: 'WhatsApp',
            url: 'https://web.archive.org/web/20230101000000/https://www.whatsapp.com/android/current/WhatsApp.apk',
            size: '45 MB',
            type: 'apk'
        },
        'messenger': {
            name: 'Messenger Lite',
            url: 'https://fb.me/messengerlite',
            size: '1.8 MB',
            type: 'apk'
        },
        'instagram': {
            name: 'Instagram Lite',
            url: 'https://d1.apkpure.com/b/APK/com.instagram.lite?version=latest',
            size: '2.1 MB',
            type: 'apk'
        },
        'telegram': {
            name: 'Telegram',
            url: 'https://telegram.org/dl/android/apk',
            size: '45 MB',
            type: 'apk'
        },
        'termux': {
            name: 'Termux',
            url: 'https://f-droid.org/repo/com.termux_118.apk',
            size: '85 MB',
            type: 'apk',
            note: 'Terminal emulator'
        },
        'calculator': {
            name: 'Calculator',
            url: 'https://d.apkpure.com/b/APK/com.google.android.calculator?version=latest',
            size: '5.4 MB',
            type: 'apk'
        },
        'vpn': {
            name: 'VPN App',
            url: 'https://d.apkpure.com/b/APK/com.vpn?version=latest',
            size: '8.2 MB',
            type: 'apk'
        },
        'notepad': {
            name: 'Notepad',
            url: 'https://d.apkpure.com/b/APK/com.farmerbb.notepad?version=latest',
            size: '3.1 MB',
            type: 'apk'
        },
        'adblock': {
            name: 'AdBlock',
            url: 'https://d.apkpure.com/b/APK/com.adblock?version=latest',
            size: '7.5 MB',
            type: 'apk'
        },
        'spotify': {
            name: 'Spotify Lite',
            url: 'https://d.apkpure.com/b/APK/com.spotify.lite?version=latest',
            size: '15 MB',
            type: 'apk'
        },
        'youtube': {
            name: 'YouTube Go',
            url: 'https://d.apkpure.com/b/APK/com.google.android.apps.youtube.mango?version=latest',
            size: '12 MB',
            type: 'apk'
        },
        'surebet': {
            name: 'SureBet',
            url: 'https://apkpure.com/surebet/com.surebet/download?from=details',
            size: '25 MB',
            type: 'apk',
            note: 'Betting app'
        },
        'pubg': {
            name: 'PUBG Mobile Lite',
            url: 'https://d.apkpure.com/b/APK/com.tencent.iglite?version=latest',
            size: '650 MB',
            type: 'apk',
            note: 'Large file - use Wi-Fi'
        },
        'chrome': {
            name: 'Chrome Browser',
            url: 'https://d.apkpure.com/b/APK/com.android.chrome?version=latest',
            size: '90 MB',
            type: 'apk'
        },
        'twitter': {
            name: 'Twitter Lite',
            url: 'https://d.apkpure.com/b/APK/com.twitter.android.lite?version=latest',
            size: '3.2 MB',
            type: 'apk'
        },
        'netflix': {
            name: 'Netflix',
            url: 'https://d.apkpure.com/b/APK/com.netflix.mediaclient?version=latest',
            size: '25 MB',
            type: 'apk'
        },
        'tiktok': {
            name: 'TikTok Lite',
            url: 'https://d.apkpure.com/b/APK/com.zhiliaoapp.musically.go?version=latest',
            size: '35 MB',
            type: 'apk'
        },
        'snapchat': {
            name: 'Snapchat',
            url: 'https://d.apkpure.com/b/APK/com.snapchat.android?version=latest',
            size: '85 MB',
            type: 'apk'
        },
        'discord': {
            name: 'Discord',
            url: 'https://d.apkpure.com/b/APK/com.discord?version=latest',
            size: '65 MB',
            type: 'apk'
        }
    },
    
    // Get app data by name
    getAppData(appName) {
        // Direct match
        if (this.apkDatabase[appName]) {
            return this.apkDatabase[appName];
        }
        
        // Partial match
        for (const [key, data] of Object.entries(this.apkDatabase)) {
            if (appName.includes(key) || key.includes(appName)) {
                return data;
            }
        }
        
        // Common variations
        const variations = {
            'fb': 'facebook',
            'wa': 'whatsapp',
            'ig': 'instagram',
            'yt': 'youtube',
            'tg': 'telegram',
            'sp': 'spotify',
            'tt': 'tiktok',
            'calc': 'calculator',
            'note': 'notepad',
            'vp': 'vpn',
            'ad': 'adblock',
            'snap': 'snapchat',
            'dc': 'discord',
            'twit': 'twitter',
            'net': 'netflix',
            'term': 'termux',
            'sure': 'surebet',
            'bet': 'surebet'
        };
        
        if (variations[appName]) {
            return this.apkDatabase[variations[appName]];
        }
        
        return null;
    },
    
    // Download APK file
    downloadAPK(url) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https') ? https : http;
            
            const request = protocol.get(url, (response) => {
                if (response.statusCode !== 200) {
                    reject(new Error(`Failed: ${response.statusCode}`));
                    return;
                }
                
                const chunks = [];
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                    
                    // Limit file size to prevent memory issues
                    const totalSize = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
                    if (totalSize > 100 * 1024 * 1024) { // 100MB limit
                        request.destroy();
                        reject(new Error('File too large'));
                    }
                });
                
                response.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve(buffer);
                });
                
                response.on('error', reject);
                
            }).on('error', reject);
            
            // Set timeout
            request.setTimeout(30000, () => {
                request.destroy();
                reject(new Error('Timeout'));
            });
        });
    }
};