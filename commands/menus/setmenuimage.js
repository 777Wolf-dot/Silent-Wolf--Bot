// // // import fs from "fs";
// // // import path from "path";
// // // import { fileURLToPath } from "url";
// // // import axios from "axios";

// // // const __filename = fileURLToPath(import.meta.url);
// // // const __dirname = path.dirname(__filename);

// // // export default {
// // //   name: "setmenuimage",
// // //   description: "Set menu image using any image URL",
// // //   async execute(sock, m, args) {
// // //     const jid = m.key.remoteJid;
    
// // //     // Check if user is bot owner
// // //     const isOwner = m.sender === global.owner || m.sender === process.env.OWNER_NUMBER;
// // //     if (!isOwner) {
// // //       await sock.sendMessage(jid, { 
// // //         text: "❌ This command is only available for bot owner!" 
// // //       }, { quoted: m });
// // //       return;
// // //     }

// // //     // Check if URL is provided
// // //     if (args.length === 0) {
// // //       await sock.sendMessage(jid, { 
// // //         text: `🖼️ *Set Menu Image*

// // // Usage: ${global.prefix}setmenuimage <image_url>

// // // *🌐 SUPPORTED IMAGE URLS:*
// // // • Any direct image link (jpg, png, webp, gif)
// // // • ImgBB, Imgur, Telegraph, etc.
// // // • Cloud storage links (Google Drive, Dropbox - if publicly accessible)

// // // *💡 HOW TO GET IMAGE URL:*
// // // 1. Upload to imgbb.com → Copy "Direct Link"
// // // 2. Or use: ${global.prefix}imgbb (reply to image for auto-upload)

// // // *✅ EXAMPLES:*
// // // ${global.prefix}setmenuimage https://i.ibb.co/abc123/image.jpg
// // // ${global.prefix}setmenuimage https://telegra.ph/file/abc123.jpg  
// // // ${global.prefix}setmenuimage https://i.imgur.com/abc123.png` 
// // //       }, { quoted: m });
// // //       return;
// // //     }

// // //     let imageUrl = args[0];
    
// // //     // Basic URL validation
// // //     if (!imageUrl.startsWith('http')) {
// // //       await sock.sendMessage(jid, { 
// // //         text: "❌ Invalid URL! Must start with http:// or https://" 
// // //       }, { quoted: m });
// // //       return;
// // //     }

// // //     try {
// // //       await sock.sendMessage(jid, { 
// // //         text: "🔄 Downloading and processing image..." 
// // //       }, { quoted: m });

// // //       console.log(`🌐 Downloading image from: ${imageUrl}`);

// // //       // Download image with better configuration
// // //       const response = await axios({
// // //         method: 'GET',
// // //         url: imageUrl,
// // //         responseType: 'arraybuffer',
// // //         timeout: 20000, // 20 seconds
// // //         maxContentLength: 8 * 1024 * 1024, // 8MB max for better stability
// // //         headers: {
// // //           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
// // //           'Accept': 'image/jpeg,image/png,image/webp,image/gif,image/*',
// // //           'Accept-Encoding': 'identity', // Prevent compressed responses
// // //           'Cache-Control': 'no-cache'
// // //         },
// // //         decompress: true, // Allow decompression
// // //         validateStatus: function (status) {
// // //           return status >= 200 && status < 300; // Accept 2xx status codes
// // //         }
// // //       });

// // //       // Verify it's actually an image
// // //       const contentType = response.headers['content-type'];
// // //       if (!contentType || !contentType.startsWith('image/')) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `❌ URL doesn't point to a valid image!\nDetected content type: ${contentType || 'unknown'}\n\nPlease provide a direct image URL.` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       const imageBuffer = Buffer.from(response.data);
// // //       const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

// // //       // Enhanced file size validation
// // //       if (imageBuffer.length > 8 * 1024 * 1024) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `❌ Image too large! ${fileSizeMB}MB exceeds 8MB limit.\n\nPlease use a smaller image or compress it.` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       if (imageBuffer.length < 1024) { // At least 1KB
// // //         await sock.sendMessage(jid, { 
// // //           text: "❌ Downloaded image is too small or corrupted." 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       console.log(`✅ Image downloaded: ${fileSizeMB}MB, type: ${contentType}`);

// // //       // Define paths
// // //       const mediaDir = path.join(__dirname, "media");
// // //       const wolfbotPath = path.join(mediaDir, "wolfbot.jpg");
// // //       const backupDir = path.join(mediaDir, "backups");
      
// // //       // Create directories if they don't exist
// // //       if (!fs.existsSync(mediaDir)) {
// // //         fs.mkdirSync(mediaDir, { recursive: true });
// // //         console.log(`📁 Created media directory: ${mediaDir}`);
// // //       }
// // //       if (!fs.existsSync(backupDir)) {
// // //         fs.mkdirSync(backupDir, { recursive: true });
// // //         console.log(`📁 Created backup directory: ${backupDir}`);
// // //       }

// // //       // Create backup of existing image if it exists
// // //       if (fs.existsSync(wolfbotPath)) {
// // //         const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
// // //         const backupPath = path.join(backupDir, `wolfbot-backup-${timestamp}.jpg`);
// // //         try {
// // //           fs.copyFileSync(wolfbotPath, backupPath);
// // //           console.log(`💾 Backup created: ${backupPath}`);
// // //         } catch (backupError) {
// // //           console.log("⚠️ Could not create backup, continuing...");
// // //         }
// // //       }

// // //       // Determine file extension from content type or URL
// // //       let fileExtension = '.jpg'; // Default
// // //       if (contentType.includes('png')) fileExtension = '.png';
// // //       else if (contentType.includes('webp')) fileExtension = '.webp';
// // //       else if (contentType.includes('gif')) fileExtension = '.gif';

// // //       const finalImagePath = wolfbotPath; // Always save as wolfbot.jpg for compatibility

// // //       // Save the image with proper error handling
// // //       try {
// // //         fs.writeFileSync(finalImagePath, imageBuffer);
// // //         console.log(`✅ Menu image saved: ${finalImagePath}`);
// // //       } catch (writeError) {
// // //         await sock.sendMessage(jid, { 
// // //           text: `❌ Failed to save image: ${writeError.message}` 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       // Verify the saved file
// // //       const stats = fs.statSync(finalImagePath);
// // //       if (stats.size === 0) {
// // //         throw new Error("Saved file is empty - possible disk space issue");
// // //       }

// // //       // Test if the image can be read back properly
// // //       try {
// // //         const testRead = fs.readFileSync(finalImagePath);
// // //         if (testRead.length !== imageBuffer.length) {
// // //           throw new Error("File corruption during save");
// // //         }
// // //       } catch (readError) {
// // //         await sock.sendMessage(jid, { 
// // //           text: "❌ Image file corrupted during save. Please try again." 
// // //         }, { quoted: m });
// // //         return;
// // //       }

// // //       // Send success message with the actual saved image as preview
// // //       const previewBuffer = fs.readFileSync(finalImagePath);
      
// // //       await sock.sendMessage(jid, { 
// // //         image: previewBuffer,
// // //         caption: `✅ *Menu Image Updated Successfully!*

// // // 📊 *Image Details:*
// // // • Size: ${fileSizeMB}MB
// // // • Type: ${contentType.split('/')[1].toUpperCase()}
// // // • Source: ${new URL(imageUrl).hostname}

// // // 🔄 *Affected Menu Styles:* 1, 5, 6, 7

// // // 💾 *Backup created* (if previous image existed)

// // // 🎯 *Testing the new menu image...*` 
// // //       }, { quoted: m });

// // //       // Wait a moment then send menu to test
// // //       setTimeout(async () => {
// // //         try {
// // //           await sock.sendMessage(jid, { 
// // //             text: `🎉 *Image Successfully Loaded!*\n\nThe menu image has been updated and is working properly.\n\nUse \`${global.prefix}menu\` to see it in action!` 
// // //           }, { quoted: m });
// // //         } catch (e) {
// // //           console.log("Optional follow-up message failed");
// // //         }
// // //       }, 2000);

// // //     } catch (error) {
// // //       console.error("❌ [SETMENUIMAGE] ERROR:", error);
      
// // //       let errorMessage = "❌ Failed to set menu image.\n\n";
      
// // //       if (error.code === 'ENOTFOUND') {
// // //         errorMessage += "• Domain not found or network error\n";
// // //       } else if (error.code === 'ETIMEDOUT') {
// // //         errorMessage += "• Download timeout (20 seconds)\n";
// // //       } else if (error.code === 'ECONNRESET') {
// // //         errorMessage += "• Connection reset by server\n";
// // //       } else if (error.response?.status === 404) {
// // //         errorMessage += "• Image not found at this URL\n";
// // //       } else if (error.response?.status === 403) {
// // //         errorMessage += "• Access denied (image may be private)\n";
// // //       } else if (error.response?.status === 429) {
// // //         errorMessage += "• Too many requests (try again later)\n";
// // //       } else if (error.response?.status) {
// // //         errorMessage += `• Server error: ${error.response.status}\n`;
// // //       } else if (error.message?.includes('maxContentLength')) {
// // //         errorMessage += "• Image too large (max 8MB)\n";
// // //       } else if (error.message?.includes('ENOENT')) {
// // //         errorMessage += "• File system error\n";
// // //       } else if (error.message?.includes('corrupt')) {
// // //         errorMessage += "• Image file corrupted\n";
// // //       } else {
// // //         errorMessage += `• Error: ${error.message}\n`;
// // //       }
      
