import os
import shutil
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

# Support Vercel serverless environment where only /tmp is writable
is_vercel = bool(os.getenv("VERCEL"))
db_url_env = os.getenv("DATABASE_URL")

if db_url_env:
    DATABASE_URL = db_url_env
elif is_vercel:
    tmp_db = "/tmp/statskill.db"
    src_candidates = [
        os.path.join(os.path.dirname(__file__), "..", "statskill.db"),
        os.path.join(os.path.dirname(__file__), "statskill.db"),
        "statskill.db",
    ]
    if not os.path.exists(tmp_db):
        for candidate in src_candidates:
            if os.path.exists(candidate):
                try:
                    shutil.copyfile(candidate, tmp_db)
                    break
                except Exception:
                    pass
    DATABASE_URL = f"sqlite:///{tmp_db}"
else:
    DATABASE_URL = "sqlite:///./statskill.db"

# Convert postgres:// to postgresql:// if present
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

connect_args = {}
if "sqlite" in DATABASE_URL:
    connect_args = {"check_same_thread": False}

engine = create_engine(DATABASE_URL, connect_args=connect_args, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

from sqlalchemy import text

def apply_migrations():
    try:
        with engine.connect() as conn:
            # Check users table for columns
            result = conn.execute(text("PRAGMA table_info(users)"))
            columns = [row[1] for row in result.fetchall()]
            if len(columns) > 0:
                migrations = [
                    ("approval_token", "VARCHAR"),
                    ("profile_photo_url", "VARCHAR"),
                    ("certifications", "TEXT"),
                    ("preferred_language", "VARCHAR DEFAULT 'English'"),
                    ("weekly_availability_hours", "FLOAT DEFAULT 5.0"),
                    ("skill_tags", "TEXT"),
                    ("resume_url", "VARCHAR"),
                    ("resume_filename", "VARCHAR"),
                    ("created_at", "DATETIME"),
                    ("updated_at", "DATETIME"),
                ]
                for col_name, col_type in migrations:
                    if col_name not in columns:
                        conn.execute(text(f"ALTER TABLE users ADD COLUMN {col_name} {col_type}"))
                        conn.commit()
                        print(f"[MIGRATION] Added {col_name} column to users table.")
    except Exception as e:
        print("[MIGRATION NOTICE]", e)

apply_migrations()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

