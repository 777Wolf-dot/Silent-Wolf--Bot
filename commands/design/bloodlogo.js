import { createCanvas } from 'canvas';

export default {
  name: "bloodlogo",
  description: "Create terrifying blood text logos with realistic gore and horror effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🩸 *Advanced Blood Logo*\n\nUsage: bloodlogo <text>\n\n*Example:*\nbloodlogo BLOOD\nbloodlogo GORE\nbloodlogo HORROR` 
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
        text: `🩸 Generating advanced blood logo for: "${text}"...` 
      }, { quoted: m });

      // Generate blood logo
      const logoBuffer = await generateAdvancedBloodLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🩸 *Advanced Blood Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [BLOODLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating blood logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate advanced blood logo with realistic gore effects
 */
async function generateAdvancedBloodLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create horror background
  createHorrorBackground(ctx, width, height);

  // Draw dripping blood text with advanced effects
  const textX = width * 0.5;
  const textY = height * 0.5;
  drawAdvancedBloodText(ctx, text, textX, textY);

  // Add realistic blood splatters
  addBloodSplatters(ctx, width, height);
  addBloodSpatterPhysics(ctx, textX, textY, text);

  // Add gore details
  addGoreDetails(ctx, width, height);
  addBloodPools(ctx, width, height);

  // Add horror elements
  addBloodyHandprints(ctx, width, height);
  addWeaponMarks(ctx, width, height);

  // Add atmospheric blood effects
  addBloodMist(ctx, width, height);
  addBloodParticles(ctx, width, height);

  // Add advanced lighting and shadows
  addBloodLighting(ctx, width, height);
  addHorrorShadows(ctx, width, height);

  // Add border and signature
  drawGoreBorder(ctx, width, height);
  addBloodSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create horror-themed background
 */
function createHorrorBackground(ctx, width, height) {
  // Blood-stained wall gradient
  const wallGradient = ctx.createLinearGradient(0, 0, 0, height);
  wallGradient.addColorStop(0, '#2a0a0a'); // Dark blood red
  wallGradient.addColorStop(0.3, '#3a0a0a'); // Medium blood
  wallGradient.addColorStop(0.6, '#4a0a0a'); // Light blood
  wallGradient.addColorStop(1, '#2a0a0a'); // Dark blood red
  
  ctx.fillStyle = wallGradient;
  ctx.fillRect(0, 0, width, height);

  // Add wall texture and stains
  addWallTexture(ctx, width, height);
  addBloodStains(ctx, width, height);
}

/**
 * Add realistic wall texture
 */
function addWallTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Wall cracks and imperfections
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 5 + Math.random() * 25;
    const angle = Math.random() * Math.PI * 2;
    const gray = 20 + Math.random() * 15;
    
    ctx.strokeStyle = `rgba(${gray}, ${gray}, ${gray}, 0.4)`;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Water damage and mold spots
  for (let i = 0; i < 80; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 12;
    const brown = 30 + Math.random() * 20;
    
    ctx.fillStyle = `rgba(${brown}, ${brown * 0.5}, ${brown * 0.3}, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add blood stains on walls
 */
function addBloodStains(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;

  // Large blood stains
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 20 + Math.random() * 40;
    
    const stainGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    stainGradient.addColorStop(0, 'rgba(100, 0, 0, 0.8)');
    stainGradient.addColorStop(0.7, 'rgba(80, 0, 0, 0.4)');
    stainGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = stainGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Stain drips
    addStainDrips(ctx, x, y + size, size * 0.5);
  }

  ctx.restore();
}

/**
 * Add drip patterns from stains
 */
function addStainDrips(ctx, startX, startY, dripCount) {
  for (let i = 0; i < dripCount; i++) {
    const dripX = startX + (Math.random() - 0.5) * 30;
    const dripLength = 10 + Math.random() * 40;
    const dripWidth = 1 + Math.random() * 3;
    
    ctx.strokeStyle = 'rgba(80, 0, 0, 0.6)';
    ctx.lineWidth = dripWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(dripX, startY);
    ctx.lineTo(dripX, startY + dripLength);
    ctx.stroke();

    // Drip bulb
    ctx.fillStyle = 'rgba(100, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(dripX, startY + dripLength, dripWidth * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw advanced blood text with realistic effects
 */
function drawAdvancedBloodText(ctx, text, centerX, centerY) {
  ctx.save();

  // Text blood glow
  ctx.shadowColor = 'rgba(150, 0, 0, 0.8)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Advanced blood text gradient with coagulation
  const textGradient = ctx.createLinearGradient(
    centerX - 150, centerY - 60,
    centerX + 150, centerY + 60
  );
  textGradient.addColorStop(0, '#8B0000'); // Deep blood red
  textGradient.addColorStop(0.2, '#DC143C'); // Fresh blood
  textGradient.addColorStop(0.5, '#8B0000'); // Coagulated blood
  textGradient.addColorStop(0.8, '#DC143C'); // Fresh blood
  textGradient.addColorStop(1, '#8B0000'); // Deep blood red
  
  ctx.font = 'bold 80px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Wet blood highlights
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(220, 20, 60, 0.6)';
  ctx.fillText(text.toUpperCase(), centerX - 2, centerY - 2);

  // Blood clot texture overlay
  addBloodClotTexture(ctx, text, centerX, centerY);

  // Dripping blood effects
  addAdvancedDrippingBlood(ctx, text, centerX, centerY);

  // Blood splatter around text
  addTextSplatter(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add realistic blood clot texture to text
 */
function addBloodClotTexture(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 80;

  // Blood clot patterns
  for (let i = 0; i < 25; i++) {
    const x = centerX - textWidth / 2 + Math.random() * textWidth;
    const y = centerY - textHeight / 2 + Math.random() * textHeight;
    const size = 2 + Math.random() * 8;
    
    // Clot shape (irregular)
    ctx.fillStyle = 'rgba(60, 0, 0, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Clot highlight
    ctx.fillStyle = 'rgba(150, 0, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(x - size * 0.3, y - size * 0.3, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Blood coagulation lines
  for (let i = 0; i < 15; i++) {
    const startX = centerX - textWidth / 2 + Math.random() * textWidth;
    const startY = centerY - textHeight / 2 + Math.random() * textHeight;
    const length = 5 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = 'rgba(80, 0, 0, 0.7)';
    ctx.lineWidth = 1 + Math.random() * 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add advanced dripping blood effects
 */
function addAdvancedDrippingBlood(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.9;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 80;

  // Multiple drip points along text bottom
  const dripPoints = [];
  for (let i = 0; i < text.length * 3; i++) {
    dripPoints.push(centerX - textWidth / 2 + Math.random() * textWidth);
  }

  dripPoints.forEach(dripX => {
    const dripY = centerY + textHeight / 2;
    const dripCount = 1 + Math.floor(Math.random() * 3);
    
    for (let i = 0; i < dripCount; i++) {
      const dripLength = 20 + Math.random() * 60;
      const dripWidth = 2 + Math.random() * 4;
      const dripOffset = (Math.random() - 0.5) * 10;
      
      // Main drip stream
      const dripGradient = ctx.createLinearGradient(
        dripX + dripOffset, dripY,
        dripX + dripOffset, dripY + dripLength
      );
      dripGradient.addColorStop(0, 'rgba(150, 0, 0, 0.9)');
      dripGradient.addColorStop(0.7, 'rgba(100, 0, 0, 0.7)');
      dripGradient.addColorStop(1, 'rgba(80, 0, 0, 0.5)');
      
      ctx.strokeStyle = dripGradient;
      ctx.lineWidth = dripWidth;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(dripX + dripOffset, dripY);
      ctx.lineTo(dripX + dripOffset, dripY + dripLength);
      ctx.stroke();

      // Drip bulb with realistic shape
      const bulbGradient = ctx.createRadialGradient(
        dripX + dripOffset, dripY + dripLength, 0,
        dripX + dripOffset, dripY + dripLength, dripWidth * 2
      );
      bulbGradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
      bulbGradient.addColorStop(1, 'rgba(120, 0, 0, 0.6)');
      
      ctx.fillStyle = bulbGradient;
      ctx.beginPath();
      ctx.arc(dripX + dripOffset, dripY + dripLength, dripWidth * 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Secondary drips from main drip
      if (Math.random() > 0.7) {
        const secondaryLength = 5 + Math.random() * 15;
        const secondaryX = dripX + dripOffset + (Math.random() - 0.5) * 8;
        
        ctx.strokeStyle = 'rgba(120, 0, 0, 0.7)';
        ctx.lineWidth = dripWidth * 0.6;
        ctx.beginPath();
        ctx.moveTo(dripX + dripOffset, dripY + dripLength * 0.7);
        ctx.lineTo(secondaryX, dripY + dripLength * 0.7 + secondaryLength);
        ctx.stroke();
      }
    }
  });

  ctx.restore();
}

/**
 * Add blood splatter around text
 */
function addTextSplatter(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 80;

  // Impact splatters around text
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = textWidth * 0.3 + Math.random() * textWidth * 0.4;
    const splatterX = centerX + Math.cos(angle) * distance;
    const splatterY = centerY + Math.sin(angle) * distance;
    const splatterSize = 3 + Math.random() * 12;
    
    drawBloodSplatter(ctx, splatterX, splatterY, splatterSize);
  }

  ctx.restore();
}

/**
 * Add realistic blood splatters throughout scene
 */
function addBloodSplatters(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Large impact splatters
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 15 + Math.random() * 25;
    
    drawAdvancedBloodSplatter(ctx, x, y, size);
  }

  // Medium splatters
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 8 + Math.random() * 15;
    
    drawBloodSplatter(ctx, x, y, size);
  }

  // Small spatter dots
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 5;
    
    ctx.fillStyle = `rgba(120, 0, 0, ${0.5 + Math.random() * 0.4})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw advanced blood splatter with physics
 */
function drawAdvancedBloodSplatter(ctx, x, y, size) {
  // Main splatter body
  const splatterGradient = ctx.createRadialGradient(
    x, y, 0,
    x, y, size
  );
  splatterGradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
  splatterGradient.addColorStop(0.7, 'rgba(120, 0, 0, 0.6)');
  splatterGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = splatterGradient;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Splatter spikes
  const spikeCount = 8 + Math.floor(Math.random() * 8);
  for (let i = 0; i < spikeCount; i++) {
    const angle = (i / spikeCount) * Math.PI * 2;
    const spikeLength = size * (0.5 + Math.random() * 0.8);
    const spikeWidth = size * (0.1 + Math.random() * 0.2);
    
    const spikeGradient = ctx.createLinearGradient(
      x, y,
      x + Math.cos(angle) * spikeLength,
      y + Math.sin(angle) * spikeLength
    );
    spikeGradient.addColorStop(0, 'rgba(150, 0, 0, 0.8)');
    spikeGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = spikeGradient;
    ctx.lineWidth = spikeWidth;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * spikeLength,
      y + Math.sin(angle) * spikeLength
    );
    ctx.stroke();
  }
}

/**
 * Draw simple blood splatter
 */
function drawBloodSplatter(ctx, x, y, size) {
  ctx.fillStyle = `rgba(120, 0, 0, ${0.6 + Math.random() * 0.3})`;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Add some irregularity
  for (let i = 0; i < 3; i++) {
    const angle = Math.random() * Math.PI * 2;
    const extension = size * 0.5;
    
    ctx.beginPath();
    ctx.arc(
      x + Math.cos(angle) * extension,
      y + Math.sin(angle) * extension,
      size * 0.3, 0, Math.PI * 2
    );
    ctx.fill();
  }
}

/**
 * Add blood spatter physics simulation
 */
function addBloodSpatterPhysics(ctx, textX, textY, text) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;

  // Blood spatter from text impact
  for (let i = 0; i < 50; i++) {
    const originX = textX - textWidth / 2 + Math.random() * textWidth;
    const originY = textY;
    const velocity = 2 + Math.random() * 4;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI;
    const steps = 5 + Math.floor(Math.random() * 10);
    
    drawBloodTrajectory(ctx, originX, originY, angle, velocity, steps);
  }

  ctx.restore();
}

