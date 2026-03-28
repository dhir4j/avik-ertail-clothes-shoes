from app.utils.validators import validate_required, collect_errors
from app.auth.permissions import VALID_ORDER_STATUSES


def validate_order_status_update(data):
    status = data.get("order_status")
    if not status or status not in VALID_ORDER_STATUSES:
        return {"order_status": [f"Must be one of: {', '.join(sorted(VALID_ORDER_STATUSES))}"]}
    return None


def validate_payment_verification(data):
    if "approved" not in data or not isinstance(data["approved"], bool):
        return {"approved": ["Must be a boolean"]}
    return None


def validate_inventory_update(data):
    stock = data.get("stock_quantity")
    if stock is None or not isinstance(stock, int) or stock < 0:
        return {"stock_quantity": ["Must be a non-negative integer"]}
    return None
