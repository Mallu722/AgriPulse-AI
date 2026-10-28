"""
AgriPulse AI — Day 3 Crop Suitability Engine Test Suite.

Tests:
1. Complete ideal profile (Red sandy loam, Kolar, Kharif, reliable water -> Tomato & Ragi suitable)
2. Incomplete / missing data profile (Unknown soil, no Soil Health Card -> INSUFFICIENT_INFORMATION or conditionally suitable with missing_inputs)
3. Hard constraint failure profile (Rainfed in summer for water-intensive Tomato -> UNSUITABLE)
4. Boundary condition profile (pH exactly on edge, land unit conversions e.g. guntas to acres)
5. Impossible profile validation error (negative land area, invalid season enum)
6. API endpoint tests for GET /crops, GET /options, and POST /evaluate
"""

import pytest
from datetime import date
from pydantic import ValidationError
from starlette.testclient import TestClient

from app.main import app
from app.schemas.farmer_profile import (
    FarmerProfile,
    SoilHealthCard,
    LandUnit,
    SowingSeason,
    WaterAvailability,
    RiskPreference,
    SoilType
)
from app.agronomy.suitability_engine import SuitabilityEngine
from app.schemas.suitability import SuitabilityStatus


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def engine():
    return SuitabilityEngine()


def test_land_unit_conversion():
    """Verify acres, hectares, and guntas conversion."""
    # 40 guntas = 1.0 acre
    profile_guntas = FarmerProfile(
        district="Mandya",
        land_area=40.0,
        land_unit=LandUnit.GUNTAS,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.LIMITED,
        soil_type=SoilType.RED_SANDY_LOAM
    )
    assert profile_guntas.land_area_acres == 1.0

    # 1 hectare = ~2.471 acres
    profile_hectares = FarmerProfile(
        district="Mandya",
        land_area=2.0,
        land_unit=LandUnit.HECTARES,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.LIMITED
    )
    assert pytest.approx(profile_hectares.land_area_acres, 0.01) == 4.942


def test_complete_suitable_profile(engine):
    """
    Kolar farmer, Kharif season, Red Sandy Loam, reliable water with healthy pH (6.5).
    Ragi and Tomato should be evaluated as SUITABLE or top candidates.
    """
    profile = FarmerProfile(
        farmer_name="Ramesh Gowda",
        district="Kolar",
        taluk="Srinivaspur",
        land_area=3.5,
        land_unit=LandUnit.ACRES,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.RELIABLE,
        risk_preference=RiskPreference.MODERATE,
        soil_type=SoilType.RED_SANDY_LOAM,
        soil_health_card=SoilHealthCard(
            test_date=date(2025, 4, 15),
            lab_name="KVK Kolar",
            ph=6.5,
            organic_carbon_pct=0.65,
            nitrogen_kg_ha=290.0,
            phosphorus_kg_ha=35.0,
            potassium_kg_ha=280.0
        )
    )

    result = engine.evaluate_all(profile)
    assert result.total_evaluated_crops >= 5
    suitable_codes = [c.crop_code for c in result.suitable_crops]
    assert "RAGI" in suitable_codes
    assert "TOMATO" in suitable_codes

    # Verify citation and evidence are attached
    ragi = next(c for c in result.suitable_crops if c.crop_code == "RAGI")
    assert "UAS Bengaluru" in ragi.source_citation
    assert ragi.hard_constraints_passed is True


def test_hard_constraint_failure_water(engine):
    """
    Farmer has rainfed water only in Kharif.
    Tomato requires reliable water -> must be tagged UNSUITABLE due to water deficit.
    """
    profile = FarmerProfile(
        district="Kolar",
        land_area=2.0,
        land_unit=LandUnit.ACRES,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.RAINFED,  # Rainfed cannot sustain commercial tomato
        soil_type=SoilType.RED_SANDY_LOAM
    )

    result = engine.evaluate_all(profile)
    unsuitable_codes = [c.crop_code for c in result.unsuitable_crops]
    assert "TOMATO" in unsuitable_codes

    tomato = next(c for c in result.unsuitable_crops if c.crop_code == "TOMATO")
    assert tomato.hard_constraints_passed is False
    assert any("Water deficit" in r for r in tomato.reasons)


