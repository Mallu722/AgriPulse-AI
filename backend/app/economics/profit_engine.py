"""
AgriPulse AI — Economics & Profit Scenario Calculator Engine.

Key Requirements:
1. Strict Unit Math:
   - Area: Acres
   - Yield: Quintals / Acre
   - Output: Total Quintals = Yield * Area
   - Price: INR / Quintal
   - Gross Revenue: Total Output * Price
   - Transport Cost: Output Quintals * Transport_per_quintal
   - Total Cost: (Cost_per_acre * Area) + Transport Cost
   - Net Return: Gross Revenue - Total Cost
   - Break-even price: Total Cost / Output Quintals
   - Break-even yield: Total Cost / Price / Area
2. User Cost Overrides:
   - Preserves official source data unmodified while allowing transparent farmer overrides.
3. Quantile-Based Scenarios:
   - Conservative (P25 yield, P25 price)
   - Base (Median/P50 yield, Median/P50 price)
   - Optimistic (P75 yield, P75 price)
4. Integration with Chronological Forecast Evaluator.
"""

from typing import Optional
from pathlib import Path
import pandas as pd

from app.schemas.economics import (
    CostCategoryBreakdown,
    CostOverrideInput,
    ScenarioDetail,
    EconomicsScenarioRequest,
    EconomicsScenarioResponse,
    ForecastEvaluationMetrics
)
from app.economics.cost_baselines import OFFICIAL_CROP_ECONOMICS, OfficialCropEconomicsReference
from app.forecasting.chronological_evaluator import ChronologicalForecaster


class EconomicsEngine:
    def __init__(self, data_path: Optional[Path] = None):
        self.data_path = data_path or Path(__file__).resolve().parent.parent.parent.parent / "data" / "processed" / "canonical_mandi_prices.csv"
        self._load_prices()

    def _load_prices(self):
        if self.data_path.exists():
            try:
                self.df_prices = pd.read_csv(self.data_path)
            except Exception:
                self.df_prices = pd.DataFrame()
        else:
            self.df_prices = pd.DataFrame()
        self.forecaster = ChronologicalForecaster(self.df_prices)

    def _apply_cost_overrides(
        self, baseline_costs: CostCategoryBreakdown, overrides: Optional[CostOverrideInput]
    ) -> CostCategoryBreakdown:
        if not overrides:
            return baseline_costs

        data = baseline_costs.model_dump()
        override_data = overrides.model_dump(exclude_unset=True, exclude_none=True)
        data.update(override_data)
        return CostCategoryBreakdown(**data)

    def _build_scenario(
        self,
        name: str,
        quantile_label: str,
        area: float,
        yield_per_acre: float,
        price_per_quintal: float,
        costs: CostCategoryBreakdown,
        narrative: str
    ) -> ScenarioDetail:
        # Mathematical integrity:
        total_output = round(yield_per_acre * area, 2)
        gross_revenue = round(total_output * price_per_quintal, 2)
        
        cultivation_cost = round(costs.total_production_cost_per_acre * area, 2)
        transport_cost = round(total_output * costs.transport_per_quintal, 2)
        total_cost = round(cultivation_cost + transport_cost, 2)
        
        net_return = round(gross_revenue - total_cost, 2)
        net_return_per_acre = round(net_return / area, 2)
        
        bcr = round(gross_revenue / total_cost, 2) if total_cost > 0 else 0.0
        break_even_price = round(total_cost / total_output, 2) if total_output > 0 else 0.0
        break_even_yield = round((total_cost / price_per_quintal) / area, 2) if (price_per_quintal > 0 and area > 0) else 0.0

        return ScenarioDetail(
            scenario_name=name,
            probability_or_quantile=quantile_label,
            expected_yield_quintals_per_acre=yield_per_acre,
            cultivated_area_acres=area,
            total_output_quintals=total_output,
            market_price_inr_per_quintal=price_per_quintal,
            gross_revenue_inr=gross_revenue,
            total_cultivation_cost_inr=cultivation_cost,
            total_transport_cost_inr=transport_cost,
            total_cost_inr=total_cost,
            net_return_inr=net_return,
            net_return_per_acre_inr=net_return_per_acre,
            benefit_cost_ratio=bcr,
            break_even_price_inr_per_quintal=break_even_price,
            break_even_yield_quintals_per_acre=break_even_yield,
            assumptions_narrative=narrative
        )

    def calculate_scenarios(self, req: EconomicsScenarioRequest) -> EconomicsScenarioResponse:
        crop_code = req.crop_code
        if crop_code not in OFFICIAL_CROP_ECONOMICS:
            # Fallback to Tomato if unrecognized code
            ref = OFFICIAL_CROP_ECONOMICS["TOMATO"]
        else:
            ref = OFFICIAL_CROP_ECONOMICS[crop_code]

        # Apply farmer overrides if provided
        active_costs = self._apply_cost_overrides(ref.costs, req.cost_overrides)
        has_overrides = req.cost_overrides is not None and len(req.cost_overrides.model_dump(exclude_unset=True, exclude_none=True)) > 0

        # Run chronological forecasting evaluation
        forecast_metrics, price_quantiles = self.forecaster.evaluate_and_forecast(
            commodity=ref.crop_name, district=req.district
        )

        area = req.land_area_acres

        # 1. Conservative Scenario (P25 yield, P25 price)
        conservative = self._build_scenario(
            name="Conservative (Downside Protection)",
            quantile_label="P25",
            area=area,
            yield_per_acre=ref.yield_p25,
            price_per_quintal=price_quantiles["p25"],
            costs=active_costs,
            narrative=(
                f"Assumes lower-quartile yield ({ref.yield_p25} Qtl/Acre) due to weather/pest stress "
                f"and market gluts depressing spot price to P25 (₹{price_quantiles['p25']}/Qtl)."
            )
        )

        # 2. Base Scenario (Median yield, Median price)
        base = self._build_scenario(
            name="Base Case (Median Realization)",
            quantile_label="P50 / Median",
            area=area,
            yield_per_acre=ref.yield_median,
            price_per_quintal=price_quantiles["median"],
            costs=active_costs,
            narrative=(
                f"Assumes 5-year district median yield ({ref.yield_median} Qtl/Acre) under standard package of practices "
                f"and median APMC modal realization (₹{price_quantiles['median']}/Qtl)."
            )
        )

        # 3. Optimistic Scenario (P75 yield, P75 price)
        optimistic = self._build_scenario(
            name="Optimistic (Favorable Market & Climate)",
            quantile_label="P75",
            area=area,
            yield_per_acre=ref.yield_p75,
            price_per_quintal=price_quantiles["p75"],
            costs=active_costs,
            narrative=(
                f"Assumes upper-quartile harvest ({ref.yield_p75} Qtl/Acre) with optimal irrigation/fertigation "
                f"and peak festive/lean-supply wholesale price (₹{price_quantiles['p75']}/Qtl)."
            )
        )

        return EconomicsScenarioResponse(
            crop_code=crop_code,
            crop_name=ref.crop_name,
            district=req.district,
            land_area_acres=area,
            official_cost_source_year=ref.report_year,
            official_cost_source_citation=ref.source_citation,
            active_cost_breakdown=active_costs,
            has_farmer_cost_overrides=has_overrides,
            conservative_scenario=conservative,
            base_scenario=base,
            optimistic_scenario=optimistic,
            forecast_evaluation=forecast_metrics
        )
