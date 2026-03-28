from flask import Blueprint, request, g
from app.auth.decorators import jwt_required
from app.schemas.review import validate_review
from app.services.review_service import create_review
from app.utils.responses import success_response, error_response

reviews_bp = Blueprint("reviews", __name__)


@reviews_bp.route("", methods=["POST"])
@jwt_required
def create():
    data = request.get_json(silent=True) or {}
    errors = validate_review(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = create_review(
        user_id=g.current_user.id,
        product_id=data["product_id"],
        rating=data["rating"],
        comment=data.get("comment"),
    )
    if err:
        return error_response(err, 400, "REVIEW_ERROR")
    return success_response(result, status_code=201)
