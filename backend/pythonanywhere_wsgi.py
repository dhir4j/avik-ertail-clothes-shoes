"""
PythonAnywhere WSGI configuration for SOLESTREET backend.

Setup steps on PythonAnywhere (username: hard4j):
  1. Upload / git clone the repo to /home/hard4j/SOLESTREET-SHOES
  2. Open the WSGI file in the Web tab and paste in this file's contents
     (or set the WSGI file path to point here).
  3. Set the working directory to: /home/hard4j/SOLESTREET-SHOES/backend
  4. Set the virtualenv path to:   /home/hard4j/.virtualenvs/solestreet
     (create it with: mkvirtualenv solestreet --python=python3.11)
  5. pip install -r /home/hard4j/SOLESTREET-SHOES/backend/requirements.txt
  6. Create /home/hard4j/SOLESTREET-SHOES/backend/.env from .env.example
  7. Run DB migration:
       cd /home/hard4j/SOLESTREET-SHOES/backend
       flask db upgrade
  8. Reload the web app from the PythonAnywhere Web tab.
"""

import sys
import os

# ── Paths ──────────────────────────────────────────────────────────────────────
PROJECT_ROOT = '/home/hard4j/SOLESTREET-SHOES/backend'

if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# ── Activate virtualenv ────────────────────────────────────────────────────────
VENV_ACTIVATE = '/home/hard4j/.virtualenvs/solestreet/bin/activate_this.py'
if os.path.exists(VENV_ACTIVATE):
    with open(VENV_ACTIVATE) as f:
        exec(f.read(), {'__file__': VENV_ACTIVATE})

# ── Load .env ──────────────────────────────────────────────────────────────────
from dotenv import load_dotenv
load_dotenv(os.path.join(PROJECT_ROOT, '.env'))

# ── Create the WSGI application ────────────────────────────────────────────────
os.environ.setdefault('FLASK_ENV', 'production')

from app import create_app
application = create_app('production')
