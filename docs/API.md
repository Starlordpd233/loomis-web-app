# API Reference

Auto-generated documentation for all public APIs. This document serves as an index to the auto-generated TypeDoc output.

## Generating Documentation

```bash
cd loomis-course-app

# Install TypeDoc (if not already installed)
npm install --save-dev typedoc

# Generate API docs
npm run docs:generate

# Preview locally
npm run docs:serve
# View at http://localhost:3000
```

## Key Modules

### Course Utilities (`src/lib/courseUtils.ts`)

| Function | Description |
|----------|-------------|
| `flattenDatabase()` | Normalize raw catalog JSON to Course[] |
| `filterCourses()` | Filter courses by search and department |
| `deriveTags()` | Extract tags from course properties |

### State Management (`src/lib/plannerStore.ts`)

| Hook/Function | Description |
|---------------|-------------|
| `usePlannerStore()` | React hook for planner state |
| `saveState()` | Persist state to localStorage |
| `loadState()` | Load state from localStorage |

### Types (`src/types/course.ts`)

| Type | Description |
|------|-------------|
| `Course` | Normalized course data |
| `RawCatalog` | Raw catalog JSON structure |
| `PlannerV2State` | Complete planner state |
| `YearKey` | Year labels (Freshman, Sophomore, etc.) |

## TSDoc Tags Used

| Tag | Purpose | Example |
|-----|---------|---------|
| `@param` | Parameter documentation | `@param catalog - Raw catalog object` |
| `@returns` | Return value documentation | `@returns Array of normalized courses` |
| `@example` | Usage example | `@example \`ts const courses = ...\`` |
| `@remarks` | Additional notes | `@remarks Derives tags like GESC, PPR...` |
| `@see` | Cross-reference | `@see Course type for normalized structure` |
| `@link` | External link | `@link https://example.com` |

## TSDoc Comment Example

```typescript
/**
 * Normalize raw catalog JSON to normalized Course[] array
 *
 * @param catalog - Raw catalog object with departments array
 * @returns Array of normalized Course objects with derived tags
 *
 * @example
 * ```ts
 * import { flattenDatabase } from '@/lib/courseUtils';
 * const courses = flattenDatabase(catalogData);
 * ```
 *
 * @remarks
 * This function derives tags like GESC, PPR, CL, ADV from raw course properties.
 * See {@link Course} type for the normalized structure.
 */
export function flattenDatabase(catalog: RawCatalog): Course[]
```

## IDE Integration

TypeDoc comments display in:

- **VS Code**: Hover over functions/types
- **IntelliJ**: Quick documentation (Ctrl+Q)
- **WebStorm**: Quick documentation (Ctrl+J)

Install the TypeDoc extension for enhanced features.

## TypeDoc Configuration

Create `typedoc.json` in `loomis-course-app/`:

```json
{
  "entryPoints": ["src/lib/courseUtils.ts", "src/lib/plannerStore.ts", "src/types/course.ts"],
  "out": "docs/api",
  "tsconfig": "tsconfig.json",
  "plugin": ["typedoc-plugin-zod"],
  "validation": {
    "notExported": true,
    "invalidLink": true
  }
}
```

## API Stability

- Public APIs marked with TSDoc are considered stable
- Breaking changes require deprecation period
- Review [DECISIONS.md](DECISIONS.md) for architectural context
