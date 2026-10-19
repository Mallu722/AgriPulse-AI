"""
AgriPulse AI — Health check endpoint.

Provides service health status for monitoring, load balancers,
and frontend connection indicators.
"""

from fastapi import APIRouter
from datetime import datetime, timezone

from app.core.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    """
    Returns the current service health status.

    Used by:
    - Frontend: shows connection indicator (green/red)
    - Monitoring: load balancer health checks
    - CI/CD: smoke tests verify the server starts
    """
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "components": {
            "database": "not_configured",  # Will be updated when DB is connected
            "llm_provider": "configured" if settings.LLM_API_KEY else "not_configured",
            "tts_provider": "configured" if settings.GOOGLE_APPLICATION_CREDENTIALS else "not_configured",
            "imd_weather": "configured" if settings.IMD_API_KEY else "not_configured",
        },
    }
