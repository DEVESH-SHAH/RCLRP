<#
setup-repo.ps1
Interactive PowerShell helper to initialize a git repo and create a sequence
of small, logical commits. Run this locally at the project root.
#>

function AbortIfNoGit {
    if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
        Write-Error "Git is not installed or not in PATH. Install Git and re-run this script."
        exit 1
    }
}

AbortIfNoGit

$root = Resolve-Path .
Write-Host "Project root: $root"

# Prompt for optional configuration
$userName = Read-Host "Git user.name (leave blank to keep global)"
$userEmail = Read-Host "Git user.email (leave blank to keep global)"
$remote = Read-Host "Remote repo URL (https://... ) (leave blank to skip push)"
$branch = Read-Host "Branch name (default: main)"
if (-not $branch) { $branch = 'main' }

# Init repo if needed
$inside = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0) {
    git init
    Write-Host "Initialized empty git repository"
} else {
    Write-Host "Repository already initialized"
}

if ($userName) { git config user.name "$userName" ; Write-Host "Set local user.name" }
if ($userEmail) { git config user.email "$userEmail" ; Write-Host "Set local user.email" }

function CommitIfPathsExist($paths, $message) {
    $anyFound = $false
    foreach ($p in $paths) {
        if (Test-Path $p) { $anyFound = $true; break }
    }
    if ($anyFound) {
        git add @($paths) 2>$null
        # Only commit if something staged
        git diff --cached --quiet
        if ($LASTEXITCODE -ne 0) {
            git commit -m $message
            Write-Host "Committed: $message"
            return $true
        } else {
            Write-Host "Nothing staged for: $message"
            return $false
        }
    } else {
        Write-Host "Paths not found, skipping commit: $message"
        return $false
    }
}

# Safety: do not add env files or venvs (they should be in .gitignore)

# Commit groups (small, logical)
CommitIfPathsExist @('.gitignore','README.md','SETUP_README.md','DEPLOYMENT_CHECKLIST.md','DATABASE_README.md') "chore: add project docs and .gitignore"

CommitIfPathsExist @('server/requirements.txt','server/start_server.py','server/README.md') "chore(server): add server requirements and start script"

CommitIfPathsExist @('server/app') "feat(server): add server app package"

CommitIfPathsExist @('client/package.json','client/postcss.config.js','client/tailwind.config.js','client/public') "chore(client): add package manifest and public assets"

CommitIfPathsExist @('client/src/api') "feat(client): add API client modules"
CommitIfPathsExist @('client/src/components') "feat(client): add UI components"
CommitIfPathsExist @('client/src/pages') "feat(client): add page components"
CommitIfPathsExist @('client/src/hooks','client/src/utils') "feat(client): add hooks and utils"

# Catch-all: add remaining source files not committed yet, but skip node_modules, .venv, .env
Write-Host "Staging remaining source files (excluding node_modules, .venv, .env)..."
$excluded = @('node_modules','client/node_modules','.venv','.env','server/.venv','client/.env')
$allFiles = Get-ChildItem -Recurse -File | Where-Object {
    $p = $_.FullName.Replace((Get-Location).Path + [IO.Path]::DirectorySeparatorChar, '')
    foreach ($e in $excluded) { if ($p -like "*$e*") { return $false } }
    return $true
} | ForEach-Object { $_.FullName }

if ($allFiles.Count -gt 0) {
    git add --all
    git diff --cached --quiet
    if ($LASTEXITCODE -ne 0) {
        git commit -m "chore: add remaining project files"
        Write-Host "Committed remaining files"
    } else {
        Write-Host "No remaining staged changes"
    }
} else {
    Write-Host "No files detected to add"
}

# Ensure branch name
git branch -M $branch

# Add remote and push if requested
if ($remote) {
    # If origin exists, set-url, else add
    $originExists = git remote | Select-String -Pattern '^origin$' -Quiet
    if ($originExists) {
        git remote set-url origin $remote
        Write-Host "Updated origin remote to $remote"
    } else {
        git remote add origin $remote
        Write-Host "Added origin remote $remote"
    }

    Write-Host "Pushing to origin/$branch..."
    git push -u origin $branch
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Push failed; check remote URL and authentication."
    } else {
        Write-Host "Push successful"
    }
} else {
    Write-Host "Skipping push (no remote provided)"
}

# Summary
$commitCount = git rev-list --count HEAD 2>$null
Write-Host "Done. Total commits: $commitCount"

Write-Host "Run 'git log --oneline' to review commit history. If you want me to suggest further commit splits, paste the log here."
