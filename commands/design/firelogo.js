// import { createCanvas, registerFont } from 'canvas';
// import axios from "axios";

// export default {
//   name: "firelogo",
//   description: "Create fire/flame style text logos",
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;

//     try {
//       if (args.length === 0) {
//         await sock.sendMessage(jid, { 
//           text: `🔥 *Fire Logo*\n\nUsage: ${global.prefix}firelogo <text>\n\n*Example:*\n${global.prefix}firelogo WOLF\n${global.prefix}firelogo HELLO WORLD` 
//         }, { quoted: m });
//         return;
//       }

//       const text = args.join(" ");
      
//       if (text.length > 15) {
//         await sock.sendMessage(jid, { 
//           text: `❌ Text too long! Please use maximum 15 characters.\n\nYour text: "${text}" (${text.length} characters)` 
//         }, { quoted: m });
//         return;
//       }

//       // Send waiting message
//       const waitingMsg = await sock.sendMessage(jid, { 
//         text: `🔥 Generating fire logo for: "${text}"...` 
//       }, { quoted: m });

//       // Generate fire logo locally
//       const logoBuffer = await generateFireLogo(text);
      
//       await sock.sendMessage(jid, {
//         image: logoBuffer,
//         caption: `🔥 *Fire Logo Generated!*\nText: ${text}`
//       }, { quoted: m });

//     } catch (error) {
//       console.error("❌ [FIRELOGO] ERROR:", error);
//       await sock.sendMessage(jid, { 
//         text: `❌ Error creating fire logo: ${error.message}\n\nPlease try again with shorter text.` 
//       }, { quoted: m });
//     }
//   },
// };

// /**
//  * Generate fire logo locally using canvas with realistic fire effect
//  */
// async function generateFireLogo(text) {
//   const width = 800;
//   const height = 400;
  
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');

//   // Create dark background
//   ctx.fillStyle = '#000000';
//   ctx.fillRect(0, 0, width, height);

//   // Draw fire-like background
//   drawFireBackground(ctx, width, height);

//   // Add main text with fire gradient
//   ctx.font = 'bold 80px "Arial"';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';

//   // Create fire text gradient
//   const textGradient = ctx.createLinearGradient(0, 150, 0, 250);
//   textGradient.addColorStop(0, '#FFFF00'); // Yellow
//   textGradient.addColorStop(0.3, '#FFA500'); // Orange
//   textGradient.addColorStop(0.7, '#FF4500'); // OrangeRed
//   textGradient.addColorStop(1, '#8B0000'); // DarkRed

//   ctx.fillStyle = textGradient;
  
//   // Text shadow for glow effect
//   ctx.shadowColor = '#FF4500';
//   ctx.shadowBlur = 20;
//   ctx.shadowOffsetX = 0;
//   ctx.shadowOffsetY = 0;
  
//   ctx.fillText(text.toUpperCase(), width / 2, height / 2);

//   // Add inner glow
//   ctx.shadowColor = '#FFFF00';
//   ctx.shadowBlur = 15;
//   ctx.strokeStyle = textGradient;
//   ctx.lineWidth = 2;
//   ctx.strokeText(text.toUpperCase(), width / 2, height / 2);

//   // Reset shadow
//   ctx.shadowColor = 'transparent';
//   ctx.shadowBlur = 0;

//   // Add fiery particles around text
//   addFireParticles(ctx, width, height, text);

//   // Add border with fire effect
//   ctx.strokeStyle = '#FF8C00';
//   ctx.lineWidth = 5;
//   ctx.shadowColor = '#FF4500';
//   ctx.shadowBlur = 15;
//   ctx.strokeRect(15, 15, width - 30, height - 30);

//   return canvas.toBuffer('image/png');
// }

