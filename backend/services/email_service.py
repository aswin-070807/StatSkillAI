import urllib.request
import urllib.parse
import urllib.error
import json
import os
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "dhinesh0805@gmail.com")
SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", "dhinesh0805@gmail.com")

def get_frontend_base_url() -> str:
    url = os.getenv("FRONTEND_BASE_URL") or os.getenv("SITE_URL") or os.getenv("APP_URL") or "http://localhost:8080"
    return url.rstrip("/")

FRONTEND_BASE_URL = get_frontend_base_url()
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
BREVO_API_KEY = os.getenv("BREVO_API_KEY", "")

def _send_email(to_email: str, subject: str, html_content: str, text_content: str) -> bool:
    """
    Sends an email using Resend API or Brevo API if configured, or SMTP,
    or logs payload with detailed diagnostics.
    """
    try:
        safe_subject = subject.encode("ascii", errors="replace").decode("ascii")
        safe_text = text_content.strip().encode("ascii", errors="replace").decode("ascii")
        print(f"\n=======================================================")
        print(f"[OUTBOUND EMAIL DISPATCH] -> To: {to_email}")
        print(f"Subject: {safe_subject}")
        print(f"Timestamp: {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S UTC')}")
        print(f"-------------------------------------------------------")
        print(safe_text)
        print(f"=======================================================\n")
    except Exception:
        print(f"[OUTBOUND EMAIL DISPATCH] -> To: {to_email}")

    resend_key = (os.getenv("RESEND_API_KEY") or RESEND_API_KEY).strip()
    brevo_key = (os.getenv("BREVO_API_KEY") or BREVO_API_KEY).strip()

    if not resend_key and not brevo_key and not (SMTP_HOST and SMTP_USER and SMTP_PASSWORD):
        print(f"[EMAIL WARNING] No RESEND_API_KEY, BREVO_API_KEY, or SMTP credentials set in backend/.env!")
        print(f"[EMAIL WARNING] Outbound verification email for {to_email} was logged to console above.")

    # 1. Resend API
    if resend_key:
        try:
            url = "https://api.resend.com/emails"
            payload = {
                "from": os.getenv("RESEND_FROM_EMAIL", "StatSkill AI <onboarding@resend.dev>"),
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "text": text_content
            }
            headers = {
                "Authorization": f"Bearer {resend_key}",
                "Content-Type": "application/json"
            }
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read().decode("utf-8")
                print(f"\n[RESEND API SUCCESS HTTP {resp.status}]")
                print(f"[RESEND FULL RESPONSE]: {body}\n")
                print(f"[RESEND STATUS] Email delivered to {to_email} via Resend API!")
                return True
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode("utf-8") if http_err.fp else str(http_err)
            print(f"\n[RESEND API ERROR HTTP {http_err.code}]: {err_body}\n")
            if "validation_error" in err_body or "testing emails" in err_body or "domain" in err_body:
                print(f"[RESEND DIAGNOSTIC] Resend free domain restriction detected!")
                print(f"  -> Resend's free tier only delivers to the owner's email account unless a custom domain is verified.")
                print(f"  -> To send to any recipient, verify a domain in Resend or set BREVO_API_KEY in backend/.env.")
        except Exception as e:
            print(f"[RESEND EXCEPTION] Error calling Resend API: {e}")

    # 2. Brevo API (Transactional Email Provider - 300 emails/day free to any address)
    if brevo_key:
        try:
            url = "https://api.brevo.com/v3/smtp/email"
            payload = {
                "sender": {"name": "StatSkill AI", "email": os.getenv("SENDER_EMAIL", "onboarding@statskill.ai")},
                "to": [{"email": to_email}],
                "subject": subject,
                "htmlContent": html_content,
                "textContent": text_content
            }
            headers = {
                "api-key": brevo_key,
                "Content-Type": "application/json",
                "Accept": "application/json"
            }
            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(url, data=data_bytes, headers=headers, method="POST")
            with urllib.request.urlopen(req, timeout=15) as resp:
                body = resp.read().decode("utf-8")
                print(f"\n[BREVO API SUCCESS HTTP {resp.status}]")
                print(f"[BREVO FULL RESPONSE]: {body}\n")
                print(f"[BREVO STATUS] Email delivered to {to_email} via Brevo API!")
                return True
        except urllib.error.HTTPError as http_err:
            err_body = http_err.read().decode("utf-8") if http_err.fp else str(http_err)
            print(f"\n[BREVO API ERROR HTTP {http_err.code}]: {err_body}\n")
        except Exception as e:
            print(f"[BREVO EXCEPTION] Error calling Brevo API: {e}")

    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SMTP_FROM_EMAIL
            msg["To"] = to_email

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SMTP_FROM_EMAIL, to_email, msg.as_string())
            print(f"[SMTP OK] Real email successfully sent to {to_email} via {SMTP_HOST}")
            return True
        except Exception as e:
            print(f"[SMTP ERROR] Could not send via real SMTP ({e}).")
            return False
    else:
        print(f"[DISPATCH LOGGED] Email dispatch logged for {to_email}.")
        return True

