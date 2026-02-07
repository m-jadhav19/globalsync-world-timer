import React, { useMemo, useRef } from 'react';
import { RotateCcw, FastForward, Rewind, Zap } from 'lucide-react';

interface TimeTravelControlProps {
  offset: number; // minutes
  setOffset: (offset: number) => void;
  onReset: () => void;
  isScrubbing: boolean;
  setIsScrubbing: (s: boolean) => void;
}

const TimeTravelControl: React.FC<TimeTravelControlProps> = ({ offset, setOffset, onReset, isScrubbing, setIsScrubbing }) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  const formatOffset = (mins: number) => {
    if (mins === 0) return "PRESENT";
    const absMins = Math.abs(mins);
    const h = Math.floor(absMins / 60);
    const m = absMins % 60;
    const prefix = mins > 0 ? "+" : "-";
    return `${prefix}${h}H ${m > 0 ? `${m}M` : ''}`;
  };

  const currentSelectionLabel = useMemo(() => {
    const d = new Date();
    // Add offset
    d.setMinutes(d.getMinutes() + offset);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      hour: 'numeric',
      minute: '2-digit'
    });
  }, [offset]);

  const isActive = offset !== 0;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex justify-center px-4">
      <div className={`
        pointer-events-auto
        relative backdrop-blur-2xl timeline-container border rounded-3xl
        w-full max-w-[700px] overflow-hidden
        transition-all duration-500 ease-out
        ${isActive
          ? 'border-[var(--accent-primary)]/50 shadow-[0_0_40px_rgba(124,140,255,0.15)] scale-[1.02]'
          : 'border-[var(--metal-edge)] shadow-2xl scale-100'
        }
      `}>

        {/* Animated glow on active */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--accent-primary)]/5 to-transparent animate-pulse pointer-events-none" />
        )}

        <div className="relative px-8 py-6">

          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#444]">TIME TRAVEL</span>
                <div className="w-[1px] h-3 bg-[#333]" />
                <div className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-[var(--accent-primary)]' : 'text-[#555]'}`}>
                  {formatOffset(offset)}
                </div>
              </div>
              {isActive && (
                <>
                  <div className="w-[1px] h-3 bg-[#333]" />
                  <span className="text-[10px] font-bold text-white/80 uppercase tracking-wider">
                    {currentSelectionLabel}
                  </span>
                </>
              )}
            </div>

            {isActive && (
              <button
                onClick={onReset}
                className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black bg-[var(--accent-primary)] hover:bg-white transition-all px-3 py-1.5 rounded-full"
              >
                <RotateCcw size={11} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-500" />
                Reset
              </button>
            )}
          </div>

          {/* Slider Container */}
          <div className="relative h-16 flex items-center">

            {/* Tick marks background */}
            <div className={`absolute inset-0 flex justify-between items-center pointer-events-none transition-opacity duration-300 ${isScrubbing ? 'opacity-40' : 'opacity-10'}`}>
              {Array.from({ length: 49 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[1px] bg-[var(--text-muted)] transition-all ${i === 24 ? 'h-8 bg-[var(--accent-primary)]' :
                    i % 12 === 0 ? 'h-5 opacity-60' :
                      i % 4 === 0 ? 'h-3 opacity-30' : 'h-1.5 opacity-10'
                    }`}
                />
              ))}
            </div>

            {/* Invisible interactive input */}
            <input
              ref={sliderRef}
              type="range"
              min="-1440"
              max="1440"
              step="30"
              value={offset}
              onChange={(e) => setOffset(parseInt(e.target.value))}
              onMouseDown={() => setIsScrubbing(true)}
              onMouseUp={() => setIsScrubbing(false)}
              onTouchStart={() => setIsScrubbing(true)}
              onTouchEnd={() => setIsScrubbing(false)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            />

            {/* Track background */}
            <div className={`absolute left-0 right-0 h-[2px] timeline-track pointer-events-none transition-opacity duration-300 ${isScrubbing ? 'opacity-100' : 'opacity-60'}`} />

            {/* Active progress track */}
            <div
              className={`absolute h-[2px] timeline-marker-line pointer-events-none transition-all duration-100 timeline-marker-glow`}
              style={{
                left: offset < 0 ? `calc(50% - ${Math.abs(offset) / 1440 * 50}%)` : '50%',
                width: `${Math.abs(offset) / 1440 * 50}%`,
              }}
            />

            {/* Thumb indicator */}
            <div
              className={`absolute w-0.5 timeline-thumb pointer-events-none transition-all duration-100 z-10 ${isScrubbing ? 'h-12 scale-x-150' : 'h-10'
                }`}
              style={{
                left: `calc(50% + ${(offset / 1440) * 50}%)`,
                transform: 'translateX(-50%)'
              }}
            />

            {/* Center zero marker (NOW) */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-[2px] h-16 pointer-events-none transition-all ${isActive ? 'bg-white/5 opacity-20' : 'timeline-marker-line timeline-marker-glow z-10'
              }`} />

          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-4 px-0.5">
            <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest hover:text-[var(--text-secondary)] transition-colors">-24H</span>
            <span className={`text-[9px] font-black tracking-widest transition-all ${isActive ? 'text-[var(--text-muted)]' : 'text-[var(--accent-primary)]'
              }`}>NOW</span>
            <span className="text-[9px] font-bold text-[var(--text-muted)] tracking-widest hover:text-[var(--text-secondary)] transition-colors">+24H</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimeTravelControl;