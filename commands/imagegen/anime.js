import axios from 'axios';
import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import fs from 'fs';

// Import caption system
let getUserCaption;

async function initializeCaptionSystem() {
  try {
    const tiktokModule = await import('./tiktok.js');
    getUserCaption = tiktokModule.getUserCaption || ((userId) => "WolfBot is the Alpha");
  } catch (error) {
    getUserCaption = (userId) => "WolfBot is the Alpha";
  }
}

initializeCaptionSystem();

function getCaption(userId) {
  if (typeof getUserCaption === 'function') {
    return getUserCaption(userId);
  }
  return "WolfBot is the Alpha";
}

export default {
  name: "anime",
  aliases: ["animediff", "animegen", "waifu"],
  description: "Generate anime-style AI images",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Anime Image Generator*\n\nUsage: anime <prompt>\n\nExamples:\nanime cute cat girl with blue hair\nanime cyberpunk samurai in tokyo\nanime fantasy elf warrior, detailed\n\n🎭 *Styles Available:*\n• Anything V5 (best for anime)\n• AOM3 (anime mix)\n• Counterfeit V3\n• MeinaMix\n• Pastel Anime\n\n💡 *Tips:*\n• Be descriptive\n• Include style keywords\n• Specify character details` 
        }, { quoted: m });
        return;
      }

      const prompt = args.join(' ');
      
      // Send initial status
      statusMsg = await sock.sendMessage(jid, { 
        text: `🎨 *Generating anime image...*\n\n📝 *Prompt:* ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}` 
      }, { quoted: m });

      // Try multiple anime AI services
      const result = await generateAnimeImage(prompt);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Generating anime image...* ❌\n\n❌ ${result.error || 'Failed to generate image'}`,
          edit: statusMsg.key 
        });
        return;
      }

      const { imagePath, modelUsed, generationTime } = result;

      await sock.sendMessage(jid, { 
        text: `🎨 *Generating anime image...* ✅\n📤 *Sending image...*`,
        edit: statusMsg.key 
      });

      // Get user's caption
      const userCaption = getCaption(userId);
      
      // Send the generated image
      await sock.sendMessage(jid, {
        image: readFileSync(imagePath),
        caption: `🎨 *Anime AI Art*\n\n📝 *Prompt:* ${prompt}\n🖼️ *Model:* ${modelUsed}\n⏱️ *Time:* ${generationTime}s\n\n${userCaption}`
      });

      await sock.sendMessage(jid, { 
        text: `🎨 *Generating anime image...* ✅\n📤 *Sending image...* ✅\n\n✅ *Image generated successfully!*\n\nModel: ${modelUsed}\nTime: ${generationTime}s`,
        edit: statusMsg.key 
      });

      // Cleanup
      cleanupFile(imagePath);

    } catch (error) {
      console.error('Anime command error:', error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Generating anime image...* ❌\n\n❌ Error: ${error.message.substring(0, 100)}`,
          edit: statusMsg.key 
        });
      }
    }
  },
};

// ==================== ANIME GENERATION FUNCTIONS ====================

async function generateAnimeImage(prompt) {
  const tempDir = './temp/anime';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const imagePath = `${tempDir}/anime_${timestamp}.png`;

  try {
    // Try Prodia API first (fast, free, reliable for anime)
    const prodiaResult = await tryProdiaGeneration(prompt, imagePath);
    if (prodiaResult.success) return prodiaResult;

    // Try Pollinations.ai as backup
    const pollinationsResult = await tryPollinationsGeneration(prompt, imagePath);
    if (pollinationsResult.success) return pollinationsResult;

    // Try Hugging Face as last resort
    const huggingfaceResult = await tryHuggingFaceGeneration(prompt, imagePath);
    if (huggingfaceResult.success) return huggingfaceResult;

    return { 
      success: false, 
      error: 'All anime generation services are currently unavailable' 
    };

  } catch (error) {
    console.error('Anime generation error:', error);
    cleanupFile(imagePath);
    return { success: false, error: error.message };
  }
}

// ==================== SERVICE 1: PRODIA API ====================
async function tryProdiaGeneration(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhanced anime prompt with style keywords
    const enhancedPrompt = enhanceAnimePrompt(prompt);
    
    // Select best anime model
    const model = selectAnimeModel(prompt);
    
    console.log(`Using Prodia model: ${model}`);
    
    // Step 1: Create generation job
    const createResponse = await axios.post('https://api.prodia.com/v1/job', {
      model: model,
      prompt: enhancedPrompt,
      negative_prompt: getNegativePrompt(prompt),
      steps: 25,
      cfg_scale: 7,
      seed: -1,
      upscale: false
    }, {
      headers: {
        'X-Prodia-Key': 'YOUR_PRODIA_API_KEY', // Can be empty for free tier
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const jobId = createResponse.data.job;
    
    if (!jobId) {
      throw new Error('Failed to create generation job');
    }

    // Step 2: Wait for generation to complete
    let imageUrl = null;
    let attempts = 0;
    const maxAttempts = 60; // 30 seconds max (500ms * 60)
    
    while (attempts < maxAttempts) {
      attempts++;
      
      try {
        const statusResponse = await axios.get(`https://api.prodia.com/v1/job/${jobId}`, {
          timeout: 5000
        });
        
        if (statusResponse.data.status === 'succeeded') {
          imageUrl = statusResponse.data.imageUrl;
          break;
        } else if (statusResponse.data.status === 'failed') {
          throw new Error('Generation failed');
        }
        
        // Wait 500ms before checking again
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (statusError) {
        // Continue waiting
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!imageUrl) {
      throw new Error('Generation timeout');
    }

    // Step 3: Download the generated image
    await downloadImageFile(imageUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `Prodia: ${model}`,
      generationTime,
      service: 'prodia'
    };

  } catch (error) {
    console.log('Prodia generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 2: POLLINATIONS.AI ====================
async function tryPollinationsGeneration(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhanced anime prompt
    const enhancedPrompt = enhanceAnimePrompt(prompt);
    
    // Pollinations supports anime models
    const model = 'anime'; // or 'anything-v4' or 'waifu-diffusion'
    
    // URL encode prompt
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Pollinations API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=768&model=${model}&seed=${Math.floor(Math.random() * 1000000)}`;
    
    console.log(`Using Pollinations model: ${model}`);
    
    // Download directly (Pollinations streams the image)
    await downloadImageFile(apiUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `Pollinations: ${model}`,
      generationTime,
      service: 'pollinations'
    };

  } catch (error) {
    console.log('Pollinations generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 3: HUGGING FACE ====================
async function tryHuggingFaceGeneration(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Use a free Hugging Face model for anime
    // Model: hakurei/waifu-diffusion or anything-v4
    const model = 'hakurei/waifu-diffusion';
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        inputs: enhanceAnimePrompt(prompt),
        parameters: {
          negative_prompt: getNegativePrompt(prompt),
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN', // Can sometimes work without
          'Content-Type': 'application/json'
        },
        responseType: 'arraybuffer',
        timeout: 60000
      }
    );

    // Save the image
    fs.writeFileSync(imagePath, response.data);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `HuggingFace: ${model.split('/')[1]}`,
      generationTime,
      service: 'huggingface'
    };

  } catch (error) {
    console.log('Hugging Face generation failed:', error.message);
    return { success: false };
  }
}

// ==================== PROMPT ENHANCEMENT FUNCTIONS ====================

function enhanceAnimePrompt(prompt) {
  // Remove any existing style tags
  let enhanced = prompt.toLowerCase();
  
  // Add anime style keywords if not present
  const styleKeywords = [
    'anime style',
    'anime artwork',
    'anime illustration',
    'anime character',
    'detailed anime',
    'high quality anime'
  ];
  
  const hasStyle = styleKeywords.some(keyword => enhanced.includes(keyword));
  
  if (!hasStyle) {
    // Pick a random style enhancement
    const enhancements = [
      'anime style, masterpiece, best quality',
      'anime art, detailed, vibrant colors',
      'anime character, detailed face, expressive eyes',
      'anime illustration, digital art, trending on pixiv',
      'anime artwork, sharp focus, studio ghibli style'
    ];
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    enhanced = `${prompt}, ${randomEnhancement}`;
  }
  
  // Add quality tags
  const qualityTags = 'masterpiece, best quality, detailed, 4k, sharp focus';
  if (!enhanced.includes('masterpiece') && !enhanced.includes('best quality')) {
    enhanced = `${enhanced}, ${qualityTags}`;
  }
  
  return enhanced;
}

function getNegativePrompt(prompt) {
  // Standard negative prompts for anime generation
  const baseNegatives = 'low quality, worst quality, bad anatomy, blurry, ugly, deformed, disfigured, poorly drawn, bad hands, text, error, missing fingers, extra digit, fewer digits, cropped, jpeg artifacts, signature, watermark, username';
  
  // Add specific negatives based on prompt
  let negatives = baseNegatives;
  
  if (prompt.toLowerCase().includes('realistic') || prompt.toLowerCase().includes('photo')) {
    negatives += ', 3d, realistic, photorealistic, cgi, render';
  }
  
  if (prompt.toLowerCase().includes('simple') || prompt.toLowerCase().includes('minimal')) {
    negatives += ', detailed, complex, busy, cluttered';
  }
  
  return negatives;
}

function selectAnimeModel(prompt) {
  // Choose best model based on prompt content
  const promptLower = prompt.toLowerCase();
  
  // Model mapping
  const models = {
    // General anime (best all-around)
    'anything': 'anything-v4.5-pruned.ckpt [65745d25]',
    
    // High quality anime
    'aom3': 'AOM3A1B_orangemixs.safetensors [960c4b8d]',
    
    // Anime mix
    'counterfeit': 'counterfeitV30_v30.safetensors [2d4d2c5a]',
    
    // Cute/colorful anime
    'meinamix': 'meinamix_meinaV11.safetensors [b56ce717]',
    
    // Soft/pastel anime
    'pastel': 'pastelMixStylizedAnime_pruned_fp16.safetensors [2b7ba6b2]',
    
    // Detailed anime
    'revanimated': 'revAnimated_v122.safetensors [3f4b0d6c]'
  };
  
  // Check for specific style keywords
  if (promptLower.includes('pastel') || promptLower.includes('soft') || promptLower.includes('cute')) {
    return models.pastel;
  }
  
  if (promptLower.includes('detailed') || promptLower.includes('intricate') || promptLower.includes('complex')) {
    return models.revanimated;
  }
  
  if (promptLower.includes('colorful') || promptLower.includes('vibrant')) {
    return models.meinamix;
  }
  
  if (promptLower.includes('high quality') || promptLower.includes('masterpiece')) {
    return models.aom3;
  }
  
  // Default to Anything V5 (best for general anime)
  return models.anything;
}

// ==================== UTILITY FUNCTIONS ====================

async function downloadImageFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const writer = createWriteStream(filePath);
    
    axios({
      method: 'GET',
      url: url,
      responseType: 'stream',
      timeout: 60000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/*',
        'Referer': 'https://prodia.com/'
      }
    })
    .then(response => {
      // Validate it's actually an image
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error('Response is not an image'));
        return;
      }
      
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        // Verify file was written
        if (existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 0) {
            resolve();
          } else {
            reject(new Error('Empty file downloaded'));
          }
        } else {
          reject(new Error('File not created'));
        }
      });
      
      writer.on('error', reject);
    })
    .catch(error => {
      reject(error);
    });
  });
}

function cleanupFile(filePath) {
  setTimeout(() => {
    try {
      if (existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log(`✅ Cleaned up anime image: ${filePath}`);
      }
    } catch (e) {
      console.log('Anime cleanup error:', e.message);
    }
  }, 10000); // Cleanup after 10 seconds
}

// ==================== ADDITIONAL COMMANDS ====================

// You can add these as separate exports or extend the existing one
export const animeCommands = {
  "styles": {
    description: "List available anime styles",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const stylesText = `🎭 *Available Anime Styles:*\n\n` +
        `• *Anything V5* - Best general anime\n` +
        `• *AOM3* - High quality, detailed\n` +
        `• *Counterfeit V3* - Balanced anime\n` +
        `• *MeinaMix* - Colorful, vibrant\n` +
        `• *Pastel Mix* - Soft, cute style\n` +
        `• *Rev Animated* - Highly detailed\n\n` +
        `💡 Use: anime <prompt>\n` +
        `Example: anime beautiful elf princess, pastel mix style`;
      
      await sock.sendMessage(jid, { text: stylesText }, { quoted: m });
    }
  },
  
  "animehelp": {
    description: "Anime generation help",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const helpText = `🎨 *Anime AI Generation Guide*\n\n` +
        `*Basic Commands:*\n` +
        `• anime <prompt> - Generate anime image\n` +
        `• animediff <prompt> - Same as anime\n` +
        `• waifu <prompt> - Generate waifu image\n\n` +
        `*Prompt Tips:*\n` +
        `• Be descriptive with details\n` +
        `• Mention hair/eye colors\n` +
        `• Specify outfits/styles\n` +
        `• Add background details\n\n` +
        `*Example Prompts:*\n` +
        "anime cat girl with pink hair, blue eyes, wearing school uniform, cherry blossom background, detailed face\n" +
        "anime cyberpunk samurai in neon tokyo, rain, reflections, cinematic lighting\n" +
        "anime fantasy elf archer in forest, magical glow, detailed armor, dynamic pose";
      
      await sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
  }
};