# Game Design Document — NDI_MardiGrasParade

Version: 0.1
Date: 2025-12-28
Author: Project Team

## Overview
NDI_MardiGrasParade is a lightweight, web-native 3D arcade experience where players move along a parade route and catch themed collectibles (beads, doubloons, cups) thrown from passing floats. The core loop is short, satisfying sessions (30–120s) with strong visual feedback, simple controls, and replayability.

This document captures gameplay systems, UX/HUD requirements, controls, scoring, progression, art and audio guidance, analytics events, and acceptance criteria for features targeted in the next few sprints.

---

## Core Gameplay

- Player controls: keyboard, mouse, and optional on-screen joystick. Movement is continuous; players aim to position near falling collectibles to "catch" them.
- Floats: spawn at the top of the play area, travel along lanes, and throw collectibles at intervals. Floats can be different colors and types affecting throw patterns and rewards.
- Collectibles: three primary types (beads, doubloons, cups). Matching the player's active color grants a point multiplier.
- NPC competitors: simple AI bots that move and collect items; they provide comparative feedback and minor competition for collectibles.
- Obstacles: hazardous items (e.g., red balls) and aggressive NPCs (white squares) that can reduce score or steal recent catches.
- Power-ups: temporary effects (speed, magnet, double points) with visible timers.

---

## Controls & Input

- Desktop
  - Movement: WASD or arrow keys.
  - Mouse: click-to-move toggle; drag for camera rotation (where applicable).
  - UI: keyboard and mouse friendly UI controls.

- Mobile / Touch
  - Tap-to-move: single tap moves player toward that point.
  - Joystick: optional on-screen joystick (Settings -> Joystick Controls).
  - Catch area separation: on small screens the catch area is distinct from joystick region to avoid conflicts.

Design constraints: joystick must support multi-touch and not block core catch gestures.

---

## HUD & UX

Goals for HUD
- Minimal, non-blocking information on-screen for mobile players.
- Clear visual indicator for remaining floats and current level progress.
- Accessible controls for mute, settings, and shop.

HUD Elements
- Top-left: Level and score (compact card).
- Top-right: coins and quick toggles (mute, settings).
- Center-top: combo indicator (animated when active).
- Mobile-only: compact competitor overlay placed above joystick to avoid overlap.

Minimal HUD mode
- Shown for preview builds and an opt-in local dev mode.
- Displays only level, score, and coins (small card) plus a prominent Start button on tutorial.

---

## Scoring & Progression

- Base points per collectible: beads = 10, doubloon = 25, cup = 5.
- Color match multiplier: 3x when collectible color matches player color.
- Combo: catching multiple items within a short window increases multiplier (e.g., 2x, 3x).
- Level progression: reach a target score to advance; later levels increase spawn rate and variety.

---

## AI Competitors

- Behavior: follow waypoints, prioritize nearby collectibles, occasionally aim for player's area.
- Difficulty tuning: bot speed and aggressiveness scale per level. Ensure fairness: bots cannot "teleport" — must obey same movement constraints.

---

## Audio & Haptics

- Audio cues for: new float spawn, item thrown, catch success, combo start/end, life lost, level complete.
- Haptic feedback hooks for mobile (success vibration on major events, optional under settings).
- Audio toggle must persist across sessions.

---

## Visual & Art Guidelines

- Low-poly, stylized assets optimized for WebGL and mobile. Keep per-object tris low (< 10k for large objects; collectibles < 1k tris).
- Texture sizes limited to 2048x2048 and compressed where possible.
- Use instancing for repeated objects (beads, simple decorations).

---

## Analytics Events (recommended)

Track these events (example payloads):
- session.start { sessionId, timestamp }
- session.end { sessionId, duration, score }
- level.start { sessionId, level }
- level.complete { sessionId, level, score, time }
- collectible.caught { sessionId, type, value, colorMatch }
- npc.interaction { sessionId, npcId, action }
- ad.reward { sessionId, adProvider, rewardType }

Privacy: ensure no PII is logged. Provide opt-out toggle for analytics in Settings if needed.

---

## Metrics & Success Criteria

- Performance: target 60 FPS desktop, 45+ FPS mobile.
- Retention: day-1 metric target 60% (research-backed initial goal to validate sessions mechanics).
- Engagement: average session length 30–120s; goal to increase baseline via power-ups and rewards.

---

## Acceptance Criteria for Next Release
- Mobile joystick is responsive and does not conflict with catch areas.
- Minimal HUD mode hides non-essential elements and displays compact score/coins.
- Audio toggle persists and works on iOS and Android browsers.
- Preview build (GH Pages) renders minimal HUD when flagged.
- Basic analytics events emitted to mocked backend.

---

## Implementation Notes & References
- React Three Fiber patterns: use `useFrame` for per-frame logic and keep physics lightweight.
- State: Zustand stores in `client/src/lib/stores/`.
- Server: `server/` contains a simple Express app used for mock analytics and possible cloud saves.
- Docs: expand `docs/DEVELOPMENT_GUIDE.md` and this file as features are implemented.

---

## Open questions
- Which free-tier backend should be standardized for cloud save and analytics (Firebase, Supabase, or SQLite via a small server)?
- What privacy/consent mechanism is required for analytics in targeted release countries?

---

## Appendix — quick design sketches
(Keep UI sketches and small Figma references here — add links or images as they are produced.)

