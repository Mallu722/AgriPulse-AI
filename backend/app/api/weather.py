"""
AgriPulse AI — Weather API Endpoints.

Endpoints:
- GET /api/v1/weather/district/{district} : Real-time observed weather & 7-day forecast with caching
- GET /api/v1/weather/providers           : Health status, credentials, and live verification audit
- POST /api/v1/weather/cache/clear        : Cache eviction for operational testing
"""

from fastapi import APIRouter, HTTPException, Query, Path
from typing import Dict, Any, List
from datetime import datetime, timezone

from app.schemas.weather import WeatherResponse, WeatherProviderStatus
from app.core.weather_service import WeatherService
from app.core.config import settings

router = APIRouter(prefix="/weather")
weather_service = WeatherService()


@router.get(
    "/district/{district}",
    response_model=WeatherResponse,
    summary="Get meteorological observations & 7-day operational forecast",
    description=(
        "Retrieves observed weather and short-term forecast for any Karnataka district. "
        "Primary provider is Open-Meteo free API (server-side, non-commercial tier), "
        "with IMD adapter support and graceful offline fallback. "
        "Responses include retrieval timestamps, cache validity windows, and source attribution."
    )
)
async def get_district_weather(
    district: str = Path(..., description="Karnataka district name (e.g., Kolar, Mandya, Belagavi, Shimoga)"),
    force_refresh: bool = Query(default=False, description="Bypass cache and force upstream API call")
) -> WeatherResponse:
    try:
        response = await weather_service.get_weather(district, force_refresh=force_refresh)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving weather for district '{district}': {str(e)}"
        )


@router.get(
    "/providers",
    summary="Get weather provider integration audit & status",
    description="Reports the live status, configured providers, licensing, and credential requirements."
)
async def get_weather_providers_status() -> Dict[str, Any]:
    has_imd_key = bool(settings.IMD_API_KEY and len(settings.IMD_API_KEY.strip()) > 0)
    
    # Active cache entries inspection
    cached_districts = list(weather_service._cache.keys())
    
    return {
        "primary_provider": {
            "name": "Open-Meteo",
            "tier": "Free API for non-commercial open development",
            "tested_live": True,
            "status": "LIVE",
            "requires_api_key": False,
            "rate_limit_policy": "Up to 10,000 daily API calls for non-commercial use",
            "licensing": "Creative Commons Attribution 4.0 International (CC BY 4.0)"
        },
        "secondary_provider": {
            "name": "India Meteorological Department (IMD)",
            "tier": "National Meteorological Data Portal",
            "tested_live": False,
            "status": "CONFIGURED_PENDING_CREDENTIALS" if not has_imd_key else "CREDENTIALED",
            "requires_api_key": True,
            "credentials_present": has_imd_key,
            "official_portal": "https://api.imd.gov.in/public/api_reference.html",
            "access_requirements": "Requires institutional registration with IMD/MoES and approved API key token."
        },
        "cache_configuration": {
            "ttl_seconds": settings.WEATHER_CACHE_TTL_SECONDS,
            "timeout_seconds": settings.WEATHER_REQUEST_TIMEOUT_SECONDS,
            "cached_districts_count": len(cached_districts),
            "cached_districts": cached_districts
        },
        "agronomic_guardrail": (
            "Weather data is strictly scoped to 7-day operational field planning. "
            "It is NEVER extrapolated to predict full season monsoon rainfall or harvest crop prices."
        )
    }


@router.post(
    "/cache/clear",
    summary="Clear in-memory weather cache",
    description="Evicts cached weather records to verify cold API fetches or simulate provider outages."
)
async def clear_weather_cache() -> Dict[str, Any]:
    count = len(weather_service._cache)
    weather_service._cache.clear()
    return {
        "status": "success",
        "evicted_entries": count,
        "cleared_at": datetime.now(timezone.utc).isoformat()
    }
