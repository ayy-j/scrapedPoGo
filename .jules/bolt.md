## 2026-01-31 - Shiny Data Shape Mismatch
**Learning:** `data/shinies.min.json` is an array in this repo, but `loadShinyData()` only reads `data.shinies`, so the cross-reference Map ends up empty and repeated read+parse work is effectively wasted.  
**Action:** When touching shiny logic again, make `loadShinyData()` accept both array and `{ shinies: [...] }` shapes (and keep caching).
