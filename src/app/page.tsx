import { Suspense } from "react";
import { getEvents, getEventTypes } from "@/lib/data";
import EventCard from "@/components/EventCard";
import FilterBar from "@/components/FilterBar";
import styles from "./page.module.css";

interface PageProps {
  searchParams: Promise<{ status?: string; type?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const allEvents = getEvents();
  const eventTypes = getEventTypes();

  const statusFilter = params.status ?? "";
  const typeFilter = params.type ?? "";

  const filtered = allEvents.filter((e) => {
    if (statusFilter && e.eventStatus !== statusFilter) return false;
    if (typeFilter && e.eventType !== typeFilter) return false;
    return true;
  });

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>
        Events <span className={styles.count}>({filtered.length})</span>
      </h1>

      <Suspense>
        <FilterBar eventTypes={eventTypes} />
      </Suspense>

      <div className={styles.list}>
        {filtered.length === 0 ? (
          <div className={styles.empty}>No events match the current filters.</div>
        ) : (
          filtered.map((event) => (
            <EventCard key={event.eventID} event={event} />
          ))
        )}
      </div>
    </div>
  );
}