// // //       errorMessage += `\n💡 *Solutions:*\n`;
// // //       errorMessage += `• Try a different image URL\n`;
// // //       errorMessage += `• Use \`${global.prefix}imgbb\` to upload images automatically\n`;
// // //       errorMessage += `• Check if the URL is a direct image link\n`;
// // //       errorMessage += `• Ensure the image is publicly accessible`;
      
// // //       await sock.sendMessage(jid, { text: errorMessage }, { quoted: m });
// // //     }
// // //   },
// // // };

























// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";
// // import axios from "axios";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);

// // export default {
// //   name: "setmenuimage",
// //   description: "Set menu image using any image URL",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
    
// //     // Check if user is bot owner
// //     const isOwner = m.sender === global.owner || m.sender === process.env.OWNER_NUMBER;
// //     if (!isOwner) {
// //       await sock.sendMessage(jid, { 
// //         text: "❌ This command is only available for bot owner!" 
// //       }, { quoted: m });
// //       return;
// //     }

// //     // Check if URL is provided
// //     if (args.length === 0) {
// //       await sock.sendMessage(jid, { 
// //         text: `🖼️ *Set Menu Image*

// // Usage: ${global.prefix}setmenuimage <image_url>

// // *🌐 SUPPORTED IMAGE URLS:*
// // • Direct image links (jpg, png, webp, gif)
// // • ImgBB, Imgur, Telegraph, PostImages
// // • Cloud storage (Google Drive, Dropbox direct links)
// // • Discord CDN, GitHub raw images
// // • Most image hosting services

// // *💡 RECOMMENDED SOURCES:*
// // • https://imgbb.com/ (best quality)
// // • https://telegra.ph/ (fast, no compression)
// // • https://imgur.com/ (popular)

// // *✅ EXAMPLES:*
// // ${global.prefix}setmenuimage https://i.ibb.co/abc123/image.jpg
// // ${global.prefix}setmenuimage https://telegra.ph/file/abc123.jpg` 
// //       }, { quoted: m });
// //       return;
// //     }

// //     let imageUrl = args[0];
    
// //     // Basic URL validation and cleanup
// //     if (!imageUrl.startsWith('http')) {
// //       await sock.sendMessage(jid, { 
// //         text: "❌ Invalid URL! Must start with http:// or https://" 
// //       }, { quoted: m });
// //       return;
// //     }

// //     // Clean up URL - remove tracking parameters and fix common issues
// //     try {
// //       const url = new URL(imageUrl);
// //       // Remove common tracking parameters
// //       const blacklistedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'msclkid'];
// //       blacklistedParams.forEach(param => url.searchParams.delete(param));
// //       imageUrl = url.toString();
// //     } catch (e) {
// //       // If URL parsing fails, use original
// //       console.log("URL parsing failed, using original:", imageUrl);
// //     }

// //     try {
// //       await sock.sendMessage(jid, { 
// //         text: "🔄 Downloading and processing image..." 
// //       }, { quoted: m });

// //       console.log(`🌐 Downloading image from: ${imageUrl}`);

// //       // Enhanced download configuration for better compatibility
// //       const response = await axios({
// //         method: 'GET',
// //         url: imageUrl,
// //         responseType: 'arraybuffer',
// //         timeout: 25000, // 25 seconds
// //         maxContentLength: 15 * 1024 * 1024, // 15MB max
// //         headers: {
// //           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
// //           'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
// //           'Accept-Encoding': 'gzip, deflate, br', // Allow compression for better performance
// //           'Cache-Control': 'no-cache',
// //           'DNT': '1'
// //         },
// //         decompress: true,
// //         maxRedirects: 5, // Allow redirects
// //         validateStatus: function (status) {
// //           return status >= 200 && status < 400; // Accept 2xx and 3xx status codes
// //         }
// //       });

// //       // Verify it's actually an image with better detection
// //       const contentType = response.headers['content-type'];
// //       const contentLength = response.headers['content-length'];
      
// //       if (!contentType || !contentType.startsWith('image/')) {
// //         // Check if it might be an image by file extension
// //         const urlLower = imageUrl.toLowerCase();
// //         const hasImageExtension = urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
// //                                  urlLower.includes('.png') || urlLower.includes('.webp') ||
// //                                  urlLower.includes('.gif') || urlLower.includes('.bmp');
        
// //         if (!hasImageExtension) {
// //           await sock.sendMessage(jid, { 
// //             text: `❌ URL doesn't point to a valid image!\nContent-type: ${contentType || 'unknown'}\n\nPlease provide a direct image URL.` 
// //           }, { quoted: m });
// //           return;
// //         }
// //         console.log(`⚠️ No content-type but has image extension, proceeding...`);
// //       }

// //       const imageBuffer = Buffer.from(response.data);
// //       const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

