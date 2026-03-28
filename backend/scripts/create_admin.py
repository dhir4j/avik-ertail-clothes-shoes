"""
Create or update an admin user.

Usage (run from the backend/ directory):
    python scripts/create_admin.py

Or with args:
    python scripts/create_admin.py --name "Your Name" --email admin@solestreetshoes.com --password yourpassword
"""

import sys
import os
import argparse
import getpass

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env'))

from app import create_app
from app.extensions import db, bcrypt
from app.models.user import User


def create_admin(name: str, email: str, password: str):
    app = create_app(os.getenv('FLASK_ENV', 'development'))
    with app.app_context():
        existing = User.query.filter_by(email=email.lower()).first()

        if existing:
            # Update existing user to admin
            existing.role = 'admin'
            existing.is_active = True
            existing.name = name
            existing.password_hash = bcrypt.generate_password_hash(password).decode('utf-8')
            db.session.commit()
            print(f"✓ Updated existing user '{email}' → role set to admin.")
        else:
            # Create new admin user
            user = User(
                name=name,
                email=email.lower(),
                password_hash=bcrypt.generate_password_hash(password).decode('utf-8'),
                role='admin',
                is_active=True,
            )
            db.session.add(user)
            db.session.commit()
            print(f"✓ Admin user created: {email}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Create or update an admin user')
    parser.add_argument('--name',     default='', help='Full name')
    parser.add_argument('--email',    default='', help='Email address')
    parser.add_argument('--password', default='', help='Password (omit to be prompted)')
    args = parser.parse_args()

    name     = args.name     or input('Full name:  ').strip()
    email    = args.email    or input('Email:      ').strip()
    password = args.password or getpass.getpass('Password:   ')

    if len(password) < 8:
        print('✗ Password must be at least 8 characters.')
        sys.exit(1)

    create_admin(name, email, password)
