import { useEffect, useState, useMemo } from 'react';
import MapView from './components/MapView';
import TacticalModule from './components/TacticalModule';
import SpaceDashboard from './components/SpaceDashboard';
import { useOsintStore } from './store';

function App() {
  const { fetchInitialEvents, subscribeToNewEvents, events, activeTab, setActiveTab } = useOsintStore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchInitialEvents();
    const unsubscribe = subscribeToNewEvents();
    return () => unsubscribe();
  }, []);

  return (
    <main className="relative w-screen h-screen bg-[#050505] overflow-hidden text-white font-mono">
      {activeTab === 'WORLD' ? (
        <MapView events={events} onEventClick={setSelectedEvent} />
      ) : (
        <SpaceDashboard />
      )}

      {/* TACTICAL HEADER */}
      <div className="absolute top-10 left-10 z-20 pointer-events-none">
        <h1 className="text-3xl font-black tracking-[0.6em] glow-cyan">TELOS</h1>
        <div className="flex gap-4 mt-4 pointer-events-auto">
          {['WORLD', 'SPACE'].map(t => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as any)}
              className={`text-[10px] px-4 py-1 border transition-all ${
                activeTab === t ? 'border-[--tactical-cyan] text-[--tactical-cyan] bg-[--tactical-cyan]/10' : 'border-white/10 text-gray-500'
              }`}
            >
              // {t}
            </button>
          ))}
        </div>
      </div>

      <TacticalModule event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}

export default App;
