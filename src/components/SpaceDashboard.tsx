// src/components/SpaceDashboard.tsx
import { useOsintStore } from '../store';
import { FeedSkeleton, LaunchSkeleton } from './Skeletons';

export default function SpaceDashboard() {
  const { spaceNews, launches } = useOsintStore();

  const isSyncing = !spaceNews.length && !launches.length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pt-24 max-h-screen overflow-y-auto">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold telos-accent border-b telos-border pb-2 mb-6 uppercase tracking-widest">Launch Manifest</h2>
        <div className="relative pl-4 border-l telos-border space-y-8">
          {isSyncing ? (
            [...Array(5)].map((_, i) => <LaunchSkeleton key={i} />)
          ) : (
            launches.map((l) => (
              <div key={l.id} className="relative telos-panel border telos-border p-4 rounded">
                <div className="text-sm font-bold telos-text mb-1">{l.name}</div>
                <div className="text-[10px] telos-accent font-bold mt-2">
                  {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold telos-accent border-b telos-border pb-2 mb-6 uppercase tracking-widest">Sector Comm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isSyncing ? (
            [...Array(6)].map((_, i) => <FeedSkeleton key={i} />)
          ) : (
            spaceNews.map((n) => (
              <a href={n.url} target="_blank" rel="noreferrer" key={n.id} className="telos-panel border telos-border p-5 rounded hover:telos-accent-border transition-all flex flex-col gap-3">
                <h3 className="text-sm font-bold telos-text leading-tight">{n.headline}</h3>
                <p className="text-[11px] telos-muted line-clamp-3">{n.summary}</p>
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
