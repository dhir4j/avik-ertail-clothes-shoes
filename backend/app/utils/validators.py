import re

EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_email(email):
    if not email or not EMAIL_RE.match(email):
        return "Invalid email format"
    return None


def validate_password(password):
    if not password or len(password) < 8:
        return "Password must be at least 8 characters"
    return None


def validate_required(value, field_name):
    if value is None or (isinstance(value, str) and not value.strip()):
        return f"{field_name} is required"
    return None


def validate_rating(rating):
    if not isinstance(rating, int) or rating < 1 or rating > 5:
        return "Rating must be between 1 and 5"
    return None


def validate_positive_int(value, field_name):
    if not isinstance(value, int) or value < 1:
        return f"{field_name} must be a positive integer"
    return None


def collect_errors(validations):
    """Given a dict of {field: error_or_none}, return only the fields with errors."""
    return {k: [v] for k, v in validations.items() if v is not None}
