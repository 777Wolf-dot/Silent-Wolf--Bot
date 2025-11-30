import { createCanvas } from 'canvas';

export default {
  name: "diamondlogo",
  description: "Create brilliant diamond crystal text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💎 *Diamond Logo*\n\nUsage: diamondlogo <text>\n\n*Example:*\ndiamondlogo WOLF\ndiamondlogo DIAMOND\ndiamondlogo CRYSTAL` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      
      if (text.length > 12) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Please use maximum 12 characters.\n\nYour text: "${text}" (${text.length} characters)` 
        }, { quoted: m });
        return;
      }

      // Send waiting message
      await sock.sendMessage(jid, { 
        text: `💎 Generating diamond logo for: "${text}"...` 
      }, { quoted: m });

      // Generate diamond logo
      const logoBuffer = await generateDiamondLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💎 *Diamond Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [DIAMONDLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating diamond logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate brilliant diamond crystal logo
 */
async function generateDiamondLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create deep dark background to make diamonds sparkle
  ctx.fillStyle = '#050514';
  ctx.fillRect(0, 0, width, height);

  // Add starfield background for diamond sparkle contrast
  drawStarfieldBackground(ctx, width, height);

  // Create diamond facets effect
  createDiamondFacets(ctx, text, width, height);

  // Add brilliant diamond reflections
  addDiamondReflections(ctx, text, width, height);

  // Add rainbow light refraction
  addRainbowRefraction(ctx, width, height);

  // Add diamond sparkle particles
  addDiamondSparkles(ctx, width, height);

  // Add luxury border
  drawDiamondBorder(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw starfield background for diamond contrast
 */
function drawStarfieldBackground(ctx, width, height) {
  // Add stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.5;
    const alpha = 0.3 + Math.random() * 0.7;
    
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Add subtle nebula effect
  const nebula = ctx.createRadialGradient(
    width * 0.7, height * 0.3, 0,
    width * 0.7, height * 0.3, 300
  );
  nebula.addColorStop(0, 'rgba(30, 30, 80, 0.3)');
  nebula.addColorStop(1, 'transparent');
  
  ctx.fillStyle = nebula;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Create diamond facets effect
 */
function createDiamondFacets(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Base diamond shape with multiple facets
  const facetLayers = 8;
  
  for (let layer = 0; layer < facetLayers; layer++) {
    const offset = layer * 1.5;
    const alpha = 0.1 + (layer / facetLayers) * 0.4;
    
    // Different facet colors (diamond has slight blue/rainbow tints)
    const hue = 210 + layer * 5; // Blueish tones
    const facetColor = `hsla(${hue}, 30%, ${80 - layer * 5}%, ${alpha})`;
    
    ctx.fillStyle = facetColor;
    ctx.font = 'bold 90px "Arial"';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Offset each layer slightly for facet effect
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main diamond text with crystal clear base
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.font = 'bold 90px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add brilliant diamond reflections
 */
function addDiamondReflections(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Primary diamond reflection (bright white)
  const primaryReflection = ctx.createLinearGradient(
    centerX - 250, centerY - 60,
    centerX + 250, centerY + 40
  );
  primaryReflection.addColorStop(0, 'rgba(255, 255, 255, 0)');
  primaryReflection.addColorStop(0.3, 'rgba(255, 255, 255, 0.9)');
  primaryReflection.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
  primaryReflection.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
  primaryReflection.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryReflection;
  ctx.font = 'bold 90px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Secondary reflections (facet highlights)
  ctx.globalCompositeOperation = 'source-over';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  
  // Create multiple facet reflection points
  const facetReflections = [
    { x: -0.4, y: -0.3, size: 12, brightness: 0.9 },
    { x: -0.25, y: -0.4, size: 8, brightness: 0.8 },
    { x: -0.1, y: -0.35, size: 10, brightness: 0.85 },
    { x: 0.05, y: -0.4, size: 9, brightness: 0.8 },
    { x: 0.2, y: -0.35, size: 11, brightness: 0.9 },
    { x: 0.35, y: -0.3, size: 7, brightness: 0.75 },
    { x: -0.3, y: 0.2, size: 6, brightness: 0.7 },
    { x: 0.25, y: 0.25, size: 5, brightness: 0.6 }
  ];

  facetReflections.forEach(reflection => {
    const x = centerX + (reflection.x * textWidth / 2);
    const y = centerY + (reflection.y * 50);
    
    // Diamond reflections are extremely bright and sharp
    ctx.fillStyle = `rgba(255, 255, 255, ${reflection.brightness})`;
    
    // Create sharp diamond-like reflection shapes
    ctx.beginPath();
    
    // Diamond shape reflection
    const size = reflection.size;
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.7, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.7, y);
    ctx.closePath();
    ctx.fill();

    // Add intense bloom to diamond reflections
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add rainbow light refraction (diamond disperses light)
 */
function addRainbowRefraction(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Rainbow refraction effects around the text
  const rainbowColors = [
    { color: 'rgba(255, 0, 0, 0.3)', angle: -0.3 },    // Red
    { color: 'rgba(255, 165, 0, 0.25)', angle: -0.15 }, // Orange
    { color: 'rgba(255, 255, 0, 0.2)', angle: 0 },     // Yellow
    { color: 'rgba(0, 255, 0, 0.25)', angle: 0.15 },   // Green
    { color: 'rgba(0, 0, 255, 0.3)', angle: 0.3 },     // Blue
    { color: 'rgba(75, 0, 130, 0.25)', angle: 0.45 },  // Indigo
    { color: 'rgba(238, 130, 238, 0.2)', angle: 0.6 }  // Violet
  ];

  rainbowColors.forEach((color, index) => {
    const angle = color.angle;
    const distance = 60 + index * 8;
    
    const gradient = ctx.createRadialGradient(
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance,
      0,
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance,
      80
    );
    
    gradient.addColorStop(0, color.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(
      centerX + Math.cos(angle) * distance,
      centerY + Math.sin(angle) * distance,
      80, 0, Math.PI * 2
    );
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add diamond sparkle particles
 */
function addDiamondSparkles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.9;

  // Diamond sparkles (intense white points)
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const brightness = 0.7 + Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    
    // Create star-shaped sparkles
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.3, y - size * 0.3);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x + size * 0.3, y + size * 0.3);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.3, y + size * 0.3);
    ctx.lineTo(x - size, y);
    ctx.lineTo(x - size * 0.3, y - size * 0.3);
    ctx.closePath();
    ctx.fill();

    // Add intense bloom to sparkles
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fill();
  }

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.restore();
}

/**
 * Draw luxury diamond border
 */
function drawDiamondBorder(ctx, width, height) {
  // Diamond-studded border
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
  ctx.lineWidth = 6;
  ctx.shadowColor = 'rgba(100, 150, 255, 0.4)';
  ctx.shadowBlur = 20;
  
  // Main border
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Add diamond studs to corners
  const cornerDiamonds = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  cornerDiamonds.forEach(corner => {
    drawDiamondStud(ctx, corner.x, corner.y, 8);
  });

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
}

/**
 * Draw individual diamond stud
 */
function drawDiamondStud(ctx, x, y, size) {
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  
  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(x, y - size);
  ctx.lineTo(x + size, y);
  ctx.lineTo(x, y + size);
  ctx.lineTo(x - size, y);
  ctx.closePath();
  ctx.fill();

  // Add reflection to diamond stud
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.3, y - size * 0.3);
  ctx.lineTo(x, y - size * 0.1);
  ctx.lineTo(x + size * 0.1, y);
  ctx.lineTo(x - size * 0.1, y + size * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Alternative: Simple diamond logo
 */
async function generateSimpleDiamondLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, width, height);

  // Diamond gradient text
  const gradient = ctx.createLinearGradient(0, 40, 0, 260);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.3, '#E0F0FF');
  gradient.addColorStop(0.6, '#A0C0FF');
  gradient.addColorStop(1, '#6080FF');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Diamond sparkle effect
  ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
  ctx.shadowBlur = 20;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Add some sparkles
  ctx.shadowBlur = 0;
  for (let i = 0; i < 10; i++) {
    const x = 50 + Math.random() * (width - 100);
    const y = 50 + Math.random() * (height - 100);
    const size = 2 + Math.random() * 4;
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  return canvas.toBuffer('image/png');
}