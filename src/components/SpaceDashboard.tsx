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

  useEffect(() => {
    async function fetchData() {
      try {
        // FIXED: Using 'error' variable name to match the check below
        const { data: news, error } = await supabase
          .from('space_events')
          .select('*')
          .order('created_at', { ascending: false })
          .order('id', { ascending: false })
          .limit(20);

        if (error) {
          console.error("SUPABASE_QUERY_ERROR:", error.message);
          return;
        }

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

  if (loading) return <div className="p-10 text-cyan-400 animate-pulse font-mono uppercase">Syncing Orbital Assets...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pt-24 max-h-screen overflow-y-auto">
      <div className="lg:col-span-1">
        <h2 className="text-xl font-bold text-cyan-400 border-b border-white/10 pb-2 mb-6 uppercase tracking-widest">Launch Manifest</h2>
        <div className="relative pl-4 border-l border-white/10 space-y-8">
          {launches.map((l) => (
            <div key={l.id} className="relative bg-white/5 border border-white/10 p-4 rounded">
              <div className="absolute -left-[21px] top-6 w-2.5 h-2.5 bg-cyan-400 rounded-full" />
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
              <div className="flex gap-2">
                {n.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 border border-cyan-400/30 text-cyan-400 uppercase">{tag}</span>
                ))}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{n.headline}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-3">{n.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
