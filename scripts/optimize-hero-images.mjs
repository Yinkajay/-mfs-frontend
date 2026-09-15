import { join } from "node:path";
import sharp from "sharp";

const images = ["lexus", "family", "danfo", "man"];

await Promise.all(
  images.map((name) =>
    sharp(join(process.cwd(), "public", `${name}.png`))
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82, smartSubsample: true })
      .toFile(join(process.cwd(), "public", `${name}.webp`)),
  ),
);

console.log(`Optimized ${images.length} hero images.`);
