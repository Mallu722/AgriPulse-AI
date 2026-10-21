"""
AgriPulse AI — Grounded Agricultural Assistant Engine.

Strictly coordinates:
1. Prompt-injection defense & input sanitization
2. Intent classification (Agronomy, Market Prices, Economics, Weather, Out-of-Scope)
3. Deterministic backend numerical tool executions
4. Provenance-tracked RAG retrieval from ICAR/UAS/IMD documents
5. Authentic excerpt synthesis or LLM grounded generation (with strict zero-hallucination fallback)
6. Explicit abstention when official evidence is insufficient
"""

import re
from typing import Dict, Any, Optional, List
from app.schemas.assistant import AssistantRequest, AssistantResponse, Citation
from app.rag.retriever import GroundedRetriever, detect_prompt_injection
from app.rag.tools import GroundedToolRegistry
from app.core.config import settings

# Supported crops for keyword recognition
KNOWN_CROPS = [
    "Tomato", "Onion", "Potato", "Maize", "Ragi", "Cotton", "Tur", "Chilli",
    "Groundnut", "Paddy", "Arecanut"
]
KANNADA_CROP_MAP = {
    "ಟೊಮೆಟೊ": "Tomato",
    "ಟೊಮೇಟೊ": "Tomato",
    "ಈರುಳ್ಳಿ": "Onion",
    "ಆಲೂಗಡ್ಡೆ": "Potato",
    "ಮೆಕ್ಕೆಜೋಳ": "Maize",
    "ರಾಗಿ": "Ragi",
    "ಹತ್ತಿ": "Cotton",
    "ತೊಗರಿ": "Tur",
    "ಮೆಣಸಿನಕಾಯಿ": "Chilli",
    "ಕಡಲೆಕಾಯಿ": "Groundnut",
    "ಶೇಂಗಾ": "Groundnut",
    "ಭತ್ತ": "Paddy",
    "ಅಕ್ಕಿ": "Paddy",
    "ಅಡಿಕೆ": "Arecanut",
    "ಅಡಕೆ": "Arecanut",
}

KANNADA_DISTRICT_MAP = {
    "ಕೋಲಾರ": "Kolar",
    "ಬೆಂಗಳೂರು": "Bengaluru Urban",
    "ಬೆಂಗಳೂರು ನಗರ": "Bengaluru Urban",
    "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ": "Bengaluru Rural",
    "ಬೆಳಗಾವಿ": "Belagavi",
    "ಮೈಸೂರು": "Mysuru",
    "ದಾವಣಗೆರೆ": "Davanagere",
    "ಹಾವೇರಿ": "Haveri",
    "ಚಿತ್ರದುರ್ಗ": "Chitradurga",
    "ತುಮಕೂರು": "Tumakuru",
    "ಮಂಡ್ಯ": "Mandya",
    "ಹಾಸನ": "Hassan",
    "ಚಿಕ್ಕಬಳ್ಳಾಪುರ": "Chikkaballapura",
    "ಬಳ್ಳಾರಿ": "Ballari",
    "ರಾಯಚೂರು": "Raichur",
    "ಕಲಬುರಗಿ": "Kalaburagi",
    "ಗುಲ್ಬರ್ಗ": "Kalaburagi",
    "ಬೀದರ್": "Bidar",
    "ಯಾದಗಿರಿ": "Yadgir",
    "ಶಿವಮೊಗ್ಗ": "Shivamogga",
    "ಧಾರವಾಡ": "Dharwad",
    "ಹುಬ್ಬಳ್ಳಿ": "Hubballi",
    "ಗದಗ": "Gadag",
    "ಕೊಪ್ಪಳ": "Koppal",
    "ವಿಜಯಪುರ": "Vijayapura",
    "ಬಾಗಲಕೋಟೆ": "Bagalkot",
    "ರಾಮನಗರ": "Ramanagara",
    "ಚಿಕ್ಕಮಗಳೂರು": "Chikkamagaluru",
    "ಉಡುಪಿ": "Udupi",
    "ಕೊಡಗು": "Kodagu"
}


