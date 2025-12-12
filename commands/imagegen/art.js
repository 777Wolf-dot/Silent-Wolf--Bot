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
  name: "art",
  aliases: ["artist", "artwork", "artgen", "creative"],
  description: "Generate artistic and creative AI images",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const userId = m.key.participant || m.key.remoteJid;
    let statusMsg = null;

    try {
      if (!args[0]) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Artistic Image Generator*\n\nUsage: art <prompt>\n\nExamples:\nart impressionist painting of a garden\nart surreal fantasy landscape, digital art\nart watercolor portrait of a wizard\n\n🎭 *Art Styles Available:*\n• Impressionism • Surrealism • Abstract\n• Renaissance • Cyberpunk • Fantasy\n• Watercolor • Oil Painting • Digital Art\n• Concept Art • Character Design • Illustration\n\n🎨 *Famous Artist Styles:*\n• Van Gogh • Picasso • Monet • Dali\n• Hokusai • Mucha • Klimt • Hopper\n\n💡 *Tips:*\n• Specify art style: "in the style of..."\n• Mention medium: "watercolor", "oil painting"\n• Add mood: "dreamy", "epic", "mystical"\n• Use artistic terms: "brush strokes", "texture"` 
        }, { quoted: m });
        return;
      }

      const prompt = args.join(' ');
      
      // Check if user wants specific style list
      if (prompt.toLowerCase() === 'styles') {
        await showArtStyles(sock, jid, m);
        return;
      }

      // Send initial status
      statusMsg = await sock.sendMessage(jid, { 
        text: `🎨 *Creating artistic image...*\n\n📝 *Prompt:* ${prompt.substring(0, 60)}${prompt.length > 60 ? '...' : ''}` 
      }, { quoted: m });

      // Analyze prompt for specific art style
      const detectedStyle = detectArtStyle(prompt);
      
      // Try multiple artistic AI services
      const result = await generateArtisticImage(prompt, detectedStyle);
      
      if (!result.success) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Creating artistic image...* ❌\n\n❌ ${result.error || 'Failed to generate artwork'}`,
          edit: statusMsg.key 
        });
        return;
      }

      const { imagePath, styleUsed, generationTime, artistInfluence } = result;

      await sock.sendMessage(jid, { 
        text: `🎨 *Creating artistic image...* ✅\n📤 *Sending artwork...*`,
        edit: statusMsg.key 
      });

      // Get user's caption
      const userCaption = getCaption(userId);
      
      // Create artistic caption
      let caption = `🎨 *AI Artwork*\n\n📝 *Prompt:* ${prompt}\n`;
      
      if (styleUsed) {
        caption += `🎭 *Style:* ${styleUsed}\n`;
      }
      
      if (artistInfluence) {
        caption += `👨‍🎨 *Artist Influence:* ${artistInfluence}\n`;
      }
      
      caption += `⏱️ *Time:* ${generationTime}s\n\n${userCaption}`;
      
      // Send the generated artwork
      await sock.sendMessage(jid, {
        image: readFileSync(imagePath),
        caption: caption
      });

      await sock.sendMessage(jid, { 
        text: `🎨 *Creating artistic image...* ✅\n📤 *Sending artwork...* ✅\n\n✅ *Artwork created successfully!*\n\nStyle: ${styleUsed || 'Mixed'}\n${artistInfluence ? `Artist: ${artistInfluence}\n` : ''}Time: ${generationTime}s`,
        edit: statusMsg.key 
      });

      // Cleanup
      cleanupFile(imagePath);

    } catch (error) {
      console.error('Art command error:', error);
      
      if (statusMsg) {
        await sock.sendMessage(jid, { 
          text: `🎨 *Creating artistic image...* ❌\n\n❌ Error: ${error.message.substring(0, 100)}`,
          edit: statusMsg.key 
        });
      }
    }
  },
};

// ==================== ART STYLE DETECTION ====================

