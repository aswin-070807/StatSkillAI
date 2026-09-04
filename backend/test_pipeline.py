import os
import sys
from database import engine, SessionLocal, Base
from models import User, Competency, CompetencyScore, RoleRequirement
from seed import seed_db
from services.baseline_engine import calculate_baseline_levels
from services.assessment_scoring import update_user_competency_scores_from_quiz
from services.skill_gap_engine import calculate_gaps, generate_gap_insight

def test_pipeline():
    print("=== STARTING SKILL GAP IDENTIFICATION PIPELINE INTEGRATION TEST ===")

    # Ensure DB tables & seeds exist
    Base.metadata.create_all(bind=engine)
    seed_db()

    db = SessionLocal()

    try:
        # -------------------------------------------------------------
        # PART A: BASELINE CALCULATION TEST
        # -------------------------------------------------------------
        print("\n--- PART A: Testing Baseline Level Calculation ---")
        test_email = "test_data_analyst@mospi.gov.in"
        
        # Cleanup existing test user if present
        existing_user = db.query(User).filter(User.email == test_email).first()
        if existing_user:
            db.delete(existing_user)
            db.commit()

        test_user = User(
            employee_id="EMP-TEST-DA99",
            name="Jane Data Analyst",
            email=test_email,
            password_hash="fakehash",
            designation="Data Analyst",
            department="National Statistical Office",
            job_role="Data Analyst",
            work_experience_years=6,
            previous_trainings=["Python"],
            role="employee"
        )
        db.add(test_user)
        db.commit()
        db.refresh(test_user)

        baseline_levels = calculate_baseline_levels(test_user, db)

        # Get role requirements map for Data Analyst
        role_reqs = db.query(RoleRequirement).filter(
            RoleRequirement.job_role == "Data Analyst"
        ).all()
        role_req_map = {rr.competency_id: rr.required_level for rr in role_reqs}

        for comp_id, base_level in baseline_levels.items():
            req_lvl = role_req_map.get(comp_id, None)
            db.add(CompetencyScore(
                user_id=test_user.id,
                competency_id=comp_id,
                current_level=base_level,
                required_level=req_lvl,
                evidence="Initial profile assessment",
                trend=0
            ))
        db.commit()

        # Verify Data Analyst specific competency score levels
        python_comp = db.query(Competency).filter(Competency.name == "Python").first()
        agri_comp = db.query(Competency).filter(Competency.name == "Agricultural Statistics").first()

        python_score = db.query(CompetencyScore).filter(
            CompetencyScore.user_id == test_user.id,
            CompetencyScore.competency_id == python_comp.id
        ).first()

        agri_score = db.query(CompetencyScore).filter(
            CompetencyScore.user_id == test_user.id,
            CompetencyScore.competency_id == agri_comp.id
        ).first()

        print(f"[OK] Python Baseline Score: current_level={python_score.current_level} (Expected: 4.0 due to 2.0 role + 1.0 exp + 1.0 training)")
        print(f"[OK] Agricultural Statistics Baseline Score: current_level={agri_score.current_level} (Expected: 2.0 due to 1.0 base + 1.0 exp)")
        assert python_score.current_level == 4.0
        assert agri_score.current_level == 2.0

        # -------------------------------------------------------------
        # PART B: QUIZ SUBMISSION SCORE UPDATES (IMPROVEMENT & DECLINE)
        # -------------------------------------------------------------
        print("\n--- PART B: Testing Assessment-Driven Score Updates ---")
        sql_comp = db.query(Competency).filter(Competency.name == "SQL").first()

        # Submit quiz answers: High score on SQL (100%), Low score on Python (0%)
        quiz_answers = [
            {"competency_id": sql_comp.id, "is_correct": True},
            {"competency_id": sql_comp.id, "is_correct": True},
            {"competency_id": python_comp.id, "is_correct": False},
            {"competency_id": python_comp.id, "is_correct": False},
        ]

        updates = update_user_competency_scores_from_quiz(test_user.id, quiz_answers, db)
        
        updated_sql = db.query(CompetencyScore).filter(
            CompetencyScore.user_id == test_user.id,
            CompetencyScore.competency_id == sql_comp.id
        ).first()

        updated_python = db.query(CompetencyScore).filter(
            CompetencyScore.user_id == test_user.id,
            CompetencyScore.competency_id == python_comp.id
        ).first()

        print(f"[OK] SQL Score Update (100% Quiz Score): level={updated_sql.current_level}, trend={updated_sql.trend} (1=improving), evidence='{updated_sql.evidence}'")
        print(f"[OK] Python Score Update (0% Quiz Score): level={updated_python.current_level}, trend={updated_python.trend} (-1=declining), evidence='{updated_python.evidence}'")

        assert updated_sql.current_level == 5.0
        assert updated_sql.trend == 1
        assert updated_python.current_level == 1.0
        assert updated_python.trend == -1

        # -------------------------------------------------------------
        # PART C & D: GAP CALCULATION, GRACEFUL EXCLUSION & AI INSIGHTS
        # -------------------------------------------------------------
        print("\n--- PART C & D: Testing Gap Calculation & AI Insight Engine ---")
        gaps = calculate_gaps(test_user.id, db)

        # Confirm non-required competencies like Agricultural Statistics are EXCLUDED
        agri_in_gaps = any(g["competency_name"] == "Agricultural Statistics" for g in gaps)
        print(f"[OK] Graceful Exclusion of non-required competency (Agricultural Statistics in gap list?): {agri_in_gaps} (Expected: False)")
        assert not agri_in_gaps

        # Confirm required competencies are present with computed gaps
        python_gap = next((g for g in gaps if g["competency_name"] == "Python"), None)
        print(f"[OK] Python Gap Record: required={python_gap['required_level']}, current={python_gap['current_level']}, gap={python_gap['gap']}, priority={python_gap['priority']}")
        assert python_gap is not None
        assert python_gap["gap"] == round(python_gap["required_level"] - python_gap["current_level"], 1)

        # Check AI Insights on top gaps
        insights_count = sum(1 for g in gaps if g.get("ai_insight") is not None)
        print(f"[OK] AI Insights generated for top priority gaps: {insights_count}")
        for g in gaps:
            if g.get("ai_insight"):
                print(f"   - [{g['priority']}] {g['competency_name']}: {g['ai_insight']}")

        print("\n=======================================================")
        print("ALL PIPELINE BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY!")
        print("=======================================================")

    finally:
        db.close()

if __name__ == "__main__":
    test_pipeline()
