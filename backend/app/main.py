from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings

# 1. Load our settings (environment variables like allowed frontend URLs)
settings = get_settings()

# 2. Create the FastAPI application instance
# This is the core of our backend.
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for the Synthetic Data Studio",
    version="1.0.0"
)

# 3. Configure CORS (Cross-Origin Resource Sharing)
# Browsers block web pages from making requests to a different domain by default.
# Our React app will run on port 5173, and FastAPI on port 8000.
# We must explicitly tell FastAPI it is safe to accept requests from our React app.
app.add_middleware(
    CORSMiddleware,
    # Convert the comma-separated string from .env into a list of allowed URLs
    allow_origins=[origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")],
    allow_credentials=True,
    allow_methods=["*"], # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"], # Allow all headers
)

# 4. Define our first endpoint: A simple Health Check
# The @app.get decorator tells FastAPI that when a browser or app sends a GET request
# to the "/health" URL, it should run this function.
@app.get("/health")
def health_check():
    """
    A simple endpoint to verify the backend is running.
    Returns a JSON message.
    """
    return {
        "status": "online", 
        "message": "Synthetic Data Studio API is running beautifully."
    }
