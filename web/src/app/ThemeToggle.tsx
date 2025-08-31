'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('system');

  // Initialize from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = (localStorage.getItem('theme') as Theme | null) || 'system';
    setTheme(saved);
  }, []);

  // Apply to document
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const body = document.body;

    // Remove explicit theme attributes first
    root.removeAttribute('data-theme');
    body.removeAttribute('data-theme');

    if (theme === 'light' || theme === 'dark') {
      root.setAttribute('data-theme', theme);
      body.setAttribute('data-theme', theme);
    }

    try {
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  return (
    <div className="theme-toggle">
      <label className="sr-only" htmlFor="theme-select">Theme</label>
      <select
        id="theme-select"
        className="theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        aria-label="Select color theme"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
    </div>
  );
}


