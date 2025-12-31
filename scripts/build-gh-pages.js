#!/usr/bin/env node
import {execSync} from 'child_process';
import os from 'os';

function computeBaseFromGitRemote() {
  try {
    const url = execSync('git config --get remote.origin.url', { encoding: 'utf8' }).trim();
    // url can be like:
    // - git@github.com:Org/Repo.git
    // - https://github.com/Org/Repo.git
    // We want '/Repo/'
    let repo = '';
    if (url.includes(':')) {
      // git@ style
      const parts = url.split(':')[1];
      repo = parts.split('/').pop();
    } else if (url.includes('/')) {
      repo = url.split('/').pop();
    }
    if (!repo) return '/';
    repo = repo.replace(/\.git$/, '');
    return `/${repo}/`;
  } catch (err) {
    // Fallback to root
    return '/';
  }
}

// Compute a relative base path for GitHub Pages if running in CI with GITHUB_REPOSITORY
const repo = process.env.GITHUB_REPOSITORY || '';
let base = process.env.GH_PAGES_BASE || (repo.includes('/') ? `/${repo.split('/')[1]}/` : '');

if (!base) {
  // If GH_PAGES_BASE not provided and GITHUB_REPOSITORY empty, try to infer from git remote
  base = computeBaseFromGitRemote();
}

if (!base) base = '/';

console.log('Using base:', base);

try {
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
  process.exit(1);
}
