import { createCanvas } from 'canvas';

export default {
  name: "silverlogo",
  description: "Create realistic silver metallic text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `⚪ *Silver Logo*\n\nUsage: silverlogo <text>\n\n*Example:*\nsilverlogo WOLF\nsilverlogo SILVER\nsilverlogo PREMIUM` 
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
        text: `⚪ Generating silver logo for: "${text}"...` 
      }, { quoted: m });

      // Generate silver logo
      const logoBuffer = await generateSilverLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `⚪ *Silver Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [SILVERLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating silver logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate realistic silver metallic logo
 */
async function generateSilverLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create elegant dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Add subtle background texture
  drawSilverBackground(ctx, width, height);

  // Create realistic silver gradient
  const silverGradient = ctx.createLinearGradient(0, 100, 0, 300);
  silverGradient.addColorStop(0, '#F8F8F8');    // Bright silver
  silverGradient.addColorStop(0.15, '#E8E8E8'); // Light silver
  silverGradient.addColorStop(0.3, '#C0C0C0');  // Pure silver
  silverGradient.addColorStop(0.5, '#A8A8A8');  // Medium silver
  silverGradient.addColorStop(0.7, '#909090');  // Dark silver
  silverGradient.addColorStop(0.85, '#787878'); // Shadow silver
  silverGradient.addColorStop(1, '#606060');    // Dark shadow

  // Main text with 3D metallic effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create multiple layers for realistic 3D effect
  createSilver3DEffect(ctx, text, width, height, silverGradient);

  // Add metallic highlights and reflections
  addMetallicHighlights(ctx, text, width, height);

  // Add chrome border
  drawChromeBorder(ctx, width, height);

  // Add reflection effect
  addReflection(ctx, text, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw sophisticated silver background
 */
function drawSilverBackground(ctx, width, height) {
  // Create radial gradient for depth
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  radialGradient.addColorStop(0, '#2a2a2a');
  radialGradient.addColorStop(0.6, '#1a1a1a');
  radialGradient.addColorStop(1, '#0a0a0a');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle brushed metal texture
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.lineWidth = 1;
  
  // Brushed metal lines
  for (let i = -height; i < width + height; i += 4) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Add corner accents
  drawCornerAccents(ctx, width, height);
}

/**
 * Create realistic 3D silver effect
 */
function createSilver3DEffect(ctx, text, width, height, silverGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 8;

  // Shadow layers for 3D depth
  for (let i = depth; i > 0; i--) {
    const offset = i;
    const alpha = 0.1 + (i / depth) * 0.3;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main silver text
  ctx.fillStyle = silverGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner bevel effect
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add realistic metallic highlights
 */
function addMetallicHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();
  
  // Create highlight gradient
  const highlightGradient = ctx.createLinearGradient(
    centerX - 200, centerY - 50,
    centerX + 200, centerY - 20
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.4)');
  highlightGradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
  highlightGradient.addColorStop(1, 'transparent');

  // Apply highlight with screen blend mode
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = highlightGradient;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Reset composite operation
  ctx.globalCompositeOperation = 'source-over';

  // Add specular highlights
  ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.globalAlpha = 0.3;
  
  // Small highlight dots on curves
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  for (let i = 0; i < 5; i++) {
    const x = centerX - textWidth / 2 + Math.random() * textWidth;
    const y = centerY - 40 + Math.random() * 20;
    const size = Math.random() * 3 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw chrome border
 */
function drawChromeBorder(ctx, width, height) {
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#E8E8E8');
  borderGradient.addColorStop(0.3, '#C0C0C0');
  borderGradient.addColorStop(0.5, '#A8A8A8');
  borderGradient.addColorStop(0.7, '#C0C0C0');
  borderGradient.addColorStop(1, '#E8E8E8');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 6;
  ctx.shadowColor = '#C0C0C0';
  ctx.shadowBlur = 15;
  
  // Main border
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(30, 30, width - 60, height - 60);
}

/**
 * Add reflection effect
 */
function addReflection(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  
  ctx.save();
  
  // Create reflection transformation
  ctx.translate(centerX, centerY);
  ctx.scale(1, -0.3);
  ctx.translate(-centerX, -centerY);
  
  // Reflection gradient fade
  const reflectionGradient = ctx.createLinearGradient(0, centerY, 0, height);
  reflectionGradient.addColorStop(0, 'rgba(192, 192, 192, 0.3)');
  reflectionGradient.addColorStop(0.5, 'rgba(192, 192, 192, 0.1)');
  reflectionGradient.addColorStop(1, 'transparent');
  
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = reflectionGradient;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);
  
  ctx.restore();
}

/**
 * Draw corner accents
 */
function drawCornerAccents(ctx, width, height) {
  ctx.strokeStyle = 'rgba(192, 192, 192, 0.3)';
  ctx.lineWidth = 2;
  
  const cornerSize = 25;
  
  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(25, 25 + cornerSize);
  ctx.lineTo(25, 25);
  ctx.lineTo(25 + cornerSize, 25);
  ctx.stroke();
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(width - 25 - cornerSize, 25);
  ctx.lineTo(width - 25, 25);
  ctx.lineTo(width - 25, 25 + cornerSize);
  ctx.stroke();
  
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(25, height - 25 - cornerSize);
  ctx.lineTo(25, height - 25);
  ctx.lineTo(25 + cornerSize, height - 25);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(width - 25 - cornerSize, height - 25);
  ctx.lineTo(width - 25, height - 25);
  ctx.lineTo(width - 25, height - 25 - cornerSize);
  ctx.stroke();
}

/**
 * Alternative: Simple silver logo for quick generation
 */
async function generateSimpleSilverLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Silver gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.3, '#E0E0E0');
  gradient.addColorStop(0.6, '#C0C0C0');
  gradient.addColorStop(1, '#A0A0A0');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text shadow for depth
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Simple border
  ctx.strokeStyle = '#C0C0C0';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  return canvas.toBuffer('image/png');
}