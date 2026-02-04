## 2025-02-19 - Stored XSS via Scraped Content
**Vulnerability:** Scrapers were using `innerHTML` to extract text content (like event names, pokemon names), which blindly captures HTML tags. If the source website (LeekDuck) is compromised or serves malicious content, this leads to Stored XSS in downstream applications consuming this data.
**Learning:** `innerHTML` is often used by mistake when "just text" is desired, or when developers try to manually strip tags using regex (which is brittle). `textContent` is the safer and more correct alternative for extracting text.
**Prevention:** Always use `textContent` when extracting text data from DOM, unless HTML formatting is explicitly required and you have a sanitizer in place. Avoid regex-based HTML sanitization.
