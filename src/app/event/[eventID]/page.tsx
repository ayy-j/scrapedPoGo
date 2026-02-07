import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  getEvents,
  getEventById,
  type PoGoEvent,
  type Pokemon,
  type RaidBoss,
  type EggPool,
  type EggPokemon,
  type League,
} from "@/lib/data";
import { formatSectionTitle } from "@/lib/format";
import StatusBadge from "@/components/StatusBadge";
import EventTypeBadge from "@/components/EventTypeBadge";
import TimeDisplay from "@/components/TimeDisplay";
import BonusChip from "@/components/BonusChip";
import PokemonCard from "@/components/PokemonCard";
import SectionExpander from "@/components/SectionExpander";
import CustomSectionRenderer from "@/components/CustomSectionRenderer";
import EggPoolTabs from "./EggPoolTabs";
import styles from "./page.module.css";

/* ------------------------------------------------------------------ */
/*  Static params for pre-rendering all event pages                    */
/* ------------------------------------------------------------------ */

export async function generateStaticParams() {
  const events = getEvents();
  return events.map((e) => ({ eventID: e.eventID }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ eventID: string }>;
}): Promise<Metadata> {
  const { eventID } = await params;
  const event = getEventById(eventID);
  if (!event) return { title: "Event Not Found" };

  return {
    title: `${event.name} — Pokémon GO Events`,
    description: `${event.heading} · ${event.eventType}`,
    openGraph: {
      images: [{ url: event.image }],
    },
  };
}

/* ------------------------------------------------------------------ */
/*  Page component                                                     */
/* ------------------------------------------------------------------ */

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventID: string }>;
}) {
  const { eventID } = await params;
  const event = getEventById(eventID);
  if (!event) notFound();

  const status = event.eventStatus ?? "ended";
  const aspectRatio =
    event.imageWidth && event.imageHeight
      ? event.imageWidth / event.imageHeight
      : 16 / 9;

  // Determine if eggs are keyed by distance (object) or flat array
  const isEggPool =
    event.eggs && !Array.isArray(event.eggs) && typeof event.eggs === "object";
  const eggPool = isEggPool ? (event.eggs as EggPool) : null;
  const eggList =
    event.eggs && Array.isArray(event.eggs)
      ? (event.eggs as EggPokemon[])
      : null;

  // Leagues from battle.leagues or top-level leagues
  const leagues: League[] =
    event.battle?.leagues ?? event.leagues ?? [];

  return (
    <div className={styles.page}>
      {/* Back link */}
      <Link href="/" className={styles.back}>
        ← All Events
      </Link>

      {/* Hero banner */}
      <div
        className={styles.hero}
        style={{ aspectRatio: String(aspectRatio) }}
      >
        <Image
          src={event.image}
          alt={event.name}
          fill
          sizes="(max-width: 960px) 100vw, 960px"
          priority
        />
      </div>

      {/* Identity */}
      <div className={styles.identity}>
        <h1 className={styles.title}>{event.name}</h1>
        <div className={styles.badges}>
          <EventTypeBadge eventType={event.eventType} />
          <StatusBadge status={status} />
        </div>
      </div>

      {/* Time display */}
      <TimeDisplay
        start={event.start}
        end={event.end}
        isGlobal={event.isGlobal}
        status={status}
      />

      {/* Bonuses */}
      {event.bonuses && event.bonuses.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Bonuses</h2>
          <div className={styles.bonusGrid}>
            {event.bonuses.map((b, i) => (
              <BonusChip key={i} bonus={b} />
            ))}
          </div>
        </section>
      )}

      {/* Featured Pokemon */}
      {event.pokemon && event.pokemon.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Featured Pokémon</h2>
          <div className={styles.pokemonGrid}>
            {event.pokemon.map((p: Pokemon, i) => (
              <PokemonCard key={`${p.name}-${i}`} pokemon={p} />
            ))}
          </div>
        </section>
      )}

      {/* Shinies */}
      {event.shinies && event.shinies.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Shiny Pokémon</h2>
          <div className={styles.pokemonGrid}>
            {event.shinies.map((p: Pokemon, i) => (
              <PokemonCard key={`shiny-${p.name}-${i}`} pokemon={p} compact />
            ))}
          </div>
        </section>
      )}

      {/* Raids */}
      {event.raids && event.raids.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Raid Bosses</h2>
          <div className={styles.raidGrid}>
            {event.raids.map((r: RaidBoss, i) => (
              <div key={`raid-${r.name}-${i}`} className={styles.raidCard}>
                {r.canBeShiny && (
                  <span className={styles.raidShiny} title="Can be Shiny">
                    ✨
                  </span>
                )}
                <div className={styles.raidImageWrap}>
                  <Image
                    src={r.image}
                    alt={r.name}
                    width={80}
                    height={80}
                    quality={75}
                  />
                </div>
                <span className={styles.raidName}>{r.name}</span>
                {r.tier && <span className={styles.raidTier}>{r.tier}</span>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Eggs — tabbed pool or flat list */}
      {eggPool && Object.keys(eggPool).length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Egg Pools</h2>
          <EggPoolTabs eggs={eggPool} />
        </section>
      )}
      {eggList && eggList.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Egg Hatches</h2>
          <div className={styles.pokemonGrid}>
            {eggList.map((p, i) => (
              <PokemonCard
                key={`egg-${p.name}-${i}`}
                pokemon={{ ...p, source: undefined }}
                compact
              />
            ))}
          </div>
        </section>
      )}

      {/* GO Battle League */}
      {leagues.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>GO Battle League</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {leagues.map((l, i) => (
              <div key={i} className={styles.leagueCard}>
                <span className={styles.leagueName}>{l.name}</span>
                {(l.cpLimit || l.cpCap) && (
                  <span className={styles.leagueMeta}>
                    CP Cap: {(l.cpLimit ?? l.cpCap)?.toLocaleString()}
                  </span>
                )}
                {l.typeRestrictions && l.typeRestrictions.length > 0 && (
                  <span className={styles.leagueMeta}>
                    Types: {l.typeRestrictions.join(", ")}
                  </span>
                )}
                {l.rules && l.rules.length > 0 && (
                  <ul style={{ paddingLeft: 20, margin: 0 }}>
                    {l.rules.map((r, ri) => (
                      <li
                        key={ri}
                        className={styles.leagueMeta}
                        style={{ marginBottom: 2 }}
                      >
                        {r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Custom Sections */}
      {event.customSections &&
        Object.keys(event.customSections).length > 0 && (
          <section className={styles.customSections}>
            {Object.entries(event.customSections).map(([key, section]) => (
              <SectionExpander key={key} title={formatSectionTitle(key)}>
                <CustomSectionRenderer section={section} />
              </SectionExpander>
            ))}
          </section>
        )}

      {/* Bonus disclaimers */}
      {event.bonusDisclaimers && event.bonusDisclaimers.length > 0 && (
        <div className={styles.disclaimers}>
          {event.bonusDisclaimers.map((d, i) => (
            <p key={i}>{d}</p>
          ))}
        </div>
      )}
    </div>
  );
}
