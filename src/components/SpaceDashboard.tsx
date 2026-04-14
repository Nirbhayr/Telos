import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

// 1. Explicitly define types to satisfy the TypeScript compiler
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
  mission?: { orbit?: { name: string; abbrev: string } };
  launch_service_provider: { name: string };
  pad?: { location?: { name: string } };
}

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function SpaceDashboard() {
  // Use the interfaces to prevent 'never[]' errors
  const [spaceNews, setSpaceNews] = useState<SpaceEvent[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch News from your new 'space_events' table
        const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        const { data: news } = await supabase
          .from('space_events')
          .select('*')
          .gte('created_at', yesterday)
          .order('created_at', { ascending: false });

        // Fetch Launch Manifest
        const launchRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
        const launchData = await launchRes.json();

        setSpaceNews(news || []);
        setLaunches(launchData.results || []);
      } catch (err) {
        console.error("Link Failure:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#050505] text-[--tactical-cyan] font-mono animate-pulse">
        ESTABLISHING UPLINK...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 pt-24 h-screen overflow-y-auto font-mono">
      {/* MANIFEST (TIMELINE) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[--tactical-cyan] border-b border-white/10 pb-2 uppercase tracking-tighter">
          Launch Manifest
        </h2>
        <div className="relative pl-4 border-l border-white/10 space-y-6">
          {launches.map((l) => (
            <div key={l.id} className="bg-white/5 border border-white/10 p-4 rounded relative group hover:border-[--tactical-cyan]/40 transition-colors">
              <div className="absolute -left-[21px] top-5 w-2.5 h-2.5 bg-[--tactical-cyan] rounded-full shadow-[0_0_8px_var(--tactical-cyan)]" />
              <div className="font-bold text-sm text-white">{l.name}</div>
              <div className="text-[10px] text-gray-400 mt-1 uppercase">
                Orbit: <span className="text-gray-200">{l.mission?.orbit?.name || 'TBD'}</span>
              </div>
              <div className="text-[10px] text-[--tactical-cyan] font-bold mt-2 uppercase">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTOR COMM (SPACE NEWS) */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-xl font-bold text-[--tactical-cyan] border-b border-white/10 pb-2 uppercase tracking-tighter">
          Sector Comm
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaceNews.map((n) => (
            <a href={n.url} target="_blank" rel="noreferrer" key={n.id} className="bg-white/5 border border-white/10 p-5 rounded hover:border-[--tactical-cyan]/40 transition-all flex flex-col gap-2">
              <div className="flex flex-wrap gap-2">
                {n.tags?.map((tag: string) => (
                  <span key={tag} className="text-[9px] px-2 py-0.5 bg-[--tactical-cyan]/10 border border-[--tactical-cyan]/20 text-[--tactical-cyan] uppercase">
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="text-sm font-bold text-white leading-tight">{n.headline}</h3>
              <p className="text-[11px] text-gray-400 line-clamp-4 leading-relaxed">{n.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
