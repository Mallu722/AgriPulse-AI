"""
AgriPulse AI — Day 8 Text-to-Speech (TTS) API Router.

Endpoints:
- GET  /api/v1/tts/status     : Integrations and credential status (Google, Bhashini, fallback).
- POST /api/v1/tts/synthesize : Synthesizes Kannada/Indic audio from server-stored answer ID or validated text.
- GET  /api/v1/tts/stream     : Direct audio streaming for HTML5 <audio> elements with cache headers.
"""

from fastapi import APIRouter, HTTPException, Query, Response
from typing import Optional

from app.services.tts_service import (
    tts_service,
    TTSStatusResponse,
    TTSSynthesizeRequest,
)

router = APIRouter(prefix="/tts")


@router.get(
    "/status",
    response_model=TTSStatusResponse,
    summary="Check TTS Provider Status & Capabilities",
    description="Returns accurate provider readiness, rate limits, and fallback availability for audit."
)
def get_tts_status() -> TTSStatusResponse:
    return tts_service.get_status()


@router.post(
    "/synthesize",
    summary="Synthesize speech audio from validated text or answer ID",
    description="Streams MP3 audio for user-clicked playback. Rejects unbounded requests or rate limit violations."
)
async def synthesize_speech(request: TTSSynthesizeRequest):
    try:
        audio_bytes, provider = await tts_service.synthesize(
            text=request.text,
            answer_id=request.answer_id,
            lang=request.lang
        )
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "X-TTS-Provider": provider,
                "Cache-Control": "public, max-age=3600"
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Speech synthesis error: {str(e)}")


@router.get(
    "/stream",
    summary="Stream audio for HTML5 audio element",
    description="Provides streaming MP3 audio with URL query params for frontend players."
)
async def stream_audio(
    text: Optional[str] = Query(None, description="Spoken text to synthesize"),
    answer_id: Optional[str] = Query(None, description="Server-stored answer identifier"),
    lang: str = Query("kn", description="Language ('kn' or 'en')")
):
    try:
        audio_bytes, provider = await tts_service.synthesize(
            text=text,
            answer_id=answer_id,
            lang=lang
        )
        return Response(
            content=audio_bytes,
            media_type="audio/mpeg",
            headers={
                "X-TTS-Provider": provider,
                "Cache-Control": "public, max-age=3600"
            }
        )
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"Speech synthesis stream error: {str(e)}")
