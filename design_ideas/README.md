# Design Ideas Vault

This folder is the **raw input vault** for design experiments. Ideas collected here are
tested safely inside the Next.js app's `/sandbox` routes before being promoted to production.

## Quick Start

1. Drop your design file/folder here
2. Run `cd loomis-course-app && npm run sandbox:sync` to generate a sandbox wrapper
3. Edit the generated page to import/adapt your component
4. Add an entry to `experiments.ts` to show it in the sandbox index
5. View at `http://localhost:3001/sandbox/[category]/[slug]`

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

## Related Documentation

- Full workflow plan: `docs/plans/2025-12-27-sandbox-workflow.md`
- Sandbox source: `loomis-course-app/src/app/sandbox/`
- Experiment registry: `loomis-course-app/src/app/sandbox/experiments.ts`
