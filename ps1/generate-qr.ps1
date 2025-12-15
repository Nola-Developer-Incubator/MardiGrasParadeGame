param(
  [Parameter(Mandatory=$true)]
  [string]$Url,
  [string]$OutPath = "docs/browser-qr.png"
)

$enc = [System.Web.HttpUtility]::UrlEncode($Url)
$api = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$enc"

Write-Host "Downloading QR for $Url to $OutPath"
Invoke-WebRequest -Uri $api -OutFile $OutPath
Write-Host "Wrote $OutPath"

