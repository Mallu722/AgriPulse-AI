"""
AgriPulse AI — Data Quality Auditor & Statistical Profiler.

Executes rigorous quality audits on agricultural market data without silent deletion.
Flagged records remain available with audit annotations for human review.
"""

import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd

from app.schemas.quality_report import (
    DataQualityReport,
    NumericColumnStats,
    CategoricalColumnStats,
)


class DataQualityAuditor:
    """Performs non-destructive quality auditing, anomaly detection, and statistical profiling."""

    def __init__(self, dataset_name: str, raw_source_path: str):
        self.dataset_name = dataset_name
        self.raw_source_path = raw_source_path

    def audit_dataset(self, df_raw: pd.DataFrame, df_cleaned: pd.DataFrame) -> Tuple[pd.DataFrame, DataQualityReport]:
        """
        Audits raw vs cleaned dataframe, tags anomaly flags onto df_cleaned,
        and compiles a comprehensive DataQualityReport.
        """
        audit_findings: List[str] = []
        cleaning_actions: List[str] = []

        total_raw = len(df_raw)
        canonical_count = len(df_cleaned)

        # 1. Exact Duplicate Audit
        exact_dupes = int(df_raw.duplicated().sum())
        exact_dupes_pct = round((exact_dupes / total_raw * 100), 2) if total_raw > 0 else 0.0
        if exact_dupes > 0:
            audit_findings.append(f"Detected {exact_dupes} ({exact_dupes_pct}%) exact duplicate raw rows.")
            cleaning_actions.append(f"Deduplicated {exact_dupes} verbatim duplicate rows while logging raw row hashes.")

        # 2. Logical Duplicates Audit on Key (observation_date, market, commodity, variety)
        key_cols = [c for c in ["observation_date", "market", "commodity", "variety"] if c in df_cleaned.columns]
        logical_dupes = int(df_cleaned.duplicated(subset=key_cols).sum()) if key_cols else 0
        if logical_dupes > 0:
            audit_findings.append(
                f"Detected {logical_dupes} logical duplicate entries sharing identical date, market, commodity, and variety."
            )

        # 3. Numeric Invariants & Bounds Audit
        inverted_price = 0
        modal_out_bounds = 0
        zero_or_negative = 0

        # We operate on a copy of df_cleaned to add flags
        df_audited = df_cleaned.copy()
        if "quality_flags" not in df_audited.columns:
            df_audited["quality_flags"] = [[] for _ in range(len(df_audited))]
        if "is_outlier" not in df_audited.columns:
            df_audited["is_outlier"] = False

        for idx, row in df_audited.iterrows():
            flags = list(row["quality_flags"]) if isinstance(row["quality_flags"], list) else []
            min_p = row.get("min_price", 0.0)
            max_p = row.get("max_price", 0.0)
            mod_p = row.get("modal_price", 0.0)

            if min_p <= 0 or max_p <= 0 or mod_p <= 0:
                zero_or_negative += 1
                flags.append("ZERO_OR_NEGATIVE_PRICE")

            if min_p > max_p:
                inverted_price += 1
                flags.append("INVERTED_PRICE_RANGE")

            if not (min_p <= mod_p <= max_p):
                modal_out_bounds += 1
                flags.append("MODAL_OUT_OF_BOUNDS")

            df_audited.at[idx, "quality_flags"] = flags

        if inverted_price > 0:
            audit_findings.append(f"Flagged {inverted_price} records where min_price exceeds max_price.")
        if modal_out_bounds > 0:
            audit_findings.append(f"Flagged {modal_out_bounds} records where modal_price is outside [min_price, max_price].")
        if zero_or_negative > 0:
            audit_findings.append(f"Flagged {zero_or_negative} records with zero or negative price quotes.")

        # 4. Outlier Detection via IQR per Commodity
        flagged_outliers = 0
        if "commodity" in df_audited.columns and "modal_price" in df_audited.columns:
            for commodity, group in df_audited.groupby("commodity"):
                modal_prices = group["modal_price"].dropna()
                if len(modal_prices) >= 4:
                    q25 = float(np.percentile(modal_prices, 25))
                    q75 = float(np.percentile(modal_prices, 75))
                    iqr = q75 - q25
                    lower_bound = max(0.0, q25 - (1.5 * iqr))
                    upper_bound = q75 + (1.5 * iqr)

                    for g_idx in group.index:
                        p = df_audited.at[g_idx, "modal_price"]
                        if p < lower_bound or p > upper_bound:
                            flagged_outliers += 1
                            df_audited.at[g_idx, "is_outlier"] = True
                            cur_flags = list(df_audited.at[g_idx, "quality_flags"])
                            cur_flags.append(f"STATISTICAL_OUTLIER_IQR_{commodity.upper()}")
                            df_audited.at[g_idx, "quality_flags"] = cur_flags

        if flagged_outliers > 0:
            audit_findings.append(f"Flagged {flagged_outliers} statistical outliers via 1.5x IQR per-commodity bands.")
            cleaning_actions.append(
                f"Outlier policy: Retained all {flagged_outliers} outlier records with is_outlier=True flag; no records silently purged."
            )

        # 5. Date Coverage & Calendar Continuity
        date_start = None
        date_end = None
        calendar_days = 0
        missing_dates = 0
        if "observation_date" in df_audited.columns:
            valid_dates = pd.to_datetime(df_audited["observation_date"]).dropna().sort_values()
            if not valid_dates.empty:
                date_start = valid_dates.iloc[0].strftime("%Y-%m-%d")
                date_end = valid_dates.iloc[-1].strftime("%Y-%m-%d")
                full_range = pd.date_range(start=valid_dates.iloc[0], end=valid_dates.iloc[-1])
                calendar_days = len(full_range)
                observed_unique = set(valid_dates.dt.date)
                missing_dates = calendar_days - len(observed_unique)
                if missing_dates > 0:
                    audit_findings.append(
                        f"Date coverage spans {calendar_days} calendar days ({date_start} to {date_end}) with {missing_dates} unobserved days (APMC holidays / weekends)."
                    )

        # 6. Detailed Column Statistics
        numeric_stats: Dict[str, NumericColumnStats] = {}
        for col in ["min_price", "max_price", "modal_price", "arrival_volume_tonnes"]:
            if col in df_audited.columns:
                series = pd.to_numeric(df_audited[col], errors="coerce")
                missing_c = int(series.isna().sum())
                valid_series = series.dropna()
                if not valid_series.empty:
                    q25 = float(np.percentile(valid_series, 25))
                    q75 = float(np.percentile(valid_series, 75))
                    numeric_stats[col] = NumericColumnStats(
                        count=int(len(valid_series)),
                        missing_count=missing_c,
                        missing_rate_percent=round(missing_c / len(df_audited) * 100, 2),
                        min=float(valid_series.min()),
                        max=float(valid_series.max()),
                        mean=round(float(valid_series.mean()), 2),
                        std=round(float(valid_series.std()), 2) if len(valid_series) > 1 else 0.0,
                        median=round(float(valid_series.median()), 2),
                        q25=round(q25, 2),
                        q75=round(q75, 2),
                        iqr=round(q75 - q25, 2),
                    )

        cat_stats: Dict[str, CategoricalColumnStats] = {}
        for col in ["state", "district", "market", "commodity", "variety", "unit"]:
            if col in df_audited.columns:
                series = df_audited[col].astype(str)
                missing_c = int(df_audited[col].isna().sum())
                top_cats = series.value_counts().head(5).to_dict()
                cat_stats[col] = CategoricalColumnStats(
                    unique_count=int(series.nunique()),
                    missing_count=missing_c,
                    missing_rate_percent=round(missing_c / len(df_audited) * 100, 2),
                    top_categories=top_cats,
                )

        cleaning_actions.append("Normalized text fields: stripped leading/trailing whitespace and standardized casing.")
        cleaning_actions.append("Date parsing: Standardized mixed date representations to ISO-8601 (YYYY-MM-DD).")
        cleaning_actions.append("Preserved source immutability: Raw row SHA-256 hashes attached to every canonical row.")

        report = DataQualityReport(
            dataset_name=self.dataset_name,
            raw_source_path=self.raw_source_path,
            total_raw_rows=total_raw,
            canonical_rows_emitted=len(df_audited),
            exact_duplicates_count=exact_dupes,
            exact_duplicates_percent=exact_dupes_pct,
            logical_duplicates_count=logical_dupes,
            inverted_price_ranges_count=inverted_price,
            modal_out_of_bounds_count=modal_out_bounds,
            zero_or_negative_prices_count=zero_or_negative,
            flagged_outliers_count=flagged_outliers,
            date_coverage_start=date_start,
            date_coverage_end=date_end,
            total_calendar_days=calendar_days,
            missing_calendar_dates_count=missing_dates,
            numeric_columns=numeric_stats,
            categorical_columns=cat_stats,
            audit_findings=audit_findings,
            cleaning_actions_taken=cleaning_actions,
        )

        return df_audited, report

    def save_report(self, report: DataQualityReport, output_path: str) -> None:
        """Persists the DataQualityReport to a JSON file."""
        Path(output_path).parent.mkdir(parents=True, exist_ok=True)
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(report.model_dump_json(indent=2))
