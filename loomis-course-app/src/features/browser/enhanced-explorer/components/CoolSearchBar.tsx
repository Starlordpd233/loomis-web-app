'use client';

interface CoolSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function CoolSearchBar({ value, onChange, placeholder = "Search..." }: CoolSearchBarProps) {
  return (
    <div className="relative group z-10">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <div className="w-5 h-5 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx={11} cy={11} r={8} stroke="url(#search-gradient)" />
            <line x1={21} y1={21} x2={16.65} y2={16.65} stroke="url(#search-line-gradient)" />
            <defs>
              <linearGradient id="search-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c0b9c0" />
                <stop offset="100%" stopColor="#b6a9b7" />
              </linearGradient>
              <linearGradient id="search-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b6a9b7" />
                <stop offset="100%" stopColor="#837484" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
      <input
        placeholder={placeholder}
        type="text"
        name="text"
        className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 focus:bg-slate-900 focus:placeholder-slate-400 focus:text-white sm:text-sm transition-all duration-200 shadow-inner"
        style={{
          width: '487px',
          height: '56px'
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}
