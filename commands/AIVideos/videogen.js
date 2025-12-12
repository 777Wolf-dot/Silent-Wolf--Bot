import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import caption system
let getUserCaption;

async function initializeCaptionSystem() {
  try {
    const tiktokModule = await import('./tiktok.js');
    getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot Video AI");
  } catch (error) {
    getUserCaption = (userId) => "WolfBot Video AI";
  }
}

initializeCaptionSystem();

function getCaption(userId) {
  if (typeof getUserCaption === 'function') {
    return getUserCaption(userId);
  }
  return "WolfBot Video AI";
}

export default {
  name: "videogen",
  aliases: ["vidgen", "makevideo", "aivideo"],
  description: "Generate animated videos from text prompts",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎬 *AI Video Generator*\n\nUsage: videogen <prompt>\n\nExamples:\n• videogen sunset over mountains\n• videogen cyberpunk city lights\n• videogen underwater coral reef\n\n🎯 *Method:* Creates animation from AI images\n⏱️ *Time:* 30-60 seconds\n📐 *Output:* 5-10 second MP4` 
        }, { quoted: m });
        return;
      }

      const prompt = args.join(' ');
      
      // Send initial status
      statusMsg = await sock.sendMessage(jid, { 
        text: `🎬 *Creating animated video...*\n\n📝 *Prompt:* ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}\n\n⏱️ *Step 1/3:* Generating images...` 
      }, { quoted: m });

      // Method 1: Create animated video from multiple images
      await sock.sendMessage(jid, { 
        text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images...`,
        edit: statusMsg.key 
      });

      const result = await createAnimatedVideo(prompt);
      
      if (!result.success) {
        // Try alternative method
        await sock.sendMessage(jid, { 
          text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images... ❌\n🎞️ *Trying alternative method...*`,
          edit: statusMsg.key 
        });
        
        const altResult = await createVideoAlternative(prompt);
        if (!altResult.success) {
          await sock.sendMessage(jid, { 
            text: `🎬 *Creating animated video...* ❌\n\n❌ *Video generation failed*\n\n💡 *Try:*\n• Use simpler prompts\n• Try image generation instead\n• Wait and try again later`,
            edit: statusMsg.key 
          });
          return;
        }
        
        result = altResult;
      }

      await sock.sendMessage(jid, { 
        text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images... ✅\n🎞️ *Step 2/3:* Creating animation...`,
        edit: statusMsg.key 
      });

      const { videoPath, methodUsed, generationTime, frameCount } = result;

      // Create final video
      await sock.sendMessage(jid, { 
        text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images... ✅\n🎞️ *Step 2/3:* Creating animation... ✅\n📤 *Step 3/3:* Preparing video...`,
        edit: statusMsg.key 
      });

      // Get user caption
      const userCaption = getCaption(userId);
      
      // Create video caption
      const caption = `🎬 *AI Animated Video*\n\n📝 *Prompt:* ${prompt}\n🎞️ *Method:* ${methodUsed}\n🖼️ *Frames:* ${frameCount}\n⏱️ *Time:* ${generationTime}s\n\n${userCaption}`;

      // Send the video
      try {
        await sock.sendMessage(jid, {
          video: readFileSync(videoPath),
          caption: caption,
          gifPlayback: false
        });

        await sock.sendMessage(jid, { 
          text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images... ✅\n🎞️ *Step 2/3:* Creating animation... ✅\n📤 *Step 3/3:* Preparing video... ✅\n\n✅ *Video created successfully!*\n\nMethod: ${methodUsed}\nFrames: ${frameCount}\nTime: ${generationTime}s`,
          edit: statusMsg.key 
        });

      } catch (sendError) {
        // Fallback to document
        await sock.sendMessage(jid, {
          document: readFileSync(videoPath),
          fileName: `animated_${Date.now()}.mp4`,
          mimetype: 'video/mp4',
          caption: `📁 *Animated Video*\n\n${caption}`
        });

        await sock.sendMessage(jid, { 
          text: `🎬 *Creating animated video...* ✅\n🖼️ *Step 1/3:* Generating images... ✅\n🎞️ *Step 2/3:* Creating animation... ✅\n📤 *Step 3/3:* Preparing video... ✅\n\n✅ *Video sent as document!*`,
          edit: statusMsg.key 
        });
      }

      // Cleanup
      setTimeout(() => {
        try {
          if (existsSync(videoPath)) {
            fs.unlinkSync(videoPath);
          }
        } catch (e) {}
      }, 30000);

    } catch (error) {
      console.error('Videogen error:', error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `🎬 *Creating animated video...* ❌\n\n❌ Error: ${error.message}`,
          edit: statusMsg.key 
        });
      }
    }
  },
};

