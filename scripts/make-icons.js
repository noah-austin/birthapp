/**
 * Generates the PNG app icons with no dependencies — a tiny RGBA PNG encoder
 * plus some per-pixel math. Run with `npm run icons`.
 */
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { fileURLToPath } from 'node:url';

const OUT_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

/* ---- PNG encoding -------------------------------------------------------- */

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const byte of buf) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;  // bit depth
  ihdr[9] = 6;  // truecolour with alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  // Each scanline is prefixed with filter type 0 (none).
  const raw = Buffer.alloc(height * (width * 4 + 1));
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

/* ---- Drawing ------------------------------------------------------------- */

const hex = (value) => [
  parseInt(value.slice(1, 3), 16),
  parseInt(value.slice(3, 5), 16),
  parseInt(value.slice(5, 7), 16),
];

const BLUSH = hex('#F6CDB4');
const CORAL = hex('#E4675F');
const CORAL_LIGHT = hex('#EE8578');
const SAGE = hex('#8FA97A');

const SAMPLES = 4; // 4x4 supersampling per pixel

function blend(dst, offset, color, alpha) {
  if (alpha <= 0) return;
  const a = Math.min(1, alpha);
  for (let i = 0; i < 3; i += 1) {
    dst[offset + i] = Math.round(dst[offset + i] * (1 - a) + color[i] * a);
  }
  dst[offset + 3] = Math.round(dst[offset + 3] * (1 - a) + 255 * a);
}

/** Distance to a rounded rectangle, negative inside. */
function roundedRectDistance(x, y, size, radius) {
  const half = size / 2;
  const dx = Math.abs(x - half) - (half - radius);
  const dy = Math.abs(y - half) - (half - radius);
  const ox = Math.max(dx, 0);
  const oy = Math.max(dy, 0);
  return Math.sqrt(ox * ox + oy * oy) + Math.min(Math.max(dx, dy), 0) - radius;
}

/** Classic implicit heart curve, negative inside. */
function heartValue(nx, ny) {
  const t = nx * nx + ny * ny - 1;
  return t * t * t - nx * nx * ny * ny * ny;
}

/** Boolean membership tests, sampled many times per pixel for clean edges. */
function shapesAt(px, py, size) {
  const scale = size / 512;

  const plate = roundedRectDistance(px, py, size, size * 0.22) <= 0;

  let leaf = false;
  for (const dir of [-1, 1]) {
    const cx = size / 2 + dir * 88 * scale;
    const cy = size * 0.735;
    const angle = dir * 0.55;
    const rx = (px - cx) * Math.cos(angle) + (py - cy) * Math.sin(angle);
    const ry = -(px - cx) * Math.sin(angle) + (py - cy) * Math.cos(angle);
    if ((rx / (78 * scale)) ** 2 + (ry / (26 * scale)) ** 2 <= 1) leaf = true;
  }

  const nx = (px - size / 2) / (size * 0.315);
  const ny = -(py - size * 0.435) / (size * 0.30);
  const heart = heartValue(nx, ny) <= 0;

  return { plate, leaf: leaf && plate, heart: heart && plate };
}

function drawIcon(size) {
  const rgba = Buffer.alloc(size * size * 4, 0);
  const step = 1 / SAMPLES;
  const total = SAMPLES * SAMPLES;

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let plateHits = 0;
      let leafHits = 0;
      let heartHits = 0;

      for (let sy = 0; sy < SAMPLES; sy += 1) {
        for (let sx = 0; sx < SAMPLES; sx += 1) {
          const px = x + (sx + 0.5) * step;
          const py = y + (sy + 0.5) * step;
          const hit = shapesAt(px, py, size);
          if (hit.plate) plateHits += 1;
          if (hit.leaf) leafHits += 1;
          if (hit.heart) heartHits += 1;
        }
      }

      const offset = (y * size + x) * 4;
      blend(rgba, offset, BLUSH, plateHits / total);
      blend(rgba, offset, SAGE, leafHits / total);

      if (heartHits) {
        // Straight vertical gradient — lighter at the top, no banding.
        const t = Math.max(0, Math.min(1, 1 - (y / size - 0.15) * 2.2));
        const color = CORAL.map((channel, i) => Math.round(channel * (1 - t) + CORAL_LIGHT[i] * t));
        blend(rgba, offset, color, heartHits / total);
      }
    }
  }

  return encodePng(size, size, rgba);
}

const TARGETS = [['icon-192.png', 192], ['icon-512.png', 512], ['apple-touch-icon.png', 180]];
const force = process.argv.includes('--force');

// Runs as a postinstall hook, so it must never take the build down with it.
try {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const [name, size] of TARGETS) {
    const target = path.join(OUT_DIR, name);
    if (!force && fs.existsSync(target)) {
      console.log(`${name} already exists — skipping`);
      continue;
    }
    fs.writeFileSync(target, drawIcon(size));
    console.log(`wrote ${name} (${size}x${size})`);
  }
} catch (err) {
  console.warn(`icon generation skipped: ${err.message}`);
}
