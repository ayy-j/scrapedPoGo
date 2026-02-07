// Configuration
const API_BASE_URL = 'https://pokemn.quest/data/';
const USE_LOCAL_DATA = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const LOCAL_DATA_PATH = '../data/';

const EVENT_TYPES = [
    { slug: 'community-day', name: 'Community Day' },
    { slug: 'event', name: 'Event' },
    { slug: 'go-battle-league', name: 'Go Battle League' },
    { slug: 'go-pass', name: 'Go Pass' },
    { slug: 'max-battles', name: 'Max Battles' },
    { slug: 'max-mondays', name: 'Max Mondays' },
    { slug: 'pokemon-go-tour', name: 'Pokemon GO Tour' },
    { slug: 'pokemon-spotlight-hour', name: 'Pokemon Spotlight Hour' },
    { slug: 'raid-battles', name: 'Raid Battles' },
    { slug: 'raid-day', name: 'Raid Day' },
    { slug: 'raid-hour', name: 'Raid Hour' },
    { slug: 'research-day', name: 'Research Day' },
    { slug: 'season', name: 'Season' }
];

const LIMITS = {
    events: 3,
    raids: 6,
    research: 3,
    eggs: 6,
    rocket: 4,
    shinies: 12
};

const SHARED_EVENT_QUERY_PARAM = 'event';
const LOCAL_ANALYTICS_STORAGE_KEY = 'pogoSignalDeckMetrics';
const TOAST_AUTO_HIDE_MS = 2200;

const HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
};

const getBaseUrl = () => (USE_LOCAL_DATA ? LOCAL_DATA_PATH : API_BASE_URL);

const normalizeEventId = (value) => String(value ?? '').trim().toLowerCase();

const getSharedEventIdFromUrl = () => {
    const params = new URLSearchParams(window.location.search);
    const rawId = normalizeEventId(params.get(SHARED_EVENT_QUERY_PARAM));
    return /^[a-z0-9_-]+$/.test(rawId) ? rawId : '';
};

const appState = {
    sharedEventId: getSharedEventIdFromUrl(),
    highlightedEventCard: null,
    shareToastTimeoutId: null,
    trackedSharedLinkOpen: false
};

const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);

const formatDate = (value) => {
    if (!value) {
        return 'N/A';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return 'N/A';
    }

    return parsed.toLocaleString();
};

const formatNumber = (value) => Number(value || 0).toLocaleString();

const readLocalMetrics = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(LOCAL_ANALYTICS_STORAGE_KEY) || '{}');
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
};

const writeLocalMetrics = (metrics) => {
    try {
        localStorage.setItem(LOCAL_ANALYTICS_STORAGE_KEY, JSON.stringify(metrics));
    } catch {
        // Ignore storage write failures.
    }
};

const cleanTrackingPayload = (payload = {}) => Object.entries(payload).reduce((accumulator, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
        accumulator[key] = value;
    }
    return accumulator;
}, {});

const trackEvent = (eventName, payload = {}) => {
    const properties = cleanTrackingPayload(payload);

    if (typeof window.gtag === 'function') {
        window.gtag('event', eventName, properties);
    }

    if (typeof window.plausible === 'function') {
        window.plausible(eventName, { props: properties });
    }

    const metrics = readLocalMetrics();
    metrics[eventName] = (Number(metrics[eventName]) || 0) + 1;
    metrics.lastEvent = {
        name: eventName,
        properties,
        timestamp: new Date().toISOString()
    };
    writeLocalMetrics(metrics);
};

const ensureShareToast = () => {
    let toast = document.getElementById('share-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'share-toast';
        toast.className = 'share-toast';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        document.body.appendChild(toast);
    }
    return toast;
};

const showShareToast = (message, variant = 'success') => {
    const toast = ensureShareToast();
    toast.textContent = message;
    toast.className = `share-toast is-visible is-${variant}`;

    if (appState.shareToastTimeoutId) {
        window.clearTimeout(appState.shareToastTimeoutId);
    }

    appState.shareToastTimeoutId = window.setTimeout(() => {
        toast.classList.remove('is-visible');
    }, TOAST_AUTO_HIDE_MS);
};

