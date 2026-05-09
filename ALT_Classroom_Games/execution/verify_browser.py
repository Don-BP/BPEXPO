"""
Layer 3 Tool: Standard Browser Verification
Usage: python execution/verify_browser.py --url "http://localhost:3000" --selector "#success-msg"
"""
import sys
import argparse
import time
from playwright.sync_api import sync_playwright

def verify(url, selector, text=None, screenshot_path=None):
    print(f"--- START VERIFICATION: {url} ---")
    with sync_playwright() as p:
        try:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # 1. Navigate
            print(f"Navigating to {url}...")
            response = page.goto(url, timeout=15000)
            if not response:
                raise Exception("No response from server")
            print(f"Status: {response.status}")

            # 2. Check Selector
            if selector:
                print(f"Waiting for selector: '{selector}'...")
                page.wait_for_selector(selector, state="visible", timeout=5000)
                print("Selector found.")

            # 3. Check Text
            if text:
                print(f"Checking for text: '{text}'...")
                content = page.content()
                if text not in content:
                    raise Exception(f"Text '{text}' not found in page content.")
                print("Text found.")

            # 4. Screenshot (Optional Proof)
            if screenshot_path:
                page.screenshot(path=screenshot_path)
                print(f"Screenshot saved to {screenshot_path}")

            browser.close()
            print("--- VERIFICATION SUCCESS ---")
            sys.exit(0)

        except Exception as e:
            print(f"--- VERIFICATION FAILED: {str(e)} ---")
            sys.exit(1)

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--url", required=True, help="Target URL")
    parser.add_argument("--selector", required=False, help="CSS Selector to wait for")
    parser.add_argument("--text", required=False, help="Text to verify is present")
    parser.add_argument("--screenshot", required=False, help="Path to save screenshot")
    
    args = parser.parse_args()
    verify(args.url, args.selector, args.text, args.screenshot)