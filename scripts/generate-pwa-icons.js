const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
    }
  }
  return ~c >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, pixelFn) {
  const rowSize = 1 + width * 4;
  const buffer = Buffer.alloc(height * rowSize);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    buffer[rowOffset] = 0; // Filter: None
    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const [r, g, b, a] = pixelFn(x, y, width, height);
      buffer[pxOffset] = r;
      buffer[pxOffset + 1] = g;
      buffer[pxOffset + 2] = b;
      buffer[pxOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(buffer, { level: 9 });
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;

  const ihdr = makeChunk('IHDR', ihdrData);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

// Pixel function drawing Obsidian Navy background + Teal/Emerald Lean Flow Logo
function pwaIconPixel(x, y, width, height, isMaskable = false) {
  const nx = x / width;
  const ny = y / height;

  // Obsidian Navy gradient background (#090e1a to #040711)
  let bgR = Math.round(9 - ny * 5);
  let bgG = Math.round(14 - ny * 7);
  let bgB = Math.round(26 - ny * 15);
  let bgA = 255;

  // Normalized coordinates with center at 0,0
  const cx = nx - 0.5;
  const cy = ny - 0.5;

  // Safe area scaling: maskable requires content inside center 80% circle (radius 0.4)
  const scale = isMaskable ? 0.65 : 0.82;
  const sx = cx / scale;
  const sy = cy / scale;

  // Outer container rounded card
  const cardRadius = 0.42;
  const cornerR = 0.12;
  const dx = Math.max(0, Math.abs(sx) - (cardRadius - cornerR));
  const dy = Math.max(0, Math.abs(sy) - (cardRadius - cornerR));
  const distToEdge = Math.sqrt(dx * dx + dy * dy);
  const inCard = distToEdge <= cornerR;

  // Border highlight
  const isBorder = inCard && distToEdge >= cornerR - 0.015;

  if (inCard) {
    if (isBorder) {
      // Gradient border (#06b6d4 -> #10b981)
      const t = (sx + 0.4) / 0.8;
      const bR = Math.round(6 + t * (16 - 6));
      const bG = Math.round(182 + t * (185 - 182));
      const bB = Math.round(212 + t * (129 - 212));
      return [bR, bG, bB, 255];
    }

    // Inside card: dark obsidian container (#0a101f)
    bgR = 10;
    bgG = 16;
    bgB = 31;
  }

  // Draw "L" and "F" geometric stylized letters
  // L letter (left side: x from -0.28 to -0.06, y from -0.24 to 0.24)
  const inLStem = sx >= -0.26 && sx <= -0.14 && sy >= -0.22 && sy <= 0.22;
  const inLFoot = sx >= -0.26 && sx <= -0.02 && sy >= 0.10 && sy <= 0.22;
  const inL = inLStem || inLFoot;

  // F letter (right side: x from 0.02 to 0.26, y from -0.24 to 0.24)
  const inFStem = sx >= 0.02 && sx <= 0.14 && sy >= -0.22 && sy <= 0.22;
  const inFTop = sx >= 0.02 && sx <= 0.26 && sy >= -0.22 && sy <= -0.10;
  const inFMid = sx >= 0.02 && sx <= 0.22 && sy >= -0.05 && sy <= 0.05;
  const inF = inFStem || inFTop || inFMid;

  // Flow Arrow Chevron (pointing forward between/below)
  // Arrow head at (0.28, 0.16)
  const arrowPx = sx - 0.18;
  const arrowPy = sy - 0.16;
  const inArrow =
    Math.abs(arrowPy) <= 0.045 &&
    arrowPx >= -0.04 &&
    arrowPx <= 0.08 &&
    arrowPx + Math.abs(arrowPy) <= 0.09;

  if (inL || inF || inArrow) {
    // Gradient coloring (#22d3ee to #34d399)
    const t = (sx + 0.3) / 0.6;
    const lR = Math.round(34 + t * (52 - 34));
    const lG = Math.round(211 + t * (211 - 211));
    const lB = Math.round(238 + t * (153 - 238));
    return [lR, lG, lB, 255];
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.join(__dirname, '..', 'public');

console.log('Gerando ícones PWA...');

// 1. icon-192x192.png
const png192 = createPng(192, 192, (x, y, w, h) => pwaIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), png192);
console.log('✓ icon-192x192.png gerado');

// 2. icon-512x512.png
const png512 = createPng(512, 512, (x, y, w, h) => pwaIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), png512);
console.log('✓ icon-512x512.png gerado');

// 3. icon-maskable-192x192.png
const mask192 = createPng(192, 192, (x, y, w, h) => pwaIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192x192.png'), mask192);
console.log('✓ icon-maskable-192x192.png gerado');

// 4. icon-maskable-512x512.png
const mask512 = createPng(512, 512, (x, y, w, h) => pwaIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512x512.png'), mask512);
console.log('✓ icon-maskable-512x512.png gerado');

// 5. apple-touch-icon.png (180x180)
const appleIcon = createPng(180, 180, (x, y, w, h) => pwaIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);
console.log('✓ apple-touch-icon.png gerado');

// 6. favicon.png (48x48)
const favicon = createPng(48, 48, (x, y, w, h) => pwaIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'favicon.png'), favicon);
console.log('✓ favicon.png gerado');

console.log('Todos os ícones PNG PWA gerados com sucesso!');
