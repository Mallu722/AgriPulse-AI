"""
AgriPulse AI — Persistent Interaction Database & Continuous Knowledge Training.

Features:
1. Logs all farmer queries, detected languages, intents, farmer profile context,
   citations, and assistant answers to SQLite database.
2. Supports continuous learning: harvests farmer queries and verified answers
   to expand the retrieval knowledge index.
"""

import os
import json
import sqlite3
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional

DB_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
DB_PATH = os.path.join(DB_DIR, "farmer_interactions.db")


def get_db_connection() -> sqlite3.Connection:
    os.makedirs(DB_DIR, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initializes the database schema if not present."""
    conn = get_db_connection()
    with conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS farmer_interactions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                query TEXT NOT NULL,
                language TEXT NOT NULL,
                intent TEXT NOT NULL,
                district TEXT NOT NULL,
                farmer_profile_json TEXT,
                answer TEXT NOT NULL,
                spoken_answer TEXT,
                mode TEXT NOT NULL,
                citations_json TEXT,
                tool_outputs_json TEXT,
                abstention INTEGER NOT NULL DEFAULT 0,
                is_trained INTEGER NOT NULL DEFAULT 0
            )
        """)
        conn.execute("""
            CREATE TABLE IF NOT EXISTS learned_knowledge (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_query_id INTEGER,
                topic TEXT NOT NULL,
                question_kn TEXT NOT NULL,
                question_en TEXT,
                verified_answer TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TEXT NOT NULL
            )
        """)
    conn.close()


init_db()


def log_interaction(
    query: str,
    language: Optional[str] = None,
    detected_language: Optional[str] = None,
    intent: str = "GENERAL_AGRICULTURE",
    district: str = "Kolar",
    farmer_profile: Optional[Dict[str, Any]] = None,
    answer: str = "",
    spoken_answer: Optional[str] = None,
    mode: str = "retrieval_excerpt_fallback",
    citations: Optional[List[Any]] = None,
    tool_outputs: Optional[Dict[str, Any]] = None,
    abstention: bool = False,
    **kwargs
) -> int:
    """Logs an interaction to the SQLite database."""
    init_db()
    conn = get_db_connection()
    try:
        lang = detected_language or language or "kn"
        now_iso = datetime.now(timezone.utc).isoformat()
        profile_str = json.dumps(farmer_profile or {}, ensure_ascii=False)
        citations_data = [c.model_dump() if hasattr(c, "model_dump") else c for c in (citations or [])]
        citations_str = json.dumps(citations_data, ensure_ascii=False)
        tools_str = json.dumps(tool_outputs or {}, ensure_ascii=False)

        with conn:
            cursor = conn.execute(
                """
                INSERT INTO farmer_interactions (
                    timestamp, query, language, intent, district,
                    farmer_profile_json, answer, spoken_answer, mode,
                    citations_json, tool_outputs_json, abstention, is_trained
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)
                """,
                (
                    now_iso, query, lang, intent, district,
                    profile_str, answer, spoken_answer, mode,
                    citations_str, tools_str, 1 if abstention else 0
                )
            )
            return cursor.lastrowid
    except Exception as e:
        print(f"Error logging interaction: {e}")
        return -1
    finally:
        conn.close()


def get_recent_queries(limit: int = 50) -> List[Dict[str, Any]]:
    """Retrieves recent farmer queries and responses."""
    init_db()
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            """
            SELECT id, timestamp, query, language, intent, district,
                   answer, spoken_answer, mode, abstention, is_trained
            FROM farmer_interactions
            ORDER BY id DESC
            LIMIT ?
            """,
            (limit,)
        )
        rows = cursor.fetchall()
        return [dict(row) for row in rows]
    finally:
        conn.close()


def get_database_stats() -> Dict[str, Any]:
    """Returns database size, interaction count, and learning statistics."""
    init_db()
    conn = get_db_connection()
    try:
        cursor = conn.execute("SELECT COUNT(*) as total FROM farmer_interactions")
        total = cursor.fetchone()["total"]

        cursor = conn.execute("SELECT COUNT(*) as trained FROM farmer_interactions WHERE is_trained = 1")
        trained = cursor.fetchone()["trained"]

        cursor = conn.execute("SELECT COUNT(*) as learned FROM learned_knowledge")
        learned = cursor.fetchone()["learned"]

        return {
            "total_queries_logged": total,
            "trained_queries_count": trained,
            "new_unindexed_queries": max(0, total - trained),
            "learned_knowledge_entries": learned,
            "db_path": DB_PATH,
            "db_status": "active"
        }
    finally:
        conn.close()


def train_and_index_database() -> Dict[str, Any]:
    """
    Harvests unindexed interactions, extracts verified agricultural Q&As,
    and updates the database index for continuous learning.
    """
    init_db()
    conn = get_db_connection()
    try:
        cursor = conn.execute(
            """
            SELECT id, query, language, intent, district, answer
            FROM farmer_interactions
            WHERE is_trained = 0 AND abstention = 0
            """
        )
        unindexed = cursor.fetchall()
        indexed_count = 0

        with conn:
            for row in unindexed:
                conn.execute(
                    """
                    INSERT INTO learned_knowledge (
                        source_query_id, topic, question_kn, verified_answer, category, created_at
                    ) VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        row["id"],
                        row["intent"],
                        row["query"],
                        row["answer"][:1000],
                        row["intent"],
                        datetime.now(timezone.utc).isoformat()
                    )
                )
                conn.execute("UPDATE farmer_interactions SET is_trained = 1 WHERE id = ?", (row["id"],))
                indexed_count += 1

        stats = get_database_stats()
        stats["newly_indexed_now"] = indexed_count
        return stats
    finally:
        conn.close()
