// // import { createCanvas } from 'canvas';
// // import { writeFileSync, unlinkSync } from 'fs';
// // import { exec } from 'child_process';
// // import { promisify } from 'util';
// // import { tmpdir } from 'os';
// // import { join } from 'path';

// // const execAsync = promisify(exec);

// // export default {
// //   name: "intrologo",
// //   description: "Create animated logo with intense background music",
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;

// //     try {
// //       if (args.length === 0) {
// //         await sock.sendMessage(jid, { 
// //           text: `🎵 *Intro Logo*\n\nUsage: intrologo <text>\n\n*Example:*\nintrologo WOLF\nintrologo INTRO\nintrologo EPIC` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       const text = args.join(" ");
      
// //       if (text.length > 12) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Text too long! Please use maximum 12 characters.\n\nYour text: "${text}" (${text.length} characters)` 
// //         }, { quoted: m });
// //         return;
// //       }

// //       // Send waiting message
// //       await sock.sendMessage(jid, { 
// //         text: `🎵 Creating epic intro video for: "${text}"...\n⏳ This may take 15-20 seconds...` 
// //       }, { quoted: m });

// //       // Generate animated intro video
// //       const videoBuffer = await generateAnimatedIntro(text);
      
// //       await sock.sendMessage(jid, {
// //         video: videoBuffer,
// //         caption: `🎵 *Epic Intro Logo!*\nText: ${text}\n\n⚡ Animated with intense effects!`
// //       }, { quoted: m });

// //     } catch (error) {
// //       console.error("❌ [INTROLOGO] ERROR:", error);
// //       await sock.sendMessage(jid, { 
// //         text: `❌ Error creating intro video: ${error.message}\n\nTrying alternative method...` 
// //       }, { quoted: m });
      
// //       // Fallback to static image
// //       try {
// //         const fallbackBuffer = await generateSimpleIntro(text);
// //         await sock.sendMessage(jid, {
// //           image: fallbackBuffer,
// //           caption: `🎵 *Intro Logo (Static)*\nText: ${text}\n\n⚡ Video generation failed, but here's a static version!`
// //         }, { quoted: m });
// //       } catch (fallbackError) {
// //         await sock.sendMessage(jid, { 
// //           text: `❌ Complete failure: ${fallbackError.message}` 
// //         }, { quoted: m });
// //       }
// //     }
// //   },
// // };

// // /**
// //  * Generate animated intro video with music
// //  */
// // async function generateAnimatedIntro(text) {
// //   const tempDir = tmpdir();
// //   const frames = [];
// //   const duration = 5; // Reduced to 5 seconds for faster generation
// //   const fps = 15; // Reduced FPS for faster processing
// //   const totalFrames = duration * fps;

// //   console.log(`🔄 Generating ${totalFrames} frames...`);

// //   // Generate all frames
// //   for (let i = 0; i < totalFrames; i++) {
// //     try {
// //       const progress = i / totalFrames;
// //       const frameBuffer = await generateAnimatedFrame(text, progress, i);
// //       const framePath = join(tempDir, `frame_${i.toString().padStart(4, '0')}.png`);
// //       writeFileSync(framePath, frameBuffer);
// //       frames.push(framePath);
      
// //       // Log progress every 10 frames
// //       if (i % 10 === 0) {
// //         console.log(`📊 Frame ${i}/${totalFrames} generated`);
// //       }
// //     } catch (frameError) {
// //       console.error(`❌ Frame ${i} error:`, frameError);
// //       // Continue with other frames
// //     }
// //   }

// //   console.log(`🎬 Creating video from ${frames.length} frames...`);

// //   // Create video from frames
// //   const videoPath = join(tempDir, `intro_${Date.now()}.mp4`);
// //   try {
// //     await createVideoFromFrames(frames, videoPath, fps);
// //   } catch (videoError) {
// //     console.error('❌ Video creation failed:', videoError);
// //     throw new Error('Video creation failed: ' + videoError.message);
// //   }

// //   // Clean up frame files
// //   for (const frame of frames) {
// //     try { unlinkSync(frame); } catch (e) {}
// //   }

