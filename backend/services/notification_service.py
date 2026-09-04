import datetime
from typing import Optional
from sqlalchemy.orm import Session
from models import Notification

def create_notification(
    db: Session,
    user_id: str,
    type: str,
    title: str,
    message: str,
    link: Optional[str] = None,
    deduplicate_days: Optional[int] = None
) -> Optional[Notification]:
    """
    Creates and persists a notification for a user.
    If deduplicate_days is provided, checks if an identical (user_id, type, title)
    notification was created within the last N days before inserting.
    """
    if deduplicate_days and deduplicate_days > 0:
        cutoff = datetime.datetime.utcnow() - datetime.timedelta(days=deduplicate_days)
        existing = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.type == type,
            Notification.title == title,
            Notification.created_at >= cutoff
        ).first()
        if existing:
            return existing

    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        message=message,
        link=link,
        is_read=False,
        created_at=datetime.datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification
