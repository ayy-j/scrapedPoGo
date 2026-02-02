## 2025-02-01 - DOM XSS in Frontend Rendering
**Vulnerability:** Scraped data (potentially containing malicious HTML/scripts) was being rendered into the DOM using `innerHTML` in `web/app.js` and `web/metrics.js`.
**Learning:** The application architecture relies on the frontend to render raw data scraped from external sources. Trusting this data to be safe for `innerHTML` is dangerous.
**Prevention:** strictly use `textContent` or `document.createElement` for dynamic content. Use `escapeHtml` helper if constructing HTML strings is unavoidable.

## 2025-02-01 - Content Security Policy for Static Frontend
**Vulnerability:** Lack of CSP allowed potential execution of malicious scripts if injected into the DOM or fetched data.
**Learning:** Static sites consuming local/configurable APIs need careful CSP `connect-src` configuration to allow `localhost` and `127.0.0.1` while restricting other origins.
**Prevention:** Added strict CSP meta tags to all HTML entry points (`index.html`, `metrics.html`) allowing only 'self', https, and local connections.
