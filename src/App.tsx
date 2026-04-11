import { useEffect, useState, useMemo } from 'react';
import MapView from './components/MapView';
import TacticalModule from './components/TacticalModule';
import SpaceDashboard from './components/SpaceDashboard';
import { useOsintStore } from './store';

function App() {
  const { fetchInitialEvents, subscribeToNewEvents, events, sliderTimestamp, activeTab, setActiveTab } = useOsintStore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchInitialEvents();
    const unsubscribe = subscribeToNewEvents();
    return () => unsubscribe();
  }, [fetchInitialEvents, subscribeToNewEvents]);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const timeMatch = new Date(e.created_at).getTime() <= sliderTimestamp;
      return timeMatch && (activeTab === 'WORLD' ? !e.category?.includes('Space') : e.category?.includes('Space'));
    });
  }, [events, sliderTimestamp, activeTab]);

    return (
    <main className="relative w-screen h-screen bg-[#080808] overflow-hidden text-white font-mono">
      {activeTab === 'WORLD' ? (
        <MapView events={filteredEvents} onEventClick={setSelectedEvent} />
      ) : (
        <SpaceDashboard />
      )}

      {/* TACTICAL HUD OVERLAY */}
      <div className="absolute top-8 left-8 pointer-events-none z-20">
        <div className="flex items-start gap-4">
          <div className="h-12 w-1 bg-[--tactical-cyan] shadow-[0_0_10px_rgba(0,242,255,0.5)]" />
          <div>
            <h1 className="text-2xl tracking-[0.5em] font-black glow-text-cyan">TELOS</h1>
            <div className="flex gap-4 mt-2 pointer-events-auto">
              {['WORLD', 'SPACE'].map(tab => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`text-[10px] tracking-widest px-3 py-1 border transition-all ${
                    activeTab === tab 
                    ? 'border-[--tactical-cyan] text-white bg-[--tactical-cyan]/10' 
                    : 'border-white/10 text-gray-500 hover:text-white'
                  }`}
                >
                  [{tab}]
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* THE NEW FLOATING MODULE */}
      <TacticalModule event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </main>
  );
}
export default App;



