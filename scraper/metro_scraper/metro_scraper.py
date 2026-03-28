"""
Metro Shoes scraper.

Phase 1 — Selenium (eager load strategy) to render JS and extract product listing cards.
Phase 2 — requests + JSON-LD parsing for product details; HEAD requests to CDN for images.
         No Selenium browsers kept open for Phase 2 (much faster).

Install deps:
    pip install selenium webdriver-manager requests beautifulsoup4
"""

from selenium import webdriver
from selenium.webdriver.firefox.service import Service as FirefoxService
from selenium.webdriver.common.by import By
from selenium.webdriver.firefox.options import Options as FirefoxOptions
from selenium.common.exceptions import WebDriverException
try:
    from webdriver_manager.firefox import GeckoDriverManager
except ImportError:
    print("Error: run 'pip install webdriver-manager'")
    exit(1)
try:
    from bs4 import BeautifulSoup
except ImportError:
    print("Error: run 'pip install beautifulsoup4'")
    exit(1)

import requests
import json
import os
import sys
import logging
import threading
import time
import random
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ─── Constants ────────────────────────────────────────────────────────────────

REQUESTS_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (X11; Linux x86_64; rv:147.0) Gecko/20100101 Firefox/147.0"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    # Do NOT set Accept-Encoding — let requests handle decompression automatically.
    # Setting it manually causes urllib3 to skip auto-decompression.
}

# All known product-image view codes (derived from actual site HTML)
IMAGE_VIEW_CODES = ["MF", "MD", "LA", "M", "O", "R", "S", "T", "U", "RF", "ST", "X", "L", "H"]
KXADMIN_BASE = "https://kxadmin.metroshoes.com/product"
PIM_API      = "https://pim.metroshoes.net/pim/pimresponse.php/"

# PIM API result fields → human-readable spec label
SPEC_FIELDS = [
    ("product",           "Product"),
    ("category_name",     "Type"),
    ("upper_material",    "Upper Material"),
    ("occasion",          "Occasion"),
    ("heel_type",         "Heel Type"),
    ("gender",            "Gender"),
    ("colour",            "Colour"),
    ("brand",             "Brand"),
    ("heel_height",       "Heel Height (in inches)"),
    ("country_of_origin", "Country of Origin"),
    ("net_quantity",      "Net Quantity"),
]

