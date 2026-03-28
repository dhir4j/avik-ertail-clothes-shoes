from app.extensions import db
from app.models.product import Product
from app.models.product_variant import ProductVariant
from sqlalchemy import or_, func


def list_products(page, limit, search=None, brand=None, size=None, color=None,
                  min_price=None, max_price=None, sort=None):
    query = Product.query.filter(Product.is_active.is_(True))

    if search:
        term = f"%{search}%"
        query = query.filter(or_(Product.name.ilike(term), Product.brand.ilike(term)))

    if brand:
        query = query.filter(Product.brand.ilike(brand))

    if color:
        query = query.filter(Product.color.ilike(f"%{color}%"))

    if min_price is not None:
        query = query.filter(Product.price >= min_price)

    if max_price is not None:
        query = query.filter(Product.price <= max_price)

    if size:
        query = query.join(Product.variants).filter(
            ProductVariant.size == size,
            ProductVariant.is_active.is_(True),
        )

    # Sorting
    sort_map = {
        "price_asc": Product.price.asc(),
        "price_desc": Product.price.desc(),
        "newest": Product.created_at.desc(),
        "name_asc": Product.name.asc(),
    }
    order = sort_map.get(sort, Product.sort_order.asc())
    query = query.order_by(order)

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    meta = {"page": page, "limit": limit, "total": total}
    return [p.to_list_dict() for p in items], meta


def get_product(product_id):
    product = Product.query.filter_by(id=product_id, is_active=True).first()
    if not product:
        return None
    return product.to_detail_dict()


def get_product_by_slug(slug):
    product = Product.query.filter_by(slug=slug, is_active=True).first()
    if not product:
        return None
    return product.to_detail_dict()


def get_brands():
    rows = (
        db.session.query(Product.brand, func.count(Product.id))
        .filter(Product.is_active.is_(True))
        .group_by(Product.brand)
        .order_by(Product.brand)
        .all()
    )
    return [{"brand": r[0], "count": r[1]} for r in rows]
