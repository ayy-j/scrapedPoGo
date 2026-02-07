import Image from "next/image";
import Link from "next/link";
import type { PoGoEvent } from "@/lib/data";
import { formatDateRange, getRelativeTime } from "@/lib/format";
import StatusBadge from "./StatusBadge";
import EventTypeBadge from "./EventTypeBadge";
import styles from "./EventCard.module.css";

interface Props {
  event: PoGoEvent;
}

export default function EventCard({ event }: Props) {
  const dateRange = formatDateRange(event.start, event.end);
  const status = event.eventStatus ?? "ended";

  let countdownText = "";
  if (status === "active") {
    countdownText = `Ends ${getRelativeTime(event.end)}`;
  } else if (status === "upcoming") {
    countdownText = `Starts ${getRelativeTime(event.start)}`;
  }

  return (
    <Link href={`/event/${event.eventID}`} className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src={event.image}
          alt={event.name}
          fill
          sizes="120px"
          quality={75}
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>{event.name}</h3>
        <div className={styles.badges}>
          <EventTypeBadge eventType={event.eventType} />
          <StatusBadge status={status} />
        </div>
        <div className={styles.meta}>
          <span>{dateRange}</span>
          {countdownText && (
            <>
              <span aria-hidden>·</span>
              <span className={styles.countdown}>{countdownText}</span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
