import { createCanvas } from 'canvas';

export default {
  name: "wizardlogo",
  description: "Create magical wizard text logos with spellcasting and mystical effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🧙‍♂️ *Wizard Logo*\n\nUsage: wizardlogo <text>\n\n*Example:*\nwizardlogo WIZARD\nwizardlogo MAGIC\nwizardlogo SPELL` 
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
        text: `🧙‍♂️ Generating wizard logo for: "${text}"...` 
      }, { quoted: m });

      // Generate wizard logo
      const logoBuffer = await generateWizardLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🧙‍♂️ *Wizard Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [WIZARDLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating wizard logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate magical wizard logo with spellcasting effects
 */
async function generateWizardLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create mystical background
  createWizardBackground(ctx, width, height);

  // Draw wizard character
  const wizardX = width * 0.75;
  const wizardY = height * 0.55;
  drawWizardCharacter(ctx, wizardX, wizardY);

  // Add magical staff
  addMagicStaff(ctx, wizardX, wizardY);

  // Add spellcasting effects
  addSpellCast(ctx, wizardX, wizardY);
  addMagicCircles(ctx, wizardX, wizardY);

  // Create arcane text
  drawArcaneText(ctx, text, width, height);

  // Add magical particles and runes
  addMagicParticles(ctx, width, height);
  addFloatingRunes(ctx, width, height);

  // Add mystical elements
  addMysticalOrbs(ctx, width, height);
  addSpellTrails(ctx, width, height);

  // Add border and signature
  drawArcaneBorder(ctx, width, height);
  addWizardSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create mystical wizard background
 */
function createWizardBackground(ctx, width, height) {
  // Deep mystical gradient
  const backgroundGradient = ctx.createLinearGradient(0, 0, 0, height);
  backgroundGradient.addColorStop(0, '#0a0020'); // Deep blue-purple
  backgroundGradient.addColorStop(0.3, '#1a0040'); // Royal purple
  backgroundGradient.addColorStop(0.6, '#2d1b4e'); // Magenta purple
  backgroundGradient.addColorStop(1, '#0a0020'); // Deep blue-purple
  
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  // Add starfield
  addStarfield(ctx, width, height);

  // Add ancient library elements
  addLibraryElements(ctx, width, height);
}

/**
 * Add magical starfield
 */
function addStarfield(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  // Bright stars
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const brightness = 0.5 + Math.random() * 0.5;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Magical colored stars
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const hue = 240 + Math.random() * 120; // Blue to purple range
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Star glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add library elements (books, scrolls)
 */
function addLibraryElements(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Books on shelves
  for (let i = 0; i < 8; i++) {
    const bookX = width * 0.1 + i * 25;
    const bookY = height * 0.8;
    const bookHeight = 30 + Math.random() * 20;
    const bookWidth = 15;
    const bookColor = `hsl(${Math.random() * 360}, 50%, 40%)`;
    
    ctx.fillStyle = bookColor;
    ctx.fillRect(bookX, bookY - bookHeight, bookWidth, bookHeight);

    // Book spine details
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bookX, bookY - bookHeight, bookWidth, bookHeight);

    // Book pages
    ctx.strokeStyle = 'rgba(200, 200, 150, 0.6)';
    ctx.beginPath();
    ctx.moveTo(bookX, bookY - bookHeight + 5);
    ctx.lineTo(bookX + bookWidth, bookY - bookHeight + 5);
    ctx.stroke();
  }

  // Floating scroll
  const scrollX = width * 0.85;
  const scrollY = height * 0.3;
  
  ctx.fillStyle = 'rgba(210, 180, 140, 0.6)';
  ctx.fillRect(scrollX - 20, scrollY - 5, 40, 10);

  // Scroll ends
  ctx.fillStyle = 'rgba(139, 69, 19, 0.8)';
  ctx.beginPath();
  ctx.ellipse(scrollX - 20, scrollY, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(scrollX + 20, scrollY, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw wizard character
 */
function drawWizardCharacter(ctx, centerX, centerY) {
  ctx.save();

  // Wizard robe
  const robeGradient = ctx.createLinearGradient(
    centerX, centerY - 40,
    centerX, centerY + 40
  );
  robeGradient.addColorStop(0, '#2d1b4e'); // Deep purple
  robeGradient.addColorStop(0.5, '#4a2c7a'); // Medium purple
  robeGradient.addColorStop(1, '#2d1b4e'); // Deep purple
  
  // Robe body
  ctx.fillStyle = robeGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - 25, centerY - 20);
  ctx.bezierCurveTo(
    centerX - 30, centerY + 30,
    centerX + 30, centerY + 30,
    centerX + 25, centerY - 20
  );
  ctx.fill();

  // Wizard head
  ctx.fillStyle = 'rgba(210, 180, 140, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX, centerY - 30, 15, 0, Math.PI * 2);
  ctx.fill();

  // Wizard beard
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.moveTo(centerX - 12, centerY - 25);
  ctx.bezierCurveTo(
    centerX - 15, centerY - 15,
    centerX + 15, centerY - 15,
    centerX + 12, centerY - 25
  );
  ctx.bezierCurveTo(
    centerX + 8, centerY - 10,
    centerX - 8, centerY - 10,
    centerX - 12, centerY - 25
  );
  ctx.fill();

  // Wizard hat
  drawWizardHat(ctx, centerX, centerY - 45);

  // Wizard hands
  ctx.fillStyle = 'rgba(210, 180, 140, 0.9)';
  ctx.beginPath();
  ctx.arc(centerX - 30, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.arc(centerX + 30, centerY, 8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw wizard hat
 */
function drawWizardHat(ctx, centerX, centerY) {
  // Hat brim
  ctx.fillStyle = '#2d1b4e';
  ctx.beginPath();
  ctx.ellipse(centerX, centerY + 5, 25, 8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Hat cone
  const hatGradient = ctx.createLinearGradient(
    centerX, centerY - 40,
    centerX, centerY + 5
  );
  hatGradient.addColorStop(0, '#4a2c7a');
  hatGradient.addColorStop(1, '#2d1b4e');
  
  ctx.fillStyle = hatGradient;
  ctx.beginPath();
  ctx.moveTo(centerX - 20, centerY + 5);
  ctx.lineTo(centerX, centerY - 40);
  ctx.lineTo(centerX + 20, centerY + 5);
  ctx.closePath();
  ctx.fill();

  // Hat stars
  ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
  for (let i = 0; i < 3; i++) {
    const starX = centerX - 10 + i * 10;
    const starY = centerY - 20 + i * 5;
    
    ctx.beginPath();
    ctx.arc(starX, starY, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Add magical staff
 */
function addMagicStaff(ctx, wizardX, wizardY) {
  ctx.save();

  // Staff shaft
  const staffGradient = ctx.createLinearGradient(
    wizardX - 50, wizardY - 10,
    wizardX - 50, wizardY + 30
  );
  staffGradient.addColorStop(0, '#8B4513'); // Saddle brown
  staffGradient.addColorStop(1, '#654321'); // Dark brown
  
  ctx.strokeStyle = staffGradient;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(wizardX - 50, wizardY - 10);
  ctx.lineTo(wizardX - 50, wizardY + 30);
  ctx.stroke();

  // Staff crystal
  const crystalGradient = ctx.createRadialGradient(
    wizardX - 50, wizardY - 15, 0,
    wizardX - 50, wizardY - 15, 12
  );
  crystalGradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
  crystalGradient.addColorStop(0.7, 'rgba(50, 100, 200, 0.6)');
  crystalGradient.addColorStop(1, 'rgba(0, 50, 150, 0.3)');
  
  ctx.fillStyle = crystalGradient;
  ctx.beginPath();
  ctx.moveTo(wizardX - 50, wizardY - 25);
  ctx.lineTo(wizardX - 40, wizardY - 15);
  ctx.lineTo(wizardX - 50, wizardY - 5);
  ctx.lineTo(wizardX - 60, wizardY - 15);
  ctx.closePath();
  ctx.fill();

  // Crystal glow
  ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(wizardX - 50, wizardY - 15, 15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add spell casting effects
 */
function addSpellCast(ctx, wizardX, wizardY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Spell beam from staff
  const spellGradient = ctx.createLinearGradient(
    wizardX - 50, wizardY - 15,
    wizardX - 150, wizardY - 15
  );
  spellGradient.addColorStop(0, 'rgba(100, 200, 255, 0.9)');
  spellGradient.addColorStop(0.5, 'rgba(150, 100, 255, 0.6)');
  spellGradient.addColorStop(1, 'rgba(200, 50, 255, 0.3)');
  
  ctx.strokeStyle = spellGradient;
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(wizardX - 50, wizardY - 15);
  ctx.lineTo(wizardX - 150, wizardY - 15);
  ctx.stroke();

  // Spell glow
  ctx.strokeStyle = 'rgba(150, 200, 255, 0.4)';
  ctx.lineWidth = 20;
  ctx.beginPath();
  ctx.moveTo(wizardX - 50, wizardY - 15);
  ctx.lineTo(wizardX - 150, wizardY - 15);
  ctx.stroke();

  // Spell impact at end
  const impactGradient = ctx.createRadialGradient(
    wizardX - 150, wizardY - 15, 0,
    wizardX - 150, wizardY - 15, 30
  );
  impactGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  impactGradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.5)');
  impactGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = impactGradient;
  ctx.beginPath();
  ctx.arc(wizardX - 150, wizardY - 15, 30, 0, Math.PI * 2);
  ctx.fill();

  // Spell particles along beam
  for (let i = 0; i < 15; i++) {
    const progress = Math.random();
    const particleX = wizardX - 50 - progress * 100;
    const particleY = wizardY - 15 + (Math.random() - 0.5) * 20;
    const particleSize = 1 + Math.random() * 3;
    const hue = 200 + Math.random() * 160;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.beginPath();
    ctx.arc(particleX, particleY, particleSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add magical circles around wizard
 */
function addMagicCircles(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  // Concentric magic circles
  const circleColors = ['#64C8FF', '#9664FF', '#FF64C8'];
  
  circleColors.forEach((color, index) => {
    const radius = 60 + index * 20;
    const lineWidth = 3 - index;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Remove dash for next circle
    ctx.setLineDash([]);
  });

  // Rotating runes around circles
  addCircleRunes(ctx, centerX, centerY);

  ctx.restore();
}

/**
 * Add rotating runes around magic circles
 */
function addCircleRunes(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const runeCount = 8;
  const radius = 80;

  for (let i = 0; i < runeCount; i++) {
    const angle = (i / runeCount) * Math.PI * 2;
    const runeX = centerX + Math.cos(angle) * radius;
    const runeY = centerY + Math.sin(angle) * radius;
    
    ctx.fillStyle = 'rgba(100, 200, 255, 0.9)';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Simple rune symbols (using asterisk as placeholder)
    ctx.fillText('*', runeX, runeY);

    // Rune glow
    ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
    ctx.beginPath();
    ctx.arc(runeX, runeY, 10, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw arcane text with magical effects
 */
function drawArcaneText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text magical glow
  ctx.shadowColor = 'rgba(100, 200, 255, 0.8)';
  ctx.shadowBlur = 30;
  
  // Arcane text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#64C8FF'); // Light blue
  textGradient.addColorStop(0.3, '#9664FF'); // Purple
  textGradient.addColorStop(0.7, '#FF64C8'); // Pink
  textGradient.addColorStop(1, '#64C8FF'); // Light blue
  
  ctx.font = 'bold 68px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner text glow
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text outline
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add runic patterns to text
  addTextRunes(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add runic patterns to text
 */
function addTextRunes(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 68;

  // Add glowing dots (like magical energy points)
  for (let i = 0; i < 20; i++) {
    const dotX = centerX - textWidth / 2 + Math.random() * textWidth;
    const dotY = centerY - textHeight / 2 + Math.random() * textHeight;
    const dotSize = 1 + Math.random() * 3;
    const hue = 200 + Math.random() * 160;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
    ctx.beginPath();
    ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add magical particles floating around
 */
function addMagicParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Large magical orbs
  for (let i = 0; i < 15; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 4 + Math.random() * 8;
    const hue = 200 + Math.random() * 160;
    
    const particleGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    particleGradient.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.9)`);
    particleGradient.addColorStop(1, `hsla(${hue}, 100%, 60%, 0.3)`);
    
    ctx.fillStyle = particleGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle trail
    const trailLength = 5 + Math.random() * 15;
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

  // Small sparkles
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 2;
    const hue = 200 + Math.random() * 160;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add floating runes in background
 */
function addFloatingRunes(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  const runeSymbols = ['*', '+', '○', '□', '△'];
  
  for (let i = 0; i < 12; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 8 + Math.random() * 6;
    const hue = 200 + Math.random() * 160;
    const symbol = runeSymbols[Math.floor(Math.random() * runeSymbols.length)];
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
    ctx.font = `bold ${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(symbol, x, y);

    // Rune glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.3)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add mystical orbs of power
 */
function addMysticalOrbs(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.4;

  const orbs = [
    { x: width * 0.2, y: height * 0.3, size: 40, color: [100, 200, 255] },
    { x: width * 0.8, y: height * 0.4, size: 35, color: [150, 100, 255] },
    { x: width * 0.3, y: height * 0.7, size: 45, color: [255, 100, 200] }
  ];

  orbs.forEach(orb => {
    const [r, g, b] = orb.color;
    const gradient = ctx.createRadialGradient(
      orb.x, orb.y, 0,
      orb.x, orb.y, orb.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(orb.x, orb.y, orb.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add spell trails in background
 */
function addSpellTrails(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.2;

  for (let i = 0; i < 5; i++) {
    const startX = Math.random() * width;
    const startY = height + 20;
    const endX = startX + (Math.random() - 0.5) * 100;
    const endY = Math.random() * height * 0.5;
    const hue = 200 + Math.random() * 160;
    
    const trailGradient = ctx.createLinearGradient(startX, startY, endX, endY);
    trailGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.6)`);
    trailGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.2)`);
    
    ctx.strokeStyle = trailGradient;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Draw arcane border
 */
function drawArcaneBorder(ctx, width, height) {
  ctx.save();

  // Magical border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#64C8FF');
  borderGradient.addColorStop(0.3, '#9664FF');
  borderGradient.addColorStop(0.5, '#FF64C8');
  borderGradient.addColorStop(0.7, '#9664FF');
  borderGradient.addColorStop(1, '#64C8FF');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner magical border
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add runic corner accents
  addRunicCorners(ctx, width, height);

  ctx.restore();
}

/**
 * Add runic corner accents
 */
function addRunicCorners(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  corners.forEach(corner => {
    // Runic circle
    ctx.strokeStyle = 'rgba(100, 200, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
    ctx.stroke();

    // Runic cross
    ctx.beginPath();
    ctx.moveTo(corner.x - 5, corner.y);
    ctx.lineTo(corner.x + 5, corner.y);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y - 5);
    ctx.lineTo(corner.x, corner.y + 5);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add wizard-themed signature
 */
function addWizardSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(100, 200, 255, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small magic rune next to signature
  ctx.fillStyle = 'rgba(100, 200, 255, 0.8)';
  ctx.font = 'bold 12px Arial';
  ctx.fillText('*', signatureX + 5, signatureY - 8);
  
  // Rune glow
  ctx.fillStyle = 'rgba(100, 200, 255, 0.3)';
  ctx.beginPath();
  ctx.arc(signatureX + 5, signatureY - 8, 6, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}