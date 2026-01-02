# Review Round 3: Documentation Issues and Fixes

This document identifies issues found in the migration phase documentation and provides recommended fixes.

## Table of Contents

- [Critical Issues (Must Fix)](#critical-issues-must-fix)
- [Inconsistencies](#inconsistencies)
- [Missing Elements](#missing-elements)
- [Additional Notes](#additional-notes)

---

## Critical Issues (Must Fix)

### 1. Phase 3 Task Numbering is Broken

**File:** `phase-3-sandbox-integration-fidelity.md:187`

**Problem:** Tasks are out of order and numbered non-sequentially, creating confusion about execution order.

**Current state:**
- Task 1b (Update Tailwind Content Config)
- Task 1 (Verify sandbox structure from Phase 1)

**Fix:** Renumber to create logical flow:
- Task 1: Verify sandbox structure from Phase 1
- Task 2: Update Tailwind Content Config
- Task 3: Port my_list_sidebar
- Task 4: Port current
- Task 5: Update experiments registry

---

### 2. Phase 5 Task Numbering is Non-Sequential

**File:** `phase-5-production-promotion.md:29`

**Problem:** Tasks are numbered non-sequentially.

**Current state:**
- Task 1 (Wire up components in production)
- Task 5 (Update experiments registry)
- Task 6 (Final verification)

**Fix:** Renumber sequentially: Task 1, Task 2, Task 3

---

### 3. Non-existent "catalog-browser" Design Idea Referenced

**File:** `phase-3-sandbox-integration-fidelity.md:204-205`

**Problem:** The plan references a non-existent design idea.

**Current state:**
```
design_ideas/browser/catalog-browser → src/features/browser/catalog-browser
```

**Actual design ideas:**
- `design_ideas/browser/current`
- `design_ideas/browser/my_list_sidebar`

**Fix:** Remove catalog-browser references. The correct mappings are already documented elsewhere in the same file (lines 24-25).

---

### 4. Phase 0 Task 4.5 Has Unusual Numbering

**File:** `migration-phase-0-baselines-tests.md:228`

**Problem:** Decimal task numbering ("Task 4.5") is unconventional and could cause confusion.

**Current state:**
- Task 4.5: Add minimal E2E Smoke Tests

**Fix:** Rename to "Task 5" and renumber subsequent tasks, OR use a sub-task format like "Task 4 (Subtask 1)".

---

## Inconsistencies

### 5. Missing Rollback Section in Phase 1

**File:** `phase-1-inventory-and-standardization.md`

**Problem:** Phase 1 lacks a Rollback section that all other phases have.

**Fix:** Add rollback instructions:

```markdown
## Rollback

If anything breaks during Phase 1:

1. Remove inventory documents:
   ```bash
   rm "debug&cleanup/incompatibility/inventory-current.md"
   rm "debug&cleanup/incompatibility/inventory-my-list-sidebar.md"
   ```

2. Remove sandbox stubs if created:
   ```bash
   rm -rf loomis-course-app/src/app/sandbox/browser/
   ```

3. Revert any asset script commits:
   ```bash
   git checkout HEAD -- scripts/copy-design-assets.mjs
   ```

Phase 1 is primarily additive, so rollback is low-risk.
```

---

### 6. Phase 5 References Redundant Tailwind Configuration

**File:** `phase-5-production-promotion.md:204`

**Problem:** Acceptance criteria states:
> "`tailwind.config.ts` includes `./src/features/**/*` in content array"

This was already done in Phase 3 Task 1b. This creates confusion about whether it's already done or needs to be done again.

**Fix:** Update acceptance criteria to:
```markdown
- [x] `tailwind.config.ts` includes `./src/features/**/*` in content array (done in Phase 3)
```

---

### 7. Missing Reference to Phase 0 Baselines in Phase 4

**File:** `phase-4-visual-parity-validation.md`

**Problem:** Phase 4 focuses on comparing sandbox to design ideas but doesn't mention:
- Re-validating existing routes against Phase 0 baselines to ensure no regressions
- This is implied in the workflow document but missing from the runbook

**Fix:** Add to Verification Checklist:
```markdown
- [ ] Existing routes (/browser, /planner) still match Phase 0 baselines (no regressions)
```

---

### 8. Phase 3 Architecture Statement is Confusing

**File:** `phase-3-sandbox-integration-fidelity.md:10`

**Problem:** Statement "Port design ideas directly into src/features/ (not sandbox)" sounds like skipping sandbox entirely. The actual pattern (correctly implemented in tasks) is:
1. Port to `src/features/`
2. Create thin wrappers in `/sandbox/...` that import from features

**Fix:** Clarify the architecture section:

```markdown
**Architecture:** **Features-First.** Port design ideas into `src/features/`. Create thin wrapper routes in `/sandbox/...` that import and render the feature components. This separation allows Phase 5 promotion by simply updating the production route to use the feature.
```

---

### 9. Phase 2 Styled-Components Fallback Not Recommended

**File:** `phase-3-sandbox-integration-fidelity.md:43-109`

**Problem:** The "Styled-Components Coexistence" escape hatch is presented as a viable option but contradicts the overall goal of using Tailwind/CSS Modules.

**Fix:** Add strong recommendation against using this escape hatch:

```markdown
> [!IMPORTANT]
> **This escape hatch should rarely be used.** The goal is to rewrite styled-components to Tailwind. Only use this for genuinely complex cases where Tailwind rewrite would take >4 hours. All components using this escape hatch must have a `// TODO: Refactor to Tailwind` comment with ticket reference.
```

---

## Missing Elements

### 10. No Confirmation that Dev Server Runs Correctly

**Affected:** All Phases

**Problem:** While the port (3001) is documented, there's no standard verification step to confirm the dev server is actually running before starting tasks.

**Fix:** Add to each phase's Prerequisites:
```markdown
- Dev server is running: `cd loomis-course-app && npm run dev`
- Verify accessible at http://localhost:3001
```

---

### 11. No TypeScript Compilation Verification in Phase 3

**File:** `phase-3-sandbox-integration-fidelity.md`

**Problem:** Verification checklist mentions "TypeScript compilation passes" but no explicit command is given.

**Fix:** Add verification command:
```bash
cd loomis-course-app
npx tsc --noEmit
```

---

### 12. Missing Environment Variable Documentation

**File:** `phase-5-production-promotion.md`

**Problem:** Phase 5 mentions `NEXT_PUBLIC_ENABLE_NEW_BROWSER` but:
- No documentation of what other environment variables might be needed
- No instruction to create `.env.local` template (`.env.example` exists but doesn't include new variables)

**Fix:** Add to Phase 5 Task 1:
```bash
# Update .env.example to document the rollout variable
echo "NEXT_PUBLIC_ENABLE_NEW_BROWSER=true  # Set to 'true' to enable promoted features" >> loomis-course-app/.env.example
```

---

## Additional Notes

### 13. Design Ideas Folder Structure

**Location:** `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas`

**Note:** Be mindful of how many design ideas currently exist in the folder. In this folder currently, there are ideas not just for the browser: there is also an idea for the sandbox landing page for the sandbox environment inside the main app. That is also an idea to be integrated ultimately.

---

## Summary

This review identified:
- **4 Critical Issues** requiring immediate fixes (task numbering, non-existent references)
- **5 Inconsistencies** that should be addressed for clarity
- **3 Missing Elements** that should be added for completeness
- **1 Additional Note** about design ideas folder structure

All issues should be addressed before proceeding with the migration phases to ensure clear, consistent documentation.
