"""
AgriPulse AI — Transparent Crop Ranking Engine.

Methodology:
1. Hard Agronomic Feasibility Gatekeeper:
   - Evaluates crops through the deterministic SuitabilityEngine.
   - Any crop violating a hard constraint (e.g. Sowing Season mismatch, Insufficient Water)
     is strictly relegated to disqualified_crops with detailed reasons.
2. Multi-Criteria Composite Utility Scoring (0 to 100):
   - Agronomic Fit (25 pts): Soil match, pH alignment, agro-climatic zone.
   - Water Resilience & Setup (20 pts): Water-intensity alignment with available source.
   - Expected Net-Return Efficiency (25 pts): Base scenario net profit & Benefit-Cost Ratio.
   - Downside Risk Protection (15 pts): Preservation of capital in conservative P25 scenario.
   - Crop Duration & Rotation (15 pts): Operational calendar and land turnover speed.
3. Grounding & Transparency:
   - Near-term weather context (e.g. wet window alert for sowing or spraying).
   - Preserves unknown data fields without synthetic hallucination.
   - Explicit non-guaranteed yield and profit legal disclaimers.
"""

from typing import List, Dict, Any, Optional
from datetime import datetime, timezone

from app.schemas.farmer_profile import FarmerProfile, RiskPreference
from app.schemas.suitability import SuitabilityStatus, CropSuitabilityAssessment
from app.schemas.weather import WeatherResponse
from app.schemas.ranking import (
    CropRankScoreBreakdown,
    RankedCropItem,
    TransparentRankingResponse
)
from app.agronomy.suitability_engine import SuitabilityEngine
from app.economics.profit_engine import EconomicsEngine
from app.schemas.economics import EconomicsScenarioRequest, CostOverrideInput
from app.agronomy.crop_catalogue import CROP_CATALOGUE


