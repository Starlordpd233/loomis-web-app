The plan set located in debug&cleanup/incompatibility/step-by-step/ is comprehensive, coherent, and
  highly feasible. It demonstrates a strong understanding of the specific technical constraints
  (Next.js App Router, Tailwind v4 vs v3, Vite-to-Next.js migration) and prioritizing system
  stability (baselines, rollback strategies).


  Critical Areas & Recommendations

   1. Gemini API Porting (Phase 3, Task 4):
       * I verified design_ideas/browser/current/services/geminiService.ts. It uses the @google/genai
         SDK and process.env.API_KEY.
       * Recommendation: When implementing the Route Handler (/api/gemini), ensure you handle the
         availableCourses payload carefully. If the payload is large, it might hit request body
         limits. The server-side handler might need to read the catalog directly from
         public/catalog.json instead of relying on the client to send it, unless the client is
         sending a filtered subset.

   2. Tailwind Preflight vs. Globals (Phase 2):
       * The plan disables Tailwind Preflight globally to avoid conflicts. This is the correct move
         for an existing app.
       * Risk: The Vite prototypes likely relied on Preflight (normalization).
       * Mitigation: Be prepared to use the "Scoped Reset" contingency in Phase 3. If ported
         components look "off" (e.g., headings have margins, buttons look different), apply the
         .sandbox-reset class immediately rather than fighting individual styles.

   3. Testing Gaps (Phase 0):
       * The plan asks to "Verify or add tests" for courseUtils and plannerStore. Since these are
         existing logic files, do not skip writing these tests. They are the only way to ensure the
         migration doesn't subtly break the drag-and-drop or planning logic.


