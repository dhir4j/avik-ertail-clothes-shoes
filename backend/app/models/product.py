from app.extensions import db, BigInt
from datetime import datetime, timezone


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(BigInt, primary_key=True, autoincrement=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    brand = db.Column(db.String(120), nullable=False)
    price = db.Column(db.Numeric(10, 2), nullable=False)
    slug = db.Column(db.String(255), unique=True)
    source_url = db.Column(db.Text, unique=True)
    primary_image_url = db.Column(db.Text)
    color = db.Column(db.String(100))
    about_title = db.Column(db.Text)
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    is_featured = db.Column(db.Boolean, nullable=False, default=False)
    sort_order = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(
        db.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(db.DateTime(timezone=True), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    variants = db.relationship("ProductVariant", back_populates="product", cascade="all, delete-orphan", lazy="selectin")
    images = db.relationship("ProductImage", back_populates="product", cascade="all, delete-orphan", order_by="ProductImage.sort_order", lazy="selectin")
    reviews = db.relationship("Review", back_populates="product", cascade="all, delete-orphan", lazy="dynamic")

    def to_list_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "brand": self.brand,
            "price": float(self.price),
            "slug": self.slug,
            "primary_image_url": self.primary_image_url,
            "color": self.color,
            "is_featured": self.is_featured,
            "variants": [v.to_dict() for v in self.variants if v.is_active],
        }

    def to_detail_dict(self):
        from sqlalchemy import func
        from app.models.review import Review

        avg = db.session.query(func.avg(Review.rating)).filter(Review.product_id == self.id).scalar()
        review_count = self.reviews.count()
        avg_rating = round(float(avg), 2) if avg else 0

        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "brand": self.brand,
            "price": float(self.price),
            "slug": self.slug,
            "color": self.color,
            "about_title": self.about_title,
            "is_active": self.is_active,
            "is_featured": self.is_featured,
            "images": [img.image_url for img in self.images],
            "variants": [v.to_dict() for v in self.variants if v.is_active],
            "reviews": {
                "average_rating": avg_rating,
                "count": review_count,
            },
        }
