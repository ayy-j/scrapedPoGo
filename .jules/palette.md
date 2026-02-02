## 2024-05-22 - Keyboard Accessible Cards
**Learning:** In this vanilla JS project, interactive `article` cards were completely inaccessible to keyboard users. Adding `tabindex="0"`, `role="button"`, and `keydown` handlers is a low-effort, high-impact pattern for this repo.
**Action:** Default to including keyboard support when creating any interactive elements in `app.js`, not just mouse handlers.

## 2024-05-23 - Toggle Buttons Need State
**Learning:** Filter chips and view toggles were implemented as plain buttons with active classes, leaving screen reader users unaware of their state (on/off).
**Action:** Always include `aria-pressed="true/false"` on buttons that function as toggles, not just visual `active` classes.

## 2024-05-24 - Invisible Shortcuts Need Hints
**Learning:** Adding a keyboard shortcut (like `/` for search) is a great power-user feature, but it's undiscoverable without a visual hint. Adding text like `(Press "/")` to the placeholder bridges the gap between casual and power users.
**Action:** When adding keyboard shortcuts, always look for a place to hint at them in the UI (placeholder, tooltip, or label).
