export default function TacticalModule({ event, onClose }: any) {
  if (!event) return null;

  return (
    <div className="fixed bottom-12 right-12 w-96 tactical-box p-6 z-50 font-mono animate-in fade-in slide-in-from-right-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <div className="text-[10px] text-[--tactical-cyan] tracking-[0.2em] font-bold">SIGNAL ACQUIRED // 0x{event.id.slice(0,4)}</div>
          <div className="text-[9px] text-gray-500 uppercase">{new Date(event.created_at).toISOString()}</div>
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-[--tactical-red] transition-colors"> [X] </button>
      </div>

      <div className="border-l-2 border-[--tactical-cyan] pl-4 mb-4">
        <h3 className="text-white text-xs font-bold leading-tight uppercase tracking-tight">
          {event.headline}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4 text-[9px] uppercase tracking-tighter">
        <div className="bg-white/5 p-2 border border-white/5">
          <span className="text-gray-500 block">SEVERITY</span>
          <span className={event.severity === 'High' ? 'text-[--tactical-red]' : 'text-[--tactical-amber]'}>
            {event.severity}
          </span>
        </div>
        <div className="bg-white/5 p-2 border border-white/5">
          <span className="text-gray-500 block">LAT / LNG</span>
          <span className="text-white">{Number(event.lat).toFixed(2)} / {Number(event.lng).toFixed(2)}</span>
        </div>
      </div>

      <p className="text-gray-400 text-[10px] leading-relaxed mb-6 italic border-t border-white/10 pt-4">
        {event.summary}
      </p>

      <a href={event.url} target="_blank" rel="noreferrer" 
         className="block w-full text-center border border-[--tactical-cyan]/40 text-[--tactical-cyan] py-2 text-[10px] hover:bg-[--tactical-cyan]/10 transition-all">
        ENCRYPTED SOURCE ACCESS _
      </a>
    </div>
  );
}
