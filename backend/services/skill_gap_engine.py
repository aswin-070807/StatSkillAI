"""
Skill Gap Engine and AI Insight Generation Service.

This module provides gap calculation, prioritization, and AI insight generation
for officer competencies in MoSPI.

Gap Analysis Rules (Parts C & D):
----------------------------------
1. Required Level Lookup:
   Lookup required competency levels for the officer's job_role in the RoleRequirement table.

2. Graceful Exclusion of Non-Required Competencies (Rule C2):
   If a competency has NO entry in RoleRequirement for the officer's job_role, treat required_level
   as null and EXCLUDE it entirely from the gap analysis. Do not default to 0 or fabricate numbers.

3. Gap & Prioritization Calculation (Rule D1):
   gap = required_level - current_level (rounded to 1 decimal place)
   - Priority = "High" if gap >= 2.0
   - Priority = "Medium" if 1.0 <= gap < 2.0
   - Priority = "Low" if gap < 1.0

4. Sorting (Rule D1):
   Gaps are sorted by priority ("High" first, then "Medium", then "Low"), followed by gap magnitude descending.

5. AI Insight Text Generation & Caching (Rule D2):
   Generates short 1-2 sentence explainable recommendations for top priority gaps.
   Cached per (competency_id + gap_size) key to avoid redundant computation.
"""

import os
from typing import Dict, List, Optional
from sqlalchemy.orm import Session, joinedload
from models import CompetencyScore, RoleRequirement, User

# In-memory prompt cache keyed by (competency_id, gap_val)
INSIGHT_CACHE: Dict[str, str] = {}

COMPETENCY_DOMAIN_CONTEXT: Dict[str, str] = {
    "Survey Design": "formulating questionnaires, sampling frames, and field execution protocols",
    "Sampling": "survey design accuracy and sample selection calibration",
    "National Accounts": "compiling GDP estimates, GVA tables, and macro-economic metrics",
    "Price Statistics": "constructing Consumer Price Index (CPI) and retail inflation metrics",
    "Labour Statistics": "analyzing Periodic Labour Force Survey (PLFS) indicators and employment metrics",
    "Python": "writing automated data cleaning scripts and statistical pipeline models",
    "SQL": "querying relational survey microdata and relational aggregation joins",
    "R": "estimating survey weights and conducting parametric/non-parametric econometric tests",
    "Data Visualization": "building executive dashboards and public statistical infographics",
    "AI/ML": "applying automated data imputation algorithms and statistical anomaly detection",
    "Cybersecurity": "ensuring CERT-In security compliance and safe statistical microdata handling",
    "Data Privacy": "complying with Digital Personal Data Protection (DPDP) Act rules and anonymization",
    "Communication": "presenting complex statistical insights clearly to policymakers and public stakeholders",
    "Project Management": "managing survey timelines, field enumerators, and resource allocation",
    "Ethics": "upholding Fundamental Principles of Official Statistics and data integrity",
    "Decision Making": "synthesizing empirical data to guide evidence-based policy formulation",
}

def generate_gap_insight(gap_record: dict) -> str:
    """
    Generates a 1-2 sentence human-readable AI explanation for a skill gap.
    Uses an in-memory cache keyed by competency_id + gap_size to prevent redundant generation.
    """
    comp_id = gap_record["competency_id"]
    comp_name = gap_record["competency_name"]
    gap_val = gap_record["gap"]
    user_role = gap_record.get("job_role", "your role")

    cache_key = f"{comp_id}_{gap_val}_{user_role}"
    if cache_key in INSIGHT_CACHE:
        return INSIGHT_CACHE[cache_key]

    domain_context = COMPETENCY_DOMAIN_CONTEXT.get(
        comp_name, "official statistical workflows and data analysis"
    )

    if gap_val >= 2.0:
        insight = (
            f"Your {comp_name} competency is {gap_val:.1f} levels below what is required for {user_role}. "
            f"Prioritizing this is recommended as it directly impacts {domain_context}."
        )
    elif gap_val >= 1.0:
        insight = (
            f"Your {comp_name} proficiency has a {gap_val:.1f}-level gap against the {user_role} benchmark. "
            f"Targeted training will strengthen your capability in {domain_context}."
        )
    else:
        insight = (
            f"Your {comp_name} skills are currently meeting the target level for {user_role}. "
            f"Maintain this level to ensure high performance in {domain_context}."
        )

    INSIGHT_CACHE[cache_key] = insight
    return insight

def calculate_gaps(user_id: str, db: Session) -> List[dict]:
    """
    Calculates competency gaps for a user against their job_role requirements.
    
    Excludes competencies that have no RoleRequirement entry for the user's job_role (Rule C2).
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return []

    user_job_role = (user.job_role or "").strip()

    # Fetch role requirements for user's job role
    role_reqs = (
        db.query(RoleRequirement)
        .filter(RoleRequirement.job_role.ilike(user_job_role))
        .all()
    )
    role_req_map = {rr.competency_id: rr.required_level for rr in role_reqs}

    # Fetch weighted competency scores for user using the unified 5-factor scoring engine
    from services.baseline_engine import calculate_weighted_competency_scores
    weighted_scores = calculate_weighted_competency_scores(user, db)

    gaps_list = []

    for comp_id, w_data in weighted_scores.items():
        # Rule C2: If no RoleRequirement exists for this job_role, skip/exclude entirely
        if comp_id not in role_req_map:
            continue

        required_level = role_req_map[comp_id]
        current_level = float(w_data.get("level", 1.0))

        gap_val = round(max(0.0, required_level - current_level), 1)

        # Rule D1: Priority classification
        if gap_val >= 2.0:
            priority = "High"
            priority_rank = 0
        elif gap_val >= 1.0:
            priority = "Medium"
            priority_rank = 1
        else:
            priority = "Low"
            priority_rank = 2

        gap_item = {
            "competency_id": w_data["competency_id"],
            "competency_name": w_data["competency_name"],
            "group": w_data["group"],
            "description": w_data.get("description", ""),
            "current_level": round(current_level, 1),
            "required_level": round(required_level, 1),
            "gap": gap_val,
            "priority": priority,
            "priority_rank": priority_rank,
            "department": user.department or "National Accounts Division",
            "job_role": user_job_role,
            "ai_insight": None  # Will be generated for top 3
        }
        gaps_list.append(gap_item)

    # Sort results: Priority (High -> Medium -> Low), then Gap magnitude descending
    gaps_list.sort(key=lambda x: (x["priority_rank"], -x["gap"]))

    # Rule D2/D3: Generate AI insight for top 3 highest priority gaps only
    top_3_count = 0
    for item in gaps_list:
        if top_3_count < 3 and item["priority"] in ["High", "Medium"]:
            item["ai_insight"] = generate_gap_insight(item)
            top_3_count += 1

    return gaps_list
