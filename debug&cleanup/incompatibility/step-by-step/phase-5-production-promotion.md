# Phase 5: Production Promotion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

> [!NOTE]
> **Code Snippets Disclaimer:** The code snippets and examples provided in this plan are **informational and basic**. They are intended to illustrate concepts and provide guidance, but should **not** serve as the final functional code. Implementers should write production-quality code that goes beyond these examples, incorporating proper error handling, edge cases, and best practices appropriate for the codebase.

**Goal:** Promote validated sandbox experiments to production routes with zero visual regression, including navigation updates, performance optimization, and staged rollout.

**Architecture:** Gradual promotion using feature flags, A/B testing infrastructure, performance benchmarking, and automated promotion pipelines. Each design idea graduates based on success metrics.

**Tech Stack:** Next.js feature flags (via cookies/localStorage), Vercel Analytics for usage tracking, Lighthouse CI for performance, TypeScript for type safety, Tailwind CSS for styling

---

## Task 1: Establish promotion criteria and metrics

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/promotion-criteria.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/experiment-metrics.ts`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/experiments.ts:100-150`

**Step 1: Define promotion criteria interface**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/promotion-criteria.ts
export interface PromotionCriteria {
  // Visual parity
  visualParityPassed: boolean;
  maxPixelDifference: number; // e.g., 0.01 for 1%
  
  // Performance
  lighthousePerformance: number; // 0-100
  lighthouseAccessibility: number; // 0-100
  lighthouseBestPractices: number; // 0-100
  lighthouseSEO: number; // 0-100
  
  // Bundle size
  maxBundleSizeIncrease: number; // percentage
  maxComponentCount: number;
  
  // User engagement (from sandbox)
  minUserSessions: number;
  minPositiveFeedback: number; // percentage
  minTimeOnPage: number; // seconds
  
  // Code quality
  typeCoverage: number; // percentage
  testCoverage: number; // percentage
  noConsoleErrors: boolean;
}

export interface ExperimentMetrics {
  experimentId: string;
  experimentName: string;
  criteria: PromotionCriteria;
  currentMetrics: Partial<PromotionCriteria>;
  lastUpdated: Date;
  status: 'evaluating' | 'ready' | 'promoted' | 'blocked';
  blockers: string[];
}

export const DEFAULT_PROMOTION_CRITERIA: PromotionCriteria = {
  visualParityPassed: true,
  maxPixelDifference: 0.01,
  lighthousePerformance: 90,
  lighthouseAccessibility: 95,
  lighthouseBestPractices: 90,
  lighthouseSEO: 90,
  maxBundleSizeIncrease: 5,
  maxComponentCount: 50,
  minUserSessions: 100,
  minPositiveFeedback: 80,
  minTimeOnPage: 30,
  typeCoverage: 95,
  testCoverage: 80,
  noConsoleErrors: true
};
```

**Step 2: Create metrics tracking utilities**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/experiment-metrics.ts
import { ExperimentMetrics, PromotionCriteria, DEFAULT_PROMOTION_CRITERIA } from './promotion-criteria';

export class ExperimentMetricsTracker {
  private metrics: Map<string, ExperimentMetrics> = new Map();
  
  constructor() {
    this.loadFromStorage();
  }
  
  registerExperiment(experimentId: string, experimentName: string) {
    this.metrics.set(experimentId, {
      experimentId,
      experimentName,
      criteria: { ...DEFAULT_PROMOTION_CRITERIA },
      currentMetrics: {},
      lastUpdated: new Date(),
      status: 'evaluating',
      blockers: []
    });
    this.saveToStorage();
  }
  
  updateMetric(experimentId: string, metric: keyof PromotionCriteria, value: any) {
    const experiment = this.metrics.get(experimentId);
    if (!experiment) return;
    
    experiment.currentMetrics[metric] = value;
    experiment.lastUpdated = new Date();
    
    // Re-evaluate status
    experiment.status = this.evaluateStatus(experiment);
    experiment.blockers = this.identifyBlockers(experiment);
    
    this.saveToStorage();
  }
  
  private evaluateStatus(experiment: ExperimentMetrics): ExperimentMetrics['status'] {
    if (experiment.status === 'promoted') return 'promoted';
    
    const allCriteriaMet = Object.entries(experiment.criteria).every(([key, requiredValue]) => {
      const currentValue = experiment.currentMetrics[key as keyof PromotionCriteria];
      if (currentValue === undefined) return false;
      
      // Special handling for boolean
      if (typeof requiredValue === 'boolean') {
        return currentValue === requiredValue;
      }
      
      // Numeric comparison (current must be >= required for scores, <= for differences)
      if (typeof requiredValue === 'number') {
        if (key.includes('Performance') || key.includes('Accessibility') || 
            key.includes('BestPractices') || key.includes('SEO') ||
            key.includes('Coverage') || key.includes('PositiveFeedback')) {
          return currentValue >= requiredValue;
        }
        if (key.includes('Difference') || key.includes('Increase') || key.includes('Count')) {
          return currentValue <= requiredValue;
        }
      }
      
      return true;
    });
    
    return allCriteriaMet ? 'ready' : 'evaluating';
  }
  
  private identifyBlockers(experiment: ExperimentMetrics): string[] {
    const blockers: string[] = [];
    
    Object.entries(experiment.criteria).forEach(([key, requiredValue]) => {
      const currentValue = experiment.currentMetrics[key as keyof PromotionCriteria];
      if (currentValue === undefined) {
        blockers.push(`${key}: Not measured yet`);
        return;
      }
      
      if (typeof requiredValue === 'boolean' && currentValue !== requiredValue) {
        blockers.push(`${key}: Required ${requiredValue}, got ${currentValue}`);
      } else if (typeof requiredValue === 'number') {
        if (key.includes('Performance') || key.includes('Accessibility') || 
            key.includes('BestPractices') || key.includes('SEO') ||
            key.includes('Coverage') || key.includes('PositiveFeedback')) {
          if (currentValue < requiredValue) {
            blockers.push(`${key}: Required ≥${requiredValue}, got ${currentValue}`);
          }
        }
        if (key.includes('Difference') || key.includes('Increase') || key.includes('Count')) {
          if (currentValue > requiredValue) {
            blockers.push(`${key}: Required ≤${requiredValue}, got ${currentValue}`);
          }
        }
      }
    });
    
    return blockers;
  }
  
  private saveToStorage() {
    localStorage.setItem('experiment-metrics', JSON.stringify([...this.metrics.values()]));
  }
  
  private loadFromStorage() {
    const stored = localStorage.getItem('experiment-metrics');
    if (stored) {
      const data = JSON.parse(stored);
      data.forEach((exp: ExperimentMetrics) => {
        exp.lastUpdated = new Date(exp.lastUpdated);
        this.metrics.set(exp.experimentId, exp);
      });
    }
  }
  
  getReadyForPromotion(): ExperimentMetrics[] {
    return [...this.metrics.values()].filter(m => m.status === 'ready');
  }
}
```

