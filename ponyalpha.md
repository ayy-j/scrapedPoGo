# Pokemon Go Companion App Design Language Outline
---

## 1. Data Reception & Acknowledgment

The JSON documents contains a comprehensive event database for Pokemon Go, comprising **50+ event objects** spanning from December 2025 through May 2026. The data structure supports multiple event categories with rich nested content including Pokemon encounters, bonuses, raids, research tasks, and dynamic custom sections.

**Primary Data Categories Identified:**
- Event metadata (identity, timing, status)
- Pokemon data (spawns, shinies, raids, eggs)
- Bonus configurations with visual assets
- Battle league configurations
- Research and reward structures
- Custom content sections
- Location-specific event information

---

## 2. Data Classification

### Static Reference Data
| Category | Examples | Display Considerations |
|----------|----------|----------------------|
| Event Types | season, event, raid-battles, go-battle-league, community-day, pokemon-spotlight-hour, raid-hour, max-mondays, pokemon-go-tour | Icon differentiation, color coding |
| Pokemon Species | Name, dex number, images (256x256 PNG standard) | Consistent card sizing, lazy loading |
| Bonus Icons | Pre-defined 100x100 PNG assets | Icon library, cached assets |
| Image Metadata | Width, height, format fields | Responsive sizing calculations |

### Dynamic/Time-Sensitive Data
| Field | Format | Update Frequency | UX Impact |
|-------|--------|------------------|-----------|
| `start` / `end` | ISO 8601 | Per-event | Countdown timers, calendar integration |
| `eventStatus` | upcoming/active/ended | Computed real-time | Visual prominence, filtering |
| `isGlobal` | Boolean | Per-event | Timezone display logic |
| `customSections` | Variable structure | Per-event | Flexible content rendering |

### Event Type Taxonomy (from data)
```
- season
- event (catch-all)
- raid-battles
- go-battle-league
- community-day
- pokemon-spotlight-hour
- raid-hour
- raid-day
- max-mondays
- max-battles
- pokemon-go-tour
- go-pass
- pokestop-showcase
- research-day
```

---

## 3. User Experience Mapping

### Core User Flows

#### Flow 1: Event Discovery
```
Home Screen → Event Type Filter → Event List → Event Detail
```
**Player Need:** "What's happening now/soon?"
**Key Actions:** Filter by type, sort by date, search by Pokemon name

#### Flow 2: Active Event Reference
```
Active Events Tab → Select Event → Quick Info Sections
```
**Player Need:** "What bonuses are active right now?"
**Key Actions:** Quick scan bonuses, view shiny availability, check raid bosses

#### Flow 3: Pokemon Planning
```
Search Pokemon → View Upcoming Appearances → Plan Event Participation
```
**Player Need:** "When can I catch Shiny Lotad?"
**Key Actions:** Search by species, filter by shiny availability, add to calendar

#### Flow 4: Battle League Preparation
```
GO Battle League Section → Current League Rules → Team Builder Reference
```
**Player Need:** "What are the CP caps and restrictions?"
**Key Actions:** View rules, check type restrictions, see banned Pokemon

#### Flow 5: Season Overview
```
Current Season → View All Season Events → Egg Pool Reference
```
**Player Need:** "What's in eggs this season?"
**Key Actions:** Browse egg pools by distance, check shiny availability

---

## 4. Visual Language Foundation

### Color Palette

#### Primary Brand Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Pokemon Go Blue | `#3B4CCA` | Primary actions, headers, active states |
| Pokemon Go Yellow | `#FFCB05` | Accents, highlights, bonus indicators |
| Pokemon Go Red | `#CC0000` | Alerts, raid indicators, shadow raids |

#### Event Status Colors
| Status | Primary | Background | Border |
|--------|---------|------------|--------|
| Active | `#4CAF50` Green | `#E8F5E9` | `#2E7D32` |
| Upcoming | `#2196F3` Blue | `#E3F2FD` | `#1565C0` |
| Ended | `#9E9E9E` Gray | `#F5F5F5` | `#757575` |

