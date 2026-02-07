/** Format an ISO 8601 date string for display */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Format a date range like "Feb 3 – Feb 8, 2026" */
export function formatDateRange(start: string, end: string): string {
  const s = new Date(start);
  const e = new Date(end);
  const sameYear = s.getFullYear() === e.getFullYear();
  const sameMonth = sameYear && s.getMonth() === e.getMonth();

  const startStr = s.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(sameYear ? {} : { year: "numeric" }),
  });

  const endStr = e.toLocaleDateString("en-US", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });

  return `${startStr} – ${endStr}`;
}

/** Get a human-readable relative time string */
export function getRelativeTime(iso: string): string {
  const target = new Date(iso).getTime();
  const now = Date.now();
  const diff = target - now;
  const absDiff = Math.abs(diff);

  const minutes = Math.floor(absDiff / 60000);
  const hours = Math.floor(absDiff / 3600000);
  const days = Math.floor(absDiff / 86400000);

  let timeStr: string;
  if (days > 0) {
    const remHours = Math.floor((absDiff % 86400000) / 3600000);
    timeStr = remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
  } else if (hours > 0) {
    const remMin = Math.floor((absDiff % 3600000) / 60000);
    timeStr = remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
  } else {
    timeStr = `${minutes}m`;
  }

  return diff > 0 ? `in ${timeStr}` : `${timeStr} ago`;
}

/** Format a section key like "field-research-task-rewards" → "Field Research Task Rewards" */
export function formatSectionTitle(key: string): string {
  return key
    .split(/[-–]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
