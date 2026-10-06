param(
    [Parameter(Mandatory=$true)]
    [string]$Message
)

$ErrorActionPreference = "Stop"

git rev-parse --is-inside-work-tree | Out-Null

$status = git status --porcelain

if (-not $status) {
    Write-Host "No changes to ship." -ForegroundColor Yellow
    exit 1
}

$currentBranch = git branch --show-current

if ($currentBranch -ne "main") {
    Write-Host "You must start from main. Current branch: $currentBranch" -ForegroundColor Red
    exit 1
}

# Update main
Write-Host "`nUpdating main..." -ForegroundColor Cyan
git pull --ff-only origin main

# Create branch name
$branchName = $Message.ToLower() `
    -replace '[^a-z0-9\s-]', '' `
    -replace '\s+', '-' `
    -replace '-+', '-'

$branchName = $branchName.Trim('-')

if ($branchName.Length -gt 50) {
    $branchName = $branchName.Substring(0, 50).Trim('-')
}

$branchName = "work/$branchName"

# Create branch
Write-Host "Creating branch: $branchName" -ForegroundColor Cyan
git switch -c $branchName

# Stage changes
Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add .

Write-Host "`nChanges to commit:" -ForegroundColor Cyan
git status --short

# Commit
Write-Host "`nCreating commit..." -ForegroundColor Cyan
git commit -m $Message

# Push
Write-Host "`nPushing branch..." -ForegroundColor Cyan
git push -u origin $branchName

# Create PR
Write-Host "`nCreating Pull Request..." -ForegroundColor Cyan

$prUrl = gh pr create `
    --base main `
    --head $branchName `
    --title $Message `
    --body "Automated PR created by scripts/ship.ps1."

Write-Host "`nPull Request created:" -ForegroundColor Green
Write-Host $prUrl

# Wait for CI
Write-Host "`nWaiting for CI..." -ForegroundColor Cyan
gh pr checks $branchName --watch

Write-Host "`nCI passed." -ForegroundColor Green

# Ask before merge
$merge = Read-Host "`nMerge this PR now? (y/N)"

if ($merge -ne "y") {
    Write-Host "`nPR left open." -ForegroundColor Yellow
    Write-Host "You are currently on: $branchName" -ForegroundColor Yellow
    exit 0
}

# Merge PR
Write-Host "`nMerging PR..." -ForegroundColor Cyan

gh pr merge $branchName `
    --squash `
    --delete-branch

Write-Host "`nPR merged successfully." -ForegroundColor Green

# Return to main
Write-Host "`nReturning to main..." -ForegroundColor Cyan

git switch main

# Update local main
git pull --ff-only origin main

Write-Host "`nDone." -ForegroundColor Green
Write-Host "Current branch: $(git branch --show-current)" -ForegroundColor Cyan