def is_kannada(text: str) -> bool:
    """Checks if text contains Kannada Unicode characters."""
    return any("\u0c80" <= c <= "\u0cff" for c in text)


def extract_district(query: str, default_district: Optional[str] = None) -> Optional[str]:
    """Extracts Karnataka district name from query text if present."""
    for kn_dist, en_dist in KANNADA_DISTRICT_MAP.items():
        if kn_dist in query:
            return en_dist
    q_lower = query.lower()
    for en_dist in KANNADA_DISTRICT_MAP.values():
        if en_dist.lower() in q_lower:
            return en_dist
    return default_district


def extract_crop_name(query: str, default_crop: Optional[str] = None) -> Optional[str]:
    """Identifies the target crop from query text in English or Kannada."""
    query_lower = query.lower()
    for kn_name, en_name in KANNADA_CROP_MAP.items():
        if kn_name in query:
            return en_name
    for en_name in KNOWN_CROPS:
        if en_name.lower() in query_lower:
            return en_name
    return default_crop


def classify_intent(query: str) -> str:
    """Classifies the primary agricultural intent of the user query."""
    q = query.lower()

    # Out of scope / unanswerable topics
    out_of_scope_keywords = [
        "bitcoin", "crypto", "stock market", "sensex", "nifty", "python code",
        "javascript", "movie", "cricket", "ipl", "saffron", "gold price",
        "ಕ್ಯಾನ್ಸರ್", "ಚಿನ್ನ", "ಷೇರು ಮಾರುಕಟ್ಟೆ"
    ]
    if any(k in q for k in out_of_scope_keywords):
        return "OUT_OF_SCOPE"

    has_price_kw = any(w in q for w in ["price", "rate", "mandi", "apmc", "modal", "ಬೆಲೆ", "ದರ", "ಮಾರುಕಟ್ಟೆ", "ಕ್ವಿಂಟಾಲ್", "ಖರೀದಿ"])
    has_profit_kw = any(w in q for w in ["profit", "cost", "revenue", "return", "roi", "economics", "ಖರ್ಚು", "ಲಾಭ", "ಆದಾಯ", "ಬಂಡವಾಳ", "ವೆಚ್ಚ"])
    has_weather_kw = any(w in q for w in ["weather", "rain", "rainfall", "forecast", "temperature", "humidity", "spray", "ಹವಾಮಾನ", "ಮಳೆ", "ಬಿಸಿಲು", "ಸಿಂಪಡ"])
    has_agronomy_kw = any(w in q for w in ["fertilizer", "npk", "disease", "pest", "wilt", "blast", "seed", "variety", "spacing", "sow", "ಗೊಬ್ಬರ", "ರೋಗ", "ಔಷಧ", "ತಳಿ", "ಬಿತ್ತನೆ", "ಕೀಟ", "ಶಿಫಾರಸು"])

    if has_price_kw and (has_agronomy_kw or has_profit_kw):
        return "HYBRID"
    if has_profit_kw:
        return "PROFIT_ECONOMICS"
    if has_price_kw:
        return "MARKET_PRICE"
    if has_weather_kw:
        return "WEATHER_ADVISORY"
    if has_agronomy_kw:
        return "AGRONOMY_ADVICE"

    return "GENERAL_AGRICULTURE"


