# Phase 3: Sandbox Integration (Fidelity-First) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Port each design idea into sandbox with visual fidelity preservation, using Tailwind for layout/spacing/typography and CSS Modules for complex selectors, keyframes, and non-utility styling.

**Architecture:** Each design idea gets its own sandbox route. Rewrite styled-components to Tailwind, fix TypeScript types, standardize icons to lucide-react, and register experiments in experiments.ts.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, CSS Modules, styled-components (to be removed), lucide-react

---

## Task 1: Set up sandbox directory structure

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/catalog-browser/`

**Step 1: Create base directories**

```bash
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/{enhanced-explorer,catalog-browser,my-list-sidebar}
```

**Step 2: Create layout.tsx for browser category**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/layout.tsx
export default function BrowserSandboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Browser Experiments</h1>
          <p className="text-gray-600 mt-2">
            Design ideas for course browsing and exploration
          </p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
```

**Step 3: Verify directory structure**

```bash
find /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser -type d
```

**Step 4: Commit structure**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/browser/
git commit -m "feat: create browser sandbox directory structure"
```

---

## Task 2: Rewrite styled-components to Tailwind (SearchWrapper)

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current/components/CoolSearchBar.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/components/CoolSearchBar.tsx`

**Step 1: Examine original styled-components usage**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current
grep -n "styled\|SearchWrapper" components/CoolSearchBar.tsx
```

**Step 2: Create Tailwind version**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/components/CoolSearchBar.tsx
'use client';

import { Search } from 'lucide-react';
import { useState } from 'react';

interface CoolSearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function CoolSearchBar({
  onSearch,
  placeholder = 'Search courses...',
}: CoolSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch?.(query);
  };

  return (
    <div className={`relative w-full max-w-[600px] transition-all duration-300 ${
      isFocused ? 'scale-[1.02] shadow-xl' : 'shadow-lg'
    }`}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
          <Search className={`w-5 h-5 transition-colors duration-200 ${
            isFocused ? 'text-blue-600' : 'text-gray-400'
          }`} />
        </div>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 text-gray-800 bg-white border-0 rounded-2xl 
                   focus:ring-2 focus:ring-blue-500 focus:outline-none 
                   placeholder:text-gray-400 text-sm transition-all duration-200"
        />
        
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 
                     text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Clear search"
          >
            ✕
          </button>
        )}
      </form>
      
      {/* Animated background effect */}
      <div className={`absolute inset-0 -z-10 rounded-2xl transition-all duration-300 ${
        isFocused 
          ? 'bg-gradient-to-r from-blue-50 to-purple-50 opacity-100' 
          : 'bg-gradient-to-r from-gray-50 to-gray-100 opacity-70'
      }`} />
    </div>
  );
}
```

**Step 3: Test component in isolation**

Create test page:

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/test-search/page.tsx
'use client';

import CoolSearchBar from '../components/CoolSearchBar';

