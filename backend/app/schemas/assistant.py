"""
AgriPulse AI — Schemas for RAG Assistant and Grounded Agricultural Guidance.

Strict contracts for user queries, citations, tool outputs, and assistant responses.
"""

from typing import List, Optional, Dict, Any, Literal
from pydantic import BaseModel, Field


class Citation(BaseModel):
    """Verifiable source citation from official agricultural document."""
    issuer: str = Field(..., description="Issuing authority, e.g. ICAR, UAS Bengaluru, IIHR, IMD")
    document_title: str = Field(..., description="Official title of the guideline or bulletin")
    section: str = Field(..., description="Section, chapter, or table reference")
    source_url: str = Field(..., description="Official verification or portal URL")
    publication_date: str = Field(..., description="Date of document publication or revision")
    retrieval_date: str = Field(..., description="Date retrieved and indexed into AgriPulse AI")
    excerpt: str = Field(..., description="Verbatim supporting excerpt from the official text")
    relevance_score: Optional[float] = Field(None, description="Retrieval similarity or relevance score")


class AssistantRequest(BaseModel):
    """User inquiry to the AgriPulse Agricultural Assistant."""
    query: str = Field(..., min_length=2, max_length=1000, description="Farmer query in Kannada or English")
    language_preference: Optional[Literal["kn", "en", "auto"]] = Field(
        default="auto",
        description="Preferred response language ('kn' for Kannada, 'en' for English, 'auto' detects from query)"
    )
    district: Optional[str] = Field(None, description="Target Karnataka district for local context")
    crop_context: Optional[str] = Field(None, description="Optional active crop, e.g., 'Tomato', 'Ragi'")
    farmer_profile: Optional[Dict[str, Any]] = Field(None, description="Optional active farmer profile for numerical calculations")
    conversation_history: Optional[List[Dict[str, str]]] = Field(
        default=None,
        description="Prior conversation history turns [{'role': 'user'|'assistant', 'content': '...'}]"
    )


class AssistantResponse(BaseModel):
    """Grounded response with source citations and verified numerical tool outputs."""
    query: str = Field(..., description="Original user query")
    detected_language: Literal["kn", "en"] = Field(..., description="Language detected or returned")
    intent: str = Field(..., description="Classified intent (e.g., AGRONOMY_ADVICE, MARKET_PRICE, PROFIT_ECONOMICS, HYBRID, UNSUPPORTED)")
    answer: str = Field(..., description="Grounded response text in Kannada or English")
    mode: Literal["llm_synthesized", "retrieval_excerpt_fallback", "tool_deterministic", "abstention"] = Field(
        ...,
        description="Execution mode: LLM synthesized with citations, authentic excerpt fallback, deterministic tool, or abstention"
    )
    citations: List[Citation] = Field(default_factory=list, description="Official supporting citations")
    tool_outputs: Optional[Dict[str, Any]] = Field(None, description="Outputs from backend numerical tools (mandi price, economics, weather)")
    assumptions_and_limitations: str = Field(..., description="Explicit disclosure of scope, assumptions, and missing information")
    abstention: bool = Field(default=False, description="True if system abstained due to lack of evidence or out-of-scope query")
    prompt_injection_flagged: bool = Field(default=False, description="True if query contained malicious prompt injection patterns")
    spoken_answer: Optional[str] = Field(None, description="Pure, natural spoken text for speech audio readout without markdown or metadata")


class KnowledgeSourceInfo(BaseModel):
    """Metadata for an indexed document in the curated knowledge base."""
    doc_id: str
    issuer: str
    title: str
    source_url: str
    publication_date: str
    retrieval_date: str
    version: str
    covered_crops: List[str]
    covered_regions: List[str]
    total_chunks: int


class EvaluationTestCase(BaseModel):
    """Benchmarking test case for RAG evaluation."""
    id: str
    category: Literal["answerable", "unanswerable_out_of_scope", "prompt_injection", "tool_numerical"]
    query_en: str
    query_kn: str
    expected_intent: str
    expected_abstention: bool
    expected_citations_count_min: int
    validation_notes: str