const copyToClipboard = async (text) => {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.setAttribute('readonly', '');
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();

    const didCopy = document.execCommand('copy');
    document.body.removeChild(textArea);

    if (!didCopy) {
        throw new Error('Clipboard copy failed');
    }
};

const sanitizeUrl = (value) => {
    if (!value || typeof value !== 'string') {
        return '';
    }

    try {
        return new URL(value, window.location.href).href;
    } catch {
        return '';
    }
};

const updateStatus = (id, status, detail = '') => {
    const element = document.getElementById(`${id}-status`);
    if (!element) {
        return;
    }

    const text = {
        loading: 'Syncing...',
        error: 'Unavailable',
        success: detail ? `Live ${detail}` : 'Live'
    };

    element.textContent = text[status] || 'Syncing...';
    element.className = `status ${status}`;
};

const fetchData = async (endpoint) => {
    const url = `${getBaseUrl()}${endpoint}`;
    const response = await fetch(url, { cache: 'no-store' });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return response.json();
};

const renderLoading = (container, message = 'Syncing records...') => {
    container.innerHTML = `<div class="loading-state">${escapeHtml(message)}</div>`;
};

const renderEmpty = (container, message = 'No records available') => {
    container.innerHTML = `<div class="empty-state">${escapeHtml(message)}</div>`;
};

const renderError = (container, message) => {
    container.innerHTML = `<div class="error-message">${escapeHtml(message)}</div>`;
};

const imageMarkup = (src, alt) => {
    const safeSrc = sanitizeUrl(src);
    if (!safeSrc) {
        return '';
    }

    return `<img class="card-media" src="${escapeHtml(safeSrc)}" alt="${escapeHtml(alt || 'Data image')}" loading="lazy" decoding="async">`;
};

const metaMarkup = (rows) => rows
    .filter((row) => row.value !== undefined && row.value !== null && row.value !== '')
    .map((row) => `
        <div class="meta-row">
            <span class="meta-label">${escapeHtml(row.label)}</span>
            <span class="meta-value">${escapeHtml(row.value)}</span>
        </div>
    `)
    .join('');

const badgeMarkup = (label, variant = '') => {
    const classes = variant ? `badge ${variant}` : 'badge';
    return `<span class="${classes}">${escapeHtml(label)}</span>`;
};

const chipMarkup = (label) => `<span class="chip">${escapeHtml(label)}</span>`;

const buildEventShareUrl = (eventId) => {
    const url = new URL(window.location.href);
    url.search = '';
    url.hash = 'events';
    url.searchParams.set(SHARED_EVENT_QUERY_PARAM, eventId);
    return url.toString();
};

const highlightSharedEventCard = (card) => {
    card.classList.add('card-shared-target');
    const body = card.querySelector('.card-body');
    if (!body) {
        return;
    }

    let badgeRow = body.querySelector('.badge-row');
    if (!badgeRow) {
        badgeRow = document.createElement('div');
        badgeRow.className = 'badge-row';
        const subtitle = body.querySelector('.card-subtitle');
        if (subtitle) {
            subtitle.insertAdjacentElement('afterend', badgeRow);
        } else {
            body.appendChild(badgeRow);
        }
    }

    badgeRow.insertAdjacentHTML('beforeend', badgeMarkup('Shared Link', 'is-share'));
};

const selectEventsForDisplay = (events, limit) => {
    if (!appState.sharedEventId) {
        return events.slice(0, limit);
    }

    const targetIndex = events.findIndex((event) => normalizeEventId(event.eventID) === appState.sharedEventId);
    if (targetIndex < 0) {
        return events.slice(0, limit);
    }

    const selected = [events[targetIndex]];
    for (let index = 0; index < events.length; index += 1) {
        if (index === targetIndex) {
            continue;
        }

        selected.push(events[index]);
        if (selected.length >= limit) {
            break;
        }
    }

    return selected;
};

