import { createCanvas } from 'canvas';

export default {
  name: "moonlogo",
  description: "Create stunning text logos with realistic moon background and cosmic effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🌙 *Moon Logo*\n\nUsage: moonlogo <text>\n\n*Example:*\nmoonlogo LUNA\nmoonlogo MOON\nmoonlogo NIGHT` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      
      if (text.length > 10) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Please use maximum 10 characters.\n\nYour text: "${text}" (${text.length} characters)` 
        }, { quoted: m });
        return;
      }

      // Send waiting message
      await sock.sendMessage(jid, { 
        text: `🌙 Generating moon logo for: "${text}"...` 
      }, { quoted: m });

      // Generate moon logo
      const logoBuffer = await generateMoonLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🌙 *Moon Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [MOONLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating moon logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate realistic moon logo with cosmic effects
 */
async function generateMoonLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create deep space background
  createDeepSpaceBackground(ctx, width, height);

  // Generate realistic moon
  const moonSize = 120;
  const moonX = width * 0.75;
  const moonY = height * 0.3;
  drawRealisticMoon(ctx, moonX, moonY, moonSize);

  // Add moon glow and atmospheric effects
  addMoonGlow(ctx, moonX, moonY, moonSize);
  addLensFlare(ctx, moonX, moonY, moonSize);

  // Create cosmic text with moon-inspired colors
  drawCosmicText(ctx, text, width, height);

  // Add stars and celestial elements
  addDetailedStars(ctx, width, height);
  addShootingStars(ctx, width, height);

  // Add cosmic dust and nebulae
  addCosmicDust(ctx, width, height);
  addNebulaBackground(ctx, width, height);

  // Add border and signature
  drawCosmicBorder(ctx, width, height);
  addMoonSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create deep space background with gradient
 */
function createDeepSpaceBackground(ctx, width, height) {
  // Deep space gradient
  const spaceGradient = ctx.createRadialGradient(
    width * 0.3, height * 0.3, 0,
    width, height, Math.max(width, height) * 0.8
  );
  spaceGradient.addColorStop(0, '#0a0a2a');
  spaceGradient.addColorStop(0.4, '#070720');
  spaceGradient.addColorStop(0.7, '#050515');
  spaceGradient.addColorStop(1, '#000005');
  
  ctx.fillStyle = spaceGradient;
  ctx.fillRect(0, 0, width, height);

  // Add distant galaxy clouds
  addGalaxyClouds(ctx, width, height);
}

/**
 * Draw realistic moon with craters and texture
 */
function drawRealisticMoon(ctx, centerX, centerY, size) {
  ctx.save();

  // Moon glow base
  const glowGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, size * 1.5
  );
  glowGradient.addColorStop(0, 'rgba(200, 200, 210, 0.3)');
  glowGradient.addColorStop(0.7, 'rgba(150, 150, 170, 0.1)');
  glowGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 1.5, 0, Math.PI * 2);
  ctx.fill();

  // Main moon sphere with realistic lighting
  const moonGradient = ctx.createRadialGradient(
    centerX - size * 0.3, centerY - size * 0.2, 0,
    centerX, centerY, size
  );
  moonGradient.addColorStop(0, '#e8e8e8');
  moonGradient.addColorStop(0.3, '#d0d0d0');
  moonGradient.addColorStop(0.6, '#b0b0b0');
  moonGradient.addColorStop(1, '#8a8a8a');
  
  ctx.fillStyle = moonGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
  ctx.fill();

  // Add moon craters
  addMoonCraters(ctx, centerX, centerY, size);

  // Add moon surface details
  addMoonSurfaceDetails(ctx, centerX, centerY, size);

  // Add terminator line (shadow edge)
  drawTerminator(ctx, centerX, centerY, size);

  ctx.restore();
}

/**
 * Add realistic moon craters
 */
function addMoonCraters(ctx, centerX, centerY, moonSize) {
  const craters = [
    { x: -0.2, y: -0.1, size: 0.15, depth: 0.3 },
    { x: 0.3, y: 0.2, size: 0.12, depth: 0.4 },
    { x: -0.4, y: 0.3, size: 0.18, depth: 0.5 },
    { x: 0.1, y: -0.4, size: 0.1, depth: 0.2 },
    { x: 0.5, y: -0.1, size: 0.08, depth: 0.3 },
    { x: -0.3, y: 0.5, size: 0.14, depth: 0.4 },
    { x: 0.2, y: 0.4, size: 0.09, depth: 0.25 },
    { x: -0.5, y: -0.2, size: 0.11, depth: 0.35 }
  ];

  craters.forEach(crater => {
    const x = centerX + crater.x * moonSize;
    const y = centerY + crater.y * moonSize;
    const size = crater.size * moonSize;
    
    // Crater shadow
    const craterGradient = ctx.createRadialGradient(
      x - size * 0.2, y - size * 0.2, 0,
      x, y, size
    );
    craterGradient.addColorStop(0, `rgba(120, 120, 120, ${0.3 + crater.depth * 0.3})`);
    craterGradient.addColorStop(1, `rgba(80, 80, 80, ${0.1 + crater.depth * 0.2})`);
    
    ctx.fillStyle = craterGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Crater rim highlight
    ctx.strokeStyle = `rgba(200, 200, 200, ${0.2 + crater.depth * 0.2})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.stroke();
  });
}

