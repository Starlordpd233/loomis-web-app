import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'accent' | 'success';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide";
  
  const variants = {
    default: "bg-slate-800 text-slate-300 border border-slate-700",
    outline: "bg-transparent text-slate-400 border border-slate-700",
    accent: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
    success: "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20",
  };

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};