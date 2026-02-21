/**
 * Canonical schema/data/doc mapping used by validation and comparison scripts.
 *
 * Each entry maps a dataset to its canonical schema, data file, and documentation.
 * - `dataOptional`: when true, the data file may not exist (periodic event types)
 *
 * `auxiliaryFiles` lists files intentionally not mapped to a schema triplet
 * (e.g. overview pages, combined data) so the coverage check can ignore them.
 */

const eventTypes = [
  { slug: 'community-day', doc: 'CommunityDay' },
  { slug: 'event', doc: 'Event' },
  { slug: 'go-battle-league', doc: 'GoBattleLeague' },
  { slug: 'go-pass', doc: 'GoPass' },
  { slug: 'go-rocket-takeover', doc: 'GoRocketTakeover', dataOptional: true },
  { slug: 'max-battles', doc: 'MaxBattles' },
  { slug: 'max-mondays', doc: 'MaxMondays' },
  { slug: 'pokemon-go-tour', doc: 'PokemonGoTour' },
  { slug: 'pokemon-spotlight-hour', doc: 'PokemonSpotlightHour' },
  { slug: 'pokestop-showcase', doc: 'PokestopShowcase' },
  { slug: 'raid-battles', doc: 'RaidBattles' },
  { slug: 'raid-day', doc: 'RaidDay' },
  { slug: 'raid-hour', doc: 'RaidHour' },
  { slug: 'research', doc: 'Research' },
  { slug: 'research-breakthrough', doc: 'ResearchBreakthrough', dataOptional: true },
  { slug: 'research-day', doc: 'ResearchDay' },
  { slug: 'season', doc: 'Season' },
  { slug: 'special-research', doc: 'SpecialResearch', dataOptional: true },
  { slug: 'team-go-rocket', doc: 'TeamGoRocket', dataOptional: true },
  { slug: 'timed-research', doc: 'TimedResearch', dataOptional: true }
];

const canonicalDatasets = [
  {
    dataset: 'eggs',
    schema: 'schemas/eggs.schema.json',
    data: 'data/eggs.min.json',
    doc: 'dataDocumentation/Eggs.md'
  },
  {
    dataset: 'events',
    schema: 'schemas/events.schema.json',
    data: 'data/events.min.json',
    doc: 'dataDocumentation/Events.md'
  },
  {
    dataset: 'raids',
    schema: 'schemas/raids.schema.json',
    data: 'data/raids.min.json',
    doc: 'dataDocumentation/Raids.md'
  },
  {
    dataset: 'research',
    schema: 'schemas/research.schema.json',
    data: 'data/research.min.json',
    doc: 'dataDocumentation/Research.md'
  },
  {
    dataset: 'rocketLineups',
    schema: 'schemas/rocketLineups.schema.json',
    data: 'data/rocketLineups.min.json',
    doc: 'dataDocumentation/RocketLineups.md'
  },
  {
    dataset: 'shinies',
    schema: 'schemas/shinies.schema.json',
    data: 'data/shinies.min.json',
    doc: 'dataDocumentation/Shinies.md'
  }
];

const eventTypeEntries = eventTypes.map((et) => ({
  dataset: `events:${et.slug}`,
  schema: 'schemas/events.schema.json',
  data: `data/eventTypes/${et.slug}.min.json`,
  doc: `dataDocumentation/eventTypes/${et.doc}.md`,
  dataOptional: et.dataOptional || false
}));

const auxiliaryFiles = [
  'dataDocumentation/API.md',
  'dataDocumentation/Endpoints.md'
];

module.exports = [...canonicalDatasets, ...eventTypeEntries];
module.exports.auxiliaryFiles = auxiliaryFiles;
