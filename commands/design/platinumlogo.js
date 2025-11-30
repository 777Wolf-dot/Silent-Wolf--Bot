import { createCanvas } from 'canvas';

export default {
  name: "platinumlogo",
  description: "Create premium platinum metallic text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🔷 *Platinum Logo*\n\nUsage: platinumlogo <text>\n\n*Example:*\nplatinumlogo WOLF\nplatinumlogo PLATINUM\nplatinumlogo ELITE` 
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
        text: `🔷 Generating platinum logo for: "${text}"...` 
      }, { quoted: m });

      // Generate platinum logo
      const logoBuffer = await generatePlatinumLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔷 *Platinum Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [PLATINUMLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating platinum logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate premium platinum metallic logo
 */
async function generatePlatinumLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create luxurious dark background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, width, height);

  // Add premium background effects
  drawPlatinumBackground(ctx, width, height);

  // Create realistic platinum gradient (cool white-silver with blue undertones)
  const platinumGradient = ctx.createLinearGradient(0, 100, 0, 300);
  platinumGradient.addColorStop(0, '#F8F8FF');    // Bright platinum white
  platinumGradient.addColorStop(0.15, '#E8E8F0'); // Light platinum
  platinumGradient.addColorStop(0.3, '#D0D0E0');  // Pure platinum
  platinumGradient.addColorStop(0.45, '#B8B8D0'); // Medium platinum
  platinumGradient.addColorStop(0.6, '#A0A0C0');  // Cool platinum
  platinumGradient.addColorStop(0.75, '#8888B0'); // Shadow platinum
  platinumGradient.addColorStop(0.9, '#7070A0');  // Deep shadow
  platinumGradient.addColorStop(1, '#585890');    // Dark base

  // Main text with premium 3D effect
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create premium 3D platinum effect
  createPlatinum3DEffect(ctx, text, width, height, platinumGradient);

  // Add platinum-specific highlights and reflections
  addPlatinumHighlights(ctx, text, width, height);

  // Add premium border with platinum sheen
  drawPlatinumBorder(ctx, width, height);

  // Add diamond-like reflections
  addDiamondReflections(ctx, width, height);

  // Add prestige elements
  addPrestigeElements(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw premium platinum background
 */
function drawPlatinumBackground(ctx, width, height) {
  // Create deep blue-black radial gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.5
  );
  radialGradient.addColorStop(0, '#1a1a2e');
  radialGradient.addColorStop(0.4, '#0f0f23');
  radialGradient.addColorStop(0.8, '#050514');
  radialGradient.addColorStop(1, '#000005');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle geometric pattern
  ctx.strokeStyle = 'rgba(100, 100, 150, 0.1)';
  ctx.lineWidth = 1;
  
  // Diamond grid pattern
  const gridSize = 40;
  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + gridSize, y);
      ctx.lineTo(x + gridSize, y + gridSize);
      ctx.lineTo(x, y + gridSize);
      ctx.closePath();
      ctx.stroke();
    }
  }

  // Add corner prestige markers
  drawPrestigeCorners(ctx, width, height);
}

/**
 * Create premium 3D platinum effect
 */
