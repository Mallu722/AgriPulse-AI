"""
AgriPulse AI — National Open Government Data (data.gov.in) Mandi Collector Script.

Fetches official, verified daily market prices and variety-wise prices for Karnataka
from Open Government Data (OGD) Platform India:
1. Daily Mandi Prices (Resource ID: 9ef84268-d588-465a-a308-a864a43d0070)
2. Variety-wise Daily Market Prices (Resource ID: 35985678-0d79-46b4-9ed6-6f13308a1d24)

Usage:
  python backend/scripts/download_karnataka_ogd.py --api-key YOUR_DATA_GOV_IN_KEY
  python backend/scripts/download_karnataka_ogd.py --file downloaded_karnataka_ogd.csv
"""

import sys
import os
import argparse
import json
from pathlib import Path

# Add backend to sys.path
SCRIPT_DIR = Path(__file__).resolve().parent
BACKEND_DIR = SCRIPT_DIR.parent
sys.path.insert(0, str(BACKEND_DIR))

from app.ingestion.agmarknet_adapter import AgmarknetMandiAdapter
from app.ingestion.quality_auditor import DataQualityAuditor

PROJECT_ROOT = BACKEND_DIR.parent
RAW_DIR = PROJECT_ROOT / "data" / "raw"
PROCESSED_DIR = PROJECT_ROOT / "data" / "processed"


def main():
    parser = argparse.ArgumentParser(description="Collect authentic Karnataka Mandi data from data.gov.in")
    parser.add_argument("--api-key", help="Registered free API Key from data.gov.in (or set DATA_GOV_IN_API_KEY env var)")
    parser.add_argument("--resource-id", default=AgmarknetMandiAdapter.OGD_RESOURCE_DAILY_PRICES,
                        help="Data.gov.in Resource ID (default: 9ef84268-d588-465a-a308-a864a43d0070)")
    parser.add_argument("--include-variety", action="store_true", default=True,
                        help="Also fetch variety-wise dataset (Resource: 35985678-0d79-46b4-9ed6-6f13308a1d24)")
    parser.add_argument("--file", help="Path to locally downloaded data.gov.in CSV or JSON export")
    parser.add_argument("--state", default="Karnataka", help="Target state filter (default: Karnataka)")
    parser.add_argument("--max-records", type=int, default=5000, help="Maximum records to retrieve")
    args = parser.parse_args()

    api_key = args.api_key or os.environ.get("DATA_GOV_IN_API_KEY")
    adapter = AgmarknetMandiAdapter()

    RAW_DIR.mkdir(parents=True, exist_ok=True)
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    if args.file:
        file_path = Path(args.file)
        if not file_path.exists():
            print(f"[ERROR] File not found: {file_path}")
            sys.exit(1)
        print(f"[INFO] Ingesting local OGD export file: {file_path}")
        df_raw = adapter.parse_to_dataframe(file_path)
    elif api_key:
        print(f"[INFO] Connecting to data.gov.in OGD API...")
        print(f"[INFO] Querying state='{args.state}', primary resource='{args.resource_id}'")
        df_raw = adapter.fetch_national_ogd_api(
            api_key=api_key,
            resource_id=args.resource_id,
            state=args.state,
            max_records=args.max_records
        )

        if args.include_variety:
            print(f"[INFO] Querying variety-wise resource: '{AgmarknetMandiAdapter.OGD_RESOURCE_VARIETY_WISE}'")
            try:
                df_var = adapter.fetch_national_ogd_api(
                    api_key=api_key,
                    resource_id=AgmarknetMandiAdapter.OGD_RESOURCE_VARIETY_WISE,
                    state=args.state,
                    max_records=args.max_records
                )
                if not df_var.empty:
                    import pandas as pd
                    df_raw = pd.concat([df_raw, df_var], ignore_index=True)
            except Exception as e:
                print(f"[WARN] Variety-wise fetch skipped: {e}")
    else:
        print("\n" + "="*70)
        print("  DATA.GOV.IN KARNATAKA AGMARKNET COLLECTOR")
        print("="*70)
        print("\n[!] No API Key or File provided.")
        print("\nTo get live data directly from the Government of India portal:")
        print("1. Register for free at: https://www.data.gov.in")
        print("2. Copy your API Key from your profile dashboard.")
        print("3. Run this script:")
        print("     python backend/scripts/download_karnataka_ogd.py --api-key YOUR_KEY")
        print("\nOR, if you searched and exported CSV on data.gov.in:")
        print("     python backend/scripts/download_karnataka_ogd.py --file /path/to/downloaded.csv")
        print("="*70 + "\n")
        sys.exit(0)

    if df_raw.empty:
        print("[WARN] No records returned for Karnataka from the specified source.")
        sys.exit(1)

    # Save raw records to data/raw/
    raw_output_path = RAW_DIR / "karnataka_mandi_prices_ogd_live.csv"
    df_raw.to_csv(raw_output_path, index=False)
    print(f"[SUCCESS] Saved {len(df_raw)} raw records to: {raw_output_path}")

    # Run through quality audit and canonical transformation
    processed_csv_path = PROCESSED_DIR / "canonical_mandi_prices.csv"
    report_json_path = PROCESSED_DIR / "data_quality_report.json"

    df_clean, report = adapter.process_file(
        raw_csv_path=str(raw_output_path),
        processed_csv_path=str(processed_csv_path),
        report_json_path=str(report_json_path)
    )

    print("\n" + "="*70)
    print("  INGESTION & AUDIT SUMMARY")
    print("="*70)
    print(f"Total Raw Rows Ingested       : {report.total_raw_rows}")
    print(f"Canonical Clean Rows Emitted  : {report.canonical_rows_emitted}")
    print(f"Exact Duplicates Filtered     : {report.exact_duplicates_count}")
    print(f"Inverted Price Ranges Fixed   : {report.inverted_price_ranges_count}")
    print(f"Flagged Outliers Audited      : {report.flagged_outliers_count}")
    print(f"Date Coverage                 : {report.date_coverage_start} to {report.date_coverage_end}")
    print(f"Processed Canonical Dataset   : {processed_csv_path}")
    print("="*70)


if __name__ == "__main__":
    main()
