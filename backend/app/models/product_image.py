from app.extensions import db, BigInt


class ProductImage(db.Model):
    __tablename__ = "product_images"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    product_id = db.Column(BigInt, db.ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    image_url = db.Column(db.Text, nullable=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)

    product = db.relationship("Product", back_populates="images")
