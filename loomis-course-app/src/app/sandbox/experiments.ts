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
        status: 'wip' as ExperimentStatus,
        frameworks: ['Tailwind CSS', 'styled-components', '@google/genai'],
        createdAt: '2025-12-31',
        author: 'Design Ideas Team',
        sourceRef: 'design_ideas/browser/current',
        tags: ['ai', 'catalog', 'explorer', 'gemini'],
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
