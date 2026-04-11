import { useEffect, useState } from 'react';

export default function SpaceDashboard() {
  const [data, setData] = useState({ 
    astronomy: [], 
    aerospace: [], 
    defense: [], 
    missions: [], 
    launches: [] 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const [newsRes, launchRes] = await Promise.all([
          fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=30'),
          fetch('https://fdo.rocketlaunch.live/json/launches/next/5')
        ]);
        
        const news = (await newsRes.json()).results;
        const launches = (await launchRes.json()).result;

        setData({
          astronomy: news.filter((a: any) => 
            a.title.toLowerCase().includes('astronomy') || 
            a.summary.toLowerCase().includes('telescope')
          ),
          aerospace: news.filter((a: any) => 
            a.title.toLowerCase().includes('spacex') || 
            a.title.toLowerCase().includes('boeing')
          ),
          defense: news.filter((a: any) => 
            a.title.toLowerCase().includes('space force') || 
            a.title.toLowerCase().includes('military')
          ),
          missions: news.filter((a: any) => 
            a.title.toLowerCase().includes('nasa') || 
            a.title.toLowerCase().includes('esa')
          ),
          launches: launches || []
        });
      } catch (e) { 
        console.error(e); 
      } finally { 
        setLoading(false); 
      }
    }
    fetchAllData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-red-600 font-mono tracking-widest">
        INITIALIZING SPACE DATA STREAM...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-8 pt-24 h-screen overflow-y-auto bg-black text-white font-mono">
      {/* Launches Section */}
      <div className="border border-white/10 p-4 bg-zinc-950">
        <h2 className="text-red-600 text-xs font-bold mb-4 border-b border-red-900/50 pb-2 uppercase tracking-tighter">Upcoming Launches</h2>
        {data.launches.map((l: any) => (
          <div key={l.id} className="mb-4 border-l-2 border-zinc-800 pl-3">
            <div className="text-[11px] font-bold">{l.name}</div>
            <div className="text-[10px] text-zinc-500">{new Date(l.net).toLocaleString()}</div>
          </div>
        ))}
      </div>

      {/* Aerospace Section */}
      <div className="border border-white/10 p-4 bg-zinc-950">
        <h2 className="text-red-600 text-xs font-bold mb-4 border-b border-red-900/50 pb-2 uppercase tracking-tighter">Aerospace & Tech</h2>
        {data.aerospace.map((a: any) => (
          <a href={a.url} target="_blank" rel="noreferrer" key={a.id} className="block mb-4 hover:bg-white/5 transition-colors p-1">
            <div className="text-[10px] leading-tight text-zinc-300 italic">{a.title}</div>
          </a>
        ))}
      </div>

      {/* Defense Section */}
      <div className="border border-white/10 p-4 bg-zinc-950">
        <h2 className="text-red-600 text-xs font-bold mb-4 border-b border-red-900/50 pb-2 uppercase tracking-tighter">Space Defense</h2>
        {data.defense.map((a: any) => (
          <a href={a.url} target="_blank" rel="noreferrer" key={a.id} className="block mb-4 hover:bg-white/5 transition-colors p-1">
            <div className="text-[10px] leading-tight text-zinc-300 italic">{a.title}</div>
          </a>
        ))}
      </div>

      {/* Missions Section */}
      <div className="border border-white/10 p-4 bg-zinc-950">
        <h2 className="text-red-600 text-xs font-bold mb-4 border-b border-red-900/50 pb-2 uppercase tracking-tighter">Global Missions</h2>
        {data.missions.map((a: any) => (
          <a href={a.url} target="_blank" rel="noreferrer" key={a.id} className="block mb-4 hover:bg-white/5 transition-colors p-1">
            <div className="text-[10px] leading-tight text-zinc-300 italic">{a.title}</div>
          </a>
        ))}
      </div>
    </div>
  );
}
