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
  name: "real",
  aliases: ["realistic", "photo", "photoreal", "realgen"],
  description: "Generate photorealistic AI images",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `📸 *Photorealistic Image Generator*\n\nUsage: real <prompt>\n\nExamples:\nreal beautiful woman in paris, photorealistic\nreal cyberpunk city at night, 8k, cinematic\nreal astronaut on mars, detailed, photography\n\n🎭 *Realistic Models:*\n• Realistic Vision (best for people)\n• Deliberate (detailed scenes)\n• DreamShaper (versatile)\n• ChilloutMix (Asian realistic)\n• Analog Diffusion (film photography)\n\n💡 *Tips for Realism:*\n• Add "photorealistic", "photography"\n• Specify camera/lens: "85mm portrait"\n• Add lighting: "cinematic lighting"\n• Specify resolution: "8k", "4k"` 
        }, { quoted: m });
        return;
      }

      const prompt = args.join(' ');
      
      // Check prompt length
      if (prompt.length < 5) {
        await sock.sendMessage(jid, { 
          text: `❌ *Prompt too short*\n\nPlease provide a more detailed description.\nExample: "real photorealistic portrait of a woman in paris, 85mm lens, cinematic lighting"` 
        }, { quoted: m });
        return;
      }

      // Send initial status
      statusMsg = await sock.sendMessage(jid, { 
        text: `📸 *Generating photorealistic image...*\n\n📝 *Prompt:* ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}` 
      }, { quoted: m });

      // Try multiple realistic AI services
      const result = await generateRealisticImage(prompt);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `📸 *Generating photorealistic image...* ❌\n\n❌ ${result.error || 'Failed to generate image'}`,
          edit: statusMsg.key 
        });
        return;
      }

      const { imagePath, modelUsed, generationTime, dimensions } = result;

      await sock.sendMessage(jid, { 
        text: `📸 *Generating photorealistic image...* ✅\n📤 *Sending image...*`,
        edit: statusMsg.key 
      });

      // Get user's caption
      const userCaption = getCaption(userId);
      
      // Create detailed caption
      const caption = `📸 *Photorealistic AI Image*\n\n📝 *Prompt:* ${prompt}\n🖼️ *Model:* ${modelUsed}\n📐 *Size:* ${dimensions}\n⏱️ *Time:* ${generationTime}s\n\n${userCaption}`;
      
      // Send the generated image
      await sock.sendMessage(jid, {
        image: readFileSync(imagePath),
        caption: caption
      });

      await sock.sendMessage(jid, { 
        text: `📸 *Generating photorealistic image...* ✅\n📤 *Sending image...* ✅\n\n✅ *Image generated successfully!*\n\nModel: ${modelUsed}\nSize: ${dimensions}\nTime: ${generationTime}s`,
        edit: statusMsg.key 
      });

      // Cleanup
      cleanupFile(imagePath);

    } catch (error) {
      console.error('Real command error:', error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `📸 *Generating photorealistic image...* ❌\n\n❌ Error: ${error.message.substring(0, 100)}`,
          edit: statusMsg.key 
        });
      }
    }
  },
};

// ==================== REALISTIC GENERATION FUNCTIONS ====================

async function generateRealisticImage(prompt) {
  const tempDir = './temp/realistic';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const imagePath = `${tempDir}/real_${timestamp}.png`;

  try {
    // Try Prodia API first (has best realistic models)
    const prodiaResult = await tryProdiaRealistic(prompt, imagePath);
    if (prodiaResult.success) return prodiaResult;

    // Try Pollinations.ai with realistic model
    const pollinationsResult = await tryPollinationsRealistic(prompt, imagePath);
    if (pollinationsResult.success) return pollinationsResult;

    // Try Stability AI via Replicate
    const stabilityResult = await tryStabilityAI(prompt, imagePath);
    if (stabilityResult.success) return stabilityResult;

    // Try Clipdrop as last resort
    const clipdropResult = await tryClipdrop(prompt, imagePath);
    if (clipdropResult.success) return clipdropResult;

    return { 
      success: false, 
      error: 'All realistic generation services are currently unavailable' 
    };

  } catch (error) {
    console.error('Realistic generation error:', error);
    cleanupFile(imagePath);
    return { success: false, error: error.message };
  }
}

