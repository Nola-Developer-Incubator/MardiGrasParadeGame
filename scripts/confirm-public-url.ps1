<#
Confirm and open current public URL helper

Usage (PowerShell):
  # Wait up to 60s for docs/last-public-url.txt to appear, then print and open it
  .\scripts\confirm-public-url.ps1 -TimeoutSeconds 60 -OpenBrowser

Parameters:
  -TimeoutSeconds: How long to wait (seconds)
  -OpenBrowser: If present, opens the URL in the default browser
#>
param(
  [int]$TimeoutSeconds = 60,
  [switch]$OpenBrowser
)

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Definition
$docsFile = Join-Path $repoRoot '..\docs\last-public-url.txt'
$fullPath = Resolve-Path -LiteralPath $docsFile -ErrorAction SilentlyContinue
if ($fullPath) { $docsFile = $fullPath.Path }

Write-Host "Waiting up to $TimeoutSeconds seconds for $docsFile" -ForegroundColor Cyan
$start = Get-Date
$url = $null
while (((Get-Date) - $start).TotalSeconds -lt $TimeoutSeconds) {
  if (Test-Path $docsFile) {
    try {
      $content = Get-Content $docsFile -ErrorAction SilentlyContinue | Select-Object -First 1
      if ($content -and $content.Trim().Length -gt 0) { $url = $content.Trim(); break }
    } catch {}
  }
  Start-Sleep -Milliseconds 500
}

if (-not $url) {
  Write-Host "Timed out waiting for $docsFile" -ForegroundColor Yellow
  exit 2
}

Write-Host "Public URL found: $url" -ForegroundColor Green

if ($OpenBrowser.IsPresent) {
  Write-Host "Opening browser to $url" -ForegroundColor Cyan
  Start-Process $url
}

# Optionally copy to clipboard if available
try {
  Set-Clipboard -Value $url -ErrorAction SilentlyContinue
  Write-Host "URL copied to clipboard." -ForegroundColor Cyan
} catch {}

exit 0

