import os
import tempfile
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime

# Determine database location based on environment & filesystem permissions
# IMPORTANT: On Vercel (serverless), /tmp is ephemeral — wiped between cold starts.
# ALL user data is lost on cold starts unless a persistent DATABASE_URL is provided.
# To fix: set DATABASE_URL=postgresql://... in Vercel project environment variables.
_env_db_url = os.environ.get("DATABASE_URL", "")
if _env_db_url and not _env_db_url.startswith("sqlite"):
    # Persistent database provided (e.g. PostgreSQL on Neon/Supabase/Railway)
    SQLALCHEMY_DATABASE_URL = _env_db_url
elif os.environ.get("VERCEL") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME") or not os.access(".", os.W_OK):
    tmp_path = os.path.join(tempfile.gettempdir(), "synthetic_studio.db")
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{tmp_path.replace(chr(92), '/')}"
    print(
        "WARNING: Running on Vercel/Lambda with ephemeral SQLite in /tmp. "
        "User data WILL be lost on cold starts. "
        "Set DATABASE_URL to a persistent PostgreSQL URL in Vercel env vars to fix this."
    )
else:
    SQLALCHEMY_DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./synthetic_studio.db")

try:
    if "sqlite" in SQLALCHEMY_DATABASE_URL:
        engine = create_engine(
            SQLALCHEMY_DATABASE_URL,
            connect_args={"check_same_thread": False}
        )
    else:
        engine = create_engine(SQLALCHEMY_DATABASE_URL)
        
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        full_name = Column(String, index=True)
        email = Column(String, unique=True, index=True)
        hashed_password = Column(String)
        created_at = Column(DateTime, default=datetime.utcnow)

    class Project(Base):
        __tablename__ = "projects"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, index=True)
        name = Column(String)
        description = Column(String)
        metadata_json = Column(Text)
        plan_json = Column(Text)
        created_at = Column(DateTime, default=datetime.utcnow)

    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Failed to initialize file SQLite DB ({e}). Falling back to in-memory SQLite.")
    SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base = declarative_base()

    class User(Base):
        __tablename__ = "users"
        id = Column(Integer, primary_key=True, index=True)
        full_name = Column(String, index=True)
        email = Column(String, unique=True, index=True)
        hashed_password = Column(String)
        created_at = Column(DateTime, default=datetime.utcnow)

    class Project(Base):
        __tablename__ = "projects"
        id = Column(Integer, primary_key=True, index=True)
        user_id = Column(Integer, index=True)
        name = Column(String)
        description = Column(String)
        metadata_json = Column(Text)
        plan_json = Column(Text)
        created_at = Column(DateTime, default=datetime.utcnow)

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
