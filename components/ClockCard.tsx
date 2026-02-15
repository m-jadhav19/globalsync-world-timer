import React, { useMemo, useState, useEffect } from 'react';
import { TimeZoneEntry, TimeFormat } from '../types';
import { X, Moon, Sun } from 'lucide-react';

interface ClockCardProps {
  zone: TimeZoneEntry;
  now: Date;
  format: TimeFormat;
  onRemove: (id: string) => void;
  isDimmed?: boolean;
  isScrubbing?: boolean;
  isAnchor?: boolean;
}

const ClockCard: React.FC<ClockCardProps> = ({ zone, now, format, onRemove, isDimmed = false, isScrubbing = false, isAnchor = false }) => {
  const [prevMinute, setPrevMinute] = useState('');
  const [isChanging, setIsChanging] = useState(false);

  const formatter = useMemo(() => new Intl.DateTimeFormat('en-US', {
    timeZone: zone.zoneName,
    hour: 'numeric',
    minute: '2-digit',
    hour12: format === TimeFormat.H12,
  }), [zone.zoneName, format]);

  const timeParts = formatter.formatToParts(now);
  const hourStr = timeParts.find(p => p.type === 'hour')?.value || '00';
  const minuteStr = timeParts.find(p => p.type === 'minute')?.value || '00';
  const dayPeriod = timeParts.find(p => p.type === 'dayPeriod')?.value || '';

  const hour24 = parseInt(new Intl.DateTimeFormat('en-US', {
    timeZone: zone.zoneName,
    hour: 'numeric',
    hour12: false,
  }).format(now));

  const isNight = hour24 < 6 || hour24 >= 19;
  const isSleeping = hour24 >= 0 && hour24 < 6;
  const isWorkHours = hour24 >= 9 && hour24 < 18;

  // Get GMT offset
  const gmtOffset = useMemo(() => {
    const offsetFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone.zoneName,
      timeZoneName: 'shortOffset'
    });
    const parts = offsetFormatter.formatToParts(now);
    const offset = parts.find(p => p.type === 'timeZoneName')?.value || '';
    return offset.replace('GMT', 'GMT');
  }, [zone.zoneName, now]);

  // Detect time change for animation
  useEffect(() => {
    if (prevMinute && prevMinute !== minuteStr) {
      setIsChanging(true);
      setTimeout(() => setIsChanging(false), 300);
    }
    setPrevMinute(minuteStr);
  }, [minuteStr]);

  // Day context badge
  const dayContext = useMemo(() => {
    const localDate = new Date(now.toLocaleString('en-US', { timeZone: zone.zoneName }));
    const userDate = new Date();

    const startOfUser = new Date(userDate.getFullYear(), userDate.getMonth(), userDate.getDate()).getTime();
    const startOfLocal = new Date(localDate.getFullYear(), localDate.getMonth(), localDate.getDate()).getTime();
    const dayDiff = Math.round((startOfLocal - startOfUser) / (24 * 60 * 60 * 1000));

    if (dayDiff === 1) return 'TOMORROW';
    if (dayDiff === -1) return 'YESTERDAY';
    if (dayDiff > 1) return `+${dayDiff} DAYS`;
    if (dayDiff < -1) return `${dayDiff} DAYS`;
    return null;
  }, [now, zone.zoneName]);

  return (
    <div className={`
      card-pop relative group overflow-hidden flex flex-col justify-between p-6 h-fit
      ${isDimmed ? 'opacity-20 grayscale scale-[0.98]' : 'opacity-100 scale-100'}
      ${isAnchor ? 'card-anchor' : ''}
      ${isAnchor && isScrubbing ? 'shadow-[0_0_40px_rgba(124,140,255,0.4)] border-[var(--accent-primary)]/50' : ''}
      ${isChanging ? 'time-changing' : ''}
      transition-all duration-500
    `}>

      {/* Day/Night Gradient Overlay */}
      <div className={`absolute inset-0 z-0 pointer-events-none transition-opacity duration-1000 ${isNight ? 'opacity-100' : 'opacity-100'
        }`}>
        {isNight ? (
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(100,100,255,0.10)] to-transparent" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-[rgba(204,255,0,0.08)] to-transparent" />
        )}
      </div>

      {/* Top Row: City & Icon */}
      <div className="flex justify-between items-start z-10">
        <div className="flex flex-col max-w-[70%]">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[clamp(1rem,2vw,1.25rem)] font-black text-white uppercase tracking-tight font-pop leading-tight truncate" title={zone.city}>
              {zone.city}
            </span>
            <span className="text-[clamp(0.7rem,1.2vw,0.8rem)] font-bold text-[#666] uppercase tracking-wider mt-0.5">
              {gmtOffset}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1 h-3.5">
            <span className="text-[clamp(0.75rem,1.5vw,0.9rem)] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] font-pop truncate opacity-40">
              {zone.country || 'Global'}
            </span>
            {dayContext && (
              <span className="px-1.5 py-0.5 bg-[var(--accent-primary)]/15 text-[var(--accent-primary)] text-[7px] font-black uppercase tracking-widest rounded leading-none">
                {dayContext}
              </span>
            )}
            {isSleeping && (
              <span className="px-1.5 py-0.5 bg-[#8888ff]/15 text-[#AAB4FF] text-[7px] font-black uppercase tracking-widest rounded leading-none">
                SLEEPING
              </span>
            )}
          </div>
        </div>

        {/* Day/Night Icon */}
        <div className={`p-1.5 rounded-full transition-all duration-300 ${isNight
          ? 'text-[#8888ff] opacity-70 group-hover:opacity-100'
          : 'text-[var(--accent-primary)] opacity-70 group-hover:opacity-100'
          }`}>
          {isNight ? <Moon size={22} strokeWidth={1.5} /> : <Sun size={22} strokeWidth={1.5} />}
        </div>
      </div>


      {/* Middle: Time */}
      <div className="flex items-baseline z-10 transform translate-y-1">
        <span className={`text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.05] font-medium text-[var(--text-primary)] font-pop tracking-tighter transition-transform duration-300 ${isChanging ? 'translate-y-[-4px] opacity-80' : 'translate-y-0 opacity-100'
          }`}>
          {hourStr}
        </span>
        <span className="text-[clamp(1.2rem,2.5vw,2.4rem)] text-[var(--text-muted)] font-black mx-1 mb-1.5 time-colon leading-none">:</span>
        <span className={`text-[clamp(2.4rem,5vw,4.8rem)] leading-[1.05] font-bold text-[var(--text-primary)] font-pop tracking-tighter transition-transform duration-300 ${isChanging ? 'translate-y-[-4px] opacity-80' : 'translate-y-0 opacity-100'
          }`}>
          {minuteStr}
        </span>
        {format === TimeFormat.H12 && (
          <span className="ml-2 text-[clamp(0.6rem,1.2vw,0.8rem)] font-bold text-[var(--text-secondary)] self-end mb-1.5 opacity-50 scale-[0.7] origin-left uppercase">{dayPeriod}</span>
        )}
      </div>

      {/* Bottom: Date */}
      <div className="mt-3 flex items-center justify-between border-t border-[var(--metal-edge)] pt-2.5 z-10">
        <span className="text-[clamp(0.65rem,1.2vw,0.75rem)] font-bold text-[var(--text-secondary)] uppercase tracking-widest font-pop">
          {new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).format(now)}
        </span>
        {isWorkHours && (
          <span className="text-[clamp(0.5rem,1vw,0.6rem)] font-black text-[var(--accent-primary)]/60 uppercase tracking-wider">
            WORK HOURS
          </span>
        )}
      </div>

      {/* Delete Button */}
      <button
        onClick={() => onRemove(zone.id)}
        className="absolute top-4 right-4 p-2 text-[#444] hover:text-[#FF0099] transition-all opacity-0 group-hover:opacity-100 z-50 bg-[#0a0a0a] rounded-full border border-[#333] shadow-lg hover:scale-110"
        title="Remove Clock"
      >
        <X size={18} strokeWidth={2} />
      </button>

    </div>
  );
};

export default ClockCard;