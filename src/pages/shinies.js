/**
 * @fileoverview Shiny Pokemon data scraper for Pokemon GO.
 * Fetches shiny Pokemon information from LeekDuck's data files and
 * cross-references with PogoAssets for image URLs.
 * @module pages/shinies
 */

const fs = require('fs');
const logger = require('../utils/logger');
const { transformUrls } = require('../utils/blobUrls');
const { fetchJson } = require('../utils/scraperUtils');

/**
 * @typedef {Object} ShinyForm
 * @property {string} name - Form name (e.g., "Male", "White Striped")
 * @property {string} image - URL to shiny form image
 * @property {number} imageWidth - Image width in pixels
 * @property {number} imageHeight - Image height in pixels
 */

/**
 * @typedef {Object} ShinyPokemon
 * @property {number} dexNumber - National Pokedex number
 * @property {string} name - Pokemon name with regional prefix if applicable
 * @property {string} image - URL to shiny sprite image
 * @property {string|null} releasedDate - Release date in "YYYY-MM-DD" format or null
 * @property {number|null} family - Evolution family ID or null
 * @property {string|null} region - Regional variant name (e.g., "alolan", "galarian") or null
 * @property {number} imageWidth - Image width in pixels (256)
 * @property {number} imageHeight - Image height in pixels (256)
 * @property {ShinyForm[]} [forms] - Array of alternate forms if applicable
 */

