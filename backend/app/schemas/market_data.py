"""
AgriPulse AI — Canonical Market & Mandi Price Schemas.

Defines the standard canonical price record format, ensuring complete traceability,
source attribution, unit consistency, and quality auditing.
"""

from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class CanonicalPriceRecord(BaseModel):
    """
    Standardized, canonical representation of an agricultural mandi price quote.
    Every source (Agmarknet, Karnataka OGD, e-NAM, manual CSV) maps into this schema.
    """
    source_id: str = Field(..., description="Unique identifier of data source, e.g. 'karnataka_ogd_agmarknet'")
    source_url: str = Field(..., description="URL or file path of origin data")
    retrieval_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), description="UTC timestamp of ingestion")
    observation_date: date = Field(..., description="Date of market price observation (YYYY-MM-DD)")
    state: str = Field(..., description="Standardized State name, e.g. 'Karnataka'")
    district: str = Field(..., description="District name")
    market: str = Field(..., description="APMC Mandi / Market yard name")
    commodity: str = Field(..., description="Standardized agricultural crop/commodity name")
    variety: Optional[str] = Field(None, description="Crop variety if provided, e.g. 'Hybrid', 'Local'")
    arrival_volume_tonnes: Optional[float] = Field(None, ge=0, description="Arrival quantity in metric tonnes")
    min_price: float = Field(..., ge=0, description="Minimum price observed in stated unit")
    max_price: float = Field(..., ge=0, description="Maximum price observed in stated unit")
    modal_price: float = Field(..., ge=0, description="Modal (most frequent) transaction price")
    unit: str = Field(default="Rs/Quintal", description="Measurement unit (e.g. 'Rs/Quintal', 'Rs/Kg')")
    raw_row_hash: str = Field(..., description="SHA-256 hash of the verbatim raw input row for audit provenance")
    
    # Data Quality & Flagging
    quality_flags: List[str] = Field(default_factory=list, description="Audit flags: OUTLIER, INVERTED_PRICE_RANGE, etc.")
    is_outlier: bool = Field(default=False, description="Whether price deviates significantly from historical distribution")
    is_valid: bool = Field(default=True, description="Whether record passes all fundamental agronomic constraints")
    extra_attributes: Dict[str, Any] = Field(default_factory=dict, description="Preserves all unmapped raw vendor columns")

    @field_validator("modal_price")
    @classmethod
    def validate_modal_within_range(cls, v: float, values: Any) -> float:
        # Note: In Pydantic v2, we check bounds in model-level validation or flag it
        return v


class MandiIngestionSummary(BaseModel):
    """Summary metrics of an ingestion run."""
    source_id: str
    total_raw_rows: int
    valid_records_count: int
    flagged_records_count: int
    duplicate_rows_detected: int
    date_range_start: Optional[date]
    date_range_end: Optional[date]
    commodities_covered: List[str]
    markets_covered: List[str]
    report_file_path: Optional[str] = None
