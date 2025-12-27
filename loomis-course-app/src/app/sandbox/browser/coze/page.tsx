/**
 * Sandbox reference for standalone app
 * Source: design_ideas/browser/coze
 *
 * This is a standalone application with its own package.json.
 * Run it separately using the instructions below.
 */

export default function CozePage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">coze</h1>
        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded">
          Standalone App
        </span>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h2 className="font-semibold mb-3">Source Location</h2>
        <code className="block bg-gray-100 px-3 py-2 rounded text-sm">
          design_ideas/browser/coze
        </code>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h2 className="font-semibold mb-3">Run Instructions</h2>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>
            Navigate to the app directory:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              cd design_ideas/browser/coze
            </code>
          </li>
          <li>
            Install dependencies:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              npm install
            </code>
          </li>
          <li>
            Start the development server:
            <code className="block bg-gray-100 px-3 py-2 rounded mt-1 ml-5">
              npm run dev
            </code>
          </li>
        </ol>
      </div>
    </div>
  );
}
