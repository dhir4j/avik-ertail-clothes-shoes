from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, NoSuchElementException, StaleElementReferenceException
try:
    from webdriver_manager.chrome import ChromeDriverManager
except ImportError:
    print("Error: 'webdriver_manager' not installed. Run 'pip install webdriver_manager'.")
    exit(1)
import json
import time
import os
import sys
import logging
import threading
import queue
import random
import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

CHROMEDRIVER_PATH = None

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--headless") # Headless mode is crucial for parallel processing
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--disable-extensions")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
    chrome_options.add_argument("--disable-notifications")
    chrome_options.add_argument("--disable-popup-blocking")
    chrome_options.page_load_strategy = 'normal' # Better for getting details to fully load

    try:
        service = Service(CHROMEDRIVER_PATH)
        driver = webdriver.Chrome(service=service, options=chrome_options)
        driver.implicitly_wait(5) # Increase implicit wait
        return driver
    except Exception as e:
        logging.error(f"WebDriver initialization failed: {str(e)}")
        exit(1)

def extract_text_safe(element, selector):
    try:
        return element.find_element(By.CSS_SELECTOR, selector).text.strip()
    except NoSuchElementException:
        return None

def clean_img_url(img_url):
    if img_url:
        img_url = img_url.replace("https://", "").replace("http://", "")
        img_url = img_url.lstrip('/')
        img_url = img_url.split('?')[0]
    return img_url

def scroll_to_bottom(driver):
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(1.5)

def save_checkpoint(checkpoint_path, completed_urls, all_scrape_tasks, output_data):
    remaining = [{"product": p, "brand_index": b_idx} for p, b_idx in all_scrape_tasks if p["url"] not in completed_urls]
    checkpoint = {
        "completed_urls": list(completed_urls),
        "remaining_tasks": remaining,
        "output_data": output_data
    }
    with open(checkpoint_path, "w", encoding="utf-8") as f:
        json.dump(checkpoint, f, indent=4, ensure_ascii=False)
    logging.info(f"Checkpoint saved: {len(completed_urls)} done, {len(remaining)} remaining.")

def load_checkpoint(checkpoint_path):
    with open(checkpoint_path, "r", encoding="utf-8") as f:
        return json.load(f)

def scrape_brand_info(driver, brand_name):
    brand_info = {
        "about_title": None,
        "description": None,
        "logo_url": None
    }

    collection_slug = brand_name.lower().replace(" ", "-")
    if collection_slug == "adidas-originals":
        collection_slug = "adidas-originals"
    elif collection_slug == "new-balance":
        collection_slug = "new-balance"

    driver.get(f"https://www.superkicks.in/collections/{collection_slug}")
    time.sleep(2)

    try:
        desc_els = driver.find_elements(By.CSS_SELECTOR, "div.collection-custom--description p.collection-description, div.collection-hero__description")
        if desc_els:
            for el in desc_els:
                if el.text.strip():
                    brand_info["description"] = el.text.strip()
                    break

        title_els = driver.find_elements(By.CSS_SELECTOR, "h1.collection__title")
        if title_els:
            brand_info["about_title"] = title_els[0].text.strip()

        logo_els = driver.find_elements(By.CSS_SELECTOR, "div.collection-hero img, div.custom-media-brand-details img")
        if logo_els:
            brand_info["logo_url"] = clean_img_url(logo_els[0].get_attribute("src"))

    except Exception:
        pass

    return brand_info

def scrape_products_list(driver):
    products = []
    try:
        grid = WebDriverWait(driver, 5).until(
            EC.presence_of_element_located((By.ID, "product-grid"))
        )
        items = grid.find_elements(By.CSS_SELECTOR, "li.grid__item")

        for item in items:
            try:
                url_element = item.find_element(By.CSS_SELECTOR, "a.media-url-wrapper")
                url = url_element.get_attribute("href")
                if url:
                    url = url.split("?")[0]  # Clean URL
                else:
                    continue

                brand = extract_text_safe(item, ".card__vendor")

                product_name = extract_text_safe(item, "h3.card__heading.h5 .webkit-line-clamp")
                if not product_name:
                    product_name = extract_text_safe(item, "h3.card__heading.h5")

                color = extract_text_safe(item, "h5.product-color-text")

                price = extract_text_safe(item, ".price-item--sale.sale-price")
                if not price:
                    price = extract_text_safe(item, ".price-item--regular")

                products.append({
                    "url": url,
                    "brand": brand,
                    "product_name": product_name,
                    "color": color,
                    "price": price
                })
            except (NoSuchElementException, StaleElementReferenceException):
                continue
    except (NoSuchElementException, TimeoutException):
        pass
    return products

