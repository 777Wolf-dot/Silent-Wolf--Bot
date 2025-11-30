import { createCanvas } from 'canvas';

export default {
  name: "iceglowlogo",
  description: "Create glowing ice text logos with radiant light effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💠 *Ice Glow Logo*\n\nUsage: iceglowlogo <text>\n\n*Example:*\niceglowlogo WOLF\niceglowlogo GLOW\niceglowlogo FROZEN` 
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
        text: `💠 Generating glowing ice logo for: "${text}"...` 
      }, { quoted: m });

      // Generate ice glow logo
      const logoBuffer = await generateIceGlowLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💠 *Ice Glow Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [ICEGLOWLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating ice glow logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate glowing ice logo with light effects
 */
async function generateIceGlowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create deep night background for glow contrast
  ctx.fillStyle = '#050a14';
  ctx.fillRect(0, 0, width, height);

  // Add glowing background effects
  drawGlowingBackground(ctx, width, height);

  // Create glowing ice gradient
  const glowGradient = ctx.createLinearGradient(0, 80, 0, 320);
  glowGradient.addColorStop(0, '#FFFFFF');    // Bright center
  glowGradient.addColorStop(0.2, '#B8F8FF');  // Electric blue
  glowGradient.addColorStop(0.4, '#80F0FF');  // Bright cyan
  glowGradient.addColorStop(0.6, '#48E8FF');  // Medium cyan
  glowGradient.addColorStop(0.8, '#20E0FF');  // Deep cyan
  glowGradient.addColorStop(1, '#00D8FF');    // Glowing base

  // Main text with glowing ice effect
  ctx.font = 'bold 86px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create intense glow effect
  createIceGlowEffect(ctx, text, width, height, glowGradient);

  // Add light rays and glow effects
  addLightRays(ctx, width, height);

  // Add particle glow effects
  addGlowParticles(ctx, width, height);

  // Add crystal glow effects
  addCrystalGlow(ctx, text, width, height);

  // Add radiant border
  drawRadiantBorder(ctx, width, height);

  // Add Silent Wolf signature
  addSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw glowing background for ice glow logo
 */
function drawGlowingBackground(ctx, width, height) {
  // Create deep night gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 1.2
  );
  radialGradient.addColorStop(0, '#001a33');
  radialGradient.addColorStop(0.3, '#000a1a');
  radialGradient.addColorStop(0.7, '#000514');
  radialGradient.addColorStop(1, '#000000');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add starfield for glow contrast
  ctx.fillStyle = '#FFFFFF';
  for (let i = 0; i < 100; i++) {
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

  // Add aurora effect
  const aurora = ctx.createLinearGradient(0, 0, 0, height);
  aurora.addColorStop(0, 'rgba(0, 100, 255, 0.1)');
  aurora.addColorStop(0.5, 'rgba(0, 200, 255, 0.05)');
  aurora.addColorStop(1, 'rgba(0, 150, 255, 0.08)');
  
  ctx.fillStyle = aurora;
  ctx.fillRect(0, 0, width, height);

  // Add nebula clouds
  addNebulaClouds(ctx, width, height);
}

/**
 * Add nebula cloud effects
 */
function addNebulaClouds(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  const clouds = [
    { x: width * 0.2, y: height * 0.3, size: 120, color: 'rgba(0, 100, 255, 0.4)' },
    { x: width * 0.7, y: height * 0.2, size: 90, color: 'rgba(0, 150, 255, 0.3)' },
    { x: width * 0.3, y: height * 0.7, size: 110, color: 'rgba(0, 80, 255, 0.35)' },
    { x: width * 0.8, y: height * 0.6, size: 80, color: 'rgba(0, 120, 255, 0.25)' }
  ];

  clouds.forEach(cloud => {
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, cloud.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Create intense ice glow effect
 */
function createIceGlowEffect(ctx, text, width, height, glowGradient) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Multiple glow layers for intense effect
  const glowLayers = [
    { blur: 50, alpha: 0.3, offset: 0, color: '#00D8FF' },
    { blur: 40, alpha: 0.4, offset: 0, color: '#20E0FF' },
    { blur: 30, alpha: 0.5, offset: 0, color: '#48E8FF' },
    { blur: 20, alpha: 0.6, offset: 0, color: '#80F0FF' },
    { blur: 10, alpha: 0.7, offset: 0, color: '#B8F8FF' }
  ];

  for (const layer of glowLayers) {
    ctx.shadowColor = layer.color;
    ctx.shadowBlur = layer.blur;
    ctx.fillStyle = `rgba(255, 255, 255, ${layer.alpha})`;
    ctx.fillText(text.toUpperCase(), centerX, centerY + layer.offset);
  }

  // Main glowing text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.fillStyle = glowGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner glow with screen blend
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(180, 240, 255, 0.6)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);
  ctx.restore();

  // Edge glow
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 1.5;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add light rays for glow effect
 */
function addLightRays(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalAlpha = 0.4;

  // Radiant light rays
  for (let i = 0; i < 16; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const length = 450;
    const pulse = Math.sin(Date.now() * 0.001 + i) * 0.2 + 0.8;
    
    const gradient = ctx.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    gradient.addColorStop(0, `rgba(0, 216, 255, ${0.9 * pulse})`);
    gradient.addColorStop(0.7, `rgba(0, 150, 255, ${0.5 * pulse})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add particle glow effects
 */
function addGlowParticles(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  ctx.globalAlpha = 0.8;

  // Glowing particles around center
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 50 + Math.random() * 200;
    const size = 1 + Math.random() * 4;
    const pulse = Math.sin(Date.now() * 0.002 + i) * 0.3 + 0.7;
    
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 3);
    gradient.addColorStop(0, `rgba(0, 216, 255, ${0.9 * pulse})`);
    gradient.addColorStop(0.5, `rgba(0, 150, 255, ${0.6 * pulse})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add sparkle particles
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 3;
    const brightness = 0.7 + Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    
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

    // Add bloom to sparkles
    ctx.shadowColor = 'rgba(0, 216, 255, 0.8)';
    ctx.shadowBlur = 10;
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add crystal glow effects to text
 */
function addCrystalGlow(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const textWidth = ctx.measureText(text.toUpperCase()).width;

  ctx.save();
  ctx.globalAlpha = 0.9;

  // Crystal glow points on text
  const glowPoints = [
    { x: -0.35, y: -0.3, size: 6, intensity: 0.9 },
    { x: -0.2, y: -0.4, size: 7, intensity: 1.0 },
    { x: -0.05, y: -0.35, size: 5, intensity: 0.8 },
    { x: 0.1, y: -0.4, size: 6, intensity: 0.9 },
    { x: 0.25, y: -0.3, size: 5, intensity: 0.8 },
    { x: 0.35, y: -0.25, size: 4, intensity: 0.7 },
    { x: -0.3, y: 0.2, size: 3, intensity: 0.6 },
    { x: 0.25, y: 0.25, size: 3, intensity: 0.6 }
  ];

  glowPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 45);
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, point.size * 2);
    gradient.addColorStop(0, `rgba(255, 255, 255, ${point.intensity})`);
    gradient.addColorStop(0.7, `rgba(0, 216, 255, ${point.intensity * 0.7})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, point.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Intense core
    ctx.fillStyle = `rgba(255, 255, 255, ${point.intensity})`;
    ctx.beginPath();
    ctx.arc(x, y, point.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw radiant border
 */
function drawRadiantBorder(ctx, width, height) {
  // Outer glowing border
  const outerBorder = ctx.createLinearGradient(0, 0, width, height);
  outerBorder.addColorStop(0, '#B8F8FF');
  outerBorder.addColorStop(0.25, '#80F0FF');
  outerBorder.addColorStop(0.5, '#20E0FF');
  outerBorder.addColorStop(0.75, '#80F0FF');
  outerBorder.addColorStop(1, '#B8F8FF');

  ctx.strokeStyle = outerBorder;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(0, 216, 255, 0.8)';
  ctx.shadowBlur = 25;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Middle glow line
  ctx.strokeStyle = 'rgba(180, 240, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Inner radiant line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.shadowBlur = 0;
  ctx.strokeRect(28, 28, width - 56, height - 56);

  // Add corner glow accents
  addCornerGlow(ctx, width, height);
}

/**
 * Add corner glow accents
 */
function addCornerGlow(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const corners = [
    { x: 25, y: 25 },
    { x: width - 25, y: 25 },
    { x: 25, y: height - 25 },
    { x: width - 25, y: height - 25 }
  ];

  corners.forEach(corner => {
    const gradient = ctx.createRadialGradient(
      corner.x, corner.y, 0,
      corner.x, corner.y, 20
    );
    gradient.addColorStop(0, 'rgba(0, 216, 255, 0.9)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 20, 0, Math.PI * 2);
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
  
  // Signature style - small, italic, glowing cyan
  ctx.font = 'italic 12px "Arial"';
  ctx.fillStyle = 'rgba(0, 216, 255, 0.8)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Add glow to signature
  ctx.shadowColor = 'rgba(0, 150, 255, 0.6)';
  ctx.shadowBlur = 5;
  
  // Add signature
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Add subtle glowing underline
  ctx.strokeStyle = 'rgba(0, 216, 255, 0.5)';
  ctx.lineWidth = 0.8;
  const textWidth = ctx.measureText('by Silent Wolf').width;
  ctx.beginPath();
  ctx.moveTo(signatureX - textWidth, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  
  ctx.restore();
}