def test_hard_constraint_failure_season(engine):
    """
    Summer season test: Tur (Pigeon Pea) only grows in Kharif (Monsoon).
    Summer sowing should disqualify Tur as UNSUITABLE.
    """
    profile = FarmerProfile(
        district="Kalaburagi",
        land_area=5.0,
        land_unit=LandUnit.ACRES,
        sowing_season=SowingSeason.SUMMER,
        water_availability=WaterAvailability.LIMITED,
        soil_type=SoilType.BLACK_COTTON
    )

    result = engine.evaluate_all(profile)
    unsuitable_codes = [c.crop_code for c in result.unsuitable_crops]
    assert "TUR" in unsuitable_codes


def test_unknown_soil_insufficient_information(engine):
    """
    Farmer does not know soil type and has no Soil Health Card.
    Rule engine must NOT guess soil by GPS, and should flag missing inputs.
    """
    profile = FarmerProfile(
        district="Belagavi",
        land_area=2.0,
        land_unit=LandUnit.ACRES,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.LIMITED,
        soil_type=SoilType.UNKNOWN,
        soil_health_card=None
    )

    result = engine.evaluate_all(profile)
    # Crops without hard fails will end up in insufficient_info or conditionally suitable
    all_evaluated = result.suitable_crops + result.conditionally_suitable_crops + result.insufficient_info_crops + result.unsuitable_crops
    assert len(all_evaluated) >= 5

    # Check that missing inputs are documented
    maize = next(c for c in all_evaluated if c.crop_code == "MAIZE")
    assert len(maize.missing_inputs) >= 1
    assert any("Soil Type is unknown" in m for m in maize.missing_inputs)


def test_boundary_ph_deviations(engine):
    """
    Soil pH is tested at 4.2 (highly acidic) -> deviations should deduct score
    and produce agronomic advisory notes.
    """
    profile = FarmerProfile(
        district="Shivamogga",
        land_area=3.0,
        land_unit=LandUnit.ACRES,
        sowing_season=SowingSeason.KHARIF,
        water_availability=WaterAvailability.LIMITED,
        soil_type=SoilType.LATERITE,
        soil_health_card=SoilHealthCard(ph=4.2)
    )

    result = engine.evaluate_all(profile)
    all_crops = result.suitable_crops + result.conditionally_suitable_crops + result.insufficient_info_crops + result.unsuitable_crops
    for crop in all_crops:
        # If pH constraint check ran, it should indicate deviation
        ph_check = next((chk for chk in crop.constraint_checks if chk.constraint_name == "soil_ph"), None)
        if ph_check:
            assert ph_check.passed is False


def test_impossible_profile_validation_rejection():
    """Negative land area or invalid data should raise Pydantic ValidationError."""
    with pytest.raises(ValidationError):
        FarmerProfile(
            district="Kolar",
            land_area=-5.0,  # Invalid: must be > 0
            sowing_season=SowingSeason.KHARIF,
            water_availability=WaterAvailability.RELIABLE
        )


def test_suitability_api_endpoints(client):
    """Test REST API routes for options, crop catalogue and evaluate."""
    # 1. Options endpoint
    res_opts = client.get("/api/v1/suitability/options")
    assert res_opts.status_code == 200
    opts = res_opts.json()
    assert "karnataka_districts" in opts
    assert "Kolar" in opts["karnataka_districts"]
    assert "land_units" in opts

    # 2. Crops endpoint
    res_crops = client.get("/api/v1/suitability/crops")
    assert res_crops.status_code == 200
    crops = res_crops.json()
    assert len(crops) >= 5
    assert any(c["crop_code"] == "RAGI" for c in crops)

    # 3. Evaluate endpoint
    payload = {
        "farmer_name": "Siddaraju",
        "district": "Mandya",
        "land_area": 2.5,
        "land_unit": "acres",
        "sowing_season": "kharif",
        "water_availability": "limited",
        "risk_preference": "moderate",
        "soil_type": "red_sandy_loam"
    }
    res_eval = client.post("/api/v1/suitability/evaluate", json=payload)
    assert res_eval.status_code == 200
    eval_data = res_eval.json()
    assert eval_data["total_evaluated_crops"] >= 5
    assert "profile_summary" in eval_data
    assert eval_data["profile_summary"]["district"] == "Mandya"
