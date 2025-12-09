# Next Steps — Visual Quality & Playability Roadmap

Date: 2025-12-08

Goal: Improve the visual fidelity and playability of the Mardi Gras Parade Simulator while keeping performance stable across desktop and mobile devices.

## Progress update (2025-12-09)
- Renamed bot identifiers to `test-bot-#` for easier testing and visibility in UI and logs.
- Improved audio initialization and mute/unlock handling so background music and SFX respect user gesture/autoplay policies.
- Added a small utility script `scripts/generate-qr.mjs` and `npm run qr` to create a QR code (terminal + SVG) that points to the dev server (default http://localhost:5000) to make connecting from a phone easier.

Milestone 1 — Immediate stability & polish (1-2 days)
- Make the default dev profile low-detail to prevent WebGL context loss (already implemented).
- Replace fallback textures with optimized compressed formats (e.g., WebP/AVIF) and add simple low-res fallbacks.
- Audit and fix any console errors found during headless smoke tests (texture load, missing assets).
- Add a visible FPS counter in dev (R3F Perf) for quick performance checks.

Milestone 2 — Visual improvements (2-4 days)
- Use instancing for crowd silhouettes and repeated geometry to reduce draw calls.
- Add baked ambient occlusion and lightmap textures for static objects (buildings, curbs) where appropriate.
- Implement LOD (level of detail) switching for floats and collectible models.
- Improve materials: use optimized PBR maps (albedo, roughness, normal) and proper mipmaps.

Milestone 3 — Playability & UX (2-4 days)
- Refine player input (tune move speed, smoothing, deadzones for joystick) and test on mobile.
- Improve tutorial and HUD clarity: concise instructions, visual callouts for first-time players.
- Add accessibility options: toggle large UI, high contrast, reduce motion.
- Implement better camera framing and dynamic adjustments for different aspect ratios.

Milestone 4 — Automation & testing (1-2 days)
- Add Playwright cross-browser smoke tests in CI (with caching for browsers) to avoid flaky installs.
- Add nightly or scheduled jobs to run the smoke test and upload artifacts.
- Add an automated performance budget check (fail CI if FPS < target or assets exceed budgets).

Milestone 5 — Release polish
- Create an optimized production asset pipeline (texture compression, LQ/HD build variants).
- Finalize onboarding/tutorial flow and record a short demo video for release notes.

Owners & Estimates
- Visual improvements: 2-4 days
- Playability & UX: 2-4 days
- CI & automation: 1-2 days

Notes
- Prioritize instancing and LOD first — they provide large FPS gains with relatively small code changes.
- Use device emulation and a small set of physical test devices for validation.

## How to test (quick checklist)
- Bots: Start the game and verify the competitor list shows unique names (King Rex, Queen Zulu, Saint Mardi, Jester Jo, Voodoo Vee, Mambo Mike). Observe logs for `caught` messages showing the display name and persona.
- Bot behavior: Each bot has a `persona` that affects speed and preference. Observe different movement and idle patterns (aggressive rushes, playful wiggles, sneaky maneuvers).
- Audio: From the tutorial overlay press `Enable Audio` then `Start Game`. Background music and SFX should play when unmuted. Use the volume toggle in the HUD to mute/unmute — background music will pause when muted and resume when unmuted.
- Mobile QR: Run `npm run qr` and scan the terminal QR or open `docs/browser-qr.svg` (set env URL if using LAN IP).
