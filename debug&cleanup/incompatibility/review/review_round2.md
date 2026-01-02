  1. Critical Inconsistencies & Risks

  A. Naming vs. Intent (High Confusion Risk)
   * Issue: The overview file is named migrate-nextjs-to-vite-composable.md and refers to
     "incompatibility".
   * Reality: The workflow does not migrate the Next.js app to Vite. It integrates Vite-based
     prototypes into the Next.js app.
   * Recommendation: Rename the overview to planning/prototype-intake-and-promotion.md to accurately
     reflect the "Intake → Sandbox → Production" workflow.

  B. Working Directory Flip-Flopping (Execution Risk)
  The working directory context shifts arbitrarily between phases, increasing the risk of running
  commands in the wrong folder:
   * Phase 0, 2, 3, 5: Working directory: loomis-course-app/
   * Phase 1, 4: Working directory: Repo root
   * Impact: Copy-pasting commands across phases will fail (e.g., npm run dev works in one phase but
     not the next).
   * Recommendation: Standardize all phases to run from the Repo Root, or clearly prefix every
     command. The "Repo Root" convention is safer for this specific multi-project structure
     (loomis-course-app + design_ideas).

  C. Data Schema Integrity (High Regression Risk)
   * Issue: Phase 0 provides a localStorage snippet for the "populated" state:

   1     localStorage.setItem('plannerV2', JSON.stringify({ version: 2, selectedCourses: ... }));
      The review.md explicitly flags this schema as incorrect/outdated compared to the actual
  plannerStore.ts implementation.
   * Impact: Using an incorrect schema for baseline screenshots will create a false "clean" baseline,
     hiding potential regressions when the real app breaks with real data.
   * Recommendation: Do not hardcode the schema in the docs. Instead, point to a script or existing
     TypeScript type definition (src/types/course.ts) to generate this payload.

  ---

  2. Technical Analysis by Phase

  Phase 0: Baselines + Tests
   * Status: Good, but brittle.
   * Improvement: The "Manual capture method" is tedious and error-prone.
       * Action: Since you check for capture-script.js in Step 5, you should provide/mandate that
         script's usage in Step 3 rather than suggesting manual Chrome DevTools usage as the primary
         method.

  Phase 1: Inventory
   * Status: Valid, but script needs verification.
   * Issue: The asset copy script uses import.meta.url, which is correct for ESM (.mjs), but the
     review.md flags it as potentially broken.
       * Action: Verify the copy-design-assets.mjs imports and logic. Specifically, ensure
         fs.copyFile targets exist (the script does mkdir parent, which is good).

  Phase 2: Tailwind Global
   * Status: High Risk, but well-mitigated.
   * Analysis: The plan correctly identifies the conflict between globals.css (CSS Modules) and
     Tailwind Preflight.
   * Conflict: The app uses data-theme="dark", but standard Tailwind dark: utilities often expect a
     .dark class or system preference.
       * Recommendation: Explicitly configure darkMode: ['selector', '[data-theme="dark"]'] in
         tailwind.config.ts to ensure Tailwind utilities hook into the existing theme system
         correctly.

  Phase 3: Sandbox Integration
   * Status: Improved.
   * Analysis: This phase correctly implements the "Features-First" pattern (creating components in
     src/features immediately), which addresses previous concerns.
   * Ambiguity: The "Escape Hatch" for styled-components.
       * Risk: Allowing a registry (fallback) undermines the goal of standardization.
       * Recommendation: Make the "Rewrite to Tailwind" mandatory unless the component is >500 lines
         or heavily animated. If the escape hatch is used, mandate a strict // TODO deadline.

  Phase 5: Production Promotion
   * Status: Acceptable.
   * Analysis: It includes a const USE_NEW_EXPLORER = true; toggle.
       * Improvement: While a code constant works, utilizing an Environment Variable (e.g.,
         NEXT_PUBLIC_ENABLE_NEW_BROWSER) is safer. It allows you to toggle the feature in a deployed
         environment without a code push/re-build.

  ---

  3. Actionable Improvements Checklist

   1. Rename Plan: Change planning/migrate-nextjs-to-vite-composable.md to
      planning/prototype-intake-workflow.md.
   2. Fix Paths: Update Phases 0, 2, 3, and 5 to explicitly state "Run from Repo Root" and adjust
      paths (e.g., cd loomis-course-app && npm run dev).
   3. Verify Schema: In Phase 0, replace the JSON blob with a command to inspect
      src/lib/plannerStore.ts or run a helper script that imports the actual types.
   4. Tailwind Config: In Phase 2, explicitly add the darkMode selector configuration to the
      tailwind.config.ts modification step.
   5. Rollout Safety: Update Phase 5 to use process.env.NEXT_PUBLIC_... for the feature toggle.