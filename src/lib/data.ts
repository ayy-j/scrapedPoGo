import fs from "fs";
import path from "path";

/* ------------------------------------------------------------------ */
/*  TypeScript interfaces matching schemas/events.schema.json          */
/* ------------------------------------------------------------------ */

export interface Pokemon {
  name: string;
  image: string;
  source?: string;
  canBeShiny?: boolean;
  dexNumber?: number | null;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
}

export interface Bonus {
  text: string;
  image?: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  multiplier?: number;
  bonusType?: string;
}

export interface CustomSection {
  paragraphs: string[];
  lists: string[][];
  pokemon: Pokemon[];
  tables: string[][][];
}

export interface League {
  name: string;
  cpLimit?: number;
  cpCap?: number;
  typeRestrictions?: string[];
  rules?: string[];
  [key: string]: unknown;
}

export interface Battle {
  leagues: League[];
  [key: string]: unknown;
}

export interface RaidBoss {
  name: string;
  image: string;
  tier?: string;
  canBeShiny?: boolean;
  dexNumber?: number | null;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
}

export interface EggPokemon {
  name: string;
  image: string;
  canBeShiny?: boolean;
  dexNumber?: number | null;
  rarity?: number;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
}

export type EggPool = Record<string, EggPokemon[]>;

export interface PoGoEvent {
  eventID: string;
  name: string;
  eventType: string;
  heading: string;
  image: string;
  imageWidth?: number;
  imageHeight?: number;
  imageType?: string;
  start: string;
  end: string;
  isGlobal?: boolean;
  eventStatus?: "upcoming" | "active" | "ended";

  /* feature flags */
  hasSpawns?: boolean;
  hasFieldResearchTasks?: boolean;
  hasBonuses?: boolean;
  hasRaids?: boolean;
  hasEggs?: boolean;
  hasShiny?: boolean;

  /* nested data */
  pokemon?: Pokemon[];
  bonuses?: (string | Bonus)[];
  raids?: RaidBoss[];
  eggs?: EggPokemon[] | EggPool;
  research?: unknown;
  shinies?: Pokemon[];
  customSections?: Record<string, CustomSection>;
  battle?: Battle;
  leagues?: League[];
  bonusDisclaimers?: string[];

  /* catch-all for type-specific fields */
  [key: string]: unknown;
}

/* ------------------------------------------------------------------ */
/*  Data reading helpers (server-only, runs at build time)             */
/* ------------------------------------------------------------------ */

const DATA_DIR = path.join(process.cwd(), "data");

function readJSON<T>(filePath: string): T {
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/** All events sorted: active first, then upcoming, then ended (by date) */
export function getEvents(): PoGoEvent[] {
  const events = readJSON<PoGoEvent[]>(path.join(DATA_DIR, "events.min.json"));

  const statusOrder: Record<string, number> = {
    active: 0,
    upcoming: 1,
    ended: 2,
  };

  return events.sort((a, b) => {
    const sa = statusOrder[a.eventStatus ?? "ended"] ?? 3;
    const sb = statusOrder[b.eventStatus ?? "ended"] ?? 3;
    if (sa !== sb) return sa - sb;
    // Within same status: upcoming → earliest first, ended → latest first
    if (a.eventStatus === "ended") {
      return new Date(b.end).getTime() - new Date(a.end).getTime();
    }
    return new Date(a.start).getTime() - new Date(b.start).getTime();
  });
}

export function getEventById(eventID: string): PoGoEvent | undefined {
  const events = readJSON<PoGoEvent[]>(path.join(DATA_DIR, "events.min.json"));
  return events.find((e) => e.eventID === eventID);
}

export function getEventsByStatus(
  status: "upcoming" | "active" | "ended"
): PoGoEvent[] {
  return getEvents().filter((e) => e.eventStatus === status);
}

export function getEventsByType(eventType: string): PoGoEvent[] {
  return getEvents().filter((e) => e.eventType === eventType);
}

/** Unique event types present in the data */
export function getEventTypes(): string[] {
  const events = readJSON<PoGoEvent[]>(path.join(DATA_DIR, "events.min.json"));
  return [...new Set(events.map((e) => e.eventType))].sort();
}
