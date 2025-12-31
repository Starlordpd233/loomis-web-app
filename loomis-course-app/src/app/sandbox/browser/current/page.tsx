'use client';

import EnhancedExplorer from './components/EnhancedExplorer';

/**
 * Sandbox page for browser/current design idea.
 * 
 * Original: design_ideas/browser/current/App.tsx (867 lines)
 * Source: Loomis Chaffee Catalog Explorer - AI-enhanced course exploration
 * 
 * This is a placeholder entry point. The actual component migration
 * will be completed in Phase 2 when dependencies are resolved.
 */
export default function CurrentSandboxPage() {
    return (
        <div className="min-h-screen bg-slate-900 p-4">
            <header className="mb-6">
                <h1 className="text-2xl font-bold text-white">Enhanced Explorer</h1>
                <p className="text-slate-400 text-sm">
                    AI-enhanced course catalog explorer with Gemini integration
                </p>
            </header>

            <EnhancedExplorer />
        </div>
    );
}
