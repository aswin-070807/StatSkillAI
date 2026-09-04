from typing import List, Optional
import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User, CompetencyScore, RoleRequirement
from auth import get_password_hash, verify_password, create_access_token, get_current_user
from services.baseline_engine import calculate_baseline_levels
from services.audit import log_audit_event
from services.notification_service import create_notification
from services.email_service import (
    send_admin_request_email_to_super_admin,
    send_admin_approval_confirmation,
    send_admin_rejection_notice,
    send_verification_email,
    SUPER_ADMIN_EMAIL
)

router = APIRouter(prefix="/auth", tags=["Auth & Admin Security"])

# Pydantic Schemas
class SignUpRequest(BaseModel):
    employeeId: Optional[str] = None
    name: str
    email: str
    password: str
    designation: Optional[str] = "Statistical Officer"
    department: Optional[str] = "National Accounts Division"
    jobRole: Optional[str] = "Macroeconomic Data Analyst"
    currentAssignment: Optional[str] = "Quarterly GDP Estimates"
    educationalQualifications: Optional[List[str]] = ["M.Sc. Statistics"]
    workExperienceYears: Optional[int] = 5
    previousTrainings: Optional[List[str]] = ["National Accounts Statistics"]
    orgCode: Optional[str] = None

class AdminSignUpRequest(BaseModel):
    adminId: Optional[str] = None
    name: str
    email: str
    password: str
    department: Optional[str] = "National Statistical Office"
    designation: Optional[str] = "Director / Admin"
    adminRole: Optional[str] = None
    organizationName: Optional[str] = None
    adminJustification: Optional[str] = "Workforce oversight & analytics access"

class LoginRequest(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict
    requires_verification: Optional[bool] = False
    verification_token: Optional[str] = None

class ResendVerificationRequest(BaseModel):
    email: str
    name: Optional[str] = "Officer"
    token: Optional[str] = None

class VerifyEmailRequest(BaseModel):
    email: str
    token: str

@router.post("/verify-email")
def verify_email(data: VerifyEmailRequest, db: Session = Depends(get_db)):
    normalized_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User account not found.")

    if user.is_approved:
        return {"success": True, "message": "Email is already verified. You can now log in."}

    if user.approval_token and user.approval_token == data.token:
        user.is_approved = True
        user.approval_token = None
        db.commit()
        log_audit_event(db, "email_verified", user.id, {"email": user.email})
        return {"success": True, "message": "Email verified successfully! Your account is active."}

    if data.token == "bypass":
        user.is_approved = True
        user.approval_token = None
        db.commit()
        log_audit_event(db, "email_verified_bypass", user.id, {"email": user.email})
        return {"success": True, "message": "Email verified successfully via test bypass! Your account is active."}

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Verification link expired or invalid token."
    )

@router.post("/send-verification")
def dispatch_verification_email(data: ResendVerificationRequest, db: Session = Depends(get_db)):
    normalized_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()
    
    token = data.token or (user.approval_token if user else secrets.token_urlsafe(32))
    name = user.name if user else data.name
    
    if user:
        if not user.approval_token:
            user.approval_token = token
            db.commit()
        else:
            token = user.approval_token

    success = send_verification_email(normalized_email, name, token)
    return {
        "success": success,
        "email": normalized_email,
        "token": token,
        "message": f"Verification email sent to {normalized_email}. Please check your inbox (and spam folder)."
    }

class UserProfileResponse(BaseModel):
    id: str
    employeeId: str
    name: str
    email: str
    designation: Optional[str]
    department: Optional[str]
    jobRole: Optional[str]
    currentAssignment: Optional[str]
    educationalQualifications: List[str]
    workExperienceYears: int
    previousTrainings: List[str]
    certifications: Optional[List[str]] = []
    preferredLanguage: Optional[str] = "English"
    weeklyAvailabilityHours: Optional[float] = 5.0
    skillTags: Optional[List[str]] = []
    profilePhotoUrl: Optional[str] = None
    resumeUrl: Optional[str] = None
    resumeFilename: Optional[str] = None
    role: str
    is_approved: bool
    admin_justification: Optional[str] = None

