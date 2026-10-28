"""
AgriPulse AI — FastAPI application entry point.

This is the main application module that:
1. Creates the FastAPI application instance
2. Configures CORS middleware for frontend communication
3. Registers API route modules under /api/v1 prefix
4. Provides auto-generated API documentation at /docs
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.health import router as health_router
from app.api.ingestion import router as ingestion_router
from app.api.suitability import router as suitability_router
from app.api.economics import router as economics_router
from app.api.weather import router as weather_router
from app.api.ranking import router as ranking_router
from app.api.assistant import router as assistant_router
from app.api.tts import router as tts_router

# --- Application Factory ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Karnataka-focused crop suitability, market intelligence, "
        "profit-scenario, weather integration, and Kannada voice-assistant API."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS Middleware ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route Registration ---
app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(ingestion_router, prefix="/api/v1", tags=["Data Ingestion & Quality Audit"])
app.include_router(suitability_router, prefix="/api/v1", tags=["Agronomy & Crop Suitability"])
app.include_router(economics_router, prefix="/api/v1", tags=["Economics & Profit Scenarios"])
app.include_router(weather_router, prefix="/api/v1", tags=["Meteorology & Weather Intelligence"])
app.include_router(ranking_router, prefix="/api/v1", tags=["Transparent Crop Ranking & Recommendations"])
app.include_router(assistant_router, prefix="/api/v1", tags=["RAG Assistant & Agricultural Guidance"])
app.include_router(tts_router, prefix="/api/v1", tags=["Multilingual Text-to-Speech (TTS)"])



# --- Root Redirect ---
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirects to API docs for developer convenience."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/api/v1/health",
        "ingestion_summary": "/api/v1/ingestion/mandi/summary",
        "quality_report": "/api/v1/ingestion/quality-report"
    }
