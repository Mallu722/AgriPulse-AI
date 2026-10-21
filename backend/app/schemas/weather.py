"""
AgriPulse AI — Weather and Meteorological Schemas.

Covers:
- Observed / Current conditions with source metadata
- Short-term 5 to 7 day operational forecasts
- Distinctions between observation_time, issuance_time, and forecast_valid_time
- Data freshness indicators, provider status, and agronomic operational advisory
"""

from datetime import datetime, date
from enum import Enum
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class WeatherProviderStatus(str, Enum):
    LIVE = "LIVE"
    STALE_CACHE = "STALE_CACHE"
    MOCKED_FALLBACK = "MOCKED_FALLBACK"
    PENDING_CREDENTIALS = "PENDING_CREDENTIALS"
    UNAVAILABLE = "UNAVAILABLE"


class CurrentWeatherCondition(BaseModel):
    """Real-time current meteorological observations."""
    observation_time: datetime = Field(..., description="Timestamp of physical sensor observation or provider update")
    temperature_c: float = Field(..., description="Current 2m air temperature (°C)")
    relative_humidity_pct: float = Field(..., ge=0.0, le=100.0, description="Relative humidity (%)")
    precipitation_mm: float = Field(default=0.0, ge=0.0, description="Current precipitation rate (mm/hr)")
    weather_code: Optional[int] = Field(None, description="WMO weather code")
    weather_description: str = Field(..., description="Human-readable condition (e.g., Clear, Light Rain, Overcast)")
    wind_speed_kmh: Optional[float] = Field(None, ge=0.0, description="Wind speed at 10m (km/h)")


class DailyWeatherForecast(BaseModel):
    """Daily forecast item for operational short-term planning (1 to 7 days)."""
    forecast_date: date = Field(..., description="Forecast valid date (YYYY-MM-DD)")
    temp_max_c: float = Field(..., description="Maximum temperature (°C)")
    temp_min_c: float = Field(..., description="Minimum temperature (°C)")
    precipitation_sum_mm: float = Field(..., ge=0.0, description="Estimated total precipitation (mm)")
    precipitation_probability_pct: Optional[float] = Field(None, ge=0.0, le=100.0, description="Precipitation probability (0-100%)")
    advisory_tag: Optional[str] = Field(None, description="Agronomic operational tag (e.g. SOWING_SAFE, SPRAY_ALERT_RAIN)")


class AgronomicWeatherAdvisory(BaseModel):
    """Near-term operational agricultural advisory grounded in verified weather."""
    category: str = Field(..., description="Category: SPRAYING, SOWING, IRRIGATION, HARVEST")
    level: str = Field(..., description="Severity: INFO, ADVISORY, WARNING")
    headline: str = Field(..., description="Short headline in English")
    headline_kannada: Optional[str] = Field(None, description="Headline in Kannada")
    recommendation: str = Field(..., description="Actionable recommendation based on official UAS Bangalore package of practices")
    scientific_basis: str = Field(..., description="Specific weather threshold triggered (e.g., Rain > 10mm or Wind > 15km/h)")


class WeatherResponse(BaseModel):
    """Complete meteorological response with source attribution and freshness."""
    provider: str = Field(..., description="Active weather provider (e.g., 'Open-Meteo Free API', 'IMD Meteorological Service')")
    provider_status: WeatherProviderStatus = Field(..., description="LIVE, STALE_CACHE, MOCKED_FALLBACK, or PENDING_CREDENTIALS")
    is_live: bool = Field(..., description="True ONLY if verified live API response was fetched within freshness window")
    is_stale: bool = Field(default=False, description="True if response came from expired cache or historical fallback")
    
    # Coordinates & Location
    district: str = Field(..., description="Karnataka district name")
    latitude: float = Field(..., description="Representative latitude")
    longitude: float = Field(..., description="Representative longitude")
    
    # Timestamps for transparency
    retrieval_timestamp: datetime = Field(..., description="When our server retrieved or cached this record")
    issuance_timestamp: Optional[datetime] = Field(None, description="When the meteorological service issued the forecast")
    cache_valid_until: Optional[datetime] = Field(None, description="Timestamp after which cache is considered stale")
    
    # Data payloads
    current: Optional[CurrentWeatherCondition] = Field(None, description="Observed current weather")
    daily_forecast: List[DailyWeatherForecast] = Field(default_factory=list, description="7-day operational forecast")
    operational_advisories: List[AgronomicWeatherAdvisory] = Field(default_factory=list, description="Weather-linked farm advisories")
    
    # Explicit Guardrail Notice
    scope_disclaimer: str = Field(
        default=(
            "7-day short-term meteorological forecast is for operational guidance (spraying, field preparation, irrigation). "
            "It does NOT represent seasonal monsoon totals or future harvest-season crop prices."
        ),
        description="Mandatory agronomic boundary caveat"
    )
    raw_source_attribution: str = Field(
        ...,
        description="Licensing, attribution, and citation (e.g., Open-Meteo under CC BY 4.0 / IMD)"
    )
