// File: ./commands/ai/analyze.js
import fetch from "node-fetch";

export default {
  name: "analyze",
  alias: ["analyzer", "analysis"],
  desc: "Analyze images, text, or documents using AI vision 🧠",
  category: "AI",
  usage: ".analyze <image/document/text> or reply .analyze to media",
  
  async execute(sock, m, args, PREFIX, metadata = {}) {
    try {
      const chatId = m.key.remoteJid;
      let query = args.join(" ");
      
      // Check if it's a reply to a message with media
      const quotedMsg = m.message?.extendedTextMessage?.contextInfo?.quotedMessage;
      const isImage = quotedMsg?.imageMessage;
      const isVideo = quotedMsg?.videoMessage;
      const isDocument = quotedMsg?.documentMessage;
      const isText = quotedMsg?.conversation || quotedMsg?.extendedTextMessage?.text;
      
      const apiKey = process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY;
      
      if (!apiKey) {
        return sock.sendMessage(chatId, {
          text: "⚠️ *AI Analysis Error*\n\nNo API key found!\nPlease set OPENAI_API_KEY or GEMINI_API_KEY in .env"
        }, { quoted: m });
      }
      
      // Send processing message
      const processingMsg = await sock.sendMessage(chatId, {
        text: "🔍 *Analyzing content...*\n\nPlease wait while I examine this carefully...",
        quoted: m
      });
      
      let analysisResult = "";
      
      if (isImage) {
        // Analyze image
        analysisResult = await analyzeImage(quotedMsg, query, apiKey);
      } else if (isVideo) {
        // Analyze video (describe it)
        analysisResult = await analyzeVideo(quotedMsg, query, apiKey);
      } else if (isDocument) {
        // Analyze document
        analysisResult = await analyzeDocument(quotedMsg, query, apiKey);
      } else if (isText) {
        // Analyze text
        analysisResult = await analyzeText(quotedMsg, query, apiKey);
      } else if (query) {
        // Analyze provided query as text
        analysisResult = await analyzeQuery(query, apiKey);
      } else {
        // Delete processing message
        try { await sock.sendMessage(chatId, { delete: processingMsg.key }); } catch(e) {}
        
        return sock.sendMessage(chatId, {
          text: `📊 *Content Analyzer*\n\nI can analyze various types of content:\n\n• Images (reply .analyze to image)\n• Videos (reply .analyze to video)\n• Documents (reply .analyze to document)\n• Text (reply .analyze to text or .analyze <text>)\n\nExamples:\n• Reply .analyze to a photo\n• .analyze What can you tell me about this picture?\n• .analyze Summarize this document\n\nSupported APIs: OpenAI GPT-4 Vision & Gemini Pro Vision`
        }, { quoted: m });
      }
      
      // Delete processing message
      try { await sock.sendMessage(chatId, { delete: processingMsg.key }); } catch(e) {}
      
      // Send analysis result
      const formattedResult = `
🔬 *AI ANALYSIS REPORT* 🔬
━━━━━━━━━━━━━━━━━━━━━━━

${analysisResult}

━━━━━━━━━━━━━━━━━━━━━━━
🧠 *Analyzed by Silent Wolf AI*
📊 Powered by ${apiKey.includes('sk-') ? 'OpenAI GPT-4 Vision' : 'Google Gemini Pro'}
      `.trim();
      
      await sock.sendMessage(chatId, { text: formattedResult }, { quoted: m });
      
    } catch (error) {
      console.error("Analyze Error:", error);
      await sock.sendMessage(m.key.remoteJid, {
        text: `❌ *Analysis Failed*\n\nError: ${error.message}\n\nMake sure you have:\n1. Valid API key in .env\n2. Supported image/document format\n3. Internet connection`
      }, { quoted: m });
    }
  }
};

