/**
 * @fileoverview Helpers for canonicalizing external image URLs and generating
 * clear, deterministic Vercel Blob pathnames.
 *
 * Goals:
 * - Organize by CONTENT TYPE (pokemon, events, types, weather, etc.)
 * - No upstream source names (no "leekduck", "pokeminers", etc.)
 * - Stable and deterministic keys
 * - Avoid collisions
 */

const crypto = require('crypto');

let cachedDexToNameMap = null;
let cachedNameToDexMap = null;

/**
 * @param {string} str
 * @returns {string}
 */
function shortHash(str) {
    return crypto.createHash('sha1').update(String(str)).digest('hex').slice(0, 8);
}

/**
 * Make a string safe for use as a single pathname segment.
 * @param {string} seg
 * @returns {string}
 */
function sanitizeSegment(seg) {
    return String(seg)
        .replace(/\s+/g, '_')
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
        .replace(/^_+|_+$/g, '');
}

/**
 * Load dex -> Pokemon name map from local data.
 * @returns {Map<string, string>}
 */
function loadDexToNameMap() {
    if (cachedDexToNameMap) return cachedDexToNameMap;
    const map = new Map();
    try {
        const entries = require('../../data/shinies.min.json');
        if (Array.isArray(entries)) {
            for (const entry of entries) {
                if (!entry || entry.dexNumber == null || !entry.name) continue;
                const dex = String(entry.dexNumber).padStart(3, '0');
                if (!map.has(dex)) {
                    map.set(dex, entry.name);
                }
            }
        }
    } catch {
        // Ignore load errors; fallback will omit name from path.
    }

    const overrides = {
        '679': 'Honedge',
        '680': 'Doublade',
        '681': 'Aegislash',
        '701': 'Hawlucha',
        '718': 'Zygarde',
        '719': 'Diancie',
        '720': 'Hoopa',
        '721': 'Volcanion',
        '746': 'Wishiwashi',
        '778': 'Mimikyu',
        '789': 'Cosmog',
        '790': 'Cosmoem',
        '791': 'Solgaleo',
        '792': 'Lunala',
        '813': 'Scorbunny',
        '816': 'Sobble',
        '835': 'Yamper',
        '850': 'Sizzlipede',
    };

    for (const [dex, name] of Object.entries(overrides)) {
        const normalizedDex = String(dex).padStart(3, '0');
        if (!map.has(normalizedDex)) {
            map.set(normalizedDex, name);
        }
    }

    cachedDexToNameMap = map;
    return map;
}

/**
 * Load pokemon name slug -> dex map from local data.
 * @returns {Map<string, string>}
 */
function loadNameToDexMap() {
    if (cachedNameToDexMap) return cachedNameToDexMap;
    const map = new Map();
    const dexToName = loadDexToNameMap();
    for (const [dex, name] of dexToName.entries()) {
        const slug = slugifyPokemonName(name);
        if (slug && !map.has(slug)) {
            map.set(slug, dex);
        }
    }
    cachedNameToDexMap = map;
    return map;
}

/**
 * Convert a Pokemon name to a safe, URL-friendly slug.
 * @param {string} name
 * @returns {string}
 */
