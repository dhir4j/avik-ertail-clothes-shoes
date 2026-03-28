from app.extensions import db, BigInt
from datetime import datetime, timezone


class AuditLog(db.Model):
    __tablename__ = "audit_logs"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    admin_user_id = db.Column(BigInt, db.ForeignKey("users.id"))
    action = db.Column(db.String(100), nullable=False)
    entity_type = db.Column(db.String(50), nullable=False)
    entity_id = db.Column(BigInt)
    metadata_ = db.Column("metadata", db.JSON)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    admin = db.relationship("User", foreign_keys=[admin_user_id])

    @classmethod
    def log(cls, admin_id, action, entity_type, entity_id=None, metadata=None):
        entry = cls(
            admin_user_id=admin_id,
            action=action,
            entity_type=entity_type,
            entity_id=entity_id,
            metadata_=metadata,
        )
        db.session.add(entry)
        return entry
