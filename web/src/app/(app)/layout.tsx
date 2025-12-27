"use client";

import { ReactNode, useEffect, useState } from "react";
import ThemeToggle from "../ThemeToggle";
import Link from "next/link";
import styles from "./layout.module.css";

/**
 * App layout: Browser, Planner, Onboarding pages
 * - Shared header with logo, navigation, and theme toggle
 * - Consistent styling across app pages
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hide the global site wordmark header since we have our own
    document.body.classList.add("hide-wordmark");
    setMounted(true);
    return () => {
      document.body.classList.remove("hide-wordmark");
    };
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className={styles.appShell}>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/browser" className={styles.logoLink}>
            <img src="/logo.svg" alt="Loomis Chaffee" className={styles.logo} />
          </Link>
          <nav className={styles.nav}>
            <Link href="/browser" className={styles.navLink}>
              Browser
            </Link>
            <Link href="/planner" className={styles.navLink}>
              Planner
            </Link>
          </nav>
          <div className={styles.topBarActions}>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
