## 2025-02-19 - Stored XSS via Scraped Content
**Vulnerability:** Scrapers were using `innerHTML` to extract text content (like event names, pokemon names), which blindly captures HTML tags. If the source website is compromised or serves malicious content, this leads to Stored XSS in downstream applications consuming this data.
**Learning:** `innerHTML` is often used by mistake when "just text" is desired, or when developers try to manually strip tags using regex (which is brittle). `textContent` is the safer and more correct alternative for extracting text.
**Prevention:** Always use `textContent` when extracting text data from DOM, unless HTML formatting is explicitly required and you have a sanitizer in place. Avoid regex-based HTML sanitization.

## 2025-02-19 - Safe Text Extraction with Structure Preservation
**Vulnerability:** Using `innerHTML.split('<br>')` to parse multi-line text (like disclaimers) exposes the application to XSS because `innerHTML` parses all tags, including `<script>`.
**Learning:** When you need to preserve specific structural elements (like line breaks) while extracting text, `textContent` on the parent is insufficient because it flattens the structure.
**Prevention:** Iterate over `childNodes` and manually collect text from `nodeType === 3` (Text) nodes, handling specific Element nodes (like `BR`) as delimiters. This ignores all other elements (scripts, images) by default.
