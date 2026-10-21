"""
AgriPulse AI — Application configuration.

All settings are loaded from environment variables or .env file.
No secrets are hardcoded or committed to version control.
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import Optional


class Settings(BaseSettings):
    """Central application settings loaded from environment."""

    # --- Application ---
    APP_NAME: str = "AgriPulse AI"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = False

    # --- Database ---
    DATABASE_URL: str = Field(
        default="postgresql+psycopg://postgres:password@localhost:5432/agripulse",
        description="PostgreSQL connection string. Must be set in .env for production.",
    )

    # --- CORS ---
    CORS_ORIGINS: str = Field(
        default="http://localhost:5173",
        description="Comma-separated list of allowed CORS origins.",
    )

    # --- External Providers (all optional, credentials never in frontend) ---
    WEATHER_PRIMARY_PROVIDER: str = Field(
        default="open_meteo",
        description="Primary weather provider: 'open_meteo' or 'imd'",
    )
    WEATHER_FALLBACK_PROVIDER: str = Field(
        default="open_meteo",
        description="Fallback weather provider if primary fails or uncredentialed",
    )
    WEATHER_CACHE_TTL_SECONDS: int = Field(
        default=3600,
        description="Cache validity window for meteorological queries (1 hour default)",
    )
    WEATHER_REQUEST_TIMEOUT_SECONDS: float = Field(
        default=6.0,
        description="Timeout for external weather HTTP calls in seconds",
    )
    IMD_API_KEY: Optional[str] = Field(default=None, description="IMD weather API key.")
    IMD_API_BASE_URL: str = Field(
        default="https://api.imd.gov.in/public",
        description="Base URL for India Meteorological Department official API endpoints",
    )

    LLM_API_KEY: Optional[str] = Field(default=None, description="LLM provider API key.")
    LLM_MODEL: Optional[str] = Field(default=None, description="LLM model identifier.")
    LLM_PROVIDER: Optional[str] = Field(default=None, description="LLM provider name.")

    TTS_PROVIDER: Optional[str] = Field(default="google", description="TTS provider: google or bhashini.")
    GOOGLE_APPLICATION_CREDENTIALS: Optional[str] = Field(
        default=None, description="Path to Google Cloud service account JSON."
    )

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse comma-separated CORS origins into a list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


# Singleton settings instance
settings = Settings()