function createPlatinum3DEffect(ctx, text, width, height, platinumGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 10;

  // Deep shadow layers for premium 3D effect
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.2;
    const alpha = 0.08 + (i / depth) * 0.25;
    const blueTint = 150 - i * 10;
    
    ctx.fillStyle = `rgba(0, 0, ${blueTint}, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main platinum text with inner glow
  ctx.shadowColor = 'rgba(100, 100, 255, 0.3)';
  ctx.shadowBlur = 15;
  ctx.fillStyle = platinumGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Platinum edge bevel
  ctx.strokeStyle = 'rgba(200, 200, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add platinum-specific highlights (cool blue-white reflections)
 */
function addPlatinumHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  
  // Primary highlight (cool blue-white)
  const primaryHighlight = ctx.createLinearGradient(
    centerX - 250, centerY - 60,
    centerX + 250, centerY - 10
  );
  primaryHighlight.addColorStop(0, 'rgba(240, 240, 255, 0.9)');
  primaryHighlight.addColorStop(0.3, 'rgba(220, 220, 255, 0.6)');
  primaryHighlight.addColorStop(0.6, 'rgba(200, 200, 255, 0.3)');
  primaryHighlight.addColorStop(1, 'transparent');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryHighlight;
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 3);

  // Secondary highlight (specular spots)
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.globalAlpha = 0.4;

  // Add specular highlights on character curves
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const highlightPositions = [
    { x: -0.4, y: -0.3 }, { x: -0.2, y: -0.4 }, { x: 0, y: -0.35 },
    { x: 0.2, y: -0.4 }, { x: 0.4, y: -0.3 }
  ];

  highlightPositions.forEach(pos => {
    const x = centerX + (pos.x * textWidth / 2);
    const y = centerY + (pos.y * 40);
    const size = 4 + Math.random() * 3;
    
    // Create bloom effect for highlights
    ctx.shadowColor = 'rgba(200, 200, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw premium platinum border
 */
function drawPlatinumBorder(ctx, width, height) {
  // Outer border with platinum gradient
  const outerBorder = ctx.createLinearGradient(0, 0, width, height);
  outerBorder.addColorStop(0, '#E8E8FF');
  outerBorder.addColorStop(0.25, '#C0C0E0');
  outerBorder.addColorStop(0.5, '#A0A0C0');
  outerBorder.addColorStop(0.75, '#C0C0E0');
  outerBorder.addColorStop(1, '#E8E8FF');

  ctx.strokeStyle = outerBorder;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(100, 100, 200, 0.5)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Middle border (thin platinum line)
  ctx.strokeStyle = 'rgba(200, 200, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  // Inner border (prestige line)
  ctx.strokeStyle = 'rgba(150, 150, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(35, 35, width - 70, height - 70);
}

/**
 * Add diamond-like reflections
 */
function addDiamondReflections(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Diamond reflection particles
  const reflectionCount = 12;
  for (let i = 0; i < reflectionCount; i++) {
    const x = 50 + Math.random() * (width - 100);
    const y = 50 + Math.random() * (height - 100);
    const size = 2 + Math.random() * 4;
    
    // Diamond shape (rhombus)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();

    // Add sparkle effect
    ctx.shadowColor = 'rgba(200, 200, 255, 0.8)';
    ctx.shadowBlur = 5;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add prestige corner elements
 */
function drawPrestigeCorners(ctx, width, height) {
  ctx.strokeStyle = 'rgba(150, 150, 255, 0.4)';
  ctx.lineWidth = 3;
  
  const cornerSize = 30;
  const cornerStyle = 8;

  // Top-left prestige corner
  ctx.beginPath();
  ctx.moveTo(20, 20 + cornerSize);
  ctx.lineTo(20, 20 + cornerStyle);
  ctx.moveTo(20, 20);
  ctx.lineTo(20 + cornerStyle, 20);
  ctx.moveTo(20 + cornerSize - cornerStyle, 20);
  ctx.lineTo(20 + cornerSize, 20);
  ctx.moveTo(20 + cornerSize, 20);
  ctx.lineTo(20 + cornerSize, 20 + cornerStyle);
  ctx.stroke();

  // Repeat for other corners with variations
  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 20, 20 + cornerSize);
  ctx.lineTo(width - 20, 20 + cornerStyle);
  ctx.moveTo(width - 20, 20);
  ctx.lineTo(width - 20 - cornerStyle, 20);
  ctx.moveTo(width - 20 - cornerSize + cornerStyle, 20);
  ctx.lineTo(width - 20 - cornerSize, 20);
  ctx.moveTo(width - 20 - cornerSize, 20);
  ctx.lineTo(width - 20 - cornerSize, 20 + cornerStyle);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(20, height - 20 - cornerSize);
  ctx.lineTo(20, height - 20 - cornerStyle);
  ctx.moveTo(20, height - 20);
  ctx.lineTo(20 + cornerStyle, height - 20);
  ctx.moveTo(20 + cornerSize - cornerStyle, height - 20);
  ctx.lineTo(20 + cornerSize, height - 20);
  ctx.moveTo(20 + cornerSize, height - 20);
  ctx.lineTo(20 + cornerSize, height - 20 - cornerStyle);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 20, height - 20 - cornerSize);
  ctx.lineTo(width - 20, height - 20 - cornerStyle);
  ctx.moveTo(width - 20, height - 20);
  ctx.lineTo(width - 20 - cornerStyle, height - 20);
  ctx.moveTo(width - 20 - cornerSize + cornerStyle, height - 20);
  ctx.lineTo(width - 20 - cornerSize, height - 20);
  ctx.moveTo(width - 20 - cornerSize, height - 20);
  ctx.lineTo(width - 20 - cornerSize, height - 20 - cornerStyle);
  ctx.stroke();
}

/**
 * Add additional prestige elements
 */
function addPrestigeElements(ctx, width, height) {
  // Add subtle prestige glow in corners
  ctx.fillStyle = 'rgba(100, 100, 200, 0.1)';
  ctx.beginPath();
  ctx.arc(50, 50, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width - 50, 50, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(50, height - 50, 30, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.beginPath();
  ctx.arc(width - 50, height - 50, 30, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Alternative: Simple platinum logo
 */
async function generateSimplePlatinumLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Premium dark background
  ctx.fillStyle = '#0a0a1a';
  ctx.fillRect(0, 0, width, height);

  // Platinum gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#F0F0FF');
  gradient.addColorStop(0.3, '#D0D0E0');
  gradient.addColorStop(0.6, '#A0A0C0');
  gradient.addColorStop(1, '#8080A0');

  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Premium shadow
  ctx.shadowColor = 'rgba(0, 0, 50, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Platinum border
  ctx.strokeStyle = '#C0C0E0';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  return canvas.toBuffer('image/png');
}