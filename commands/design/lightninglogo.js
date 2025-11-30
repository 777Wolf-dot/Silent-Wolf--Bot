import { createCanvas } from 'canvas';

export default {
  name: "lightninglogo",
  description: "Create electrifying text logos with realistic lightning and storm effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `⚡ *Lightning Logo*\n\nUsage: lightninglogo <text>\n\n*Example:*\nlightninglogo BOLT\nlightninglogo THOR\nlightninglogo STORM` 
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
        text: `⚡ Generating lightning logo for: "${text}"...` 
      }, { quoted: m });

      // Generate lightning logo
      const logoBuffer = await generateLightningLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `⚡ *Lightning Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [LIGHTNINGLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating lightning logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate realistic lightning logo with storm effects
 */
async function generateLightningLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create stormy background
  createStormBackground(ctx, width, height);

  // Generate multiple realistic lightning bolts
  const mainBolts = generateLightningBolts(ctx, width, height);
  
  // Add lightning glow and electrical effects
  addLightningGlow(ctx, mainBolts);
  addElectricalArcs(ctx, width, height);
  
  // Create electrified text
  drawElectrifiedText(ctx, text, width, height);

  // Add storm clouds
  addStormClouds(ctx, width, height);
  
  // Add rain effects
  addRainEffects(ctx, width, height);
  
  // Add energy particles
  addEnergyParticles(ctx, width, height);

  // Add border and signature
  drawElectricBorder(ctx, width, height);
  addLightningSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create stormy background with dark gradients
 */
function createStormBackground(ctx, width, height) {
  // Dark storm cloud gradient
  const stormGradient = ctx.createLinearGradient(0, 0, 0, height);
  stormGradient.addColorStop(0, '#0a0a1a');
  stormGradient.addColorStop(0.3, '#1a1a2a');
  stormGradient.addColorStop(0.6, '#2a2a3a');
  stormGradient.addColorStop(1, '#1a1a2a');
  
  ctx.fillStyle = stormGradient;
  ctx.fillRect(0, 0, width, height);

  // Add distant lightning flashes in background
  addBackgroundLightningFlashes(ctx, width, height);
}

/**
 * Generate realistic lightning bolts
 */
function generateLightningBolts(ctx, width, height) {
  const bolts = [];
  
  // Main dramatic lightning bolt
  const mainBolt = createLightningBolt(
    ctx, 
    width * 0.7, 
    height * 0.1, 
    width * 0.3, 
    height * 0.9,
    5,
    0.7
  );
  bolts.push(mainBolt);

  // Secondary bolts
  bolts.push(createLightningBolt(
    ctx, 
    width * 0.8, 
    height * 0.05, 
    width * 0.5, 
    height * 0.7,
    4,
    0.5
  ));

  bolts.push(createLightningBolt(
    ctx, 
    width * 0.6, 
    height * 0.15, 
    width * 0.2, 
    height * 0.8,
    3,
    0.4
  ));

  // Branching small bolts
  for (let i = 0; i < 8; i++) {
    const startX = width * 0.7 + (Math.random() - 0.5) * 100;
    const startY = height * 0.1 + Math.random() * height * 0.3;
    const endX = width * 0.3 + (Math.random() - 0.5) * 200;
    const endY = height * 0.7 + Math.random() * height * 0.2;
    
    bolts.push(createLightningBolt(
      ctx, 
      startX, 
      startY, 
      endX, 
      endY,
      2,
      0.3
    ));
  }

  return bolts;
}

/**
 * Create a single realistic lightning bolt
 */
function createLightningBolt(ctx, startX, startY, endX, endY, detail, intensity) {
  ctx.save();

  // Generate lightning path with fractal algorithm
  const points = generateLightningPath(startX, startY, endX, endY, detail);
  
  // Draw main lightning core
  ctx.strokeStyle = `rgba(255, 255, 255, ${intensity})`;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  // Draw brighter inner core
  ctx.strokeStyle = `rgba(200, 220, 255, ${intensity * 1.2})`;
  ctx.lineWidth = 1.5;
  
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.stroke();

  ctx.restore();

  return {
    points: points,
    intensity: intensity,
    startX: startX,
    startY: startY,
    endX: endX,
    endY: endY
  };
}

/**
 * Generate fractal lightning path using midpoint displacement
 */
function generateLightningPath(startX, startY, endX, endY, detail) {
  const points = [{ x: startX, y: startY }];
  
  // Recursive function to add detail
  function subdivide(point1, point2, depth) {
    if (depth <= 0) return;
    
    const midX = (point1.x + point2.x) / 2;
    const midY = (point1.y + point2.y) / 2;
    
    // Displace midpoint
    const displacement = (Math.random() - 0.5) * (50 / depth);
    const angle = Math.atan2(point2.y - point1.y, point2.x - point1.x);
    const displaceX = midX + Math.cos(angle + Math.PI / 2) * displacement;
    const displaceY = midY + Math.sin(angle + Math.PI / 2) * displacement;
    
    const midPoint = { x: displaceX, y: displaceY };
    
    // Recursively subdivide both segments
    subdivide(point1, midPoint, depth - 1);
    points.push(midPoint);
    subdivide(midPoint, point2, depth - 1);
  }
  
  subdivide({ x: startX, y: startY }, { x: endX, y: endY }, detail);
  points.push({ x: endX, y: endY });
  
  return points;
}

/**
 * Add glowing effects around lightning bolts
 */
function addLightningGlow(ctx, bolts) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  bolts.forEach(bolt => {
    // Outer glow
    const glowGradient = ctx.createRadialGradient(
      bolt.startX, bolt.startY, 0,
      bolt.startX, bolt.startY, 100
    );
    glowGradient.addColorStop(0, `rgba(100, 150, 255, ${bolt.intensity * 0.3})`);
    glowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(bolt.startX, bolt.startY, 100, 0, Math.PI * 2);
    ctx.fill();

    // Bolt path glow
    ctx.strokeStyle = `rgba(80, 120, 255, ${bolt.intensity * 0.4})`;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
    
    for (let i = 1; i < bolt.points.length; i++) {
      ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
    }
    ctx.stroke();

    // Intense core glow
    ctx.strokeStyle = `rgba(150, 200, 255, ${bolt.intensity * 0.6})`;
    ctx.lineWidth = 10;
    
    ctx.beginPath();
    ctx.moveTo(bolt.points[0].x, bolt.points[0].y);
    
    for (let i = 1; i < bolt.points.length; i++) {
      ctx.lineTo(bolt.points[i].x, bolt.points[i].y);
    }
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Add electrical arcs and sparks
 */
function addElectricalArcs(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Create electrical arcs around the main area
  for (let i = 0; i < 15; i++) {
    const arcX = width * 0.3 + Math.random() * width * 0.4;
    const arcY = height * 0.4 + Math.random() * height * 0.3;
    const arcSize = 20 + Math.random() * 50;
    
    drawElectricalArc(ctx, arcX, arcY, arcSize);
  }

  // Add ground strikes
  for (let i = 0; i < 5; i++) {
    const groundX = width * 0.2 + Math.random() * width * 0.6;
    const groundY = height * 0.85;
    
    drawGroundStrike(ctx, groundX, groundY);
  }

  ctx.restore();
}

/**
 * Draw individual electrical arc
 */
function drawElectricalArc(ctx, x, y, size) {
  const points = [];
  points.push({ x: x, y: y });
  
  // Generate random arc path
  for (let i = 0; i < 8; i++) {
    points.push({
      x: x + (Math.random() - 0.5) * size * 2,
      y: y + (Math.random() - 0.5) * size
    });
  }

  // Draw arc with electric colors
  const arcColors = [
    'rgba(100, 150, 255, 0.8)',
    'rgba(150, 200, 255, 0.6)',
    'rgba(200, 230, 255, 0.4)'
  ];

  arcColors.forEach((color, index) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = 3 - index;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
    ctx.stroke();
  });

  // Add spark particles at arc ends
  addSparkParticles(ctx, points[points.length - 1].x, points[points.length - 1].y);
}

/**
 * Draw ground strike effect
 */
function drawGroundStrike(ctx, x, y) {
  // Ground impact glow
  const groundGlow = ctx.createRadialGradient(x, y, 0, x, y, 60);
  groundGlow.addColorStop(0, 'rgba(100, 150, 255, 0.6)');
  groundGlow.addColorStop(0.5, 'rgba(80, 120, 255, 0.3)');
  groundGlow.addColorStop(1, 'transparent');
  
  ctx.fillStyle = groundGlow;
  ctx.beginPath();
  ctx.arc(x, y, 60, 0, Math.PI * 2);
  ctx.fill();

  // Ground cracks
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
  ctx.lineWidth = 2;
  
  for (let i = 0; i < 5; i++) {
    const angle = (i / 5) * Math.PI * 2;
    const length = 15 + Math.random() * 25;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * length,
      y + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  addSparkParticles(ctx, x, y);
}

/**
 * Add spark particles around points
 */
function addSparkParticles(ctx, x, y) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 8; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = 5 + Math.random() * 20;
    const size = 1 + Math.random() * 3;
    
    const sparkX = x + Math.cos(angle) * distance;
    const sparkY = y + Math.sin(angle) * distance;
    
    // Spark glow
    ctx.fillStyle = `rgba(150, 200, 255, 0.8)`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Spark core
    ctx.fillStyle = `rgba(255, 255, 255, 1)`;
    ctx.beginPath();
    ctx.arc(sparkX, sparkY, size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw electrified text with lightning effects
 */
function drawElectrifiedText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text electric glow
  ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
  ctx.shadowBlur = 40;
  
  // Main text with electric blue gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#ffffff');
  textGradient.addColorStop(0.3, '#aaccff');
  textGradient.addColorStop(0.7, '#6688ff');
  textGradient.addColorStop(1, '#4466cc');
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Electric outline
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.9)';
  ctx.lineWidth = 3;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add lightning effects to text
  addTextLightning(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add lightning effects to the text characters
 */
function addTextLightning(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Measure text to position lightning accurately
  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70; // Approximate font size

  // Add small lightning bolts to text edges
  for (let i = 0; i < text.length * 2; i++) {
    const charPos = i / (text.length * 2);
    const x = centerX - textWidth / 2 + textWidth * charPos;
    const y = centerY - textHeight / 2 + Math.random() * textHeight;
    
    if (Math.random() > 0.7) {
      const boltLength = 10 + Math.random() * 30;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.strokeStyle = `rgba(150, 200, 255, ${0.3 + Math.random() * 0.4})`;
      ctx.lineWidth = 1 + Math.random() * 2;
      
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * boltLength,
        y + Math.sin(angle) * boltLength
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Add storm clouds
 */
function addStormClouds(ctx, width, height) {
  ctx.save();

  // Main storm cloud
  const cloudGradient = ctx.createLinearGradient(0, height * 0.2, 0, height * 0.5);
  cloudGradient.addColorStop(0, 'rgba(40, 40, 60, 0.9)');
  cloudGradient.addColorStop(1, 'rgba(20, 20, 40, 0.7)');
  
  ctx.fillStyle = cloudGradient;
  
  // Draw cloud shape
  ctx.beginPath();
  ctx.moveTo(width * 0.1, height * 0.3);
  
  // Cloud curves with turbulence
  for (let i = 0; i <= 10; i++) {
    const x = width * 0.1 + (i / 10) * width * 0.8;
    const y = height * 0.3 + Math.sin(i * 0.8) * 20 - Math.random() * 10;
    ctx.lineTo(x, y);
  }
  
  for (let i = 10; i >= 0; i--) {
    const x = width * 0.1 + (i / 10) * width * 0.8;
    const y = height * 0.5 + Math.cos(i * 0.5) * 15 + Math.random() * 10;
    ctx.lineTo(x, y);
  }
  
  ctx.closePath();
  ctx.fill();

  // Cloud highlights
  ctx.strokeStyle = 'rgba(80, 80, 120, 0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();
}

/**
 * Add rain effects
 */
function addRainEffects(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.6;

  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 10 + Math.random() * 20;
    const angle = Math.PI * 0.2; // Slight angle for wind
    
    ctx.strokeStyle = `rgba(150, 180, 220, ${0.3 + Math.random() * 0.4})`;
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

  ctx.restore();
}

/**
 * Add background lightning flashes
 */
function addBackgroundLightningFlashes(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.globalCompositeOperation = 'screen';

  // Random background flashes
  for (let i = 0; i < 3; i++) {
    const flashX = Math.random() * width;
    const flashY = Math.random() * height * 0.5;
    const flashSize = 100 + Math.random() * 200;
    
    const flashGradient = ctx.createRadialGradient(
      flashX, flashY, 0,
      flashX, flashY, flashSize
    );
    flashGradient.addColorStop(0, 'rgba(100, 150, 255, 0.4)');
    flashGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = flashGradient;
    ctx.beginPath();
    ctx.arc(flashX, flashY, flashSize, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add energy particles floating in air
 */
function addEnergyParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 4;
    const alpha = 0.3 + Math.random() * 0.5;
    
    // Energy particle with electric color
    ctx.fillStyle = `rgba(100, 180, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle glow
    ctx.fillStyle = `rgba(150, 200, 255, ${alpha * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw electric border
 */
function drawElectricBorder(ctx, width, height) {
  ctx.save();

  // Electric blue border with glow
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#4466cc');
  borderGradient.addColorStop(0.5, '#88aaff');
  borderGradient.addColorStop(1, '#4466cc');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
  ctx.shadowBlur = 25;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner electric pulse
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  ctx.restore();
}

/**
 * Add lightning-themed signature
 */
function addLightningSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(150, 200, 255, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
  ctx.shadowBlur = 15;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small lightning bolt next to signature
  ctx.strokeStyle = 'rgba(200, 220, 255, 0.8)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  
  ctx.beginPath();
  ctx.moveTo(signatureX + 5, signatureY - 10);
  ctx.lineTo(signatureX - 15, signatureY + 5);
  ctx.lineTo(signatureX - 5, signatureY);
  ctx.lineTo(signatureX - 25, signatureY + 15);
  ctx.stroke();
  
  ctx.restore();
}