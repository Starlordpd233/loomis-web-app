/**
 * Shared Course Types
 *
 * Central type definitions for course data used across the application.
 * These types enforce strict data shapes to prevent bugs during migration
 * and provide a single source of truth for course-related data structures.
 */

// ============================================================================
// RAW CATALOG TYPES (from JSON)
// ============================================================================

/**
 * Raw course data as stored in the catalog JSON.
 * This represents the "dirty" data that needs normalization.
 */
export type RawCourse = {
  title: string;
  description?: string;
  department?: string;
  rigor?: number;              // 1 = Standard, 2 = Advanced, 3 = CL
  gesc?: boolean;              // Global Education & Social Change
  ppr?: boolean;               // Philosophical, Political, or Religious
  term?: string;               // "year course", "term course"
  duration?: string;           // "full-year", "term", "two terms", "half course"
  grades?: number[];           // [9, 10, 11, 12]
  offered_in_25?: boolean;
  prerequisite?: [string | null, boolean]; // [text, permissionRequired]
};

/**
 * Raw department block from catalog JSON
 */
export type RawDepartment = {
  department?: string;
  courses: RawCourse[] | Record<string, RawCourse[]>;
};

/**
 * Raw catalog database structure
 */
export type RawCatalog = {
  departments?: RawDepartment[];
  courses?: RawCourse[];
};

// ============================================================================
// NORMALIZED COURSE TYPES (for UI)
// ============================================================================

/**
 * Normalized course data ready for UI rendering.
 * All optional fields have been processed and tags derived.
 */
export type Course = {
  title: string;
  description?: string;
  department?: string;
  tags: string[];              // Derived tags: GESC, PPR, CL, ADV, YEAR, TERM, etc.
  level?: "CL" | "ADV";        // Course level
  grades?: number[];
  permissionRequired?: boolean;
  termLabel?: string;          // "Full year" / "Term" / "Half course" / "Two terms"
  prerequisiteText?: string;   // Shown in prerequisite banner
};

// ============================================================================
// PLAN & PLANNER TYPES
// ============================================================================

/**
 * Simple plan item for the shopping list
 */
export type PlanItem = {
  title: string;
};

/**
 * Year keys for the 4-year planner
 */
export type YearKey = "Freshman" | "Sophomore" | "Junior" | "Senior";

/**
 * All year keys in order
 */
export const YEARS: YearKey[] = ["Freshman", "Sophomore", "Junior", "Senior"];

/**
 * Number of course slots per year
 */
export const SLOTS_PER_YEAR = 6;

/**
 * Term group for half-year or term courses that share a slot
 */
export type TermGroup = {
  kind: "GROUP";
  size: 2 | 3;                 // 2 = Half course, 3 = Term course
  items: (Course | null)[];
};

/**
 * A single slot in the planner grid
 */
export type PlannerSlot = Course | TermGroup | null;

/**
 * Complete planner state for all 4 years
 */
export type PlannerState = Record<YearKey, PlannerSlot[]>;

/**
 * V2 Planner state with both shopping list and grid
 */
export type PlannerV2State = {
  version: 2;
  selectedCourses: PlanItem[];  // Shopping list
  grid: PlannerState;           // 4-year grid
};

// ============================================================================
// FILTER & UI TYPES
// ============================================================================

/**
 * Canonical department options for filtering
 */
export const DEPT_OPTIONS = [
  "All",
  "English",
  "Modern or Classical Languages",
  "History, Philosophy, Religious Studies & Social Science",
  "Mathematics",
  "Computer Science",
  "Science",
  "Performing Arts/Visual Arts",
] as const;

export type DeptOption = (typeof DEPT_OPTIONS)[number];

/**
 * Grade number to label mapping
 */
export const GRADE_LABELS: Record<number, string> = {
  9: "Freshman",
  10: "Sophomore",
  11: "Junior",
  12: "Senior",
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

/**
 * Check if a planner slot is a term group
 */
export function isTermGroup(slot: PlannerSlot): slot is TermGroup {
  return !!slot && (slot as TermGroup).kind === "GROUP";
}

/**
 * Check if a course is a term or half course
 */
export function isTermLikeCourse(course: Course): boolean {
  const label = (course.termLabel || "").toLowerCase();
  return (
    (label.includes("term") && !label.includes("two")) ||
    label.includes("half")
  );
}

/**
 * Get the group size for a term-like course
 */
export function getGroupSize(course: Course): 2 | 3 {
  return (course.termLabel || "").toLowerCase().includes("half") ? 2 : 3;
}
