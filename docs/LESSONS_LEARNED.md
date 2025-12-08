# Lessons Learned — Mardi Gras Parade Simulator

Date: 2025-12-08

Summary
- The dev environment had a few fragile points that prevented quick iterative testing. We addressed them to make local development reliable.

Key issues and fixes

1. Dev server instability
- Problem: The dev server (Vite + custom Express integration) was exiting on transformation errors due to `process.exit(1)` behavior in a custom Vite logger and some middleware that re-threw errors.
- Fix: Removed calls to `process.exit` in `server/vite.ts` custom logger and changed the middleware to return a 500 response instead of throwing. Also hardened the Express error handler to log but not re-throw.

2. Asset serving & 404s
- Problem: Textures and other static assets were not consistently served in dev causing `Could not load /textures/asphalt.png` errors.
- Fix: Serve `client/public` statically in development inside `server/vite.ts` to ensure `/textures/*` routes resolve.

3. Uncaught runtime errors causing white screen
- Problem: Texture loader errors and heavy R3F scene geometry resulted in uncaught exceptions and ultimately WebGL context loss (blank/white canvas).
- Fixes:
  - Guarded texture loading in `Environment.tsx` using `THREE.TextureLoader` with an onError handler and a fallback plain material.
  - Introduced a DEV low-detail mode to reduce geometry counts and disable high-res shadows when running in dev (detected safely via `import.meta.env.DEV`).
  - Added `CanvasGuard` to detect WebGL context lost/restore and show an on-screen reload overlay.
  - Added a dev-only global error overlay to make JavaScript runtime exceptions visible and easy to copy.

4. Headless testing tooling
- Problem: The headless test script initially had accidental PowerShell text embedded in the JS file.
- Fix: Cleaned `scripts/headless-puppeteer.mjs` and added `scripts/headless-playtest.mjs` earlier. Provide both Playwright and Puppeteer options for headless testing.

Developer ergonomics improvements
- Added defensive coding patterns, small feature toggles for dev/production differences, and explicit logging paths (`dev-log.txt`, `dev-err.txt`) to make local debugging reproducible.

Recommendations
- Keep dev defaults low-detail to ensure stability for contributors on low-end GPUs or CI runners.
- If adding large textures/models, add a small pre-flight check to ensure assets are present before initiating heavy rendering.
- Add an automated smoke test in CI (Playwright) that runs a simple start-game flow and captures console logs.


---

If you want, I can convert these notes into a PR description and attach the automated smoke test as a GitHub Action that runs on PRs and nightly builds.
