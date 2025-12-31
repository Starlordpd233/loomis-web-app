# Design Idea: browser/current

> **Inventory created:** 2025-12-31 during Phase 1 migration

## Overview

This is the Loomis Chaffee Catalog Explorer - an AI-enhanced course exploration app built with Google AI Studio and Gemini API.

## Framework & Build

| Category | Version | Notes |
|----------|---------|-------|
| React | 19.2.3 | Latest React version |
| Vite | 6.2.0 | Build tool |
| TypeScript | ~5.8.2 | Type checking |

## Dependencies

### Runtime
- `@google/genai`: ^1.34.0 - Gemini AI integration
- `lucide-react`: ^0.562.0 - Icons
- `styled-components`: ^6.1.19 - CSS-in-JS styling
- `@types/styled-components`: ^5.1.36 - Type definitions

### Dev
- `@vitejs/plugin-react`: ^5.0.0
- `@types/node`: ^22.14.0
- `typescript`: ~5.8.2
- `vite`: ^6.2.0

## File Structure

```
current/
├── App.tsx                 # Main app (867 lines) - needs component extraction
├── index.tsx               # Entry point
├── index.html              # HTML template
├── data.ts                 # Course data
├── types.ts                # TypeScript types
├── vite.config.ts          # Vite configuration
├── components/
│   └── MyListPanel.tsx     # List panel component (15KB)
├── services/
│   └── geminiService.ts    # Gemini AI service
└── metadata.json           # App metadata
```

## Assets

### External Assets (Need Localization)
| Type | URL | Line | Purpose |
|------|-----|------|---------|
| Placeholder Images | `https://picsum.photos/seed/...` | App.tsx:675 | Student avatars |

### Local Assets
- **None** - No local images, fonts, or media files

### Inline SVG
- Line 43: Search icon inline SVG

## Vite-Specific Code

- **None detected** - No `import.meta.env` or Vite-specific imports in App.tsx
- Vite config is standard React SWC setup

## Migration Considerations

### High Priority
1. **Large App.tsx (867 lines)** - Needs component extraction before sandbox mounting
2. **styled-components usage** - May need adjustment for Next.js 15 compatibility
3. **External picsum.photos** - Should replace with local placeholder or remove

### Medium Priority
1. **Gemini API integration** - Requires environment variable setup for `GEMINI_API_KEY`
2. **React 19** - Already on latest, good compatibility with Next.js 15

### Low Priority
1. **Type definitions** - Already TypeScript, minimal migration needed

## Entry Point Requirements

- Main component: Default export from App.tsx
- Renders full catalog explorer UI
- Needs environment variable: `GEMINI_API_KEY`

## Notes

- Created via Google AI Studio export
- README references AI Studio URL: https://ai.studio/apps/temp/1
- Self-contained application with no external local dependencies
