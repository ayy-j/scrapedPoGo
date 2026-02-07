import Image from "next/image";
import type { Pokemon } from "@/lib/data";
import styles from "./PokemonCard.module.css";

interface Props {
  pokemon: Pokemon;
  compact?: boolean;
}

export default function PokemonCard({ pokemon, compact }: Props) {
  const size = compact ? 56 : 80;

  return (
    <div className={`${styles.card} ${compact ? styles.compact : ""}`}>
      {pokemon.canBeShiny && <span className={styles.shiny} title="Can be Shiny">✨</span>}
      <div className={styles.imageWrap}>
        <Image
          src={pokemon.image}
          alt={pokemon.name}
          width={size}
          height={size}
          quality={75}
        />
      </div>
      <span className={styles.name} title={pokemon.name}>
        {pokemon.name}
      </span>
      {pokemon.dexNumber != null && (
        <span className={styles.dex}>#{pokemon.dexNumber}</span>
      )}
      {pokemon.source && !compact && (
        <span className={styles.source}>{pokemon.source}</span>
      )}
    </div>
  );
}
