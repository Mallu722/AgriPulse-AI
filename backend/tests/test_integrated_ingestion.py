"""
AgriPulse AI — Multi-Dataset Integrated Ingestion & Alignment Tests.

Verifies:
1. APY historical yield schema validation and parsing
2. Cost of Cultivation baseline schema conformance
3. Cross-dataset alignment by (Crop, District, Season)
4. Integrated profile API endpoints (/integrated-profile and /crops/{crop_name})
"""

import pytest
import pandas as pd
from starlette.testclient import TestClient

from app.main import app
from app.schemas.crop_production import CropProductionRecord
from app.schemas.economics import CostOfCultivationBaseline
from app.ingestion.apy_yield_adapter import APYYieldAdapter
from app.ingestion.integrated_pipeline import run_integrated_pipeline


@pytest.fixture
def client():
    return TestClient(app)


def test_apy_yield_adapter_normalization():
    adapter = APYYieldAdapter()
    sample_df = pd.DataFrame([
        {
            "State": "Karnataka",
            "District": "Kolar",
            "Crop": "Tomato",
            "Crop_Year": 2024,
            "Season": "Kharif",
            "Area_Hectares": 13000.0,
            "Production_Tonnes": 338000.0,
            "Yield_Kg_Per_Hectare": 26000.0
        }
    ])

    df_clean = adapter.clean_and_normalize(sample_df)
    assert len(df_clean) == 1
    row = df_clean.iloc[0]
    assert row["district"] == "Kolar"
    assert row["crop"] == "Tomato"
    assert row["yield_kg_per_hectare"] == 26000.0
    assert len(row["raw_row_hash"]) == 64


def test_cost_of_cultivation_schema():
    baseline = CostOfCultivationBaseline(
        crop="Tomato",
        state="Karnataka",
        report_year=2024,
        seed_cost_per_acre=4500.0,
        fertilizer_nutrient_cost_per_acre=8500.0,
        labor_cost_per_acre=12000.0,
        irrigation_power_cost_per_acre=3000.0,
        machinery_fuel_cost_per_acre=5000.0,
        plant_protection_cost_per_acre=6000.0,
        harvesting_postharvest_per_acre=8000.0,
        transport_to_mandi_per_quintal=65.0,
        total_cost_per_acre=47000.0,
        typical_yield_quintals_per_acre=105.0,
        source_citation="DESAgri & UAS Bengaluru 2024"
    )
    assert baseline.total_cost_per_acre == 47000.0
    assert baseline.typical_yield_quintals_per_acre == 105.0


def test_integrated_profile_generation():
    profile = run_integrated_pipeline()
    assert "crops" in profile
    assert "Tomato" in profile["crops"]
    assert "Onion" in profile["crops"]
    assert "Potato" in profile["crops"]
    assert "Maize" in profile["crops"]
    assert "Cotton" in profile["crops"]

    tomato = profile["crops"]["Tomato"]
    assert "agronomy" in tomato
    assert "market_intelligence" in tomato
    assert "historical_yield_baseline" in tomato
    assert "economic_baseline" in tomato
    assert tomato["market_intelligence"]["modal_price_mean"] > 0
    assert tomato["historical_yield_baseline"]["state_average_yield_kg_per_hectare"] > 0


def test_api_integrated_profile_endpoint(client):
    response = client.get("/api/v1/ingestion/integrated-profile")
    assert response.status_code == 200
    data = response.json()
    assert "crops" in data
    assert "Tomato" in data["crops"]


def test_api_crop_specific_endpoint(client):
    response = client.get("/api/v1/ingestion/crops/Tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["crop"] == "Tomato"
    assert "agronomy" in data
    assert "market_intelligence" in data
    assert "economic_baseline" in data
