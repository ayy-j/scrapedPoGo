import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/constants";
import styles from "./EventTypeBadge.module.css";

interface Props {
  eventType: string;
}

export default function EventTypeBadge({ eventType }: Props) {
  const color = EVENT_TYPE_COLORS[eventType] ?? "#607D8B";
  const label = EVENT_TYPE_LABELS[eventType] ?? eventType;

  return (
    <span className={styles.badge} style={{ backgroundColor: color }}>
      {label}
    </span>
  );
}
