#!/usr/bin/env node

/**
 * Project installer/setup script
 * - Verifies environment (Node, npm, Expo CLI)
 * - Installs dependencies
 * - Optionally runs Expo prebuild (if user chooses)
 * - Optionally starts the dev server
 *
 * Usage: node ./scripts/install.js
 */

const { execSync, spawn } = require('child_process');
const readline = require('readline');

const run = (cmd, opts = {}) => {
  try {
    execSync(cmd, { stdio: 'inherit', ...opts });
  } catch (e) {
    throw new Error(`Command failed: ${cmd}\n${e.message}`);
  }
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (q) =>
  new Promise((resolve) => {
    rl.question(q, (answer) => resolve((answer || '').trim().toLowerCase()));
  });

const checkBinary = (name, args = ['--version']) => {
  try {
    execSync(`${name} ${args.join(' ')}`, { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
};

(async () => {
  console.log('🔎 Checking environment...');
  const hasNode = checkBinary('node', ['-v']);
  const hasNpm = checkBinary('npm', ['-v']);
  if (!hasNode || !hasNpm) {
    console.error('❌ Node.js and npm are required. Install from https://nodejs.org');
    process.exit(1);
  }

  const hasExpo = checkBinary('npx', ['expo', '--version']);
  if (!hasExpo) {
    console.log('⬇️  Installing Expo CLI (via npx on first use)...');
  }

  console.log('\n📦 Installing dependencies (npm ci if lockfile exists, else npm install)...');
  const useCi = checkBinary('test', ['-f', 'package-lock.json']); // not portable across shells, fallback below
  try {
    run('test -f package-lock.json && npm ci || npm install', { shell: true });
  } catch {
    // On Windows without sh, fall back to npm install
    run('npm install');
  }

  // Offer to run expo prebuild
  let doPrebuild = await ask('⚙️  Do you want to run Expo prebuild to generate native projects? (y/N): ');
  doPrebuild = doPrebuild === 'y';
  if (doPrebuild) {
    console.log('\n🏗️  Running expo prebuild...');
    try {
      run('npx expo prebuild');
    } catch (e) {
      console.warn('⚠️  Prebuild failed or was cancelled. You can run it later with "npx expo prebuild".');
    }
  }

  // Offer to start the dev server
  let doStart = await ask('▶️  Start the development server now? (Y/n): ');
  doStart = doStart === '' || doStart === 'y';
  if (doStart) {
    console.log('\n🚀 Starting Expo dev server...');
    const child = spawn(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['expo', 'start'], {
      stdio: 'inherit',
      shell: false,
    });
    child.on('exit', (code) => {
      rl.close();
      process.exit(code || 0);
    });
  } else {
    rl.close();
    console.log('\n✅ Setup complete.\n• Run "npx expo start" to begin.\n');
  }
})().catch((err) => {
  rl.close();
  console.error(`\n❌ Installer encountered an error:\n${err.message}\n`);
  process.exit(1);
});