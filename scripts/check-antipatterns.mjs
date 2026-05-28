import { readFileSync, readdirSync, statSync } from 'fs';
import { dirname, extname, join, relative } from 'path';
import { fileURLToPath } from 'url';

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(rootDir, 'src');
const targetExtensions = new Set(['.ts', '.tsx', '.css']);

const checks = [
  {
    name: 'side-stripe (border-left 3px+)',
    pattern: /border-left:\s*[3-9]\d*px|border-left:\s*[1-9]\d+px/,
    allowedCount: 0,
  },
  {
    name: 'gradient text (background-clip: text)',
    pattern: /background-clip:\s*text/,
    allowedCount: 0,
  },
  {
    name: 'glassmorphism (backdrop-filter)',
    pattern: /backdrop-filter/,
    allowedCount: 0,
  },
  {
    name: 'blend overlay (mix-blend-overlay)',
    pattern: /mix-blend-overlay/,
    allowedCount: 0,
  },
  {
    name: 'pure black/white (#000 or #fff)',
    pattern: /#(?:000(?:000)?|fff(?:fff)?)\b/i,
    allowedCount: 0,
  },
  {
    name: 'chromatic accent token (amber/blue/green/violet)',
    pattern: /(?:amber|violet|emerald|teal|cyan|sky|indigo|purple|fuchsia|pink|rose)-\d{2,3}|--amber|--blue|--green|--violet/,
    allowedCount: 0,
  },
];

function collectFiles(dir) {
  const entries = readdirSync(dir);
  const files = [];

  for (const entry of entries) {
    const path = join(dir, entry);
    const stats = statSync(path);

    if (stats.isDirectory()) {
      files.push(...collectFiles(path));
      continue;
    }

    if (stats.isFile() && targetExtensions.has(extname(path))) {
      files.push(path);
    }
  }

  return files;
}

function findViolations(check, files) {
  const violations = [];

  for (const file of files) {
    const relativePath = relative(rootDir, file);
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);
    const pattern = new RegExp(check.pattern.source, check.pattern.flags.includes('g') ? check.pattern.flags : `${check.pattern.flags}g`);

    lines.forEach((line, index) => {
      pattern.lastIndex = 0;
      const matches = [...line.matchAll(pattern)];

      for (const match of matches) {
        violations.push({
          path: relativePath,
          line: index + 1,
          snippet: line.trim(),
        });
      }
    });
  }

  return violations;
}

const files = collectFiles(srcDir);
let totalViolations = 0;

for (const check of checks) {
  const violations = findViolations(check, files);
  const failed = violations.length > check.allowedCount;
  totalViolations += failed ? violations.length - check.allowedCount : 0;

  if (failed) {
    console.log(`[FAIL] ${check.name}: ${violations.length} violations`);
    violations.forEach((violation) => {
      console.log(`  ${violation.path}:${violation.line}  ${violation.snippet}`);
    });
    continue;
  }

  console.log(`[PASS] ${check.name}: ${violations.length} violations`);
}

if (totalViolations > 0) {
  console.error(`Total: ${totalViolations} violations found. Fix before merge.`);
  process.exit(1);
}

console.log('Total: 0 violations found.');
