# Pokemon Go Companion App: Design Language Outline

## Document Overview
This design language outline provides comprehensive guidance for building a companion app interface based on the Pokemon Go event data structure. The document addresses visual foundations, component architecture, and user experience patterns tailored to the specific data types present in the event system.

---

## 1. Data Classification Summary

### Static Reference Data
| Category | Description | Display Priority |
|----------|-------------|------------------|
| Pokemon Species | Name, image, dexNumber, canBeShiny | High |
| Bonus Types | Icon images, text descriptions, multipliers | Medium |
| Event Type Taxonomy | 14 distinct eventType values | Navigation |
| Image Metadata | Dimensions (256x256 standard), formats (PNG/JPG) | Performance |

### Dynamic Time-Sensitive Data
| Category | Freshness Requirement | User Impact |
|----------|----------------------|-------------|
| eventStatus | Real-time (upcoming/active/ended) | Critical |
| Event Timelines | Start/end ISO timestamps | Critical |
| Raid Rotations | Hour-by-hour changes | High |
| GO Battle League | Weekly rotations | Medium |
| Spawn Pools | Event-specific, changes per event | High |

### User Actionable Data
- Ticket purchasing (pricing tiers, currency)
- GO Pass point tasks (daily, weekly, bonus)
- Raid Hour scheduling
- Shiny hunting targets (canBeShiny boolean)
- Research task completion tracking

---

## 2. User Experience Mapping

### Primary User Flows

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EVENT DISCOVERY                              │
├─────────────────────────────────────────────────────────────────────┤
│  Landing → Filter by eventType → Sort by date → Select event        │
│  ↓                                                                   │
│  Quick view: eventStatus badge + countdown timer                    │
│  ↓                                                                   │
│  Detail view: Full event breakdown                                  │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         SHINY TRACKING                               │
├─────────────────────────────────────────────────────────────────────┤
│  Browse shinies array → Filter canBeShiny=true                      │
│  ↓                                                                   │
│  View: Pokemon image + event source + time window                   │
│  ↓                                                                   │
│  Action: Add to hunt list / Set reminder                            │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         RAID PLANNING                                │
├─────────────────────────────────────────────────────────────────────┤
│  Select raid-battles eventType → View raids array                   │
│  ↓                                                                   │
│  Detail: Boss image + canBeShiny indicator + CP ranges              │
│  ↓                                                                   │
│  Schedule: Raid Hour times (18:00-19:00 pattern)                    │
└─────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│                         GO PASS PROGRESS                             │
├─────────────────────────────────────────────────────────────────────┤
│  View go-pass eventType → Display pointTasks breakdown              │
│  ↓                                                                   │
│  Daily/Weekly/Bonus categories with point values                    │
│  ↓                                                                   │
│  Milestone progress bar + rewards preview                           │
└─────────────────────────────────────────────────────────────────────┘
```

### User Context Scenarios

| Scenario | Device State | Information Need | Interaction Pattern |
|----------|--------------|------------------|---------------------|
| Commute check | Mobile, one-handed | Quick event status | Glanceable cards |
| Raid preparation | Mobile, both hands | Boss details, counters | Expandable detail panels |
| Evening planning | Tablet/desktop | Full event calendar | Calendar grid view |
| During event | Mobile, active play | Timer countdowns | Overlay/compact mode |

---

## 3. Visual Language Foundation

### Color Palette

```
PRIMARY BRAND COLORS
├── Pokemon Go Yellow:    #FFCB05 (Primary accent, active states)
├── Deep Blue:            #0055A4 (Headers, primary text)
└── White:                #FFFFFF (Backgrounds, cards)

SEMANTIC COLORS (Event Status)
├── Active Green:         #00C853 (eventStatus: "active")
├── Upcoming Blue:        #2196F3 (eventStatus: "upcoming")
└── Ended Gray:           #9E9E9E (eventStatus: "ended")

EVENT TYPE ACCENT COLORS
├── raid-battles:         #E53935 (Red - intensity)
├── pokemon-go-tour:      #AA00FF (Purple - premium)
├── community-day:        #FF6D00 (Orange - celebration)
├── go-battle-league:     #00ACC1 (Cyan - competition)
├── max-battles:          #D500F9 (Magenta - dynamax)
├── season:               #43A047 (Green - duration)
├── go-pass:              #FFD600 (Gold - rewards)
├── pokemon-spotlight-hour:#7E57C2 (Light purple - hourly)
├── raid-hour:            #C62828 (Dark red - timed)
└── event (generic):      #546E7A (Blue-gray - neutral)

