import { createCanvas } from 'canvas';

export default {
  name: "darkmagiclogo",
  description: "Create sinister dark magic text logos with occult and forbidden spell effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🔮 *Dark Magic Logo*\n\nUsage: darkmagiclogo <text>\n\n*Example:*\ndarkmagiclogo SHADOW\ndarkmagiclogo VOID\ndarkmagiclogo CURSED` 
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
        text: `🔮 Generating dark magic logo for: "${text}"...` 
      }, { quoted: m });

      // Generate dark magic logo
      const logoBuffer = await generateDarkMagicLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔮 *Dark Magic Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [DARKMAGICLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating dark magic logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate sinister dark magic logo with occult effects
 */
async function generateDarkMagicLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create forbidden ritual background
  createForbiddenSanctum(ctx, width, height);

  // Draw dark sorcerer silhouette
  const sorcererX = width * 0.75;
  const sorcererY = height * 0.55;
  drawDarkSorcerer(ctx, sorcererX, sorcererY);

  // Add forbidden ritual circle
  addRitualCircle(ctx, sorcererX, sorcererY);

  // Add dark energy effects
  addDarkEnergy(ctx, sorcererX, sorcererY);
  addShadowTendrils(ctx, width, height);

  // Create cursed text
  drawCursedText(ctx, text, width, height);

  // Add occult symbols and runes
  addOccultSymbols(ctx, width, height);
  addFloatingRunes(ctx, width, height);

  // Add sinister effects
  addBloodDrops(ctx, width, height);
  addSoulParticles(ctx, width, height);

  // Add border and signature
  drawForbiddenBorder(ctx, width, height);
  addDarkSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create forbidden sanctum background
 */
function createForbiddenSanctum(ctx, width, height) {
  // Deep abyssal gradient
  const abyssGradient = ctx.createLinearGradient(0, 0, 0, height);
  abyssGradient.addColorStop(0, '#000000'); // Pure black
  abyssGradient.addColorStop(0.3, '#1a001a'); // Deep purple black
  abyssGradient.addColorStop(0.6, '#330033'); // Dark magenta
  abyssGradient.addColorStop(1, '#000000'); // Pure black
  
  ctx.fillStyle = abyssGradient;
  ctx.fillRect(0, 0, width, height);

  // Add ancient stone texture
  addAncientStoneTexture(ctx, width, height);

  // Add ritual candles
  addRitualCandles(ctx, width, height);
}

/**
 * Add ancient stone texture
 */
function addAncientStoneTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  // Stone cracks and patterns
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 10 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    const gray = 30 + Math.random() * 20;
    
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

  // Moss and decay spots
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 8;
    const green = 30 + Math.random() * 20;
    
    ctx.fillStyle = `rgba(${green}, ${green}, 20, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add ritual candles
 */
function addRitualCandles(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const candles = [
    { x: width * 0.2, y: height * 0.7 },
    { x: width * 0.3, y: height * 0.8 },
    { x: width * 0.8, y: height * 0.7 },
    { x: width * 0.7, y: height * 0.8 }
  ];

  candles.forEach(candle => {
    // Candle stick
    ctx.fillStyle = '#2c2c2c';
    ctx.fillRect(candle.x - 4, candle.y - 30, 8, 30);

    // Candle flame
    const flameGradient = ctx.createRadialGradient(
      candle.x, candle.y - 35, 0,
      candle.x, candle.y - 35, 8
    );
    flameGradient.addColorStop(0, 'rgba(255, 100, 0, 0.9)');
    flameGradient.addColorStop(0.5, 'rgba(255, 50, 0, 0.6)');
    flameGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = flameGradient;
    ctx.beginPath();
    ctx.arc(candle.x, candle.y - 35, 8, 0, Math.PI * 2);
    ctx.fill();

    // Flame flicker
    ctx.fillStyle = 'rgba(255, 200, 0, 0.4)';
    ctx.beginPath();
    ctx.arc(candle.x, candle.y - 38, 4, 0, Math.PI * 2);
    ctx.fill();

    // Candle glow
    const glowGradient = ctx.createRadialGradient(
      candle.x, candle.y - 35, 0,
      candle.x, candle.y - 35, 20
    );
    glowGradient.addColorStop(0, 'rgba(255, 100, 0, 0.3)');
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(candle.x, candle.y - 35, 20, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw dark sorcerer silhouette
 */
function drawDarkSorcerer(ctx, centerX, centerY) {
  ctx.save();

  // Sorcerer robe silhouette
  const robeGradient = ctx.createLinearGradient(
    centerX, centerY - 60,
    centerX, centerY + 40
  );
  robeGradient.addColorStop(0, 'rgba(20, 0, 40, 0.9)');
  robeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.95)');
  
  // Robe body
  ctx.fillStyle = robeGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - 25, centerY - 30);
  ctx.bezierCurveTo(
    centerX - 35, centerY + 40,
    centerX + 35, centerY + 40,
    centerX + 25, centerY - 30
  );
  ctx.fill();

  // Hooded head
  ctx.fillStyle = 'rgba(0, 0, 0, 0.95)';
  ctx.beginPath();
  ctx.arc(centerX, centerY - 45, 20, 0, Math.PI * 2);
  ctx.fill();

  // Hood drape
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY - 35);
  ctx.bezierCurveTo(
    centerX - 25, centerY - 20,
    centerX + 25, centerY - 20,
    centerX + 20, centerY - 35
  );
  ctx.fill();

  // Glowing eyes
  const eyeGradient = ctx.createRadialGradient(
    centerX - 8, centerY - 45, 0,
    centerX - 8, centerY - 45, 6
  );
  eyeGradient.addColorStop(0, 'rgba(255, 0, 100, 0.9)');
  eyeGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = eyeGradient;
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY - 45, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + 8, centerY - 45, 6, 0, Math.PI * 2);
  ctx.fill();

  // Eye pupils
  ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX - 8, centerY - 45, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + 8, centerY - 45, 2, 0, Math.PI * 2);
  ctx.fill();

  // Raised hands casting spell
  ctx.fillStyle = 'rgba(20, 0, 40, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX - 35, centerY - 10, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + 35, centerY - 10, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add forbidden ritual circle
 */
function addRitualCircle(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  // Outer ritual circle
  ctx.strokeStyle = 'rgba(100, 0, 50, 0.8)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
  ctx.stroke();

  // Inner circle
  ctx.strokeStyle = 'rgba(150, 0, 100, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Pentagram
  drawPentagram(ctx, centerX, centerY, 40);

  // Occult symbols around circle
  addCircleSymbols(ctx, centerX, centerY);

  // Ritual circle glow
  const circleGlow = ctx.createRadialGradient(
    centerX, centerY, 50,
    centerX, centerY, 90
  );
  circleGlow.addColorStop(0, 'rgba(100, 0, 50, 0.4)');
  circleGlow.addColorStop(1, 'transparent');
  
  ctx.fillStyle = circleGlow;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 90, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw pentagram symbol
 */
function drawPentagram(ctx, centerX, centerY, size) {
  ctx.save();
  ctx.strokeStyle = 'rgba(200, 0, 100, 0.9)';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';

  const points = [];
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    points.push({
      x: centerX + Math.cos(angle) * size,
      y: centerY + Math.sin(angle) * size
    });
  }

  // Draw pentagram lines
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[4].x, points[4].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.closePath();
  ctx.stroke();

  ctx.restore();
}

/**
 * Add occult symbols around ritual circle
 */
function addCircleSymbols(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const symbols = ['†', '‡', 'Ω', 'Ψ', '‡', '∞'];
  const radius = 70;

  symbols.forEach((symbol, index) => {
    const angle = (index / symbols.length) * Math.PI * 2;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    ctx.fillStyle = 'rgba(150, 0, 100, 0.9)';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);
  });

  ctx.restore();
}

/**
 * Add dark energy effects
 */
function addDarkEnergy(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Dark energy pulses
  for (let i = 0; i < 3; i++) {
    const pulseSize = 100 + i * 30;
    const pulseAlpha = 0.2 - i * 0.05;
    
    ctx.strokeStyle = `rgba(100, 0, 100, ${pulseAlpha})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Energy tendrils from hands
  addEnergyTendrils(ctx, centerX - 35, centerY - 10);
  addEnergyTendrils(ctx, centerX + 35, centerY - 10);

  // Dark aura
  const auraGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 120
  );
  auraGradient.addColorStop(0, 'rgba(100, 0, 50, 0.6)');
  auraGradient.addColorStop(0.5, 'rgba(50, 0, 100, 0.3)');
  auraGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add energy tendrils from hands
 */
