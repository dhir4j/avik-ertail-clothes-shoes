from app.extensions import db, bcrypt
from app.models.user import User
from app.auth.jwt_utils import generate_token


def register_user(name, email, password, phone=None):
    if User.query.filter_by(email=email).first():
        return None, "Email already registered"

    pw_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(name=name, email=email, password_hash=pw_hash, phone=phone)
    db.session.add(user)
    db.session.commit()

    token = generate_token(user.id, user.role)
    return {"token": token, "user": user.to_public_dict()}, None


def login_user(email, password):
    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return None, "Invalid email or password"

    if not user.is_active:
        return None, "Account is disabled"

    token = generate_token(user.id, user.role)
    return {"token": token, "user": user.to_public_dict()}, None


def get_current_user(user):
    return user.to_public_dict()
