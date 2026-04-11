import {Activity, Globe, Shield } from 'lucide-react';

export default function TacticalModule({ event, onClose }: any) {
  if (!event) return null;

  return (
    <div className="fixed bottom-10 right-10 w-80 tactical-box p-6 z-50 font-mono animate-in fade-in slide-in-from-bottom-5">
      {/* Header with Random "ID" and Status */}
      <div className="flex justify-between items-start mb-4 border-b border-white/10 pb-2">
        <div>
          <div className="text-[10px] text-[--tactical-cyan] font-bold tracking-widest flex items-center gap-2">
            <Activity size={10} className="animate-pulse" />
            SIGNAL_ACQUIRED // 0x{event.id.toString().slice(-4).toUpperCase()}
          </div>
          <div className="text-[9px] text-gray-500 mt-1 uppercase">
            TIMESTAMP: {new Date(event.created_at).toLocaleTimeString()}
          </div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">[ X ]</button>
      </div>

      {/* Main Content */}
      <h3 className="text-[--tactical-cyan] text-xs font-bold leading-tight uppercase mb-4 glow-text-cyan">
        {event.headline}
      </h3>

      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="bg-white/5 p-2 border border-white/5">
          <span className="text-[8px] text-gray-500 block uppercase">Sector</span>
          <span className="text-[10px] text-white flex items-center gap-1 uppercase">
            <Globe size={8} /> {event.category || 'Global'}
          </span>
        </div>
        <div className="bg-white/5 p-2 border border-white/5">
          <span className="text-[8px] text-gray-500 block uppercase">Threat_Lvl</span>
          <span className={`text-[10px] font-bold ${event.severity === 'High' ? 'text-[--tactical-red]' : 'text-[--tactical-amber]'}`}>
            {event.severity?.toUpperCase()}
          </span>
        </div>
      </div>

      <p className="text-gray-400 text-[10px] leading-relaxed mb-6 italic border-l-2 border-[--tactical-cyan]/30 pl-3">
        {event.summary?.replace(/<[^>]*>?/gm, '')} {/* Strips HTML tags like in your screenshot */}
      </p>

      <a href={event.url} target="_blank" rel="noreferrer" 
         className="flex items-center justify-center gap-2 w-full border border-[--tactical-cyan]/40 bg-[--tactical-cyan]/5 text-[--tactical-cyan] py-2 text-[10px] font-bold hover:bg-[--tactical-cyan]/20 transition-all uppercase tracking-widest">
        <Shield size={12} /> Access Intel Feed
      </a>
    </div>
  );
}
