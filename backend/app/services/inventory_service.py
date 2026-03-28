from app.extensions import db
from app.models.product_variant import ProductVariant


def update_variant_stock(variant_id, stock_quantity):
    variant = ProductVariant.query.get(variant_id)
    if not variant:
        return None, "Variant not found"

    variant.stock_quantity = stock_quantity
    db.session.commit()
    return variant.to_dict(), None


def bulk_update_stock(updates):
    """updates is a list of {variant_id, stock_quantity}."""
    results = []
    for entry in updates:
        variant = ProductVariant.query.get(entry["variant_id"])
        if not variant:
            results.append({"variant_id": entry["variant_id"], "error": "Not found"})
            continue
        variant.stock_quantity = entry["stock_quantity"]
        results.append({"variant_id": variant.id, "stock_quantity": variant.stock_quantity})

    db.session.commit()
    return results


def get_low_stock_variants(threshold=5):
    variants = (
        ProductVariant.query
        .filter(ProductVariant.stock_quantity <= threshold, ProductVariant.is_active.is_(True))
        .join(ProductVariant.product)
        .order_by(ProductVariant.stock_quantity.asc())
        .all()
    )
    return [
        {
            "variant_id": v.id,
            "product_id": v.product_id,
            "product_name": v.product.name,
            "brand": v.product.brand,
            "size": v.size,
            "color": v.color,
            "stock_quantity": v.stock_quantity,
        }
        for v in variants
    ]
