import { deflateSync } from 'zlib';
import { mkdirSync, writeFileSync } from 'fs';

function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xffffffff;
  for (const b of data) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const [xi, yi] = points[i];
    const [xj, yj] = points[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function pointInRoundedRect(x, y, left, top, right, bottom, radius) {
  const cx = Math.max(left + radius, Math.min(x, right - radius));
  const cy = Math.max(top + radius, Math.min(y, bottom - radius));
  return (x - cx) ** 2 + (y - cy) ** 2 <= radius ** 2;
}

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len = dx * dx + dy * dy;
  const t = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len));
  const x = ax + t * dx;
  const y = ay + t * dy;
  return Math.hypot(px - x, py - y);
}

function makePNG(size) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 2;

  const row = 1 + size * 3;
  const raw = Buffer.alloc(row * size);
  const bg = [0xf7, 0xf7, 0xf4];
  const terra = [0xc2, 0x73, 0x3a];
  const ink = [0x08, 0x06, 0x03];
  const samples = 4;
  const mark = [
    [0.328, 0.219],
    [0.672, 0.219],
    [0.672, 0.79],
    [0.5, 0.675],
    [0.328, 0.79],
  ];
  const check = [
    [0.383, 0.508],
    [0.477, 0.602],
    [0.664, 0.383],
  ];

  for (let y = 0; y < size; y++) {
    raw[y * row] = 0;
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;

      for (let sy = 0; sy < samples; sy++) {
        for (let sx = 0; sx < samples; sx++) {
          const nx = (x + (sx + 0.5) / samples) / size;
          const ny = (y + (sy + 0.5) / samples) / size;
          let color = bg;

          if (pointInRoundedRect(nx, ny, 0, 0, 1, 1, 0.219)) color = terra;
          if (pointInPolygon(nx, ny, mark)) color = bg;

          const checkWidth = 0.047;
          const onCheck =
            distanceToSegment(nx, ny, check[0][0], check[0][1], check[1][0], check[1][1]) < checkWidth ||
            distanceToSegment(nx, ny, check[1][0], check[1][1], check[2][0], check[2][1]) < checkWidth;
          if (onCheck) color = ink;

          r += color[0];
          g += color[1];
          b += color[2];
        }
      }

      const count = samples * samples;
      raw[y * row + 1 + x * 3] = Math.round(r / count);
      raw[y * row + 1 + x * 3 + 1] = Math.round(g / count);
      raw[y * row + 1 + x * 3 + 2] = Math.round(b / count);
    }
  }

  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', deflateSync(raw, { level: 0 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function makeICO(png) {
  const header = Buffer.alloc(22);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);
  header[6] = 32;
  header[7] = 32;
  header[8] = 0;
  header[9] = 0;
  header.writeUInt16LE(1, 10);
  header.writeUInt16LE(32, 12);
  header.writeUInt32LE(png.length, 14);
  header.writeUInt32LE(22, 18);
  return Buffer.concat([header, png]);
}

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192x192.png', makePNG(192));
writeFileSync('public/pwa-512x512.png', makePNG(512));
writeFileSync('public/apple-touch-icon.png', makePNG(180));
writeFileSync('public/favicon.ico', makeICO(makePNG(32)));
console.log('Generated app icons: favicon.ico, pwa-192x192.png, pwa-512x512.png, apple-touch-icon.png');
