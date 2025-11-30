import { createCanvas } from 'canvas';

export default {
  name: "icelogo",
  description: "Create frozen ice crystal text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `❄️ *Ice Logo*\n\nUsage: icelogo <text>\n\n*Example:*\nicelogo WOLF\nicelogo FROST\nicelogo ICE` 
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
        text: `❄️ Generating frozen ice logo for: "${text}"...` 
      }, { quoted: m });

      // Generate ice logo
      const logoBuffer = await generateIceLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `❄️ *Ice Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [ICELOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating ice logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate frozen ice crystal logo
 */
async function generateIceLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create deep blue frozen background
  ctx.fillStyle = '#0a1428';
  ctx.fillRect(0, 0, width, height);

  // Add frozen background effects
  drawFrozenBackground(ctx, width, height);

  // Create ice crystal gradient
  const iceGradient = ctx.createLinearGradient(0, 100, 0, 300);
  iceGradient.addColorStop(0, '#FFFFFF');    // Bright ice
  iceGradient.addColorStop(0.2, '#E8F4FF');  // Light blue ice
  iceGradient.addColorStop(0.4, '#C8E8FF');  // Crystal ice
  iceGradient.addColorStop(0.6, '#A0D8FF');  // Medium ice
  iceGradient.addColorStop(0.8, '#78C8FF');  // Deep ice
  iceGradient.addColorStop(1, '#50B8FF');    // Frozen base

  // Main text with crystal ice effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create frozen 3D ice effect
  createFrozenIceEffect(ctx, text, width, height, iceGradient);

  // Add ice crystal facets
  addIceFacets(ctx, text, width, height);

  // Add frost and snow effects
  addFrostEffects(ctx, width, height);

  // Add frozen border
  drawFrozenBorder(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw frozen background for ice logo
 */
function drawFrozenBackground(ctx, width, height) {
  // Create frozen blue gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.5
  );
  radialGradient.addColorStop(0, '#1a2a4a');
  radialGradient.addColorStop(0.4, '#0a1a3a');
  radialGradient.addColorStop(0.8, '#050a28');
  radialGradient.addColorStop(1, '#000518');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add snowflake pattern
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.1)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    drawSnowflake(ctx, x, y, 2 + Math.random() * 4);
  }

  // Add frost crystals
  ctx.fillStyle = 'rgba(180, 220, 255, 0.2)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    
    drawIceCrystal(ctx, x, y, size);
  }
}

/**
 * Create frozen ice crystal effect
 */
function createFrozenIceEffect(ctx, text, width, height, iceGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 8;

  // Crystal shadow layers
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.2;
    const alpha = 0.05 + (i / depth) * 0.2;
    const blueTone = 150 - i * 15;
    
    ctx.fillStyle = `rgba(0, ${blueTone}, 255, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main ice text
  ctx.fillStyle = iceGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Crystal edge highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1.2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add ice crystal facets
 */
function addIceFacets(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const textWidth = ctx.measureText(text.toUpperCase()).width;

  ctx.save();
  ctx.globalAlpha = 0.7;

  // Add crystal reflection points
  const facetPoints = [
    { x: -0.3, y: -0.3, size: 4 },
    { x: -0.15, y: -0.4, size: 5 },
    { x: 0, y: -0.35, size: 3 },
    { x: 0.15, y: -0.4, size: 4 },
    { x: 0.3, y: -0.3, size: 3 },
    { x: -0.25, y: 0.2, size: 2 },
    { x: 0.2, y: 0.25, size: 2 }
  ];

  facetPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 40);
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, point.size, 0, Math.PI * 2);
    ctx.fill();

    // Add bloom to facets
    ctx.shadowColor = 'rgba(180, 220, 255, 0.8)';
    ctx.shadowBlur = 8;
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add frost and snow effects
 */
function addFrostEffects(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  // Add falling snow
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add frost breath effect
  const breath = ctx.createLinearGradient(0, height * 0.6, 0, height);
  breath.addColorStop(0, 'rgba(200, 230, 255, 0.3)');
  breath.addColorStop(1, 'transparent');
  
  ctx.fillStyle = breath;
  ctx.fillRect(0, height * 0.6, width, height * 0.4);

  ctx.restore();
}

/**
 * Draw frozen border
 */
function drawFrozenBorder(ctx, width, height) {
  // Ice crystal border
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#A0D8FF');
  borderGradient.addColorStop(0.5, '#78C8FF');
  borderGradient.addColorStop(1, '#A0D8FF');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 6;
  ctx.shadowColor = 'rgba(0, 150, 255, 0.4)';
  ctx.shadowBlur = 15;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner frost line
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(30, 30, width - 60, height - 60);
}

/**
 * Draw snowflake
 */
function drawSnowflake(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  
  for (let i = 0; i < 6; i++) {
    ctx.rotate(Math.PI / 3);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, size);
    ctx.stroke();
    
    // Side branches
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, size * 0.3);
    ctx.lineTo(size * 0.3, size * 0.7);
    ctx.stroke();
  }
  
  ctx.restore();
}

/**
 * Draw ice crystal
 */
function drawIceCrystal(ctx, x, y, size) {
  ctx.save();
  ctx.translate(x, y);
  
  // Diamond shape
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.7, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.7, 0);
  ctx.closePath();
  ctx.fill();
  
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
  
  // Signature style - small, italic, icy color
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(160, 200, 255, 0.7)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle icy underline
  ctx.strokeStyle = 'rgba(160, 200, 255, 0.4)';
  ctx.lineWidth = 0.5;
  const textWidth = ctx.measureText('by Silent Wolf').width;
  ctx.beginPath();
  ctx.moveTo(signatureX - textWidth, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  ctx.restore();
}