const buildCard = ({
    kicker,
    title,
    subtitle,
    image,
    imageClass = '',
    meta = [],
    badges = [],
    chips = [],
    extra = ''
}) => {
    const card = document.createElement('article');
    card.className = 'card';

    const cleanBadges = badges.filter(Boolean).join('');
    const cleanChips = chips.filter(Boolean).join('');

    // Support custom image class (e.g., card-media--event for constrained height)
    const imgClass = imageClass ? `card-media ${imageClass}` : 'card-media';
    const imgMarkup = image ? `<img class="${imgClass}" src="${escapeHtml(sanitizeUrl(image) || '')}" alt="${escapeHtml(title || 'Image')}" loading="lazy" decoding="async">` : '';

    card.innerHTML = `
        ${imgMarkup}
        <div class="card-body">
            ${kicker ? `<span class="kicker">${escapeHtml(kicker)}</span>` : ''}
            <h3>${escapeHtml(title || 'Untitled')}</h3>
            ${subtitle ? `<p class="card-subtitle">${escapeHtml(subtitle)}</p>` : ''}
            <div class="meta-grid">${metaMarkup(meta)}</div>
            ${cleanBadges ? `<div class="badge-row">${cleanBadges}</div>` : ''}
            ${cleanChips ? `<div class="chip-list">${cleanChips}</div>` : ''}
            ${extra}
        </div>
    `;

    return card;
};

// Compact card variant: sprite thumbnail on left, content on right
const buildCompactCard = ({
    kicker,
    title,
    sprite,
    badges = [],
    extra = ''
}) => {
    const card = document.createElement('article');
    card.className = 'card card--compact';

    const cleanBadges = badges.filter(Boolean).join('');
    const spriteUrl = sanitizeUrl(sprite);
    const spriteMarkup = spriteUrl
        ? `<img class="sprite-thumb" src="${escapeHtml(spriteUrl)}" alt="${escapeHtml(title || 'Sprite')}" loading="lazy" decoding="async">`
        : '<div class="sprite-thumb"></div>';

    card.innerHTML = `
        ${spriteMarkup}
        <div class="card-body">
            ${kicker ? `<span class="kicker">${escapeHtml(kicker)}</span>` : ''}
            <h3>${escapeHtml(title || 'Untitled')}</h3>
            ${cleanBadges ? `<div class="badge-row">${cleanBadges}</div>` : ''}
            ${extra}
        </div>
    `;

    return card;
};