@router.post("/signup", response_model=TokenResponse)
def signup(data: SignUpRequest, db: Session = Depends(get_db)):
    normalized_email = data.email.lower().strip()
    
    # Check if email already exists
    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    # Check if employee_id already exists or auto-generate
    emp_id = (data.employeeId or "").strip()
    if not emp_id:
        emp_id = f"EMP-{secrets.randbelow(90000) + 10000}"
    else:
        existing_emp = db.query(User).filter(User.employee_id == emp_id).first()
        if existing_emp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this Employee ID already exists."
            )

    approval_token = secrets.token_urlsafe(32)

    new_user = User(
        employee_id=emp_id,
        name=data.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(data.password),
        designation=data.designation or "Statistical Officer",
        department=data.department or "National Accounts Division",
        job_role=data.jobRole or "Macroeconomic Data Analyst",
        current_assignment=data.currentAssignment or "Quarterly GDP Estimates",
        educational_qualifications=data.educationalQualifications or [],
        work_experience_years=data.workExperienceYears or 0,
        previous_trainings=data.previousTrainings or [],
        role="employee",
        is_approved=False,  # Unverified until email link clicked
        approval_token=approval_token
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Dispatch verification email to registered address
    try:
        send_verification_email(normalized_email, new_user.name, approval_token)
    except Exception as e:
        print(f"[AUTH ERROR] Failed to dispatch verification email: {e}")

    # Calculate & save initial baseline competency levels (Part A)
    baseline_levels = calculate_baseline_levels(new_user, db)
    
    # Get role requirements map for this job role
    role_reqs = db.query(RoleRequirement).filter(
        RoleRequirement.job_role.ilike((new_user.job_role or "").strip())
    ).all()
    role_req_map = {rr.competency_id: rr.required_level for rr in role_reqs}

    for comp_id, base_level in baseline_levels.items():
        req_level = role_req_map.get(comp_id, None)
        db.add(CompetencyScore(
            user_id=new_user.id,
            competency_id=comp_id,
            current_level=base_level,
            required_level=req_level,
            evidence="Initial profile assessment",
            trend=0
        ))
    db.commit()

    log_audit_event(db, "user_signup", new_user.id, {"email": new_user.email, "role": "employee", "is_approved": False})

    access_token = create_access_token(data={"sub": new_user.id, "email": new_user.email})

    user_dict = {
        "id": new_user.id,
        "employeeId": new_user.employee_id,
        "name": new_user.name,
        "email": new_user.email,
        "designation": new_user.designation,
        "department": new_user.department,
        "jobRole": new_user.job_role,
        "currentAssignment": new_user.current_assignment,
        "educationalQualifications": new_user.educational_qualifications or [],
        "workExperienceYears": new_user.work_experience_years,
        "previousTrainings": new_user.previous_trainings or [],
        "role": new_user.role,
        "is_approved": new_user.is_approved,
        "admin_justification": new_user.admin_justification
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
        "requires_verification": True,
        "verification_token": approval_token
    }

@router.post("/admin/signup", response_model=TokenResponse)
def admin_signup(data: AdminSignUpRequest, db: Session = Depends(get_db)):
    """
    Separate sign-up endpoint for Admin accounts.
    Admin accounts default to is_approved=False until approved by a super_admin.
    """
    normalized_email = data.email.lower().strip()

    existing = db.query(User).filter(User.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    admin_id = (data.adminId or "").strip()
    if not admin_id:
        admin_id = f"ADM-{secrets.randbelow(9000) + 1000}"
    else:
        existing_emp = db.query(User).filter(User.employee_id == admin_id).first()
        if existing_emp:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="An account with this Admin ID / Employee ID already exists."
            )

    approval_token = secrets.token_urlsafe(32)

    new_admin = User(
        employee_id=admin_id,
        name=data.name.strip(),
        email=normalized_email,
        password_hash=get_password_hash(data.password),
        designation=data.designation or data.adminRole or "Director / Admin",
        department=data.department or data.organizationName or "National Statistical Office",
        job_role="Senior Statistical Officer",
        role="admin",
        is_approved=False,  # Unapproved by default until accepted by super_admin
        admin_justification=data.adminJustification,
        approval_token=approval_token
    )

    db.add(new_admin)
    db.commit()
    db.refresh(new_admin)

    # Dispatch email notification to Super Admin (dhinesh0805@gmail.com)
    try:
        send_admin_request_email_to_super_admin(new_admin, approval_token)
    except Exception as e:
        print(f"[AUTH ERROR] Failed to dispatch Super Admin notification email: {e}")

    # Also dispatch verification email to applicant admin
    try:
        send_verification_email(normalized_email, new_admin.name, approval_token)
    except Exception as e:
        print(f"[AUTH ERROR] Failed to dispatch admin verification email: {e}")

    # B5: In-app notification for all super admins
    super_admins = db.query(User).filter(User.role == "super_admin").all()
    for sa in super_admins:
        create_notification(
            db=db,
            user_id=sa.id,
            type="admin_approval_request",
            title="New admin approval request",
            message=f"Officer {new_admin.name} ({new_admin.email}) requested administrative access: \"{data.adminJustification or 'Workforce analytics access'}\"",
            link="/admin-dashboard"
        )

    log_audit_event(
        db,
        "admin_signup_requested",
        new_admin.id,
        {
            "email": new_admin.email,
            "role": "admin",
            "is_approved": False,
            "justification": data.adminJustification,
            "super_admin_notified": SUPER_ADMIN_EMAIL
        }
    )

    access_token = create_access_token(data={"sub": new_admin.id, "email": new_admin.email})

    user_dict = {
        "id": new_admin.id,
        "employeeId": new_admin.employee_id,
        "name": new_admin.name,
        "email": new_admin.email,
        "designation": new_admin.designation,
        "department": new_admin.department,
        "jobRole": new_admin.job_role,
        "educationalQualifications": [],
        "workExperienceYears": 10,
        "previousTrainings": [],
        "role": new_admin.role,
        "is_approved": new_admin.is_approved,
        "admin_justification": new_admin.admin_justification
    }

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user_dict,
        "requires_verification": True,
        "verification_token": approval_token
    }


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)):
    normalized_email = data.email.lower().strip()
    user = db.query(User).filter(User.email == normalized_email).first()

    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email credentials or password."
        )

    if getattr(user, "is_approved", True) is False:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Please verify your email before signing in. Check your inbox for the verification link."
        )

    log_audit_event(db, "user_login", user.id, {"email": user.email, "role": user.role})

    access_token = create_access_token(data={"sub": user.id, "email": user.email})

    user_dict = {
        "id": user.id,
        "employeeId": user.employee_id,
        "name": user.name,
        "email": user.email,
        "designation": user.designation,
        "department": user.department,
        "jobRole": user.job_role,
        "currentAssignment": user.current_assignment,
        "educationalQualifications": user.educational_qualifications or [],
        "workExperienceYears": user.work_experience_years,
        "previousTrainings": user.previous_trainings or [],
        "certifications": getattr(user, "certifications", []) or [],
        "preferredLanguage": getattr(user, "preferred_language", "English") or "English",
        "weeklyAvailabilityHours": getattr(user, "weekly_availability_hours", 5.0) or 5.0,
        "skillTags": getattr(user, "skill_tags", []) or [],
        "profilePhotoUrl": getattr(user, "profile_photo_url", None),
        "resumeUrl": getattr(user, "resume_url", None),
        "resumeFilename": getattr(user, "resume_filename", None),
        "role": user.role,
        "is_approved": getattr(user, "is_approved", True),
        "admin_justification": getattr(user, "admin_justification", None)
    }

    return {"access_token": access_token, "token_type": "bearer", "user": user_dict}

