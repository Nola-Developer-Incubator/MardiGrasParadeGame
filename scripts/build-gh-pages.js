#!/usr/bin/env node
import { execSync } from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';

// Compute a relative base path for GitHub Pages if running in CI with GITHUB_REPOSITORY
const repo = process.env.GITHUB_REPOSITORY || '';
const base = process.env.GH_PAGES_BASE || (repo.includes('/') ? `/${repo.split('/')[1]}/` : '/');

console.log('Using base:', base);

const clientIndexPath = path.resolve(process.cwd(), 'client', 'index.html');
const backupPath = path.resolve(process.cwd(), 'client', 'index.html.bak');

try {
  console.log('Preparing client index.html with base...');
  // Backup original
  if (fs.existsSync(clientIndexPath)) {
    fs.copyFileSync(clientIndexPath, backupPath);
    const content = fs.readFileSync(clientIndexPath, 'utf-8');
    const replaced = content.replace(/%BASE%/g, base);
    fs.writeFileSync(clientIndexPath, replaced, 'utf-8');
  }

  console.log('Building client with GH_PAGES_BASE set...');
  const buildCmd = os.platform() === 'win32' ? 'cmd /c "npm run build"' : 'npm run build';
  execSync(buildCmd, {
    stdio: 'inherit',
    cwd: process.cwd(),
    env: { ...process.env, GH_PAGES_BASE: base },
    shell: true,
  });
  console.log('Build complete.');
} catch (err) {
  console.error('Build failed:', err);
  // Restore original if backup exists
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, clientIndexPath);
    fs.unlinkSync(backupPath);
  }
  process.exit(1);
} finally {
  // Restore original index.html if backup exists
  if (fs.existsSync(backupPath)) {
    fs.copyFileSync(backupPath, clientIndexPath);
    fs.unlinkSync(backupPath);
  }
}
