from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload
import datetime

from database import get_db
from models import Competency, CompetencyScore, User
from auth import get_current_user

router = APIRouter(prefix="/competencies", tags=["Competencies"])

class CompetencyResponse(BaseModel):
    id: str
    name: str
    group: str
    description: str

class CompetencyScoreItem(BaseModel):
    id: str
    competency_id: str
    competency_name: str
    group: str
    description: str
    current_level: float
    required_level: Optional[float] = None
    evidence: str
    trend: int

class UpdateScoreRequest(BaseModel):
    competency_id: str
    current_level: float
    evidence: Optional[str] = "Diagnostic Assessment"
    trend: Optional[int] = 0

@router.get("", response_model=List[CompetencyResponse])
def list_competencies(group: Optional[str] = Query(None), db: Session = Depends(get_db)):
    query = db.query(Competency)
    if group:
        query = query.filter(Competency.group_name == group.lower())
    results = query.all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "group": c.group_name,
            "description": c.description,
        }
        for c in results
    ]

@router.get("/weighted-scores/me")
def get_my_weighted_scores(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns server-side computed weighted competency scores (0-100),
    confidence metrics, and factor breakdown per competency.
    """
    from services.baseline_engine import calculate_weighted_competency_scores
    return calculate_weighted_competency_scores(current_user, db)

@router.get("/scores/me", response_model=List[CompetencyScoreItem])
def get_my_scores(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scores = (
        db.query(CompetencyScore)
        .options(joinedload(CompetencyScore.competency))
        .filter(CompetencyScore.user_id == current_user.id)
        .all()
    )

    output = []
    for s in scores:
        if s.competency:
            output.append({
                "id": s.id,
                "competency_id": s.competency_id,
                "competency_name": s.competency.name,
                "group": s.competency.group_name,
                "description": s.competency.description,
                "current_level": s.current_level,
                "required_level": s.required_level,
                "evidence": s.evidence,
                "trend": s.trend,
            })
    return output

@router.post("/scores")
def upsert_score(
    data: UpdateScoreRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comp = db.query(Competency).filter(Competency.id == data.competency_id).first()
    if not comp:
        raise HTTPException(status_code=404, detail="Competency not found")

    existing_score = (
        db.query(CompetencyScore)
        .filter(
            CompetencyScore.user_id == current_user.id,
            CompetencyScore.competency_id == data.competency_id
        )
        .first()
    )

    if existing_score:
        existing_score.current_level = data.current_level
        if data.evidence:
            existing_score.evidence = data.evidence
        if data.trend is not None:
            existing_score.trend = data.trend
        existing_score.last_updated = datetime.datetime.utcnow()
        db.commit()
        db.refresh(existing_score)
        return {"status": "updated", "score_id": existing_score.id}
    else:
        new_score = CompetencyScore(
            user_id=current_user.id,
            competency_id=data.competency_id,
            current_level=data.current_level,
            required_level=3.5,
            evidence=data.evidence or "Initial Self Assessment",
            trend=data.trend or 0,
        )
        db.add(new_score)
        db.commit()
        db.refresh(new_score)
        return {"status": "created", "score_id": new_score.id}
