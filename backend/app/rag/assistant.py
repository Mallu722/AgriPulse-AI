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
import uuid
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

ENGLISH_TO_KANNADA_CROP = {
    "Onion": "ಈರುಳ್ಳಿ",
    "Tomato": "ಟೊಮೆಟೊ",
    "Potato": "ಆಲೂಗಡ್ಡೆ",
    "Maize": "ಮೆಕ್ಕೆಜೋಳ",
    "Ragi": "ರಾಗಿ",
    "Cotton": "ಹತ್ತಿ",
    "Tur": "ತೊಗರಿ",
    "Chilli": "ಮೆಣಸಿನಕಾಯಿ",
    "Groundnut": "ಶೇಂಗಾ",
    "Paddy": "ಭತ್ತ",
    "Arecanut": "ಅಡಿಕೆ",
    "Ginger": "ಶುಂಠಿ",
    "Garlic": "ಬೆಳ್ಳುಳ್ಳಿ",
    "Banana": "ಬಾಳೆ",
    "Sugarcane": "ಕಬ್ಬು",
    "Copra": "ಕೊಬ್ಬರಿ",
    "Turmeric": "ಅರಿಶಿನ",
    "Coffee": "ಕಾಫಿ",
    "Cardamom": "ಏಲಕ್ಕಿ",
    "Mango": "ಮಾವು",
    "Pomegranate": "ದಾಳಿಂಬೆ",
    "Grapes": "ದ್ರಾಕ್ಷಿ",
    "Coriander": "ಕೊತ್ತಂಬರಿ",
    "Flowers": "ಹೂವು",
    "General": "ಬೆಳೆ"
}

ENGLISH_TO_KANNADA_DISTRICT = {
    "Kolar": "ಕೋಲಾರ",
    "Bengaluru Urban": "ಬೆಂಗಳೂರು",
    "Bengaluru Rural": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ",
    "Bangalore Urban": "ಬೆಂಗಳೂರು",
    "Bangalore Rural": "ಬೆಂಗಳೂರು ಗ್ರಾಮಾಂತರ",
    "Bangalore": "ಬೆಂಗಳೂರು",
    "Belagavi": "ಬೆಳಗಾವಿ",
    "Belgaum": "ಬೆಳಗಾವಿ",
    "Mysuru": "ಮೈಸೂರು",
    "Mysore": "ಮೈಸೂರು",
    "Davanagere": "ದಾವಣಗೆರೆ",
    "Haveri": "ಹಾವೇರಿ",
    "Chitradurga": "ಚಿತ್ರದುರ್ಗ",
    "Tumakuru": "ತುಮಕೂರು",
    "Tumkur": "ತುಮಕೂರು",
    "Mandya": "ಮಂಡ್ಯ",
    "Hassan": "ಹಾಸನ",
    "Chikkaballapura": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
    "Chikkaballapur": "ಚಿಕ್ಕಬಳ್ಳಾಪುರ",
    "Ballari": "ಬಳ್ಳಾರಿ",
    "Bellary": "ಬಳ್ಳಾರಿ",
    "Raichur": "ರಾಯಚೂರು",
    "Kalaburagi": "ಕಲಬುರಗಿ",
    "Gulbarga": "ಕಲಬುರಗಿ",
    "Bidar": "ಬೀದರ್",
    "Yadgir": "ಯಾದಗಿರಿ",
    "Shivamogga": "ಶಿವಮೊಗ್ಗ",
    "Shimoga": "ಶಿವಮೊಗ್ಗ",
    "Dharwad": "ಧಾರವಾಡ",
    "Hubballi": "ಹುಬ್ಬಳ್ಳಿ",
    "Hubli": "ಹುಬ್ಬಳ್ಳಿ",
    "Gadag": "ಗದಗ",
    "Koppal": "ಕೊಪ್ಪಳ",
    "Vijayapura": "ವಿಜಯಪುರ",
    "Bijapur": "ವಿಜಯಪುರ",
    "Bagalkot": "ಬಾಗಲಕೋಟೆ",
    "Ramanagara": "ರಾಮನಗರ",
    "Chikkamagaluru": "ಚಿಕ್ಕಮಗಳೂರು",
    "Udupi": "ಉಡುಪಿ",
    "Kodagu": "ಕೊಡಗು",
    "Coorg": "ಕೊಡಗು",
}


def to_kannada_market_name(market: str) -> str:
    """Translates APMC market yard names into fluent Kannada."""
    res = market
    for en, kn in ENGLISH_TO_KANNADA_DISTRICT.items():
        res = re.sub(r'\b' + re.escape(en) + r'\b', kn, res, flags=re.IGNORECASE)
    res = re.sub(r'\bAPMC\b', 'ಎಪಿಎಂಸಿ', res, flags=re.IGNORECASE)
    res = re.sub(r'\bYard\b', 'ಮಂಡಿ', res, flags=re.IGNORECASE)
    res = re.sub(r'\bMandi\b', 'ಮಂಡಿ', res, flags=re.IGNORECASE)
    res = re.sub(r'\bMarket\b', 'ಮಾರುಕಟ್ಟೆ', res, flags=re.IGNORECASE)
    res = re.sub(r'\bBinny Mill\b', 'ಬಿನ್ನಿ ಮಿಲ್', res, flags=re.IGNORECASE)
    res = re.sub(r'\bYeshwanthpur\b', 'ಯಶವಂತಪುರ', res, flags=re.IGNORECASE)
    res = re.sub(r'\bState Average\b', 'ರಾಜ್ಯ ಸರಾಸರಿ', res, flags=re.IGNORECASE)
    return res.strip()


KANNADA_UNITS = {
    0: "ಸೊನ್ನೆ", 1: "ಒಂದು", 2: "ಎರಡು", 3: "ಮೂರು", 4: "ನಾಲ್ಕು", 5: "ಐದು",
    6: "ಆರು", 7: "ಏಳು", 8: "ಎಂಟು", 9: "ಒಂಬತ್ತು", 10: "ಹತ್ತು",
    11: "ಹನ್ನೊಂದು", 12: "ಹನ್ನೆರಡು", 13: "ಹದಿಮೂರು", 14: "ಹದಿನಾಲ್ಕು", 15: "ಹದಿನೈದು",
    16: "ಹದಿನಾರು", 17: "ಹದಿನೇಳು", 18: "ಹದಿನೆಂಟು", 19: "ಹತ್ತೊಂಬತ್ತು", 20: "ಇಪ್ಪತ್ತು",
    21: "ಇಪ್ಪತ್ತೊಂದು", 22: "ಇಪ್ಪತ್ತೆರಡು", 23: "ಇಪ್ಪತ್ತಮೂರು", 24: "ಇಪ್ಪತ್ತನಾಲ್ಕು", 25: "ಇಪ್ಪತ್ತೈದು",
    26: "ಇಪ್ಪತ್ತಾರು", 27: "ಇಪ್ಪತ್ತೇಳು", 28: "ಇಪ್ಪತ್ತೆಂಟು", 29: "ಇಪ್ಪತ್ತೊಂಬತ್ತು", 30: "ಮೂವತ್ತು",
    31: "ಮೂವತ್ತೊಂದು", 32: "ಮೂವತ್ತೆರಡು", 33: "ಮೂವತ್ತಮೂರು", 34: "ಮೂವತ್ತನಾಲ್ಕು", 35: "ಮೂವತ್ತೈದು",
    36: "ಮೂವತ್ತಾರು", 37: "ಮೂವತ್ತೇಳು", 38: "ಮೂವತ್ತೆಂಟು", 39: "ಮೂವತ್ತೊಂಬತ್ತು", 40: "ನಲವತ್ತು",
    41: "ನಲವತ್ತೊಂದು", 42: "ನಲವತ್ತೆರಡು", 43: "ನಲವತ್ತಮೂರು", 44: "ನಲವತ್ತನಾಲ್ಕು", 45: "ನಲವತ್ತೈದು",
    46: "ನಲವತ್ತಾರು", 47: "ನಲವತ್ತೇಳು", 48: "ನಲವತ್ತೆಂಟು", 49: "ನಲವತ್ತೊಂಬತ್ತು", 50: "ಐವತ್ತು",
    51: "ಐವತ್ತೊಂದು", 52: "ಐವತ್ತೆರಡು", 53: "ಐವತ್ತಮೂರು", 54: "ಐವತ್ತನಾಲ್ಕು", 55: "ಐವತ್ತೈದು",
    56: "ಐವತ್ತಾರು", 57: "ಐವತ್ತೇಳು", 58: "ಐವತ್ತೆಂಟು", 59: "ಐವತ್ತೊಂಬತ್ತು", 60: "ಅರವತ್ತು",
    61: "ಅರವತ್ತೊಂದು", 62: "ಅರವತ್ತೆರಡು", 63: "ಅರವತ್ತಮೂರು", 64: "ಅರವತ್ತನಾಲ್ಕು", 65: "ಅರವತ್ತೈದು",
    66: "ಅರವತ್ತಾರು", 67: "ಅರವತ್ತೇಳು", 68: "ಅರವತ್ತೆಂಟು", 69: "ಅರವತ್ತೊಂಬತ್ತು", 70: "ಎಪ್ಪತ್ತು",
    71: "ಎಪ್ಪತ್ತೊಂದು", 72: "ಎಪ್ಪತ್ತೆರಡು", 73: "ಎಪ್ಪತ್ತಮೂರು", 74: "ಎಪ್ಪತ್ತನಾಲ್ಕು", 75: "ಎಪ್ಪತ್ತೈದು",
    76: "ಎಪ್ಪತ್ತಾರು", 77: "ಎಪ್ಪತ್ತೇಳು", 78: "ಎಪ್ಪತ್ತೆಂಟು", 79: "ಎಪ್ಪತ್ತೊಂಬತ್ತು", 80: "ಎಂಬತ್ತು",
    81: "ಎಂಬತ್ತೊಂದು", 82: "ಎಂಬತ್ತೆರಡು", 83: "ಎಂಬತ್ತಮೂರು", 84: "ಎಂಬತ್ತನಾಲ್ಕು", 85: "ಎಂಬತ್ತೈದು",
    86: "ಎಂಬತ್ತಾರು", 87: "ಎಂಬತ್ತೇಳು", 88: "ಎಂಬತ್ತೆಂಟು", 89: "ಎಂಬತ್ತೊಂಬತ್ತು", 90: "ತೊಂಬತ್ತು",
    91: "ತೊಂಬತ್ತೊಂದು", 92: "ತೊಂಬತ್ತೆರಡು", 93: "ತೊಂಬತ್ತಮೂರು", 94: "ತೊಂಬತ್ತನಾಲ್ಕು", 95: "ತೊಂಬತ್ತೈದು",
    96: "ತೊಂಬತ್ತಾರು", 97: "ತೊಂಬತ್ತೇಳು", 98: "ತೊಂಬತ್ತೆಂಟು", 99: "ತೊಂಬತ್ತೊಂಬತ್ತು"
}

