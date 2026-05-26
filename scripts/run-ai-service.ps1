$projectRoot = Split-Path -Parent $PSScriptRoot
$serviceDir = Join-Path $projectRoot 'ai_service'
$venvPython = Join-Path $serviceDir '.venv\Scripts\python.exe'

if (-not (Test-Path $serviceDir)) {
  Write-Error "Khong tim thay thu muc ai_service tai: $serviceDir"
  exit 1
}

if (-not (Test-Path $venvPython)) {
  Write-Error "Khong tim thay Python trong virtualenv tai: $venvPython"
  exit 1
}

Set-Location $serviceDir
& $venvPython -m uvicorn main:app --reload --port 8000
