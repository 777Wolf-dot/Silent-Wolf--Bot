// // menus/menuToggles.js
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const configPath = path.join(__dirname, "menuInfoConfig.json");

// // Default configuration for menu info toggles (only styles 5,6,7 have info sections)
// const defaultMenuInfoConfig = {
//   style5: {
//     user: true,
//     owner: true,
//     mode: true,
//     host: true,
//     speed: true,
//     prefix: true,
//     uptime: true,
//     version: true,
//     usage: true,
//     ram: true
//   },
//   style6: {
//     user: true,
//     owner: true,
//     mode: true,
//     host: true,
//     speed: true,
//     prefix: true,
//     uptime: true,
//     version: true,
//     usage: true,
//     ram: true
//   },
//   style7: {
//     user: true,
//     owner: true,
//     mode: true,
//     host: true,
//     speed: true,
//     prefix: true,
//     uptime: true,
//     version: true,
//     usage: true,
//     ram: true
//   }
// };

// // Load or create config
// let menuToggles = { ...defaultMenuInfoConfig };
// let lastMenuUsed = null; // Will be set automatically when menu is used

// try {
//   if (fs.existsSync(configPath)) {
//     const savedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
//     menuToggles = { ...defaultMenuInfoConfig, ...savedConfig };
//   }
// } catch (error) {
//   console.log("Creating new menu info config...");
//   saveConfig();
// }

// function saveConfig() {
//   try {
//     fs.writeFileSync(configPath, JSON.stringify(menuToggles, null, 2));
//   } catch (error) {
//     console.error("Error saving menu info config:", error);
//   }
// }

// export function setLastMenu(menuStyle) {
//   // Only track styles that have info sections (5,6,7)
//   if ([5, 6, 7].includes(menuStyle)) {
//     lastMenuUsed = menuStyle;
//   }
//   return lastMenuUsed;
// }

// export function toggleField(menu, field) {
//   const styleKey = `style${menu}`;
  
//   // Only allow toggling for styles 5, 6, 7
//   if (![5, 6, 7].includes(menu)) {
//     return `❌ Menu style ${menu} does not support info toggles. Only styles 5, 6, and 7 can be customized.`;
//   }
  
//   if (!menuToggles[styleKey]) {
//     return `❌ Menu style ${menu} not found in configuration.`;
//   }
  
//   if (!menuToggles[styleKey].hasOwnProperty(field)) {
//     const availableFields = Object.keys(menuToggles[styleKey]).join(", ");
//     return `❌ Field "${field}" not found. Available fields: ${availableFields}`;
//   }
  
//   menuToggles[styleKey][field] = !menuToggles[styleKey][field];
//   saveConfig();
  
//   const status = menuToggles[styleKey][field] ? "✅ enabled" : "❌ disabled";
//   return `🐺 Menu ${menu} - "${field}" is now ${status}.`;
// }

// export function getFieldStatus(menu, field) {
//   const styleKey = `style${menu}`;
//   return menuToggles[styleKey]?.[field] ?? false;
// }

// export function getAllFieldsStatus(menu) {
//   const styleKey = `style${menu}`;
//   return menuToggles[styleKey] ? { ...menuToggles[styleKey] } : null;
// }

// export { menuToggles, lastMenuUsed };




















// menus/menuToggles.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const configPath = path.join(__dirname, "menuInfoConfig.json");

// Default configuration for menu info toggles (only styles 5,6,7 have info sections)
const defaultMenuInfoConfig = {
  style5: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    usage: true,
    ram: true
  },
  style6: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    usage: true,
    ram: true
  },
  style7: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    usage: true,
    ram: true
  }
};

// Load or create config
let menuToggles = { ...defaultMenuInfoConfig };

try {
  if (fs.existsSync(configPath)) {
    const savedConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));
    menuToggles = { ...defaultMenuInfoConfig, ...savedConfig };
  }
} catch (error) {
  console.log("Creating new menu info config...");
  saveConfig();
}

function saveConfig() {
  try {
    fs.writeFileSync(configPath, JSON.stringify(menuToggles, null, 2));
  } catch (error) {
    console.error("Error saving menu info config:", error);
  }
}

// Function to get current menu style dynamically
export async function getCurrentMenuStyle() {
  try {
    // Import the menustyle module to get the current style
    const menustyleModule = await import('./menustyle.js');
    return menustyleModule.getCurrentMenuStyle();
  } catch (error) {
    console.error("Error getting current menu style:", error);
    return 1; // Default to style 1 if there's an error
  }
}

export function setLastMenu(menuStyle) {
  // This function is kept for backward compatibility
  // but we'll use getCurrentMenuStyle() directly now
  return menuStyle;
}

export function toggleField(menu, field) {
  const styleKey = `style${menu}`;
  
  // Only allow toggling for styles 5, 6, 7
  if (![5, 6, 7].includes(menu)) {
    return `❌ Menu style ${menu} does not support info toggles. Only styles 5, 6, and 7 can be customized.`;
  }
  
  if (!menuToggles[styleKey]) {
    return `❌ Menu style ${menu} not found in configuration.`;
  }
  
  if (!menuToggles[styleKey].hasOwnProperty(field)) {
    const availableFields = Object.keys(menuToggles[styleKey]).join(", ");
    return `❌ Field "${field}" not found. Available fields: ${availableFields}`;
  }
  
  menuToggles[styleKey][field] = !menuToggles[styleKey][field];
  saveConfig();
  
  const status = menuToggles[styleKey][field] ? "✅ enabled" : "❌ disabled";
  return `🐺 Menu ${menu} - "${field}" is now ${status}.`;
}

export function getFieldStatus(menu, field) {
  const styleKey = `style${menu}`;
  return menuToggles[styleKey]?.[field] ?? false;
}

export function getAllFieldsStatus(menu) {
  const styleKey = `style${menu}`;
  return menuToggles[styleKey] ? { ...menuToggles[styleKey] } : null;
}

export { menuToggles };