#### Event Type Accent Colors
| Event Type | Accent Color | Application |
|------------|--------------|-------------|
| season | `#9C27B0` Purple | Season banner, seasonal Pokemon cards |
| raid-battles | `#FF5722` Deep Orange | Raid boss cards, raid hour indicators |
| community-day | `#FF9800` Orange | Community Day branding |
| go-battle-league | `#673AB7` Deep Purple | Battle league cards, cup indicators |
| pokemon-go-tour | `#E91E63` Pink | Tour event special treatment |
| max-battles | `#00BCD4` Cyan | Dynamax/Gigantamax theming |

### Typography

#### Font Stack
```css
--font-primary: 'Nunito', 'SF Pro Display', -apple-system, sans-serif;
--font-display: 'Nunito', 'Poppins', sans-serif;
--font-mono: 'SF Mono', 'Fira Code', monospace;
```

#### Type Scale
| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| Event Title | 24px | 700 (Bold) | 1.2 | Event detail headers |
| Section Header | 18px | 600 (Semi-bold) | 1.3 | Custom section titles |
| Card Title | 16px | 600 | 1.3 | Pokemon names, event names in lists |
| Body | 14px | 400 (Regular) | 1.5 | Descriptions, bonus text |
| Caption | 12px | 500 | 1.4 | Timestamps, disclaimers |
| Micro | 10px | 500 | 1.2 | Status badges, type tags |

### Iconography Style

#### Design Principles
- **Line weight:** 2px consistent stroke
- **Corner radius:** 2px (slightly rounded)
- **Size standards:** 16px, 24px, 32px, 48px
- **Color:** Single color with opacity variations

#### Event Type Icons (recommended)
| Event Type | Icon Concept |
|------------|--------------|
| season | Sun/moon cycle or calendar with season indicator |
| event | Star burst |
| raid-battles | Shield with exclamation |
| community-day | Group of three Pokeballs |
| go-battle-league | Crossed swords |
| pokemon-spotlight-hour | Spotlight/circle highlight |
| raid-hour | Clock with raid icon |
| max-battles | Dynamax band swirl |

---

## 5. Component Architecture

### 5.1 Event List Item Component

```
┌─────────────────────────────────────────────────┐
│ ┌──────┐  Event Name                    ┌─────┐ │
│ │      │  Event Type Badge              │ >   │ │
│ │ IMG  │  ─────────────────────────────  └─────┘ │
│ │      │  📅 Feb 3 - Feb 8, 2026                  │
│ └──────┘  🟢 Active • Ends in 2d 4h               │
└─────────────────────────────────────────────────┘
```

**Data Binding:**
- `image` → Event thumbnail (aspect ratio preserved from imageWidth/imageHeight)
- `name` → Primary text
- `eventType` → Badge styling + icon
- `start`/`end` → Formatted date range
- `eventStatus` → Status indicator + countdown

### 5.2 Pokemon Card Component

```
┌─────────────────────┐
│    ┌───────────┐    │
│    │  SPRITE   │    │
│    │  256x256  │    │
│    └───────────┘    │
│                     │
│  Lotad              │
│  ─────────────────  │
│  ✨ Shiny Available │
│  #270               │
└─────────────────────┘
```

**Data Binding:**
- `image` → Pokemon sprite
- `name` → Card title
- `canBeShiny` → Shiny indicator visibility
- `dexNumber` → Pokedex number display

**Variants:**
- **Compact:** 80x80 sprite, name only
- **Standard:** Full card with all info
- **Detailed:** With CP ranges, source tags

### 5.3 Bonus Display Component

```
┌────────────────────────────────────────────────┐
│ ┌────┐                                         │
│ │ICON│  2× XP for catching Pokémon             │
│ └────┘                                         │
└────────────────────────────────────────────────┘
```

**Data Binding:**
- `bonuses[].image` → Bonus icon (100x100 source, display at 32x32)
- `bonuses[].text` → Bonus description
- `bonuses[].multiplier` → Visual emphasis (2× badge)

### 5.4 Time Range Display Component

**Global Events (isGlobal: true):**
```
📅 Feb 3, 1:00 PM - 9:00 PM UTC
```