function slugifyPokemonName(name) {
    if (!name) return '';
    const normalized = String(name)
        .replace(/[♀]/g, ' female ')
        .replace(/[♂]/g, ' male ')
        .replace(/[’'`]/g, '')
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();

    return normalized
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Lookup a Pokemon name by dex string.
 * @param {string} dex
 * @returns {string}
 */
function getPokemonNameByDex(dex) {
    const map = loadDexToNameMap();
    return map.get(String(dex).padStart(3, '0')) || '';
}

/**
 * Lookup a Pokemon dex by a name string.
 * @param {string} name
 * @returns {string}
 */
function getPokemonDexByName(name) {
    const map = loadNameToDexMap();
    const slug = slugifyPokemonName(name);
    return map.get(slug) || '';
}

/**
 * Try to derive a dex number from a name-based filename.
 * @param {string} filename
 * @returns {string}
 */
function parseDexFromNameFilename(filename) {
    const base = String(filename).replace(/\.[^.]+$/, '');
    const firstToken = base.split(/[_-]/)[0];
    if (!firstToken) return '';
    return getPokemonDexByName(firstToken);
}

/**
 * Normalize different upstream sources that point to the same underlying assets.
 * Strips query/hash fragments for canonicalization.
 *
 * @param {string} externalUrl
 * @returns {string} canonical URL string (or the original string if parsing fails)
 */
function canonicalizeExternalImageUrl(externalUrl) {
    if (typeof externalUrl !== 'string' || externalUrl.length === 0) return externalUrl;

    let u;
    try {
        u = new URL(externalUrl);
    } catch {
        return externalUrl;
    }

    // Strip hash/query for canonicalization.
    u.hash = '';
    u.search = '';

    // Canonicalize GitHub raw -> jsDelivr for pogo_assets.
    if (u.hostname === 'raw.githubusercontent.com') {
        const parts = u.pathname.split('/').filter(Boolean);
        if (parts.length >= 5) {
            const [owner, repo, branch] = parts;
            if (repo === 'pogo_assets' && branch === 'master') {
                const rest = parts.slice(3).join('/');
                return `https://cdn.jsdelivr.net/gh/${owner}/${repo}/${rest}`;
            }
        }
    }

    return u.toString();
}

/**
 * Extract the filename from a URL path.
 * @param {string} pathname
 * @returns {string}
 */
function getFilename(pathname) {
    const decoded = decodeURIComponent(String(pathname || ''));
    const parts = decoded.split('/').filter(Boolean);
    return parts.length > 0 ? sanitizeSegment(parts[parts.length - 1]) : '';
}

/**
 * Parse Pokemon dex number from various filename formats.
 * @param {string} filename
 * @returns {string|null} Dex number like "001" or null
 */
function parseDexNumber(filename) {
    // pokemon_icon_001_00.png -> 001
    const match1 = filename.match(/pokemon_icon_(\d{3,4})(?:_|\.|$)/i);
    if (match1) return match1[1].padStart(3, '0');

    // pm155.icon.png -> 155
    const match2 = filename.match(/^pm(\d+)\./i);
    if (match2) return match2[1].padStart(3, '0');

    return null;
}

/**
 * Convert a (canonical) external image URL into a semantic blob pathname.
 *
 * Structure is organized by content type:
 * - pokemon/<dex>/<filename>     - Pokemon sprites/icons
 * - events/<year>/<slug>         - Event banners
 * - types/<type>.png             - Type icons
 * - weather/<weather>.png        - Weather icons
 * - bonuses/<bonus>.png          - Bonus icons
 * - ui/<category>/<file>         - UI elements
 * - misc/<hash>/<file>           - Anything else
 *
 * @param {string} externalUrl
 * @returns {string} blob pathname
 */
function externalUrlToBlobPathname(externalUrl) {
    let u;
    try {
        u = new URL(externalUrl);
    } catch {
        return `misc/${shortHash(externalUrl)}/invalid.bin`;
    }

    const pathname = decodeURIComponent(u.pathname);
    const pathLower = pathname.toLowerCase();
    const filename = getFilename(pathname);
    const filenameLower = filename.toLowerCase();

    // Type icons (check early - very specific path)
    if (pathLower.includes('/types/') || pathLower.includes('/type/')) {
        return `types/${filename}`;
    }

    // Weather icons
    if (pathLower.includes('/weather/')) {
        return `weather/${filename}`;
    }

    // Bonus icons
    if (pathLower.includes('/bonuses/') || pathLower.includes('/bonus/')) {
        return `bonuses/${filename}`;
    }

    // Event banners/images (check BEFORE pokemon - events path is more specific)
    if (pathLower.includes('/events/') || pathLower.includes('/event/')) {
        // Try to extract year from path like /2026/ or /2025-12-/
        const yearMatch = pathname.match(/\/(\d{4})[-\/]/);
        const year = yearMatch ? yearMatch[1] : 'misc';
        
        // Try to get a slug from the path (folder name before filename)
        const parts = pathname.split('/').filter(Boolean);
        let slug = '';
        if (parts.length >= 2) {
            // Get the parent folder as slug
            const parent = parts[parts.length - 2];
            if (parent && !parent.match(/^\d{4}$/) && parent !== 'article-images') {
                slug = sanitizeSegment(parent);
            }
        }
        
        let eventFilename = filename;
        if (slug) {
            const extIndex = filename.lastIndexOf('.');
            const ext = extIndex >= 0 ? filename.slice(extIndex) : '';
            eventFilename = `${slug}${ext}`;
        } else if (year !== 'misc' && filename) {
            eventFilename = `${year}-${filename}`;
        }

        if (!eventFilename) {
            eventFilename = `${year}-${shortHash(externalUrl)}.bin`;
        }

        return `events/${eventFilename}`;
    }

    // Pokemon icons/sprites - check filename patterns specifically
    // (not just "pokemon" in path, which catches event names)
    const isPokemonIcon = 
        filenameLower.match(/^pm\d+\./) ||                    // pm155.icon.png
        filenameLower.match(/pokemon_icon_\d/) ||             // pokemon_icon_001_00.png
        pathLower.includes('/pokemon_icons') ||               // .../pokemon_icons/...
        pathLower.includes('/pokemon/pokemon_icon') ||        // .../Pokemon/pokemon_icon_...
        (pathLower.includes('/pokemon/') && !pathLower.includes('/events/'));

    if (isPokemonIcon) {
        const dex = parseDexNumber(filename);
        let resolvedDex = dex;
        if (!resolvedDex) {
            resolvedDex = parseDexFromNameFilename(filename);
        }

        if (resolvedDex) {
            const name = getPokemonNameByDex(resolvedDex);
            const slug = slugifyPokemonName(name);
            if (slug) {
                return `pokemon/${resolvedDex}-${slug}/${filename}`;
            }
            return `pokemon/${resolvedDex}/${filename}`;
        }
        // Pokemon without parseable dex number
        return `pokemon/misc/${filename}`;
    }

    // Egg icons
    if (pathLower.includes('/egg')) {
        return `eggs/${filename}`;
    }

    // Raid icons
    if (pathLower.includes('/raid')) {
        return `raids/${filename}`;
    }

    // Items
    if (pathLower.includes('/item') || pathLower.includes('/items/')) {
        return `items/${filename}`;
    }

    // Stickers
    if (pathLower.includes('/sticker')) {
        return `stickers/${filename}`;
    }

    // Misc/fallback - use a short hash of the URL for grouping
    if (!filename) {
        return `misc/${shortHash(externalUrl)}.bin`;
    }
    return `misc/${filename}`;
}

module.exports = {
    canonicalizeExternalImageUrl,
    externalUrlToBlobPathname,
};
