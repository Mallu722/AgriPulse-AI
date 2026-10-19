"""
AgriPulse AI — Day 2 Ingestion & Data Quality Pipeline Runner.

Executes the end-to-end ingestion, normalization, quality auditing,
and exploratory data analysis (EDA) summary on agricultural market data.
"""

import sys
from pathlib import Path

# Force UTF-8 stdout encoding on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Add backend directory to path if running directly
backend_root = Path(__file__).resolve().parent.parent.parent
if str(backend_root) not in sys.path:
    sys.path.insert(0, str(backend_root))

from app.ingestion.agmarknet_adapter import AgmarknetMandiAdapter


def run_day2_pipeline():
    project_root = backend_root.parent
    raw_path = project_root / "data" / "raw" / "karnataka_mandi_prices_2026.csv"
    processed_path = project_root / "data" / "processed" / "canonical_mandi_prices.csv"
    report_path = project_root / "data" / "processed" / "data_quality_report.json"

    print("=" * 70)
    print("AgriPulse AI -- Day 2 Official Mandi Ingestion & Quality Audit")
    print("=" * 70)
    print(f"[*] Raw Source Input:      {raw_path}")
    print(f"[*] Processed Output:      {processed_path}")
    print(f"[*] Quality Report Output: {report_path}")

    adapter = AgmarknetMandiAdapter()
    df_audited, report = adapter.process_file(
        raw_csv_path=str(raw_path),
        processed_csv_path=str(processed_path),
        report_json_path=str(report_path)
    )

    print("\n" + "=" * 70)
    print("EXPLORATORY DATA ANALYSIS (EDA) & QUALITY AUDIT SUMMARY")
    print("=" * 70)
    print(f"  Total Raw Rows Read:       {report.total_raw_rows}")
    print(f"  Canonical Rows Emitted:    {report.canonical_rows_emitted}")
    print(f"  Exact Duplicate Rows:      {report.exact_duplicates_count} ({report.exact_duplicates_percent}%)")
    print(f"  Logical Duplicates (Keys): {report.logical_duplicates_count}")
    print(f"  Inverted Price Ranges:     {report.inverted_price_ranges_count}")
    print(f"  Modal Price Out of Bounds: {report.modal_out_of_bounds_count}")
    print(f"  Flagged Outliers (1.5x IQR): {report.flagged_outliers_count}")
    print(f"  Date Range:                {report.date_coverage_start} to {report.date_coverage_end}")
    print(f"  Calendar Days Spanned:     {report.total_calendar_days} days (Unobserved days: {report.missing_calendar_dates_count})")

    print("\nCOMMODITY BREAKDOWN & MODAL PRICE DISTRIBUTION (Rs/Quintal):")
    print("-" * 70)
    stats = df_audited.groupby("commodity")["modal_price"].agg(["count", "min", "max", "mean", "median", "std"]).round(2)
    print(stats.to_string())

    print("\nAPMC MARKETS COVERED:")
    print("-" * 70)
    market_counts = df_audited.groupby(["district", "market"])["commodity"].nunique().reset_index()
    market_counts.columns = ["District", "Market", "Distinct Commodities"]
    print(market_counts.to_string(index=False))

    print("\nAUDIT FINDINGS LOGGED:")
    print("-" * 70)
    for finding in report.audit_findings:
        print(f"  [!] {finding}")

    print("\nCLEANING & PRESERVATION ACTIONS TAKEN:")
    print("-" * 70)
    for action in report.cleaning_actions_taken:
        print(f"  [OK] {action}")

    print("\n" + "=" * 70)
    print("Day 2 Ingestion Pipeline & Quality Audit Completed Successfully!")
    print("=" * 70)


if __name__ == "__main__":
    run_day2_pipeline()
