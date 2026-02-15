import React, { useMemo, useRef, useEffect } from 'react';
import { RotateCcw, FastForward, Rewind } from 'lucide-react';

interface TimeTravelControlProps {
  offset: number; // minutes
  setOffset: (offset: number | ((prev: number) => number)) => void;
  onReset: () => void;
  isScrubbing: boolean;
  setIsScrubbing: (s: boolean) => void;
}

const TimeTravelControl: React.FC<TimeTravelControlProps> = ({ offset, setOffset, onReset, isScrubbing, setIsScrubbing }) => {
  const sliderRef = useRef<HTMLInputElement>(null);

  const formatOffset = (mins: number) => {
    if (mins === 0) return "";
    const absMins = Math.abs(mins);
    const d = Math.floor(absMins / 1440);
    const h = Math.floor((absMins % 1440) / 60);
    const prefix = mins > 0 ? "+" : "-";

    if (d > 0) return `${prefix}${d}d ${h}h`;
    return `${prefix}${h}h`;
  };

  const fullDateLabel = useMemo(() => {
    const now = new Date();
    const targeted = new Date(now.getTime() + offset * 60000);
    return targeted.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }, [offset]);

  const dayContext = useMemo(() => {
    if (offset === 0) return null;
    const now = new Date();
    const targeted = new Date(now.getTime() + offset * 60000);
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const startOfTarget = new Date(targeted.getFullYear(), targeted.getMonth(), targeted.getDate()).getTime();
    const dayDiff = Math.round((startOfTarget - startOfToday) / (24 * 60 * 60 * 1000));

    if (dayDiff === 0) return 'Today';
    if (dayDiff === 1) return 'Tomorrow';
    if (dayDiff === -1) return 'Yesterday';
    if (dayDiff > 1) return `+${dayDiff} Days`;
    if (dayDiff < -1) return `${dayDiff} Days`;
    return null;
  }, [offset]);

  const isActive = offset !== 0;

  // Haptics
  const lastTickHour = useRef(Math.floor(offset / 60));
  useEffect(() => {
    const currentHour = Math.floor(offset / 60);
    if (currentHour !== lastTickHour.current) {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(10); // Light tick
      }
      lastTickHour.current = currentHour;
    }
  }, [offset]);

  const handleJump = (mins: number) => {
    setOffset(prev => prev + mins);
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25); // Medium impact
    }
  };

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 pointer-events-none flex flex-col items-center px-4">

      {/* Floating Date Indicator */}
      <div className={`
        mb-3 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/5 shadow-2xl
        transition-all duration-500 transform
        ${isActive ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
      `}>
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/90">
          {isActive ? fullDateLabel : "Present Time"}
        </span>
      </div>

      <div className={`
        pointer-events-auto
        timeline-container border border-[var(--metal-edge)]
        w-full max-w-[420px] overflow-hidden
        transition-all duration-500 ease-out
        ${isActive ? 'scale-[1.02] border-[var(--accent-primary)]/30' : 'scale-100'}
      `}>

        <div className="px-5 py-3.5">

          {/* Compact Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <RotateCcw size={12} className={`text-[var(--accent-primary)] ${isActive ? 'opacity-100 animate-spin-slow' : 'opacity-20'}`} />
              <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-secondary)]">Time Module</span>
            </div>

            <button
              onClick={onReset}
              disabled={!isActive}
              className={`reset-button-spring text-[9px] font-black uppercase tracking-widest text-[var(--accent-primary)] hover:text-white transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
            >
              Reset
            </button>
          </div>

          {/* Scrubber Visual System */}
          <div className="relative h-10 flex items-center group gap-3">

            {/* Quick Jumps */}
            <button
              onClick={() => handleJump(-720)}
              className="z-30 text-[9px] font-black text-white/20 hover:text-[var(--accent-primary)] transition-colors"
              title="-12h"
            >
              <Rewind size={14} />
            </button>

            <div className="relative flex-1 h-full flex items-center">
              {/* Markers: dots */}
              <div className="absolute inset-0 flex justify-between items-center px-1 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-[var(--accent-primary)] shadow-[0_0_10px_var(--accent-glow)] scale-125' : 'bg-white/20'}`} />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
                <div className="scrubber-dot" />
              </div>

              {/* Range Glow */}
              {isActive && (
                <div
                  className="absolute h-[4px] bg-[var(--accent-primary)] timeline-marker-glow rounded-full pointer-events-none transition-all duration-300"
                  style={{
                    left: offset < 0 ? `calc(50% - ${Math.min(Math.abs(offset) / 4320 * 50, 50)}%)` : '50%',
                    width: `${Math.min(Math.abs(offset) / 4320 * 50, 50)}%`,
                  }}
                />
              )}

              {/* Invisible interactive input */}
              <input
                ref={sliderRef}
                type="range"
                min="-4320"
                max="4320"
                step="30"
                value={offset}
                onChange={(e) => setOffset(parseInt(e.target.value))}
                onMouseDown={() => setIsScrubbing(true)}
                onMouseUp={() => setIsScrubbing(false)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30"
              />

              {/* Pill Dragger */}
              <div
                className={`
                  absolute h-7 w-4 timeline-thumb pointer-events-none z-20
                  transition-all duration-100 ease-out
                  ${isScrubbing ? 'scale-y-110 shadow-[0_0_20px_var(--accent-glow)]' : 'scale-100'}
                `}
                style={{
                  left: `calc(50% + ${(offset / 4320) * 50}%)`,
                  transform: 'translateX(-50%)'
                }}
              >
                {/* Micro-detail: accent line on thumb */}
                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[2px] bg-[var(--accent-primary)]/40 blur-[1px]" />
              </div>
            </div>

            <button
              onClick={() => handleJump(720)}
              className="z-30 text-[9px] font-black text-white/20 hover:text-[var(--accent-primary)] transition-colors"
              title="+12h"
            >
              <FastForward size={14} />
            </button>
          </div>

          {/* Context Labels */}
          <div className="flex justify-center h-3 mt-0.5">
            <span className={`text-[9px] font-black uppercase tracking-[0.2em] text-[var(--accent-primary)] transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
              {dayContext && `${dayContext} • `}{formatOffset(offset)}
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimeTravelControl;