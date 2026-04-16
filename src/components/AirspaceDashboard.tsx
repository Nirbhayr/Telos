import { useEffect, useState } from 'react';
import { useOsintStore } from '../store';
import { Plane, AlertOctagon } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function AirspaceDashboard() {
  const [flights, setFlights] = useState<any[]>([]);

  useEffect(() => {
    // Polling live telemetry
    async function getTelemetry() {
      const { data } = await supabase
        .from('airspace_telemetry')
        .select('*')
        .order('is_priority', { ascending: false });
      
      if (data) setFlights(data);
    }

    getTelemetry();
    const interval = setInterval(getTelemetry, 30000); // 30 sec refresh
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6">
      <h2 className="text-xl md:text-2xl font-bold telos-accent border-b telos-accent-border pb-2 uppercase mb-4">
        Airspace Comm (Med / West Asia)
      </h2>

      <div className="flex flex-col gap-4">
        {flights.map((flight) => (
          <div 
            key={flight.icao} 
            className={`telos-panel border p-4 rounded flex justify-between items-center ${
              flight.is_priority ? 'border-red-500/50 bg-red-950/10' : 'telos-border'
            }`}
          >
            <div className="flex items-center gap-4">
              {flight.is_priority ? <AlertOctagon className="text-red-500" size={20} /> : <Plane className="telos-accent" size={20} />}
              <div>
                <div className="font-bold telos-text font-mono">{flight.callsign}</div>
                <div className="text-xs telos-muted">ICAO: {flight.icao} | {flight.origin}</div>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="telos-text">ALT: {Math.round(flight.altitude)}m</div>
              <div className="telos-muted">LAT: {flight.lat.toFixed(2)} LON: {flight.lon.toFixed(2)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