/**
 * Draw blood trajectory with physics
 */
function drawBloodTrajectory(ctx, startX, startY, angle, velocity, steps) {
  let x = startX;
  let y = startY;
  const gravity = 0.2;
  let currentVelocity = velocity;

  ctx.strokeStyle = `rgba(150, 0, 0, ${0.4 + Math.random() * 0.3})`;
  ctx.lineWidth = 1 + Math.random() * 2;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(x, y);

  for (let step = 0; step < steps; step++) {
    x += Math.cos(angle) * currentVelocity;
    y += Math.sin(angle) * currentVelocity;
    
    // Apply gravity
    currentVelocity *= 0.9; // Air resistance
    angle += gravity * 0.1; // Gravity effect
    
    ctx.lineTo(x, y);

    // Random splatter at impact
    if (Math.random() > 0.8 || step === steps - 1) {
      ctx.stroke();
      drawBloodSplatter(ctx, x, y, 2 + Math.random() * 4);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  }

  ctx.stroke();
}

/**
 * Add gore details
 */
function addGoreDetails(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Flesh chunks
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 5 + Math.random() * 15;
    
    drawFleshChunk(ctx, x, y, size);
  }

  // Bone fragments
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 8;
    
    drawBoneFragment(ctx, x, y, size);
  }

  ctx.restore();
}

