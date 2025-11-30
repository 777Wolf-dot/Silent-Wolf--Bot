import { createCanvas } from 'canvas';

export default {
  name: "titaniumlogo",
  description: "Create premium titanium metallic text logos with anodized effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🔘 *Titanium Logo*\n\nUsage: titaniumlogo <text>\n\n*Example:*\ntitaniumlogo WOLF\ntitaniumlogo TITANIUM\ntitaniumlogo ELITE` 
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
        text: `🔘 Generating titanium logo for: "${text}"...` 
      }, { quoted: m });

      // Generate titanium logo
      const logoBuffer = await generateTitaniumLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔘 *Titanium Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [TITANIUMLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating titanium logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate premium titanium metallic logo with anodized effects
 */
async function generateTitaniumLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create sophisticated dark background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, width, height);

  // Add premium background effects
  drawTitaniumBackground(ctx, width, height);

  // Create realistic titanium gradient (cool gray with subtle color shifts)
  const titaniumGradient = ctx.createLinearGradient(0, 100, 0, 300);
  titaniumGradient.addColorStop(0, '#E8E8E8');    // Bright titanium
  titaniumGradient.addColorStop(0.15, '#D0D0D0'); // Light titanium
  titaniumGradient.addColorStop(0.3, '#B0B0B0');  // Pure titanium
  titaniumGradient.addColorStop(0.45, '#909090'); // Medium titanium
  titaniumGradient.addColorStop(0.6, '#707070');  // Dark titanium
  titaniumGradient.addColorStop(0.75, '#505050'); // Shadow titanium
  titaniumGradient.addColorStop(0.9, '#383838');  // Deep shadow
  titaniumGradient.addColorStop(1, '#202020');    // Dark base

  // Main text with premium titanium effect
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create premium 3D titanium effect
  createTitanium3DEffect(ctx, text, width, height, titaniumGradient);

  // Add titanium-specific highlights and anodized effects
  addTitaniumHighlights(ctx, text, width, height);

  // Add anodized color effects
  addAnodizedEffects(ctx, text, width, height);

  // Add premium border
  drawTitaniumBorder(ctx, width, height);

  // Add brushed metal texture
  addBrushedTexture(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw premium titanium background
 */
function drawTitaniumBackground(ctx, width, height) {
  // Create deep blue-gray radial gradient
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

  // Add subtle geometric pattern (aerospace inspired)
  ctx.strokeStyle = 'rgba(80, 100, 120, 0.1)';
  ctx.lineWidth = 1;
  
  // Hexagonal grid pattern (common in aerospace)
  const hexSize = 30;
  for (let x = -hexSize; x < width + hexSize; x += hexSize * 1.5) {
    for (let y = -hexSize; y < height + hexSize; y += hexSize * Math.sqrt(3)) {
      drawHexagon(ctx, x + (y % (hexSize * Math.sqrt(3)) > hexSize * Math.sqrt(3) / 2 ? hexSize * 0.75 : 0), y, hexSize);
    }
  }

  // Add corner precision markers
  drawPrecisionCorners(ctx, width, height);
}

/**
 * Draw hexagon for aerospace pattern
 */
function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hexX = x + size * Math.cos(angle);
    const hexY = y + size * Math.sin(angle);
    if (i === 0) {
      ctx.moveTo(hexX, hexY);
    } else {
      ctx.lineTo(hexX, hexY);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Create premium 3D titanium effect
 */
function createTitanium3DEffect(ctx, text, width, height, titaniumGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 10;

  // Precise shadow layers for aerospace precision
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.2;
    const alpha = 0.06 + (i / depth) * 0.2;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main titanium text with inner precision
  ctx.shadowColor = 'rgba(100, 120, 140, 0.3)';
  ctx.shadowBlur = 12;
  ctx.fillStyle = titaniumGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Precision edge bevel
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.4)';
  ctx.lineWidth = 1.2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add titanium-specific highlights (cool, precise reflections)
 */
function addTitaniumHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Primary highlight (cool, precise)
  const primaryHighlight = ctx.createLinearGradient(
    centerX - 250, centerY - 60,
    centerX + 250, centerY - 15
  );
  primaryHighlight.addColorStop(0, 'rgba(240, 240, 255, 0)');
  primaryHighlight.addColorStop(0.3, 'rgba(240, 240, 255, 0.8)');
  primaryHighlight.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)');
  primaryHighlight.addColorStop(0.7, 'rgba(240, 240, 255, 0.7)');
  primaryHighlight.addColorStop(1, 'rgba(240, 240, 255, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryHighlight;
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Reset for specular highlights
  ctx.globalCompositeOperation = 'source-over';
  
  // Add precise reflection points
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const reflectionPoints = [
    { x: -0.35, y: -0.35, size: 4, alpha: 0.9 },
    { x: -0.18, y: -0.42, size: 5, alpha: 0.95 },
    { x: 0, y: -0.38, size: 4, alpha: 0.9 },
    { x: 0.18, y: -0.42, size: 5, alpha: 0.95 },
    { x: 0.35, y: -0.35, size: 4, alpha: 0.9 }
  ];

  reflectionPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 48);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${point.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, point.size, 0, Math.PI * 2);
    ctx.fill();

    // Add precise bloom to highlights
    ctx.shadowColor = 'rgba(200, 220, 255, 0.6)';
    ctx.shadowBlur = 8;
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add anodized color effects (titanium can be anodized to various colors)
 */
function addAnodizedEffects(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalCompositeOperation = 'overlay';

  // Blue-purple anodized effect (common for titanium)
  const anodizedGradient = ctx.createLinearGradient(
    centerX - 200, centerY + 20,
    centerX + 200, centerY - 30
  );
  anodizedGradient.addColorStop(0, 'rgba(100, 150, 255, 0.2)');   // Blue
  anodizedGradient.addColorStop(0.5, 'rgba(150, 100, 255, 0.25)'); // Purple
  anodizedGradient.addColorStop(1, 'rgba(100, 200, 255, 0.2)');   // Light blue

  ctx.fillStyle = anodizedGradient;
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Add rainbow anodized spots
  ctx.globalCompositeOperation = 'screen';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  
  const anodizedSpots = [
    { x: -0.25, y: 0.15, size: 6, color: 'rgba(255, 100, 100, 0.3)' },   // Red
    { x: -0.1, y: 0.25, size: 5, color: 'rgba(255, 200, 100, 0.25)' },  // Gold
    { x: 0.1, y: 0.15, size: 7, color: 'rgba(100, 255, 100, 0.35)' },   // Green
    { x: 0.25, y: 0.25, size: 4, color: 'rgba(100, 200, 255, 0.3)' }    // Blue
  ];

  anodizedSpots.forEach(spot => {
    const x = centerX + (spot.x * textWidth / 2);
    const y = centerY + (spot.y * 35);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, spot.size * 2);
    gradient.addColorStop(0, spot.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, spot.size * 2, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw premium titanium border
 */
function drawTitaniumBorder(ctx, width, height) {
  // Outer titanium border with precise gradient
  const titaniumBorder = ctx.createLinearGradient(0, 0, width, height);
  titaniumBorder.addColorStop(0, '#E8E8E8');
  titaniumBorder.addColorStop(0.25, '#C8C8C8');
  titaniumBorder.addColorStop(0.5, '#A8A8A8');
  titaniumBorder.addColorStop(0.75, '#C8C8C8');
  titaniumBorder.addColorStop(1, '#E8E8E8');

  ctx.strokeStyle = titaniumBorder;
  ctx.lineWidth = 7;
  ctx.shadowColor = 'rgba(100, 120, 140, 0.4)';
  ctx.shadowBlur = 18;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Middle precision line
  ctx.strokeStyle = 'rgba(180, 200, 220, 0.5)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Inner anodized line
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeRect(36, 36, width - 72, height - 72);

  // Add aerospace fasteners
  drawAerospaceFasteners(ctx, width, height);
}

/**
 * Draw aerospace-style fasteners
 */
function drawAerospaceFasteners(ctx, width, height) {
  ctx.fillStyle = '#B0B0B0';
  
  const fastenerPositions = [
    { x: 35, y: 35 },
    { x: width - 35, y: 35 },
    { x: 35, y: height - 35 },
    { x: width - 35, y: height - 35 },
    { x: width / 2, y: 35 },
    { x: width / 2, y: height - 35 },
    { x: 35, y: height / 2 },
    { x: width - 35, y: height / 2 }
  ];

  fastenerPositions.forEach(pos => {
    // Fastener base (hex shape for aerospace look)
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(Math.PI / 6); // 30 degrees for hex
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI) / 3;
      const hexX = 4 * Math.cos(angle);
      const hexY = 4 * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(hexX, hexY);
      } else {
        ctx.lineTo(hexX, hexY);
      }
    }
    ctx.closePath();
    ctx.fill();

    // Fastener center
    ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.beginPath();
    ctx.arc(0, 0, 1.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.fillStyle = '#B0B0B0';
  });
}

/**
 * Add brushed metal texture (common for titanium finishes)
 */
function addBrushedTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.15;

  // Brushed lines (horizontal for aerospace finish)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.8;
  
  for (let y = 0; y < height; y += 2) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Add machining marks
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 5 + Math.random() * 15;
    
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.4)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw precision corner markers
 */
function drawPrecisionCorners(ctx, width, height) {
  ctx.strokeStyle = 'rgba(120, 140, 160, 0.4)';
  ctx.lineWidth = 2;
  
  const cornerSize = 20;
  const markerLength = 8;

  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(25, 25 + cornerSize);
  ctx.lineTo(25, 25 + markerLength);
  ctx.moveTo(25, 25);
  ctx.lineTo(25 + markerLength, 25);
  ctx.stroke();

  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(width - 25, 25 + cornerSize);
  ctx.lineTo(width - 25, 25 + markerLength);
  ctx.moveTo(width - 25, 25);
  ctx.lineTo(width - 25 - markerLength, 25);
  ctx.stroke();

  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(25, height - 25 - cornerSize);
  ctx.lineTo(25, height - 25 - markerLength);
  ctx.moveTo(25, height - 25);
  ctx.lineTo(25 + markerLength, height - 25);
  ctx.stroke();

  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(width - 25, height - 25 - cornerSize);
  ctx.lineTo(width - 25, height - 25 - markerLength);
  ctx.moveTo(width - 25, height - 25);
  ctx.lineTo(width - 25 - markerLength, height - 25);
  ctx.stroke();
}

/**
 * Add Silent Wolf signature
 */
function addSignature(ctx, width, height) {
  ctx.save();
  
  // Position signature at bottom right
  const signatureX = width - 120;
  const signatureY = height - 20;
  
  // Signature style - small, italic, premium look
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(160, 180, 200, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle precision underline
  ctx.strokeStyle = 'rgba(160, 180, 200, 0.4)';
  ctx.lineWidth = 0.5;
  const textWidth = ctx.measureText('by Silent Wolf').width;
  ctx.beginPath();
  ctx.moveTo(signatureX - textWidth, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Alternative: Simple titanium logo
 */
async function generateSimpleTitaniumLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Premium dark background
  ctx.fillStyle = '#0a0a14';
  ctx.fillRect(0, 0, width, height);

  // Titanium gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#E8E8E8');
  gradient.addColorStop(0.4, '#C8C8C8');
  gradient.addColorStop(0.7, '#A8A8A8');
  gradient.addColorStop(1, '#888888');

  ctx.font = 'bold 72px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Premium shadow
  ctx.shadowColor = 'rgba(100, 120, 140, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Titanium border
  ctx.strokeStyle = '#C8C8C8';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Add signature
  ctx.font = 'italic 10px "Arial"';
  ctx.fillStyle = 'rgba(160, 180, 200, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('by Silent Wolf', width - 20, height - 15);

  return canvas.toBuffer('image/png');
}