const renderEvent = (event, options = {}) => {
    const includeShareActions = options.includeShareActions ?? true;
    const canHighlightShared = options.canHighlightShared ?? true;
    const badges = [];

    if (event.eventStatus) {
        const statusMap = { 'active': 'Live Now', 'upcoming': 'Upcoming', 'ended': 'Ended' };
        const statusColor = { 'active': 'success', 'upcoming': 'is-alert', 'ended': 'neutral' };
        badges.push(badgeMarkup(statusMap[event.eventStatus] || event.eventStatus, statusColor[event.eventStatus] || ''));
    }

    if (event.isGlobal) {
        badges.push(badgeMarkup('Global'));
    }

    const pokemon = Array.isArray(event.pokemon) ? event.pokemon : [];
    const chips = pokemon.slice(0, 6).map((entry) => chipMarkup(`${entry.name || 'Pokemon'}${entry.canBeShiny ? ' (Shiny)' : ''}`));
    if (pokemon.length > 6) {
        chips.push(chipMarkup(`+${pokemon.length - 6} more`));
    }

    const eventId = normalizeEventId(event.eventID);
    const card = buildCard({
        kicker: 'Event Feed',
        title: event.name || 'Unnamed Event',
        subtitle: event.eventType || 'General Event',
        image: event.image,
        meta: [
            { label: 'Type', value: event.eventType || 'N/A' },
            { label: 'Start', value: formatDate(event.start) },
            { label: 'End', value: formatDate(event.end) }
        ],
        badges,
        chips,
        extra: `
            ${event.bonuses && event.bonuses.length > 0 ? `
                <div class="bonus-list">
                    ${event.bonuses.map(b => `
                        <div class="bonus-item">
                            ${b.image ? `<img src="${escapeHtml(b.image)}" class="bonus-icon" alt="Bonus" loading="lazy">` : ''}
                            <span>${escapeHtml(b.text)}</span>
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            ${eventId && includeShareActions ? `
            <div class="card-actions">
                <button
                    type="button"
                    class="share-button"
                    data-share-event-id="${escapeHtml(eventId)}"
                    data-share-event-name="${escapeHtml(event.name || 'Pokemon GO Event')}"
                >
                    Share Event
                </button>
            </div>` : ''}
        `
    });

    if (eventId) {
        card.dataset.eventId = eventId;
        card.id = `event-${eventId}`;

        if (canHighlightShared && appState.sharedEventId && eventId === appState.sharedEventId) {
            appState.highlightedEventCard = card;
            highlightSharedEventCard(card);
        }
    }

    return card;
};

const renderRaid = (raid) => {
    const normalCp = raid.combatPower?.normal;
    const boostedCp = raid.combatPower?.boosted;

    // Determine tier class
    let tierClass = 'tier-1';
    if (raid.tier?.includes('3')) tierClass = 'tier-3';
    if (raid.tier?.includes('5')) tierClass = 'tier-5';
    if (raid.tier?.includes('Mega')) tierClass = 'tier-mega';

    const typesMarkup = (raid.types || []).map(t => `<img src="${escapeHtml(t.image)}" class="type-icon" alt="${escapeHtml(t.name)}" title="${escapeHtml(t.name)}">`).join('');
    const weatherMarkup = (raid.boostedWeather || []).map(w => `<img src="${escapeHtml(w.image)}" class="weather-icon" alt="${escapeHtml(w.name)}" title="Boosts in ${escapeHtml(w.name)}">`).join('');

    return buildCompactCard({
        kicker: 'Raid Rotation',
        title: `${raid.name || 'Unknown Raid'}${raid.form && raid.form !== 'Normal' ? ` (${raid.form})` : ''}`,
        sprite: raid.image,
        extra: `
            <div class="raid-tier-badge ${tierClass}">${escapeHtml(raid.tier || 'Raid')}</div>
            <div class="icon-row">
                ${typesMarkup}
                ${weatherMarkup ? `<div style="width:1px;background:rgba(255,255,255,0.2);margin:0 4px;"></div>` : ''}
                ${weatherMarkup}
            </div>
            <div class="cp-stat">
                <span>CP</span>
                <span class="cp-val">${normalCp?.min || '?'} - ${normalCp?.max || '?'}</span>
            </div>
            <div class="cp-stat">
                <span class="boosted-text">Boosted</span>
                <span class="cp-val" style="color:var(--warn)">${boostedCp?.min || '?'} - ${boostedCp?.max || '?'}</span>
            </div>
        `,
        badges: [raid.canBeShiny ? badgeMarkup('✨ Shiny', 'is-shiny') : '']
    });
};

const renderResearch = (research) => {
    // Research task card - shows the task text with inline reward icon
    const reward = research.rewards?.[0];
    const rewardImg = reward?.image;
    const rewardLabel = reward?.name || 'Unknown Reward';
    const rewardMeta = reward?.type === 'encounter' && reward.combatPower
        ? `CP ${reward.combatPower.min}-${reward.combatPower.max}`
        : (reward?.quantity ? `×${reward.quantity}` : '');

    return buildCompactCard({
        kicker: research.type ? `${research.type} Research` : 'Field Research',
        title: research.text || 'Research Task',
        sprite: rewardImg,
        extra: `
            <div class="research-reward" style="margin-top:0.5rem;">
                <div class="reward-info">
                    <span class="reward-label">Reward</span>
                    <span class="reward-value">
                        ${escapeHtml(rewardLabel)}${reward?.canBeShiny ? ' ✨' : ''}
                    </span>
                    ${rewardMeta ? `<span class="meta-label" style="font-size:0.65rem">${escapeHtml(rewardMeta)}</span>` : ''}
                </div>
            </div>
        `
    });
};

const renderEgg = (egg) => {
    const cpRange = egg.combatPower ? `${egg.combatPower.min || '?'} - ${egg.combatPower.max || '?'}` : 'N/A';

    return buildCard({
        kicker: 'Egg Pool',
        title: `${egg.name || 'Unknown'}${egg.form ? ` (${egg.form})` : ''}`,
        image: egg.image,
        meta: [
            { label: 'Egg Type', value: egg.eggType || 'N/A' },
            { label: 'CP', value: cpRange },
            { label: 'Rarity', value: egg.rarity || 'N/A' }
        ],
        badges: [egg.canBeShiny ? badgeMarkup('Shiny Available', 'is-shiny') : '']
    });
};

const renderRocketLineup = (lineup) => {
    const slots = Array.isArray(lineup.slots) ? lineup.slots : [];

    const slotPills = slots
        .map((slot, index) => {
            const members = Array.isArray(slot)
                ? slot.map((pokemon) => (typeof pokemon === 'string' ? pokemon : pokemon?.name || 'Unknown')).join(', ')
                : 'Unknown';
            return `<span class="slot-pill">S${index + 1}: ${escapeHtml(members)}</span>`;
        })
        .join('');

    return buildCard({
        kicker: 'Rocket Lineup',
        title: lineup.trainer || 'Rocket Grunt',
        subtitle: lineup.quote || '',
        meta: [
            { label: 'Type', value: lineup.type || 'N/A' },
            { label: 'Slots', value: slots.length || '0' }
        ],
        extra: slotPills ? `<div class="slot-list">${slotPills}</div>` : ''
    });
};

const renderShiny = (shiny) => buildCard({
    kicker: 'Shiny Registry',
    title: `${shiny.name || 'Unknown'}${shiny.form ? ` (${shiny.form})` : ''}`,
    image: shiny.image,
    meta: [
        { label: 'Dex', value: shiny.dexNumber ? `#${shiny.dexNumber}` : 'N/A' },
        { label: 'Region', value: shiny.region || 'N/A' },
        { label: 'Released', value: shiny.releasedDate || 'N/A' }
    ],
    badges: [badgeMarkup('Shiny Available', 'is-shiny')]
});

const appendCards = (container, records, renderer) => {
    container.innerHTML = '';
    const fragment = document.createDocumentFragment();

    records.forEach((record, index) => {
        const card = renderer(record);
        card.style.setProperty('--stagger', index);
        fragment.appendChild(card);
    });

    container.appendChild(fragment);
};

const loadDataset = async ({
    statusId,
    endpoint,
    containerId,
    limit,
    renderer,
    emptyMessage,
    selectRecords
}) => {
    const container = document.getElementById(containerId);
    updateStatus(statusId, 'loading');
    renderLoading(container);

    try {
        const data = await fetchData(endpoint);
        if (!Array.isArray(data) || data.length === 0) {
            renderEmpty(container, emptyMessage || 'No records available.');
            updateStatus(statusId, 'success', '0');
            return [];
        }

        if (statusId === 'events') {
            appState.highlightedEventCard = null;
        }

        const recordsToRender = typeof selectRecords === 'function'
            ? selectRecords(data, limit)
            : data.slice(0, limit);

        appendCards(container, recordsToRender, renderer);
        updateStatus(statusId, 'success', `${recordsToRender.length}/${data.length}`);
        return data;
    } catch (error) {
        updateStatus(statusId, 'error');
        renderError(container, `Error loading ${endpoint}: ${error.message}`);
        return null;
    }
};

const flashShareButton = (button, baseLabel, successLabel) => {
    button.textContent = successLabel;
    button.classList.add('is-success');

    window.setTimeout(() => {
        button.classList.remove('is-success');
        if (!button.disabled) {
            button.textContent = baseLabel;
        }
    }, 1500);
};

const handleEventShare = async (button) => {
    const eventId = normalizeEventId(button.dataset.shareEventId);
    if (!eventId) {
        return;
    }

    const baseLabel = button.dataset.baseLabel || button.textContent || 'Share Event';
    button.dataset.baseLabel = baseLabel;
    const eventName = (button.dataset.shareEventName || 'Pokemon GO Event').trim();
    const shareUrl = buildEventShareUrl(eventId);

    trackEvent('share_clicked', {
        event_id: eventId,
        source: 'event_card'
    });

    button.disabled = true;
    button.textContent = 'Sharing...';

    try {
        let shareMethod = 'clipboard';
        if (typeof navigator.share === 'function') {
            try {
                await navigator.share({
                    title: `${eventName} | Pokemon GO Signal Deck`,
                    text: `Track this event on Pokemon GO Signal Deck: ${eventName}`,
                    url: shareUrl
                });
                shareMethod = 'native';
            } catch (error) {
                if (error?.name === 'AbortError') {
                    showShareToast('Share canceled.', 'neutral');
                    return;
                }
                await copyToClipboard(shareUrl);
            }
        } else {
            await copyToClipboard(shareUrl);
        }

        flashShareButton(button, baseLabel, shareMethod === 'native' ? 'Shared' : 'Copied');
        showShareToast(shareMethod === 'native' ? 'Shared event link.' : 'Event link copied.');
    } catch {
        button.textContent = baseLabel;
        showShareToast('Unable to share this event.', 'error');
    } finally {
        button.disabled = false;
        if (button.textContent === 'Sharing...') {
            button.textContent = baseLabel;
        }
    }
};

const setupEventShareHandlers = () => {
    const eventsContainer = document.getElementById('events-content');
    if (!eventsContainer) {
        return;
    }

    eventsContainer.addEventListener('click', (event) => {
        const shareButton = event.target.closest('.share-button');
        if (!shareButton || !eventsContainer.contains(shareButton)) {
            return;
        }

        void handleEventShare(shareButton);
    });
};

const finalizeSharedEventExperience = () => {
    if (!appState.sharedEventId || appState.trackedSharedLinkOpen) {
        return;
    }

    const foundInEventsFeed = Boolean(appState.highlightedEventCard);
    trackEvent('share_link_opened', {
        event_id: appState.sharedEventId,
        found_in_events_feed: foundInEventsFeed
    });
    appState.trackedSharedLinkOpen = true;

    if (appState.highlightedEventCard) {
        appState.highlightedEventCard.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
    }
};

const loadEventTypes = async () => {
    const container = document.getElementById('event-types-content');
    container.innerHTML = '';

    const sections = EVENT_TYPES.map((eventType) => {
        const statusId = `event-type-${eventType.slug}`;
        const section = document.createElement('article');
        section.className = 'event-type-section';
        section.innerHTML = `
            <h3>${escapeHtml(eventType.name)}</h3>
            <div class="endpoint-info">
                <code>${escapeHtml(`${API_BASE_URL}eventTypes/${eventType.slug}.min.json`)}</code>
                <span class="status loading" id="${statusId}-status">Syncing...</span>
            </div>
            <div id="${statusId}-content" class="content-grid">
                <div class="loading-state">Syncing records...</div>
            </div>
        `;

        container.appendChild(section);
        return { ...eventType, statusId };
    });

    await Promise.all(sections.map(async (sectionInfo) => {
        const contentId = `${sectionInfo.statusId}-content`;
        const content = document.getElementById(contentId);

        try {
            const data = await fetchData(`eventTypes/${sectionInfo.slug}.min.json`);
            if (!Array.isArray(data) || data.length === 0) {
                renderEmpty(content, 'No events of this type.');
                updateStatus(sectionInfo.statusId, 'success', '0');
                return;
            }

            appendCards(content, [data[0]], (event) => renderEvent(event, {
                includeShareActions: false,
                canHighlightShared: false
            }));
            updateStatus(sectionInfo.statusId, 'success', `${data.length}`);
        } catch (error) {
            updateStatus(sectionInfo.statusId, 'error');
            renderError(content, `Error: ${error.message}`);
        }
    }));
};

const setHeroStats = (stats) => {
    const mappings = [
        ['hero-events', stats.events],
        ['hero-raids', stats.raids],
        ['hero-research', stats.research],
        ['hero-shinies', stats.shinies]
    ];

    mappings.forEach(([id, value]) => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = formatNumber(value);
        }
    });
};

