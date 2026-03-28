#!/usr/bin/env python
"""
Import products from the superkicks JSON dataset into PostgreSQL.

Usage:
    python scripts/import_products.py
    python scripts/import_products.py --source ../scraper/superkicks_data.json
    python scripts/import_products.py --initial-stock 10
    python scripts/import_products.py --force-stock   # overwrite existing stock values
"""
import argparse
import os
import sys

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import create_app
from app.services.import_service import import_products


def main():
    parser = argparse.ArgumentParser(description="Import products from JSON dataset")
    parser.add_argument(
        "--source",
        default=None,
        help="Path to superkicks_data.json (defaults to config PRODUCT_DATASET_PATH)",
    )
    parser.add_argument(
        "--initial-stock",
        type=int,
        default=0,
        help="Initial stock quantity for new variants (default: 0)",
    )
    parser.add_argument(
        "--force-stock",
        action="store_true",
        help="Overwrite existing stock values with initial-stock",
    )
    args = parser.parse_args()

    config_name = os.getenv("FLASK_ENV", "development")
    app = create_app(config_name)

    with app.app_context():
        source = args.source or app.config["PRODUCT_DATASET_PATH"]
        print(f"Importing from: {source}")
        print(f"Initial stock: {args.initial_stock}, Force stock: {args.force_stock}")

        stats = import_products(
            dataset_path=source,
            initial_stock=args.initial_stock,
            force_stock=args.force_stock,
        )

        print("\n--- Import Results ---")
        for key, value in stats.items():
            print(f"  {key}: {value}")
        print("Done.")


if __name__ == "__main__":
    main()
