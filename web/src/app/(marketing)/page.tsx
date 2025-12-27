"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

// Landing page content configuration
interface LandingPageContent {
  title: string;
  highlightText: string;
  subtitle: string;
  ctaText: string;
}

const landingPageData: LandingPageContent = {
  title: "A new way to see and choose your very own",
  highlightText: "Loomis Chaffee",
  subtitle: "experience.",
  ctaText: "Get Started →",
};

// Background images with fallback
const PRIMARY_BG = "/landing/landing_page_background.jp2";
const FALLBACK_BG = "/lcphotoedited.png";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [bgUrl, setBgUrl] = useState<string>(PRIMARY_BG);
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/login");
  };

  // Handle scroll events for header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className={styles.container}>
      {/* Header with logo */}
      <header
        className={`${styles.header} ${isScrolled ? styles.headerScrolled : ""}`}
      >
        <div className={styles.headerInner}>
          <div className={styles.logoText}>Loomis Chaffee</div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Background Image with blur effect */}
        <div className={styles.backgroundWrapper}>
          <div className={styles.backgroundOverlay} />
          <img
            src={bgUrl}
            onError={() => setBgUrl(FALLBACK_BG)}
            alt="Campus scenery"
            className={styles.backgroundImage}
          />
        </div>

        {/* Hero Content */}
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleWhite}>{landingPageData.title}</span>
            <span className={styles.heroTitleHighlight}>
              {landingPageData.highlightText}
            </span>
            <span className={styles.heroTitleWhite}>
              {landingPageData.subtitle}
            </span>
          </h1>

          {/* CTA Button */}
          <button onClick={handleGetStarted} className={styles.ctaButton}>
            {landingPageData.ctaText}
          </button>
        </div>
      </section>
    </div>
  );
}
