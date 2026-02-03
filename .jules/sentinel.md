## 2025-02-01 - DOM XSS in Frontend Rendering
**Vulnerability:** Scraped data (potentially containing malicious HTML/scripts) was being rendered into the DOM using `innerHTML` in `web/app.js` and `web/metrics.js`.
**Learning:** The application architecture relies on the frontend to render raw data scraped from external sources. Trusting this data to be safe for `innerHTML` is dangerous.
**Prevention:** strictly use `textContent` or `document.createElement` for dynamic content. Use `escapeHtml` helper if constructing HTML strings is unavoidable.

## 2026-02-03 - Missing Content Security Policy
**Vulnerability:** The application frontend lacked Content Security Policy (CSP) headers, making it vulnerable to XSS attacks if other mitigations (like escaping) failed.
**Learning:** Even static frontends need CSP to restrict where scripts, styles, and images can be loaded from. The frontend required 'unsafe-inline' for styles due to dynamic display toggling, which highlights a potential area for future refactoring (moving styles to classes).
**Prevention:** Always include strict CSP meta tags in HTML files. Regularly audit allowed sources (e.g., https://cdn.leekduck.com).
