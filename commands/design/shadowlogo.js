import { createCanvas } from 'canvas';

export default {
  name: "shadowlogo",
  description: "Create logos with dramatic shadow and 3D effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `👻 *Shadow Logo*\n\nUsage: shadowlogo <text>\n\n*Example:*\nshadowlogo WOLF\nshadowlogo SHADOW\nshadowlogo DARK` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ").toUpperCase();
      
      if (text.length > 12) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Max 12 characters.\nYour text: "${text}" (${text.length} chars)` 
        }, { quoted: m });
        return;
      }

      await sock.sendMessage(jid, { 
        text: `👻 Creating shadow logo for: "${text}"...` 
      }, { quoted: m });

      const logoBuffer = await generateShadowLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `👻 *Shadow Logo Generated!*\nText: ${text}\n\n⚡ With dramatic 3D shadow effects!`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [SHADOWLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating shadow logo: ${error.message}` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate logo with dramatic shadow effects
 */
async function generateShadowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create gradient background
  const bgGradient = ctx.createLinearGradient(0, 0, width, height);
  bgGradient.addColorStop(0, '#1a1a2e');
  bgGradient.addColorStop(0.5, '#16213e');
  bgGradient.addColorStop(1, '#0f3460');
  
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Add subtle texture to background
  addBackgroundTexture(ctx, width, height);

  // Create multiple shadow layers for 3D effect
  createShadowLayers(ctx, text, width, height);

  // Add main text with glow
  drawMainText(ctx, text, width, height);

  // Add floating shadow particles
  addShadowParticles(ctx, width, height);

  // Add light source effects
  addLightSource(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Add subtle background texture
 */
function addBackgroundTexture(ctx, width, height) {
  ctx.globalAlpha = 0.03;
  
  // Create noise texture
  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 2 + 0.5;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x, y, size, size);
  }
  
  ctx.globalAlpha = 1.0;

  // Add vignette effect
  const vignette = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) / 2
  );
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(0.7, 'transparent');
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
  
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Create multiple shadow layers for 3D depth
 */
function createShadowLayers(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const shadowLayers = 15;
  const maxOffset = 20;

  for (let i = shadowLayers; i > 0; i--) {
    const offset = (i / shadowLayers) * maxOffset;
    const alpha = 0.1 + (i / shadowLayers) * 0.3;
    
    ctx.save();
    ctx.translate(centerX + offset, centerY + offset);
    
    // Darker shadow for deeper layers
    const darkness = 1 - (i / shadowLayers);
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha * darkness})`;
    ctx.font = 'bold 80px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }

  // Add blurry shadow underneath
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 30;
  ctx.shadowOffsetX = 15;
  ctx.shadowOffsetY = 15;
  
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX + 15, centerY + 15);
  
  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

/**
 * Draw main text with glow effect
 */
function drawMainText(ctx, text, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;

  // Inner glow effect
  ctx.shadowColor = 'rgba(255, 255, 255, 0.3)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetX = -2;
  ctx.shadowOffsetY = -2;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX - 2, centerY - 2);

  // Main text with metallic gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 200, centerY - 50,
    centerX + 200, centerY + 50
  );
  textGradient.addColorStop(0, '#e0e0e0');
  textGradient.addColorStop(0.2, '#b8b8b8');
  textGradient.addColorStop(0.5, '#909090');
  textGradient.addColorStop(0.8, '#686868');
  textGradient.addColorStop(1, '#404040');

  ctx.shadowColor = 'transparent';
  ctx.fillStyle = textGradient;
  ctx.fillText(text, centerX, centerY);

  // Text highlight
  const highlightGradient = ctx.createLinearGradient(
    centerX - 200, centerY - 50,
    centerX + 200, centerY - 30
  );
  highlightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
  highlightGradient.addColorStop(1, 'rgba(255, 255, 255, 0.2)');

  ctx.fillStyle = highlightGradient;
  ctx.globalCompositeOperation = 'screen';
  ctx.fillText(text, centerX, centerY);
  ctx.globalCompositeOperation = 'source-over';

  // Text outline
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.lineWidth = 1;
  ctx.strokeText(text, centerX, centerY);
}

/**
 * Add floating shadow particles
 */
function addShadowParticles(ctx, width, height) {
  ctx.globalAlpha = 0.6;
  
  // Large shadow wisps
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 100 + 50;
    
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.8)');
    gradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  // Small shadow particles
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  for (let i = 0; i < 50; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 8 + 2;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1.0;
}

/**
 * Add light source and reflections
 */
function addLightSource(ctx, width, height) {
  const lightX = width * 0.3;
  const lightY = height * 0.3;

  // Light glow
  const lightGradient = ctx.createRadialGradient(
    lightX, lightY, 0,
    lightX, lightY, 200
  );
  lightGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
  lightGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
  lightGradient.addColorStop(1, 'transparent');

  ctx.fillStyle = lightGradient;
  ctx.beginPath();
  ctx.arc(lightX, lightY, 200, 0, Math.PI * 2);
  ctx.fill();

  // Light rays
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.lineWidth = 1;
  
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const length = 300;
    
    ctx.beginPath();
    ctx.moveTo(lightX, lightY);
    ctx.lineTo(
      lightX + Math.cos(angle) * length,
      lightY + Math.sin(angle) * length
    );
    ctx.stroke();
  }
}

/**
 * Alternative: Deep shadow version
 */
async function generateDeepShadowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Dark background
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // Extreme shadow layers
  for (let i = 0; i < 25; i++) {
    const offset = i * 1.5;
    const alpha = 0.05 + (i / 25) * 0.2;
    
    ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
    ctx.font = 'bold 85px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, centerX + offset, centerY + offset);
  }

  // Main text with subtle glow
  ctx.shadowColor = 'rgba(255, 255, 255, 0.1)';
  ctx.shadowBlur = 15;
  ctx.fillStyle = '#666666';
  ctx.fillText(text, centerX, centerY);

  return canvas.toBuffer('image/png');
}

/**
 * Alternative: Floating shadow version
 */
async function generateFloatingShadowLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Light background for contrast
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#667eea');
  gradient.addColorStop(1, '#764ba2');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  const centerX = width / 2;
  const centerY = height / 2;

  // Floating shadow effect
  ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
  ctx.shadowBlur = 40;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 20;
  
  ctx.fillStyle = '#2c3e50';
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, centerX, centerY);

  // Main text floating above
  ctx.shadowColor = 'transparent';
  const textGradient = ctx.createLinearGradient(
    centerX - 200, centerY - 50,
    centerX + 200, centerY + 50
  );
  textGradient.addColorStop(0, '#ecf0f1');
  textGradient.addColorStop(1, '#bdc3c7');
  
  ctx.fillStyle = textGradient;
  ctx.fillText(text, centerX, centerY - 10);

  return canvas.toBuffer('image/png');
}