class AgriPulseAssistant:
    """Core RAG Assistant implementation."""

    def __init__(self):
        self.retriever = GroundedRetriever()
        self.tools = GroundedToolRegistry()

    async def answer(self, request: AssistantRequest) -> AssistantResponse:
        """Processes user query and returns grounded response with provenance."""
        query = request.query.strip()

        # 1. Detect language
        if request.language_preference in ["kn", "en"]:
            lang = request.language_preference
        else:
            lang = "kn" if is_kannada(query) else "en"

        # 2. Check for Prompt Injection / Adversarial Jailbreaks
        if detect_prompt_injection(query):
            refusal_kn = (
                "⚠️ ಸಿಸ್ಟಮ್ ಭದ್ರತಾ ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಪ್ರಶ್ನೆಯಲ್ಲಿ ಸಿಸ್ಟಮ್ ನಿಯಮಾವಳಿಗಳನ್ನು ಉಲ್ಲಂಘಿಸುವ ನಿರ್ದೇಶನಗಳು ಕಂಡುಬಂದಿವೆ. "
                "ಅಗ್ರಿಪಲ್ಸ್ ಎಐ ಕೇವಲ ಅಧಿಕೃತ ಐಸಿಎಆರ್ (ICAR), ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳು ಹಾಗೂ ಎಪಿಎಂಸಿ ದೃಢೀಕೃತ ಕೃಷಿ ಮಾಹಿತಿಯನ್ನು ಮಾತ್ರ ಒದಗಿಸುತ್ತದೆ."
            )
            refusal_en = (
                "⚠️ Security Warning: System prompt-injection or adversarial override detected. "
                "AgriPulse AI strictly refuses instructions that violate safety boundaries and only communicates "
                "verified ICAR, Agricultural University, and APMC official data."
            )
            return AssistantResponse(
                query=query,
                detected_language=lang,
                intent="MALICIOUS_PROMPT_INJECTION",
                answer=refusal_kn if lang == "kn" else refusal_en,
                mode="abstention",
                citations=[],
                tool_outputs=None,
                assumptions_and_limitations="Query rejected due to hard prompt-injection security rule.",
                abstention=True,
                prompt_injection_flagged=True
            )

        # 3. Classify Intent & Extract Context
        intent = classify_intent(query)
        detected_crop = extract_crop_name(query, request.crop_context)
        district = extract_district(query, request.district) or "Kolar"

        # Multi-turn conversational context resolution:
        # If user did not mention crop or district in this turn (e.g. asking "ಇದಕ್ಕೆ ಗೊಬ್ಬರ ಎಷ್ಟು?", "ಮಾರುಕಟ್ಟೆ ಬೆಲೆ ಎಷ್ಟು?"),
        # carry forward the crop and district from previous conversation history!
        if not detected_crop and request.conversation_history:
            for turn in reversed(request.conversation_history):
                content = turn.get("content", "")
                prev_crop = extract_crop_name(content)
                if prev_crop:
                    detected_crop = prev_crop
                    break

        if (not request.district or request.district == "Kolar") and request.conversation_history:
            for turn in reversed(request.conversation_history):
                content = turn.get("content", "")
                prev_dist = extract_district(content, None)
                if prev_dist:
                    district = prev_dist
                    break

        # 4. Handle Out of Scope Queries immediately (Explicit Abstention)
        if intent == "OUT_OF_SCOPE":
            abstention_kn = (
                f"ಕ್ಷಮಿಸಿ, ಈ ಪ್ರಶ್ನೆಯು ಅಗ್ರಿಪಲ್ಸ್ ಎಐ ಕೃಷಿ ವ್ಯಾಪ್ತಿಗೆ ಒಳಪಡುವುದಿಲ್ಲ ಅಥವಾ ಅಧಿಕೃತ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ. "
                f"ನಾವು ಕೇವಲ ಕರ್ನಾಟಕದ ಪ್ರಮುಖ ಬೆಳೆಗಳು (ರಾಗಿ, ಟೊಮೆಟೊ, ಈರುಳ್ಳಿ, ಮೆಕ್ಕೆಜೋಳ, ಇತ್ಯಾದಿ), ಎಪಿಎಂಸಿ ಮಂಡಿ ದರಗಳು "
                f"ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆಗಳಿಗೆ ಮಾತ್ರ ಐಸಿಎಆರ್/ಕೃಷಿ ವಿವಿ ದೃಢೀಕೃತ ಸಲಹೆಗಳನ್ನು ನೀಡುತ್ತೇವೆ."
            )
            abstention_en = (
                f"I cannot answer this question as it falls outside the agricultural scope of AgriPulse AI or lacks "
                f"official scientific evidence. AgriPulse AI only provides guidance for verified Karnataka crops "
                f"(Ragi, Tomato, Onion, Maize, Cotton, etc.), APMC mandi spot prices, and ICAR/IMD advisories."
            )
            return AssistantResponse(
                query=query,
                detected_language=lang,
                intent="OUT_OF_SCOPE",
                answer=abstention_kn if lang == "kn" else abstention_en,
                mode="abstention",
                citations=[],
                tool_outputs=None,
                assumptions_and_limitations="Query fell outside the agricultural evidence base; system abstained safely.",
                abstention=True,
                prompt_injection_flagged=False
            )

        # 5. Execute Backend Tools
        tool_outputs: Dict[str, Any] = {}

        if intent in ["MARKET_PRICE", "HYBRID"] and detected_crop:
            price_quote = self.tools.get_market_price(detected_crop, district)
            if price_quote:
                tool_outputs["market_quote"] = price_quote

        if intent in ["PROFIT_ECONOMICS", "HYBRID"] and detected_crop:
            # Extract land area if mentioned, e.g. "2 acre"
            area_match = re.search(r"(\d+(\.\d+)?)\s*(acre|ಎಕರೆ)", query.lower())
            acres = float(area_match.group(1)) if area_match else 1.0
            econ = self.tools.calculate_economics(detected_crop, acres, district)
            if econ:
                tool_outputs["unit_economics"] = econ

        if intent in ["WEATHER_ADVISORY", "HYBRID"]:
            weather = await self.tools.get_weather_advisory(district)
            if weather:
                tool_outputs["weather_context"] = weather

        # 6. Retrieve Supporting Documents from Curated Knowledge Base
        citations, has_evidence = self.retriever.retrieve(query, top_k=3, target_crop=detected_crop)

        # If no citations and no tool output -> Abstain
        if not citations and not tool_outputs:
            no_ev_kn = (
                "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ನಮ್ಮ ಬಳಿ ಅಧಿಕೃತ ಐಸಿಎಆರ್ (ICAR) ಅಥವಾ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ "
                "ದೃಢೀಕೃತ ದಾಖಲೆಗಳು ಲಭ್ಯವಿಲ್ಲ. ಕಲ್ಪಿತ ಅಥವಾ ತಪ್ಪು ಮಾಹಿತಿಯನ್ನು ನೀಡದಿರಲು ಅಗ್ರಿಪಲ್ಸ್ ಎಐ ಈ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿದೆ. "
                "ಹೆಚ್ಚಿನ ಮಾಹಿತಿಗಾಗಿ ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹತ್ತಿರದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರವನ್ನು (KVK) ಸಂಪರ್ಕಿಸಿ."
            )
            no_ev_en = (
                "Insufficient official evidence available. AgriPulse AI abstains from answering rather than fabricating advice. "
                "No verified ICAR or Agricultural University documents matched your query with sufficient confidence. "
                "Please verify with your local Raitha Samparka Kendra or Krishi Vigyan Kendra (KVK)."
            )
            return AssistantResponse(
                query=query,
                detected_language=lang,
                intent=intent,
                answer=no_ev_kn if lang == "kn" else no_ev_en,
                mode="abstention",
                citations=[],
                tool_outputs=None,
                assumptions_and_limitations="Retrieval similarity fell below minimum relevance threshold; abstained safely.",
                abstention=True,
                prompt_injection_flagged=False
            )

        # 7. Synthesize Response with Conversational Multi-turn Context
        answer_text, mode = await self._synthesize_grounded_response(
            query=query,
            lang=lang,
            intent=intent,
            detected_crop=detected_crop,
            district=district,
            citations=citations,
            tool_outputs=tool_outputs,
            conversation_history=request.conversation_history
        )

        assumptions = (
            f"ಮೂಲ: ಅಧಿಕೃತ ICAR/UAS/IMD ದೃಢೀಕೃತ ದಾಖಲೆಗಳು ಮತ್ತು Agmarknet ಮಂಡಿ ದರಗಳು. ಜಿಲ್ಲೆ: {district}. "
            "ಇದು ಅಧಿಕೃತ ಶಿಫಾರಸುಗಳ ಮಾರ್ಗದರ್ಶಿಯಾಗಿದ್ದು, ಕ್ಷೇತ್ರ ಮಟ್ಟದ ವೈಪರೀತ್ಯಗಳಿಗೆ ಸ್ಥಳೀಯ ವಿಜ್ಞಾನಿಗಳ ಸಲಹೆ ಪಡೆಯುವುದು ಉತ್ತಮ."
            if lang == "kn" else
            f"Source: Verified ICAR/UAS/IMD guidelines & Agmarknet mandi quotes. District context: {district}. "
            "Figures reflect canonical benchmarks and official Package of Practices. Local field conditions may vary."
        )

        return AssistantResponse(
            query=query,
            detected_language=lang,
            intent=intent,
            answer=answer_text,
            mode=mode,
            citations=citations,
            tool_outputs=tool_outputs if tool_outputs else None,
            assumptions_and_limitations=assumptions,
            abstention=False,
            prompt_injection_flagged=False
        )

    async def _synthesize_grounded_response(
        self,
        query: str,
        lang: str,
        intent: str,
        detected_crop: Optional[str],
        district: str,
        citations: List[Citation],
        tool_outputs: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> tuple[str, str]:
        """
        Synthesizes the final answer text using configured LLM when available,
        with strict deterministic fallback to authenticated excerpts and multi-turn context.
        """
        # If LLM API key is present, attempt grounded LLM synthesis
        if settings.LLM_API_KEY:
            try:
                llm_response = await self._call_llm(
                    query=query,
                    lang=lang,
                    intent=intent,
                    district=district,
                    citations=citations,
                    tool_outputs=tool_outputs,
                    conversation_history=conversation_history
                )
                if llm_response and len(llm_response.strip()) > 20:
                    return llm_response.strip(), "llm_synthesized"
            except Exception:
                # Graceful zero-failure fallback
                pass

        mode = "retrieval_excerpt_fallback"
        sections: List[str] = []

        # Multi-turn contextual continuity note
        if conversation_history and len(conversation_history) > 0:
            if lang == "kn":
                sections.append(f"💬 **ಹಿಂದಿನ ಸಂಭಾಷಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ ({detected_crop or 'ಬೆಳೆ'} • {district} ಜಿಲ್ಲೆ):**")
            else:
                sections.append(f"💬 **In connection with our previous discussion ({detected_crop or 'crop'} • {district} District):**")

        # Numerical tool outputs section
        if "market_quote" in tool_outputs:
            q = tool_outputs["market_quote"]
            if lang == "kn":
                sections.append(
                    f"📊 **ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ ದರ (ಎಪಿಎಂಸಿ ದತ್ತಾಂಶ):**\n"
                    f"• ಉತ್ಪನ್ನ: **{q['commodity']}** | ಮಾರುಕಟ್ಟೆ: **{q['market_yard']}**\n"
                    f"• ಮಾದರಿ ದರ (Modal): **₹{q['modal_price_inr_per_qtl']} / ಕ್ವಿಂಟಾಲ್**\n"
                    f"• ಕನಿಷ್ಠ - ಗರಿಷ್ಠ ದರ: ₹{q['min_price_inr_per_qtl']} – ₹{q['max_price_inr_per_qtl']}\n"
                    f"• ದಿನಾಂಕ: {q['quote_date']} (ಮೂಲ: {q['source_provenance']})"
                )
            else:
                sections.append(
                    f"📊 **Verified APMC Market Prices (Official Data):**\n"
                    f"• Commodity: **{q['commodity']}** | Market Yard: **{q['market_yard']}**\n"
                    f"• Modal Price: **₹{q['modal_price_inr_per_qtl']} / quintal**\n"
                    f"• Price Range: ₹{q['min_price_inr_per_qtl']} – ₹{q['max_price_inr_per_qtl']}\n"
                    f"• Date: {q['quote_date']} (Source: {q['source_provenance']})"
                )

        if "unit_economics" in tool_outputs:
            e = tool_outputs["unit_economics"]
            if lang == "kn":
                sections.append(
                    f"💰 **ಕೃಷಿ ಆರ್ಥಿಕತೆ ಮತ್ತು ಅಂದಾಜು ಲಾಭ ({e['land_area_acres']} ಎಕರೆಗೆ):**\n"
                    f"• ಅಂದಾಜು ಇಳುವರಿ: **{e['total_production_qtl']} ಕ್ವಿಂಟಾಲ್** ({e['expected_yield_qtl_per_acre']} ಕ್ವಿಂ/ಎಕರೆ)\n"
                    f"• ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ: **₹{e['total_cultivation_cost_inr']:,}** (ಎಕರೆಗೆ ₹{e['cost_per_acre_inr']:,})\n"
                    f"• ಒಟ್ಟು ಆದಾಯ (Gross Revenue): **₹{e['gross_revenue_inr']:,}** (@ ₹{e['assumed_modal_price_per_qtl_inr']}/ಕ್ವಿಂಟಾಲ್)\n"
                    f"• ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ (Net Profit): **₹{e['expected_net_profit_inr']:,}**\n"
                    f"• ಹೂಡಿಕೆ ಮೇಲಿನ ಲಾಭ (ROI): **{e['return_on_investment_pct']}%**\n"
                    f"*(ಗಮನಿಸಿ: {e['formula_applied']}; ಆಧಾರ: {e['official_cost_source']})*"
                )
            else:
                sections.append(
                    f"💰 **Farm Unit Economics & Profit Calculation ({e['land_area_acres']} acre):**\n"
                    f"• Expected Total Production: **{e['total_production_qtl']} quintals** ({e['expected_yield_qtl_per_acre']} qtl/acre)\n"
                    f"• Total Cultivation Cost: **₹{e['total_cultivation_cost_inr']:,}** (₹{e['cost_per_acre_inr']:,}/acre)\n"
                    f"• Gross Revenue: **₹{e['gross_revenue_inr']:,}** (@ ₹{e['assumed_modal_price_per_qtl_inr']}/qtl modal)\n"
                    f"• Expected Net Profit: **₹{e['expected_net_profit_inr']:,}**\n"
                    f"• Return on Investment (ROI): **{e['return_on_investment_pct']}%**\n"
                    f"*(Applied formula: {e['formula_applied']}; Source: {e['official_cost_source']})*"
                )

        if "weather_context" in tool_outputs:
            w = tool_outputs["weather_context"]
            if lang == "kn":
                sections.append(
                    f"🌤️ **ಲೈವ್ ಹವಾಮಾನ ಮುನ್ನೋಟ ({w['district']}):**\n"
                    f"• ತಾಪಮಾನ: {w['temperature_c']}°C | ತೇವಾಂಶ: {w['relative_humidity_pct']}% | ಮಳೆ: {w['precipitation_mm']} mm\n"
                    f"• ಮುನ್ಸೂಚನೆ: {w['weather_description']} (ಮೂಲ: {w['provider']})"
                )
            else:
                sections.append(
                    f"🌤️ **Live Weather Context ({w['district']}):**\n"
                    f"• Temp: {w['temperature_c']}°C | Humidity: {w['relative_humidity_pct']}% | Rainfall: {w['precipitation_mm']} mm\n"
                    f"• Conditions: {w['weather_description']} (Provider: {w['provider']})"
                )

        # Document excerpts section
        if citations:
            if lang == "kn":
                sections.append("📚 **ಅಧಿಕೃತ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಸಂಶೋಧನಾ ದಾಖಲೆಗಳು:**")
                for idx, cit in enumerate(citations, 1):
                    sections.append(
                        f"**{idx}. {cit.document_title}** ({cit.issuer})\n"
                        f"> {cit.excerpt}\n"
                        f"*ವಿಭಾಗ: {cit.section} | ದಿನಾಂಕ: {cit.publication_date}*"
                    )
            else:
                sections.append("📚 **Official Package of Practices & Scientific Excerpts:**")
                for idx, cit in enumerate(citations, 1):
                    sections.append(
                        f"**{idx}. {cit.document_title}** ({cit.issuer})\n"
                        f"> {cit.excerpt}\n"
                        f"*Section: {cit.section} | Date: {cit.publication_date}*"
                    )

        final_answer = "\n\n".join(sections)
        return final_answer, mode

    async def _call_llm(
        self,
        query: str,
        lang: str,
        intent: str,
        district: str,
        citations: List[Citation],
        tool_outputs: Dict[str, Any],
        conversation_history: Optional[List[Dict[str, str]]] = None
    ) -> Optional[str]:
        """Calls the configured LLM endpoint with grounded tool facts, multi-turn history, and document context."""
        import httpx

        system_prompt = (
            "You are AgriPulse AI, an expert, trustworthy agricultural decision support system for Karnataka farmers.\n"
            "CRITICAL INSTRUCTIONS:\n"
            "1. When answering in Kannada (lang='kn'), YOU MUST WRITE ENTIRELY IN POLITE, FLUENT, ACCURATE KANNADA.\n"
            "2. Never hallucinate or invent prices, yields, or profits. Use ONLY the provided tool numbers and ICAR facts.\n"
            "3. Ground your agronomic recommendations strictly on the provided official excerpts and citations.\n"
            "4. Structure your response clearly with helpful bullet points.\n"
            "5. If previous conversation turns are present, maintain multi-turn continuity and directly connect your answer to the previous questions and answers."
        )

        context_parts = []
        if tool_outputs:
            context_parts.append(f"VERIFIED TOOL DATA: {tool_outputs}")
        if citations:
            excerpts_text = "\n".join([f"- [{c.issuer} - {c.document_title}]: {c.excerpt}" for c in citations])
            context_parts.append(f"OFFICIAL GUIDELINE EXCERPTS:\n{excerpts_text}")

        user_content = (
            f"User Question: {query}\n"
            f"Target District: {district}\n"
            f"Target Language: {'Kannada' if lang == 'kn' else 'English'}\n\n"
            + "\n\n".join(context_parts)
        )

        messages = [
            {"role": "system", "content": system_prompt}
        ]

        # Add prior conversation turns for multi-turn conversational awareness
        if conversation_history:
            for turn in conversation_history[-6:]:
                role = turn.get("role")
                content = turn.get("content")
                if role in ["user", "assistant"] and content:
                    messages.append({"role": role, "content": content})

        messages.append({"role": "user", "content": user_content})

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {settings.LLM_API_KEY}"
        }
        payload = {
            "model": settings.LLM_MODEL or "llama3",
            "messages": messages,
            "temperature": 0.2,
            "max_tokens": 800
        }

        endpoint = f"{settings.LLM_BASE_URL.rstrip('/')}/chat/completions"
        async with httpx.AsyncClient(timeout=4.0) as client:
            resp = await client.post(endpoint, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content")
                return content
            return None

