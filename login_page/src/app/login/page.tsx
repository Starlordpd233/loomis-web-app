'use client';

import { useEffect } from 'react';
import styles from './styles.module.css';

export default function LoginPage() {
  useEffect(() => {
    function createRipple(event: MouseEvent) {
      const button = event.currentTarget as HTMLElement;
      const ripple = document.createElement('span');
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
    buttons.forEach((b) => b.addEventListener('click', createRipple as any));
    return () => { buttons.forEach((b) => b.removeEventListener('click', createRipple as any)); };
  }, []);

  function handleLoomisLogin() {
    document.body.style.opacity = '0.9';
    setTimeout(() => { document.body.style.opacity = '1'; alert('Redirecting to Loomis authentication...'); }, 200);
  }
  function handleEmailLogin() {
    document.body.style.opacity = '0.9';
    setTimeout(() => { document.body.style.opacity = '1'; alert('Email login form would appear'); }, 200);
  }
  function handleSignup() {
    document.body.style.opacity = '0.9';
    setTimeout(() => { document.body.style.opacity = '1'; alert('Create account form would appear'); }, 200);
  }

  return (
    <div className={styles.pageRoot}>
      <div className={styles.particle} style={{ left: '10%', animationDelay: '0s' }} />
      <div className={styles.particle} style={{ left: '20%', animationDelay: '2s' }} />
      <div className={styles.particle} style={{ left: '35%', animationDelay: '4s' }} />
      <div className={styles.particle} style={{ left: '50%', animationDelay: '6s' }} />
      <div className={styles.particle} style={{ left: '65%', animationDelay: '8s' }} />
      <div className={styles.particle} style={{ left: '80%', animationDelay: '10s' }} />
      <div className={styles.particle} style={{ left: '90%', animationDelay: '12s' }} />

      <div className={styles.mainContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.logoBox}>
            <img src="/LC-COA-red-rgb.png" alt="Loomis Chaffee Crest" style={{ maxWidth: 200, height: 'auto', display: 'block' }} />
          </div>

          <div className={styles.mottoWrap}>
            <div className={`${styles.ticker} ${styles.toRight} ${styles.tickerLatin}`}>
              <div className={styles.tickerTrack} style={{ ['--latin-speed' as any]: '22s' }}>
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
              <div className={styles.tickerTrack} style={{ ['--english-speed' as any]: '20s' }}>
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

          <div className={styles.formContainer}>
            <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleLoomisLogin}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              Continue with Loomis Account
            </button>

            <button className={`${styles.btn} ${styles.btnSecondary}`} onClick={handleEmailLogin}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-10 5L2 7" />
              </svg>
              Continue with Email
            </button>

            <div className={styles.divider}>
              <span>or</span>
            </div>

            <button className={`${styles.btn} ${styles.btnOutline}`} onClick={handleSignup}>
              <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 20v-16m-8 8h16" />
              </svg>
              Create New Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
