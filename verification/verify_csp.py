from playwright.sync_api import sync_playwright

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    page = browser.new_page()

    csp_violations = []
    page.on("console", lambda msg: csp_violations.append(msg.text) if "Content Security Policy" in msg.text else None)

    print("Checking web/index.html...")
    # Navigate to index.html
    page.goto("http://localhost:8000/web/index.html")

    # Check for meta tag
    csp_meta = page.locator('meta[http-equiv="Content-Security-Policy"]')
    if csp_meta.count() > 0:
        content = csp_meta.get_attribute("content")
        print(f"Found CSP in index.html: {content}")
    else:
        print("CSP Meta tag NOT found in index.html")

    # Screenshot
    page.screenshot(path="/home/jules/verification/csp_verification_index.png")

    print("\nChecking web/metrics.html...")
    # Navigate to metrics.html
    page.goto("http://localhost:8000/web/metrics.html")

    # Check for meta tag
    csp_meta = page.locator('meta[http-equiv="Content-Security-Policy"]')
    if csp_meta.count() > 0:
        content = csp_meta.get_attribute("content")
        print(f"Found CSP in metrics.html: {content}")
    else:
        print("CSP Meta tag NOT found in metrics.html")

    page.screenshot(path="/home/jules/verification/csp_verification_metrics.png")

    if csp_violations:
        print("\nCSP Violations found:")
        for v in csp_violations:
            print(v)
    else:
        print("\nNo CSP violations logged.")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
