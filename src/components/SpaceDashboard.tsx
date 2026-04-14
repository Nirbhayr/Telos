// SpaceDashboard.tsx
import { useEffect, useState } from 'react';

// Countdown Component (preserves your required feature)
function Countdown({ date }: { date: string }) {
  const [t, setT] = useState("--h --m --s");

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) {
        setT("LAUNCHED / IN FLIGHT");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT(`T- ${h}H ${m}M ${s}S`);
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  return <div className="text-sm telos-accent font-bold mt-2">{t}</div>;
}

export default function SpaceDashboard() {
  const [data, setData] = useState({ 
    astronomy: [], 
    aerospace: [], 
    launches: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllSpaceData() {
      try {
        const [newsRes, launchRes] = await Promise.all([
          fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=30'),
          // Switched to Launch Library 2 for the requested orbital data
          fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=6')
        ]);
        
        const news = (await newsRes.json()).results;
        const launches = (await launchRes.json()).results;

        setData({
          astronomy: news.filter((a: any) => 
            a.title.toLowerCase().includes('astronomy') || a.summary.toLowerCase().includes('telescope')
          ),
          aerospace: news.filter((a: any) => 
            a.title.toLowerCase().includes('spacex') || a.title.toLowerCase().includes('boeing') || a.title.toLowerCase().includes('defense')
          ),
          launches: launches || []
        });
      } catch (e) { 
        console.error("Space API Error:", e); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchAllSpaceData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center telos-bg telos-accent text-lg font-bold animate-pulse tracking-widest">
        ESTABLISHING UPLINK...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
      
      {/* 1. TACTILE MANIFEST TIMELINE (1 column) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">
          Manifest
        </h2>
        
        {/* Restored tactile timeline logic within a clean manifest feed */}
        <div className="relative pl-4 border-l telos-border space-y-8">
          {data.launches.map((l: any) => (
            <div key={l.id} className="relative telos-panel border telos-border p-4 rounded shadow-md group">
              {/* Timeline Dot (Aesthetic upgrade) */}
              <div className="absolute -left-[22px] top-6 w-3 h-3 telos-accent rounded-full shadow-[0_0_8px_var(--accent)] group-hover:telos-border transition-colors" />
              
              <div className="font-bold text-base telos-text mb-1">{l.name}</div>
              <div className="text-sm telos-muted mb-2">
                Provider: <span className="telos-accent">{l.launch_service_provider?.name || 'Unknown'}</span>
              </div>
              
              {/* Orbital / Trajectory Data (Requested Feature) */}
              {l.mission?.orbit?.name && (
                <div className="text-sm telos-muted">
                  Target Orbit: <span className="telos-text">{l.mission.orbit.name} ({l.mission.orbit.abbrev})</span>
                </div>
              )}
              
              {/* PAD LOCATION */}
              <div className="text-sm telos-muted mt-2 border-t telos-border pt-2">
                Pad: <span className="telos-text">{l.pad?.location?.name || 'Unknown'}</span>
              </div>
              
              {/* IST TIME (Preserves requirement) */}
              <div className="text-xs telos-muted mt-2 uppercase">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'long' })} IST
              </div>
              
              <Countdown date={l.net} />
            </div>
          ))}
        </div>
      </div>

      {/* 2. SECTOR COMM NEWS GRID (2 columns, restored) */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">
          Sector Comm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* AEROSPACE (Merged) */}
          {data.aerospace.slice(0, 10).map((n: any) => (
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
          
          {/* ASTRONOMY (Merged) */}
          {data.astronomy.slice(0, 10).map((n: any) => (
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
