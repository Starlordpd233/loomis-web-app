/**
 * Course Utilities
 *
 * Shared utility functions for course data processing.
 * Used by both Browser and Planner pages.
 */

import {
  Course,
  RawCourse,
  RawCatalog,
  DeptOption,
  DEPT_OPTIONS,
  GRADE_LABELS,
} from "@/types/course";

// ============================================================================
// DATA FETCHING
// ============================================================================

/**
 * Fetch the first successful response from a list of paths.
 * Used to support multiple catalog JSON formats.
 */
export async function fetchFirst<T>(paths: string[]): Promise<T | null> {
  for (const p of paths) {
    try {
      const r = await fetch(p);
      if (r.ok) return (await r.json()) as T;
    } catch {
      // Continue to next path
    }
  }
  return null;
}

/**
 * Default catalog paths to try when fetching course data
 */
export const CATALOG_PATHS = [
  "/catalog.json",
  "/catalogdbfinal.json",
  "/course_catalog_full.json",
];

/**
 * Fetch the course catalog from the default paths
 */
export async function fetchCatalog(): Promise<RawCatalog | null> {
  return fetchFirst<RawCatalog>(CATALOG_PATHS);
}

// ============================================================================
// TERM NORMALIZATION
// ============================================================================

/**
 * Normalize term/duration strings into a consistent format
 */
export function normalizeTerm(
  raw?: string,
  duration?: string
): { termLabel?: string; termTags: string[] } {
  const s = `${(raw || "").toLowerCase()} ${(duration || "").toLowerCase()}`.trim();

  if (s.includes("year")) return { termLabel: "Full year", termTags: ["YEAR"] };
  if (s.includes("two terms"))
    return { termLabel: "Two terms", termTags: ["TWO-TERM"] };
  if (s.includes("half"))
    return { termLabel: "Half course", termTags: ["HALF"] };
  if (s.includes("term")) return { termLabel: "Term", termTags: ["TERM"] };

  return { termLabel: undefined, termTags: [] };
}

// ============================================================================
// TAG DERIVATION
// ============================================================================

/**
 * Derive tags and level from a raw course
 */
export function deriveTags(
  c: RawCourse
): { tags: string[]; level?: "CL" | "ADV" } {
  const tags: string[] = [];

  // Special designation tags
  if (c.gesc) tags.push("GESC");
  if (c.ppr) tags.push("PPR");

  // Level determination
  let level: "CL" | "ADV" | undefined;
  const titleCL = (c.title || "").trim().toUpperCase().startsWith("CL ");

  if (titleCL || (c.rigor ?? 1) >= 3) {
    tags.push("CL");
    level = "CL";
  } else if ((c.rigor ?? 1) === 2) {
    tags.push("ADV");
    level = "ADV";
  }

  // Term tags
  const { termTags } = normalizeTerm(c.term, c.duration);
  tags.push(...termTags);

  return { tags: Array.from(new Set(tags)), level };
}

// ============================================================================
// DEPARTMENT CANONICALIZATION
// ============================================================================

/**
 * Map department strings to canonical department options
 */
export function canonicalizeDepartment(dep?: string): DeptOption | "Other" {
  const d = (dep || "").toLowerCase().trim();

  if (/\benglish\b/.test(d)) return "English";

  if (
    /(modern|classical).*language/.test(d) ||
    /\b(world )?languages?\b/.test(d) ||
    /\b(arabic|chinese|french|latin|spanish)\b/.test(d)
  )
    return "Modern or Classical Languages";

  if (
    /(history|philosophy|religious|religion|social)/.test(d) ||
    /\bhprss\b/.test(d)
  )
    return "History, Philosophy, Religious Studies & Social Science";

  // Check CS BEFORE math/science
  if (/\b(computer(\s+science)?|cs|comp(uter)?\s*sci(ence)?)\b/.test(d))
    return "Computer Science";

  if (/\bmath(ematics)?\b/.test(d)) return "Mathematics";

  if (/\b(science|biology|chemistry|physics|environmental|earth)\b/.test(d))
    return "Science";

  if (/\b(performing|visual|music|theater|theatre|dance|arts?)\b/.test(d))
    return "Performing Arts/Visual Arts";

  return "Other";
}

// ============================================================================
// DATABASE FLATTENING
// ============================================================================

/**
 * Flatten a raw catalog database into a normalized Course array.
 * Handles multiple catalog formats:
 * - { departments: [...] } with nested courses
 * - { courses: [...] } simple array
 * - [...] direct array of courses
 */
