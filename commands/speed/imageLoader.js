// commands/speed/imageLoader.js
import fs from "fs/promises";
import path from "path";

export const images = {}; // key = filename without extension, value = Buffer

export async function loadImages() {
  try {
    const mediaDir = path.join('.', 'commands', 'media'); // your media folder
    const files = await fs.readdir(mediaDir);

    if (!files.length) {
      console.warn("⚠️ Media folder is empty! No images to preload.");
      return;
    }

    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if ([".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(ext)) {
        const key = path.basename(file, ext); // filename without extension
        const filePath = path.join(mediaDir, file);
        try {
          const buffer = await fs.readFile(filePath);
          images[key] = buffer;
          console.log(`✅ Preloaded image: ${file} as '${key}'`);
        } catch (err) {
          console.error(`❌ Failed to read image ${file}:`, err);
        }
      }
    }

    // Always ensure at least one fallback image
    if (Object.keys(images).length === 0) {
      console.warn("⚠️ No valid images found in media folder.");
    } else {
      const firstKey = Object.keys(images)[0];
      images.fallback = images[firstKey]; // fallback for any missing image
      console.log(`ℹ️ Fallback image set to '${firstKey}'`);
    }
  } catch (err) {
    console.error("❌ Error loading media folder:", err);
  }
}
