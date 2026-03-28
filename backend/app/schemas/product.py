from app.utils.validators import validate_required, collect_errors


def validate_product_update(data):
    """Validate admin product metadata update."""
    allowed = {"is_active", "is_featured", "sort_order"}
    invalid_keys = set(data.keys()) - allowed
    if invalid_keys:
        return {"_": [f"Invalid fields: {', '.join(invalid_keys)}"]}
    return None
