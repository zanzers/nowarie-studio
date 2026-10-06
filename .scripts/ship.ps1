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


Write-Host "`nUpdating main..." -ForegroundColor Cyan
git pull --ff-only origin main

# Generate branch name from commit message
$branchName = $Message.ToLower() `
    -replace '[^a-z0-9\s-]', '' `
    -replace '\s+', '-' `
    -replace '-+', '-'

$branchName = $branchName.Trim('-')

if ($branchName.Length -gt 50) {
    $branchName = $branchName.Substring(0, 50).Trim('-')
}

$branchName = "work/$branchName"

Write-Host "Creating branch: $branchName" -ForegroundColor Cyan
git switch -c $branchName

Write-Host "`nStaging changes..." -ForegroundColor Cyan
git add .


Write-Host "`nChanges to commit:" -ForegroundColor Cyan
git status --short


Write-Host "`nCreating commit..." -ForegroundColor Cyan
git commit -m $Message


Write-Host "`nPushing branch..." -ForegroundColor Cyan
git push -u origin $branchName


Write-Host "`nCreating Pull Request..." -ForegroundColor Cyan

$prUrl = gh pr create `
    --base main `
    --head $branchName `
    --title $Message `
    --body "Automated PR created by scripts/ship.ps1."

Write-Host "`nPull Request created:" -ForegroundColor Green
Write-Host $prUrl


Write-Host "`nWaiting for CI..." -ForegroundColor Cyan
gh pr checks $branchName --watch

Write-Host "`nCI finished." -ForegroundColor Green
Write-Host "Review and merge the PR when ready." -ForegroundColor Cyan