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

# --- Application Factory ---
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description=(
        "Karnataka-focused crop suitability, market intelligence, "
        "profit-scenario and Kannada voice-assistant API."
    ),
    docs_url="/docs",
    redoc_url="/redoc",
)

# --- CORS Middleware ---
# The frontend (React on localhost:5173) and backend (FastAPI on localhost:8000)
# run on different origins. CORS allows the browser to permit cross-origin requests.
# In production, restrict this to only the deployed frontend domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Route Registration ---
# All API routes are prefixed with /api/v1 for versioning.
# This allows future /api/v2 without breaking existing clients.
app.include_router(health_router, prefix="/api/v1", tags=["Health"])


# --- Root Redirect ---
@app.get("/", include_in_schema=False)
async def root():
    """Root endpoint redirects to API docs for developer convenience."""
    return {
        "message": f"Welcome to {settings.APP_NAME} API",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
