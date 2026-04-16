import { useOsintStore } from '../store';
import { AlertTriangle, Globe, Activity } from 'lucide-react';

export default function WorldDashboard() {
  const { events } = useOsintStore();

  if (!events || events.length === 0) {
    return <div className="telos-muted text-center mt-10">No intelligence data available. Check scraper backend.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase mb-4">
        Global OSINT Feed
      </h2>
      
      {events.map((event) => {
        const isHigh = event.severity === 'High';
        
        return (
          <article key={event.id} className="telos-panel border telos-border p-5 md:p-6 rounded shadow-lg flex flex-col gap-3 hover:border-white/20 transition-colors">
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

            <h3 className="text-lg md:text-xl font-bold telos-text leading-tight mt-1">
              {event.headline}
            </h3>
            
            <p className="text-sm md:text-base telos-muted leading-relaxed">
              {event.summary?.replace(/<[^>]*>?/gm, '')}
            </p>

            <div className="mt-2 pt-3 border-t telos-border">
              <a 
                href={event.url} 
                target="_blank" 
                rel="noreferrer" 
                className="text-sm font-bold telos-accent hover:text-white transition-colors uppercase tracking-widest inline-flex items-center gap-2"
              >
                Access Source Report →
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}
