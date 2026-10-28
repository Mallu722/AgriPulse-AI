"""
AgriPulse AI — Agmarknet, e-NAM & National OGD Mandi Price Adapter.

Provides ingestion, column mapping, normalization, and canonical record extraction
for APMC market price feeds:
1. National OGD Daily Mandi Prices (Resource: 6141ea17-a69d-4713-b600-0a43c8fd9a6c)
2. e-NAM AGMARKNET Price Dashboard Export (https://www.enam.gov.in/web/dashboard/agmarknet)
3. Karnataka State OGD Mandi Catalog CSVs
"""

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
import httpx
import pandas as pd

from app.ingestion.base import BaseIngestionAdapter
from app.ingestion.quality_auditor import DataQualityAuditor
from app.schemas.market_data import CanonicalPriceRecord
from app.schemas.quality_report import DataQualityReport


class AgmarknetMandiAdapter(BaseIngestionAdapter):
    """
    Adapter for Karnataka & National Open Government Data (OGD) and e-NAM/Agmarknet APMC datasets.
    Supports official CSV ingestion, National OGD API pagination, and variety-wise datasets.
    """

    # Official National OGD Agmarknet resource IDs on data.gov.in
    OGD_RESOURCE_DAILY_PRICES = "9ef84268-d588-465a-a308-a864a43d0070"
    OGD_RESOURCE_VARIETY_WISE = "35985678-0d79-46b4-9ed6-6f13308a1d24"
    NATIONAL_OGD_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"

    # Flexible column mappings supporting common Agmarknet variations
    COLUMN_ALIASES: Dict[str, List[str]] = {
        "state": ["state", "state_name", "State", "State Name"],
        "district": ["district", "district_name", "District", "District Name"],
        "market": ["market", "market_name", "Market", "Market Name", "apmc_market", "APMC"],
        "commodity": ["commodity", "commodity_name", "Commodity", "Commodity Name", "crop"],
        "variety": ["variety", "variety_name", "Variety", "Variety Name", "Grade"],
        "observation_date": ["arrival_date", "Arrival_Date", "date", "Date", "Price Date", "price_date"],
        "min_price": ["min_price", "Min_Price", "Min_x0020_Price", "Minimum Price", "min_price_rs"],
        "max_price": ["max_price", "Max_Price", "Max_x0020_Price", "Maximum Price", "max_price_rs"],
        "modal_price": ["modal_price", "Modal_Price", "Modal_x0020_Price", "Modal Price", "modal_price_rs"],
        "arrival_volume_tonnes": ["arrivals", "Arrivals", "Arrivals(Tonnes)", "arrival_quantity", "Arrival Quantity (Tonnes)"],
        "unit": ["unit", "Unit", "Price Unit", "unit_of_price"]
    }

    def __init__(
        self,
        source_id: str = "national_ogd_enam_agmarknet",
        source_url: str = "https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi"
    ):
        super().__init__(source_id, source_url)

    def fetch_raw(self, csv_path: Optional[str] = None, **kwargs) -> pd.DataFrame:
        """
        Loads raw data from official CSV or local raw cache.
        Preserves raw input immutability.
        """
        if csv_path and Path(csv_path).exists():
            return pd.read_csv(csv_path, dtype=str)
        raise FileNotFoundError(f"Raw source CSV not found at: {csv_path}")

    def fetch_national_ogd_api(
        self,
        api_key: str,
        resource_id: Optional[str] = None,
        state: str = "Karnataka",
        max_records: int = 5000,
        page_size: int = 1000,
    ) -> pd.DataFrame:
        """
        Fetches live mandi records from National OGD API (Data.gov.in) with automatic pagination.
        Handles both general and variety-wise resources.
        """
        res_id = resource_id or self.NATIONAL_OGD_RESOURCE_ID
        base_url = f"https://api.data.gov.in/resource/{res_id}"
        all_records: List[Dict[str, Any]] = []
        offset = 0

        while offset < max_records:
            params = {
                "api-key": api_key,
                "format": "json",
                "offset": offset,
                "limit": page_size,
                "filters[state]": state,
            }
            try:
                with httpx.Client(timeout=12.0) as client:
                    resp = client.get(base_url, params=params)
                    if resp.status_code == 200:
                        payload = resp.json()
                        records = payload.get("records", [])
                        if not records:
                            break
                        all_records.extend(records)
                        total = payload.get("total", len(all_records))
                        offset += len(records)
                        if offset >= total:
                            break
                    else:
                        break
            except Exception:
                break

        if all_records:
            return pd.DataFrame(all_records)
        return pd.DataFrame()

    def parse_to_dataframe(self, raw_data: Any) -> pd.DataFrame:
        if isinstance(raw_data, pd.DataFrame):
            return raw_data
        elif isinstance(raw_data, (str, Path)):
            return pd.read_csv(raw_data, dtype=str)
        elif isinstance(raw_data, list):
            return pd.DataFrame(raw_data)
        else:
            raise ValueError(f"Unsupported raw data format: {type(raw_data)}")

    def _resolve_column_name(self, df_cols: List[str], target_field: str) -> Optional[str]:
        """Maps varying source column names to our canonical field."""
        candidates = self.COLUMN_ALIASES.get(target_field, [target_field])
        for c in df_cols:
            if c in candidates:
                return c
            # Case-insensitive comparison
            for candidate in candidates:
                if c.strip().lower() == candidate.strip().lower():
                    return c
        return None

    def clean_and_normalize(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """
        Transforms raw DataFrame into canonical format:
        - Maps columns
        - Normalizes dates to YYYY-MM-DD
        - Converts prices and arrival volumes to float
        - Attaches SHA-256 raw-row hash for provenance
        - Preserves unmapped columns in extra_attributes
        """
        df = df_raw.copy()
        raw_cols = list(df.columns)

        # Build column map
        mapping: Dict[str, str] = {}
        for canonical_name in self.COLUMN_ALIASES.keys():
            matched = self._resolve_column_name(raw_cols, canonical_name)
            if matched:
                mapping[matched] = canonical_name

        canonical_records: List[Dict[str, Any]] = []

        for idx, row in df.iterrows():
            # 1. Compute raw row hash for audit provenance
            raw_row_str = json.dumps(row.to_dict(), sort_keys=True, default=str)
            row_hash = hashlib.sha256(raw_row_str.encode("utf-8")).hexdigest()

            # 2. Extract and clean canonical fields
            state_val = str(row.get(self._resolve_column_name(raw_cols, "state") or "", "Karnataka")).strip()
            district_val = str(row.get(self._resolve_column_name(raw_cols, "district") or "", "Unknown")).strip()
            market_val = str(row.get(self._resolve_column_name(raw_cols, "market") or "", "Unknown")).strip()
            commodity_val = str(row.get(self._resolve_column_name(raw_cols, "commodity") or "", "Unknown")).strip()
            variety_raw = row.get(self._resolve_column_name(raw_cols, "variety") or "", None)
            variety_val = str(variety_raw).strip() if pd.notna(variety_raw) and str(variety_raw).strip() != "" else None

            # Date normalization
            date_col = self._resolve_column_name(raw_cols, "observation_date")
            date_raw = row.get(date_col, "")
            obs_date_str = None
            if pd.notna(date_raw) and str(date_raw).strip():
                try:
                    parsed_dt = pd.to_datetime(str(date_raw).strip(), dayfirst=True)
                    obs_date_str = parsed_dt.strftime("%Y-%m-%d")
                except Exception:
                    obs_date_str = str(date_raw).strip()

            # Numeric conversion with safety
            def to_float(val: Any, default: float = 0.0) -> float:
                if pd.isna(val):
                    return default
                try:
                    clean_str = str(val).replace(",", "").replace("₹", "").replace("Rs.", "").strip()
                    return float(clean_str)
                except (ValueError, TypeError):
                    return default

            min_p = to_float(row.get(self._resolve_column_name(raw_cols, "min_price") or "", 0.0))
            max_p = to_float(row.get(self._resolve_column_name(raw_cols, "max_price") or "", 0.0))
            mod_p = to_float(row.get(self._resolve_column_name(raw_cols, "modal_price") or "", 0.0))
            
            arr_col = self._resolve_column_name(raw_cols, "arrival_volume_tonnes")
            arrival_val = to_float(row.get(arr_col, 0.0)) if arr_col else None

            unit_col = self._resolve_column_name(raw_cols, "unit")
            unit_val = str(row.get(unit_col, "Rs/Quintal")).strip() if unit_col and pd.notna(row.get(unit_col)) else "Rs/Quintal"

            # 3. Preserve unmapped fields in extra_attributes
            mapped_src_cols = set(mapping.keys())
            extra_attrs = {c: row[c] for c in raw_cols if c not in mapped_src_cols and pd.notna(row[c])}

            rec = {
                "source_id": self.source_id,
                "source_url": self.source_url,
                "retrieval_timestamp": datetime.now(timezone.utc).isoformat(),
                "observation_date": obs_date_str,
                "state": state_val,
                "district": district_val,
                "market": market_val,
                "commodity": commodity_val,
                "variety": variety_val,
                "arrival_volume_tonnes": arrival_val,
                "min_price": min_p,
                "max_price": max_p,
                "modal_price": mod_p,
                "unit": unit_val,
                "raw_row_hash": row_hash,
                "quality_flags": [],
                "is_outlier": False,
                "is_valid": True,
                "extra_attributes": extra_attrs,
            }
            canonical_records.append(rec)

        return pd.DataFrame(canonical_records)

    def process_file(
        self,
        raw_csv_path: str,
        processed_csv_path: str,
        report_json_path: str
    ) -> Tuple[pd.DataFrame, DataQualityReport]:
        """
        Complete pipeline execution:
        1. Reads raw CSV (immutable)
        2. Normalizes into canonical price DataFrame
        3. Runs statistical quality audit and outlier detection
        4. Writes clean dataset and machine-readable quality report
        """
        df_raw = self.fetch_raw(raw_csv_path)
        df_canonical = self.clean_and_normalize(df_raw)

        # Run quality audit
        auditor = DataQualityAuditor(dataset_name="National_OGD_eNAM_Agmarknet", raw_source_path=raw_csv_path)
        df_audited, report = auditor.audit_dataset(df_raw, df_canonical)

        # Save processed files
        Path(processed_csv_path).parent.mkdir(parents=True, exist_ok=True)
        df_export = df_audited.copy()
        df_export["quality_flags"] = df_export["quality_flags"].apply(lambda x: ";".join(x) if isinstance(x, list) else "")
        df_export["extra_attributes"] = df_export["extra_attributes"].apply(lambda x: json.dumps(x) if isinstance(x, dict) else "")
        df_export.to_csv(processed_csv_path, index=False, encoding="utf-8")

        auditor.save_report(report, report_json_path)
        return df_audited, report
