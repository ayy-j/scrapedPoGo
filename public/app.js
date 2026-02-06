// Configuration
const API_BASE_URL = 'https://pokemn.quest/data/';
// Automatically detect if we're running locally or in production
const USE_LOCAL_DATA = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const LOCAL_DATA_PATH = '../data/';

// Get the appropriate base URL
const getBaseUrl = () => USE_LOCAL_DATA ? LOCAL_DATA_PATH : API_BASE_URL;

// Event type mappings (only types that have data files)
const EVENT_TYPES = [
    { slug: 'community-day', name: 'Community Day' },
    { slug: 'event', name: 'Event' },
    { slug: 'go-battle-league', name: 'Go Battle League' },
    { slug: 'go-pass', name: 'Go Pass' },
    { slug: 'max-battles', name: 'Max Battles' },
    { slug: 'max-mondays', name: 'Max Mondays' },
    { slug: 'pokemon-go-tour', name: 'Pokémon GO Tour' },
    { slug: 'pokemon-spotlight-hour', name: 'Pokémon Spotlight Hour' },
    { slug: 'raid-battles', name: 'Raid Battles' },
    { slug: 'raid-day', name: 'Raid Day' },
    { slug: 'raid-hour', name: 'Raid Hour' },
    { slug: 'research-day', name: 'Research Day' },
    { slug: 'season', name: 'Season' }
];

// Utility functions
const updateStatus = (id, status) => {
    const element = document.getElementById(`${id}-status`);
    if (element) {
        element.textContent = status === 'success' ? '✓ Loaded' : status === 'error' ? '✗ Error' : 'Loading...';
        element.className = `status ${status}`;
    }
};

const fetchData = async (endpoint) => {
    const url = `${getBaseUrl()}${endpoint}`;
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return await response.json();
    } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        throw error;
    }
};

// Rendering functions
const renderEvent = (event) => {
    const card = document.createElement('div');
    card.className = 'card';

    const statusBadge = event.eventStatus ? `<span class="badge">${event.eventStatus}</span>` : '';
    const globalBadge = event.isGlobal ? `<span class="badge">Global</span>` : '';

    card.innerHTML = `
        ${event.image ? `<img src="${event.image}" alt="${event.name}" onerror="this.style.display='none'">` : ''}
        <h4>${event.name}</h4>
        <div class="meta">
            <strong>Type:</strong> ${event.eventType || 'N/A'}<br>
            <strong>Start:</strong> ${event.start ? new Date(event.start).toLocaleString() : 'N/A'}<br>
            <strong>End:</strong> ${event.end ? new Date(event.end).toLocaleString() : 'N/A'}
        </div>
        ${statusBadge} ${globalBadge}
        ${event.pokemon && event.pokemon.length > 0 ? `
            <div class="pokemon-list">
                ${event.pokemon.slice(0, 5).map(p => `
                    <div class="pokemon-item">
                        ${p.image ? `<img src="${p.image}" alt="${p.name}" onerror="this.style.display='none'">` : ''}
                        <span>${p.name}</span>
                        ${p.canBeShiny ? '<span class="shiny-badge">✨</span>' : ''}
                    </div>
                `).join('')}
                ${event.pokemon.length > 5 ? `<span>+${event.pokemon.length - 5} more</span>` : ''}
            </div>
        ` : ''}
    `;

    return card;
};

const renderRaid = (raid) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        ${raid.image ? `<img src="${raid.image}" alt="${raid.name}" onerror="this.style.display='none'">` : ''}
        <h4>${raid.name}${raid.form ? ` (${raid.form})` : ''}</h4>
        <div class="meta">
            <strong>Tier:</strong> ${raid.tier || 'N/A'}<br>
            ${raid.combatPower ? `<strong>CP:</strong> ${raid.combatPower.normal?.min || '?'} - ${raid.combatPower.normal?.max || '?'}` : ''}
        </div>
        ${raid.canBeShiny ? '<span class="shiny-badge">✨ Shiny Available</span>' : ''}
        ${raid.types && raid.types.length > 0 ? `
            <div>
                ${raid.types.map(t => `
                    <span class="type-icon">
                        ${t.image ? `<img src="${t.image}" alt="${t.name}" onerror="this.style.display='none'">` : ''}
                        ${t.name}
                    </span>
                `).join('')}
            </div>
        ` : ''}
    `;

    return card;
};

const renderResearch = (research) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <h4>${research.name || 'Research'}</h4>
        <div class="meta">
            <strong>Type:</strong> ${research.type || 'N/A'}<br>
            ${research.start ? `<strong>Start:</strong> ${new Date(research.start).toLocaleString()}` : ''}
        </div>
        ${research.tasks && research.tasks.length > 0 ? `
            <p><strong>Tasks:</strong> ${research.tasks.length}</p>
        ` : ''}
    `;

    return card;
};