function addEnergyTendrils(ctx, handX, handY) {
  ctx.strokeStyle = 'rgba(150, 0, 100, 0.8)';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  for (let i = 0; i < 5; i++) {
    const length = 30 + Math.random() * 40;
    const angle = -0.5 + Math.random();
    
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.bezierCurveTo(
      handX + Math.cos(angle) * length * 0.3,
      handY + Math.sin(angle) * length * 0.3,
      handX + Math.cos(angle) * length * 0.7,
      handY + Math.sin(angle) * length * 0.7,
      handX + Math.cos(angle) * length,
      handY + Math.sin(angle) * length
    );
    ctx.stroke();

    // Tendril glow
    ctx.strokeStyle = 'rgba(200, 0, 150, 0.4)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(handX, handY);
    ctx.bezierCurveTo(
      handX + Math.cos(angle) * length * 0.3,
      handY + Math.sin(angle) * length * 0.3,
      handX + Math.cos(angle) * length * 0.7,
      handY + Math.sin(angle) * length * 0.7,
      handX + Math.cos(angle) * length,
      handY + Math.sin(angle) * length
    );
    ctx.stroke();

    ctx.strokeStyle = 'rgba(150, 0, 100, 0.8)';
    ctx.lineWidth = 3;
  }
}

/**
 * Add shadow tendrils throughout scene
 */