// //       // Enhanced file size validation
// //       if (imageBuffer.length > 10 * 1024 * 1024) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Image too large! ${fileSizeMB}MB exceeds 10MB limit.\n\nPlease use a smaller image.` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       if (imageBuffer.length < 2048) { // At least 2KB
// //         await sock.sendMessage(jid, { 
// //           text: "❌ Downloaded image is too small or corrupted." 
// //         }, { quoted: m });
// //         return;
// //       }

// //       console.log(`✅ Image downloaded: ${fileSizeMB}MB, type: ${contentType}`);

// //       // Define paths
// //       const mediaDir = path.join(__dirname, "media");
// //       const wolfbotPath = path.join(mediaDir, "wolfbot.jpg");
// //       const backupDir = path.join(mediaDir, "backups");
      
// //       // Create directories if they don't exist
// //       if (!fs.existsSync(mediaDir)) {
// //         fs.mkdirSync(mediaDir, { recursive: true });
// //         console.log(`📁 Created media directory: ${mediaDir}`);
// //       }
// //       if (!fs.existsSync(backupDir)) {
// //         fs.mkdirSync(backupDir, { recursive: true });
// //         console.log(`📁 Created backup directory: ${backupDir}`);
// //       }

// //       // Create backup of existing image if it exists
// //       if (fs.existsSync(wolfbotPath)) {
// //         const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
// //         const backupPath = path.join(backupDir, `wolfbot-backup-${timestamp}.jpg`);
// //         try {
// //           fs.copyFileSync(wolfbotPath, backupPath);
// //           console.log(`💾 Backup created: ${backupPath}`);
// //         } catch (backupError) {
// //           console.log("⚠️ Could not create backup, continuing...");
// //         }
// //       }

// //       // Save the original image first
// //       const originalExtension = getFileExtension(contentType, imageUrl);
// //       const originalPath = path.join(mediaDir, `wolfbot-original${originalExtension}`);
      
// //       try {
// //         // Save original for reference
// //         fs.writeFileSync(originalPath, imageBuffer);
// //         console.log(`💾 Original saved: ${originalPath}`);
        
// //         // Always save as high-quality JPEG for WhatsApp compatibility
// //         fs.writeFileSync(wolfbotPath, imageBuffer);
// //         console.log(`✅ Menu image saved: ${wolfbotPath}`);
// //       } catch (writeError) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Failed to save image: ${writeError.message}` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       // Verify the saved file
// //       const stats = fs.statSync(wolfbotPath);
// //       if (stats.size === 0) {
// //         throw new Error("Saved file is empty");
// //       }

// //       // Test if the image can be read back properly
// //       try {
// //         const testRead = fs.readFileSync(wolfbotPath);
// //         if (testRead.length < 2048) {
// //           throw new Error("File corruption during save");
// //         }
// //       } catch (readError) {
// //         await sock.sendMessage(jid, { 
// //           text: "❌ Image file corrupted during save. Please try a different image." 
// //         }, { quoted: m });
// //         return;
// //       }

// //       // Send success message with quality check
// //       const previewBuffer = fs.readFileSync(wolfbotPath);
      
// //       await sock.sendMessage(jid, { 
// //         image: previewBuffer,
// //         caption: `✅ *Menu Image Updated Successfully!*

// // 📊 *Image Details:*
// // • Size: ${fileSizeMB}MB
// // • Type: ${contentType ? contentType.split('/')[1].toUpperCase() : 'Unknown'}
// // • Source: ${new URL(imageUrl).hostname}
// // • Quality: ✅ High

// // 🔄 *Affected Menu Styles:* 1, 5, 6, 7

// // 💾 *Backup created*

// // 🎯 *Testing image quality...*` 
// //       }, { quoted: m });

// //       // Test the image in menu after a delay
// //       setTimeout(async () => {
// //         try {
// //           // Send a quick menu to test
// //           const testMenuText = `🎉 *Image Quality Test*\n\nThe menu image has been updated!\n\nUse \`${global.prefix}menu\` to see it in all menu styles.\n\nIf the image appears blurry:\n• Try a higher resolution image\n• Use PNG format for better quality\n• Recommended size: 512x512 pixels or larger`;
          
// //           await sock.sendMessage(jid, { text: testMenuText }, { quoted: m });
// //         } catch (e) {
// //           console.log("Optional follow-up message failed");
// //         }
// //       }, 3000);

// //     } catch (error) {
// //       console.error("❌ [SETMENUIMAGE] ERROR:", error);
      
// //       let errorMessage = "❌ Failed to set menu image.\n\n";
      
