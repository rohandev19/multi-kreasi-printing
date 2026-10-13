const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'frontend', 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

async function generateFavicons() {
  const svgBuffer = fs.readFileSync(svgPath);

  // Generate PNG sizes
  const sizes = [16, 32, 48, 64, 180, 192, 512];
  const pngBuffers = {};

  for (const size of sizes) {
    const pngBuffer = await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toBuffer();
    pngBuffers[size] = pngBuffer;

    if (size === 16) {
      fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), pngBuffer);
    } else if (size === 32) {
      fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), pngBuffer);
    } else if (size === 48) {
      fs.writeFileSync(path.join(publicDir, 'favicon-48x48.png'), pngBuffer);
    } else if (size === 180) {
      fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngBuffer);
    } else if (size === 192) {
      fs.writeFileSync(path.join(publicDir, 'android-chrome-192x192.png'), pngBuffer);
    } else if (size === 512) {
      fs.writeFileSync(path.join(publicDir, 'android-chrome-512x512.png'), pngBuffer);
    }
  }

  // Create multi-resolution ICO file containing 16x16, 32x32, 48x48 PNGs
  const icoSizes = [16, 32, 48];
  const count = icoSizes.length;

  // ICO header: 6 bytes
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(count, 4); // Number of images

  const dirEntries = [];
  let currentOffset = 6 + (16 * count);

  for (const size of icoSizes) {
    const imgData = pngBuffers[size];
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size === 256 ? 0 : size, 0); // Width
    entry.writeUInt8(size === 256 ? 0 : size, 1); // Height
    entry.writeUInt8(0, 2); // Color palette
    entry.writeUInt8(0, 3); // Reserved
    entry.writeUInt16LE(1, 4); // Color planes
    entry.writeUInt16LE(32, 6); // Bits per pixel
    entry.writeUInt32LE(imgData.length, 8); // Image size in bytes
    entry.writeUInt32LE(currentOffset, 12); // File offset

    dirEntries.push(entry);
    currentOffset += imgData.length;
  }

  const icoBuffer = Buffer.concat([
    header,
    ...dirEntries,
    ...icoSizes.map(size => pngBuffers[size])
  ]);

  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuffer);
  console.log('Successfully generated all favicons (ico, pngs) in frontend/public!');
}

generateFavicons().catch(err => {
  console.error('Error generating favicons:', err);
  process.exit(1);
});
