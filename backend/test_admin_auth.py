import urllib.request
import json

BASE_URL = "http://localhost:8000"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8")
            return resp.status, json.loads(body) if body else {}
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        try:
            parsed_body = json.loads(body)
        except Exception:
            parsed_body = {"detail": body}
        return e.code, parsed_body

def run_tests():
    print("=======================================================")
    print("RUNNING PART E2: END-TO-END ADMIN AUTH & RBAC VERIFICATION")
    print("=======================================================")

    # 1. Test 1: Employee signup & login
    print("\n[TEST 1] Employee Signup & Login...")
    emp_email = "test_emp_01@mospi.gov.in"
    emp_signup_data = {
        "employeeId": "EMP-90001",
        "name": "Test Officer 1",
        "email": emp_email,
        "password": "Password123!",
        "designation": "Statistical Officer",
        "department": "National Accounts Division"
    }
    status, res = make_request(f"{BASE_URL}/auth/signup", method="POST", data=emp_signup_data)
    if status == 400 and "already exists" in str(res):
        status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": emp_email, "password": "Password123!"})
    
    assert status == 200, f"Employee auth failed: {res}"
    emp_token = res["access_token"]
    emp_user = res["user"]
    print(f" -> Employee User Role: {emp_user['role']} | Approved: {emp_user['is_approved']}")
    assert emp_user["role"] == "employee"
    assert emp_user["is_approved"] is True
    print(" -> [OK] Test 1 Passed!")

    # 2. Test 2: New Admin Signup (is_approved=False) & RBAC Block
    print("\n[TEST 2] Admin Signup (is_approved=False) & RBAC Check...")
    adm_email = "test_admin_01@mospi.gov.in"
    adm_signup_data = {
        "adminId": "ADM-90001",
        "name": "Test Admin 1",
        "email": adm_email,
        "password": "AdminPassword123!",
        "department": "NSO Data Division",
        "designation": "Deputy Director",
        "adminJustification": "Executive audit of national survey microdata"
    }
    status, res = make_request(f"{BASE_URL}/auth/admin/signup", method="POST", data=adm_signup_data)
    if status == 400 and "already exists" in str(res):
        status, res = make_request(f"{BASE_URL}/auth/login", method="POST", data={"email": adm_email, "password": "AdminPassword123!"})

    assert status == 200, f"Admin signup failed: {res}"
    new_adm_token = res["access_token"]
    new_adm_user = res["user"]
    new_adm_id = new_adm_user["id"]
    print(f" -> New Admin Role: {new_adm_user['role']} | Approved: {new_adm_user['is_approved']}")
    assert new_adm_user["role"] == "admin"
    assert new_adm_user["is_approved"] is False

    # Attempt to access /admin/metrics with unapproved admin token
    status_unapp, res_unapp = make_request(
        f"{BASE_URL}/admin/metrics",
        method="GET",
        headers={"Authorization": f"Bearer {new_adm_token}"}
    )
    print(f" -> Unapproved Admin GET /admin/metrics status: {status_unapp}")
    assert status_unapp == 403, f"Expected 403 Forbidden, got {status_unapp}"
    print(" -> [OK] Test 2 Passed (Unapproved admin rejected with 403 Forbidden)!")

    # 3. Test 3: Super Admin Login & Approval
    print("\n[TEST 3] Super Admin Login & Approval Flow...")
    status_super, res_super = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        data={"email": "dhinesh0805@gmail.com", "password": "SuperAdmin123!"}
    )
    assert status_super == 200, f"Super admin login failed: {res_super}"
    super_token = res_super["access_token"]
    super_user = res_super["user"]
    print(f" -> Super Admin Role: {super_user['role']} | Approved: {super_user['is_approved']}")
    assert super_user["role"] == "super_admin"

    # Call approval endpoint
    status_app, res_app = make_request(
        f"{BASE_URL}/auth/admin/{new_adm_id}/approve",
        method="PATCH",
        headers={"Authorization": f"Bearer {super_token}"}
    )
    assert status_app == 200, f"Admin approval failed: {res_app}"
    print(f" -> Approval response: {res_app}")
    print(" -> [OK] Test 3 Passed!")

    # 4. Test 4: Now-Approved Admin Accesses /admin/metrics
    print("\n[TEST 4] Approved Admin Dashboard Access...")
    status_relog, res_relog = make_request(
        f"{BASE_URL}/auth/login",
        method="POST",
        data={"email": adm_email, "password": "AdminPassword123!"}
    )
    assert status_relog == 200
    approved_token = res_relog["access_token"]
    approved_user = res_relog["user"]
    assert approved_user["is_approved"] is True

    status_adm_metrics, res_adm_metrics = make_request(
        f"{BASE_URL}/admin/metrics",
        method="GET",
        headers={"Authorization": f"Bearer {approved_token}"}
    )
    print(f" -> Approved Admin GET /admin/metrics status: {status_adm_metrics}")
    assert status_adm_metrics == 200, f"Expected 200 OK, got {status_adm_metrics}"
    print(" -> [OK] Test 4 Passed (Approved admin received 200 OK)!")

    # 5. Test 5: Employee Accessing /admin/metrics Rejected
    print("\n[TEST 5] Employee Accessing /admin/metrics...")
    status_emp_adm, res_emp_adm = make_request(
        f"{BASE_URL}/admin/metrics",
        method="GET",
        headers={"Authorization": f"Bearer {emp_token}"}
    )
    print(f" -> Employee GET /admin/metrics status: {status_emp_adm}")
    assert status_emp_adm == 403, f"Expected 403 Forbidden, got {status_emp_adm}"
    print(" -> [OK] Test 5 Passed (Employee access blocked with 403 Forbidden)!")

    print("\n=======================================================")
    print("ALL 5 END-TO-END TESTS PASSED SUCCESSFULLY!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
