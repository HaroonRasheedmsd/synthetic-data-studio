import sys
import os
from pathlib import Path

# Mark Vercel serverless environment flag
os.environ["VERCEL"] = "1"

# Add backend directory to sys.path so app imports work seamlessly on Vercel
root_dir = Path(__file__).resolve().parent.parent
backend_dir = root_dir / "backend"
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.main import app

# Export both app and handler for Vercel Python Serverless Runtime
handler = app
app = app
