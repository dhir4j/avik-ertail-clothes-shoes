import logging
import time
import uuid
from flask import request, g


def setup_logging(app):
    level = getattr(logging, app.config.get("LOG_LEVEL", "INFO").upper(), logging.INFO)
    logging.basicConfig(
        level=level,
        format="%(asctime)s %(levelname)s %(name)s: %(message)s",
    )


class RequestLogger:
    def __init__(self, app=None):
        if app:
            self.init_app(app)

    def init_app(self, app):
        app.before_request(self._before)
        app.after_request(self._after)

    @staticmethod
    def _before():
        g.request_id = str(uuid.uuid4())[:8]
        g.request_start = time.time()

    @staticmethod
    def _after(response):
        duration = round((time.time() - g.get("request_start", time.time())) * 1000, 2)
        user_id = getattr(g, "current_user", None)
        uid = user_id.id if user_id else None
        logging.getLogger("request").info(
            "rid=%s method=%s path=%s status=%s duration_ms=%s user=%s ip=%s",
            g.get("request_id"),
            request.method,
            request.path,
            response.status_code,
            duration,
            uid,
            request.remote_addr,
        )
        response.headers["X-Request-Id"] = g.get("request_id", "")
        return response