function addShadowTendrils(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  for (let i = 0; i < 8; i++) {
    const startX = Math.random() * width;
    const startY = height + 20;
    const endX = startX + (Math.random() - 0.5) * 100;
    const endY = Math.random() * height * 0.8;
    
    ctx.strokeStyle = 'rgba(50, 0, 50, 0.6)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.bezierCurveTo(
      startX + (Math.random() - 0.5) * 50,
      startY - 100,
      endX + (Math.random() - 0.5) * 50,
      endY + 50,
      endX, endY
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw cursed text with dark magic effects
 */
function drawCursedText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text dark glow
  ctx.shadowColor = 'rgba(100, 0, 50, 0.8)';
  ctx.shadowBlur = 30;
  
  // Cursed text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#640064'); // Deep purple
  textGradient.addColorStop(0.3, '#960096'); // Magenta
  textGradient.addColorStop(0.7, '#C80064'); // Crimson
  textGradient.addColorStop(1, '#640064'); // Deep purple
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner text corruption
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(200, 0, 100, 0.7)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text outline
  ctx.strokeStyle = 'rgba(100, 0, 50, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add corruption effects to text
  addTextCorruption(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add corruption effects to text
 */
function addTextCorruption(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.4;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70;

  // Add crack-like patterns on text
  for (let i = 0; i < 15; i++) {
    const startX = centerX - textWidth / 2 + Math.random() * textWidth;
    const startY = centerY - textHeight / 2 + Math.random() * textHeight;
    const length = 5 + Math.random() * 15;
    const angle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = 'rgba(50, 0, 0, 0.8)';
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(
      startX + Math.cos(angle) * length,
      startY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Add blood-like drips
  for (let i = 0; i < 8; i++) {
    const dripX = centerX - textWidth / 2 + Math.random() * textWidth;
    const dripY = centerY + textHeight / 2;
    const dripLength = 10 + Math.random() * 20;
    
    ctx.strokeStyle = 'rgba(150, 0, 0, 0.7)';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(dripX, dripY);
    ctx.lineTo(dripX, dripY + dripLength);
    ctx.stroke();

    // Drip bulb
    ctx.fillStyle = 'rgba(150, 0, 0, 0.7)';
    ctx.beginPath();
    ctx.arc(dripX, dripY + dripLength, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add occult symbols floating around
 */
function addOccultSymbols(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const occultSymbols = ['†', '‡', 'Ω', 'Ψ', '∞', '⌘', '⚡', '☠'];
  
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 10 + Math.random() * 8;
    const symbol = occultSymbols[Math.floor(Math.random() * occultSymbols.length)];
    
    ctx.fillStyle = 'rgba(150, 0, 100, 0.8)';
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);

    // Symbol glow
    ctx.fillStyle = 'rgba(100, 0, 50, 0.3)';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add floating forbidden runes
 */
function addFloatingRunes(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.5;

  const runeSymbols = ['ᚠ', 'ᚢ', 'ᚦ', 'ᚨ', 'ᚱ', 'ᚲ', 'ᚷ', 'ᚹ'];
  
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 12 + Math.random() * 10;
    const symbol = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
    
    ctx.fillStyle = 'rgba(100, 0, 50, 0.9)';
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);

    // Rune aura
    ctx.strokeStyle = 'rgba(150, 0, 100, 0.4)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Add blood drop effects
 */
function addBloodDrops(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  for (let i = 0; i < 10; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 4;
    
    // Blood drop
    const bloodGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    bloodGradient.addColorStop(0, 'rgba(150, 0, 0, 0.9)');
    bloodGradient.addColorStop(1, 'rgba(100, 0, 0, 0.6)');
    
    ctx.fillStyle = bloodGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Blood trail
    const trailLength = 3 + Math.random() * 8;
    ctx.strokeStyle = 'rgba(150, 0, 0, 0.6)';
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
 * Add soul particles (trapped spirits)
 */
function addSoulParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 25; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const hue = 300 + Math.random() * 60; // Purple range
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Soul particle trail
    const trailLength = 5 + Math.random() * 10;
    const trailAngle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.5)`;
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
 * Draw forbidden border
 */
function drawForbiddenBorder(ctx, width, height) {
  ctx.save();

  // Dark magic border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#640064');
  borderGradient.addColorStop(0.3, '#960096');
  borderGradient.addColorStop(0.5, '#C80064');
  borderGradient.addColorStop(0.7, '#960096');
  borderGradient.addColorStop(1, '#640064');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(100, 0, 50, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner forbidden border
  ctx.strokeStyle = 'rgba(150, 0, 100, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add occult corner symbols
  addOccultCorners(ctx, width, height);

  ctx.restore();
}

/**
 * Add occult corner symbols
 */
function addOccultCorners(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const corners = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  corners.forEach(corner => {
    // Occult circle
    ctx.strokeStyle = 'rgba(150, 0, 100, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Occult cross
    ctx.beginPath();
    ctx.moveTo(corner.x - 6, corner.y);
    ctx.lineTo(corner.x + 6, corner.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y - 6);
    ctx.lineTo(corner.x, corner.y + 6);
    ctx.stroke();

    // Diagonal lines
    ctx.beginPath();
    ctx.moveTo(corner.x - 4, corner.y - 4);
    ctx.lineTo(corner.x + 4, corner.y + 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(corner.x + 4, corner.y - 4);
    ctx.lineTo(corner.x - 4, corner.y + 4);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add dark signature
 */
function addDarkSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(150, 0, 100, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(100, 0, 50, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small occult symbol next to signature
  ctx.fillStyle = 'rgba(150, 0, 100, 0.8)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('†', signatureX + 5, signatureY - 8);
  
  // Symbol glow
  ctx.fillStyle = 'rgba(100, 0, 50, 0.3)';
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}