function detectArtStyle(prompt) {
  const promptLower = prompt.toLowerCase();
  
  // Define art styles with keywords
  const artStyles = {
    // Traditional Art Styles
    'impressionism': ['impressionist', 'impressionism', 'monet', 'renoir', 'degas', 'brush strokes', 'loose brushwork'],
    'surrealism': ['surreal', 'surrealism', 'dali', 'magritte', 'dreamlike', 'fantastical', 'unconscious'],
    'abstract': ['abstract', 'abstract expressionism', 'kandinsky', 'pollock', 'non-representational', 'geometric'],
    'cubism': ['cubist', 'cubism', 'picasso', 'braque', 'geometric forms', 'faceted'],
    'renaissance': ['renaissance', 'da vinci', 'michelangelo', 'classical', 'realism', 'oil painting', 'old master'],
    'baroque': ['baroque', 'caravaggio', 'rembrandt', 'dramatic', 'chiaroscuro', 'theatrical'],
    'art_nouveau': ['art nouveau', 'much', 'alfons mucha', 'decorative', 'organic lines', 'elegant'],
    'pop_art': ['pop art', 'warhol', 'lichtenstein', 'comic', 'popular culture', 'bold colors'],
    
    // Modern & Digital Styles
    'cyberpunk': ['cyberpunk', 'neon', 'futuristic', 'blade runner', 'dystopian', 'high tech'],
    'steampunk': ['steampunk', 'victorian', 'gears', 'brass', 'retro-futuristic'],
    'fantasy': ['fantasy', 'magical', 'mythical', 'dungeons and dragons', 'lord of the rings'],
    'sci_fi': ['sci-fi', 'science fiction', 'space', 'alien', 'futuristic', 'technology'],
    'concept_art': ['concept art', 'game art', 'environment concept', 'character design', 'production art'],
    'digital_painting': ['digital painting', 'digital art', 'photoshop', 'procreate', 'illustration'],
    'vector_art': ['vector art', 'flat design', 'minimalist', 'clean lines', 'geometric'],
    
    // Painting Techniques
    'watercolor': ['watercolor', 'aquarelle', 'transparent', 'wash', 'fluid'],
    'oil_painting': ['oil painting', 'oil on canvas', 'impasto', 'glazing', 'traditional painting'],
    'acrylic': ['acrylic', 'bold colors', 'thick paint', 'modern painting'],
    'ink': ['ink', 'pen and ink', 'calligraphy', 'line art', 'black and white'],
    'pastel': ['pastel', 'chalk', 'soft', 'blended', 'delicate'],
    
    // Artist-Specific Styles
    'van_gogh': ['van gogh', 'starry night', 'post-impressionist', 'swirling', 'expressive'],
    'picasso': ['picasso', 'cubist', 'analytical cubism', 'african art influence'],
    'monet': ['monet', 'water lilies', 'impressionist', 'light and color'],
    'dali': ['dali', 'surrealist', 'melting clocks', 'dream landscape'],
    'hokusai': ['hokusai', 'the great wave', 'ukiyo-e', 'japanese woodblock'],
    'klimt': ['klimt', 'the kiss', 'art nouveau', 'gold leaf', 'decorative'],
    'hopper': ['hopper', 'american realism', 'lonely', 'urban scenes', 'nighthawks'],
    'basquiat': ['basquiat', 'neo-expressionist', 'graffiti', 'crown motif'],
    
    // Anime & Manga Styles
    'anime': ['anime', 'manga', 'japanese animation', 'studio ghibli', 'makoto shinkai'],
    'cartoon': ['cartoon', 'animated', 'disney', 'pixar', 'character animation'],
    'comic': ['comic book', 'graphic novel', 'marvel', 'dc', 'superhero'],
    
    // Other Artistic Styles
    'minimalist': ['minimalist', 'simple', 'clean', 'reduced', 'essential'],
    'vaporwave': ['vaporwave', 'aesthetic', 'retro', 'synthwave', '80s'],
    'glitch_art': ['glitch', 'digital error', 'corrupted', 'data moshing'],
    'low_poly': ['low poly', 'polygonal', 'geometric', '3d model'],
    'pixel_art': ['pixel art', '8-bit', '16-bit', 'retro gaming'],
    'chalkboard': ['chalkboard', 'chalk drawing', 'classroom', 'hand drawn']
  };

  // Check for style keywords
  for (const [style, keywords] of Object.entries(artStyles)) {
    for (const keyword of keywords) {
      if (promptLower.includes(keyword)) {
        return {
          style: style,
          name: formatStyleName(style),
          confidence: 'high'
        };
      }
    }
  }

  // Check for "in the style of" patterns
  const stylePattern = /in the style of ([^,\.]+)/i;
  const styleMatch = prompt.match(stylePattern);
  
  if (styleMatch) {
    return {
      style: 'custom',
      name: styleMatch[1],
      confidence: 'explicit'
    };
  }

  // Default artistic style
  return {
    style: 'digital_painting',
    name: 'Digital Painting',
    confidence: 'default'
  };
}

