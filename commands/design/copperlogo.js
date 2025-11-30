import { createCanvas } from 'canvas';

export default {
  name: "copperlogo",
  description: "Create warm copper metallic text logos with natural patina",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🟠 *Copper Logo*\n\nUsage: copperlogo <text>\n\n*Example:*\ncopperlogo WOLF\ncopperlogo COPPER\ncopperlogo WARM` 
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
        text: `🟠 Generating copper logo for: "${text}"...` 
      }, { quoted: m });

      // Generate copper logo
      const logoBuffer = await generateCopperLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🟠 *Copper Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [COPPERLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating copper logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate warm copper metallic logo with natural patina
 */
async function generateCopperLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create warm earthy background
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(0, 0, width, height);

  // Add natural background texture
  drawNaturalBackground(ctx, width, height);

  // Create realistic copper gradient (warm orange-brown tones)
  const copperGradient = ctx.createLinearGradient(0, 100, 0, 300);
  copperGradient.addColorStop(0, '#FFD700');    // Bright copper
  copperGradient.addColorStop(0.15, '#E6B800'); // Light copper
  copperGradient.addColorStop(0.3, '#CD7F32');  // Pure copper
  copperGradient.addColorStop(0.45, '#B87333'); // Classic copper
  copperGradient.addColorStop(0.6, '#A65A29');  // Medium copper
  copperGradient.addColorStop(0.75, '#8B4513'); // Dark copper
  copperGradient.addColorStop(0.9, '#654321');  // Shadow copper
  copperGradient.addColorStop(1, '#4E3524');    // Deep shadow

  // Main text with warm copper effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create natural copper 3D effect
  createCopper3DEffect(ctx, text, width, height, copperGradient);

  // Add copper-specific highlights and patina
  addCopperHighlights(ctx, text, width, height);

  // Add natural patina effects
  addCopperPatina(ctx, text, width, height);

  // Add warm border
  drawCopperBorder(ctx, width, height);

  // Add hammered metal texture
  addHammeredTexture(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw natural earthy background
 */
function drawNaturalBackground(ctx, width, height) {
  // Create warm earthy gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.5
  );
  radialGradient.addColorStop(0, '#3a2a1a');
  radialGradient.addColorStop(0.4, '#2a1a0a');
  radialGradient.addColorStop(0.8, '#1a0a00');
  radialGradient.addColorStop(1, '#0a0500');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add natural texture (like earth or stone)
  ctx.strokeStyle = 'rgba(120, 80, 40, 0.1)';
  ctx.lineWidth = 1;
  
  // Organic texture lines
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 15 + Math.random() * 35;
    const angle = Math.random() * Math.PI * 2;
    const curve = (Math.random() - 0.5) * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.quadraticCurveTo(
      x + Math.cos(angle) * length * 0.5 + curve * 20,
      y + Math.sin(angle) * length * 0.5 + curve * 20,
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Add mineral specks
  ctx.fillStyle = 'rgba(200, 150, 50, 0.2)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Create natural copper 3D effect
 */
function createCopper3DEffect(ctx, text, width, height, copperGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 8;

  // Warm shadow layers for natural depth
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.5;
    const alpha = 0.08 + (i / depth) * 0.25;
    const brownTone = 80 - i * 8;
    
    ctx.fillStyle = `rgba(${brownTone}, ${brownTone - 20}, ${brownTone - 40}, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main copper text with warm glow
  ctx.fillStyle = copperGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Natural edge glow
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add copper-specific highlights (warm golden reflections)
 */
function addCopperHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Primary copper highlight (warm golden)
  const primaryHighlight = ctx.createLinearGradient(
    centerX - 250, centerY - 50,
    centerX + 250, centerY - 10
  );
  primaryHighlight.addColorStop(0, 'rgba(255, 255, 200, 0)');
  primaryHighlight.addColorStop(0.3, 'rgba(255, 255, 150, 0.6)');
  primaryHighlight.addColorStop(0.5, 'rgba(255, 255, 100, 0.7)');
  primaryHighlight.addColorStop(0.7, 'rgba(255, 255, 150, 0.5)');
  primaryHighlight.addColorStop(1, 'rgba(255, 255, 200, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryHighlight;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Reset for specular highlights
  ctx.globalCompositeOperation = 'source-over';
  
  // Add warm copper reflection points
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const reflectionPoints = [
    { x: -0.35, y: -0.35, size: 5, alpha: 0.8, color: 'rgba(255, 230, 100, 0.9)' },
    { x: -0.15, y: -0.4, size: 6, alpha: 0.9, color: 'rgba(255, 220, 80, 0.9)' },
    { x: 0.05, y: -0.35, size: 4, alpha: 0.7, color: 'rgba(255, 240, 120, 0.8)' },
    { x: 0.25, y: -0.4, size: 5, alpha: 0.8, color: 'rgba(255, 230, 100, 0.9)' },
    { x: 0.4, y: -0.3, size: 3, alpha: 0.6, color: 'rgba(255, 240, 130, 0.7)' }
  ];

  reflectionPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 45);
    
    ctx.fillStyle = point.color.replace(')', `, ${point.alpha})`).replace('a(', 'a(');
    ctx.beginPath();
    ctx.arc(x, y, point.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add natural copper patina effects
 */
function addCopperPatina(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Green patina (verdigris)
  const patinaGradient = ctx.createLinearGradient(
    centerX - 200, centerY + 40,
    centerX + 200, centerY - 30
  );
  patinaGradient.addColorStop(0, 'rgba(83, 130, 85, 0.2)');   // Light verdigris
  patinaGradient.addColorStop(0.4, 'rgba(67, 111, 77, 0.3)'); // Medium patina
  patinaGradient.addColorStop(0.7, 'rgba(53, 94, 59, 0.2)');  // Dark patina
  patinaGradient.addColorStop(1, 'transparent');

  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = patinaGradient;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Blue patina spots (copper carbonate)
  ctx.globalCompositeOperation = 'source-over';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  
  const patinaSpots = [
    { x: -0.3, y: 0.25, size: 8, alpha: 0.4, color: 'rgba(64, 130, 109, 0.5)' },
    { x: -0.1, y: -0.15, size: 6, alpha: 0.3, color: 'rgba(72, 140, 120, 0.4)' },
    { x: 0.15, y: 0.35, size: 10, alpha: 0.5, color: 'rgba(60, 125, 105, 0.6)' },
    { x: 0.35, y: -0.25, size: 7, alpha: 0.4, color: 'rgba(68, 135, 115, 0.5)' },
    { x: 0.45, y: 0.15, size: 5, alpha: 0.3, color: 'rgba(76, 145, 125, 0.4)' }
  ];

  patinaSpots.forEach(spot => {
    const x = centerX + (spot.x * textWidth / 2);
    const y = centerY + (spot.y * 40);
    
    ctx.fillStyle = spot.color.replace(')', `, ${spot.alpha})`).replace('a(', 'a(');
    ctx.beginPath();
    ctx.arc(x, y, spot.size, 0, Math.PI * 2);
    ctx.fill();

    // Add texture to patina spots
    ctx.fillStyle = spot.color.replace(')', `, ${spot.alpha * 0.7})`).replace('a(', 'a(');
    ctx.beginPath();
    ctx.arc(x - spot.size * 0.3, y - spot.size * 0.3, spot.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw warm copper border
 */
function drawCopperBorder(ctx, width, height) {
  // Outer copper border with warm gradient
  const copperBorder = ctx.createLinearGradient(0, 0, width, height);
  copperBorder.addColorStop(0, '#FFD700');
  copperBorder.addColorStop(0.25, '#E6B800');
  copperBorder.addColorStop(0.5, '#B87333');
  copperBorder.addColorStop(0.75, '#E6B800');
  copperBorder.addColorStop(1, '#FFD700');

  ctx.strokeStyle = copperBorder;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(184, 115, 51, 0.5)';
  ctx.shadowBlur = 15;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner warm line
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Add copper rivets
  drawCopperRivets(ctx, width, height);
}

/**
 * Draw copper rivets
 */
function drawCopperRivets(ctx, width, height) {
  ctx.fillStyle = '#B87333';
  
  const rivetPositions = [
    { x: 35, y: 35 },
    { x: width - 35, y: 35 },
    { x: 35, y: height - 35 },
    { x: width - 35, y: height - 35 },
    { x: width / 2, y: 35 },
    { x: width / 2, y: height - 35 }
  ];

  rivetPositions.forEach(pos => {
    // Rivet base
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rivet highlight (warm copper)
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(pos.x - 2, pos.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset color
    ctx.fillStyle = '#B87333';
  });
}

/**
 * Add hammered metal texture
 */
function addHammeredTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.2;

  // Hammered texture (small dents and impressions)
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 5;
    
    ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${120 + Math.random() * 30}, ${50 + Math.random() * 20}, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Add highlight to hammer marks
    ctx.fillStyle = `rgba(255, 230, 150, 0.4)`;
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add tooling marks
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.3)';
  ctx.lineWidth = 0.8;
  
  for (let i = 0; i < 40; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const length = 8 + Math.random() * 25;
    const angle = Math.random() * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
    ctx.stroke();
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
  
  // Signature style - small, italic, warm copper color
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(184, 115, 51, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle copper-colored underline
  ctx.strokeStyle = 'rgba(184, 115, 51, 0.4)';
  ctx.lineWidth = 0.5;
  const textWidth = ctx.measureText('by Silent Wolf').width;
  ctx.beginPath();
  ctx.moveTo(signatureX - textWidth, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  ctx.restore();
}

/**
 * Alternative: Simple copper logo
 */
async function generateSimpleCopperLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Warm earthy background
  ctx.fillStyle = '#2a1a0a';
  ctx.fillRect(0, 0, width, height);

  // Copper gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#FFD700');
  gradient.addColorStop(0.4, '#E6B800');
  gradient.addColorStop(0.7, '#B87333');
  gradient.addColorStop(1, '#8B4513');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Warm shadow
  ctx.shadowColor = 'rgba(184, 115, 51, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Copper border
  ctx.strokeStyle = '#B87333';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  // Add signature
  ctx.font = 'italic 10px "Arial"';
  ctx.fillStyle = 'rgba(184, 115, 51, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('by Silent Wolf', width - 20, height - 15);

  return canvas.toBuffer('image/png');
}