"""
Shop4Shops.in Scraper
=====================
Scrapes product data from shop4shops.in (Shopify-based wholesale clothing store)
using the Shopify JSON API endpoint: /collections/{handle}/products.json

Extracts Men's and Women's categories including sub-collections.
"""

import requests
import json
import time
import re
from html import unescape


BASE_URL = "https://shop4shops.in"
PRODUCTS_PER_PAGE = 250  # Shopify max per page

# All collections to scrape, grouped by category
COLLECTIONS = {
    "men": {
        "main": "men",
        "sub_collections": [
            "mens-pyjamas-home-wear",
            "mens-underwear",
            "athleisure-collection-mens-athleisure",
        ],
    },
    "women": {
        "main": "women-athleisure",
        "sub_collections": [
            "women-sweatshirts-winter-wear",
        ],
    },
}

HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "application/json",
}


def clean_html(html_str: str) -> str:
    """Strip HTML tags and decode entities to get clean text."""
    if not html_str:
        return ""
    text = re.sub(r"<[^>]+>", " ", html_str)
    text = unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def parse_unit_price_inr(options: list) -> str | None:
    """Extract INR unit price from the 'Unit price' option."""
    for opt in options:
        if opt.get("name", "").lower().startswith("unit price"):
            values = opt.get("values", [])
            if values:
                # Format: "₹325 | $4.07" — take only INR part
                raw = values[0]
                inr_part = raw.split("|")[0].strip()
                return inr_part
    return None


def parse_moq_details(options: list) -> list[dict]:
    """
    Extract MOQ / Sizes / Ratio from options.
    Each value looks like: "6 pcs | S-M-L-XL | 1-2-2-1"
    """
    for opt in options:
        if "moq" in opt.get("name", "").lower():
            moq_list = []
            for val in opt.get("values", []):
                parts = [p.strip() for p in val.split("|")]
                entry = {"raw": val}
                if len(parts) >= 1:
                    entry["quantity"] = parts[0]
                if len(parts) >= 2:
                    entry["sizes"] = parts[1]
                if len(parts) >= 3:
                    entry["ratio"] = parts[2]
                moq_list.append(entry)
            return moq_list
    return []


def parse_skus(options: list) -> list[str]:
    """Extract SKU codes from options."""
    for opt in options:
        if opt.get("name", "").lower() == "sku":
            return opt.get("values", [])
    return []


def parse_available_sizes(moq_details: list[dict]) -> list[str]:
    """Derive unique available sizes from MOQ details."""
    sizes = []
    seen = set()
    for moq in moq_details:
        size_str = moq.get("sizes", "")
        for s in size_str.split("-"):
            s = s.strip()
            if s and s not in seen:
                sizes.append(s)
                seen.add(s)
    return sizes


def parse_product(product: dict) -> dict:
    """Parse a raw Shopify product JSON into our clean format."""
    options = product.get("options", [])
    moq_details = parse_moq_details(options)

    # Get set/bundle prices from variants
    variants = product.get("variants", [])
    set_prices = []
    for v in variants:
        price = v.get("price")
        if price:
            set_prices.append(f"₹{float(price):,.2f}")

    # Get all image URLs
    images = [img.get("src", "") for img in product.get("images", []) if img.get("src")]

    return {
        "product_title": product.get("title", ""),
        "description": clean_html(product.get("body_html", "")),
        "vendor": product.get("vendor", ""),
        "tags": product.get("tags", []),
        "unit_price_inr": parse_unit_price_inr(options),
        "set_prices": set_prices,
        "moq_details": moq_details,
        "skus": parse_skus(options),
        "available_sizes": parse_available_sizes(moq_details),
        "images": images,
    }


def fetch_collection_products(collection_handle: str) -> list[dict]:
    """Fetch all products from a Shopify collection using pagination."""
    all_products = []
    page = 1

    print(f"  Fetching: /collections/{collection_handle} ...", end="", flush=True)

    while True:
        url = f"{BASE_URL}/collections/{collection_handle}/products.json"
        params = {"limit": PRODUCTS_PER_PAGE, "page": page}

        try:
            resp = requests.get(url, headers=HEADERS, params=params, timeout=30)
            resp.raise_for_status()
            data = resp.json()
        except requests.RequestException as e:
            print(f"\n    [ERROR] Page {page}: {e}")
            break

        products = data.get("products", [])
        if not products:
            break

        all_products.extend(products)
        print(f" page {page} ({len(products)} items)", end="", flush=True)

        if len(products) < PRODUCTS_PER_PAGE:
            break

        page += 1
        time.sleep(1)  # Be polite with requests

    print(f" — Total: {len(all_products)}")
    return all_products


def scrape_category(category_name: str, config: dict) -> dict:
    """Scrape all collections for a category (main + sub-collections)."""
    category_data = {
        "category": category_name,
        "collections": [],
    }

    # Scrape main collection
    all_handles = [config["main"]] + config["sub_collections"]

    # Track product IDs to avoid duplicates across sub-collections
    seen_ids = set()

    for handle in all_handles:
        raw_products = fetch_collection_products(handle)

        parsed = []
        for p in raw_products:
            pid = p.get("id")
            if pid in seen_ids:
                continue
            seen_ids.add(pid)
            parsed.append(parse_product(p))

        category_data["collections"].append({
            "collection_name": handle.replace("-", " ").title(),
            "collection_handle": handle,
            "product_count": len(parsed),
            "products": parsed,
        })

        time.sleep(1)

    return category_data


def main():
    print("=" * 60)
    print("Shop4Shops.in Scraper")
    print("=" * 60)

    output = {
        "source": "shop4shops.in",
        "categories": [],
    }

    total_products = 0

    for category_name, config in COLLECTIONS.items():
        print(f"\n[{category_name.upper()}]")
        category_data = scrape_category(category_name, config)
        output["categories"].append(category_data)

        cat_total = sum(c["product_count"] for c in category_data["collections"])
        total_products += cat_total
        print(f"  Category total (deduplicated): {cat_total}")

    output["total_products"] = total_products

    out_path = "shop4shops_data.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(output, f, indent=4, ensure_ascii=False)

    print(f"\n{'=' * 60}")
    print(f"Done! {total_products} products saved to {out_path}")
    print(f"{'=' * 60}")


if __name__ == "__main__":
    main()
