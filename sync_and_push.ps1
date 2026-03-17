# Hertz Leave Tracker - Auto Sync Script
# This script copies the latest Excel from your source and pushes it to GitHub.

# 1. Configuration
$SourceFile = "C:\Path\To\Your\TEAM_MASTER_TRACKER.xlsx" # Change this to your actual file path
$ProjectDir = "C:\Users\RamP\.gemini\antigravity\scratch\hertz-leave-tracker"
$DestFile = "$ProjectDir\public\Hertz 2026 tracker.xlsx"

# 2. Sync File
Write-Host "Syncing Excel file..." -ForegroundColor Cyan
If (Test-Path $SourceFile) {
    Copy-Item -Path $SourceFile -Destination $DestFile -Force
    Write-Host "File copied successfully." -ForegroundColor Green
} Else {
    Write-Host "Error: Source file not found at $SourceFile" -ForegroundColor Red
    Exit
}

# 3. Git Push
Set-Location $ProjectDir
Write-Host "Pushing to GitHub..." -ForegroundColor Cyan
git add "public/Hertz 2026 tracker.xlsx"
git commit -m "Automated data sync: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
git push

Write-Host "Done! Your portal will be updated in a few seconds." -ForegroundColor Green
