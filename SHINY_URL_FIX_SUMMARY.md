# Shiny Pokemon URL Fix Summary

## Issue
The blob upload script failed to upload 5 Pokemon shiny images due to incorrect URLs:
1. `pm79.f_2020.s.icon.png` (Slowpoke 2020) - HTTP 404
2. `pm80.f_2021.s.icon.png` (Slowbro 2021) - HTTP 404
3. `pm225.cWINTER_2018.s.icon.png` (Delibird costume) - HTTP 404
4. `pm302.fFALL_2020.s.icon.png` (Sableye Fall 2020) - HTTP 404
5. `pm569.fGIGANTAMAX.s.icon.png` (Garbodor Gigantamax) - HTTP 404

## Root Cause
The scraper in `src/pages/shinies.js` had incomplete mapping logic for converting LeekDuck's `fn` field values to PokeMiners asset filenames:

1. **Underscore issue**: LeekDuck provides `fn: "pm0079_00_pgo_2020"` which was being converted to `f_2020` instead of `f2020`
2. **Wrong costume mapping**: `winter2020` was mapped to `cWINTER_2018` instead of `fWINTER_2020`
3. **Missing entries**: Year-only costumes (`2020`, `2021`, `2022`) weren't in the mapping
4. **Non-existent shinies**: Some special forms (Fall 2020, Gigantamax) don't have shiny variants in PokeMiners

## Corrections Made

### 1. Updated `fnMapping` in src/pages/shinies.js
Added proper mappings for year-based costumes:
```javascript
'winter2020': 'fWINTER_2020',  // Fixed from cWINTER_2018
'2020': 'f2020',                // Added (no underscore)
'2021': 'f2021',                // Added (no underscore)
'2022': 'f2022',                // Added (no underscore)
'fall2020': null                // Explicitly marked as non-existent
```

### 2. Added Validation for aa_fn Forms
Created a list of known non-existent shiny variants:
```javascript
const nonExistentShinyForms = [
  'fGIGANTAMAX',  // Gigantamax forms generally don't have shinies yet
  'fFALL_2020'     // Fall 2020 costume shiny doesn't exist
];
```

When these forms are detected, the scraper now falls back to the base shiny image instead of creating a broken URL.

### 3. Enhanced Null Mapping Logic
Added explicit handling for `null` mapping values:
```javascript
if (mappedName === null) {
  // Explicitly null mapping means shiny variant doesn't exist, use base
  console.log(`Note: ${costumeSuffix} shiny variant doesn't exist`);
  // Leave filename as default base shiny
}
```

## Final URL Corrections

| Failed URL | Corrected URL | Fix Type |
|------------|--------------|----------|
| `pm79.f_2020.s.icon.png` | `pm79.f2020.s.icon.png` | Remove underscore |
| `pm80.f_2021.s.icon.png` | `pm80.f2021.s.icon.png` | Remove underscore |
| `pm225.cWINTER_2018.s.icon.png` | `pm225.fWINTER_2020.s.icon.png` | Change costume → form, update year |
| `pm302.fFALL_2020.s.icon.png` | `pokemon_icon_302_00_shiny.png` | Fallback to base (variant doesn't exist) |
| `pm569.fGIGANTAMAX.s.icon.png` | `pokemon_icon_569_00_shiny.png` | Fallback to base (variant doesn't exist) |

## Verification
All corrected URLs tested and confirmed accessible (HTTP 200):
- ✅ pm79.f2020.s.icon.png
- ✅ pm80.f2021.s.icon.png
- ✅ pm225.fWINTER_2020.s.icon.png
- ✅ pokemon_icon_302_00_shiny.png
- ✅ pokemon_icon_569_00_shiny.png

## Prevention
These fixes prevent future occurrences by:
1. Correctly handling year-based costume patterns from LeekDuck
2. Validating form codes against a known list of non-existent shiny variants
3. Automatically falling back to base shiny images when special forms don't exist
4. Logging warnings when fallbacks occur for easier debugging

## Files Modified
- `src/pages/shinies.js` - Enhanced URL generation logic with proper mappings and validation
- `data/shinies.min.json` - Data already reflects correct URLs (no manual changes needed)

## Next Steps
Future PokeMiners asset additions should be monitored, and the `nonExistentShinyForms` list should be updated if:
- Gigantamax shiny forms are added to the repository
- New special forms are released that don't have shiny variants
