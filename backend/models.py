import datetime
import uuid
from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from database import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    employee_id = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    designation = Column(String, nullable=True)
    department = Column(String, nullable=True)
    job_role = Column(String, nullable=True)
    current_assignment = Column(String, nullable=True)
    educational_qualifications = Column(JSON, default=list)
    work_experience_years = Column(Integer, default=0)
    previous_trainings = Column(JSON, default=list)
    role = Column(String, default="employee")
    is_approved = Column(Boolean, default=True)
    admin_justification = Column(Text, nullable=True)
    approval_token = Column(String, nullable=True, index=True)
    profile_photo_url = Column(String, nullable=True)
    certifications = Column(JSON, default=list)
    preferred_language = Column(String, default="English")
    weekly_availability_hours = Column(Float, default=5.0)
    skill_tags = Column(JSON, default=list)
    resume_url = Column(String, nullable=True)
    resume_filename = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    scores = relationship("CompetencyScore", back_populates="user", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Competency(Base):
    __tablename__ = "competencies"

    id = Column(String, primary_key=True, default=generate_uuid)
    name = Column(String, unique=True, index=True, nullable=False)
    group_name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    is_emerging = Column(Boolean, default=False)
    embedding = Column(JSON, nullable=True)

    scores = relationship("CompetencyScore", back_populates="competency", cascade="all, delete-orphan")
    role_requirements = relationship("RoleRequirement", back_populates="competency", cascade="all, delete-orphan")

class CompetencyScore(Base):
    __tablename__ = "competency_scores"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    competency_id = Column(String, ForeignKey("competencies.id"), nullable=False)
    current_level = Column(Float, default=1.0)
    required_level = Column(Float, nullable=True)
    evidence = Column(String, default="Initial profile assessment")
    trend = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="scores")
    competency = relationship("Competency", back_populates="scores")

class RoleRequirement(Base):
    __tablename__ = "role_requirements"

    id = Column(String, primary_key=True, default=generate_uuid)
    job_role = Column(String, index=True, nullable=False)
    competency_id = Column(String, ForeignKey("competencies.id"), nullable=False)
    required_level = Column(Float, default=3.5)

    competency = relationship("Competency", back_populates="role_requirements")

class TrainingProgramme(Base):
    __tablename__ = "training_programmes"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    competency_ids = Column(JSON, default=list)
    description = Column(Text, nullable=True)
    provider = Column(String, default="NSSTA")
    duration_hours = Column(Integer, default=6)
    is_emerging = Column(Boolean, default=False)
    embedding = Column(JSON, nullable=True)

    enrollments = relationship("Enrollment", back_populates="training_programme", cascade="all, delete-orphan")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    training_programme_id = Column(String, ForeignKey("training_programmes.id"), nullable=False)
    status = Column(String, default="enrolled")  # 'enrolled', 'in_progress', 'completed', 'dropped'
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    score = Column(Float, nullable=True)
    source = Column(String, default="igot_mock")  # 'nssta', 'igot_mock'

    user = relationship("User", back_populates="enrollments")
    training_programme = relationship("TrainingProgramme", back_populates="enrollments")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    details = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Quiz(Base):
    __tablename__ = "quizzes"

    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    difficulty = Column(String, default="Medium")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    questions = relationship("Question", back_populates="quiz", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(String, primary_key=True, default=generate_uuid)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=True)
    competency_id = Column(String, ForeignKey("competencies.id"), nullable=False)
    question_text = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    correct_answer = Column(Integer, nullable=False)
    explanation = Column(Text, nullable=True)
    difficulty = Column(String, default="Medium")

    competency = relationship("Competency")
    quiz = relationship("Quiz", back_populates="questions")

class QuizSubmission(Base):
    __tablename__ = "quiz_submissions"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    quiz_id = Column(String, ForeignKey("quizzes.id"), nullable=True)
    score_percentage = Column(Float, nullable=False)
    submitted_at = Column(DateTime, default=datetime.datetime.utcnow)

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    type = Column(String, nullable=False, index=True)  # 'skill_gap_alert', 'course_recommendation', 'enrollment_update', 'competency_updated', 'admin_approval_request', 'admin_account_approved', 'assessment_result', 'system'
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, index=True)
    link = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="notifications")

class IGOTCourse(Base):
    __tablename__ = "igot_courses"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False, index=True)
    domain = Column(String, nullable=False, index=True)
    topic = Column(String, nullable=False, index=True)
    level = Column(String, nullable=False, index=True)
    duration = Column(String, nullable=True)
    language = Column(String, nullable=True)
    provider = Column(String, nullable=True)
    tags = Column(String, nullable=True)
    redirect_url = Column(String, nullable=False)
    data_source = Column(String, nullable=True)



