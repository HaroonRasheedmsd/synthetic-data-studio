# ============================================================
# Synthetic Data Studio — Local Development Starter
# Run this script from the project root:
#   powershell -ExecutionPolicy Bypass -File .\start.ps1
# ============================================================

$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Synthetic Data Studio - Local Dev" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# ── 1. Check venv ──────────────────────────────────────────
$VenvPython = Join-Path $ProjectRoot "venv\Scripts\python.exe"
$VenvPip    = Join-Path $ProjectRoot "venv\Scripts\pip.exe"

if (-not (Test-Path $VenvPython)) {
    Write-Host "[SETUP] Creating Python virtual environment..." -ForegroundColor Yellow
    python -m venv "$ProjectRoot\venv"
}

# ── 2. Install backend deps if needed ──────────────────────
Write-Host "[SETUP] Installing backend dependencies..." -ForegroundColor Yellow
& $VenvPip install -r "$ProjectRoot\backend\requirements.txt" --quiet
Write-Host "[OK] Backend dependencies ready." -ForegroundColor Green

# ── 3. Install frontend deps if needed ─────────────────────
if (-not (Test-Path "$ProjectRoot\frontend\node_modules")) {
    Write-Host "[SETUP] Installing frontend Node.js dependencies..." -ForegroundColor Yellow
    Set-Location "$ProjectRoot\frontend"
    npm install --silent
    Set-Location $ProjectRoot
}
Write-Host "[OK] Frontend dependencies ready." -ForegroundColor Green

# ── 4. Copy .env to backend if not already there ───────────
$RootEnv    = "$ProjectRoot\.env"
$BackendEnv = "$ProjectRoot\backend\.env"
if ((Test-Path $RootEnv) -and -not (Test-Path $BackendEnv)) {
    Copy-Item $RootEnv $BackendEnv
    Write-Host "[OK] Copied .env to backend/" -ForegroundColor Green
}

# ── 5. Start Backend (FastAPI on port 8000) ─────────────────
Write-Host ""
Write-Host "[START] Launching FastAPI backend on http://localhost:8000 ..." -ForegroundColor Cyan
$BackendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ProjectRoot\backend'; & '$VenvPython' -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000"
) -PassThru

# ── 6. Wait 2s for backend to warm up ──────────────────────
Start-Sleep -Seconds 2

# ── 7. Start Frontend (Vite on port 5173) ──────────────────
Write-Host "[START] Launching Vite frontend on http://localhost:5173 ..." -ForegroundColor Cyan
$FrontendJob = Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "Set-Location '$ProjectRoot\frontend'; npm run dev"
) -PassThru

# ── 8. Done ────────────────────────────────────────────────
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Both servers are starting!" -ForegroundColor Green
Write-Host "  Frontend  -> http://localhost:5173" -ForegroundColor White
Write-Host "  Backend   -> http://localhost:8000" -ForegroundColor White
Write-Host "  API Docs  -> http://localhost:8000/docs" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to stop both servers..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# ── 9. Cleanup ─────────────────────────────────────────────
Stop-Process -Id $BackendJob.Id  -ErrorAction SilentlyContinue
Stop-Process -Id $FrontendJob.Id -ErrorAction SilentlyContinue
Write-Host "Servers stopped." -ForegroundColor Yellow