FUNCTIONAL COLORS
├── Shiny Indicator:      #FFD700 (Gold sparkle)
├── New/Debut Badge:      #FF1744 (Bright red)
├── Warning/Expiring:     #FF9800 (Amber)
└── Success/Confirmed:    #4CAF50 (Green)
```

### Typography Hierarchy

```
FONT STACK
Primary:   "Nunito", "Segoe UI", system-ui, sans-serif
Monospace: "JetBrains Mono", "Consolas", monospace (timers)

TYPE SCALE (Mobile-first, 16px base)
├── Display Large:   32px / 36px line-height  (Event hero titles)
├── Heading 1:       24px / 28px              (Section headers)
├── Heading 2:       20px / 24px              (Subsection headers)
├── Heading 3:       18px / 22px              (Card titles)
├── Body:            16px / 22px              (Descriptions, lists)
├── Body Small:      14px / 18px              (Metadata, timestamps)
├── Caption:         12px / 16px              (Labels, badges)
└── Timer:           28px / 32px monospace    (Countdown displays)

FONT WEIGHTS
├── Regular:  400  (Body text)
├── Semibold: 600  (Emphasis, labels)
└── Bold:     700  (Headings, numbers)
```

### Iconography Style

```
ICON PRINCIPLES
├── Style: Rounded, friendly, aligned with Pokemon Go aesthetic
├── Stroke: 2px consistent
├── Size: 24px (inline), 32px (standalone), 48px (feature)
└── Colors: Single color or gradient matching context

EVENT TYPE ICONS (suggested)
├── raid-battles:         Shield with starburst
├── pokemon-go-tour:      Map pin with Pokeball
├── community-day:        Calendar with star
├── go-battle-league:     Crossed swords
├── max-battles:          Dynamax symbol (three curved lines)
├── season:               Sun/moon seasonal icon
├── go-pass:              Ticket with checkmarks
├── pokemon-spotlight-hour: Clock with spotlight
├── raid-hour:            Clock with raid emblem
└── event:                Generic star burst

BONUS ICONS (from data)
- Leverage existing image URLs from bonuses[].image
- Standardize at 100x100px (per imageWidth/imageHeight in data)
- Cache locally for performance
```

---

## 4. Component Architecture

### Core Component Library

#### Event Card Component
```
┌─────────────────────────────────────────────────────┐
│  [EVENT IMAGE - 640x360 or 512x256 aspect ratio]    │
├─────────────────────────────────────────────────────┤
│  EVENT TYPE BADGE        [status badge: active]     │
│  Event Name                                          │
│  ─────────────────────────────────────────────────  │
│  📅 Feb 10 - Feb 15, 2026                          │
│  ⏱️ 5 days 14 hours remaining                       │
│  ─────────────────────────────────────────────────  │
│  [Type Icons: ⚔️ 🥚 ✨ 🎁] ← Quick feature summary │
│  ─────────────────────────────────────────────────  │
│  ▶ View Details                                     │
└─────────────────────────────────────────────────────┘

Data Mapping:
- image → Event banner (respect imageWidth/imageHeight)
- eventType → Badge color + icon
- eventStatus → Badge text and color
- name → Primary title
- start/end → Formatted date range
- Derived: Countdown calculation
- Derived: Feature icons from data presence
```

#### Pokemon Grid Component
```
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ [IMG]  │ │ [IMG]  │ │ [IMG]  │ │ [IMG]  │
│ Name   │ │ Name   │ │ Name   │ │ Name   │
│ ✨     │ │        │ │ ✨ NEW │ │        │
└────────┘ └────────┘ └────────┘ └────────┘

Data Mapping (from shinies[], spawns[], pokemon[], eggs[]):
- image → Pokemon sprite (256x256 PNG)
- name → Display name
- canBeShiny → Show ✨ indicator
- dexNumber → Sort order (when present)
- source → Category label (spawn, incense, raid, etc.)
```

#### Bonus List Component
```
┌─────────────────────────────────────────────────────┐
│ [bonus image 40x40]  2× XP for catching Pokémon    │
│                     Multiplier: 2x                  │
├─────────────────────────────────────────────────────┤
│ [bonus image 40x40]  Increased Stardust from       │
│                      opening Gifts                  │
└─────────────────────────────────────────────────────┘