// //       if (error.code === 'ENOTFOUND') {
// //         errorMessage += "• Domain not found or network error\n";
// //       } else if (error.code === 'ETIMEDOUT') {
// //         errorMessage += "• Download timeout (25 seconds)\n";
// //       } else if (error.code === 'ECONNRESET') {
// //         errorMessage += "• Connection reset by server\n";
// //       } else if (error.response?.status === 404) {
// //         errorMessage += "• Image not found at this URL\n";
// //       } else if (error.response?.status === 403) {
// //         errorMessage += "• Access denied (image may be private)\n";
// //       } else if (error.response?.status === 429) {
// //         errorMessage += "• Too many requests (try again later)\n";
// //       } else if (error.response?.status === 301 || error.response?.status === 302) {
// //         errorMessage += "• URL redirected (try the final URL)\n";
// //       } else if (error.response?.status) {
// //         errorMessage += `• Server error: ${error.response.status}\n`;
// //       } else if (error.message?.includes('maxContentLength')) {
// //         errorMessage += "• Image too large (max 15MB)\n";
// //       } else if (error.message?.includes('ENOENT')) {
// //         errorMessage += "• File system error\n";
// //       } else if (error.message?.includes('corrupt')) {
// //         errorMessage += "• Image file corrupted\n";
// //       } else {
// //         errorMessage += `• Error: ${error.message}\n`;
// //       }
      
// //       errorMessage += `\n💡 *Solutions:*\n`;
// //       errorMessage += `• Try a different image URL/hosting service\n`;
// //       errorMessage += `• Use \`${global.prefix}imgbb\` for automatic upload\n`;
// //       errorMessage += `• Ensure it's a direct image link (ends with .jpg/.png/etc)\n`;
// //       errorMessage += `• Use high-quality images (min 512x512 pixels)\n`;
// //       errorMessage += `• Recommended: imgbb.com or telegra.ph`;
      
// //       await sock.sendMessage(jid, { text: errorMessage }, { quoted: m });
// //     }
// //   },
// // };

// // // Helper function to determine file extension
// // function getFileExtension(contentType, url) {
// //   if (contentType) {
// //     if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
// //     if (contentType.includes('png')) return '.png';
// //     if (contentType.includes('webp')) return '.webp';
// //     if (contentType.includes('gif')) return '.gif';
// //   }
  
// //   // Fallback to URL extension
// //   const urlLower = url.toLowerCase();
// //   if (urlLower.includes('.png')) return '.png';
// //   if (urlLower.includes('.webp')) return '.webp';
// //   if (urlLower.includes('.gif')) return '.gif';
  
// //   return '.jpg'; // Default
// // }













































// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";
// import axios from "axios";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// export default {
//   name: "setmenuimage",
//   description: "Set menu image using any image URL",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
    
//     // Check if user is bot owner
//     const isOwner = m.sender === global.owner || m.sender === process.env.OWNER_NUMBER;
//     if (!isOwner) {
//       await sock.sendMessage(jid, { 
//         text: "❌ This command is only available for bot owner!" 
//       }, { quoted: m });
//       return;
//     }

//     // Check if URL is provided
//     if (args.length === 0) {
//       await sock.sendMessage(jid, { 
//         text: `🖼️ *Set Menu Image*\n\nUsage: ${global.prefix}setmenuimage <image_url>\n\nExample: ${global.prefix}setmenuimage https://i.ibb.co/abc123/image.jpg` 
//       }, { quoted: m });
//       return;
//     }

//     let imageUrl = args[0];
    
//     // Basic URL validation
//     if (!imageUrl.startsWith('http')) {
//       await sock.sendMessage(jid, { 
//         text: "❌ Invalid URL! Must start with http:// or https://" 
//       }, { quoted: m });
//       return;
//     }

//     // Clean up URL
//     try {
//       const url = new URL(imageUrl);
//       const blacklistedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'msclkid'];
//       blacklistedParams.forEach(param => url.searchParams.delete(param));
//       imageUrl = url.toString();
//     } catch (e) {
//       console.log("URL parsing failed, using original:", imageUrl);
//     }

//     let statusMsg;
    
//     try {
//       // Send initial message and store its ID for editing
//       statusMsg = await sock.sendMessage(jid, { 
//         text: "🔄 *Downloading image...*" 
//       }, { quoted: m });

//       console.log(`🌐 Downloading image from: ${imageUrl}`);

//       // Download image
//       const response = await axios({
//         method: 'GET',
//         url: imageUrl,
//         responseType: 'arraybuffer',
//         timeout: 25000,
//         maxContentLength: 15 * 1024 * 1024,
//         headers: {
//           'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
//           'Accept': 'image/*,*/*;q=0.8',
//           'Accept-Encoding': 'gzip, deflate, br',
//         },
//         decompress: true,
//         maxRedirects: 5,
//         validateStatus: function (status) {
//           return status >= 200 && status < 400;
//         }
//       });

//       // Update message to show download complete
//       await sock.sendMessage(jid, { 
//         text: "🔄 *Downloading image...* ✅\n💾 *Saving image...*",
//         edit: statusMsg.key 
//       });

//       // Verify it's an image
//       const contentType = response.headers['content-type'];
//       if (!contentType || !contentType.startsWith('image/')) {
//         const urlLower = imageUrl.toLowerCase();
//         const hasImageExtension = urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
//                                  urlLower.includes('.png') || urlLower.includes('.webp') ||
//                                  urlLower.includes('.gif');
//         if (!hasImageExtension) {
//           await sock.sendMessage(jid, { 
//             text: "❌ *Not a valid image URL*",
//             edit: statusMsg.key 
//           });
//           return;
//         }
//       }

