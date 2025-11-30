import { createCanvas } from 'canvas';

export default {
  name: "chromelogo",
  description: "Create shiny chrome reflective text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `✨ *Chrome Logo*\n\nUsage: chromelogo <text>\n\n*Example:*\nchromelogo WOLF\nchromelogo CHROME\nchromelogo SHINE` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      
      if (text.length > 15) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Please use maximum 15 characters.\n\nYour text: "${text}" (${text.length} characters)` 
        }, { quoted: m });
        return;
      }

      // Send waiting message
      await sock.sendMessage(jid, { 
        text: `✨ Generating chrome logo for: "${text}"...` 
      }, { quoted: m });

      // Generate chrome logo
      const logoBuffer = await generateChromeLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `✨ *Chrome Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [CHROMELOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating chrome logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate realistic chrome reflective logo
 */
async function generateChromeLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background for chrome reflections
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#2a2a2a');
  bgGradient.addColorStop(0.5, '#1a1a1a');
  bgGradient.addColorStop(1, '#0a0a0a');
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add environment for chrome reflections
  drawChromeEnvironment(ctx, width, height);

  // Create realistic chrome gradient (high contrast for mirror effect)
  const chromeGradient = ctx.createLinearGradient(0, 80, 0, 320);
  chromeGradient.addColorStop(0, '#FFFFFF');    // Bright highlight
  chromeGradient.addColorStop(0.1, '#F0F0F0');  // Light chrome
  chromeGradient.addColorStop(0.2, '#D0D0D0');  // Medium light
  chromeGradient.addColorStop(0.35, '#A0A0A0'); // Mid chrome
  chromeGradient.addColorStop(0.5, '#707070');  // Medium dark
  chromeGradient.addColorStop(0.65, '#404040'); // Dark chrome
  chromeGradient.addColorStop(0.8, '#202020');  // Very dark
  chromeGradient.addColorStop(0.9, '#000000');  // Black shadow
  chromeGradient.addColorStop(1, '#303030');    // Dark base

  // Main text with chrome reflection effect
  ctx.font = 'bold 88px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create chrome reflection effect
  createChromeReflectionEffect(ctx, text, width, height, chromeGradient);

  // Add chrome-specific highlights and reflections
  addChromeHighlights(ctx, text, width, height);

  // Add reflective border
  drawChromeBorder(ctx, width, height);

  // Add light sources for reflection
  addLightSources(ctx, width, height);

  // Add chrome surface imperfections
  addChromeImperfections(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw environment for chrome reflections
 */
function drawChromeEnvironment(ctx, width, height) {
  // Add light sources in the background for reflection
  const lightSources = [
    { x: width * 0.2, y: height * 0.3, size: 80, color: 'rgba(255, 255, 255, 0.1)' },
    { x: width * 0.8, y: height * 0.2, size: 60, color: 'rgba(255, 255, 255, 0.08)' },
    { x: width * 0.3, y: height * 0.7, size: 70, color: 'rgba(255, 255, 255, 0.06)' },
    { x: width * 0.7, y: height * 0.6, size: 50, color: 'rgba(255, 255, 255, 0.05)' }
  ];

  lightSources.forEach(light => {
    const gradient = ctx.createRadialGradient(
      light.x, light.y, 0,
      light.x, light.y, light.size
    );
    gradient.addColorStop(0, light.color);
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(light.x, light.y, light.size, 0, Math.PI * 2);
    ctx.fill();
  });

  // Add subtle grid for reflection reference
  ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
  ctx.lineWidth = 1;
  
  // Horizontal grid lines
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }
  
  // Vertical grid lines
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
}

/**
 * Create chrome reflection effect
 */
function createChromeReflectionEffect(ctx, text, width, height, chromeGradient) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Base shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = 8;
  ctx.shadowOffsetY = 8;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillText(text.toUpperCase(), centerX + 5, centerY + 5);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Main chrome text
  ctx.fillStyle = chromeGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Add edge reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add chrome-specific highlights (mirror-like reflections)
 */
function addChromeHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Primary highlight (strong white reflection)
  const primaryHighlight = ctx.createLinearGradient(
    centerX - 300, centerY - 80,
    centerX + 300, centerY - 20
  );
  primaryHighlight.addColorStop(0, 'rgba(255, 255, 255, 0)');
  primaryHighlight.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
  primaryHighlight.addColorStop(0.4, 'rgba(255, 255, 255, 0.9)');
  primaryHighlight.addColorStop(0.6, 'rgba(255, 255, 255, 0.7)');
  primaryHighlight.addColorStop(0.8, 'rgba(255, 255, 255, 0.3)');
  primaryHighlight.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = primaryHighlight;
  ctx.font = 'bold 88px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Secondary highlights (spot reflections)
  ctx.globalCompositeOperation = 'source-over';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  
  // Add multiple reflection spots
  const reflectionSpots = [
    { x: -0.35, y: -0.4, size: 6, alpha: 0.9 },
    { x: -0.15, y: -0.45, size: 8, alpha: 0.8 },
    { x: 0.05, y: -0.4, size: 7, alpha: 0.85 },
    { x: 0.25, y: -0.45, size: 6, alpha: 0.8 },
    { x: 0.4, y: -0.35, size: 5, alpha: 0.7 }
  ];

  reflectionSpots.forEach(spot => {
    const x = centerX + (spot.x * textWidth / 2);
    const y = centerY + (spot.y * 45);
    
    ctx.fillStyle = `rgba(255, 255, 255, ${spot.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, spot.size, 0, Math.PI * 2);
    ctx.fill();

    // Add bloom to reflection spots
    ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
    ctx.shadowBlur = 10;
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw reflective chrome border
 */
function drawChromeBorder(ctx, width, height) {
  // Outer chrome border with high contrast
  const chromeBorder = ctx.createLinearGradient(0, 0, width, height);
  chromeBorder.addColorStop(0, '#FFFFFF');
  chromeBorder.addColorStop(0.15, '#E0E0E0');
  chromeBorder.addColorStop(0.3, '#A0A0A0');
  chromeBorder.addColorStop(0.5, '#404040');
  chromeBorder.addColorStop(0.7, '#A0A0A0');
  chromeBorder.addColorStop(0.85, '#E0E0E0');
  chromeBorder.addColorStop(1, '#FFFFFF');

  ctx.strokeStyle = chromeBorder;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 15;
  ctx.strokeRect(12, 12, width - 24, height - 24);

  // Inner reflective line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(25, 25, width - 50, height - 50);

  // Corner chrome accents
  drawChromeCorners(ctx, width, height);
}

/**
 * Draw chrome corner accents
 */
function drawChromeCorners(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 3;
  
  const cornerSize = 35;

  // Chrome corner design (angled)
  // Top-left
  ctx.beginPath();
  ctx.moveTo(20, 20 + cornerSize);
  ctx.lineTo(20, 20);
  ctx.lineTo(20 + cornerSize, 20);
  ctx.stroke();

  // Top-right
  ctx.beginPath();
  ctx.moveTo(width - 20 - cornerSize, 20);
  ctx.lineTo(width - 20, 20);
  ctx.lineTo(width - 20, 20 + cornerSize);
  ctx.stroke();

  // Bottom-left
  ctx.beginPath();
  ctx.moveTo(20, height - 20 - cornerSize);
  ctx.lineTo(20, height - 20);
  ctx.lineTo(20 + cornerSize, height - 20);
  ctx.stroke();

  // Bottom-right
  ctx.beginPath();
  ctx.moveTo(width - 20 - cornerSize, height - 20);
  ctx.lineTo(width - 20, height - 20);
  ctx.lineTo(width - 20, height - 20 - cornerSize);
  ctx.stroke();
}

/**
 * Add light sources for reflection
 */
function addLightSources(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Add lens flare effects
  const flares = [
    { x: width * 0.25, y: height * 0.25, size: 15 },
    { x: width * 0.75, y: height * 0.3, size: 12 },
    { x: width * 0.35, y: height * 0.7, size: 10 },
    { x: width * 0.65, y: height * 0.65, size: 8 }
  ];

  flares.forEach(flare => {
    const gradient = ctx.createRadialGradient(
      flare.x, flare.y, 0,
      flare.x, flare.y, flare.size * 3
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(flare.x, flare.y, flare.size * 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add chrome surface imperfections (subtle scratches/dust)
 */
function addChromeImperfections(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;

  // Add subtle scratches
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 0.5;
  
  for (let i = 0; i < 20; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const length = 10 + Math.random() * 30;
    const angle = Math.random() * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Add dust particles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 1.5;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Alternative: Simple chrome logo
 */
async function generateSimpleChromeLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background for contrast
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Chrome gradient text (high contrast)
  const gradient = ctx.createLinearGradient(0, 40, 0, 260);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.2, '#E0E0E0');
  gradient.addColorStop(0.4, '#A0A0A0');
  gradient.addColorStop(0.6, '#606060');
  gradient.addColorStop(0.8, '#A0A0A0');
  gradient.addColorStop(1, '#E0E0E0');

  ctx.font = 'bold 75px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Reflection effect
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 10;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Chrome border
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  return canvas.toBuffer('image/png');
}