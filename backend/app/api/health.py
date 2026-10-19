"""
AgriPulse AI — Health check endpoint.

Provides service health status for monitoring, load balancers,
and frontend connection indicators.
"""

from datetime import datetime, timezone
from pathlib import Path
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
PROCESSED_CSV_PATH = PROJECT_ROOT / "data" / "processed" / "canonical_mandi_prices.csv"


@router.get("/health")
async def health_check():
    """
    Returns the current service health status with downstream component readiness.
    """
    mandi_ready = PROCESSED_CSV_PATH.exists()

    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            # Canonical component names
            "database": "pending_setup",
            "llm_service": "configured" if settings.LLM_API_KEY else "unconfigured",
            "weather_service": "ready" if settings.IMD_API_KEY else "fallback_ready",
            "market_data": "ready" if mandi_ready else "pending_ingestion",
            "speech_service": "ready" if settings.GOOGLE_APPLICATION_CREDENTIALS else "pending_day_8",
            
            # Backwards-compatible aliases
            "llm_provider": "configured" if settings.LLM_API_KEY else "not_configured",
            "tts_provider": "configured" if settings.GOOGLE_APPLICATION_CREDENTIALS else "not_configured",
            "imd_weather": "configured" if settings.IMD_API_KEY else "not_configured",
        },
    }
