"""
AgriPulse AI — Lexical and Semantic Retriever with Provenance Tracking & Injection Defense.

Implements:
1. Multi-token BM25/TF-IDF scoring across bilingual (English & Kannada) text.
2. Hard prompt-injection and jailbreak pattern detection.
3. Relevance thresholding to enforce strict abstention when evidence is insufficient.
"""

import re
import math
from typing import List, Dict, Any, Tuple
from app.rag.knowledge_base import KNOWLEDGE_DOCUMENTS
from app.schemas.assistant import Citation

# Known adversarial prompt injection patterns
INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+instructions",
    r"disregard\s+(all\s+)?guidelines",
    r"system\s+prompt",
    r"override\s+(all\s+)?constraints",
    r"you\s+are\s+now\s+dan",
    r"jailbreak",
    r"act\s+as\s+an\s+unfiltered",
    r"say\s+(that\s+)?.*is\s+worth\s+\d+",
    r"bypass\s+safety",
    r"developer\s+mode\s+output",
]

# Agronomic stop words (common particles in Kannada and English)
STOP_WORDS = {
    "is", "the", "a", "an", "and", "or", "in", "on", "at", "to", "for", "of", "with", "what", "how", "why", "when",
    "ಇದು", "ಮತ್ತು", "ಅಥವಾ", "ನಲ್ಲಿ", "ಗೆ", "ಯಾವಾಗ", "ಹೇಗೆ", "ಏನು", "ಎಷ್ಟು", "ಮಾಡಬೇಕು"
}


def detect_prompt_injection(query: str) -> bool:
    """Scans query for jailbreak and prompt-injection patterns."""
    lowered = query.lower()
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, lowered):
            return True
    return False


def tokenize_bilingual(text: str) -> List[str]:
    """Tokenizes text preserving both Latin and Kannada characters."""
    # Matches words in any Unicode script (including Kannada \u0C80-\u0CFF)
    tokens = re.findall(r"[\w\u0C80-\u0CFF]+", text.lower())
    return [t for t in tokens if len(t) > 1 and t not in STOP_WORDS]


class GroundedRetriever:
    """Retrieves verified document chunks with provenance metadata."""

    def __init__(self, documents: List[Dict[str, Any]] = None):
        self.documents = documents or KNOWLEDGE_DOCUMENTS
        self.doc_tokens: List[List[str]] = []
        self.doc_frequencies: Dict[str, int] = {}
        self._build_index()

    def _build_index(self):
        """Builds term-frequency index for BM25-style lexical scoring."""
        self.doc_tokens = []
        self.doc_frequencies = {}

        for doc in self.documents:
            # Combine content, keywords, and metadata for rich matching
            combined_text = (
                f"{doc['document_title']} {doc['section']} {doc['covered_crop']} "
                f"{' '.join(doc.get('keywords', []))} {doc['content_en']} {doc['content_kn']}"
            )
            tokens = tokenize_bilingual(combined_text)
            self.doc_tokens.append(tokens)

            unique_tokens = set(tokens)
            for token in unique_tokens:
                self.doc_frequencies[token] = self.doc_frequencies.get(token, 0) + 1

    def retrieve(
        self,
        query: str,
        top_k: int = 3,
        threshold: float = 0.15,
        target_crop: str = None
    ) -> Tuple[List[Citation], bool]:
        """
        Retrieves matching citations for the query.
        
        Returns:
            Tuple of (citations_list, has_sufficient_evidence)
        """
        query_tokens = tokenize_bilingual(query)
        if not query_tokens:
            return [], False

        total_docs = len(self.documents)
        scored_results: List[Tuple[float, Dict[str, Any]]] = []

        for idx, (doc, doc_toks) in enumerate(zip(self.documents, self.doc_tokens)):
            # If target crop is specified, boost relevance for matching crop
            crop_boost = 1.0
            if target_crop and target_crop.lower() in doc.get("covered_crop", "").lower():
                crop_boost = 1.4

            doc_len = len(doc_toks)
            score = 0.0

            for q_tok in query_tokens:
                tf = doc_toks.count(q_tok)
                if tf > 0:
                    df = self.doc_frequencies.get(q_tok, 1)
                    idf = math.log(1 + (total_docs - df + 0.5) / (df + 0.5))
                    # Normalised term frequency
                    bm25_tf = (tf * 2.2) / (tf + 1.2 * (0.25 + 0.75 * (doc_len / 150.0)))
                    score += idf * bm25_tf

            # Calculate query term coverage (what percentage of query terms are in the doc)
            unique_q_toks = set(query_tokens)
            matched_q_toks = set(q_tok for q_tok in unique_q_toks if q_tok in doc_toks)
            query_coverage = len(matched_q_toks) / len(unique_q_toks) if unique_q_toks else 0.0

            # Also check direct keyword exact matches
            for kw in doc.get("keywords", []):
                if kw.lower() in query.lower():
                    score += 0.8

            # If fewer than 35% of query concepts matched and only 1 token matched, penalize
            if len(unique_q_toks) >= 4 and query_coverage < 0.35 and len(matched_q_toks) <= 1:
                score *= 0.15

            final_score = score * crop_boost
            if final_score > 0:
                scored_results.append((final_score, doc))

        # Sort descending by score
        scored_results.sort(key=lambda x: x[0], reverse=True)

        if not scored_results:
            return [], False

        max_score = scored_results[0][0]
        # Check relevance threshold
        if max_score < threshold:
            return [], False

        top_matches = scored_results[:top_k]
        citations: List[Citation] = []

        for score, doc in top_matches:
            citations.append(
                Citation(
                    issuer=doc["issuer"],
                    document_title=doc["document_title"],
                    section=doc["section"],
                    source_url=doc["source_url"],
                    publication_date=doc["publication_date"],
                    retrieval_date=doc["retrieval_date"],
                    excerpt=doc["content_kn"] if any("\u0c80" <= c <= "\u0cff" for c in query) else doc["content_en"],
                    relevance_score=round(score, 3),
                )
            )

        return citations, True
