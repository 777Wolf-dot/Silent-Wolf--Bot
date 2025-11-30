import { createCanvas } from 'canvas';

export default {
  name: "aqualogo",
  description: "Create stunning aquatic text logos with water effects and ocean themes",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🌊 *Aqua Logo*\n\nUsage: aqualogo <text>\n\n*Example:*\naqualogo OCEAN\naqualogo WATER\naqualogo MARINE` 
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
        text: `🌊 Generating aquatic logo for: "${text}"...` 
      }, { quoted: m });

      // Generate aqua logo
      const logoBuffer = await generateAquaLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🌊 *Aqua Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [AQUALOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating aqua logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate beautiful aquatic logo with water effects
 */
async function generateAquaLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create underwater background
  createUnderwaterBackground(ctx, width, height);

  // Add water surface effects
  addWaterSurface(ctx, width, height);

  // Create water text with liquid effects
  drawWaterText(ctx, text, width, height);

  // Add bubbles and aquatic elements
  addBubbles(ctx, width, height);
  addAquaticLife(ctx, width, height);

  // Add light rays and caustics
  addLightRays(ctx, width, height);
  addCaustics(ctx, width, height);

  // Add water distortion effects
  addWaterDistortion(ctx, width, height);

  // Add border and signature
  drawAquaticBorder(ctx, width, height);
  addAquaSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create underwater background with ocean gradients
 */
function createUnderwaterBackground(ctx, width, height) {
  // Deep ocean gradient
  const oceanGradient = ctx.createLinearGradient(0, 0, 0, height);
  oceanGradient.addColorStop(0, '#006994');
  oceanGradient.addColorStop(0.3, '#005a7a');
  oceanGradient.addColorStop(0.6, '#004a66');
  oceanGradient.addColorStop(1, '#00394d');
  
  ctx.fillStyle = oceanGradient;
  ctx.fillRect(0, 0, width, height);

  // Add depth texture
  addOceanDepthTexture(ctx, width, height);

  // Add coral reef background elements
  addCoralReefs(ctx, width, height);
}

/**
 * Add ocean depth texture with light variations
 */
function addOceanDepthTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  // Create depth noise
  for (let i = 0; i < 500; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 8;
    const brightness = 30 + Math.random() * 40;
    
    ctx.fillStyle = `rgba(${brightness}, ${brightness + 50}, ${brightness + 70}, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add depth lines
  ctx.strokeStyle = 'rgba(0, 80, 120, 0.2)';
  ctx.lineWidth = 1;
  
  for (let y = 50; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add water surface with light effects
 */
function addWaterSurface(ctx, width, height) {
  ctx.save();

  // Water surface gradient
  const surfaceGradient = ctx.createLinearGradient(0, 0, 0, height * 0.3);
  surfaceGradient.addColorStop(0, 'rgba(0, 150, 200, 0.6)');
  surfaceGradient.addColorStop(0.5, 'rgba(0, 100, 150, 0.3)');
  surfaceGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = surfaceGradient;
  ctx.fillRect(0, 0, width, height * 0.3);

  // Water surface waves
  drawSurfaceWaves(ctx, width, height);

  // Sunlight penetration
  addSunlightPenetration(ctx, width, height);

  ctx.restore();
}

/**
 * Draw surface waves
 */
function drawSurfaceWaves(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;

  // Multiple wave layers
  for (let wave = 0; wave < 3; wave++) {
    const waveHeight = 5 + wave * 3;
    const waveY = height * 0.1 + wave * 15;
    
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.3 - wave * 0.1})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    
    for (let x = 0; x <= width; x += 2) {
      const y = waveY + Math.sin(x * 0.02 + wave) * waveHeight;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }

  // Wave highlights
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  
  for (let x = 0; x <= width; x += 3) {
    const y = height * 0.08 + Math.sin(x * 0.015) * 8;
    
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * Add sunlight penetration effects
 */
function addSunlightPenetration(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.2;

  // Sunlight rays from surface
  const sunlightGradient = ctx.createRadialGradient(
    width * 0.5, 0, 0,
    width * 0.5, 0, width * 0.8
  );
  sunlightGradient.addColorStop(0, 'rgba(255, 255, 200, 0.6)');
  sunlightGradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.3)');
  sunlightGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = sunlightGradient;
  ctx.fillRect(0, 0, width, height * 0.5);

  // Individual light rays
  for (let i = 0; i < 8; i++) {
    const rayX = width * 0.2 + (i / 7) * width * 0.6;
    const rayWidth = 20 + Math.random() * 30;
    
    const rayGradient = ctx.createLinearGradient(rayX, 0, rayX, height);
    rayGradient.addColorStop(0, 'rgba(255, 255, 220, 0.4)');
    rayGradient.addColorStop(0.3, 'rgba(200, 230, 255, 0.2)');
    rayGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = rayGradient;
    ctx.fillRect(rayX - rayWidth / 2, 0, rayWidth, height);
  }

  ctx.restore();
}

/**
 * Draw water text with liquid effects
 */
function drawWaterText(ctx, text, width, height) {
  const centerX = width * 0.5;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text water reflection
  ctx.shadowColor = 'rgba(0, 150, 200, 0.8)';
  ctx.shadowBlur = 30;
  
  // Main text with aquatic gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#ffffff');
  textGradient.addColorStop(0.3, '#aaddff');
  textGradient.addColorStop(0.6, '#66bbff');
  textGradient.addColorStop(1, '#3399ff');
  
  ctx.font = 'bold 68px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Water droplet effects on text
  addWaterDroplets(ctx, text, centerX, centerY);

  // Text outline for depth
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Inner text glow
  ctx.fillStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Add water distortion to text edges
  addTextDistortion(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add water droplets on text
 */
function addWaterDroplets(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 68;

  // Create droplets on text surface
  for (let i = 0; i < 20; i++) {
    const dropX = centerX - textWidth / 2 + Math.random() * textWidth;
    const dropY = centerY - textHeight / 2 + Math.random() * textHeight;
    const dropSize = 2 + Math.random() * 8;
    
    if (Math.random() > 0.3) {
      // Droplet highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(dropX, dropY, dropSize * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Droplet body
      const dropGradient = ctx.createRadialGradient(
        dropX, dropY, 0,
        dropX, dropY, dropSize
      );
      dropGradient.addColorStop(0, 'rgba(150, 200, 255, 0.8)');
      dropGradient.addColorStop(1, 'rgba(100, 150, 255, 0.4)');
      
      ctx.fillStyle = dropGradient;
      ctx.beginPath();
      ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2);
      ctx.fill();

      // Droplet shadow
      ctx.fillStyle = 'rgba(0, 50, 100, 0.3)';
      ctx.beginPath();
      ctx.arc(dropX + dropSize * 0.3, dropY + dropSize * 0.3, dropSize * 0.8, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Add water distortion to text edges
 */
function addTextDistortion(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;

  // Create wavy distortion along text bottom
  for (let x = centerX - textWidth / 2; x < centerX + textWidth / 2; x += 10) {
    const waveHeight = 2 + Math.sin(x * 0.1) * 5;
    const waveY = centerY + 35 + waveHeight;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, centerY + 35);
    ctx.lineTo(x, waveY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add bubbles of various sizes
 */
function addBubbles(ctx, width, height) {
  ctx.save();

  // Large bubbles
  for (let i = 0; i < 15; i++) {
    const bubbleX = Math.random() * width;
    const bubbleY = height * 0.2 + Math.random() * height * 0.7;
    const bubbleSize = 8 + Math.random() * 25;
    
    drawBubble(ctx, bubbleX, bubbleY, bubbleSize);
  }

  // Medium bubbles
  for (let i = 0; i < 30; i++) {
    const bubbleX = Math.random() * width;
    const bubbleY = height * 0.3 + Math.random() * height * 0.6;
    const bubbleSize = 4 + Math.random() * 12;
    
    drawBubble(ctx, bubbleX, bubbleY, bubbleSize);
  }

  // Small bubbles (many)
  for (let i = 0; i < 100; i++) {
    const bubbleX = Math.random() * width;
    const bubbleY = height * 0.4 + Math.random() * height * 0.5;
    const bubbleSize = 1 + Math.random() * 6;
    
    drawBubble(ctx, bubbleX, bubbleY, bubbleSize);
  }

  // Bubble streams
  addBubbleStreams(ctx, width, height);

  ctx.restore();
}

/**
 * Draw individual bubble with realistic effects
 */
function drawBubble(ctx, x, y, size) {
  // Bubble outer glow
  const bubbleGradient = ctx.createRadialGradient(
    x, y, 0,
    x, y, size
  );
  bubbleGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
  bubbleGradient.addColorStop(0.7, 'rgba(200, 230, 255, 0.6)');
  bubbleGradient.addColorStop(1, 'rgba(150, 200, 255, 0.3)');
  
  ctx.fillStyle = bubbleGradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Bubble highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Bubble inner reflection
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(x + size * 0.2, y + size * 0.2, size * 0.3, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Add bubble streams rising from bottom
 */
function addBubbleStreams(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const streams = [
    { x: width * 0.2, count: 12 },
    { x: width * 0.4, count: 8 },
    { x: width * 0.6, count: 10 },
    { x: width * 0.8, count: 15 }
  ];

  streams.forEach(stream => {
    for (let i = 0; i < stream.count; i++) {
      const bubbleY = height * 0.7 + (i / stream.count) * height * 0.3;
      const bubbleSize = 3 + Math.random() * 8;
      const drift = (Math.random() - 0.5) * 20;
      
      drawBubble(ctx, stream.x + drift, bubbleY, bubbleSize);
    }
  });

  ctx.restore();
}

/**
 * Add aquatic life (fish, seaweed, etc.)
 */
function addAquaticLife(ctx, width, height) {
  ctx.save();

  // Add some fish
  for (let i = 0; i < 6; i++) {
    const fishX = width * 0.1 + Math.random() * width * 0.8;
    const fishY = height * 0.3 + Math.random() * height * 0.5;
    const fishSize = 15 + Math.random() * 20;
    const fishDirection = Math.random() > 0.5 ? 1 : -1;
    
    drawFish(ctx, fishX, fishY, fishSize, fishDirection);
  }

  // Add seaweed/plants
  addSeaweed(ctx, width, height);

  ctx.restore();
}

/**
 * Draw simple fish
 */
function drawFish(ctx, x, y, size, direction) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Fish body
  const fishGradient = ctx.createLinearGradient(
    x - size * direction, y,
    x + size * direction, y
  );
  fishGradient.addColorStop(0, '#ff6b6b');
  fishGradient.addColorStop(0.5, '#ff8e8e');
  fishGradient.addColorStop(1, '#ff5252');
  
  ctx.fillStyle = fishGradient;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fish tail
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(x + size * direction, y);
  ctx.lineTo(x + size * 1.5 * direction, y - size * 0.5);
  ctx.lineTo(x + size * 1.5 * direction, y + size * 0.5);
  ctx.closePath();
  ctx.fill();

  // Fish eye
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(x - size * 0.5 * direction, y, size * 0.15, 0, Math.PI * 2);
  ctx.fill();

  // Fish fin
  ctx.fillStyle = '#ff7777';
  ctx.beginPath();
  ctx.moveTo(x - size * 0.2 * direction, y - size * 0.3);
  ctx.lineTo(x + size * 0.3 * direction, y - size * 0.6);
  ctx.lineTo(x + size * 0.1 * direction, y - size * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Add seaweed and aquatic plants
 */
function addSeaweed(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const seaweedPositions = [
    { x: width * 0.1, height: 80 },
    { x: width * 0.9, height: 120 },
    { x: width * 0.3, height: 90 },
    { x: width * 0.7, height: 110 }
  ];

  seaweedPositions.forEach(seaweed => {
    ctx.strokeStyle = '#2e8b57';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(seaweed.x, height - 20);
    
    // Wavy seaweed stalk
    for (let segment = 0; segment <= 10; segment++) {
      const segmentY = height - 20 - (segment / 10) * seaweed.height;
      const waveOffset = Math.sin(segment * 0.8) * 15;
      
      ctx.lineTo(seaweed.x + waveOffset, segmentY);
    }
    ctx.stroke();

    // Seaweed leaves
    ctx.strokeStyle = '#3cb371';
    ctx.lineWidth = 2;
    
    for (let segment = 2; segment <= 8; segment += 2) {
      const segmentY = height - 20 - (segment / 10) * seaweed.height;
      const waveOffset = Math.sin(segment * 0.8) * 15;
      
      ctx.beginPath();
      ctx.moveTo(seaweed.x + waveOffset, segmentY);
      ctx.lineTo(seaweed.x + waveOffset + 20, segmentY - 15);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(seaweed.x + waveOffset, segmentY);
      ctx.lineTo(seaweed.x + waveOffset - 20, segmentY - 10);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add light rays from surface
 */
function addLightRays(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.15;

  for (let i = 0; i < 5; i++) {
    const rayX = width * 0.2 + (i / 4) * width * 0.6;
    const rayWidth = 15 + Math.random() * 25;
    
    const rayGradient = ctx.createLinearGradient(rayX, 0, rayX, height);
    rayGradient.addColorStop(0, 'rgba(255, 255, 220, 0.6)');
    rayGradient.addColorStop(0.5, 'rgba(200, 230, 255, 0.3)');
    rayGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = rayGradient;
    ctx.fillRect(rayX - rayWidth / 2, 0, rayWidth, height);
  }

  ctx.restore();
}

/**
 * Add caustics patterns (light patterns on underwater surfaces)
 */
function addCaustics(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.1;

  // Create wavy caustics patterns
  for (let y = height * 0.3; y < height; y += 40) {
    for (let x = 0; x < width; x += 50) {
      const intensity = 0.3 + Math.sin(x * 0.02 + y * 0.01) * 0.3;
      const size = 20 + Math.sin(x * 0.03) * 10;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x + Math.sin(y * 0.02) * 10, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Add coral reef background elements
 */
function addCoralReefs(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  const corals = [
    { x: width * 0.05, y: height * 0.8, color: '#ff6b6b', size: 30 },
    { x: width * 0.15, y: height * 0.75, color: '#ffa726', size: 25 },
    { x: width * 0.85, y: height * 0.82, color: '#ab47bc', size: 35 },
    { x: width * 0.95, y: height * 0.78, color: '#26c6da', size: 28 }
  ];

  corals.forEach(coral => {
    ctx.fillStyle = coral.color;
    
    // Simple coral shapes
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const branchLength = coral.size * (0.5 + Math.random() * 0.5);
      
      ctx.beginPath();
      ctx.moveTo(coral.x, coral.y);
      ctx.lineTo(
        coral.x + Math.cos(angle) * branchLength,
        coral.y + Math.sin(angle) * branchLength
      );
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(
        coral.x + Math.cos(angle) * branchLength,
        coral.y + Math.sin(angle) * branchLength,
        coral.size * 0.2, 0, Math.PI * 2
      );
      ctx.fill();
    }
  });

  ctx.restore();
}

/**
 * Add water distortion effects (ripples)
 */
function addWaterDistortion(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.05;

  // Create ripple patterns
  for (let i = 0; i < 8; i++) {
    const rippleX = Math.random() * width;
    const rippleY = Math.random() * height;
    const rippleSize = 50 + Math.random() * 100;
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    
    // Multiple concentric ripples
    for (let ring = 0; ring < 3; ring++) {
      const ringSize = rippleSize + ring * 30;
      ctx.beginPath();
      ctx.arc(rippleX, rippleY, ringSize, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Draw aquatic-themed border
 */
function drawAquaticBorder(ctx, width, height) {
  ctx.save();

  // Water border with gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#006994');
  borderGradient.addColorStop(0.3, '#0088cc');
  borderGradient.addColorStop(0.7, '#00aaff');
  borderGradient.addColorStop(1, '#006994');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(0, 150, 255, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner wave border
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.restore();
}

/**
 * Add aqua-themed signature
 */
function addAquaSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(150, 220, 255, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(0, 150, 255, 0.5)';
  ctx.shadowBlur = 15;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small water droplet next to signature
  const dropGradient = ctx.createRadialGradient(
    signatureX + 5, signatureY - 8, 0,
    signatureX + 5, signatureY - 8, 6
  );
  dropGradient.addColorStop(0, 'rgba(150, 200, 255, 0.8)');
  dropGradient.addColorStop(1, 'rgba(100, 150, 255, 0.4)');
  
  ctx.fillStyle = dropGradient;
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  // Droplet highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.arc(signatureX + 3, signatureY - 10, 2, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}