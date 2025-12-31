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
const argv = { mode: 'auto', dryRun: false, push: false, pr: false };
for (let i = 0; i < raw.length; i++) {
  const a = raw[i];
  if (a.startsWith('--mode=')) argv.mode = a.split('=')[1];
  else if (a === '--mode' && raw[i+1]) { argv.mode = raw[i+1]; i++; }
  else if (a === '--dry-run' || a === '--dry' || a === '--dryrun') argv.dryRun = true;
  else if (a === '--push') argv.push = true;
  else if (a === '--pr') argv.pr = true;
}

const MODE = argv.mode; const DRY = argv.dryRun; const PUSH = argv.push; const PR_MODE = argv.pr;

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
console.log('[auto-bump-version] Bumping version: ' + oldVersion + ' -> ' + newVersion + ' (' + classification + ')');

if (DRY) { console.log('[auto-bump-version] dry-run mode, not writing files.'); process.exit(0); }

// 4) Ensure git working directory is clean
const status = safeRun('git status --porcelain');
if (status && status.trim().length > 0) { console.error('[auto-bump-version] Git working directory is not clean. Please commit or stash changes before running this script.'); process.exit(5); }

// Behavior differs if PR mode requested
if (PR_MODE) {
  // Create a release branch and commit there, do NOT tag
  const branchName = `release/v${newVersion}`;
  try {
    // Ensure we're on main and up-to-date
    run('git fetch origin main --depth=1');
    run('git checkout main');
    run('git reset --hard origin/main');

    // Create new branch
    run(`git checkout -b ${branchName}`);

    // Write package.json and release log on the new branch
    pkg.version = newVersion; fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    const logPath = path.resolve(repoRoot, 'docs', 'releases-log.md');
    const now = new Date().toISOString();
    const entry = `- ${now} - v${newVersion} - ${classification} - auto-bump\\n`;
    fs.mkdirSync(path.dirname(logPath), { recursive: true });
    fs.appendFileSync(logPath, entry, 'utf8');

    // Commit
    run('git add package.json ' + logPath);
    run(`git commit -m "chore(release): bump version ${newVersion} — ${classification}"`);

    // Push branch
    run(`git push origin ${branchName}`);
    console.log('[auto-bump-version] Pushed release branch', branchName);

    // Create PR via GitHub API if GITHUB_REPOSITORY and GITHUB_TOKEN are present
    const ghRepo = process.env.GITHUB_REPOSITORY; // owner/repo
    const ghToken = process.env.GITHUB_TOKEN;
    if (ghRepo && ghToken) {
      const [owner, repoName] = ghRepo.split('/');
      const title = `chore(release): v${newVersion} (${classification})`;
      const body = `Automated release PR for v${newVersion} (${classification}).\n\nSee docs/RELEASES.md for policy.`;
      const createPrCmd = `curl -s -X POST -H "Authorization: token ${ghToken}" -H \"Accept: application/vnd.github+json\" https://api.github.com/repos/${owner}/${repoName}/pulls -d \"{\\\"title\\\":\\\"${title}\\\",\\\"head\\\":\\\"${branchName}\\\",\\\"base\\\":\\\"main\\\",\\\"body\\\":\\\"${body}\\\"}\"`;
      const res = run(createPrCmd);
      console.log('[auto-bump-version] Created PR (response):', res.substring(0, 300));
    } else {
      console.log('[auto-bump-version] Missing GITHUB_REPOSITORY or GITHUB_TOKEN; skipping PR creation. Branch pushed:', branchName);
    }

    console.log('[auto-bump-version] PR-mode done. New version is', newVersion);
    process.exit(0);
  } catch (e) {
    console.error('[auto-bump-version] PR-mode failed:', e.message);
    process.exit(8);
  }
} else {
  // Default behavior: commit on current branch, tag, and optionally push
  try {
    // Write package.json
    pkg.version = newVersion; fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log('[auto-bump-version] Wrote package.json with new version.');

    // Commit and tag
    run('git add package.json');
    run(`git commit -m "chore(release): bump version ${newVersion} — ${classification}"`);
    run(`git tag -a v${newVersion} -m "Release ${newVersion} (${classification})"`);
    console.log('[auto-bump-version] Committed and created tag v' + newVersion);

    // Append to releases-log.md
    const logPath = path.resolve(repoRoot, 'docs', 'releases-log.md');
    const now = new Date().toISOString();
    const entry = `- ${now} - v${newVersion} - ${classification} - auto-bump\\n`;
    try { fs.mkdirSync(path.dirname(logPath), { recursive: true }); fs.appendFileSync(logPath, entry, 'utf8'); run('git add ' + logPath); run('git commit -m "chore(release): add release log entry for v' + newVersion + '"'); } catch (e) { console.warn('[auto-bump-version] Could not append to releases-log.md:', e.message); }

    if (PUSH) {
      run('git push origin HEAD');
      run(`git push origin v${newVersion}`);
      console.log('[auto-bump-version] Pushed commit and tag to origin.');
    }

    console.log('[auto-bump-version] Done. New version is', newVersion);
    process.exit(0);
  } catch (e) {
    console.error('[auto-bump-version] Git commit/tag failed:', e.message);
    process.exit(6);
  }
}
