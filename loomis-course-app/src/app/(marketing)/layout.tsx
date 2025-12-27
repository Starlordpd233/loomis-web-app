"use client";

import { useState, useEffect, ReactNode } from "react";

/**
 * Marketing layout: Landing and Login pages
 * - No global header (each page handles its own header)
 * - Scoped styles to prevent bleeding into app pages
 */
export default function MarketingLayout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Hide the global site wordmark header for marketing pages
    document.body.classList.add("hide-wordmark");
    setMounted(true);
    return () => {
      document.body.classList.remove("hide-wordmark");
    };
  }, []);

  if (!mounted) {
    return null; // Prevent hydration mismatch
  }

  return <>{children}</>;
}