**Local Events (isGlobal: false):**
```
📅 Feb 3, 10:00 AM - 8:00 PM Local Time
```

### 5.5 Egg Pool Grid Component

```
┌─────────── Egg Pool ───────────┐
│ 1km │ 2km │ 5km │ 7km │ 10km  │
├─────┼─────┼─────┼─────┼───────┤
│ 🥚  │ 🥚  │ 🥚  │ 🥚  │  🥚   │
│ 26  │ 11  │ 10  │ 7   │  10   │
└─────┴─────┴─────┴─────┴───────┘
        [View All Pokemon]
```

**Data Binding:**
- `eggs.1km[]`, `eggs.2km[]`, etc. → Count per tier
- Expandable grid showing all Pokemon per tier

### 5.6 Battle League Card Component

```
┌─────────────────────────────────────────┐
│         ⚔️ Championship Series Cup       │
├─────────────────────────────────────────┤
│  CP Cap: 1,500                          │
│  Allowed: Bug, Dark, Normal, Dragon     │
│  Banned: Fighting, Flying, Steel        │
│  ─────────────────────────────────────  │
│  Special: Seaking, Politoed, Milotic... │
└─────────────────────────────────────────┘
```

**Data Binding:**
- `battle.leagues[].name` → Cup name
- `battle.leagues[].cpCap` → CP limit display
- `battle.leagues[].typeRestrictions` → Type tags
- `battle.leagues[].rules` → Rule list

### 5.7 Custom Section Renderer

**Flexible component for `customSections` content:**

```
┌─────────────────────────────────────────┐
│ 📝 Field Research Task Rewards          │
├─────────────────────────────────────────┤
│                                         │
│ [Paragraph content from paragraphs[]]   │
│                                         │
│ • List item from lists[][]              │
│ • Another list item                     │
│                                         │
│ [Pokemon grid from pokemon[]]           │
│                                         │
│ [Table from tables[] if present]        │
└─────────────────────────────────────────┘
```

---

## 6. Information Hierarchy

### Event Detail Page Hierarchy