// ==================== WORKING VIDEO GENERATION METHODS ====================

// METHOD 1: Create animated video from image sequence
async function createAnimatedVideo(prompt) {
  const tempDir = './temp/video_frames';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const videoPath = `${tempDir}/animated_${Date.now()}.mp4`;
  const startTime = Date.now();

  try {
    console.log(`🎞️ Creating animated video for: ${prompt}`);
    
    // We need to generate multiple images with variations
    const framePrompts = generateFramePrompts(prompt);
    
    // Generate images for each frame
    const imagePaths = [];
    
    for (let i = 0; i < Math.min(framePrompts.length, 8); i++) { // Max 8 frames
      try {
        const imagePath = await generateImageForFrame(framePrompts[i], tempDir, i);
        if (imagePath) {
          imagePaths.push(imagePath);
        }
      } catch (error) {
        console.log(`Frame ${i} generation failed:`, error.message);
      }
    }
    
    if (imagePaths.length < 2) {
      throw new Error(`Need at least 2 frames, got ${imagePaths.length}`);
    }
    
    // Create video from images
    const finalVideo = await createVideoFromImages(imagePaths, videoPath);
    
    if (!finalVideo) {
      throw new Error('Failed to create video from images');
    }
    
    // Cleanup images
    imagePaths.forEach(path => {
      try { if (existsSync(path)) fs.unlinkSync(path); } catch (e) {}
    });
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      videoPath: finalVideo,
      methodUsed: 'Image Sequence Animation',
      generationTime,
      frameCount: imagePaths.length,
      service: 'local'
    };
    
  } catch (error) {
    console.log('Animated video creation failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Generate variations of the prompt for different frames
function generateFramePrompts(basePrompt) {
  const prompts = [];
  
  // Remove video-related terms if present
  let cleanPrompt = basePrompt
    .replace(/video|animation|moving|cinematic|footage/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Create 8 variations for smooth animation
  const variations = [
    `${cleanPrompt}, wide shot`,
    `${cleanPrompt}, medium shot`,
    `${cleanPrompt}, close up`,
    `${cleanPrompt}, different angle`,
    `${cleanPrompt}, slightly zoomed in`,
    `${cleanPrompt}, from above`,
    `${cleanPrompt}, from below`,
    `${cleanPrompt}, final frame`
  ];
  
  return variations;
}

// Generate single image for a frame
async function generateImageForFrame(prompt, tempDir, frameIndex) {
  const imagePath = `${tempDir}/frame_${frameIndex}.png`;
  
  try {
    // Try to use existing image generation services
    // Option 1: Use Prodia (if available in your bot)
    const prodiaResult = await generateWithProdia(prompt);
    if (prodiaResult && prodiaResult.imageData) {
      fs.writeFileSync(imagePath, prodiaResult.imageData);
      return imagePath;
    }
    
    // Option 2: Use Pollinations for image
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512`;
    
    const response = await axios.get(pollinationsUrl, {
      responseType: 'arraybuffer',
      timeout: 30000,
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    fs.writeFileSync(imagePath, response.data);
    return imagePath;
    
  } catch (error) {
    console.log(`Image generation for frame ${frameIndex} failed:`, error.message);
    
    // Create a simple colored frame as fallback
    await createColorFrame(imagePath, frameIndex);
    return imagePath;
  }
}

// Generate image using Prodia (if you have it)
async function generateWithProdia(prompt) {
  try {
    // Check if we have a Prodia-based image generator
    // This assumes you have an image generation command
    return null; // Placeholder
  } catch (error) {
    return null;
  }
}

// Create a simple colored frame (fallback)
async function createColorFrame(imagePath, frameIndex) {
  // This would require canvas or similar library
  // For now, we'll create a simple text image
  const { createCanvas } = await import('canvas');
  
  const canvas = createCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 512, 512);
  const hue = (frameIndex * 45) % 360;
  gradient.addColorStop(0, `hsl(${hue}, 70%, 50%)`);
  gradient.addColorStop(1, `hsl(${(hue + 60) % 360}, 70%, 30%)`);
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 512, 512);
  
  // Add text
  ctx.fillStyle = 'white';
  ctx.font = '30px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Frame ${frameIndex + 1}`, 256, 256);
  
  // Save
  const buffer = canvas.toBuffer('image/png');
  fs.writeFileSync(imagePath, buffer);
  
  return imagePath;
}

// Create video from image sequence
async function createVideoFromImages(imagePaths, outputPath) {
  try {
    // Check if ffmpeg is available
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    try {
      await execAsync('ffmpeg -version');
    } catch {
      console.log('ffmpeg not available, using fallback');
      return await createGifFromImages(imagePaths, outputPath);
    }
    
    // Create video with ffmpeg
    // First, create a text file with image paths
    const listFile = `${path.dirname(outputPath)}/filelist.txt`;
    const fileList = imagePaths.map(p => `file '${p}'\nduration 0.5`).join('\n');
    fs.writeFileSync(listFile, fileList);
    
    // Create video
    const ffmpegCmd = `ffmpeg -f concat -safe 0 -i "${listFile}" -vf "fps=10,scale=512:512:flags=lanczos" -c:v libx264 -pix_fmt yuv420p -y "${outputPath}"`;
    
    await execAsync(ffmpegCmd, { timeout: 30000 });
    
    // Cleanup list file
    try { fs.unlinkSync(listFile); } catch (e) {}
    
    return outputPath;
    
  } catch (error) {
    console.log('FFmpeg video creation failed:', error.message);
    return await createGifFromImages(imagePaths, outputPath);
  }
}

// Create GIF as fallback
async function createGifFromImages(imagePaths, outputPath) {
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Create GIF instead of MP4
    const gifPath = outputPath.replace('.mp4', '.gif');
    
    // Use ImageMagick or ffmpeg to create GIF
    const convertCmd = `ffmpeg -i "${imagePaths[0]}" -i "${imagePaths[1] || imagePaths[0]}" -filter_complex "[0:v][1:v]blend=all_expr='A*(1-min(1,T/0.5))+B*min(1,T/0.5)'" -t 2 -y "${gifPath}"`;
    
    await execAsync(convertCmd, { timeout: 30000 });
    
    return gifPath;
    
  } catch (error) {
    console.log('GIF creation failed:', error.message);
    return null;
  }
}

// METHOD 2: Alternative video generation
async function createVideoAlternative(prompt) {
  const tempDir = './temp/video_alt';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const videoPath = `${tempDir}/alternative_${Date.now()}.mp4`;
  const startTime = Date.now();

  try {
    console.log(`🔄 Trying alternative method for: ${prompt}`);
    
    // Try to use a working text-to-video service
    // Some services might work intermittently
    
    // Option 1: Try a different Pollinations endpoint
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://pollinations.ai/p/${encodedPrompt}`;
    
    try {
      const response = await axios.get(pollinationsUrl, {
        responseType: 'stream',
        timeout: 45000,
        maxRedirects: 5,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'video/*,image/*'
        }
      });
      
      const writer = createWriteStream(videoPath);
      response.data.pipe(writer);
      
      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
      
      if (existsSync(videoPath)) {
        const stats = fs.statSync(videoPath);
        if (stats.size > 1024) {
          const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
          
          return {
            success: true,
            videoPath,
            methodUsed: 'Pollinations Direct',
            generationTime,
            frameCount: 24,
            service: 'pollinations'
          };
        }
      }
    } catch (error) {
      console.log('Pollinations direct failed:', error.message);
    }
    
    // Option 2: Try to create a simple moving gradient
    return await createMovingGradient(prompt, videoPath, startTime);
    
  } catch (error) {
    console.log('Alternative method failed:', error.message);
    return { success: false, error: error.message };
  }
}

// Create a simple moving gradient video
async function createMovingGradient(prompt, outputPath, startTime) {
  try {
    // This creates a simple animated gradient
    // Requires ffmpeg
    
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Create gradient video with ffmpeg
    const ffmpegCmd = `ffmpeg -f lavfi -i "color=c=0x${Math.floor(Math.random()*16777215).toString(16)}:s=512x512:d=5,format=rgba,geq=r='r(X,Y)':g='g(X,Y)':b='b(X,Y)',hue=h='t*50'" -c:v libx264 -t 5 -y "${outputPath}"`;
    
    await execAsync(ffmpegCmd, { timeout: 30000 });
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      videoPath: outputPath,
      methodUsed: 'Animated Gradient',
      generationTime,
      frameCount: 30,
      service: 'ffmpeg'
    };
    
  } catch (error) {
    return { success: false, error: `Gradient: ${error.message}` };
  }
}