const loadUnifiedData = async () => {
    const container = document.getElementById('unified-content');
    updateStatus('unified', 'loading');
    renderLoading(container);

    try {
        const data = await fetchData('unified.min.json');
        container.innerHTML = '';

        const stats = [
            { label: 'Events', value: data.events?.length || 0 },
            { label: 'Raids', value: data.raids?.length || 0 },
            { label: 'Research', value: data.research?.length || 0 },
            { label: 'Eggs', value: data.eggs?.length || 0 },
            { label: 'Rocket Lineups', value: data.rocketLineups?.length || 0 },
            { label: 'Shinies', value: data.shinies?.length || 0 }
        ];

        const summary = document.createElement('div');
        summary.className = 'data-summary';

        stats.forEach((stat) => {
            const card = document.createElement('article');
            card.className = 'summary-card';
            card.innerHTML = `
                <div class="number">${formatNumber(stat.value)}</div>
                <div class="label">${escapeHtml(stat.label)}</div>
            `;
            summary.appendChild(card);
        });

        container.appendChild(summary);

        if (data.indices) {
            const indicesBlock = document.createElement('section');
            indicesBlock.className = 'code-block';

            const title = document.createElement('h3');
            title.textContent = 'Available Indices';

            const pre = document.createElement('pre');
            pre.textContent = JSON.stringify(data.indices, null, 2);

            indicesBlock.appendChild(title);
            indicesBlock.appendChild(pre);
            container.appendChild(indicesBlock);
        }

        setHeroStats({
            events: data.events?.length || 0,
            raids: data.raids?.length || 0,
            research: data.research?.length || 0,
            shinies: data.shinies?.length || 0
        });

        updateStatus('unified', 'success', `${Object.keys(data).length} groups`);
    } catch (error) {
        updateStatus('unified', 'error');
        renderError(container, `Error loading unified.min.json: ${error.message}`);
    }
};

