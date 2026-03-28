from app.extensions import db
from app.models.product import Product
from app.models.order import Order
from app.models.user import User
from app.models.audit_log import AuditLog
from app.auth.permissions import VALID_ORDER_STATUSES


def list_all_products(page, limit, search=None, brand=None, active_only=False):
    query = Product.query
    if active_only:
        query = query.filter(Product.is_active.is_(True))
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if brand:
        query = query.filter(Product.brand.ilike(brand))

    query = query.order_by(Product.id.desc())
    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()
    meta = {"page": page, "limit": limit, "total": total}
    return [p.to_list_dict() for p in items], meta


def update_product_metadata(product_id, data, admin_id):
    product = Product.query.get(product_id)
    if not product:
        return None, "Product not found"

    if "is_active" in data:
        product.is_active = data["is_active"]
    if "is_featured" in data:
        product.is_featured = data["is_featured"]
    if "sort_order" in data:
        product.sort_order = data["sort_order"]

    AuditLog.log(admin_id, "update_product", "product", product_id, data)
    db.session.commit()
    return product.to_detail_dict(), None


def soft_delete_product(product_id, admin_id):
    product = Product.query.get(product_id)
    if not product:
        return None, "Product not found"

    product.is_active = False
    AuditLog.log(admin_id, "delete_product", "product", product_id)
    db.session.commit()
    return {"message": "Product deactivated"}, None


def list_all_orders(page, limit, payment_status=None, order_status=None):
    query = Order.query
    if payment_status:
        query = query.filter(Order.payment_status == payment_status)
    if order_status:
        query = query.filter(Order.order_status == order_status)

    query = query.order_by(Order.created_at.desc())
    total = query.count()
    orders = query.offset((page - 1) * limit).limit(limit).all()
    meta = {"page": page, "limit": limit, "total": total}
    return [o.to_detail_dict() for o in orders], meta


def update_order_status(order_id, new_status, admin_id):
    order = Order.query.get(order_id)
    if not order:
        return None, "Order not found"

    if new_status not in VALID_ORDER_STATUSES:
        return None, "Invalid order status"

    old_status = order.order_status
    order.order_status = new_status
    AuditLog.log(admin_id, "update_order_status", "order", order_id, {
        "old_status": old_status,
        "new_status": new_status,
    })
    db.session.commit()
    return order.to_detail_dict(), None


def list_users(page, limit):
    query = User.query.order_by(User.created_at.desc())
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    meta = {"page": page, "limit": limit, "total": total}
    return [u.to_dict() for u in users], meta


def get_dashboard_stats():
    from sqlalchemy import func

    total_orders = Order.query.count()
    pending_payments = Order.query.filter_by(payment_status="submitted").count()
    total_users = User.query.count()
    total_products = Product.query.filter_by(is_active=True).count()

    order_by_status = dict(
        db.session.query(Order.order_status, func.count(Order.id))
        .group_by(Order.order_status)
        .all()
    )
    payment_by_status = dict(
        db.session.query(Order.payment_status, func.count(Order.id))
        .group_by(Order.payment_status)
        .all()
    )

    return {
        "total_orders": total_orders,
        "pending_payments": pending_payments,
        "total_users": total_users,
        "total_products": total_products,
        "orders_by_status": order_by_status,
        "payments_by_status": payment_by_status,
    }
