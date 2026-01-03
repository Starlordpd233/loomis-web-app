
import {
  PlannerV2State,
  PlannerState,
  YEARS,
  SLOTS_PER_YEAR,
} from "@/types/course";

const STORAGE_KEY = "plannerV2";
const LEGACY_GRID_KEY = "plannerV1";
const LEGACY_LIST_KEY = "plan";

const DEFAULT_GRID: PlannerState = {
  Freshman: Array(SLOTS_PER_YEAR).fill(null),
  Sophomore: Array(SLOTS_PER_YEAR).fill(null),
  Junior: Array(SLOTS_PER_YEAR).fill(null),
  Senior: Array(SLOTS_PER_YEAR).fill(null),
};

const DEFAULT_STATE: PlannerV2State = {
  version: 2,
  selectedCourses: [],
  grid: DEFAULT_GRID,
};

const isValidGrid = (grid: unknown): grid is PlannerState => {
  if (!grid || typeof grid !== "object") return false;
  const record = grid as Record<string, unknown>;
  return YEARS.every((year) => Array.isArray(record[year]));
};

/**
 * Load planner state from localStorage with migration support
 */
export function loadPlannerState(): PlannerV2State {
  if (typeof window === "undefined") return DEFAULT_STATE;

  try {
    // 1. Try V2
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (v2) {
      const parsed = JSON.parse(v2);
      // Sanitize: ensure required fields exist and fall back to defaults if corrupted
      return {
        version: 2,
        selectedCourses: Array.isArray(parsed.selectedCourses) ? parsed.selectedCourses : [],
        grid: isValidGrid(parsed.grid) ? parsed.grid : DEFAULT_GRID,
      };
    }

    // 2. Try Migration
    const legacyGrid = localStorage.getItem(LEGACY_GRID_KEY);
    const legacyList = localStorage.getItem(LEGACY_LIST_KEY);

    if (legacyGrid || legacyList) {
      const grid = legacyGrid ? JSON.parse(legacyGrid) : DEFAULT_GRID;
      const safeGrid = isValidGrid(grid) ? grid : DEFAULT_GRID;
      const list = legacyList ? JSON.parse(legacyList) : [];
      
      const migrated: PlannerV2State = {
        version: 2,
        grid: safeGrid,
        selectedCourses: list,
      };

      // Save immediately to V2
      savePlannerState(migrated);
      return migrated;
    }
  } catch (e) {
    console.error("Failed to load planner state", e);
  }

  return DEFAULT_STATE;
}

/**
 * Save planner state to localStorage
 */
export function savePlannerState(state: PlannerV2State) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error("Failed to save planner state", e);
  }
}
