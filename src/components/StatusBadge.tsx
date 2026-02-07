import { STATUS_COLORS } from "@/lib/constants";
import styles from "./StatusBadge.module.css";

interface Props {
  status: "upcoming" | "active" | "ended" | string;
}

export default function StatusBadge({ status }: Props) {
  const colors = STATUS_COLORS[status] ?? STATUS_COLORS.ended;

  return (
    <span
      className={styles.badge}
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: colors.border,
      }}
    >
      {status}
    </span>
  );
}
