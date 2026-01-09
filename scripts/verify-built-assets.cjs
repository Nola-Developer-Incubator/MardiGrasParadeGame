const fs = require('fs');
const path = require('path');

const dist = path.resolve(__dirname, '..', 'dist', 'public');
const index = path.join(dist, 'index.html');
if (!fs.existsSync(index)) {
  console.error('dist/public/index.html not found. Run build first.');
  process.exit(2);
}
const html = fs.readFileSync(index, 'utf8');
const re = /(?:src|href)\s*=\s*"([^"]+)"/g;
let m;
const missing = [];
while ((m = re.exec(html)) !== null) {
  const url = m[1];
  if (!/(assets\/|textures\/|sounds\/|fonts\/)/.test(url)) continue;
  // Normalize URL to a file path under dist/public
  let p = url;
  // remove leading ./ and any repo base prefix like /RepoName/
  p = p.replace(/^\.\//, '').replace(/^\/[A-Za-z0-9_-]+\//, '');
  const f = path.join(dist, p);
  if (!fs.existsSync(f)) missing.push({ url, resolved: f });
}
if (missing.length) {
  console.error('Missing built assets:');
  missing.forEach(m => console.error(`${m.url} -> ${m.resolved}`));
  process.exit(1);
} else {
  console.log('All referenced built assets exist.');
  process.exit(0);
}
