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
        relative backdrop-blur-2xl bg-[#0a0a0a]/95 border rounded-3xl
        w-full max-w-[700px] overflow-hidden
        transition-all duration-500 ease-out
        ${isActive
          ? 'border-[#CCFF00]/50 shadow-[0_0_40px_rgba(204,255,0,0.15)] scale-[1.02]'
          : 'border-[#1a1a1a] shadow-2xl scale-100'
        }
      `}>

        {/* Animated glow on active */}
        {isActive && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#CCFF00]/5 to-transparent animate-pulse pointer-events-none" />
        )}

        <div className="relative px-8 py-6">

          {/* Compact Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#444]">TIME TRAVEL</span>
                <div className="w-[1px] h-3 bg-[#333]" />
                <div className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-[#CCFF00]' : 'text-[#555]'}`}>
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
                className="group flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-black bg-[#CCFF00] hover:bg-white transition-all px-3 py-1.5 rounded-full"
              >
                <RotateCcw size={11} strokeWidth={3} className="group-hover:rotate-180 transition-transform duration-500" />
                Reset
              </button>
            )}
          </div>

          {/* Slider Container */}
          <div className="relative h-16 flex items-center">

            {/* Tick marks background */}
            <div className="absolute inset-0 flex justify-between items-center pointer-events-none opacity-20">
              {Array.from({ length: 25 }).map((_, i) => (
                <div
                  key={i}
                  className={`w-[1px] bg-[#555] transition-all ${i === 12 ? 'h-8 bg-[#CCFF00]' :
                    i % 6 === 0 ? 'h-5' :
                      i % 3 === 0 ? 'h-3' : 'h-1.5'
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
            <div className="absolute left-0 right-0 h-[1px] bg-[#222] pointer-events-none" />

            {/* Active progress track */}
            <div
              className="absolute h-[2px] bg-gradient-to-r from-[#CCFF00]/50 to-[#CCFF00] pointer-events-none transition-all duration-100 shadow-[0_0_8px_rgba(204,255,0,0.5)]"
              style={{
                left: offset < 0 ? `calc(50% - ${Math.abs(offset) / 1440 * 50}%)` : '50%',
                width: `${Math.abs(offset) / 1440 * 50}%`,
              }}
            />

            {/* Thumb indicator */}
            <div
              className={`absolute w-0.5 bg-[#CCFF00] pointer-events-none transition-all duration-100 shadow-[0_0_12px_rgba(204,255,0,0.8)] z-10 ${isScrubbing ? 'h-12 shadow-[0_0_20px_rgba(204,255,0,1)]' : 'h-10'
                }`}
              style={{
                left: `calc(50% + ${(offset / 1440) * 50}%)`,
                transform: 'translateX(-50%)'
              }}
            />

            {/* Center zero marker with pulse */}
            <div className={`absolute left-1/2 -translate-x-1/2 w-[2px] h-16 pointer-events-none transition-all ${isActive ? 'bg-gradient-to-b from-transparent via-white/10 to-transparent' : 'bg-gradient-to-b from-transparent via-[#CCFF00]/30 to-transparent'
              }`} />

          </div>

          {/* Time labels */}
          <div className="flex justify-between mt-4 px-0.5">
            <span className="text-[9px] font-bold text-[#444] tracking-widest">-24H</span>
            <span className={`text-[9px] font-black tracking-widest transition-all ${isActive ? 'text-[#666]' : 'text-[#CCFF00] animate-pulse'
              }`}>NOW</span>
            <span className="text-[9px] font-bold text-[#444] tracking-widest">+24H</span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TimeTravelControl;