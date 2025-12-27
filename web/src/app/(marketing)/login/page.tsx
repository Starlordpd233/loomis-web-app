"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./enhanced-styles.module.css";

export default function LoginPage() {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsPageLoaded(true);
  }, []);

  const handleLoomisLogin = () => {
    setIsLoading(true);
    // Navigate to onboarding flow
    router.push("/onboarding");
  };

  const handleSignup = () => {
    setIsLoading(true);
    // Navigate to onboarding flow for new users too
    router.push("/onboarding");
  };

  return (
    <>
      <a href="#main-content" className={styles.skipLink}>
        Skip to main content
      </a>
      <main
        id="main-content"
        className={`${styles.pageRoot} ${isPageLoaded ? styles.pageLoaded : ""}`}
      >
        <div className={styles.backgroundPattern} aria-hidden="true" />
        <div className={styles.vignetteOverlay} aria-hidden="true" />
        <div className={styles.mainContainer}>
          <div className={styles.leftPanel}>
            <div className={styles.logoBox}>
              <img
                src="/LC-COA-red-rgb.png"
                alt="Loomis Chaffee Crest"
                style={{ maxWidth: 200, height: "auto", display: "block" }}
                className={styles.logoImage}
              />
            </div>

            <div className={styles.mottoWrap}>
              <div className={styles.mottoContainer}>
                <div className={styles.mottoText}>
                  <span className={styles.mottoChar}>N</span>
                  <span className={styles.mottoChar}>e</span>
                  <span className={styles.mottoSpace}> </span>
                  <span className={styles.mottoChar}>c</span>
                  <span className={styles.mottoChar}>e</span>
                  <span className={styles.mottoChar}>d</span>
                  <span className={styles.mottoChar}>e</span>
                  <span className={styles.mottoSpace}> </span>
                  <span className={styles.mottoChar}>m</span>
                  <span className={styles.mottoChar}>a</span>
                  <span className={styles.mottoChar}>l</span>
                  <span className={styles.mottoChar}>i</span>
                  <span className={styles.mottoChar}>s</span>
                  <span className={styles.mottoChar}>.</span>
                </div>
                <div className={styles.mottoGlow} aria-hidden="true" />
              </div>
            </div>
          </div>

          <div className={styles.rightPanel}>
            <h1 className={styles.welcomeText}>Welcome back.</h1>

            <div className={styles.formContainer}>
              <div className={styles.glowEffect} aria-hidden="true" />
              <button
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={handleLoomisLogin}
                disabled={isLoading}
                aria-label="Continue with Loomis Account"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className={styles.loadingIndicator} aria-live="polite">
                    <svg
                      className={styles.loadingIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="4"
                        strokeDasharray="50 50"
                        strokeDashoffset="0"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg
                      className={styles.icon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Continue with Loomis Account
                  </>
                )}
              </button>

              <div className={styles.divider}>
                <span>or</span>
              </div>

              <button
                className={`${styles.btn} ${styles.btnOutline}`}
                onClick={handleSignup}
                disabled={isLoading}
                aria-label="Create New Account"
                aria-busy={isLoading}
              >
                {isLoading ? (
                  <span className={styles.loadingIndicator} aria-live="polite">
                    <svg
                      className={styles.loadingIcon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle
                        cx="12"
                        cy="12"
                        r="10"
                        strokeWidth="4"
                        strokeDasharray="50 50"
                        strokeDashoffset="0"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    <svg
                      className={styles.icon}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden="true"
                    >
                      <path d="M12 20v-16m-8 8h16" />
                    </svg>
                    Create New Account
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