// /**
//  * Draw animated fire-like background
//  */
// function drawFireBackground(ctx, width, height) {
//   // Create fire gradient background
//   const gradient = ctx.createLinearGradient(0, 0, 0, height);
//   gradient.addColorStop(0, '#000000'); // Black
//   gradient.addColorStop(0.3, '#8B0000'); // DarkRed
//   gradient.addColorStop(0.6, '#FF4500'); // OrangeRed
//   gradient.addColorStop(0.8, '#FF8C00'); // DarkOrange
//   gradient.addColorStop(1, '#000000'); // Black

//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, 0, width, height);

//   // Add fire noise/texture
//   ctx.globalAlpha = 0.3;
//   for (let i = 0; i < 1000; i++) {
//     const x = Math.random() * width;
//     const y = Math.random() * height;
//     const size = Math.random() * 3 + 1;
//     const intensity = Math.random();
    
//     if (intensity > 0.7) {
//       ctx.fillStyle = '#FFFF00';
//     } else if (intensity > 0.4) {
//       ctx.fillStyle = '#FFA500';
//     } else {
//       ctx.fillStyle = '#FF4500';
//     }
    
//     ctx.fillRect(x, y, size, size);
//   }
//   ctx.globalAlpha = 1.0;
// }

// /**
//  * Add fiery particles around the text
//  */
// function addFireParticles(ctx, width, height, text) {
//   ctx.globalAlpha = 0.6;
  
//   // Calculate text boundaries approximately
//   const textWidth = text.length * 40;
//   const textHeight = 80;
//   const textX = width / 2 - textWidth / 2;
//   const textY = height / 2 - textHeight / 2;

//   // Add particles around text
//   for (let i = 0; i < 200; i++) {
//     const angle = Math.random() * Math.PI * 2;
//     const distance = Math.random() * 100 + 50;
//     const x = width / 2 + Math.cos(angle) * distance;
//     const y = height / 2 + Math.sin(angle) * distance;
//     const size = Math.random() * 4 + 1;
    
//     const intensity = Math.random();
//     if (intensity > 0.8) {
//       ctx.fillStyle = '#FFFF00'; // Yellow
//     } else if (intensity > 0.5) {
//       ctx.fillStyle = '#FFA500'; // Orange
//     } else {
//       ctx.fillStyle = '#FF4500'; // Red
//     }
    
//     // Create flame-like shapes
//     ctx.beginPath();
//     ctx.arc(x, y, size, 0, Math.PI * 2);
//     ctx.fill();
//   }
  
//   ctx.globalAlpha = 1.0;
// }

// /**
//  * Alternative simple version for quick generation
//  */
// async function generateSimpleFireLogo(text) {
//   const width = 600;
//   const height = 300;
  
//   const canvas = createCanvas(width, height);
//   const ctx = canvas.getContext('2d');

//   // Simple gradient background
//   const gradient = ctx.createLinearGradient(0, 0, width, height);
//   gradient.addColorStop(0, '#8B0000');
//   gradient.addColorStop(0.5, '#FF4500');
//   gradient.addColorStop(1, '#FF8C00');

//   ctx.fillStyle = gradient;
//   ctx.fillRect(0, 0, width, height);

//   // Text
//   ctx.font = 'bold 60px Arial';
//   ctx.fillStyle = '#FFFFFF';
//   ctx.textAlign = 'center';
//   ctx.textBaseline = 'middle';
  
//   ctx.shadowColor = '#000000';
//   ctx.shadowBlur = 10;
//   ctx.shadowOffsetX = 2;
//   ctx.shadowOffsetY = 2;
  
//   ctx.fillText(text.toUpperCase(), width / 2, height / 2);

//   return canvas.toBuffer('image/png');
// }















import { createCanvas, registerFont } from 'canvas';
import axios from 'axios';

