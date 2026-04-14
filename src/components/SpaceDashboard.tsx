import { useEffect, useState } from 'react';

export default function SpaceDashboard() {
  const [data, setData] = useState({ news: [], launches: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSpaceData() {
      try {
        const [newsRes, launchRes] = await Promise.all([
          fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=20'),
          fetch('https://fdo.rocketlaunch.live/json/launches/next/5')
        ]);
        
        const news = (await newsRes.json()).results;
        const launches = (await launchRes.json()).result;

        setData({ news: news || [], launches: launches || [] });
      } catch (e) { 
        console.error("Failed to fetch space data:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchSpaceData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center telos-accent text-lg font-bold animate-pulse tracking-widest">
        ESTABLISHING UPLINK...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      
      {/* UPCOMING LAUNCHES (Takes 1 column on large screens) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">
          Manifest
        </h2>
        {data.launches.map((l: any) => (
          <div key={l.id} className="telos-panel border telos-border p-4 rounded shadow-md">
            <div className="font-bold text-lg telos-text mb-1">{l.name}</div>
            <div className="text-sm telos-accent mb-2">Provider: {l.provider?.name || 'Unknown'}</div>
            <div className="text-sm telos-muted">
              {l.win_open ? new Date(l.win_open).toLocaleString() : 'TBD'}
            </div>
            <div className="text-sm telos-muted mt-1 border-t telos-border pt-1">
              Pad: {l.pad?.location?.name || 'Unknown Location'}
            </div>
          </div>
        ))}
      </div>

      {/* AEROSPACE NEWS (Takes 2 columns on large screens) */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">
          Sector Comm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.news.map((n: any) => (
            <a 
              href={n.url} 
              target="_blank" 
              rel="noreferrer" 
              key={n.id} 
              className="telos-panel border telos-border p-5 rounded shadow-md hover:border-blue-500 transition-colors group flex flex-col justify-between"
            >
              <div>
                <div className="text-xs font-bold telos-accent uppercase mb-2">
                  {n.news_site} • {new Date(n.published_at).toLocaleDateString()}
                </div>
                <h3 className="text-base md:text-lg font-bold telos-text mb-3 group-hover:telos-accent transition-colors leading-snug">
                  {n.title}
                </h3>
                <p className="text-sm md:text-base telos-muted line-clamp-3">
                  {n.summary}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
