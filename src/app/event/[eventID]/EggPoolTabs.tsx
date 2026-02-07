"use client";

import { useState } from "react";
import type { EggPokemon } from "@/lib/data";
import PokemonCard from "@/components/PokemonCard";
import styles from "./page.module.css";

interface Props {
  eggs: Record<string, EggPokemon[]>;
}

export default function EggPoolTabs({ eggs }: Props) {
  const tiers = Object.keys(eggs).sort((a, b) => {
    const numA = parseInt(a) || 99;
    const numB = parseInt(b) || 99;
    return numA - numB;
  });

  const [active, setActive] = useState(tiers[0] ?? "");

  if (tiers.length === 0) return null;

  return (
    <div>
      <div className={styles.eggTabs}>
        {tiers.map((tier) => (
          <button
            key={tier}
            className={`${styles.eggTab} ${active === tier ? styles.eggTabActive : ""}`}
            onClick={() => setActive(tier)}
          >
            {tier} ({eggs[tier].length})
          </button>
        ))}
      </div>
      {active && eggs[active] && (
        <div className={styles.pokemonGrid}>
          {eggs[active].map((p, i) => (
            <PokemonCard
              key={`${p.name}-${i}`}
              pokemon={{ ...p, source: undefined }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