async function scrapeShinies() {
	console.log('Fetching shiny Pokemon data from LeekDuck...');
	
	try {
		// Fetch the JSON data directly from LeekDuck's data files
		const dataUrl = 'https://leekduck.com/shiny/pms.json?v159';
		const namesUrl = 'https://leekduck.com/shiny/name.json?v159';
		
		const [pokemonData, namesData] = await Promise.all([
			fetchJson(dataUrl),
			fetchJson(namesUrl)
		]);

		// Filter for shiny pokemon:
		// - shiny_released === true: explicitly marked as shiny available
		// - released_date without aa_fn/fn/isotope: base form with a shiny release date
		//   (costume/form entries have aa_fn or fn set and their released_date is
		//    just the costume release date, NOT a shiny availability date)
		const shinyPokemon = pokemonData.filter(p =>
			p.shiny_released === true ||
			(p.released_date && !p.aa_fn && !p.fn && !p.isotope)
		);
		
		console.log(`Found ${shinyPokemon.length} shiny Pokemon entries (filtered from ${pokemonData.length} total)`);

		if (shinyPokemon.length === 0) {
			console.warn('No shiny Pokemon found in the data.');
			return [];
		}

		const entries = [];

		// Map type codes to regional names
		const typeMap = {
			'_61': 'Alolan',
			'_31': 'Galarian',
			'_51': 'Hisuian',
			'_52': 'Paldean'
		};
		
		// Map isotope codes to human-readable forms
		const isotopeMap = {
			'_Male': ' (Male)',
			'_Female': ' (Female)',
			'_WS': ' (White Striped)',
			'_RS': ' (Red Striped)',
			'_BS': ' (Blue Striped)',
			'_M': ' (M)', // Mega
			'_G': ' (G)'  // Gigantamax
		};

		for (const pokemon of shinyPokemon) {
			try {
				const dexNumber = pokemon.dex;
				const englishName = namesData[dexNumber]?.en || `Pokemon ${dexNumber}`;
				const typeCode = pokemon.type || null;
				const isotope = pokemon.isotope || null;
				
				// Build image URL based on the pattern from PokeMiners
				let typeFileCode = '00';
				if (typeCode && typeCode.startsWith('_')) {
					typeFileCode = typeCode.substring(1);
				} else if (typeCode) {
					typeFileCode = typeCode;
				}
				
				// If there's an aa_fn (alternative asset filename), extract form code
				if (pokemon.aa_fn) {
					const aaMatch = pokemon.aa_fn.match(/pm(\d+)\.f([A-Z_]+)/);
					if (aaMatch) {
						const formCode = aaMatch[2];
						const formToTypeCode = {
							'MALE': '11',
							'FEMALE': '12',
							'WHITE_STRIPED': '12',
							'RED_STRIPED': '01',
							'BLUE_STRIPED': '02'
						};
						if (formToTypeCode[formCode]) {
							typeFileCode = formToTypeCode[formCode];
						}
					}
				}
				
				let filename = `pokemon_icon_${String(dexNumber).padStart(3, '0')}_${typeFileCode}_shiny.png`;
				let basePath = 'Images/Pokemon%20-%20256x256';
				
				// Known aa_fn forms that don't have shiny variants in PokeMiners
				const nonExistentShinyForms = [
					'fGIGANTAMAX',  // Gigantamax forms generally don't have shinies yet
					'fFALL_2020'     // Fall 2020 costume shiny doesn't exist
				];
				
				// Prefer aa_fn (Addressable Assets format) over fn for custom filenames
				if (pokemon.aa_fn) {
					// aa_fn format: "pm2.cJAN_2020_NOEVOLVE" -> add ".s.icon.png" for shiny
					const aaFormCode = pokemon.aa_fn.split('.')[1]; // Extract form code
					
					// Check if this form has a known non-existent shiny variant
					if (aaFormCode && nonExistentShinyForms.includes(aaFormCode)) {
						console.log(`  Note: ${pokemon.aa_fn} shiny doesn't exist for #${dexNumber}, using base shiny`);
						// Leave filename as default base shiny
					} else {
						filename = `${pokemon.aa_fn}.s.icon.png`;
						basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
					}
				} else if (pokemon.fn) {
					// Legacy fn format - try to convert to aa_fn format
					// fn format: "pm0025_00_pgo_fall2019" -> "pm25.fFALL_2019.s.icon.png"
					// Mapping table for fn suffixes to PokeMiners asset names
					const fnMapping = {
						'fall2019': 'fFALL_2019',
						'movie2020': 'fCOSTUME_2020',
						'4thanniversary': 'fFLYING_5TH_ANNIV',  // Close approximation
						'5thanniversary': 'fFLYING_5TH_ANNIV',
						'winter2020': 'fWINTER_2020',          // Corrected from cWINTER_2018
						'copy2019': 'fCOPY_2019',
						'adventurehat2020': 'fADVENTURE_HAT_2020',
						// Year-only costumes (no underscore in filename)
						'2020': 'f2020',
						'2021': 'f2021',
						'2022': 'f2022',
						// Note: fall2020 shiny doesn't exist in PokeMiners, will fallback to base
						'fall2020': null  // Explicitly mark as non-existent
					};
					
					const fnMatch = pokemon.fn.match(/^pm(\d+)_\d+_pgo_(.+)$/);
					if (fnMatch) {
						const fnDex = parseInt(fnMatch[1], 10);
						const costumeSuffix = fnMatch[2].toLowerCase();
						const mappedName = fnMapping[costumeSuffix];
						
						if (mappedName) {
							filename = `pm${fnDex}.${mappedName}.s.icon.png`;
							basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
						} else if (mappedName === null) {
							// Explicitly null mapping means shiny variant doesn't exist, use base
							console.log(`  Note: ${costumeSuffix} shiny variant doesn't exist for #${fnDex}, using base shiny`);
							// Leave filename as default base shiny
						} else {
							// Try generic conversion: fall2019 -> FALL_2019, use 'f' prefix for forms
							const upperSuffix = costumeSuffix.toUpperCase().replace(/(\d{4})$/, '_$1');
							filename = `pm${fnDex}.f${upperSuffix}.s.icon.png`;
							basePath = 'Images/Pokemon%20-%20256x256/Addressable%20Assets';
						}
					} else {
						// Fallback to old format if can't parse
						filename = `${pokemon.fn}_shiny.png`;
					}
				}
				
				// Build full name with regional prefix
				let fullName = englishName;
				if (typeCode && typeMap[typeCode]) {
					fullName = `${typeMap[typeCode]} ${englishName}`;
				}
				
				// Add isotope suffix (gender, color forms, etc.)
				if (isotope && isotopeMap[isotope]) {
					fullName += isotopeMap[isotope];
				} else if (pokemon.name_suffix) {
					fullName += pokemon.name_suffix;
				} else if (isotope && !isotopeMap[isotope]) {
					fullName += isotope;
				}

				const imageUrl = `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/${basePath}/${filename}`;

				// Convert releasedDate from YYYY/MM/DD to ISO YYYY-MM-DD (zero-padded)
				const rawDate = pokemon.released_date || null;
				const releasedDate = rawDate
					? rawDate.split('/').map((p, i) => i === 0 ? p : p.padStart(2, '0')).join('-')
					: null;

				// Map typeCode to human-readable region name
				const region = (typeCode && typeMap[typeCode]) ? typeMap[typeCode].toLowerCase() : null;

				entries.push({
					dexNumber,
					name: fullName,
					image: imageUrl,
					releasedDate,
					family: pokemon.family || null,
					region,
					imageWidth: 256,
					imageHeight: 256
				});

			} catch (error) {
				console.error(`Error processing pokemon ${pokemon.dex}: ${error.message}`);
			}
		}

		// Group by dex number and combine forms
		const grouped = {};
		for (const entry of entries) {
			const { dexNumber, name, releasedDate, family, region, ...data } = entry;
			
			// Use region as part of grouping key for regional variants
			const groupKey = region ? `${dexNumber}_${region}` : `${dexNumber}`;
			
			if (!grouped[groupKey]) {
				grouped[groupKey] = {
					dexNumber,
					name: name.replace(/[(_][^)_]*[)_]?$/, '').trim(), // Remove form suffix
					releasedDate,
					family,
					region,
					forms: []
				};
			}

			// Check if this is a form variant
			const formMatch = name.match(/(.+?)[(_]([^)_]+)[)]?$/);
			if (formMatch && formMatch[1].trim() !== name.trim()) {
				grouped[groupKey].forms.push({
					name: formMatch[2],
					...data
				});
			} else if (!grouped[groupKey].image) {
				// Base form
				grouped[groupKey] = {
					...grouped[groupKey],
					...data
				};
			}
		}

		const output = Object.values(grouped).sort((a, b) => {
			if (a.dexNumber !== b.dexNumber) return a.dexNumber - b.dexNumber;
			if (!a.region && b.region) return -1;
			if (a.region && !b.region) return 1;
			if (!a.region && !b.region) return 0;
			return a.region.localeCompare(b.region);
		});

		console.log(`Successfully processed ${output.length} unique shiny Pokemon with ${entries.length} total forms`);

		return output;

	} catch (error) {
		console.error('Error fetching shiny data:', error.message);
		throw error;
	}
}

/**
 * Scrapes shiny Pokemon data and writes output files.
 * Matches the get() convention used by other page scrapers.
 * 
 * @async
 * @function get
 * @returns {Promise<void>}
 */
async function get() {
    logger.start('Scraping shiny Pokemon data from PogoAssets...');
    try {
        const data = await scrapeShinies();
        const output = transformUrls(data);
        fs.writeFileSync('data/shinies.min.json', JSON.stringify(output));
        logger.success(`Successfully saved ${output.length} shinies to data/shinies.min.json`);
    } catch (error) {
        logger.error('Failed to scrape shinies:', error.message);
    }
}

module.exports = { get, scrapeShinies };
