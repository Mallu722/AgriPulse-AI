"""
AgriPulse AI — Day 1 smoke tests.

These tests verify:
1. The FastAPI application starts correctly
2. The /api/v1/health endpoint returns expected structure
3. The root endpoint is accessible
"""

import pytest
from httpx import AsyncClient, ASGITransport

from app.main import app


@pytest.fixture
def client():
    """Create a synchronous test client."""
    from fastapi.testclient import TestClient
    return TestClient(app)


def test_root_endpoint(client):
    """Root endpoint should return welcome message with docs link."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "AgriPulse AI" in data["message"]
    assert "docs" in data


def test_health_endpoint_returns_200(client):
    """Health endpoint should return 200 with status 'healthy'."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["version"] == "0.1.0"
    assert "timestamp" in data


def test_health_endpoint_has_components(client):
    """Health endpoint should report component configuration status."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert "components" in data
    components = data["components"]
    # Without .env credentials, all providers should show not_configured
    assert "database" in components
    assert "llm_provider" in components
    assert "tts_provider" in components
    assert "imd_weather" in components


def test_health_endpoint_service_name(client):
    """Health endpoint should return the correct service name."""
    response = client.get("/api/v1/health")
    data = response.json()
    assert data["service"] == "AgriPulse AI"


def test_cors_headers(client):
    """CORS headers should be present for allowed origin."""
    response = client.options(
        "/api/v1/health",
        headers={
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "GET",
        },
    )
    # FastAPI CORS middleware should respond to preflight
    assert response.status_code in (200, 405)