def send_verification_email(email: str, name: str, token: str) -> bool:
    """
    Sends a real account verification email to the user's registered inbox via Resend API.
    """
    app_url = get_frontend_base_url()
    verify_url = f"{app_url}/verify-email?email={urllib.parse.quote(email)}&token={urllib.parse.quote(token)}"

    subject = "Verify your StatSkill AI account"

    text_content = f"""
Welcome to StatSkill AI, {name}!

Please verify your registered email address to activate your StatSkill AI account:

{verify_url}

If you did not create this account, please ignore this message.

Best regards,
StatSkill AI Team
Built by Team Byte Blazers
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 24px; }}
    .container {{ max-width: 580px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05); }}
    .header {{ background: #1e3a8a; padding: 28px 24px; text-align: center; color: #ffffff; }}
    .logo {{ font-size: 24px; font-weight: bold; letter-spacing: -0.5px; margin: 0; }}
    .subtitle {{ font-size: 12px; color: #93c5fd; margin-top: 4px; text-transform: uppercase; tracking-wider; font-weight: 600; }}
    .content {{ padding: 32px 28px; text-align: center; }}
    .greeting {{ font-size: 18px; font-weight: bold; color: #0f172a; margin-bottom: 12px; }}
    .text {{ font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 24px; }}
    .btn {{ display: inline-block; background-color: #1e3a8a; color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 14px; box-shadow: 0 4px 12px rgba(30,58,138,0.25); margin: 8px 0 24px 0; }}
    .link-box {{ background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; word-break: break-all; font-family: monospace; font-size: 11px; color: #3b82f6; margin-top: 16px; }}
    .footer {{ background-color: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 12px; border-top: 1px solid #e2e8f0; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">StatSkill AI</div>
      <div class="subtitle">Skill Intelligence Platform</div>
    </div>
    <div class="content">
      <div class="greeting">Welcome to StatSkill AI, {name}!</div>
      <p class="text">
        Thank you for registering. Please click the button below to verify your email address and activate your account.
      </p>
      <a href="{verify_url}" class="btn">Verify Account →</a>
      <p class="text" style="font-size: 12px; color: #64748b;">
        Or copy and paste this verification link into your web browser:
      </p>
      <div class="link-box">{verify_url}</div>
    </div>
    <div class="footer">
      © 2026 StatSkill AI. Built by Team Byte Blazers.
    </div>
  </div>
</body>
</html>
"""
    return _send_email(email, subject, html_content, text_content)

