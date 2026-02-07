import Image from "next/image";
import type { Bonus } from "@/lib/data";
import styles from "./BonusChip.module.css";

interface Props {
  bonus: string | Bonus;
}

export default function BonusChip({ bonus }: Props) {
  if (typeof bonus === "string") {
    return (
      <div className={styles.chip}>
        <span className={styles.text}>{bonus}</span>
      </div>
    );
  }

  return (
    <div className={styles.chip}>
      {bonus.image && (
        <div className={styles.icon}>
          <Image
            src={bonus.image}
            alt={bonus.bonusType ?? "bonus"}
            width={32}
            height={32}
            quality={75}
          />
        </div>
      )}
      <span className={styles.text}>{bonus.text}</span>
      {bonus.multiplier != null && bonus.multiplier > 0 && (
        <span className={styles.multiplier}>{bonus.multiplier}×</span>
      )}
    </div>
  );
}