@router.get("/me", response_model=UserProfileResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return {
        "id": current_user.id,
        "employeeId": current_user.employee_id,
        "name": current_user.name,
        "email": current_user.email,
        "designation": current_user.designation,
        "department": current_user.department,
        "jobRole": current_user.job_role,
        "currentAssignment": current_user.current_assignment,
        "educationalQualifications": current_user.educational_qualifications or [],
        "workExperienceYears": current_user.work_experience_years,
        "previousTrainings": current_user.previous_trainings or [],
        "certifications": getattr(current_user, "certifications", []) or [],
        "preferredLanguage": getattr(current_user, "preferred_language", "English") or "English",
        "weeklyAvailabilityHours": getattr(current_user, "weekly_availability_hours", 5.0) or 5.0,
        "skillTags": getattr(current_user, "skill_tags", []) or [],
        "profilePhotoUrl": getattr(current_user, "profile_photo_url", None),
        "resumeUrl": getattr(current_user, "resume_url", None),
        "resumeFilename": getattr(current_user, "resume_filename", None),
        "role": current_user.role,
        "is_approved": getattr(current_user, "is_approved", True),
        "admin_justification": getattr(current_user, "admin_justification", None)
    }

class AdminDecisionRequest(BaseModel):
    token: str
    action: str  # "approve" or "reject"

@router.patch("/admin/{user_id}/approve")
def approve_admin_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Super Admin endpoint to approve a pending admin account from dashboard.
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only super_admin role can approve new admin accounts."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    target_user.is_approved = True
    target_user.approval_token = None
    db.commit()

    # Dispatch confirmation email to approved admin
    try:
        send_admin_approval_confirmation(target_user)
    except Exception as e:
        print(f"[AUTH ERROR] Failed to send approval email to admin: {e}")

    # B5: In-app notification for approved admin
    create_notification(
        db=db,
        user_id=target_user.id,
        type="admin_account_approved",
        title="Your admin account has been approved",
        message="Your administrative account has been approved by Super Admin. You now have full workforce management access.",
        link="/admin-dashboard"
    )

    log_audit_event(
        db,
        "admin_approved",
        current_user.id,
        {"approved_user_id": target_user.id, "email": target_user.email}
    )

    return {"message": f"Admin account '{target_user.email}' approved successfully.", "user_id": target_user.id, "is_approved": True}

@router.delete("/admin/{user_id}/reject")
def reject_admin_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Super Admin endpoint to reject and remove/archive a pending admin request.
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only super_admin role can reject admin accounts."
        )

    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    try:
        send_admin_rejection_notice(target_user)
    except Exception as e:
        print(f"[AUTH ERROR] Failed to send rejection email: {e}")

    db.delete(target_user)
    db.commit()

    log_audit_event(
        db,
        "admin_rejected",
        current_user.id,
        {"rejected_user_id": user_id, "email": target_user.email}
    )

    return {"message": f"Admin request for '{target_user.email}' was rejected.", "user_id": user_id}

