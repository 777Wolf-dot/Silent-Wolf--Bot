import { createCanvas } from 'canvas';

export default {
  name: "crystallogo",
  description: "Create stunning crystal text logos with gemstone and refractive effects",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (args.length === 0) {
        await sock.sendMessage(jid, { 
          text: `💎 *Crystal Logo*\n\nUsage: crystallogo <text>\n\n*Example:*\ncrystallogo CRYSTAL\ncrystallogo GEM\ncrystallogo DIAMOND` 
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
        text: `💎 Generating crystal logo for: "${text}"...` 
      }, { quoted: m });

      // Generate crystal logo
      const logoBuffer = await generateCrystalLogo(text);
      
      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `💎 *Crystal Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (error) {
      console.error("❌ [CRYSTALLOGO] ERROR:", error);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating crystal logo: ${error.message}\n\nPlease try again with shorter text.` 
      }, { quoted: m });
    }
  },
};

/**
 * Generate stunning crystal logo with gemstone effects
 */
async function generateCrystalLogo(text) {
  const width = 800;
  const height = 400;
  
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Create crystal cave background
  createCrystalCave(ctx, width, height);

  // Draw main crystal cluster
  const clusterX = width * 0.75;
  const clusterY = height * 0.6;
  drawCrystalCluster(ctx, clusterX, clusterY);

  // Add crystal light effects
  addCrystalLightBeams(ctx, clusterX, clusterY);
  addCrystalRefractions(ctx, width, height);

  // Create crystal text
  drawCrystalText(ctx, text, width, height);

  // Add floating crystal shards
  addFloatingShards(ctx, width, height);
  addCrystalDust(ctx, width, height);

  // Add gemstone effects
  addGemstoneHighlights(ctx, width, height);
  addRainbowRefractions(ctx, width, height);

  // Add border and signature
  drawCrystalBorder(ctx, width, height);
  addCrystalSignature(ctx, width, height);

  return canvas.toBuffer('image/png');
}

/**
 * Create crystal cave background
 */
function createCrystalCave(ctx, width, height) {
  // Deep crystal cave gradient
  const caveGradient = ctx.createLinearGradient(0, 0, 0, height);
  caveGradient.addColorStop(0, '#0a0a2a'); // Deep blue
  caveGradient.addColorStop(0.3, '#1a1a4a'); // Royal blue
  caveGradient.addColorStop(0.6, '#2d2d6a'); // Electric blue
  caveGradient.addColorStop(1, '#0a0a2a'); // Deep blue
  
  ctx.fillStyle = caveGradient;
  ctx.fillRect(0, 0, width, height);

  // Add crystal formations in background
  addBackgroundCrystals(ctx, width, height);

  // Add subtle geometric patterns
  addCrystalPatterns(ctx, width, height);
}

/**
 * Add background crystal formations
 */
function addBackgroundCrystals(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.3;

  // Large background crystals
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = height * 0.7 + Math.random() * height * 0.3;
    const size = 20 + Math.random() * 40;
    const hue = 200 + Math.random() * 160;
    
    drawBackgroundCrystal(ctx, x, y, size, hue);
  }

  ctx.restore();
}

/**
 * Draw individual background crystal
 */
function drawBackgroundCrystal(ctx, x, y, size, hue) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(Math.random() * Math.PI);

  // Crystal body
  const crystalGradient = ctx.createLinearGradient(-size, -size, size, size);
  crystalGradient.addColorStop(0, `hsla(${hue}, 80%, 50%, 0.4)`);
  crystalGradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, 0.6)`);
  crystalGradient.addColorStop(1, `hsla(${hue}, 80%, 50%, 0.4)`);
  
  ctx.fillStyle = crystalGradient;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.7, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.7, 0);
  ctx.closePath();
  ctx.fill();

  // Crystal facets
  ctx.strokeStyle = `hsla(${hue}, 100%, 80%, 0.6)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.7, 0);
  ctx.lineTo(size * 0.7, 0);
  ctx.stroke();

  ctx.restore();
}

/**
 * Add geometric crystal patterns
 */