/**
 * Draw flesh chunk
 */
function drawFleshChunk(ctx, x, y, size) {
  // Flesh color with variation
  const fleshColor = `rgba(${150 + Math.random() * 50}, ${50 + Math.random() * 30}, ${50 + Math.random() * 30}, 0.8)`;
  
  ctx.fillStyle = fleshColor;
  ctx.beginPath();
  ctx.arc(x, y, size, 0, Math.PI * 2);
  ctx.fill();

  // Flesh texture
  ctx.strokeStyle = `rgba(100, 30, 30, 0.6)`;
  ctx.lineWidth = 1;
  for (let i = 0; i < 3; i++) {
    const angle = Math.random() * Math.PI * 2;
    const length = size * 0.8;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }
}

/**
 * Draw bone fragment
 */
function drawBoneFragment(ctx, x, y, size) {
  ctx.fillStyle = 'rgba(240, 240, 220, 0.8)';
  ctx.strokeStyle = 'rgba(200, 200, 180, 0.9)';
  ctx.lineWidth = 1;
  
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.5, Math.random() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bone marrow
  ctx.fillStyle = 'rgba(180, 180, 160, 0.6)';
  ctx.beginPath();
  ctx.ellipse(x, y, size * 0.6, size * 0.3, Math.random() * Math.PI, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Add blood pools
 */
function addBloodPools(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < 6; i++) {
    const x = Math.random() * width;
    const y = height * 0.8 + Math.random() * height * 0.2;
    const size = 20 + Math.random() * 40;
    
    drawBloodPool(ctx, x, y, size);
  }

  ctx.restore();
}

/**
 * Draw blood pool with reflection
 */
function drawBloodPool(ctx, x, y, size) {
  // Blood pool gradient
  const poolGradient = ctx.createRadialGradient(
    x, y, 0,
    x, y, size
  );
  poolGradient.addColorStop(0, 'rgba(100, 0, 0, 0.8)');
  poolGradient.addColorStop(0.5, 'rgba(80, 0, 0, 0.6)');
  poolGradient.addColorStop(1, 'rgba(60, 0, 0, 0.3)');
  
  ctx.fillStyle = poolGradient;
  ctx.beginPath();
  ctx.ellipse(x, y, size, size * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Pool highlight (blood surface)
  const highlightGradient = ctx.createLinearGradient(
    x - size, y,
    x + size, y
  );
  highlightGradient.addColorStop(0, 'rgba(150, 0, 0, 0.3)');
  highlightGradient.addColorStop(0.5, 'rgba(180, 0, 0, 0.5)');
  highlightGradient.addColorStop(1, 'rgba(150, 0, 0, 0.3)');
  
  ctx.fillStyle = highlightGradient;
  ctx.beginPath();
  ctx.ellipse(x, y - size * 0.1, size * 0.8, size * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Add bloody handprints
 */
function addBloodyHandprints(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.5;

  for (let i = 0; i < 4; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 30 + Math.random() * 20;
    const rotation = Math.random() * Math.PI * 2;
    
    drawBloodyHandprint(ctx, x, y, size, rotation);
  }

  ctx.restore();
}

/**
 * Draw bloody handprint
 */
function drawBloodyHandprint(ctx, x, y, size, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.fillStyle = 'rgba(120, 0, 0, 0.7)';

  // Palm
  ctx.beginPath();
  ctx.ellipse(0, 0, size * 0.3, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Fingers
  const fingerAngles = [-0.8, -0.4, 0, 0.4, 0.8];
  fingerAngles.forEach(angle => {
    const fingerX = Math.cos(angle) * size * 0.5;
    const fingerY = Math.sin(angle) * size * 0.5;
    
    ctx.beginPath();
    ctx.ellipse(fingerX, fingerY, size * 0.1, size * 0.25, angle, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add weapon marks
 */
function addWeaponMarks(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;

  // Knife slashes
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 20 + Math.random() * 40;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = 'rgba(80, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Bullet holes
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 6;
    
    ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Blood around bullet hole
    ctx.fillStyle = 'rgba(100, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.arc(x, y, size * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add blood mist atmosphere
 */
function addBloodMist(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 50 + Math.random() * 100;
    
    const mistGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    mistGradient.addColorStop(0, 'rgba(100, 0, 0, 0.4)');
    mistGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = mistGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add blood particles floating in air
 */
function addBloodParticles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const alpha = 0.4 + Math.random() * 0.4;
    
    ctx.fillStyle = `rgba(120, 0, 0, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle trail
    const trailLength = 2 + Math.random() * 6;
    const trailAngle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = `rgba(100, 0, 0, ${alpha * 0.5})`;
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
 * Add blood lighting effects
 */
function addBloodLighting(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.2;

  // Blood-red light spots
  for (let i = 0; i < 3; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height * 0.3;
    const size = 60 + Math.random() * 80;
    
    const lightGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    lightGradient.addColorStop(0, 'rgba(255, 0, 0, 0.3)');
    lightGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = lightGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add horror shadows
 */
function addHorrorShadows(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';

  // Corner shadows
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(width * 0.3, 0);
  ctx.lineTo(0, height * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, 0);
  ctx.lineTo(width * 0.7, 0);
  ctx.lineTo(width, height * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(0, height);
  ctx.lineTo(width * 0.3, height);
  ctx.lineTo(0, height * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(width, height);
  ctx.lineTo(width * 0.7, height);
  ctx.lineTo(width, height * 0.7);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Draw gore-themed border
 */
function drawGoreBorder(ctx, width, height) {
  ctx.save();

  // Blood border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#8B0000');
  borderGradient.addColorStop(0.3, '#DC143C');
  borderGradient.addColorStop(0.5, '#8B0000');
  borderGradient.addColorStop(0.7, '#DC143C');
  borderGradient.addColorStop(1, '#8B0000');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(150, 0, 0, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner gore border
  ctx.strokeStyle = 'rgba(150, 0, 0, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add blood drip corners
  addBloodCorners(ctx, width, height);

  ctx.restore();
}

/**
 * Add blood drip corners
 */
function addBloodCorners(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const corners = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  corners.forEach(corner => {
    // Blood drop
    const dropGradient = ctx.createRadialGradient(
      corner.x, corner.y, 0,
      corner.x, corner.y, 8
    );
    dropGradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
    dropGradient.addColorStop(1, 'rgba(120, 0, 0, 0.6)');
    
    ctx.fillStyle = dropGradient;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Blood drip from corner
    ctx.strokeStyle = 'rgba(150, 0, 0, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.lineTo(corner.x, corner.y + 15);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add blood-themed signature
 */
function addBloodSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(150, 0, 0, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(100, 0, 0, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small blood drop next to signature
  const dropGradient = ctx.createRadialGradient(
    signatureX + 5, signatureY - 8, 0,
    signatureX + 5, signatureY - 8, 4
  );
  dropGradient.addColorStop(0, 'rgba(180, 0, 0, 0.9)');
  dropGradient.addColorStop(1, 'rgba(120, 0, 0, 0.6)');
  
  ctx.fillStyle = dropGradient;
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 4, 0, Math.PI * 2);
  ctx.fill();
  
  // Blood drip from drop
  ctx.strokeStyle = 'rgba(150, 0, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(signatureX + 5, signatureY - 4);
  ctx.lineTo(signatureX + 5, signatureY - 1);
  ctx.stroke();
  
  ctx.restore();
}