def scrape_product_details(driver):
    scroll_to_bottom(driver)

    details = {
        "images": [],
        "sizes": [],
        "about": {"title": None, "description": None},
        "details": {}
    }

    # Images
    try:
        media_items = WebDriverWait(driver, 5).until(
            EC.presence_of_all_elements_located((By.CSS_SELECTOR, "ul.product__media-list li.product__media-item"))
        )
        for media in media_items:
            img_url = None
            try:
                modal_opener = media.find_element(By.CSS_SELECTOR, "modal-opener")
                img_url = modal_opener.get_attribute("href")
            except NoSuchElementException:
                pass

            if not img_url:
                try:
                    img = media.find_element(By.CSS_SELECTOR, "img")
                    img_url = img.get_attribute("src")
                except NoSuchElementException:
                    continue

            cleaned_url = clean_img_url(img_url)
            if cleaned_url and cleaned_url not in details["images"]:
                details["images"].append(cleaned_url)
    except Exception as e:
        pass

    # Sizes
    try:
        labels = driver.find_elements(By.CSS_SELECTOR, "div.variant-radios-wrapper label")
        for label in labels:
            size_val = label.get_attribute("data-value")
            text_val = label.text.strip()
            val = text_val if text_val else size_val
            if val and val not in details["sizes"]:
                details["sizes"].append(val)
    except Exception as e:
        pass

    # About Product Title and Description
    try:
        time.sleep(1)
        about_summary = driver.find_element(By.XPATH, "//details[.//h2[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'about product')]]")

        if about_summary.get_attribute("open") is None:
            try:
                driver.execute_script("arguments[0].setAttribute('open', '');", about_summary)
            except:
                pass

        desc_div = about_summary.find_element(By.CSS_SELECTOR, "div.product__description")

        about_title = extract_text_safe(desc_div, "h3")
        about_desc = extract_text_safe(desc_div, "p")
        if not about_desc:
            about_desc = desc_div.text.strip()
            if about_title and about_desc.startswith(about_title):
                about_desc = about_desc[len(about_title):].strip()

        details["about"] = {
            "title": about_title,
            "description": about_desc
        }
    except Exception as e:
        pass

    # Product Details / Specifics
    try:
        details_summary = driver.find_element(By.XPATH, "//details[.//h2[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'product details')]]")

        if details_summary.get_attribute("open") is None:
            try:
                driver.execute_script("arguments[0].setAttribute('open', '');", details_summary)
            except:
                pass

        desc_div = details_summary.find_element(By.CSS_SELECTOR, "div.product__description")

        names = desc_div.find_elements(By.CSS_SELECTOR, "span.product_description-name")
        values = desc_div.find_elements(By.CSS_SELECTOR, "span.product_description-value")

        for name, value in zip(names, values):
            name_text = name.text.replace(":", "").strip()
            value_text = value.text.strip()
            if name_text:
                details["details"][name_text] = value_text
    except Exception as e:
        pass

    return details

