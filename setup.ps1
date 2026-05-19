# Mdeka Health Tracker - Android Setup Script
# Owner: HASTINGS MSANJAMA

Clear-Host
Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "   Mdeka Health Tracker Setup - HASTINGS MSANJAMA   " -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed! Please download it from https://nodejs.org/" -ForegroundColor Red
    Write-Host "Please install Node.js and restart PowerShell." -ForegroundColor White
    exit
}

Write-Host "[1/4] Installing necessary components..." -ForegroundColor Yellow
npm install --quiet

Write-Host "[2/4] Building your latest web assets..." -ForegroundColor Yellow
npm run build

Write-Host "[3/4] Syncing with Android project..." -ForegroundColor Yellow
npx cap sync android

Write-Host "[4/4] Launching Android Studio..." -ForegroundColor Yellow

# Try common Android Studio locations
$studioPaths = @(
    "C:\Program Files\Android\Android Studio\bin\studio64.exe",
    "$env:LOCALAPPDATA\Programs\Android Studio\bin\studio64.exe",
    "C:\Program Files (x86)\Android\Android Studio\bin\studio64.exe"
)

$launched = $false
foreach ($path in $studioPaths) {
    if (Test-Path $path) {
        Write-Host "Opening project in Android Studio..." -ForegroundColor Green
        Start-Process $path -ArgumentList (Get-Item ".\android").FullName
        $launched = $true
        break
    }
}

if (-not $launched) {
    Write-Host "[WARNING] Could not find Android Studio path automatically." -ForegroundColor Magenta
    Write-Host "Please open Android Studio manually and select the 'android' folder." -ForegroundColor White
} else {
    Write-Host "SUCCESS! Android Studio is opening..." -ForegroundColor Green
}

Write-Host "----------------------------------------------------" -ForegroundColor Green
Write-Host "DONE! You can now build and run in Android Studio." -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Green