**Step 3: Update experiments.ts to include promotion status**

```typescript
// In /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/experiments.ts
// Add to Experiment interface:
export interface Experiment {
  // ... existing fields
  promotionStatus?: 'evaluating' | 'ready' | 'promoted' | 'blocked';
  promotionMetrics?: Partial<PromotionCriteria>;
  lastEvaluation?: string;
}

// Update browser experiments:
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
  promotionStatus: 'evaluating' as const,
  promotionMetrics: {},
  lastEvaluation: new Date().toISOString()
},
```

**Step 4: Test metrics tracking**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
node -e "
const { ExperimentMetricsTracker } = require('./src/lib/experiment-metrics.ts');
const tracker = new ExperimentMetricsTracker();
tracker.registerExperiment('enhanced-explorer', 'Enhanced Explorer');
tracker.updateMetric('enhanced-explorer', 'visualParityPassed', true);
tracker.updateMetric('enhanced-explorer', 'lighthousePerformance', 92);
console.log('Test passed');
"
```

**Step 5: Commit promotion criteria**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/{promotion-criteria.ts,experiment-metrics.ts}
git add loomis-course-app/src/app/sandbox/experiments.ts
git commit -m "feat: establish promotion criteria and metrics tracking"
```

---

## Task 2: Implement feature flag system

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/feature-flags.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/components/FeatureFlag.tsx`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/(app)/browser/page.tsx:1-50`

**Step 1: Create feature flag manager**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/feature-flags.ts
export type FeatureFlag = 'enhanced-explorer' | 'catalog-browser' | 'my-list-sidebar';

export interface FeatureFlagConfig {
  name: FeatureFlag;
  description: string;
  enabled: boolean;
  rolloutPercentage: number; // 0-100
  userGroups: string[]; // e.g., ['beta-testers', 'faculty']
  startDate?: Date;
  endDate?: Date;
}

export class FeatureFlagManager {
  private flags: Map<FeatureFlag, FeatureFlagConfig> = new Map();
  
  constructor() {
    this.loadFromStorage();
    this.initializeDefaultFlags();
  }
  
  private initializeDefaultFlags() {
    const defaultFlags: FeatureFlagConfig[] = [
      {
        name: 'enhanced-explorer',
        description: 'AI-enhanced course catalog explorer',
        enabled: false,
        rolloutPercentage: 0,
        userGroups: ['internal'],
        startDate: new Date()
      },
      {
        name: 'catalog-browser',
        description: 'Academic catalog browser with advanced filtering',
        enabled: false,
        rolloutPercentage: 0,
        userGroups: ['internal'],
        startDate: new Date()
      },
      {
        name: 'my-list-sidebar',
        description: 'Course list sidebar with drag-and-drop',
        enabled: false,
        rolloutPercentage: 0,
        userGroups: ['internal'],
        startDate: new Date()
      }
    ];
    
    defaultFlags.forEach(flag => {
      if (!this.flags.has(flag.name)) {
        this.flags.set(flag.name, flag);
      }
    });
    
    this.saveToStorage();
  }
  
  isEnabled(flag: FeatureFlag, userId?: string): boolean {
    const config = this.flags.get(flag);
    if (!config) return false;
    
    // Check date range
    if (config.startDate && new Date() < config.startDate) return false;
    if (config.endDate && new Date() > config.endDate) return false;
    
    // Check user groups (simplified - in reality would check against user profile)
    if (config.userGroups.length > 0 && userId) {
      // Mock user group check - implement real logic based on your auth system
      const userInGroup = config.userGroups.some(group => 
        userId.includes(group) || group === 'all'
      );
      if (!userInGroup) return false;
    }
    
    // Check rollout percentage
    if (config.rolloutPercentage < 100) {
      const userHash = this.hashUserId(userId || 'anonymous');
      const rolloutThreshold = config.rolloutPercentage / 100;
      return userHash <= rolloutThreshold;
    }
    
    return config.enabled;
  }
  
  enableFlag(flag: FeatureFlag, rolloutPercentage: number = 100) {
    const config = this.flags.get(flag);
    if (config) {
      config.enabled = true;
      config.rolloutPercentage = rolloutPercentage;
      config.startDate = new Date();
      this.saveToStorage();
    }
  }
  
  disableFlag(flag: FeatureFlag) {
    const config = this.flags.get(flag);
    if (config) {
      config.enabled = false;
      config.rolloutPercentage = 0;
      this.saveToStorage();
    }
  }
  
  private hashUserId(userId: string): number {
    // Simple hash for rollout percentage
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      hash = ((hash << 5) - hash) + userId.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) % 100 / 100;
  }
  
  private saveToStorage() {
    localStorage.setItem('feature-flags', JSON.stringify([...this.flags.values()]));
  }
  
  private loadFromStorage() {
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      const data: FeatureFlagConfig[] = JSON.parse(stored);
      data.forEach(flag => {
        flag.startDate = flag.startDate ? new Date(flag.startDate) : undefined;
        flag.endDate = flag.endDate ? new Date(flag.endDate) : undefined;
        this.flags.set(flag.name, flag);
      });
    }
  }
}