const renderEgg = (egg) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        ${egg.image ? `<img src="${egg.image}" alt="${egg.name}" onerror="this.style.display='none'">` : ''}
        <h4>${egg.name}${egg.form ? ` (${egg.form})` : ''}</h4>
        <div class="meta">
            <strong>Egg Type:</strong> ${egg.eggType || 'N/A'}<br>
            ${egg.combatPower ? `<strong>CP:</strong> ${egg.combatPower.min || '?'} - ${egg.combatPower.max || '?'}` : ''}
        </div>
        ${egg.canBeShiny ? '<span class="shiny-badge">✨ Shiny Available</span>' : ''}
        ${egg.rarity ? `<span class="badge">Rarity: ${egg.rarity}</span>` : ''}
    `;

    return card;
};

const renderRocketLineup = (lineup) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <h4>${lineup.trainer || 'Rocket Grunt'}</h4>
        <div class="meta">
            <strong>Type:</strong> ${lineup.type || 'N/A'}<br>
            ${lineup.quote ? `<em>"${lineup.quote}"</em>` : ''}
        </div>
        ${lineup.slots && lineup.slots.length > 0 ? `
            <div>
                ${lineup.slots.map((slot, idx) => `
                    <p><strong>Slot ${idx + 1}:</strong> ${Array.isArray(slot) ? slot.map(p => p.name || p).join(', ') : 'N/A'}</p>
                `).join('')}
            </div>
        ` : ''}
    `;

    return card;
};

