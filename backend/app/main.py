import sys
import os
# Inject the 'backend' folder into sys.path so imports work in all environments
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
from app.core.config import get_settings
from app.api.routes import router as api_router
from app.api.auth import router as auth_router
from app.api.projects import router as projects_router

settings = get_settings()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Synthetic Data Studio",
    version="1.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
raw_origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
raw_origins.extend([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://synthetic-data-studio-chi.vercel.app",
])
allowed_origins = list(set(raw_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    # Covers all Vercel preview URLs and any custom domains
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── API Routers ────────────────────────────────────────────────────────────────
# Registered under both /api/* (standard) and /* (serverless fallback)
app.include_router(auth_router,     prefix="/api/auth")
app.include_router(auth_router,     prefix="/auth")
app.include_router(projects_router, prefix="/api/projects")
app.include_router(projects_router, prefix="/projects")
app.include_router(api_router,      prefix="/api")
app.include_router(api_router)

# ── Health ────────────────────────────────────────────────────────────────────
@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "online", "message": "Synthetic Data Studio API is running."}

# ── 404 Handler ───────────────────────────────────────────────────────────────
# NOTE: On Vercel, static files (index.html, CSS, JS) are served by the CDN,
# NOT by this FastAPI app. This 404 handler should only ever fire for unknown
# /api/* routes. If it fires for /index.html it means Vercel's CDN could not
# find the built frontend — check that outputDirectory in vercel.json is correct
# and that the frontend was built before deployment.
@app.exception_handler(404)
async def custom_404_handler(request, exc):
    path = request.url.path
    is_vercel = os.environ.get("VERCEL") == "1"
    print(f"404: {request.method} {path}")
    if not is_vercel and path in ("/", "/index.html"):
        # Local dev only — frontend not built yet, redirect to Vite dev server
        return RedirectResponse(url="http://localhost:5173")
    return JSONResponse(
        status_code=404,
        content={"detail": f"Route not found: {request.method} {path}"}
    )
