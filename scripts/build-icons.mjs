// Renders the PNG app icons from public/icons/icon.svg. Run: node scripts/build-icons.mjs
import sharp from "sharp";
import { readFile } from "node:fs/promises";

const svg = await readFile("public/icons/icon.svg");
// Maskable icons need the glyph inside the central safe zone, and iOS adds its own rounded corners.
const square = Buffer.from(svg.toString().replace('rx="112"', 'rx="0"'));
const maskable = Buffer.from(
  square.toString().replace('font-size="300"', 'font-size="230"').replace('y="350"', 'y="335"'),
);

const jobs = [
  [svg, 192, "icon-192.png"],
  [svg, 512, "icon-512.png"],
  [maskable, 512, "icon-maskable-512.png"],
  [square, 180, "apple-touch-icon.png"],
];
for (const [src, size, name] of jobs) {
  await sharp(src, { density: 300 }).resize(size, size).png().toFile(`public/icons/${name}`);
  console.log("wrote", name);
}
