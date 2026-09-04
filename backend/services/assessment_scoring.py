"""
Assessment Scoring & Competency Level Mapping Module.

This service maps raw MCQ quiz performance (percentage correct) to standardized
competency levels (1.0 to 5.0) within the MoSPI Competency Framework.

Explainability & Scoring Rules:
--------------------------------
Quiz questions are tagged with specific competency_id values. When an officer completes
a quiz assessment, questions are grouped by competency_id, and accuracy percentage is calculated.

Percentage to Level Mapping:
-----------------------------
-  0%  to  20% correct -> Level 1.0 (Novice / Awareness)
- 21%  to  40% correct -> Level 2.0 (Foundational / Beginner)
- 41%  to  60% correct -> Level 3.0 (Intermediate / Applied)
- 61%  to  80% correct -> Level 4.0 (Advanced / Proficient)
- 81%  to 100% correct -> Level 5.0 (Expert / Mastery)

Auditing Note:
--------------
Honest evidence-based competency updates:
If an officer scores lower than their recorded level on an assessment, regression is logged
with trend="declining" (-1) and explicit evidence documentation. Numbers are never artificially
locked or padded, ensuring truthful training need identification across government statistical directorates.
"""

from typing import Dict, List, TypedDict
from sqlalchemy.orm import Session
from models import CompetencyScore, Question, QuizSubmission
import datetime

class QuestionAnswerInput(TypedDict):
    competency_id: str
    is_correct: bool

def map_score_percentage_to_level(percentage: float) -> float:
    """
    Maps percentage score (0-100) to discrete competency level (1.0 - 5.0).
    """
    if percentage <= 20.0:
        return 1.0
    elif percentage <= 40.0:
        return 2.0
    elif percentage <= 60.0:
        return 3.0
    elif percentage <= 80.0:
        return 4.0
    else:
        return 5.0

def calculate_competency_level_from_quiz(
    user_id: str,
    answers: List[QuestionAnswerInput],
    db: Session
) -> Dict[str, Dict[str, float]]:
    """
    Groups question answers by competency_id, calculates percentage correct,
    and returns calculated new levels for each competency.

    Returns:
        dict[competency_id] -> {
            "percentage": float,
            "new_level": float
        }
    """
    groups: Dict[str, Dict[str, int]] = {}

    for item in answers:
        c_id = item["competency_id"]
        if not c_id:
            continue
        if c_id not in groups:
            groups[c_id] = {"total": 0, "correct": 0}
        groups[c_id]["total"] += 1
        if item.get("is_correct", False):
            groups[c_id]["correct"] += 1

    results: Dict[str, Dict[str, float]] = {}
    for c_id, stats in groups.items():
        if stats["total"] == 0:
            continue
        pct = (stats["correct"] / stats["total"]) * 100.0
        lvl = map_score_percentage_to_level(pct)
        results[c_id] = {
            "percentage": round(pct, 1),
            "new_level": lvl
        }

    return results

def update_user_competency_scores_from_quiz(
    user_id: str,
    answers: List[QuestionAnswerInput],
    db: Session
) -> List[Dict]:
    """
    Updates CompetencyScore database records for the user based on quiz performance.
    
    Handles level increases (improving), level decreases (declining), and unchanged levels (stable).
    """
    calculated_levels = calculate_competency_level_from_quiz(user_id, answers, db)
    today_str = datetime.datetime.utcnow().strftime("%Y-%m-%d")

    updates_summary = []

    for comp_id, data in calculated_levels.items():
        new_level = data["new_level"]
        pct = data["percentage"]

        score_rec = db.query(CompetencyScore).filter(
            CompetencyScore.user_id == user_id,
            CompetencyScore.competency_id == comp_id
        ).first()

        if not score_rec:
            # Create new score record if missing
            score_rec = CompetencyScore(
                user_id=user_id,
                competency_id=comp_id,
                current_level=new_level,
                evidence=f"Quiz assessment on {today_str} ({pct}% score)",
                trend=0,
                last_updated=datetime.datetime.utcnow()
            )
            db.add(score_rec)
            status_text = "created"
            trend_val = 0
        else:
            old_level = score_rec.current_level
            if new_level > old_level:
                trend_val = 1  # Improving
                score_rec.evidence = f"Quiz assessment on {today_str} ({pct}% score)"
                status_text = "improved"
            elif new_level < old_level:
                trend_val = -1  # Declining / Regression
                score_rec.evidence = f"Quiz assessment on {today_str} ({pct}% score - Regression noted)"
                status_text = "declined"
            else:
                trend_val = 0  # Stable
                score_rec.evidence = f"Quiz assessment on {today_str} ({pct}% score)"
                status_text = "stable"

            score_rec.current_level = new_level
            score_rec.trend = trend_val
            score_rec.last_updated = datetime.datetime.utcnow()

        db.commit()
        db.refresh(score_rec)

        updates_summary.append({
            "competency_id": comp_id,
            "old_level": old_level if 'old_level' in locals() else None,
            "new_level": new_level,
            "score_percentage": pct,
            "trend": trend_val,
            "status": status_text
        })

    return updates_summary
