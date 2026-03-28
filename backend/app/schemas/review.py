from app.utils.validators import validate_positive_int, validate_rating, collect_errors


def validate_review(data):
    errors = collect_errors({
        "product_id": validate_positive_int(data.get("product_id"), "product_id"),
        "rating": validate_rating(data.get("rating")),
    })
    return errors if errors else None
