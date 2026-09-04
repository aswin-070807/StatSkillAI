import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models import User, TrainingProgramme, Enrollment, CompetencyScore
from auth import get_current_user
from services.audit import log_audit_event
from services.notification_service import create_notification

router = APIRouter(prefix="/enrollments", tags=["Enrollments & Adaptive Loop"])

class EnrollRequest(BaseModel):
    training_programme_id: str
    source: Optional[str] = "igot_mock"

class UpdateEnrollmentRequest(BaseModel):
    status: str  # 'enrolled', 'in_progress', 'completed', 'dropped'
    score: Optional[float] = None

class EnrollmentResponseItem(BaseModel):
    id: str
    training_programme_id: str
    programme_title: str
    status: str
    enrolled_at: datetime.datetime
    completed_at: Optional[datetime.datetime] = None
    score: Optional[float] = None
    source: str

@router.post("", response_model=EnrollmentResponseItem)
def enroll_in_programme(
    data: EnrollRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Enrolls the current officer in a training programme.
    """
    prog = db.query(TrainingProgramme).filter(TrainingProgramme.id == data.training_programme_id).first()
    if not prog:
        raise HTTPException(status_code=404, detail="Training programme not found.")

    existing = db.query(Enrollment).filter(
        Enrollment.user_id == current_user.id,
        Enrollment.training_programme_id == data.training_programme_id
    ).first()

    if existing:
        return EnrollmentResponseItem(
            id=existing.id,
            training_programme_id=existing.training_programme_id,
            programme_title=prog.title,
            status=existing.status,
            enrolled_at=existing.enrolled_at,
            completed_at=existing.completed_at,
            score=existing.score,
            source=existing.source
        )

    enrollment = Enrollment(
        user_id=current_user.id,
        training_programme_id=data.training_programme_id,
        status="enrolled",
        source=data.source or "igot_mock",
        enrolled_at=datetime.datetime.utcnow()
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)

    log_audit_event(
        db=db,
        action="enrollment_created",
        user_id=current_user.id,
        details={"enrollment_id": enrollment.id, "programme_title": prog.title}
    )

    return EnrollmentResponseItem(
        id=enrollment.id,
        training_programme_id=enrollment.training_programme_id,
        programme_title=prog.title,
        status=enrollment.status,
        enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at,
        score=enrollment.score,
        source=enrollment.source
    )

@router.patch("/{enrollment_id}", response_model=EnrollmentResponseItem)
def update_enrollment_status(
    enrollment_id: str,
    data: UpdateEnrollmentRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Updates enrollment status (e.g. 'completed').
    
    Adaptive Loop (A3):
    When status changes to 'completed', automatically increments the officer's CompetencyScore
    for linked competencies by +0.5 (capped at 5.0), updates trend to improving (+1), and logs an audit record.
    """
    enrollment = db.query(Enrollment).options(joinedload(Enrollment.training_programme)).filter(
        Enrollment.id == enrollment_id,
        Enrollment.user_id == current_user.id
    ).first()

    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment record not found.")

    new_status = data.status.lower().strip()
    enrollment.status = new_status
    if data.score is not None:
        enrollment.score = data.score

    if new_status == "completed" and not enrollment.completed_at:
        enrollment.completed_at = datetime.datetime.utcnow()
        prog = enrollment.training_programme

        # Execute Adaptive Competency Loop
        if prog and prog.competency_ids:
            for comp_id in prog.competency_ids:
                score_rec = db.query(CompetencyScore).filter(
                    CompetencyScore.user_id == current_user.id,
                    CompetencyScore.competency_id == comp_id
                ).first()

                old_lvl = score_rec.current_level if score_rec else 1.0
                new_lvl = min(5.0, round(old_lvl + 0.5, 1))

                if score_rec:
                    score_rec.current_level = new_lvl
                    score_rec.trend = 1  # Improving
                    score_rec.evidence = f"Completed course: {prog.title}"
                    score_rec.last_updated = datetime.datetime.utcnow()
                else:
                    score_rec = CompetencyScore(
                        user_id=current_user.id,
                        competency_id=comp_id,
                        current_level=new_lvl,
                        evidence=f"Completed course: {prog.title}",
                        trend=1,
                        last_updated=datetime.datetime.utcnow()
                    )
                    db.add(score_rec)

                log_audit_event(
                    db=db,
                    action="competency_score_updated",
                    user_id=current_user.id,
                    details={
                        "competency_id": comp_id,
                        "old_level": old_lvl,
                        "new_level": new_lvl,
                        "trigger": f"Enrollment completion ({prog.title})"
                    }
                )

        log_audit_event(
            db=db,
            action="enrollment_completed",
            user_id=current_user.id,
            details={"enrollment_id": enrollment.id, "programme_title": prog.title if prog else "Training"}
        )

        create_notification(
            db=db,
            user_id=current_user.id,
            type="enrollment_update",
            title="Course completed!",
            message=f"You completed {prog.title if prog else 'training course'} — your competency score has improved.",
            link="/my-competency"
        )

    db.commit()
    db.refresh(enrollment)

    prog_title = enrollment.training_programme.title if enrollment.training_programme else "Training Programme"

    return EnrollmentResponseItem(
        id=enrollment.id,
        training_programme_id=enrollment.training_programme_id,
        programme_title=prog_title,
        status=enrollment.status,
        enrolled_at=enrollment.enrolled_at,
        completed_at=enrollment.completed_at,
        score=enrollment.score,
        source=enrollment.source
    )

@router.get("/me", response_model=List[EnrollmentResponseItem])
def get_my_enrollments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns the current officer's learning & enrollment history.
    """
    enrollments = db.query(Enrollment).options(joinedload(Enrollment.training_programme)).filter(
        Enrollment.user_id == current_user.id
    ).order_by(Enrollment.enrolled_at.desc()).all()

    output = []
    for e in enrollments:
        title = e.training_programme.title if e.training_programme else "Training Programme"
        output.append(EnrollmentResponseItem(
            id=e.id,
            training_programme_id=e.training_programme_id,
            programme_title=title,
            status=e.status,
            enrolled_at=e.enrolled_at,
            completed_at=e.completed_at,
            score=e.score,
            source=e.source
        ))

    return output
