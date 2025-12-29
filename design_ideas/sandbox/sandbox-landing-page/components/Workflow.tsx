import React from 'react';
import { WorkflowStep } from '../types';
import { IconFolder, IconAtom, IconPencil, IconRocket } from './ui/Icons';

const steps: WorkflowStep[] = [
  {
    step: '01',
    title: 'Create',
    description: 'New folder in sandbox',
    icon: <IconFolder className="w-6 h-6" />,
    color: 'from-blue-500 to-cyan-400',
  },
  {
    step: '02',
    title: 'Build',
    description: 'Add your page.tsx',
    icon: <IconAtom className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    step: '03',
    title: 'Register',
    description: 'Add to experiments.ts',
    icon: <IconPencil className="w-6 h-6" />,
    color: 'from-amber-500 to-orange-500',
  },
  {
    step: '04',
    title: 'Launch',
    description: 'Preview at route',
    icon: <IconRocket className="w-6 h-6" />,
    color: 'from-emerald-500 to-green-400',
  },
];

export const Workflow: React.FC = () => {
  return (
    <section className="relative py-24 border-t border-slate-800/50 bg-slate-950/50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-slate-100 mb-4">
            Add Your Experiment
          </h2>
          <p className="text-slate-400">
            Four simple steps to get your ideas from concept to code.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Connector Line (Desktop Only) */}
          <div className="hidden lg:block absolute top-12 left-[12%] right-[12%] h-0.5 bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 z-0"></div>

          {steps.map((item, index) => (
            <div key={item.step} className="relative z-10 flex flex-col items-center text-center group">
              
              {/* Icon Container */}
              <div className={`
                w-24 h-24 rounded-2xl flex items-center justify-center mb-6
                bg-slate-900 border border-slate-800 shadow-xl
                group-hover:scale-105 transition-transform duration-300
                relative overflow-hidden
              `}>
                <div className={`absolute inset-0 bg-gradient-to-br ${item.color} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                
                {/* Step Number Badge */}
                <div className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                  {item.step}
                </div>
                
                <div className="text-slate-200 group-hover:text-white transition-colors">
                  {item.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-200 mb-2">{item.title}</h3>
              <p className="text-sm text-slate-500 max-w-[150px]">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};