from app.utils.validators import validate_email, validate_password, validate_required, collect_errors


def validate_register(data):
    errors = collect_errors({
        "name": validate_required(data.get("name"), "Name"),
        "email": validate_email(data.get("email")),
        "password": validate_password(data.get("password")),
    })
    return errors if errors else None


def validate_login(data):
    errors = collect_errors({
        "email": validate_email(data.get("email")),
        "password": validate_required(data.get("password"), "Password"),
    })
    return errors if errors else None
