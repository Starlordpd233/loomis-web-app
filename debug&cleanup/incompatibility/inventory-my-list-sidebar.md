# Design Idea: browser/my_list_sidebar

> **Inventory created:** 2025-12-31 during Phase 1 migration

## Overview

This is the Loomis Chaffee Course Browser with My List sidebar - a course exploration app with list management built with Google AI Studio.

## Framework & Build

| Category | Version | Notes |
|----------|---------|-------|
| React | 19.2.3 | Latest React version |
| Vite | 6.2.0 | Build tool |
| TypeScript | ~5.8.2 | Type checking |

## Dependencies

### Runtime
- `lucide-react`: ^0.562.0 - Icons

### Dev
- `@vitejs/plugin-react`: ^5.0.0
- `@types/node`: ^22.14.0
- `typescript`: ~5.8.2
- `vite`: ^6.2.0

**Note:** Simpler than `browser/current` - no styled-components, no AI integration.

## File Structure

```
my_list_sidebar/
├── App.tsx                 # Main app (183 lines) - manageable size
├── index.tsx               # Entry point
├── index.html              # HTML template
├── types.ts                # TypeScript types
├── vite.config.ts          # Vite configuration
└── components/
    ├── CourseCard.tsx      # Course display (3.6KB)
    ├── Header.tsx          # App header (1.7KB)
    ├── MyListPanel.tsx     # List panel (11KB)
    ├── Sidebar.tsx         # Navigation sidebar (3.5KB)
    └── StatCard.tsx        # Statistics display (0.8KB)
```

## Assets

### External Assets
- **None** - No external URLs found

### Local Assets
- **None** - No local images, fonts, or media files

### Styling
- Uses Tailwind CSS utility classes (inline)
- No styled-components

## Vite-Specific Code

- **None detected** - No `import.meta.env` or Vite-specific imports in App.tsx

## Migration Considerations

### High Priority
1. **Good component organization** - Already split into 5 components, easier migration
2. **No external dependencies** - Only lucide-react, minimal compatibility issues

### Low Priority
1. **Small App.tsx (183 lines)** - Manageable, may not need further extraction
2. **Type definitions** - Already TypeScript, minimal migration needed

## Entry Point Requirements

- Main component: Default export from App.tsx
- Renders course browser with sidebar
- No environment variables required (no AI integration)

## Notes

- Created via Google AI Studio export
- README references AI Studio URL: https://ai.studio/apps/drive/1mWIObZzyuXHIWOoxE0GmRsdYv7JYsnNs
- Self-contained application with good component structure
- **Best candidate for sandbox migration** due to simplicity
