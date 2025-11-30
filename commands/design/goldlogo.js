import { createCanvas } from 'canvas';

export default {
  name: "goldlogo",
  description: "Create luxurious gold style text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💰 *Gold Logo*\n\nUsage: ${global.prefix}goldlogo <text>\n\n*Example:*\n${global.prefix}goldlogo WOLF\n${global.prefix}goldlogo ROYAL\n${global.prefix}goldlogo LUXURY` 
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
        text: `💰 Generating gold logo for: "${text}"...` 
      }, { quoted: m });

      // Generate gold logo locally
      const logoBuffer = await generateGoldLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💰 *Gold Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [GOLDLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating gold logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate luxurious gold logo using canvas
 */
async function generateGoldLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create luxurious dark background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, width, height);

  // Add elegant background pattern
  drawLuxuryBackground(ctx, width, height);

  // Create gold gradient for text
  const goldGradient = ctx.createLinearGradient(0, 100, 0, 300);
  goldGradient.addColorStop(0, '#FFD700');    // Gold
  goldGradient.addColorStop(0.3, '#FFEC8B');  // Light Goldenrod
  goldGradient.addColorStop(0.5, '#DAA520');  // Goldenrod
  goldGradient.addColorStop(0.7, '#B8860B');  // Dark Goldenrod
  goldGradient.addColorStop(1, '#8B7500');    // Dark Gold

  // Main text with gold effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Text shadow for 3D effect
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;

  // Draw text with gold gradient
  ctx.fillStyle = goldGradient;
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Add inner highlight for metallic effect
  ctx.shadowColor = 'transparent';
  const highlightGradient = ctx.createLinearGradient(0, 150, 0, 200);
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');
  
  ctx.fillStyle = highlightGradient;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillText(text.toUpperCase(), width / 2, height / 2 - 2);
  ctx.globalCompositeOperation = 'source-over';

  // Add gold border with embossed effect
  drawGoldBorder(ctx, width, height);

  // Add luxury elements
  addLuxuryElements(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw luxury background pattern
 */
function drawLuxuryBackground(ctx, width, height) {
  // Create subtle radial gradient
  const radialGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, width / 2
  );
  radialGradient.addColorStop(0, '#2a2a2a');
  radialGradient.addColorStop(1, '#1a1a1a');
  
  ctx.fillStyle = radialGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle pattern
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
  ctx.lineWidth = 1;
  
  // Diagonal lines pattern
  for (let i = -width; i < width * 2; i += 20) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.stroke();
  }

  // Add corner decorations
  drawCornerDecorations(ctx, width, height);
}

/**
 * Draw decorative gold border
 */
function drawGoldBorder(ctx, width, height) {
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#FFD700');
  borderGradient.addColorStop(0.5, '#DAA520');
  borderGradient.addColorStop(1, '#FFD700');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 15;
  
  // Main border
  ctx.strokeRect(20, 20, width - 40, height - 40);
  
  // Inner border
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(30, 30, width - 60, height - 60);
}

/**
 * Add luxury decorative elements
 */
function addLuxuryElements(ctx, width, height) {
  // Add sparkle effects
  ctx.fillStyle = '#FFD700';
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 10;
  
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  ctx.shadowBlur = 0;
}

/**
 * Draw corner decorations
 */
function drawCornerDecorations(ctx, width, height) {
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.3)';
  ctx.lineWidth = 2;
  
  const cornerSize = 30;
  
  // Top-left corner
  ctx.beginPath();
  ctx.moveTo(20, 20 + cornerSize);
  ctx.lineTo(20, 20);
  ctx.lineTo(20 + cornerSize, 20);
  ctx.stroke();
  
  // Top-right corner
  ctx.beginPath();
  ctx.moveTo(width - 20 - cornerSize, 20);
  ctx.lineTo(width - 20, 20);
  ctx.lineTo(width - 20, 20 + cornerSize);
  ctx.stroke();
  
  // Bottom-left corner
  ctx.beginPath();
  ctx.moveTo(20, height - 20 - cornerSize);
  ctx.lineTo(20, height - 20);
  ctx.lineTo(20 + cornerSize, height - 20);
  ctx.stroke();
  
  // Bottom-right corner
  ctx.beginPath();
  ctx.moveTo(width - 20 - cornerSize, height - 20);
  ctx.lineTo(width - 20, height - 20);
  ctx.lineTo(width - 20, height - 20 - cornerSize);
  ctx.stroke();
}

/**
 * Alternative simple gold logo
 */
async function generateSimpleGoldLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, width, height);

  // Gold gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#FFD700');
  gradient.addColorStop(0.5, '#DAA520');
  gradient.addColorStop(1, '#B8860B');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text shadow
  ctx.shadowColor = '#000000';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 3;
  ctx.shadowOffsetY = 3;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Simple border
  ctx.strokeStyle = '#FFD700';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  return canvas.toBuffer('image/png');
}