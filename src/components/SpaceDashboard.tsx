import { useEffect, useState } from 'react';

export default function SpaceDashboard() {
  const [data, setData] = useState({ astronomy: [], aerospace: [], defense: [], missions: [], launches: [] });
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
          astronomy: news.filter((a: any) => a.title.toLowerCase().includes('astronomy') || a.summary.toLowerCase().includes('telescope')),
          aerospace: news.filter((a: any) => a.title.toLowerCase().includes('spacex') || a.title.toLowerCase().includes('boeing')),
          defense: news.filter((a: any) => a.title.toLowerCase().includes('space force') || a.title.toLowerCase().includes('military')),
          missions: news.filter((a: any) => a.title.toLowerCase().includes('nasa') || a.title.toLowerCase().includes('esa')),
          launches: launches
        });
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchAllData();
  }, []);

  if (loading) return <div className="p-10 font-mono text-red-500 animate-pulse">ESTABLISHING DATA LINK...</div>;

  return (
    <div className="grid grid-cols-12 gap-4 h-full p-6 font-mono bg-black overflow-hidden">
      {/* 4 CATEGORY GRID */}
      <div className="col-span-8 grid grid-cols-2 gap-4 overflow-y-auto pr-2 h-[85vh]">
        <NewsBox title="Astronomy & ArXiv" items={data.astronomy} />
        <NewsBox title="Aerospace" items={data.aerospace} />
        <NewsBox title="Defense & Intelligence" items={data.defense} />
        <NewsBox title="Active Missions" items={data.missions} />
      </div>

      {/* TALL LAUNCH TIMELINE */}
      <div className="col-span-4 border-l border-white/10 pl-6 h-[85vh] overflow-y-auto">
        <h2 className="text-[12px] text-red-600 font-black tracking-[0.4em] mb-6 uppercase border-b border-red-900/30 pb-2">Launch Manifest</h2>
        <div className="space-y-8 relative border-l border-white/5 ml-2">
          {data.launches.map((l: any) => (
            <div key={l.id} className="pl-6 relative">
              <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <div className="text-[11px] font-bold text-white uppercase leading-tight">{l.name}</div>
              <div className="text-[9px] text-gray-500 uppercase">{l.provider.name} • {l.vehicle.name}</div>
              <div className="text-[10px] font-black text-orange-600 mt-1">{new Date(l.win_open).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Partial update for NewsBox in SpaceDashboard.tsx
function NewsBox({ title, items }: any) {
  return (
    <div className="border border-white/10 bg-black/40 p-3 rounded-none flex flex-col h-[280px] overflow-hidden backdrop-blur-sm">
      <div className="flex justify-between items-center border-b border-red-900/40 pb-1 mb-2">
        <h3 className="text-[10px] text-red-500 font-black tracking-[0.3em] uppercase">{title}</h3>
        <span className="text-[9px] text-gray-700 font-mono animate-pulse">LIVE_FEED</span>
      </div>
      <div className="space-y-2.5 overflow-y-auto scrollbar-hide">
        {items.length > 0 ? items.map((item: any) => (
          <a key={item.id} href={item.url} target="_blank" className="block group border-l border-white/5 pl-2 hover:border-red-600 transition-all">
            <p className="text-[11px] text-gray-300 group-hover:text-white leading-[1.2] tracking-tight font-medium">
              {item.title}
            </p>
            <div className="flex gap-2 mt-1 text-[8px] text-gray-600 font-bold uppercase tracking-widest">
              <span>{item.news_site}</span>
              <span>•</span>
              <span>{new Date(item.published_at).toLocaleDateString()}</span>
            </div>
          </a>
        )) : (
          <div className="h-full flex items-center justify-center opacity-20">
             <span className="text-[10px] tracking-[0.5em] animate-pulse italic">RE-ESTABLISHING UPLINK...</span>
          </div>
        )}
      </div>
    </div>
  );

/*function Countdown({ date }: { date: string }) {
  const [timeLeft, setTimeLeft] = useState({ dd: "00", hh: "00", mm: "00", ss: "00" });

  useEffect(() => {
    const timer = setInterval(() => {
      const target = new Date(date).getTime();
      const now = Date.now();
      const diff = target - now;

      if (diff <= 0 || isNaN(target)) {
        setTimeLeft({ dd: "00", hh: "00", mm: "00", ss: "00" });
        return;
      }

      const dd = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hh = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mm = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const ss = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({
        dd: dd.toString().padStart(2, '0'),
        hh: hh.toString().padStart(2, '0'),
        mm: mm.toString().padStart(2, '0'),
        ss: ss.toString().padStart(2, '0')
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);
*/
  return (
    <div className="flex gap-1 font-mono mt-1 border-t border-white/5 pt-1">
      {Object.entries(timeLeft).map(([label, value]) => (
        <div key={label} className="flex flex-col items-center bg-white/5 px-1 rounded-sm">
          <span className="text-[14px] font-black text-orange-500 leading-none tabular-nums tracking-tighter">
            {value}
          </span>
          <span className="text-[7px] text-gray-600 uppercase font-bold">{label}</span>
        </div>
      ))}
    </div>
  );
}
