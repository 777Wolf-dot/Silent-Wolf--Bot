// commands/menus/menuToggles.js
export const menuToggles = {
  5: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    memory: true,
  },
  6: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    memory: true,
  },
  7: {
    user: true,
    owner: true,
    mode: true,
    host: true,
    speed: true,
    prefix: true,
    uptime: true,
    version: true,
    memory: true,
  },
};

// store last used menu (auto updated)
export let lastMenuUsed = 5;

/**
 * Set the last used menu dynamically
 */
export function setLastMenu(num) {
  lastMenuUsed = num;
}

/**
 * Toggle a field for the detected menu
 */
export function toggleField(menu, field) {
  const toggles = menuToggles[menu];
  if (!toggles) return `❌ Menu ${menu} not found.`;
  if (!(field in toggles)) return `❌ Field "${field}" not found in menu ${menu}.`;

  toggles[field] = !toggles[field];
  return `✅ *${field}* is now ${toggles[field] ? "ENABLED ✅" : "DISABLED ❌"} for menu ${menu}.`;
}
