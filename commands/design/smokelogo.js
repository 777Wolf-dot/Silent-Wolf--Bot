import { createCanvas } from 'canvas';

export default {
  name: "smokelogo",
  description: "Create ethereal smoke text logos with vapor and mist effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💨 *Smoke Logo*\n\nUsage: smokelogo <text>\n\n*Example:*\nsmokelogo SMOKE\nsmokelogo VAPOR\nsmokelogo MIST` 
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
        text: `💨 Generating smoke logo for: "${text}"...` 
      }, { quoted: m });

      // Generate smoke logo
      const logoBuffer = await generateSmokeLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💨 *Smoke Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [SMOKELOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating smoke logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate ethereal smoke logo with vapor effects
 */
async function generateSmokeLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create smoky background
  createSmokyBackground(ctx, width, height);

  // Draw main smoke plume
  const smokeX = width * 0.75;
  const smokeY = height * 0.7;
  drawSmokePlume(ctx, smokeX, smokeY);

  // Add floating smoke wisps
  addSmokeWisps(ctx, width, height);
  addVaporTrails(ctx, width, height);

  // Create smoky text
  drawSmokyText(ctx, text, width, height);

  // Add atmospheric effects
  addMistLayers(ctx, width, height);
  addSmokeParticles(ctx, width, height);

  // Add ember and ash effects
  addFloatingEmbers(ctx, width, height);
  addAshParticles(ctx, width, height);

  // Add border and signature
  drawSmokeBorder(ctx, width, height);
  addSmokeSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create smoky background with gradient
 */
function createSmokyBackground(ctx, width, height) {
  // Smoky gradient background
  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, '#1a1a2a'); // Deep blue-gray
  backgroundGradient.addColorStop(0.3, '#2d2d4a'); // Medium gray
  backgroundGradient.addColorStop(0.6, '#4a4a6a'); // Light gray
  backgroundGradient.addColorStop(1, '#1a1a2a'); // Deep blue-gray
  
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle smoke patterns in background
  addBackgroundSmoke(ctx, width, height);
}

/**
 * Add subtle smoke patterns in background
 */
function addBackgroundSmoke(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 80 + Math.random() * 120;
    
    const smokeGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    smokeGradient.addColorStop(0, 'rgba(150, 150, 180, 0.4)');
    smokeGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = smokeGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw main smoke plume
 */
function drawSmokePlume(ctx, centerX, centerY) {
  ctx.save();

  // Smoke plume base (multiple layers)
  const plumeLayers = [
    { size: 120, alpha: 0.3, yOffset: -80 },
    { size: 100, alpha: 0.4, yOffset: -120 },
    { size: 80, alpha: 0.5, yOffset: -160 },
    { size: 60, alpha: 0.6, yOffset: -200 },
    { size: 40, alpha: 0.7, yOffset: -240 }
  ];

  plumeLayers.forEach((layer, index) => {
    drawSmokeLayer(ctx, centerX, centerY + layer.yOffset, layer.size, layer.alpha, index);
  });

  // Smoke source (ember/incense)
  drawSmokeSource(ctx, centerX, centerY);

  ctx.restore();
}

/**
 * Draw individual smoke layer
 */
function drawSmokeLayer(ctx, x, y, size, alpha, layerIndex) {
  const smokeGradient = ctx.createRadialGradient(
    x, y, 0,
    x, y, size
  );
  smokeGradient.addColorStop(0, `rgba(220, 220, 240, ${alpha})`);
  smokeGradient.addColorStop(0.5, `rgba(180, 180, 200, ${alpha * 0.7})`);
  smokeGradient.addColorStop(1, `rgba(120, 120, 150, ${alpha * 0.3})`);
  
  ctx.fillStyle = smokeGradient;
  ctx.beginPath();
  
  // Create organic smoke shape with bezier curves
  const wobble = size * 0.3;
  ctx.moveTo(x - size * 0.3, y);
  
  ctx.bezierCurveTo(
    x - size * 0.6, y - size * 0.2 + Math.sin(layerIndex) * wobble,
    x - size * 0.4, y - size * 0.6 + Math.cos(layerIndex * 0.7) * wobble,
    x, y - size
  );
  
  ctx.bezierCurveTo(
    x + size * 0.4, y - size * 0.6 + Math.sin(layerIndex * 0.5) * wobble,
    x + size * 0.6, y - size * 0.2 + Math.cos(layerIndex * 0.3) * wobble,
    x + size * 0.3, y
  );
  
  ctx.bezierCurveTo(
    x + size * 0.2, y + size * 0.1,
    x - size * 0.2, y + size * 0.1,
    x - size * 0.3, y
  );
  
  ctx.closePath();
  ctx.fill();

  // Add smoke wisps within the layer
  addSmokeWispsToLayer(ctx, x, y - size * 0.5, size * 0.8, alpha);
}

/**
 * Add smoke wisps to main layer
 */
function addSmokeWispsToLayer(ctx, centerX, centerY, size, alpha) {
  ctx.save();
  ctx.globalAlpha = alpha * 0.8;

  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const distance = size * 0.3;
    const wispX = centerX + Math.cos(angle) * distance;
    const wispY = centerY + Math.sin(angle) * distance;
    const wispSize = size * 0.2;
    
    const wispGradient = ctx.createRadialGradient(
      wispX, wispY, 0,
      wispX, wispY, wispSize
    );
    wispGradient.addColorStop(0, `rgba(240, 240, 255, ${alpha})`);
    wispGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = wispGradient;
    ctx.beginPath();
    ctx.arc(wispX, wispY, wispSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw smoke source (ember/incense)
 */
function drawSmokeSource(ctx, centerX, centerY) {
  // Ember glow
  const emberGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 15
  );
  emberGradient.addColorStop(0, 'rgba(255, 100, 50, 0.9)');
  emberGradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.6)');
  emberGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = emberGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
  ctx.fill();

  // Ember core
  ctx.fillStyle = 'rgba(255, 150, 100, 0.8)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  // Bright ember center
  ctx.fillStyle = 'rgba(255, 255, 200, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Add floating smoke wisps throughout scene
 */
function addSmokeWisps(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  // Large smoke wisps
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 20 + Math.random() * 40;
    const alpha = 0.3 + Math.random() * 0.4;
    
    drawSmokeWisp(ctx, x, y, size, alpha);
  }

  // Medium smoke wisps
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 10 + Math.random() * 20;
    const alpha = 0.4 + Math.random() * 0.3;
    
    drawSmokeWisp(ctx, x, y, size, alpha);
  }

  ctx.restore();
}

