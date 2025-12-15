param(
  [Parameter(Mandatory=$true)]
  [string]$Url,
  [string]$OutPath = "docs/browser-qr.png",
  [ValidateSet('png','svg')]
  [string]$Format = 'png'
)

$enc = [System.Web.HttpUtility]::UrlEncode($Url)

if ($Format -eq 'svg') {
  $api = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$enc&format=svg"
  # Ensure the output has .svg extension
  if ([IO.Path]::GetExtension($OutPath).ToLower() -ne '.svg') {
    $OutPath = [IO.Path]::ChangeExtension($OutPath, '.svg')
  }
} else {
  $api = "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=$enc"
  if ([IO.Path]::GetExtension($OutPath).ToLower() -ne '.png') {
    $OutPath = [IO.Path]::ChangeExtension($OutPath, '.png')
  }
}

Write-Host "Downloading QR ($Format) for $Url to $OutPath"
Invoke-WebRequest -Uri $api -OutFile $OutPath
Write-Host "Wrote $OutPath"
