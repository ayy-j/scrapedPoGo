"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { EVENT_TYPE_COLORS, EVENT_TYPE_LABELS } from "@/lib/constants";
import styles from "./FilterBar.module.css";

interface Props {
  eventTypes: string[];
}

const STATUS_TABS = [
  { value: "", label: "All Events" },
  { value: "active", label: "Active" },
  { value: "upcoming", label: "Upcoming" },
  { value: "ended", label: "Ended" },
];

export default function FilterBar({ eventTypes }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams?.get("status") ?? "";
  const currentType = searchParams?.get("type") ?? "";

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`?${params.toString()}`, { scroll: false });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {/* Status filter tabs */}
      <div className={styles.bar}>
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${currentStatus === tab.value ? styles.tabActive : ""}`}
            onClick={() => setFilter("status", tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Event type chip filter */}
      <div className={styles.bar}>
        <button
          className={`${styles.typeChip} ${!currentType ? "" : styles.typeChipInactive}`}
          style={{ backgroundColor: "#607D8B" }}
          onClick={() => setFilter("type", "")}
        >
          All Types
        </button>
        {eventTypes.map((type) => (
          <button
            key={type}
            className={`${styles.typeChip} ${currentType === type ? "" : styles.typeChipInactive}`}
            style={{ backgroundColor: EVENT_TYPE_COLORS[type] ?? "#607D8B" }}
            onClick={() => setFilter("type", currentType === type ? "" : type)}
          >
            {EVENT_TYPE_LABELS[type] ?? type}
          </button>
        ))}
      </div>
    </div>
  );
}