export default function TestSearchPage() {
  const handleSearch = (query: string) => {
    console.log('Search query:', query);
    alert(`Searching for: ${query}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-6">SearchWrapper Tailwind Test</h1>
      
      <div className="space-y-8 max-w-4xl">
        <div>
          <h2 className="text-lg font-semibold mb-3">Default State</h2>
          <CoolSearchBar />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">With Custom Placeholder</h2>
          <CoolSearchBar placeholder="Search for courses, departments, or instructors..." />
        </div>
        
        <div>
          <h2 className="text-lg font-semibold mb-3">With Search Handler</h2>
          <CoolSearchBar onSearch={handleSearch} />
        </div>
      </div>
    </div>
  );
}
```

**Step 4: Verify visual fidelity**

Compare with original styled-components version:
- Same gradient background effects
- Same animation on focus
- Same icon color transitions
- Same shadow effects

**Step 5: Commit Tailwind rewrite**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/browser/enhanced-explorer/
git commit -m "feat: rewrite SearchWrapper styled-component to Tailwind CSS"
```

---

## Task 3: Fix TypeScript types for enhanced-explorer

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current/types.ts`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/types.ts`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/page.tsx`

**Step 1: Copy and enhance types**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/types.ts
export interface Course {
  id: string;
  code: string;
  title: string;
  description: string;
  department: string;
  credits: number;
  level: 'Introductory' | 'Intermediate' | 'Advanced';
  prerequisites?: string[];
  terms: string[];
}

export interface AiSuggestion {
  title: string;
  reason: string;
}

export interface AiAdviceResponse {
  advice: string;
  suggestions: AiSuggestion[];
}

export interface SearchFilters {
  department?: string;
  level?: Course['level'];
  credits?: number;
  term?: string;
}

export type SortOption = 'relevance' | 'title' | 'code' | 'department';
```

**Step 2: Fix useState<any> types in page component**

```typescript
// In page.tsx where AI state is managed
const [aiResponse, setAiResponse] = useState<AiAdviceResponse | null>(null);
// Instead of: useState<any>(null)
```

**Step 3: Fix event handler types**

```typescript
// Fix type in map functions
suggestions.map((sug: AiSuggestion, idx: number) => (
  // Instead of: (sug: any, idx: number)
));
```

**Step 4: Add path alias to tsconfig.json**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
cat tsconfig.json | grep -A 5 '"paths"'
```

If not present, add:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Step 5: Test TypeScript compilation**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
npx tsc --noEmit src/app/sandbox/browser/enhanced-explorer/
```

Expected: No type errors

**Step 6: Commit type fixes**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/browser/enhanced-explorer/types.ts
git add loomis-course-app/tsconfig.json
git commit -m "fix: TypeScript type safety for enhanced-explorer"
```

---

## Task 4: Port enhanced-explorer App.tsx to sandbox

**Files:**
- Read: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current/App.tsx` (842 lines)
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/page.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/components/`

**Step 1: Break down monolithic App.tsx into components**

Identify logical sections:
1. Header with title and description
2. Search bar section  
3. Filter controls
4. Course results grid
5. AI advice panel
6. Course detail modal

**Step 2: Create component structure**

```bash
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/components
touch /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/components/{Header.tsx,SearchSection.tsx,FilterControls.tsx,CourseGrid.tsx,AIAdvicePanel.tsx,CourseModal.tsx}
```

**Step 3: Create main page.tsx**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/page.tsx
'use client';

import { useState } from 'react';
import Header from './components/Header';
import SearchSection from './components/SearchSection';
import FilterControls from './components/FilterControls';
import CourseGrid from './components/CourseGrid';
import AIAdvicePanel from './components/AIAdvicePanel';
import CourseModal from './components/CourseModal';
import { Course, AiAdviceResponse } from './types';

export default function EnhancedExplorerPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [aiResponse, setAiResponse] = useState<AiAdviceResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column: Search and filters */}
          <div className="lg:col-span-2 space-y-6">
            <SearchSection 
              query={searchQuery}
              onQueryChange={setSearchQuery}
              onSearch={(query) => console.log('Search:', query)}
            />
            
            <FilterControls 
              filters={filters}
              onFiltersChange={setFilters}
            />
            
            <CourseGrid 
              onCourseSelect={setSelectedCourse}
            />
          </div>
          
          {/* Right column: AI advice */}
          <div>
            <AIAdvicePanel 
              response={aiResponse}
              onGetAdvice={() => {/* TODO: Implement Gemini API call */}}
            />
          </div>
        </div>
      </div>
      
      {/* Course detail modal */}
      {selectedCourse && (
        <CourseModal 
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
        />
      )}
    </div>
  );
}
```

**Step 4: Create placeholder components**

Create minimal component implementations that render the structure without full logic.

**Step 5: Test sandbox route**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
npm run dev &
# Visit http://localhost:3001/sandbox/browser/enhanced-explorer
```

**Step 6: Commit initial port**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/browser/enhanced-explorer/
git commit -m "feat: initial port of enhanced-explorer to sandbox"
```

---

## Task 5: Standardize icons to lucide-react

**Files:**
- Check: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current/package.json` for icon dependencies
- Replace: Icon imports in ported components

**Step 1: Check current icon usage**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/design_ideas/browser/current
grep -r "import.*icon\|Icon\|icon" components/ App.tsx
```

**Step 2: Install lucide-react if not present**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
npm list lucide-react || npm install lucide-react
```