// Singleton instance
export const featureFlags = new FeatureFlagManager();
```

**Step 2: Create FeatureFlag React component**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/components/FeatureFlag.tsx
'use client';

import { ReactNode } from 'react';
import { FeatureFlag, featureFlags } from '@/lib/feature-flags';

interface FeatureFlagProps {
  flag: FeatureFlag;
  userId?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureFlagWrapper({
  flag,
  userId,
  children,
  fallback = null
}: FeatureFlagProps) {
  const isEnabled = featureFlags.isEnabled(flag, userId);
  
  if (!isEnabled) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}
```

**Step 3: Integrate feature flags into browser page**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/(app)/browser/page.tsx
'use client';

import FeatureFlagWrapper from '@/components/FeatureFlag';
import EnhancedExplorer from '@/features/browser/EnhancedExplorer';
import CatalogBrowser from '@/features/browser/CatalogBrowser';
import MyListSidebar from '@/features/browser/MyListSidebar';
import LegacyBrowser from '@/features/browser/LegacyBrowser';

export default function BrowserPage() {
  // Get user ID from auth context (simplified)
  const userId = 'user123'; // Replace with real auth
  
  return (
    <div className="min-h-screen bg-gray-50">
      <FeatureFlagWrapper 
        flag="enhanced-explorer" 
        userId={userId}
        fallback={
          <FeatureFlagWrapper 
            flag="catalog-browser" 
            userId={userId}
            fallback={<LegacyBrowser />}
          >
            <CatalogBrowser />
          </FeatureFlagWrapper>
        }
      >
        <EnhancedExplorer />
      </FeatureFlagWrapper>
      
      {/* Sidebar feature flag */}
      <FeatureFlagWrapper flag="my-list-sidebar" userId={userId}>
        <div className="fixed right-0 top-0 h-full w-80 border-l border-gray-200">
          <MyListSidebar />
        </div>
      </FeatureFlagWrapper>
    </div>
  );
}
```

**Step 4: Create admin panel for managing feature flags**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/admin/feature-flags/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { FeatureFlag, featureFlags, FeatureFlagConfig } from '@/lib/feature-flags';

export default function FeatureFlagsAdminPage() {
  const [flags, setFlags] = useState<FeatureFlagConfig[]>([]);
  
  useEffect(() => {
    // Load flags from localStorage
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      setFlags(JSON.parse(stored));
    }
  }, []);
  
  const toggleFlag = (flagName: FeatureFlag, enabled: boolean) => {
    if (enabled) {
      featureFlags.enableFlag(flagName, 100);
    } else {
      featureFlags.disableFlag(flagName);
    }
    
    // Refresh list
    const stored = localStorage.getItem('feature-flags');
    if (stored) {
      setFlags(JSON.parse(stored));
    }
  };
  
  const updateRollout = (flagName: FeatureFlag, percentage: number) => {
    const flag = flags.find(f => f.name === flagName);
    if (flag) {
      featureFlags.enableFlag(flagName, percentage);
      const stored = localStorage.getItem('feature-flags');
      if (stored) {
        setFlags(JSON.parse(stored));
      }
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Feature Flags</h1>
      
      <div className="space-y-6">
        {flags.map(flag => (
          <div key={flag.name} className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold">{flag.name}</h3>
                <p className="text-gray-600 text-sm">{flag.description}</p>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => toggleFlag(flag.name, !flag.enabled)}
                  className={`px-4 py-2 rounded ${
                    flag.enabled 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  }`}
                >
                  {flag.enabled ? 'Enabled' : 'Disabled'}
                </button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Rollout:</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={flag.rolloutPercentage}
                    onChange={(e) => updateRollout(flag.name, parseInt(e.target.value))}
                    className="w-32"
                  />
                  <span className="text-sm font-medium">{flag.rolloutPercentage}%</span>
                </div>
              </div>
            </div>
            
            <div className="text-sm text-gray-500">
              <p>User groups: {flag.userGroups.join(', ')}</p>
              <p>Started: {flag.startDate ? new Date(flag.startDate).toLocaleDateString() : 'Not started'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: Test feature flag system**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run dev &
# Visit http://localhost:3001/admin/feature-flags
# Toggle flags and verify browser page changes
```

**Step 6: Commit feature flag system**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/feature-flags.ts
git add loomis-course-app/src/components/FeatureFlag.tsx
git add loomis-course-app/src/app/(app)/browser/page.tsx
git add loomis-course-app/src/app/admin/feature-flags/
git commit -m "feat: implement feature flag system for gradual rollout"
```

---

## Task 3: Create production-ready components from sandbox

**Files:**
- Copy: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/enhanced-explorer/` → `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/EnhancedExplorer/index.tsx`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/EnhancedExplorer/package.json`

**Step 1: Copy and refactor enhanced-explorer**

```bash
# Copy sandbox to features directory
mkdir -p /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/features/browser
cp -r /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/app/sandbox/browser/enhanced-explorer \
      /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/EnhancedExplorer