```
┌─────────────────────────────────────────────┐
│ LEVEL 1: Event Identity                     │
│ ┌─────────────────────────────────────────┐ │
│ │ [Hero Banner Image - Full Width]        │ │
│ │ Event Name - Large Title                │ │
│ │ Status Badge | Event Type               │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ LEVEL 2: Time & Availability                │
│ ┌─────────────────────────────────────────┐ │
│ │ Countdown Timer (if active/upcoming)    │ │
│ │ Date Range | Time Zone Indicator        │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ LEVEL 3: Active Bonuses                     │
│ ┌─────────────────────────────────────────┐ │
│ │ [Bonus Cards - Horizontally Scrollable] │ │
│ │ 2× XP | Increased Stardust | etc.       │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ LEVEL 4: Featured Pokemon                   │
│ ┌─────────────────────────────────────────┐ │
│ │ [Pokemon Grid - 4 columns]              │ │
│ │ Shiny indicators prominent              │ │
│ │ Filter: All | Shinies | Raids | Eggs    │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ LEVEL 5: Detailed Sections                  │
│ ┌─────────────────────────────────────────┐ │
│ │ Expandable customSections               │ │
│ │ Collapsible by default for scanning     │ │
│ └─────────────────────────────────────────┘ │
├─────────────────────────────────────────────┤
│ LEVEL 6: Supporting Information             │
│ ┌─────────────────────────────────────────┐ │
│ │ bonusDisclaimers (small text)           │ │
│ │ Event pricing (if applicable)           │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Visual Weight Distribution

| Element | Visual Weight | Techniques |
|---------|---------------|------------|
| Event Banner | Highest | Full width, saturated colors |
| Status Badge | High | Bright color, positioned top-right |
| Active Bonuses | Medium-High | Icon + text, slightly elevated |
| Pokemon Grid | Medium | Consistent cards, shiny sparkles |
| Custom Sections | Medium-Low | Expandable, muted borders |
| Disclaimers | Low | Small text, gray, bottom placement |

---

## 7. Responsive Considerations

### Mobile-First Breakpoints

| Breakpoint | Width | Layout Adjustments |
|------------|-------|-------------------|
| Compact | < 360px | Single column, smaller Pokemon sprites (64x64) |
| Mobile | 360-767px | Single column, standard sprites (96x96 displayed) |
| Tablet | 768-1023px | Two column event list, 5-col Pokemon grid |
| Desktop | 1024px+ | Three column event list, 6-col Pokemon grid |

### Touch Target Specifications

| Element | Min Size | Spacing |
|---------|----------|---------|
| Event List Item | 72px height | 8px vertical |
| Pokemon Card | 80x80px | 8px grid gap |
| Bonus Chip | 44px height | 8px horizontal |
| Filter Tab | 44px height | 4px horizontal |
| Expand Button | 44x44px | N/A |

### Glanceable Information Density

**Lock Screen Widget (Compact):**
```
┌────────────────────────┐
│ 🔴 3 Active Events     │
│ Carnival of Flamigo    │
│ ⏱️ Ends in 2d 4h       │
└────────────────────────┘
```

**Home Screen Widget (Medium):**
```
┌────────────────────────────────┐
│ 📅 Today's Events              │
├────────────────────────────────┤
│ 🎭 Carnival of Flamigo         │
│    2× Incense Duration         │
├────────────────────────────────┤
│ ⚔️ Ultra League Active         │
│    Championship Series Cup     │
└────────────────────────────────┘
```

---

## 8. Gaming Context Integration

### Quick Reference Mode

**During Gameplay UI Considerations:**
- **One-handed operation:** Critical actions in bottom 60% of screen
- **High contrast text:** Minimum 4.5:1 contrast ratio
- **Minimal chrome:** Content-first design, subtle navigation
- **Instant status:** Event status visible without scrolling

### Dark Mode Specifications

**Color Adaptations:**
| Light Mode | Dark Mode | Usage |
|------------|-----------|-------|
| `#FFFFFF` | `#121212` | Background |
| `#F5F5F5` | `#1E1E1E` | Card background |
| `#E0E0E0` | `#2C2C2C` | Dividers |
| `#212121` | `#E0E0E0` | Primary text |
| `#757575` | `#9E9E9E` | Secondary text |

**Event Status Dark Mode:**
| Status | Dark Mode Badge |
|--------|-----------------|
| Active | `#2E7D32` background, `#A5D6A7` text |
| Upcoming | `#1565C0` background, `#90CAF9` text |
| Ended | `#424242` background, `#9E9E9E` text |

### Outdoor Visibility Mode

**High Brightness Override:**
- Increase saturation by 10%
- Boost contrast to 7:1 minimum
- Solid color backgrounds (no gradients)
- Thicker borders on cards (2px → 3px)

### Visual Cues for Game Connection

**Shared Visual Language:**
- Pokemon sprites match in-game assets exactly
- Bonus icons replicate game UI icons
- Type colors match game type colors
- Raid egg colors (pink/yellow/white) for difficulty

---

## 9. Deliverable Compilation

### Complete Component Library

#### Core Components

| Component | Props | States | Variants |
|-----------|-------|--------|----------|
| `EventCard` | event object, compact (bool) | loading, error, loaded | list-item, detail-header, widget |
| `PokemonCard` | pokemon object, size (enum) | loading, loaded | compact, standard, detailed |
| `BonusChip` | bonus object | default, highlighted | icon-only, full |
| `TimeDisplay` | start, end, isGlobal | - | countdown, range, relative |
| `StatusBadge` | status (enum) | - | active, upcoming, ended |
| `SectionExpander` | title, content | collapsed, expanded | - |
| `EggPoolGrid` | eggs object | - | compact, full |
| `BattleLeagueCard` | league object | - | summary, full-rules |

#### Layout Components

| Component | Purpose |
|-----------|---------|
| `EventFilterBar` | Type filters, date range, status filter |
| `PokemonGrid` | Responsive grid with lazy loading |
| `TimelineView` | Calendar-style event visualization |
| `TabbedSection` | Custom sections in tabbed interface |

### Screen Specifications

