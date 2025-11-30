import { createCanvas } from 'canvas';

export default {
  name: "rainbowlogo",
  description: "Create vibrant rainbow text logos with colorful spectrum effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🌈 *Rainbow Logo*\n\nUsage: rainbowlogo <text>\n\n*Example:*\nrainbowlogo COLOR\nrainbowlogo RAINBOW\nrainbowlogo SPECTRUM` 
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
        text: `🌈 Generating rainbow logo for: "${text}"...` 
      }, { quoted: m });

      // Generate rainbow logo
      const logoBuffer = await generateRainbowLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🌈 *Rainbow Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [RAINBOWLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating rainbow logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate vibrant rainbow logo with spectrum effects
 */
async function generateRainbowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create colorful background
  createRainbowBackground(ctx, width, height);

  // Add rainbow arcs
  drawRainbowArcs(ctx, width, height);

  // Create rainbow text with spectrum effects
  drawRainbowText(ctx, text, width, height);

  // Add color particles and sparkles
  addColorParticles(ctx, width, height);
  addSparkles(ctx, width, height);

  // Add color bursts and waves
  addColorBursts(ctx, width, height);
  addColorWaves(ctx, width, height);

  // Add prism effects
  addPrismEffects(ctx, width, height);

  // Add border and signature
  drawRainbowBorder(ctx, width, height);
  addRainbowSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create vibrant rainbow background
 */
function createRainbowBackground(ctx, width, height) {
  // Colorful gradient background
  const backgroundGradient = ctx.createLinearGradient(0, 0, width, height);
  backgroundGradient.addColorStop(0, '#ff0080'); // Magenta
  backgroundGradient.addColorStop(0.2, '#ff00ff'); // Pink
  backgroundGradient.addColorStop(0.4, '#8000ff'); // Purple
  backgroundGradient.addColorStop(0.6, '#0080ff'); // Blue
  backgroundGradient.addColorStop(0.8, '#00ff80'); // Green
  backgroundGradient.addColorStop(1, '#ffff00'); // Yellow
  
  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, width, height);

  // Add soft color clouds
  addColorClouds(ctx, width, height);
}

/**
 * Add soft color cloud effects
 */