function addCrystalPatterns(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.1;
  ctx.strokeStyle = 'rgba(100, 150, 255, 0.4)';
  ctx.lineWidth = 1;

  // Hexagonal grid pattern
  const hexSize = 30;
  for (let y = 0; y < height; y += hexSize * 1.5) {
    for (let x = 0; x < width; x += hexSize * 1.732) {
      drawHexagon(ctx, x + (y % (hexSize * 3) ? hexSize * 0.866 : 0), y, hexSize);
    }
  }

  ctx.restore();
}

/**
 * Draw hexagon pattern
 */
function drawHexagon(ctx, x, y, size) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const hexX = x + Math.cos(angle) * size;
    const hexY = y + Math.sin(angle) * size;
    
    if (i === 0) {
      ctx.moveTo(hexX, hexY);
    } else {
      ctx.lineTo(hexX, hexY);
    }
  }
  ctx.closePath();
  ctx.stroke();
}

/**
 * Draw main crystal cluster
 */
function drawCrystalCluster(ctx, centerX, centerY) {
  ctx.save();

  // Large central crystal
  drawMainCrystal(ctx, centerX, centerY - 30, 50, 220);

  // Surrounding smaller crystals
  const crystalPositions = [
    { x: -40, y: -10, size: 30, hue: 200, rotation: -0.3 },
    { x: 35, y: -15, size: 25, hue: 240, rotation: 0.2 },
    { x: -25, y: 40, size: 20, hue: 180, rotation: -0.1 },
    { x: 30, y: 35, size: 22, hue: 260, rotation: 0.4 },
    { x: 0, y: 50, size: 18, hue: 220, rotation: 0 }
  ];

  crystalPositions.forEach(pos => {
    drawSingleCrystal(
      ctx, 
      centerX + pos.x, 
      centerY + pos.y, 
      pos.size, 
      pos.hue, 
      pos.rotation
    );
  });

  // Crystal cluster base
  const baseGradient = ctx.createRadialGradient(
    centerX, centerY + 60, 0,
    centerX, centerY + 60, 40
  );
  baseGradient.addColorStop(0, 'rgba(50, 50, 100, 0.8)');
  baseGradient.addColorStop(1, 'rgba(20, 20, 50, 0.4)');
  
  ctx.fillStyle = baseGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY + 60, 40, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draw main large crystal
 */
function drawMainCrystal(ctx, x, y, size, hue) {
  ctx.save();
  ctx.translate(x, y);

  // Crystal body with multiple facets
  const crystalGradient = ctx.createLinearGradient(-size, -size, size, size);
  crystalGradient.addColorStop(0, `hsla(${hue}, 100%, 40%, 0.9)`);
  crystalGradient.addColorStop(0.3, `hsla(${hue}, 100%, 70%, 0.95)`);
  crystalGradient.addColorStop(0.7, `hsla(${hue}, 100%, 60%, 0.9)`);
  crystalGradient.addColorStop(1, `hsla(${hue}, 100%, 40%, 0.8)`);
  
  // Main crystal shape (hexagonal)
  ctx.fillStyle = crystalGradient;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.8, -size * 0.3);
  ctx.lineTo(size * 0.8, size * 0.5);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.8, size * 0.5);
  ctx.lineTo(-size * 0.8, -size * 0.3);
  ctx.closePath();
  ctx.fill();

  // Crystal facets with highlights
  addCrystalFacets(ctx, size, hue);

  // Inner crystal glow
  const innerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.6);
  innerGlow.addColorStop(0, `hsla(${hue}, 100%, 80%, 0.6)`);
  innerGlow.addColorStop(1, 'transparent');
  
  ctx.fillStyle = innerGlow;
  ctx.beginPath();
  ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add crystal facets with highlights
 */