def send_admin_request_email_to_super_admin(admin_user, approval_token: str) -> bool:
    """
    Dispatches an admin access request email to Super Admin (dhinesh0805@gmail.com).
    Contains direct Accept/Reject token links and applicant profile details.
    """
    super_admin = os.getenv("SUPER_ADMIN_EMAIL", "dhinesh0805@gmail.com")
    approve_url = f"{FRONTEND_BASE_URL}/admin-approval?token={approval_token}&action=approve"
    reject_url = f"{FRONTEND_BASE_URL}/admin-approval?token={approval_token}&action=reject"
    dashboard_url = f"{FRONTEND_BASE_URL}/admin-dashboard"

    subject = f"[Action Required] New Admin Access Request: {admin_user.name} ({admin_user.employee_id})"

    text_content = f"""
Ministry of Statistics & Programme Implementation (MoSPI)
StatSkill AI - Security & Workforce Portal

Dear Super Admin ({super_admin}),

A new request for Administrative Access has been submitted:

• Applicant Name: {admin_user.name}
• Admin / Employee ID: {admin_user.employee_id}
• Email Address: {admin_user.email}
• Department: {admin_user.department or 'National Statistical Office'}
• Designation: {admin_user.designation or 'Director / Executive Officer'}
• Justification / Reason:
  "{admin_user.admin_justification or 'Workforce oversight & analytics access'}"

---------------------------------------------------------
DECISION ACTIONS:
To ACCEPT & ACTIVATE this Admin immediately, open:
{approve_url}

To REJECT this request, open:
{reject_url}

Or manage all pending requests directly in your Super Admin Dashboard:
{dashboard_url}
---------------------------------------------------------
StatSkill AI Security System
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
    .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #1e3a8a, #0ea5e9); padding: 24px; text-align: center; color: #ffffff; }}
    .badge {{ display: inline-block; background-color: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px; }}
    .content {{ padding: 28px 24px; }}
    .field-card {{ background-color: #0f172a; border-radius: 8px; border: 1px solid #334155; padding: 16px; margin: 18px 0; }}
    .field-row {{ display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #1e293b; font-size: 14px; }}
    .field-row:last-child {{ border-bottom: none; }}
    .field-label {{ color: #94a3b8; font-weight: 500; }}
    .field-val {{ color: #f8fafc; font-weight: 600; text-align: right; }}
    .justification {{ background-color: #1e293b; border-left: 4px solid #f59e0b; padding: 12px 14px; margin-top: 10px; font-style: italic; color: #e2e8f0; font-size: 13px; }}
    .btn-group {{ margin-top: 28px; text-align: center; }}
    .btn-approve {{ display: inline-block; background: linear-gradient(135deg, #10b981, #059669); color: #ffffff !important; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 6px; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }}
    .btn-reject {{ display: inline-block; background-color: #dc2626; color: #ffffff !important; text-decoration: none; padding: 12px 20px; border-radius: 8px; font-weight: bold; font-size: 14px; margin: 6px; }}
    .btn-dash {{ display: block; margin-top: 14px; color: #38bdf8; text-decoration: underline; font-size: 12px; }}
    .footer {{ background-color: #0f172a; padding: 16px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #334155; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">MoSPI Administrative Authorization</div>
      <h2 style="margin:0; font-size: 22px;">New Admin Access Request</h2>
      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">StatSkill AI Workforce Intelligence System</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Dear Super Administrator (<strong>{super_admin}</strong>),</p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
        A new officer has requested administrative credentials to manage competency frameworks, access workforce analytics, and review officer assessments.
      </p>

      <div class="field-card">
        <div class="field-row"><span class="field-label">Applicant Name:</span><span class="field-val">{admin_user.name}</span></div>
        <div class="field-row"><span class="field-label">Admin / Employee ID:</span><span class="field-val">{admin_user.employee_id}</span></div>
        <div class="field-row"><span class="field-label">Email Address:</span><span class="field-val">{admin_user.email}</span></div>
        <div class="field-row"><span class="field-label">Department:</span><span class="field-val">{admin_user.department or 'National Statistical Office'}</span></div>
        <div class="field-row"><span class="field-label">Designation:</span><span class="field-val">{admin_user.designation or 'Director / Executive Officer'}</span></div>
        <div style="margin-top: 10px;">
          <span class="field-label" style="font-size: 12px;">Stated Justification:</span>
          <div class="justification">"{admin_user.admin_justification or 'Workforce oversight & analytics access'}"</div>
        </div>
      </div>

      <div class="btn-group">
        <a href="{approve_url}" class="btn-approve">✓ Accept & Grant Admin Access</a>
        <a href="{reject_url}" class="btn-reject">✕ Reject Request</a>
        <a href="{dashboard_url}" class="btn-dash">Open Super Admin Dashboard</a>
      </div>
    </div>
    <div class="footer">
      Ministry of Statistics & Programme Implementation (MoSPI) • Automated Security Dispatch
    </div>
  </div>
</body>
</html>
"""
    return _send_email(super_admin, subject, html_content, text_content)

