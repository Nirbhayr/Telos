import { useEffect, useState, useMemo } from 'react';
import MapView from './components/MapView';
import Sidebar from './components/Sidebar';
import Timeline from './components/Timeline';
import SpaceDashboard from './components/SpaceDashboard';
import { useOsintStore } from './store';

function App() {
  const { fetchInitialEvents, subscribeToNewEvents, events, sliderTimestamp, activeTab, setActiveTab } = useOsintStore();
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchInitialEvents();
    const unsubscribe = subscribeToNewEvents();
    return () => unsubscribe();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const timeMatch = new Date(e.created_at).getTime() <= sliderTimestamp;
      return timeMatch && (activeTab === 'WORLD' ? !e.category?.includes('Space') : e.category?.includes('Space'));
    });
  }, [events, sliderTimestamp, activeTab]);

 // Inside App.tsx
return (
  <main className="relative w-screen h-screen bg-black overflow-hidden text-white font-mono">
    {activeTab === 'WORLD' ? (
      <MapView events={filteredEvents} onEventClick={setSelectedEvent} />
    ) : (
      <SpaceDashboard />
    )}

    {/* OVERLAY HUD */}
    <div className="absolute inset-0 pointer-events-none z-20">
      <div className="p-8">
        <h1 className="text-2xl tracking-[0.4em] font-black border-l-4 border-red-600 pl-4 flex items-baseline gap-2 pointer-events-auto">
          TELOS <span className="text-[10px] text-red-500 font-bold tracking-normal opacity-70">v1.0</span>
        </h1>
        
        <div className="flex gap-6 mt-4 pl-4 text-[11px] tracking-widest uppercase pointer-events-auto">
          <button 
            onClick={() => setActiveTab('WORLD')}
            className={`pb-1 ${activeTab === 'WORLD' ? 'text-white border-b-2 border-red-600' : 'text-gray-600 hover:text-white'}`}
          >
            [ WORLD ]
          </button>
          <button 
            onClick={() => setActiveTab('SPACE')}
            className={`pb-1 ${activeTab === 'SPACE' ? 'text-white border-b-2 border-red-600' : 'text-gray-600 hover:text-white'}`}
          >
            [ SPACE ]
          </button>
        </div>
      </div>
    </div>

    {/* SIDEBAR SHOULD BE POINTER-EVENTS-AUTO */}
    <Sidebar event={selectedEvent} onClose={() => setSelectedEvent(null)} />
  </main>
);
}

export default App;