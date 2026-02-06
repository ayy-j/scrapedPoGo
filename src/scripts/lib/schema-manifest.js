/**
 * Canonical schema/data/doc mapping used by validation and comparison scripts.
 */
module.exports = [
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
