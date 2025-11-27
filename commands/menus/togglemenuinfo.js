// // // commands/menus/togglemenuinfo.js
// // import { menuToggles, toggleField, lastMenuUsed } from "./menuToggles.js";

// // export default {
// //   name: "togglemenuinfo",
// //   description: "Toggle info sections (user, owner, uptime, etc.) for menu styles 5, 6, and 7.",
// //   category: "settings",
  
// //   async execute(sock, m, args) {
// //     const jid = m.key.remoteJid;
// //     const field = args[0]?.toLowerCase();

// //     // Check if user is owner
// //     const isOwner = m.key.fromMe || (global.owner && m.sender.includes(global.owner));
// //     if (!isOwner) {
// //       await sock.sendMessage(
// //         jid,
// //         { text: "❌ This command is only available to the bot owner." },
// //         { quoted: m }
// //       );
// //       return;
// //     }

// //     // Check if we have a last menu used and if it's toggleable
// //     if (!lastMenuUsed) {
// //       await sock.sendMessage(
// //         jid,
// //         { 
// //           text: `❌ No toggleable menu detected.\n\nPlease use *${global.prefix || "."}menu* first with style 5, 6, or 7, then use this command to customize the info display.` 
// //         },
// //         { quoted: m }
// //       );
// //       return;
// //     }

// //     if (!field) {
// //       // Show all toggles for the current menu
// //       const fields = Object.entries(menuToggles[`style${lastMenuUsed}`])
// //         .map(([key, value]) => `> ${value ? "✅" : "❌"} ${key}`)
// //         .join("\n");
      
// //       await sock.sendMessage(
// //         jid,
// //         { 
// //           text: `🐺 *Menu ${lastMenuUsed} Info Toggles:*\n\n${fields}\n\nUse *${global.prefix || "."}togglemenuinfo fieldname* to toggle one.\n\n*Available fields:* user, owner, mode, host, speed, prefix, uptime, version, usage, ram` 
// //         },
// //         { quoted: m }
// //       );
// //       return;
// //     }

// //     const result = toggleField(lastMenuUsed, field);
// //     await sock.sendMessage(jid, { text: result }, { quoted: m });
// //   },
// // };



// // commands/menus/togglemenuinfo.js
// import { menuToggles, toggleField, lastMenuUsed } from "./menuToggles.js";

// export default {
//   name: "togglemenuinfo",
//   description: "Toggle info sections (user, owner, uptime, etc.) for menu styles 5, 6, and 7.",
//   category: "settings",
  
//   async execute(sock, m, args) {
//     const jid = m.key.remoteJid;
//     const field = args[0]?.toLowerCase();

//     // Check if user is owner
//     const isOwner = m.key.fromMe || (global.owner && m.sender.includes(global.owner));
//     if (!isOwner) {
//       await sock.sendMessage(
//         jid,
//         { text: "❌ This command is only available to the bot owner." },
//         { quoted: m }
//       );
//       return;
//     }

//     // Check if we have a last menu used
//     if (!lastMenuUsed) {
//       await sock.sendMessage(
//         jid,
//         { 
//           text: `❌ No toggleable menu detected.\n\nPlease use *${global.prefix || "."}menu* first with style 5, 6, or 7, then use this command to customize the info display.\n\n*Note:* Only menu styles 5, 6, and 7 support info customization.` 
//         },
//         { quoted: m }
//       );
//       return;
//     }

//     // Check if the current menu is toggleable (5, 6, or 7)
//     if (![5, 6, 7].includes(lastMenuUsed)) {
//       await sock.sendMessage(
//         jid,
//         { 
//           text: `❌ Current menu style ${lastMenuUsed} does not support info toggles.\n\nOnly menu styles 5, 6, and 7 can be customized.\n\nSwitch to a compatible menu style first using *${global.prefix || "."}menustyle*, then use this command.` 
//         },
//         { quoted: m }
//       );
//       return;
//     }

//     if (!field) {
//       // Show all toggles for the current menu
//       const fields = Object.entries(menuToggles[`style${lastMenuUsed}`])
//         .map(([key, value]) => `> ${value ? "✅" : "❌"} ${key}`)
//         .join("\n");
      
//       await sock.sendMessage(
//         jid,
//         { 
//           text: `🐺 *Menu ${lastMenuUsed} Info Toggles:*\n\n${fields}\n\nUse *${global.prefix || "."}togglemenuinfo fieldname* to toggle one.\n\n*Available fields:* user, owner, mode, host, speed, prefix, uptime, version, usage, ram` 
//         },
//         { quoted: m }
//       );
//       return;
//     }

//     const result = toggleField(lastMenuUsed, field);
//     await sock.sendMessage(jid, { text: result }, { quoted: m });
//   },
// };

























// commands/menus/togglemenuinfo.js
import { menuToggles, toggleField, getCurrentMenuStyle, getAllFieldsStatus } from "./menuToggles.js";

export default {
  name: "togglemenuinfo",
  description: "Toggle info sections (user, owner, uptime, etc.) for menu styles 5, 6, and 7.",
  category: "settings",
  
  async execute(sock, m, args) {
    const jid = m.key.remoteJid;
    const field = args[0]?.toLowerCase();

    // Check if user is owner
    const isOwner = m.key.fromMe || (global.owner && m.sender.includes(global.owner));
    if (!isOwner) {
      await sock.sendMessage(
        jid,
        { text: "❌ This command is only available to the bot owner." },
        { quoted: m }
      );
      return;
    }

    // Get the CURRENT menu style dynamically (await the async function)
    const currentMenuStyle = await getCurrentMenuStyle();
    
    console.log(`🐺 [TOGGLEMENUINFO] Current menu style detected: ${currentMenuStyle}`);

    // Check if the current menu is toggleable (5, 6, or 7)
    if (![5, 6, 7].includes(currentMenuStyle)) {
      await sock.sendMessage(
        jid,
        { 
          text: `❌ Current menu style (${currentMenuStyle}) does not support info toggles.\n\nOnly menu styles 5, 6, and 7 can be customized.\n\nSwitch to a compatible menu style first using *${global.prefix || "."}menustyle*, then use this command.` 
        },
        { quoted: m }
      );
      return;
    }

    if (!field) {
      // Show all toggles for the current menu
      const fieldsStatus = getAllFieldsStatus(currentMenuStyle);
      if (!fieldsStatus) {
        await sock.sendMessage(
          jid,
          { text: `❌ No configuration found for menu style ${currentMenuStyle}.` },
          { quoted: m }
        );
        return;
      }

      const fields = Object.entries(fieldsStatus)
        .map(([key, value]) => `> ${value ? "✅" : "❌"} ${key}`)
        .join("\n");
      
      await sock.sendMessage(
        jid,
        { 
          text: `🐺 *Menu ${currentMenuStyle} Info Toggles:*\n\n${fields}\n\nUse *${global.prefix || "."}togglemenuinfo fieldname* to toggle one.\n\n*Available fields:* user, owner, mode, host, speed, prefix, uptime, version, usage, ram` 
        },
        { quoted: m }
      );
      return;
    }

    const result = toggleField(currentMenuStyle, field);
    await sock.sendMessage(jid, { text: result }, { quoted: m });
  },
};