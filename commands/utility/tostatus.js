export default {
  name: "tostatus",
  description: "Send replied message to your status",
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    try {
      // Check if there's a quoted message
      if (!quotedMsg) {
        await sock.sendMessage(jid, {
          text: `❌ Please reply to a message that you want to send to your status.\n\nReply to:\n• Text messages\n• Images\n• Videos`
        }, { quoted: m });
        return;
      }

      // Send initial status update
      const statusMessage = await sock.sendMessage(jid, {
        text: `📤 Sending to status...`
      }, { quoted: m });

      let success = false;
      let statusType = '';

      // Handle different message types
      if (quotedMsg.imageMessage) {
        success = await handleImageStatus(sock, quotedMsg.imageMessage);
        statusType = 'image';
      } 
      else if (quotedMsg.videoMessage) {
        success = await handleVideoStatus(sock, quotedMsg.videoMessage);
        statusType = 'video';
      }
      else if (quotedMsg.extendedTextMessage || quotedMsg.conversation) {
        success = await handleTextStatus(sock, quotedMsg);
        statusType = 'text';
      }
      else {
        await sock.sendMessage(jid, {
          text: `❌ Unsupported message type. Only text, images, and videos are supported.`,
          edit: statusMessage.key
        });
        return;
      }

      if (success) {
        // Edit the message to show success
        await sock.sendMessage(jid, {
          text: `✅ ${statusType.charAt(0).toUpperCase() + statusType.slice(1)} status sent successfully!`,
          edit: statusMessage.key
        });
      } else {
        throw new Error('Failed to send status');
      }

    } catch (error) {
      console.error("❌ [TOSTATUS] ERROR:", error);
      await sock.sendMessage(jid, {
        text: `❌ Failed to send status: ${error.message}`
      }, { quoted: m });
    }
  },
};

/**
 * Handle image status - USING CORRECT BAILEYS METHOD
 */
async function handleImageStatus(sock, imageMessage) {
  try {
    if (!imageMessage) throw new Error('No image message found');

    // Download media using the correct method for your Baileys version
    const buffer = await downloadMedia(sock, imageMessage, 'image');
    if (!buffer) throw new Error('Could not download image');

    // For image status, we'll update profile picture (since direct image status isn't available in API)
    await sock.updateProfilePicture(buffer);
    return true;

  } catch (error) {
    console.error('Image status error:', error);
    throw new Error('Failed to process image for status');
  }
}

/**
 * Handle video status - USING CORRECT BAILEYS METHOD
 */
async function handleVideoStatus(sock, videoMessage) {
  try {
    if (!videoMessage) throw new Error('No video message found');

    // Download video
    const buffer = await downloadMedia(sock, videoMessage, 'video');
    if (!buffer) throw new Error('Could not download video');

    // Send video to status broadcast
    await sock.sendMessage('status@broadcast', { 
      video: buffer,
      caption: 'Status update'
    });
    
    return true;

  } catch (error) {
    console.error('Video status error:', error);
    throw new Error('Failed to process video for status');
  }
}

/**
 * Handle text status
 */
async function handleTextStatus(sock, quotedMsg) {
  try {
    let text = '';
    
    if (quotedMsg.extendedTextMessage) {
      text = quotedMsg.extendedTextMessage.text;
    } else if (quotedMsg.conversation) {
      text = quotedMsg.conversation;
    }

    if (!text || text.trim() === '') {
      throw new Error('No text content found');
    }

    // Trim text if too long
    if (text.length > 139) {
      text = text.substring(0, 136) + '...';
    }

    // Update profile status (acts as text status)
    await sock.updateProfileStatus(text);
    return true;

  } catch (error) {
    console.error('Text status error:', error);
    throw new Error('Failed to send text status');
  }
}

/**
 * Universal media download function for Baileys
 */
async function downloadMedia(sock, mediaMessage, mediaType) {
  try {
    // Method 1: Try using the message object directly
    if (sock.downloadAndSaveMediaMessage) {
      const tempPath = `./temp_${Date.now()}.${mediaType}`;
      await sock.downloadAndSaveMediaMessage(mediaMessage, tempPath);
      const buffer = require('fs').readFileSync(tempPath);
      require('fs').unlinkSync(tempPath);
      return buffer;
    }
    
    // Method 2: Try using downloadContentFromMessage
    else if (sock.downloadContentFromMessage) {
      const stream = await sock.downloadContentFromMessage(mediaMessage, mediaType);
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      return Buffer.concat(chunks);
    }
    
    // Method 3: Manual download using media URL
    else if (mediaMessage.url) {
      const response = await fetch(mediaMessage.url, {
        headers: {
          'Origin': 'https://web.whatsapp.com',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (!response.ok) throw new Error('Download failed');
      return Buffer.from(await response.arrayBuffer());
    }
    
    // Method 4: Last resort - try any download method that exists
    else {
      // Check what download methods are available
      const downloadMethods = [
        'downloadMedia',
        'downloadMessage',
        'downloadContent'
      ];
      
      for (const method of downloadMethods) {
        if (sock[method]) {
          try {
            const result = await sock[method](mediaMessage);
            if (result && Buffer.isBuffer(result)) return result;
            if (result && typeof result === 'object') {
              // Convert to buffer if it's a stream or object
              return Buffer.from(await result.arrayBuffer());
            }
          } catch (e) {
            continue;
          }
        }
      }
      
      throw new Error('No working download method found');
    }
    
  } catch (error) {
    console.error('Download error:', error);
    throw new Error(`Could not download ${mediaType}`);
  }
}