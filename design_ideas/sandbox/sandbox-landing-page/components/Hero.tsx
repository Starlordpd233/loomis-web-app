import React from 'react';
import { IconSparkles } from './ui/Icons';

export const Hero: React.FC = () => {
  return (
    <div className="relative w-full py-24 lg:py-32 overflow-hidden">
      {/* Background Gradients/Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-secondary/20 rounded-full mix-blend-screen filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      
      <div className="relative z-10 container mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/50 border border-slate-800 backdrop-blur-sm mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">Experimental Space</span>
        </div>

        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
          <span className="text-slate-100">Design Your</span>
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary via-accent to-primary">
            Vision
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 leading-relaxed mb-10">
          Explore creative experiments for the <span className="text-slate-200 font-medium">Loomis Chaffee</span> digital ecosystem. 
          A sandbox environment for developing, testing, and revising ideas.
        </p>
      </div>
    </div>
  );
};