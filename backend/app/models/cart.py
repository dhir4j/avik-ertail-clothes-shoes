from app.extensions import db, BigInt
from datetime import datetime, timezone


class Cart(db.Model):
    __tablename__ = "carts"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    user_id = db.Column(BigInt, db.ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="cart")
    items = db.relationship("CartItem", back_populates="cart", cascade="all, delete-orphan", lazy="selectin")

    def to_dict(self):
        subtotal = sum(item.line_total for item in self.items)
        return {
            "id": self.id,
            "items": [item.to_dict() for item in self.items],
            "subtotal": float(subtotal),
        }
