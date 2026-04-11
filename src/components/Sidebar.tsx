import { ExternalLinkIcon, X } from 'lucide-react';

export default function Sidebar({ event, onClose }: any) {
  if (!event) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-black/90 border-l border-white/10 p-5 z-50 shadow-2xl overflow-y-auto font-mono">
      <button onClick={onClose} className="text-gray-500 hover:text-white mb-6"><X size={18}/></button>
      
      <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-4">
        <h2 className="text-red-600 text-[10px] uppercase font-bold tracking-tighter">Event Details</h2>
        <span className="text-[10px] text-gray-600">{event.category}</span>
      </div>

      <h3 className="text-white text-sm font-bold mb-4 leading-tight">{event.headline}</h3>
      <p className="text-gray-400 text-[11px] leading-relaxed mb-6 italic">"{event.summary}"</p>
      
      <a href={event.url} target="_blank" rel="noreferrer" className="text-blue-500 text-[10px] flex items-center gap-2 border border-blue-500/30 p-2 justify-center hover:bg-blue-500/10 transition-all">
        <ExternalLinkIcon size={12} /> ACCESS SOURCE DATA
      </a>
    </div>
  );
}