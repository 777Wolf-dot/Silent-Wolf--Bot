import { createCanvas } from 'canvas';

export default {
  name: "dragonlogo",
  description: "Create epic dragon text logos with fantasy and mystical effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🐉 *Dragon Logo*\n\nUsage: dragonlogo <text>\n\n*Example:*\ndragonlogo DRAGON\ndragonlogo FIRE\ndragonlogo WYVERN` 
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
        text: `🐉 Generating dragon logo for: "${text}"...` 
      }, { quoted: m });

      // Generate dragon logo
      const logoBuffer = await generateDragonLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🐉 *Dragon Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [DRAGONLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating dragon logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate epic dragon logo with fantasy effects
 */
async function generateDragonLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create mystical background
  createMysticalBackground(ctx, width, height);

  // Draw epic dragon
  const dragonX = width * 0.7;
  const dragonY = height * 0.4;
  drawEpicDragon(ctx, dragonX, dragonY);

  // Add dragon fire breath
  addDragonFire(ctx, dragonX, dragonY);

  // Add scales and dragon details
  addDragonScales(ctx, dragonX, dragonY);
  addDragonWings(ctx, dragonX, dragonY);

  // Create dragon-style text
  drawDragonText(ctx, text, width, height);

  // Add magical effects
  addMagicRunes(ctx, width, height);
  addMysticalParticles(ctx, width, height);

  // Add treasure and fantasy elements
  addTreasurePile(ctx, width, height);
  addFantasyElements(ctx, width, height);

  // Add border and signature
  drawDragonBorder(ctx, width, height);
  addDragonSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create mystical fantasy background
 */
function createMysticalBackground(ctx, width, height) {
  // Dark mystical gradient
  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, '#1a0a2a'); // Deep purple
  backgroundGradient.addColorStop(0.3, '#2d1b4e'); // Royal purple
  backgroundGradient.addColorStop(0.6, '#4a2c7a'); // Magenta purple
  backgroundGradient.addColorStop(1, '#1a0a2a'); // Deep purple
  
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  // Add mystical mist
  addMysticalMist(ctx, width, height);

  // Add ancient ruins in background
  addAncientRuins(ctx, width, height);
}

/**
 * Add mystical mist effects
 */
