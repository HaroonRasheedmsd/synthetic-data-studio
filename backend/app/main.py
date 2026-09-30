import sys
import os
# This is the absolute ultimate fix for Python 3.14 on Windows.
# We explicitly inject the 'backend' folder path into Python's brain before doing anything else.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

raw_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",") if origin.strip()]
raw_origins.extend([
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
])
allowed_origins = list(set(raw_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(api_router, prefix="/api")

@app.get("/health")
def health_check():
    return {
        "status": "online", 
        "message": "Synthetic Data Studio API is running beautifully."
    }