Data Mapping:
- bonuses[].image → Icon (scale from 100x100 to 40x40)
- bonuses[].text → Primary description
- bonuses[].multiplier → Badge overlay (when present)
- bonuses[].bonusType → Category for filtering
```

#### Egg Pool Component
```
┌─────────────────────────────────────────────────────┐
│ EGG POOLS                                           │
├───────────┬───────────┬───────────┬────────────────┤
│ 1km [12]  │ 2km [8]   │ 5km [10]  │ 7km [7]        │
├───────────┴───────────┴───────────┴────────────────┤
│ [Pokemon Grid for selected distance]                │
└─────────────────────────────────────────────────────┘

Data Mapping:
- eggs object keys → Distance tabs
- eggs[distance].length → Count badge
- eggs[distance][] → Pokemon Grid data
```

#### Raid Boss Component
```
┌─────────────────────────────────────────────────────┐
│ RAID BATTLES                                        │
├─────────────────────────────────────────────────────┤
│ ┌─────────────┐                                     │
│ │  [BOSS IMG] │  Regigigas                          │
│ │   256x256   │  Shadow Raid                        │
│ │    ✨       │  CP: 2053 - 2140                    │
│ └─────────────┘                                     │
│                                                     │
│ Available: Feb 1 - Mar 4, 2026                     │
│ Raid Hours: Wednesdays 18:00-19:00                 │
└─────────────────────────────────────────────────────┘

Data Mapping:
- raids[].image → Boss image
- raids[].name → Boss name
- raids[].canBeShiny → Shiny indicator
- Derived: Raid tier from boss type
- Derived: CP ranges (external data needed)
```

#### GO Battle League Component
```
┌─────────────────────────────────────────────────────┐
│ GO BATTLE LEAGUE                                    │
├─────────────────────────────────────────────────────┤
│ Great League │ Ultra League │ Master League        │
│ ─────────────┼──────────────┼──────────────────    │
│ CP ≤ 1500    │ CP ≤ 2500    │ No Limit             │
│              │              │ Mega Allowed         │
├─────────────────────────────────────────────────────┤
│ CUP: Championship Series Cup                       │
│ ─────────────────────────────────────────────────  │
│ • CP Cap: 1500                                     │
│ • Types: Bug, Dark, Normal, Dragon                 │
│ • Banned: Legendary, Mythical, Mega, Ultra Beast  │
│ • Allowed: Seaking, Politoed, Milotic, Froslass   │
└─────────────────────────────────────────────────────┘

Data Mapping:
- battle.leagues[] → Tab content
- leagues[].name → Tab label
- leagues[].cpCap → CP restriction text
- leagues[].typeRestrictions → Type icons
- leagues[].rules → Restriction list
```

#### GO Pass Progress Component
```
┌─────────────────────────────────────────────────────┐
│ GO PASS: February                         [$7.99]  │
├─────────────────────────────────────────────────────┤
│ Progress: ████████░░░░░░░░ 52%    Rank 15/50       │
├─────────────────────────────────────────────────────┤
│ WEEKLY TASKS                                        │
│ ┌─────────────────────────────────────────────────┐│
│ │ ☑ Catch 75 Pokémon              +200 pts       ││
│ │ ☐ Win a raid                    +150 pts       ││
│ │ ☐ Make 20 Great Throws          +150 pts       ││
│ │ ☐ Hatch 3 Eggs                  +150 pts       ││
│ └─────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────┤
│ [Free Track] ══════ [Deluxe Track $7.99]          │
└─────────────────────────────────────────────────────┘

Data Mapping:
- name → Pass title
- pricing.deluxe / pricing.deluxePlus → Price badges
- pointTasks.daily/weekly/bonus → Task lists
- milestoneBonuses → Reward previews
```

#### Timer/Countdown Component
```
┌─────────────────────────────────────────────────────┐
│            ▼ ACTIVE NOW ▼                          │
│         ┌───┐   ┌───┐   ┌───┐   ┌───┐            │
│         │ 05│ : │ 14│ : │ 32│ : │ 07│            │
│         └───┘   └───┘   └───┘   └───┘            │
│          days    hrs     mins    secs              │
│                                                     │
│         Ends: Feb 15, 2026 at 8:00 PM             │
└─────────────────────────────────────────────────────┘

Data Mapping:
- end timestamp → Calculate remaining
- eventStatus → Display mode (countdown/countup/static)
- isGlobal → Timezone handling
```

### Custom Sections Handler

The `customSections` object requires flexible rendering:

```
CUSTOM SECTION RENDERER
├── paragraphs[] → Rich text blocks
├── lists[][] → Bullet point groups
├── pokemon[] → Pokemon Grid component
└── tables[] → Data table component