const initialize = async () => {
    setupEventShareHandlers();

    await Promise.all([
        loadDataset({
            statusId: 'events',
            endpoint: 'events.min.json',
            containerId: 'events-content',
            limit: LIMITS.events,
            renderer: renderEvent,
            emptyMessage: 'No events found.',
            selectRecords: (events) => selectEventsForDisplay(events, LIMITS.events)
        }),
        loadDataset({
            statusId: 'raids',
            endpoint: 'raids.min.json',
            containerId: 'raids-content',
            limit: LIMITS.raids,
            renderer: renderRaid,
            emptyMessage: 'No raids found.'
        }),
        loadDataset({
            statusId: 'research',
            endpoint: 'research.min.json',
            containerId: 'research-content',
            limit: LIMITS.research,
            renderer: renderResearch,
            emptyMessage: 'No research found.'
        }),
        loadDataset({
            statusId: 'eggs',
            endpoint: 'eggs.min.json',
            containerId: 'eggs-content',
            limit: LIMITS.eggs,
            renderer: renderEgg,
            emptyMessage: 'No egg data found.'
        }),
        loadDataset({
            statusId: 'rocket',
            endpoint: 'rocketLineups.min.json',
            containerId: 'rocket-content',
            limit: LIMITS.rocket,
            renderer: renderRocketLineup,
            emptyMessage: 'No rocket lineups found.'
        }),
        loadDataset({
            statusId: 'shinies',
            endpoint: 'shinies.min.json',
            containerId: 'shinies-content',
            limit: LIMITS.shinies,
            renderer: renderShiny,
            emptyMessage: 'No shinies found.'
        }),
        loadEventTypes(),
        loadUnifiedData()
    ]);

    finalizeSharedEventExperience();
    initializeSpotlightEffect();
};

const initializeSpotlightEffect = () => {
    const mainListener = (event) => {
        const card = event.target.closest('.card');
        if (!card) return;

        const rect = card.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
    };

    document.addEventListener('mousemove', mainListener, { passive: true });
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', initialize);
