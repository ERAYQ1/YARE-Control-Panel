const { execSync } = require('child_process');
const path = require('path');
const os = require('os');

const rootDir = path.resolve(__dirname, '..');

function run(cmd, cwd = rootDir, env = {}) {
  console.log(`\n> Executing: ${cmd}`);
  execSync(cmd, {
    cwd,
    stdio: 'inherit',
    env: { ...process.env, ...env },
  });
}

try {
  console.log('🚀 Building YARE Control Panel Frontend SPA...');
  run('npm run build', path.join(rootDir, 'apps', 'frontend'));

  console.log('\n📁 Copying static assets to backend dist...');
  require('./copy-dist.js');

  console.log('\n🔨 Compiling Go backend with embedded Frontend...');
  const isWin = os.platform() === 'win32';
  const binaryName = isWin ? 'yare-panel.exe' : 'yare-panel';
  const outPath = path.join(rootDir, binaryName);

  run(`go build -ldflags="-s -w" -o "${outPath}" main.go`, path.join(rootDir, 'apps', 'backend'), {
    CGO_ENABLED: '0',
    GOOS: isWin ? 'windows' : 'linux',
  });

  console.log(`\n✅ Build successful! Output: ${binaryName}`);
} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
}
