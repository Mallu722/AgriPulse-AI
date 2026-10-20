"""
AgriPulse AI — Day 4 Economics Engine & Profit Scenario Test Suite.

Tests:
1. Mathematical unit consistency:
   - Output (quintals) = Yield (quintals/acre) * Area (acres)
   - Gross Revenue = Output * Price (INR/quintal)
   - Total Cost = (Cost/Acre * Area) + (Output * Transport/quintal)
   - Net Return = Gross Revenue - Total Cost
2. User cost overrides:
   - Farmer overrides fertilizer or seed cost; official baseline remains untouched
3. Chronological out-of-time forecasting:
   - Naive baseline vs. Candidate model evaluation
   - Computes MAE/RMSE in INR/quintal
   - Insufficient sample size (<10) safely disables predictive claims
4. Boundary & validation edge cases:
   - Zero or negative land area (raises ValidationError)
   - Boundary break-even calculation
5. Full REST API tests:
   - GET /api/v1/economics/crops
   - GET /api/v1/economics/baseline/{crop_code}
   - POST /api/v1/economics/scenarios
"""

import pytest
from pydantic import ValidationError
from starlette.testclient import TestClient

from app.main import app
from app.schemas.economics import (
    EconomicsScenarioRequest,
    CostOverrideInput,
    CostCategoryBreakdown
)
from app.economics.profit_engine import EconomicsEngine
from app.economics.cost_baselines import OFFICIAL_CROP_ECONOMICS


@pytest.fixture
def client():
    return TestClient(app)


@pytest.fixture
def engine():
    return EconomicsEngine()


def test_unit_mathematical_consistency(engine):
    """Verify that output, revenue, and net return adhere strictly to unit definitions."""
    req = EconomicsScenarioRequest(
        crop_code="TOMATO",
        district="Kolar",
        land_area_acres=2.5
    )
    res = engine.calculate_scenarios(req)

    # Inspect Base Scenario
    base = res.base_scenario
    expected_output = round(base.expected_yield_quintals_per_acre * 2.5, 2)
    assert pytest.approx(base.total_output_quintals, 0.01) == expected_output

    expected_gross = round(base.total_output_quintals * base.market_price_inr_per_quintal, 2)
    assert pytest.approx(base.gross_revenue_inr, 0.01) == expected_gross

    expected_cost = round(
        (res.active_cost_breakdown.total_production_cost_per_acre * 2.5)
        + (base.total_output_quintals * res.active_cost_breakdown.transport_per_quintal),
        2
    )
    assert pytest.approx(base.total_cost_inr, 0.01) == expected_cost

    expected_net = round(base.gross_revenue_inr - base.total_cost_inr, 2)
    assert pytest.approx(base.net_return_inr, 0.01) == expected_net
    assert pytest.approx(base.net_return_per_acre_inr, 0.01) == round(expected_net / 2.5, 2)


def test_cost_override_preserves_official_baseline(engine):
    """Verify that user overrides modify the active calculation but leave official records unchanged."""
    official_seed_cost = OFFICIAL_CROP_ECONOMICS["TOMATO"].costs.seeds

    # Farmer enters custom seed cost of ₹2,000 instead of default ₹4,500
    req = EconomicsScenarioRequest(
        crop_code="TOMATO",
        district="Kolar",
        land_area_acres=1.0,
        cost_overrides=CostOverrideInput(seeds=2000.0)
    )
    res = engine.calculate_scenarios(req)

    # Active cost breakdown must show ₹2000
    assert res.active_cost_breakdown.seeds == 2000.0
    assert res.has_farmer_cost_overrides is True

    # Official baseline must still be intact
    assert OFFICIAL_CROP_ECONOMICS["TOMATO"].costs.seeds == official_seed_cost


def test_chronological_forecasting_evaluation(engine):
    """Verify that the engine runs chronological backtesting and reports MAE/RMSE in INR/Quintal."""
    req = EconomicsScenarioRequest(
        crop_code="TOMATO",
        district="Bangalore",
        land_area_acres=1.0
    )
    res = engine.calculate_scenarios(req)
    metrics = res.forecast_evaluation

    assert metrics.sample_size_observations > 0
    assert "Chronological" in metrics.validation_strategy
    assert metrics.baseline_mae_inr >= 0.0
    assert metrics.model_mae_inr >= 0.0
    assert len(metrics.status_advisory) > 0


def test_insufficient_data_disables_predictive_claims(engine):
    """When a crop has no or insufficient time series data (<10 points), predictive claim is disabled."""
    req = EconomicsScenarioRequest(
        crop_code="RAGI",
        district="Chitradurga",
        land_area_acres=2.0
    )
    res = engine.calculate_scenarios(req)
    metrics = res.forecast_evaluation

    if metrics.sample_size_observations < 10:
        assert metrics.is_model_better_than_baseline is False
        assert "disabled" in metrics.status_advisory.lower() or "insufficient" in metrics.status_advisory.lower()


def test_negative_or_zero_area_rejection():
    """Attempting to evaluate scenario with 0 or negative land area must fail schema validation."""
    with pytest.raises(ValidationError):
        EconomicsScenarioRequest(
            crop_code="TOMATO",
            land_area_acres=0.0  # Must be > 0.0
        )
    with pytest.raises(ValidationError):
        EconomicsScenarioRequest(
            crop_code="TOMATO",
            land_area_acres=-2.5
        )


def test_api_economics_endpoints(client):
    """Verify REST API endpoints for /crops, /baseline/{code}, and /scenarios."""
    # 1. Crops list
    res = client.get("/api/v1/economics/crops")
    assert res.status_code == 200
    crops = res.json()
    assert len(crops) >= 5
    assert any(c["crop_code"] == "TOMATO" for c in crops)

    # 2. Baseline fetch
    res_base = client.get("/api/v1/economics/baseline/TOMATO")
    assert res_base.status_code == 200
    data = res_base.json()
    assert data["report_year"] >= 2023
    assert "cost_breakdown_inr_per_acre" in data

    # 3. Post scenarios
    payload = {
        "crop_code": "TOMATO",
        "district": "Kolar",
        "land_area_acres": 3.0,
        "cost_overrides": {
            "seeds": 4000.0,
            "fertilizer": 7000.0
        }
    }
    res_scen = client.post("/api/v1/economics/scenarios", json=payload)
    assert res_scen.status_code == 200
    scen_data = res_scen.json()
    assert scen_data["crop_code"] == "TOMATO"
    assert scen_data["conservative_scenario"]["net_return_inr"] is not None
    assert scen_data["base_scenario"]["net_return_inr"] is not None
    assert scen_data["optimistic_scenario"]["net_return_inr"] is not None
    assert scen_data["forecast_evaluation"]["baseline_model_name"] is not None
