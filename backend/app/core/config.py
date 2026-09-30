from pydantic_settings import BaseSettings, SettingsConfigDict
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
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    
    # The connection string for our database (SQLite for now)
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    
    # API keys for AI model rotation
    GEMINI_API_KEYS: str = ""
    GEMINI_API_KEY: str = ""
    GEMINI_API_KEY_1: str = ""
    GEMINI_API_KEY_2: str = ""
    GEMINI_API_KEY_3: str = ""
    GEMINI_API_KEY_4: str = ""
    GEMINI_API_KEY_5: str = ""

    # extra="ignore" tells Pydantic not to crash if it finds other variables in the .env file
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

@lru_cache()
def get_settings():
    """
    Creates and returns the settings object. 
    @lru_cache ensures we only read the .env file once and cache the result for performance.
    """
    return Settings()

settings = get_settings()
