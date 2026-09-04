from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import get_current_user
from services.multi_factor_recommender import get_multi_factor_recommendations
from services.notification_service import create_notification

router = APIRouter(prefix="/training-programmes", tags=["Training & Recommendations"])

class RecommendationItemResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    provider: str
    duration_hours: int
    is_emerging: bool
    match_reason: str
    final_score: float

@router.get("/recommended/me", response_model=List[RecommendationItemResponse])
def get_my_recommendations(
    top_k: int = Query(6, ge=1, le=20),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns personalized multi-factor training recommendations for the current officer.
    
    Combines 5 signals:
    1. Skill gap priority (50%)
    2. Semantic vector similarity (20%)
    3. Departmental priority (15%)
    4. Career progression / Next role match (10%)
    5. Emerging technology boost (5%)
    """
    recs = get_multi_factor_recommendations(current_user.id, top_k=top_k, db=db)

    # Trigger notification for top recommended course if available
    if recs:
        top_c = recs[0]
        create_notification(
            db=db,
            user_id=current_user.id,
            type="course_recommendation",
            title="New course recommended for you",
            message=f"Recommended for you: {top_c['title']} ({top_c['provider']}) — {top_c['match_reason']}",
            link="/learning-path",
            deduplicate_days=7
        )

    output = []
    for r in recs:
        output.append(RecommendationItemResponse(
            id=r["id"],
            title=r["title"],
            description=r.get("description"),
            provider=r["provider"],
            duration_hours=r["duration_hours"],
            is_emerging=r["is_emerging"],
            match_reason=r["match_reason"],
            final_score=r["final_score"]
        ))

    return output
