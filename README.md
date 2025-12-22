# 🎭 NDI_MardiGrasParade — Playable 3D Mardi Gras Parade

This repository provides a browser-playable 3D Mardi Gras parade experience built with React, React Three Fiber, Three.js and TypeScript.

Public playtest (GitHub Pages): https://Nola-Developer-Incubator.github.io/MardiGrasParadeGame/

Repository: https://github.com/Nola-Developer-Incubator/MardiGrasParadeGame

Summary
- Playable in the browser via GitHub Pages (see public link above).
- Local development: `npm run dev` (dev server with HMR) and `http://localhost:5000`.
- Production build served locally: `npm run build` then `npm start` (serves `dist/public` on port 5000).

Why this README changed
- This file is the canonical project entry and has been cleaned and simplified.
- Other README files in the repo have been archived and now point back here.

Quick start (developer)
1. Clone the repo:

   git clone https://github.com/Nola-Developer-Incubator/MardiGrasParadeGame.git
   cd MardiGrasParadeGame

2. Install dependencies and run dev server:

   npm ci
   npm run dev

3. Open in browser: http://localhost:5000

Build & publish (GitHub Pages)
- Local build only (inspect output):

  node ./scripts/build-gh-pages.js

- Build + publish to `gh-pages` branch (uses `gh-pages` package):

  npm run deploy:gh-pages:local

- Or use the included GitHub Actions workflow at `.github/workflows/deploy-gh-pages.yml` to publish on push to `main` or via manual dispatch. After a successful publish the site will be available at the public playtest URL above.

Troubleshooting
- Windows PowerShell may block `npm.ps1` wrappers. To allow for the session only:

  Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force

  If `npm`/`npx` still errors, use a cmd fallback: `cmd /c "npm ci"` or `cmd /c "npm run dev"`.

- If the GitHub Pages site shows a blank page, clear browser cache and unregister service workers, then reload.

Files changed in this cleanup
- This `README.md` — canonical, cleaned, includes public link.
- `client/README.md` — archived (now points to this file).
- `scripts/archived/README.md` — archived (now points to this file).
- `docs/archive/README.md` — archived (now points to this file).

Contact / Project lead
- Brian C Lundin
- Issues: https://github.com/Nola-Developer-Incubator/MardiGrasParadeGame/issues
