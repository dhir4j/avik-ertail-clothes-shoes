from app.extensions import db, BigInt


class ProductVariant(db.Model):
    __tablename__ = "product_variants"
    __table_args__ = (
        db.UniqueConstraint("product_id", "size", "color", name="uq_variant_product_size_color"),
    )

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    product_id = db.Column(BigInt, db.ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    size = db.Column(db.String(50), nullable=False)
    color = db.Column(db.String(100))
    sku = db.Column(db.String(100))
    stock_quantity = db.Column(db.Integer, nullable=False, default=0)
    is_active = db.Column(db.Boolean, nullable=False, default=True)

    product = db.relationship("Product", back_populates="variants")

    def to_dict(self):
        return {
            "id": self.id,
            "size": self.size,
            "color": self.color,
            "sku": self.sku,
            "stock_quantity": self.stock_quantity,
            "is_active": self.is_active,
        }