function formatStyleName(styleKey) {
  // Convert style keys to readable names
  const styleNames = {
    'impressionism': 'Impressionism',
    'surrealism': 'Surrealism',
    'abstract': 'Abstract Art',
    'cubism': 'Cubism',
    'renaissance': 'Renaissance',
    'baroque': 'Baroque',
    'art_nouveau': 'Art Nouveau',
    'pop_art': 'Pop Art',
    'cyberpunk': 'Cyberpunk',
    'steampunk': 'Steampunk',
    'fantasy': 'Fantasy Art',
    'sci_fi': 'Science Fiction',
    'concept_art': 'Concept Art',
    'digital_painting': 'Digital Painting',
    'vector_art': 'Vector Art',
    'watercolor': 'Watercolor Painting',
    'oil_painting': 'Oil Painting',
    'acrylic': 'Acrylic Painting',
    'ink': 'Ink Drawing',
    'pastel': 'Pastel Art',
    'van_gogh': 'Van Gogh Style',
    'picasso': 'Picasso Style',
    'monet': 'Monet Style',
    'dali': 'Dali Style',
    'hokusai': 'Hokusai Style',
    'klimt': 'Klimt Style',
    'hopper': 'Hopper Style',
    'basquiat': 'Basquiat Style',
    'anime': 'Anime Style',
    'cartoon': 'Cartoon Style',
    'comic': 'Comic Book Style',
    'minimalist': 'Minimalist',
    'vaporwave': 'Vaporwave',
    'glitch_art': 'Glitch Art',
    'low_poly': 'Low Poly',
    'pixel_art': 'Pixel Art',
    'chalkboard': 'Chalkboard Art'
  };
  
  return styleNames[styleKey] || styleKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ==================== ARTISTIC GENERATION FUNCTIONS ====================

async function generateArtisticImage(prompt, styleInfo) {
  const tempDir = './temp/art';
  if (!existsSync(tempDir)) mkdirSync(tempDir, { recursive: true });

  const timestamp = Date.now();
  const imagePath = `${tempDir}/art_${timestamp}.png`;

  try {
    // Try Prodia API first (best for artistic styles)
    const prodiaResult = await tryProdiaArtistic(prompt, styleInfo, imagePath);
    if (prodiaResult.success) return prodiaResult;

    // Try Pollinations.ai with artistic model
    const pollinationsResult = await tryPollinationsArtistic(prompt, styleInfo, imagePath);
    if (pollinationsResult.success) return pollinationsResult;

    // Try Lexica.art for artistic styles
    const lexicaResult = await tryLexicaArt(prompt, styleInfo, imagePath);
    if (lexicaResult.success) return lexicaResult;

    // Try OpenJourney as fallback
    const openjourneyResult = await tryOpenJourney(prompt, styleInfo, imagePath);
    if (openjourneyResult.success) return openjourneyResult;

    return { 
      success: false, 
      error: 'All artistic generation services are currently unavailable' 
    };

  } catch (error) {
    console.error('Artistic generation error:', error);
    cleanupFile(imagePath);
    return { success: false, error: error.message };
  }
}

// ==================== SERVICE 1: PRODIA ARTISTIC ====================
async function tryProdiaArtistic(prompt, styleInfo, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhance prompt with artistic style
    const enhancedPrompt = enhanceArtisticPrompt(prompt, styleInfo);
    
    // Select best artistic model
    const model = selectArtisticModel(styleInfo);
    
    console.log(`Using Prodia model: ${model} for style: ${styleInfo.name}`);
    
    // Step 1: Create generation job
    const createResponse = await axios.post('https://api.prodia.com/v1/job', {
      model: model,
      prompt: enhancedPrompt,
      negative_prompt: getArtisticNegativePrompt(styleInfo),
      steps: 30,
      cfg_scale: 7,
      seed: -1,
      sampler: 'DPM++ 2M Karras',
      aspect_ratio: 'square',
      upscale: false
    }, {
      headers: {
        'X-Prodia-Key': '',
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    const jobId = createResponse.data.job;
    
    if (!jobId) {
      throw new Error('Failed to create generation job');
    }

    // Step 2: Wait for generation
    let imageUrl = null;
    let attempts = 0;
    
    while (attempts < 60) {
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
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (statusError) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    if (!imageUrl) {
      throw new Error('Generation timeout');
    }

    // Step 3: Download image
    await downloadImageFile(imageUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      styleUsed: styleInfo.name,
      generationTime,
      artistInfluence: getArtistInfluence(styleInfo),
      service: 'prodia'
    };

  } catch (error) {
    console.log('Prodia artistic generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 2: POLLINATIONS ARTISTIC ====================
async function tryPollinationsArtistic(prompt, styleInfo, imagePath) {
  try {
    const startTime = Date.now();
    
    // Enhance prompt
    const enhancedPrompt = enhanceArtisticPrompt(prompt, styleInfo);
    
    // Pollinations with OpenJourney model (good for art)
    const model = 'openjourney';
    
    // URL encode prompt
    const encodedPrompt = encodeURIComponent(enhancedPrompt);
    
    // Pollinations API URL
    const apiUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=768&height=768&model=${model}&seed=${Math.floor(Math.random() * 1000000)}&enhance=true`;
    
    console.log(`Using Pollinations model: ${model} for artistic generation`);
    
    // Download directly
    await downloadImageFile(apiUrl, imagePath);
    
    const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
    
    return {
      success: true,
      imagePath,
      styleUsed: styleInfo.name,
      generationTime,
      artistInfluence: getArtistInfluence(styleInfo),
      service: 'pollinations'
    };

  } catch (error) {
    console.log('Pollinations artistic generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 3: LEXICA.ART ====================
async function tryLexicaArt(prompt, styleInfo, imagePath) {
  try {
    const startTime = Date.now();
    
    // Lexica.art API for artistic styles
    const enhancedPrompt = enhanceArtisticPrompt(prompt, styleInfo);
    
    const response = await axios.post(
      'https://lexica.art/api/infinite-prompts',
      {
        text: enhancedPrompt,
        searchMode: 'images',
        source: 'search',
        cursor: 0
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 30000
      }
    );

    if (response.data && response.data.images && response.data.images.length > 0) {
      // Get first relevant image
      const imageData = response.data.images[0];
      const imageUrl = `https://image.lexica.art/full_jpg/${imageData.id}`;
      
      await downloadImageFile(imageUrl, imagePath);
      
      const generationTime = ((Date.now() - startTime) / 1000).toFixed(1);
      
      return {
        success: true,
        imagePath,
        styleUsed: 'Lexica.Art Style',
        generationTime,
        artistInfluence: 'Community Artists',
        service: 'lexica'
      };
    }
    
    return { success: false };
    
  } catch (error) {
    console.log('Lexica.art generation failed:', error.message);
    return { success: false };
  }
}

// ==================== SERVICE 4: OPENJOURNEY ====================
async function tryOpenJourney(prompt, styleInfo, imagePath) {
  try {
    const startTime = Date.now();
    
    // OpenJourney via Hugging Face (Midjourney alternative)
    const enhancedPrompt = enhanceArtisticPrompt(prompt, styleInfo);
    
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/prompthero/openjourney',
      {
        inputs: enhancedPrompt,
        parameters: {
          negative_prompt: getArtisticNegativePrompt(styleInfo),
          guidance_scale: 7.5,
          num_inference_steps: 30
        }
      },
      {
        headers: {
          'Authorization': 'Bearer YOUR_HUGGINGFACE_TOKEN',
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
      styleUsed: styleInfo.name,
      generationTime,
      artistInfluence: getArtistInfluence(styleInfo),
      service: 'openjourney'
    };

  } catch (error) {
    console.log('OpenJourney generation failed:', error.message);
    return { success: false };
  }
}

// ==================== PROMPT ENHANCEMENT FUNCTIONS ====================

function enhanceArtisticPrompt(originalPrompt, styleInfo) {
  let enhanced = originalPrompt;
  const promptLower = originalPrompt.toLowerCase();
  
  // Remove any existing style mentions to avoid duplication
  const stylePatterns = [
    'in the style of',
    'style of',
    'art style',
    'painting style'
  ];
  
  // Check if artistic terms already present
  const artisticTerms = [
    'painting', 'drawing', 'artwork', 'illustration',
    'masterpiece', 'art', 'creative', 'artistic'
  ];
  
  const hasArtisticTerm = artisticTerms.some(term => promptLower.includes(term));
  
  if (!hasArtisticTerm) {
    // Add artistic enhancement based on style
    const enhancements = {
      'impressionism': 'impressionist painting, loose brushstrokes, light and color, masterpiece',
      'surrealism': 'surreal artwork, dreamlike, imaginative, symbolic, masterpiece',
      'abstract': 'abstract art, non-representational, expressive, colorful, masterpiece',
      'digital_painting': 'digital painting, concept art, detailed, vibrant colors, masterpiece',
      'watercolor': 'watercolor painting, transparent washes, fluid colors, masterpiece',
      'oil_painting': 'oil painting on canvas, rich textures, traditional art, masterpiece',
      'cyberpunk': 'cyberpunk artwork, neon colors, futuristic, dystopian, digital art',
      'fantasy': 'fantasy artwork, magical, mythical, detailed illustration, masterpiece',
      'concept_art': 'concept art, professional, detailed, production quality, masterpiece',
      'anime': 'anime artwork, detailed, vibrant, Japanese animation style, masterpiece'
    };
    
    const enhancement = enhancements[styleInfo.style] || 'artwork, creative, masterpiece, best quality';
    enhanced = `${originalPrompt}, ${enhancement}`;
  }
  
  // Add artist influence if detected
  if (styleInfo.style.includes('van_gogh') || styleInfo.style.includes('picasso') || 
      styleInfo.style.includes('monet') || styleInfo.style.includes('dali') ||
      styleInfo.style.includes('hokusai') || styleInfo.style.includes('klimt')) {
    
    if (!promptLower.includes('style') && !promptLower.includes('inspired')) {
      const artistName = formatStyleName(styleInfo.style).replace(' Style', '');
      enhanced = `${enhanced}, in the style of ${artistName}`;
    }
  }
  
  // Add quality tags
  const qualityTags = 'masterpiece, best quality, detailed, artistic';
  if (!enhanced.includes('masterpiece') && !enhanced.includes('best quality')) {
    enhanced = `${enhanced}, ${qualityTags}`;
  }
  
  return enhanced;
}

function getArtisticNegativePrompt(styleInfo) {
  // Base negative prompts for art
  let negatives = 'low quality, worst quality, blurry, pixelated, deformed, distorted, disfigured, poorly drawn, bad anatomy, wrong anatomy, extra limb, missing limb, floating limbs, disconnected limbs, mutation, mutated, ugly, disgusting, amputation, watermark, signature, text, username, error, 3d render, CGI, photorealistic';
  
  // Add style-specific negatives
  if (styleInfo.style === 'realistic' || styleInfo.style.includes('photo')) {
    negatives += ', cartoon, anime, drawing, painting, illustration';
  }
  
  if (styleInfo.style === 'anime' || styleInfo.style === 'cartoon') {
    negatives += ', photorealistic, realistic, photograph, 3d';
  }
  
  return negatives;
}

function selectArtisticModel(styleInfo) {
  // Prodia model IDs for artistic generation
  const models = {
    // General artistic models
    'dreamshaper': 'dreamshaper_8.safetensors [9d40847d7b]',
    'openjourney': 'openjourney_V4.ckpt [ca2f377f3b]',
    'protogen': 'protogenInfinity_12.ckpt [e90c655ac8]',
    
    // Anime/illustration models
    'anything': 'anything-v4.5-pruned.ckpt [65745d25]',
    'aom3': 'AOM3A1B_orangemixs.safetensors [960c4b8d]',
    
    // Realistic art models
    'realistic': 'Realistic_Vision_V5.1.safetensors [e1441589a6]',
    'deliberate': 'deliberate_v3.safetensors [c13a45f2b2]',
    
    // SDXL for high quality
    'sdxl': 'sd_xl_base_1.0.safetensors [31e35c80]'
  };
  
  // Select model based on style
  switch(styleInfo.style) {
    case 'anime':
    case 'cartoon':
    case 'comic':
      return models.anything;
      
    case 'impressionism':
    case 'surrealism':
    case 'abstract':
    case 'digital_painting':
      return models.dreamshaper;
      
    case 'cyberpunk':
    case 'sci_fi':
    case 'fantasy':
    case 'concept_art':
      return models.protogen;
      
    case 'watercolor':
    case 'oil_painting':
    case 'acrylic':
    case 'renaissance':
      return models.realistic;
      
    default:
      return models.dreamshaper;
  }
}

function getArtistInfluence(styleInfo) {
  // Map styles to famous artists
  const artistMap = {
    'impressionism': 'Claude Monet',
    'surrealism': 'Salvador Dali',
    'cubism': 'Pablo Picasso',
    'renaissance': 'Leonardo da Vinci',
    'art_nouveau': 'Alphonse Mucha',
    'pop_art': 'Andy Warhol',
    'van_gogh': 'Vincent van Gogh',
    'monet': 'Claude Monet',
    'picasso': 'Pablo Picasso',
    'dali': 'Salvador Dali',
    'hokusai': 'Katsushika Hokusai',
    'klimt': 'Gustav Klimt',
    'hopper': 'Edward Hopper',
    'basquiat': 'Jean-Michel Basquiat'
  };
  
  return artistMap[styleInfo.style] || null;
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
        'Accept': 'image/*'
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
          if (stats.size > 1024) {
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
        console.log(`✅ Cleaned up artwork: ${filePath}`);
      }
    } catch (e) {
      console.log('Art cleanup error:', e.message);
    }
  }, 10000);
}

// ==================== ART STYLES COMMAND ====================

async function showArtStyles(sock, jid, m) {
  const stylesText = `🎭 *Available Art Styles*\n\n` +
    `*Traditional Art Styles:*\n` +
    `• Impressionism - Monet, Renoir, loose brushwork\n` +
    `• Surrealism - Dali, Magritte, dreamlike\n` +
    `• Abstract - Kandinsky, Pollock, non-representational\n` +
    `• Cubism - Picasso, Braque, geometric forms\n` +
    `• Renaissance - da Vinci, Michelangelo, classical\n` +
    `• Baroque - Caravaggio, Rembrandt, dramatic\n` +
    `• Art Nouveau - Mucha, decorative, organic lines\n` +
    `• Pop Art - Warhol, Lichtenstein, popular culture\n\n` +
    `*Modern & Digital Styles:*\n` +
    `• Cyberpunk - Neon, futuristic, dystopian\n` +
    `• Steampunk - Victorian, gears, retro-futuristic\n` +
    `• Fantasy - Magical, mythical, detailed\n` +
    `• Concept Art - Professional, game/movie quality\n` +
    `• Digital Painting - Photoshop, Procreate\n` +
    `• Vector Art - Clean lines, geometric, flat design\n\n` +
    `*Painting Techniques:*\n` +
    `• Watercolor - Transparent, fluid washes\n` +
    `• Oil Painting - Rich textures, traditional\n` +
    `• Acrylic - Bold colors, modern\n` +
    `• Ink - Line art, calligraphy, black & white\n` +
    `• Pastel - Soft, blended, delicate\n\n` +
    `*Special Styles:*\n` +
    `• Anime/Manga - Japanese animation style\n` +
    `• Cartoon - Disney, Pixar, animated\n` +
    `• Comic Book - Marvel, DC, superhero\n` +
    `• Minimalist - Simple, clean, reduced\n` +
    `• Vaporwave - Retro, aesthetic, 80s\n` +
    `• Pixel Art - 8-bit, retro gaming\n` +
    `• Low Poly - Geometric, 3D model style\n\n` +
    `*Usage:* art <prompt> with style keywords\n` +
    `Example: art fantasy castle in the mountains, watercolor painting\n` +
    `Example: art portrait in the style of van gogh\n` +
    `Example: art cyberpunk cityscape, neon lights, concept art`;
  
  await sock.sendMessage(jid, { text: stylesText }, { quoted: m });
}

// ==================== ADDITIONAL COMMANDS ====================

export const artCommands = {
  "artists": {
    description: "List famous artist styles",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const artistsText = `👨‍🎨 *Famous Artist Styles*\n\n` +
        `*Classic Masters:*\n` +
        `• Vincent van Gogh - Swirling, expressive brushstrokes\n` +
        `• Pablo Picasso - Cubism, geometric forms\n` +
        `• Claude Monet - Impressionism, light and color\n` +
        `• Salvador Dali - Surrealism, dream landscapes\n` +
        `• Leonardo da Vinci - Renaissance, realism\n` +
        `• Michelangelo - Classical, sculpture-like\n` +
        `• Rembrandt - Baroque, dramatic lighting\n\n` +
        `*Modern Artists:*\n` +
        `• Andy Warhol - Pop Art, celebrity portraits\n` +
        `• Jackson Pollock - Abstract Expressionism\n` +
        `• Frida Kahlo - Surreal self-portraits\n` +
        `• Georgia O'Keeffe - Floral abstractions\n` +
        `• Katsushika Hokusai - Japanese woodblock\n` +
        `• Alphonse Mucha - Art Nouveau, decorative\n` +
        `• Gustav Klimt - Gold leaf, symbolism\n\n` +
        `*Contemporary:*\n` +
        `• Jean-Michel Basquiat - Neo-expressionist\n` +
        `• Keith Haring - Pop graffiti\n` +
        `• Banksy - Street art, political\n` +
        `• Yayoi Kusama - Polka dots, infinity\n` +
        `• Takashi Murakami - Superflat, anime\n\n` +
        `*Usage:* art <prompt> in the style of [artist]\n` +
        `Example: art starry night sky in the style of van gogh\n` +
        `Example: art woman with pearl earring in the style of vermeer\n` +
        `Example: art modern cityscape in the style of hopper`;
      
      await sock.sendMessage(jid, { text: artistsText }, { quoted: m });
    }
  },
  
  "arthelp": {
    description: "Artistic generation help",
    execute: async (sock, m, args) => {
      const jid = m.key.remoteJid;
      
      const helpText = `🎨 *Artistic AI Generation Guide*\n\n` +
        `*Commands:*\n` +
        `• art <prompt> - Generate artistic image\n` +
        `• artist <prompt> - Same as art\n` +
        `• artwork <prompt> - Generate artwork\n` +
        `• art styles - List all available styles\n` +
        `• art artists - List famous artist styles\n\n` +
        `*Prompt Formula:*\n` +
        `1. Subject (what you want to see)\n` +
        `2. Details (colors, features, setting)\n` +
        `3. Art Style (painting style or artist)\n` +
        `4. Mood/Atmosphere\n` +
        `5. Technical terms (brush strokes, texture)\n\n` +
        `*Advanced Examples:*\n` +
        "art fantasy dragon soaring over mountains, watercolor painting, magical atmosphere, loose brushstrokes, masterpiece\n" +
        "art cyberpunk detective in rainy alley, neon lights, film noir style, dramatic lighting, concept art\n" +
        "art abstract composition of emotions, vibrant colors, Jackson Pollock style, expressive, textured\n" +
        "art portrait of elven queen, intricate jewelry, Art Nouveau style, Alphonse Mucha influence, decorative";
      
      await sock.sendMessage(jid, { text: helpText }, { quoted: m });
    }
  }
};