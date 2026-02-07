import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Loader2, Globe } from 'lucide-react';
import { MAJOR_TIMEZONES } from '../constants';
import { SearchResult } from '../types';

interface TimezoneSelectorProps {
  onAdd: (result: SearchResult) => void;
  onClose: () => void;
}

const TimezoneSelector: React.FC<TimezoneSelectorProps> = ({ onAdd, onClose }) => {
  const [query, setQuery] = useState('');
  const [filteredZones, setFilteredZones] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (query.length < 2) {
      setFilteredZones(MAJOR_TIMEZONES.slice(0, 12));
      return;
    }
    const filtered = MAJOR_TIMEZONES.filter(tz =>
      tz.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 12);
    setFilteredZones(filtered);
  }, [query]);

  const handleSelect = async (tz: string) => {
    setIsLoading(true);
    try {
      // Use WorldTimeAPI to get timezone info
      const response = await fetch(`https://worldtimeapi.org/api/timezone/${tz}`);
      if (response.ok) {
        const data = await response.json();
        const parts = tz.split('/');
        const city = (parts[parts.length - 1] || tz).replace(/_/g, ' ');
        onAdd({
          zoneName: tz,
          city: city,
          country: parts[0] || 'Unknown'
        });
        onClose();
      } else {
        // Fallback if API fails
        const parts = tz.split('/');
        const city = (parts[parts.length - 1] || tz).replace(/_/g, ' ');
        onAdd({
          zoneName: tz,
          city: city,
          country: parts[0] || 'Unknown'
        });
        onClose();
      }
    } catch (error) {
      // Fallback on error
      const parts = tz.split('/');
      const city = (parts[parts.length - 1] || tz).replace(/_/g, ' ');
      onAdd({
        zoneName: tz,
        city: city,
        country: parts[0] || 'Unknown'
      });
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="w-full max-w-xl bg-[#0a0a0a] border border-[#222] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-6 border-b border-[#222] flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#CCFF00]/10 text-[#CCFF00] rounded-xl">
              <Globe size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Add Location</h2>
              <p className="text-[9px] font-bold text-[#555] uppercase tracking-widest mt-1">Search Timezones</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 text-[#555] hover:text-white hover:bg-[#222] transition-all rounded-xl"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#555]" size={20} />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search city or region..."
              className="w-full pl-12 pr-4 py-4 bg-[#111] border border-[#222] rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-[#CCFF00]/50 focus:border-[#CCFF00]/50 transition-all placeholder:text-[#555]"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Results */}
          <div className="space-y-3">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#555] mb-4 px-1">
              {query.length >= 2 ? 'Search Results' : 'Popular Timezones'}
            </h3>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
              {filteredZones.length > 0 ? filteredZones.map((tz) => (
                <button
                  key={tz}
                  onClick={() => handleSelect(tz)}
                  disabled={isLoading}
                  className="w-full flex items-center justify-between p-4 bg-[#111] hover:bg-[#1a1a1a] border border-[#222] hover:border-[#CCFF00]/30 rounded-xl group transition-all duration-200 disabled:opacity-50"
                >
                  <div className="text-left">
                    <p className="font-black text-white group-hover:text-[#CCFF00] transition-colors uppercase text-sm tracking-wider">
                      {tz.split('/').pop()?.replace(/_/g, ' ')}
                    </p>
                    <p className="text-[10px] text-[#555] font-mono mt-1">{tz}</p>
                  </div>
                  <div className="p-2 bg-[#222] rounded-lg group-hover:bg-[#CCFF00] group-hover:text-black transition-all">
                    {isLoading ? (
                      <Loader2 size={16} strokeWidth={3} className="animate-spin" />
                    ) : (
                      <Plus size={16} strokeWidth={3} />
                    )}
                  </div>
                </button>
              )) : (
                <div className="py-12 text-center">
                  <p className="text-[10px] font-black text-[#333] uppercase tracking-[0.4em]">No results found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#050505] border-t border-[#222] text-center">
          <p className="text-[8px] text-[#555] uppercase tracking-[0.4em] flex items-center justify-center gap-3">
            WorldTime API <span className="text-[#CCFF00] font-black">Online</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default TimezoneSelector;