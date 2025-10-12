import fs from 'fs';
import fetch from 'node-fetch';
import pkg from 'file-type';
const { fileTypeFromBuffer } = pkg;
import { downloadContentFromMessage } from '@whiskeysockets/baileys';
import { FormData } from 'formdata-node';

export default {
  name: 'reverseimage',
  alias: ['revimg'],
  description: '🔎 Reverse search an image using Google',
  category: 'utility',
  usage: '.reverseimage (reply to an image)',

  async execute(sock, msg) {
    try {
      const jid = msg.key.remoteJid;

      // Ensure the user replied to an image
      if (!msg.message?.imageMessage && !msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage) {
        return sock.sendMessage(jid, { text: '❌ Please reply to an image with this command.' }, { quoted: msg });
      }

      // Get the correct image message
      const imageMessage = msg.message?.imageMessage || msg.message?.extendedTextMessage?.contextInfo?.quotedMessage?.imageMessage;

      // Download the image
      const stream = await downloadContentFromMessage(imageMessage, 'image');
      let buffer = Buffer.from([]);
      for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
      }

      // Detect MIME type
      const type = await fileTypeFromBuffer(buffer);
      if (!type) throw new Error('Could not determine image type');

      // Prepare FormData
      const form = new FormData();
      form.append('encoded_image', buffer, { filename: `image.${type.ext}` });
      form.append('image_content', '');

      // Send to Google reverse image search
      const response = await fetch('https://www.google.com/searchbyimage/upload', {
        method: 'POST',
        body: form,
      });

      const redirectUrl = response.headers.get('location');
      if (!redirectUrl) throw new Error('Could not get search result URL');

      await sock.sendMessage(jid, { text: `🔎 Reverse Image Result:\n${redirectUrl}` }, { quoted: msg });

    } catch (err) {
      console.error('[ReverseImage Error]', err);
      const jid = msg.key.remoteJid;
      await sock.sendMessage(jid, { text: '❌ Failed to perform reverse image search. Try again later.' }, { quoted: msg });
    }
  }
};
