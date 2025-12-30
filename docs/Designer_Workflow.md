# Designer Workflow (Short)

This page outlines practical steps for designers to add assets and prepare submissions.

1. Art & Textures
  - Place source assets in `client/public/images/` or `client/public/textures/`.
  - Preferred formats: PNG (UI), WebP (compressed), GLB for models.
  - Sizes: textures <= 2048x2048.

2. Audio
  - Place in `client/public/sounds/` and follow `wiki/Audio.md` guidance.

3. Preview & Checklist
  - Provide a thumbnail (512x512 PNG) and a checklist:
    - [ ] Texture sizes ok
    - [ ] Naming convention followed
    - [ ] Alpha preserved or flattened

4. Submit
  - Create a PR with:
    - Files added under `client/public/assets/<asset-name>/`
    - A preview image in PR description (attach thumbnail)
    - A short checklist mention and tags: `design`, `asset`

5. QA
  - Designers should test in the running dev server and link replay or screenshots in the PR.

  ## What's done (short summary)
  The following core features are implemented in the current codebase and should be considered when testing design assets and gameplay interactions:
  - Player movement: keyboard (WASD), click-to-move, and touch controls (optional on-screen joystick).
  - Parade floats: moving floats that spawn/throw collectibles with simple physics.
  - Collectibles: beads, doubloons, cups, king cake, and power-ups (speed, double points).
  - Scoring: base points, combo system (chain catches), and color-match bonus.
  - Power-up effects: temporary speed boost and double points.
  - Level progression basics: floats-per-level and target scores implemented.
  - Mobile optimizations: touch controls and optional joystick UI.
  - Leaderboard & persistence: score submission and basic leaderboard storage (see `data/leaderboard.json` and server endpoints).
  - Settings & UI: audio controls, camera modes, and basic HUD elements.

  ## Testable features (manual + automated checklist)
  Use this checklist when opening a PR for design changes or when validating gameplay/asset behavior.

  Manual smoke tests (quick, run on local dev server):
  - [ ] Dev server runs: `npm run dev` and open http://localhost:5000; no console errors on page load.
  - [ ] Player movement: verify WASD movement, click-to-move, and (on mobile/emulated) joystick/touch movement cause the player to move.
    - Steps: open the main scene, press WASD or click in world space, observe player translation.
  - [ ] Collectible spawn & catch: watch floats spawn collectibles; move into a collectible and verify the score increments and collectible disappears.
    - Steps: let a float pass near the player, approach or catch with tap/click, confirm score update and sound effect.
  - [ ] Combo & color match: catch items in quick succession and catch an item that matches the assigned color; observe combo counter and point multipliers.
  - [ ] Power-ups: obtain a speed or double-points power-up and verify the temporary effect (movement speed change or doubled score) and visual/audio feedback.
  - [ ] Leaderboard submission: submit a score via the UI (end-level or submit flow) and verify the score appears in `data/leaderboard.json` (or via the server API `/api/leaderboard`).
  - [ ] Audio & settings: toggle audio settings (music/sfx) and confirm volumes change or mute works.
  - [ ] Camera modes: toggle third/first-person and ensure camera updates as expected.
  - [ ] Mobile layout: in DevTools device emulation or a real device, enable joystick and confirm layout/controls are usable.

  Automated tests / Playwright (where available):
  - [ ] Run Playwright smoke tests: `npx playwright test` (see `tests/playwright/` and `tests/e2e/playwright` for test locations).
  - [ ] Joystick UI test: Playwright includes a test to assert the joystick toggles in settings and appears when enabled (`docs/tickets/joystick_ticket.md` includes acceptance criteria).

  How to report issues found during QA:
  - Add a short reproduction in the PR or issue: steps to reproduce, expected vs actual, screenshots or short video/GIF and device info (browser + OS).
  - If the issue is visual/asset-related, attach the source asset and provide a suggested fix (scale, pivot, texture size, alpha handling).
  - Reference the failing Playwright test (if applicable) and include browser logs when relevant.

If you need a template asset checklist file, I can add `docs/ASSET_SUBMISSION_TEMPLATE.md` to the repo.

---