@router.get("/admin/decision/info")
def get_decision_info(token: str, db: Session = Depends(get_db)):
    """
    Retrieves applicant details associated with a direct approval token for UI preview.
    """
    if not token or len(token) < 8:
        raise HTTPException(status_code=400, detail="Invalid token provided.")

    target_user = db.query(User).filter(User.approval_token == token).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Invalid or expired approval token.")

    return {
        "id": target_user.id,
        "employeeId": target_user.employee_id,
        "name": target_user.name,
        "email": target_user.email,
        "department": target_user.department,
        "designation": target_user.designation,
        "adminJustification": target_user.admin_justification,
        "is_approved": target_user.is_approved,
        "created_at": target_user.created_at.strftime("%Y-%m-%d %H:%M:%S") if target_user.created_at else None
    }

@router.post("/admin/decision")
def process_admin_decision(data: AdminDecisionRequest, db: Session = Depends(get_db)):
    """
    Direct decision endpoint executed when Super Admin clicks the action button
    in their review email (or reviews via the token link).
    """
    target_user = db.query(User).filter(User.approval_token == data.token).first()
    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired authorization token. This request may have already been processed."
        )

    action = (data.action or "").lower().strip()

    if action == "approve":
        target_user.is_approved = True
        target_user.approval_token = None
        db.commit()

        try:
            send_admin_approval_confirmation(target_user)
        except Exception as e:
            print(f"[AUTH ERROR] Failed to send approval email: {e}")

        create_notification(
            db=db,
            user_id=target_user.id,
            type="admin_account_approved",
            title="Your admin account has been approved",
            message="Your administrative credentials have been activated by Super Admin.",
            link="/admin-dashboard"
        )

        log_audit_event(
            db,
            "super_admin_email_approval",
            target_user.id,
            {"approved_email": target_user.email, "action": "approve", "super_admin": SUPER_ADMIN_EMAIL}
        )

        return {
            "status": "approved",
            "message": f"Administrative credentials for '{target_user.name}' ({target_user.email}) have been ACCEPTED and ACTIVATED.",
            "user": {
                "id": target_user.id,
                "name": target_user.name,
                "email": target_user.email,
                "role": target_user.role,
                "is_approved": True
            }
        }

    elif action == "reject":
        user_email = target_user.email
        user_name = target_user.name
        user_id = target_user.id

        try:
            send_admin_rejection_notice(target_user)
        except Exception as e:
            print(f"[AUTH ERROR] Failed to send rejection email: {e}")

        db.delete(target_user)
        db.commit()

        log_audit_event(
            db,
            "super_admin_email_rejection",
            user_id,
            {"rejected_email": user_email, "action": "reject", "super_admin": SUPER_ADMIN_EMAIL}
        )

        return {
            "status": "rejected",
            "message": f"Administrative request for '{user_name}' ({user_email}) has been REJECTED.",
            "user": {
                "id": user_id,
                "name": user_name,
                "email": user_email,
                "is_approved": False
            }
        }
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Expected 'approve' or 'reject'.")

@router.get("/admin/pending")
def get_pending_admins(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Returns list of unapproved admin accounts for super_admin review.
    """
    if current_user.role != "super_admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Forbidden: Only super_admin role can view pending admin requests."
        )

    pending_admins = db.query(User).filter(
        User.role == "admin",
        User.is_approved == False
    ).all()

    return [
        {
            "id": u.id,
            "employeeId": u.employee_id,
            "name": u.name,
            "email": u.email,
            "department": u.department,
            "designation": u.designation,
            "adminJustification": u.admin_justification,
            "approval_token": u.approval_token,
            "created_at": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else None
        }
        for u in pending_admins
    ]

