"""
AgriPulse AI — Base Ingestion Adapter.

Defines the contract for all external data sources (APMC Mandi, Weather, Soil).
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional
import pandas as pd


class BaseIngestionAdapter(ABC):
    """Abstract base adapter ensuring uniform lifecycle across all data sources."""

    def __init__(self, source_id: str, source_url: str):
        self.source_id = source_id
        self.source_url = source_url

    @abstractmethod
    def fetch_raw(self, **kwargs) -> Any:
        """Fetch raw data from external API or read local CSV."""
        pass

    @abstractmethod
    def parse_to_dataframe(self, raw_data: Any) -> pd.DataFrame:
        """Parse raw payload/file into an immutable raw pandas DataFrame."""
        pass

    @abstractmethod
    def clean_and_normalize(self, df_raw: pd.DataFrame) -> pd.DataFrame:
        """Transform raw data into canonical format with quality flags."""
        pass
