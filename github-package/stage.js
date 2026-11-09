import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const pkgDir = __dirname;

console.log('[GitHub Packages Staging] Staging distribution files for @ayushcmd/dinoloader...');

const rootDist = path.join(rootDir, 'dist');
const targetDist = path.join(pkgDir, 'dist');

if (!fs.existsSync(rootDist)) {
  console.error('[Error] Root dist directory not found. Please run "npm run build" in root first.');
  process.exit(1);
}

// 1. Copy dist directory
if (fs.existsSync(targetDist)) {
  fs.rmSync(targetDist, { recursive: true, force: true });
}
fs.cpSync(rootDist, targetDist, { recursive: true });
console.log('✓ Reused root dist/ files');

// 2. Copy README.md and LICENSE
fs.copyFileSync(path.join(rootDir, 'README.md'), path.join(pkgDir, 'README.md'));
console.log('✓ Copied README.md');

fs.copyFileSync(path.join(rootDir, 'LICENSE'), path.join(pkgDir, 'LICENSE'));
console.log('✓ Copied LICENSE');

// 3. Verify staged bundle structure
const requiredFiles = [
  'dist/index.js',
  'dist/index.cjs',
  'dist/index.d.ts',
  'dist/react.js',
  'dist/react.cjs',
  'dist/react.d.ts',
  'dist/style.css',
  'README.md',
  'LICENSE',
  'package.json'
];

let missing = false;
for (const relPath of requiredFiles) {
  const fullPath = path.join(pkgDir, relPath);
  if (!fs.existsSync(fullPath)) {
    console.error(`✗ Missing required file: ${relPath}`);
    missing = true;
  }
}

if (missing) {
  console.error('[Error] Staging verification failed due to missing files.');
  process.exit(1);
}

console.log('✓ Staging complete and verified successfully for @ayushcmd/dinoloader!\n');
