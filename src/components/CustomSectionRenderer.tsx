import type { CustomSection, Pokemon } from "@/lib/data";
import PokemonCard from "./PokemonCard";
import styles from "./CustomSectionRenderer.module.css";

interface Props {
  section: CustomSection;
}

export default function CustomSectionRenderer({ section }: Props) {
  return (
    <div className={styles.section}>
      {/* Paragraphs */}
      {section.paragraphs?.map((p, i) => (
        <p key={i}>{p}</p>
      ))}

      {/* Lists */}
      {section.lists?.map((list, i) => (
        <ul key={`list-${i}`}>
          {list.map((item, j) => (
            <li key={j}>{item}</li>
          ))}
        </ul>
      ))}

      {/* Pokemon grid */}
      {section.pokemon && section.pokemon.length > 0 && (
        <div className={styles.pokemonGrid}>
          {section.pokemon.map((p: Pokemon, i) => (
            <PokemonCard key={`${p.name}-${i}`} pokemon={p} compact />
          ))}
        </div>
      )}

      {/* Tables */}
      {section.tables?.map((table, i) => {
        if (!table || table.length === 0) return null;
        return (
          <div key={`table-${i}`} className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {table[0]?.map((cell, j) => (
                    <th key={j}>{cell}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.slice(1).map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci}>{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
