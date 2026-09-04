"""
Semantic Search & Vector Similarity Service.

Uses pgvector / vector cosine similarity between dense embeddings of officer competencies
and training programmes to identify conceptually related courses beyond simple ID tag matching.
"""

from typing import List, Tuple
from sqlalchemy.orm import Session
from models import Competency, TrainingProgramme
from services.embeddings import cosine_similarity

def find_similar_programmes(
    competency_id: str,
    top_k: int = 5,
    db: Session = None
) -> List[Tuple[TrainingProgramme, float]]:
    """
    Finds the top_k most semantically similar TrainingProgramme records for a given competency_id
    using vector cosine similarity (<=> matching logic).
    
    Returns:
        List[Tuple[TrainingProgramme, similarity_score (0.0 to 1.0)]]
    """
    comp = db.query(Competency).filter(Competency.id == competency_id).first()
    if not comp or not comp.embedding:
        return []

    comp_vector = comp.embedding

    all_programmes = db.query(TrainingProgramme).all()
    scored_programmes = []

    for prog in all_programmes:
        if not prog.embedding:
            continue
        sim = cosine_similarity(comp_vector, prog.embedding)
        scored_programmes.append((prog, sim))

    # Sort descending by cosine similarity score
    scored_programmes.sort(key=lambda x: x[1], reverse=True)

    return scored_programmes[:top_k]