// //   // Read final video
// //   const videoBuffer = require('fs').readFileSync(videoPath);
// //   try { unlinkSync(videoPath); } catch (e) {}

// //   console.log('✅ Intro video generated successfully!');
// //   return videoBuffer;
// // }

// // /**
// //  * Generate a single animated frame with safe calculations
// //  */
// // async function generateAnimatedFrame(text, progress, frameIndex) {
// //   const width = 640; // Reduced for faster processing
// //   const height = 360; // 16:9 aspect ratio
  
// //   const canvas = createCanvas(width, height);
// //   const ctx = canvas.getContext('2d');

// //   // Safe calculations with bounds checking
// //   const beat = Math.sin(progress * Math.PI * 6); // Reduced frequency
// //   const bass = Math.sin(progress * Math.PI * 2);
// //   const intensity = Math.min(Math.abs(beat) * 0.5 + Math.abs(bass) * 0.5, 1);

// //   // Create pulsating dark background
// //   const bgIntensity = Math.max(10, Math.min(30, 10 + intensity * 20));
// //   ctx.fillStyle = `rgb(${bgIntensity}, ${bgIntensity}, ${bgIntensity + 10})`;
// //   ctx.fillRect(0, 0, width, height);

// //   // Add intense light rays synced to music
// //   drawLightRays(ctx, width, height, progress, intensity);

// //   // Add safe particle system
// //   drawMusicParticles(ctx, width, height, frameIndex, intensity);

// //   // Animated logo text with music sync
// //   drawAnimatedText(ctx, text, width, height, progress, intensity, beat);

// //   // Add visualizer bars at bottom
// //   drawVisualizer(ctx, width, height, progress);

// //   return canvas.toBuffer('image/png');
// // }

// // /**
// //  * Draw animated light rays synced to music
// //  */
// // function drawLightRays(ctx, width, height, progress, intensity) {
// //   const rayCount = 8; // Reduced count
// //   const centerX = width / 2;
// //   const centerY = height / 2;
  
// //   ctx.save();
// //   ctx.globalAlpha = Math.min(0.3 + intensity * 0.4, 0.7);
  
// //   for (let i = 0; i < rayCount; i++) {
// //     const angle = (i / rayCount) * Math.PI * 2 + progress * Math.PI * 3;
// //     const length = 400 + Math.sin(progress * Math.PI * 12 + i) * 150;
// //     const rayWidth = Math.max(10, Math.min(35, 15 + Math.sin(progress * Math.PI * 6 + i) * 10));
    
// //     const gradient = ctx.createLinearGradient(
// //       centerX, centerY,
// //       centerX + Math.cos(angle) * length,
// //       centerY + Math.sin(angle) * length
// //     );
    
// //     gradient.addColorStop(0, `rgba(255, ${100 + intensity * 155}, 0, 0.6)`);
// //     gradient.addColorStop(0.7, `rgba(255, 255, ${100 + intensity * 155}, 0.2)`);
// //     gradient.addColorStop(1, 'transparent');
    
// //     ctx.strokeStyle = gradient;
// //     ctx.lineWidth = rayWidth;
    
// //     ctx.beginPath();
// //     ctx.moveTo(centerX, centerY);
// //     ctx.lineTo(
// //       centerX + Math.cos(angle) * length,
// //       centerY + Math.sin(angle) * length
// //     );
// //     ctx.stroke();
// //   }
  
// //   ctx.restore();
// // }

// // /**
// //  * Draw music-synced particles with safe radius calculations
// //  */
// // function drawMusicParticles(ctx, width, height, frameIndex, intensity) {
// //   const particleCount = Math.min(80, 50 + Math.floor(intensity * 50)); // Reduced count
  
// //   for (let i = 0; i < particleCount; i++) {
// //     const angle = (i / particleCount) * Math.PI * 2;
// //     const distance = Math.max(50, Math.min(300, 100 + Math.sin(frameIndex * 0.1 + i) * 150));
    
// //     // Safe size calculation with minimum and maximum bounds
// //     const baseSize = Math.sin(frameIndex * 0.3 + i);
// //     const size = Math.max(0.5, Math.min(4, 1 + baseSize * 2));
    
