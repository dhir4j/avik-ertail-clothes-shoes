from flask import Blueprint, request
from app.services.product_service import list_products, get_product, get_product_by_slug, get_brands
from app.services.review_service import list_product_reviews
from app.utils.responses import success_response, error_response
from app.utils.pagination import get_pagination_params

products_bp = Blueprint("products", __name__)


@products_bp.route("", methods=["GET"])
def index():
    page, limit = get_pagination_params()
    data, meta = list_products(
        page=page,
        limit=limit,
        search=request.args.get("search"),
        brand=request.args.get("brand"),
        size=request.args.get("size"),
        color=request.args.get("color"),
        min_price=request.args.get("min_price", type=float),
        max_price=request.args.get("max_price", type=float),
        sort=request.args.get("sort"),
    )
    return success_response(data, meta)


@products_bp.route("/<int:product_id>", methods=["GET"])
def detail(product_id):
    data = get_product(product_id)
    if not data:
        return error_response("Product not found", 404, "NOT_FOUND")
    return success_response(data)


@products_bp.route("/slug/<slug>", methods=["GET"])
def detail_by_slug(slug):
    data = get_product_by_slug(slug)
    if not data:
        return error_response("Product not found", 404, "NOT_FOUND")
    return success_response(data)


@products_bp.route("/brands", methods=["GET"])
def brands():
    return success_response(get_brands())


@products_bp.route("/<int:product_id>/reviews", methods=["GET"])
def product_reviews(product_id):
    page, limit = get_pagination_params()
    data, meta = list_product_reviews(product_id, page, limit)
    return success_response(data, meta)
