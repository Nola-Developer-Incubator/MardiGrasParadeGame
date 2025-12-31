#!/usr/bin/env node
/* Auto bump version script (CommonJS version)
   Compatible with package.json "type": "module" projects by using .cjs
*/
const fs = require('fs');
const { execSync } = require('child_process');
const path = require('path');

function run(cmd) {
  return execSync(cmd, { stdio: 'pipe' }).toString().trim();
}
function safeRun(cmd) {
  try { return run(cmd); } catch (e) { return null; }
}

// Minimal argv parsing
const raw = process.argv.slice(2);
const argv = { mode: 'auto', dryRun: false, push: false };
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a.startsWith('--mode=')) argv.mode = a.split('=')[1];
  else if (a === '--mode' && raw[i+1]) { argv.mode = raw[i+1]; i++; }
  else if (a === '--dry-run' || a === '--dry' || a === '--dryrun') argv.dryRun = true;
  else if (a === '--push') argv.push = true;
}

const MODE = argv.mode; const DRY = argv.dryRun; const PUSH = argv.push;

const repoRoot = path.resolve(__dirname, '..');
process.chdir(repoRoot);
console.log('[auto-bump-version] Running in', MODE, 'mode', DRY ? '(dry-run)' : '', PUSH ? '(will push)' : '');

// 1) Run type-check
console.log('[auto-bump-version] Running type-check (npm run check)...');
try {
  execSync('npm run check', { stdio: 'inherit' });
} catch (e) {
  console.error('[auto-bump-version] Type-check failed. Aborting bump.');
  process.exit(2);
}

// 2) Determine changed files if auto mode
let classification = null; // 'visual' or 'overall'
if (MODE === 'visual' || MODE === 'overall') {
  classification = MODE;
} else {
  let diffList = null;
  try {
    diffList = safeRun('git fetch origin main --depth=1 2>/dev/null && git diff --name-only origin/main...HEAD');
    if (!diffList) throw new Error('no origin/main');
  } catch (e) {
    diffList = safeRun('git diff --name-only HEAD~1..HEAD');
  }
  if (!diffList) diffList = '';
  const files = diffList.split(/\r?\n/).filter(Boolean);
  console.log('[auto-bump-version] Changed files (sample up to 20):', files.slice(0,20));

  const nonVisualPatterns = [
    /^server\//,
    /^shared\//,
    /^tests?\//,
    /^scripts\//,
    /^\.github\//,
    /^package.json$/,
    /^drizzle.config.ts$/,
    /^\.vscode\//,
    /^\.eslintrc/,
    /^api\//
  ];
  const visualPatterns = [
    /^client\/src\//,
    /^client\/public\//,
    /^client\/assets\//,
    /^client\/public\/textures\//,
    /^client\/src\/components\//,
  ];

  if (files.length === 0) {
    console.log('[auto-bump-version] No changed files detected; defaulting to overall.');
    classification = 'overall';
  } else {
    const anyNonVisual = files.some(f => nonVisualPatterns.some(rx => rx.test(f)));
    if (anyNonVisual) classification = 'overall';
    else {
      const someVisual = files.some(f => visualPatterns.some(rx => rx.test(f)));
      if (someVisual) classification = 'visual'; else classification = 'overall';
    }
  }
}

console.log('[auto-bump-version] Classified as:', classification);

// 3) Read and bump package.json
const pkgPath = path.resolve(repoRoot, 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const oldVersion = pkg.version;
if (!oldVersion) { console.error('[auto-bump-version] package.json has no version field. Aborting.'); process.exit(3); }
const semver = oldVersion.split('.').map(n => parseInt(n, 10));
if (semver.length !== 3 || semver.some(n => Number.isNaN(n))) { console.error('[auto-bump-version] Unsupported version format:', oldVersion); process.exit(4); }
let [major, minor, patch] = semver;
let candidate = patch + 1;
function nextWithParity(start, wantOdd) {
  let v = start;
  if ((v % 2 === 1) !== wantOdd) v++;
  return v;
}
const wantOdd = classification === 'visual';
let nextPatch = nextWithParity(candidate, wantOdd);
if (nextPatch <= patch) nextPatch = patch + 1 + (wantOdd ? 1 : 0);
const newVersion = `${major}.${minor}.${nextPatch}`;
console.log(`[auto-bump-version] Bumping version: ${oldVersion} -> ${newVersion} (${classification})`);

if (DRY) { console.log('[auto-bump-version] dry-run mode, not writing files.'); process.exit(0); }

// 4) Ensure git working directory is clean
const status = safeRun('git status --porcelain');
if (status && status.trim().length > 0) { console.error('[auto-bump-version] Git working directory is not clean. Please commit or stash changes before running this script.'); process.exit(5); }

// 5) Write package.json
pkg.version = newVersion; fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log('[auto-bump-version] Wrote package.json with new version.');

// 6) Commit and tag
try {
  run('git add package.json');
  run(`git commit -m "chore(release): bump version ${newVersion} — ${classification}"`);
  run(`git tag -a v${newVersion} -m "Release ${newVersion} (${classification})"`);
  console.log('[auto-bump-version] Committed and created tag v' + newVersion);
} catch (e) { console.error('[auto-bump-version] Git commit/tag failed:', e.message); process.exit(6); }

// 7) Append to releases-log.md
const logPath = path.resolve(repoRoot, 'docs', 'releases-log.md');
const now = new Date().toISOString();
const entry = `- ${now} - v${newVersion} - ${classification} - auto-bump\n`;
try { fs.mkdirSync(path.dirname(logPath), { recursive: true }); fs.appendFileSync(logPath, entry, 'utf8'); run('git add ' + logPath); run('git commit -m "chore(release): add release log entry for v' + newVersion + '"'); } catch (e) { console.warn('[auto-bump-version] Could not append to releases-log.md:', e.message); }

// 8) Push if requested
if (PUSH) {
  try { run('git push origin HEAD'); run(`git push origin v${newVersion}`); console.log('[auto-bump-version] Pushed commit and tag to origin.'); } catch (e) { console.error('[auto-bump-version] Push failed:', e.message); process.exit(7); }
}
console.log('[auto-bump-version] Done. New version is', newVersion);
process.exit(0);