// //     const x = width / 2 + Math.cos(angle) * distance;
// //     const y = height / 2 + Math.sin(angle) * distance;
    
// //     // Safe color calculation
// //     const hue = (frameIndex * 2 + i * 10) % 360;
// //     const saturation = Math.min(100, 80 + intensity * 20);
// //     const lightness = Math.min(80, 50 + intensity * 30);
    
// //     ctx.fillStyle = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
// //     ctx.globalAlpha = Math.min(0.7, 0.3 + intensity * 0.4);
    
// //     // Safe pulsing effect
// //     const pulse = Math.sin(frameIndex * 0.15 + i) * 0.5 + 0.5;
// //     const currentSize = Math.max(0.5, size * (0.5 + pulse * 0.5));
    
// //     // Only draw if coordinates are within bounds and size is positive
// //     if (x >= 0 && x <= width && y >= 0 && y <= height && currentSize > 0) {
// //       ctx.beginPath();
// //       ctx.arc(x, y, currentSize, 0, Math.PI * 2);
// //       ctx.fill();
// //     }
// //   }
  
// //   ctx.globalAlpha = 1.0;
// // }

// // /**
// //  * Draw animated text synced to music with safe calculations
// //  */
// // function drawAnimatedText(ctx, text, width, height, progress, intensity, beat) {
// //   const centerX = width / 2;
// //   const centerY = height / 2;
  
// //   // Safe scaling and movement calculations
// //   const scale = Math.max(0.8, Math.min(1.5, 1 + intensity * 0.3 + Math.abs(beat) * 0.2));
// //   const rotation = Math.max(-0.2, Math.min(0.2, Math.sin(progress * Math.PI * 3) * 0.1));
// //   const xOffset = Math.max(-30, Math.min(30, Math.sin(progress * Math.PI * 4) * 15));
// //   const yOffset = Math.max(-20, Math.min(20, Math.cos(progress * Math.PI * 2) * 10));
  
// //   ctx.save();
// //   ctx.translate(centerX + xOffset, centerY + yOffset);
// //   ctx.rotate(rotation);
// //   ctx.scale(scale, scale);
  
// //   // Text with intense gradient
// //   const gradient = ctx.createLinearGradient(-150, -40, 150, 40);
// //   gradient.addColorStop(0, '#FF0000');
// //   gradient.addColorStop(0.3, '#FFA500');
// //   gradient.addColorStop(0.5, '#FFFF00');
// //   gradient.addColorStop(0.7, '#00FF00');
// //   gradient.addColorStop(1, '#0000FF');
  
// //   // Text glow effect with safe blur
// //   ctx.shadowColor = `hsl(${progress * 360}, 100%, 60%)`;
// //   ctx.shadowBlur = Math.min(50, 20 + intensity * 30);
  
// //   // Main text
// //   ctx.font = `bold 60px "Arial"`; // Slightly smaller font
// //   ctx.textAlign = 'center';
// //   ctx.textBaseline = 'middle';
// //   ctx.fillStyle = gradient;
// //   ctx.fillText(text.toUpperCase(), 0, 0);
  
// //   ctx.restore();
// // }

// // /**
// //  * Draw audio visualizer bars with safe calculations
// //  */
// // function drawVisualizer(ctx, width, height, progress) {
// //   const barCount = 20; // Reduced count
// //   const visualizerHeight = 40;
// //   const visualizerY = height - visualizerHeight - 10;
  
// //   for (let i = 0; i < barCount; i++) {
// //     const barWidth = (width - 30) / barCount - 1;
// //     const barX = 15 + i * (barWidth + 1);
    
// //     // Safe bar height calculation
// //     const frequency = (i / barCount) * 6;
// //     const baseHeight = Math.sin(progress * Math.PI * 12 + frequency) * 
// //                       Math.sin(progress * Math.PI * 3 + i * 0.3);
// //     const barHeight = Math.max(5, Math.min(visualizerHeight, 
// //                       baseHeight * visualizerHeight * 0.4 + visualizerHeight * 0.3));
    
