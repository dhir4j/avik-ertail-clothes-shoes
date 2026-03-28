from app.extensions import db, BigInt


class OrderItem(db.Model):
    __tablename__ = "order_items"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    order_id = db.Column(BigInt, db.ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    product_variant_id = db.Column(db.String(255), nullable=True)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    product_name_snapshot = db.Column(db.String(255), nullable=False)
    size_snapshot = db.Column(db.String(50))
    color_snapshot = db.Column(db.String(100))
    image_url_snapshot = db.Column(db.Text)

    order = db.relationship("Order", back_populates="items")

    def to_dict(self):
        return {
            "id": self.id,
            "product_variant_id": self.product_variant_id,
            "product_name_snapshot": self.product_name_snapshot,
            "size_snapshot": self.size_snapshot,
            "color_snapshot": self.color_snapshot,
            "image_url_snapshot": self.image_url_snapshot,
            "quantity": self.quantity,
            "price": float(self.price),
            "line_total": float(self.price * self.quantity),
        }