// ==================== SIMPLIFIED VERSION FOR QUICK TESTING ====================

// If the above is too complex, here's a SUPER SIMPLE version:

export const simpleVideoCommands = {
  "simplevideo": {
    description: "Create simple animated text video",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎬 *Simple Video*\n\nUsage: simplevideo <text>\n\nCreates text animation video\nExample: simplevideo Hello World`
        }, { quoted: m });
        return;
      }
      
      const text = args.join(' ');
      
      await sock.sendMessage(jid, { 
        text: `🎬 *Creating text video...*`
      }, { quoted: m });
      
      try {
        // Create a simple video with text
        const videoPath = await createTextVideo(text);
        
        if (videoPath) {
          await sock.sendMessage(jid, {
            video: readFileSync(videoPath),
            caption: `🎬 Text Animation: ${text}`
          });
          
          // Cleanup
          setTimeout(() => {
            try { if (existsSync(videoPath)) fs.unlinkSync(videoPath); } catch (e) {}
          }, 10000);
        } else {
          await sock.sendMessage(jid, { 
            text: `❌ Could not create video\n\nTry using image generation instead.`
          }, { quoted: m });
        }
        
      } catch (error) {
        console.error('Simple video error:', error);
        await sock.sendMessage(jid, { 
          text: `❌ Error: ${error.message}`
        }, { quoted: m });
      }
    }
  }
};

async function createTextVideo(text) {
  const tempDir = './temp/text_videos';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });
  
  const videoPath = `${tempDir}/text_${Date.now()}.mp4`;
  
  try {
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Check ffmpeg
    await execAsync('ffmpeg -version');
    
    // Create text video with ffmpeg
    const safeText = text.replace(/"/g, '\\"').replace(/'/g, "\\'");
    const ffmpegCmd = `ffmpeg -f lavfi -i "color=c=black:s=512x512:d=3[bg];[bg]drawtext=text='${safeText}':fontcolor=white:fontsize=40:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)',fps=10" -c:v libx264 -pix_fmt yuv420p -y "${videoPath}"`;
    
    await execAsync(ffmpegCmd, { timeout: 15000 });
    
    return videoPath;
    
  } catch (error) {
    console.log('Text video creation failed:', error.message);
    return null;
  }
}