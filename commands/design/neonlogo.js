import { createCanvas } from 'canvas';

export default {
  name: "neonlogo",
  description: "Create vibrant neon glow style text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💡 *Neon Logo*\n\nUsage: neonlogo <text>\n\n*Example:*\nneonlogo WOLF\nneonlogo NEON\nneonlogo GLOW` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      
      if (text.length > 15) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Please use maximum 15 characters.\n\nYour text: "${text}" (${text.length} characters)` 
        }, { quoted: m });
        return;
      }

      // Send waiting message
      await sock.sendMessage(jid, { 
        text: `💡 Generating neon logo for: "${text}"...` 
      }, { quoted: m });

      // Generate neon logo locally
      const logoBuffer = await generateNeonLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💡 *Neon Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [NEONLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating neon logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate vibrant neon glow logo using canvas
 */
async function generateNeonLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create dark background for neon effect
  ctx.fillStyle = '#0a0a2a';
  ctx.fillRect(0, 0, width, height);

  // Add cityscape or grid background for urban feel
  drawNeonBackground(ctx, width, height);

  // Get random neon color
  const neonColor = getRandomNeonColor();
  
  // Draw multiple glow layers for realistic neon effect
  drawNeonGlow(ctx, text, width, height, neonColor);

  // Add neon tube effect (the actual text)
  drawNeonTube(ctx, text, width, height, neonColor);

  // Add reflection effect
  drawNeonReflection(ctx, text, width, height, neonColor);

  // Add floating particles and light effects
  addNeonParticles(ctx, width, height, neonColor);

  return canvas.toBuffer('image/png');
}

/**
 * Draw urban background for neon effect
 */
function drawNeonBackground(ctx, width, height) {
  // Create grid floor perspective
  ctx.strokeStyle = 'rgba(0, 50, 100, 0.3)';
  ctx.lineWidth = 1;
  
  // Perspective grid lines
  for (let i = 0; i < width; i += 40) {
    ctx.beginPath();
    ctx.moveTo(i, height);
    ctx.lineTo(width / 2, height / 2);
    ctx.stroke();
  }
  
  // Add some random "buildings" in background
  ctx.fillStyle = 'rgba(20, 20, 60, 0.8)';
  for (let i = 0; i < 10; i++) {
    const buildingWidth = Math.random() * 60 + 20;
    const buildingHeight = Math.random() * 100 + 50;
    const x = Math.random() * width;
    
    ctx.fillRect(x, height - buildingHeight, buildingWidth, buildingHeight);
  }
}

/**
 * Draw neon glow layers
 */
function drawNeonGlow(ctx, text, width, height, neonColor) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Arial"';
  
  // Multiple glow layers for realistic effect
  const glowLayers = [
    { blur: 50, alpha: 0.3, offset: 0 },
    { blur: 40, alpha: 0.4, offset: 0 },
    { blur: 30, alpha: 0.5, offset: 0 },
    { blur: 20, alpha: 0.6, offset: 0 },
    { blur: 10, alpha: 0.7, offset: 0 }
  ];
  
  for (const layer of glowLayers) {
    ctx.shadowColor = neonColor;
    ctx.shadowBlur = layer.blur;
    ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha})`;
    ctx.fillText(text.toUpperCase(), width / 2, height / 2 + layer.offset);
  }
}

/**
 * Draw the neon tube itself
 */
function drawNeonTube(ctx, text, width, height, neonColor) {
  // Reset shadow for crisp text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  // Inner glow (the tube)
  ctx.fillStyle = neonColor;
  ctx.font = 'bold 80px "Arial"';
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);
  
  // Add tube highlights
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.3;
  ctx.strokeText(text.toUpperCase(), width / 2, height / 2 - 1);
  ctx.globalAlpha = 1.0;
}

/**
 * Draw reflection on the "ground"
 */
function drawNeonReflection(ctx, text, width, height, neonColor) {
  ctx.save();
  
  // Create reflection transformation
  ctx.translate(width / 2, height / 2);
  ctx.scale(1, -0.3);
  ctx.translate(-width / 2, -height / 2);
  
  // Reflection with gradient fade
  const reflectionGradient = ctx.createLinearGradient(0, height / 2, 0, height);
  reflectionGradient.addColorStop(0, neonColor);
  reflectionGradient.addColorStop(1, 'transparent');
  
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = reflectionGradient;
  ctx.font = 'bold 80px "Arial"';
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);
  
  ctx.restore();
}

/**
 * Add floating particles and light effects
 */
function addNeonParticles(ctx, width, height, neonColor) {
  ctx.globalAlpha = 0.7;
  
  // Add light particles
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    const alpha = Math.random() * 0.5 + 0.3;
    
    ctx.fillStyle = neonColor;
    ctx.globalAlpha = alpha;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Add lens flare effects
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#FFFFFF';
  
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 20 + 10;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Get random neon color
 */
function getRandomNeonColor() {
  const neonColors = [
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#00FF00', // Green
    '#FFFF00', // Yellow
    '#FF0000', // Red
    '#0000FF', // Blue
    '#FF00FF', // Pink
    '#00FF00', // Lime
    '#FFA500', // Orange
    '#8A2BE2', // Blue Violet
    '#FF1493', // Deep Pink
    '#00CED1', // Dark Turquoise
    '#7FFF00', // Chartreuse
    '#DC143C', // Crimson
    '#40E0D0'  // Turquoise
  ];
  
  return neonColors[Math.floor(Math.random() * neonColors.length)];
}

/**
 * Alternative: Specific neon color logo
 */
async function generateSpecificNeonLogo(text, color) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a2a';
  ctx.fillRect(0, 0, width, height);

  const neonColor = color || getRandomNeonColor();
  
  // Simple neon effect
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Arial"';
  
  // Glow effect
  ctx.shadowColor = neonColor;
  ctx.shadowBlur = 30;
  ctx.fillStyle = neonColor;
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);
  
  // Bright center
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.globalAlpha = 0.8;
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);
  ctx.globalAlpha = 1.0;

  return canvas.toBuffer('image/png');
}

/**
 * Cyber neon style with multiple colors
 */
async function generateCyberNeonLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Very dark background
  ctx.fillStyle = '#050510';
  ctx.fillRect(0, 0, width, height);

  // Multiple neon colors for cyber effect
  const colors = ['#FF00FF', '#00FFFF', '#00FF00'];
  
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = 'bold 80px "Arial"';
  
  // Create layered neon effect with different colors
  for (let i = 0; i < colors.length; i++) {
    const offset = (i - 1) * 2;
    ctx.shadowColor = colors[i];
    ctx.shadowBlur = 25;
    ctx.fillStyle = colors[i];
    ctx.fillText(text.toUpperCase(), width / 2 + offset, height / 2 + offset);
  }
  
  // Bright white core
  ctx.shadowBlur = 0;
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  return canvas.toBuffer('image/png');
}