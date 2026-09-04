import urllib.request
import urllib.parse
import json

BASE_URL = "http://localhost:8000"

def make_req(endpoint, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    url = f"{BASE_URL}{endpoint}"
    req_data = None
    if data is not None:
        req_data = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"

    req = urllib.request.Request(url, data=req_data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            return response.status, json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        return e.code, json.loads(body) if body.startswith("{") else body

def test_full_approval_flow():
    print("Testing Super Admin approval workflow...")

    test_email = "test_applicant_admin@mospi.gov.in"
    signup_data = {
        "adminId": "ADM-TEST-999",
        "name": "Test Officer Kumar",
        "email": test_email,
        "password": "Password123!",
        "department": "National Accounts Division",
        "designation": "Joint Director",
        "adminJustification": "Overseeing quarterly statistical index development."
    }

    # 1. Signup
    status, res = make_req("/auth/admin/signup", "POST", signup_data)
    print("Signup Response Status:", status)
    if status == 200:
        print("[OK] Admin Signup successful! is_approved:", res["user"]["is_approved"])
    else:
        print("Signup result:", res)

    # 2. Login before approval
    status, login_res = make_req("/auth/login", "POST", {
        "email": test_email,
        "password": "Password123!"
    })
    print("Login Before Approval Response:", status, login_res.get("user", {}).get("is_approved"))

    # 3. Super Admin Login
    status, sa_res = make_req("/auth/login", "POST", {
        "email": "dhinesh0805@gmail.com",
        "password": "SuperAdmin123!"
    })
    print("Super Admin Login Status:", status)
    sa_token = sa_res["access_token"]

    # 4. Get Pending Admins
    headers = {"Authorization": f"Bearer {sa_token}"}
    status, pending_list = make_req("/auth/admin/pending", "GET", headers=headers)
    print("Pending Admins count:", len(pending_list))
    target = next((p for p in pending_list if p["email"] == test_email), None)

    if target and target.get("approval_token"):
        token = target["approval_token"]
        print("[OK] Found approval token for test admin:", token[:10] + "...")

        # 5. Test Decision Info endpoint
        status, info_res = make_req(f"/auth/admin/decision/info?token={token}", "GET")
        print("Decision Info Status:", status, info_res.get("name"))

        # 6. Test Decision Approve by Token
        status, decision_res = make_req("/auth/admin/decision", "POST", {
            "token": token,
            "action": "approve"
        })
        print("Decision POST Status:", status, decision_res.get("status"))

        # 7. Login after approval
        status, login_after_res = make_req("/auth/login", "POST", {
            "email": test_email,
            "password": "Password123!"
        })
        print("[OK] Login After Approval: is_approved =", login_after_res.get("user", {}).get("is_approved"))
        assert login_after_res.get("user", {}).get("is_approved") == True
        print("\n>>> ALL APPROVAL WORKFLOW TESTS PASSED SUCCESSFULLY! <<<\n")

if __name__ == "__main__":
    test_full_approval_flow()
