import logging
from flask import Flask
from app.config import config_map
from app.extensions import db, migrate, bcrypt, limiter, cors
from app.utils.errors import register_error_handlers
from app.utils.logging import setup_logging, RequestLogger


def create_app(config_name="development"):
    app = Flask(__name__)
    app.config.from_object(config_map.get(config_name, config_map["development"]))

    # ── Extensions ──
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    limiter.init_app(app)
    cors.init_app(app, origins=app.config["CORS_ORIGINS"].split(","))

    # ── Logging ──
    setup_logging(app)
    RequestLogger(app)

    # ── Blueprints ──
    from app.routes.auth import auth_bp
    from app.routes.products import products_bp
    from app.routes.cart import cart_bp
    from app.routes.orders import orders_bp
    from app.routes.reviews import reviews_bp
    from app.routes.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(products_bp, url_prefix="/products")
    app.register_blueprint(cart_bp, url_prefix="/cart")
    app.register_blueprint(orders_bp, url_prefix="/orders")
    app.register_blueprint(reviews_bp, url_prefix="/reviews")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    # ── Error handlers ──
    register_error_handlers(app)

    @app.route("/")
    def index():
        return {"status": "ok", "message": "SOLESTREET API is running"}

    @app.route("/health")
    def health():
        return {"status": "ok"}

    return app
