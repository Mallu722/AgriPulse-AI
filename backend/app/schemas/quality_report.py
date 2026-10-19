"""
AgriPulse AI — Data Quality Audit Report Schema.

Encapsulates machine-readable metrics produced during data ingestion:
missingness, duplicate counts, price statistics, range anomalies, and distribution skew.
"""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class NumericColumnStats(BaseModel):
    count: int
    missing_count: int
    missing_rate_percent: float
    min: Optional[float] = None
    max: Optional[float] = None
    mean: Optional[float] = None
    std: Optional[float] = None
    median: Optional[float] = None
    q25: Optional[float] = None
    q75: Optional[float] = None
    iqr: Optional[float] = None


class CategoricalColumnStats(BaseModel):
    unique_count: int
    missing_count: int
    missing_rate_percent: float
    top_categories: Dict[str, int] = Field(default_factory=dict)


class DataQualityReport(BaseModel):
    """
    Comprehensive machine-readable data quality report.
    Saved to data/processed/data_quality_report.json after every pipeline run.
    """
    dataset_name: str
    run_timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    raw_source_path: str
    total_raw_rows: int
    canonical_rows_emitted: int
    exact_duplicates_count: int
    exact_duplicates_percent: float
    logical_duplicates_count: int  # Same (date, market, commodity, variety)
    
    # Range & Logical Violations
    inverted_price_ranges_count: int  # min_price > max_price
    modal_out_of_bounds_count: int    # modal < min or modal > max
    zero_or_negative_prices_count: int
    flagged_outliers_count: int
    
    # Date Coverage
    date_coverage_start: Optional[str] = None
    date_coverage_end: Optional[str] = None
    total_calendar_days: int = 0
    missing_calendar_dates_count: int = 0
    
    # Detailed Column Audits
    numeric_columns: Dict[str, NumericColumnStats] = Field(default_factory=dict)
    categorical_columns: Dict[str, CategoricalColumnStats] = Field(default_factory=dict)
    
    # Actionable Audit Findings
    audit_findings: List[str] = Field(default_factory=list)
    cleaning_actions_taken: List[str] = Field(default_factory=list)
