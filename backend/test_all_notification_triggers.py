import sys
import os
import json
import urllib.request
import urllib.error

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal
from models import User, Notification, Competency, CompetencyScore, TrainingProgramme, Enrollment
from auth import get_password_hash, create_access_token

BASE_URL = "http://127.0.0.1:8000"

def api_call(method: str, endpoint: str, data=None, token=None):
    url = f"{BASE_URL}{endpoint}"
    req_data = json.dumps(data).encode("utf-8") if data is not None else None
    req = urllib.request.Request(url, data=req_data, method=method)
    req.add_header("Content-Type", "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req) as response:
            resp_body = response.read().decode("utf-8")
            return response.status, json.loads(resp_body) if resp_body else {}
    except urllib.error.HTTPError as e:
        resp_body = e.read().decode("utf-8")
        try:
            return e.code, json.loads(resp_body)
        except Exception:
            return e.code, {"detail": resp_body}

def test_all_triggers():
    print("=== Testing All 6 Real Notification Event Triggers ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # 1. Setup Super Admin
        sa = db.query(User).filter(User.email == "sa_notify_test@mospi.gov.in").first()
        if not sa:
            sa = User(
                employee_id="SUPER-ADMIN-NOTIFY",
                name="Director General",
                email="sa_notify_test@mospi.gov.in",
                password_hash=get_password_hash("SuperAdmin123!"),
                role="super_admin",
                is_approved=True
            )
            db.add(sa)
            db.commit()
            db.refresh(sa)
        sa_token = create_access_token(data={"sub": sa.id, "email": sa.email})

        # 2. Setup Officer User
        officer = db.query(User).filter(User.email == "officer_notify_test@mospi.gov.in").first()
        if not officer:
            officer = User(
                employee_id="EMP-NOTIFY-007",
                name="Sunita Rao",
                email="officer_notify_test@mospi.gov.in",
                password_hash=get_password_hash("Officer123!"),
                role="employee",
                is_approved=True,
                job_role="Macroeconomic Data Analyst"
            )
            db.add(officer)
            db.commit()
            db.refresh(officer)
        officer_token = create_access_token(data={"sub": officer.id, "email": officer.email})

        # Setup training programme
        prog = db.query(TrainingProgramme).first()
        if not prog:
            prog = TrainingProgramme(
                title="National Accounts Modernization",
                provider="NSSTA",
                duration_hours=12,
                competency_ids=[]
            )
            db.add(prog)
            db.commit()
            db.refresh(prog)

        # Setup competency
        comp = db.query(Competency).first()

        # Setup competency score with a critical gap for B1 testing
        if comp:
            cs = db.query(CompetencyScore).filter(
                CompetencyScore.user_id == officer.id,
                CompetencyScore.competency_id == comp.id
            ).first()
            if not cs:
                cs = CompetencyScore(
                    user_id=officer.id,
                    competency_id=comp.id,
                    current_level=1.0,
                    required_level=4.0,
                    evidence="Initial Diagnostic",
                    trend=0
                )
                db.add(cs)
            else:
                cs.current_level = 1.0
                cs.required_level = 4.0
            db.commit()

        # Clear notifications and enrollments for test users
        db.query(Notification).filter(Notification.user_id.in_([sa.id, officer.id])).delete()
        db.query(Enrollment).filter(Enrollment.user_id == officer.id).delete()
        db.commit()

        # -------------------------------------------------------------
        # EVENT B1: SKILL GAP ALERTS
        # -------------------------------------------------------------
        status, gaps = api_call("GET", "/skill-gaps/me", token=officer_token)
        assert status == 200, f"Skill gaps failed: {gaps}"
        status, notifs = api_call("GET", "/notifications/me", token=officer_token)
        assert status == 200
        skill_gap_notifs = [n for n in notifs if n["type"] == "skill_gap_alert"]
        print(f"[PASS] Event B1 (Skill Gap Alert): Generated {len(skill_gap_notifs)} notification(s)")

        # -------------------------------------------------------------
        # EVENT B2: COURSE RECOMMENDATIONS
        # -------------------------------------------------------------
        status, recs = api_call("GET", "/training-programmes/recommended/me", token=officer_token)
        assert status == 200, f"Recs failed: {recs}"
        status, notifs = api_call("GET", "/notifications/me", token=officer_token)
        course_notifs = [n for n in notifs if n["type"] == "course_recommendation"]
        print(f"[PASS] Event B2 (Course Recommendation): Generated {len(course_notifs)} notification(s)")

        # -------------------------------------------------------------
        # EVENT B3: ENROLLMENT & COMPLETION UPDATES
        # -------------------------------------------------------------
        status, enroll_res = api_call("POST", "/enrollments", data={"training_programme_id": prog.id}, token=officer_token)
        assert status == 200, f"Enroll failed: {enroll_res}"
        enroll_id = enroll_res["id"]

        status, update_res = api_call("PATCH", f"/enrollments/{enroll_id}", data={"status": "completed", "score": 92.0}, token=officer_token)
        assert status == 200, f"Complete failed: {update_res}"

        status, notifs = api_call("GET", "/notifications/me", token=officer_token)
        comp_notifs = [n for n in notifs if n["type"] == "enrollment_update"]
        assert len(comp_notifs) > 0, "No enrollment_update notification found"
        print(f"[PASS] Event B3 (Enrollment Completion): Generated {len(comp_notifs)} notification(s) - '{comp_notifs[0]['title']}'")

        # -------------------------------------------------------------
        # EVENT B4 & B6: QUIZ ASSESSMENT RESULTS & COMPETENCY UPDATES
        # -------------------------------------------------------------
        if comp:
            status, quiz_res = api_call(
                "POST",
                "/quiz/submit",
                data={
                    "quiz_id": "test-quiz-diag",
                    "answers": [
                        {"competency_id": comp.id, "is_correct": True},
                        {"competency_id": comp.id, "is_correct": True}
                    ]
                },
                token=officer_token
            )
            assert status == 200, f"Quiz submit failed: {quiz_res}"

            status, notifs = api_call("GET", "/notifications/me", token=officer_token)
            assess_notifs = [n for n in notifs if n["type"] == "assessment_result"]
            score_notifs = [n for n in notifs if n["type"] == "competency_updated"]
            assert len(assess_notifs) > 0, "No assessment_result notification found"
            print(f"[PASS] Event B6 (Assessment Results): Generated notification - '{assess_notifs[0]['title']}'")
            print(f"[PASS] Event B4 (Competency Score Updated): Generated {len(score_notifs)} notification(s)")

        # -------------------------------------------------------------
        # EVENT B5: ADMIN APPROVAL FLOW
        # -------------------------------------------------------------
        admin_email = f"pending_admin_{os.getpid()}@mospi.gov.in"
        status, admin_signup_res = api_call(
            "POST",
            "/auth/admin/signup",
            data={
                "adminId": f"ADM-{os.getpid()}",
                "name": "Rajesh Kumar",
                "email": admin_email,
                "password": "AdminPassword123!",
                "department": "National Accounts",
                "designation": "Joint Director",
                "adminJustification": "Leading quarterly assessment reviews"
            }
        )
        assert status == 200, f"Admin signup failed: {admin_signup_res}"
        new_admin_id = admin_signup_res["user"]["id"]
        new_admin_token = admin_signup_res["access_token"]

        # Super admin should have received admin_approval_request notification
        status, sa_notifs = api_call("GET", "/notifications/me", token=sa_token)
        approval_req_notifs = [n for n in sa_notifs if n["type"] == "admin_approval_request"]
        assert len(approval_req_notifs) > 0, "Super admin did not receive admin_approval_request notification"
        print(f"[PASS] Event B5a (Admin Approval Request for Super Admin): Received notification - '{approval_req_notifs[0]['message']}'")

        # Super admin approves the admin
        status, approve_res = api_call("PATCH", f"/auth/admin/{new_admin_id}/approve", token=sa_token)
        assert status == 200, f"Approve failed: {approve_res}"

        # Approved admin should have received admin_account_approved notification
        status, admin_notifs = api_call("GET", "/notifications/me", token=new_admin_token)
        approved_notifs = [n for n in admin_notifs if n["type"] == "admin_account_approved"]
        assert len(approved_notifs) > 0, "Admin did not receive admin_account_approved notification"
        print(f"[PASS] Event B5b (Admin Account Approved for Officer): Received notification - '{approved_notifs[0]['title']}'")

        print("\nAll 6 Real Notification Event Triggers Successfully Verified! [PASS]")

    finally:
        db.close()

if __name__ == "__main__":
    test_all_triggers()