// ==================== SERVICE 1: PRODIA REALISTIC ====================
async function tryProdiaRealistic(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhanced realistic prompt
    const enhancedPrompt = enhanceRealisticPrompt(prompt);
    
    // Select best realistic model
    const model = selectRealisticModel(prompt);
    const dimensions = selectDimensions(prompt);
    
    console.log(`Using Prodia model: ${model}, Dimensions: ${dimensions}`);
    
    // Step 1: Create generation job
    const createResponse = await axios.post('https://api.prodia.com/v1/job', {
      model: model,
      prompt: enhancedPrompt,
      negative_prompt: getRealisticNegativePrompt(prompt),
      steps: 30, // More steps for realism
      cfg_scale: 7.5,
      seed: -1,
      sampler: 'DPM++ 2M Karras', // Best for realism
      aspect_ratio: getAspectRatio(dimensions),
      upscale: true // Enable upscaling for realism
    }, {
      headers: {
        'X-Prodia-Key': '', // Empty for free tier
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
    const maxAttempts = 80; // 40 seconds max (500ms * 80)
    
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
      modelUsed: `Prodia: ${getModelName(model)}`,
      generationTime,
      dimensions: dimensions,
      service: 'prodia'
    };

  } catch (error) {
    console.log('Prodia realistic generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 2: POLLINATIONS REALISTIC ====================
async function tryPollinationsRealistic(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhanced realistic prompt
    const enhancedPrompt = enhanceRealisticPrompt(prompt);
    const dimensions = selectDimensions(prompt);
    
    // Parse dimensions
    const [width, height] = dimensions.split('x').map(Number);
    
    // Pollinations with SDXL for realism
    const model = 'stable-diffusion-xl'; // SDXL is more realistic
    
    // URL encode prompt
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Pollinations API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&model=${model}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;
    
    console.log(`Using Pollinations model: ${model}, Dimensions: ${dimensions}`);
    
    // Download directly
    await downloadImageFile(apiUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: `Pollinations: ${model}`,
      generationTime,
      dimensions: dimensions,
      service: 'pollinations'
    };

  } catch (error) {
    console.log('Pollinations realistic generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 3: STABILITY AI ====================
async function tryStabilityAI(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // This uses Replicate API which has free tier
    const enhancedPrompt = enhanceRealisticPrompt(prompt);
    
    const response = await axios.post(
      'https://api.replicate.com/v1/predictions',
      {
        version: "stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b",
        input: {
          prompt: enhancedPrompt,
          negative_prompt: getRealisticNegativePrompt(prompt),
          width: 1024,
          height: 1024,
          num_outputs: 1,
          scheduler: "DPMSolverMultistep",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          prompt_strength: 0.8,
          refine: "expert_ensemble_refiner"
        }
      },
      {
        headers: {
          'Authorization': 'Token YOUR_REPLICATE_TOKEN', // Optional for limited free
          'Content-Type': 'application/json'
        },
        timeout: 60000
      }
    );

    const predictionId = response.data.id;
    
    if (!predictionId) {
      throw new Error('Failed to create prediction');
    }

    // Wait for completion
    let output = null;
    let attempts = 0;
    
    while (attempts < 40) {
      attempts++;
      
      const statusResponse = await axios.get(
        `https://api.replicate.com/v1/predictions/${predictionId}`,
        {
          headers: {
            'Authorization': 'Token YOUR_REPLICATE_TOKEN'
          },
          timeout: 5000
        }
      );
      
      if (statusResponse.data.status === 'succeeded') {
        output = statusResponse.data.output;
        break;
      } else if (statusResponse.data.status === 'failed') {
        throw new Error('Generation failed');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!output || !output[0]) {
      throw new Error('Generation timeout');
    }

    // Download the image
    await downloadImageFile(output[0], imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      modelUsed: 'Stability AI SDXL',
      generationTime,
      dimensions: '1024x1024',
      service: 'stability-ai'
    };

  } catch (error) {
    console.log('Stability AI generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 4: CLIPDROP ====================
async function tryClipdrop(prompt, imagePath) {
  try {
    const startTime = Date.now();
    
    // Clipdrop by Stability AI (free tier available)
    const enhancedPrompt = enhanceRealisticPrompt(prompt);
    
    const response = await axios.post(
      'https://clipdrop-api.co/text-to-image/v1',
      {
        prompt: enhancedPrompt
      },
      {
        headers: {
          'x-api-key': 'YOUR_CLIPDROP_KEY', // Free tier available
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
      modelUsed: 'Clipdrop (Stability AI)',
      generationTime,
      dimensions: '1024x1024',
      service: 'clipdrop'
    };

  } catch (error) {
    console.log('Clipdrop generation failed:', error.message);
    return { success: false };
  }
}

// ==================== PROMPT ENHANCEMENT FUNCTIONS ====================

function enhanceRealisticPrompt(prompt) {
  let enhanced = prompt;
  const promptLower = prompt.toLowerCase();
  
  // Check if already has realistic keywords
  const realisticKeywords = [
    'photorealistic', 'photography', 'photo', 'realistic',
    'hyperrealistic', 'cinematic', '8k', '4k', 'ultra realistic',
    'professional photography', 'detailed', 'high detail'
  ];
  
  const hasRealistic = realisticKeywords.some(keyword => promptLower.includes(keyword));
  
  if (!hasRealistic) {
    // Add realistic enhancement
    const enhancements = [
      'photorealistic, professional photography, 8k, highly detailed',
      'cinematic, realistic, dramatic lighting, 4k, sharp focus',
      'hyperrealistic, detailed photography, studio lighting, high resolution',
      'realistic photo, detailed, natural lighting, professional shot'
    ];
    
    const randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)];
    enhanced = `${prompt}, ${randomEnhancement}`;
  }
  
  // Add camera/lens specifications for portraits
  if (promptLower.includes('portrait') || promptLower.includes('person') || 
      promptLower.includes('face') || promptLower.includes('woman') || 
      promptLower.includes('man')) {
    
    if (!promptLower.includes('mm') && !promptLower.includes('lens')) {
      const lenses = ['85mm', '50mm', '35mm', '105mm', '24-70mm'];
      const randomLens = lenses[Math.floor(Math.random() * lenses.length)];
      enhanced = `${enhanced}, ${randomLens} lens`;
    }
  }
  
  // Add quality tags
  const qualityTags = 'masterpiece, best quality, ultra detailed, sharp focus';
  if (!enhanced.includes('masterpiece') && !enhanced.includes('best quality')) {
    enhanced = `${enhanced}, ${qualityTags}`;
  }
  
  return enhanced;
}

function getRealisticNegativePrompt(prompt) {
  // Base negative prompts for realism
  let negatives = 'cartoon, anime, 3d, render, painting, drawing, sketch, illustration, CGI, digital art, graphic novel, manga, comic, low quality, worst quality, blurry, pixelated, grainy, noisy, deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation, watermark, signature, text, username, error';
  
  // Add specific negatives based on prompt
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('portrait') || promptLower.includes('face')) {
    negatives += ', bad face, ugly face, deformed face, asymmetric eyes, different eyes, cross-eyed, skewed eyes, unnatural face';
  }
  
  if (promptLower.includes('person') || promptLower.includes('people')) {
    negatives += ', extra fingers, missing fingers, too many fingers, fused fingers, bad hands, poorly drawn hands, malformed hands, extra arms, extra legs, extra limbs';
  }
  
  if (promptLower.includes('building') || promptLower.includes('architecture')) {
    negatives += ', floating buildings, distorted architecture, impossible architecture';
  }
  
  return negatives;
}

function selectRealisticModel(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Prodia model IDs for realistic generation
  const models = {
    // Best for photorealistic people
    'realisticVision': 'Realistic_Vision_V5.1.safetensors [e1441589a6]',
    
    // Best for detailed scenes
    'deliberate': 'deliberate_v3.safetensors [c13a45f2b2]',
    
    // Versatile realistic
    'dreamshaper': 'dreamshaper_8.safetensors [9d40847d7b]',
    
    // Asian realistic
    'chilloutmix': 'chilloutmix_NiPrunedFp32Fix.safetensors [d0d0b7f3b8]',
    
    // Film photography style
    'analog': 'analog-diffusion-1.0.ckpt [925997e9]',
    
    // SDXL for high quality
    'sdxl': 'sd_xl_base_1.0.safetensors [31e35c80]'
  };
  
  // Determine best model based on prompt
  if (promptLower.includes('portrait') || promptLower.includes('face') || 
      promptLower.includes('person') || promptLower.includes('woman') || 
      promptLower.includes('man')) {
    return models.realisticVision;
  }
  
  if (promptLower.includes('asian') || promptLower.includes('chinese') || 
      promptLower.includes('japanese') || promptLower.includes('korean')) {
    return models.chilloutmix;
  }
  
  if (promptLower.includes('film') || promptLower.includes('cinematic') || 
      promptLower.includes('movie') || promptLower.includes('35mm')) {
    return models.analog;
  }
  
  if (promptLower.includes('detailed') || promptLower.includes('complex') || 
      promptLower.includes('intricate') || promptLower.includes('scene')) {
    return models.deliberate;
  }
  
  if (promptLower.includes('high quality') || promptLower.includes('8k') || 
      promptLower.includes('4k') || promptLower.includes('ultra')) {
    return models.sdxl;
  }
  
  // Default to DreamShaper (good all-around)
  return models.dreamshaper;
}

function getModelName(modelId) {
  const modelMap = {
    'Realistic_Vision_V5.1.safetensors [e1441589a6]': 'Realistic Vision V5.1',
    'deliberate_v3.safetensors [c13a45f2b2]': 'Deliberate V3',
    'dreamshaper_8.safetensors [9d40847d7b]': 'DreamShaper 8',
    'chilloutmix_NiPrunedFp32Fix.safetensors [d0d0b7f3b8]': 'ChilloutMix',
    'analog-diffusion-1.0.ckpt [925997e9]': 'Analog Diffusion',
    'sd_xl_base_1.0.safetensors [31e35c80]': 'SDXL'
  };
  
  return modelMap[modelId] || modelId;
}

function selectDimensions(prompt) {
  const promptLower = prompt.toLowerCase();
  
  if (promptLower.includes('portrait') || promptLower.includes('vertical')) {
    return '512x768'; // Portrait orientation
  }
  
  if (promptLower.includes('landscape') || promptLower.includes('wide') || 
      promptLower.includes('panorama')) {
    return '768x512'; // Landscape orientation
  }
  
  if (promptLower.includes('square') || promptLower.includes('instagram')) {
    return '512x512'; // Square
  }
  
  // Default square
  return '512x512';
}

function getAspectRatio(dimensions) {
  const [width, height] = dimensions.split('x').map(Number);
  const ratio = width / height;
  
  if (Math.abs(ratio - 1.0) < 0.1) return 'square';
  if (ratio > 1.0) return 'landscape';
  return 'portrait';
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
      const contentType = response.headers['content-type'];
      if (!contentType || !contentType.startsWith('image/')) {
        reject(new Error('Response is not an image'));
        return;
      }
      
      response.data.pipe(writer);
      
      writer.on('finish', () => {
        if (existsSync(filePath)) {
          const stats = fs.statSync(filePath);
          if (stats.size > 1024) { // At least 1KB
            resolve();
          } else {
            reject(new Error('Image file too small'));
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
        console.log(`✅ Cleaned up realistic image: ${filePath}`);
      }
    } catch (e) {
      console.log('Realistic cleanup error:', e.message);
    }
  }, 10000);
}

// ==================== ADDITIONAL COMMANDS ====================

export const realCommands = {
  "realstyles": {
    description: "List available realistic styles",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const stylesText = `📸 *Available Realistic Styles:*\n\n` +
        `• *Realistic Vision* - Best for people/portraits\n` +
        `• *Deliberate* - Detailed scenes, versatile\n` +
        `• *DreamShaper* - All-around realistic\n` +
        `• *ChilloutMix* - Asian photorealistic\n` +
        `• *Analog Diffusion* - Film photography style\n` +
        `• *SDXL* - Highest quality, 1024x1024\n\n` +
        `📐 *Aspect Ratios:*\n` +
        `• Portrait (512x768)\n` +
        `• Landscape (768x512)\n` +
        `• Square (512x512)\n\n` +
        `💡 *For best results:*\nreal photorealistic portrait of woman, 85mm lens, cinematic lighting, 8k`;
      
      await sock.sendMessage(jid, { text: stylesText }, { quoted: m });
    }
  },
  
  "realhelp": {
    description: "Realistic generation help",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const helpText = `📸 *Photorealistic AI Generation Guide*\n\n` +
        `*Commands:*\n` +
        `• real <prompt> - Generate realistic image\n` +
        `• photo <prompt> - Same as real\n` +
        `• realistic <prompt> - Generate photorealistic\n\n` +
        `*Prompt Structure:*\n` +
        `1. Subject (person, place, object)\n` +
        `2. Details (clothing, features, colors)\n` +
        `3. Setting/Background\n` +
        `4. Style keywords\n` +
        `5. Technical specs\n\n` +
        `*Example Prompts:*\n` +
        "real photorealistic portrait of young woman with green eyes, red hair, wearing leather jacket, cinematic lighting, 85mm lens, 8k\n" +
        "real cyberpunk city at night, neon lights, rain, reflections, futuristic architecture, cinematic, wide angle lens\n" +
        "real astronaut standing on mars surface, detailed spacesuit, red planet background, dust storm, sci-fi, NASA photography";
      
      await sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
  }
};