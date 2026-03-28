VALID_PAYMENT_STATUSES = {"pending", "submitted", "paid", "rejected", "refunded"}
VALID_ORDER_STATUSES = {"awaiting_payment", "processing", "shipped", "delivered", "cancelled"}


def can_submit_payment(order, user_id):
    """User can only submit payment for their own pending order."""
    return (
        order.user_id == user_id
        and order.payment_status == "pending"
        and order.order_status == "awaiting_payment"
    )


def can_verify_payment(order):
    """Admin can verify only submitted payments."""
    return order.payment_status == "submitted"
