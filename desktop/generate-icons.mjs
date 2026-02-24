/**
 * Generate tray and app icons for Bridge to Fig desktop app.
 *
 * Creates three tray icon variants (connected, waiting, stopped) at multiple sizes,
 * plus app icons for the installer/bundle.
 *
 * Usage: node generate-icons.mjs
 * Requires: sharp (npm install sharp)
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ICONS_DIR = path.join(__dirname, 'src-tauri', 'icons');

// Ensure icons directory exists
fs.mkdirSync(ICONS_DIR, { recursive: true });

// Bridge icon SVG path (Phosphor Icons — Bridge, thin weight)
const BRIDGE_PATH =
  'M232,164H196V88.09a67.81,67.81,0,0,0,34.5,31,4,4,0,1,0,3-7.42A59.77,59.77,0,0,1,196,56a4,4,0,0,0-8,0A60,60,0,0,1,68,56a4,4,0,0,0-8,0,59.77,59.77,0,0,1-37.5,55.64,4,4,0,0,0,3,7.42,67.81,67.81,0,0,0,34.5-31V164H24a4,4,0,0,0,0,8H60v28a4,4,0,0,0,8,0V172H188v28a4,4,0,0,0,8,0V172h36a4,4,0,0,0,0-8Zm-84-43v43H108V121a68,68,0,0,0,40,0ZM68,88a68.43,68.43,0,0,0,32,30v46H68Zm88,76V118a68.43,68.43,0,0,0,32-30v76Z';

// Tray icon variants
const TRAY_VARIANTS = [
  { name: 'tray-connected', bg: '#34C759' },
  { name: 'tray-waiting', bg: '#FFCC00' },
  { name: 'tray-stopped', bg: '#8E8E93' },
];

// Sizes to generate for tray icons
const TRAY_SIZES = [16, 24, 32, 44, 64, 128, 256];

// App icon sizes
const APP_SIZES = [32, 128, 256, 512];

/**
 * Create an SVG for a tray icon with a colored rounded-rect background
 * and the bridge icon in black.
 */
function createTrayIconSvg(size, bgColor) {
  const padding = Math.round(size * 0.1);
  const rectSize = size;
  const cornerRadius = Math.round(size * 0.2);

  // Scale the icon path to fit within the padded area
  // Original viewBox is 256x256
  const iconAreaSize = rectSize - padding * 2;
  const scale = iconAreaSize / 256;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect x="0" y="0" width="${rectSize}" height="${rectSize}" rx="${cornerRadius}" ry="${cornerRadius}" fill="${bgColor}"/>
  <g transform="translate(${padding}, ${padding}) scale(${scale})">
    <path d="${BRIDGE_PATH}" fill="#000000"/>
  </g>
</svg>`;
}

/**
 * Create an SVG for the app icon (green background, bridge icon)
 */
function createAppIconSvg(size) {
  return createTrayIconSvg(size, '#34C759');
}

async function generateIcons() {
  console.log('Generating Bridge to Fig icons...');
  console.log(`Output directory: ${ICONS_DIR}`);
  console.log('');

  let count = 0;

  // Generate tray icons
  for (const variant of TRAY_VARIANTS) {
    for (const size of TRAY_SIZES) {
      const svg = createTrayIconSvg(size, variant.bg);
      const filename = `${variant.name}-${size}x${size}.png`;
      const filepath = path.join(ICONS_DIR, filename);

      await sharp(Buffer.from(svg)).resize(size, size).png().toFile(filepath);

      count++;
      console.log(`  Created: ${filename}`);
    }
    console.log('');
  }

  // Generate app icons
  for (const size of APP_SIZES) {
    const svg = createAppIconSvg(size);
    const filename = `icon-${size}x${size}.png`;
    const filepath = path.join(ICONS_DIR, filename);

    await sharp(Buffer.from(svg)).resize(size, size).png().toFile(filepath);

    count++;
    console.log(`  Created: ${filename}`);
  }

  // Generate icon.png (256px, using green/connected color)
  const iconSvg = createAppIconSvg(256);
  const iconPath = path.join(ICONS_DIR, 'icon.png');
  await sharp(Buffer.from(iconSvg)).resize(256, 256).png().toFile(iconPath);
  count++;
  console.log('  Created: icon.png');

  // Generate icon.ico for Windows (using 256px source)
  const ico256Svg = createAppIconSvg(256);
  const ico256Path = path.join(ICONS_DIR, 'icon.ico');
  await sharp(Buffer.from(ico256Svg)).resize(256, 256).png().toFile(ico256Path);
  count++;
  console.log('  Created: icon.ico (256px PNG, rename manually if true ICO needed)');

  console.log('');
  console.log(`Done! Generated ${count} icons.`);
}

generateIcons().catch((err) => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
