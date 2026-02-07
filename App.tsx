import React, { useState, useEffect, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { TimeZoneEntry, TimeFormat, SearchResult } from './types';
import { INITIAL_ZONES } from './constants';
import ClockCard from './components/ClockCard';
import TimezoneSelector from './components/TimezoneSelector';
import TimeTravelControl from './components/TimeTravelControl';

const App: React.FC = () => {
  const [zones, setZones] = useState<TimeZoneEntry[]>(() => {
    const saved = localStorage.getItem('meridian_zones');
    return saved ? JSON.parse(saved) : INITIAL_ZONES;
  });

  const [timeOffset, setTimeOffset] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [realTime, setRealTime] = useState(new Date());
  const [showSelector, setShowSelector] = useState(false);

  // Time Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setRealTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const displayTime = useMemo(() => {
    return new Date(realTime.getTime() + timeOffset * 60000);
  }, [realTime, timeOffset]);

  useEffect(() => {
    localStorage.setItem('meridian_zones', JSON.stringify(zones));
  }, [zones]);

  const handleAddZone = (result: SearchResult) => {
    const newEntry: TimeZoneEntry = {
      id: Math.random().toString(36).substr(2, 9),
      name: result.country || 'International',
      zoneName: result.zoneName,
      city: result.city,
    };
    setZones(prev => [...prev, newEntry]);
  };

  const handleRemoveZone = (id: string) => {
    setZones(prev => prev.filter(z => z.id !== id));
  };

  return (
    <div className="min-h-screen text-white font-pop pb-48 selection:bg-[var(--accent-primary)] selection:text-black">

      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl h-20 flex items-center justify-between px-6 sm:px-12 border-b border-[var(--metal-edge)]" style={{
        background: 'linear-gradient(180deg, rgba(12, 15, 20, 0.95), rgba(20, 25, 34, 0.85))'
      }}>
        <div className="flex items-center gap-3">
          <img src="/favicon.svg" alt="GlobalSync Logo" className="w-6 h-6 logo-glow" />
          <h1 className="text-2xl font-black tracking-tighter text-white" style={{ fontFamily: 'JetBrains Mono' }}  >EPOCH - WORLD TIMER</h1>
        </div>

        <button
          onClick={() => setShowSelector(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent-primary)] text-black font-black uppercase text-xs tracking-wider hover:bg-white transition-all shadow-lg hover:shadow-xl hover:scale-105"
          title="Add City"
        >
          <Plus size={18} strokeWidth={3} />
          <span className="hidden sm:inline">Add City</span>
        </button>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 sm:px-12 py-12 relative z-10">

        {/* Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {zones.map((zone, idx) => (
            <ClockCard
              key={zone.id}
              zone={zone}
              now={displayTime}
              format={TimeFormat.H12}
              onRemove={handleRemoveZone}
              isDimmed={isScrubbing}
              isAnchor={idx === 0}
            />
          ))}

          {zones.length === 0 && (
            <div className="col-span-full h-[400px] flex flex-col items-center justify-center border-2 border-dashed border-[#222] rounded-[32px] text-[#444]">
              <h2 className="text-3xl font-black text-[#333] mb-4">TIMELINE EMPTY</h2>
              <button
                onClick={() => setShowSelector(true)}
                className="px-8 py-4 bg-[var(--accent-primary)] text-black font-black uppercase tracking-wider rounded-xl hover:scale-105 transition-transform"
              >
                Initialize System
              </button>
            </div>
          )}
        </div>

      </main>

      {/* Time Travel Slider */}
      <TimeTravelControl
        offset={timeOffset}
        setOffset={setTimeOffset}
        onReset={() => setTimeOffset(0)}
        isScrubbing={isScrubbing}
        setIsScrubbing={setIsScrubbing}
      />

      {showSelector && (
        <TimezoneSelector
          onAdd={handleAddZone}
          onClose={() => setShowSelector(false)}
        />
      )}
    </div>
  );
};

export default App;