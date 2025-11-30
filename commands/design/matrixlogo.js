import { createCanvas } from 'canvas';

export default {
  name: "matrixlogo",
  description: "Create Matrix-style digital rain text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `🟢 *Matrix Logo*\n\nUsage: matrixlogo <text>\n\n*Example:*\nmatrixlogo WOLF\nmatrixlogo MATRIX\nmatrixlogo NEO` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      
      if (text.length > 12) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Please use maximum 12 characters.\n\nYour text: "${text}" (${text.length} characters)` 
        }, { quoted: m });
        return;
      }

      // Send waiting message
      await sock.sendMessage(jid, { 
        text: `🟢 Generating Matrix logo for: "${text}"...` 
      }, { quoted: m });

      // Generate matrix logo
      const logoBuffer = await generateMatrixLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🟢 *Matrix Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [MATRIXLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating Matrix logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate Matrix-style digital rain logo
 */
async function generateMatrixLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Generate digital rain effect
  generateDigitalRain(ctx, width, height);

  // Create Matrix-style text with digital effects
  createMatrixText(ctx, text, width, height);

  // Add scan lines and digital artifacts
  addMatrixEffects(ctx, width, height);

  // Add binary code background
  addBinaryBackground(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Generate the iconic digital rain effect
 */
function generateDigitalRain(ctx, width, height) {
  const columns = Math.floor(width / 20);
  const drops = Array(columns).fill(1);
  
  // Create multiple layers of digital rain
  for (let layer = 0; layer < 3; layer++) {
    const speed = 2 + layer;
    const charSize = 12 - layer * 2;
    const brightness = 0.3 + layer * 0.2;
    
    ctx.font = `${charSize}px "Courier New", monospace`;
    
    for (let i = 0; i < drops.length; i++) {
      // Random characters (Katakana, numbers, symbols)
      const chars = 'ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ0123456789#$%&@*';
      const char = chars[Math.floor(Math.random() * chars.length)];
      
      const x = i * 20;
      const y = drops[i] * charSize;
      
      // Fading effect - characters get brighter as they "fall"
      const distanceFromTop = (y / height);
      const alpha = brightness * (1 - distanceFromTop);
      
      // Green color with varying brightness
      const greenValue = Math.floor(100 + 155 * (1 - distanceFromTop));
      ctx.fillStyle = `rgba(0, ${greenValue}, 0, ${alpha})`;
      
      ctx.fillText(char, x, y);
      
      // Reset drop when it reaches bottom or randomly
      if (y > height && Math.random() > 0.975) {
        drops[i] = 0;
      }
      
      drops[i]++;
    }
  }
}

/**
 * Create Matrix-style text with digital glitch effects
 */
function createMatrixText(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Create multiple layers for digital effect
  for (let layer = 0; layer < 5; layer++) {
    const offsetX = (Math.random() - 0.5) * 4;
    const offsetY = (Math.random() - 0.5) * 4;
    const alpha = 0.1 + (layer * 0.1);
    
    // Different green shades for each layer
    const greenShades = ['#00FF00', '#00CC00', '#009900', '#00FF66', '#66FF00'];
    ctx.fillStyle = `${greenShades[layer]}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`;
    
    ctx.font = 'bold 70px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(text.toUpperCase(), centerX + offsetX, centerY + offsetY);
  }

  // Main text with bright green glow
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 72px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Digital glow effect
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 20;
  ctx.fillText(text.toUpperCase(), centerX, centerY);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Add digital artifacts around text
  addTextGlitches(ctx, text, width, height);
}

/**
 * Add digital glitches and artifacts around text
 */
function addTextGlitches(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const textWidth = ctx.measureText(text.toUpperCase()).width;

  ctx.save();
  
  // Digital corruption effects
  for (let i = 0; i < 15; i++) {
    const x = centerX - textWidth / 2 + Math.random() * textWidth;
    const y = centerY - 35 + Math.random() * 70;
    const width = 2 + Math.random() * 8;
    const height = 1 + Math.random() * 3;
    const alpha = 0.3 + Math.random() * 0.7;
    
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    ctx.fillRect(x, y, width, height);
  }

  // Binary code streaming from text
  const binaryChars = '01';
  for (let i = 0; i < 8; i++) {
    const startX = centerX - textWidth / 2 + Math.random() * textWidth;
    const startY = centerY + 40;
    const length = 10 + Math.floor(Math.random() * 20);
    const speed = 2 + Math.random() * 3;
    
    ctx.font = '12px "Courier New", monospace';
    ctx.fillStyle = '#00FF00';
    
    for (let j = 0; j < length; j++) {
      const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
      const alpha = 1 - (j / length);
      ctx.globalAlpha = alpha;
      ctx.fillText(char, startX, startY + (j * speed));
    }
    ctx.globalAlpha = 1.0;
  }

  ctx.restore();
}

/**
 * Add Matrix visual effects (scan lines, etc.)
 */
function addMatrixEffects(ctx, width, height) {
  // Scan lines
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.lineWidth = 1;
  
  for (let y = 0; y < height; y += 4) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Digital static
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2;
    const alpha = 0.1 + Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    ctx.fillRect(x, y, size, size);
  }

  // Screen flicker effect
  for (let i = 0; i < 5; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const w = 50 + Math.random() * 100;
    const h = 2 + Math.random() * 5;
    const alpha = 0.05 + Math.random() * 0.1;
    
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.fillRect(x, y, w, h);
  }
}

/**
 * Add binary code background pattern
 */
function addBinaryBackground(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#00FF00';
  
  const binaryChars = '01';
  const columns = Math.floor(width / 15);
  const rows = Math.floor(height / 15);
  
  for (let x = 0; x < columns; x++) {
    for (let y = 0; y < rows; y++) {
      // Only place some binary characters randomly
      if (Math.random() > 0.7) {
        const char = binaryChars[Math.floor(Math.random() * binaryChars.length)];
        ctx.fillText(char, x * 15, y * 15);
      }
    }
  }
  ctx.restore();
}

/**
 * Alternative: Simple Matrix logo
 */
async function generateSimpleMatrixLogo(text) {
  const width = 600;
  const height = 300;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Black background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  // Simple digital rain
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const alpha = 0.1 + Math.random() * 0.3;
    
    ctx.fillStyle = `rgba(0, 255, 0, ${alpha})`;
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(Math.random() > 0.5 ? '0' : '1', x, y);
  }

  // Matrix text
  ctx.fillStyle = '#00FF00';
  ctx.font = 'bold 60px "Courier New", monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Glow effect
  ctx.shadowColor = '#00FF00';
  ctx.shadowBlur = 15;
  
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);
  

  // Scan lines
  ctx.strokeStyle = 'rgba(0, 255, 0, 0.1)';
  ctx.lineWidth = 1;
  for (let y = 0; y < height; y += 3) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  return canvas.toBuffer('image/png');
}