function addColorClouds(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;
  ctx.globalCompositeOperation = 'screen';

  const colorClouds = [
    { x: width * 0.2, y: height * 0.3, size: 120, color: [255, 0, 128] }, // Pink
    { x: width * 0.7, y: height * 0.2, size: 100, color: [128, 0, 255] }, // Purple
    { x: width * 0.3, y: height * 0.7, size: 110, color: [0, 128, 255] }, // Blue
    { x: width * 0.8, y: height * 0.6, size: 90, color: [0, 255, 128] },  // Green
    { x: width * 0.5, y: height * 0.4, size: 130, color: [255, 255, 0] }  // Yellow
  ];

  colorClouds.forEach(cloud => {
    const [r, g, b] = cloud.color;
    const gradient = ctx.createRadialGradient(
      cloud.x, cloud.y, 0,
      cloud.x, cloud.y, cloud.size
    );
    gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.6)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw rainbow arcs in background
 */
function drawRainbowArcs(ctx, width, height) {
  const centerX = width / 2;
  const centerY = height * 0.6;
  const maxRadius = Math.min(width, height) * 0.8;
  
  ctx.save();
  ctx.globalAlpha = 0.7;

  // Rainbow colors in order
  const rainbowColors = [
    '#ff0000', // Red
    '#ff7f00', // Orange
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#0000ff', // Blue
    '#4b0082', // Indigo
    '#8b00ff'  // Violet
  ];

  // Draw concentric rainbow arcs
  rainbowColors.forEach((color, index) => {
    const radius = maxRadius - index * 25;
    const startAngle = Math.PI * 0.1;
    const endAngle = Math.PI * 0.9;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 20;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  });

  // Add rainbow glow
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 30;
  
  rainbowColors.forEach((color, index) => {
    const radius = maxRadius - index * 25;
    const startAngle = Math.PI * 0.1;
    const endAngle = Math.PI * 0.9;
    
    ctx.strokeStyle = color;
    ctx.lineWidth = 15;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, startAngle, endAngle);
    ctx.stroke();
  });

  ctx.restore();
}

/**
 * Draw rainbow text with spectrum effects
 */
function drawRainbowText(ctx, text, width, height) {
  const centerX = width * 0.5;
  const centerY = height * 0.5;
  
  ctx.save();

  // Text shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 5;
  ctx.shadowOffsetY = 5;

  // Main rainbow text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 150, centerY - 50,
    centerX + 150, centerY + 50
  );
  textGradient.addColorStop(0, '#ff0000'); // Red
  textGradient.addColorStop(0.16, '#ff7f00'); // Orange
  textGradient.addColorStop(0.33, '#ffff00'); // Yellow
  textGradient.addColorStop(0.5, '#00ff00'); // Green
  textGradient.addColorStop(0.66, '#0000ff'); // Blue
  textGradient.addColorStop(0.83, '#4b0082'); // Indigo
  textGradient.addColorStop(1, '#8b00ff'); // Violet
  
  ctx.font = 'bold 72px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Remove shadow for outline
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // White outline for contrast
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.lineWidth = 3;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Inner glow effect
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.lineWidth = 1;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add individual character color effects
  addCharacterColorEffects(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add individual color effects to each character
 */
function addCharacterColorEffects(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const charWidth = textWidth / text.length;

  // Add color highlights to each character
  for (let i = 0; i < text.length; i++) {
    const charX = centerX - textWidth / 2 + (i + 0.5) * charWidth;
    const hue = (i * 360 / text.length) % 360;
    
    // Character glow
    const charGradient = ctx.createRadialGradient(
      charX, centerY, 0,
      charX, centerY, 40
    );
    charGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.6)`);
    charGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = charGradient;
    ctx.beginPath();
    ctx.arc(charX, centerY, 40, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add colorful particles floating around
 */
function addColorParticles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  // Large color orbs
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 8 + Math.random() * 20;
    const hue = Math.random() * 360;
    const saturation = 80 + Math.random() * 20;
    
    const particleGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    particleGradient.addColorStop(0, `hsla(${hue}, ${saturation}%, 70%, 0.8)`);
    particleGradient.addColorStop(1, `hsla(${hue}, ${saturation}%, 50%, 0.3)`);
    
    ctx.fillStyle = particleGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Particle core
    ctx.fillStyle = `hsla(${hue}, 100%, 90%, 0.9)`;
    ctx.beginPath();
    ctx.arc(x, y, size * 0.3, 0, Math.PI * 2);
    ctx.fill();
  }

  // Medium particles
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 3 + Math.random() * 10;
    const hue = Math.random() * 360;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.7)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small spark particles
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 4;
    const hue = Math.random() * 360;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add sparkling effects
 */
function addSparkles(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 40; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const hue = Math.random() * 360;
    const rotation = Math.random() * Math.PI * 2;
    
    // Draw star-shaped sparkle
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);
    
    ctx.fillStyle = `hsla(${hue}, 100%, 80%, 0.9)`;
    ctx.beginPath();
    
    // 5-pointed star
    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5;
      const spike = size * 2;
      const indent = size;
      
      ctx.lineTo(
        Math.cos(angle) * spike,
        Math.sin(angle) * spike
      );
      ctx.lineTo(
        Math.cos(angle + Math.PI / 5) * indent,
        Math.sin(angle + Math.PI / 5) * indent
      );
    }
    ctx.closePath();
    ctx.fill();

    // Sparkle glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.4)`;
    ctx.beginPath();
    ctx.arc(0, 0, size * 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  ctx.restore();
}

/**
 * Add color burst effects
 */
function addColorBursts(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.4;

  const bursts = [
    { x: width * 0.3, y: height * 0.3 },
    { x: width * 0.7, y: height * 0.7 },
    { x: width * 0.2, y: height * 0.7 },
    { x: width * 0.8, y: height * 0.3 }
  ];

  bursts.forEach((burst, burstIndex) => {
    const baseHue = (burstIndex * 90) % 360;
    
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const length = 80 + Math.random() * 70;
      const hue = (baseHue + i * 30) % 360;
      
      const gradient = ctx.createLinearGradient(
        burst.x, burst.y,
        burst.x + Math.cos(angle) * length,
        burst.y + Math.sin(angle) * length
      );
      gradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
      gradient.addColorStop(0.7, `hsla(${hue}, 100%, 50%, 0.4)`);
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      ctx.moveTo(burst.x, burst.y);
      ctx.lineTo(
        burst.x + Math.cos(angle) * length,
        burst.y + Math.sin(angle) * length
      );
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add color wave effects
 */
function addColorWaves(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;

  // Multiple wave layers
  for (let wave = 0; wave < 4; wave++) {
    const waveY = height * 0.2 + wave * 40;
    const amplitude = 15 + wave * 5;
    const frequency = 0.02 + wave * 0.01;
    
    ctx.beginPath();
    
    for (let x = 0; x <= width; x += 2) {
      const y = waveY + Math.sin(x * frequency + wave) * amplitude;
      const hue = (x / width * 360 + wave * 90) % 360;
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        // Change color along the wave
        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.6)`;
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  }

  ctx.restore();
}

/**
 * Add prism light refraction effects
 */
function addPrismEffects(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.2;

  // Prism light beams
  const prismX = width * 0.5;
  const prismY = height * 0.5;

  const lightBeams = [
    { angle: -0.3, hue: 0, length: 200 },    // Red
    { angle: -0.1, hue: 60, length: 180 },   // Orange
    { angle: 0.1, hue: 120, length: 160 },   // Green
    { angle: 0.3, hue: 240, length: 140 }    // Blue
  ];

  lightBeams.forEach(beam => {
    const gradient = ctx.createLinearGradient(
      prismX, prismY,
      prismX + Math.cos(beam.angle) * beam.length,
      prismY + Math.sin(beam.angle) * beam.length
    );
    gradient.addColorStop(0, `hsla(${beam.hue}, 100%, 70%, 0.6)`);
    gradient.addColorStop(0.7, `hsla(${beam.hue}, 100%, 50%, 0.3)`);
    gradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 12;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(prismX, prismY);
    ctx.lineTo(
      prismX + Math.cos(beam.angle) * beam.length,
      prismY + Math.sin(beam.angle) * beam.length
    );
    ctx.stroke();

    // Beam glow
    ctx.strokeStyle = `hsla(${beam.hue}, 100%, 70%, 0.3)`;
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.moveTo(prismX, prismY);
    ctx.lineTo(
      prismX + Math.cos(beam.angle) * beam.length,
      prismY + Math.sin(beam.angle) * beam.length
    );
    ctx.stroke();
  });

  // Prism center glow
  const prismGlow = ctx.createRadialGradient(
    prismX, prismY, 0,
    prismX, prismY, 60
  );
  prismGlow.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  prismGlow.addColorStop(1, 'transparent');
  
  ctx.fillStyle = prismGlow;
  ctx.beginPath();
  ctx.arc(prismX, prismY, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw rainbow-themed border
 */
function drawRainbowBorder(ctx, width, height) {
  ctx.save();

  // Rainbow border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#ff0000'); // Red
  borderGradient.addColorStop(0.16, '#ff7f00'); // Orange
  borderGradient.addColorStop(0.33, '#ffff00'); // Yellow
  borderGradient.addColorStop(0.5, '#00ff00'); // Green
  borderGradient.addColorStop(0.66, '#0000ff'); // Blue
  borderGradient.addColorStop(0.83, '#4b0082'); // Indigo
  borderGradient.addColorStop(1, '#8b00ff'); // Violet

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
  ctx.shadowBlur = 25;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner colorful border
  const innerBorderGradient = ctx.createLinearGradient(width, 0, 0, height);
  innerBorderGradient.addColorStop(0, '#8b00ff'); // Violet
  innerBorderGradient.addColorStop(0.16, '#4b0082'); // Indigo
  innerBorderGradient.addColorStop(0.33, '#0000ff'); // Blue
  innerBorderGradient.addColorStop(0.5, '#00ff00'); // Green
  innerBorderGradient.addColorStop(0.66, '#ffff00'); // Yellow
  innerBorderGradient.addColorStop(0.83, '#ff7f00'); // Orange
  innerBorderGradient.addColorStop(1, '#ff0000'); // Red

  ctx.strokeStyle = innerBorderGradient;
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Corner rainbow accents
  addCornerRainbowAccents(ctx, width, height);

  ctx.restore();
}

/**
 * Add rainbow accents to corners
 */
function addCornerRainbowAccents(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.7;

  const corners = [
    { x: 25, y: 25 },
    { x: width - 25, y: 25 },
    { x: 25, y: height - 25 },
    { x: width - 25, y: height - 25 }
  ];

  corners.forEach((corner, index) => {
    const baseHue = (index * 90) % 360;
    
    // Draw small rainbow arcs in corners
    for (let i = 0; i < 3; i++) {
      const radius = 15 + i * 8;
      const hue = (baseHue + i * 120) % 360;
      
      ctx.strokeStyle = `hsla(${hue}, 100%, 70%, 0.8)`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, radius, 0, Math.PI * 0.5);
      ctx.stroke();
    }
  });

  ctx.restore();
}

/**
 * Add rainbow-themed signature
 */
function addRainbowSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  // Rainbow gradient for signature text
  const signatureGradient = ctx.createLinearGradient(
    signatureX - 100, signatureY,
    signatureX, signatureY
  );
  signatureGradient.addColorStop(0, '#ff0000');
  signatureGradient.addColorStop(0.16, '#ff7f00');
  signatureGradient.addColorStop(0.33, '#ffff00');
  signatureGradient.addColorStop(0.5, '#00ff00');
  signatureGradient.addColorStop(0.66, '#0000ff');
  signatureGradient.addColorStop(0.83, '#4b0082');
  signatureGradient.addColorStop(1, '#8b00ff');
  
  ctx.fillStyle = signatureGradient;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small rainbow swatch next to signature
  const swatchWidth = 20;
  const swatchHeight = 4;
  const swatchX = signatureX - 105;
  const swatchY = signatureY + 2;
  
  const swatchGradient = ctx.createLinearGradient(swatchX, swatchY, swatchX + swatchWidth, swatchY);
  swatchGradient.addColorStop(0, '#ff0000');
  swatchGradient.addColorStop(0.16, '#ff7f00');
  swatchGradient.addColorStop(0.33, '#ffff00');
  swatchGradient.addColorStop(0.5, '#00ff00');
  swatchGradient.addColorStop(0.66, '#0000ff');
  swatchGradient.addColorStop(0.83, '#4b0082');
  swatchGradient.addColorStop(1, '#8b00ff');
  
  ctx.fillStyle = swatchGradient;
  ctx.fillRect(swatchX, swatchY, swatchWidth, swatchHeight);
  
  ctx.restore();
}