export function flattenDatabase(db: RawCatalog | RawCourse[] | null): Course[] {
  if (!db) return [];

  const out: Course[] = [];

  const pushCourse = (rc: RawCourse, deptName?: string) => {
    const { tags, level } = deriveTags(rc);
    const { termLabel } = normalizeTerm(rc.term, rc.duration);
    out.push({
      title: rc.title,
      description: rc.description,
      department: rc.department || deptName,
      tags,
      level,
      grades: rc.grades,
      permissionRequired: Array.isArray(rc.prerequisite)
        ? !!rc.prerequisite[1]
        : undefined,
      termLabel,
      prerequisiteText: Array.isArray(rc.prerequisite)
        ? rc.prerequisite[0] || ""
        : "",
    });
  };

  // Handle { departments: [...] } format
  if (db && !Array.isArray(db) && Array.isArray((db as RawCatalog).departments)) {
    const catalog = db as RawCatalog;
    for (const deptBlock of catalog.departments!) {
      const deptName: string | undefined = deptBlock.department;
      const courses = deptBlock.courses;

      if (Array.isArray(courses)) {
        for (const rc of courses as RawCourse[]) pushCourse(rc, deptName);
      } else if (courses && typeof courses === "object") {
        for (const key of Object.keys(courses)) {
          const list: RawCourse[] = (courses as Record<string, RawCourse[]>)[key];
          if (!Array.isArray(list)) continue;
          for (const rc of list) pushCourse(rc, deptName || key);
        }
      }
    }
    return out;
  }

  // Handle direct array format
  if (Array.isArray(db)) {
    return (db as RawCourse[]).map((rc) => {
      const { tags, level } = deriveTags(rc);
      const { termLabel } = normalizeTerm(rc.term, rc.duration);
      return {
        title: rc.title,
        description: rc.description,
        department: rc.department,
        tags,
        level,
        grades: rc.grades,
        permissionRequired: Array.isArray(rc.prerequisite)
          ? !!rc.prerequisite[1]
          : undefined,
        termLabel,
        prerequisiteText: Array.isArray(rc.prerequisite)
          ? rc.prerequisite[0] || ""
          : "",
      };
    });
  }

  // Handle { courses: [...] } format
  const catalog = db as RawCatalog;
  const arr = Array.isArray(catalog?.courses) ? catalog.courses : [];
  return arr.map((rc: RawCourse) => {
    const { tags, level } = deriveTags(rc);
    const { termLabel } = normalizeTerm(rc.term, rc.duration);
    return {
      title: rc.title,
      description: rc.description,
      department: rc.department,
      tags,
      level,
      grades: rc.grades,
      permissionRequired: Array.isArray(rc.prerequisite)
        ? !!rc.prerequisite[1]
        : undefined,
      termLabel,
      prerequisiteText: Array.isArray(rc.prerequisite)
        ? rc.prerequisite[0] || ""
        : "",
    };
  });
}

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format grade numbers into readable labels
 */
export function formatGrades(grades?: number[]): string | null {
  if (!grades || grades.length === 0) return null;

  const names = Array.from(
    new Set(
      grades
        .filter((g) => GRADE_LABELS[g])
        .sort((a, b) => a - b)
        .map((g) => GRADE_LABELS[g]!)
    )
  );

  return names.length ? names.join(", ") : null;
}

// ============================================================================
// FILTERING
// ============================================================================

/**
 * Filter courses based on search query, department, and tags
 */
export function filterCourses(
  courses: Course[],
  options: {
    query?: string;
    includeDescriptions?: boolean;
    department?: DeptOption;
    tags?: { gesc?: boolean; ppr?: boolean; cl?: boolean };
  }
): Course[] {
  const q = (options.query || "").trim().toLowerCase();
  const dept = options.department || "All";
  const tags = options.tags || {};

  return courses.filter((c) => {
    // Department filter
    const matchesDept =
      dept === "All" || canonicalizeDepartment(c.department) === dept;

    // Tag filters
    if (tags.gesc && !c.tags?.includes("GESC")) return false;
    if (tags.ppr && !c.tags?.includes("PPR")) return false;
    if (tags.cl && !c.tags?.includes("CL")) return false;

    // Query filter
    const haystacks = [
      (c.title || "").toLowerCase(),
      (c.department || "").toLowerCase(),
      ...(options.includeDescriptions ? [(c.description || "").toLowerCase()] : []),
    ];
    const matchesQuery = q === "" || haystacks.some((h) => h.includes(q));

    return matchesDept && matchesQuery;
  });
}

// Re-export constants for convenience
export { DEPT_OPTIONS, GRADE_LABELS };