def send_admin_approval_confirmation(admin_user) -> bool:
    """
    Sends an approval confirmation email to the newly approved Admin officer,
    informing them that Super Admin (dhinesh0805@gmail.com) accepted their request
    and their login credentials (email + password) are now fully activated.
    """
    super_admin = os.getenv("SUPER_ADMIN_EMAIL", "dhinesh0805@gmail.com")
    login_url = f"{FRONTEND_BASE_URL}/login"

    subject = "[Approved] Your StatSkill AI Admin Access has been Activated"

    text_content = f"""
Ministry of Statistics & Programme Implementation (MoSPI)
StatSkill AI - Security & Workforce Portal

Dear {admin_user.name},

Great news! Your request for Administrative Access has been REVIEWED and ACCEPTED by Super Administrator ({super_admin}).

Your login credentials are now active:
• Login Email: {admin_user.email}
• Password: [The password you configured during registration]
• Access Level: Administrator

You can now log in immediately at:
{login_url}

Please switch to the "Admin Portal" tab on the login screen.

Regards,
StatSkill AI Security Directorate
Ministry of Statistics & Programme Implementation
"""

    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
    .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }}
    .header {{ background: linear-gradient(135deg, #059669, #10b981); padding: 24px; text-align: center; color: #ffffff; }}
    .content {{ padding: 28px 24px; }}
    .card {{ background-color: #0f172a; border-radius: 8px; border: 1px solid #334155; padding: 16px; margin: 18px 0; }}
    .btn {{ display: inline-block; background: linear-gradient(135deg, #2563eb, #3b82f6); color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; margin: 16px 0; }}
    .footer {{ background-color: #0f172a; padding: 16px; text-align: center; color: #64748b; font-size: 11px; border-top: 1px solid #334155; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin:0; font-size: 22px;">Admin Access Approved ✓</h2>
      <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 13px;">StatSkill AI Workforce Portal</p>
    </div>
    <div class="content">
      <p style="font-size: 15px; margin-top: 0;">Dear <strong>{admin_user.name}</strong>,</p>
      <p style="color: #cbd5e1; font-size: 14px; line-height: 1.5;">
        Your administrative account request has been officially approved by Super Administrator (<strong>{super_admin}</strong>).
      </p>

      <div class="card">
        <p style="margin:0 0 8px 0; color:#38bdf8; font-weight:bold; font-size:14px;">Your Credentials are Activated:</p>
        <p style="margin:4px 0; font-size:13px; color:#e2e8f0;">• <strong>Login Email:</strong> {admin_user.email}</p>
        <p style="margin:4px 0; font-size:13px; color:#e2e8f0;">• <strong>Password:</strong> [Your registered password]</p>
        <p style="margin:4px 0; font-size:13px; color:#e2e8f0;">• <strong>Role:</strong> Administrator</p>
      </div>

      <div style="text-align:center;">
        <a href="{login_url}" class="btn">Sign In to Admin Portal →</a>
      </div>
      <p style="font-size: 12px; color: #94a3b8; text-align: center;">
        Note: On the login page, make sure to select the <strong>Admin Portal</strong> tab.
      </p>
    </div>
    <div class="footer">
      Ministry of Statistics & Programme Implementation (MoSPI)
    </div>
  </div>
</body>
</html>
"""
    return _send_email(admin_user.email, subject, html_content, text_content)

def send_admin_rejection_notice(admin_user) -> bool:
    """
    Sends a rejection notice email to the applicant.
    """
    super_admin = os.getenv("SUPER_ADMIN_EMAIL", "dhinesh0805@gmail.com")
    subject = "Notice regarding your StatSkill AI Admin Access Request"

    text_content = f"""
Ministry of Statistics & Programme Implementation (MoSPI)
StatSkill AI - Security & Workforce Portal

Dear {admin_user.name},

Your request for Administrative Access ({admin_user.email}) has been reviewed by Super Administrator ({super_admin}).
At this time, administrative permissions could not be approved for this account.

If you require standard employee learning and competency access, you may register as an officer using the standard portal.

Regards,
StatSkill AI Security Directorate
"""
    html_content = f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {{ font-family: 'Segoe UI', Helvetica, Arial, sans-serif; background-color: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }}
    .container {{ max-width: 600px; margin: 0 auto; background-color: #1e293b; border-radius: 12px; border: 1px solid #334155; overflow: hidden; }}
    .header {{ background-color: #dc2626; padding: 20px; text-align: center; color: #ffffff; }}
    .content {{ padding: 24px; color: #cbd5e1; font-size: 14px; line-height: 1.5; }}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h3 style="margin:0;">Admin Access Request Update</h3>
    </div>
    <div class="content">
      <p>Dear <strong>{admin_user.name}</strong>,</p>
      <p>Your request for administrative access for <strong>{admin_user.email}</strong> was reviewed by Super Administrator (<strong>{super_admin}</strong>).</p>
      <p>At this stage, administrative privileges have not been approved. Please contact your department head or the Super Admin for further inquiries.</p>
    </div>
  </div>
</body>
</html>
"""
    return _send_email(admin_user.email, subject, html_content, text_content)
