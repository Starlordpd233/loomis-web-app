Executive Summary

  Three specialized review agents (Architecture Strategist, TypeScript Expert, Code Reviewer) independently analyzed the migration plan documentation. All three agents converge on the same critical finding: three CSS/token issues must be fixed before execution. These issues have persisted through 4 prior review rounds without being resolved in the actual codebase.

  ---
  🔴 CRITICAL ISSUES (Blocking - Must Fix Before Execution)

  1. Token Collision in sandbox.css (WILL BREAK PRODUCTION)

  | Aspect   | Details                                                                                    |
  |----------|--------------------------------------------------------------------------------------------|
  | File     | loomis-course-app/src/app/sandbox/sandbox.css:101-134                                      |
  | Evidence | :root { --background: oklch(1 0 0); } vs globals.css: --background: #ffffff;               |
  | Impact   | When Phase 2 imports Tailwind globally, sandbox tokens override production tokens app-wide |
  | Fix      | Scope tokens under .sandbox-scope class OR delete entirely                                 |

  2. Dark Mode Variant Mismatch (TAILWIND dark: WILL NOT WORK)

  | Aspect  | Details                                                       |
  |---------|---------------------------------------------------------------|
  | File    | loomis-course-app/src/app/sandbox/sandbox.css:19              |
  | Current | @custom-variant dark (&:is(.dark *));                         |
  | Reality | ThemeToggle.tsx:28-29 uses data-theme="dark" attribute        |
  | Impact  | All Tailwind dark: utilities will fail to activate            |
  | Fix     | Delete line 19 (let global tailwind.css own the dark variant) |

  ---
  🟠 HIGH PRIORITY Issues

  | #   | Issue                                     | Source       | Location                                      | Recommendation                                 |
  |-----|-------------------------------------------|--------------|-----------------------------------------------|------------------------------------------------|
  | 4   | sandbox-landing-page not covered          | All Agents   | design_ideas/sandbox/ exists but not in plans | Add to Phase 1 inventory + Phase 3 porting     |
  | 5   | Feature flag is build-time only           | All Agents   | Phase 5 lines 40-64                           | Add explicit warning about rebuild requirement |
  | 6   | Missing TypeScript types in snippets      | TypeScript   | Phase 3 lines 98-110, 268-285                 | Add children: React.ReactNode, return types    |
  | 7   | styled-components registry hydration risk | TypeScript   | Phase 3 lines 67-96                           | Fix for React 19 + add danger warning          |
  | 8   | Test import pattern incorrect             | TypeScript   | Phase 3 line 544                              | Use userEvent instead of fireEvent             |
  | 9   | vitest.config.ts excludes features        | All Agents   | review_round4.md                              | Add src/features/**/*.{ts,tsx}                 |
  | 10  | No regression check vs Phase 0 baselines  | Architecture | Phase 4                                       | Add explicit comparison task                   |

  ---
  🟡 Prior Review Remediation Status

  | Issue                                     | Review Round | Current Status                           |
  |-------------------------------------------|--------------|------------------------------------------|
  | Token collision (sandbox :root)           | Round 1, 4   | ❌ UNADDRESSED IN CODE                   |
  | Dark mode .dark vs data-theme             | Round 1, 4   | ❌ UNADDRESSED IN CODE                   |
  | localStorage schema incorrect             | Round 1, 2   | ✅ ADDRESSED - schema now correct        |
  | Working directory inconsistency           | Round 1, 2   | ✅ ADDRESSED - standardized to Repo Root |
  | Phase numbering issues                    | Round 3      | ✅ ADDRESSED - sequential                |
  | Missing rollback in Phase 1               | Round 3      | ✅ ADDRESSED - section added             |
  | Env var toggle for Phase 5                | Round 2      | ✅ ADDRESSED - NEXT_PUBLIC_ added        |
  | sandbox-landing-page not covered          | Round 3, 4   | ❌ UNADDRESSED                           |
  | Styled-components escape hatch permissive | Round 3      | ⚠️ PARTIALLY - warning added             |

  ---
  📊 Codebase Reality vs Documentation

  | Claim                                                | Codebase Reality                                | Status        |
  |------------------------------------------------------|-------------------------------------------------|---------------|
  | Theme uses data-theme attribute                      | ThemeToggle.tsx lines 27-30 confirms            | ✅ Matches    |
  | Tailwind content: sandbox only                       | tailwind.config.ts line 6: ./src/app/sandbox/** | ✅ Matches    |
  | plannerV2 schema: { version, selectedCourses, grid } | plannerStore.ts lines 21-25 matches             | ✅ Matches    |
  | sandbox.css conflicts with globals.css               | :root tokens + .dark variant confirmed          | ❌ CONFLICT   |
  | Design ideas: only current + my_list_sidebar         | Also sandbox-landing-page exists                | ⚠️ Incomplete |

  ---
  🏗️ Architectural Assessment

  What's Sound

  - ✅ Features-first pattern (src/features/) - correct for code sharing
  - ✅ Phased approach with checkpoints - proper strangler fig pattern
  - ✅ Sandbox isolation - safe experimentation before production
  - ✅ Thin wrapper pattern - minimal duplication between sandbox and production

  What's Missing

  - ❌ Storage isolation - sandbox can corrupt production localStorage
  - ❌ CI/CD integration - all validation is manual
  - ❌ Cleanup phase - no Phase 6 for removing sandbox stubs post-promotion
  - ❌ Runtime feature flags - no instant rollback capability

  ---
  📋 Prioritized Action List

  P0 - Must Fix Before Execution (BLOCKING)

  1. Fix sandbox.css :root token collision → Scope under .sandbox-scope or delete lines 101-134
  2. Fix sandbox.css dark mode variant → Remove line 19 or change to [data-theme="dark"]
  3. Add security warning for Gemini API → Explicit "DO NOT PORT geminiService.ts" in Phase 3

  P1 - Fix During Execution (High Value)

  4. Add sandbox-landing-page to Phase 1 inventory
  5. Add src/features/ to vitest coverage config
  6. Fix TypeScript snippets: add return types, props interfaces, use @/ imports
  7. Update test examples: use userEvent, add waitFor
  8. Add explicit Phase 0 baseline regression check to Phase 4

  P2 - Improve for Sustainability

  9. Implement runtime feature flags (cookie-based toggle)
  10. Make Gemini API route handler a required Task
  11. Add storage isolation prefix for sandbox experiments
  12. Automate visual regression in CI (make Playwright non-optional)
  13. Add Phase 6 for cleanup/archival

  ---
  ✅ Conclusion

  The 6-phase migration plan is architecturally well-designed and follows industry-standard patterns (strangler fig, features-first, phased rollout). However, three critical CSS/token issues have persisted through 4 rounds of prior review and remain unresolved in the actual codebase:

  1. sandbox.css defines :root tokens that will override production
  2. sandbox.css uses .dark class but app uses data-theme
  3. Design prototype exposes Gemini API key client-side

  These issues MUST be fixed in the actual code files before any phase execution. The documentation acknowledges the problems but doesn't mandate explicit, non-optional remediation steps.

  ---

⏺ Review complete. Three specialized agents examined the plans:

  1. Architecture Strategist - Validated phased structure, identified missing storage isolation, cleanup phase, and CI/CD integration
  2. TypeScript Expert - Found 16 TypeScript issues including critical hydration risks in styled-components registry and unsafe API route patterns
  3. Code Reviewer - Confirmed prior review issues remain unaddressed, identified security risk with Gemini API key exposure

  Key finding: The same 3 critical issues (token collision, dark mode mismatch, sandbox-landing-page missing) were identified by all three agents and remain unresolved after 4 prior review rounds. The documentation acknowledges these problems but the actual code in sandbox.css has not been fixed.
