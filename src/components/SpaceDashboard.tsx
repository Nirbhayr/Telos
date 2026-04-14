import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface SpaceEvent {
  id: string;
  headline: string;
  summary: string;
  url: string;
  tags: string[];
  created_at: string;
}

interface Launch {
  id: string;
  name: string;
  net: string;
  mission?: { orbit?: { name: string } };
  launch_service_provider: { name: string };
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SpaceDashboard() {
  const [spaceNews, setSpaceNews] = useState<SpaceEvent[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   async function fetchData() {
  //     try {
  //       const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
  //       // 1. Fetch News from Supabase
  //       const { data: news } = await supabase
  //         .from('space_events')
  //         .select('*')
  //         .gte('created_at', yesterday)
  //         .order('created_at', { ascending: false });

  //       // 2. Fetch Launch Manifest
  //       const launchRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
  //       const launchData = await launchRes.json();

  //       setSpaceNews(news || []);
  //       setLaunches(launchData.results || []);
  //     } catch (err) {
  //       console.error("Uplink Error:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   }
  //   fetchData();
  // }, []);

  // src/components/SpaceDashboard.tsx
useEffect(() => {
  async function fetchData() {
    try {
      // Comment out the timestamp calculation
      // const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: news } = await supabase
        .from('space_events')
        .select('*')
        // COMMENT OUT THIS LINE temporarily for diagnosis
        // .gte('created_at', yesterday) 
        .order('created_at', { ascending: false })
        .limit(20); // Add a limit to keep payload light

      const launchRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
      const launchData = await launchRes.json();

      setSpaceNews(news || []);
      setLaunches(launchData.results || []);
    } catch (err) {
      console.error("DATA_LINK_FAILURE:", err);
    } finally {
      setLoading(false);
    }
  }
  fetchData();
}, []);

  if (loading) return <div className="p-10 text-[--accent] animate-pulse font-mono uppercase">Syncing Orbital Assets...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pt-24 max-h-screen overflow-y-auto">
      {/* MANIFEST */}
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-[--accent] border-b border-white/10 pb-2 mb-6 uppercase tracking-widest">Launch Manifest</h2>
        <div className="relative pl-4 border-l border-white/10 space-y-8">
          {launches.map((l) => (
            <div key={l.id} className="relative bg-white/5 border border-white/10 p-4 rounded group">
              <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 bg-[--accent] rounded-full shadow-[0_0_8px_var(--accent)]" />
              <div className="text-sm font-bold text-white mb-1">{l.name}</div>
              <div className="text-[10px] text-gray-400 uppercase italic">{l.mission?.orbit?.name || 'Trajectory TBD'}</div>
              <div className="text-[10px] text-[--accent] font-bold mt-2">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTOR COMM NEWS GRID */}
      <div className="lg:col-span-2">
        <h2 className="text-xl font-bold text-[--accent] border-b border-white/10 pb-2 mb-6 uppercase tracking-widest">Sector Comm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaceNews.map((n) => (
            <a href={n.url} target="_blank" rel="noreferrer" key={n.id} className="bg-white/5 border border-white/10 p-5 rounded hover:border-[--accent]/40 transition-all flex flex-col gap-3">
              <div className="flex gap-2">
                {n.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 border border-[--accent]/30 text-[--accent] uppercase">{tag}</span>
                ))}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{n.headline}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-3 leading-relaxed">{n.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
