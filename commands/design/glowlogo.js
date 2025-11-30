import { createCanvas } from 'canvas';

export default {
  name: "glowlogo",
  description: "Create intense glowing text logos with vibrant light effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `✨ *Glow Logo*\n\nUsage: glowlogo <text>\n\n*Example:*\nglowlogo WOLF\nglowlogo GLOW\nglowlogo LIGHT` 
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
        text: `✨ Generating glowing logo for: "${text}"...` 
      }, { quoted: m });

      // Generate glow logo
      const logoBuffer = await generateGlowLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `✨ *Glow Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [GLOWLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating glow logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate intense glowing logo with vibrant light effects
 */
async function generateGlowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create deep dark background for maximum glow contrast
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Add cosmic background effects
  drawCosmicBackground(ctx, width, height);

  // Create vibrant rainbow glow gradient
  const glowGradient = ctx.createLinearGradient(0, 70, 0, 330);
  glowGradient.addColorStop(0, '#FF0080');    // Magenta
  glowGradient.addColorStop(0.2, '#FF00FF');  // Pink
  glowGradient.addColorStop(0.4, '#8000FF');  // Purple
  glowGradient.addColorStop(0.6, '#0080FF');  // Blue
  glowGradient.addColorStop(0.8, '#00FF80');  // Green
  glowGradient.addColorStop(1, '#FFFF00');    // Yellow

  // Main text with intense glow effect
  ctx.font = 'bold 88px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create multi-layer glow effect
  createMultiLayerGlow(ctx, text, width, height, glowGradient);

  // Add radiant light bursts
  addLightBursts(ctx, width, height);

  // Add floating glow particles
  addGlowParticles(ctx, width, height);

  // Add rainbow aura effect
  addRainbowAura(ctx, text, width, height);

  // Add holographic border
  drawHolographicBorder(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw cosmic background for glow effect
 */
function drawCosmicBackground(ctx, width, height) {
  // Create deep space gradient
  const spaceGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.2
  );
  spaceGradient.addColorStop(0, '#000033');
  spaceGradient.addColorStop(0.3, '#000022');
  spaceGradient.addColorStop(0.7, '#000011');
  spaceGradient.addColorStop(1, '#000000');
  
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);

  // Add distant stars
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const alpha = 0.3 + Math.random() * 0.7;
    
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;

  // Add nebula clouds
  addNebulaEffects(ctx, width, height);
}

/**
 * Add nebula cloud effects
 */
function addNebulaEffects(ctx, width, height) {
  const nebulas = [
    { x: width * 0.2, y: height * 0.3, size: 150, color: 'rgba(255, 0, 128, 0.1)' },
    { x: width * 0.7, y: height * 0.2, size: 120, color: 'rgba(128, 0, 255, 0.08)' },
    { x: width * 0.3, y: height * 0.7, size: 130, color: 'rgba(0, 128, 255, 0.09)' },
    { x: width * 0.8, y: height * 0.6, size: 110, color: 'rgba(0, 255, 128, 0.07)' }
  ];

  nebulas.forEach(nebula => {
    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.size
    );
    gradient.addColorStop(0, nebula.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
    ctx.fill();
  });
}

/**
 * Create multi-layer glow effect
 */
function createMultiLayerGlow(ctx, text, width, height, glowGradient) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Multiple glow layers with different colors and intensities
  const glowLayers = [
    { blur: 60, alpha: 0.3, color: '#FF0080', offset: 0 },
    { blur: 50, alpha: 0.4, color: '#FF00FF', offset: 1 },
    { blur: 40, alpha: 0.5, color: '#8000FF', offset: 2 },
    { blur: 30, alpha: 0.6, color: '#0080FF', offset: 1 },
    { blur: 20, alpha: 0.7, color: '#00FF80', offset: 0 },
    { blur: 10, alpha: 0.8, color: '#FFFF00', offset: -1 }
  ];

  // Apply glow layers
  for (const layer of glowLayers) {
    ctx.shadowColor = layer.color;
    ctx.shadowBlur = layer.blur;
    ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + layer.offset, centerY + layer.offset);
  }

  // Main glowing text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = glowGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner white core for extra brightness
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);
  ctx.restore();

  // Edge highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add radiant light bursts
 */
function addLightBursts(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalAlpha = 0.4;

  // Multiple light burst layers
  for (let burst = 0; burst < 3; burst++) {
    const burstSize = 200 + burst * 100;
    const burstAlpha = 0.3 - burst * 0.1;
    
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const length = burstSize;
      
      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      
      // Rainbow burst colors
      const hue = (i * 15) % 360;
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${burstAlpha})`);
      gradient.addColorStop(0.7, `hsla(${hue}, 100%, 50%, ${burstAlpha * 0.5})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 8 - burst * 2;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(angle) * length,
        centerY + Math.sin(angle) * length
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Add floating glow particles
 */
function addGlowParticles(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalAlpha = 0.8;

  // Large glow orbs
  for (let i = 0; i < 25; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 80 + Math.random() * 250;
    const size = 3 + Math.random() * 8;
    const hue = Math.random() * 360;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.9)`);
    gradient.addColorStop(0.7, `hsla(${hue}, 100%, 60%, 0.6)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Bright core
    ctx.fillStyle = `hsla(${hue}, 100%, 90%, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.7, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small sparkles
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const hue = Math.random() * 360;
    const brightness = 0.7 + Math.random() * 0.3;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, ${brightness})`;
    
    // Star shape
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5;
      const spike = size;
      const indent = size * 0.4;
      
      ctx.lineTo(
        x + Math.cos(angle) * spike,
        y + Math.sin(angle) * spike
      );
      ctx.lineTo(
        x + Math.cos(angle + Math.PI / 5) * indent,
        y + Math.sin(angle + Math.PI / 5) * indent
      );
    }
    ctx.closePath();
    ctx.fill();

    // Add intense bloom
    ctx.shadowColor = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.shadowBlur = 12;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add rainbow aura effect around text
 */
function addRainbowAura(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Rainbow aura rings
  for (let ring = 0; ring < 3; ring++) {
    const ringSize = 120 + ring * 40;
    const ringAlpha = 0.2 - ring * 0.05;
    
    for (let i = 0; i < 36; i++) {
      const angle = (i / 36) * Math.PI * 2;
      const hue = (i * 10) % 360;
      
      const x = centerX + Math.cos(angle) * ringSize;
      const y = centerY + Math.sin(angle) * ringSize;
      
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, 30);
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, ${ringAlpha})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw holographic border
 */
function drawHolographicBorder(ctx, width, height) {
  // Outer rainbow border
  const outerBorder = ctx.createLinearGradient(0, 0, width, height);
  outerBorder.addColorStop(0, '#FF0080');
  outerBorder.addColorStop(0.2, '#FF00FF');
  outerBorder.addColorStop(0.4, '#8000FF');
  outerBorder.addColorStop(0.6, '#0080FF');
  outerBorder.addColorStop(0.8, '#00FF80');
  outerBorder.addColorStop(1, '#FFFF00');

  ctx.strokeStyle = outerBorder;
  ctx.lineWidth = 10;
  ctx.shadowColor = '#FFFFFF';
  ctx.shadowBlur = 30;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Middle glow border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 4;
  ctx.shadowBlur = 20;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner holographic line
  const innerBorder = ctx.createLinearGradient(width, 0, 0, height);
  innerBorder.addColorStop(0, '#FFFF00');
  innerBorder.addColorStop(0.2, '#00FF80');
  innerBorder.addColorStop(0.4, '#0080FF');
  innerBorder.addColorStop(0.6, '#8000FF');
  innerBorder.addColorStop(0.8, '#FF00FF');
  innerBorder.addColorStop(1, '#FF0080');

  ctx.strokeStyle = innerBorder;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(26, 26, width - 52, height - 52);

  // Add corner glow accents
  addCornerGlowAccents(ctx, width, height);
}

/**
 * Add corner glow accents
 */
function addCornerGlowAccents(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 25, y: 25 },
    { x: width - 25, y: 25 },
    { x: 25, y: height - 25 },
    { x: width - 25, y: height - 25 }
  ];

  corners.forEach((corner, index) => {
    const hue = (index * 90) % 360;
    
    const gradient = ctx.createRadialGradient(
      corner.x, corner.y, 0,
      corner.x, corner.y, 25
    );
    gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.9)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 25, 0, Math.PI * 2);
    ctx.fill();
  });

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
  
  // Signature style - small, italic, glowing
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add rainbow glow to signature
  ctx.shadowColor = '#FF00FF';
  ctx.shadowBlur = 8;
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle rainbow underline
  const underlineGradient = ctx.createLinearGradient(
    signatureX - ctx.measureText('by Silent Wolf').width,
    signatureY + 2,
    signatureX,
    signatureY + 2
  );
  underlineGradient.addColorStop(0, '#FF0080');
  underlineGradient.addColorStop(0.5, '#0080FF');
  underlineGradient.addColorStop(1, '#FFFF00');
  
  ctx.strokeStyle = underlineGradient;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(signatureX - ctx.measureText('by Silent Wolf').width, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  ctx.restore();
}