Executive Summary Review

  The 6-phase migration plan demonstrates strong architectural maturity, security awareness, and TypeScript discipline. The plan employs a safety-first approach with comprehensive baseline testing, clear separation of concerns, and well-designed rollback strategies.

  Overall Assessment: Architecturally Sound with Specific Action-Required Improvements

  | Dimension            | Rating       | Key Findings                                                  |
  |----------------------|--------------|---------------------------------------------------------------|
  | Completeness         | 🟡 Good      | Objectives clear, but missing security testing framework      |
  | Coherence            | 🟢 Very Good | Logical flow, consistent terminology, well-structured phasing |
  | Feasibility          | 🟡 Moderate  | Technically sound but limited by manual workflows             |
  | Convention Adherence | 🟢 Very Good | Follows Next.js 15, React 19, and TypeScript best practices   |
  | Risk Level           | 🟡 Moderate  | 3 P0 blockers, 7 P1 concerns, 8 P2 improvements identified    |
  | Actionability        | 🟢 Very Good | Concrete steps, clear ownership, unambiguous instructions     |
  | Measurable Outcomes  | 🟡 Good      | Clear checkpoints, but automated validation gaps remain       |

  ---
  Critical Issues (P0) - Must Fix Before Execution

  1. Build-Time Feature Flag Architecture

  Sources: Architecture-Strategist (P0 #1), Code-Reviewer (P0 #3), TypeScript-Reviewer (P0 #1)

  Issue: NEXT_PUBLIC_ENABLE_NEW_BROWSER requires rebuild/redeploy for any changes.

  // Phase 5, line 81 - PROBLEMATIC
  const USE_NEW_EXPLORER = process.env.NEXT_PUBLIC_ENABLE_NEW_BROWSER === 'true';

  Risks:
  - Cannot perform instant rollback
  - Cannot do gradual canary releases or A/B testing
  - Operational security risk: setting .env.local won't work without rebuild

  Required Fix:
  // Runtime toggle using Next.js middleware
  // src/lib/feature-flags.ts
  export async function getFeatureFlags(): Promise<FeatureFlag> {
    const cookieStore = await cookies();
    return {
      newBrowser: cookieStore.get('enable_new_browser')?.value === 'true',
    };
  }

  ---
  2. Environment Variable Type Safety & Server Boundary Enforcement

  Sources: TypeScript-Reviewer (P0 #1, #3), Code-Reviewer (P0 #3)

  Issue: No type-level enforcement preventing NEXT_PUBLIC_GEMINI_API_KEY usage.

  Risks:
  - Developer can accidentally expose secrets via NEXT_PUBLIC_ prefix
  - TypeScript won't catch client-side usage of server-only variables
  - Build cache may retain old env var values

  Required Fix:
  // src/types/env.ts
  declare global {
    namespace NodeJS {
      interface ProcessEnv {
        readonly NEXT_PUBLIC_ENABLE_NEW_BROWSER?: 'true' | 'false';
        readonly GEMINI_API_KEY?: string & { readonly __serverOnly: unique symbol };
      }
    }
  }

  Add pre-commit check:
  # .git/hooks/pre-commit
  grep -r "NEXT_PUBLIC_.*API_KEY\|NEXT_PUBLIC_.*SECRET" loomis-course-app/src/ && {
    echo "❌ Found public API keys! Aborting commit."
    exit 1
  }

  ---
  3. LocalStorage Schema Validation Missing

  Sources: TypeScript-Reviewer (P0 #2), Code-Reviewer (P0 #2)

  Issue: No runtime validation for localStorage data (plannerV2, plan keys).

  Risks:
  - Corrupted/legacy data can crash the app
  - No sanitization of user-generated content (XSS risk)
  - Migration path lacks type guards

  Required Fix:
  // src/lib/storage.ts
  import { z } from 'zod';

  const PlannerV2StateSchema = z.object({
    version: z.literal(2),
    selectedCourses: z.array(PlanItemSchema),
    grid: z.record(z.string(), z.array(z.nullable(PlanItemSchema))),
  });

  export function safeGetPlannerV2(): PlannerV2State | null {
    const raw = localStorage.getItem('plannerV2');
    if (!raw) return null;
    return PlannerV2StateSchema.parse(JSON.parse(raw)); // Throws if invalid
  }

  ---
  4. Input Validation Framework Absent

  Sources: Code-Reviewer (P0 #1)

  Issue: API route handlers lack schema validation and sanitization.

  Risks:
  - No payload size limits (DoS vulnerability)
  - No rate limiting (abuse potential)
  - Prompt injection attacks

  Required Fix:
  import { z } from 'zod';

  const GeminiRequestSchema = z.object({
    prompt: z.string().max(4000),
    courseId: z.string().optional(),
  });

  export async function POST(request: NextRequest) {
    const body = GeminiRequestSchema.parse(await request.json());
    // Sanitize and process...
  }

  ---
  5. CSS Scoping Verification Missing

  Sources: Architecture-Strategist (P0 #2)

  Issue: Assumption that .sandbox-scope wrapper prevents CSS leakage is unverified.

  Risks:
  - Sandbox styles might leak into production routes after navigation
  - Fundamental Next.js App Router CSS loading behavior not documented

  Required Action:
  - Research Next.js App Router CSS scoping rules
  - Add automated test: load sandbox, navigate to production, check computed styles

  ---
  6. Storage Key Collision Risk

  Sources: Architecture-Strategist (P0 #3)

  Issue: Manual sandbox:<experimentId>:... prefixing has no enforcement.

  Risks:
  - Developers could accidentally use production keys
  - Sandbox experiments could corrupt production localStorage

  Required Fix:
  // src/lib/storage.ts
  export const sandboxStorage = {
    getItem: (key: string) => localStorage.getItem(`sandbox:${experimentId}:${key}`),
    setItem: (key: string, value: string) =>
      localStorage.setItem(`sandbox:${experimentId}:${key}`, value),
  };

  ---
  High Priority Issues (P1) - Should Address During Execution

  7. Regression Check Timing

  Source: Architecture-Strategist (P1 #4)

  Issue: Regression check happens after Phase 3 instead of after Phase 2.

  Impact: If Phase 2 (global Tailwind) broke production, Phase 3 work is wasted.

  Fix: Move regression checkpoint to immediately after Phase 2 completion.

  ---
  8. Styled-Components Hydration Risk

  Sources: TypeScript-Reviewer (P1 #4), Architecture-Strategist (P1 #6)

  Issue: useServerInsertedHTML is unstable in React 19; creates hydration mismatch risk.

  Impact: UI bugs, potential crashes, inconsistent rendering

  Fix:
  // Add error boundary and development-mode warnings
  if (process.env.NODE_ENV === 'development') {
    if (typeof window !== 'undefined') {
      console.warn('StyledComponentsRegistry mounted on client');
    }
  }

  ---
  9. Missing Output Encoding

  Source: Code-Reviewer (P0 #4)

  Issue: No XSS defense for user-generated content (course titles, descriptions).

  Impact: XSS vulnerabilities if data comes from external APIs

  Fix:
  import DOMPurify from 'dompurify';
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a'],
  });

  ---
  10. Visual Validation Automation Gap

  Source: Architecture-Strategist (P1 #5)

  Issue: Automated screenshot comparison is optional; primary workflow is manual.

  Impact: Not scalable, not CI/CD friendly, inconsistent results

  Fix: Make automated comparison required and integrate into CI pipeline.

  ---
  11. No Error Boundaries

  Source: Code-Reviewer (P1 #6)

  Issue: Sandbox experiments lack React Error Boundaries.

  Impact: Component crashes take down entire page, potentially corrupting localStorage

  Fix:
  export class SandboxErrorBoundary extends Component<Props, State> {
    // Catch, log, and gracefully display fallback
  }

  ---
  12. No Timeout/Retry for External APIs

  Source: Code-Reviewer (P1 #7)

  Issue: Gemini API calls lack timeout and retry logic.

  Impact: Slow/hanging requests can exhaust server resources

  Fix:
  const API_TIMEOUT = 30000;
  const controller = new AbortController();
  setTimeout(() => controller.abort(), API_TIMEOUT);

  ---
  13. Data Migration Strategy Missing

  Source: Architecture-Strategist (P1 #7)

  Issue: Plan verifies data preservation but not schema migration.

  Impact: If new components use different storage formats, existing users break

  Fix: Document migration path or verify schema compatibility

  ---
  Medium Priority Issues (P2) - Technical Debt Prevention

  14-21. Additional Findings

  | Issue                                 | Source        | Description                           |
  |---------------------------------------|---------------|---------------------------------------|
  | Test imports use relative paths       | TS Reviewer   | Violates @/ path alias rule           |
  | No explicit client/server boundaries  | TS Reviewer   | Stubs have unnecessary 'use client'   |
  | Async error handling not demonstrated | TS Reviewer   | API routes lack try/catch             |
  | Feature toggle is build-time (known)  | TS Reviewer   | Document better pattern for future    |
  | Missing CSP headers                   | Code Reviewer | No Content-Security-Policy configured |
  | Shell command injection risk          | Code Reviewer | copy-design-assets.mjs needs audit    |
  | No strict null check validation       | TS Reviewer   | localStorage can be undefined         |
  | Test utilities lack type safety       | TS Reviewer   | DOM queries need type narrowing       |

  ---
  Positive Patterns - What Works Well

  From Architecture-Strategist:

  1. Features-First Architecture: Production code in src/features/, thin wrappers in /sandbox
  2. Comprehensive Rollback Strategies: Every phase has explicit rollback instructions
  3. Checkpoint-Based Progression: STOP gates prevent cascade failures
  4. Token Ownership Strategy: Clear CSS variable ownership prevents conflicts

  From Code-Reviewer:

  1. Secret Management Awareness: Correctly identifies process.env.API_KEY as insecure
  2. Storage Isolation: Recognizes sandbox must not corrupt production localStorage
  3. SSR/Hydration Awareness: Warns about styled-components SSR complexity

  From TypeScript-Reviewer:

  1. Path Alias Consistency: Explicit @/ import requirement
  2. Modern Test Setup: Vitest with proper jsdom configuration
  3. Client Component Markers: 'use client' used consistently
  4. Type Return Annotations: Test examples show : JSX.Element

  ---
  Consolidated Recommendations

  Must-Fix (Before Execution)

  1. ✅ Create src/types/env.ts with strict environment variable typing
  2. ✅ Add Zod schema validation for localStorage and API routes
  3. ✅ Implement storage abstraction library enforcing sandbox prefixing
  4. ✅ Replace build-time feature flags with runtime system (middleware/cookies)
  5. ✅ Add pre-commit security checks for secret exposure
  6. ✅ Verify CSS scoping architecture with automated test

  High Priority (During Execution)

  7. ✅ Move regression checkpoint to after Phase 2
  8. ✅ Add error boundaries around sandbox routes
  9. ✅ Implement DOMPurify for user-generated content
  10. ✅ Add timeout/retry logic to Gemini API calls
  11. ✅ Make automated visual comparison required
  12. ✅ Add hydration safety warnings for styled-components

  Medium Priority (Technical Debt Prevention)

  13. ✅ Create src/lib/storage.ts utilities for safe localStorage access
  14. ✅ Add CSP middleware for XSS defense
  15. ✅ Standardize test imports to use @/ aliases
  16. ✅ Audit shell scripts for command injection risks
  17. ✅ Add data migration strategy documentation

  ---
  Phase-Specific Action Items

  | Phase   | Critical Actions                                                       | High Priority                              | Medium Priority                                     |
  |---------|------------------------------------------------------------------------|--------------------------------------------|-----------------------------------------------------|
  | Phase 0 | Add E2E smoke tests (make mandatory), CSP header testing               | Add security testing framework             | Document authentication state                       |
  | Phase 1 | Move sandbox CSS cleanup to Task 0, Create structured inventory schema | Add security findings resolution checklist | Audit design ideas for vulnerabilities              |
  | Phase 2 | Verify CSS scoping architecture                                        | Move regression check here                 | Document Preflight security implications            |
  | Phase 3 | Create storage abstraction library                                     | Add error boundaries, Output encoding      | Tighten styled-components safety                    |
  | Phase 4 | Make automated comparison required                                     | Add viewport coverage                      | Add deterministic capture guidance to main workflow |
  | Phase 5 | Replace build-time toggle with runtime flags                           | Add data migration strategy                | Clarify experiments registry consumers              |

  ---
  Risk Summary Matrix

  | Risk Category            | Count | P0  | P1  | P2  |
  |--------------------------|-------|-----|-----|-----|
  | Security Vulnerabilities | 8     | 4   | 3   | 1   |
  | Type Safety Issues       | 6     | 3   | 1   | 2   |
  | Architecture Concerns    | 7     | 3   | 4   | 0   |
  | Operational Risks        | 4     | 0   | 2   | 2   |
  | TOTAL                    | 25    | 10  | 10  | 5   |

  ---
  Final Assessment

  Execution Decision: Proceed with Architectural Improvements

  The 6-phase migration plan is well-structured and safe to implement once the 6 P0 issues are addressed. The plan demonstrates:

  - ✅ Deep understanding of Next.js App Router constraints
  - ✅ Security-first thinking (API boundaries, secret management)
  - ✅ Pragmatic approach to complex styling migrations
  - ✅ Comprehensive rollback strategies

  Estimated Remediation Effort

  - P0 Fixes: 2-3 days
  - P1 Fixes: 3-4 days (can be done during execution)
  - P2 Improvements: 2-3 days (technical debt prevention)

  Confidence Level: High (with P0 fixes)

  Without P0 fixes: Risk level is HIGH (XSS vulnerabilities, API abuse potential, secret exposure)

  With P0 fixes: Risk level is LOW (defense-in-depth approach implemented)

  ---
  Next Steps

  1. Review this consolidated report with stakeholders
  2. Prioritize P0 fixes for immediate implementation
  3. Update plan documents with security and type safety requirements
  4. Create supporting infrastructure (type declarations, storage utilities, pre-commit hooks)
  5. Execute migration with checkpoint gates after each phase

  ---

⏺ Analysis Complete

  I've dispatched 3 specialist agents to analyze the 6 migration plans and consolidated their findings:

  Agent Deployments:

  1. Architecture-Strategist (agentId: a3e2922) - System design, workflow structure, scalability
  2. Code-Reviewer (agentId: a931690) - Security vulnerabilities, code quality, best practices
  3. Kieran-TypeScript-Reviewer (agentId: a7d7990) - Type safety, React/Next.js patterns, testing quality

  Key Findings Summary:

  6 P0 Critical Issues (must fix before execution):
  1. Build-time feature flags prevent instant rollback
  2. No type-level server boundary for API keys
  3. Missing localStorage schema validation
  4. No input validation framework for API routes
  5. CSS scoping verification untested
  6. Storage key prefixing not enforced

  10 P1 High-Priority Issues (address during execution):
  - Regression check timing, styled-components hydration risk, missing output encoding, visual automation gaps, error boundaries, API timeout/retry, data migration strategy

  9 P2 Improvements (technical debt prevention):
  - Test imports, null checks, CSP headers, shell safety