// //     const gradient = ctx.createLinearGradient(barX, visualizerY, barX, visualizerY + barHeight);
// //     gradient.addColorStop(0, `hsl(${i * 18}, 100%, 70%)`);
// //     gradient.addColorStop(1, `hsl(${i * 18}, 100%, 40%)`);
    
// //     ctx.fillStyle = gradient;
// //     ctx.fillRect(barX, visualizerY + visualizerHeight - barHeight, barWidth, barHeight);
// //   }
// // }

// // /**
// //  * Create video from frames using ffmpeg
// //  */
// // async function createVideoFromFrames(frames, outputPath, fps) {
// //   if (frames.length === 0) {
// //     throw new Error('No frames to process');
// //   }

// //   const framePattern = frames[0].replace('frame_0000.png', 'frame_%04d.png');
  
// //   const ffmpegCommand = `ffmpeg -y -r ${fps} -i "${framePattern}" -c:v libx264 -pix_fmt yuv420p -preset fast -crf 25 "${outputPath}"`;
  
// //   try {
// //     await execAsync(ffmpegCommand);
// //   } catch (error) {
// //     // Try alternative command format
// //     const altCommand = `ffmpeg -y -framerate ${fps} -i "${framePattern}" -c:v libx264 -pix_fmt yuv420p "${outputPath}"`;
// //     try {
// //       await execAsync(altCommand);
// //     } catch (altError) {
// //       throw new Error(`FFmpeg failed: ${error.message} | ${altError.message}`);
// //     }
// //   }
// // }

// // /**
// //  * Simple version for testing (static image if video fails)
// //  */
// // async function generateSimpleIntro(text) {
// //   const width = 800;
// //   const height = 450;
  
// //   const canvas = createCanvas(width, height);
// //   const ctx = canvas.getContext('2d');

// //   // Dark background
// //   ctx.fillStyle = '#000022';
// //   ctx.fillRect(0, 0, width, height);

// //   // Add some light rays
// //   ctx.fillStyle = 'rgba(255, 100, 0, 0.2)';
// //   for (let i = 0; i < 8; i++) {
// //     ctx.save();
// //     ctx.translate(width/2, height/2);
// //     ctx.rotate((i / 8) * Math.PI * 2);
    
// //     ctx.beginPath();
// //     ctx.moveTo(0, 0);
// //     ctx.lineTo(400, 0);
// //     ctx.lineWidth = 30;
// //     ctx.stroke();
// //     ctx.restore();
// //   }

// //   // Main text with gradient
// //   const gradient = ctx.createLinearGradient(0, 150, 0, 300);
// //   gradient.addColorStop(0, '#FF0000');
// //   gradient.addColorStop(0.3, '#FFA500');
// //   gradient.addColorStop(0.6, '#FFFF00');
// //   gradient.addColorStop(1, '#00FF00');

// //   ctx.font = 'bold 80px Arial';
// //   ctx.fillStyle = gradient;
// //   ctx.textAlign = 'center';
// //   ctx.textBaseline = 'middle';
// //   ctx.shadowColor = '#FFFFFF';
// //   ctx.shadowBlur = 20;
  
// //   ctx.fillText(text.toUpperCase(), width / 2, height / 2);

// //   // Add visualizer at bottom
// //   ctx.shadowBlur = 0;
// //   for (let i = 0; i < 16; i++) {
// //     const height = 20 + Math.sin(i * 0.5) * 15;
// //     ctx.fillStyle = `hsl(${i * 25}, 100%, 60%)`;
// //     ctx.fillRect(50 + i * 45, 380, 40, height);
// //   }

// //   return canvas.toBuffer('image/png');
// // }




























// import { createCanvas } from 'canvas';
// import { writeFileSync, unlinkSync, existsSync } from 'fs';
// import { exec } from 'child_process';
// import { promisify } from 'util';
// import { tmpdir } from 'os';
// import { join } from 'path';

// const execAsync = promisify(exec);

