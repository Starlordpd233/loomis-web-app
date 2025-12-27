'use client';

import Link from 'next/link';

/**
 * Sandbox Index
 *
 * Lists all design experiments organized by category.
 * Add new experiments to the EXPERIMENTS array below.
 */

interface Experiment {
  name: string;
  description: string;
  path: string;
  status: 'wip' | 'ready' | 'archived';
  frameworks: string[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  experiments: Experiment[];
}

// Add your experiments here
const CATEGORIES: Category[] = [
  {
    id: 'browser',
    name: 'Course Browser',
    icon: '📚',
    experiments: [
      {
        name: 'Idea 1 - Department Cards',
        description: 'Modern department browser with category filtering and search',
        path: '/sandbox/browser/idea1',
        status: 'ready',
        frameworks: ['Tailwind CSS'],
      },
      // Add more browser experiments here
    ],
  },
  // Add more categories here (planner, landing, etc.)
];

const statusColors = {
  wip: 'bg-yellow-100 text-yellow-800',
  ready: 'bg-green-100 text-green-800',
  archived: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  wip: 'Work in Progress',
  ready: 'Ready for Review',
  archived: 'Archived',
};

export default function SandboxIndex() {
  const totalExperiments = CATEGORIES.reduce(
    (sum, cat) => sum + cat.experiments.length,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-3xl">🧪</span>
                Design Sandbox
              </h1>
              <p className="text-slate-400 mt-1">
                {totalExperiments} experiment{totalExperiments !== 1 ? 's' : ''} across {CATEGORIES.length} categor{CATEGORIES.length !== 1 ? 'ies' : 'y'}
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-medium transition-colors"
            >
              ← Back to Main App
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {CATEGORIES.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎨</div>
            <h2 className="text-xl font-semibold mb-2">No experiments yet</h2>
            <p className="text-slate-400">
              Create your first experiment in{' '}
              <code className="bg-slate-700 px-2 py-1 rounded text-sm">
                sandbox/[category]/[name]/page.tsx
              </code>
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {CATEGORIES.map((category) => (
              <section key={category.id}>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-6">
                  <span className="text-2xl">{category.icon}</span>
                  {category.name}
                  <span className="text-sm font-normal text-slate-500">
                    ({category.experiments.length})
                  </span>
                </h2>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {category.experiments.map((exp) => (
                    <Link
                      key={exp.path}
                      href={exp.path}
                      className="group block p-5 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:bg-slate-700/50 hover:border-slate-600 transition-all duration-200"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="font-semibold group-hover:text-blue-400 transition-colors">
                          {exp.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[exp.status]}`}
                        >
                          {statusLabels[exp.status]}
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
              </section>
            ))}
          </div>
        )}

        {/* Quick Start Guide */}
        <section className="mt-16 p-6 bg-slate-800/30 border border-slate-700/50 rounded-xl">
          <h2 className="text-lg font-semibold mb-4">📝 Adding New Experiments</h2>
          <ol className="space-y-3 text-slate-300 text-sm">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
              <span>Create a folder: <code className="bg-slate-700 px-2 py-0.5 rounded">web/src/app/sandbox/[category]/[idea-name]/page.tsx</code></span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
              <span>Add <code className="bg-slate-700 px-2 py-0.5 rounded">&apos;use client&apos;</code> at the top if using React hooks</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
              <span>Update the <code className="bg-slate-700 px-2 py-0.5 rounded">CATEGORIES</code> array in this file to list it</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-slate-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
              <span>View at <code className="bg-slate-700 px-2 py-0.5 rounded">localhost:3001/sandbox/[category]/[idea-name]</code></span>
            </li>
          </ol>
        </section>
      </main>
    </div>
  );
}
