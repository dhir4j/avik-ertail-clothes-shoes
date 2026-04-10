from app.utils.validators import validate_required, collect_errors


# Fields an admin may set when creating a product.
_CREATE_FIELDS = {
    "name", "brand", "price", "description", "about_title", "color",
    "slug", "primary_image_url", "images", "variants",
    "is_active", "is_featured", "sort_order",
}

# Fields an admin may edit on an existing product.
_UPDATE_FIELDS = {
    "name", "brand", "price", "description", "about_title", "color",
    "primary_image_url", "is_active", "is_featured", "sort_order",
}


def _validate_price(value):
    try:
        price = float(value)
    except (TypeError, ValueError):
        return "price must be a number"
    if price < 0:
        return "price must be >= 0"
    return None


def _validate_variants(variants):
    if not isinstance(variants, list):
        return "variants must be a list"
    if not variants:
        return "at least one variant is required"
    for i, v in enumerate(variants):
        if not isinstance(v, dict):
            return f"variants[{i}] must be an object"
        size = v.get("size")
        if not size or not str(size).strip():
            return f"variants[{i}].size is required"
        stock = v.get("stock_quantity", 0)
        if not isinstance(stock, int) or stock < 0:
            return f"variants[{i}].stock_quantity must be a non-negative integer"
    return None


def _validate_images(images):
    if images is None:
        return None
    if not isinstance(images, list):
        return "images must be a list of URLs"
    for i, url in enumerate(images):
        if not isinstance(url, str) or not url.strip():
            return f"images[{i}] must be a non-empty string"
    return None


def validate_product_create(data):
    """Validate payload for POST /admin/products."""
    invalid = set(data.keys()) - _CREATE_FIELDS
    if invalid:
        return {"_": [f"Invalid fields: {', '.join(sorted(invalid))}"]}

    errors = collect_errors({
        "name": validate_required(data.get("name"), "name"),
        "brand": validate_required(data.get("brand"), "brand"),
        "price": _validate_price(data.get("price")),
        "variants": _validate_variants(data.get("variants")),
        "images": _validate_images(data.get("images")),
    })
    return errors or None


def validate_product_update(data):
    """Validate payload for PUT /admin/products/<id>."""
    invalid = set(data.keys()) - _UPDATE_FIELDS
    if invalid:
        return {"_": [f"Invalid fields: {', '.join(sorted(invalid))}"]}

    checks = {}
    if "name" in data:
        checks["name"] = validate_required(data.get("name"), "name")
    if "brand" in data:
        checks["brand"] = validate_required(data.get("brand"), "brand")
    if "price" in data:
        checks["price"] = _validate_price(data.get("price"))
    errors = collect_errors(checks)
    return errors or None
