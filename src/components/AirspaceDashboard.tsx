import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { createClient } from '@supabase/supabase-js';
import { ShieldAlert, Clock } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);

export default function AirspaceDashboard() {
  const [assets, setAssets] = useState<any[]>([]);
  const [tracks, setTracks] = useState<Record<string, [number, number][]>>({});
  const [lastSync, setLastSync] = useState<Date>(new Date());

  const fetchData = async () => {
    const { data: current } = await supabase.from('airspace_current').select('*');
    const { data: history } = await supabase.from('airspace_tracks').select('*').order('timestamp', { ascending: true });

    if (current) setAssets(current);
    if (history) {
      const grouped = history.reduce((acc: any, point: any) => {
        if (!acc[point.icao]) acc[point.icao] = [];
        acc[point.icao].push([point.lat, point.lon]);
        return acc;
      }, {});
      setTracks(grouped);
    }
    setLastSync(new Date());
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // UI updates every 1 min
    return () => clearInterval(interval);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    const h = Math.floor(diff / 3600);
    const m = Math.floor((diff % 3600) / 60);
    const s = diff % 60;
    return `T-${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
  };

  return (
    <div className="flex flex-col h-[calc(100-200px)] gap-4">
      <div className="flex justify-between items-center border-b telos-border pb-2">
        <h2 className="text-xl font-bold telos-accent uppercase tracking-widest">Airspace Intel</h2>
        <div className="flex items-center gap-2 text-xs font-mono telos-muted">
          <Clock size={14} /> DATA_AGE: {formatTimeAgo(lastSync)}
        </div>
      </div>

      <div className="h-[600px] w-full border telos-border rounded overflow-hidden grayscale contrast-125">
        <MapContainer center={[30, 45]} zoom={5} style={{ height: '100%', width: '100%', background: '#050505' }}>
          <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
          
          {assets.map(asset => (
            <div key={asset.icao}>
              {/* Plot Flight Track */}
              {tracks[asset.icao] && (
                <Polyline 
                  positions={tracks[asset.icao]} 
                  pathOptions={{ color: asset.is_priority ? '#ef4444' : '#00f2ff', weight: 1, opacity: 0.5 }} 
                />
              )}
              {/* Aircraft Marker */}
              <Marker position={[asset.lat, asset.lon]}>
                <Popup className="telos-popup">
                  <div className="font-mono text-xs">
                    <div className="font-bold border-b mb-1">{asset.callsign}</div>
                    <div>ALT: {Math.round(asset.alt)}m</div>
                    <div>SPD: {Math.round(asset.velocity * 3.6)} km/h</div>
                  </div>
                </Popup>
              </Marker>
            </div>
          ))}
        </MapContainer>
      </div>
      
      {/* Quick Priority List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 overflow-y-auto max-h-48">
        {assets.filter(a => a.is_priority).map(a => (
          <div key={a.icao} className="p-3 border border-red-500/30 bg-red-950/10 rounded flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="text-red-500" size={16} />
              <span className="font-bold font-mono">{a.callsign}</span>
            </div>
            <span className="text-[10px] telos-muted uppercase">{a.origin_country}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
