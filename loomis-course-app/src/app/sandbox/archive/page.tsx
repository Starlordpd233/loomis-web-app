'use client';

import Link from 'next/link';
import { CATEGORIES, getArchivedExperiments } from '../experiments';

/**
 * Sandbox Archive
 *
 * Shows all archived experiments in a flat list.
 * Experiments can be archived by setting status: 'archived' in experiments.ts.
 */

export default function SandboxArchive() {
  const archivedExperiments = getArchivedExperiments(CATEGORIES);
  const count = archivedExperiments.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">📦</span>
                Archived Experiments
              </h1>
              <p className="text-slate-400 mt-1">
                {count} archived experiment{count !== 1 ? 's' : ''}
              </p>
            </div>
            <Link
              href="/sandbox"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Index
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {count === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🗃️</div>
            <h2 className="text-xl font-semibold mb-2">No archived experiments</h2>
            <p className="text-slate-400">
              Experiments with{' '}
              <code className="bg-slate-700 px-2 py-1 rounded text-sm">
                status: &apos;archived&apos;
              </code>{' '}
              will appear here.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {archivedExperiments.map((exp) => (
              <Link
                key={exp.path}
                href={exp.path}
                className="group block p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                    {exp.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    Archived
                  </span>
                </div>

                <p className="text-sm text-slate-400 mb-4">
                  {exp.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {exp.frameworks.map((fw) => (
                    <span
                      key={fw}
                      className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300"
                    >
                      {fw}
                    </span>
                  ))}
                </div>

                <div className="mt-4 text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  View experiment →
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Box */}
        <section className="mt-16 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">📝 Managing Archived Experiments</h2>
          <div className="space-y-3 text-slate-300 text-sm">
            <p>
              <strong>To archive an experiment:</strong> Set{' '}
              <code className="bg-slate-700 px-2 py-0.5 rounded">status: &apos;archived&apos;</code>{' '}
              in its entry in{' '}
              <code className="bg-slate-700 px-2 py-0.5 rounded">experiments.ts</code>
            </p>
            <p>
              <strong>To revive an experiment:</strong> Change the status back to{' '}
              <code className="bg-slate-700 px-2 py-0.5 rounded">&apos;wip&apos;</code> or{' '}
              <code className="bg-slate-700 px-2 py-0.5 rounded">&apos;ready&apos;</code>
            </p>
            <p className="text-slate-400">
              Archived experiments are hidden from the main index but their files are preserved.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
