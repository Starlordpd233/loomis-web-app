"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./enhanced-styles.module.css";

interface LoginFormData {
  email: string;
  password: string;
}

interface FormError {
  field: keyof LoginFormData | "general";
  message: string;
}

export default function LoginPage() {
  const loginFormRef = useRef<HTMLDivElement>(null);
  const loomisBtnRef = useRef<HTMLButtonElement>(null);
  const emailBtnRef = useRef<HTMLButtonElement>(null);
  const signupBtnRef = useRef<HTMLButtonElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);

  const [showEmailForm, setShowEmailForm] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [formErrors, setFormErrors] = useState<FormError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPageLoaded, setIsPageLoaded] = useState(false);

  useEffect(() => { setIsPageLoaded(true); }, []);

  useEffect(() => {
    function createRipple(event: MouseEvent) {
      const button = event.currentTarget as HTMLElement;
      const ripple = document.createElement("span");
      const rect = button.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = (event.clientX ?? 0) - rect.left;
      const y = (event.clientY ?? 0) - rect.top;
      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      ripple.className = styles.ripple;
      button.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    }
    const buttons = Array.from(document.querySelectorAll(`.${styles.btn}`));
    buttons.forEach((b) => b.addEventListener("click", createRipple as any));
    return () => { buttons.forEach((b) => b.removeEventListener("click", createRipple as any)); };
  }, [showEmailForm]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const validateForm = () => {
    const errors: FormError[] = [];
    if (!formData.email.trim()) errors.push({ field: "email", message: "Email is required" });
    else if (!isValidEmail(formData.email)) errors.push({ field: "email", message: "Please enter a valid email address" });
    if (!formData.password) errors.push({ field: "password", message: "Password is required" });
    else if (formData.password.length < 8) errors.push({ field: "password", message: "Password must be at least 8 characters" });
    setFormErrors(errors);
    return errors.length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
    setFormErrors((prev) => prev.filter((er) => er.field !== name));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        alert(`Logging in with email: ${formData.email}`);
        setFormData({ email: "", password: "" });
        setShowEmailForm(false);
      }, 1500);
    }
  };

  const handleLoomisLogin = () => {
    setIsLoading(true);
    setTimeout(() => { setIsLoading(false); alert("Redirecting to Loomis authentication..."); }, 1500);
  };

  const toggleEmailLogin = () => { setShowEmailForm(!showEmailForm); setFormErrors([]); };
  const handleSignup = () => { setIsLoading(true); setTimeout(() => { setIsLoading(false); alert("Create account form would appear"); }, 1500); };

  useEffect(() => {
    if (showEmailForm) requestAnimationFrame(() => emailInputRef.current?.focus());
    else emailBtnRef.current?.focus();
  }, [showEmailForm]);

  const getErrorForField = (field: keyof LoginFormData) => formErrors.find((e) => e.field === field)?.message || "";
  const getGeneralError = () => formErrors.find((e) => e.field === "general")?.message || "";

  return (
    <main id="main-content" className={`${styles.pageRoot} ${isPageLoaded ? styles.pageLoaded : ""}`}>
      <div className={styles.particle} style={{ left: "10%", animationDelay: "0s" }} />
      <div className={styles.particle} style={{ left: "20%", animationDelay: "2s" }} />
      <div className={styles.particle} style={{ left: "35%", animationDelay: "4s" }} />
      <div className={styles.particle} style={{ left: "50%", animationDelay: "6s" }} />
      <div className={styles.particle} style={{ left: "65%", animationDelay: "8s" }} />
      <div className={styles.particle} style={{ left: "80%", animationDelay: "10s" }} />
      <div className={styles.particle} style={{ left: "90%", animationDelay: "12s" }} />

      <div className={styles.mainContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.logoBox}>
            <img src="/LC-COA-red-rgb.png" alt="Loomis Chaffee Crest" style={{ maxWidth: 200, height: "auto", display: "block" }} className={styles.logoImage} />
          </div>

          <div className={styles.mottoWrap}>
            <div className={`${styles.ticker} ${styles.toRight} ${styles.tickerLatin}`}>
              <div className={styles.tickerTrack} style={{ ["--latin-speed" as any]: "35s" }}>
                <div className={styles.tickerInner}>
                  <span>Ne cede malis.</span><span>Ne cede malis.</span><span>Ne cede malis.</span>
                  <span>Ne cede malis.</span><span>Ne cede malis.</span><span>Ne cede malis.</span>
                </div>
                <div className={styles.tickerInner} aria-hidden="true">
                  <span>Ne cede malis.</span><span>Ne cede malis.</span><span>Ne cede malis.</span>
                  <span>Ne cede malis.</span><span>Ne cede malis.</span><span>Ne cede malis.</span>
                </div>
              </div>
            </div>

            <div className={`${styles.ticker} ${styles.toLeft} ${styles.tickerEnglish}`}>
              <div className={styles.tickerTrack} style={{ ["--english-speed" as any]: "30s" }}>
                <div className={styles.tickerInner}>
                  <span>Yield not to adversity.</span><span>Yield not to adversity.</span><span>Yield not to adversity.</span>
                  <span>Yield not to adversity.</span><span>Yield not to adversity.</span><span>Yield not to adversity.</span>
                </div>
                <div className={styles.tickerInner} aria-hidden="true">
                  <span>Yield not to adversity.</span><span>Yield not to adversity.</span><span>Yield not to adversity.</span>
                  <span>Yield not to adversity.</span><span>Yield not to adversity.</span><span>Yield not to adversity.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.rightPanel}>
          <h1 className={styles.welcomeText}>Welcome back.</h1>

          <div className={styles.formContainer} ref={loginFormRef}>
            {showEmailForm ? (
              <form onSubmit={handleEmailSubmit} className={styles.emailForm} aria-busy={isLoading}>
                <div className={styles.formGroup}>
                  <label htmlFor="email" className={styles.formLabel}>Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    ref={emailInputRef}
                    className={`${styles.formInput} ${getErrorForField("email") ? styles.inputError : ""}`}
                    placeholder="Enter your email"
                    autoComplete="email"
                    required
                    aria-describedby={getErrorForField("email") ? "email-error" : undefined}
                    aria-invalid={!!getErrorForField("email")}
                  />
                  {getErrorForField("email") && (
                    <div id="email-error" className={styles.errorMessage} role="alert">
                      {getErrorForField("email")}
                    </div>
                  )}
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password" className={styles.formLabel}>Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`${styles.formInput} ${getErrorForField("password") ? styles.inputError : ""}`}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                    aria-describedby={getErrorForField("password") ? "password-error" : undefined}
                    aria-invalid={!!getErrorForField("password")}
                  />
                  {getErrorForField("password") && (
                    <div id="password-error" className={styles.errorMessage} role="alert">
                      {getErrorForField("password")}
                    </div>
                  )}
                </div>

                {getGeneralError() && (
                  <div className={styles.generalError} role="status" aria-live="polite">
                    {getGeneralError()}
                  </div>
                )}

                <div className={styles.formActions}>
                  <button
                    type="button"
                    className={`${styles.btn} ${styles.btnOutline} ${styles.btnSecondary}`}
                    onClick={toggleEmailLogin}
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`${styles.btn} ${styles.btnPrimary}`}
                    disabled={isLoading}
                    aria-busy={isLoading}
                  >
                    {isLoading ? (
                      <span className={styles.loadingIndicator} aria-live="polite">
                        <svg className={styles.loadingIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="50 50" strokeDashoffset="0" />
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </div>

                <div className={styles.forgotPassword}>
                  <a href="#" className={styles.forgotLink}>Forgot password?</a>
                </div>
              </form>
            ) : (
              <>
                <button
                  ref={loomisBtnRef}
                  className={`${styles.btn} ${styles.btnPrimary}`}
                  onClick={handleLoomisLogin}
                  disabled={isLoading}
                  aria-label="Continue with Loomis Account"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingIndicator} aria-live="polite">
                      <svg className={styles.loadingIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="50 50" strokeDashoffset="0" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      Continue with Loomis Account
                    </>
                  )}
                </button>

                <button
                  ref={emailBtnRef}
                  className={`${styles.btn} ${styles.btnSecondary}`}
                  onClick={toggleEmailLogin}
                  disabled={isLoading}
                  aria-label="Continue with Email"
                  aria-busy={isLoading}
                >
                  <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-10 5L2 7" />
                  </svg>
                  Continue with Email
                </button>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button
                  ref={signupBtnRef}
                  className={`${styles.btn} ${styles.btnOutline}`}
                  onClick={handleSignup}
                  disabled={isLoading}
                  aria-label="Create New Account"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <span className={styles.loadingIndicator} aria-live="polite">
                      <svg className={styles.loadingIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeWidth="4" strokeDasharray="50 50" strokeDashoffset="0" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <>
                      <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <path d="M12 20v-16m-8 8h16" />
                      </svg>
                      Create New Account
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <a href="#main-content" className={styles.skipLink}>Skip to main content</a>
    </main>
  );
}
