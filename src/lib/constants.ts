/** Event type → accent color mapping from ponyalpha.md §4 */
export const EVENT_TYPE_COLORS: Record<string, string> = {
  season: "#9C27B0",
  event: "#FF9800",
  "raid-battles": "#FF5722",
  "community-day": "#FF9800",
  "go-battle-league": "#673AB7",
  "pokemon-go-tour": "#E91E63",
  "max-battles": "#00BCD4",
  "max-mondays": "#00BCD4",
  "pokemon-spotlight-hour": "#FFC107",
  "raid-hour": "#FF5722",
  "raid-day": "#FF5722",
  "go-pass": "#4CAF50",
  "pokestop-showcase": "#795548",
  "research-day": "#009688",
  research: "#009688",
  "research-breakthrough": "#009688",
  "special-research": "#009688",
  "timed-research": "#009688",
  "go-rocket-takeover": "#424242",
  "team-go-rocket": "#424242",
};

/** Human-readable labels for event types */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  season: "Season",
  event: "Event",
  "raid-battles": "Raid Battles",
  "community-day": "Community Day",
  "go-battle-league": "GO Battle League",
  "pokemon-go-tour": "Pokémon GO Tour",
  "max-battles": "Max Battles",
  "max-mondays": "Max Mondays",
  "pokemon-spotlight-hour": "Spotlight Hour",
  "raid-hour": "Raid Hour",
  "raid-day": "Raid Day",
  "go-pass": "GO Pass",
  "pokestop-showcase": "PokéStop Showcase",
  "research-day": "Research Day",
  research: "Research",
  "research-breakthrough": "Research Breakthrough",
  "special-research": "Special Research",
  "timed-research": "Timed Research",
  "go-rocket-takeover": "GO Rocket Takeover",
  "team-go-rocket": "Team GO Rocket",
};

/** Status → color mapping from ponyalpha.md §4 */
export const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  active: { bg: "#E8F5E9", text: "#2E7D32", border: "#2E7D32" },
  upcoming: { bg: "#E3F2FD", text: "#1565C0", border: "#1565C0" },
  ended: { bg: "#F5F5F5", text: "#757575", border: "#757575" },
};
