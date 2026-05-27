// PWA 아이콘 생성 스크립트 (Node.js 내장 모듈만 사용, 외부 패키지 없음)
import { deflateSync } from 'zlib';
import { writeFileSync, mkdirSync } from 'fs';

function crc32(data) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let j = 0; j < 8; j++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1;
    table[i] = c;
  }
  let crc = 0xFFFFFFFF;
  for (const b of data) crc = table[(crc ^ b) & 0xFF] ^ (crc >>> 8);
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function chunk(type, data) {
  const t = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crcBuf]);
}

function makePNG(size, r, g, b) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(size, 0);
  ihdrData.writeUInt32BE(size, 4);
  ihdrData[8] = 8;  // bit depth
  ihdrData[9] = 2;  // color type: RGB
  const row = 1 + size * 3;
  const raw = Buffer.alloc(row * size);
  for (let y = 0; y < size; y++) {
    raw[y * row] = 0; // filter: None
    for (let x = 0; x < size; x++) {
      raw[y * row + 1 + x * 3] = r;
      raw[y * row + 1 + x * 3 + 1] = g;
      raw[y * row + 1 + x * 3 + 2] = b;
    }
  }
  return Buffer.concat([
    sig,
    chunk('IHDR', ihdrData),
    chunk('IDAT', deflateSync(raw, { level: 0 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

// 브랜드 accent 색상: oklch(62% 0.14 55) ≈ #c2733a (terracotta)
const [R, G, B] = [0xc2, 0x73, 0x3a];

mkdirSync('public', { recursive: true });
writeFileSync('public/pwa-192x192.png', makePNG(192, R, G, B));
writeFileSync('public/pwa-512x512.png', makePNG(512, R, G, B));
writeFileSync('public/apple-touch-icon.png', makePNG(180, R, G, B));
console.log('✓ 아이콘 3개 생성 완료 (192×192, 512×512, apple-touch-icon 180×180)');
