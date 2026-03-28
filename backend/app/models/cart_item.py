from app.extensions import db, BigInt
from decimal import Decimal


class CartItem(db.Model):
    __tablename__ = "cart_items"
    __table_args__ = (
        db.UniqueConstraint("cart_id", "product_variant_id", name="uq_cart_items_cart_variant"),
    )

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    cart_id = db.Column(BigInt, db.ForeignKey("carts.id", ondelete="CASCADE"), nullable=False)
    product_variant_id = db.Column(BigInt, db.ForeignKey("product_variants.id", ondelete="CASCADE"), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)

    cart = db.relationship("Cart", back_populates="items")
    variant = db.relationship("ProductVariant", lazy="joined")

    @property
    def unit_price(self):
        return self.variant.product.price if self.variant and self.variant.product else Decimal("0")

    @property
    def line_total(self):
        return self.unit_price * self.quantity

    def to_dict(self):
        product = self.variant.product if self.variant else None
        return {
            "id": self.id,
            "product_variant_id": self.product_variant_id,
            "product_id": product.id if product else None,
            "product_name": product.name if product else None,
            "size": self.variant.size if self.variant else None,
            "color": self.variant.color if self.variant else None,
            "quantity": self.quantity,
            "unit_price": float(self.unit_price),
            "line_total": float(self.line_total),
            "image_url": product.primary_image_url if product else None,
        }
