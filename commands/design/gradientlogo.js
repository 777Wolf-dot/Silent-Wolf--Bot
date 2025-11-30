import { createCanvas } from 'canvas';

export default {
  name: "gradientlogo",
  description: "Create beautiful gradient style text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🌈 *Gradient Logo*\n\nUsage: gradientlogo <text>\n\n*Example:*\ngradientlogo WOLF\ngradientlogo GRADIENT\ngradientlogo COLORFUL` 
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
        text: `🌈 Generating gradient logo for: "${text}"...` 
      }, { quoted: m });

      // Generate gradient logo locally
      const logoBuffer = await generateGradientLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🌈 *Gradient Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [GRADIENTLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating gradient logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate beautiful gradient logo using canvas
 */
async function generateGradientLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Generate random gradient colors
  const gradientColors = getRandomGradientColors();
  
  // Create background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, gradientColors[0]);
  bgGradient.addColorStop(0.5, gradientColors[1]);
  bgGradient.addColorStop(1, gradientColors[2]);

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern overlay
  addPatternOverlay(ctx, width, height);

  // Create text gradient (complementary to background)
  const textGradient = ctx.createLinearGradient(0, 150, 0, 250);
  textGradient.addColorStop(0, getContrastColor(gradientColors[0]));
  textGradient.addColorStop(0.5, getContrastColor(gradientColors[1]));
  textGradient.addColorStop(1, getContrastColor(gradientColors[2]));

  // Main text with gradient effect
  ctx.font = 'bold 80px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow for depth
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Draw gradient text
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Add text outline for better readability
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), width / 2, height / 2);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Add modern border
  drawModernBorder(ctx, width, height, gradientColors);

  // Add floating particles
  addFloatingParticles(ctx, width, height, gradientColors);

  return canvas.toBuffer('image/png');
}

/**
 * Get random gradient color combinations
 */
function getRandomGradientColors() {
  const gradients = [
    ['#667eea', '#764ba2', '#f093fb'], // Purple to Pink
    ['#4facfe', '#00f2fe', '#43e97b'], // Blue to Green
    ['#fa709a', '#fee140', '#ff6b6b'], // Pink to Yellow to Red
    ['#a8edea', '#fed6e3', '#a8edea'], // Pastel Blue to Pink
    ['#ff9a9e', '#fecfef', '#fecfef'], // Coral to Pink
    ['#a1c4fd', '#c2e9fb', '#a1c4fd'], // Light Blue
    ['#d4fc79', '#96e6a1', '#d4fc79'], // Green to Light Green
    ['#fad0c4', '#ffd1ff', '#fad0c4'], // Peach to Pink
    ['#ffecd2', '#fcb69f', '#ffecd2'], // Orange to Peach
    ['#a3bded', '#6991c7', '#a3bded'], // Blue to Dark Blue
    ['#ff9a8b', '#ff6a88', '#ff99ac'], // Red to Pink
    ['#cd9cf2', '#f6f3ff', '#cd9cf2'], // Purple to White
    ['#6a11cb', '#2575fc', '#6a11cb'], // Deep Purple to Blue
    ['#ff8177', '#ff867a', '#ff8c7f'], // Coral Gradient
    ['#74ebd5', '#9face6', '#74ebd5']  // Teal to Purple
  ];

  return gradients[Math.floor(Math.random() * gradients.length)];
}

/**
 * Get contrasting text color for readability
 */
function getContrastColor(hexColor) {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
}

/**
 * Add subtle pattern overlay
 */
function addPatternOverlay(ctx, width, height) {
  ctx.globalAlpha = 0.1;
  
  // Create geometric pattern
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  
  // Diagonal lines
  for (let i = -width; i < width * 2; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }
  
  // Reverse diagonal lines
  for (let i = -width; i < width * 2; i += 25) {
    ctx.beginPath();
    ctx.moveTo(i, height);
    ctx.lineTo(i + height, 0);
    ctx.stroke();
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Draw modern border with gradient
 */
function drawModernBorder(ctx, width, height, colors) {
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, colors[0]);
  borderGradient.addColorStop(0.5, colors[1]);
  borderGradient.addColorStop(1, colors[2]);

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 6;
  ctx.shadowColor = colors[1];
  ctx.shadowBlur = 10;
  
  // Main border
  ctx.strokeRect(15, 15, width - 30, height - 30);
  
  // Inner subtle border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(25, 25, width - 50, height - 50);
}

/**
 * Add floating particles for dynamic effect
 */
function addFloatingParticles(ctx, width, height, colors) {
  ctx.globalAlpha = 0.6;
  
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 4 + 1;
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    ctx.fillStyle = colors[colorIndex];
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Alternative: Custom gradient with specific colors
 */
async function generateCustomGradientLogo(text, color1, color2, color3) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Custom gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, color1 || '#667eea');
  bgGradient.addColorStop(0.5, color2 || '#764ba2');
  bgGradient.addColorStop(1, color3 || '#f093fb');

  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Text with contrasting color
  ctx.font = 'bold 80px "Arial"';
  ctx.fillStyle = getContrastColor(color1);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = 10;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  return canvas.toBuffer('image/png');
}