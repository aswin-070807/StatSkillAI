"""
Multi-Factor Recommendation Engine.

Combines 5 weighted signals to deliver personalized training recommendations:
-------------------------------------------------------------------------------
1. Skill Gap Priority (50% weight):
   Scores training courses based on officer's current skill gap size (required - current).

2. Semantic Vector Similarity (20% weight):
   Uses vector embeddings cosine similarity to surface conceptually related courses.

3. Departmental Priority (15% weight):
   Boosts courses aligned with department strategic priorities (e.g. National Accounts Division, NSO, CSO).

4. Career Progression (10% weight):
   Surfaces courses required for the officer's NEXT role (e.g. Statistical Officer -> Senior Statistical Officer).

5. Emerging Technology Boost (5% weight):
   Gives a small recommendation boost to courses flagged is_emerging (AI/ML, Cloud, GIS, APIs, Cybersecurity).

Deprioritization:
-----------------
Courses already completed in the officer's Enrollment history are filtered out or heavily deprioritized.
"""

from typing import Dict, List
from sqlalchemy.orm import Session
from models import User, Competency, CompetencyScore, RoleRequirement, TrainingProgramme, Enrollment
from services.embeddings import cosine_similarity
from services.skill_gap_engine import calculate_gaps

# Career trajectory mapping: current_role -> next_role
CAREER_PATH_MAP = {
    "Macroeconomic Data Analyst": "Senior Statistical Officer",
    "Statistical Officer": "Senior Statistical Officer",
    "Data Analyst": "Senior Statistical Officer",
    "Junior Statistical Officer": "Statistical Officer",
}

# Department strategic competency priorities
DEPARTMENT_PRIORITIES = {
    "National Accounts Division": ["National Accounts", "Price Statistics", "SDG Indicators", "Python", "SQL"],
    "National Statistical Office": ["Survey Design", "Sampling", "Labour Statistics", "Data Quality Frameworks"],
    "CSO": ["Price Statistics", "Industrial Statistics", "Data Visualization"],
    "State Directorates": ["Agricultural Statistics", "GIS", "Survey Design"],
}

# Weights configuration (Must sum to 1.0)
WEIGHT_GAP = 0.50
WEIGHT_SEMANTIC = 0.20
WEIGHT_DEPT = 0.15
WEIGHT_CAREER = 0.10
WEIGHT_EMERGING = 0.05

def get_multi_factor_recommendations(
    user_id: str,
    top_k: int = 6,
    db: Session = None
) -> List[Dict]:
    """
    Computes personalized multi-factor recommendations for an officer.
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    # 1. Fetch user's skill gaps
    user_gaps = calculate_gaps(user_id, db)
    gap_comp_ids = {g["competency_id"]: g["gap"] for g in user_gaps if g["gap"] > 0}

    # 2. Fetch completed enrollments to exclude/deprioritize
    completed_enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == user_id,
        Enrollment.status == "completed"
    ).all()
    completed_prog_ids = {e.training_programme_id for e in completed_enrollments}

    # 3. Next role for career progression
    user_job_role = (user.job_role or "").strip()
    next_role = CAREER_PATH_MAP.get(user_job_role, "Senior Statistical Officer")
    next_role_reqs = db.query(RoleRequirement).filter(
        RoleRequirement.job_role.ilike(next_role)
    ).all()
    next_role_comp_ids = {rr.competency_id for rr in next_role_reqs}

    # 4. Department priority competency IDs
    dept_name = user.department or "National Accounts Division"
    dept_comp_names = DEPARTMENT_PRIORITIES.get(dept_name, ["National Accounts", "Python", "Survey Design"])
    dept_comps = db.query(Competency).filter(Competency.name.in_(dept_comp_names)).all()
    dept_comp_ids = {c.id for c in dept_comps}

    # 5. Fetch all training programmes
    all_programmes = db.query(TrainingProgramme).all()
    scored_list = []

    for prog in all_programmes:
        # Exclude completed courses
        if prog.id in completed_prog_ids:
            continue

        prog_comp_ids = set(prog.competency_ids or [])

        # Score Factor 1: Skill Gap Priority (0.0 to 1.0)
        gap_score = 0.0
        max_gap = 0.0
        for c_id in prog_comp_ids:
            if c_id in gap_comp_ids:
                max_gap = max(max_gap, gap_comp_ids[c_id])
        gap_score = min(1.0, max_gap / 3.0)  # Normalize gap of 3.0 to 1.0

        # Score Factor 2: Semantic Similarity (0.0 to 1.0)
        semantic_score = 0.0
        if prog.embedding:
            # Check similarity against highest gap competency vector
            for g in user_gaps[:3]:
                c_rec = db.query(Competency).filter(Competency.id == g["competency_id"]).first()
                if c_rec and c_rec.embedding:
                    sim = cosine_similarity(c_rec.embedding, prog.embedding)
                    semantic_score = max(semantic_score, sim)

        # Score Factor 3: Departmental Priority (0.0 or 1.0)
        dept_score = 1.0 if prog_comp_ids.intersection(dept_comp_ids) else 0.0

        # Score Factor 4: Career Progression (0.0 or 1.0)
        career_score = 1.0 if prog_comp_ids.intersection(next_role_comp_ids) else 0.0

        # Score Factor 5: Emerging Tech (0.0 or 1.0)
        emerging_score = 1.0 if prog.is_emerging else 0.0

        # Weighted Total Score
        total_score = (
            (WEIGHT_GAP * gap_score) +
            (WEIGHT_SEMANTIC * semantic_score) +
            (WEIGHT_DEPT * dept_score) +
            (WEIGHT_CAREER * career_score) +
            (WEIGHT_EMERGING * emerging_score)
        )

        # Determine match reason
        if gap_score > 0:
            match_reason = "direct_gap_match"
        elif semantic_score > 0.4:
            match_reason = "semantic_match"
        elif career_score > 0:
            match_reason = "career_progression_match"
        else:
            match_reason = "departmental_priority"

        scored_list.append({
            "id": prog.id,
            "title": prog.title,
            "description": prog.description,
            "provider": prog.provider or "NSSTA",
            "duration_hours": prog.duration_hours or 6,
            "is_emerging": prog.is_emerging,
            "match_reason": match_reason,
            "final_score": round(total_score, 3),
            "breakdown": {
                "gap_score": round(gap_score, 2),
                "semantic_score": round(semantic_score, 2),
                "dept_score": round(dept_score, 2),
                "career_score": round(career_score, 2),
                "emerging_score": round(emerging_score, 2)
            }
        })

    # Sort descending by final score
    scored_list.sort(key=lambda x: x["final_score"], reverse=True)
    return scored_list[:top_k]