function addCrystalFacets(ctx, size, hue) {
  ctx.strokeStyle = `hsla(${hue}, 100%, 90%, 0.8)`;
  ctx.lineWidth = 2;

  // Main facet lines
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.8, -size * 0.3);
  ctx.lineTo(size * 0.8, size * 0.5);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(size * 0.8, -size * 0.3);
  ctx.lineTo(-size * 0.8, size * 0.5);
  ctx.stroke();

  // Facet highlights
  ctx.fillStyle = `hsla(${hue}, 100%, 95%, 0.6)`;
  
  // Top facet highlight
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.3, -size * 0.6);
  ctx.lineTo(-size * 0.3, -size * 0.6);
  ctx.closePath();
  ctx.fill();

  // Side facet highlights
  ctx.beginPath();
  ctx.moveTo(size * 0.8, -size * 0.3);
  ctx.lineTo(size * 0.5, 0);
  ctx.lineTo(size * 0.8, size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(-size * 0.8, -size * 0.3);
  ctx.lineTo(-size * 0.5, 0);
  ctx.lineTo(-size * 0.8, size * 0.2);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draw single crystal in cluster
 */
function drawSingleCrystal(ctx, x, y, size, hue, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const crystalGradient = ctx.createLinearGradient(-size, -size, size, size);
  crystalGradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
  crystalGradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, 0.9)`);
  crystalGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.8)`);
  
  // Crystal shape
  ctx.fillStyle = crystalGradient;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.6, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.6, 0);
  ctx.closePath();
  ctx.fill();

  // Crystal facets
  ctx.strokeStyle = `hsla(${hue}, 100%, 90%, 0.7)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(0, size);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-size * 0.6, 0);
  ctx.lineTo(size * 0.6, 0);
  ctx.stroke();

  // Crystal highlight
  ctx.fillStyle = `hsla(${hue}, 100%, 95%, 0.5)`;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.2, -size * 0.3);
  ctx.lineTo(-size * 0.2, -size * 0.3);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Add crystal light beam effects
 */
function addCrystalLightBeams(ctx, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.4;

  // Light beams radiating from crystals
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * Math.PI * 2;
    const length = 100 + Math.random() * 80;
    const hue = 200 + Math.random() * 160;
    
    const beamGradient = ctx.createLinearGradient(
      centerX, centerY,
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    beamGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.8)`);
    beamGradient.addColorStop(0.7, `hsla(${hue}, 100%, 50%, 0.4)`);
    beamGradient.addColorStop(1, 'transparent');
    
    ctx.strokeStyle = beamGradient;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * length,
      centerY + Math.sin(angle) * length
    );
    ctx.stroke();
  }

  // Crystal aura glow
  const auraGradient = ctx.createRadialGradient(
    centerX, centerY, 0,
    centerX, centerY, 120
  );
  auraGradient.addColorStop(0, 'rgba(100, 150, 255, 0.6)');
  auraGradient.addColorStop(0.5, 'rgba(80, 120, 255, 0.3)');
  auraGradient.addColorStop(1, 'transparent');
  
  ctx.fillStyle = auraGradient;
  ctx.beginPath();
  ctx.arc(centerX, centerY, 120, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Add crystal refraction effects
 */
function addCrystalRefractions(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.2;

  // Create refraction patterns (caustics)
  for (let y = 0; y < height; y += 30) {
    for (let x = 0; x < width; x += 30) {
      const intensity = 0.3 + Math.sin(x * 0.02 + y * 0.01) * 0.3;
      const size = 15 + Math.sin(x * 0.03) * 10;
      
      ctx.fillStyle = `rgba(255, 255, 255, ${intensity})`;
      ctx.beginPath();
      ctx.arc(x + Math.sin(y * 0.02) * 10, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Draw crystal text with gemstone effects
 */
function drawCrystalText(ctx, text, width, height) {
  const centerX = width * 0.35;
  const centerY = height * 0.6;
  
  ctx.save();

  // Text crystal glow
  ctx.shadowColor = 'rgba(100, 150, 255, 0.8)';
  ctx.shadowBlur = 30;
  
  // Crystal text gradient
  const textGradient = ctx.createLinearGradient(
    centerX - 100, centerY - 50,
    centerX + 100, centerY + 50
  );
  textGradient.addColorStop(0, '#64C8FF'); // Light blue
  textGradient.addColorStop(0.2, '#9664FF'); // Purple
  textGradient.addColorStop(0.5, '#FFFFFF'); // White
  textGradient.addColorStop(0.8, '#64FFC8'); // Light green
  textGradient.addColorStop(1, '#64C8FF'); // Light blue
  
  ctx.font = 'bold 70px "Arial"';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = textGradient;
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Inner text crystal effect
  ctx.shadowColor = 'transparent';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
  ctx.fillText(text.toUpperCase(), centerX, centerY);

  // Text facet outlines
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.9)';
  ctx.lineWidth = 2;
  ctx.strokeText(text.toUpperCase(), centerX, centerY);

  // Add crystal facets to text
  addTextFacets(ctx, text, centerX, centerY);

  ctx.restore();
}

/**
 * Add crystal facets to text
 */
function addTextFacets(ctx, text, centerX, centerY) {
  ctx.save();
  ctx.globalCompositeOperation = 'overlay';
  ctx.globalAlpha = 0.3;

  const metrics = ctx.measureText(text.toUpperCase());
  const textWidth = metrics.width;
  const textHeight = 70;

  // Add facet highlights to text
  for (let i = 0; i < text.length * 3; i++) {
    const charPos = i / (text.length * 3);
    const x = centerX - textWidth / 2 + textWidth * charPos;
    const y = centerY - textHeight / 2 + Math.random() * textHeight;
    
    if (Math.random() > 0.7) {
      const facetSize = 3 + Math.random() * 8;
      const angle = Math.random() * Math.PI * 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + Math.cos(angle) * facetSize,
        y + Math.sin(angle) * facetSize
      );
      ctx.lineTo(
        x + Math.cos(angle + Math.PI / 3) * facetSize,
        y + Math.sin(angle + Math.PI / 3) * facetSize
      );
      ctx.closePath();
      ctx.fill();
    }
  }

  ctx.restore();
}

/**
 * Add floating crystal shards
 */
function addFloatingShards(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  // Large floating shards
  for (let i = 0; i < 10; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 5 + Math.random() * 15;
    const hue = 200 + Math.random() * 160;
    const rotation = Math.random() * Math.PI;
    
    drawCrystalShard(ctx, x, y, size, hue, rotation);
  }

  // Small sparkle shards
  for (let i = 0; i < 25; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 6;
    const hue = 200 + Math.random() * 160;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, 0.9)`;
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size * 0.6, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size * 0.6, y);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw individual crystal shard
 */
function drawCrystalShard(ctx, x, y, size, hue, rotation) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rotation);

  const shardGradient = ctx.createLinearGradient(-size, -size, size, size);
  shardGradient.addColorStop(0, `hsla(${hue}, 100%, 50%, 0.8)`);
  shardGradient.addColorStop(0.5, `hsla(${hue}, 100%, 70%, 0.9)`);
  shardGradient.addColorStop(1, `hsla(${hue}, 100%, 50%, 0.8)`);
  
  ctx.fillStyle = shardGradient;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.8, 0);
  ctx.lineTo(0, size);
  ctx.lineTo(-size * 0.8, 0);
  ctx.closePath();
  ctx.fill();

  // Shard highlight
  ctx.fillStyle = `hsla(${hue}, 100%, 90%, 0.6)`;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.3, -size * 0.2);
  ctx.lineTo(-size * 0.3, -size * 0.2);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

/**
 * Add crystal dust particles
 */
function addCrystalDust(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';

  for (let i = 0; i < 60; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 1 + Math.random() * 3;
    const hue = 200 + Math.random() * 160;
    const brightness = 0.6 + Math.random() * 0.4;
    
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${brightness})`;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();

    // Dust glow
    ctx.fillStyle = `hsla(${hue}, 100%, 70%, ${brightness * 0.3})`;
    ctx.beginPath();
    ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add gemstone highlights
 */
function addGemstoneHighlights(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;

  // Gemstone sparkles
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 2 + Math.random() * 4;
    
    // Star-shaped sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.beginPath();
    for (let j = 0; j < 5; j++) {
      const angle = (j * Math.PI * 2) / 5;
      const spike = size * 2;
      const indent = size;
      
      ctx.lineTo(
        x + Math.cos(angle) * spike,
        y + Math.sin(angle) * spike
      );
      ctx.lineTo(
        x + Math.cos(angle + Math.PI / 5) * indent,
        y + Math.sin(angle + Math.PI / 5) * indent
      );
    }
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Add rainbow refraction effects
 */
function addRainbowRefractions(ctx, width, height) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.1;

  // Rainbow light spots
  for (let i = 0; i < 8; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = 30 + Math.random() * 40;
    const hue = Math.random() * 360;
    
    const refractionGradient = ctx.createRadialGradient(
      x, y, 0,
      x, y, size
    );
    refractionGradient.addColorStop(0, `hsla(${hue}, 100%, 70%, 0.6)`);
    refractionGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = refractionGradient;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Draw crystal border
 */
function drawCrystalBorder(ctx, width, height) {
  ctx.save();

  // Crystal border gradient
  const borderGradient = ctx.createLinearGradient(0, 0, width, 0);
  borderGradient.addColorStop(0, '#64C8FF');
  borderGradient.addColorStop(0.3, '#9664FF');
  borderGradient.addColorStop(0.5, '#FFFFFF');
  borderGradient.addColorStop(0.7, '#9664FF');
  borderGradient.addColorStop(1, '#64C8FF');

  ctx.strokeStyle = borderGradient;
  ctx.lineWidth = 10;
  ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Inner crystal border
  ctx.strokeStyle = 'rgba(200, 230, 255, 0.6)';
  ctx.lineWidth = 3;
  ctx.shadowBlur = 15;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  // Add crystal corner gems
  addCornerGems(ctx, width, height);

  ctx.restore();
}

/**
 * Add crystal corner gems
 */
function addCornerGems(ctx, width, height) {
  ctx.save();
  ctx.globalAlpha = 0.8;

  const corners = [
    { x: 30, y: 30, hue: 200 },
    { x: width - 30, y: 30, hue: 240 },
    { x: 30, y: height - 30, hue: 180 },
    { x: width - 30, y: height - 30, hue: 260 }
  ];

  corners.forEach(corner => {
    // Corner gem
    const gemGradient = ctx.createRadialGradient(
      corner.x, corner.y, 0,
      corner.x, corner.y, 8
    );
    gemGradient.addColorStop(0, `hsla(${corner.hue}, 100%, 80%, 0.9)`);
    gemGradient.addColorStop(1, `hsla(${corner.hue}, 100%, 50%, 0.6)`);
    
    ctx.fillStyle = gemGradient;
    ctx.beginPath();
    ctx.arc(corner.x, corner.y, 8, 0, Math.PI * 2);
    ctx.fill();

    // Gem highlight
    ctx.fillStyle = `hsla(${corner.hue}, 100%, 95%, 0.8)`;
    ctx.beginPath();
    ctx.arc(corner.x - 2, corner.y - 2, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}

/**
 * Add crystal-themed signature
 */
function addCrystalSignature(ctx, width, height) {
  ctx.save();
  
  const signatureX = width - 110;
  const signatureY = height - 25;
  
  ctx.font = 'italic 14px "Arial"';
  ctx.fillStyle = 'rgba(200, 230, 255, 0.9)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  
  ctx.shadowColor = 'rgba(100, 150, 255, 0.6)';
  ctx.shadowBlur = 10;
  
  ctx.fillText('by Silent Wolf', signatureX, signatureY);
  
  // Small crystal next to signature
  ctx.fillStyle = '#64C8FF';
  ctx.beginPath();
  ctx.moveTo(signatureX + 5, signatureY - 10);
  ctx.lineTo(signatureX + 10, signatureY - 8);
  ctx.lineTo(signatureX + 5, signatureY - 6);
  ctx.lineTo(signatureX, signatureY - 8);
  ctx.closePath();
  ctx.fill();
  
  // Crystal highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
  ctx.beginPath();
  ctx.moveTo(signatureX + 3, signatureY - 9);
  ctx.lineTo(signatureX + 5, signatureY - 8);
  ctx.lineTo(signatureX + 3, signatureY - 7);
  ctx.closePath();
  ctx.fill();
  
  ctx.restore();
}