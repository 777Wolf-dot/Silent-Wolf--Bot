import { createCanvas } from 'canvas';

export default {
  name: "steelogo",
  description: "Create industrial steel metallic text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🔩 *Steel Logo*\n\nUsage: steelogo <text>\n\n*Example:*\nsteelogo WOLF\nsteelogo STEEL\nsteelogo INDUSTRIAL` 
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
        text: `🔩 Generating steel logo for: "${text}"...` 
      }, { quoted: m });

      // Generate steel logo
      const logoBuffer = await generateSteelLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔩 *Steel Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [STEELOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating steel logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate industrial steel metallic logo
 */
async function generateSteelLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create industrial dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Add industrial background texture
  drawIndustrialBackground(ctx, width, height);

  // Create realistic steel gradient (cool gray tones)
  const steelGradient = ctx.createLinearGradient(0, 100, 0, 300);
  steelGradient.addColorStop(0, '#F0F0F0');    // Bright steel
  steelGradient.addColorStop(0.15, '#D8D8D8'); // Light steel
  steelGradient.addColorStop(0.3, '#B8B8B8');  // Medium steel
  steelGradient.addColorStop(0.45, '#989898'); // Steel gray
  steelGradient.addColorStop(0.6, '#787878');  // Dark steel
  steelGradient.addColorStop(0.75, '#585858'); // Shadow steel
  steelGradient.addColorStop(0.9, '#404040');  // Deep shadow
  steelGradient.addColorStop(1, '#282828');    // Dark base

  // Main text with industrial steel effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create industrial 3D steel effect
  createSteel3DEffect(ctx, text, width, height, steelGradient);

  // Add steel-specific highlights and textures
  addSteelHighlights(ctx, text, width, height);

  // Add industrial border
  drawIndustrialBorder(ctx, width, height);

  // Add welding and metal texture
  addMetalTexture(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw industrial background texture
 */
function drawIndustrialBackground(ctx, width, height) {
  // Create metallic background gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.5
  );
  radialGradient.addColorStop(0, '#2a2a2a');
  radialGradient.addColorStop(0.4, '#1a1a1a');
  radialGradient.addColorStop(0.8, '#0a0a0a');
  radialGradient.addColorStop(1, '#000000');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add brushed metal texture
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
  ctx.lineWidth = 1;
  
  // Horizontal brushing (industrial finish)
  for (let y = 0; y < height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Add industrial grid pattern
  ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
  ctx.lineWidth = 0.5;
  
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
}

/**
 * Create industrial 3D steel effect
 */
function createSteel3DEffect(ctx, text, width, height, steelGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 8;

  // Heavy shadow layers for industrial depth
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.5;
    const alpha = 0.1 + (i / depth) * 0.3;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main steel text with industrial weight
  ctx.fillStyle = steelGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Industrial edge bevel
  ctx.strokeStyle = 'rgba(200, 200, 200, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add steel-specific highlights (cool metallic reflections)
 */
function addSteelHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Primary steel highlight (cool gray-white)
  const primaryHighlight = ctx.createLinearGradient(
    centerX - 250, centerY - 50,
    centerX + 250, centerY - 10
  );
  primaryHighlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
  primaryHighlight.addColorStop(0.3, 'rgba(255, 255, 255, 0.7)');
  primaryHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.8)');
  primaryHighlight.addColorStop(0.7, 'rgba(255, 255, 255, 0.6)');
  primaryHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryHighlight;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Reset for specular highlights
  ctx.globalCompositeOperation = 'source-over';
  
  // Add industrial steel reflection points
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const reflectionPoints = [
    { x: -0.35, y: -0.35, size: 5, alpha: 0.8 },
    { x: -0.15, y: -0.4, size: 6, alpha: 0.9 },
    { x: 0.05, y: -0.35, size: 4, alpha: 0.7 },
    { x: 0.25, y: -0.4, size: 5, alpha: 0.8 },
    { x: 0.4, y: -0.3, size: 3, alpha: 0.6 }
  ];

  reflectionPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 45);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${point.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, point.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw industrial steel border
 */
function drawIndustrialBorder(ctx, width, height) {
  // Outer steel border with industrial finish
  const steelBorder = ctx.createLinearGradient(0, 0, width, height);
  steelBorder.addColorStop(0, '#E0E0E0');
  steelBorder.addColorStop(0.25, '#B0B0B0');
  steelBorder.addColorStop(0.5, '#808080');
  steelBorder.addColorStop(0.75, '#B0B0B0');
  steelBorder.addColorStop(1, '#E0E0E0');

  ctx.strokeStyle = steelBorder;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Inner industrial line
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Add industrial rivets
  drawIndustrialRivets(ctx, width, height);
}

/**
 * Draw industrial rivets
 */
function drawIndustrialRivets(ctx, width, height) {
  ctx.fillStyle = '#909090';
  
  const rivetPositions = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 },
    { x: width / 2, y: 30 },
    { x: width / 2, y: height - 30 },
    { x: 30, y: height / 2 },
    { x: width - 30, y: height / 2 }
  ];

  rivetPositions.forEach(pos => {
    // Rivet base
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Rivet highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(pos.x - 1.5, pos.y - 1.5, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Reset color
    ctx.fillStyle = '#909090';
  });
}

/**
 * Add metal texture and welding effects
 */
function addMetalTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Add machining marks
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 10 + Math.random() * 30;
    const angle = Math.random() * Math.PI;
    
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Add welding spots
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 4;
    
    // Welding glow
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, 'rgba(255, 200, 100, 0.6)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Welding center
    ctx.fillStyle = 'rgba(255, 150, 50, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add Silent Wolf signature
 */
function addSignature(ctx, width, height) {
  ctx.save();
  
  // Position signature at bottom right
  const signatureX = width - 120;
  const signatureY = height - 20;
  
  // Signature style - small, italic, subtle
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle underline
  ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
  ctx.lineWidth = 0.5;
  const textWidth = ctx.measureText('by Silent Wolf').width;
  ctx.beginPath();
  ctx.moveTo(signatureX - textWidth, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Alternative: Simple steel logo
 */
async function generateSimpleSteelLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Industrial background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Steel gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#E0E0E0');
  gradient.addColorStop(0.4, '#B0B0B0');
  gradient.addColorStop(0.7, '#808080');
  gradient.addColorStop(1, '#606060');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Industrial shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Steel border
  ctx.strokeStyle = '#B0B0B0';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Add signature
  ctx.font = 'italic 10px "Arial"';
  ctx.fillStyle = 'rgba(150, 150, 150, 0.6)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('by Silent Wolf', width - 20, height - 15);

  return canvas.toBuffer('image/png');
}