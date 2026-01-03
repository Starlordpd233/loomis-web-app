'use client';

import { EnhancedExplorer } from '@/features/browser/enhanced-explorer';
import { SandboxErrorBoundary } from '@/app/sandbox/components/SandboxErrorBoundary';

export default function EnhancedExplorerPage() {
  return (
    <SandboxErrorBoundary experimentName="Enhanced Explorer">
      <EnhancedExplorer />
    </SandboxErrorBoundary>
  );
}
