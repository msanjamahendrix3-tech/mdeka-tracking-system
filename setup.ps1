# Mdeka Health Tracker - Android Setup Script
# Owner: HASTINGS MSANJAMA

Write-Host "----------------------------------------------------" -ForegroundColor Cyan
Write-Host "   Mdeka Health Tracker Setup - HASTINGS MSANJAMA   " -ForegroundColor Cyan
Write-Host "----------------------------------------------------" -ForegroundColor Cyan

# Check if npm is installed
if (!(Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] Node.js is not installed! Please download it from https://nodejs.org/" -ForegroundColor Red
    exit
}

Write-Host "[1/3] Installing necessary components..." -ForegroundColor Yellow
npm install

Write-Host "[2/3] Building your latest branded update..." -ForegroundColor Yellow
npm run build

Write-Host "[3/3] Preparing Android Studio files..." -ForegroundColor Yellow
npx cap sync android

Write-Host "----------------------------------------------------" -ForegroundColor Green
Write-Host "SUCCESS! Your project is ready for Android Studio." -ForegroundColor Green
Write-Host "Next Step: Open Android Studio and choose the 'android' folder." -ForegroundColor White
Write-Host "----------------------------------------------------" -ForegroundColor Green