Section ID Examples from Data:
- "featured-pokemon"
- "field-research-task-rewards"
- "collection-challenges"
- "pokémon-debut"
- "furfrou-heart-trim"
- "eggs"
- "raids"
- Day-specific sections ("monday-february-23-kanto")
```

---

## 5. Information Hierarchy

### Primary Information (Maximum Visual Weight)

| Element | Treatment | Justification |
|---------|-----------|---------------|
| Event Name | 24px Bold, Primary color | Instant identification |
| eventStatus Badge | High contrast, prominent position | Time-critical decision making |
| Featured Pokemon Images | 256x256, arranged in grid | Visual engagement |
| Countdown Timer | Large monospace, animated | Urgency/awareness |

### Secondary Information (Supporting Weight)

| Element | Treatment | Justification |
|---------|-----------|---------------|
| Date Range | 14px, body color | Planning context |
| Bonus Summary | Icon + text, 16px | Quick value assessment |
| eventType Badge | Muted accent color | Categorization |
| Shiny Indicators | Gold accent, subtle | Hunter targeting |

### Tertiary Information (Reference Weight)

| Element | Treatment | Justification |
|---------|-----------|---------------|
| Pricing Details | 12px caption, collapsible | Optional purchase info |
| Disclaimer Text | 12px, gray, small | Legal requirements |
| Detailed Rules | Collapsible accordions | Deep-dive content |
| Historical Events | Dimmed, archived section | Past reference |

### Hierarchy Shifts by Context

```
EVENT LIST VIEW
├── Primary: Image + Name + Status
├── Secondary: Date range
└── Tertiary: Type badge

EVENT DETAIL VIEW
├── Primary: Timer + Bonuses + Featured Pokemon
├── Secondary: Full schedule + Research tasks
└── Tertiary: Pricing + Disclaimers

ACTIVE EVENT MODE (during gameplay)
├── Primary: Countdown + Active bonuses
├── Secondary: Spawn pool quick reference
└── Tertiary: Collapsed detail sections
```

---

## 6. Responsive Considerations

### Breakpoint Strategy

```
MOBILE PORTRAIT (320px - 479px)
├── Single column layout
├── Pokemon grid: 3 columns (80px cells)
├── Event cards: Full width
├── Horizontal scroll for egg distances
└── Bottom navigation bar

MOBILE LANDSCAPE (480px - 767px)
├── Two column event grid
├── Pokemon grid: 4 columns
├── Side-by-side timer display
└── Persistent filter drawer

TABLET (768px - 1023px)
├── Two/three column event grid
├── Pokemon grid: 5 columns (96px cells)
├── Split view: List + Detail pane
├── Persistent sidebar filters
└── Floating timer overlay

DESKTOP (1024px+)
├── Multi-column event grid (responsive)
├── Pokemon grid: 6+ columns
├── Full calendar view option
├── Side panel detail view
└── Notification settings accessible
```

### Touch Target Requirements

```
MINIMUM TOUCH TARGETS
├── Primary buttons: 48x48px
├── Pokemon grid cells: 72x72px minimum
├── Tab selectors: 44px height
├── List items: 56px height
└── Icon buttons: 44x44px

TOUCH GESTURES
├── Swipe left/right: Navigate between event days
├── Pull down: Refresh event data
├── Long press: Quick add to calendar/reminder
├── Double tap: Toggle bookmark
└── Pinch: Zoom pokemon grid (accessibility)
```

### Glanceable Information Density

```
LOCK SCREEN WIDGET (if supported)
┌─────────────────────────────────┐
│ 🎯 Valentine's Day 2026         │
│ ⏱️ 3d 14h remaining             │
│ ✨ Nidoran♀ ♂ Shiny boosted    │
│ 💝 2× Catch XP | 2× Gift Dust   │
└─────────────────────────────────┘

NOTIFICATION EXPANDED
┌─────────────────────────────────────────┐
│ 🔔 Raid Hour Starting!                  │
│ Dialga & Palkia · 6:00 PM - 7:00 PM    │
│ [View Raid Counters] [Set Reminder]    │
└─────────────────────────────────────────┘
```

---

## 7. Gaming Context Integration

### Active Play Mode Design

```
COMPACT OVERLAY (during gameplay)
┌────────────────────────────────────┐
│ ⏱️ 2h 34m                          │ ← Tap to expand
│ ✨ Lotad, Spritzee, Pikipek        │
│ 2× Incense | 2× Daily Incense     │
└────────────────────────────────────┘

