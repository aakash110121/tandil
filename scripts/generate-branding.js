/*
  Tandil branding asset generator
  - Generates: assets/icon.png, assets/adaptive-icon.png, assets/splash-icon.png, assets/logo.png, assets/favicon.png
  - Uses Sharp to rasterize simple SVG compositions
*/

/* eslint-disable @typescript-eslint/no-var-requires */
const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '..', 'assets');

const COLORS = {
  primary: '#1c4b27', // Tandil green
  primaryDark: '#0f2513',
  lightBg: '#EEEADE', // requested light beige
  white: '#FFFFFF',
};

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Returns a <g> leaf group for embedding (no XML declaration)
function leafGroup({ fill = COLORS.white }) {
  return `
  <g>
    <!-- Organic leaf silhouette -->
    <path d="M512 140
             C 380 170, 282 300, 300 500
             C 318 700, 420 860, 512 900
             C 604 860, 706 700, 724 500
             C 742 300, 644 170, 512 140 Z" fill="${fill}"/>
    <!-- Midrib -->
    <path d="M512 220 C 490 380, 520 560, 520 820" stroke="${COLORS.primaryDark}" stroke-width="22" stroke-linecap="round" opacity="0.22"/>
    <!-- Secondary veins -->
    <path d="M490 360 C 430 380, 380 440, 340 520" stroke="${COLORS.primaryDark}" stroke-width="12" stroke-linecap="round" opacity="0.18"/>
    <path d="M480 500 C 430 520, 392 570, 360 640" stroke="${COLORS.primaryDark}" stroke-width="10" stroke-linecap="round" opacity="0.16"/>
    <path d="M540 360 C 600 380, 650 440, 690 520" stroke="${COLORS.primaryDark}" stroke-width="12" stroke-linecap="round" opacity="0.18"/>
    <path d="M552 500 C 602 520, 640 570, 672 640" stroke="${COLORS.primaryDark}" stroke-width="10" stroke-linecap="round" opacity="0.16"/>
  </g>`;
}

function logoSvg({ width, height, showText = true }) {
  const w = width;
  const h = height;
  const text = showText
    ? `<text x="50%" y="78%" text-anchor="middle" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="${Math.round(
        Math.min(w, h) * 0.12
      )}" font-weight="700" fill="${COLORS.primary}">Tandil</text>`
    : '';
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${w}" height="${h}" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B6B2B"/>
      <stop offset="100%" stop-color="#085321"/>
    </linearGradient>
  </defs>
  <rect width="1024" height="1024" rx="220" ry="220" fill="${COLORS.lightBg}"/>
  <g transform="translate(0,-40)">
    <g transform="translate(0,40)">
      <circle cx="512" cy="420" r="220" fill="url(#bgGrad)"/>
      <g transform="translate(272,180)">
        <path d="M240 20 C 130 90, 125 260, 240 520 C 355 260, 350 90, 240 20 Z" fill="${COLORS.white}"/>
        <path d="M240 80 C 220 180, 280 260, 280 400" stroke="${COLORS.primaryDark}" stroke-width="18" stroke-linecap="round" opacity="0.25"/>
      </g>
    </g>
  </g>
  ${text}
</svg>`;
}

async function generateIconPng() {
  const size = 1024;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="iconGrad" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0B6B2B"/>
      <stop offset="100%" stop-color="#0A5E26"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="#ffffff"/>
  <g transform="translate(${size / 2}, ${size / 2})">
    <circle cx="0" cy="0" r="420" fill="url(#iconGrad)"/>
    <g transform="translate(-307,-307) scale(0.6)">
      ${leafGroup({})}
    </g>
  </g>
</svg>`;
  const out = path.join(ASSETS_DIR, 'icon.png');
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function generateAdaptiveIconPng() {
  // Foreground should respect Android safe zone ~66% (432dp area inside 108dp padding)
  const size = 432;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="none"/>
  <g transform="translate(${size / 2 - 144}, ${size / 2 - 144}) scale(0.28125)">
    ${leafGroup({})}
  </g>
</svg>`;
  const out = path.join(ASSETS_DIR, 'adaptive-icon.png');
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function generateSplashPng() {
  const width = 1600;
  const height = 1600;
  const background = {
    create: {
      width,
      height,
      channels: 4,
      background: COLORS.lightBg,
    },
  };

  // Centered logo block
  const logo = Buffer.from(
    logoSvg({ width: 900, height: 900, showText: true })
  );

  const out = path.join(ASSETS_DIR, 'splash-icon.png');
  await sharp(background)
    .composite([
      { input: logo, top: Math.round(height / 2 - 450), left: Math.round(width / 2 - 450) },
    ])
    .png()
    .toFile(out);
}

async function generateLogoPng() {
  const svg = logoSvg({ width: 1024, height: 1024, showText: true });
  const out = path.join(ASSETS_DIR, 'logo.png');
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function generateFaviconPng() {
  const size = 256;
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="${COLORS.primary}"/>
  <g transform="translate(${size / 2 - 64}, ${size / 2 - 64}) scale(0.125)">
    ${leafGroup({})}
  </g>
</svg>`;
  const out = path.join(ASSETS_DIR, 'favicon.png');
  await sharp(Buffer.from(svg)).png().toFile(out);
}

async function main() {
  ensureDir(ASSETS_DIR);
  await Promise.all([
    generateIconPng(),
    generateAdaptiveIconPng(),
    generateSplashPng(),
    generateLogoPng(),
    generateFaviconPng(),
  ]);
  // Also export Android mipmap foregrounds to help overwrite existing ones if needed
  const mipSizes = [48, 72, 96, 144, 192]; // mdpi..xxxhdpi typical logical sizes
  const mipDirs = [
    'mipmap-mdpi',
    'mipmap-hdpi',
    'mipmap-xhdpi',
    'mipmap-xxhdpi',
    'mipmap-xxxhdpi',
  ];
  // Transparent foreground with centered white leaf glyph (no background)
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="none"/>
  <g transform="translate(90,60) scale(0.33)">
    ${leafGroup({ fill: COLORS.white })}
  </g>
</svg>`;
  for (let i = 0; i < mipSizes.length; i++) {
    const size = mipSizes[i];
    const dir = path.resolve(__dirname, '..', 'android', 'app', 'src', 'main', 'res', mipDirs[i]);
    ensureDir(dir);
    await sharp(Buffer.from(svg)).png().resize(size, size).toFile(path.join(dir, 'ic_launcher_foreground.png'));
  }
  // eslint-disable-next-line no-console
  console.log('✅ Tandil branding assets generated in assets/');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


