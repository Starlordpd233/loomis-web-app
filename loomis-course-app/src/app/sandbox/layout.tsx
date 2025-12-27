import './sandbox.css';
import Link from 'next/link';

/**
 * Sandbox Layout
 *
 * This layout wraps all design experiments in the /sandbox routes.
 * It provides:
 * - Tailwind CSS (and any other styling frameworks you add to sandbox.css)
 * - A dev toolbar for navigation
 * - Complete isolation from the main app's styling
 *
 * To add new experiments:
 * 1. Create a new folder: sandbox/[category]/[idea-name]/page.tsx
 * 2. Add 'use client' if using React hooks
 * 3. View at: localhost:3001/sandbox/[category]/[idea-name]
 */
export default function SandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {children}

      {/* Dev Toolbar - only visible in sandbox */}
      <div className="sandbox-toolbar">
        <span>🧪 Sandbox</span>
        <span>|</span>
        <Link href="/sandbox">Index</Link>
        <span>|</span>
        <Link href="/">Main App</Link>
      </div>
    </>
  );
}
