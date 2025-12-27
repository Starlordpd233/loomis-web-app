# Architecture Decision Records

Major architectural and technical decisions.

## ADR-001: Use Next.js App Router

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

Need to choose between Next.js App Router and Pages Router for the new application.

### Decision

Next.js 15 App Router with React Server Components.

### Reasoning

- **RSC Benefits**: Server components reduce client bundle size
- **Built-in Features**: Layouts, error boundaries, streaming
- **Future-Proof**: App Router is the direction Next.js is heading
- **Route Groups**: Clean separation of marketing vs app layouts

### Consequences

| Pros | Cons |
|------|------|
| RSC performance benefits | Learning curve for team |
| Built-in layouts and error boundaries | Some ecosystem libraries need适配 |
| Streaming and Suspense support | Migration path from Pages is complex |
| Cleaner route organization | |

### Alternatives Considered

- **Pages Router**: Rejected - less future-proof
- **Remix**: Rejected - team familiarity with Next.js

**Revisit:** If App Router proves unstable or has critical bugs

---

## ADR-002: Use Tailwind CSS

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

Need to choose a styling approach for the application.

### Decision

Tailwind CSS with custom design tokens for consistent theming.

### Reasoning

- **Rapid Development**: Utility classes speed up prototyping
- **Consistency**: Design tokens ensure visual consistency
- **Performance**: Purge unused styles at build time
- **Learning Curve**: Team already familiar with Tailwind

### Consequences

| Pros | Cons |
|------|------|
| Rapid UI development | Larger HTML markup |
| Consistent design system | Learning curve for new team members |
| Easy responsive design | Can lead to class soup without components |
| Small production bundle | |

### Alternatives Considered

- **CSS Modules**: Rejected - slower development
- **Styled Components**: Rejected - runtime overhead
- **Vanilla CSS**: Rejected - no design system

---

## ADR-003: Client-Side State Management

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

Need to choose state management for the course planner.

### Decision

Custom hook (`usePlannerStore`) + localStorage persistence. No external state library.

### Reasoning

- **Simplicity**: No boilerplate, easy to understand
- **Learning Curve**: Minimal, just React hooks
- **Size**: Zero external dependencies
- **Requirements**: LocalStorage is sufficient for this use case

### Consequences

| Pros | Cons |
|------|------|
| Simpler mental model | No time-travel debugging |
| No boilerplate | Limited devtools |
| No external dependencies | Harder to scale if requirements grow |

### Alternatives Considered

- **Redux**: Rejected - too much boilerplate
- **Zustand**: Considered but custom hook is simpler
- **React Context**: Considered but custom hook is more flexible

**Revisit:** If we need server state management or complex caching

---

## ADR-004: TypeScript Strict Mode

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

TypeScript configuration decisions for the project.

### Decision

Enable `strict: true` in `tsconfig.json` with additional strict settings.

### Configuration

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Reasoning

- **Catch Bugs Early**: Strict mode catches errors at compile time
- **Better IDE Support**: Autocomplete and type inference improve
- **Documentation**: Types serve as documentation
- **Refactoring Safety**: Type changes caught at compile time

### Consequences

| Pros | Cons |
|------|------|
| Catch bugs at compile time | More explicit typing required |
| Better IDE autocomplete | Sometimes verbose |
| Self-documenting code | Learning curve for strict typing |

---

## ADR-005: Monorepo vs Single Repo

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

Project structure decision for the codebase.

### Decision

Single repository for now, with clear directory structure.

### Reasoning

- **Simplicity**: Easier setup and tooling
- **CI/CD**: Simpler deployment pipeline
- **Team Size**: Small team doesn't need monorepo complexity
- **Current Scope**: Single application with no plans to split

### Structure

```
web_dev_lc/
├── loomis-course-app/     # Main application
├── prep_data/             # Data pipeline
├── design_ideas/          # Prototyping
└── docs/                  # Documentation
```

### Consequences

| Pros | Cons |
|------|------|
| Simpler setup | Harder to split later if needed |
| Easier deployment | Potential for dependency conflicts |
| Less tooling overhead | No shared packages between projects |

**Revisit:** If we need to add more applications or shared packages

---

## ADR-006: Course Data Format

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

Format for storing and serving course catalog data.

### Decision

Static JSON file (`public/catalog.json`) processed at build/run time.

### Reasoning

- **Simplicity**: No database required
- **Performance**: Fast reads, easy caching
- **Versioning**: JSON is easy to version control
- **Source**: PDF → Markdown → JSON pipeline already established

### Data Flow

1. Source PDFs in `prep_data/department_pdfs/`
2. Extracted to Markdown, then JSON
3. Final catalog in `public/catalog.json`
4. `flattenDatabase()` normalizes at runtime

### Consequences

| Pros | Cons |
|------|------|
| No database overhead | Manual updates require pipeline |
| Easy to version control | Limited query capabilities |
| Fast reads | No real-time updates |

**Revisit:** If we need real-time updates or complex queries

---

## ADR-007: Route Group Organization

**Status:** Accepted
**Date:** 2025-01-15
**Author:** Development Team

### Context

How to organize routes in Next.js App Router.

### Decision

Use route groups to separate concerns:

- `(marketing)/` - Landing, login (minimal chrome)
- `(app)/` - Main features (full header/nav)
- `sandbox/` - Design experiments (isolated)

### Reasoning

- **Clear Separation**: Different layouts for different contexts
- **Organization**: Related routes grouped logically
- **Scalability**: Easy to add new feature groups

### Consequences

| Pros | Cons |
|------|------|
| Clean route organization | URL doesn't reflect group structure |
| Different layouts per group | Need to remember group names |
| Isolated styling for sandbox | |

---

## Adding New ADRs

When making significant architectural decisions:

1. Create new ADR with template below
2. Document context, decision, and reasoning
3. Note alternatives considered
4. Add to this file
5. Link from related code/files

### ADR Template

```markdown
## ADR-XXX: [Title]

**Status:** [Accepted|Rejected|Deprecated]
**Date:** YYYY-MM-DD
**Author:** Name

### Context

[Description of the situation and decision needed]

### Decision

[What was decided]

### Reasoning

[Why this decision was made]

### Consequences

| Pros | Cons |
|------|------|
| [Positive outcome] | [Negative outcome] |

### Alternatives Considered

- [Alternative 1]: [Why rejected]
- [Alternative 2]: [Why rejected]

**Revisit:** [When to reconsider this decision]
```
