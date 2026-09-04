from typing import Optional, Any
from sqlalchemy.orm import Session
from models import AuditLog
import datetime

def log_audit_event(
    db: Session,
    action: str,
    user_id: Optional[str] = None,
    details: Optional[Any] = None
) -> AuditLog:
    """
    Creates and persists an audit log entry for system actions (e.g. login, enrollment, competency updates).
    Ensures secure data governance and compliance with official MoSPI auditing requirements.
    """
    log_entry = AuditLog(
        user_id=user_id,
        action=action,
        details=details or {},
        timestamp=datetime.datetime.utcnow()
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    print(f"[AUDIT LOG] Action: '{action}' | User: {user_id} | Timestamp: {log_entry.timestamp}")
    return log_entry
