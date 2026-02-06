# Pokémon GO Data Visualization

A simple front-end application that visualizes the Pokémon GO data served via the JSON API at `https://pokemn.quest/data/`.

## Purpose

This visualization serves as:
- **Visual catalogue** of all data types and event types
- **Verification tool** to ensure all documented API endpoints are working correctly
- **Example implementation** showing how to consume the API data

## Features

- 📊 **Main Data Types**: Events, Raids, Research, Eggs, Team GO Rocket Lineups, Shinies
- 🎯 **Event Types**: Displays one example of each event type (Community Day, GO Tour, Raid Battles, etc.)
- ✅ **Endpoint Verification**: Shows status indicators for each API endpoint
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Clean UI**: Modern, card-based layout with Pokémon GO themed colors

## Running Locally

### Prerequisites
- Node.js 20 or higher
- The scraped data files in the `data/` directory

### Quick Start

1. **Start the server:**
   ```bash
   npm run serve
   ```

2. **Open in browser:**
   ```
   http://localhost:3000
   ```

The server will serve the visualization front-end and the data files from the `data/` directory.

### Alternative Port
If port 3000 is in use:
```bash
PORT=3001 npm run serve
```

## File Structure

```
public/
├── index.html    # Main HTML structure
├── styles.css    # Styling and layout
└── app.js        # Data fetching and rendering logic

serve.js          # Simple HTTP server
```

## Configuration

The `app.js` file includes configuration options:

```javascript
const API_BASE_URL = 'https://pokemn.quest/data/';
const USE_LOCAL_DATA = true; // Set to false to use production API
const LOCAL_DATA_PATH = '../data/';
```

- **USE_LOCAL_DATA=true**: Loads data from the local `data/` directory
- **USE_LOCAL_DATA=false**: Loads data from the production API at pokemn.quest

## What's Displayed

### Main Data Types
Each main data type shows a few example items:
- **Events**: First 3 events
- **Raids**: First 6 raid bosses
- **Research**: First 3 research items
- **Eggs**: First 6 egg hatches
- **Rocket Lineups**: First 4 Team GO Rocket lineups
- **Shinies**: First 12 shiny Pokémon

### Event Types
One example event of each type:
- Community Day
- Event (generic)
- Go Battle League
- Go Pass
- Max Battles
- Max Mondays
- Pokémon GO Tour
- Pokémon Spotlight Hour
- PokéStop Showcase
- Raid Battles
- Raid Day
- Raid Hour
- Research
- Research Day
- Season
- Team GO Rocket
- GO Rocket Takeover
- Research Breakthrough
- Special Research
- Timed Research

### Unified Data
Summary statistics showing total counts for each data type.

## API Endpoints Verified

This tool verifies all endpoints documented in `dataDocumentation/Endpoints.md`:

- `https://pokemn.quest/data/events.min.json`
- `https://pokemn.quest/data/raids.min.json`
- `https://pokemn.quest/data/research.min.json`
- `https://pokemn.quest/data/eggs.min.json`
- `https://pokemn.quest/data/rocketLineups.min.json`
- `https://pokemn.quest/data/shinies.min.json`
- `https://pokemn.quest/data/unified.min.json`
- All event type endpoints in `eventTypes/` directory

## Visual Indicators

- 🟢 **Green badge**: Endpoint loaded successfully
- 🟡 **Yellow badge**: Loading in progress
- 🔴 **Red badge**: Error loading endpoint

## Development

The visualization uses vanilla JavaScript (no frameworks) for simplicity and minimal dependencies:
- Native `fetch()` API for data loading
- Template literals for HTML generation
- CSS Grid and Flexbox for responsive layout

## Notes

- Images use `onerror` handlers to gracefully handle missing images
- All dates are displayed in local timezone using `toLocaleString()`
- The visualization is read-only and does not modify any data
- CORS is handled by the local server with `Access-Control-Allow-Origin: *`
