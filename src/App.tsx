import { useEffect } from 'react';
import SpaceDashboard from './components/SpaceDashboard';
import WorldDashboard from './components/WorldDashboard';
import { useOsintStore } from './store';
import { Monitor, BookOpen } from 'lucide-react';

function App() {
  const { fetchInitialEvents, subscribeToNewEvents, activeTab, setActiveTab, theme, setTheme } = useOsintStore();

  useEffect(() => {
    fetchInitialEvents();
    // Activate real-time DB listening and cleanup on unmount
    const unsubscribe = subscribeToNewEvents();
    return () => unsubscribe();
  }, [fetchInitialEvents, subscribeToNewEvents]);

  return (
    <div className="min-h-screen flex flex-col telos-bg telos-text">
      <header className="sticky top-0 z-50 telos-panel border-b telos-border shadow-sm px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.3em] telos-accent uppercase">
            TELOS
          </h1>
          
          <button 
            className="md:hidden p-2 border telos-border rounded telos-muted hover:telos-accent transition-colors"
            onClick={() => setTheme(theme === 'tactical' ? 'readable' : 'tactical')}
          >
            {theme === 'tactical' ? <BookOpen size={24} /> : <Monitor size={24} />}
          </button>
        </div>

        <nav className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {['SPACE', 'WORLD'].map((t) => (
            <button 
              key={t}
              onClick={() => setActiveTab(t as 'SPACE' | 'WORLD')}
              className={`text-sm md:text-base font-bold px-6 py-2 border rounded transition-all whitespace-nowrap ${
                activeTab === t 
                  ? 'telos-accent-border telos-accent bg-opacity-10' 
                  : 'telos-border telos-muted hover:telos-text'
              }`}
            >
              {t}
            </button>
          ))}
          
          <button 
            className="hidden md:flex items-center gap-2 px-4 py-2 text-sm border telos-border rounded telos-muted hover:telos-text transition-colors ml-4"
            onClick={() => setTheme(theme === 'tactical' ? 'readable' : 'tactical')}
          >
            {theme === 'tactical' ? <BookOpen size={18} /> : <Monitor size={18} />}
            <span className="ml-2">{theme === 'tactical' ? 'Read Mode' : 'Tactical Mode'}</span>
          </button>
        </nav>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
        {activeTab === 'SPACE' ? <SpaceDashboard /> : <WorldDashboard />}
      </main>
    </div>
  );
}

export default App;
