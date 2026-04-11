import { useState, useEffect } from 'react';

export default function RocketTab() {
  const [launches] = useState([
    { id: '1', name: 'Falcon 9 • Starlink', net: '2026-04-12T14:00:00Z' },
    { id: '2', name: 'Electron • "Beginning" ', net: '2026-04-18T09:30:00Z' }
  ]);

  return (
    <div className="w-64 bg-black/80 border border-white/10 backdrop-blur-md p-4 font-mono shadow-2xl">
      <div className="text-[10px] text-red-500 font-bold tracking-widest mb-3 uppercase border-b border-white/10 pb-1">
        Upcoming Launches
      </div>
      <div className="space-y-3">
        {launches.map(l => (
          <div key={l.id} className="group">
            <div className="text-[11px] text-gray-300 group-hover:text-white transition-colors truncate">
              {l.name}
            </div>
            <Countdown date={l.net} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Countdown({ date }: { date: string }) {
  const [t, setT] = useState("--h --m");

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(date).getTime() - Date.now();
      if (diff <= 0) {
        setT("LAUNCHED");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setT(`${h}H ${m}M`);
    }, 1000);
    return () => clearInterval(timer);
  }, [date]);

  return <div className="text-[10px] text-orange-500 font-bold">{t}</div>;
}