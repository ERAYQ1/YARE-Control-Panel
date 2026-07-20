const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'apps', 'frontend', 'dist');
const destDir = path.join(__dirname, '..', 'apps', 'backend', 'dist');

if (!fs.existsSync(srcDir)) {
  console.error(`[Error] Source directory does not exist: ${srcDir}`);
  console.error('Please run "npm run build:frontend" first.');
  process.exit(1);
}

// Ensure destination exists
fs.mkdirSync(destDir, { recursive: true });

// Copy recursively
fs.cpSync(srcDir, destDir, { recursive: true, force: true });
console.log(`[OK] Successfully copied frontend assets to ${destDir}`);
