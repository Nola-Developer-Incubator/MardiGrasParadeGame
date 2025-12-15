# Quick Playtesting (shareable link)

Date: 2025-12-14

Goal: Give a public, shareable URL so someone not on your LAN can play the game quickly and for free.

Summary (simple, free options):
- Fast (recommended): Cloudflare Tunnel (cloudflared) — stable, free, HTTPS, no account required for basic use.
- Alternative: ngrok (free tier, ephemeral URL) — quick and widely known.
- If you want a permanent landing page, add a GitHub Pages redirect (see `docs/MardiGrasParadeSim2026.html`) and update its URL when you run a tunnel.

Minimal steps (recommended: Cloudflare Tunnel)
1. Start the dev server locally (Vite + Express):

```powershell
npm run dev
```

2. Install cloudflared (one-time). See https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation
   - Windows: download installer or use Scoop/Chocolatey.

3. Run cloudflared to expose your local server (port 5000):

```powershell
cloudflared tunnel --url http://localhost:5000
```

cloudflared prints a public URL like `https://abcd-1234.trycloudflare.com`. Copy that URL and share it.

Alternative (ngrok):
1. Start dev server.
2. Download ngrok and run:

```powershell
ngrok http 5000
```

ngrok prints a public HTTPS URL you can share.

Generate a QR (quick):
- Use the included PowerShell helper to download a PNG QR (uses a free QR API):

```powershell
# Replace <PUBLIC_URL> with the tunnel URL you got from cloudflared/ngrok
.
ps1\generate-qr.ps1 -Url "https://abcd-1234.trycloudflare.com"
# This writes docs/browser-qr.png
```

Make a GitHub Pages landing redirect (optional)
- Edit `docs/MardiGrasParadeSim2026.html` and replace the placeholder `REPLACE_WITH_PUBLIC_URL` with your tunnel URL. Commit and push to the repo's `main` (or enable GitHub Pages on `docs/` folder) to publish a stable project page that redirects to your current tunnel URL.

Commands to update redirect (example):

```powershell
# Edit file manually then commit & push
git add docs/MardiGrasParadeSim2026.html
git commit -m "chore(playtest): update Pages redirect to current tunnel URL"
git push
```

Notes / tips
- Cloudflare Tunnel gives an HTTPS URL without account friction and is the recommended free option.
- ngrok is convenient but the free URLs are ephemeral.
- For a public long-term demo, consider deploying the client to GitHub Pages or Vercel. That is free for static content.
- If your backend is required, you can tunnel the whole app (Cloudflare supports TCP/HTTP). Otherwise, build and serve a static client.

If you want, I can:
- Add a small GitHub Actions workflow to automatically update `docs/MardiGrasParadeSim2026.html` on demand (requires a PAT).
- Create a tiny UI button in the app that shows the current public URL (after you paste it into localStorage), and a QR generation button.

Which next: give me which tunnel you prefer (cloudflared or ngrok) and I will provide a one-click PowerShell script to run it and generate the QR.
