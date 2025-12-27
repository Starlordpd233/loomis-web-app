# Design Ideas Vault

This folder is the **raw input vault** for design experiments. Ideas collected here are tested safely inside the Next.js app's `/sandbox` routes before being promoted to production.

## Quick Start

1. Drop your design file/folder here
2. Run `cd loomis-course-app && npm run sandbox:sync` to generate a sandbox wrapper
3. Edit the generated page to import/adapt your component
4. Add an entry to `experiments.ts` to show it in the sandbox index
5. View at `http://localhost:3001/sandbox/[category]/[slug]`

## Purpose

The `/sandbox` route provides an isolated environment for prototyping new UI ideas using Tailwind CSS without affecting the main application styles.

## Folder Structure

```
design_ideas/
├── README.md              # This file
├── browser/               # Course browser ideas
│   ├── idea1.tsx         # TSX snippet
│   ├── coze/             # Standalone Vite app
│   │   └── package.json
│   └── filter-panel/     # Static HTML prototype
│       └── index.html
├── planner/               # Planner grid ideas
├── marketing/             # Landing page ideas
└── components/            # Reusable component ideas
```

## Adding an Experiment

### Step 1: Create Experiment File

Add your design file to the appropriate category folder:

```bash
# Add a TSX snippet
touch design_ideas/browser/my-new-component.tsx

# Or create a static HTML prototype
mkdir design_ideas/browser/my-prototype
touch design_ideas/browser/my-prototype/index.html
```

### Step 2: Sync to Sandbox

```bash
cd loomis-course-app
npm run sandbox:sync
```

This generates:
- Wrapper page for TSX snippets
- Static page for HTML prototypes
- Reference entry in `experiments.ts`

### Step 3: Test

Navigate to `/sandbox/[category]/[slug]`

### Step 4: Iterate

Edit in `design_ideas/` and re-run sync, or edit directly in `loomis-course-app/src/app/sandbox/`

## Supported Source Types

| Type | Detection | Sandbox Handling |
|------|-----------|------------------|
| **TSX Snippet** | `.tsx` or `.jsx` file | Generates wrapper page, you copy component code |
| **Static HTML** | Folder with `index.html` | Copies to `public/sandbox-static/`, embeds via iframe |
| **Image** | `.png`, `.jpg`, `.webp`, etc. | Copies to `public/sandbox-assets/`, creates viewer page |
| **Standalone App** | Folder with `package.json` | Creates reference page with run instructions |

## Naming Conventions

- Use lowercase with hyphens: `department-cards-v2.tsx`
- Category folders match sandbox route: `browser/` → `/sandbox/browser/`
- Descriptive names over numbered: `filter-panel/` not `idea1/`

## Experiment Lifecycle

```
┌─────────┐     ┌─────┐     ┌───────┐     ┌──────────┐
│  vault  │ ──► │ wip │ ──► │ ready │ ──► │ promoted │
└─────────┘     └─────┘     └───────┘     └──────────┘
    │               │           │
    │               ▼           ▼
    │          ┌──────────┐
    └────────► │ archived │
               └──────────┘
```

| Status | Meaning | Location |
|--------|---------|----------|
| (vault) | Raw idea, not yet in sandbox | `design_ideas/` |
| `wip` | Work in progress, actively iterating | Sandbox Index |
| `ready` | Passes quality checks, ready for review | Sandbox Index |
| `archived` | Not pursuing, kept for reference | Sandbox Archive |

## Archiving Experiments

Move experiments to archived status:

1. Set `status: 'archived'` in `experiments.ts`
2. Or move to `design_ideas/archived/` folder

Archived experiments remain accessible but are hidden from the main list.

## Design Guidelines

### Tailwind CSS

Use Tailwind utility classes for styling:

```tsx
<div className="p-4 bg-white rounded-lg shadow">
  <h1 className="text-xl font-semibold text-gray-800">
    Experiment Title
  </h1>
</div>
```

### Component Structure

```tsx
// Good: Focused component
function ExperimentCard({ title, description }) {
  return (
    <div className="p-4 border rounded">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

// Good: Self-contained page
export default function MyExperimentPage() {
  return (
    <div className="container mx-auto py-8">
      <ExperimentCard title="Test" description="Demo" />
    </div>
  );
}
```

### Design Tokens

Available via Tailwind theme (configured in `tailwind.config.ts`):

- Colors: `text-primary`, `bg-secondary`, `border-accent`
- Spacing: `space-4`, `space-8`
- Typography: `text-sm`, `text-lg`, `font-bold`

## Manual Registration

If you prefer not to use the CLI, manually:

1. Create the route folder:
   ```
   loomis-course-app/src/app/sandbox/[category]/[slug]/page.tsx
   ```

2. Add `'use client'` if using React hooks

3. Add entry to `experiments.ts`:
   ```typescript
   {
     name: 'My Experiment',
     description: 'What it demonstrates',
     path: '/sandbox/[category]/[slug]',
     status: 'wip',
     frameworks: ['Tailwind CSS'],
   }
   ```

## Troubleshooting

### Styles not applying

Ensure Tailwind classes are valid and build completed.

### 404 on experiment

Verify:
1. Directory exists: `sandbox/[category]/[slug]/`
2. `page.tsx` exists in directory
3. Entry in `experiments.ts`

### Changes not visible

Try hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Best Practices

1. **Keep experiments focused** - One experiment, one purpose
2. **Document clearly** - Explain what you're testing
3. **Use semantic HTML** - Accessibility matters
4. **Test responsiveness** - Mobile and desktop views
5. **Clean up** - Archive or remove experiments when done

## Related Documentation

- [Architecture](../docs/architecture.md) - System architecture
- [Testing Guide](../docs/TESTING.md) - Testing UI components
- [CONTRIBUTING.md](../CONTRIBUTING.md) - Contribution guidelines
- Full workflow plan: `docs/plans/2025-12-27-sandbox-workflow.md`
- Sandbox source: `loomis-course-app/src/app/sandbox/`
- Experiment registry: `loomis-course-app/src/app/sandbox/experiments.ts`