// export default {
//   name: "intrologo",
//   description: "Create animated video logo that works on WhatsApp",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🎵 *Video Intro Logo*\n\nUsage: intrologo <text>\n\n*Example:*\nintrologo WOLF\nintrologo EPIC\nintrologo INTRO` 
//         }, { quoted: m });
//         return;
//       }

//       const text = args.join(" ").toUpperCase();
      
//       if (text.length > 8) {
//         await sock.sendMessage(jid, { 
//           text: `❌ Text too long! Max 8 characters.\nYour text: "${text}"` 
//         }, { quoted: m });
//         return;
//       }

//       await sock.sendMessage(jid, { 
//         text: `🎵 Creating video for: "${text}"...\n⚡ Optimizing for WhatsApp...\n⏳ 10 seconds...` 
//       }, { quoted: m });

//       // Check if FFmpeg is available
//       const hasFFmpeg = await checkFFmpeg();
//       if (!hasFFmpeg) {
//         throw new Error('FFmpeg not found. Please install FFmpeg to create videos.');
//       }

//       const videoBuffer = await generateWhatsAppVideo(text);
      
//       await sock.sendMessage(jid, {
//         video: videoBuffer,
//         caption: `🎵 *VIDEO INTRO LOGO!*\nText: ${text}\n\n⚡ Animated with intense effects!`
//       }, { quoted: m });

//     } catch (error) {
//       console.error("❌ [INTROLOGO] ERROR:", error);
      
//       // Fallback to GIF
//       try {
//         await sock.sendMessage(jid, { 
//           text: `🔄 Video failed, trying GIF version...` 
//         }, { quoted: m });
        
//         const gifBuffer = await generateWhatsAppGIF(text);
//         await sock.sendMessage(jid, {
//           video: gifBuffer,
//           caption: `⚡ *ANIMATED LOGO (GIF)*\nText: ${text}\n\n🎵 Visual effects only`
//         }, { quoted: m });
//       } catch (gifError) {
//         // Final fallback to static image
//         const staticBuffer = await generateStaticLogo(text);
//         await sock.sendMessage(jid, {
//           image: staticBuffer,
//           caption: `📸 *LOGO (Static)*\nText: ${text}\n\n⚡ Video creation unavailable`
//         }, { quoted: m });
//       }
//     }
//   },
// };

// /**
//  * Check if FFmpeg is available
//  */
// async function checkFFmpeg() {
//   try {
//     await execAsync('ffmpeg -version');
//     return true;
//   } catch {
//     return false;
//   }
// }

// /**
//  * Generate WhatsApp-compatible MP4 video
//  */
// async function generateWhatsAppVideo(text) {
//   const tempDir = tmpdir();
//   const frames = [];
//   const duration = 3; // Short duration for WhatsApp
//   const fps = 10; // Lower FPS for smaller file size
//   const totalFrames = duration * fps;

//   console.log(`🔄 Generating ${totalFrames} frames...`);

//   // Generate frames
//   for (let i = 0; i < totalFrames; i++) {
//     const progress = i / totalFrames;
//     const frameBuffer = await generateVideoFrame(text, progress, i);
//     const framePath = join(tempDir, `frame_${i.toString().padStart(4, '0')}.png`);
//     writeFileSync(framePath, frameBuffer);
//     frames.push(framePath);
//   }

//   // Create WhatsApp-optimized video
//   const videoPath = join(tempDir, `whatsapp_video_${Date.now()}.mp4`);
//   await createWhatsAppVideo(frames, videoPath, fps);

//   // Cleanup frames
//   frames.forEach(frame => { try { unlinkSync(frame); } catch (e) {} });

//   const videoBuffer = writeFileSync.readFileSync(videoPath);
//   try { unlinkSync(videoPath); } catch (e) {}

//   return videoBuffer;
// }

// /**
//  * Generate WhatsApp-compatible GIF
//  */
// async function generateWhatsAppGIF(text) {
//   const tempDir = tmpdir();
//   const frames = [];
//   const totalFrames = 15; // Even fewer frames for GIF
//   const fps = 8;

