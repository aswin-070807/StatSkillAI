"""
Embedding Service for Semantic Skill Matching.

Provides dense vector generation and cosine similarity calculation for statistical competencies
and training programmes. Works in all Python environments with zero external heavy ML library dependencies,
producing 64-dimensional semantic embeddings.
"""

import math
import re
from typing import List

# Key domain concepts mapped to vector dimension indices
DOMAIN_VOCABULARY = [
    "survey", "design", "sampling", "frame", "questionnaire", "household", "census",
    "national", "accounts", "gdp", "gva", "sna", "macroeconomic", "compilation",
    "price", "statistics", "cpi", "wpi", "inflation", "index", "weighting",
    "labour", "force", "plfs", "employment", "unemployment", "workforce",
    "agricultural", "crop", "yield", "land", "livestock", "farm",
    "industrial", "asi", "iip", "manufacturing", "production",
    "python", "pandas", "dataframe", "scripting", "data", "wrangling",
    "sql", "database", "query", "join", "relational", "aggregation",
    "r", "econometrics", "regression", "statistical", "modeling",
    "visualization", "powerbi", "tableau", "dashboard", "plotly", "chart",
    "ai", "ml", "machine", "learning", "imputation", "anomaly", "prediction",
    "cloud", "meghraj", "aws", "infrastructure", "deployment",
    "gis", "spatial", "mapping", "geotagging", "qgis", "enumeration",
    "cybersecurity", "cert-in", "privacy", "dpdp", "anonymization", "security",
    "leadership", "communication", "management", "ethics", "decision", "governance"
]

VECTOR_DIM = 64

def generate_embedding(text: str) -> List[float]:
    """
    Generates a normalized 64-dimensional dense semantic vector for a text string.
    """
    if not text:
        return [0.0] * VECTOR_DIM

    text_clean = text.lower()
    words = re.findall(r"\b[a-z0-9-]+\b", text_clean)

    vector = [0.0] * VECTOR_DIM

    # 1. Map domain vocabulary to dimensions
    for idx, term in enumerate(DOMAIN_VOCABULARY):
        dim_idx = idx % VECTOR_DIM
        count = text_clean.count(term)
        if count > 0:
            vector[dim_idx] += float(count * 2.0)

    # 2. Add n-gram hash values for generic vocabulary coverage
    for word in words:
        hash_val = sum(ord(c) for c in word)
        dim_idx = hash_val % VECTOR_DIM
        vector[dim_idx] += 1.0

    # 3. L2 Normalize vector
    magnitude = math.sqrt(sum(val * val for val in vector))
    if magnitude > 0:
        vector = [round(val / magnitude, 4) for val in vector]
    else:
        vector = [0.0] * VECTOR_DIM

    return vector

def cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
    """
    Calculates cosine similarity between two normalized float vectors.
    """
    if not vec1 or not vec2 or len(vec1) != len(vec2):
        return 0.0

    dot_product = sum(a * b for a, b in zip(vec1, vec2))
    norm_a = math.sqrt(sum(a * a for a in vec1))
    norm_b = math.sqrt(sum(b * b for b in vec2))

    if norm_a == 0 or norm_b == 0:
        return 0.0

    sim = dot_product / (norm_a * norm_b)
    return round(max(0.0, min(1.0, sim)), 4)
