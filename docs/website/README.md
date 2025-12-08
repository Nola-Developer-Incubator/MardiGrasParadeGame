# Project Landing Page (docs/website)

This folder contains a minimal static landing page for the Mardi Gras Parade Simulator project.

Files
- `index.html` - simple landing page with quick links and instructions
- `style.css` - local stylesheet

How to view locally
1. Open `docs/website/index.html` in your browser (double-click or `open`).
2. Or, run a minimal static server from the repo root:

```powershell
# From repo root
python -m http.server 8081 -d docs/website
# Then open http://127.0.0.1:8081
```

Notes
- This is intentionally minimal and designed as a lightweight project landing page. It can be extended into a full documentation site or served by the Express server when deploying docs.