Features:
- Semi-transparent background (90% opacity)
- Minimal chrome, maximum content
- Swipe to dismiss
- Quick-access to spawn pool
- Timer auto-updates
```

### Dark Mode Variants

```
DARK MODE PALETTE
├── Background Primary:   #121212
├── Surface Elevated:     #1E1E1E
├── Surface Overlay:      #2C2C2C
├── Text Primary:         #FFFFFF
├── Text Secondary:       #B0B0B0
├── Pokemon Go Yellow:    #FFD54F (elevated brightness)
├── Active Green:         #00E676
├── Upcoming Blue:        #42A5F5
└── Divider:              #424242

IMAGES IN DARK MODE
├── Pokemon sprites: Add 1px white stroke for visibility
├── Event banners: No modification
├── Bonus icons: Maintain original colors
└── Backgrounds: Add subtle gradient overlays
```

### Low-Light Play Considerations

```
NIGHT PLAY MODE (automatic after sunset)
├── Reduced blue light emission
├── Amber-tinted accent colors
├── Increased contrast ratios (4.5:1 minimum)
├── Larger touch targets
├── Simplified animations (reduce motion)
└── Persistent brightness control

EVENING EVENT SPECIAL STYLING
Events with evening timeframes (Raid Hour 18:00-19:00, 
Max Mondays 18:00-19:00) receive twilight gradient headers
```

### Gameplay Connection Features

```
QUICK REFERENCE PATTERNS
├── Type effectiveness charts (linked from raid bosses)
├── CP calculator integration (from research rewards)
├── IV appraisal reference
├── Evolution cost lookup
└── Move database links

BRIDGING FEATURES
├── Deep links to Pokemon Go app (where supported)
├── Screenshot import for IV scanning
├── Coordinate sharing for raids (community feature)
├── Buddy heart tracking
└── Daily task checklist
```

---

## 8. Deliverable Compilation

### Visual Style Guidelines Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                    BRAND IDENTITY LOCKUP                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Primary: #FFCB05 (Pokemon Go Yellow)                         │
│   Secondary: #0055A4 (Deep Blue)                               │
│   Background: #FFFFFF (Light) / #121212 (Dark)                 │
│                                                                 │
│   Typography: Nunito (rounded, friendly)                       │
│   Icons: 2px stroke, rounded corners                           │
│   Radius: 12px cards, 8px buttons, 4px badges                  │
│   Shadows: Subtle elevation (0-2-4-8 levels)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Component Specification Matrix

| Component | Min Width | Max Width | Aspect Ratio | Data Source |
|-----------|-----------|-----------|--------------|-------------|
| Event Card | 280px | 400px | 16:9 image | events[] |
| Pokemon Grid Cell | 72px | 96px | 1:1 | pokemon[], shinies[], spawns[] |
| Bonus Row | Full width | 600px | Auto | bonuses[] |
| Timer Display | 200px | 400px | Auto | start, end |
| Raid Boss Card | 280px | 400px | Variable | raids[] |
| Egg Pool Tab | 80px | 120px | Auto | eggs{} |
| GO Pass Progress | Full width | 600px | Auto | pointTasks, milestoneBonuses |
| Custom Section | Full width | None | Variable | customSections{} |

### Usage Examples by Data Type

#### Season Event Rendering
```
eventType: "season"
├── Hero banner (640x360)
├── Duration indicator (long-form: "Dec 2 - Mar 3")
├── Egg pools (expandable tabs)
├── Research breakthrough preview
├── Community Day schedule list
└── GO Battle League summary
```

#### Raid Battle Event Rendering
```
eventType: "raid-battles"
├── Compact header (512x256 or default)
├── Raid boss carousel
├── Shiny availability callout
├── Raid Hour schedule highlight
└── Counter suggestions (external link)
```

#### Pokemon GO Tour Event Rendering
```
eventType: "pokemon-go-tour"
├── Premium hero treatment
├── Event info block (location, dates, time, price)
├── Ticket add-ons section
├── Shiny debuts showcase
├── Exclusive bonuses highlight
├── WhatsNew section (expandable)
└── Sales/merchandise section
```

### Rationale Documentation

**Design Decision: Event Type Color Coding**
- *Rationale*: With 14 distinct event types, color coding enables rapid visual scanning. Colors were chosen to align with event themes (red for battles, purple for premium tours, gold for passes).

**Design Decision: Pokemon Grid Standardization**
- *Rationale*: The data provides consistent 256x256 PNG sprites. Standardizing on this size ensures crisp display across devices while maintaining the Pokemon Go visual language.

**Design Decision: Timer Prominence**
- *Rationale*: Event time windows are critical user decisions. Countdown timers create urgency and help players prioritize limited-time content.

**Design Decision: CustomSections Flexibility**
- *Rationale*: The customSections structure varies significantly between events. A flexible renderer that handles paragraphs, lists, pokemon, and tables accommodates this variability without hardcoding specific section layouts.

---

## 9. Assumption Documentation

### Data Structure Assumptions

| Assumption | Basis | Risk Level |
|------------|-------|------------|
| ISO 8601 timestamps for all start/end | Observed in all events | Low |
| 256x256 standard for Pokemon sprites | Consistent in data | Low |
| 100x100 standard for bonus icons | Specified in imageWidth/Height | Low |
| eventStatus computed server-side | Present in all records | Medium |
| customSections structure varies per event | Multiple examples observed | Medium |
| Empty arrays indicate no data, not error | eggs.12km = [] observed | Low |
| isGlobal flag affects timezone display | Boolean present | Medium |

### Missing Data Elements

| Missing Element | Impact | Recommendation |
|-----------------|--------|----------------|
| CP ranges for raid bosses | High - battle planning | Integrate from external Pokedex API |
| Type information for Pokemon | Medium - filtering | Enrich from species database |
| Evolution chains | Medium - planning | Add as enhancement |
| Move pools | Low - advanced users | Future consideration |
| Weather boost indicators | Medium - spawn prediction | Integrate weather API |
| Nest migration schedules | Low - advanced | Community-sourced data |
| Buddy distance requirements | Low - candy planning | Pokedex integration |

### Functional Clarifications Needed

1. **Push Notification Strategy**: Should the companion app push reminders for Raid Hours and event starts?

2. **Offline Capability**: What level of cached data should be available when offline?

3. **Account Integration**: Will users link their Pokemon Go accounts for personalized tracking?

4. **Community Features**: Are social features (friend codes, raid coordination) in scope?

5. **Localization**: How should multi-language support be handled for event descriptions?

6. **Historical Data**: Should ended events remain searchable or be archived differently?

7. **Refresh Cadence**: What is the expected data freshness requirement (real-time, hourly, daily)?

### Performance Considerations

```
DATA VOLUME ANALYSIS
├── Current dataset: ~45 events
├── Average event size: ~15KB (compressed)
├── Image assets: External URLs (lazy load)
├── Estimated initial load: <500KB
└── Recommended caching: LocalStorage for event summaries