/**
 * Draw individual smoke wisp
 */
function drawSmokeWisp(ctx, x, y, size, alpha) {
  const wispGradient = ctx.createRadialGradient(
    x, y, 0,
    x, y, size
  );
  wispGradient.addColorStop(0, `rgba(220, 220, 240, ${alpha})`);
  wispGradient.addColorStop(0.7, `rgba(180, 180, 200, ${alpha * 0.6})`);
  wispGradient.addColorStop(1, `rgba(120, 120, 150, ${alpha * 0.2})`);
  
  ctx.fillStyle = wispGradient;
  ctx.beginPath();
  
  // Organic wisp shape
  const wobble = size * 0.4;
  ctx.moveTo(x - size * 0.3, y);
  
  ctx.bezierCurveTo(
    x - size * 0.5, y - size * 0.2 + Math.random() * wobble,
    x - size * 0.3, y - size * 0.5 + Math.random() * wobble,
    x, y - size
  );
  
  ctx.bezierCurveTo(
    x + size * 0.3, y - size * 0.5 + Math.random() * wobble,
    x + size * 0.5, y - size * 0.2 + Math.random() * wobble,
    x + size * 0.3, y
  );
  
  ctx.bezierCurveTo(
    x + size * 0.2, y + size * 0.1,
    x - size * 0.2, y + size * 0.1,
    x - size * 0.3, y
  );
  
  ctx.closePath();
  ctx.fill();
}

/**
 * Add vapor trails floating upward
 */
