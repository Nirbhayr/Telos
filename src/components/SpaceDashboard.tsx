import { useOsintStore } from '../store';

export default function SpaceDashboard() {
  const { spaceNews, launches } = useOsintStore();

  if (!spaceNews.length && !launches.length) {
    return <div className="p-10 text-cyan-400 animate-pulse font-mono uppercase">Syncing Orbital Assets...</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pt-24 max-h-screen overflow-y-auto">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-cyan-400 border-b border-white/10 pb-2 mb-6 uppercase tracking-widest">Launch Manifest</h2>
        <div className="relative pl-4 border-l border-white/10 space-y-8">
          {launches.map((l) => (
            <div key={l.id} className="relative bg-white/5 border border-white/10 p-4 rounded">
              <div className="text-sm font-bold text-white mb-1">{l.name}</div>
              <div className="text-[10px] text-cyan-400 font-bold mt-2">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-cyan-400 border-b border-white/10 pb-2 mb-6 uppercase tracking-widest">Sector Comm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaceNews.map((n) => (
            <a href={n.url} target="_blank" rel="noreferrer" key={n.id} className="bg-white/5 border border-white/10 p-5 rounded hover:border-cyan-400/40 transition-all flex flex-col gap-3">
              <h3 className="text-sm font-bold text-white leading-tight">{n.headline}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-3">{n.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
