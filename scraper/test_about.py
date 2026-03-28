import sys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time

def extract_text_safe(element, selector):
    try:
        return element.find_element(By.CSS_SELECTOR, selector).text.strip()
    except:
        return None

def test_about():
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36")
    
    service = Service(ChromeDriverManager().install())
    driver = webdriver.Chrome(service=service, options=chrome_options)
    
    driver.get("https://www.superkicks.in/products/new-balance-u1906r-thunder-brown-with-black")
    time.sleep(3)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)
    
    try:
        about_summary = driver.find_element(By.XPATH, "//details[.//h2[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), 'about product')]]")
        if about_summary.get_attribute("open") is None:
            driver.execute_script("arguments[0].setAttribute('open', '');", about_summary)
            
        desc_div = about_summary.find_element(By.CSS_SELECTOR, "div.product__description")
        
        about_title = extract_text_safe(desc_div, "h3")
        about_desc = extract_text_safe(desc_div, "p")
        if not about_desc:
            about_desc = desc_div.text.strip()
            if about_title and about_desc.startswith(about_title):
                about_desc = about_desc[len(about_title):].strip()
                
        print(f"TITLE: {about_title}")
        print(f"DESC: {about_desc}")
    except Exception as e:
        print(f"Error: {e}")
        
    driver.quit()

if __name__ == '__main__':
    test_about()
