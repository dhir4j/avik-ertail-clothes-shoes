from flask import Blueprint, request, g
from app.auth.decorators import admin_required
from app.schemas.admin import validate_order_status_update, validate_payment_verification, validate_inventory_update
from app.schemas.product import validate_product_update
from app.services.admin_service import (
    list_all_products,
    update_product_metadata,
    soft_delete_product,
    list_all_orders,
    update_order_status,
    list_users,
    get_dashboard_stats,
)
from app.services.payment_service import verify_payment
from app.services.inventory_service import update_variant_stock, bulk_update_stock, get_low_stock_variants
from app.services.import_service import import_products
from app.utils.responses import success_response, error_response
from app.utils.pagination import get_pagination_params

admin_bp = Blueprint("admin", __name__)


# ── Dashboard ──

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    return success_response(get_dashboard_stats())


# ── Products ──

@admin_bp.route("/products", methods=["GET"])
@admin_required
def products_list():
    page, limit = get_pagination_params()
    data, meta = list_all_products(
        page, limit,
        search=request.args.get("search"),
        brand=request.args.get("brand"),
    )
    return success_response(data, meta)


@admin_bp.route("/products/<int:product_id>", methods=["PUT"])
@admin_required
def products_update(product_id):
    data = request.get_json(silent=True) or {}
    errors = validate_product_update(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = update_product_metadata(product_id, data, g.current_user.id)
    if err:
        return error_response(err, 404, "NOT_FOUND")
    return success_response(result)


@admin_bp.route("/products/<int:product_id>", methods=["DELETE"])
@admin_required
def products_delete(product_id):
    result, err = soft_delete_product(product_id, g.current_user.id)
    if err:
        return error_response(err, 404, "NOT_FOUND")
    return success_response(result)


@admin_bp.route("/products/import", methods=["POST"])
@admin_required
def products_import():
    from flask import current_app
    data = request.get_json(silent=True) or {}
    path = data.get("source", current_app.config["PRODUCT_DATASET_PATH"])
    initial_stock = data.get("initial_stock", 0)
    force_stock = data.get("force_stock", False)

    try:
        stats = import_products(path, initial_stock=initial_stock, force_stock=force_stock)
    except FileNotFoundError:
        return error_response("Dataset file not found", 400, "FILE_NOT_FOUND")
    except Exception as e:
        return error_response(str(e), 500, "IMPORT_ERROR")

    return success_response(stats)


# ── Orders ──

@admin_bp.route("/orders", methods=["GET"])
@admin_required
def orders_list():
    page, limit = get_pagination_params()
    data, meta = list_all_orders(
        page, limit,
        payment_status=request.args.get("payment_status"),
        order_status=request.args.get("order_status"),
    )
    return success_response(data, meta)


@admin_bp.route("/orders/<int:order_id>/status", methods=["PUT"])
@admin_required
def orders_status(order_id):
    data = request.get_json(silent=True) or {}
    errors = validate_order_status_update(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = update_order_status(order_id, data["order_status"], g.current_user.id)
    if err:
        return error_response(err, 400, "ORDER_ERROR")
    return success_response(result)


@admin_bp.route("/orders/<int:order_id>/verify-payment", methods=["PUT"])
@admin_required
def orders_verify_payment(order_id):
    data = request.get_json(silent=True) or {}
    errors = validate_payment_verification(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = verify_payment(
        admin_id=g.current_user.id,
        order_id=order_id,
        approved=data["approved"],
        notes=data.get("notes"),
    )
    if err:
        return error_response(err, 400, "PAYMENT_ERROR")
    return success_response(result)


# ── Inventory ──

@admin_bp.route("/inventory/<int:variant_id>", methods=["PUT"])
@admin_required
def inventory_update(variant_id):
    data = request.get_json(silent=True) or {}
    errors = validate_inventory_update(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = update_variant_stock(variant_id, data["stock_quantity"])
    if err:
        return error_response(err, 404, "NOT_FOUND")
    return success_response(result)


@admin_bp.route("/inventory/bulk", methods=["PUT"])
@admin_required
def inventory_bulk_update():
    data = request.get_json(silent=True) or {}
    updates = data.get("updates", [])
    if not updates:
        return error_response("No updates provided", 400, "VALIDATION_ERROR")

    results = bulk_update_stock(updates)
    return success_response(results)


@admin_bp.route("/inventory/low-stock", methods=["GET"])
@admin_required
def inventory_low_stock():
    threshold = request.args.get("threshold", 5, type=int)
    data = get_low_stock_variants(threshold)
    return success_response(data)


# ── Users ──

@admin_bp.route("/users", methods=["GET"])
@admin_required
def users_list():
    page, limit = get_pagination_params()
    data, meta = list_users(page, limit)
    return success_response(data, meta)