def scrape_product_task(product_basic_info, driver_pool, data_lock, output_data, json_path, brand_index,
                        rate_limited_event, completed_urls):
    # If rate limit already detected by another worker, skip immediately
    if rate_limited_event.is_set():
        return

    driver = driver_pool.get()
    try:
        # Sleep randomly to avoid identical simultaneous requests from workers that trigger Shopify rate limits
        time.sleep(random.uniform(2.0, 5.0))

        # Check again after sleep in case another worker just signaled
        if rate_limited_event.is_set():
            return

        driver.get(product_basic_info["url"])

        try:
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "ul.product__media-list"))
            )
        except TimeoutException:
            pass

        time.sleep(2) # Give remaining elements enough time to load into DOM.

        detailed_info = scrape_product_details(driver)

        # Bypassing silent 0-image captchas
        if not detailed_info["images"]:
            logging.warning(f"No images found for {product_basic_info['url']}. Possible rate limit/captcha. Sleeping 25s and retrying...")
            time.sleep(25)
            driver.refresh()

            try:
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, "ul.product__media-list"))
                )
            except TimeoutException:
                pass

            time.sleep(3)
            detailed_info = scrape_product_details(driver)

            if not detailed_info["images"]:
                logging.error(f"Rate limit confirmed for {product_basic_info['url']}. Signaling all workers to pause...")
                rate_limited_event.set()
                return  # Do NOT mark as completed — will be retried on resume

        product_full = {**product_basic_info, **detailed_info}

        with data_lock:
            for i, existing_prod in enumerate(output_data["brands"][brand_index]["products"]):
                if existing_prod["url"] == product_full["url"]:
                    output_data["brands"][brand_index]["products"][i] = product_full
                    break
            else:
                output_data["brands"][brand_index]["products"].append(product_full)

            completed_urls.add(product_basic_info["url"])

            logging.info(f"Successfully scraped & added details for: {product_basic_info['product_name']} | Images: {len(detailed_info['images'])} | Details: {len(detailed_info['details'].keys())}")

            with open(json_path, "w", encoding="utf-8") as f:
                json.dump(output_data, f, indent=4, ensure_ascii=False)

    except Exception as e:
        logging.error(f"Error scraping {product_basic_info['url']}: {e}")
    finally:
        driver_pool.put(driver)