//       const imageBuffer = Buffer.from(response.data);
//       const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

//       // File size validation
//       if (imageBuffer.length > 10 * 1024 * 1024) {
//         await sock.sendMessage(jid, { 
//           text: `❌ *Image too large!* (${fileSizeMB}MB > 10MB limit)`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       if (imageBuffer.length < 2048) {
//         await sock.sendMessage(jid, { 
//           text: "❌ *Image too small or corrupted*",
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       console.log(`✅ Image downloaded: ${fileSizeMB}MB, type: ${contentType}`);

//       // Define paths
//       const mediaDir = path.join(__dirname, "media");
//       const wolfbotPath = path.join(mediaDir, "wolfbot.jpg");
//       const backupDir = path.join(mediaDir, "backups");
      
//       // Create directories if they don't exist
//       if (!fs.existsSync(mediaDir)) {
//         fs.mkdirSync(mediaDir, { recursive: true });
//       }
//       if (!fs.existsSync(backupDir)) {
//         fs.mkdirSync(backupDir, { recursive: true });
//       }

//       // Create backup of existing image
//       if (fs.existsSync(wolfbotPath)) {
//         const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
//         const backupPath = path.join(backupDir, `wolfbot-backup-${timestamp}.jpg`);
//         try {
//           fs.copyFileSync(wolfbotPath, backupPath);
//           console.log(`💾 Backup created: ${backupPath}`);
//         } catch (backupError) {
//           console.log("⚠️ Could not create backup");
//         }
//       }

//       // Update message to show saving
//       await sock.sendMessage(jid, { 
//         text: "🔄 *Downloading image...* ✅\n💾 *Saving image...* ✅\n✅ *Finalizing...*",
//         edit: statusMsg.key 
//       });

//       // Save the image
//       try {
//         fs.writeFileSync(wolfbotPath, imageBuffer);
//         console.log(`✅ Menu image saved: ${wolfbotPath}`);
//       } catch (writeError) {
//         await sock.sendMessage(jid, { 
//           text: `❌ *Failed to save image*`,
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Verify the saved file
//       const stats = fs.statSync(wolfbotPath);
//       if (stats.size === 0) {
//         throw new Error("Saved file is empty");
//       }

//       // Test if the image can be read back
//       try {
//         const testRead = fs.readFileSync(wolfbotPath);
//         if (testRead.length < 2048) {
//           throw new Error("File corruption during save");
//         }
//       } catch (readError) {
//         await sock.sendMessage(jid, { 
//           text: "❌ *Image file corrupted*",
//           edit: statusMsg.key 
//         });
//         return;
//       }

//       // Get the final image for preview
//       const previewBuffer = fs.readFileSync(wolfbotPath);
      
//       // Edit the original message with final success and image
//       await sock.sendMessage(jid, { 
//         image: previewBuffer,
//         caption: `✅ *Menu Image Updated!*\n\n📸 ${fileSizeMB}MB • ${contentType ? contentType.split('/')[1].toUpperCase() : 'Image'}\n🌐 ${new URL(imageUrl).hostname}\n\nUse ${global.prefix}menu to see it!`,
//         edit: statusMsg.key 
//       });

//       console.log(`✅ Menu image updated successfully`);

//     } catch (error) {
//       console.error("❌ [SETMENUIMAGE] ERROR:", error);
      
//       let errorMessage = "❌ *Failed to set menu image*";
      
//       if (error.code === 'ENOTFOUND') {
//         errorMessage += "\n• Domain not found";
//       } else if (error.code === 'ETIMEDOUT') {
//         errorMessage += "\n• Download timeout";
//       } else if (error.response?.status === 404) {
//         errorMessage += "\n• Image not found";
//       } else if (error.response?.status === 403) {
//         errorMessage += "\n• Access denied";
//       } else {
//         errorMessage += `\n• ${error.message}`;
//       }
      
//       if (statusMsg) {
//         await sock.sendMessage(jid, { 
//           text: errorMessage,
//           edit: statusMsg.key 
//         });
//       } else {
//         await sock.sendMessage(jid, { text: errorMessage }, { quoted: m });
//       }
//     }
//   },
// };

// // Helper function to determine file extension
// function getFileExtension(contentType, url) {
//   if (contentType) {
//     if (contentType.includes('jpeg') || contentType.includes('jpg')) return '.jpg';
//     if (contentType.includes('png')) return '.png';
//     if (contentType.includes('webp')) return '.webp';
//     if (contentType.includes('gif')) return '.gif';
//   }
  