def rebrand(obj):
    """Recursively replace 'Metro'/'metro' with 'Solestreet'/'solestreet' in all
    string values, skipping URLs (http/https strings) to preserve links.
    """
    if isinstance(obj, dict):
        return {k: rebrand(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [rebrand(i) for i in obj]
    if isinstance(obj, str) and not obj.startswith("http"):
        return obj.replace("Metro", "Solestreet").replace("metro", "solestreet")
    return obj

# Maps category URL → (gender, category_name)
CATEGORY_META = {
    "https://www.metroshoes.com/men-shoes/shoe-type/kolhapuris.html":  ("Men",   "Kolhapuris"),
    "https://www.metroshoes.com/men-shoes/shoe-type/jutis.html":       ("Men",   "Jutis"),
    "https://www.metroshoes.com/men-shoes/shoe-type/brogue.html":      ("Men",   "Brogue"),
    "https://www.metroshoes.com/men-shoes/shoe-type/loafers.html":     ("Men",   "Loafers"),
    "https://www.metroshoes.com/men-shoes/shoe-type/boots.html":       ("Men",   "Boots"),
    "https://www.metroshoes.com/monk.html":                            ("Men",   "Monk"),
    "https://www.metroshoes.com/women-shoes/shoe-type/ballerinas.html":("Women", "Ballerinas"),
    "https://www.metroshoes.com/women-shoes/shoe-type/boots.html":     ("Women", "Boots"),
    "https://www.metroshoes.com/women-shoes/shoe-type/gladiators.html":("Women", "Gladiators"),
    "https://www.metroshoes.com/women-shoes/shoe-type/mojaris.html":   ("Women", "Mojaris"),
}
CATEGORY_URLS = list(CATEGORY_META.keys())

# ─── Phase 1: Selenium listing scraper ───────────────────────────────────────

GECKO_CACHE = os.path.expanduser("~/.wdm/drivers/geckodriver/linux64/v0.36.0/geckodriver")

def _geckodriver_path():
    """Return cached geckodriver path, or download via manager if not present."""
    if os.path.isfile(GECKO_CACHE):
        return GECKO_CACHE
    return GeckoDriverManager().install()


def setup_driver():
    opts = FirefoxOptions()
    opts.add_argument("--headless")
    opts.page_load_strategy = "normal"

    svc = FirefoxService(_geckodriver_path())
    driver = webdriver.Firefox(service=svc, options=opts)
    driver.set_page_load_timeout(90)
    return driver


def js_extract_listing(driver):
    """Single JS call to pull all product cards from current page.

    HTML structure (confirmed from live DOM inspection):
      .slide-box
        ├── .product-box   (image, offer tag, Add-to-Cart btn)
        └── .product-infos (brand name, product name, price)

    .brand_name is a SIBLING of .product-box, NOT a child — iterate .slide-box.
    """
    return driver.execute_script("""
        var results = [];
        document.querySelectorAll('.slide-box').forEach(function(slide) {
            try {
                var box   = slide.querySelector('.product-box');
                var infos = slide.querySelector('.product-infos');
                if (!box || !infos) return;

                // Product URL: <a> inside .product-box wrapping the image,
                // not the wishlist/similar/add-to-cart links
                var links = Array.from(box.querySelectorAll('a[href]'));
                var link  = links.find(function(a) {
                    return a.href.endsWith('.html') &&
                           !a.href.includes('#') &&
                           !a.className.includes('view_detail') &&
                           !a.className.includes('wishlist') &&
                           !a.className.includes('simlar');
                });
                if (!link) return;
                var url = link.href.split('?')[0];
                if (!url || url === window.location.href) return;

                var nameEl     = infos.querySelector('.brand_name');
                var brandEl    = infos.querySelector('.productBrandName');
                var priceEl    = infos.querySelector('.price.font-bold');
                var oldPriceEl = infos.querySelector('.old-price');
                var imgEl      = box.querySelector('.product-imageSingle img');

                results.push({
                    url:           url,
                    brand:         brandEl    ? brandEl.textContent.trim()    : null,
                    product_name:  nameEl     ? nameEl.textContent.trim()     : null,
                    listing_price: priceEl    ? priceEl.textContent.trim()    : null,
                    listing_mrp:   oldPriceEl ? oldPriceEl.textContent.trim() : null,
                    listing_image: imgEl      ? (imgEl.src || imgEl.getAttribute('data-lazy') || '').split('?')[0] : null
                });
            } catch(e) {}
        });
        return results;
    """) or []


def scrape_category(driver, category_url, max_pages=None):
    seen = set()
    collected = []
    page = 1

    while True:
        url = f"{category_url}?page={page}" if page > 1 else category_url
        logging.info(f"  GET {url}")

        try:
            driver.get(url)
        except WebDriverException:
            # Page load timed out at 90s — DOM is still readable, carry on
            logging.debug(f"  Page load timed out (continuing with partial DOM)")

        # DOM is ready but Vue makes async API calls on mount.
        # Poll until products appear (safe to call execute_script now).
        found = False
        for _ in range(20):          # up to 20 × 1s = 20s
            time.sleep(1)
            count = driver.execute_script(
                # .brand_name lives in .product-infos, a SIBLING of .product-box
                "return document.querySelectorAll('.product-infos .brand_name').length"
            )
            if count and count > 0:
                found = True
                break

        if not found:
            logging.info(f"  No products on page {page} — pagination done.")
            break

        cards = js_extract_listing(driver)
        new = [c for c in cards if c["url"] not in seen]

        for c in new:
            seen.add(c["url"])
            collected.append(c)

        logging.info(f"  Page {page}: {len(cards)} cards, {len(new)} new.")

        if not new:
            break
        if max_pages and page >= max_pages:
            break
        page += 1

    return collected


# ─── Phase 2: requests-based detail scraper ──────────────────────────────────

def make_session():
    s = requests.Session()
    s.headers.update(REQUESTS_HEADERS)
    return s


def parse_jsonld(html):
    """Parse all JSON-LD blocks, flattening any that are arrays."""
    soup = BeautifulSoup(html, "html.parser")
    out = []
    for tag in soup.find_all("script", type="application/ld+json"):
        try:
            data = json.loads(tag.string)
            if isinstance(data, list):
                out.extend(data)   # flatten arrays like [{...}, {...}]
            else:
                out.append(data)
        except Exception:
            pass
    return out


def color_code_from_variants(product_id, variants):
    """Extract color code from the variant SKU string.
    e.g. product_id='16-1222', SKU='16-1222-12-41' → color='12'
    """
    n = len(product_id.split("-"))
    for v in variants:
        parts = v.get("sku", "").split("-")
        if len(parts) > n:
            return parts[n]
    return None


def discover_images(session, product_id, color_code):
    """HEAD-check each known view code against the kxadmin CDN.
    Returns only URLs that actually exist (200 response).
    """
    found = []
    for view in IMAGE_VIEW_CODES:
        url = f"{KXADMIN_BASE}/{product_id}/660/{product_id}{view}{color_code}.jpg"
        try:
            r = session.get(url, timeout=8, allow_redirects=True, stream=True)
            # CDN returns 200 + text/html for missing images — must validate Content-Type
            if r.status_code == 200 and r.headers.get("Content-Type", "").startswith("image/"):
                found.append(url)
        except Exception:
            pass
    return found


def fetch_pim_details(session, url_key):
    """Call the Metro PIM API to get description and specifications.
    url_key: product URL path without .html (e.g. 'metro-16-1143-brown-ethnic-kolhapuris')
    Returns (description_str, specs_dict) — both None on failure.
    """
    try:
        r = session.get(PIM_API, params={"service": "product", "store": "1", "url_key": url_key},
                        timeout=15)
        r.raise_for_status()
        data   = r.json()
        result = data.get("result", {})
        if not result or not data.get("response", {}).get("success"):
            return None, None

        description = result.get("description") or None

        specs = {}
        for field, label in SPEC_FIELDS:
            val = result.get(field)
            if val:
                specs[label] = val

        return description, specs or None
    except Exception as e:
        logging.debug(f"  PIM API failed for {url_key}: {e}")
        return None, None


def fetch_product_details(stub):
    """Fetch product page, parse JSON-LD + HTML specs, discover images via CDN HEAD.
    Each call creates its own session (thread-safe).
    """
    session = make_session()
    url = stub["url"]
    time.sleep(random.uniform(0.15, 0.45))

    try:
        r = session.get(url, timeout=30)
        r.raise_for_status()
        logging.debug(f"  Fetched {url} — status={r.status_code} len={len(r.text)}")
    except Exception as e:
        logging.warning(f"  Fetch failed {url}: {type(e).__name__}: {e}")
        return {**stub, "images": []}

    # Start from stub fields we want to keep
    product = {
        "url":           stub["url"],
        "gender":        stub.get("gender"),
        "category":      stub.get("category"),
        "product_name":  stub.get("product_name"),
        "listing_image": stub.get("listing_image"),
    }
    images = []

    for block in parse_jsonld(r.text):
        if block.get("@type") != "ProductGroup":
            continue

        product["product_name"] = block.get("name") or product["product_name"]

        offers  = block.get("offers", {})
        low     = offers.get("lowPrice")
        high    = offers.get("highPrice")
        product["price"] = int(low)  if low  else None
        product["mrp"]   = int(high) if high else None

        variants   = block.get("hasVariant", [])
        product_id = block.get("productGroupID")
        color_code = color_code_from_variants(product_id, variants)

        color_name = None
        for v in variants:
            if v.get("color"):
                color_name = v["color"]
                break

        product["color"]      = color_name
        product["color_code"] = color_code

        # Flat sizes list — just the size values (e.g. ["6","7","8","9"])
        product["sizes"] = [v.get("size") for v in variants if v.get("size")]

        # Gallery images (with https://)
        if product_id and color_code:
            images = discover_images(session, product_id, color_code)

        # Fallback to JSON-LD single image (already has https://)
        if not images:
            img = (block.get("image", "") or "").split("?")[0]
            if img:
                images = [img]
        break

    # Description + specs via PIM API
    url_key = url.rstrip("/").split("/")[-1].removesuffix(".html")
    description, specs = fetch_pim_details(session, url_key)
    product["description"]    = description
    product["specifications"] = specs

    product["images"] = images
    logging.info(
        f"  {product.get('product_name')} | {len(product.get('sizes', []))} sizes "
        f"| {len(images)} images | desc={'yes' if description else 'no'}"
    )
    return product


# ─── Checkpoint helpers ───────────────────────────────────────────────────────

def save_checkpoint(path, done_urls, remaining, output):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(
            {"completed_urls": list(done_urls), "remaining_tasks": remaining, "output_data": output},
            f, indent=4, ensure_ascii=False,
        )
    logging.info(f"Checkpoint: {len(done_urls)} done, {len(remaining)} queued.")


def load_checkpoint(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="Metro Shoes scraper.")
    parser.add_argument("--resume",    action="store_true", help="Resume from checkpoint.")
    parser.add_argument("--max-pages", type=int, default=None,  help="Max pages per category.")
    parser.add_argument("--workers",   type=int, default=8,     help="Parallel detail workers.")
    args = parser.parse_args()

    base_dir       = os.path.dirname(__file__)
    json_path      = os.path.join(base_dir, "metro_data.json")
    checkpoint_path = os.path.join(base_dir, "metro_scraper_checkpoint.json")

    done_urls   = set()
    data_lock   = threading.Lock()

    # ── Resume or start fresh ────────────────────────────────────────────────
    if args.resume:
        if not os.path.exists(checkpoint_path):
            logging.error("No checkpoint file found. Run without --resume first.")
            sys.exit(1)
        cp          = load_checkpoint(checkpoint_path)
        done_urls   = set(cp["completed_urls"])
        output_data = cp["output_data"]
        tasks       = cp["remaining_tasks"]
        logging.info(f"Resumed: {len(done_urls)} done, {len(tasks)} remaining.")

    else:
        output_data = []
        tasks       = []
        seen_urls   = set()

        # Phase 1: one Selenium driver, eager load strategy
        logging.info("Phase 1 — Category listing via Selenium (eager page load) ...")
        driver = setup_driver()
        try:
            for cat_url in CATEGORY_URLS:
                gender, category = CATEGORY_META[cat_url]
                logging.info(f"=== {gender} / {category} ===")
                stubs = scrape_category(driver, cat_url, max_pages=args.max_pages)
                for p in stubs:
                    if p["url"] not in seen_urls:
                        seen_urls.add(p["url"])
                        p["gender"]   = gender
                        p["category"] = category
                        tasks.append(p)
                        output_data.append(p)
                logging.info(f"  → {len(stubs)} products collected.")
        finally:
            driver.quit()

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=4, ensure_ascii=False)
        logging.info(f"Phase 1 done: {len(tasks)} unique products queued for Phase 2.")

    # ── Phase 2: requests + HEAD image discovery ─────────────────────────────
    logging.info(f"Phase 2 — Product details ({args.workers} workers, no browser) ...")

    def process(stub):
        if stub["url"] in done_urls:
            return
        result = fetch_product_details(stub)
        with data_lock:
            done_urls.add(stub["url"])
            for i, e in enumerate(output_data):
                if e["url"] == result["url"]:
                    output_data[i] = result
                    break
            else:
                output_data.append(result)
            # Write flat list as interim progress file
            with open(json_path + ".tmp", "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=4, ensure_ascii=False)

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futures = {pool.submit(process, s): s for s in tasks}
        for fut in as_completed(futures):
            try:
                fut.result()
            except Exception as e:
                logging.error(f"Worker error: {e}")

    # ── Build nested output: Gender > Category > Product Name > details ──────
    nested = {}
    for p in output_data:
        gender   = p.get("gender",   "Unknown")
        category = p.get("category", "Unknown")
        name     = p.get("product_name") or p.get("url")

        nested.setdefault(gender, {}).setdefault(category, {})[name] = {
            "url":            p.get("url"),
            "color":          p.get("color"),
            "price":          p.get("price"),
            "mrp":            p.get("mrp"),
            "sizes":          p.get("sizes", []),
            "description":    p.get("description"),
            "specifications": p.get("specifications"),
            "listing_image":  p.get("listing_image"),
            "images":         p.get("images", []),
        }

    nested = rebrand(nested)

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(nested, f, indent=4, ensure_ascii=False)

    # Clean up temp file and checkpoint
    if os.path.exists(json_path + ".tmp"):
        os.remove(json_path + ".tmp")
    if os.path.exists(checkpoint_path):
        os.remove(checkpoint_path)

    total = sum(len(prods) for cats in nested.values() for prods in cats.values())
    logging.info(f"All done. {total} products saved to metro_data.json (nested by Gender > Category).")


if __name__ == "__main__":
    main()
