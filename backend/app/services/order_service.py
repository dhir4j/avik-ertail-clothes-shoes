import logging
from decimal import Decimal
from flask import current_app
from app.extensions import db
from app.models.order import Order
from app.models.order_item import OrderItem

logger = logging.getLogger(__name__)


def create_order(user_id, data):
    items_data = data.get("items", [])
    if not items_data:
        return None, "Order must contain at least one item"

    order_items = []
    total = Decimal("0")

    for item in items_data:
        price = Decimal(str(item["price"]))
        qty = int(item["quantity"])
        total += price * qty
        order_items.append(OrderItem(
            product_variant_id=str(item.get("variant_id", "")),
            quantity=qty,
            price=price,
            product_name_snapshot=item["name"],
            size_snapshot=item.get("size", ""),
            color_snapshot=item.get("color", ""),
            image_url_snapshot=item.get("image_url", ""),
        ))

    order = Order(
        user_id=user_id,
        total_price=total,
        payment_method=data.get("payment_method", "cod"),
        payment_status="pending",
        order_status="confirmed" if data.get("payment_method") == "cod" else "awaiting_payment",
        shipping_name=data["shipping_name"],
        shipping_phone=data["shipping_phone"],
        shipping_address_line1=data["shipping_address_line1"],
        shipping_address_line2=data.get("shipping_address_line2"),
        shipping_city=data["shipping_city"],
        shipping_state=data["shipping_state"],
        shipping_postal_code=data["shipping_postal_code"],
        shipping_country=data.get("shipping_country", "India"),
    )
    order.items = order_items
    db.session.add(order)
    db.session.commit()

    logger.info(
        "Order created order_id=%s user_id=%s total=%s items=%s",
        order.id, user_id, total, len(order_items),
    )

    return {
        "order_id": order.id,
        "total_price": float(order.total_price),
        "payment_status": order.payment_status,
        "order_status": order.order_status,
        "payment_method": order.payment_method,
    }, None


def list_user_orders(user_id, page, limit):
    query = Order.query.filter_by(user_id=user_id).order_by(Order.created_at.desc())
    total = query.count()
    orders = query.offset((page - 1) * limit).limit(limit).all()
    meta = {"page": page, "limit": limit, "total": total}
    return [o.to_list_dict() for o in orders], meta


def get_order_detail(user_id, order_id):
    order = Order.query.filter_by(id=order_id, user_id=user_id).first()
    if not order:
        return None
    return order.to_detail_dict()