const renderShiny = (shiny) => {
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        ${shiny.image ? `<img src="${shiny.image}" alt="${shiny.name}" onerror="this.style.display='none'">` : ''}
        <h4>${shiny.name}${shiny.form ? ` (${shiny.form})` : ''}</h4>
        <div class="meta">
            ${shiny.dexNumber ? `<strong>#${shiny.dexNumber}</strong><br>` : ''}
            ${shiny.region ? `<strong>Region:</strong> ${shiny.region}<br>` : ''}
            ${shiny.releasedDate ? `<strong>Released:</strong> ${shiny.releasedDate}` : ''}
        </div>
        <span class="shiny-badge">✨ Shiny Available</span>
    `;

    return card;
};

// Load and display functions
const loadEvents = async () => {
    try {
        updateStatus('events', 'loading');
        const data = await fetchData('events.min.json');
        const container = document.getElementById('events-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 3 events
            data.slice(0, 3).forEach(event => {
                container.appendChild(renderEvent(event));
            });
            updateStatus('events', 'success');
        } else {
            throw new Error('No events data');
        }
    } catch (error) {
        updateStatus('events', 'error');
        document.getElementById('events-content').innerHTML =
            `<div class="error-message">Error loading events: ${error.message}</div>`;
    }
};

const loadEventTypes = async () => {
    const container = document.getElementById('event-types-content');

    for (const eventType of EVENT_TYPES) {
        const section = document.createElement('div');
        section.className = 'event-type-section';

        const statusId = `event-type-${eventType.slug}`;
        section.innerHTML = `
            <h3>${eventType.name}</h3>
            <div class="endpoint-info">
                <code>${API_BASE_URL}eventTypes/${eventType.slug}.min.json</code>
                <span class="status loading" id="${statusId}-status">Loading...</span>
            </div>
            <div id="${statusId}-content" class="content-grid"></div>
        `;

        container.appendChild(section);

        // Load data for this event type
        (async () => {
            try {
                const data = await fetchData(`eventTypes/${eventType.slug}.min.json`);
                const contentDiv = document.getElementById(`${statusId}-content`);

                if (Array.isArray(data) && data.length > 0) {
                    // Show first event of this type
                    contentDiv.appendChild(renderEvent(data[0]));
                    updateStatus(statusId, 'success');
                } else {
                    contentDiv.innerHTML = '<p>No events of this type</p>';
                    updateStatus(statusId, 'success');
                }
            } catch (error) {
                updateStatus(statusId, 'error');
                document.getElementById(`${statusId}-content`).innerHTML =
                    `<div class="error-message">Error: ${error.message}</div>`;
            }
        })();
    }
};

const loadRaids = async () => {
    try {
        updateStatus('raids', 'loading');
        const data = await fetchData('raids.min.json');
        const container = document.getElementById('raids-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 6 raids
            data.slice(0, 6).forEach(raid => {
                container.appendChild(renderRaid(raid));
            });
            updateStatus('raids', 'success');
        } else {
            throw new Error('No raids data');
        }
    } catch (error) {
        updateStatus('raids', 'error');
        document.getElementById('raids-content').innerHTML =
            `<div class="error-message">Error loading raids: ${error.message}</div>`;
    }
};

const loadResearch = async () => {
    try {
        updateStatus('research', 'loading');
        const data = await fetchData('research.min.json');
        const container = document.getElementById('research-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 3 research items
            data.slice(0, 3).forEach(research => {
                container.appendChild(renderResearch(research));
            });
            updateStatus('research', 'success');
        } else {
            throw new Error('No research data');
        }
    } catch (error) {
        updateStatus('research', 'error');
        document.getElementById('research-content').innerHTML =
            `<div class="error-message">Error loading research: ${error.message}</div>`;
    }
};

const loadEggs = async () => {
    try {
        updateStatus('eggs', 'loading');
        const data = await fetchData('eggs.min.json');
        const container = document.getElementById('eggs-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 6 eggs
            data.slice(0, 6).forEach(egg => {
                container.appendChild(renderEgg(egg));
            });
            updateStatus('eggs', 'success');
        } else {
            throw new Error('No eggs data');
        }
    } catch (error) {
        updateStatus('eggs', 'error');
        document.getElementById('eggs-content').innerHTML =
            `<div class="error-message">Error loading eggs: ${error.message}</div>`;
    }
};

const loadRocketLineups = async () => {
    try {
        updateStatus('rocket', 'loading');
        const data = await fetchData('rocketLineups.min.json');
        const container = document.getElementById('rocket-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 4 lineups
            data.slice(0, 4).forEach(lineup => {
                container.appendChild(renderRocketLineup(lineup));
            });
            updateStatus('rocket', 'success');
        } else {
            throw new Error('No rocket lineups data');
        }
    } catch (error) {
        updateStatus('rocket', 'error');
        document.getElementById('rocket-content').innerHTML =
            `<div class="error-message">Error loading rocket lineups: ${error.message}</div>`;
    }
};

const loadShinies = async () => {
    try {
        updateStatus('shinies', 'loading');
        const data = await fetchData('shinies.min.json');
        const container = document.getElementById('shinies-content');

        if (Array.isArray(data) && data.length > 0) {
            // Show first 12 shinies
            data.slice(0, 12).forEach(shiny => {
                container.appendChild(renderShiny(shiny));
            });
            updateStatus('shinies', 'success');
        } else {
            throw new Error('No shinies data');
        }
    } catch (error) {
        updateStatus('shinies', 'error');
        document.getElementById('shinies-content').innerHTML =
            `<div class="error-message">Error loading shinies: ${error.message}</div>`;
    }
};

const loadUnifiedData = async () => {
    try {
        updateStatus('unified', 'loading');
        const data = await fetchData('unified.min.json');
        const container = document.getElementById('unified-content');

        // Display summary statistics
        const summary = document.createElement('div');
        summary.className = 'data-summary';

        const stats = [
            { label: 'Events', value: data.events?.length || 0 },
            { label: 'Raids', value: data.raids?.length || 0 },
            { label: 'Research', value: data.research?.length || 0 },
            { label: 'Eggs', value: data.eggs?.length || 0 },
            { label: 'Rocket Lineups', value: data.rocketLineups?.length || 0 },
            { label: 'Shinies', value: data.shinies?.length || 0 }
        ];

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="number">${stat.value}</div>
                <div class="label">${stat.label}</div>
            `;
            summary.appendChild(card);
        });

        container.appendChild(summary);

        // Display indices if available
        if (data.indices) {
            const indicesDiv = document.createElement('div');
            indicesDiv.innerHTML = `
                <h3>Available Indices</h3>
                <pre>${JSON.stringify(data.indices, null, 2)}</pre>
            `;
            container.appendChild(indicesDiv);
        }

        updateStatus('unified', 'success');
    } catch (error) {
        updateStatus('unified', 'error');
        document.getElementById('unified-content').innerHTML =
            `<div class="error-message">Error loading unified data: ${error.message}</div>`;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEvents();
    loadEventTypes();
    loadRaids();
    loadResearch();
    loadEggs();
    loadRocketLineups();
    loadShinies();
    loadUnifiedData();
});
