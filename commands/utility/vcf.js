// import vCardsJS from 'vcards-js';
// import { BOT_NAME, COMMAND_PREFIX } from '../../settings.js'; 

// export default {
//     name: "vcf",
//     alias: ["groupcontacts", "groupvcf"],
//     category: "Utility",
//     desc: `Collects all members' numbers in the current group into a single VCF file. Usage: ${COMMAND_PREFIX}groupvcard`,
//     use: "No arguments required",

//     execute: async (client, msg, args) => {
//         const jid = msg.key.remoteJid;

//         // 1. Group Validation
//         if (!jid.endsWith('@g.us')) {
//             return client.sendMessage(jid, { 
//                 text: `❌ *${BOT_NAME} Error:* This command only works in a **group chat**, Alpha.`
//             }, { quoted: msg });
//         }
        
//         // 🐾 "Thinking" feedback
//         await client.sendMessage(jid, { 
//             text: `* 
//            ╠══════╣
//            *${BOT_NAME}*  
//             is compiling the group contacts now... 
//             Please wait.
//             ╠═════╣`
//         }, { quoted: msg });


//         try {
//             // 2. Get Group Metadata 
//             const groupMetadata = await client.groupMetadata(jid);

//             // 🛑 CRITICAL CHECK: Ensure metadata and participants array exist
//             if (!groupMetadata || !groupMetadata.participants || groupMetadata.participants.length === 0) {
//                  return client.sendMessage(jid, { 
//                     text: `❌ *${BOT_NAME} Error:* Failed to retrieve group member list. (Are you an admin?)`
//                 }, { quoted: msg });
//             }

//             const participants = groupMetadata.participants;
//             let masterVcfContent = '';
            
//             // Get the group's subject/name for the file name
//             const groupName = groupMetadata.subject.replace(/[^a-zA-Z0-9]/g, '_'); 

//             // 3. Loop through participants and generate vCard entries
//             for (const participant of participants) {
//                 const numberJid = participant.id;
//                 // Safely handle cases where 'id' might be missing or malformed
//                 if (!numberJid) continue; 
                
//                 const number = numberJid.split('@')[0]; // Get the raw number

//                 if (number) {
//                     let vCard = vCardsJS();
                    
//                     vCard.firstName = number; 
//                     vCard.workPhone = `+${number}`;
//                     vCard.organization = groupName || BOT_NAME; 
//                     vCard.note = `Member of the group: ${groupMetadata.subject}`;

//                     masterVcfContent += vCard.getFormattedString() + '\n';
//                 }
//             }

//             if (!masterVcfContent) {
//                 return client.sendMessage(jid, { 
//                     text: `❌ *${BOT_NAME} Error:* Could not generate any VCF entries from the contact list.`
//                 }, { quoted: msg });
//             }

//             // 4. Send the combined VCF file
//             const fileName = `${groupName}_Contacts.vcf`;
            
//             await client.sendMessage(jid, {
//                 document: Buffer.from(masterVcfContent),
//                 fileName: fileName,
//                 mimetype: 'text/vcard',
//                 caption: `
//               ╠═══════════╣  
//                 ✅ *${BOT_NAME} Success:* 
//                 Found ${participants.length} contacts for 
//                 *${groupMetadata.subject}*!
//                 ╠═════════╣`
//             }, { quoted: msg });

//         } catch (error) {
//             // Log the error for debugging
//             console.error("Group VCF Generation Fatal Error:", error);
            
//             // Send a user-friendly error message
//             await client.sendMessage(jid, { 
//                 text: `❌ *${BOT_NAME} Snarls:* Failed to compile group contacts (Metadata retrieval failed). Ensure the bot is a **group administrator**.\nTechnical Error: ${error.message.substring(0, 100)}...` 
//             }, { quoted: msg });
//         }
//     }
// };