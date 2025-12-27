/**
 * Sandbox wrapper for TSX component
 * Source: design_ideas/browser/idea1.tsx
 *
 * This is a placeholder page. To integrate the actual component:
 * 1. Copy the component from the source path above
 * 2. Adapt imports for the Next.js app structure
 * 3. Replace the placeholder below with the actual component
 */

export default function Idea1Page() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">idea1</h1>
        <p className="text-gray-600">
          Source: <code className="bg-gray-100 px-2 py-1 rounded">design_ideas/browser/idea1.tsx</code>
        </p>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p className="text-gray-500 mb-4">TSX Component Placeholder</p>
        <p className="text-sm text-gray-400">
          Import and render the component from the source path above
        </p>
      </div>
    </div>
  );
}
