from app.extensions import db
from app.models.cart import Cart
from app.models.cart_item import CartItem
from app.models.product_variant import ProductVariant


def get_or_create_cart(user_id):
    cart = Cart.query.filter_by(user_id=user_id).first()
    if not cart:
        cart = Cart(user_id=user_id)
        db.session.add(cart)
        db.session.commit()
    return cart


def get_cart(user_id):
    cart = get_or_create_cart(user_id)
    return cart.to_dict()


def add_to_cart(user_id, variant_id, quantity):
    variant = ProductVariant.query.get(variant_id)
    if not variant or not variant.is_active:
        return None, "Variant not found or inactive"

    if not variant.product or not variant.product.is_active:
        return None, "Product not found or inactive"

    cart = get_or_create_cart(user_id)

    existing = CartItem.query.filter_by(cart_id=cart.id, product_variant_id=variant_id).first()
    if existing:
        existing.quantity += quantity
    else:
        item = CartItem(cart_id=cart.id, product_variant_id=variant_id, quantity=quantity)
        db.session.add(item)

    db.session.commit()
    return {"message": "Item added to cart"}, None


def update_cart_item(user_id, variant_id, quantity):
    cart = get_or_create_cart(user_id)
    item = CartItem.query.filter_by(cart_id=cart.id, product_variant_id=variant_id).first()
    if not item:
        return None, "Item not in cart"

    item.quantity = quantity
    db.session.commit()
    return {"message": "Cart updated"}, None


def remove_from_cart(user_id, variant_id):
    cart = get_or_create_cart(user_id)
    item = CartItem.query.filter_by(cart_id=cart.id, product_variant_id=variant_id).first()
    if not item:
        return None, "Item not in cart"

    db.session.delete(item)
    db.session.commit()
    return {"message": "Item removed from cart"}, None
