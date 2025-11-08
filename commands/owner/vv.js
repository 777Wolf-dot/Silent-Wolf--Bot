import fs from "fs";
import { downloadContentFromMessage } from "@whiskeysockets/baileys";
import { BOT_NAME, COMMAND_PREFIX } from "../settings.js";

export default {
  name: "vv",
  alias: ["viewonce", "vv2"],
  category: "Arcana",
  desc: "Reveals the hidden content of view-once messages.",
  use: `Reply to a View Once message with ${COMMAND_PREFIX}vv`,

  execute: async (sock, msg, args) => {
    const jid = msg.key.remoteJid;
    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    if (!quotedMsg) {
      return sock.sendMessage(jid, { text: "--------------------------------\nVIEW-ONCE MESSAGE NOT DETECTED\n--------------------------------\nPlease reply to a view-once message to use this command." }, { quoted: msg });
    }

    // Baileys v6 uses viewOnceMessage directly
    let mediaPayload = quotedMsg.viewOnceMessage?.message || quotedMsg;
    const isViewOnce = mediaPayload?.imageMessage || mediaPayload?.videoMessage || mediaPayload?.audioMessage;

    if (!isViewOnce) {
      return sock.sendMessage(jid, { text: "--------------------------------\nINVALID MESSAGE\n--------------------------------\nThe replied message is not a view-once type." }, { quoted: msg });
    }

    let mediaType = mediaPayload.imageMessage ? "imageMessage" :
                    mediaPayload.videoMessage ? "videoMessage" :
                    mediaPayload.audioMessage ? "audioMessage" : null;

    if (!mediaType) {
      return sock.sendMessage(jid, { text: "--------------------------------\nUNREADABLE CONTENT\n--------------------------------\nThis message cannot be processed by the bot." }, { quoted: msg });
    }

    await sock.sendMessage(jid, { text: "--------------------------------\nRETRIEVING MEDIA\n--------------------------------\nAttempting to retrieve the hidden content..." }, { quoted: msg });

    try {
      const stream = await downloadContentFromMessage(mediaPayload[mediaType], mediaType.replace("Message", ""));
      let buffer = Buffer.from([]);
      for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

      const payload = mediaType === "imageMessage" ? { image: buffer, caption: "Hidden image retrieved successfully." } :
                      mediaType === "videoMessage" ? { video: buffer, caption: "Hidden video retrieved successfully." } :
                      { audio: buffer, ptt: mediaPayload[mediaType]?.mimetype?.includes("ogg") || false };

      await sock.sendMessage(jid, payload, { quoted: msg });
    } catch (error) {
      console.error("VV Error:", error);
      await sock.sendMessage(jid, { text: `--------------------------------\nRETRIEVAL FAILED\n--------------------------------\nThe bot could not retrieve the media. Reason: ${error?.message || "Unknown"}.` }, { quoted: msg });
    }
  },
};
