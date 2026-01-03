'use client';

import { MyListSidebar } from '@/features/browser/my-list-sidebar';
import { SandboxErrorBoundary } from '@/app/sandbox/components/SandboxErrorBoundary';

export default function MyListSidebarSandboxPage() {
  return (
    <SandboxErrorBoundary experimentName="My List Sidebar">
      <MyListSidebar />
    </SandboxErrorBoundary>
  );
}
