import os
from app import create_app

config_name = os.getenv("FLASK_ENV", "development")
application = create_app(config_name)

if __name__ == "__main__":
    application.run(host="0.0.0.0", port=5000)
