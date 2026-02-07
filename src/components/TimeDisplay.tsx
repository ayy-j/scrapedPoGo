"use client";

import { useEffect, useState } from "react";
import { formatDateRange, getRelativeTime } from "@/lib/format";

interface Props {
  start: string;
  end: string;
  isGlobal?: boolean;
  status?: string;
}

export default function TimeDisplay({ start, end, isGlobal, status }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const dateRange = formatDateRange(start, end);
  const tzLabel = isGlobal ? "UTC" : "Local Time";

  let countdown = "";
  if (status === "active") {
    countdown = `Ends ${getRelativeTime(end)}`;
  } else if (status === "upcoming") {
    countdown = `Starts ${getRelativeTime(start)}`;
  }

  // Suppress hydration mismatch by only rendering countdown after mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div>
      <div style={{ fontSize: "var(--font-body)", color: "var(--color-text-secondary)" }}>
        📅 {dateRange} · {tzLabel}
      </div>
      {mounted && countdown && (
        <div
          style={{
            fontSize: "var(--font-body)",
            fontWeight: 500,
            marginTop: 4,
            color: status === "active" ? "var(--color-active)" : "var(--color-upcoming)",
          }}
        >
          ⏱️ {countdown}
        </div>
      )}
    </div>
  );
}
