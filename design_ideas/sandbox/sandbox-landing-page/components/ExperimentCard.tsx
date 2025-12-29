import React from 'react';
import { Experiment } from '../types';
import { Badge } from './ui/Badge';
import { IconArrowRight, IconBook } from './ui/Icons';

interface ExperimentCardProps {
  experiment: Experiment;
}

export const ExperimentCard: React.FC<ExperimentCardProps> = ({ experiment }) => {
  const getIcon = (category: string) => {
    // In a real app, we might map these dynamically or pass the icon component directly in props
    return <IconBook className="w-6 h-6 text-indigo-400" />;
  };

  return (
    <div className="group relative flex flex-col h-full bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10">
      
      {/* Card Header */}
      <div className="p-6 pb-4 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 group-hover:bg-indigo-500/10 group-hover:border-indigo-500/20 transition-colors">
             {getIcon(experiment.category)}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold text-slate-100 group-hover:text-indigo-200 transition-colors">
              {experiment.category}
            </h3>
            <span className="text-xs text-slate-500">Updated {experiment.lastUpdated}</span>
          </div>
        </div>
        
        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="p-2 rounded-full bg-slate-800 text-slate-300 hover:bg-indigo-500 hover:text-white cursor-pointer transition-colors">
                <IconArrowRight className="w-4 h-4" />
            </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="px-6 flex-grow">
        <div className="mb-4">
           {experiment.status === 'READY' && (
               <Badge variant="success" className="mb-3">READY TO LAUNCH</Badge>
           )}
           {experiment.status === 'IN_PROGRESS' && (
               <Badge variant="accent" className="mb-3">BUILDING</Badge>
           )}
           
           <h4 className="text-xl font-semibold text-slate-200 mb-2 leading-tight">
             {experiment.title}
           </h4>
           <p className="text-sm text-slate-400 leading-relaxed">
             {experiment.description}
           </p>
        </div>
      </div>

      {/* Card Footer (Tags) */}
      <div className="p-6 pt-4 mt-auto border-t border-slate-800/50 bg-slate-900/30">
        <div className="flex flex-wrap gap-2">
          {experiment.tags.map((tag) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
};