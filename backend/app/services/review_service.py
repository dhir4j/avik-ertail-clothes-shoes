from app.extensions import db
from app.models.review import Review
from app.models.product import Product
from sqlalchemy import func


def create_review(user_id, product_id, rating, comment=None):
    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if not product:
        return None, "Product not found"

    existing = Review.query.filter_by(product_id=product_id, user_id=user_id).first()
    if existing:
        return None, "You have already reviewed this product"

    review = Review(
        product_id=product_id,
        user_id=user_id,
        rating=rating,
        comment=comment,
    )
    db.session.add(review)
    db.session.commit()
    return review.to_dict(), None


def list_product_reviews(product_id, page, limit):
    query = Review.query.filter_by(product_id=product_id).order_by(Review.created_at.desc())
    total = query.count()
    reviews = query.offset((page - 1) * limit).limit(limit).all()

    avg_rating = db.session.query(func.avg(Review.rating)).filter_by(product_id=product_id).scalar()
    avg_rating = round(float(avg_rating), 2) if avg_rating else 0

    meta = {
        "page": page,
        "limit": limit,
        "total": total,
        "average_rating": avg_rating,
        "count": total,
    }
    return [r.to_dict() for r in reviews], meta