class TransparentRankingEngine:
    """
    Transparent ranking engine that separates feasibility from economic preference.
    """

    def __init__(
        self,
        suitability_engine: Optional[SuitabilityEngine] = None,
        economics_engine: Optional[EconomicsEngine] = None
    ):
        self.suitability_engine = suitability_engine or SuitabilityEngine()
        self.economics_engine = economics_engine or EconomicsEngine()

    def rank_crops(
        self,
        profile: FarmerProfile,
        weather: Optional[WeatherResponse] = None,
        cost_overrides: Optional[CostOverrideInput] = None
    ) -> TransparentRankingResponse:
        """
        Executes complete transparent ranking:
        1. Evaluates all crops agronomic feasibility.
        2. Filters out hard constraint failures.
        3. For qualifying crops, computes economic scenarios & financial metrics.
        4. Calculates multi-criteria component scores.
        5. Returns ordered recommendations with full explainability.
        """
        # Step 1: Agronomic Gatekeeper
        suitability_resp = self.suitability_engine.evaluate_all(profile)

        disqualified_crops: List[CropSuitabilityAssessment] = []
        qualifying_crops: List[CropSuitabilityAssessment] = []

        # Disqualify hard failures
        for crop_eval in suitability_resp.unsuitable_crops:
            disqualified_crops.append(crop_eval)

        # Candidates that passed hard feasibility checks
        for crop_eval in (
            suitability_resp.suitable_crops
            + suitability_resp.conditionally_suitable_crops
            + suitability_resp.insufficient_info_crops
        ):
            if crop_eval.hard_constraints_passed:
                qualifying_crops.append(crop_eval)
            else:
                disqualified_crops.append(crop_eval)

        # Step 2: Contextual Weather Assessment
        weather_rain_48h = 0.0
        weather_condition_str = "Optimal"
        if weather and weather.daily_forecast:
            weather_rain_48h = sum(d.precipitation_sum_mm for d in weather.daily_forecast[:2])
            if weather_rain_48h > 15.0:
                weather_condition_str = f"Heavy rain ({weather_rain_48h:.1f}mm expected in 48h)"
            elif weather_rain_48h > 2.0:
                weather_condition_str = f"Moderate rain ({weather_rain_48h:.1f}mm expected in 48h)"

        # Step 3: Economic Scenarios & Multi-Criteria Scoring for Qualifying Crops
        ranked_items: List[RankedCropItem] = []

        for crop_eval in qualifying_crops:
            crop_meta = CROP_CATALOGUE.get(crop_eval.crop_code)
            if not crop_meta:
                continue

            # Calculate Economics
            econ_req = EconomicsScenarioRequest(
                crop_code=crop_eval.crop_code,
                district=profile.district,
                land_area_acres=profile.land_area_acres,
                cost_overrides=cost_overrides
            )
            econ_resp = self.economics_engine.calculate_scenarios(econ_req)

            base_sc = econ_resp.base_scenario
            cons_sc = econ_resp.conservative_scenario

            # --- Multi-Criteria Score Breakdown ---
            # 1. Agronomic Fit Score (Max 25 pts)
            # Derived from suitability_score (0-100) -> scaled to 25
            agronomic_pts = round((crop_eval.suitability_score / 100.0) * 25.0, 1)

            # 2. Water Resilience Score (Max 20 pts)
            # Pulses & Millets (low water intensity) get high resilience points under rainfed/limited
            water_pts = 16.0
            if crop_meta.min_water_requirement.value == "rainfed":
                water_pts = 20.0
            elif crop_meta.min_water_requirement.value == "limited":
                water_pts = 17.0
            else:
                # Requires reliable
                water_pts = 14.0 if profile.water_availability.value == "reliable" else 10.0

            # 3. Economic Return Score (Max 25 pts)
            # Evaluates Base Net Return per acre and Benefit-Cost Ratio
            # Benchmark: Net return > 50,000/acre is high, BCR > 2.0 is high
            return_per_acre = base_sc.net_return_per_acre_inr
            bcr = base_sc.benefit_cost_ratio
            if return_per_acre > 75000:
                econ_pts = 25.0
            elif return_per_acre > 40000:
                econ_pts = 21.0
            elif return_per_acre > 15000:
                econ_pts = 17.0
            elif return_per_acre >= 0:
                econ_pts = 12.0
            else:
                econ_pts = 5.0
            
            # Boost if BCR is high
            if bcr >= 2.0:
                econ_pts = min(25.0, econ_pts + 2.0)

            # 4. Downside Risk Protection Score (Max 15 pts)
            # Does the crop protect capital even during conservative (P25) market glut?
            risk_pts = 10.0
            if cons_sc.net_return_inr > 0:
                risk_pts = 15.0  # Profitable even in severe market crash
            elif cons_sc.net_return_inr > -10000:
                risk_pts = 11.0  # Mild loss risk
            else:
                risk_pts = 6.0   # Severe capital vulnerability

            # Risk preference alignment
            if profile.risk_preference == RiskPreference.LOW and crop_meta.economic_risk_profile == "High":
                risk_pts = max(3.0, risk_pts - 4.0)

            # 5. Crop Duration & Rotation Score (Max 15 pts)
            # Shorter duration allows land turnover and flexibility
            duration_days = (crop_meta.duration_days_min + crop_meta.duration_days_max) / 2.0
            if duration_days <= 100:
                duration_pts = 15.0
            elif duration_days <= 135:
                duration_pts = 12.5
            elif duration_days <= 170:
                duration_pts = 10.0
            else:
                duration_pts = 7.5

            total_composite = round(
                agronomic_pts + water_pts + econ_pts + risk_pts + duration_pts, 1
            )
            total_composite = max(0.0, min(100.0, total_composite))

            breakdown = CropRankScoreBreakdown(
                agronomic_fit_score=agronomic_pts,
                water_resilience_score=water_pts,
                economic_return_score=econ_pts,
                downside_risk_score=risk_pts,
                duration_turnover_score=duration_pts,
                total_composite_score=total_composite
            )

            # Weather Operational Fit
            if weather_rain_48h > 10.0:
                w_fit = (
                    f"Notice: Approaching rainfall ({weather_rain_48h:.1f}mm). "
                    "Delay immediate land tillage or sowing until soil moisture stabilizes."
                )
            else:
                w_fit = "Upcoming 7-day weather conditions are favorable for field operations."

            # Compile Advantages and Caveats
            advantages = list(crop_eval.reasons)
            if base_sc.net_return_inr > 0:
                advantages.append(
                    f"Positive base scenario net return (₹{base_sc.net_return_per_acre_inr:,.0f}/acre; BCR: {base_sc.benefit_cost_ratio:.2f})."
                )
            if cons_sc.net_return_inr > 0:
                advantages.append("Resilient downside protection: Remains profitable under P25 market slump.")

            risks = list(crop_eval.advisory_notes)
            if cons_sc.net_return_inr < 0:
                risks.append(
                    f"Downside Risk: Under P25 price crash (₹{cons_sc.market_price_inr_per_quintal}/Qtl), "
                    f"loss of up to ₹{abs(cons_sc.net_return_per_acre_inr):,.0f}/acre is possible."
                )
            if crop_meta.economic_risk_profile == "High":
                risks.append(f"Market Volatility: {crop_meta.crop_name} experiences wide APMC mandi price swings.")

            ranked_items.append(RankedCropItem(
                rank=1,  # Temporary, sorted below
                crop_code=crop_eval.crop_code,
                crop_name=crop_eval.crop_name,
                kannada_name=crop_eval.kannada_name,
                category=crop_eval.category,
                suitability_status=crop_eval.status,
                hard_constraints_passed=True,
                composite_score=total_composite,
                score_breakdown=breakdown,
                estimated_cost_per_acre_inr=econ_resp.active_cost_breakdown.total_production_cost_per_acre,
                expected_base_net_return_inr=base_sc.net_return_inr,
                expected_conservative_net_return_inr=cons_sc.net_return_inr,
                benefit_cost_ratio=base_sc.benefit_cost_ratio,
                weather_operational_fit=w_fit,
                key_advantages=advantages,
                key_risks_and_caveats=risks,
                missing_data_fields=crop_eval.missing_inputs,
                package_of_practices_ref=crop_eval.package_of_practices_ref,
                source_citation=crop_eval.source_citation
            ))

        # Sort descending by composite score
        ranked_items.sort(key=lambda x: x.composite_score, reverse=True)
        for idx, item in enumerate(ranked_items, start=1):
            item.rank = idx

        # Sort disqualified crops by agronomic score descending
        disqualified_crops.sort(key=lambda x: x.suitability_score, reverse=True)

        return TransparentRankingResponse(
            farmer_profile_summary={
                "district": profile.district,
                "land_area_acres": profile.land_area_acres,
                "season": profile.sowing_season.value,
                "water_availability": profile.water_availability.value,
                "soil_type": profile.soil_type.value,
                "risk_preference": profile.risk_preference.value,
                "has_custom_cost_overrides": cost_overrides is not None
            },
            weather_context_summary={
                "weather_active": weather is not None,
                "provider": weather.provider if weather else "N/A",
                "is_live": weather.is_live if weather else False,
                "current_temp_c": weather.current.temperature_c if weather and weather.current else None,
                "rain_48h_expected_mm": weather_rain_48h
            } if weather else None,
            total_crops_evaluated=len(self.suitability_engine.catalogue),
            ranked_recommendations=ranked_items,
            disqualified_crops=disqualified_crops
        )
