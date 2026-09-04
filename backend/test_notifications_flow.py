import sys
import os
import json
import urllib.request
import urllib.error

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal
from models import User, Notification, Competency, CompetencyScore
from auth import get_password_hash, create_access_token
from services.notification_service import create_notification

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

def run_tests():
    print("=== Testing Notification Backend Functionality ===")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Create test users
        user1 = db.query(User).filter(User.email == "test_notify_emp@mospi.gov.in").first()
        if not user1:
            user1 = User(
                employee_id="NOTIFY-EMP-01",
                name="Test Notification Officer",
                email="test_notify_emp@mospi.gov.in",
                password_hash=get_password_hash("Pass123!"),
                role="employee"
            )
            db.add(user1)
            db.commit()
            db.refresh(user1)

        user2 = db.query(User).filter(User.email == "test_notify_other@mospi.gov.in").first()
        if not user2:
            user2 = User(
                employee_id="NOTIFY-EMP-02",
                name="Another Officer",
                email="test_notify_other@mospi.gov.in",
                password_hash=get_password_hash("Pass123!"),
                role="employee"
            )
            db.add(user2)
            db.commit()
            db.refresh(user2)

        # Clear notifications for test users
        db.query(Notification).filter(Notification.user_id.in_([user1.id, user2.id])).delete()
        db.commit()

        token1 = create_access_token(data={"sub": user1.id, "email": user1.email})
        token2 = create_access_token(data={"sub": user2.id, "email": user2.email})

        # 1. Test unread count initially 0
        status, res = api_call("GET", "/notifications/me/unread-count", token=token1)
        assert status == 200, f"Failed: {res}"
        assert res["unread_count"] == 0
        print("[PASS] Initial unread count is 0")

        # 2. Test create notifications across types
        n1 = create_notification(db, user1.id, "skill_gap_alert", "Critical skill gap: Python", "Your Python gap increased to 2.2.", "/skill-gaps")
        n2 = create_notification(db, user1.id, "course_recommendation", "New course recommended", "National Accounts Methodology", "/learning-path")
        n3 = create_notification(db, user1.id, "assessment_result", "Assessment results ready", "Scored 90%", "/quiz-history")
        
        # Another user notification
        n_other = create_notification(db, user2.id, "system", "System Update", "Maintenance scheduled", None)

        # 3. Test GET /notifications/me
        status, res = api_call("GET", "/notifications/me", token=token1)
        assert status == 200
        assert len(res) == 3, f"Expected 3, got {len(res)}"
        print(f"[PASS] GET /notifications/me returned {len(res)} items for user1")

        # 4. Test unread count is 3
        status, res = api_call("GET", "/notifications/me/unread-count", token=token1)
        assert status == 200
        assert res["unread_count"] == 3
        print("[PASS] Unread count is 3")

        # 5. Test PATCH /notifications/{id}/read
        status, res = api_call("PATCH", f"/notifications/{n1.id}/read", token=token1)
        assert status == 200
        assert res["is_read"] is True
        
        status, res = api_call("GET", "/notifications/me/unread-count", token=token1)
        assert res["unread_count"] == 2
        print("[PASS] Single notification marked read, unread count now 2")

        # 6. Test ownership isolation: user2 cannot read user1's notification
        status, res = api_call("PATCH", f"/notifications/{n2.id}/read", token=token2)
        assert status == 404
        print("[PASS] Access control verified: unauthorized user cannot mark others' notifications as read")

        # 7. Test ownership isolation: user2 cannot delete user1's notification
        status, res = api_call("DELETE", f"/notifications/{n2.id}", token=token2)
        assert status == 404
        print("[PASS] Access control verified: unauthorized user cannot delete others' notifications")

        # 8. Test PATCH /notifications/me/read-all
        status, res = api_call("PATCH", "/notifications/me/read-all", token=token1)
        assert status == 200
        
        status, res = api_call("GET", "/notifications/me/unread-count", token=token1)
        assert res["unread_count"] == 0
        print("[PASS] Mark all as read worked, unread count is 0")

        # 9. Test DELETE /notifications/{id}
        status, res = api_call("DELETE", f"/notifications/{n3.id}", token=token1)
        assert status == 200
        
        status, res = api_call("GET", "/notifications/me", token=token1)
        assert len(res) == 2
        print("[PASS] Notification deletion verified")

        print("\nAll Backend Notification Endpoints & Event Tests Passed Successfully! [PASS]")

    finally:
        db.close()

if __name__ == "__main__":
    run_tests()