//   // Generate frames
//   for (let i = 0; i < totalFrames; i++) {
//     const progress = i / totalFrames;
//     const frameBuffer = await generateVideoFrame(text, progress, i);
//     const framePath = join(tempDir, `gif_frame_${i.toString().padStart(4, '0')}.png`);
//     writeFileSync(framePath, frameBuffer);
//     frames.push(framePath);
//   }

//   // Create GIF using FFmpeg
//   const gifPath = join(tempDir, `whatsapp_gif_${Date.now()}.gif`);
//   await createGIF(frames, gifPath, fps);

//   // Cleanup
//   frames.forEach(frame => { try { unlinkSync(frame); } catch (e) {} });

//   const gifBuffer = writeFileSync.readFileSync(gifPath);
//   try { unlinkSync(gifPath); } catch (e) {}

//   return gifBuffer;
// }

// /**
//  * Create WhatsApp-optimized MP4 video
//  */
// async function createWhatsAppVideo(frames, outputPath, fps) {
//   const framePattern = frames[0].replace('frame_0000.png', 'frame_%04d.png');
  
//   // WhatsApp-compatible video settings:
//   // - H.264 codec
//   // - yuv420p pixel format (essential)
//   // - AAC audio (even if silent)
//   // - Reasonable bitrate
//   // - MP4 container
//   const command = [
//     'ffmpeg -y',
//     `-r ${fps}`,
//     `-i "${framePattern}"`,
//     '-c:v libx264',
//     '-pix_fmt yuv420p', // CRITICAL for WhatsApp compatibility
//     '-profile:v baseline', // Better compatibility
//     '-level 3.0',
//     '-crf 23',
//     '-preset fast',
//     '-tune fastdecode',
//     '-movflags +faststart',
//     '-an', // No audio for better compatibility
//     `"${outputPath}"`
//   ].join(' ');

//   await execAsync(command);
// }

// /**
//  * Create optimized GIF
//  */
// async function createGIF(frames, outputPath, fps) {
//   const framePattern = frames[0].replace('gif_frame_0000.png', 'gif_frame_%04d.png');
  
//   const command = [
//     'ffmpeg -y',
//     `-r ${fps}`,
//     `-i "${framePattern}"`,
//     '-vf "fps=10,scale=320:-1:flags=lanczos"',
//     '-c:v gif',
//     `"${outputPath}"`
//   ].join(' ');

//   await execAsync(command);
// }

// /**
//  * Generate a single video frame
//  */
// async function generateVideoFrame(text, progress, frame) {
//   const width = 480; // Smaller for WhatsApp
//   const height = 270; // 16:9 aspect ratio
  
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');

//   // Music-synced animation
//   const beat = Math.sin(progress * Math.PI * 6);
//   const bass = Math.sin(progress * Math.PI * 2);
//   const intensity = (Math.abs(beat) + Math.abs(bass)) / 2;

//   // Background
//   const bgValue = 15 + intensity * 15;
//   ctx.fillStyle = `rgb(${bgValue}, ${bgValue}, ${bgValue + 10})`;
//   ctx.fillRect(0, 0, width, height);

//   // Visual effects
//   drawSimpleRays(ctx, width, height, progress, frame);
//   drawSimpleText(ctx, text, width, height, progress, intensity);
//   drawSimpleParticles(ctx, width, height, frame);
//   drawSimpleVisualizer(ctx, width, height, progress);

//   return canvas.toBuffer('image/png');
// }

// /**
//  * Simplified light rays
//  */
// function drawSimpleRays(ctx, width, height, progress, frame) {
//   const centerX = width / 2;
//   const centerY = height / 2;
  
//   ctx.save();
//   ctx.globalAlpha = 0.4;

//   for (let i = 0; i < 6; i++) {
//     const angle = (i / 6) * Math.PI * 2 + progress * Math.PI * 4;
//     const length = 200;
//     const hue = (frame * 6 + i * 60) % 360;

//     ctx.strokeStyle = `hsla(${hue}, 100%, 60%, 0.6)`;
//     ctx.lineWidth = 8;

//     ctx.beginPath();
//     ctx.moveTo(centerX, centerY);
//     ctx.lineTo(
//       centerX + Math.cos(angle) * length,
//       centerY + Math.sin(angle) * length
//     );
//     ctx.stroke();
//   }
//   ctx.restore();
// }

