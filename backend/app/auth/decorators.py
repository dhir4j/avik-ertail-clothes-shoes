from functools import wraps
from flask import request, g
from app.auth.jwt_utils import decode_token
from app.models.user import User
from app.utils.responses import error_response


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return error_response("Missing or invalid authorization header", 401, "AUTH_REQUIRED")

        token = auth_header[7:]
        payload = decode_token(token)
        if payload is None:
            return error_response("Invalid or expired token", 401, "TOKEN_INVALID")

        user = User.query.get(int(payload["sub"]))
        if user is None or not user.is_active:
            return error_response("User not found or inactive", 401, "USER_INACTIVE")

        g.current_user = user
        return f(*args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    @jwt_required
    def decorated(*args, **kwargs):
        if g.current_user.role != "admin":
            return error_response("Admin access required", 403, "ADMIN_REQUIRED")
        return f(*args, **kwargs)

    return decorated
