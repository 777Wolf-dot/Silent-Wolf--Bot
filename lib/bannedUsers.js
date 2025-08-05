import fs from 'fs';

const FILE_PATH = './lib/bannedUsers.json';

let banned = {};
if (fs.existsSync(FILE_PATH)) {
  banned = JSON.parse(fs.readFileSync(FILE_PATH));
}

export function banUser(groupId, userId) {
  if (!banned[groupId]) banned[groupId] = [];
  if (!banned[groupId].includes(userId)) banned[groupId].push(userId);
  save();
}

export function unbanUser(groupId, userId) {
  if (banned[groupId]) {
    banned[groupId] = banned[groupId].filter(id => id !== userId);
    if (banned[groupId].length === 0) delete banned[groupId];
    save();
  }
}

export function isUserBanned(groupId, userId) {
  return banned[groupId]?.includes(userId);
}

function save() {
  fs.writeFileSync(FILE_PATH, JSON.stringify(banned, null, 2));
}