```

**Step 2: Create feature package manifest**

```json
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/EnhancedExplorer/package.json
{
  "name": "@loomis/browser-enhanced-explorer",
  "version": "1.0.0",
  "description": "AI-enhanced course catalog explorer",
  "type": "module",
  "exports": {
    ".": "./index.tsx",
    "./components/*": "./components/*.tsx",
    "./types": "./types.ts"
  },
  "peerDependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "lucide-react": "^0.344.0",
    "tailwindcss": "^3.4.0"
  },
  "dependencies": {
    "@google/generative-ai": "^0.13.0"
  }
}
```

**Step 3: Refactor for production readiness**

Key changes needed:
1. Remove sandbox-specific styles and layout wrappers
2. Add proper error boundaries
3. Implement loading states
4. Add analytics tracking
5. Optimize bundle size (code splitting)
6. Add comprehensive prop types

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/features/browser/EnhancedExplorer/index.tsx
'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import ErrorBoundary from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import { trackPageView } from '@/lib/analytics';

// Lazy load heavy components
const SearchSection = dynamic(() => import('./components/SearchSection'), {
  loading: () => <div className="h-16 bg-gray-100 animate-pulse rounded" />
});

const CourseGrid = dynamic(() => import('./components/CourseGrid'), {
  loading: () => <div className="h-64 bg-gray-100 animate-pulse rounded" />
});

const AIAdvicePanel = dynamic(() => import('./components/AIAdvicePanel'), {
  loading: () => <div className="h-48 bg-gray-100 animate-pulse rounded" />
});

interface EnhancedExplorerProps {
  initialQuery?: string;
  userId?: string;
  onCourseSelect?: (courseId: string) => void;
}

export default function EnhancedExplorer({
  initialQuery = '',
  userId,
  onCourseSelect
}: EnhancedExplorerProps) {
  // Track page view
  useEffect(() => {
    trackPageView('enhanced-explorer', { userId });
  }, [userId]);
  
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<LoadingSpinner />}>
        <div className="min-h-screen bg-gray-50">
          <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <h1 className="text-2xl font-bold text-gray-800">
                Course Explorer
              </h1>
              <p className="text-gray-600 mt-1">
                Discover courses with AI-powered recommendations
              </p>
            </div>
          </header>
          
          <main className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <SearchSection initialQuery={initialQuery} />
                <CourseGrid onCourseSelect={onCourseSelect} />
              </div>
              
              <div>
                <AIAdvicePanel userId={userId} />
              </div>
            </div>
          </main>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

function ErrorFallback() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h2>
        <p className="text-gray-600 mb-6">
          The enhanced explorer is temporarily unavailable.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
```

**Step 4: Run bundle analysis**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run build -- --analyze
# Check bundle size for EnhancedExplorer feature
```

**Step 5: Commit production-ready components**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/features/browser/
git commit -m "feat: create production-ready components from sandbox"
```

---

## Task 4: Implement performance monitoring

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/performance-monitor.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/scripts/run-lighthouse.mjs`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/package.json:scripts`

**Step 1: Create performance monitor**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/performance-monitor.ts
export interface PerformanceMetrics {
  timestamp: Date;
  pageLoadTime: number; // ms
  firstContentfulPaint: number; // ms
  largestContentfulPaint: number; // ms
  cumulativeLayoutShift: number;
  firstInputDelay: number; // ms
  timeToInteractive: number; // ms
  bundleSize: number; // KB
  componentCount: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  
  startMeasurement(page: string) {
    if (typeof window !== 'undefined' && 'performance' in window) {
      const navEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      const metrics: PerformanceMetrics = {
        timestamp: new Date(),
        pageLoadTime: navEntry?.loadEventEnd || 0,
        firstContentfulPaint: paintEntries.find(e => e.name === 'first-contentful-paint')?.startTime || 0,
        largestContentfulPaint: 0, // Would need LCP observer
        cumulativeLayoutShift: 0, // Would need CLS observer
        firstInputDelay: 0, // Would need FID observer
        timeToInteractive: 0,
        bundleSize: this.estimateBundleSize(),
        componentCount: this.countComponents()
      };
      
      this.metrics.push(metrics);
      this.saveToStorage(page);
      
      return metrics;
    }
    return null;
  }
  
  private estimateBundleSize(): number {
    // Estimate based on performance entries
    const resources = performance.getEntriesByType('resource');
    const scriptSize = resources
      .filter(r => r.name.includes('.js'))
      .reduce((sum, r) => sum + (r as PerformanceResourceTiming).transferSize || 0, 0);
    
    return Math.round(scriptSize / 1024); // KB
  }
  
  private countComponents(): number {
    // Count React components by checking DOM elements with data-component attribute
    if (typeof document !== 'undefined') {
      return document.querySelectorAll('[data-component]').length;
    }
    return 0;
  }
  
  private saveToStorage(page: string) {
    const key = `performance-metrics-${page}`;
    const stored = localStorage.getItem(key);
    const history = stored ? JSON.parse(stored) : [];
    history.push(this.metrics[this.metrics.length - 1]);
    localStorage.setItem(key, JSON.stringify(history.slice(-100))); // Keep last 100
  }
  