// /**
//  * Simplified text with glow
//  */
// function drawSimpleText(ctx, text, width, height, progress, intensity) {
//   const centerX = width / 2;
//   const centerY = height / 2;

//   // Simple animation
//   const scale = 0.9 + intensity * 0.2;

//   ctx.save();
//   ctx.translate(centerX, centerY);
//   ctx.scale(scale, scale);

//   // Glow effect
//   ctx.shadowColor = '#FF0000';
//   ctx.shadowBlur = 15 + intensity * 10;
//   ctx.fillStyle = '#FFFFFF';
//   ctx.font = 'bold 35px Arial';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText(text, 0, 0);

//   // Main text
//   ctx.shadowBlur = 0;
//   const gradient = ctx.createLinearGradient(-80, -15, 80, 15);
//   gradient.addColorStop(0, '#FF0000');
//   gradient.addColorStop(0.5, '#FFFF00');
//   gradient.addColorStop(1, '#00FF00');

//   ctx.fillStyle = gradient;
//   ctx.fillText(text, 0, 0);

//   ctx.restore();
// }

// /**
//  * Simplified particles
//  */
// function drawSimpleParticles(ctx, width, height, frame) {
//   for (let i = 0; i < 20; i++) {
//     const angle = (i / 20) * Math.PI * 2 + frame * 0.1;
//     const distance = 40 + Math.sin(frame * 0.2 + i) * 30;
//     const size = 0.5 + Math.sin(frame * 0.3 + i) * 1;
    
//     const x = width / 2 + Math.cos(angle) * distance;
//     const y = height / 2 + Math.sin(angle) * distance;
//     const hue = (frame * 8 + i * 18) % 360;

//     ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
//     ctx.globalAlpha = 0.6;
//     ctx.beginPath();
//     ctx.arc(x, y, Math.max(0.3, size), 0, Math.PI * 2);
//     ctx.fill();
//   }
//   ctx.globalAlpha = 1.0;
// }

// /**
//  * Simplified visualizer
//  */
// function drawSimpleVisualizer(ctx, width, height, progress) {
//   const barCount = 8;
//   const visualizerHeight = 20;
//   const visualizerY = height - visualizerHeight - 5;

//   for (let i = 0; i < barCount; i++) {
//     const barWidth = (width - 10) / barCount - 2;
//     const barX = 5 + i * (barWidth + 2);
    
//     const heightFactor = Math.sin(progress * Math.PI * 8 + i * 0.5);
//     const barHeight = 3 + Math.abs(heightFactor) * visualizerHeight * 0.7;
//     const hue = (progress * 180 + i * 45) % 360;

//     ctx.fillStyle = `hsl(${hue}, 100%, 60%)`;
//     ctx.fillRect(barX, visualizerY + visualizerHeight - barHeight, barWidth, barHeight);
//   }
// }

// /**
//  * Static fallback logo
//  */
// async function generateStaticLogo(text) {
//   const width = 600;
//   const height = 300;
  
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');

//   // Simple but effective design
//   ctx.fillStyle = '#000033';
//   ctx.fillRect(0, 0, width, height);

//   // Light effects
//   for (let i = 0; i < 8; i++) {
//     ctx.strokeStyle = `hsla(${i * 45}, 100%, 60%, 0.5)`;
//     ctx.lineWidth = 4;
//     ctx.beginPath();
//     ctx.moveTo(width/2, height/2);
//     ctx.lineTo(
//       width/2 + Math.cos((i/8) * Math.PI * 2) * 250,
//       height/2 + Math.sin((i/8) * Math.PI * 2) * 250
//     );
//     ctx.stroke();
//   }

//   // Glowing text
//   ctx.shadowColor = '#FF0000';
//   ctx.shadowBlur = 20;
//   ctx.font = 'bold 60px Arial';
//   ctx.fillStyle = '#FFFFFF';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
//   ctx.fillText(text, width / 2, height / 2);

//   return canvas.toBuffer('image/png');
// }







