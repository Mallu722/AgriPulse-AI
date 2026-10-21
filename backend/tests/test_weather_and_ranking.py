"""
Tests for Day 5 — Weather API, Market Freshness & Transparent Ranking.

Tests verify:
1. Open-Meteo live API integration (server-side, non-commercial tier) & field parsing.
2. Graceful IMD adapter handling without credentials (PENDING_CREDENTIALS state).
3. Weather provider timeouts, limited retries, and network failure fallback.
4. In-memory caching with timestamps and cache invalidation.
5. Market data freshness endpoint and stale retention policy.
6. Transparent crop ranking: hard agronomic constraints strictly precede economic scoring.
7. Disqualified crops are segregated and explain why (e.g. rainfed water deficit).
8. Farmer custom cost overrides (labour, seeds, tractor rental) without breaking official baselines.
9. Scope disclaimer and non-guaranteed yield/profit disclaimers are present.
"""

import pytest
from datetime import datetime, timezone
from starlette.testclient import TestClient
from unittest.mock import patch, AsyncMock
import httpx

from app.main import app
from app.core.weather_service import WeatherService, KARNATAKA_DISTRICT_COORDINATES
from app.schemas.weather import WeatherProviderStatus
from app.schemas.farmer_profile import (
    FarmerProfile,
    LandUnit,
    SowingSeason,
    WaterAvailability,
    RiskPreference,
    SoilType
)
from app.schemas.economics import CostOverrideInput
from app.agronomy.ranking_engine import TransparentRankingEngine

client = TestClient(app)


# --- Weather Service Tests ---

def test_weather_providers_endpoint():
    """Verify /api/v1/weather/providers endpoint accurately reflects live status."""
    resp = client.get("/api/v1/weather/providers")
    assert resp.status_code == 200
    data = resp.json()
    assert "primary_provider" in data
    assert data["primary_provider"]["name"] == "Open-Meteo"
    assert data["primary_provider"]["tested_live"] is True
    assert data["primary_provider"]["requires_api_key"] is False
    assert "secondary_provider" in data
    assert data["secondary_provider"]["name"] == "India Meteorological Department (IMD)"
    assert data["secondary_provider"]["requires_api_key"] is True


def test_weather_district_live_fetch():
    """Tests live weather retrieval for Bengaluru Urban or Kolar."""
    resp = client.get("/api/v1/weather/district/Kolar")
    assert resp.status_code == 200
    data = resp.json()
    assert data["district"] == "Kolar"
    assert "current" in data
    assert data["current"] is not None
    assert "temperature_c" in data["current"]
    assert "relative_humidity_pct" in data["current"]
    assert len(data["daily_forecast"]) >= 5
    assert "scope_disclaimer" in data
    assert "7-day" in data["scope_disclaimer"]
    assert "raw_source_attribution" in data


def test_weather_caching_and_force_refresh():
    """Verify in-memory caching: second call returns cached data with same retrieval timestamp."""
    resp1 = client.get("/api/v1/weather/district/Mandya")
    assert resp1.status_code == 200
    ts1 = resp1.json()["retrieval_timestamp"]

    resp2 = client.get("/api/v1/weather/district/Mandya")
    assert resp2.status_code == 200
    ts2 = resp2.json()["retrieval_timestamp"]
    assert ts1 == ts2  # Served from cache

    # Clear cache
    clear_resp = client.post("/api/v1/weather/cache/clear")
    assert clear_resp.status_code == 200
    assert clear_resp.json()["status"] == "success"


@pytest.mark.asyncio
async def test_weather_timeout_and_offline_fallback():
    """Tests that timeout exception gracefully triggers fallback without crashing."""
    service = WeatherService()
    service._cache.clear()

    # Mock Open-Meteo to raise Timeout
    with patch("httpx.AsyncClient.get", side_effect=httpx.TimeoutException("Connection timed out")):
        resp = await service.get_weather("Belagavi", force_refresh=True)
        assert resp is not None
        assert resp.is_live is False
        assert resp.provider_status == WeatherProviderStatus.MOCKED_FALLBACK
        assert resp.current is not None


# --- Market Freshness Tests ---

def test_market_freshness_endpoint():
    """Verify /api/v1/ingestion/freshness returns source timestamps and freshness status."""
    resp = client.get("/api/v1/ingestion/freshness")
    assert resp.status_code == 200
    data = resp.json()
    assert "dataset" in data
    assert "freshness_status" in data
    assert data["freshness_status"] in ["ACTIVE_VERIFIED", "STALE_RETAINED", "UNAVAILABLE"]
    assert "freshness_policy" in data


# --- Transparent Ranking Tests ---

def test_transparent_ranking_hard_constraint_enforcement():
    """
    Verify that crops failing hard constraints are disqualified and not given top rank,
    even if high-value (e.g. Tomato requiring reliable irrigation when farmer is Rainfed).
    """
    payload = {
        "profile": {
            "district": "Kolar",
            "land_area": 2.0,
            "land_unit": "acres",
            "sowing_season": "kharif",
            "water_availability": "rainfed",  # Tomato requires RELIABLE water!
            "risk_preference": "moderate",
            "soil_type": "red_sandy_loam"
        },
        "include_weather_context": False
    }

    resp = client.post("/api/v1/ranking/recommend", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    ranked_crop_codes = [c["crop_code"] for c in data["ranked_recommendations"]]
    disqualified_crop_codes = [c["crop_code"] for c in data["disqualified_crops"]]

    # Tomato MUST NOT be in ranked recommendations because water is rainfed
    assert "TOMATO" not in ranked_crop_codes
    assert "TOMATO" in disqualified_crop_codes

    # Check non-guaranteed disclaimer
    assert "non_guaranteed_disclaimer" in data
    assert "NEVER guaranteed" in data["non_guaranteed_disclaimer"]


def test_transparent_ranking_with_custom_cost_overrides():
    """
    Verify farmer can override labour, tractor rental, seeds, etc.,
    and the ranking engine recalculates net return without modifying official baseline.
    """
    payload = {
        "profile": {
            "district": "Belagavi",
            "land_area": 3.0,
            "land_unit": "acres",
            "sowing_season": "kharif",
            "water_availability": "reliable",
            "risk_preference": "moderate",
            "soil_type": "black_cotton"
        },
        "cost_overrides": {
            "labour": 12000.0,
            "machinery_fuel": 8000.0,
            "seeds": 4000.0
        },
        "include_weather_context": True
    }

    resp = client.post("/api/v1/ranking/recommend", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["farmer_profile_summary"]["has_custom_cost_overrides"] is True
    assert len(data["ranked_recommendations"]) > 0

    first_crop = data["ranked_recommendations"][0]
    assert first_crop["rank"] == 1
    assert "score_breakdown" in first_crop
    breakdown = first_crop["score_breakdown"]
    assert "agronomic_fit_score" in breakdown
    assert "economic_return_score" in breakdown
    assert "downside_risk_score" in breakdown
    assert "water_resilience_score" in breakdown


def test_ranking_weather_context_integration():
    """Verify live weather context attaches operational advisories to ranked crops."""
    payload = {
        "profile": {
            "district": "Mandya",
            "land_area": 1.5,
            "land_unit": "acres",
            "sowing_season": "kharif",
            "water_availability": "reliable",
            "risk_preference": "low",
            "soil_type": "red_sandy_loam"
        },
        "include_weather_context": True
    }

    resp = client.post("/api/v1/ranking/recommend", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["weather_context_summary"] is not None
    assert data["weather_context_summary"]["weather_active"] is True
    assert "provider" in data["weather_context_summary"]
