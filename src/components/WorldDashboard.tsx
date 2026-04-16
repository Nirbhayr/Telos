// src/components/WorldDashboard.tsx
import { useState, useMemo } from 'react';
import { useOsintStore } from '../store';
import { AlertTriangle, Globe, Activity, Filter } from 'lucide-react';
import { FeedSkeleton } from './Skeletons';

export default function WorldDashboard() {
  const { events } = useOsintStore();
  const [activeFilter, setActiveFilter] = useState<string>('All');

  // Dynamically extract unique categories from the current intelligence payload
  const categories = useMemo(() => {
    if (!events) return ['All'];
    const uniqueTags = new Set(events.map(e => e.category || 'Global'));
    return ['All', ...Array.from(uniqueTags)].sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (activeFilter === 'All') return events;
    return events.filter(e => (e.category || 'Global') === activeFilter);
  }, [events, activeFilter]);

  if (!events || events.length === 0) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col gap-6">
        <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase mb-4">
          Global OSINT Feed
        </h2>
        {[...Array(4)].map((_, i) => <FeedSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b telos-accent-border pb-4 gap-4">
        <h2 className="text-xl md:text-2xl font-bold telos-accent uppercase m-0">
          Global OSINT Feed
        </h2>
        
        {/* Interactive Tag Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter size={14} className="telos-muted mr-1" />
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveFilter(category)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full transition-all uppercase tracking-wider ${
                activeFilter === category
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                  : 'bg-transparent text-gray-500 border border-gray-700 hover:border-gray-500'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex flex-col gap-6">
        {filteredEvents.map((event) => {
          const isHigh = event.severity === 'High';
          
          return (
            <article 
              key={event.id} 
              className={`telos-panel border p-5 md:p-6 rounded shadow-lg flex flex-col gap-3 transition-colors ${
                isHigh 
                  ? 'border-red-500/40 bg-red-950/10' 
                  : 'telos-border hover:border-white/20'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b telos-border pb-3">
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                    isHigh 
                      ? 'bg-red-500/10 text-red-500 border-red-500/50' 
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/50'
                  }`}>
                    {isHigh ? <AlertTriangle size={14} /> : <Activity size={14} />}
                    {event.severity || 'Normal'}
                  </span>
                  <span className="flex items-center gap-1 text-xs telos-muted uppercase tracking-widest">
                    <Globe size={14} /> {event.category || 'Global'}
                  </span>
                </div>
                <div className="text-xs telos-muted font-mono">
                  {new Date(event.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false })}
                </div>
              </div>

              <h3 className={`font-bold telos-text leading-tight mt-1 ${isHigh ? 'text-xl md:text-2xl text-red-100' : 'text-lg md:text-xl'}`}>
                {event.headline}
              </h3>
              
              <p className={`md:text-base leading-relaxed ${isHigh ? 'text-gray-300 text-base' : 'telos-muted text-sm'}`}>
                {event.summary?.replace(/<[^>]*>?/gm, '')}
              </p>

              <div className="mt-2 pt-3 border-t telos-border">
                <a 
                  href={event.url} 
                  target="_blank" 
                  rel="noreferrer" 
                  className={`text-sm font-bold uppercase tracking-widest inline-flex items-center gap-2 transition-colors ${
                    isHigh ? 'text-red-400 hover:text-red-300' : 'telos-accent hover:text-white'
                  }`}
                >
                  Access Source Report →
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
