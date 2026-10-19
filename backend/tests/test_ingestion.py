"""
AgriPulse AI — Day 2 Ingestion & Quality Audit Tests.

Verifies:
1. Canonical schema mapping and raw row hash calculation
2. Exact & logical duplicate detection
3. Non-destructive outlier flagging
4. Ingestion API endpoints (/summary and /quality-report)
"""

import pytest
import pandas as pd
from starlette.testclient import TestClient

from app.main import app
from app.ingestion.agmarknet_adapter import AgmarknetMandiAdapter
from app.ingestion.quality_auditor import DataQualityAuditor


@pytest.fixture
def client():
    return TestClient(app)


def test_agmarknet_clean_and_normalize():
    adapter = AgmarknetMandiAdapter()
    sample_raw = pd.DataFrame([
        {
            "State": "Karnataka ",
            "District": "Bangalore",
            "Market": "Binny Mill (F&V)",
            "Commodity": " Tomato ",
            "Variety": "Hybrid",
            "Arrival_Date": "01/10/2026",
            "Min_Price": "1,600",
            "Max_Price": "2,200",
            "Modal_Price": "1,900",
            "Arrivals_Tonnes": "45.5",
            "Unit": "Rs/Quintal"
        }
    ])

    df_clean = adapter.clean_and_normalize(sample_raw)
    assert len(df_clean) == 1
    row = df_clean.iloc[0]
    assert row["state"] == "Karnataka"
    assert row["commodity"] == "Tomato"
    assert row["observation_date"] == "2026-10-01"
    assert row["min_price"] == 1600.0
    assert row["max_price"] == 2200.0
    assert row["modal_price"] == 1900.0
    assert len(row["raw_row_hash"]) == 64  # Valid SHA-256 length


def test_quality_auditor_detects_duplicates():
    auditor = DataQualityAuditor("test_dataset", "memory://")
    df_raw = pd.DataFrame([
        {"State": "Karnataka", "Market": "Kolar", "Commodity": "Tomato", "Arrival_Date": "01/10/2026"},
        {"State": "Karnataka", "Market": "Kolar", "Commodity": "Tomato", "Arrival_Date": "01/10/2026"}
    ])
    df_clean = pd.DataFrame([
        {"observation_date": "2026-10-01", "market": "Kolar", "commodity": "Tomato", "variety": "Local", "min_price": 100, "max_price": 200, "modal_price": 150},
        {"observation_date": "2026-10-01", "market": "Kolar", "commodity": "Tomato", "variety": "Local", "min_price": 100, "max_price": 200, "modal_price": 150}
    ])

    _, report = auditor.audit_dataset(df_raw, df_clean)
    assert report.exact_duplicates_count == 1
    assert report.logical_duplicates_count == 1


def test_quality_auditor_flags_inverted_prices():
    auditor = DataQualityAuditor("test_dataset", "memory://")
    df_raw = pd.DataFrame([{"col": 1}])
    df_clean = pd.DataFrame([
        {
            "observation_date": "2026-10-01",
            "market": "Kolar",
            "commodity": "Tomato",
            "variety": "Local",
            "min_price": 2500.0,
            "max_price": 1800.0,  # INVERTED!
            "modal_price": 2000.0
        }
    ])

    df_audited, report = auditor.audit_dataset(df_raw, df_clean)
    assert report.inverted_price_ranges_count == 1
    # Record must NOT be deleted!
    assert len(df_audited) == 1
    assert "INVERTED_PRICE_RANGE" in df_audited.iloc[0]["quality_flags"]


def test_api_get_quality_report(client):
    response = client.get("/api/v1/ingestion/quality-report")
    assert response.status_code == 200
    data = response.json()
    assert "dataset_name" in data
    assert data["total_raw_rows"] > 0
    assert "numeric_columns" in data


def test_api_get_mandi_summary(client):
    response = client.get("/api/v1/ingestion/mandi/summary")
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] > 0
    assert "commodities" in data
    assert "Tomato" in data["commodities"]
