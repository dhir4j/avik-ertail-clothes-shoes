from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import time

chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
service = Service(ChromeDriverManager().install())
driver = webdriver.Chrome(service=service, options=chrome_options)

driver.get("https://www.superkicks.in/collections/adidas-originals")
time.sleep(5)
driver.execute_script("window.scrollTo(0, document.body.scrollHeight/2);")
time.sleep(2)
divs = driver.find_elements(By.CSS_SELECTOR, "div.custom-media-brand-details")
print(f"Found {len(divs)} brand detail divs.")
if divs:
    print(divs[0].get_attribute("innerHTML"))
else:
    print("Checking if standard description exists...")
    desc = driver.find_elements(By.CSS_SELECTOR, "div.collection-hero__description")
    if desc:
        print(desc[0].get_attribute("innerHTML"))

driver.quit()
