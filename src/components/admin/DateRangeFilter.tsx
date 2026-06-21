'use client';
import { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

const PRESETS = [
  { label: 'Last 7 days', days: 7 },
  { label: 'Last 30 days', days: 30 },
  { label: 'Last 90 days', days: 90 },
  { label: 'Last 365 days', days: 365 },
];

const DateRangeFilter = ({ value, onChange }: { value: number; onChange: (days: number) => void }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [customDays, setCustomDays] = useState<string>('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLabel = PRESETS.find(p => p.days === value)?.label || `Last ${value} days`;

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="date-range-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-[#0d1117] border border-[#2d333b] hover:border-[#444c56] rounded-lg px-3 py-1.5 text-xs text-[#c9d1d9] transition-colors"
      >
        <Calendar size={12} className="text-[#8b949e]" />
        {currentLabel}
        <ChevronDown size={12} className={`text-[#484f58] transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 border border-[#2d333b] rounded-xl p-2 shadow-xl min-w-[180px]" style={{ backgroundColor: '#161b22' }}>
          {PRESETS.map(p => (
            <button
              key={p.days}
              data-testid={`range-${p.days}`}
              onClick={() => { onChange(p.days); setOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors ${
                value === p.days ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'text-[#c9d1d9] hover:bg-[#1c2128]'
              }`}
            >
              {p.label}
            </button>
          ))}
          <div className="border-t border-[#2d333b] mt-1 pt-1">
            <div className="flex items-center gap-1 px-3 py-1">
              <input
                data-testid="custom-days-input"
                type="number"
                min="1"
                max="365"
                value={customDays}
                onChange={e => setCustomDays(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && customDays) {
                    onChange(Math.min(365, Math.max(1, parseInt(customDays))));
                    setOpen(false);
                    setCustomDays('');
                  }
                }}
                placeholder="Custom days"
                className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none w-20"
              />
              <button
                onClick={() => {
                  if (customDays) {
                    onChange(Math.min(365, Math.max(1, parseInt(customDays))));
                    setOpen(false);
                    setCustomDays('');
                  }
                }}
                className="text-xs bg-[#22c55e] hover:bg-[#16a34a] text-white px-2 py-1 rounded transition-colors"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DateRangeFilter;
