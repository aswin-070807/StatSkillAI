import os
import json
import uuid
import re
from typing import List, Optional, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from database import get_db
from models import User
from auth import get_current_user
from services.audit import log_audit_event

try:
    import anthropic
    HAS_ANTHROPIC = True
except ImportError:
    HAS_ANTHROPIC = False

router = APIRouter(prefix="/profile", tags=["Officer Profile"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
RESUME_DIR = os.path.join(UPLOAD_DIR, "resumes")
PHOTO_DIR = os.path.join(UPLOAD_DIR, "photos")

os.makedirs(RESUME_DIR, exist_ok=True)
os.makedirs(PHOTO_DIR, exist_ok=True)

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str
    designation: str
    department: str
    jobRole: str
    currentAssignment: Optional[str] = None
    workExperienceYears: int
    educationalQualifications: Optional[List[str]] = []
    previousTrainings: Optional[List[str]] = []
    certifications: Optional[List[str]] = []
    preferredLanguage: Optional[str] = "English"
    weeklyAvailabilityHours: Optional[float] = 5.0
    skillTags: Optional[List[str]] = []
    profilePhotoUrl: Optional[str] = None
    resumeUrl: Optional[str] = None
    resumeFilename: Optional[str] = None

class ProfileResponse(BaseModel):
    id: str
    employeeId: str
    name: str
    email: str
    designation: Optional[str]
    department: Optional[str]
    jobRole: Optional[str]
    currentAssignment: Optional[str]
    workExperienceYears: int
    educationalQualifications: List[str]
    previousTrainings: List[str]
    certifications: List[str]
    preferredLanguage: str
    weeklyAvailabilityHours: float
    skillTags: List[str]
    profilePhotoUrl: Optional[str]
    resumeUrl: Optional[str]
    resumeFilename: Optional[str]
    role: str
    is_approved: bool
    updatedAt: Optional[str]

def extract_text_from_file(file_path: str, filename: str) -> str:
    ext = os.path.splitext(filename)[1].lower()
    text = ""

    if ext == ".pdf":
        try:
            import pypdf
            reader = pypdf.PdfReader(file_path)
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            print(f"pypdf extraction notice: {e}")
            try:
                # Fallback simple binary string match for raw pdf text
                with open(file_path, "rb") as f:
                    content = f.read().decode("latin-1", errors="ignore")
                    text = " ".join(re.findall(r"[A-Za-z0-9\s.,\-\(\)]{3,}", content))
            except Exception:
                text = ""

    elif ext in (".docx", ".doc"):
        try:
            import docx
            doc = docx.Document(file_path)
            text = "\n".join([p.text for p in doc.paragraphs if p.text])
        except Exception as e:
            print(f"docx extraction notice: {e}")
            try:
                import zipfile
                import xml.etree.ElementTree as ET
                with zipfile.ZipFile(file_path) as z:
                    xml_content = z.read("word/document.xml")
                    tree = ET.fromstring(xml_content)
                    text = "".join(tree.itertext())
            except Exception:
                text = ""

    return text.strip()

@router.get("", response_model=ProfileResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return ProfileResponse(
        id=current_user.id,
        employeeId=current_user.employee_id,
        name=current_user.name,
        email=current_user.email,
        designation=current_user.designation,
        department=current_user.department,
        jobRole=current_user.job_role,
        currentAssignment=current_user.current_assignment,
        workExperienceYears=current_user.work_experience_years,
        educationalQualifications=current_user.educational_qualifications or [],
        previousTrainings=current_user.previous_trainings or [],
        certifications=current_user.certifications or [],
        preferredLanguage=current_user.preferred_language or "English",
        weeklyAvailabilityHours=current_user.weekly_availability_hours or 5.0,
        skillTags=current_user.skill_tags or [],
        profilePhotoUrl=current_user.profile_photo_url,
        resumeUrl=current_user.resume_url,
        resumeFilename=current_user.resume_filename,
        role=current_user.role,
        is_approved=current_user.is_approved,
        updatedAt=current_user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.updated_at else None,
    )

@router.put("", response_model=ProfileResponse)
def update_profile(
    data: ProfileUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validation
    if not data.name.strip():
        raise HTTPException(status_code=400, detail="Full Name cannot be empty.")
    
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not re.match(email_regex, data.email.strip()):
        raise HTTPException(status_code=400, detail="Invalid official email address format.")

    if not data.designation.strip():
        raise HTTPException(status_code=400, detail="Designation cannot be empty.")

    if not data.department.strip():
        raise HTTPException(status_code=400, detail="Department cannot be empty.")

    if not data.jobRole.strip():
        raise HTTPException(status_code=400, detail="Job Role Cadre cannot be empty.")

    if data.workExperienceYears < 0:
        raise HTTPException(status_code=400, detail="Years of Experience must be a non-negative number.")

    current_user.name = data.name.strip()
    current_user.email = data.email.strip().lower()
    current_user.designation = data.designation.strip()
    current_user.department = data.department.strip()
    current_user.job_role = data.jobRole.strip()
    current_user.current_assignment = (data.currentAssignment or "").strip()
    current_user.work_experience_years = data.workExperienceYears
    current_user.educational_qualifications = data.educationalQualifications or []
    current_user.previous_trainings = data.previousTrainings or []
    current_user.certifications = data.certifications or []
    current_user.preferred_language = data.preferredLanguage or "English"
    current_user.weekly_availability_hours = data.weeklyAvailabilityHours or 5.0
    current_user.skill_tags = data.skillTags or []
    
    if data.profilePhotoUrl:
        current_user.profile_photo_url = data.profilePhotoUrl
    if data.resumeUrl:
        current_user.resume_url = data.resumeUrl
    if data.resumeFilename:
        current_user.resume_filename = data.resumeFilename

    current_user.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    log_audit_event(db, "profile_update", current_user.id, {"email": current_user.email})

    return ProfileResponse(
        id=current_user.id,
        employeeId=current_user.employee_id,
        name=current_user.name,
        email=current_user.email,
        designation=current_user.designation,
        department=current_user.department,
        jobRole=current_user.job_role,
        currentAssignment=current_user.current_assignment,
        workExperienceYears=current_user.work_experience_years,
        educationalQualifications=current_user.educational_qualifications or [],
        previousTrainings=current_user.previous_trainings or [],
        certifications=current_user.certifications or [],
        preferredLanguage=current_user.preferred_language or "English",
        weeklyAvailabilityHours=current_user.weekly_availability_hours or 5.0,
        skillTags=current_user.skill_tags or [],
        profilePhotoUrl=current_user.profile_photo_url,
        resumeUrl=current_user.resume_url,
        resumeFilename=current_user.resume_filename,
        role=current_user.role,
        is_approved=current_user.is_approved,
        updatedAt=current_user.updated_at.strftime("%Y-%m-%d %H:%M:%S") if current_user.updated_at else None,
    )


@router.post("/upload-resume")
async def upload_and_parse_resume(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = file.filename or "resume.pdf"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in (".pdf", ".docx", ".doc"):
        raise HTTPException(
            status_code=400,
            detail="Invalid file format. Please upload a PDF or DOCX file."
        )

    # Read content & check size limit (5MB = 5 * 1024 * 1024 bytes)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds maximum limit of 5MB."
        )

    # Store file locally
    unique_id = str(uuid.uuid4())[:8]
    stored_filename = f"{current_user.employee_id}_{unique_id}_{filename}"
    file_path = os.path.join(RESUME_DIR, stored_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    resume_url = f"/uploads/resumes/{stored_filename}"

    # Extract text from resume file
    extracted_text = extract_text_from_file(file_path, filename)

    parsed_result = {
        "educational_qualifications": [],
        "work_experience_years": None,
        "previous_trainings": [],
        "technical_skills": []
    }

    anthropic_key = os.getenv("ANTHROPIC_API_KEY")

    if HAS_ANTHROPIC and anthropic_key and extracted_text:
        try:
            client = anthropic.Anthropic(api_key=anthropic_key)
            prompt = f"Extract the following fields from this resume text, if present, and return strict JSON with keys: educational_qualifications (array of strings), work_experience_years (number), previous_trainings (array of strings), technical_skills (array of strings). Do not invent information not present in the text. If a field isn't found, return an empty array or null. Resume text:\n{extracted_text}"

            response = client.messages.create(
                model="claude-sonnet-4-6",
                max_tokens=1000,
                messages=[{"role": "user", "content": prompt}]
            )

            res_text = response.content[0].text.strip()
            if res_text.startswith("```json"):
                res_text = res_text[7:]
            if res_text.startswith("```"):
                res_text = res_text[3:]
            if res_text.endswith("```"):
                res_text = res_text[:-3]

            parsed_data = json.loads(res_text.strip())
            parsed_result["educational_qualifications"] = parsed_data.get("educational_qualifications") or []
            parsed_result["work_experience_years"] = parsed_data.get("work_experience_years")
            parsed_result["previous_trainings"] = parsed_data.get("previous_trainings") or []
            parsed_result["technical_skills"] = parsed_data.get("technical_skills") or []
        except Exception as e:
            print(f"Anthropic resume parsing notice: {e}")

    # Local regex fallback parsing if AI parsing wasn't triggered or returned empty
    if not parsed_result["educational_qualifications"] and extracted_text:
        degrees = re.findall(r"\b(M\.Sc|B\.Sc|Ph\.D|M\.Tech|B\.Tech|MBA|M\.A|B\.A|Master|Bachelor)[^\n,]*", extracted_text, re.IGNORECASE)
        if degrees:
            parsed_result["educational_qualifications"] = list(set([d.strip() for d in degrees]))[:3]

    if parsed_result["work_experience_years"] is None and extracted_text:
        exp_match = re.search(r"(\d+)\+?\s*years?\s*(?:of)?\s*experience", extracted_text, re.IGNORECASE)
        if exp_match:
            try:
                parsed_result["work_experience_years"] = int(exp_match.group(1))
            except ValueError:
                pass

    current_user.resume_url = resume_url
    current_user.resume_filename = filename
    db.commit()

    return {
        "success": True,
        "resume_url": resume_url,
        "resume_filename": filename,
        "extracted_text_preview": extracted_text[:300] if extracted_text else "",
        "parsed_data": parsed_result
    }


@router.post("/upload-photo")
async def upload_profile_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    filename = file.filename or "photo.jpg"
    ext = os.path.splitext(filename)[1].lower()

    if ext not in (".jpg", ".jpeg", ".png", ".webp"):
        raise HTTPException(
            status_code=400,
            detail="Invalid image format. Please upload a JPG, PNG, or WEBP image."
        )

    contents = await file.read()
    if len(contents) > 2 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="Profile photo size exceeds limit of 2MB."
        )

    unique_id = str(uuid.uuid4())[:8]
    stored_filename = f"{current_user.employee_id}_{unique_id}_{filename}"
    file_path = os.path.join(PHOTO_DIR, stored_filename)

    with open(file_path, "wb") as f:
        f.write(contents)

    photo_url = f"/uploads/photos/{stored_filename}"
    current_user.profile_photo_url = photo_url
    db.commit()

    return {"success": True, "photo_url": photo_url}
