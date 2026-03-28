from flask import Blueprint, request, g
from app.auth.decorators import jwt_required
from app.schemas.cart import validate_cart_add, validate_cart_update, validate_cart_remove
from app.services.cart_service import get_cart, add_to_cart, update_cart_item, remove_from_cart
from app.utils.responses import success_response, error_response

cart_bp = Blueprint("cart", __name__)


@cart_bp.route("", methods=["GET"])
@jwt_required
def index():
    data = get_cart(g.current_user.id)
    return success_response(data)


@cart_bp.route("/add", methods=["POST"])
@jwt_required
def add():
    data = request.get_json(silent=True) or {}
    errors = validate_cart_add(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = add_to_cart(g.current_user.id, data["product_variant_id"], data["quantity"])
    if err:
        return error_response(err, 400, "CART_ERROR")
    return success_response(result)


@cart_bp.route("/update", methods=["PUT"])
@jwt_required
def update():
    data = request.get_json(silent=True) or {}
    errors = validate_cart_update(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = update_cart_item(g.current_user.id, data["product_variant_id"], data["quantity"])
    if err:
        return error_response(err, 404, "NOT_FOUND")
    return success_response(result)


@cart_bp.route("/remove", methods=["DELETE"])
@jwt_required
def remove():
    data = request.get_json(silent=True) or {}
    errors = validate_cart_remove(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = remove_from_cart(g.current_user.id, data["product_variant_id"])
    if err:
        return error_response(err, 404, "NOT_FOUND")
    return success_response(result)