OPTIMIZATION RECOMMENDATIONS
├── Implement image lazy loading with Intersection Observer
├── Cache Pokemon sprites in IndexedDB
├── Use virtualized lists for event browsing
├── Prefetch upcoming event details
└── Implement skeleton screens for perceived performance
```

---

## Appendix: Event Type Reference

| eventType | Heading | Typical Duration | Key Data Fields |
|-----------|---------|------------------|-----------------|
| season | Season | 3 months | eggs, research, communityDays, goBattleLeague |
| event | Event | 3-7 days | pokemon, bonuses, shinies, customSections |
| raid-battles | Raid Battles | 1-2 weeks | raids, shinies |
| go-pass | Go Pass | 1 month | pricing, pointTasks, milestoneBonuses |
| go-battle-league | Go Battle League | 1 week | battle.leagues[] |
| pokemon-spotlight-hour | Pokemon Spotlight Hour | 1 hour | pokemon[0], canBeShiny, bonus |
| raid-hour | Raid Hour | 1 hour | canBeShiny |
| max-mondays | Max Mondays | 1 hour | bonus (date) |
| pokemon-go-tour | Pokemon Go Tour | 2-3 days | eggs, exclusiveBonuses, rewards, eventInfo, shinyDebuts, whatsNew, sales |
| community-day | Community Day | 3 hours | (minimal in current data) |
| research-day | Research Day | 3 hours | tasks, rewards, encounters |
| max-battles | Max Battles | 3 hours | pokemon, bonuses |
| pokestop-showcase | Pokestop Showcase | 2 days | pokemon, description |
| raid-day | Raid Day | 3 hours | pokemon, bonuses, rewards, shinies |

---

*Document Version: 1.0*
*Generated: Based on events.min.json analysis*
*Design System Status: Ready for implementation*