  getAverageMetrics(page: string): Partial<PerformanceMetrics> {
    const key = `performance-metrics-${page}`;
    const stored = localStorage.getItem(key);
    if (!stored) return {};
    
    const history: PerformanceMetrics[] = JSON.parse(stored);
    const avg = history.reduce((acc, curr) => ({
      pageLoadTime: acc.pageLoadTime + curr.pageLoadTime,
      firstContentfulPaint: acc.firstContentfulPaint + curr.firstContentfulPaint,
      bundleSize: acc.bundleSize + curr.bundleSize,
      componentCount: acc.componentCount + curr.componentCount
    }), {
      pageLoadTime: 0,
      firstContentfulPaint: 0,
      bundleSize: 0,
      componentCount: 0
    });
    
    const count = history.length;
    return {
      pageLoadTime: avg.pageLoadTime / count,
      firstContentfulPaint: avg.firstContentfulPaint / count,
      bundleSize: avg.bundleSize / count,
      componentCount: avg.componentCount / count
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();
```

**Step 2: Create Lighthouse CI script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/scripts/run-lighthouse.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PAGES = [
  { name: 'enhanced-explorer', url: 'http://localhost:3001/browser?feature=enhanced-explorer' },
  { name: 'catalog-browser', url: 'http://localhost:3001/browser?feature=catalog-browser' },
  { name: 'my-list-sidebar', url: 'http://localhost:3001/browser?feature=my-list-sidebar' }
];

async function runLighthouse() {
  console.log('🏃 Running Lighthouse audits...');
  
  const results = [];
  
  for (const page of PAGES) {
    console.log(`\n📊 Testing ${page.name}...`);
    
    const outputFile = path.join(__dirname, `../lighthouse-reports/${page.name}-${Date.now()}.json`);
    
    try {
      execSync(`npx lighthouse ${page.url} --output json --output-path ${outputFile} --chrome-flags="--headless"`, {
        stdio: 'inherit'
      });
      
      const report = JSON.parse(fs.readFileSync(outputFile, 'utf8'));
      const scores = {
        performance: report.categories.performance.score * 100,
        accessibility: report.categories.accessibility.score * 100,
        bestPractices: report.categories['best-practices'].score * 100,
        seo: report.categories.seo.score * 100
      };
      
      results.push({
        page: page.name,
        scores,
        reportPath: outputFile
      });
      
      console.log(`✅ ${page.name}:`);
      console.log(`   Performance: ${scores.performance.toFixed(0)}`);
      console.log(`   Accessibility: ${scores.accessibility.toFixed(0)}`);
      console.log(`   Best Practices: ${scores.bestPractices.toFixed(0)}`);
      console.log(`   SEO: ${scores.seo.toFixed(0)}`);
      
    } catch (error) {
      console.error(`❌ Failed to audit ${page.name}:`, error.message);
      results.push({
        page: page.name,
        error: error.message
      });
    }
  }
  
  // Save summary
  const summaryPath = path.join(__dirname, '../lighthouse-reports/summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    results
  }, null, 2));
  
  console.log(`\n📝 Summary saved to: ${summaryPath}`);
  
  // Check if any scores are below thresholds
  const failures = results.filter(r => 
    !r.error && (
      r.scores.performance < 90 ||
      r.scores.accessibility < 95 ||
      r.scores.bestPractices < 90 ||
      r.scores.seo < 90
    )
  );
  
  if (failures.length > 0) {
    console.error('\n❌ Lighthouse audits failed thresholds:');
    failures.forEach(f => {
      console.error(`   ${f.page}: P${f.scores.performance} A${f.scores.accessibility} BP${f.scores.bestPractices} SEO${f.scores.seo}`);
    });
    process.exit(1);
  }
  
  console.log('\n✅ All Lighthouse audits passed!');
}

runLighthouse().catch(console.error);
```

**Step 3: Add npm scripts**

```json
// In /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/package.json
{
  "scripts": {
    "lighthouse": "node scripts/run-lighthouse.mjs",
    "perf:monitor": "node scripts/performance-monitor.mjs",
    "build:analyze": "ANALYZE=true npm run build"
  }
}
```

**Step 4: Run Lighthouse audit**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run lighthouse
```

**Step 5: Commit performance monitoring**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/performance-monitor.ts
git add loomis-course-app/scripts/
git add loomis-course-app/package.json
git commit -m "feat: implement performance monitoring and Lighthouse CI"
```

---

## Task 5: Create promotion pipeline

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/scripts/promotion-pipeline.mjs`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/.github/workflows/promotion.yml`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/promotion-manager.ts`

**Step 1: Create promotion manager**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/promotion-manager.ts
import { ExperimentMetricsTracker } from './experiment-metrics';
import { featureFlags, FeatureFlag } from './feature-flags';
import { performanceMonitor } from './performance-monitor';

export class PromotionManager {
  private metricsTracker = new ExperimentMetricsTracker();
  
  async evaluateForPromotion(experimentId: string): Promise<{
    ready: boolean;
    metrics: any;
    blockers: string[];
  }> {
    const experiment = this.metricsTracker.getExperiment(experimentId);
    if (!experiment) {
      return {
        ready: false,
        metrics: {},
        blockers: ['Experiment not found']
      };
    }
    
    // Run Lighthouse audit
    const lighthouseResults = await this.runLighthouseAudit(experimentId);
    if (lighthouseResults) {
      this.metricsTracker.updateMetric(experimentId, 'lighthousePerformance', lighthouseResults.performance);
      this.metricsTracker.updateMetric(experimentId, 'lighthouseAccessibility', lighthouseResults.accessibility);
      this.metricsTracker.updateMetric(experimentId, 'lighthouseBestPractices', lighthouseResults.bestPractices);
      this.metricsTracker.updateMetric(experimentId, 'lighthouseSEO', lighthouseResults.seo);
    }
    
    // Check performance metrics
    const perfMetrics = performanceMonitor.getAverageMetrics(experimentId);
    if (perfMetrics.pageLoadTime) {
      this.metricsTracker.updateMetric(experimentId, 'pageLoadTime', perfMetrics.pageLoadTime);
    }
    
    const updatedExperiment = this.metricsTracker.getExperiment(experimentId);
    return {
      ready: updatedExperiment?.status === 'ready',
      metrics: updatedExperiment?.currentMetrics || {},
      blockers: updatedExperiment?.blockers || []
    };
  }
  
  async promoteExperiment(experimentId: string, rolloutPercentage: number = 10) {
    const evaluation = await this.evaluateForPromotion(experimentId);
    
    if (!evaluation.ready) {
      throw new Error(`Cannot promote ${experimentId}: ${evaluation.blockers.join(', ')}`);
    }
    
    // Enable feature flag with initial rollout
    featureFlags.enableFlag(experimentId as FeatureFlag, rolloutPercentage);
    
    // Log promotion event
    this.logPromotionEvent(experimentId, rolloutPercentage);
    
    return {
      success: true,
      experimentId,
      rolloutPercentage,
      metrics: evaluation.metrics
    };
  }
  
  private async runLighthouseAudit(experimentId: string): Promise<{
    performance: number;
    accessibility: number;
    bestPractices: number;
    seo: number;
  } | null> {
    // In browser context, would use Lighthouse CI
    // This is a placeholder for actual implementation
    return null;
  }
  
  private logPromotionEvent(experimentId: string, rolloutPercentage: number) {
    const event = {
      type: 'experiment_promoted',
      experimentId,
      rolloutPercentage,
      timestamp: new Date().toISOString(),
      metrics: this.metricsTracker.getExperiment(experimentId)?.currentMetrics
    };
    
    // Send to analytics
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `promotion-event-${experimentId}`,
        JSON.stringify(event)
      );
    }
    
    console.log('Promotion event:', event);
  }
}

export const promotionManager = new PromotionManager();
```

**Step 2: Create promotion pipeline script**

```javascript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/scripts/promotion-pipeline.mjs
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const EXPERIMENTS = [
  'enhanced-explorer',
  'catalog-browser', 
  'my-list-sidebar'
];

async function runPromotionPipeline() {
  console.log('🚀 Starting promotion pipeline\n');
  
  const results = [];
  
  for (const experimentId of EXPERIMENTS) {
    console.log(`🔍 Evaluating ${experimentId}...`);
    
    try {
      // 1. Run visual parity check
      console.log('  👁️  Running visual parity check...');
      execSync(`cd ${path.join(__dirname, '../../debug&cleanup/incompatibility/visual-validation')} && node compare.mjs`, {
        stdio: 'pipe'
      });
      
      // 2. Run Lighthouse audit
      console.log('  📊 Running Lighthouse audit...');
      execSync(`npm run lighthouse -- --page=${experimentId}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      // 3. Run performance tests
      console.log('  ⚡ Running performance tests...');
      execSync(`npm run test:performance -- ${experimentId}`, {
        cwd: path.join(__dirname, '..'),
        stdio: 'pipe'
      });
      
      // 4. Check bundle size
      console.log('  📦 Analyzing bundle size...');
      const bundleSize = await checkBundleSize(experimentId);
      
      // 5. Evaluate criteria
      const passed = await evaluateCriteria(experimentId, { bundleSize });
      
      results.push({
        experimentId,
        passed,
        timestamp: new Date().toISOString()
      });
      
      console.log(`  ${passed ? '✅' : '❌'} ${experimentId}: ${passed ? 'READY for promotion' : 'NOT READY'}\n`);
      
    } catch (error) {
      console.error(`  ❌ Error evaluating ${experimentId}:`, error.message);
      results.push({
        experimentId,
        passed: false,
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }
  
  // Generate report
  const report = {
    timestamp: new Date().toISOString(),
    results,
    summary: {
      total: results.length,
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length
    }
  };
  
  const reportPath = path.join(__dirname, '../promotion-reports', `pipeline-${Date.now()}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  
  console.log('\n📝 Pipeline report:', reportPath);
  console.log('📊 Summary:', report.summary);
  
  // Exit with error if any failed
  if (report.summary.failed > 0) {
    console.error('\n❌ Promotion pipeline failed');
    process.exit(1);
  }
  
  console.log('\n✅ Promotion pipeline completed successfully');
}

async function checkBundleSize(experimentId) {
  // Simplified bundle size check
  const statsPath = path.join(__dirname, '../.next/analyze/client.html');
  if (fs.existsSync(statsPath)) {
    const stats = fs.readFileSync(statsPath, 'utf8');
    // Parse bundle size from stats (simplified)
    return 250; // KB
  }
  return 0;
}

async function evaluateCriteria(experimentId, metrics) {
  // Simplified evaluation
  const thresholds = {
    bundleSize: 300, // KB
    performance: 90, // Lighthouse score
    accessibility: 95
  };
  
  return metrics.bundleSize < thresholds.bundleSize;
}

runPromotionPipeline().catch(console.error);
```

**Step 3: Create GitHub Actions workflow**

```yaml
# /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/.github/workflows/promotion.yml
name: Experiment Promotion Pipeline

on:
  schedule:
    - cron: '0 0 * * *'  # Daily
  workflow_dispatch:  # Manual trigger

jobs:
  promote:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Setup Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    
    - name: Install dependencies
      run: |
        cd loomis-course-app
        npm ci
    
    - name: Build application
      run: |
        cd loomis-course-app
        npm run build
    
    - name: Start dev server
      run: |
        cd loomis-course-app
        npm run dev &
        sleep 15
    
    - name: Run promotion pipeline
      run: |
        cd loomis-course-app
        node scripts/promotion-pipeline.mjs
    
    - name: Upload promotion report
      uses: actions/upload-artifact@v4
      if: always()
      with:
        name: promotion-report
        path: loomis-course-app/promotion-reports/
        retention-days: 30
    
    - name: Create PR for ready experiments
      if: success()
      uses: peter-evans/create-pull-request@v5
      with:
        token: ${{ secrets.GITHUB_TOKEN }}
        commit-message: 'feat: promote experiments to production'
        title: 'Promote experiments to production'
        body: |
          ## Experiment Promotion
          
          The following experiments are ready for production promotion:
          
          - Enhanced Explorer
          - Catalog Browser  
          - My List Sidebar
          
          **Next Steps:**
          1. Review the promotion report
          2. Merge this PR to enable feature flags
          3. Monitor rollout metrics
        branch: promote-experiments
        base: main
```

**Step 4: Test promotion pipeline**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
node scripts/promotion-pipeline.mjs
```

**Step 5: Commit promotion pipeline**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/promotion-manager.ts
git add loomis-course-app/scripts/promotion-pipeline.mjs
git add .github/workflows/promotion.yml
git commit -m "feat: create automated promotion pipeline"
```

---

## Task 6: Implement staged rollout and monitoring

**Files:**
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/rollout-manager.ts`
- Create: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/components/RolloutMonitor.tsx`
- Modify: `/Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/admin/rollout/page.tsx`

**Step 1: Create rollout manager**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/lib/rollout-manager.ts
export interface RolloutStage {
  percentage: number;
  duration: number; // hours
  metricsThreshold: {
    errorRate: number; // max error rate
    performanceDrop: number; // max performance drop percentage
    userFeedback: number; // min positive feedback percentage
  };
}

export interface RolloutPlan {
  experimentId: string;
  stages: RolloutStage[];
  currentStage: number;
  startTime: Date;
  paused: boolean;
  metrics: {
    errorRate: number;
    performance: number;
    userFeedback: number;
    sessions: number;
  };
}

export class RolloutManager {
  private plans: Map<string, RolloutPlan> = new Map();
  
  createRolloutPlan(experimentId: string, totalDuration: number = 168 /* 7 days */) {
    const plan: RolloutPlan = {
      experimentId,
      stages: [
        { percentage: 1, duration: 24, metricsThreshold: { errorRate: 0.1, performanceDrop: 5, userFeedback: 90 } },
        { percentage: 5, duration: 24, metricsThreshold: { errorRate: 0.5, performanceDrop: 10, userFeedback: 85 } },
        { percentage: 25, duration: 48, metricsThreshold: { errorRate: 1, performanceDrop: 15, userFeedback: 80 } },
        { percentage: 50, duration: 48, metricsThreshold: { errorRate: 2, performanceDrop: 20, userFeedback: 75 } },
        { percentage: 100, duration: 24, metricsThreshold: { errorRate: 5, performanceDrop: 25, userFeedback: 70 } }
      ],
      currentStage: 0,
      startTime: new Date(),
      paused: false,
      metrics: {
        errorRate: 0,
        performance: 100,
        userFeedback: 0,
        sessions: 0
      }
    };
    
    this.plans.set(experimentId, plan);
    this.saveToStorage();
    
    // Start first stage
    this.advanceStage(experimentId);
    
    return plan;
  }
  
  async advanceStage(experimentId: string) {
    const plan = this.plans.get(experimentId);
    if (!plan || plan.paused) return;
    
    const currentStage = plan.stages[plan.currentStage];
    if (!currentStage) return;
    
    // Wait for stage duration
    await this.wait(currentStage.duration * 60 * 60 * 1000);
    
    // Check metrics against thresholds
    const metricsOk = this.checkMetrics(plan, currentStage);
    
    if (metricsOk && plan.currentStage < plan.stages.length - 1) {
      plan.currentStage++;
      this.saveToStorage();
      
      // Update feature flag rollout percentage
      this.updateFeatureFlag(experimentId, plan.stages[plan.currentStage].percentage);
      
      // Log stage advancement
      this.logStageAdvancement(experimentId, plan.currentStage);
      
      // Continue to next stage
      this.advanceStage(experimentId);
    } else if (!metricsOk) {
      // Pause rollout due to failed metrics
      plan.paused = true;
      this.saveToStorage();
      this.alertRolloutPaused(experimentId, plan.currentStage);
    }
  }
  
  private checkMetrics(plan: RolloutPlan, stage: RolloutStage): boolean {
    return (
      plan.metrics.errorRate <= stage.metricsThreshold.errorRate &&
      plan.metrics.performance >= (100 - stage.metricsThreshold.performanceDrop) &&
      plan.metrics.userFeedback >= stage.metricsThreshold.userFeedback
    );
  }
  
  private updateFeatureFlag(experimentId: string, percentage: number) {
    // Update feature flag rollout percentage
    if (typeof window !== 'undefined') {
      const flags = JSON.parse(localStorage.getItem('feature-flags') || '[]');
      const flagIndex = flags.findIndex((f: any) => f.name === experimentId);
      if (flagIndex !== -1) {
        flags[flagIndex].rolloutPercentage = percentage;
        localStorage.setItem('feature-flags', JSON.stringify(flags));
      }
    }
  }
  
  private wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  private logStageAdvancement(experimentId: string, stage: number) {
    console.log(`Rollout advanced: ${experimentId} to stage ${stage}`);
    // Send to analytics
  }
  
  private alertRolloutPaused(experimentId: string, stage: number) {
    console.warn(`Rollout paused: ${experimentId} at stage ${stage}`);
    // Send alert
  }
  
  private saveToStorage() {
    localStorage.setItem('rollout-plans', JSON.stringify([...this.plans.values()]));
  }
  
  private loadFromStorage() {
    const stored = localStorage.getItem('rollout-plans');
    if (stored) {
      const data: RolloutPlan[] = JSON.parse(stored);
      data.forEach(plan => {
        plan.startTime = new Date(plan.startTime);
        this.plans.set(plan.experimentId, plan);
      });
    }
  }
}

export const rolloutManager = new RolloutManager();
```

**Step 2: Create rollout monitor component**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/components/RolloutMonitor.tsx
'use client';

import { useState, useEffect } from 'react';
import { rolloutManager, RolloutPlan } from '@/lib/rollout-manager';

interface RolloutMonitorProps {
  experimentId: string;
}

export default function RolloutMonitor({ experimentId }: RolloutMonitorProps) {
  const [plan, setPlan] = useState<RolloutPlan | null>(null);
  const [metrics, setMetrics] = useState({
    errorRate: 0,
    performance: 100,
    userFeedback: 0,
    sessions: 0
  });
  
  useEffect(() => {
    // Load rollout plan
    const plans = rolloutManager.getPlans();
    const experimentPlan = plans.get(experimentId);
    setPlan(experimentPlan || null);
    
    // Simulate metrics updates
    const interval = setInterval(() => {
      setMetrics(prev => ({
        errorRate: prev.errorRate + Math.random() * 0.1,
        performance: 100 - Math.random() * 5,
        userFeedback: Math.min(100, prev.userFeedback + Math.random() * 5),
        sessions: prev.sessions + Math.floor(Math.random() * 10)
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [experimentId]);
  
  if (!plan) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
        <p className="text-yellow-800">No rollout plan for {experimentId}</p>
        <button
          onClick={() => {
            rolloutManager.createRolloutPlan(experimentId);
            window.location.reload();
          }}
          className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded text-sm"
        >
          Start Rollout
        </button>
      </div>
    );
  }
  
  const currentStage = plan.stages[plan.currentStage];
  const progress = (plan.currentStage / plan.stages.length) * 100;
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{experimentId} Rollout</h3>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded text-sm ${
            plan.paused ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}>
            {plan.paused ? 'PAUSED' : `Stage ${plan.currentStage + 1}/${plan.stages.length}`}
          </span>
          <span className="text-sm text-gray-600">
            {currentStage?.percentage}% rollout
          </span>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600 mt-1">
          <span>Start</span>
          <span>{progress.toFixed(0)}%</span>
          <span>Complete</span>
        </div>
      </div>
      
      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Error Rate"
          value={metrics.errorRate.toFixed(2) + '%'}
          threshold={currentStage?.metricsThreshold.errorRate}
          isGood={metrics.errorRate <= (currentStage?.metricsThreshold.errorRate || 0)}
        />
        <MetricCard
          label="Performance"
          value={metrics.performance.toFixed(0) + '%'}
          threshold={100 - (currentStage?.metricsThreshold.performanceDrop || 0)}
          isGood={metrics.performance >= (100 - (currentStage?.metricsThreshold.performanceDrop || 0))}
        />
        <MetricCard
          label="User Feedback"
          value={metrics.userFeedback.toFixed(0) + '%'}
          threshold={currentStage?.metricsThreshold.userFeedback}
          isGood={metrics.userFeedback >= (currentStage?.metricsThreshold.userFeedback || 0)}
        />
        <MetricCard
          label="Sessions"
          value={metrics.sessions.toLocaleString()}
        />
      </div>
      
      {/* Stage info */}
      {currentStage && (
        <div className="bg-gray-50 rounded p-4">
          <h4 className="font-medium mb-2">Current Stage Requirements</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Error rate ≤ {currentStage.metricsThreshold.errorRate}%</li>
            <li>• Performance ≥ {100 - currentStage.metricsThreshold.performanceDrop}%</li>
            <li>• Positive feedback ≥ {currentStage.metricsThreshold.userFeedback}%</li>
            <li>• Duration: {currentStage.duration} hours</li>
          </ul>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, threshold, isGood }: any) {
  return (
    <div className="bg-gray-50 rounded p-3">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {threshold !== undefined && (
        <div className={`text-xs mt-1 ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          Threshold: {threshold}
          {typeof threshold === 'number' && typeof value === 'string' && value.includes('%') 
            ? '%' 
            : ''}
        </div>
      )}
    </div>
  );
}
```

**Step 3: Create rollout admin page**

```typescript
// /Users/MatthewLi/Desktop/Senior Year/clubs/web_dev_lc/loomis-course-app/src/app/admin/rollout/page.tsx
'use client';

import RolloutMonitor from '@/components/RolloutMonitor';

const EXPERIMENTS = ['enhanced-explorer', 'catalog-browser', 'my-list-sidebar'];

export default function RolloutAdminPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Rollout Management</h1>
      <p className="text-gray-600 mb-8">
        Monitor and control experiment rollout stages
      </p>
      