def main():
    global CHROMEDRIVER_PATH

    parser = argparse.ArgumentParser(description="Superkicks scraper with pause/resume support.")
    parser.add_argument("--resume", action="store_true", help="Resume from a saved checkpoint after changing VPN.")
    args = parser.parse_args()

    json_path = os.path.join(os.path.dirname(__file__), "superkicks_data.json")
    checkpoint_path = os.path.join(os.path.dirname(__file__), "scraper_checkpoint.json")

    logging.info("Initializing ChromeDriver (this happens once)...")
    CHROMEDRIVER_PATH = ChromeDriverManager().install()

    NUM_WORKERS = 3
    DRIVER_POOL = queue.Queue()

    logging.info(f"Spinning up {NUM_WORKERS} browser drivers for processing pool...")
    for _ in range(NUM_WORKERS):
        DRIVER_POOL.put(setup_driver())

    DATA_LOCK = threading.Lock()
    rate_limited_event = threading.Event()
    completed_urls = set()

    brands_urls = {
        "adidas": "https://www.superkicks.in/collections/footwear?filter.p.vendor=adidas&filter.v.availability=1&sort_by=manual",
        "adidas Originals": "https://www.superkicks.in/collections/footwear?filter.p.vendor=adidas+Originals&filter.v.availability=1&sort_by=manual",
        "Asics": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Asics&filter.v.availability=1&sort_by=manual",
        "Converse": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Converse&filter.v.availability=1&sort_by=manual",
        "Jordan": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Jordan&filter.v.availability=1&sort_by=manual",
        "New Balance": "https://www.superkicks.in/collections/footwear?filter.p.vendor=New+Balance&filter.v.availability=1&sort_by=manual",
        "Nike": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Nike&filter.v.availability=1&sort_by=manual",
        "Puma": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Puma&filter.v.availability=1&sort_by=manual",
        "Reebok": "https://www.superkicks.in/collections/footwear?filter.p.vendor=Reebok&filter.v.availability=1&sort_by=manual"
    }

    # ── RESUME MODE ──────────────────────────────────────────────────────────────
    if args.resume:
        if not os.path.exists(checkpoint_path):
            logging.error("No checkpoint file found. Run without --resume first.")
            sys.exit(1)

        logging.info("Loading checkpoint...")
        checkpoint = load_checkpoint(checkpoint_path)
        completed_urls = set(checkpoint["completed_urls"])
        output_data = checkpoint["output_data"]
        all_scrape_tasks = [(entry["product"], entry["brand_index"]) for entry in checkpoint["remaining_tasks"]]

        logging.info(f"Checkpoint loaded: {len(completed_urls)} already done, {len(all_scrape_tasks)} remaining.")

    # ── FRESH RUN — PHASE 1 ───────────────────────────────────────────────────
    else:
        output_data = {"brands": []}

        # Init dictionary structure
        for b_name in brands_urls.keys():
            output_data["brands"].append({
                "name": b_name,
                "brand_info": {},
                "products": []
            })

        main_driver = DRIVER_POOL.get()
        visited_urls = set()
        all_scrape_tasks = []

        brand_index = 0
        for brand_name, brand_base_url in brands_urls.items():
            logging.info(f"Navigating to Brand: {brand_name}")

            logging.info(f"Extracting brand info for {brand_name}...")
            brand_info = scrape_brand_info(main_driver, brand_name)
            with DATA_LOCK:
                output_data["brands"][brand_index]["brand_info"] = brand_info

            page = 1

            while True:
                paginated_url = f"{brand_base_url}&page={page}"
                main_driver.get(paginated_url)
                time.sleep(3)

                try:
                    WebDriverWait(main_driver, 10).until(
                        EC.presence_of_element_located((By.ID, "product-grid"))
                    )
                except TimeoutException:
                    logging.info(f"No grid. End of pagination for {brand_name}.")
                    break

                products_list = scrape_products_list(main_driver)
                if not products_list:
                    logging.info(f"End of pagination for {brand_name}. Total {page-1} page(s) logged.")
                    break

                new_products = 0
                for p in products_list:
                    if p["url"] not in visited_urls:
                        visited_urls.add(p["url"])
                        new_products += 1
                        with DATA_LOCK:
                            output_data["brands"][brand_index]["products"].append(p)
                        all_scrape_tasks.append((p, brand_index))

                if new_products == 0:
                     logging.info(f"No new unique products found on page {page} for {brand_name}. Ending pagination.")
                     break

                page += 1

            brand_index += 1

        # Return main driver back to pool so it can be picked up by the executor
        DRIVER_POOL.put(main_driver)

        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(output_data, f, indent=4, ensure_ascii=False)

    # ── PHASE 2: Parallel product detail scraping ─────────────────────────────
    logging.info(f"Starting Phase 2: Scraping details for {len(all_scrape_tasks)} products with {NUM_WORKERS} workers...")

    with ThreadPoolExecutor(max_workers=NUM_WORKERS) as executor:
        futures = []
        for p, b_idx in all_scrape_tasks:
            futures.append(executor.submit(
                scrape_product_task,
                p, DRIVER_POOL, DATA_LOCK, output_data, json_path, b_idx,
                rate_limited_event, completed_urls
            ))

        for future in as_completed(futures):
            try:
                future.result()
            except Exception as e:
                logging.error(f"Task exception in thread pool: {e}")

    # ── SHUTDOWN ──────────────────────────────────────────────────────────────
    logging.info("Quitting all worker drivers...")
    while not DRIVER_POOL.empty():
        d = DRIVER_POOL.get()
        d.quit()

    if rate_limited_event.is_set():
        save_checkpoint(checkpoint_path, completed_urls, all_scrape_tasks, output_data)
        remaining_count = len(all_scrape_tasks) - len(completed_urls)
        logging.warning("\n" + "=" * 60)
        logging.warning("RATE LIMIT DETECTED — SCRAPER PAUSED")
        logging.warning(f"  Completed : {len(completed_urls)} products")
        logging.warning(f"  Remaining : {remaining_count} products")
        logging.warning(f"  Checkpoint: {checkpoint_path}")
        logging.warning("  --> Change your VPN, then run:")
        logging.warning("      python scraper.py --resume")
        logging.warning("=" * 60)
    else:
        # Clean run — remove stale checkpoint if any
        if os.path.exists(checkpoint_path):
            os.remove(checkpoint_path)
            logging.info("Stale checkpoint removed.")
        logging.info("Scraping completed fully. Details are thoroughly stored in superkicks_data.json.")

if __name__ == "__main__":
    main()
