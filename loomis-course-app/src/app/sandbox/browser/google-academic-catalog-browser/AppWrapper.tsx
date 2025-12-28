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
      `}</style>
      <div className="standalone-app-wrapper fixed inset-0 z-40 overflow-y-auto bg-slate-50 text-slate-900 antialiased">
        <App />
      </div>
    </>
  );
}