      <div className="space-y-8">
        {EXPERIMENTS.map(experimentId => (
          <RolloutMonitor key={experimentId} experimentId={experimentId} />
        ))}
      </div>
      
      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Rollout Guidelines</h2>
        <ul className="space-y-2 text-blue-800">
          <li>• Each stage increases rollout percentage gradually</li>
          <li>• Metrics are monitored continuously</li>
          <li>• Rollout pauses automatically if metrics fall below thresholds</li>
          <li>• Manual intervention required to resume paused rollouts</li>
          <li>• Full rollout (100%) requires passing all final stage metrics</li>
        </ul>
      </div>
    </div>
  );
}
```

**Step 4: Test rollout system**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc/loomis-course-app
npm run dev &
# Visit http://localhost:3001/admin/rollout
```

**Step 5: Commit rollout system**

```bash
cd /Users/MatthewLi/Desktop/Senior\ Year/clubs/web_dev_lc
git add loomis-course-app/src/lib/rollout-manager.ts
git add loomis-course-app/src/components/RolloutMonitor.tsx
git add loomis-course-app/src/app/admin/rollout/
git commit -m "feat: implement staged rollout with monitoring"
```

---

## Promotion Success Criteria

### Before Promotion
- [ ] Visual parity validation passes (≤1% pixel difference)
- [ ] Lighthouse scores meet thresholds (Performance ≥90, Accessibility ≥95, Best Practices ≥90, SEO ≥90)
- [ ] Bundle size increase ≤5%
- [ ] No console errors in production build
- [ ] TypeScript coverage ≥95%
- [ ] Test coverage ≥80%

