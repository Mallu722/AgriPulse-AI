"""
AgriPulse AI — Comprehensive Economics & Profit Scenario Schemas.

Defines:
- Input cost breakdowns with official government reference years & source citations
- Farmer custom cost overrides (preserving official baseline data untouched)
- Transparent unit definitions:
    Area: Acres
    Yield: Quintals / Acre
    Output: Quintals (Yield * Area)
    Prices: INR / Quintal
    Gross Revenue: INR (Output Quintals * Modal Price INR/Quintal)
    Total Cost: INR (Cost/Acre * Area + Transport/Quintal * Output Quintals)
    Estimated Net Return: INR (Gross Revenue - Total Costs)
- Quantile-derived Scenarios: Conservative (P25), Base (Median/P50), Optimistic (P75)
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, field_validator


class CostOfCultivationBaseline(BaseModel):
    """
    Official baseline cost of cultivation estimates per hectare/acre.
    Source: DESAgri Cost of Cultivation Reports
    """
    crop: str = Field(..., description="Crop name")
    state: str = Field(default="Karnataka", description="State")
    report_year: int = Field(..., description="Reference report year")
    
    # Cost Breakdown (₹ / Acre)
    seed_cost_per_acre: float = Field(..., ge=0, description="Seed/sapling expense")
    fertilizer_nutrient_cost_per_acre: float = Field(..., ge=0, description="Fertilizers & manure")
    labor_cost_per_acre: float = Field(..., ge=0, description="Human & animal labor expenses")
    irrigation_power_cost_per_acre: float = Field(..., ge=0, description="Irrigation & electricity")
    machinery_fuel_cost_per_acre: float = Field(..., ge=0, description="Tractor, equipment hire & fuel")
    plant_protection_cost_per_acre: float = Field(..., ge=0, description="Biopesticides/pesticides")
    harvesting_postharvest_per_acre: float = Field(..., ge=0, description="Harvesting, grading & bagging")
    transport_to_mandi_per_quintal: float = Field(..., ge=0, description="Transport cost per quintal to local APMC")
    
    total_cost_per_acre: float = Field(..., ge=0, description="Total operational cultivation cost per acre")
    typical_yield_quintals_per_acre: float = Field(..., ge=0, description="Typical yield expected per acre")
    source_citation: str = Field(..., description="DESAgri or UAS Bengaluru citation reference")


class CostCategoryBreakdown(BaseModel):
    """
    Cost categories for crop cultivation (₹ per acre basis).
    Official baselines from DESAgri & UAS Bengaluru / UAS Dharwad.
    """
    seeds: float = Field(..., ge=0.0, description="Seeds / saplings cost (INR/acre)")
    fertilizer: float = Field(..., ge=0.0, description="Fertilizers, manure & micronutrients (INR/acre)")
    labour: float = Field(..., ge=0.0, description="Human & animal operational labour (INR/acre)")
    plant_protection: float = Field(..., ge=0.0, description="Pesticides, fungicides & biologicals (INR/acre)")
    irrigation_power: float = Field(..., ge=0.0, description="Irrigation electricity / diesel / water charges (INR/acre)")
    machinery_fuel: float = Field(..., ge=0.0, description="Tractor, equipment hire & fuel (INR/acre)")
    harvesting: float = Field(..., ge=0.0, description="Harvesting, grading & bagging (INR/acre)")
    transport_per_quintal: float = Field(..., ge=0.0, description="Freight to nearest APMC mandi (INR/quintal)")
    market_charges: float = Field(default=0.0, ge=0.0, description="APMC cess / loading / unbagging fees (INR/acre)")
    miscellaneous: float = Field(default=0.0, ge=0.0, description="Other operational expenses (INR/acre)")

    @property
    def total_production_cost_per_acre(self) -> float:
        """Total direct production cost per acre excluding transport."""
        return round(
            self.seeds
            + self.fertilizer
            + self.labour
            + self.plant_protection
            + self.irrigation_power
            + self.machinery_fuel
            + self.harvesting
            + self.market_charges
            + self.miscellaneous,
            2
        )


class CostOverrideInput(BaseModel):
    """Optional user-supplied overrides for specific cost categories without modifying official data."""
    seeds: Optional[float] = Field(None, ge=0.0)
    fertilizer: Optional[float] = Field(None, ge=0.0)
    labour: Optional[float] = Field(None, ge=0.0)
    plant_protection: Optional[float] = Field(None, ge=0.0)
    irrigation_power: Optional[float] = Field(None, ge=0.0)
    machinery_fuel: Optional[float] = Field(None, ge=0.0)
    harvesting: Optional[float] = Field(None, ge=0.0)
    transport_per_quintal: Optional[float] = Field(None, ge=0.0)
    market_charges: Optional[float] = Field(None, ge=0.0)
    miscellaneous: Optional[float] = Field(None, ge=0.0)


class ScenarioDetail(BaseModel):
    """Detailed financial output for a single economic scenario (Conservative / Base / Optimistic)."""
    scenario_name: str = Field(..., description="Conservative (P25), Base (Median/P50), or Optimistic (P75)")
    probability_or_quantile: str = Field(..., description="Statistical basis: P25, P50, or P75")
    
    # Agronomic & Yield units
    expected_yield_quintals_per_acre: float = Field(..., gt=0.0, description="Yield in Quintals / Acre")
    cultivated_area_acres: float = Field(..., gt=0.0, description="Cultivated land in standard Acres")
    total_output_quintals: float = Field(..., gt=0.0, description="Total produce = Yield * Area")
    
    # Pricing & Revenue units
    market_price_inr_per_quintal: float = Field(..., gt=0.0, description="Spot/Forecast Price in INR / Quintal")
    gross_revenue_inr: float = Field(..., ge=0.0, description="Total output * Price")
    
    # Costs & Profit
    total_cultivation_cost_inr: float = Field(..., ge=0.0, description="Total cost incurred across all acres")
    total_transport_cost_inr: float = Field(..., ge=0.0, description="Total APMC transport cost")
    total_cost_inr: float = Field(..., ge=0.0, description="Sum of cultivation + transport costs")
    net_return_inr: float = Field(..., description="Gross Revenue - Total Costs (can be negative)")
    net_return_per_acre_inr: float = Field(..., description="Net return divided by cultivated area")
    
    # Ratios
    benefit_cost_ratio: float = Field(..., description="Gross Revenue / Total Cost (BCR)")
    break_even_price_inr_per_quintal: float = Field(..., description="Minimum price to avoid net loss")
    break_even_yield_quintals_per_acre: float = Field(..., description="Minimum yield to avoid net loss")
    
    # Assumptions text
    assumptions_narrative: str = Field(..., description="Transparent narrative explaining assumptions")


class EconomicsScenarioRequest(BaseModel):
    """Request payload for evaluating profit scenarios."""
    crop_code: str = Field(..., description="Crop code: TOMATO, MAIZE, ONION, RAGI, TUR")
    district: str = Field(default="Kolar", description="District for local APMC price and APY yield baseline")
    land_area_acres: float = Field(..., gt=0.0, le=500.0, description="Land area in acres (normalized)")
    cost_overrides: Optional[CostOverrideInput] = Field(default=None, description="Optional farmer cost overrides")
    target_market: Optional[str] = Field(None, description="Optional APMC market name")

    @field_validator("crop_code")
    @classmethod
    def clean_code(cls, v: str) -> str:
        return v.strip().upper()


class ForecastEvaluationMetrics(BaseModel):
    """Chronological model backtesting evaluation vs seasonal naive baseline."""
    baseline_model_name: str = Field(default="Seasonal/Historical Naive (Last-Observed)")
    evaluated_model_name: str = Field(default="Lagged Ridge Regression / Moving Average")
    validation_strategy: str = Field(default="Chronological Out-of-Time Backtest (No Shuffle)")
    sample_size_observations: int
    test_horizon_days: int
    train_date_range: str
    test_date_range: str
    
    # Performance Metrics (in INR / Quintal)
    baseline_mae_inr: float
    baseline_rmse_inr: float
    model_mae_inr: float
    model_rmse_inr: float
    is_model_better_than_baseline: bool
    status_advisory: str = Field(..., description="Advisory on whether forecast model is trusted")


class EconomicsScenarioResponse(BaseModel):
    """Complete machine-readable response for Day 4 Economics & Scenarios."""
    crop_code: str
    crop_name: str
    district: str
    land_area_acres: float
    
    # Official Baseline & Metadata
    official_cost_source_year: int
    official_cost_source_citation: str
    active_cost_breakdown: CostCategoryBreakdown
    has_farmer_cost_overrides: bool
    
    # Scenarios
    conservative_scenario: ScenarioDetail
    base_scenario: ScenarioDetail
    optimistic_scenario: ScenarioDetail
    
    # Forecasting & Backtest Transparency
    forecast_evaluation: ForecastEvaluationMetrics
    
    # Mathematical Audit Trail
    unit_consistency_audit: str = (
        "Units Verified: Total Output (Qtl) = Yield (Qtl/Acre) × Area (Acres). "
        "Gross Revenue (₹) = Total Output (Qtl) × Price (₹/Qtl). "
        "Net Return (₹) = Gross Revenue − (Production Costs + Transport Costs)."
    )