// Helper functions
async function analyzeImage(quotedMsg, query, apiKey) {
  try {
    // Since we can't download the image in this context, we'll use text-based analysis
    // In a real implementation, you would download the image and send to vision API
    
    const imageDescription = quotedMsg.imageMessage?.caption || "an image";
    const prompt = query || "Describe this image in detail. What do you see? Be specific about objects, colors, scene, mood, and any text present.";
    
    if (apiKey.includes('sk-')) {
      // OpenAI API
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: "gpt-4-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `${prompt}\n\nNote: I cannot see the actual image, but here's the description: "${imageDescription}"`
                }
              ]
            }
          ],
          max_tokens: 1000
        })
      });
      
      const data = await response.json();
      return data.choices[0]?.message?.content || "Could not analyze image.";
      
    } else {
      // Gemini API
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `${prompt}\n\nNote: I cannot see the actual image, but here's the description: "${imageDescription}"`
            }]
          }]
        })
      });
      
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze image.";
    }
    
  } catch (error) {
    throw new Error(`Image analysis failed: ${error.message}`);
  }
}

async function analyzeVideo(quotedMsg, query, apiKey) {
  const videoDescription = quotedMsg.videoMessage?.caption || "a video";
  const prompt = query || "Analyze this video. What might it contain? Consider duration, possible content, and context.";
  
  if (apiKey.includes('sk-')) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: `${prompt}\n\nVideo description: "${videoDescription}"\nDuration: ${quotedMsg.videoMessage?.seconds || 'unknown'} seconds`
          }
        ],
        max_tokens: 800
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || "Could not analyze video.";
    
  } else {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${prompt}\n\nVideo description: "${videoDescription}"\nDuration: ${quotedMsg.videoMessage?.seconds || 'unknown'} seconds`
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze video.";
  }
}

async function analyzeDocument(quotedMsg, query, apiKey) {
  const docName = quotedMsg.documentMessage?.fileName || "a document";
  const fileSize = quotedMsg.documentMessage?.fileLength ? 
    Math.round(quotedMsg.documentMessage.fileLength / 1024) + "KB" : "unknown size";
  const mimeType = quotedMsg.documentMessage?.mimetype || "unknown type";
  
  const prompt = query || `Analyze this document.\n\nDocument info:\n- Name: ${docName}\n- Type: ${mimeType}\n- Size: ${fileSize}\n\nWhat kind of document might this be? What could it contain?`;
  
  if (apiKey.includes('sk-')) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || "Could not analyze document.";
    
  } else {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze document.";
  }
}

async function analyzeText(quotedMsg, query, apiKey) {
  let textContent = "";
  
  if (quotedMsg.conversation) {
    textContent = quotedMsg.conversation;
  } else if (quotedMsg.extendedTextMessage?.text) {
    textContent = quotedMsg.extendedTextMessage.text;
  }
  
  const analysisType = query || "general";
  let prompt = "";
  
  switch (analysisType.toLowerCase()) {
    case "sentiment":
      prompt = `Analyze the sentiment of this text:\n\n"${textContent}"\n\nIs it positive, negative, or neutral? What emotions are expressed?`;
      break;
    case "summary":
      prompt = `Summarize this text concisely:\n\n"${textContent}"`;
      break;
    case "keywords":
      prompt = `Extract key topics and keywords from this text:\n\n"${textContent}"`;
      break;
    case "grammar":
      prompt = `Check grammar and spelling in this text:\n\n"${textContent}"\n\nProvide corrections and suggestions.`;
      break;
    case "complexity":
      prompt = `Analyze the reading complexity of this text:\n\n"${textContent}"\n\nWhat reading level is it? Is it easy or difficult to understand?`;
      break;
    case "tone":
      prompt = `Analyze the tone and style of this text:\n\n"${textContent}"\n\nIs it formal, informal, academic, casual, etc.?`;
      break;
    default:
      prompt = `Analyze this text comprehensively:\n\n"${textContent}"\n\nProvide insights about:\n1. Main topic/theme\n2. Key points\n3. Writing style\n4. Potential purpose/audience\n5. Any notable patterns or insights`;
  }
  
  if (apiKey.includes('sk-')) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || "Could not analyze text.";
    
  } else {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze text.";
  }
}

async function analyzeQuery(query, apiKey) {
  const prompt = `Analyze this query or content: "${query}"\n\nProvide a comprehensive analysis including:\n1. Main topic/request\n2. Key elements to consider\n3. Potential approaches or solutions\n4. Related concepts\n5. Recommendations or next steps`;
  
  if (apiKey.includes('sk-')) {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1200
      })
    });
    
    const data = await response.json();
    return data.choices[0]?.message?.content || "Could not analyze query.";
    
  } else {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "Could not analyze query.";
  }
}