### During Rollout
- [ ] Error rate monitored and stays below stage thresholds
- [ ] Performance degradation ≤20% at final stage
- [ ] User feedback ≥70% positive at final stage
- [ ] Rollout can be paused/resumed at any stage
- [ ] Metrics dashboard updates in real-time

### After Full Rollout
- [ ] Feature flag at 100% rollout
- [ ] Sandbox version deprecated/archived
- [ ] Documentation updated
- [ ] Performance baselines established for future comparisons
- [ ] User training materials created (if needed)

---

## Rollback Plan

### Automatic Rollback Triggers
- Error rate >5% for more than 5 minutes
- Performance degradation >25% from baseline
- Critical user-reported bug affecting >1% of users

### Manual Rollback Steps
1. Disable feature flag (set rollout to 0%)
2. Redirect users to legacy version
3. Investigate root cause
4. Fix issues in sandbox environment
5. Restart promotion pipeline from Stage 1

### Communication Plan
- Internal team notified immediately on rollback
- Users shown graceful degradation message
- Status page updated with incident report
- Timeline provided for fix and re-release

---

## Next Phase Handoff

After completing Phase 5, proceed to **Phase 6: Quality Gates** which includes:
1. Establishing permanent quality metrics
2. Creating automated compliance checks
3. Implementing performance regression testing
4. Setting up user feedback integration
5. Creating documentation and training materials

**Verification Checklist for Phase 5:**
- [ ] Promotion criteria defined and measurable
- [ ] Feature flag system implemented and tested
- [ ] Production-ready components created from sandbox
- [ ] Performance monitoring integrated
- [ ] Promotion pipeline automated
- [ ] Staged rollout system with monitoring
- [ ] Rollback plan documented
- [ ] All success criteria achievable