function addMysticalMist(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.globalCompositeOperation = 'screen';

  const mistPatches = [
    { x: width * 0.2, y: height * 0.3, size: 120, color: [100, 50, 200] },
    { x: width * 0.7, y: height * 0.2, size: 100, color: [200, 50, 100] },
    { x: width * 0.4, y: height * 0.6, size: 110, color: [50, 150, 200] },
    { x: width * 0.8, y: height * 0.7, size: 90, color: [200, 150, 50] }
  ];

  mistPatches.forEach(mist => {
    const [r, g, b] = mist.color;
    const gradient = ctx.createRadialGradient(
      mist.x, mist.y, 0,
      mist.x, mist.y, mist.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(mist.x, mist.y, mist.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add ancient ruins in background
 */
function addAncientRuins(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.strokeStyle = 'rgba(150, 150, 200, 0.4)';
  ctx.lineWidth = 2;

  // Ancient pillars
  for (let i = 0; i < 5; i++) {
    const x = width * 0.1 + i * 80;
    const y = height * 0.6;
    const heightPillar = 80 + Math.random() * 40;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y - heightPillar);
    ctx.stroke();

    // Pillar capital
    ctx.beginPath();
    ctx.arc(x, y - heightPillar, 8, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Broken arch
  ctx.beginPath();
  ctx.moveTo(width * 0.6, height * 0.7);
  ctx.quadraticCurveTo(width * 0.7, height * 0.5, width * 0.8, height * 0.7);
  ctx.stroke();

  ctx.restore();
}

/**
 * Draw epic dragon character
 */
function drawEpicDragon(ctx, centerX, centerY) {
  ctx.save();

  // Dragon body base
  const bodyGradient = ctx.createLinearGradient(
    centerX - 50, centerY,
    centerX + 50, centerY
  );
  bodyGradient.addColorStop(0, '#8B0000'); // Dark red
  bodyGradient.addColorStop(0.5, '#B22222'); // Firebrick
  bodyGradient.addColorStop(1, '#DC143C'); // Crimson
  
  // Dragon body (s-shaped curve)
  ctx.strokeStyle = bodyGradient;
  ctx.lineWidth = 15;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(centerX - 80, centerY + 20);
  ctx.bezierCurveTo(
    centerX - 40, centerY - 30,
    centerX + 20, centerY - 20,
    centerX + 60, centerY + 10
  );
  ctx.stroke();

  // Dragon neck and head
  ctx.beginPath();
  ctx.moveTo(centerX + 60, centerY + 10);
  ctx.bezierCurveTo(
    centerX + 80, centerY - 10,
    centerX + 100, centerY - 5,
    centerX + 110, centerY + 15
  );
  ctx.stroke();

  // Dragon head
  drawDragonHead(ctx, centerX + 110, centerY + 15);

  // Dragon legs
  drawDragonLegs(ctx, centerX, centerY);

  // Dragon tail
  drawDragonTail(ctx, centerX - 80, centerY + 20);

  ctx.restore();
}

/**
 * Draw detailed dragon head
 */
function drawDragonHead(ctx, headX, headY) {
  // Head shape
  ctx.fillStyle = '#B22222';
  ctx.beginPath();
  ctx.ellipse(headX, headY, 20, 15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dragon snout
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.ellipse(headX + 15, headY, 10, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dragon horns
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  
  // Left horn
  ctx.beginPath();
  ctx.moveTo(headX - 5, headY - 12);
  ctx.lineTo(headX - 15, headY - 25);
  ctx.stroke();

  // Right horn
  ctx.beginPath();
  ctx.moveTo(headX + 5, headY - 12);
  ctx.lineTo(headX + 15, headY - 25);
  ctx.stroke();

  // Dragon eyes
  ctx.fillStyle = '#FF4500';
  ctx.beginPath();
  ctx.arc(headX - 5, headY - 5, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#FFFF00';
  ctx.beginPath();
  ctx.arc(headX - 5, headY - 5, 2, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#8B0000';
  ctx.beginPath();
  ctx.arc(headX + 20, headY - 2, 2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(headX + 20, headY + 2, 2, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * Draw dragon legs
 */
function drawDragonLegs(ctx, centerX, centerY) {
  ctx.strokeStyle = '#B22222';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';

  // Front legs
  ctx.beginPath();
  ctx.moveTo(centerX + 20, centerY + 5);
  ctx.lineTo(centerX + 25, centerY + 30);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX + 40, centerY + 8);
  ctx.lineTo(centerX + 45, centerY + 35);
  ctx.stroke();

  // Back legs
  ctx.beginPath();
  ctx.moveTo(centerX - 40, centerY + 15);
  ctx.lineTo(centerX - 35, centerY + 40);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY + 18);
  ctx.lineTo(centerX - 15, centerY + 45);
  ctx.stroke();

  // Dragon claws
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 2;
  
  // Add claws to each leg
  const legPositions = [
    { x: centerX + 25, y: centerY + 30 },
    { x: centerX + 45, y: centerY + 35 },
    { x: centerX - 35, y: centerY + 40 },
    { x: centerX - 15, y: centerY + 45 }
  ];

  legPositions.forEach(leg => {
    for (let i = 0; i < 3; i++) {
      const angle = -0.5 + (i * 0.5);
      const clawLength = 8;
      
      ctx.beginPath();
      ctx.moveTo(leg.x, leg.y);
      ctx.lineTo(
        leg.x + Math.cos(angle) * clawLength,
        leg.y + Math.sin(angle) * clawLength
      );
      ctx.stroke();
    }
  });
}

/**
 * Draw dragon tail
 */
function drawDragonTail(ctx, tailX, tailY) {
  ctx.strokeStyle = '#B22222';
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';

  ctx.beginPath();
  ctx.moveTo(tailX, tailY);
  ctx.bezierCurveTo(
    tailX - 40, tailY + 20,
    tailX - 60, tailY - 10,
    tailX - 80, tailY + 5
  );
  ctx.stroke();

  // Tail spike
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(tailX - 80, tailY + 5);
  ctx.lineTo(tailX - 95, tailY - 5);
  ctx.stroke();
}

/**
 * Add dragon wings
 */
function addDragonWings(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  // Left wing
  const wingGradient = ctx.createLinearGradient(
    centerX - 10, centerY - 20,
    centerX - 60, centerY - 50
  );
  wingGradient.addColorStop(0, 'rgba(139, 0, 0, 0.9)');
  wingGradient.addColorStop(1, 'rgba(178, 34, 34, 0.6)');

  ctx.fillStyle = wingGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - 20);
  ctx.lineTo(centerX - 40, centerY - 60);
  ctx.lineTo(centerX - 60, centerY - 30);
  ctx.lineTo(centerX - 30, centerY - 10);
  ctx.closePath();
  ctx.fill();

  // Wing membrane details
  ctx.strokeStyle = 'rgba(160, 40, 40, 0.8)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(centerX - 10, centerY - 20);
  ctx.lineTo(centerX - 35, centerY - 45);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(centerX - 15, centerY - 18);
  ctx.lineTo(centerX - 45, centerY - 35);
  ctx.stroke();

  // Right wing (partially hidden behind body)
  ctx.fillStyle = wingGradient;
  ctx.beginPath();
  ctx.moveTo(centerX + 5, centerY - 15);
  ctx.lineTo(centerX + 25, centerY - 55);
  ctx.lineTo(centerX + 45, centerY - 25);
  ctx.lineTo(centerX + 20, centerY - 5);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Add dragon scales
 */
function addDragonScales(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Scale pattern along body
  const scalePositions = [
    { x: centerX - 60, y: centerY + 5 },
    { x: centerX - 40, y: centerY - 5 },
    { x: centerX - 20, y: centerY + 8 },
    { x: centerX, y: centerY - 2 },
    { x: centerX + 20, y: centerY + 6 },
    { x: centerX + 40, y: centerY - 3 }
  ];

  scalePositions.forEach(scale => {
    // Individual scale
    ctx.fillStyle = '#FF8C00';
    ctx.beginPath();
    ctx.ellipse(scale.x, scale.y, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Scale highlight
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.ellipse(scale.x - 2, scale.y - 1, 2, 1, 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add dragon fire breath
 */
function addDragonFire(ctx, dragonX, dragonY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const fireStartX = dragonX + 120;
  const fireStartY = dragonY + 10;

  // Fire core
  const fireGradient = ctx.createLinearGradient(
    fireStartX, fireStartY,
    fireStartX - 100, fireStartY
  );
  fireGradient.addColorStop(0, '#FFFF00'); // Yellow
  fireGradient.addColorStop(0.3, '#FF4500'); // Orange red
  fireGradient.addColorStop(0.7, '#DC143C'); // Crimson
  fireGradient.addColorStop(1, '#8B0000'); // Dark red

  ctx.strokeStyle = fireGradient;
  ctx.lineWidth = 12;
  ctx.lineCap = 'round';

  // Main fire stream
  ctx.beginPath();
  ctx.moveTo(fireStartX, fireStartY);
  ctx.bezierCurveTo(
    fireStartX - 50, fireStartY - 20,
    fireStartX - 80, fireStartY + 10,
    fireStartX - 120, fireStartY - 5
  );
  ctx.stroke();

  // Secondary fire streams
  for (let i = 0; i < 3; i++) {
    const variation = (Math.random() - 0.5) * 30;
    ctx.beginPath();
    ctx.moveTo(fireStartX, fireStartY);
    ctx.bezierCurveTo(
      fireStartX - 40, fireStartY - 15 + variation,
      fireStartX - 70, fireStartY + 5 + variation,
      fireStartX - 100, fireStartY - 10 + variation
    );
    ctx.stroke();
  }

  // Fire glow
  ctx.strokeStyle = 'rgba(255, 200, 0, 0.4)';
  ctx.lineWidth = 25;
  ctx.beginPath();
  ctx.moveTo(fireStartX, fireStartY);
  ctx.bezierCurveTo(
    fireStartX - 50, fireStartY - 20,
    fireStartX - 80, fireStartY + 10,
    fireStartX - 120, fireStartY - 5
  );
  ctx.stroke();

  // Fire sparks
  addFireSparks(ctx, fireStartX - 60, fireStartY);

  ctx.restore();
}

/**
 * Add fire sparks around dragon fire
 */
function addFireSparks(ctx, fireX, fireY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 15; i++) {
    const sparkX = fireX + (Math.random() - 0.5) * 80;
    const sparkY = fireY + (Math.random() - 0.5) * 40;
    const sparkSize = 1 + Math.random() * 4;
    const sparkLife = 0.3 + Math.random() * 0.7;
    
    ctx.fillStyle = `rgba(255, 255, 200, ${sparkLife})`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, sparkSize, 0, Math.PI * 2);
    ctx.fill();

    // Spark trail
    const trailLength = 5 + Math.random() * 10;
    const trailAngle = Math.random() * Math.PI * 2;
    
    ctx.strokeStyle = `rgba(255, 200, 100, ${sparkLife * 0.5})`;
    ctx.lineWidth = sparkSize * 0.5;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(sparkX, sparkY);
    ctx.lineTo(
      sparkX + Math.cos(trailAngle) * trailLength,
      sparkY + Math.sin(trailAngle) * trailLength
    );
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw dragon-style text
 */
function drawDragonText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text shadow for medieval feel
  ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Dragon scale text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#FFD700'); // Gold
  textGradient.addColorStop(0.3, '#FF8C00'); // Dark orange
  textGradient.addColorStop(0.7, '#B22222'); // Firebrick
  textGradient.addColorStop(1, '#8B0000'); // Dark red
  
  ctx.font = 'bold 68px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Remove shadow for metallic outline
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Metallic edge
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Scale-like texture on text
  addTextScaleTexture(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add scale-like texture to text
 */
function addTextScaleTexture(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 68;

  // Add scale pattern overlay
  for (let x = centerX - textWidth / 2; x < centerX + textWidth / 2; x += 12) {
    for (let y = centerY - textHeight / 2; y < centerY + textHeight / 2; y += 10) {
      if (Math.random() > 0.7) {
        ctx.fillStyle = 'rgba(255, 215, 0, 0.4)';
        ctx.beginPath();
        ctx.ellipse(x, y, 4, 2, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  ctx.restore();
}

/**
 * Add magical runes around the scene
 */
function addMagicRunes(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
  ctx.lineWidth = 2;

  const runePositions = [
    { x: width * 0.2, y: height * 0.3 },
    { x: width * 0.8, y: height * 0.2 },
    { x: width * 0.3, y: height * 0.8 },
    { x: width * 0.7, y: height * 0.7 }
  ];

  runePositions.forEach(rune => {
    // Simple rune circle
    ctx.beginPath();
    ctx.arc(rune.x, rune.y, 15, 0, Math.PI * 2);
    ctx.stroke();

    // Rune symbols
    ctx.beginPath();
    ctx.moveTo(rune.x - 8, rune.y - 8);
    ctx.lineTo(rune.x + 8, rune.y + 8);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(rune.x + 8, rune.y - 8);
    ctx.lineTo(rune.x - 8, rune.y + 8);
    ctx.stroke();

    // Rune glow
    ctx.strokeStyle = 'rgba(150, 220, 255, 0.4)';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(rune.x, rune.y, 20, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 2;
  });

  ctx.restore();
}

/**
 * Add mystical particles
 */
function addMysticalParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 4;
    const hue = 200 + Math.random() * 160; // Blue to purple range
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add treasure pile
 */
function addTreasurePile(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const treasureX = width * 0.2;
  const treasureY = height * 0.8;

  // Gold coins
  for (let i = 0; i < 20; i++) {
    const coinX = treasureX + (Math.random() - 0.5) * 60;
    const coinY = treasureY + (Math.random() - 0.5) * 30;
    const coinSize = 3 + Math.random() * 5;
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(coinX, coinY, coinSize, 0, Math.PI * 2);
    ctx.fill();

    // Coin highlight
    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.arc(coinX - coinSize * 0.3, coinY - coinSize * 0.3, coinSize * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // Gems
  const gemColors = ['#FF0000', '#00FF00', '#0000FF', '#FF00FF'];
  for (let i = 0; i < 5; i++) {
    const gemX = treasureX + (Math.random() - 0.5) * 50;
    const gemY = treasureY + (Math.random() - 0.5) * 20;
    const gemSize = 4 + Math.random() * 3;
    const gemColor = gemColors[Math.floor(Math.random() * gemColors.length)];
    
    ctx.fillStyle = gemColor;
    ctx.beginPath();
    ctx.moveTo(gemX, gemY - gemSize);
    ctx.lineTo(gemX + gemSize, gemY);
    ctx.lineTo(gemX, gemY + gemSize);
    ctx.lineTo(gemX - gemSize, gemY);
    ctx.closePath();
    ctx.fill();

    // Gem highlight
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(gemX - gemSize * 0.3, gemY - gemSize * 0.3);
    ctx.lineTo(gemX, gemY - gemSize * 0.1);
    ctx.lineTo(gemX - gemSize * 0.1, gemY);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add fantasy elements (mountains, etc.)
 */
function addFantasyElements(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.4;
  ctx.strokeStyle = 'rgba(100, 100, 150, 0.6)';
  ctx.lineWidth = 3;

  // Distant mountains
  for (let i = 0; i < 5; i++) {
    const mountainX = i * 60;
    const mountainHeight = 30 + Math.random() * 20;
    
    ctx.beginPath();
    ctx.moveTo(mountainX, height * 0.7);
    ctx.lineTo(mountainX + 30, height * 0.7 - mountainHeight);
    ctx.lineTo(mountainX + 60, height * 0.7);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw dragon-themed border
 */
function drawDragonBorder(ctx, width, height) {
  ctx.save();

  // Dragon scale border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#8B0000');
  borderGradient.addColorStop(0.3, '#B22222');
  borderGradient.addColorStop(0.5, '#FF8C00');
  borderGradient.addColorStop(0.7, '#B22222');
  borderGradient.addColorStop(1, '#8B0000');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(255, 100, 0, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner metallic border
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add dragon claw marks at corners
  addDragonClawMarks(ctx, width, height);

  ctx.restore();
}

/**
 * Add dragon claw marks at corners
 */
function addDragonClawMarks(ctx, width, height) {
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';

  const corners = [
    { x: 25, y: 25 },
    { x: width - 25, y: 25 },
    { x: 25, y: height - 25 },
    { x: width - 25, y: height - 25 }
  ];

  corners.forEach(corner => {
    // Three claw marks
    for (let i = 0; i < 3; i++) {
      const angle = -0.3 + (i * 0.3);
      const length = 15;
      
      ctx.beginPath();
      ctx.moveTo(corner.x, corner.y);
      ctx.lineTo(
        corner.x + Math.cos(angle) * length,
        corner.y + Math.sin(angle) * length
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add dragon-themed signature
 */
function addDragonSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(255, 215, 0, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(255, 100, 0, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small dragon scale next to signature
  ctx.fillStyle = '#FF8C00';
  ctx.beginPath();
  ctx.ellipse(signatureX + 5, signatureY - 8, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  
  // Scale highlight
  ctx.fillStyle = '#FFD700';
  ctx.beginPath();
  ctx.ellipse(signatureX + 3, signatureY - 9, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}