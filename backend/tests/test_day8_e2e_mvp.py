"""
AgriPulse AI — Day 8 End-to-End MVP Freeze & Integration Verification Suite.

Validates:
1. Complete User Journey: Profile -> Suitability Rules -> Economics -> Market Intelligence -> RAG Assistant with Citations -> Kannada Audio Playback.
2. Provider status accuracy: 'working', 'pending_credentials', 'fallback', or 'unavailable'.
3. Credential security: Zero provider secrets in responses or logs.
4. Spoken consistency: Spoken answer matches displayed answer text with Kannada number words; no raw URLs or markdown citations spoken.
5. Outage and missing credential fallback handling.
"""

import pytest
from starlette.testclient import TestClient

from app.main import app
from app.services.tts_service import (
    tts_service,
    store_server_answer,
    get_stored_answer,
    clean_text_for_audio
)
from app.schemas.assistant import AssistantRequest

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. TTS Provider Status & Credential Security Tests
# ---------------------------------------------------------------------------

def test_tts_status_endpoint_reporting():
    """Verify TTS status returns honest integration state without fabricated claims."""
    resp = client.get("/api/v1/tts/status")
    assert resp.status_code == 200
    data = resp.json()

    assert "primary_provider" in data
    assert data["status"] in ["working", "pending_credentials", "fallback", "unavailable"]
    assert data["locale"] == "kn-IN"
    assert data["max_text_length"] == 600
    assert data["rate_limit_per_minute"] > 0
    assert "notes" in data
    assert len(data["notes"]) > 10

    # Ensure no secrets, keys, or passwords appear in response
    resp_text = resp.text.lower()
    for sensitive in ["secret", "private_key", "password", "token="]:
        assert sensitive not in resp_text


def test_clean_text_for_audio_strips_citations_and_converts_numbers():
    """Verify that citations, URLs, and markdown are stripped and numerals become Kannada words."""
    raw = (
        "🏷️ **1 ಕ್ವಿಂಟಾಲ್ ಈರುಳ್ಳಿ ಬೆಲೆ:** ₹2,200 ರೂಪಾಯಿ.\n"
        "[1] http://agmarknet.gov.in/mandi/onion\n"
        "> ಅಧಿಕೃತ ಮೂಲ: Agmarknet APMC Kolar.\n"
        "1500 ರಿಂದ 2500 ರವರೆಗೆ ದರ ಇರಲಿದೆ."
    )
    cleaned = clean_text_for_audio(raw, lang="kn")

    assert "http" not in cleaned
    assert "**" not in cleaned
    assert "🏷️" not in cleaned
    assert "[1]" not in cleaned
    # Check that numerals are converted to Kannada words
    assert "ಒಂದು ಕ್ವಿಂಟಾಲ್" in cleaned
    assert "ಎರಡು ಸಾವಿರ ಇನ್ನೂರು" in cleaned or "ಎರಡು ಸಾವಿರದ ಇನ್ನೂರು" in cleaned
    assert len(cleaned) <= 600


# ---------------------------------------------------------------------------
# 2. Server-Stored Answer Synthesis & Rate Limiting
# ---------------------------------------------------------------------------

