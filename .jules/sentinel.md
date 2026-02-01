## 2025-02-01 - DOM XSS in Frontend Rendering
**Vulnerability:** Scraped data (potentially containing malicious HTML/scripts) was being rendered into the DOM using `innerHTML` in `web/app.js` and `web/metrics.js`.
**Learning:** The application architecture relies on the frontend to render raw data scraped from external sources. Trusting this data to be safe for `innerHTML` is dangerous.
**Prevention:** strictly use `textContent` or `document.createElement` for dynamic content. Use `escapeHtml` helper if constructing HTML strings is unavoidable.
