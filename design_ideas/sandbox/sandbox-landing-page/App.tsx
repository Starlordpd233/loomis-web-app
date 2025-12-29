import React from 'react';
import { Hero } from './components/Hero';
import { ExperimentCard } from './components/ExperimentCard';
import { Workflow } from './components/Workflow';
import { experiments } from './data/experiments';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background font-sans selection:bg-indigo-500/30">
      
      {/* Navigation Stub */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center backdrop-blur-sm border-b border-white/5 bg-background/50">
          <div className="flex items-center gap-2">
             <div className="w-8 h-8 rounded bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-white font-display">S</div>
             <span className="font-display font-bold text-slate-200 tracking-tight">Sandbox</span>
          </div>
          <button className="text-sm text-slate-400 hover:text-white transition-colors">Exit Sandbox</button>
      </nav>

      <main className="flex-grow pt-16">
        <Hero />

        {/* Experiments Grid Section */}
        <section className="container mx-auto px-6 pb-24">
          <div className="flex justify-between items-end mb-10 border-b border-slate-800 pb-4">
             <div>
                <h2 className="text-2xl font-display font-bold text-slate-200">Active Experiments</h2>
                <p className="text-sm text-slate-500 mt-1">{experiments.length} active experiments waiting to be discovered.</p>
             </div>
             {/* Simple Filter Stub */}
             <div className="hidden sm:flex gap-2">
                 <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 transition-colors">All</button>
                 <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-transparent text-slate-400 hover:text-slate-200 transition-colors">Ready</button>
                 <button className="px-3 py-1.5 text-xs font-medium rounded-lg bg-transparent text-slate-400 hover:text-slate-200 transition-colors">In Progress</button>
             </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {experiments.map((exp) => (
              <ExperimentCard key={exp.id} experiment={exp} />
            ))}
            
            {/* Add New Placeholder Card */}
            <div className="group relative flex flex-col h-full min-h-[300px] items-center justify-center border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/20 hover:border-slate-700 hover:bg-slate-900/40 transition-all cursor-pointer">
                 <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-500 group-hover:text-slate-300">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                     </svg>
                 </div>
                 <h3 className="text-slate-400 font-medium group-hover:text-slate-200">Initialize New Experiment</h3>
            </div>
          </div>
        </section>

        <Workflow />
      </main>

      <footer className="py-8 border-t border-slate-900 bg-black text-center text-slate-600 text-sm">
        <p>Loomis Chaffee Web Dev • Future Lab</p>
      </footer>
    </div>
  );
};

export default App;