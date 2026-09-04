"""
Baseline Rules Engine for MoSPI Officer Skill Assessment.

This module calculates initial competency levels for newly registered officers based on
their user profile metadata (Job Role, Work Experience, Previous Trainings).

Rules & Auditing Specification:
--------------------------------
1. Base Level:
   Every competency in the National Competency Framework starts at Level 1.0 (Novice / Awareness).

2. Job Role Relevance (+1.0 Level):
   Uses the RoleRequirement table to identify competencies pertinent to the officer's job_role.
   If a competency is required for the officer's role, its starting baseline increases to Level 2.0.

3. Work Experience Adjustment (+1.0 Level, capped at 3.0):
   If the officer has 5 or more years of work experience (work_experience_years >= 5), add +1.0 level.
   For a unverified profile assessment, the experience boost is capped at Level 3.0.

4. Previous Training Credit (+1.0 Level):
   If any course in the officer's previous_trainings matches a competency (via TrainingProgramme
   competency_ids or competency title string matching), add +1.0 level (capped at Level 4.0).

Explainability & Compliance Notice:
-----------------------------------
All rules are deterministic and transparent to support government audit requirements under MoSPI guidelines.
"""

from typing import Dict
from sqlalchemy.orm import Session
from models import User, Competency, RoleRequirement, TrainingProgramme, CompetencyScore

def calculate_baseline_levels(user: User, db: Session) -> Dict[str, float]:
    """
    Calculates initial competency levels (1.0 - 5.0) for a user based on profile metadata.
    
    Args:
        user (User): The user object containing job_role, work_experience_years, previous_trainings.
        db (Session): SQLAlchemy database session.
        
    Returns:
        Dict[str, float]: Mapping of competency_id to calculated baseline current_level.
    """
    all_competencies = db.query(Competency).all()
    if not all_competencies:
        return {}

    # Identify competencies required for user's job role
    user_job_role = (user.job_role or "").strip()
    role_reqs = db.query(RoleRequirement).filter(
        RoleRequirement.job_role.ilike(user_job_role)
    ).all()
    role_comp_ids = {rr.competency_id for rr in role_reqs}

    # Match user's previous_trainings against competency names & TrainingProgramme catalog
    user_trainings = [t.lower().strip() for t in (user.previous_trainings or [])]
    trained_comp_ids = set()

    for comp in all_competencies:
        comp_name_lower = comp.name.lower()
        # Direct keyword matching against training strings
        for ut in user_trainings:
            if ut and (ut in comp_name_lower or comp_name_lower in ut):
                trained_comp_ids.add(comp.id)

    # Also check TrainingProgramme model
    all_trainings = db.query(TrainingProgramme).all()
    for tp in all_trainings:
        tp_title = tp.title.lower()
        if any(ut in tp_title or tp_title in ut for ut in user_trainings if ut):
            if tp.competency_ids:
                for c_id in tp.competency_ids:
                    trained_comp_ids.add(c_id)

    baseline_scores: Dict[str, float] = {}

    for comp in all_competencies:
        # Rule 1: Base level = 1.0
        level = 1.0

        # Rule 2: +1.0 level if competency is required for officer's Job Role
        is_relevant_for_role = comp.id in role_comp_ids
        if is_relevant_for_role:
            level = 2.0

        # Rule 3: +1.0 level if work_experience_years >= 5 (capped at 3.0)
        if (user.work_experience_years or 0) >= 5:
            level = min(3.0, level + 1.0)

        # Rule 4: +1.0 level if officer completed relevant previous trainings (capped at 4.0)
        if comp.id in trained_comp_ids:
            level = min(4.0, level + 1.0)

        baseline_scores[comp.id] = float(level)

    return baseline_scores


DEGREE_RELEVANCE_MAP = {
    "stats": {
        "Survey Design": 85, "Sampling": 85, "National Accounts": 80, "Price Statistics": 75,
        "Labour Statistics": 75, "Agricultural Statistics": 70, "Industrial Statistics": 75,
        "SDG Indicators": 70, "Metadata Standards": 65, "Data Quality Frameworks": 80,
        "Python": 65, "R": 75, "SQL": 65, "Stata": 75, "SPSS": 75, "SAS": 70, "GIS": 45,
        "Data Visualization": 70, "AI/ML": 55, "Cloud Computing": 35, "APIs": 35, "Open Data": 65
    },
    "math": {
        "Sampling": 80, "Survey Design": 70, "National Accounts": 65, "Price Statistics": 65,
        "Python": 70, "R": 70, "SQL": 60, "Data Visualization": 60, "AI/ML": 65
    },
    "comp": {
        "Python": 90, "SQL": 90, "R": 75, "APIs": 85, "Cloud Computing": 85, "AI/ML": 85,
        "Cybersecurity": 85, "Data Privacy": 80, "GIS": 70, "Data Visualization": 85, "Open Data": 80
    },
    "econ": {
        "National Accounts": 85, "Price Statistics": 85, "Labour Statistics": 80,
        "Industrial Statistics": 75, "Agricultural Statistics": 70, "SDG Indicators": 75,
        "Stata": 75, "SPSS": 70, "R": 60, "Decision Making": 75
    }
}

