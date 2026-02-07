"use client";

import { useState } from "react";
import styles from "./SectionExpander.module.css";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SectionExpander({
  title,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={styles.section}>
      <button
        className={styles.header}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
      >
        <h3 className={styles.title}>{title}</h3>
        <span
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          aria-hidden
        >
          ▼
        </span>
      </button>
      {open && <div className={styles.content}>{children}</div>}
    </div>
  );
}
