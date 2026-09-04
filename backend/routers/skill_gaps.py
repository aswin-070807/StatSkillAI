from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import get_current_user
from services.skill_gap_engine import calculate_gaps
from services.notification_service import create_notification

router = APIRouter(prefix="/skill-gaps", tags=["Skill Gaps"])

class SkillGapItemResponse(BaseModel):
    competency_id: str
    competency: str
    group: str
    description: Optional[str] = None
    current: float
    required: float
    gap: float
    priority: str
    department: str
    ai_insight: Optional[str] = None

@router.get("/me", response_model=List[SkillGapItemResponse])
def get_my_skill_gaps(
    group: Optional[str] = Query(None, description="Filter by competency group (e.g. statistical, technical, digital, behavioural)"),
    priority: Optional[str] = Query(None, description="Filter by priority (e.g. High, Medium, Low)"),
    department: Optional[str] = Query(None, description="Filter by department name"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Computes & returns the officer's skill gaps benchmarked against their job role.
    Excludes competencies with no role requirement entry (Rule C2).
    Includes AI insight text for top 3 priority gaps (Rule D2/D3).
    Supports filtering by group, priority, and department.
    """
    raw_gaps = calculate_gaps(current_user.id, db)

    # Check and generate skill gap alert notifications for critical/high gaps
    for g in raw_gaps:
        if g.get("priority") in ["Critical", "High"] or (g.get("gap") and g["gap"] >= 1.5):
            create_notification(
                db=db,
                user_id=current_user.id,
                type="skill_gap_alert",
                title=f"Critical skill gap identified: {g['competency_name']}",
                message=f"Your {g['competency_name']} gap is {g['gap']:.1f} ({g['priority']} priority) — consider enrolling in a recommended course.",
                link="/skill-gaps",
                deduplicate_days=7
            )

    output = []
    for g in raw_gaps:
        # Apply filters if provided
        if group and group.lower() != "all" and g["group"].lower() != group.lower():
            continue
        if priority and priority.lower() != "all" and g["priority"].lower() != priority.lower():
            continue
        if department and department.lower() != "all" and department.lower() not in g["department"].lower():
            continue

        output.append(SkillGapItemResponse(
            competency_id=g["competency_id"],
            competency=g["competency_name"],
            group=g["group"],
            description=g.get("description"),
            current=g["current_level"],
            required=g["required_level"],
            gap=g["gap"],
            priority=g["priority"],
            department=g["department"],
            ai_insight=g["ai_insight"]
        ))

    return output
