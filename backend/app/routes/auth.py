from flask import Blueprint, request, g
from app.extensions import limiter
from app.auth.decorators import jwt_required
from app.schemas.auth import validate_register, validate_login
from app.services.auth_service import register_user, login_user, get_current_user
from app.utils.responses import success_response, error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/register", methods=["POST"])
@limiter.limit("10/hour")
def register():
    data = request.get_json(silent=True) or {}
    errors = validate_register(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = register_user(
        name=data["name"].strip(),
        email=data["email"].strip().lower(),
        password=data["password"],
        phone=data.get("phone"),
    )
    if err:
        return error_response(err, 409, "CONFLICT")
    return success_response(result, status_code=201)


@auth_bp.route("/login", methods=["POST"])
@limiter.limit("20/hour")
def login():
    data = request.get_json(silent=True) or {}
    errors = validate_login(data)
    if errors:
        return error_response("Validation failed", 400, "VALIDATION_ERROR", errors)

    result, err = login_user(
        email=data["email"].strip().lower(),
        password=data["password"],
    )
    if err:
        return error_response(err, 401, "AUTH_FAILED")
    return success_response(result)


@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    return success_response(get_current_user(g.current_user))
