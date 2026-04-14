// SpaceDashboard.tsx
import { useEffect, useState } from 'react';

// Countdown Component
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

  return <div className="text-[10px] text-[--tactical-cyan] font-bold mt-1">{t}</div>;
}

export default function SpaceDashboard() {
  const [data, setData] = useState({ 
    astronomy: [], 
    aerospace: [], 
    launches: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [newsRes, launchRes] = await Promise.all([
          fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=30'),
          // Switched to Launch Library 2 for better orbital data
          fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5')
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
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-[--tactical-cyan] font-mono tracking-widest">
        INITIALIZING SPACE DATA STREAM...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-24 h-screen overflow-y-auto bg-black text-white font-mono">
      
      {/* TACTILE LAUNCH MANIFEST TIMELINE */}
      <div className="col-span-1 border border-white/10 p-4 bg-zinc-950/50">
        <h2 className="text-[--tactical-cyan] text-xs font-bold mb-6 border-b border-[--tactical-cyan]/30 pb-2 uppercase tracking-tighter">
          Launch Manifest
        </h2>
        <div className="relative pl-4 border-l border-zinc-800 space-y-6">
          {data.launches.map((l: any) => (
            <div key={l.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 bg-[--tactical-cyan] rounded-full shadow-[0_0_8px_var(--tactical-cyan)]" />
              
              <div className="text-[11px] font-bold text-white leading-tight">{l.name}</div>
              <div className="text-[10px] text-zinc-400 mt-1">
                Provider: <span className="text-zinc-200">{l.launch_service_provider?.name || 'TBD'}</span>
              </div>
              
              {/* Orbital / Trajectory Data */}
              {l.mission?.orbit?.name && (
                <div className="text-[10px] text-zinc-400">
                  Target Orbit: <span className="text-zinc-200">{l.mission.orbit.name} ({l.mission.orbit.abbrev})</span>
                </div>
              )}
              
              {/* Explicit IST Conversion */}
              <div className="text-[10px] text-zinc-500 mt-1 uppercase">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'long' })} IST
              </div>
              
              <Countdown date={l.net} />
            </div>
          ))}
        </div>
      </div>

      {/* AEROSPACE & COMM SECTOR (Combined for space) */}
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="border border-white/10 p-4 bg-zinc-950/50">
          <h2 className="text-[--tactical-cyan] text-xs font-bold mb-4 border-b border-[--tactical-cyan]/30 pb-2 uppercase tracking-tighter">Aerospace & Defense</h2>
          {data.aerospace.slice(0, 6).map((a: any) => (
            <a href={a.url} target="_blank" rel="noreferrer" key={a.id} className="block mb-4 hover:bg-white/5 transition-colors p-2 border border-transparent hover:border-white/5">
              <div className="text-[11px] leading-snug text-zinc-200 font-bold mb-1">{a.title}</div>
              <div className="text-[9px] text-zinc-500 line-clamp-2">{a.summary}</div>
            </a>
          ))}
        </div>
        
        <div className="border border-white/10 p-4 bg-zinc-950/50">
          <h2 className="text-[--tactical-cyan] text-xs font-bold mb-4 border-b border-[--tactical-cyan]/30 pb-2 uppercase tracking-tighter">Astronomy & Science</h2>
          {data.astronomy.slice(0, 6).map((a: any) => (
            <a href={a.url} target="_blank" rel="noreferrer" key={a.id} className="block mb-4 hover:bg-white/5 transition-colors p-2 border border-transparent hover:border-white/5">
              <div className="text-[11px] leading-snug text-zinc-200 font-bold mb-1">{a.title}</div>
              <div className="text-[9px] text-zinc-500 line-clamp-2">{a.summary}</div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