#### Screen 1: Home / Event Feed
```
┌─────────────────────────────────────┐
│ ≡  Pokemon Go Events          🔔   │
├─────────────────────────────────────┤
│ [Active] [Upcoming] [All Events]    │ ← Filter tabs
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ [Event Card - Active]           │ │
│ │ Carnival of Flamigo             │ │
│ │ 🟢 Ends in 2d 4h                │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Event Card - Active]           │ │
│ │ GO Pass: February               │ │
│ │ 🟢 Ends in 27d                  │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ [Event Card - Upcoming]         │ │
│ │ Oricorio Catch Mastery          │ │
│ │ 🔵 Starts in 2d 4h              │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

#### Screen 2: Event Detail
```
┌─────────────────────────────────────┐
│ ← Back         Event          ⋮    │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │   [Hero Banner Image]           │ │
│ │   640x360 aspect preserved      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Carnival of Flamigo      🟢 ACTIVE  │
│ Event                               │
│                                     │
│ 📅 Feb 3 - Feb 8, 2026             │
│ ⏱️ Ends in 2 days, 4 hours          │
│                                     │
├─────────────────────────────────────┤
│ BONUSES                             │
│ ┌───────┐ ┌───────┐ ┌───────┐      │
│ │ 2×    │ │ 2×    │ │ +500  │      │
│ │Incense│ │D. Inc.│ │Stardust│     │
│ └───────┘ └───────┘ └───────┘      │
├─────────────────────────────────────┤
│ POKEMON                         ≡   │
│ [All] [Shinies] [Spawns] [Raids]   │
│                                     │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│ │ 🌸│ │ 🐦│ │ 💧│ │ ✨│ │ 🦩│     │
│ └───┘ └───┘ └───┘ └───┘ └───┘     │
│ Lotad  Pikipek Frillish Spritzee   │
│ ✨      ✨      ✨      ✨          │
├─────────────────────────────────────┤
│ FIELD RESEARCH               [▼]   │
├─────────────────────────────────────┤
│ COLLECTION CHALLENGE         [▼]   │
├─────────────────────────────────────┤
│ WEB STORE OFFER              [▼]   │
└─────────────────────────────────────┘
```

#### Screen 3: Season Overview
```
┌─────────────────────────────────────┐
│ ← Back    Precious Paths            │
├─────────────────────────────────────┤
│ [Season Banner - Wide Format]       │
│                                     │
│ Season 21: Precious Paths           │
│ 🟢 Active until Mar 3, 2026         │
├─────────────────────────────────────┤
│ EGG POOLS                           │
│ ┌─────┬─────┬─────┬─────┬──────┐   │
│ │ 1km │ 2km │ 5km │ 7km │ 10km │   │
│ │ 26  │ 11  │ 10  │ 7   │ 10   │   │
│ └─────┴─────┴─────┴─────┴──────┘   │
│ [View Full Egg Pools]               │
├─────────────────────────────────────┤
│ RESEARCH BREAKTHROUGHS              │
│ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐     │
│ │ 🎭│ │ 🐋│ │ 😴│ │ ⚔️│ │ 👻│     │
│ └───┘ └───┘ └───┘ └───┘ └───┘     │
├─────────────────────────────────────┤
│ COMMUNITY DAYS                      │
│ • Dec 6-7: December CD 2025        │
│ • Jan 4: January CD Classic        │
│ • Jan 18: January Community Day    │
│ • Feb 1: February Community Day    │
├─────────────────────────────────────┤
│ GO BATTLE LEAGUE                    │
│ Ultra League, Master League,        │
│ Championship Series Cup...          │
└─────────────────────────────────────┘
```

### Usage Examples by Data Type

#### Example: Rendering `bonuses` Array
```javascript
// Data structure
bonuses: [
  { text: "2× XP for catching Pokémon", image: "...", multiplier: 2 }
]

// Component usage
<BonusGrid>
  {event.bonuses.map(bonus => (
    <BonusCard 
      icon={bonus.image}
      text={bonus.text}
      multiplier={bonus.multiplier}
    />
  ))}
