# Sentinel's Journal

## 2025-02-18 - Path Traversal in File Write
**Vulnerability:** The `writeTempFile` function in `src/utils/scraperUtils.js` used the `id` parameter directly in the filename construction without sanitization. This allowed path traversal (e.g., `id = '../../file'`) which could write files outside the intended directory.
**Learning:** Even when inputs come from a specific upstream source (LeekDuck URLs), they should be treated as untrusted for file system operations. Utility functions that perform file I/O must sanitize their inputs.
**Prevention:** I implemented a `sanitizeFilename` function that restricts filenames to alphanumeric characters, underscores, and hyphens. I applied this sanitization to both the `id` and `suffix` parameters in `writeTempFile`.