/**
 * Add moon surface details and mountains
 */
function addMoonSurfaceDetails(ctx, centerX, centerY, moonSize) {
  ctx.save();
  
  // Surface texture with noise
  for (let i = 0; i < 50; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * moonSize * 0.8;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = 1 + Math.random() * 3;
    const brightness = 140 + Math.random() * 60;
    const alpha = 0.3 + Math.random() * 0.4;
    
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Mountain ranges
  const mountains = [
    { startAngle: 0.2, endAngle: 0.8, height: 0.1 },
    { startAngle: 1.2, endAngle: 1.8, height: 0.08 },
    { startAngle: 2.5, endAngle: 3.2, height: 0.12 }
  ];

  mountains.forEach(mountain => {
    ctx.strokeStyle = `rgba(180, 180, 180, 0.6)`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let angle = mountain.startAngle; angle <= mountain.endAngle; angle += 0.1) {
      const variation = Math.sin(angle * 10) * mountain.height * moonSize;
      const x = centerX + Math.cos(angle) * (moonSize + variation);
      const y = centerY + Math.sin(angle) * (moonSize + variation);
      
      if (angle === mountain.startAngle) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Draw terminator line (shadow edge)
 */
function drawTerminator(ctx, centerX, centerY, moonSize) {
  ctx.save();
  
  const terminatorGradient = ctx.createLinearGradient(
    centerX - moonSize, centerY,
    centerX + moonSize * 0.3, centerY
  );
  terminatorGradient.addColorStop(0, 'rgba(60, 60, 80, 0.8)');
  terminatorGradient.addColorStop(0.5, 'rgba(100, 100, 120, 0.3)');
  terminatorGradient.addColorStop(1, 'transparent');
  
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = terminatorGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, moonSize, Math.PI * 0.5, Math.PI * 1.5);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Add moon glow and atmospheric effects
 */
function addMoonGlow(ctx, centerX, centerY, moonSize) {
  ctx.save();
  
  // Outer glow
  const outerGlow = ctx.createRadialGradient(
    centerX, centerY, moonSize * 0.8,
    centerX, centerY, moonSize * 2.5
  );
  outerGlow.addColorStop(0, 'rgba(180, 180, 220, 0.2)');
  outerGlow.addColorStop(0.5, 'rgba(140, 140, 200, 0.1)');
  outerGlow.addColorStop(1, 'transparent');
  
  ctx.fillStyle = outerGlow;
  ctx.globalCompositeOperation = 'screen';
  ctx.beginPath();
  ctx.arc(centerX, centerY, moonSize * 2.5, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}

/**
 * Add lens flare effects
 */
function addLensFlare(ctx, moonX, moonY, moonSize) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;

  // Main flare
  const flareGradient = ctx.createRadialGradient(
    moonX - moonSize * 0.5, moonY - moonSize * 0.5, 0,
    moonX, moonY, moonSize * 3
  );
  flareGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  flareGradient.addColorStop(0.3, 'rgba(200, 200, 255, 0.4)');
  flareGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = flareGradient;
  ctx.beginPath();
  ctx.arc(moonX, moonY, moonSize * 3, 0, Math.PI * 2);
  ctx.fill();

  // Secondary flares
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const distance = moonSize * 1.5;
    const x = moonX + Math.cos(angle) * distance;
    const y = moonY + Math.sin(angle) * distance;
    const size = moonSize * (0.3 + Math.random() * 0.3);
    
    const smallFlare = ctx.createRadialGradient(x, y, 0, x, y, size);
    smallFlare.addColorStop(0, 'rgba(255, 255, 255, 0.6)');
    smallFlare.addColorStop(1, 'transparent');
    
    ctx.fillStyle = smallFlare;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw cosmic text with moon-inspired colors
 */
function drawCosmicText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text glow effect
  ctx.shadowColor = 'rgba(180, 180, 220, 0.8)';
  ctx.shadowBlur = 30;
  
  // Main text with silver-moon gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#ffffff');
  textGradient.addColorStop(0.3, '#e8e8ff');
  textGradient.addColorStop(0.7, '#c8c8e0');
  textGradient.addColorStop(1, '#a8a8c0');
  
  ctx.font = 'bold 72px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner glow
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add subtle text shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 30, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.fillText(text.toUpperCase(), centerX - 2, centerY - 2);

  ctx.restore();
}

/**
 * Add detailed stars to background
 */
function addDetailedStars(ctx, width, height) {
  ctx.save();

  // Different star sizes and brightness
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2.5;
    const brightness = 150 + Math.random() * 105;
    const alpha = 0.5 + Math.random() * 0.5;
    
    // Star glow
    ctx.fillStyle = `rgba(${brightness}, ${brightness}, 255, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Actual star
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Twinkling effect for some stars
    if (Math.random() > 0.7) {
      ctx.fillStyle = `rgba(255, 255, 200, ${alpha * 0.7})`;
      ctx.beginPath();
      ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Add some brighter stars/planets
  const brightStars = [
    { x: width * 0.1, y: height * 0.2, size: 3, color: [255, 220, 180] },
    { x: width * 0.9, y: height * 0.1, size: 4, color: [180, 220, 255] },
    { x: width * 0.2, y: height * 0.9, size: 2.5, color: [220, 255, 180] }
  ];

  brightStars.forEach(star => {
    const [r, g, b] = star.color;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Glow
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`;
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.size * 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add shooting stars
 */
function addShootingStars(ctx, width, height) {
  ctx.save();
  
  const shootingStars = [
    { x: width * 0.8, y: height * 0.1, length: 80, angle: -0.3 },
    { x: width * 0.6, y: height * 0.05, length: 60, angle: -0.5 }
  ];

  shootingStars.forEach(star => {
    const gradient = ctx.createLinearGradient(
      star.x, star.y,
      star.x + Math.cos(star.angle) * star.length,
      star.y + Math.sin(star.angle) * star.length
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.5, 'rgba(200, 220, 255, 0.6)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x + Math.cos(star.angle) * star.length,
      star.y + Math.sin(star.angle) * star.length
    );
    ctx.stroke();

    // Add glow
    ctx.strokeStyle = 'rgba(180, 200, 255, 0.3)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(star.x, star.y);
    ctx.lineTo(
      star.x + Math.cos(star.angle) * star.length,
      star.y + Math.sin(star.angle) * star.length
    );
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add cosmic dust clouds
 */
function addCosmicDust(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.globalCompositeOperation = 'screen';

  const dustClouds = [
    { x: width * 0.4, y: height * 0.7, size: 100, color: [100, 100, 200] },
    { x: width * 0.6, y: height * 0.8, size: 80, color: [200, 100, 200] },
    { x: width * 0.3, y: height * 0.3, size: 120, color: [100, 200, 200] }
  ];

  dustClouds.forEach(cloud => {
    const [r, g, b] = cloud.color;
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add nebula background effects
 */
function addNebulaBackground(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.15;
  ctx.globalCompositeOperation = 'screen';

  const nebulae = [
    { x: width * 0.2, y: height * 0.4, size: 150, color: [80, 60, 150] },  // Purple
    { x: width * 0.8, y: height * 0.6, size: 120, color: [60, 80, 150] },  // Blue
    { x: width * 0.5, y: height * 0.2, size: 100, color: [150, 60, 100] }  // Pink
  ];

  nebulae.forEach(nebula => {
    const [r, g, b] = nebula.color;
    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.2)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add galaxy cloud effects
 */
function addGalaxyClouds(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.05;

  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 50 + Math.random() * 100;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(100, 100, 150, 0.1)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw cosmic border
 */
function drawCosmicBorder(ctx, width, height) {
  ctx.save();

  // Outer glow border
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, 'rgba(120, 120, 200, 0.6)');
  borderGradient.addColorStop(0.5, 'rgba(180, 180, 220, 0.8)');
  borderGradient.addColorStop(1, 'rgba(120, 120, 200, 0.6)');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(150, 150, 255, 0.5)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner silver border
  ctx.strokeStyle = 'rgba(200, 200, 255, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.restore();
}

/**
 * Add moon-themed signature
 */
function addMoonSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 100;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(200, 200, 255, 0.8)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(150, 150, 255, 0.5)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Moon phase indicator line
  ctx.strokeStyle = 'rgba(180, 180, 220, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(signatureX - ctx.measureText('by Silent Wolf').width, signatureY + 2);
  ctx.lineTo(signatureX, signatureY + 2);
  ctx.stroke();
  
  ctx.restore();
}