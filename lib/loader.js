import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function loadCommands(commandsPath = '../commands') {
  const commands = new Map();
  const folder = path.join(__dirname, commandsPath);

  async function loadDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        await loadDir(fullPath);
      } else if (file.endsWith('.js')) {
        try {
          const command = await import(fullPath);
          const name = command.default.name;
          commands.set(name, command.default);
        } catch (e) {
          console.error('❌ Error loading command', file, e);
        }
      }
    }
  }

  await loadDir(folder);
  return commands;
}
