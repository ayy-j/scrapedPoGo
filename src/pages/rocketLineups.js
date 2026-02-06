/**
 * @fileoverview Team GO Rocket lineups page scraper for Pokemon GO data.
 * Scrapes grunt and leader lineup information from LeekDuck including
 * Pokemon teams, types, weaknesses, and catchable shadow Pokemon.
 * @module pages/rocketLineups
 */

const fs = require('fs');
const logger = require('../utils/logger');
const { enrichMissingImageDimensions } = require('../utils/imageDimensions');
const { fetchJson, getJSDOM } = require('../utils/scraperUtils');
const { transformUrls } = require('../utils/blobUrls');

/**
 * @typedef {Object} WeaknessInfo
 * @property {string[]} double - Types this Pokemon is doubly weak to (4x damage)
 * @property {string[]} single - Types this Pokemon is weak to (2x damage)
 */

/**
 * @typedef {Object} ShadowPokemon
 * @property {string} name - Pokemon name
 * @property {string} image - URL to Pokemon image
 * @property {string[]} types - Array of Pokemon types in lowercase
 * @property {WeaknessInfo} weaknesses - Type weaknesses organized by severity
 * @property {boolean} isEncounter - Whether this Pokemon can be caught after battle
 * @property {boolean} canBeShiny - Whether the shadow form can be shiny
 */

/**
 * @typedef {Object} RocketLineup
 * @property {string} name - Trainer name (e.g., "Giovanni", "Cliff", or grunt type)
 * @property {string} title - Display title (e.g., "Team GO Rocket Leader")
 * @property {string} type - Grunt type for typed grunts (e.g., "fire", "water") or empty
 * @property {ShadowPokemon[][]} slots - Possible Pokemon per slot (3 slots, each an array of possible Pokemon)
 */

/**
 * Scrapes Team GO Rocket lineup data from LeekDuck and writes to data files.
 * 
 * Fetches the rocket lineups page, parses all grunt and leader profiles,
 * extracts Pokemon slots with their types and weaknesses, and identifies
 * which Pokemon can be caught after defeating the trainer.
 * 
 * @async
 * @function get
 * @returns {Promise<void>} Resolves when data has been written to files
 * @throws {Error} On network failure, falls back to cached CDN data
 * 
 * @example
 * // Scrape rocket lineups data
 * const rocketLineups = require('./pages/rocketLineups');
 * await rocketLineups.get();
 * // Creates data/rocketLineups.json and data/rocketLineups.min.json
 */
async function get() {
    logger.info("Scraping rocket lineups...");
    try {
        try {
            const dom = await getJSDOM("https://leekduck.com/rocket-lineups/");
            const lineups = [];
            
            const rocketProfiles = dom.window.document.querySelectorAll('.rocket-profile');
            
            rocketProfiles.forEach(profile => {
                let lineup = {
                    name: "",
                    title: "",
                    type: "",
                    slots: [[], [], []]
                };

                let nameElement = profile.querySelector('.name');
                let titleElement = profile.querySelector('.title');
                let typeElement = profile.querySelector('.type img');
                
                lineup.name = nameElement ? nameElement.textContent.replace(/\s+/g, ' ').trim() : ""; // Scraped text contains non-breaking spaces, hence the regex replace
                lineup.title = titleElement ? titleElement.textContent.trim() : ""; 
                lineup.type = typeElement ? typeElement.src.replace('.png', '').split('/').pop().toLowerCase() : "";

                let slots = profile.querySelectorAll('.slot');
                
                slots.forEach((slot, index) => {
                    let slotNumber = index + 1;
                    
                    let shadowPokemons = slot.querySelectorAll('.shadow-pokemon');
                    let pokemonList = [];
                    
                    shadowPokemons.forEach(shadowPokemon => {
                        let pokemon = {
                            name: "",
                            image: "",
                            types: [],
                            weaknesses: {
                                double: [],
                                single: []
                            },
                            isEncounter: false,
                            canBeShiny: false
                        };
                        
                        pokemon.name = shadowPokemon.getAttribute('data-pokemon') || "";
                        
                        let imageElement = shadowPokemon.querySelector('.pokemon-image');
                        pokemon.image = imageElement ? imageElement.src : "";
                        
                        let type1 = shadowPokemon.getAttribute('data-type1');
                        let type2 = shadowPokemon.getAttribute('data-type2');
                        
                        if (type1 && type1 !== "None") {
                            pokemon.types.push(type1.toLowerCase());
                        }
                        if (type2 && type2 !== "None") {
                            pokemon.types.push(type2.toLowerCase());
                        }

                        // Parse weaknesses from data attributes
                        let doubleWeaknesses = shadowPokemon.getAttribute('data-double-weaknesses');
                        let singleWeaknesses = shadowPokemon.getAttribute('data-single-weaknesses');
                        
                        if (doubleWeaknesses && doubleWeaknesses.trim()) {
                            pokemon.weaknesses.double = doubleWeaknesses.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                        }
                        if (singleWeaknesses && singleWeaknesses.trim()) {
                            pokemon.weaknesses.single = singleWeaknesses.split(',').map(w => w.trim().toLowerCase()).filter(w => w);
                        }

                        pokemon.isEncounter = slot.classList.contains('encounter');
                        pokemon.canBeShiny = shadowPokemon.querySelector('.shiny-icon') != null;

                        pokemonList.push(pokemon);
                    });
                    
                    lineup.slots[index] = pokemonList;

                });
                
                lineups.push(lineup);
            });

            // Populate image dimensions for all slot Pokemon.
            await enrichMissingImageDimensions(lineups);

            await fs.promises.writeFile('data/rocketLineups.min.json', JSON.stringify(transformUrls(lineups)));
            logger.success("Rocket lineups saved.");
        } catch (_err) {
            logger.error(_err);

            const json = await fetchJson("https://cdn.jsdelivr.net/gh/quantNebula/scrapedPoGo@main/data/rocketLineups.min.json");

            await fs.promises.writeFile('data/rocketLineups.min.json', JSON.stringify(transformUrls(json)));
            logger.success("Rocket lineups saved (fallback).");
        }
    } catch (error) {
        logger.error(error.message);
    }
}

module.exports = { get }
