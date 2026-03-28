import logging
from datetime import datetime, timezone
from app.extensions import db
from app.models.order import Order
from app.auth.permissions import can_submit_payment, can_verify_payment

logger = logging.getLogger(__name__)


def submit_payment(user_id, order_id, upi_reference, screenshot=None):
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return None, "Order not found"

    if not can_submit_payment(order, user_id):
        return None, "Payment already submitted or order not eligible"

    order.upi_reference = upi_reference
    order.payment_screenshot = screenshot
    order.payment_status = "submitted"
    order.payment_submitted_at = datetime.now(timezone.utc)
    db.session.commit()

    logger.info("Payment submitted order_id=%s user_id=%s ref=%s", order_id, user_id, upi_reference)

    return {
        "id": order.id,
        "payment_status": order.payment_status,
        "order_status": order.order_status,
    }, None


def verify_payment(admin_id, order_id, approved, notes=None):
    order = Order.query.get(order_id)
    if not order:
        return None, "Order not found"

    if not can_verify_payment(order):
        return None, "Order payment is not in submitted state"

    now = datetime.now(timezone.utc)

    if approved:
        # Check stock availability before approving
        for item in order.items:
            variant = item.variant
            if variant.stock_quantity < item.quantity:
                return None, (
                    f"Insufficient stock for {item.product_name_snapshot} "
                    f"size {item.size_snapshot}: need {item.quantity}, have {variant.stock_quantity}"
                )

        # Decrement inventory
        for item in order.items:
            item.variant.stock_quantity -= item.quantity

        order.payment_status = "paid"
        order.order_status = "processing"
    else:
        order.payment_status = "rejected"

    order.payment_verified_at = now
    order.payment_verified_by = admin_id
    order.payment_notes = notes
    db.session.commit()

    logger.info(
        "Payment verified order_id=%s admin=%s approved=%s",
        order_id, admin_id, approved,
    )

    return {
        "id": order.id,
        "payment_status": order.payment_status,
        "order_status": order.order_status,
        "payment_verified_at": now.isoformat(),
    }, None
