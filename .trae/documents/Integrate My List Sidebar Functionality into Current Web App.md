## Overview
Migrate the "My List" sidebar functionality from the standalone app (`my_list_sidebar`) into the current web app (`current`) with pixel-perfect fidelity and no regression to existing features.

## Analysis Summary
**Source App (`my_list_sidebar`)**:
- Uses React 19, TypeScript, Tailwind CSS, lucide-react icons
- Features: Left sidebar, header, stats cards, course cards, right sliding "MyListPanel"
- MyListPanel displays saved courses grouped by department with visual effects, term-based styling, credit summary

**Current App (`current`)**:
- Uses React 19, TypeScript, Tailwind CSS, styled-components, Font Awesome icons, AI assistant
- Features: Left sidebar navigation, AI advisor tab, course grid/list, modal, starred courses (IDs)
- Missing: term field in Course interface, lucide-react icons

## Migration Steps

### 1. Dependency Installation
- Add `lucide-react` to `current/package.json` dependencies
- Run package manager install (npm/pnpm/yarn) to fetch the library

### 2. Extend Data Types
- ` Updatecurrent/types.ts` to add optional `term` field to `Course` interface (`'Fall' | 'Winter' | 'Spring'`)
- Update `current/data.ts` MOCK_COURSES with default term values (e.g., 'Fall')

### 3. Component Migration
- Copy `MyListPanel.tsx` from source to `current/components/` (create components directory)
- Adjust imports to use local `types.ts` and `lucide-react`
- Preserve all styling and logic (grouping by department, term styling, credit calculation)

 ###4. Integration into App.tsx
- Add state `isMyListOpen` and `toggleMyList` function
- Add a trigger button in the sidebar under "Discover" section (new "My List" item with star icon)
- Render `<MyListPanel>` component at the end of the main container (similar to source)
- Apply conditional right margin (`mr-[400px]`) to main content when panel is open
- Map `starredCourses` IDs to full course objects for `savedCourses` prop

### 5. Styling
 Adjustments- Ensure custom scrollbar class `custom-scrollbar` is available (likely already defined)
- Verify panel z‑index does not conflict with existing modals
- Test responsive behavior (panel overlay on smaller screens)

### 6. Testing & Validation
- Test open/close animation and panel interaction
- Verify course grouping, term colors, credit summation
- Ensure existing features (AI assistant, course modals, starring) remain functional
- Check for any TypeScript errors and resolve

### 7. Final Polish
- Run linting and type checking
- Start dev server to verify visual fidelity with original implementation
- Document any necessary environment variables (none required)

## Success Criteria
- MyListPanel appears and behaves identically to the source app
- No visual or functional regression in the current app
- All TypeScript checks pass
- Panel can be toggled via sidebar button and closes via X button
- Saved courses reflect starred courses from the existing shortlist