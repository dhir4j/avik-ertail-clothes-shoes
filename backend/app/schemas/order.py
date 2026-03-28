from app.utils.validators import validate_required, collect_errors


def validate_create_order(data):
    errors = collect_errors({
        "shipping_name":         validate_required(data.get("shipping_name"), "Shipping name"),
        "shipping_phone":        validate_required(data.get("shipping_phone"), "Shipping phone"),
        "shipping_address_line1": validate_required(data.get("shipping_address_line1"), "Address line 1"),
        "shipping_city":         validate_required(data.get("shipping_city"), "City"),
        "shipping_state":        validate_required(data.get("shipping_state"), "State"),
        "shipping_postal_code":  validate_required(data.get("shipping_postal_code"), "Postal code"),
    })

    items = data.get("items")
    if not items or not isinstance(items, list) or len(items) == 0:
        errors = errors or {}
        errors["items"] = "Order must contain at least one item"

    return errors if errors else None


def validate_payment_submission(data):
    errors = collect_errors({
        "upi_reference": validate_required(data.get("upi_reference"), "UPI reference"),
    })
    return errors if errors else None