</BonusGrid>
```

#### Example: Rendering `customSections`
```javascript
// Dynamic section rendering
{Object.entries(event.customSections).map(([sectionId, section]) => (
  <CustomSection 
    key={sectionId}
    title={formatSectionTitle(sectionId)}
    paragraphs={section.paragraphs}
    lists={section.lists}
    pokemon={section.pokemon}
    tables={section.tables}
  />
))}
```

#### Example: Battle League Rendering
```javascript
// GO Battle League event
<BattleLeagueEvent event={event}>
  {event.battle.leagues.map(league => (
    <LeagueCard 
      name={league.name}
      cpCap={league.cpCap}
      typeRestrictions={league.typeRestrictions}
      rules={league.rules}
    />
  ))}
</BattleLeagueEvent>
```

---

## 10. Assumption Documentation

### Data Structure Assumptions

| Assumption | Basis | Risk | Mitigation |
|------------|-------|------|------------|
| All events have `eventStatus` computed | Field present in all samples | Medium - could be missing in edge cases | Default to "unknown" state with neutral styling |
| Pokemon images are 256x256 PNG | Consistent across samples | Low - verified in data | Fallback loading spinner at same dimensions |
| `customSections` keys are lowercase-hyphenated | Pattern in samples (e.g., "field-research-task-rewards") | Medium - could vary | Case-insensitive key matching, title formatting function |
| ISO 8601 timestamps always include milliseconds | All samples show `.000` | Low | Flexible date parsing library |

### Missing Data Elements (Recommendations)

| Missing Element | Purpose | Benefit |
|-----------------|---------|---------|
| Event description/summary | Quick overview without opening detail | Better list view scannability |
| Pokemon type information | Type-based filtering | Enable type-based event search |
| Event region/country restrictions | Location awareness | Show only relevant events |
| Push notification preferences | Alert configuration | User engagement |
| Favorite/bookmark flag | Personal tracking | Return to interesting events |

### Stakeholder Clarifications Needed

1. **Image CDN Strategy**
   - Are images cached locally or always fetched from `pokemn.quest`?
   - Should we implement progressive loading for banner images?

2. **Offline Behavior**
   - Should events be cached for offline viewing?
   - How stale can event data be before refresh is required?

3. **Notification Integration**
   - Should the app support push notifications for event starts?
   - What countdown thresholds warrant notifications?

4. **Deep Linking**
   - Should the app support deep links to specific events?
   - Integration with Pokemon Go app for direct event research access?

5. **Brand Guidelines Flexibility**
   - How strictly must Pokemon Go brand guidelines be followed?
   - Are custom accent colors per event type acceptable?

6. **Accessibility Requirements**
   - Screen reader optimization level required?
   - Animation/motion preferences support needed?

### Technical Recommendations

1. **Image Handling**
   - Implement responsive image loading with `srcset`
   - Use Intersection Observer for lazy loading Pokemon sprites
   - Cache bonus icons aggressively (small, reusable)

2. **Time Handling**
   - Store all times in UTC internally
   - Convert to local timezone only for display
   - Use relative time for recent events ("2 hours ago")
   - Use absolute time for distant events ("Feb 14, 2026")

3. **State Management**
   - Pre-compute `eventStatus` on data fetch
   - Cache filtered/sorted event lists
   - Implement optimistic UI updates for bookmarks

4. **Performance Targets**
   - First Contentful Paint: < 1.5s
   - Time to Interactive: < 3s
   - Pokemon grid scroll: 60fps
   - Event detail load: < 500ms

---

## Summary

This design language outline provides a comprehensive foundation for building a Pokemon Go companion app focused on event data. The design prioritizes:

1. **Mobile-first usability** for on-the-go reference during gameplay
2. **Visual hierarchy** that surfaces time-sensitive information prominently
3. **Flexible content rendering** to handle the variable `customSections` structure
4. **Consistent component patterns** for Pokemon display, bonus presentation, and time formatting
5. **Gaming context awareness** with dark mode, outdoor visibility, and quick-reference widgets

The component architecture maps directly to the JSON data structure, ensuring efficient data binding and maintainable code. The responsive considerations ensure the app remains usable across device sizes while maintaining the glanceable information density that players need during active gameplay sessions.