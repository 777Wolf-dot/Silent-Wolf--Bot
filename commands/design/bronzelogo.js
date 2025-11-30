import { createCanvas } from 'canvas';

export default {
  name: "bronzelogo",
  description: "Create authentic bronze metallic text logos with patina effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🟫 *Bronze Logo*\n\nUsage: bronzelogo <text>\n\n*Example:*\nbronzelogo WOLF\nbronzelogo BRONZE\nbronzelogo ANCIENT` 
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
        text: `🟫 Generating bronze logo for: "${text}"...` 
      }, { quoted: m });

      // Generate bronze logo
      const logoBuffer = await generateBronzeLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🟫 *Bronze Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [BRONZELOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating bronze logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate authentic bronze metallic logo with patina
 */
async function generateBronzeLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create aged parchment-like background
  ctx.fillStyle = '#2a1e0f';
  ctx.fillRect(0, 0, width, height);

  // Add antique background texture
  drawAntiqueBackground(ctx, width, height);

  // Create realistic bronze gradient (warm brown-copper tones)
  const bronzeGradient = ctx.createLinearGradient(0, 100, 0, 300);
  bronzeGradient.addColorStop(0, '#CD7F32');    // Bright bronze
  bronzeGradient.addColorStop(0.15, '#B87333'); // Classic bronze
  bronzeGradient.addColorStop(0.3, '#A65A29');  // Medium bronze
  bronzeGradient.addColorStop(0.45, '#8B4513'); // Saddle brown bronze
  bronzeGradient.addColorStop(0.6, '#654321');  // Dark bronze
  bronzeGradient.addColorStop(0.75, '#5D4037'); // Brown shadow
  bronzeGradient.addColorStop(0.9, '#4E342E');  // Dark shadow
  bronzeGradient.addColorStop(1, '#3E2723');    // Deep shadow

  // Main text with aged bronze effect
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Create weathered bronze 3D effect
  createBronze3DEffect(ctx, text, width, height, bronzeGradient);

  // Add bronze patina and oxidation
  addBronzePatina(ctx, text, width, height);

  // Add metallic highlights
  addBronzeHighlights(ctx, text, width, height);

  // Add aged border
  drawAgedBorder(ctx, width, height);

  // Add texture and weathering
  addBronzeTexture(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Draw antique background texture
 */
function drawAntiqueBackground(ctx, width, height) {
  // Create aged paper texture
  const paperGradient = ctx.createLinearGradient(0, 0, width, height);
  paperGradient.addColorStop(0, '#3a2c1a');
  paperGradient.addColorStop(0.5, '#2a1e0f');
  paperGradient.addColorStop(1, '#1a140a');
  
  ctx.fillStyle = paperGradient;
  ctx.fillRect(0, 0, width, height);

  // Add paper fiber texture
  ctx.strokeStyle = 'rgba(90, 70, 40, 0.1)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const length = 20 + Math.random() * 50;
    const angle = Math.random() * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
    ctx.stroke();
  }

  // Add aged spots and stains
  ctx.fillStyle = 'rgba(60, 45, 20, 0.3)';
  for (let i = 0; i < 30; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 5 + Math.random() * 15;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Create weathered bronze 3D effect
 */
function createBronze3DEffect(ctx, text, width, height, bronzeGradient) {
  const centerX = width / 2;
  const centerY = height / 2;
  const depth = 8;

  // Deep shadow layers for aged look
  for (let i = depth; i > 0; i--) {
    const offset = i * 1.5;
    const alpha = 0.08 + (i / depth) * 0.25;
    const brownTone = 30 - i * 3;
    
    ctx.fillStyle = `rgba(${brownTone}, ${brownTone - 10}, ${brownTone - 20}, ${alpha})`;
    ctx.fillText(text.toUpperCase(), centerX + offset, centerY + offset);
  }

  // Main bronze text
  ctx.fillStyle = bronzeGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Aged edge effect
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);
}

/**
 * Add bronze patina and oxidation effects
 */
function addBronzePatina(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Green patina (copper oxidation)
  const patinaGradient = ctx.createLinearGradient(
    centerX - 200, centerY + 30,
    centerX + 200, centerY - 20
  );
  patinaGradient.addColorStop(0, 'rgba(83, 130, 85, 0.3)');  // Verdigris green
  patinaGradient.addColorStop(0.3, 'rgba(67, 111, 77, 0.4)'); // Aged green
  patinaGradient.addColorStop(0.6, 'rgba(53, 94, 59, 0.3)');  // Dark patina
  patinaGradient.addColorStop(1, 'transparent');

  ctx.globalCompositeOperation = 'overlay';
  ctx.fillStyle = patinaGradient;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Blue patina spots (copper carbonate)
  ctx.globalCompositeOperation = 'source-over';
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  
  const patinaSpots = [
    { x: -0.35, y: 0.2, size: 8, alpha: 0.4 },
    { x: -0.15, y: -0.1, size: 6, alpha: 0.3 },
    { x: 0.1, y: 0.3, size: 10, alpha: 0.5 },
    { x: 0.3, y: -0.2, size: 7, alpha: 0.4 },
    { x: 0.4, y: 0.1, size: 5, alpha: 0.3 }
  ];

  patinaSpots.forEach(spot => {
    const x = centerX + (spot.x * textWidth / 2);
    const y = centerY + (spot.y * 40);
    
    // Verdigris blue-green color
    ctx.fillStyle = `rgba(64, 130, 109, ${spot.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, spot.size, 0, Math.PI * 2);
    ctx.fill();

    // Add texture to patina spots
    ctx.fillStyle = `rgba(83, 150, 120, ${spot.alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(x - spot.size * 0.3, y - spot.size * 0.3, spot.size * 0.5, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add bronze metallic highlights
 */
function addBronzeHighlights(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.save();

  // Warm bronze highlights
  const highlightGradient = ctx.createLinearGradient(
    centerX - 250, centerY - 50,
    centerX + 250, centerY - 10
  );
  highlightGradient.addColorStop(0, 'rgba(255, 215, 0, 0.4)');  // Gold highlight
  highlightGradient.addColorStop(0.3, 'rgba(255, 200, 100, 0.3)'); // Warm bronze
  highlightGradient.addColorStop(0.6, 'rgba(205, 170, 80, 0.2)');  // Medium bronze
  highlightGradient.addColorStop(1, 'transparent');

  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = highlightGradient;
  ctx.font = 'bold 84px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text.toUpperCase(), centerX, centerY - 2);

  // Reset for specular highlights
  ctx.globalCompositeOperation = 'source-over';
  
  // Add worn metal highlights
  const textWidth = ctx.measureText(text.toUpperCase()).width;
  const highlightPoints = [
    { x: -0.3, y: -0.35, size: 4, alpha: 0.6 },
    { x: -0.1, y: -0.4, size: 5, alpha: 0.7 },
    { x: 0.15, y: -0.35, size: 3, alpha: 0.5 },
    { x: 0.35, y: -0.3, size: 4, alpha: 0.6 }
  ];

  highlightPoints.forEach(point => {
    const x = centerX + (point.x * textWidth / 2);
    const y = centerY + (point.y * 45);
    
    ctx.fillStyle = `rgba(255, 230, 150, ${point.alpha})`;
    ctx.beginPath();
    ctx.arc(x, y, point.size, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Draw aged bronze border
 */
function drawAgedBorder(ctx, width, height) {
  // Outer bronze border
  const borderGradient = ctx.createLinearGradient(0, 0, width, height);
  borderGradient.addColorStop(0, '#CD7F32');
  borderGradient.addColorStop(0.3, '#B87333');
  borderGradient.addColorStop(0.5, '#8B4513');
  borderGradient.addColorStop(0.7, '#B87333');
  borderGradient.addColorStop(1, '#CD7F32');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 8;
  ctx.shadowColor = 'rgba(139, 69, 19, 0.5)';
  ctx.shadowBlur = 15;
  ctx.strokeRect(18, 18, width - 36, height - 36);

  // Inner aged line
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
  ctx.lineWidth = 2;
  ctx.shadowBlur = 0;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Add corner rivets (common in bronze work)
  drawBronzeRivets(ctx, width, height);
}

/**
 * Draw bronze rivets at corners
 */
function drawBronzeRivets(ctx, width, height) {
  ctx.fillStyle = '#B87333';
  
  const rivetPositions = [
    { x: 30, y: 30 },
    { x: width - 30, y: 30 },
    { x: 30, y: height - 30 },
    { x: width - 30, y: height - 30 }
  ];

  rivetPositions.forEach(pos => {
    // Rivet base
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();

    // Rivet highlight
    ctx.fillStyle = 'rgba(255, 215, 0, 0.6)';
    ctx.beginPath();
    ctx.arc(pos.x - 2, pos.y - 2, 2, 0, Math.PI * 2);
    ctx.fill();

    // Reset color
    ctx.fillStyle = '#B87333';
  });
}

/**
 * Add bronze texture and weathering
 */
function addBronzeTexture(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Add casting texture (bronze is often cast)
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 0.5 + Math.random() * 2;
    
    ctx.fillStyle = `rgba(${180 + Math.random() * 40}, ${120 + Math.random() * 30}, ${50 + Math.random() * 20}, 0.8)`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Add scratches and wear marks
  ctx.strokeStyle = 'rgba(139, 69, 19, 0.4)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 30; i++) {
    const x1 = Math.random() * width;
    const y1 = Math.random() * height;
    const length = 10 + Math.random() * 40;
    const angle = Math.random() * Math.PI;
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x1 + Math.cos(angle) * length, y1 + Math.sin(angle) * length);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Alternative: Simple bronze logo
 */
async function generateSimpleBronzeLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Aged background
  ctx.fillStyle = '#2a1e0f';
  ctx.fillRect(0, 0, width, height);

  // Bronze gradient text
  const gradient = ctx.createLinearGradient(0, 50, 0, 250);
  gradient.addColorStop(0, '#CD7F32');
  gradient.addColorStop(0.4, '#B87333');
  gradient.addColorStop(0.7, '#8B4513');
  gradient.addColorStop(1, '#654321');

  ctx.font = 'bold 70px Arial';
  ctx.fillStyle = gradient;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Aged shadow
  ctx.shadowColor = 'rgba(139, 69, 19, 0.5)';
  ctx.shadowBlur = 15;
  ctx.shadowOffsetX = 4;
  ctx.shadowOffsetY = 4;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Bronze border
  ctx.strokeStyle = '#B87333';
  ctx.lineWidth = 5;
  ctx.strokeRect(15, 15, width - 30, height - 30);

  return canvas.toBuffer('image/png');
}