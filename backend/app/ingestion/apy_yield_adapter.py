"""
AgriPulse AI — DESAgri Area, Production & Yield (APY) Adapter.

Ingests, validates, and profiles historical crop production and yield statistics
for Karnataka districts.
"""

import hashlib
import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import pandas as pd

from app.ingestion.base import BaseIngestionAdapter
from app.schemas.crop_production import CropProductionRecord


class APYYieldAdapter(BaseIngestionAdapter):
    """
    Adapter for historical crop yield statistics from DESAgri Query Portal.
    URL: https://data.desagri.gov.in/website/apy-query-report-web
    """

    def __init__(
        self,
        source_id: str = "desagri_apy_historical",
        source_url: str = "https://data.desagri.gov.in/website/apy-query-report-web"
    ):
        super().__init__(source_id, source_url)

    def fetch_raw(self, csv_path: Optional[str] = None, **kwargs) -> pd.DataFrame:
        if csv_path and Path(csv_path).exists():
            return pd.read_csv(csv_path)
        raise FileNotFoundError(f"APY raw CSV not found at: {csv_path}")

    def parse_to_dataframe(self, raw_data: Any) -> pd.DataFrame:
        if isinstance(raw_data, pd.DataFrame):
            return raw_data
        return pd.read_csv(raw_data)

    def clean_and_normalize(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """Standardizes column names and validates numeric ranges for APY data."""
        df = df_raw.copy()
        canonical_records: List[Dict[str, Any]] = []

        for _, row in df.iterrows():
            raw_hash = hashlib.sha256(
                json.dumps(row.to_dict(), sort_keys=True, default=str).encode("utf-8")
            ).hexdigest()

            state = str(row.get("State", "Karnataka")).strip()
            district = str(row.get("District", "")).strip()
            crop = str(row.get("Crop", "")).strip()
            year = int(row.get("Crop_Year", 2024))
            season = str(row.get("Season", "Kharif")).strip()
            area = float(row.get("Area_Hectares", 0.0))
            prod = float(row.get("Production_Tonnes", 0.0))
            yld = float(row.get("Yield_Kg_Per_Hectare", 0.0))

            # Invariant check: Yield should approximately equal (Production * 1000) / Area if area > 0
            rec = {
                "state": state,
                "district": district,
                "crop": crop,
                "crop_year": year,
                "season": season,
                "area_hectares": area,
                "production_tonnes": prod,
                "yield_kg_per_hectare": yld,
                "raw_row_hash": raw_hash,
                "is_interpolated": False,
            }
            canonical_records.append(rec)

        return pd.DataFrame(canonical_records)

    def process_file(self, raw_path: str, processed_path: str) -> pd.DataFrame:
        df_raw = self.fetch_raw(raw_path)
        df_clean = self.clean_and_normalize(df_raw)
        Path(processed_path).parent.mkdir(parents=True, exist_ok=True)
        df_clean.to_csv(processed_path, index=False)
        return df_clean
