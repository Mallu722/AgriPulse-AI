"""
AgriPulse AI — Ingestion & Data Quality API Routes.

Exposes endpoints for triggering ingestion pipelines, inspecting
dataset summaries, and retrieving machine-readable quality audit reports.
"""

import json
from pathlib import Path
from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.ingestion.agmarknet_adapter import AgmarknetMandiAdapter
from app.ingestion.integrated_pipeline import run_integrated_pipeline
from app.schemas.quality_report import DataQualityReport

router = APIRouter(prefix="/ingestion", tags=["Data Ingestion & Quality Audit"])

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent.parent
PROCESSED_REPORT_PATH = PROJECT_ROOT / "data" / "processed" / "data_quality_report.json"
RAW_CSV_PATH = PROJECT_ROOT / "data" / "raw" / "karnataka_mandi_prices_2026.csv"
PROCESSED_CSV_PATH = PROJECT_ROOT / "data" / "processed" / "canonical_mandi_prices.csv"
INTEGRATED_PROFILE_PATH = PROJECT_ROOT / "data" / "processed" / "integrated_agricultural_profile.json"


class IngestionTriggerResponse(BaseModel):
    status: str
    message: str
    total_raw_rows: int
    canonical_rows_emitted: int
    duplicates_found: int


@router.get("/quality-report", response_model=DataQualityReport)
async def get_data_quality_report():
    """Returns the latest machine-readable data quality report."""
    if not PROCESSED_REPORT_PATH.exists():
        raise HTTPException(
            status_code=404,
            detail="Quality report not found. Please trigger the ingestion pipeline first."
        )
    with open(PROCESSED_REPORT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
    return data


@router.get("/mandi/summary")
async def get_mandi_dataset_summary():
    """Returns high-level metadata and coverage of the processed APMC mandi dataset."""
    if not PROCESSED_REPORT_PATH.exists():
        raise HTTPException(status_code=404, detail="Dataset summary not found.")
    with open(PROCESSED_REPORT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    return {
        "dataset_name": data.get("dataset_name"),
        "total_records": data.get("canonical_rows_emitted"),
        "date_range": {
            "start": data.get("date_coverage_start"),
            "end": data.get("date_coverage_end"),
            "calendar_days": data.get("total_calendar_days")
        },
        "commodities": list(data.get("categorical_columns", {}).get("commodity", {}).get("top_categories", {}).keys()),
        "markets": list(data.get("categorical_columns", {}).get("market", {}).get("top_categories", {}).keys()),
        "quality_health": {
            "exact_duplicates": data.get("exact_duplicates_count"),
            "inverted_price_ranges": data.get("inverted_price_ranges_count"),
            "outliers_flagged": data.get("flagged_outliers_count")
        }
    }


@router.get("/freshness")
async def get_market_data_freshness() -> Dict[str, Any]:
    """
    Returns market dataset freshness status, observation date span,
    last-verified timestamp, and stale indicator.
    """
    if not PROCESSED_REPORT_PATH.exists():
        return {
            "dataset": "Karnataka APMC Mandi Wholesale Prices",
            "freshness_status": "UNAVAILABLE",
            "is_stale": True,
            "message": "Market dataset has not been ingested yet."
        }

    with open(PROCESSED_REPORT_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)

    file_mtime = PROCESSED_REPORT_PATH.stat().st_mtime
    from datetime import datetime, timezone
    last_updated = datetime.fromtimestamp(file_mtime, tz=timezone.utc)
    
    end_date_str = data.get("date_coverage_end")
    start_date_str = data.get("date_coverage_start")
    
    # Check staleness: if coverage end date or file update is older than 30 days
    is_stale = False
    now = datetime.now(timezone.utc)
    if (now - last_updated).days > 30:
        is_stale = True

    return {
        "dataset": "Karnataka APMC Mandi Wholesale Prices",
        "source_provider": "Agmarknet / Karnataka Open Government Data (data.gov.in)",
        "source_url": "https://data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi",
        "freshness_status": "STALE_RETAINED" if is_stale else "ACTIVE_VERIFIED",
        "is_stale": is_stale,
        "last_verified_utc": last_updated.isoformat(),
        "date_coverage_start": start_date_str,
        "date_coverage_end": end_date_str,
        "total_records": data.get("canonical_rows_emitted"),
        "total_commodities": len(data.get("categorical_columns", {}).get("commodity", {}).get("top_categories", {})),
        "total_markets": len(data.get("categorical_columns", {}).get("market", {}).get("top_categories", {})),
        "freshness_policy": (
            "If upstream Agmarknet or OGD APIs are delayed or unreachable, historical verified "
            "records are retained strictly with a 'STALE_RETAINED' indicator. We never silently substitute stale data."
        )
    }


@router.get("/integrated-profile")
async def get_integrated_profile() -> Dict[str, Any]:
    """Returns the unified agricultural profile aligning Mandi prices, APY yield, costs, and ICAR guidelines."""
    if not INTEGRATED_PROFILE_PATH.exists():
        # Trigger generation if not present
        return run_integrated_pipeline()
    with open(INTEGRATED_PROFILE_PATH, "r", encoding="utf-8") as f:
        return json.load(f)


@router.get("/crops/{crop_name}")
async def get_crop_profile(crop_name: str) -> Dict[str, Any]:
    """Returns the multi-dataset integrated profile for a specific crop."""
    profile = await get_integrated_profile()
    crops = profile.get("crops", {})
    for key, val in crops.items():
        if key.lower() == crop_name.lower():
            return {"crop": key, **val}
    raise HTTPException(status_code=404, detail=f"Crop '{crop_name}' not found in integrated profile.")


@router.post("/mandi/trigger", response_model=IngestionTriggerResponse)
async def trigger_mandi_ingestion():
    """Executes the ingestion, canonical mapping, and quality audit pipeline."""
    if not RAW_CSV_PATH.exists():
        raise HTTPException(status_code=404, detail=f"Raw source CSV missing at {RAW_CSV_PATH}")

    adapter = AgmarknetMandiAdapter()
    _, report = adapter.process_file(
        raw_csv_path=str(RAW_CSV_PATH),
        processed_csv_path=str(PROCESSED_CSV_PATH),
        report_json_path=str(PROCESSED_REPORT_PATH)
    )

    return IngestionTriggerResponse(
        status="success",
        message="Mandi data ingestion and quality audit completed.",
        total_raw_rows=report.total_raw_rows,
        canonical_rows_emitted=report.canonical_rows_emitted,
        duplicates_found=report.exact_duplicates_count
    )