function addVaporTrails(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;

  for (let i = 0; i < 8; i++) {
    const startX = Math.random() * width;
    const startY = height + 20;
    const endX = startX + (Math.random() - 0.5) * 60;
    const endY = Math.random() * height * 0.5;
    const trailWidth = 5 + Math.random() * 10;
    
    const trailGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    trailGradient.addColorStop(0, 'rgba(200, 200, 220, 0.6)');
    trailGradient.addColorStop(0.5, 'rgba(160, 160, 180, 0.4)');
    trailGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = trailWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (Math.random() - 0.5) * 40,
      startY - 80,
      endX + (Math.random() - 0.5) * 40,
      endY + 40,
      endX, endY
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw smoky text with vapor effects
 */
function drawSmokyText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text smoke glow
  ctx.shadowColor = 'rgba(150, 150, 180, 0.8)';
  ctx.shadowBlur = 30;
  
  // Smoky text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#E8E8F0'); // Light gray
  textGradient.addColorStop(0.3, '#C8C8D8'); // Medium gray
  textGradient.addColorStop(0.7, '#A8A8C0'); // Dark gray
  textGradient.addColorStop(1, '#E8E8F0'); // Light gray
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner text vapor
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(240, 240, 255, 0.7)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text outline
  ctx.strokeStyle = 'rgba(200, 200, 220, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add smoke effects to text
  addTextSmoke(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add smoke effects to text
 */
function addTextSmoke(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70;

  // Add rising vapor from text
  for (let i = 0; i < 15; i++) {
    const vaporX = centerX - textWidth / 2 + Math.random() * textWidth;
    const vaporY = centerY + textHeight / 2;
    const vaporHeight = 10 + Math.random() * 30;
    const vaporWidth = 2 + Math.random() * 4;
    
    const vaporGradient = ctx.createLinearGradient(
      vaporX, vaporY,
      vaporX, vaporY - vaporHeight
    );
    vaporGradient.addColorStop(0, 'rgba(200, 200, 220, 0.6)');
    vaporGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = vaporGradient;
    ctx.lineWidth = vaporWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(vaporX, vaporY);
    ctx.lineTo(vaporX, vaporY - vaporHeight);
    ctx.stroke();
  }

  // Add smoke wisps around text
  for (let i = 0; i < 8; i++) {
    const wispX = centerX - textWidth / 2 + Math.random() * textWidth;
    const wispY = centerY - textHeight / 2 + Math.random() * textHeight;
    const wispSize = 5 + Math.random() * 10;
    
    const wispGradient = ctx.createRadialGradient(
      wispX, wispY, 0,
      wispX, wispY, wispSize
    );
    wispGradient.addColorStop(0, 'rgba(220, 220, 240, 0.5)');
    wispGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = wispGradient;
    ctx.beginPath();
    ctx.arc(wispX, wispY, wispSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add mist layers for atmospheric depth
 */
function addMistLayers(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.2;

  // Ground mist
  const groundMist = ctx.createLinearGradient(0, height * 0.7, 0, height);
  groundMist.addColorStop(0, 'rgba(120, 120, 150, 0.4)');
  groundMist.addColorStop(1, 'transparent');
  
  ctx.fillStyle = groundMist;
  ctx.fillRect(0, height * 0.7, width, height * 0.3);

  // Floating mist patches
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = height * 0.3 + Math.random() * height * 0.4;
    const size = 60 + Math.random() * 80;
    
    const mistGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    mistGradient.addColorStop(0, 'rgba(150, 150, 180, 0.3)');
    mistGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = mistGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add smoke particles floating in air
 */
function addSmokeParticles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 4;
    const gray = 180 + Math.random() * 40;
    const alpha = 0.3 + Math.random() * 0.4;
    
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray + 20}, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle motion blur
    const trailLength = 3 + Math.random() * 8;
    const trailAngle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray + 20}, ${alpha * 0.5})`;
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
 * Add floating embers from smoke source
 */
function addFloatingEmbers(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 20; i++) {
    const x = width * 0.7 + (Math.random() - 0.5) * 100;
    const y = height * 0.5 + Math.random() * height * 0.4;
    const size = 1 + Math.random() * 3;
    const brightness = 0.6 + Math.random() * 0.4;
    
    // Ember glow
    ctx.fillStyle = `rgba(255, 200, 100, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Ember trail
    const trailLength = 5 + Math.random() * 10;
    const trailAngle = -Math.PI * 0.5 + (Math.random() - 0.5) * 0.5;
    
    ctx.strokeStyle = `rgba(255, 150, 50, ${brightness * 0.5})`;
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
 * Add ash particles floating down
 */
function addAshParticles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.5;

  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    const gray = 80 + Math.random() * 40;
    
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Ash trail (falling down)
    const trailLength = 3 + Math.random() * 6;
    
    ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, 0.4)`;
    ctx.lineWidth = size * 0.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + trailLength);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw smoke-themed border
 */
function drawSmokeBorder(ctx, width, height) {
  ctx.save();

  // Smoke border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#A8A8C0');
  borderGradient.addColorStop(0.3, '#C8C8D8');
  borderGradient.addColorStop(0.5, '#E8E8F0');
  borderGradient.addColorStop(0.7, '#C8C8D8');
  borderGradient.addColorStop(1, '#A8A8C0');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(150, 150, 180, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner vapor border
  ctx.strokeStyle = 'rgba(200, 200, 220, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add smoke wisp corners
  addSmokeCorners(ctx, width, height);

  ctx.restore();
}

/**
 * Add smoke wisp corners
 */
function addSmokeCorners(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 25, y: 25 },
    { x: width - 25, y: 25 },
    { x: 25, y: height - 25 },
    { x: width - 25, y: height - 25 }
  ];

  corners.forEach(corner => {
    const wispGradient = ctx.createRadialGradient(
      corner.x, corner.y, 0,
      corner.x, corner.y, 12
    );
    wispGradient.addColorStop(0, 'rgba(220, 220, 240, 0.8)');
    wispGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = wispGradient;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 12, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add smoke-themed signature
 */
function addSmokeSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(200, 200, 220, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(150, 150, 180, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small smoke wisp next to signature
  const wispGradient = ctx.createRadialGradient(
    signatureX + 5, signatureY - 8, 0,
    signatureX + 5, signatureY - 8, 6
  );
  wispGradient.addColorStop(0, 'rgba(220, 220, 240, 0.8)');
  wispGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = wispGradient;
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}