export default {
  name: "firelogo",
  description: "Create fire/flame style text logos",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;

    try {
      if (!args.length) {
        await sock.sendMessage(jid, { 
          text: `🔥 *Fire Logo*\nUsage: ${global.prefix}firelogo <text>\nExample:\n${global.prefix}firelogo WOLF` 
        }, { quoted: m });
        return;
      }

      const text = args.join(" ");
      if (text.length > 15) {
        await sock.sendMessage(jid, { 
          text: `❌ Text too long! Maximum 15 characters.\nYour text: "${text}" (${text.length} chars)` 
        }, { quoted: m });
        return;
      }

      const waitingMsg = await sock.sendMessage(jid, { 
        text: `🔥 Generating fire logo for: "${text}"...` 
      }, { quoted: m });

      // Generate logo
      const logoBuffer = await generateFireLogo(text);

      await sock.sendMessage(jid, {
        image: logoBuffer,
        caption: `🔥 *Fire Logo Generated!*\nText: ${text}`
      }, { quoted: m });

    } catch (err) {
      console.error("❌ [FIRELOGO] ERROR:", err);
      await sock.sendMessage(jid, { 
        text: `❌ Error creating fire logo: ${err.message}\nTry again with shorter text.` 
      }, { quoted: m });
    }
  }
};

/**
 * Generate a realistic fire logo
 */
async function generateFireLogo(text) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background gradient
  const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
  bgGradient.addColorStop(0, '#0a0a0a');      // Dark top
  bgGradient.addColorStop(0.4, '#8B0000');    // Dark red
  bgGradient.addColorStop(0.7, '#FF4500');    // Orange red
  bgGradient.addColorStop(0.9, '#FF8C00');    // Orange
  bgGradient.addColorStop(1, '#0a0a0a');      // Dark bottom
  ctx.fillStyle = bgGradient;
  ctx.fillRect(0, 0, width, height);

  // Fire-like noise
  addFireBackgroundNoise(ctx, width, height);

  // Text
  ctx.font = 'bold 80px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Fire gradient for text
  const textGradient = ctx.createLinearGradient(0, height / 2 - 50, 0, height / 2 + 50);
  textGradient.addColorStop(0, '#FFFF00'); // Yellow
  textGradient.addColorStop(0.3, '#FFA500'); // Orange
  textGradient.addColorStop(0.7, '#FF4500'); // OrangeRed
  textGradient.addColorStop(1, '#8B0000'); // DarkRed
  ctx.fillStyle = textGradient;

  // Glow shadow
  ctx.shadowColor = '#FF4500';
  ctx.shadowBlur = 25;
  ctx.fillText(text.toUpperCase(), width / 2, height / 2);

  // Inner stroke glow
  ctx.shadowColor = '#FFFF00';
  ctx.shadowBlur = 15;
  ctx.lineWidth = 2;
  ctx.strokeStyle = textGradient;
  ctx.strokeText(text.toUpperCase(), width / 2, height / 2);

  // Add fire particles
  addFireParticles(ctx, width, height);

  // Fire border
  ctx.strokeStyle = '#FF8C00';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#FF4500';
  ctx.shadowBlur = 20;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  // Reset shadow
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  return canvas.toBuffer('image/png');
}

/**
 * Adds fire-like noise background
 */
function addFireBackgroundNoise(ctx, width, height) {
  ctx.globalAlpha = 0.25;
  for (let i = 0; i < 1200; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const size = Math.random() * 3 + 1;
    const rand = Math.random();
    if (rand > 0.7) ctx.fillStyle = '#FFFF00';
    else if (rand > 0.4) ctx.fillStyle = '#FFA500';
    else ctx.fillStyle = '#FF4500';
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1.0;
}

/**
 * Adds fire particles around the text
 */
function addFireParticles(ctx, width, height) {
  ctx.globalAlpha = 0.7;
  for (let i = 0; i < 250; i++) {
    const angle = Math.random() * Math.PI * 2;
    const distance = Math.random() * 120 + 50;
    const x = width / 2 + Math.cos(angle) * distance;
    const y = height / 2 + Math.sin(angle) * distance;
    const size = Math.random() * 4 + 1;
    const rand = Math.random();
    if (rand > 0.8) ctx.fillStyle = '#FFFF00';
    else if (rand > 0.5) ctx.fillStyle = '#FFA500';
    else ctx.fillStyle = '#FF4500';
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1.0;
}
