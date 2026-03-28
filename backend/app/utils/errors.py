import logging
from flask import jsonify
from sqlalchemy.exc import IntegrityError

logger = logging.getLogger(__name__)


def register_error_handlers(app):
    @app.errorhandler(400)
    def bad_request(e):
        return jsonify({"data": None, "error": {"code": "BAD_REQUEST", "message": str(e)}}), 400

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"data": None, "error": {"code": "NOT_FOUND", "message": "Resource not found"}}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"data": None, "error": {"code": "METHOD_NOT_ALLOWED", "message": "Method not allowed"}}), 405

    @app.errorhandler(429)
    def rate_limited(e):
        return jsonify({"data": None, "error": {"code": "RATE_LIMITED", "message": "Too many requests"}}), 429

    @app.errorhandler(500)
    def internal_error(e):
        logger.exception("Unhandled exception")
        return jsonify({"data": None, "error": {"code": "INTERNAL_ERROR", "message": "Internal server error"}}), 500

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(e):
        logger.warning("Integrity error: %s", e.orig)
        return jsonify({"data": None, "error": {"code": "CONFLICT", "message": "Resource conflict or duplicate entry"}}), 409
