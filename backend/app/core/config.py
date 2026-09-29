from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """
    Settings class to manage environment variables.
    Using Pydantic means it will automatically look for a .env file
    or system environment variables matching these names.
    """
    # The title of our API, shown in the auto-generated documentation
    PROJECT_NAME: str = "Synthetic Data Studio API"
    
    # URL of our frontend. Used to configure CORS (Cross-Origin Resource Sharing)
    # so the browser allows our frontend to talk to this backend.
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # The connection string for our database (SQLite for now)
    DATABASE_URL: str = "sqlite:///./sql_app.db"

    class Config:
        # Tells Pydantic to read variables from the .env file if it exists
        env_file = ".env"

@lru_cache()
def get_settings():
    """
    Creates and returns the settings object. 
    @lru_cache ensures we only read the .env file once and cache the result for performance.
    """
    return Settings()
