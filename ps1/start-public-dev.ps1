# One-click developer helper for running the dev server publicly via cloudflared
# Usage: .\start-public-dev.ps1
# Requirements: cloudflared in PATH, npm available; run from repo or double-click this script

$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$logsDir = Join-Path $repoRoot 'ps1\logs'
if (!(Test-Path $logsDir)) { New-Item -ItemType Directory -Path $logsDir | Out-Null }

$devOut = Join-Path $logsDir 'dev-server.log'
$devErr = Join-Path $logsDir 'dev-server.err.log'
$tunnelOut = Join-Path $logsDir 'cloudflared.log'

Write-Host "Repo root: $repoRoot"

function Start-DevServer {
  Write-Host "Starting dev server (npm run dev)... logs: $devOut"
  # Run via cmd.exe so we can redirect output in PowerShell 5.1
  $cmd = "npm run dev > \"$devOut\" 2> \"$devErr\""
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList ('/c', $cmd) -WorkingDirectory $repoRoot -PassThru
  return $proc
}

function Start-Cloudflared {
  Write-Host "Checking for cloudflared in PATH..."
  $cf = Get-Command cloudflared -ErrorAction SilentlyContinue
  if (-not $cf) {
    Write-Host "cloudflared not found in PATH. Please install from https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation"
    return $null
  }

  Write-Host "Starting cloudflared tunnel... (logs: $tunnelOut)"
  # Run cloudflared and write stdout/stderr to a log file so we can parse the public URL
  $cmd = "cloudflared tunnel --url http://localhost:5000 --no-autoupdate > \"$tunnelOut\" 2>&1"
  $proc = Start-Process -FilePath 'cmd.exe' -ArgumentList ('/c', $cmd) -WorkingDirectory $repoRoot -PassThru
  return $proc
}

function Wait-For-PublicUrl {
  param(
    [string]$LogPath,
    [int]$TimeoutSec = 60
n  )

  Write-Host "Waiting for cloudflared to publish a public URL (timeout: $TimeoutSec s)"
  $sw = [Diagnostics.Stopwatch]::StartNew()
  while ($sw.Elapsed.TotalSeconds -lt $TimeoutSec) {
    Start-Sleep -Milliseconds 500
    if (Test-Path $LogPath) {
      $text = Get-Content -Raw -ErrorAction SilentlyContinue $LogPath
      if ($null -ne $text) {
        # Look for trycloudflare URL or any https:// URL
        $m = [Text.RegularExpressions.Regex]::Match($text, '(https?://[\w\-\.]+trycloudflare\.com[\S]*)')
        if (-not $m.Success) {
          $m = [Text.RegularExpressions.Regex]::Match($text, '(https?://[\S]+)')
        }
        if ($m.Success) {
          $url = $m.Groups[1].Value.Trim()
          Write-Host "Found public URL: $url"
          return $url
        }
      }
    }
  }
  Write-Host "Timed out waiting for public URL"
  return $null
}

function Generate-QR {
  param(
    [string]$Url,
    [ValidateSet('png','svg')]
    [string]$Format = 'svg'
  )
  $genScript = Join-Path $repoRoot 'ps1\generate-qr.ps1'
  if (Test-Path $genScript) {
    $out = Join-Path $repoRoot 'docs\browser-qr.' + $Format
    Write-Host "Generating QR via $genScript -> $out (format: $Format)"
    & $genScript -Url $Url -OutPath $out -Format $Format
    Write-Host "QR written to: $out"
    return $out
  } else {
    Write-Host "QR generator script not found: $genScript"
    return $null
  }
}

# Start processes
$devProc = Start-DevServer
Start-Sleep -Seconds 2
$cfProc = Start-Cloudflared

# Wait and extract URL
$publicUrl = $null
if ($cfProc -ne $null) {
  $publicUrl = Wait-For-PublicUrl -LogPath $tunnelOut -TimeoutSec 60
}

if ($publicUrl) {
  Write-Host "Opening: $publicUrl"
  Start-Process $publicUrl
  $qrPath = Generate-QR -Url $publicUrl -Format 'svg'

  # Create a simple clickable launch page inside docs/launch.html
  $docsDir = Join-Path $repoRoot 'docs'
  if (!(Test-Path $docsDir)) { New-Item -ItemType Directory -Path $docsDir | Out-Null }

  # Prefer a provided thumbnail.png inside docs, else use the generated SVG QR
  $thumbCandidate = Join-Path $docsDir 'thumbnail.png'
  if (Test-Path $thumbCandidate) {
    $imgPath = 'thumbnail.png'
  } elseif ($qrPath) {
    # Use relative path for the generated QR (browser-qr.svg)
    $imgPath = [IO.Path]::GetFileName($qrPath)
  } else {
    $imgPath = ''
  }

  $launchHtml = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>MardiGrasParadeSim2026 — Play</title>
  <style>
    body { font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif; display:flex; align-items:center; justify-content:center; height:100vh; margin:0; background:#0b0b0b; color:#fff }
    .card { text-align:center }
    img { max-width:320px; width:80vw; height:auto; border-radius:8px; box-shadow:0 8px 24px rgba(0,0,0,0.6) }
    a.button { display:inline-block; margin-top:12px; padding:10px 16px; background:#722F9A; color:#fff; text-decoration:none; border-radius:6px }
  </style>
</head>
<body>
  <div class="card">
    <h1>MardiGrasParadeSim2026</h1>
    <p>Open in browser or scan the QR with your phone.</p>
    <a href="$publicUrl" target="_blank">
      <img src="$imgPath" alt="Open MardiGrasParadeSim2026" />
    </a>
    <div>
      <a class="button" href="$publicUrl" target="_blank">Open Project</a>
    </div>
    <p style="margin-top:10px;font-size:12px;opacity:0.8">If the page does not load, check your dev server or cloudflared logs in ps1/logs/.</p>
  </div>
</body>
</html>
"@

  $launchPath = Join-Path $docsDir 'launch.html'
  Write-Host "Writing launch page to $launchPath"
  $launchHtml | Out-File -FilePath $launchPath -Encoding UTF8

} else {
  Write-Host "Public URL not available. Check $tunnelOut for cloudflared logs."
}

Write-Host "Dev server PID: $($devProc.Id); Cloudflared PID: $($cfProc.Id)"

Write-Host "Press Enter to stop background processes and exit (or CTRL+C)."
Read-Host | Out-Null

# Cleanup: attempt to stop started procs
try {
  if ($devProc -and -not $devProc.HasExited) {
    Write-Host "Stopping dev server (PID $($devProc.Id))"
    Stop-Process -Id $devProc.Id -Force -ErrorAction SilentlyContinue
  }
  if ($cfProc -and -not $cfProc.HasExited) {
    Write-Host "Stopping cloudflared (PID $($cfProc.Id))"
    Stop-Process -Id $cfProc.Id -Force -ErrorAction SilentlyContinue
  }
} catch {
  Write-Host "Error while cleaning up: $_"
}

Write-Host "Done."
