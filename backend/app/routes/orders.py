from flask import Blueprint, request, g
from app.auth.decorators import jwt_required
from app.schemas.order import validate_create_order, validate_payment_submission
from app.services.order_service import create_order, list_user_orders, get_order_detail
from app.services.payment_service import submit_payment
from app.utils.responses import success_response, error_response
from app.utils.pagination import get_pagination_params

orders_bp = Blueprint("orders", __name__)


@orders_bp.route("", methods=["POST"])
@jwt_required
def create():
    data = request.get_json(silent=True) or {}
    errors = validate_create_order(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = create_order(g.current_user.id, data)
    if err:
        return error_response(err, 400, "ORDER_ERROR")
    return success_response(result, status_code=201)


@orders_bp.route("", methods=["GET"])
@jwt_required
def index():
    page, limit = get_pagination_params()
    data, meta = list_user_orders(g.current_user.id, page, limit)
    return success_response(data, meta)


@orders_bp.route("/<int:order_id>", methods=["GET"])
@jwt_required
def detail(order_id):
    data = get_order_detail(g.current_user.id, order_id)
    if not data:
        return error_response("Order not found", 404, "NOT_FOUND")
    return success_response(data)


@orders_bp.route("/<int:order_id>/payment", methods=["PUT"])
@jwt_required
def payment(order_id):
    data = request.get_json(silent=True) or {}
    errors = validate_payment_submission(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = submit_payment(
        user_id=g.current_user.id,
        order_id=order_id,
        upi_reference=data["upi_reference"],
        screenshot=data.get("payment_screenshot"),
    )
    if err:
        return error_response(err, 400, "PAYMENT_ERROR")
    return success_response(result)
