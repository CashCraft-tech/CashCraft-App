#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const hasSpaces = projectRoot.includes(' ');

console.log('\n\x1b[1mCashCraft dev server\x1b[0m');
console.log('────────────────────────────────────────');
console.log('This app uses SDK 55 and a \x1b[1mdevelopment build\x1b[0m — not Expo Go.');
console.log('');
console.log('In Metro, you should see: \x1b[32mUsing development build\x1b[0m');
console.log('If it says \x1b[33mUsing Expo Go\x1b[0m, press \x1b[1ms\x1b[0m once to switch modes.');
console.log('');
console.log('First time on a device/simulator:');
console.log('  npm run ios      (iPhone simulator / device)');
console.log('  npm run android  (Android emulator / device)');
console.log('');
console.log('Quick test in browser: npm run web');
if (hasSpaces) {
  console.log('');
  console.log(
    '\x1b[33mNote:\x1b[0m Your project path contains spaces. Native builds may fail.'
  );
  console.log('Move or clone the repo to e.g. ~/Projects/CashCraft-App if ios/android fail.');
}
console.log('────────────────────────────────────────\n');

const child = spawn('npx', ['expo', 'start', '--dev-client'], {
  cwd: projectRoot,
  stdio: 'inherit',
  shell: true,
});

child.on('exit', (code) => process.exit(code ?? 0));
