// Status type for type-safe status handling
export type ExperimentStatus = 'wip' | 'ready' | 'archived';

// Core experiment metadata
export interface ExperimentMeta {
  name: string;              // Display name, e.g., "Department Cards V2"
  description: string;       // Brief description of what it demonstrates
  path: string;              // Route path, e.g., "/sandbox/browser/idea1"
  status: ExperimentStatus;
  frameworks: string[];      // e.g., ["Tailwind CSS", "Lucide Icons"]

  // Optional enhanced metadata
  createdAt?: string;        // ISO date string
  author?: string;           // Who created this experiment
  sourceRef?: string;        // Path to original in design_ideas/
  tags?: string[];           // Additional categorization
  thumbnail?: string;        // Path to preview image
}

// Category grouping for the index page
export interface CategoryMeta {
  id: string;                // Unique identifier, e.g., "browser"
  name: string;              // Display name, e.g., "Course Browser"
  icon: string;              // Emoji, e.g., "📚"
  experiments: ExperimentMeta[];
}

// Re-export for convenience
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'browser',
    name: 'Course Browser',
    icon: '📚',
    experiments: [
      {
        name: 'Enhanced Explorer',
        description: 'AI-enhanced course catalog explorer with Gemini integration',
        path: '/sandbox/browser/current',
        status: 'ready' as ExperimentStatus,
        frameworks: ['Tailwind CSS', 'Lucide Icons'],
        createdAt: '2026-01-02',
        author: 'Design Ideas Team',
        sourceRef: 'design_ideas/browser/current',
        tags: ['ai', 'catalog', 'explorer', 'gemini'],
      },
      {
        name: 'My List Sidebar',
        description: 'Drag-and-drop course list sidebar',
        path: '/sandbox/browser/my-list-sidebar',
        status: 'ready' as ExperimentStatus,
        frameworks: ['Tailwind CSS', 'Lucide Icons'],
        createdAt: '2026-01-02',
        sourceRef: 'design_ideas/browser/my_list_sidebar',
        tags: ['sidebar', 'dnd', 'browser'],
      },
    ],
  },
  {
    id: 'landing',
    name: 'Sandbox UX',
    icon: '✨',
    experiments: [
      {
        name: 'Sandbox Landing Page',
        description: 'Enhanced landing page for the sandbox environment',
        path: '/sandbox/landing',
        status: 'wip' as ExperimentStatus,
        frameworks: ['Tailwind CSS', 'React 19'],
        createdAt: '2026-01-02',
        sourceRef: 'design_ideas/sandbox/sandbox-landing-page',
        tags: ['ux', 'landing', 'sandbox'],
      },
    ],
  },
  // Add more categories here (planner, landing, etc.)
];

// Helper functions

// Returns categories that have at least one active (non-archived) experiment
// Preserves the category structure for the index page
export const getActiveCategories = (categories: CategoryMeta[]): CategoryMeta[] =>
  categories.map(c => ({
    ...c,
    experiments: c.experiments.filter(e => e.status !== 'archived')
  })).filter(c => c.experiments.length > 0);

// Returns a flat list of all active experiments
export const getActiveExperiments = (categories: CategoryMeta[]): ExperimentMeta[] =>
  categories.flatMap(c => c.experiments.filter(e => e.status !== 'archived'));

// Returns a flat list of archived experiments
export const getArchivedExperiments = (categories: CategoryMeta[]): ExperimentMeta[] =>
  categories.flatMap(c => c.experiments.filter(e => e.status === 'archived'));

// Counts experiments by status
export const countByStatus = (categories: CategoryMeta[], status: ExperimentStatus): number =>
  categories.flatMap(c => c.experiments).filter(e => e.status === status).length;