def calculate_weighted_competency_scores(user: User, db: Session) -> Dict[str, dict]:
    """
    Calculates server-side weighted competency scores (0-100) and confidence metrics for an officer:
    competency_score = 0.15 * qual_score + 0.20 * exp_score + 0.30 * train_score + 0.20 * resume_score + 0.15 * self_assess_score
    """
    all_competencies = db.query(Competency).all()
    if not all_competencies:
        return {}

    # User metadata
    quals = [q.lower().strip() for q in (user.educational_qualifications or [])]
    exp_years = user.work_experience_years or 0
    trainings = [t.lower().strip() for t in (user.previous_trainings or [])]
    resume_skills = [s.lower().strip() for s in (user.skill_tags or [])]

    # Fetch user's completed enrollments from DB
    from models import Enrollment, TrainingProgramme
    user_enrollments = db.query(Enrollment).filter(
        Enrollment.user_id == user.id,
        Enrollment.status == "completed"
    ).all()

    # User's self-assessments in CompetencyScore table
    existing_scores = db.query(CompetencyScore).filter(CompetencyScore.user_id == user.id).all()
    self_assess_map = {s.competency_id: s.current_level for s in existing_scores if s.evidence and "self" in s.evidence.lower()}

    # Calculate experience component: min(exp_years * 10, 100)
    exp_score = min(exp_years * 10.0, 100.0)

    results: Dict[str, dict] = {}

    for comp in all_competencies:
        c_name_lower = comp.name.lower()

        # 1. Qualification score (0-100)
        qual_base = 40.0
        for q_str in quals:
            for deg_key, rel_dict in DEGREE_RELEVANCE_MAP.items():
                if deg_key in q_str:
                    match_val = rel_dict.get(comp.name, 50.0)
                    qual_base = max(qual_base, float(match_val))
        if len(quals) > 0 and qual_base == 40.0:
            qual_base = 60.0
        qual_score = min(100.0, qual_base)

        # 2. Training score (0-100)
        train_pts = 0.0
        # Add credits from previous_trainings text list
        matching_text_trainings = [t for t in trainings if t and (t in c_name_lower or c_name_lower in t)]
        train_pts += len(matching_text_trainings) * 25.0

        # Add credits from completed DB enrollments by training level (Foundation +15, Intermediate +25, Advanced +35)
        for enr in user_enrollments:
            prog = db.query(TrainingProgramme).filter(TrainingProgramme.id == enr.training_programme_id).first()
            if prog:
                title_lower = prog.title.lower()
                if c_name_lower in title_lower or (prog.competency_ids and comp.id in prog.competency_ids):
                    train_pts += 35.0  # Completed structured course bonus

        train_score = min(100.0, train_pts)

        # 3. Resume skill score (0-100)
        matching_resume = any(rs for rs in resume_skills if rs and (rs in c_name_lower or c_name_lower in rs))
        resume_score = 85.0 if matching_resume else 30.0

        # 4. Self assessment score (optional / 0-100)
        self_assess_val = self_assess_map.get(comp.id)
        self_assess_score = round(self_assess_val * 20.0, 1) if self_assess_val is not None else None

        # Weighted calculation
        if self_assess_score is not None:
            weighted_score = (
                0.15 * qual_score +
                0.20 * exp_score +
                0.30 * train_score +
                0.20 * resume_score +
                0.15 * self_assess_score
            )
        else:
            # Re-normalize weights if self-assessment is missing (sum of weights = 0.85)
            weighted_score = (
                (0.15 * qual_score + 0.20 * exp_score + 0.30 * train_score + 0.20 * resume_score) / 0.85
            )

        final_score = round(max(10.0, min(100.0, weighted_score)))

        # Confidence calculation
        signals_present = 0
        signal_details = []
        if len(quals) > 0:
            signals_present += 1
            signal_details.append(f"{len(quals)} qualification(s)")
        if exp_years > 0:
            signals_present += 1
            signal_details.append(f"{exp_years} yrs experience")
        if train_pts > 0:
            signals_present += 1
            signal_details.append("training records")
        if matching_resume:
            signals_present += 1
            signal_details.append("resume skill match")
        if self_assess_score is not None:
            signals_present += 1
            signal_details.append("self-assessment")

        if signals_present >= 3:
            confidence = "High"
        elif signals_present == 2:
            confidence = "Medium"
        else:
            confidence = "Low"

        confidence_reason = (
            f"Based on {', '.join(signal_details)}; " +
            ("no self-assessment submitted" if self_assess_score is None else "self-assessment submitted")
        )

        evidence_parts = []
        if len(quals) > 0:
            evidence_parts.append(f"Edu: {user.educational_qualifications[0] if isinstance(user.educational_qualifications, list) and len(user.educational_qualifications) > 0 else 'Profile'}")
        if exp_years > 0:
            evidence_parts.append(f"Exp: {exp_years} yrs")
        if train_pts > 0:
            evidence_parts.append("Trainings Completed")
        if matching_resume:
            evidence_parts.append("Resume Tag Match")
        if self_assess_score is not None:
            evidence_parts.append(f"Self Assessment ({round(self_assess_val, 1)}/5)")

        evidence_str = " | ".join(evidence_parts) if evidence_parts else "Default Baseline Cadre Entry"

        # Check existing stored score for trend calculation
        comp_existing = [s for s in existing_scores if s.competency_id == comp.id]
        trend_val = comp_existing[0].trend if comp_existing and comp_existing[0].trend is not None else 0

        results[comp.id] = {
          "competency_id": comp.id,
          "competency": comp.name,
          "competency_name": comp.name,
          "group": comp.group_name,
          "description": comp.description or "",
          "score": final_score,
          "level": round(max(1.0, min(5.0, (final_score / 20.0))), 1),
          "confidence": confidence,
          "confidence_reason": confidence_reason,
          "evidence": evidence_str,
          "trend": trend_val,
          "breakdown": {
              "qualification": round(qual_score),
              "experience": round(exp_score),
              "training": round(train_score),
              "resume_skill": round(resume_score),
              "self_assessment": self_assess_score,
          },
        }

    return results


