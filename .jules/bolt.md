## 2026-01-31 - Shiny Data Shape Mismatch
**Learning:** `data/shinies.min.json` is an array in this repo (not `{ shinies: [...] }`), but `loadShinyData()` only reads `data.shinies` so the cross-reference Map is empty (`size === 0`). This means any “shiny cross-reference” work is currently a no-op, and optimizations like memoizing `loadShinyData()` only save the read+parse cost (cache hit was ~0.001ms vs ~2.6ms cold in a local check) but don’t improve correctness.  
**Action:** Next time shiny correctness/perf matters, make `loadShinyData()` accept both shapes (array and `{ shinies: [...] }`) while keeping the memoization so multi-scraper runs don’t re-read/re-parse the same file.

## 2026-02-01 - DOM Rehydration Check
**Learning:** `element.hasChildNodes()` returns true for text nodes (whitespace), making it a fragile check for "is this container empty/populated?". Using `element.children.length === 0` is safer when checking for element nodes.
**Action:** When optimizing re-renders by checking if DOM exists, check children count, not `hasChildNodes()`.

## 2026-02-02 - Image Dimension Fetch Coalescing
**Learning:** Multiple scrapers (or parallelized logic within one scraper) can request dimensions for the same image URL concurrently. Simple caching (`Map<url, result>`) only prevents re-fetching *after* the first request completes. During the initial "cold" concurrent burst, multiple network requests are still sent (Thundering Herd).
**Action:** When caching async operations that might be called concurrently, cache the **Promise** (`pendingRequests`) as well as the result. If a request is in-flight, return the existing Promise to coalesce all callers into a single network request.
