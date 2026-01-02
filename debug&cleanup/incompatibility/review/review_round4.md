Executive Summary

  Three specialized agents (TypeScript Expert, Backend Architect, Architecture Strategist) analyzed the 6-phase migration plan along with codebase verification. The plan is architecturally sound but has three critical blocking issues that must be fixed before execution.

  ---
  🔴 CRITICAL ISSUES (Blocking - Must Fix)

  1. Token Collision in sandbox.css (WILL BREAK PRODUCTION)

  Location: loomis-course-app/src/app/sandbox/sandbox.css:101-134

  Evidence: Sandbox defines :root tokens that override production:
  :root {
    --background: oklch(1 0 0);  /* sandbox */
  }
  While globals.css uses:
  :root {
    --background: var(--color-bg);  /* production */
  }

  Impact: When Phase 2 imports Tailwind globally, sandbox tokens will overwrite production tokens across the entire app.

  Fix: Scope sandbox tokens under .sandbox-scope class or delete them entirely.

  ---
  2. Dark Mode Variant Mismatch (TAILWIND DARK: WILL NOT WORK)

  Location: sandbox.css:19

  Current:
  @custom-variant dark (&:is(.dark *));

  Reality: ThemeToggle.tsx (lines 27-29) uses data-theme="dark", not a .dark class.

  Impact: All Tailwind dark: utilities will fail to activate in both sandbox and production.

  Fix: Change to:
  @custom-variant dark (&:is([data-theme="dark"] *));

  ---
  3. Feature Flag is Build-Time Only (NO FAST ROLLBACK)

  Location: phase-5-production-promotion.md:70

  Current:
  const USE_NEW_EXPLORER = process.env.NEXT_PUBLIC_ENABLE_NEW_BROWSER === 'true';

  Impact: Requires full rebuild (~5-15 minutes) to rollback production issues.

  Recommendation: Implement cookie-based or server-side feature flags for runtime control.

  ---
  🟠 HIGH PRIORITY Issues

  | Issue                                | Source    | Location             | Recommendation                           |
  |--------------------------------------|-----------|----------------------|------------------------------------------|
  | Missing TypeScript types in snippets | TS Expert | Phase 3, line 101    | Add { children: React.ReactNode }        |
  | Test import pattern incorrect        | TS Expert | Phase 3, line 499    | Use named import { MyListSidebar }       |
  | No API integration architecture      | Backend   | Phase 3-5 gap        | Add server-side Route Handler for Gemini |
  | vitest.config.ts excludes features   | TS Expert | lines 38-44          | Add 'src/features/**/*.{ts,tsx}'         |
  | Styled-components hydration pattern  | TS Expert | Phase 3, lines 72-92 | Use official Next.js SSR pattern         |

  ---
  🟡 Prior Review Issues Status

  After 3 rounds of prior review, here's what remains unaddressed:

  | Issue                            | Review Round | Status                 |
  |----------------------------------|--------------|------------------------|
  | Token collision (sandbox :root)  | Round 1      | ❌ UNADDRESSED         |
  | Dark mode .dark vs data-theme    | Round 1      | ❌ UNADDRESSED         |
  | localStorage schema incorrect    | Round 1, 2   | ❌ UNADDRESSED         |
  | Working directory inconsistency  | Round 1, 2   | ⚠️ PARTIALLY ADDRESSED |
  | Phase numbering issues           | Round 3      | ✅ ADDRESSED           |
  | Missing rollback in Phase 1      | Round 3      | ✅ ADDRESSED           |
  | Env var toggle for Phase 5       | Round 2      | ✅ ADDRESSED           |
  | design_ideas/sandbox not covered | Round 3      | ❌ UNADDRESSED         |

  ---
  📊 Codebase Reality Check

  I verified key claims against the actual codebase:

  | Claim                                   | Reality                                                      | Status |
  |-----------------------------------------|--------------------------------------------------------------|--------|
  | Design ideas: current + my_list_sidebar | Confirmed (also sandbox-landing-page exists but not in plan) | ⚠️     |
  | Tailwind content: sandbox only          | ./src/app/sandbox/** - Correct                               | ✅     |
  | Theme uses data-theme                   | ThemeToggle.tsx lines 27-29 confirms                         | ✅     |
  | plannerV2 schema                        | Matches { version: 2, selectedCourses, grid }                | ✅     |
  | sandbox.css conflicts                   | :root tokens + .dark variant - Confirmed                     | ❌     |

  ---
  🏗️ Architectural Assessment

  What's Sound

  - Features-first architecture (src/features/) - Correct pattern for code sharing
  - Phased approach with checkpoints - Proper strangler fig pattern
  - Sandbox isolation - Safe experimentation before production
  - Thin wrapper pattern - Minimal duplication between sandbox and production

  What's Missing

  1. API Integration Layer - Gemini API handling not addressed
  2. Storage Protection - No mechanism to prevent sandbox from corrupting production localStorage
  3. CI/CD Integration - All validation is manual
  4. Cleanup Phase - No Phase 6 for removing sandbox routes post-promotion

  ---
  📋 Prioritized Action List

  P0 - Must Fix Before Execution

  1. Fix sandbox.css :root token collision → Scope or delete
  2. Fix dark mode variant → [data-theme="dark"] not .dark
  3. Verify localStorage schema in Phase 0 → Reference actual types

  P1 - Fix During Execution

  4. Add TypeScript types to all code snippets
  5. Add src/features/ to vitest coverage config
  6. Standardize working directory convention (recommend: Repo Root)
  7. Add sandbox-landing-page to Phase 1 inventory

  P2 - Improve for Sustainability

  8. Automate visual comparison (make Phase 4 Playwright non-optional)
  9. Add CI pipeline stages for each checkpoint
  10. Implement runtime feature flags for Phase 5
  11. Add storage abstraction layer to protect plannerV2

  ---
  🎯 Strategic Recommendations

  Top 3 High-ROI Improvements

  1. Automate Visual Regression - CI integration with Playwright screenshots catches regressions automatically
  2. Add Schema Validation Script - Generate correct localStorage payloads from TypeScript types
  3. Runtime Feature Flags - Cookie-based toggle allows instant rollback without redeployment

  Should Phases Be Merged?

  - Consider merging Phase 4 into Phase 3 - Visual validation during porting, not as separate phase
  - Keep Phase 5 separate - Production promotion is high-risk, needs its own checkpoint

  ---
  ✅ Conclusion

  The 6-phase migration plan is well-structured and follows industry-standard patterns. However, three critical CSS/token issues must be resolved before the plan can be safely executed. These have persisted through 3 rounds of prior review and will cause production breakage if not addressed.

  Immediate Actions Required:
  1. Fix sandbox.css token collision (lines 101-134)
  2. Fix dark mode variant mismatch (line 19)
  3. Verify localStorage schema matches actual types