# Armor India - Clean Restart (Windows)

Write-Host "Armor India - Clean Restart" -ForegroundColor Cyan
$root = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "Stopping old processes..." -ForegroundColor Yellow
foreach ($port in @(3000, 3001, 8000)) {
    Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue |
        ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
}

$nextDir = "$root\frontend\.next"
if (Test-Path $nextDir) {
    Write-Host "Clearing frontend cache..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $nextDir
}

if (-not (Test-Path "$root\.env")) {
    Copy-Item "$root\.env.example" "$root\.env"
    Write-Host "Created .env file" -ForegroundColor Yellow
}

Write-Host "Setting up backend..." -ForegroundColor Green
Set-Location "$root\backend"
if (-not (Test-Path "venv")) { py -m venv venv }
& .\venv\Scripts\Activate.ps1
pip install -r requirements.txt -q 2>$null

$env:PYTHONPATH = "$root\backend"
Write-Host "Starting backend on http://localhost:8000" -ForegroundColor Green
Start-Process -FilePath "$root\backend\venv\Scripts\uvicorn.exe" `
    -ArgumentList "app.main:app","--host","127.0.0.1","--port","8000" `
    -WorkingDirectory "$root\backend" -WindowStyle Hidden

Start-Sleep -Seconds 3

Write-Host "Setting up frontend..." -ForegroundColor Green
Set-Location "$root\frontend"
if (-not (Test-Path "node_modules")) { npm install }

Write-Host "Starting frontend on http://localhost:3000" -ForegroundColor Green
Start-Process -FilePath "npm.cmd" -ArgumentList "run","dev" -WorkingDirectory "$root\frontend" -WindowStyle Hidden

Start-Sleep -Seconds 8

try {
    $health = Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/health" -TimeoutSec 5
    $ai = if ($health.ai_enabled) { "ON" } else { "Demo Mode" }
    Write-Host "Backend OK - AI: $ai" -ForegroundColor Cyan
} catch {
    Write-Host "Backend failed. Run: cd backend; .\venv\Scripts\uvicorn.exe app.main:app --port 8000" -ForegroundColor Red
}

try {
    Invoke-WebRequest -Uri "http://127.0.0.1:3000" -TimeoutSec 10 -UseBasicParsing | Out-Null
    Write-Host "Frontend OK - http://localhost:3000" -ForegroundColor Cyan
} catch {
    Write-Host "Frontend starting... wait 10 sec then open http://localhost:3000" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next: Open http://localhost:3000/setup and paste your OpenAI API key" -ForegroundColor White
Set-Location $root
