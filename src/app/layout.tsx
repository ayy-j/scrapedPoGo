import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import styles from "./layout.module.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-primary",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pokémon GO Events — pokemn.quest",
  description:
    "Live event tracker for Pokémon GO. Browse active events, raids, bonuses, featured Pokémon, and more.",
  metadataBase: new URL("https://pokemn.quest"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <body>
        <header className={styles.header}>
          <a href="/" className={styles.logo}>
            Pokémon GO Events
          </a>
          <span className={styles.badge}>pokemn.quest</span>
        </header>
        <main className={styles.main}>{children}</main>
        <footer className={styles.footer}>
          Data updated every 8 hours ·{" "}
          <a href="/data/events.min.json">JSON&nbsp;API</a>
        </footer>
      </body>
    </html>
  );
}
