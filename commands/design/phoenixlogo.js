import { createCanvas } from 'canvas';

export default {
  name: "phoenixlogo",
  description: "Create magnificent phoenix text logos with fire, rebirth and mystical effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🔥 *Phoenix Logo*\n\nUsage: phoenixlogo <text>\n\n*Example:*\nphoenixlogo PHOENIX\nphoenixlogo REBIRTH\nphoenixlogo FIREBIRD` 
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
        text: `🔥 Generating phoenix logo for: "${text}"...` 
      }, { quoted: m });

      // Generate phoenix logo
      const logoBuffer = await generatePhoenixLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔥 *Phoenix Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [PHOENIXLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating phoenix logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate magnificent phoenix logo with rebirth effects
 */
async function generatePhoenixLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create mystical sky background
  createPhoenixSky(ctx, width, height);

  // Draw majestic phoenix
  const phoenixX = width * 0.75;
  const phoenixY = height * 0.5;
  drawMajesticPhoenix(ctx, phoenixX, phoenixY);

  // Add phoenix fire aura
  addPhoenixFireAura(ctx, phoenixX, phoenixY);

  // Add flaming wings and tail
  addFlamingWings(ctx, phoenixX, phoenixY);
  addFireTail(ctx, phoenixX, phoenixY);

  // Create rebirth text with fire effects
  drawRebirthText(ctx, text, width, height);

  // Add ashes and rebirth particles
  addAshesParticles(ctx, width, height);
  addRebirthParticles(ctx, width, height);

  // Add fire and ember effects
  addFloatingEmbers(ctx, width, height);
  addFireTrails(ctx, width, height);

  // Add mystical energy effects
  addMysticalEnergy(ctx, width, height);
  addNebulaBackground(ctx, width, height);

  // Add border and signature
  drawPhoenixBorder(ctx, width, height);
  addPhoenixSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create mystical sky background for phoenix
 */
function createPhoenixSky(ctx, width, height) {
  // Phoenix sky gradient (sunset colors)
  const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
  skyGradient.addColorStop(0, '#8B0000'); // Dark red
  skyGradient.addColorStop(0.2, '#FF4500'); // Orange red
  skyGradient.addColorStop(0.4, '#FF8C00'); // Dark orange
  skyGradient.addColorStop(0.6, '#FFD700'); // Gold
  skyGradient.addColorStop(0.8, '#FF6347'); // Tomato
  skyGradient.addColorStop(1, '#DC143C'); // Crimson
  
  ctx.fillStyle = skyGradient;
  ctx.fillRect(0, 0, width, height);

  // Add fire clouds
  addFireClouds(ctx, width, height);
}

/**
 * Add fire-like cloud formations
 */
function addFireClouds(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.globalCompositeOperation = 'screen';

  const fireClouds = [
    { x: width * 0.2, y: height * 0.3, size: 100, color: [255, 100, 0] },
    { x: width * 0.7, y: height * 0.2, size: 80, color: [255, 150, 0] },
    { x: width * 0.3, y: height * 0.7, size: 120, color: [255, 200, 0] },
    { x: width * 0.8, y: height * 0.6, size: 90, color: [255, 100, 50] }
  ];

  fireClouds.forEach(cloud => {
    const [r, g, b] = cloud.color;
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw majestic phoenix bird
 */
function drawMajesticPhoenix(ctx, centerX, centerY) {
  ctx.save();

  // Phoenix body glow
  const bodyGlow = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 60
  );
  bodyGlow.addColorStop(0, 'rgba(255, 255, 200, 0.9)');
  bodyGlow.addColorStop(0.5, 'rgba(255, 200, 100, 0.6)');
  bodyGlow.addColorStop(1, 'rgba(255, 150, 50, 0.3)');
  
  ctx.fillStyle = bodyGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
  ctx.fill();

  // Phoenix body
  const bodyGradient = ctx.createRadialGradient(
    centerX - 10, centerY - 10, 0,
    centerX, centerY, 25
  );
  bodyGradient.addColorStop(0, '#FFFF00'); // Bright yellow
  bodyGradient.addColorStop(0.3, '#FFD700'); // Gold
  bodyGradient.addColorStop(0.7, '#FF8C00'); // Dark orange
  bodyGradient.addColorStop(1, '#FF4500'); // Orange red
  
  ctx.fillStyle = bodyGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
  ctx.fill();

  // Phoenix head and neck
  drawPhoenixHead(ctx, centerX, centerY);

  // Phoenix legs
  drawPhoenixLegs(ctx, centerX, centerY);

  ctx.restore();
}

/**
 * Draw phoenix head with crown-like features
 */
function drawPhoenixHead(ctx, centerX, centerY) {
  // Phoenix neck
  const neckGradient = ctx.createLinearGradient(
    centerX, centerY - 15,
    centerX + 35, centerY - 40
  );
  neckGradient.addColorStop(0, '#FFD700');
  neckGradient.addColorStop(1, '#FF8C00');
  
  ctx.strokeStyle = neckGradient;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(centerX, centerY - 15);
  ctx.lineTo(centerX + 35, centerY - 40);
  ctx.stroke();

  // Phoenix head
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.arc(centerX + 40, centerY - 45, 12, 0, Math.PI * 2);
  ctx.fill();

  // Phoenix crown feathers
  const crownColors = ['#FFFF00', '#FFD700', '#FF8C00'];
  crownColors.forEach((color, index) => {
    const angle = -0.5 + (index * 0.5);
    const length = 15 + index * 5;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 4 - index;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(centerX + 40, centerY - 45);
    ctx.lineTo(
      centerX + 40 + Math.cos(angle) * length,
      centerY - 45 + Math.sin(angle) * length
    );
    ctx.stroke();
  });

  // Phoenix eye
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(centerX + 45, centerY - 47, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.arc(centerX + 46, centerY - 48, 1, 0, Math.PI * 2);
  ctx.fill();

  // Phoenix beak
  ctx.strokeStyle = '#FF6347';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(centerX + 48, centerY - 43);
  ctx.lineTo(centerX + 55, centerY - 45);
  ctx.stroke();
}

/**
 * Draw phoenix legs
 */
function drawPhoenixLegs(ctx, centerX, centerY) {
  ctx.strokeStyle = '#FF8C00';
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';

  // Front leg
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY + 20);
  ctx.lineTo(centerX + 10, centerY + 35);
  ctx.stroke();

  // Back leg
  ctx.beginPath();
  ctx.moveTo(centerX - 5, centerY + 25);
  ctx.lineTo(centerX - 8, centerY + 40);
  ctx.stroke();

  // Talons
  ctx.strokeStyle = '#FF6347';
  ctx.lineWidth = 2;
  
  const legPositions = [
    { x: centerX + 10, y: centerY + 35 },
    { x: centerX - 8, y: centerY + 40 }
  ];

  legPositions.forEach(leg => {
    for (let i = 0; i < 3; i++) {
      const angle = -0.3 + (i * 0.3);
      const talonLength = 8;
      
      ctx.beginPath();
      ctx.moveTo(leg.x, leg.y);
      ctx.lineTo(
        leg.x + Math.cos(angle) * talonLength,
        leg.y + Math.sin(angle) * talonLength
      );
      ctx.stroke();
    }
  });
}

/**
 * Add phoenix fire aura
 */
function addPhoenixFireAura(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Multiple aura layers
  const auraLayers = [
    { size: 120, alpha: 0.4, color: [255, 255, 200] },
    { size: 90, alpha: 0.6, color: [255, 200, 100] },
    { size: 60, alpha: 0.8, color: [255, 150, 50] }
  ];

  auraLayers.forEach(layer => {
    const [r, g, b] = layer.color;
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0,
      centerX, centerY, layer.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${layer.alpha})`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, layer.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Phoenix energy pulses
  for (let i = 0; i < 3; i++) {
    const pulseSize = 150 + i * 30;
    const pulseAlpha = 0.2 - i * 0.05;
    
    ctx.strokeStyle = `rgba(255, 200, 100, ${pulseAlpha})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add flaming wings to phoenix
 */
function addFlamingWings(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.8;

  // Left wing
  const leftWingGradient = ctx.createLinearGradient(
    centerX - 20, centerY - 10,
    centerX - 80, centerY - 50
  );
  leftWingGradient.addColorStop(0, '#FFFF00');
  leftWingGradient.addColorStop(0.3, '#FFD700');
  leftWingGradient.addColorStop(0.7, '#FF8C00');
  leftWingGradient.addColorStop(1, '#FF4500');

  ctx.fillStyle = leftWingGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY - 10);
  ctx.bezierCurveTo(
    centerX - 40, centerY - 60,
    centerX - 70, centerY - 30,
    centerX - 80, centerY - 10
  );
  ctx.bezierCurveTo(
    centerX - 70, centerY + 10,
    centerX - 40, centerY - 5,
    centerX - 20, centerY - 10
  );
  ctx.closePath();
  ctx.fill();

  // Right wing
  const rightWingGradient = ctx.createLinearGradient(
    centerX + 20, centerY - 10,
    centerX + 80, centerY - 50
  );
  rightWingGradient.addColorStop(0, '#FFFF00');
  rightWingGradient.addColorStop(0.3, '#FFD700');
  rightWingGradient.addColorStop(0.7, '#FF8C00');
  rightWingGradient.addColorStop(1, '#FF4500');

  ctx.fillStyle = rightWingGradient;
  ctx.beginPath();
  ctx.moveTo(centerX + 20, centerY - 10);
  ctx.bezierCurveTo(
    centerX + 40, centerY - 60,
    centerX + 70, centerY - 30,
    centerX + 80, centerY - 10
  );
  ctx.bezierCurveTo(
    centerX + 70, centerY + 10,
    centerX + 40, centerY - 5,
    centerX + 20, centerY - 10
  );
  ctx.closePath();
  ctx.fill();

  // Wing flame details
  addWingFlames(ctx, centerX, centerY);

  ctx.restore();
}

/**
 * Add flame details to wings
 */
function addWingFlames(ctx, centerX, centerY) {
  ctx.strokeStyle = 'rgba(255, 255, 200, 0.8)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  // Left wing flames
  const leftFlamePoints = [
    { start: { x: centerX - 30, y: centerY - 25 }, end: { x: centerX - 50, y: centerY - 45 } },
    { start: { x: centerX - 40, y: centerY - 15 }, end: { x: centerX - 65, y: centerY - 25 } },
    { start: { x: centerX - 50, y: centerY - 5 }, end: { x: centerX - 75, y: centerY - 10 } }
  ];

  leftFlamePoints.forEach(flame => {
    ctx.beginPath();
    ctx.moveTo(flame.start.x, flame.start.y);
    ctx.lineTo(flame.end.x, flame.end.y);
    ctx.stroke();
  });

  // Right wing flames
  const rightFlamePoints = [
    { start: { x: centerX + 30, y: centerY - 25 }, end: { x: centerX + 50, y: centerY - 45 } },
    { start: { x: centerX + 40, y: centerY - 15 }, end: { x: centerX + 65, y: centerY - 25 } },
    { start: { x: centerX + 50, y: centerY - 5 }, end: { x: centerX + 75, y: centerY - 10 } }
  ];

  rightFlamePoints.forEach(flame => {
    ctx.beginPath();
    ctx.moveTo(flame.start.x, flame.start.y);
    ctx.lineTo(flame.end.x, flame.end.y);
    ctx.stroke();
  });
}

/**
 * Add fire tail to phoenix
 */
function addFireTail(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.9;

  const tailGradient = ctx.createLinearGradient(
    centerX - 20, centerY + 15,
    centerX - 120, centerY + 5
  );
  tailGradient.addColorStop(0, '#FFFF00');
  tailGradient.addColorStop(0.2, '#FFD700');
  tailGradient.addColorStop(0.5, '#FF8C00');
  tailGradient.addColorStop(0.8, '#FF4500');
  tailGradient.addColorStop(1, '#DC143C');

  // Main tail stream
  ctx.strokeStyle = tailGradient;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY + 15);
  ctx.bezierCurveTo(
    centerX - 50, centerY + 30,
    centerX - 80, centerY + 10,
    centerX - 120, centerY + 5
  );
  ctx.stroke();

  // Additional tail streams
  for (let i = 0; i < 4; i++) {
    const variation = (Math.random() - 0.5) * 20;
    const width = 6 + Math.random() * 4;
    
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.moveTo(centerX - 20, centerY + 15);
    ctx.bezierCurveTo(
      centerX - 45, centerY + 25 + variation,
      centerX - 75, centerY + 8 + variation,
      centerX - 110, centerY + 3 + variation
    );
    ctx.stroke();
  }

  // Tail glow
  ctx.strokeStyle = 'rgba(255, 200, 100, 0.4)';
  ctx.lineWidth = 25;
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY + 15);
  ctx.bezierCurveTo(
    centerX - 50, centerY + 30,
    centerX - 80, centerY + 10,
    centerX - 120, centerY + 5
  );
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw rebirth text with fire effects
 */
function drawRebirthText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text fire glow
  ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
  ctx.shadowBlur = 40;
  
  // Phoenix fire text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#FFFF00'); // Yellow
  textGradient.addColorStop(0.2, '#FFD700'); // Gold
  textGradient.addColorStop(0.5, '#FF8C00'); // Orange
  textGradient.addColorStop(0.8, '#FF4500'); // Red orange
  textGradient.addColorStop(1, '#DC143C'); // Crimson
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner text fire
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 200, 0.7)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text outline
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add flame effects to text
  addTextFlames(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add flame effects to text characters
 */
function addTextFlames(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70;

  // Add small flames rising from text
  for (let i = 0; i < 20; i++) {
    const flameX = centerX - textWidth / 2 + Math.random() * textWidth;
    const flameY = centerY + textHeight / 2 - Math.random() * 10;
    const flameHeight = 10 + Math.random() * 20;
    const flameWidth = 2 + Math.random() * 4;
    
    const flameGradient = ctx.createLinearGradient(
      flameX, flameY,
      flameX, flameY - flameHeight
    );
    flameGradient.addColorStop(0, 'rgba(255, 255, 200, 0.8)');
    flameGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.6)');
    flameGradient.addColorStop(1, 'rgba(255, 150, 50, 0.3)');
    
    ctx.strokeStyle = flameGradient;
    ctx.lineWidth = flameWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(flameX, flameY);
    ctx.lineTo(flameX, flameY - flameHeight);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add ashes particles (symbolizing death/rebirth cycle)
 */
function addAshesParticles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const gray = 80 + Math.random() * 40;
    
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Ash particle trail
    const trailLength = 3 + Math.random() * 8;
    const trailAngle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, 0.4)`;
    ctx.lineWidth = size * 0.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(trailAngle) * trailLength,
      y + Math.sin(trailAngle) * trailLength
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add rebirth particles (sparks of new life)
 */
function addRebirthParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 4;
    const hue = 30 + Math.random() * 30; // Orange-yellow range
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Rebirth particle glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add floating embers
 */
function addFloatingEmbers(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    const brightness = 0.6 + Math.random() * 0.4;
    
    // Ember core
    ctx.fillStyle = `rgba(255, 255, 200, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Ember glow
    ctx.fillStyle = `rgba(255, 200, 100, ${brightness * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add fire trails in background
 */
function addFireTrails(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;

  for (let i = 0; i < 5; i++) {
    const startX = Math.random() * width;
    const startY = height + 20;
    const endX = startX + (Math.random() - 0.5) * 100;
    const endY = Math.random() * height * 0.3;
    
    const trailGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    trailGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    trailGradient.addColorStop(0.5, 'rgba(255, 200, 100, 0.4)');
    trailGradient.addColorStop(1, 'rgba(255, 150, 50, 0.2)');
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add mystical energy effects
 */
function addMysticalEnergy(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.2;

  // Energy orbs
  const energyOrbs = [
    { x: width * 0.2, y: height * 0.3, size: 40 },
    { x: width * 0.8, y: height * 0.7, size: 35 },
    { x: width * 0.4, y: height * 0.2, size: 45 }
  ];

  energyOrbs.forEach(orb => {
    const gradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, orb.size
    );
    gradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
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
    { x: width * 0.3, y: height * 0.4, size: 120, color: [255, 100, 0] },
    { x: width * 0.7, y: height * 0.3, size: 100, color: [255, 150, 50] },
    { x: width * 0.5, y: height * 0.6, size: 110, color: [255, 200, 100] }
  ];

  nebulae.forEach(nebula => {
    const [r, g, b] = nebula.color;
    const gradient = ctx.createRadialGradient(
      nebula.x, nebula.y, 0,
      nebula.x, nebula.y, nebula.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.4)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw phoenix-themed border
 */
function drawPhoenixBorder(ctx, width, height) {
  ctx.save();

  // Phoenix fire border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#DC143C'); // Crimson
  borderGradient.addColorStop(0.2, '#FF4500'); // Orange red
  borderGradient.addColorStop(0.5, '#FFD700'); // Gold
  borderGradient.addColorStop(0.8, '#FF4500'); // Orange red
  borderGradient.addColorStop(1, '#DC143C'); // Crimson

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(255, 100, 0, 0.8)';
  ctx.shadowBlur = 25;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner fire border
  ctx.strokeStyle = 'rgba(255, 255, 200, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add phoenix feather accents at corners
  addPhoenixFeatherAccents(ctx, width, height);

  ctx.restore();
}

/**
 * Add phoenix feather accents at corners
 */
function addPhoenixFeatherAccents(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 25, y: 25, angle: -0.8 },
    { x: width - 25, y: 25, angle: -2.4 },
    { x: 25, y: height - 25, angle: 0.8 },
    { x: width - 25, y: height - 25, angle: 2.4 }
  ];

  corners.forEach(corner => {
    // Phoenix feather
    const featherGradient = ctx.createLinearGradient(
      corner.x, corner.y,
      corner.x + Math.cos(corner.angle) * 20,
      corner.y + Math.sin(corner.angle) * 20
    );
    featherGradient.addColorStop(0, '#FFD700');
    featherGradient.addColorStop(1, '#FF4500');
    
    ctx.strokeStyle = featherGradient;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.lineTo(
      corner.x + Math.cos(corner.angle) * 20,
      corner.y + Math.sin(corner.angle) * 20
    );
    ctx.stroke();

    // Feather barbs
    for (let i = 0; i < 3; i++) {
      const barbPos = 5 + i * 5;
      const barbAngle = corner.angle + 0.3;
      const barbLength = 8 - i * 2;
      
      ctx.beginPath();
      ctx.moveTo(
        corner.x + Math.cos(corner.angle) * barbPos,
        corner.y + Math.sin(corner.angle) * barbPos
      );
      ctx.lineTo(
        corner.x + Math.cos(corner.angle) * barbPos + Math.cos(barbAngle) * barbLength,
        corner.y + Math.sin(corner.angle) * barbPos + Math.sin(barbAngle) * barbLength
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add phoenix-themed signature
 */
function addPhoenixSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(255, 100, 0, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small phoenix feather next to signature
  const featherGradient = ctx.createLinearGradient(
    signatureX + 5, signatureY - 8,
    signatureX + 15, signatureY - 8
  );
  featherGradient.addColorStop(0, '#FFD700');
  featherGradient.addColorStop(1, '#FF4500');
  
  ctx.strokeStyle = featherGradient;
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(signatureX + 5, signatureY - 8);
  ctx.lineTo(signatureX + 15, signatureY - 8);
  ctx.stroke();
  
  // Feather barb
  ctx.beginPath();
  ctx.moveTo(signatureX + 8, signatureY - 8);
  ctx.lineTo(signatureX + 6, signatureY - 12);
  ctx.stroke();
  
  ctx.restore();
}