//   const urlLower = url.toLowerCase();
//   if (urlLower.includes('.png')) return '.png';
//   if (urlLower.includes('.webp')) return '.webp';
//   if (urlLower.includes('.gif')) return '.gif';
  
//   return '.jpg';
// }
























import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  name: "setmenuimage",
  description: "Set menu image using any image URL",
  category: "owner",
  ownerOnly: true,
  
  async execute(sock, m, args, PREFIX, extra) {
    const jid = m.key.remoteJid;
    const { jidManager } = extra;
    
    // ====== OWNER CHECK ======
    const isOwner = jidManager.isOwner(m);
    const isFromMe = m.key.fromMe;
    const senderJid = m.key.participant || jid;
    const cleaned = jidManager.cleanJid(senderJid);
    
    if (!isOwner) {
      // Detailed error message in REPLY format
      let errorMsg = `❌ *Owner Only Command!*\n\n`;
      errorMsg += `Only the bot owner can set menu image.\n\n`;
      errorMsg += `🔍 *Debug Info:*\n`;
      errorMsg += `├─ Your JID: ${cleaned.cleanJid}\n`;
      errorMsg += `├─ Your Number: ${cleaned.cleanNumber || 'N/A'}\n`;
      errorMsg += `├─ Type: ${cleaned.isLid ? 'LID 🔗' : 'Regular 📱'}\n`;
      errorMsg += `├─ From Me: ${isFromMe ? '✅ YES' : '❌ NO'}\n`;
      
      // Get owner info
      const ownerInfo = jidManager.getOwnerInfo ? jidManager.getOwnerInfo() : {};
      errorMsg += `└─ Owner Number: ${ownerInfo.cleanNumber || 'Not set'}\n\n`;
      
      if (cleaned.isLid && isFromMe) {
        errorMsg += `⚠️ *Issue Detected:*\n`;
        errorMsg += `You're using a linked device (LID).\n`;
        errorMsg += `Try using ${PREFIX}fixowner or ${PREFIX}forceownerlid\n`;
      } else if (!ownerInfo.cleanNumber) {
        errorMsg += `⚠️ *Issue Detected:*\n`;
        errorMsg += `Owner not set in jidManager!\n`;
        errorMsg += `Try using ${PREFIX}debugchat fix\n`;
      }
      
      return sock.sendMessage(jid, { 
        text: errorMsg 
      }, { 
        quoted: m // Reply format
      });
    }

    // Check if URL is provided
    if (args.length === 0) {
      await sock.sendMessage(jid, { 
        text: `🖼️ *Set Menu Image*\n\nUsage: ${PREFIX}setmenuimage <image_url>\n\nExample: ${PREFIX}setmenuimage https://example.com/image.jpg\n\n⚠️ Only JPG/PNG/WebP formats (max 10MB)` 
      }, { 
        quoted: m // Reply format
      });
      return;
    }

    let imageUrl = args[0];
    
    // Basic URL validation
    if (!imageUrl.startsWith('http')) {
      await sock.sendMessage(jid, { 
        text: "❌ Invalid URL! Must start with http:// or https://" 
      }, { 
        quoted: m // Reply format
      });
      return;
    }

    // Clean up URL
    try {
      const url = new URL(imageUrl);
      const blacklistedParams = ['utm_source', 'utm_medium', 'utm_campaign', 'fbclid', 'gclid', 'msclkid'];
      blacklistedParams.forEach(param => url.searchParams.delete(param));
      imageUrl = url.toString();
    } catch (e) {
      console.log("URL parsing failed, using original:", imageUrl);
    }

    let statusMsg;
    
    try {
      // Send initial message and store its ID for editing
      statusMsg = await sock.sendMessage(jid, { 
        text: "🔄 *Downloading image...*" 
      }, { 
        quoted: m // Reply format
      });

      console.log(`🌐 Owner ${cleaned.cleanNumber} setting menu image from: ${imageUrl}`);

      // Download image
      const response = await axios({
        method: 'GET',
        url: imageUrl,
        responseType: 'arraybuffer',
        timeout: 25000,
        maxContentLength: 15 * 1024 * 1024,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
        },
        decompress: true,
        maxRedirects: 5,
        validateStatus: function (status) {
          return status >= 200 && status < 400;
        }
      });

      // Update message to show download complete
      await sock.sendMessage(jid, { 
        text: "🔄 *Downloading image...* ✅\n💾 *Processing image...*",
        edit: statusMsg.key 
      });

      // Verify it's an image
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        const urlLower = imageUrl.toLowerCase();
        const hasImageExtension = urlLower.includes('.jpg') || urlLower.includes('.jpeg') || 
                                 urlLower.includes('.png') || urlLower.includes('.webp') ||
                                 urlLower.includes('.gif');
        if (!hasImageExtension) {
          await sock.sendMessage(jid, { 
            text: "❌ *Not a valid image URL*\n\nPlease provide a direct link to an image file.",
            edit: statusMsg.key 
          });
          return;
        }
      }

      const imageBuffer = Buffer.from(response.data);
      const fileSizeMB = (imageBuffer.length / 1024 / 1024).toFixed(2);

      // File size validation
      if (imageBuffer.length > 10 * 1024 * 1024) {
        await sock.sendMessage(jid, { 
          text: `❌ *Image too large!* (${fileSizeMB}MB > 10MB limit)\n\nPlease use a smaller image.`,
          edit: statusMsg.key 
        });
        return;
      }

      if (imageBuffer.length < 2048) {
        await sock.sendMessage(jid, { 
          text: "❌ *Image too small or corrupted*\n\nImage file appears to be invalid.",
          edit: statusMsg.key 
        });
        return;
      }

      console.log(`✅ Image downloaded: ${fileSizeMB}MB, type: ${contentType}`);

      // Define paths
      const mediaDir = path.join(__dirname, "media");
      const wolfbotPath = path.join(mediaDir, "wolfbot.jpg");
      const backupDir = path.join(mediaDir, "backups");
      
      // Create directories if they don't exist
      if (!fs.existsSync(mediaDir)) {
        fs.mkdirSync(mediaDir, { recursive: true });
      }
      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      // Create backup of existing image
      if (fs.existsSync(wolfbotPath)) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        const backupPath = path.join(backupDir, `wolfbot-backup-${timestamp}.jpg`);
        try {
          fs.copyFileSync(wolfbotPath, backupPath);
          console.log(`💾 Backup created: ${backupPath}`);
        } catch (backupError) {
          console.log("⚠️ Could not create backup");
        }
      }

      // Update message to show saving
      await sock.sendMessage(jid, { 
        text: "🔄 *Downloading image...* ✅\n💾 *Processing image...* ✅\n✅ *Done ✅*",
        edit: statusMsg.key 
      });

      // Save the image
      try {
        fs.writeFileSync(wolfbotPath, imageBuffer);
        console.log(`✅ Menu image saved: ${wolfbotPath}`);
      } catch (writeError) {
        await sock.sendMessage(jid, { 
          text: `❌ *Failed to save image*\n\nError: ${writeError.message}`,
          edit: statusMsg.key 
        });
        return;
      }

      // Verify the saved file
      const stats = fs.statSync(wolfbotPath);
      if (stats.size === 0) {
        throw new Error("Saved file is empty");
      }

      // Test if the image can be read back
      try {
        const testRead = fs.readFileSync(wolfbotPath);
        if (testRead.length < 2048) {
          throw new Error("File corruption during save");
        }
      } catch (readError) {
        await sock.sendMessage(jid, { 
          text: "❌ *Image file corrupted*\n\nPlease try again with a different image.",
          edit: statusMsg.key 
        });
        return;
      }

      // Get the final image for preview
      const previewBuffer = fs.readFileSync(wolfbotPath);
      
      // Prepare success message
      let successCaption = `✅ *Menu Image Updated!*\n\n`;
      successCaption += `📸 Size: ${fileSizeMB}MB\n`;
      successCaption += `📁 Format: ${contentType ? contentType.split('/')[1].toUpperCase() : 'JPG'}\n`;
      
      try {
        const urlObj = new URL(imageUrl);
        successCaption += `🌐 Source: ${urlObj.hostname}\n`;
      } catch (e) {
        successCaption += `🔗 URL: ${imageUrl.substring(0, 30)}...\n`;
      }
      
      if (cleaned.isLid) {
        successCaption += `\n📱 *Changed from linked device*`;
      }
      
      successCaption += `\n\nUse ${PREFIX}menu to see the new menu!`;
      
      // Edit the original message with final success and image
      await sock.sendMessage(jid, { 
        image: previewBuffer,
        caption: successCaption,
        edit: statusMsg.key 
      });

      console.log(`✅ Menu image updated successfully by owner ${cleaned.cleanNumber}`);

    } catch (error) {
      console.error("❌ [SETMENUIMAGE] ERROR:", error);
      
      let errorMessage = "❌ *Failed to set menu image*\n\n";
      
      if (error.code === 'ENOTFOUND') {
        errorMessage += "• Domain not found";
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage += "• Download timeout (25s)";
      } else if (error.response?.status === 404) {
        errorMessage += "• Image not found (404)";
      } else if (error.response?.status === 403) {
        errorMessage += "• Access denied (403)";
      } else if (error.message.includes('ENOENT')) {
        errorMessage += "• Could not save image file";
      } else if (error.message.includes('ECONNREFUSED')) {
        errorMessage += "• Connection refused";
      } else {
        errorMessage += `• ${error.message}`;
      }
      
      errorMessage += `\n\nPlease try a different image URL.`;
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: errorMessage,
          edit: statusMsg.key 
        });
      } else {
        await sock.sendMessage(jid, { 
          text: errorMessage 
        }, { 
          quoted: m // Reply format
        });
      }
    }
  },
};