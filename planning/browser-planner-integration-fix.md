# Browser ↔ Planner Integration Fix

> **Status:** Deferred  
> **Priority:** Medium  
> **Discovered:** 2026-01-02 during Phase 0/1 verification

## Problem Summary

The Browser (`/browser`) and Planner (`/planner`) pages don't share data correctly:

1. **Separate localStorage keys:** Browser uses `plan`, Planner uses `plannerV2`
2. **Picker mode not implemented:** Planner sends `mode=picker` query params but Browser ignores them

## Current Behavior

| Action | Expected | Actual |
|--------|----------|--------|
| Add course on Browser, refresh | "My Plan" list persists | Works ⚠️ (verify localStorage) |
| Click slot on Planner → Add on Browser | Course appears in Planner grid | ❌ Course goes to Browser's "My Plan" only |
| Courses in Browser "My Plan" | Visible on Planner | ❌ Not visible (different storage keys) |

## Root Cause

### Browser Page (`src/app/(app)/browser/page.tsx`)
- Lines 60-76: Uses `plan` localStorage key
- No `useSearchParams` import — ignores `mode=picker&year=...&slot=...`

### Planner Page (`src/app/(app)/planner/page.tsx`)
- Line 33: Uses `plannerV2` via `loadPlannerState()`
- Line 48: Sends picker query params that Browser doesn't read

## Fix Strategy

### Option A: Unify Storage (Recommended)
1. Deprecate `plan` key in Browser
2. Browser reads/writes to `plannerV2.selectedCourses` via `plannerStore`
3. Consider adding "My Plan" as overlay/sidebar on Planner

### Option B: Implement Picker Mode
1. Add `useSearchParams` to Browser page
2. When `mode=picker`, show different UI (select button instead of add)
3. On select, write to `plannerV2.grid[year][slot]` and redirect back

### Option C: Both
Unify the storage AND implement picker mode for grid assignment.

## Files to Modify

```
loomis-course-app/src/app/(app)/browser/page.tsx  # Add picker mode handling
loomis-course-app/src/lib/plannerStore.ts         # (maybe) Add helper for slot assignment
```

## Test Cases to Add

```typescript
describe('Browser picker mode', () => {
  it('reads mode=picker from query params', () => {});
  it('writes to plannerV2.grid when in picker mode', () => {});
  it('redirects to returnTo URL after selection', () => {});
});
```

## Impact Assessment

- **Does NOT block Phases 2-5** — Migration phases focus on styling/Tailwind, not feature completeness
- Phase 0 baselines captured this current (incomplete) state
- Can be fixed as standalone feature after Phase 5

## Notes

This appears to be an incomplete feature from original development, not a regression.
