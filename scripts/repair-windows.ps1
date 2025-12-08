# From project root:
./scripts/repair-windows.ps1# Save npm install output to a file for sharing
./scripts/repair-windows.ps1 > repair-output.txt 2>&1
Get-Content repair-output.txt -Tail 200npm run check > tsc-output.txt 2>&1
Get-Content tsc-output.txt -Tail 200Start-Process -FilePath 'npm' -ArgumentList 'run','dev' -WindowStyle Normal
# then in another PowerShell window you can:
Start-Sleep -Seconds 3
Invoke-WebRequest -Uri 'http://127.0.0.1:5000' -UseBasicParsing -TimeoutSec 10# Repair script for Windows dev environment (node native prebuild / EPERM cleanup)
# Usage: Run PowerShell as Administrator and execute:
#   ./scripts/repair-windows.ps1

<#
This script attempts to:
 - stop Node processes
 - remove common native prebuild folders that cause EPERM on Windows
 - remove node_modules to ensure a clean install
 - run npm install with --legacy-peer-deps to tolerate peer conflicts from major upgrades
#>

Write-Output "== Repair script for Windows: stopping node processes =="
try {
  $nodeProcs = Get-Process -Name node -ErrorAction SilentlyContinue
  if ($nodeProcs) {
    foreach ($p in $nodeProcs) {
      Write-Output "Stopping node PID: $($p.Id)"
      try { Stop-Process -Id $p.Id -Force -ErrorAction SilentlyContinue } catch { Write-Warning "Unable to stop PID $($p.Id): $($_.Exception.Message)" }
    }
  } else {
    Write-Output "No node processes found"
  }
} catch {
  Write-Warning "Error while enumerating node processes: $($_.Exception.Message)"
}

Start-Sleep -Milliseconds 300

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $root

Write-Output "== Searching for problematic native prebuild folders/files =="
$patterns = @("*.bufferutil*", "*rollup-win32*", "*.node")
$found = @()
try {
  foreach ($pat in $patterns) {
    $items = Get-ChildItem -Path "$root\node_modules" -Recurse -Force -ErrorAction SilentlyContinue | Where-Object { $_.Name -like $pat }
    if ($items) { $found += $items }
  }
} catch {
  Write-Warning "Error during search: $($_.Exception.Message)"
}

if ($found.Count -gt 0) {
  Write-Output "Found $($found.Count) candidate files/folders to remove"
  foreach ($it in $found) {
    try {
      Write-Output "Removing: $($it.FullName)"
      Remove-Item -LiteralPath $it.FullName -Recurse -Force -ErrorAction SilentlyContinue
    } catch {
      Write-Warning "Could not remove $($it.FullName): $($_.Exception.Message)"
    }
  }
} else {
  Write-Output "No problematic prebuild folders/files found"
}

# Remove node_modules for a clean reinstall
if (Test-Path "$root\node_modules") {
  Write-Output "Removing node_modules (this may take a while)..."
  try {
    Remove-Item -LiteralPath "$root\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Output "node_modules removed"
  } catch {
    Write-Warning "Failed to remove node_modules: $($_.Exception.Message)"
  }
} else {
  Write-Output "No node_modules directory present"
}

# Keep package-lock.json by default to preserve reproducible installs. If you want to regenerate the lockfile,
# uncomment the following lines.
# if (Test-Path "$root\package-lock.json") {
#   Remove-Item -LiteralPath "$root\package-lock.json" -Force -ErrorAction SilentlyContinue
# }

Write-Output "== Installing dependencies (using --legacy-peer-deps to accept peer conflicts) =="
$installCmd = "npm install --legacy-peer-deps --no-audit"
Write-Output "Running: $installCmd"
# Use Start-Process to show output in the current console
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = "npm"
$psi.Arguments = "install --legacy-peer-deps --no-audit"
$psi.RedirectStandardOutput = $false
$psi.RedirectStandardError = $false
$psi.UseShellExecute = $true
$proc = [System.Diagnostics.Process]::Start($psi)
$proc.WaitForExit()
$exit = $proc.ExitCode
Write-Output "npm install exited with code $exit"

if ($exit -ne 0) {
  Write-Warning "npm install returned non-zero exit code. Try running 'npm install' manually and review errors."
}

Write-Output "== Repair script finished. Next: run 'npm run check' and then 'npm run dev' to start the dev server. =="