**Step 3: Create icon mapping**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/lib/icon-mapping.ts
// Map original icon names to lucide-react equivalents
export const iconMap = {
  // Add mappings as needed
  'SearchIcon': 'Search',
  'FilterIcon': 'Filter',
  'ChevronDownIcon': 'ChevronDown',
  // etc.
};
```

**Step 4: Update icon imports**

Replace imports like:
```typescript
import { SearchIcon } from 'some-icon-library';
```
With:
```typescript
import { Search } from 'lucide-react';
```

**Step 5: Test icon rendering**

Create test page to verify all icons render correctly.

**Step 6: Commit icon standardization**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/icon-mapping.ts
git add loomis-course-app/src/app/sandbox/browser/enhanced-explorer/
git commit -m "feat: standardize icons to lucide-react"
```

---

## Task 6: Register experiments in experiments.ts

**Files:**
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app/src/app/sandbox/experiments.ts:15-50`

**Step 1: Add enhanced-explorer experiment**

```typescript
// In CATEGORIES array, browser experiments section
{
  name: 'Enhanced Explorer',
  description: 'AI-enhanced course catalog explorer with Gemini integration',
  path: '/sandbox/browser/enhanced-explorer',
  status: 'wip' as ExperimentStatus,
  frameworks: ['Tailwind CSS', 'React 19', 'TypeScript'],
  createdAt: new Date().toISOString(),
  author: 'Design Ideas Team',
  sourceRef: 'design_ideas/browser/current',
  tags: ['ai', 'catalog', 'explorer', 'gemini'],
},
```

**Step 2: Add catalog-browser experiment**

```typescript
{
  name: 'Catalog Browser',
  description: 'Academic catalog browser with advanced filtering',
  path: '/sandbox/browser/catalog-browser',
  status: 'wip' as ExperimentStatus,
  frameworks: ['Tailwind CSS', 'CSS Modules'],
  createdAt: new Date().toISOString(),
  author: 'Design Ideas Team',
  sourceRef: 'design_ideas/browser/google-academic-catalog-browser',
  tags: ['catalog', 'filtering', 'search'],
},
```

**Step 3: Add my-list-sidebar experiment**

```typescript
{
  name: 'My List Sidebar',
  description: 'Course list sidebar with drag-and-drop reordering',
  path: '/sandbox/browser/my-list-sidebar',
  status: 'wip' as ExperimentStatus,
  frameworks: ['Tailwind CSS', 'React DnD'],
  createdAt: new Date().toISOString(),
  author: 'Design Ideas Team',
  sourceRef: 'design_ideas/browser/my_list_sidebar',
  tags: ['sidebar', 'drag-drop', 'ui'],
},
```

**Step 4: Test experiments listing**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc-solve-incompatibility/loomis-course-app
npm run dev &
# Visit http://localhost:3001/sandbox
```

Verify all three experiments appear in the browser category.

**Step 5: Commit registry updates**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "feat: register browser design ideas in experiments"
```

---

## Fidelity Checklist for Each Sandbox Port

### Enhanced Explorer
- [ ] Fonts match original (Inter if used, else Proxima Nova)
- [ ] Assets render correctly (images, icons)
- [ ] Spacing and typography visually identical
- [ ] Search bar animations match original
- [ ] Filter controls styled correctly
- [ ] Course cards match original design
- [ ] AI advice panel matches styling
- [ ] No console errors on load
- [ ] Responsive behavior matches original

### Catalog Browser  
- [ ] Search bar with Tailwind rewrite matches styled-components version
- [ ] Filter chips styled correctly
- [ ] Course grid layout matches
- [ ] Department filtering UI matches
- [ ] No styled-components imports remain

### My List Sidebar
- [ ] Sidebar positioning matches
- [ ] Course list items styled correctly
- [ ] Drag-and-drop indicators match
- [ ] Interactive states (hover, active) match
- [ ] Responsive behavior matches

---

## Verification Checklist for Phase 3

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` completes successfully
- [ ] All three sandbox routes render (`/sandbox/browser/{enhanced-explorer,catalog-browser,my-list-sidebar}`)
- [ ] `/sandbox` index shows all registered experiments
- [ ] No styled-components runtime errors
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] Tailwind classes work in all components
- [ ] Icon replacements complete and render correctly
- [ ] Fidelity checklist items verified for each port