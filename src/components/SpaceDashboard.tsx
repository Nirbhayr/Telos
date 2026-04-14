import { useEffect, useState } from 'react';
import { useOsintStore } from '../store'; // Assuming you add fetchSpaceEvents to your store
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function SpaceDashboard() {
  const [spaceNews, setSpaceNews] = useState([]);
  const [launches, setLaunches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // 1. Fetch Space News from Supabase (Filtered by 24h)
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data: news } = await supabase
        .from('space_events')
        .select('*')
        .gte('created_at', yesterday)
        .order('created_at', { ascending: false });

      // 2. Fetch Dynamic Launch Manifest
      const launchRes = await fetch('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5');
      const launchData = await launchRes.json();

      setSpaceNews(news || []);
      setLaunches(launchData.results || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-10 telos-accent animate-pulse font-mono">LINKING SPACE ASSETS...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* MANIFEST (TIMELINE) */}
      <div className="lg:col-span-1 flex flex-col gap-4">
        <h2 className="text-xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">Manifest</h2>
        <div className="relative pl-4 border-l telos-border space-y-6">
          {launches.map(l => (
            <div key={l.id} className="telos-panel border telos-border p-4 rounded relative">
              <div className="absolute -left-[21px] top-5 w-2.5 h-2.5 telos-accent rounded-full shadow-[0_0_5px_var(--accent)]" />
              <div className="font-bold text-sm telos-text">{l.name}</div>
              <div className="text-xs telos-muted mt-1">{l.mission?.orbit?.name || 'LEO'} • {l.launch_service_provider.name}</div>
              <div className="text-[10px] telos-accent font-bold mt-2 uppercase">
                {new Date(l.net).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* SECTOR COMM (ALL SPACE NEWS) */}
      <div className="lg:col-span-2 flex flex-col gap-4">
        <h2 className="text-xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase">Sector Comm</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {spaceNews.map(n => (
            <a href={n.url} target="_blank" rel="noreferrer" key={n.id} className="telos-panel border telos-border p-5 rounded hover:border-blue-500 transition-all flex flex-col gap-2">
              <div className="flex gap-2">
                {n.tags?.map(tag => (
                  <span key={tag} className="text-[9px] px-1 border telos-accent-border telos-accent uppercase">{tag}</span>
                ))}
              </div>
              <h3 className="text-md font-bold telos-text leading-tight">{n.headline}</h3>
              <p className="text-sm telos-muted line-clamp-4 leading-relaxed">{n.summary}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
