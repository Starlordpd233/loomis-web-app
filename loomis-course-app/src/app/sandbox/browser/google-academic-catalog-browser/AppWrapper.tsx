'use client';

import App from './_standalone/App';

export default function GoogleacademiccatalogbrowserApp() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      <style jsx global>{`
        /* Isolate this app's font stack */
        .standalone-app-wrapper {
          font-family: 'Inter', sans-serif;
        }
        /* Custom Scrollbar for a cleaner look */
        .standalone-app-wrapper::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .standalone-app-wrapper::-webkit-scrollbar-track {
          background: #f1f5f9; 
        }
        .standalone-app-wrapper::-webkit-scrollbar-thumb {
          background: #cbd5e1; 
          border-radius: 4px;
        }
        .standalone-app-wrapper::-webkit-scrollbar-thumb:hover {
          background: #94a3b8; 
        }
      `}</style>
      <div className="standalone-app-wrapper fixed inset-0 z-40 overflow-y-auto bg-slate-50 text-slate-900 antialiased">
        <App />
      </div>
    </>
  );
}
