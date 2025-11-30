import { createCanvas } from 'canvas';

export default {
  name: "sunlogo",
  description: "Create radiant sun text logos with brilliant light and solar flare effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `☀️ *Sun Logo*\n\nUsage: sunlogo <text>\n\n*Example:*\nsunlogo SUN\nsunlogo LIGHT\nsunlogo SOLAR` 
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
        text: `☀️ Generating sun logo for: "${text}"...` 
      }, { quoted: m });

      // Generate sun logo
      const logoBuffer = await generateSunLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `☀️ *Sun Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [SUNLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating sun logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate brilliant sun logo with solar effects
 */
async function generateSunLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create sky background
  createSkyBackground(ctx, width, height);

  // Generate realistic sun with corona
  const sunX = width * 0.75;
  const sunY = height * 0.35;
  const sunSize = 80;
  drawRealisticSun(ctx, sunX, sunY, sunSize);

  // Add solar flares and prominences
  addSolarFlares(ctx, sunX, sunY, sunSize);
  addSunProminences(ctx, sunX, sunY, sunSize);

  // Add sun rays and light beams
  addSunRays(ctx, sunX, sunY, sunSize);
  addLightBeams(ctx, width, height);

  // Create radiant text
  drawRadiantText(ctx, text, width, height);

  // Add atmospheric effects
  addLensFlare(ctx, sunX, sunY, sunSize);
  addHeatHaze(ctx, width, height);

  // Add sun particles and sparkles
  addSolarParticles(ctx, width, height);
  addSunSparkles(ctx, width, height);

  // Add border and signature
  drawSolarBorder(ctx, width, height);
  addSunSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create sky background with gradient
 */
function createSkyBackground(ctx, width, height) {
  // Sky gradient from light blue to orange
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#87CEEB'); // Light sky blue
  skyGradient.addColorStop(0.3, '#4682B4'); // Steel blue
  skyGradient.addColorStop(0.7, '#FF8C00'); // Dark orange
  skyGradient.addColorStop(1, '#FF4500'); // Orange red
  
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Add some soft clouds
  addSkyClouds(ctx, width, height);
}

/**
 * Add soft clouds to sky background
 */
function addSkyClouds(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  const clouds = [
    { x: width * 0.2, y: height * 0.2, size: 60 },
    { x: width * 0.6, y: height * 0.15, size: 80 },
    { x: width * 0.4, y: height * 0.25, size: 50 },
    { x: width * 0.8, y: height * 0.3, size: 70 }
  ];

  clouds.forEach(cloud => {
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw realistic sun with multiple layers
 */
function drawRealisticSun(ctx, centerX, centerY, size) {
  ctx.save();

  // Outer corona glow
  const coronaGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, size * 3
  );
  coronaGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
  coronaGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.6)');
  coronaGradient.addColorStop(0.7, 'rgba(255, 150, 50, 0.3)');
  coronaGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = coronaGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 3, 0, Math.PI * 2);
  ctx.fill();

  // Middle corona
  const middleCorona = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, size * 2
  );
  middleCorona.addColorStop(0, 'rgba(255, 255, 150, 0.9)');
  middleCorona.addColorStop(0.5, 'rgba(255, 200, 100, 0.7)');
  middleCorona.addColorStop(1, 'rgba(255, 150, 50, 0.4)');
  
  ctx.fillStyle = middleCorona;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 2, 0, Math.PI * 2);
  ctx.fill();

  // Main sun body
  const sunGradient = ctx.createRadialGradient(
    centerX - size * 0.2, centerY - size * 0.2, 0,
    centerX, centerY, size
  );
  sunGradient.addColorStop(0, '#FFFF00'); // Bright yellow
  sunGradient.addColorStop(0.3, '#FFD700'); // Gold
  sunGradient.addColorStop(0.7, '#FF8C00'); // Dark orange
  sunGradient.addColorStop(1, '#FF4500'); // Orange red
  
  ctx.fillStyle = sunGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, size, 0, Math.PI * 2);
  ctx.fill();

  // Sun surface details (sunspots and granules)
  addSunSurfaceDetails(ctx, centerX, centerY, size);

  // Inner core glow
  ctx.fillStyle = 'rgba(255, 255, 200, 0.6)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.7, 0, Math.PI * 2);
  ctx.fill();

  // Brightest core
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, size * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add sun surface details (sunspots and granules)
 */
function addSunSurfaceDetails(ctx, centerX, centerY, sunSize) {
  ctx.save();
  ctx.globalAlpha = 0.4;

  // Sunspots (dark areas)
  const sunspots = [
    { x: -0.3, y: -0.2, size: 0.1 },
    { x: 0.4, y: 0.1, size: 0.08 },
    { x: -0.2, y: 0.4, size: 0.12 },
    { x: 0.3, y: -0.3, size: 0.09 }
  ];

  sunspots.forEach(spot => {
    const x = centerX + spot.x * sunSize;
    const y = centerY + spot.y * sunSize;
    const size = spot.size * sunSize;
    
    ctx.fillStyle = 'rgba(200, 100, 50, 0.6)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Sunspot umbra (darker center)
    ctx.fillStyle = 'rgba(150, 70, 30, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  // Solar granules (bright spots)
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * sunSize * 0.8;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    const size = 2 + Math.random() * 5;
    
    ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add solar flares (intense magnetic eruptions)
 */
function addSolarFlares(ctx, centerX, centerY, sunSize) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.6;

  const flares = [
    { angle: 0.8, length: sunSize * 4, intensity: 0.8 },
    { angle: 2.2, length: sunSize * 3, intensity: 0.7 },
    { angle: 3.8, length: sunSize * 5, intensity: 0.9 },
    { angle: 5.1, length: sunSize * 3.5, intensity: 0.6 }
  ];

  flares.forEach(flare => {
    const flareGradient = ctx.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(flare.angle) * flare.length,
      centerY + Math.sin(flare.angle) * flare.length
    );
    flareGradient.addColorStop(0, `rgba(255, 255, 200, ${flare.intensity})`);
    flareGradient.addColorStop(0.5, `rgba(255, 200, 100, ${flare.intensity * 0.7})`);
    flareGradient.addColorStop(1, `rgba(255, 150, 50, ${flare.intensity * 0.3})`);
    
    ctx.strokeStyle = flareGradient;
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(flare.angle) * flare.length,
      centerY + Math.sin(flare.angle) * flare.length
    );
    ctx.stroke();

    // Flare glow
    ctx.strokeStyle = `rgba(255, 200, 100, ${flare.intensity * 0.4})`;
    ctx.lineWidth = 30;
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(flare.angle) * flare.length,
      centerY + Math.sin(flare.angle) * flare.length
    );
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add sun prominences (looping magnetic fields)
 */
function addSunProminences(ctx, centerX, centerY, sunSize) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.5;

  // Create looping prominence shapes
  for (let i = 0; i < 6; i++) {
    const startAngle = (i / 6) * Math.PI * 2;
    const controlAngle = startAngle + Math.PI * 0.3;
    const endAngle = startAngle + Math.PI * 0.6;
    
    const startX = centerX + Math.cos(startAngle) * sunSize;
    const startY = centerY + Math.sin(startAngle) * sunSize;
    
    const controlX = centerX + Math.cos(controlAngle) * sunSize * 2;
    const controlY = centerY + Math.sin(controlAngle) * sunSize * 2;
    
    const endX = centerX + Math.cos(endAngle) * sunSize * 1.5;
    const endY = centerY + Math.sin(endAngle) * sunSize * 1.5;
    
    const gradient = ctx.createLinearGradient(
      startX, startY,
      endX, endY
    );
    gradient.addColorStop(0, 'rgba(255, 100, 50, 0.8)');
    gradient.addColorStop(1, 'rgba(255, 200, 100, 0.4)');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();

    // Prominence glow
    ctx.strokeStyle = 'rgba(255, 150, 50, 0.3)';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.quadraticCurveTo(controlX, controlY, endX, endY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add sun rays radiating outward
 */
function addSunRays(ctx, centerX, centerY, sunSize) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.4;

  // Multiple layers of rays
  for (let layer = 0; layer < 3; layer++) {
    const rayCount = 24 + layer * 8;
    const rayLength = sunSize * (3 + layer);
    const rayWidth = 4 - layer;
    
    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const variation = Math.sin(angle * 5 + layer) * 0.2;
      const currentAngle = angle + variation;
      
      const gradient = ctx.createLinearGradient(
        centerX, centerY,
        centerX + Math.cos(currentAngle) * rayLength,
        centerY + Math.sin(currentAngle) * rayLength
      );
      gradient.addColorStop(0, `rgba(255, 255, 200, ${0.8 - layer * 0.2})`);
      gradient.addColorStop(0.7, `rgba(255, 200, 100, ${0.5 - layer * 0.15})`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = rayWidth;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + Math.cos(currentAngle) * rayLength,
        centerY + Math.sin(currentAngle) * rayLength
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Add light beams across the scene
 */
function addLightBeams(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.2;

  // Create light beams from sun direction
  for (let i = 0; i < 5; i++) {
    const beamX = width * 0.75 + (Math.random() - 0.5) * 100;
    const beamWidth = 30 + Math.random() * 50;
    
    const beamGradient = ctx.createLinearGradient(beamX, 0, beamX, height);
    beamGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    beamGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.3)');
    beamGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = beamGradient;
    ctx.fillRect(beamX - beamWidth / 2, 0, beamWidth, height);
  }

  ctx.restore();
}

/**
 * Draw radiant text with sun-inspired colors
 */
function drawRadiantText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text glow effect
  ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
  ctx.shadowBlur = 40;
  
  // Main text with sun gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#FFFF00'); // Bright yellow
  textGradient.addColorStop(0.3, '#FFD700'); // Gold
  textGradient.addColorStop(0.7, '#FF8C00'); // Orange
  textGradient.addColorStop(1, '#FF4500'); // Red orange
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Bright inner text
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text outline for definition
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add solar energy to text
  addTextSolarEnergy(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add solar energy effects to text
 */
function addTextSolarEnergy(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70;

  // Add energy sparks around text
  for (let i = 0; i < 25; i++) {
    const sparkX = centerX - textWidth / 2 + Math.random() * textWidth;
    const sparkY = centerY - textHeight / 2 + Math.random() * textHeight;
    const sparkSize = 1 + Math.random() * 4;
    const sparkAngle = Math.random() * Math.PI * 2;
    const sparkLength = 5 + Math.random() * 15;
    
    ctx.strokeStyle = `rgba(255, 255, 200, ${0.5 + Math.random() * 0.4})`;
    ctx.lineWidth = sparkSize;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(sparkX, sparkY);
    ctx.lineTo(
      sparkX + Math.cos(sparkAngle) * sparkLength,
      sparkY + Math.sin(sparkAngle) * sparkLength
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add lens flare effects
 */
function addLensFlare(ctx, sunX, sunY, sunSize) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;

  // Main flare circle
  const flareGradient = ctx.createRadialGradient(
    sunX - sunSize * 0.5, sunY - sunSize * 0.5, 0,
    sunX, sunY, sunSize * 4
  );
  flareGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
  flareGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.5)');
  flareGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = flareGradient;
  ctx.beginPath();
  ctx.arc(sunX, sunY, sunSize * 4, 0, Math.PI * 2);
  ctx.fill();

  // Secondary flares
  for (let i = 0; i < 3; i++) {
    const angle = (i / 3) * Math.PI * 2;
    const distance = sunSize * 2;
    const flareX = sunX + Math.cos(angle) * distance;
    const flareY = sunY + Math.sin(angle) * distance;
    const flareSize = sunSize * (0.5 + Math.random() * 0.5);
    
    const smallFlare = ctx.createRadialGradient(
      flareX, flareY, 0,
      flareX, flareY, flareSize
    );
    smallFlare.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    smallFlare.addColorStop(1, 'transparent');
    
    ctx.fillStyle = smallFlare;
    ctx.beginPath();
    ctx.arc(flareX, flareY, flareSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add heat haze distortion effects
 */
function addHeatHaze(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  // Create wavy heat distortion lines
  for (let y = height * 0.3; y < height * 0.8; y += 10) {
    ctx.strokeStyle = `rgba(255, 200, 100, ${0.2 + Math.random() * 0.3})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x <= width; x += 5) {
      const waveY = y + Math.sin(x * 0.02 + y * 0.01) * 3;
      
      if (x === 0) {
        ctx.moveTo(x, waveY);
      } else {
        ctx.lineTo(x, waveY);
      }
    }
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add solar particles floating in air
 */
function addSolarParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 5;
    const brightness = 0.6 + Math.random() * 0.4;
    
    // Solar particle with warm color
    ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle glow
    ctx.fillStyle = `rgba(255, 200, 100, ${brightness * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add sun sparkles (intense bright spots)
 */
function addSunSparkles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    
    // Bright sparkle core
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Sparkle rays
    for (let ray = 0; ray < 4; ray++) {
      const angle = (ray / 4) * Math.PI * 2;
      const rayLength = size * 4;
      
      ctx.strokeStyle = 'rgba(255, 255, 200, 0.7)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * rayLength,
        y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw solar-themed border
 */
function drawSolarBorder(ctx, width, height) {
  ctx.save();

  // Sun-inspired border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#FFFF00');
  borderGradient.addColorStop(0.3, '#FFD700');
  borderGradient.addColorStop(0.7, '#FF8C00');
  borderGradient.addColorStop(1, '#FF4500');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(255, 200, 50, 0.8)';
  ctx.shadowBlur = 25;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner glow border
  ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add sun symbols in corners
  addCornerSunSymbols(ctx, width, height);

  ctx.restore();
}

/**
 * Add sun symbols in corners
 */
function addCornerSunSymbols(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  corners.forEach(corner => {
    // Small sun symbol
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Sun rays
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const rayLength = 12;
      
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y);
      ctx.lineTo(
        corner.x + Math.cos(angle) * rayLength,
        corner.y + Math.sin(angle) * rayLength
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add sun-themed signature
 */
function addSunSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(255, 200, 50, 0.6)';
  ctx.shadowBlur = 15;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small sun symbol next to signature
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Sun rays
  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const rayLength = 6;
    
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(signatureX + 5, signatureY - 8);
    ctx.lineTo(
      signatureX + 5 + Math.cos(angle) * rayLength,
      signatureY - 8 + Math.sin(angle) * rayLength
    );
    ctx.stroke();
  }
  
  ctx.restore();
}