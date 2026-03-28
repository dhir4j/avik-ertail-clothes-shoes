from app.extensions import db, BigInt
from datetime import datetime, timezone


class Order(db.Model):
    __tablename__ = "orders"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    user_id = db.Column(BigInt, db.ForeignKey("users.id"), nullable=False)
    total_price = db.Column(db.Numeric(10, 2), nullable=False)

    payment_method = db.Column(db.String(30), nullable=False, default="cod")
    payment_status = db.Column(db.String(30), nullable=False, default="pending")
    order_status = db.Column(db.String(30), nullable=False, default="awaiting_payment")

    upi_reference = db.Column(db.String(100))
    payment_screenshot = db.Column(db.Text)
    payment_submitted_at = db.Column(db.DateTime(timezone=True))
    payment_verified_at = db.Column(db.DateTime(timezone=True))
    payment_verified_by = db.Column(BigInt, db.ForeignKey("users.id"))
    payment_notes = db.Column(db.Text)

    shipping_name = db.Column(db.String(120), nullable=False)
    shipping_phone = db.Column(db.String(20), nullable=False)
    shipping_address_line1 = db.Column(db.Text, nullable=False)
    shipping_address_line2 = db.Column(db.Text)
    shipping_city = db.Column(db.String(120), nullable=False)
    shipping_state = db.Column(db.String(120), nullable=False)
    shipping_postal_code = db.Column(db.String(20), nullable=False)
    shipping_country = db.Column(db.String(80), nullable=False, default="India")

    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    user = db.relationship("User", back_populates="orders", foreign_keys=[user_id])
    verifier = db.relationship("User", foreign_keys=[payment_verified_by])
    items = db.relationship("OrderItem", back_populates="order", cascade="all, delete-orphan", lazy="selectin")

    def to_list_dict(self):
        return {
            "id": self.id,
            "total_price": float(self.total_price),
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "order_status": self.order_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def to_detail_dict(self):
        return {
            "id": self.id,
            "user": {
                "id": self.user.id,
                "name": self.user.name,
                "email": self.user.email,
            } if self.user else None,
            "items": [item.to_dict() for item in self.items],
            "items_count": len(self.items),
            "total_price": float(self.total_price),
            "payment_method": self.payment_method,
            "payment_status": self.payment_status,
            "order_status": self.order_status,
            "upi_reference": self.upi_reference,
            "payment_screenshot": self.payment_screenshot,
            "shipping_name": self.shipping_name,
            "shipping_phone": self.shipping_phone,
            "shipping_address_line1": self.shipping_address_line1,
            "shipping_address_line2": self.shipping_address_line2,
            "shipping_city": self.shipping_city,
            "shipping_state": self.shipping_state,
            "shipping_postal_code": self.shipping_postal_code,
            "shipping_country": self.shipping_country,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