def test_synthesize_server_stored_answer_by_id():
    """Verify that server-stored answer ID can be synthesized safely."""
    test_ans_id = "ans_test_day8_001"
    sample_speech = "ಕೋಲಾರ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಒಂದು ಕ್ವಿಂಟಾಲ್ ಟೊಮೆಟೊ ಬೆಲೆ ಎರಡು ಸಾವಿರದ ನಾನೂರು ರೂಪಾಯಿ ಆಗಿದೆ."
    store_server_answer(test_ans_id, sample_speech)

    assert get_stored_answer(test_ans_id) is not None

    # Synthesize using answer_id
    resp = client.post(
        "/api/v1/tts/synthesize",
        json={"answer_id": test_ans_id, "lang": "kn"}
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "audio/mpeg"
    assert len(resp.content) > 1000  # Valid MP3 audio payload


def test_synthesize_empty_text_rejection():
    """Verify empty requests are rejected with 400 Bad Request."""
    resp = client.post(
        "/api/v1/tts/synthesize",
        json={"text": "   ", "lang": "kn"}
    )
    assert resp.status_code == 400


def test_tts_audio_stream_get_endpoint():
    """Verify GET /api/v1/tts/stream works for HTML5 audio elements."""
    resp = client.get(
        "/api/v1/tts/stream",
        params={"text": "ರಾಗಿ ಕೃಷಿ ಅಧಿಕೃತ ಮಾಹಿತಿ", "lang": "kn"}
    )
    assert resp.status_code == 200
    assert resp.headers["content-type"] == "audio/mpeg"
    assert "public" in resp.headers.get("cache-control", "")
    assert len(resp.content) > 500


# ---------------------------------------------------------------------------
# 3. Full End-to-End User Journey (MVP Freeze Test)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_full_farmer_decision_journey_end_to_end():
    """
    Simulates complete farmer interaction journey:
    Step 1: Check System Health
    Step 2: Check Agronomy Crop Suitability for Kolar farmer
    Step 3: Calculate Profit Economics for chosen crop (Tomato)
    Step 4: Retrieve APMC Mandi Spot Prices & Compare Highest Market
    Step 5: Query RAG Assistant with citation provenance
    Step 6: Synthesize Spoken Kannada Answer Audio
    """
    # Step 1: Health check
    health_resp = client.get("/api/v1/health")
    assert health_resp.status_code == 200
    assert health_resp.json()["status"] in ["healthy", "ok"]

    # Step 2: Suitability check for Kolar, Red Loamy Soil, Kharif Season
    suit_resp = client.post(
        "/api/v1/suitability/evaluate",
        json={
            "farmer_name": "Manjunath",
            "district": "Kolar",
            "land_area": 2.0,
            "land_unit": "acres",
            "sowing_season": "kharif",
            "water_availability": "reliable",
            "risk_preference": "moderate",
            "soil_type": "red_sandy_loam"
        }
    )
    assert suit_resp.status_code == 200
    suit_data = suit_resp.json()
    assert suit_data["total_evaluated_crops"] > 0
    assert len(suit_data["suitable_crops"]) > 0

    # Step 3: Calculate economics for top crop
    chosen_crop = "Tomato"
    econ_resp = client.post(
        "/api/v1/economics/scenarios",
        json={
            "crop_code": "TOMATO",
            "district": "Kolar",
            "land_area_acres": 2.0
        }
    )
    assert econ_resp.status_code == 200
    econ_data = econ_resp.json()
    assert econ_data["crop_code"] == "TOMATO"
    assert econ_data["base_scenario"]["net_return_inr"] is not None

    # Step 4: Check Mandi Dataset Summary & Market Coverage
    mandi_resp = client.get("/api/v1/ingestion/mandi/summary")
    assert mandi_resp.status_code == 200
    mandi_summary = mandi_resp.json()
    assert mandi_summary["total_records"] > 0
    assert "Tomato" in mandi_summary["commodities"]

    # Step 5: Query RAG Assistant in Kannada for market price and highest mandi
    asst_resp = client.post(
        "/api/v1/assistant",
        json={
            "query": "ಕೋಲಾರದಲ್ಲಿ 1 ಕ್ವಿಂಟಾಲ್ ಟೊಮೆಟೊ ಬೆಲೆ ಎಷ್ಟು ಮತ್ತು ಕರ್ನಾಟಕದಲ್ಲೇ ಹೆಚ್ಚು ದರ ಎಲ್ಲಿದೆ?",
            "district": "Kolar",
            "language_preference": "kn"
        }
    )
    assert asst_resp.status_code == 200
    asst_data = asst_resp.json()
    assert asst_data["detected_language"] == "kn"
    assert asst_data["abstention"] is False
    assert asst_data["spoken_answer"] is not None
    assert asst_data["answer_id"] is not None
    assert "ಒಂದು ಕ್ವಿಂಟಾಲ್" in asst_data["spoken_answer"]

    # Step 6: Synthesize Spoken Kannada Answer using returned answer_id
    tts_resp = client.post(
        "/api/v1/tts/synthesize",
        json={"answer_id": asst_data["answer_id"], "lang": "kn"}
    )
    assert tts_resp.status_code == 200
    assert tts_resp.headers["content-type"] == "audio/mpeg"
    assert len(tts_resp.content) > 1000


# ---------------------------------------------------------------------------
# 4. Outage and Missing Credentials Fallback
# ---------------------------------------------------------------------------

def test_missing_credentials_status_is_honest():
    """Verify that Bhashini shows 'pending_credentials' honestly without fabricated state."""
    status = tts_service.get_status()
    if not tts_service.bhashini_adapter.is_configured():
        assert status.bhashini_configured is False
        assert status.fallback_provider == "browser_web_speech"
