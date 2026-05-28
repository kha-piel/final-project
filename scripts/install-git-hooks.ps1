$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksPath = Join-Path $repoRoot ".githooks"

git config core.hooksPath $hooksPath
Write-Host "Configured git hooks path: $hooksPath"