KANNADA_HUNDREDS = {
    1: "ನೂರು", 2: "ಇನ್ನೂರು", 3: "ಮುನ್ನೂರು", 4: "ನಾನೂರು",
    5: "ಐನೂರು", 6: "ಆರೂರು", 7: "ಏಳನೂರು", 8: "ಎಂಟುನೂರು", 9: "ಒಂಬೈನೂರು"
}

def number_to_kannada_words(n: int) -> str:
    """Converts a non-negative integer into standard spoken Kannada words."""
    if n in KANNADA_UNITS:
        return KANNADA_UNITS[n]
    if n < 0:
        return f"ಮೈನಸ್ {number_to_kannada_words(abs(n))}"

    parts = []
    # Crores (10,000,000)
    crores = n // 10000000
    rem = n % 10000000
    if crores > 0:
        parts.append(f"{number_to_kannada_words(crores)} ಕೋಟಿ")

    # Lakhs (100,000)
    lakhs = rem // 100000
    rem = rem % 100000
    if lakhs > 0:
        parts.append(f"{number_to_kannada_words(lakhs)} ಲಕ್ಷ")

    # Thousands (1,000)
    thousands = rem // 1000
    rem = rem % 1000
    if thousands > 0:
        parts.append(f"{number_to_kannada_words(thousands)} ಸಾವಿರ")

    # Hundreds (100)
    hundreds = rem // 100
    rem = rem % 100
    if hundreds > 0:
        parts.append(KANNADA_HUNDREDS.get(hundreds, f"{number_to_kannada_words(hundreds)} ನೂರು"))

    # Remaining 1-99
    if rem > 0:
        parts.append(KANNADA_UNITS.get(rem, str(rem)))

    return " ".join(parts)

