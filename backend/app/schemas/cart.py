from app.utils.validators import validate_positive_int, collect_errors


def validate_cart_add(data):
    errors = collect_errors({
        "product_variant_id": validate_positive_int(data.get("product_variant_id"), "product_variant_id"),
        "quantity": validate_positive_int(data.get("quantity"), "quantity"),
    })
    return errors if errors else None


def validate_cart_update(data):
    errors = collect_errors({
        "product_variant_id": validate_positive_int(data.get("product_variant_id"), "product_variant_id"),
        "quantity": validate_positive_int(data.get("quantity"), "quantity"),
    })
    return errors if errors else None


def validate_cart_remove(data):
    errors = collect_errors({
        "product_variant_id": validate_positive_int(data.get("product_variant_id"), "product_variant_id"),
    })
    return errors if errors else None
