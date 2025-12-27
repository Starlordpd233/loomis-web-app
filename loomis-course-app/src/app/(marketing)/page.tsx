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

          {/* Animated CTA Button */}
          <div className={styles.animatedButtonWrapper}>
            <button className={styles.animatedButton} onClick={handleGetStarted}>
              <svg viewBox="0 0 24 24" className={styles.arrLeft} xmlns="http://www.w3.org/2000/svg">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
              <span className={styles.buttonText}>Get Started</span>
              <span className={styles.circle} />
              <svg viewBox="0 0 24 24" className={styles.arrRight} xmlns="http://www.w3.org/2000/svg">
                <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
              </svg>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