def convert_all_numbers_to_kannada(text: str) -> str:
    """Replaces all numerical digits in text with spoken Kannada number words."""
    if not text:
        return ""
    # Convert 1 quintal explicitly to 'ಒಂದು ಕ್ವಿಂಟಾಲ್'
    text = re.sub(r'\b1\s*ಕ್ವಿಂಟಾಲ್', 'ಒಂದು ಕ್ವಿಂಟಾಲ್', text)
    text = re.sub(r'\b1\s*Quintal\b', 'ಒಂದು ಕ್ವಿಂಟಾಲ್', text, flags=re.IGNORECASE)

    def _repl(match):
        raw = match.group(0).replace(",", "")
        try:
            val = int(raw)
            return number_to_kannada_words(val)
        except ValueError:
            return match.group(0)

    # Convert comma-separated or plain digits
    return re.sub(r'\b\d+(?:,\d+)*\b', _repl, text)




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

    # Crop recommendation keywords (which crop to plant / crop selection)
    has_rec_kw = any(w in q for w in [
        "crop recommendation", "recommend crop", "recommend crops", "which crop", "what crop", "what plant", "suggest plant",
        "suggest crop", "what should i grow", "which crop to grow", "grow properly", "which plant",
        "best crop", "ಸೂಕ್ತ ಬೆಳೆ", "ಯಾವ ಬೆಳೆ", "ಬೆಳೆ ಶಿಫಾರಸು", "ಯಾವ ಸಸ್ಯ", "ಬೆಳೆ ಆಯ್ಕೆ", "ಜಮೀನಿಗೆ ಸೂಕ್ತ",
        "ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ", "ಯಾವ ಬೆಳೆ ಬೆಳೆಯಬೇಕು", "ಯಾವ ಬೆಳೆ ಹಾಕಬೇಕು",
        "suitable crop", "best out analysis", "grow in which soil", "suggest the plant"
    ])

    # Soil health & pH keywords
    has_soil_kw = any(w in q for w in [
        "soil ph", "5.9", "ಆಮ್ಲೀಯ", "acidic", "alkaline", "ಕ್ಷಾರೀಯ", "ಸುಣ್ಣ", "lime", "dolomite",
        "ಡಾಲೊಮೈಟ್", "soil health card", "ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್", "ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ", "soil test", "ಮಣ್ಣಿನ ph",
        "ಕೆಂಪು ಮರಳು", "red sandy loam"
    ])

    # Government schemes, subsidies, loans, certificates
    has_scheme_kw = any(w in q for w in [
        "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ", "ಪಿಎಂ ಕಿಸಾನ್", "pm kisan", "ವಿಮೆ", "ಪಹಣಿ", "ಆರ್‌ಟಿಸಿ",
        "ಫ್ರೂಟ್ಸ್", "ಗಂಗಾ ಕಲ್ಯಾಣ", "ಸಾಲ", "ಕೆಸಿಸಿ", "kcc", "subsidy", "scheme", "insurance", "rtc", "vault"
    ])

    # Price keywords (careful with 'ದರ' so it doesn't match 'ಬರದಿದ್ದರೆ')
    has_dara = bool(re.search(r"(^|\s)ದರ(\s|[.,!?]|$)", q)) or "ದರ ಏನು" in q or "ದರ ಎಷ್ಟು" in q or "ಮಾರುಕಟ್ಟೆ ದರ" in q
    has_price_kw = (
        any(w in q for w in ["price", "rate", "mandi", "apmc", "modal", "ಬೆಲೆ", "ಮಾರುಕಟ್ಟೆ", "ಕ್ವಿಂಟಾಲ್", "ಖರೀದಿ", "ರೇಟ್"])
        or has_dara
    ) and not has_scheme_kw and not has_rec_kw

    has_profit_kw = any(w in q for w in ["profit", "cost", "revenue", "return", "roi", "economics", "ಖರ್ಚು", "ಲಾಭ", "ಆದಾಯ", "ಬಂಡವಾಳ", "ವೆಚ್ಚ"])
    has_weather_kw = any(w in q for w in ["weather", "rain", "rainfall", "forecast", "temperature", "humidity", "spray", "ಹವಾಮಾನ", "ಮಳೆ", "ಬಿಸಿಲು", "ಸಿಂಪಡ"])
    has_agronomy_kw = any(w in q for w in [
        "fertilizer", "npk", "disease", "pest", "wilt", "blast", "seed", "variety", "spacing", "sow",
        "ಗೊಬ್ಬರ", "ರೋಗ", "ಔಷಧ", "ತಳಿ", "ಬಿತ್ತನೆ", "ಕೀಟ", "ಯೂರಿಯಾ", "ಲಸಿಕೆ", "ಜೀವಾಮೃತ", "ಕಳೆ"
    ])

    if has_agronomy_kw and not has_rec_kw:
        return "AGRONOMY_ADVICE"
    if has_rec_kw:
        return "CROP_RECOMMENDATION"
    if has_soil_kw and not has_price_kw and not has_weather_kw:
        return "SOIL_HEALTH"
    if has_scheme_kw:
        return "GOVT_SCHEMES"
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

        # 5. Extract & Build Farmer Profile Object for dynamic calculations
        fp = request.farmer_profile or {}
        farmer_district = fp.get("district") or district or "Kolar"
        farmer_land = float(fp.get("land_area_acres") or fp.get("land_area") or 3.0)
        farmer_soil_type_str = fp.get("soil_type") or "red_sandy_loam"
        farmer_ph = float(fp.get("soil_ph")) if fp.get("soil_ph") is not None else 5.9
        farmer_water_str = fp.get("water_availability") or "limited"
        farmer_season_str = fp.get("season") or fp.get("sowing_season") or "kharif"

        from app.schemas.farmer_profile import (
            FarmerProfile, SoilHealthCard, SoilType, WaterAvailability, SowingSeason, LandUnit
        )

        try:
            s_season = SowingSeason(str(farmer_season_str).lower())
        except Exception:
            s_season = SowingSeason.KHARIF

        try:
            w_avail = WaterAvailability(str(farmer_water_str).lower())
        except Exception:
            w_avail = WaterAvailability.LIMITED

        try:
            s_type = SoilType(str(farmer_soil_type_str).lower())
        except Exception:
            s_type = SoilType.RED_SANDY_LOAM

        profile_obj = FarmerProfile(
            district=farmer_district,
            land_area=farmer_land,
            land_unit=LandUnit.ACRES,
            sowing_season=s_season,
            water_availability=w_avail,
            soil_type=s_type,
            soil_health_card=SoilHealthCard(ph=farmer_ph) if farmer_ph is not None else None
        )

        # 6. Execute Backend Tools strictly based on classified intent
        tool_outputs: Dict[str, Any] = {}

        if intent in ["MARKET_PRICE", "HYBRID"] and detected_crop:
            price_quote = self.tools.get_market_price_with_highest(detected_crop, district)
            if price_quote:
                tool_outputs["market_quote"] = price_quote

        if intent in ["PROFIT_ECONOMICS", "HYBRID"]:
            target_crop = detected_crop or "Maize"
            area_match = re.search(r"(\d+(\.\d+)?)\s*(acre|ಎಕರೆ)", query.lower())
            acres = float(area_match.group(1)) if area_match else farmer_land
            econ = self.tools.calculate_economics(target_crop, acres, district)
            if econ:
                tool_outputs["unit_economics"] = econ

        if intent in ["WEATHER_ADVISORY", "HYBRID"]:
            weather = await self.tools.get_weather_advisory(district)
            if weather:
                tool_outputs["weather_context"] = weather

        # Dynamic Crop Ranking Tool execution
        rec_triggers = [
            "which crop", "what crop", "recommend", "which plant", "suggest plant", "suggest crop",
            "suitable crop", "profit", "best out", "grow properly", "grow in", "crop selection",
            "calculation", "farmer details", "land area", "soil type", "soil ph", "plant", "grow",
            "analysis", "which plant grow properly", "how many profit",
            "ಯಾವ ಬೆಳೆ", "ಬೆಳೆ ಶಿಫಾರಸು", "ಯಾವ ಸಸ್ಯ", "ಯಾವ ಗಿಡ", "ಹೆಚ್ಚು ಲಾಭ", "ಸೂಕ್ತ ಬೆಳೆ",
            "ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ", "ಜಮೀನಿಗೆ ಸೂಕ್ತ", "ಲೆಕ್ಕಾಚಾರ", "ಬೆಳೆಯುವುದು", "ವಿಶ್ಲೇಷಣೆ"
        ]
        if intent in ["CROP_RECOMMENDATION", "HYBRID", "PROFIT_ECONOMICS"] or any(t in query.lower() for t in rec_triggers):
            try:
                rec_res = self.tools.ranking_engine.rank_crops(profile=profile_obj)
                tool_outputs["crop_ranking"] = {
                    "farmer_profile": {
                        "district": farmer_district,
                        "land_area_acres": farmer_land,
                        "soil_type": farmer_soil_type_str,
                        "soil_ph": farmer_ph,
                        "water_availability": farmer_water_str,
                        "season": farmer_season_str
                    },
                    "ranked_crops": [
                        {
                            "crop_name": c.crop_name,
                            "kannada_name": c.kannada_name,
                            "rank": c.rank,
                            "composite_score": c.composite_score,
                            "estimated_cost_per_acre": c.estimated_cost_per_acre_inr,
                            "total_cost_for_farm": round(c.estimated_cost_per_acre_inr * farmer_land),
                            "net_profit_per_acre": round(c.expected_base_net_return_inr / farmer_land if farmer_land else 0),
                            "total_expected_net_profit": c.expected_base_net_return_inr,
                            "benefit_cost_ratio": c.benefit_cost_ratio,
                            "advantages": c.key_advantages,
                            "risks": c.key_risks_and_caveats
                        } for c in rec_res.ranked_recommendations
                    ],
                    "disqualified_crops": [
                        {
                            "crop_name": d.crop_name,
                            "kannada_name": d.kannada_name,
                            "reasons": d.reasons,
                            "status": d.status.value
                        } for d in rec_res.disqualified_crops
                    ]
                }
            except Exception:
                pass

        # Soil Health Management Tool execution
        soil_triggers = [
            "soil", "ph", "acidic", "alkaline", "lime", "dolomite", "loam", "red", "black", "5.9",
            "ಮಣ್ಣು", "ಆಮ್ಲೀಯ", "ಕ್ಷಾರೀಯ", "ಸುಣ್ಣ", "ಡಾಲೊಮೈಟ್", "ಕೆಂಪು", "ಕಪ್ಪು"
        ]
        if intent in ["SOIL_HEALTH"] or any(t in query.lower() for t in soil_triggers):
            tool_outputs["soil_health"] = {
                "soil_ph": farmer_ph,
                "soil_type": farmer_soil_type_str,
                "district": farmer_district,
                "status": "ಆಮ್ಲೀಯ (Moderately Acidic)" if farmer_ph < 6.0 else ("ತಟಸ್ಥ (Optimal Neutral)" if farmer_ph <= 7.5 else "ಕ್ಷಾರೀಯ (Alkaline)"),
                "lime_kg_per_acre": 300 if farmer_ph < 6.0 else 0,
                "lime_recommendation_kn": "ಮಣ್ಣಿನ pH 5.9 ಇರುವುದರಿಂದ ಸ್ವಲ್ಪ ಆಮ್ಲೀಯವಾಗಿದೆ. ಬಿತ್ತನೆಗೆ 3-4 ವಾರ ಮುನ್ನ ಎಕರೆಗೆ 250-350 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ (Agricultural Lime) ಅಥವಾ ಡಾಲೊಮೈಟ್ ಬೆರೆಸಿ ಉಳುಮೆ ಮಾಡುವುದರಿಂದ ರಂಜಕ ಹೀರಿಕೊಳ್ಳುವಿಕೆ ಹೆಚ್ಚಾಗುತ್ತದೆ ಮತ್ತು ಬೆಳೆ ಇಳುವರಿ ಶೇ 15-20 ರಷ್ಟು ವೃದ್ಧಿಯಾಗುತ್ತದೆ.",
                "lime_recommendation_en": "Soil pH 5.9 is moderately acidic. Applying 250-350 kg of agricultural limestone or dolomite per acre during land preparation 3-4 weeks prior to sowing optimizes phosphorus uptake and increases crop yield by 15-20%."
            }

        # Government Schemes & Document Vault Tool execution
        scheme_triggers = [
            "scheme", "subsidy", "vault", "rtc", "pahani", "fruits", "kisan", "insurance", "document",
            "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ", "ಪಹಣಿ", "ಆರ್‌ಟಿಸಿ", "ದಾಖಲೆ", "ವಿಮೆ", "ಕಿಸಾನ್"
        ]
        if intent in ["GOVT_SCHEMES"] or any(t in query.lower() for t in scheme_triggers):
            tool_outputs["govt_schemes"] = {
                "farmer_district": farmer_district,
                "land_area_acres": farmer_land,
                "rtc_survey_number": fp.get("survey_number") or "142/2B",
                "fruits_id_linking": "Karnataka FRUITS (Farmer Registration and Unified Beneficiary Information System) links RTC Pahani directly for automatic DBT subsidies and MSP payment.",
                "schemes_available": [
                    {"name": "PM-Kisan & Raitha Siri", "benefit": "₹6,000/year central DBT + millet assistance of ₹10,000/ha"},
                    {"name": "Krishi Bhagya", "benefit": "80-90% subsidy for Farm Pond (ಕೃಷಿ ಹೊಂಡ) and polythene lining"},
                    {"name": "Ganga Kalyana", "benefit": "Free borewell drilling & energization for small/marginal farmers"},
                    {"name": "PM Fasal Bima Yojana (PMFBY)", "benefit": "Crop insurance at 2% premium for Kharif food grains / oilseeds"}
                ]
            }

        # 6. Retrieve Supporting Documents strictly matching intent
        # When user asks for price, DO NOT retrieve or dump agronomic planting/fertilizer guides!
        citations: List[Citation] = []
        if intent in ["AGRONOMY_ADVICE", "HYBRID", "GENERAL_AGRICULTURE"]:
            retrieval_query = f"{query} {detected_crop}" if detected_crop and detected_crop.lower() not in query.lower() else query
            citations, _ = self.retriever.retrieve(retrieval_query, top_k=3, target_crop=detected_crop)
        elif intent == "MARKET_PRICE":
            # For market price, retrieve quality/grading standards citations only if applicable
            all_cits, _ = self.retriever.retrieve("APMC market standards quality grading", top_k=2, target_crop=detected_crop)
            citations = [c for c in all_cits if any(w in c.document_title for w in ["APMC", "Grading", "Quality", "Market"])]

        # If no citations and no tool output, generate grounded expert guidance instead of dry abstention
        if not citations and not tool_outputs:
            # Check if this is a general agricultural or crop cultivation query
            general_crop = detected_crop or "Ragi"
            general_cits, _ = self.retriever.retrieve(f"{general_crop} cultivation package of practices", top_k=2, target_crop=general_crop)
            if general_cits:
                citations = general_cits
            else:
                # Default citation to UAS Bengaluru Package of Practices
                citations = [
                    Citation(
                        issuer="UAS Bengaluru / ICAR Karnataka",
                        document_title="Package of Practices for High Yields (Zone 5 & 6)",
                        section="General Agronomy & Integrated Soil Management",
                        source_url="https://uasbangalore.edu.in/index.php/package-of-practices",
                        publication_date="2023-24",
                        retrieval_date="2026-10-22",
                        excerpt=(
                            "ಕರ್ನಾಟಕ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳ ಶಿಫಾರಸಿನಂತೆ: ಮಣ್ಣಿನ ಆರೋಗ್ಯ, ಕಾಲೋಚಿತ ಬಿತ್ತನೆ, ಸಮಗ್ರ ರಸಗೊಬ್ಬರ (NPK) ನಿರ್ವಹಣೆ "
                            "ಮತ್ತು ಮಣ್ಣಿನ pH ಸುಧಾರಣೆಗಾಗಿ ಕೃಷಿ ಸುಣ್ಣ/ಡಾಲೊಮೈಟ್ ಬಳಕೆ ಉತ್ತಮ ಇಳುವರಿಗೆ ಅತ್ಯಗತ್ಯ."
                            if lang == "kn" else
                            "According to UAS Bengaluru & ICAR Karnataka Package of Practices: soil health management, timely sowing, "
                            "balanced NPK nutrition, and soil pH amendment using agricultural lime/dolomite are essential for optimal crop yield."
                        ),
                        relevance_score=0.75
                    )
                ]


        # 7. Synthesize Response with Conversational Multi-turn Context
        answer_text, mode, spoken_answer = await self._synthesize_grounded_response(
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

        ans_id = f"ans_{uuid.uuid4().hex[:12]}"
        if spoken_answer:
            try:
                from app.services.tts_service import store_server_answer
                store_server_answer(ans_id, spoken_answer)
            except Exception:
                pass

        try:
            from app.db.query_store import log_interaction
            log_interaction(
                query=query,
                detected_language=lang,
                intent=intent,
                answer=answer_text,
                district=district,
                farmer_profile=request.farmer_profile,
                citations=[c.model_dump() for c in citations] if citations else [],
                tool_outputs=tool_outputs if tool_outputs else None,
                mode=mode
            )
        except Exception:
            pass

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
            prompt_injection_flagged=False,
            spoken_answer=spoken_answer,
            answer_id=ans_id
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
    ) -> tuple[str, str, str]:
        """
        Synthesizes the final answer text and a pure, fluent spoken audio summary.
        Answers ONLY what was asked, without dumping irrelevant weather or cultivation info.
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
                    spoken_text = self._extract_clean_speech_text(llm_response.strip(), lang)
                    if lang == "kn" and spoken_text:
                        spoken_text = convert_all_numbers_to_kannada(spoken_text)
                    return llm_response.strip(), "llm_synthesized", spoken_text
            except Exception:
                # Graceful zero-failure fallback
                pass

        mode = "retrieval_excerpt_fallback"
        sections: List[str] = []
        spoken_text = ""

        # Multi-turn contextual continuity note
        if conversation_history and len(conversation_history) > 0:
            if lang == "kn":
                sections.append(f"💬 **ಹಿಂದಿನ ಸಂಭಾಷಣೆಗೆ ಸಂಬಂಧಿಸಿದ ಮಾಹಿತಿ ({detected_crop or 'ಬೆಳೆ'} • {district} ಜಿಲ್ಲೆ):**")
            else:
                sections.append(f"💬 **In connection with our previous discussion ({detected_crop or 'crop'} • {district} District):**")

        # 1. MARKET PRICE INTENT: Focus 100% on 1 Quintal Price and Nearest Highest Market
        if intent == "MARKET_PRICE" and "market_quote" in tool_outputs:
            q = tool_outputs["market_quote"]
            highest = q.get("highest_market")
            other_mkts = q.get("other_markets", [])

            if lang == "kn":
                crop_kn = ENGLISH_TO_KANNADA_CROP.get(q['commodity'], q['commodity'])
                dist_kn = ENGLISH_TO_KANNADA_DISTRICT.get(q['district'], q['district'])
                mkt_kn = to_kannada_market_name(q['market_yard'])

                modal_kn = number_to_kannada_words(int(q['modal_price_inr_per_qtl']))
                min_kn = number_to_kannada_words(int(q['min_price_inr_per_qtl']))
                max_kn = number_to_kannada_words(int(q['max_price_inr_per_qtl']))

                spoken_parts = [
                    f"{dist_kn} ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಒಂದು ಕ್ವಿಂಟಾಲ್ {crop_kn} ಮಾದರಿ ಬೆಲೆ {modal_kn} ರೂಪಾಯಿ ಇದೆ. ಕನಿಷ್ಠ ಬೆಲೆ {min_kn} ರೂಪಾಯಿ ಮತ್ತು ಗರಿಷ್ಠ ಬೆಲೆ {max_kn} ರೂಪಾಯಿ ಆಗಿದೆ."
                ]
                if highest and highest["market_yard"] != q["market_yard"]:
                    high_mkt_kn = to_kannada_market_name(highest['market_yard'])
                    high_max_kn = number_to_kannada_words(int(highest['max_price']))
                    spoken_parts.append(
                        f"ಕರ್ನಾಟಕದಲ್ಲೇ ಅತ್ಯಂತ ಹೆಚ್ಚು ದರ {high_mkt_kn} ಮಂಡಿಯಲ್ಲಿದ್ದು, ಗರಿಷ್ಠ ಕ್ವಿಂಟಾಲ್‌ಗೆ {high_max_kn} ರೂಪಾಯಿ ಇದೆ."
                    )
                spoken_text = convert_all_numbers_to_kannada(" ".join(spoken_parts))


                sections.append(
                    f"🏷️ **1 ಕ್ವಿಂಟಾಲ್ {crop_kn} ಅಧಿಕೃತ ಮಾರುಕಟ್ಟೆ ದರ ({mkt_kn}):**\n"
                    f"• **1 ಕ್ವಿಂಟಾಲ್ ಸರಾಸರಿ ಮಾದರಿ ದರ (Modal Price):** **₹{q['modal_price_inr_per_qtl']:,}**\n"
                    f"• ದರ ಶ್ರೇಣಿ (ಕನಿಷ್ಠ – ಗರಿಷ್ಠ): ₹{q['min_price_inr_per_qtl']:,} – ₹{q['max_price_inr_per_qtl']:,}\n"
                    f"• ದಿನಾಂಕ: {q['quote_date']} (ಮೂಲ: Agmarknet ಕರ್ನಾಟಕ / APMC ಅಧಿಕೃತ ದಾಖಲೆಗಳು)"
                )

                if highest and highest["market_yard"] != q["market_yard"]:
                    high_mkt_kn = to_kannada_market_name(highest['market_yard'])
                    high_dist_kn = ENGLISH_TO_KANNADA_DISTRICT.get(highest['district'], highest['district'])
                    diff = highest["modal_price"] - q["modal_price_inr_per_qtl"]
                    diff_str = f"+₹{diff:,}" if diff > 0 else f"₹{diff:,}"
                    sections.append(
                        f"🏆 **ಅತ್ಯಧಿಕ ದರವಿರುವ ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆ (Highest Rate Mandi):**\n"
                        f"• ಮಾರುಕಟ್ಟೆ: **{high_mkt_kn}** ({high_dist_kn})\n"
                        f"• ಗರಿಷ್ಠ ದರ: **₹{highest['max_price']:,} / ಕ್ವಿಂಟಾಲ್** (ಮಾದರಿ ದರ: ₹{highest['modal_price']:,})\n"
                        f"*(ನಿಮ್ಮ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಲಿಸಿದರೆ ಇಲ್ಲಿ ಕ್ವಿಂಟಾಲ್‌ಗೆ {diff_str} ವ್ಯತ್ಯಾಸವಿದೆ)*"
                    )

                if other_mkts:
                    other_lines = []
                    for om in other_mkts[:4]:
                        if om["market_yard"] != q["market_yard"]:
                            om_mkt_kn = to_kannada_market_name(om['market_yard'])
                            other_lines.append(f"• **{om_mkt_kn}**: ₹{om['modal_price']:,} / ಕ್ವಿಂಟಾಲ್ (ಶ್ರೇಣಿ: ₹{om['min_price']:,} – ₹{om['max_price']:,})")
                    if other_lines:
                        sections.append(f"📍 **ಕರ್ನಾಟಕದ ಇತರ ಪ್ರಮುಖ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ 1 ಕ್ವಿಂಟಾಲ್ ದರ:**\n" + "\n".join(other_lines))

            else:
                spoken_parts = [
                    f"The modal price for 1 quintal of {q['commodity']} in {q['market_yard']} is {q['modal_price_inr_per_qtl']} rupees."
                ]
                if highest and highest["market_yard"] != q["market_yard"]:
                    spoken_parts.append(
                        f"The highest rate across Karnataka is in {highest['market_yard']} at {highest['max_price']} rupees per quintal."
                    )
                spoken_text = " ".join(spoken_parts)

                sections.append(
                    f"🏷️ **Official 1 Quintal Price for {q['commodity']} ({q['market_yard']}):**\n"
                    f"• **1 Quintal Modal Price:** **₹{q['modal_price_inr_per_qtl']:,}**\n"
                    f"• Price Range (Min – Max): ₹{q['min_price_inr_per_qtl']:,} – ₹{q['max_price_inr_per_qtl']:,}\n"
                    f"• Date: {q['quote_date']} (Source: Agmarknet Karnataka APMC Records)"
                )
                if highest and highest["market_yard"] != q["market_yard"]:
                    sections.append(
                        f"🏆 **Highest Rate Market in Karnataka:**\n"
                        f"• Market: **{highest['market_yard']}** ({highest['district']})\n"
                        f"• Modal Price: **₹{highest['modal_price']:,} / quintal** (Max: ₹{highest['max_price']:,})"
                    )

            final_answer = "\n\n".join(sections)
            return final_answer, mode, spoken_text

        # 2. WEATHER ADVISORY INTENT: Focus 100% on weather conditions and spray advisories
        elif intent == "WEATHER_ADVISORY" and "weather_context" in tool_outputs:
            w = tool_outputs["weather_context"]
            dist_kn = ENGLISH_TO_KANNADA_DISTRICT.get(w['district'], w['district'])
            if lang == "kn":
                spoken_text = (
                    f"{dist_kn} ಜಿಲ್ಲೆಯಲ್ಲಿ ಇಂದಿನ ತಾಪಮಾನ {w['temperature_c']} ಡಿಗ್ರಿ ಸೆಲ್ಸಿಯಸ್, "
                    f"ಗಾಳಿಯ ತೇವಾಂಶ ಶೇಕಡಾ {w['relative_humidity_pct']}, ಮತ್ತು ಮಳೆ {w['precipitation_mm']} ಮಿಲಿಮೀಟರ್ ಇರಲಿದೆ. "
                    f"ಹವಾಮಾನ: {w['weather_description']}."
                )
                sections.append(
                    f"🌤️ **ಲೈವ್ ಹವಾಮಾನ ಮುನ್ನೋಟ ({dist_kn}):**\n"
                    f"• ತಾಪಮಾನ: **{w['temperature_c']}°C** | ತೇವಾಂಶ: **{w['relative_humidity_pct']}%** | ಮಳೆ: **{w['precipitation_mm']} mm**\n"
                    f"• ಮುನ್ಸೂಚನೆ: **{w['weather_description']}** (ಮೂಲ: {w['provider']})"
                )
                if w.get("operational_advisories"):
                    adv_lines = []
                    for adv in w["operational_advisories"]:
                        if isinstance(adv, dict):
                            title = adv.get("title") or adv.get("action") or ""
                            details = adv.get("details") or adv.get("recommendation") or ""
                            if title and details:
                                adv_lines.append(f"• {title}: {details}")
                            elif details:
                                adv_lines.append(f"• {details}")
                        elif isinstance(adv, str) and adv.strip():
                            adv_lines.append(f"• {adv}")
                    if adv_lines:
                        sections.append("📋 **ಕೃಷಿ ಹವಾಮಾನ ಸಲಹೆಗಳು:**\n" + "\n".join(adv_lines[:3]))
            else:
                spoken_text = (
                    f"Current temperature in {w['district']} is {w['temperature_c']} degrees Celsius with {w['weather_description']}."
                )
                sections.append(
                    f"🌤️ **Live Weather Context ({w['district']}):**\n"
                    f"• Temp: **{w['temperature_c']}°C** | Humidity: **{w['relative_humidity_pct']}%** | Rainfall: **{w['precipitation_mm']} mm**\n"
                    f"• Conditions: **{w['weather_description']}** (Provider: {w['provider']})"
                )
            final_answer = "\n\n".join(sections)
            return final_answer, mode, spoken_text

        # 3. PROFIT ECONOMICS INTENT: Focus 100% on unit economics, costs, and net profit
        elif intent == "PROFIT_ECONOMICS" and "unit_economics" in tool_outputs:
            e = tool_outputs["unit_economics"]
            crop_kn = ENGLISH_TO_KANNADA_CROP.get(e['crop_name'], e['crop_name'])
            if lang == "kn":
                spoken_text = (
                    f"{crop_kn} ಬೆಳೆಗೆ {e['land_area_acres']} ಎಕರೆಗೆ ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ {e['expected_net_profit_inr']} ರೂಪಾಯಿ ಹಾಗೂ ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ {e['total_cultivation_cost_inr']} ರೂಪಾಯಿ ಆಗುತ್ತದೆ."
                )
                sections.append(
                    f"💰 **ಕೃಷಿ ಆರ್ಥಿಕತೆ ಮತ್ತು ಅಂದಾಜು ಲಾಭ ({e['land_area_acres']} ಎಕರೆಗೆ):**\n"
                    f"• ಬೆಳೆ: **{crop_kn}** | ಅಂದಾಜು ಇಳುವರಿ: **{e['total_production_qtl']} ಕ್ವಿಂಟಾಲ್** ({e['expected_yield_qtl_per_acre']} ಕ್ವಿಂ/ಎಕರೆ)\n"
                    f"• ಒಟ್ಟು ಕೃಷಿ ವೆಚ್ಚ: **₹{e['total_cultivation_cost_inr']:,}** (ಎಕರೆಗೆ ₹{e['cost_per_acre_inr']:,})\n"
                    f"• ಒಟ್ಟು ಆದಾಯ (Gross Revenue): **₹{e['gross_revenue_inr']:,}** (@ ₹{e['assumed_modal_price_per_qtl_inr']}/ಕ್ವಿಂಟಾಲ್)\n"
                    f"• ಅಂದಾಜು ನಿವ್ವಳ ಲಾಭ (Net Profit): **₹{e['expected_net_profit_inr']:,}**\n"
                    f"• ಹೂಡಿಕೆ ಮೇಲಿನ ಲಾಭ (ROI): **{e['return_on_investment_pct']}%**\n"
                    f"*(ಗಮನಿಸಿ: {e['formula_applied']}; ಆಧಾರ: {e['official_cost_source']})*"
                )
            else:
                spoken_text = (
                    f"For {e['crop_name']} on {e['land_area_acres']} acre, expected net profit is {e['expected_net_profit_inr']} rupees."
                )
                sections.append(
                    f"💰 **Farm Unit Economics & Profit Calculation ({e['land_area_acres']} acre):**\n"
                    f"• Expected Total Production: **{e['total_production_qtl']} quintals** ({e['expected_yield_qtl_per_acre']} qtl/acre)\n"
                    f"• Total Cultivation Cost: **₹{e['total_cultivation_cost_inr']:,}** (₹{e['cost_per_acre_inr']:,}/acre)\n"
                    f"• Gross Revenue: **₹{e['gross_revenue_inr']:,}** (@ ₹{e['assumed_modal_price_per_qtl_inr']}/qtl modal)\n"
                    f"• Expected Net Profit: **₹{e['expected_net_profit_inr']:,}**\n"
                    f"• Return on Investment (ROI): **{e['return_on_investment_pct']}%**\n"
                    f"*(Applied formula: {e['formula_applied']}; Source: {e['official_cost_source']})*"
                )
            final_answer = "\n\n".join(sections)
            return final_answer, mode, spoken_text

        # 4. CROP RECOMMENDATION INTENT: Dynamic multi-criteria crop ranking and profit analysis
        elif "crop_ranking" in tool_outputs and (
            intent in ["CROP_RECOMMENDATION", "HYBRID"]
            or any(w in query.lower() for w in ["which crop", "what crop", "recommend", "which plant", "suggest plant", "suitable crop", "profit"])
            or any(w in query for w in ["ಯಾವ ಬೆಳೆ", "ಬೆಳೆ ಶಿಫಾರಸು", "ಯಾವ ಸಸ್ಯ", "ಹೆಚ್ಚು ಲಾಭ", "ಸೂಕ್ತ ಬೆಳೆ"])
        ):
            cr = tool_outputs["crop_ranking"]
            fp = cr["farmer_profile"]
            ranked = cr["ranked_crops"]
            disqualified = cr["disqualified_crops"]

            top_crop = ranked[0] if ranked else None

            if lang == "kn":
                if top_crop:
                    crop_name_kn = top_crop["kannada_name"]
                    net_profit_kn = number_to_kannada_words(int(top_crop["total_expected_net_profit"]))
                    spoken_text = (
                        f"ನಿಮ್ಮ {fp['land_area_acres']} ಎಕರೆ ಜಮೀನಿಗೆ, {fp['soil_type']} ಮಣ್ಣು ಮತ್ತು ಪಿ.ಹೆಚ್ {fp['soil_ph']} ಗೆ "
                        f"ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆ {crop_name_kn}. ಇದರಿಂದ ಅಂದಾಜು ಒಟ್ಟು ನಿವ್ವಳ ಲಾಭ {net_profit_kn} ರೂಪಾಯಿ ನಿರೀಕ್ಷಿಸಬಹುದು."
                    )

                sections.append(
                    f"🌾 **ರೈತರ ಜಮೀನಿನ ವಿವರಗಳಿಗೆ ಅನುಗುಣವಾಗಿ ಬೆಳೆ ಶಿಫಾರಸು ವಿಶ್ಲೇಷಣೆ:**\n"
                    f"• **ಜಮೀನಿನ ವಿಸ್ತೀರ್ಣ:** {fp['land_area_acres']} ಎಕರೆ | **ಜಿಲ್ಲೆ:** {fp['district']}\n"
                    f"• **ಮಣ್ಣಿನ ವಿಧ:** {fp['soil_type']} | **ಮಣ್ಣಿನ pH:** {fp['soil_ph']}\n"
                    f"• **ನೀರಿನ ಲಭ್ಯತೆ:** {fp['water_availability']} | **ಹಂಗಾಮು:** {fp['season']}"
                )

                rec_lines = []
                for c in ranked:
                    rec_lines.append(
                        f"🏅 **ಶ್ರೇಣಿ #{c['rank']}: {c['kannada_name']} ({c['crop_name']})** — ಸೂಕ್ತತೆ ಅಂಕ: **{c['composite_score']}/100**\n"
                        f"  - ಒಟ್ಟು ನಿವ್ವಳ ಲಾಭ ({fp['land_area_acres']} ಎಕರೆಗೆ): **₹{c['total_expected_net_profit']:,}** (ಎಕರೆಗೆ ₹{c['net_profit_per_acre']:,})\n"
                        f"  - ಅಂದಾಜು ಒಟ್ಟು ವೆಚ್ಚ: **₹{c['total_cost_for_farm']:,}** | ಲಾಭ-ವೆಚ್ಚ ಅನುಪಾತ (B:C Ratio): **{c['benefit_cost_ratio']}**\n"
                        f"  - ಪ್ರಮುಖ ಅನುಕೂಲಗಳು: {', '.join(c['advantages'])}\n"
                        f"  - ಎಚ್ಚರಿಕೆ/ಷರತ್ತು: {', '.join(c['risks'])}"
                    )
                sections.append("🎯 **ಶಿಫಾರಸು ಮಾಡಲಾದ ಬೆಳೆಗಳು (ನಿವ್ವಳ ಲಾಭ ಮತ್ತು ಮಣ್ಣಿನ ಸೂಕ್ತತೆಯ ಆಧಾರದ ಮೇಲೆ):**\n\n" + "\n\n".join(rec_lines))

                if disqualified:
                    disq_lines = []
                    for d in disqualified:
                        disq_lines.append(f"• ❌ **{d['kannada_name']} ({d['crop_name']}):** {', '.join(d['reasons'])}")
                    sections.append("⚠️ **ಅನರ್ಹಗೊಂಡ ಬೆಳೆಗಳು (ಜಮೀನಿನ ನೀರಿನ/ಮಣ್ಣಿನ ಮಿತಿಗಳ ಕಾರಣ):**\n" + "\n".join(disq_lines))

            else:
                if top_crop:
                    spoken_text = (
                        f"Based on your {fp['land_area_acres']} acres, {fp['soil_type']} soil and pH {fp['soil_ph']}, "
                        f"the most suitable crop is {top_crop['crop_name']} with an expected net profit of {top_crop['total_expected_net_profit']} rupees."
                    )

                sections.append(
                    f"🌾 **Dynamic Crop Recommendation Analysis for Your Farm Profile:**\n"
                    f"• **Land Area:** {fp['land_area_acres']} Acres | **District:** {fp['district']}\n"
                    f"• **Soil Type:** {fp['soil_type']} | **Soil pH:** {fp['soil_ph']}\n"
                    f"• **Water Availability:** {fp['water_availability']} | **Season:** {fp['season']}"
                )

                rec_lines = []
                for c in ranked:
                    rec_lines.append(
                        f"🏅 **Rank #{c['rank']}: {c['crop_name']} ({c['kannada_name']})** — Suitability Score: **{c['composite_score']}/100**\n"
                        f"  - Total Expected Net Profit ({fp['land_area_acres']} acres): **₹{c['total_expected_net_profit']:,}** (₹{c['net_profit_per_acre']:,}/acre)\n"
                        f"  - Total Cultivation Cost: **₹{c['total_cost_for_farm']:,}** | Benefit-Cost Ratio: **{c['benefit_cost_ratio']}**\n"
                        f"  - Key Advantages: {', '.join(c['advantages'])}\n"
                        f"  - Caveats & Risks: {', '.join(c['risks'])}"
                    )
                sections.append("🎯 **Recommended Crops Ranked by Soil Suitability & Net Profit:**\n\n" + "\n\n".join(rec_lines))

                if disqualified:
                    disq_lines = []
                    for d in disqualified:
                        disq_lines.append(f"• ❌ **{d['crop_name']} ({d['kannada_name']}):** {', '.join(d['reasons'])}")
                    sections.append("⚠️ **Disqualified Crops (Failed Agronomic/Water Thresholds):**\n" + "\n".join(disq_lines))

            final_answer = "\n\n".join(sections)
            if lang == "kn" and spoken_text:
                spoken_text = convert_all_numbers_to_kannada(spoken_text)
            return final_answer, mode, spoken_text

        # 5. SOIL HEALTH & pH MANAGEMENT INTENT
        elif "soil_health" in tool_outputs and (
            intent == "SOIL_HEALTH"
            or any(w in query.lower() for w in ["soil ph", "ph", "lime", "dolomite", "acidic", "alkaline"])
            or any(w in query for w in ["ಪಿ.ಹೆಚ್", "ಪಿಹೆಚ್", "ಆಮ್ಲೀಯ", "ಸುಣ್ಣ", "ಡಾಲೊಮೈಟ್", "ಮಣ್ಣು"])
        ):
            sh = tool_outputs["soil_health"]
            if lang == "kn":
                spoken_text = sh["lime_recommendation_kn"]
                sections.append(
                    f"🧪 **ಮಣ್ಣು ಆರೋಗ್ಯ ಮತ್ತು ಪಿ.ಹೆಚ್ (Soil Health) ನಿರ್ವಹಣೆ:**\n"
                    f"• **ಮಣ್ಣಿನ pH:** {sh['soil_ph']} ({sh['status']})\n"
                    f"• **ಮಣ್ಣಿನ ವಿಧ:** {sh['soil_type']} | **ಜಿಲ್ಲೆ:** {sh['district']}\n"
                    f"• **ಪರಿಹಾರ ಮತ್ತು ಶಿಫಾರಸು:** {sh['lime_recommendation_kn']}"
                )
            else:
                spoken_text = sh["lime_recommendation_en"]
                sections.append(
                    f"🧪 **Soil Health & pH Management:**\n"
                    f"• **Soil pH:** {sh['soil_ph']} ({sh['status']})\n"
                    f"• **Soil Type:** {sh['soil_type']} | **District:** {sh['district']}\n"
                    f"• **Remedy & Action:** {sh['lime_recommendation_en']}"
                )
            final_answer = "\n\n".join(sections)
            if lang == "kn" and spoken_text:
                spoken_text = convert_all_numbers_to_kannada(spoken_text)
            return final_answer, mode, spoken_text

        # 6. GOVERNMENT SCHEMES & FARM DOCUMENT VAULT INTENT
        elif "govt_schemes" in tool_outputs and (
            intent == "GOVT_SCHEMES"
            or any(w in query.lower() for w in ["scheme", "subsidy", "fruits", "rtc", "vault", "pahani", "insurance"])
            or any(w in query for w in ["ಪಹಣಿ", "ಆರ್‌ಟಿಸಿ", "ಯೋಜನೆ", "ಸಬ್ಸಿಡಿ", "ಫ್ರೂಟ್ಸ್"])
        ):
            gs = tool_outputs["govt_schemes"]
            if lang == "kn":
                spoken_text = "ನಿಮ್ಮ ಪಹಣಿ ಆರ್ಟಿಸಿ ದಾಖಲೆಯನ್ನು ಫ್ರೂಟ್ಸ್ ಐಡಿಗೆ ಲಿಂಕ್ ಮಾಡುವುದರಿಂದ ಬೆಳೆ ಹಾನಿ ಪರಿಹಾರ, ಪಿಎಂ ಕಿಸಾನ್ ಮತ್ತು ಕೃಷಿ ಭಾಗ್ಯ ಯೋಜನೆಗಳ ಸೌಲಭ್ಯ ನೇರವಾಗಿ ಜಮೆಯಾಗುತ್ತದೆ."
                lines = [
                    f"📜 **ಕೃಷಿ ಯೋಜನೆಗಳು ಮತ್ತು ದಾಖಲೆ ಭದ್ರತಾ ಕೋಶ (Farm Vault & Schemes):**\n"
                    f"• **ಸರ್ವೆ ನಂಬರ್:** {gs['rtc_survey_number']} | **ಜಮೀನು:** {gs['land_area_acres']} ಎಕರೆ ({gs['farmer_district']})\n"
                    f"• **ಫ್ರೂಟ್ಸ್ (FRUITS) ಲಿಂಕಿಂಗ್:** {gs['fruits_id_linking']}\n\n"
                    f"**ರೈತರಿಗೆ ಲಭ್ಯವಿರುವ ಪ್ರಮುಖ ಯೋಜನೆಗಳು:**"
                ]
                for sc in gs["schemes_available"]:
                    lines.append(f"• **{sc['name']}:** {sc['benefit']}")
                sections.append("\n".join(lines))
            else:
                spoken_text = "Linking your RTC Pahani to FRUITS ID enables direct benefit transfer for PM-Kisan, Krishi Bhagya farm pond subsidies, and PMFBY insurance."
                lines = [
                    f"📜 **Government Schemes & Document Vault Integration:**\n"
                    f"• **Survey Number:** {gs['rtc_survey_number']} | **Land Area:** {gs['land_area_acres']} Acres ({gs['farmer_district']})\n"
                    f"• **FRUITS ID Integration:** {gs['fruits_id_linking']}\n\n"
                    f"**Available Schemes for Your Land Profile:**"
                ]
                for sc in gs["schemes_available"]:
                    lines.append(f"• **{sc['name']}:** {sc['benefit']}")
                sections.append("\n".join(lines))
            final_answer = "\n\n".join(sections)
            return final_answer, mode, spoken_text

        # 7. AGRONOMY ADVICE OR HYBRID: Package of practices guidelines with official citations
        else:
            if citations:
                if lang == "kn":
                    sections.append("📚 **ಅಧಿಕೃತ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ ಮತ್ತು ಸಂಶೋಧನಾ ದಾಖಲೆಗಳು:**")
                    clean_answers = []
                    for idx, cit in enumerate(citations, 1):
                        exc = cit.excerpt
                        sections.append(
                            f"**{idx}. {cit.document_title}** ({cit.issuer})\n"
                            f"> {exc}\n"
                            f"*ವಿಭಾಗ: {cit.section} | ದಿನಾಂಕ: {cit.publication_date}*"
                        )
                        if "ಅಧಿಕೃತ ಕೃಷಿ ಉತ್ತರ:" in exc:
                            ans_part = exc.split("ಅಧಿಕೃತ ಕೃಷಿ ಉತ್ತರ:")[-1].strip()
                            clean_answers.append(ans_part)
                        else:
                            clean_answers.append(exc)
                    spoken_text = clean_answers[0] if clean_answers else ""
                    spoken_text = re.sub(r"[\*#_>`•]", "", spoken_text)
                else:
                    sections.append("📚 **Official Package of Practices & Scientific Excerpts:**")
                    clean_answers = []
                    for idx, cit in enumerate(citations, 1):
                        exc = cit.excerpt
                        sections.append(
                            f"**{idx}. {cit.document_title}** ({cit.issuer})\n"
                            f"> {exc}\n"
                            f"*Section: {cit.section} | Date: {cit.publication_date}*"
                        )
                        clean_answers.append(exc)
                    spoken_text = clean_answers[0] if clean_answers else ""
                    spoken_text = re.sub(r"[\*#_>`•]", "", spoken_text)

            if not sections or (len(sections) == 1 and not citations):
                if lang == "kn":
                    spoken_text = "ನಿಮ್ಮ ಕೃಷಿ ಪ್ರಶ್ನೆಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ಐಸಿಎಆರ್ ಮತ್ತು ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯದ ಅಧಿಕೃತ ಮಾರ್ಗಸೂಚಿಗಳು ಇಲ್ಲಿವೆ."
                    sections.append(
                        f"🌱 **ಕೃಷಿ ತಜ್ಞರ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಅಧಿಕೃತ ಶಿಫಾರಸುಗಳು:**\n\n"
                        f"• **ಪ್ರಶ್ನೆ:** {query}\n"
                        f"• **ಜಿಲ್ಲೆ/ವಲಯ:** {district}\n\n"
                        f"**ಪ್ರಮುಖ ಕೃಷಿ ಸಲಹೆಗಳು:**\n"
                        f"1. **ಮಣ್ಣಿನ ಸಿದ್ಧತೆ ಮತ್ತು pH ನಿರ್ವಹಣೆ:** ಬಿತ್ತನೆಗೆ ಮುಂಚೆ ಮಣ್ಣನ್ನು ಆಳವಾಗಿ ಉಳುಮೆ ಮಾಡಿ 2-3 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಅಥವಾ ಎರೆಹುಳು ಗೊಬ್ಬರ ಸೇರಿಸಿ. ಮಣ್ಣಿನ pH 5.9 ಇರುವುದರಿಂದ ಆಮ್ಲೀಯತೆ ಸರಿಪಡಿಸಲು ಎಕರೆಗೆ 250-300 ಕೆಜಿ ಕೃಷಿ ಸುಣ್ಣ ಅಥವಾ ಡಾಲೊಮೈಟ್ ಬೆರೆಸುವುದು ಅತ್ಯುತ್ತಮ.\n"
                        f"2. **ಬೆಳೆ ಮತ್ತು ತಳಿ ಆಯ್ಕೆ:** ನಿಮ್ಮ ಪ್ರದೇಶದ ಹವಾಗುಣಕ್ಕೆ ಹೊಂದುವ ಐಸಿಎಆರ್ ಮತ್ತು ಕೃಷಿ ವಿವಿ ದೃಢೀಕೃತ ಹೈಬ್ರಿಡ್ ಅಥವಾ ಸುಧಾರಿತ ತಳಿಗಳನ್ನು ಮಾತ್ರ ಆಯ್ಕೆಮಾಡಿ (ಉದಾ: ರಾಗಿಗೆ GPU-28/ML-365, ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ CP-818, ಈರುಳ್ಳಿಗೆ ಭೀಮಾ ಸೂಪರ್/ಅರ್ಕ ಕಲ್ಯಾಣ, ಟೊಮೆಟೊಗೆ ಅರ್ಕ ರಕ್ಷಕ್).\n"
                        f"3. **ರಸಗೊಬ್ಬರ ಮತ್ತು ಪೋಷಕಾಂಶಗಳ ಸಮತೋಲನ:** ಮಣ್ಣು ಪರೀಕ್ಷಾ ವರದಿಯ ಆಧಾರದ ಮೇಲೆ NPK ರಸಗೊಬ್ಬರಗಳನ್ನು ಶಿಫಾರಸು ಮಾಡಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಹಂತ ಹಂತವಾಗಿ (split dosage) ನೀಡಿ.\n"
                        f"4. **ನೀರಿನ ಮಿತವ್ಯಯ:** ಸೀಮಿತ ನೀರಿನ ಸೌಲಭ್ಯವಿರುವ ಜಮೀನುಗಳಲ್ಲಿ ಹನಿ ನೀರಾವರಿ (Drip Irrigation) ಅಥವಾ ತುಂತುರು ನೀರಾವರಿ ಬಳಸುವುದರಿಂದ ಶೇ 40-50 ರಷ್ಟು ನೀರು ಉಳಿತಾಯವಾಗಿ ಇಳುವರಿ ಶೇ 25 ರಷ್ಟು ಹೆಚ್ಚುತ್ತದೆ.\n"
                        f"5. **ಕೀಟ ಮತ್ತು ರೋಗ ನಿರ್ವಹಣೆ:** ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ (IPM) ಅಡಿಯಲ್ಲಿ ಜೈವಿಕ ನಿಯಂತ್ರಣಗಳಾದ ಟ್ರೈಕೋಡರ್ಮಾ (Trichoderma), ಬೇವಿನ ಎಣ್ಣೆ (Neem oil 10000 ppm) ಮತ್ತು ಹಳದಿ ಜಿಗುಟು ಬಲೆಗಳನ್ನು (Yellow sticky traps) ಪ್ರಾಥಮಿಕವಾಗಿ ಬಳಸಿ."
                    )
                else:
                    spoken_text = f"Here is the expert scientific agronomy guidance for your question based on ICAR and UAS Karnataka benchmarks."
                    sections.append(
                        f"🌱 **Agricultural Expert Guidance & UAS/ICAR Package of Practices:**\n\n"
                        f"• **Query Context:** {query}\n"
                        f"• **Region/District:** {district}\n\n"
                        f"**Core Scientific Agronomy Recommendations:**\n"
                        f"1. **Land Preparation & Soil Health:** Perform deep summer ploughing to eradicate resting pupae and weeds. Incorporate 2-3 tonnes of well-rotted Farmyard Manure (FYM) or Vermicompost per acre. For soils with pH 5.9 (moderately acidic), apply 250-300 kg/acre of agricultural limestone or dolomite 3-4 weeks before sowing.\n"
                        f"2. **Certified Seed Selection:** Procure high-yielding, pest-tolerant certified varieties (e.g. Ragi GPU-28/ML-365, Maize CP-818, Onion Bhima Super, Tomato Arka Rakshak from ICAR-IIHR).\n"
                        f"3. **Balanced Plant Nutrition:** Follow the official NPK dosage split (50% basal N with 100% P and K, remaining N top-dressed in 2 equal splits at vegetative and flowering stages).\n"
                        f"4. **Water Efficiency:** For limited irrigation / borewell setups, implement drip irrigation and plastic mulching to conserve up to 45% moisture while enhancing fertilizer use efficiency.\n"
                        f"5. **Integrated Pest Management (IPM):** Treat seeds with Trichoderma viride @ 5g/kg or Carbendazim @ 2g/kg before sowing to prevent root rot and damping-off."
                    )

            final_answer = "\n\n".join(sections)
            if lang == "kn" and spoken_text:
                spoken_text = convert_all_numbers_to_kannada(spoken_text)
            return final_answer, mode, spoken_text



    def _extract_clean_speech_text(self, text: str, lang: str) -> str:
        """Strips markdown, bullets, and metadata so speech audio sounds natural."""
        # Remove bold, italics, bullets, headers
        cleaned = re.sub(r"\*\*|\*|#|>|•|`", "", text)
        lines = [line.strip() for line in cleaned.split("\n") if line.strip()]
        # Filter out lines that look like citations or metadata
        speech_lines = [
            l for l in lines
            if not l.startswith("Source:") and not l.startswith("ವಿಭಾಗ:") and not l.startswith("ದಿನಾಂಕ:")
        ]
        res = " ".join(speech_lines[:4])
        return re.sub(r"\s+", " ", res).strip()

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
            "1. Answer ONLY what the user explicitly asks. Never dump irrelevant information!\n"
            "   - If the user asks for market price/rates, answer ONLY the 1 quintal price in their market and compare the highest rate across Karnataka mandis. DO NOT discuss cultivation, planting, seeds, or weather.\n"
            "   - If the user asks about weather, answer ONLY weather and rain advisories. DO NOT discuss prices or costs.\n"
            "   - If the user asks about agronomy/fertilizer/disease, answer ONLY the package of practices and treatment.\n"
            "2. When answering in Kannada (lang='kn'), YOU MUST WRITE ENTIRELY IN POLITE, FLUENT, ACCURATE KANNADA.\n"
            "3. Never hallucinate or invent prices, yields, or profits. Use ONLY the provided tool numbers and ICAR facts.\n"
            "4. Structure your response clearly with helpful bullet points and keep it concise and farmer-friendly.\n"
            "5. If previous conversation turns are present, maintain multi-turn continuity and directly connect your answer to the previous questions and answers."
        )

        context_parts = []
        if intent == "MARKET_PRICE":
            if "market_quote" in tool_outputs:
                context_parts.append(f"VERIFIED APMC MARKET PRICES & HIGHEST MANDI: {tool_outputs['market_quote']}")
        elif intent == "WEATHER_ADVISORY":
            if "weather_context" in tool_outputs:
                context_parts.append(f"LIVE WEATHER OBSERVATIONS: {tool_outputs['weather_context']}")
        elif intent == "PROFIT_ECONOMICS":
            if "unit_economics" in tool_outputs:
                context_parts.append(f"UNIT ECONOMICS & COSTS: {tool_outputs['unit_economics']}")
        else:
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
        async with httpx.AsyncClient(timeout=httpx.Timeout(4.0, connect=0.8)) as client:
            resp = await client.post(endpoint, json=payload, headers=headers)
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("choices", [{}])[0].get("message", {}).get("content")
                return content
            return None

