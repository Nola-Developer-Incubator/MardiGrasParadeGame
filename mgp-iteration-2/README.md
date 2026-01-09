# MGP Iteration 2 — Mobile UX & Unreal MCP

This repository contains the Iteration 2 scaffold for the Mardi Gras Parade game: a mobile-first rebuild that applies lessons learned from previous work (controls, CI, Playwright tests, GitHub Pages deployment guidance) and integrates a minimal MCP helper to support Unreal Editor workflows.

This README captures the feature backlog, sprint plan, acceptance criteria, and how to run and test the iteration locally and in CI. It is intended to be the single source of truth for the Iteration 2 work.

---

## Quick start

Requirements: Node.js 18+, npm

```bash
cd mgp-iteration-2
npm install --legacy-peer-deps
# dev server
npm run dev
# or build + serve
npm run build
npx http-server ./dist/public -p 5174 -c-1
```

Open http://localhost:5174 or the port printed by Vite.

To run Playwright tests locally:

```bash
# install playwright browsers once
npx playwright install --with-deps
# run tests
npx playwright test --project="Pixel 5"
```

---

## Goal for Iteration 2

- Provide robust mobile controls (thumbstick, handedness, flip/sensitivity) with accessibility and improved UX for young players.
- Add a simple, local MCP helper to exchange controls and mapping data with Unreal 5.7 Editor workflows.
- Add Playwright E2E tests with CI that run on PRs and validate both built site and deployed GH Pages preview.
- Add a practical backlog and sprint plan and implement the highest priority items (controls, tutorial, float avoidance, basic performance guidance).

---

## What's included

- Client skeleton (React + react-three-fiber) with:
  - Mobile thumbstick (`TouchControls`) with smoothing and flip/sensitivity.
  - `Player` controlled via keyboard/joystick with deadzone & smoothing.
  - `HUD` with handedness, Flip X, and sensitivity controls.
  - `Tutorial` interactive step-by-step overlay.
  - `SpawnManager` with simple float visuals and avoidance behavior.
- MCP helper server (`mcp/server.js`): exposes `/mcp/controls` and `/mcp/unreal/blueprint`.
- Unreal editor helpers:
  - `mcp/unreal_plugin.py` (IDE-side Python poller that writes JSON presets)
  - `mcp/unreal_create_blueprint.py` (Editor Python script for in-editor asset creation; to be run in UE Python environment)
- Playwright tests and CI workflows to run smoke & interaction tests.
- Docs: `docs/unreal_mcp.md`, `docs/performance.md`, plus this README.

---

## Backlog (derived from project Product Backlog)

Priorities follow the canonical project backlog (P0 highest priority):

| ID | Title | Priority | Estimate | Status |
|----|-------|----------|:-------:|--------|
| PB-001 | Mobile & Desktop Joystick Improvements | P0 | 8 | In Progress (core controls implemented) |
| PB-002 | Minimal HUD / Compact UI Mode | P0 | 5 | To Do |
| PB-003 | Audio toggle persistence | P0 | 2 | To Do |
| PB-004 | Session analytics & cloud save (Supabase) | P0 | 13 | To Do |
| PB-005 | Visual remaining floats indicator | P1 | 3 | To Do |
| PB-006 | Helper bot spawn on combo/purchase | P1 | 5 | To Do |
| PB-007 | Leaderboard MVP (serverless) | P2 | 8 | Backlog |
| PB-008 | Shop UI (cosmetics) | P2 | 13 | Backlog |

These items are expanded as acceptance criteria in the backlog document: see `../docs/PRODUCT_BACKLOG.md`.

---

## Sprint plan (next 4 weeks)

Sprint A (2w): Controls & Stability (current)
- PB-001 Joystick improvements — finish multi-touch edge cases, improve hit targets, add tests.
- PB-002 Minimal HUD — implement compact mode for small screens.
- PB-003 Audio toggle persistence — fix cross-platform quirks.
- PB-005 Visual remaining floats indicator — small HUD widget.

Sprint B (2w): Backend & Persistence
- PB-004 Session save + cloud save MVP (Supabase or SQLite depending on constraints).
- PB-007 Leaderboard MVP (serverless function).
- PB-002 complete polish & analytics.

Acceptance criteria for sprint items are defined in `docs/PRODUCT_BACKLOG.md`.

---

## Definition of done

- Code compiles and lints (where applicable). Unit/CI tests pass.
- Playwright smoke tests pass locally and in GitHub Actions for PRs.
- Manual QA on mobile (iOS Safari, Chrome Android) and desktop performed.
- PR includes testing notes and screenshots; docs updated.

---

## How to test locally

- Dev workflow: `npm run dev`
- Production build + serve: `npm run build` then `npx http-server ./dist/public -p 5174 -c-1`
- Playwright tests: `npx playwright test --project="Pixel 5"` (ensure browsers are installed with `npx playwright install`)

Debug hooks:
- The client writes a hidden debug element (`#mgp-debug`) on the page with JSON for small assertions (floats count, player pos) to help Playwright make in-scene assertions.

---

## CI / GitHub Actions

- `playwright-deploy.yml` runs on PRs, builds production, serves `dist/public`, and runs Playwright tests against the built site.
- `playwright-deploy.yml` also runs a post-deploy job that tests the public GH Pages URL when `gh-pages` is updated.
- `predeploy.yml` (in repo) runs `lint:assets`, `build:gh-pages`, and verification steps before publishing.

---

## Implementation status & next actions (what I will implement)

Current progress:
- Controls (PB-001): core joystick & flip/sensitivity implemented; tutorial interactive steps implemented. ✅
- Spawn manager + avoidance: basic visuals and steering implemented. ✅
- MCP helper + Unreal editor scripts: scaffolded (Python poller + in-Editor blueprint helper). ✅
- Playwright tests & CI: smoke tests and deploy tests added and passing locally. ✅

Planned immediate work (next iteration tasks):
1. Polish float visuals & LOD (impostors) — reduce draw calls on mobile. (In progress)
2. Implement minimal HUD compact mode + float counter (PB-002 / PB-005). (Planned)
3. Add session save & basic leaderboard MVP (PB-004 / PB-007). (Planned)
4. Finalize Unreal Editor utility for blueprint generation and docs on how to use it in UE 5.7. (Planned)
5. Increase Playwright coverage (cross-browser) and add scheduled smoke checks. (Planned)

If you want, I can put these items into separate PRs with incremental demos and GIFs for review.

---

## How you can help / contribution guide

- Try the dev server and the built preview: `npm run dev` and visit the URL printed, or build and serve and test at `http://localhost:5174`.
- Run the Playwright tests locally and report failures: `npx playwright test --project="Pixel 5"`.
- Review PR #85 (MGP Iteration 2 scaffold) for content, design, and gaps.
- If you have a local UE 5.7 project and want the Editor utility tested in-Editor, tell me the project path and I will adapt the script to write directly into the project's `Content` folder (manual UE Editor run required).

---

## Release checklist

- [ ] All P0 items in sprint A implemented & QA passed
- [ ] Playwright tests stable in CI across PRs
- [ ] Preview publishing to `gh-pages/previews/<run_id>` configured with deploy token
- [ ] Release notes & demo GIFs added to PR
- [ ] Manual mobile QA on iOS & Android completed

---

If you'd like, I'll now:
- (A) Commit this README to the `mgp/iteration-2` branch and push it, or
- (B) Break down the immediate plan items into tracked issues and PR checklists and start implementing float LOD (current in-progress task).

Which option do you prefer? 

---

PR reference: https://github.com/Nola-Developer-Incubator/MardiGrasParadeGame/pull/85
