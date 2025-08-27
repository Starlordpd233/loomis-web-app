'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

// Tiny typewriter component (deletes then types next word)
function Typewriter({
  words,
  typing = 90,
  deleting = 60,
  hold = 1100,
  caret = true,
}: {
  words: string[];
  typing?: number;   // ms per typed char
  deleting?: number; // ms per deleted char
  hold?: number;     // pause when a word finishes
  caret?: boolean;
}) {
  const [i, setI] = useState(0);          // which word
  const [len, setLen] = useState(0);      // chars shown
  const [del, setDel] = useState(false);  // deleting?

  useEffect(() => {
    const w = words[i % words.length];
    let t = typing;

    if (del) {
      if (len > 0) {
        t = deleting;
        const id = setTimeout(() => setLen(len - 1), t);
        return () => clearTimeout(id);
      }
      // done deleting → next word
      const id = setTimeout(() => {
        setDel(false);
        setI((i + 1) % words.length);
      }, 200);
      return () => clearTimeout(id);
    }

    // typing forward
    if (len < w.length) {
      const id = setTimeout(() => setLen(len + 1), t);
      return () => clearTimeout(id);
    }
    // word complete → hold then start deleting
    const id = setTimeout(() => setDel(true), hold);
    return () => clearTimeout(id);
  }, [i, len, del, words, typing, deleting, hold]);

  const current = words[i % words.length].slice(0, len);

  return (
    <span className={styles.type}>
      <span className={styles.typeText}>{current}</span>
      {caret && <span className={styles.typeCaret} aria-hidden="true" />}
    </span>
  );
}


export default function Landing() {
  return (
    <>
      <header className={styles.topBar}>
        <div className={styles.topBarInner}>
          <img src="/logo.svg" alt="Loomis Chaffee" className={styles.logo} />
        </div>
      </header>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
        <h1 className={styles.title}>
            <span className={styles.titleLine}>Welcome to CourseBrowser.</span>
            <span className={styles.titleLine}>
            A new way to see and choose your very own{' '}
            <span className={styles.accent}>Loomis Chaffee</span>{' '}
        <Typewriter
            words={['experience.', 'adventure.', 'path.', 'journey.']}
            typing={90}
            deleting={60}
            hold={2000}
            />
            </span>
        </h1>


          <a href="/onboarding" className={styles.cta}>
            Get Started →
          </a>
        </div>
      </section>
    </>
  );
}
