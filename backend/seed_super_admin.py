import os
import sys

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, Base, engine
from models import User
from auth import get_password_hash

SUPER_ADMIN_EMAIL = os.getenv("SUPER_ADMIN_EMAIL", "dhinesh0805@gmail.com")
SUPER_ADMIN_PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "SuperAdmin123!")

def seed_super_admin():
    print(f"Bootstrapping Super Admin account ({SUPER_ADMIN_EMAIL})...")
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        normalized_email = SUPER_ADMIN_EMAIL.lower().strip()
        
        # Check by email or employee_id
        existing = db.query(User).filter(
            (User.email == normalized_email) | (User.employee_id == "SUPER-ADMIN-001")
        ).first()

        if existing:
            existing.email = normalized_email
            existing.role = "super_admin"
            existing.is_approved = True
            existing.password_hash = get_password_hash(SUPER_ADMIN_PASSWORD)
            db.commit()
            print(f"[OK] Updated existing user '{normalized_email}' (ID: {existing.id}) to super_admin (is_approved=True).")
        else:
            admin_user = User(
                employee_id="SUPER-ADMIN-001",
                name="Director General (Super Admin)",
                email=normalized_email,
                password_hash=get_password_hash(SUPER_ADMIN_PASSWORD),
                designation="Director General",
                department="Ministry of Statistics & Programme Implementation",
                job_role="Senior Statistical Officer",
                role="super_admin",
                is_approved=True,
                admin_justification="System Super Administrator Bootstrapped Account"
            )
            db.add(admin_user)
            db.commit()
            print(f"[OK] Created new Super Admin account '{normalized_email}' (is_approved=True).")

    except Exception as e:
        db.rollback()
        print("Error bootstrapping super admin:", e)
    finally:
        db.close()

if __name__ == "__main__":
    seed_super_admin()
