import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface OsintState {
  events: any[];
  activeTab: 'SPACE' | 'WORLD';
  theme: 'tactical' | 'readable';
  setActiveTab: (tab: 'SPACE' | 'WORLD') => void;
  setTheme: (theme: 'tactical' | 'readable') => void;
  fetchInitialEvents: () => Promise<void>;
  subscribeToNewEvents: () => () => void;
}

export const useOsintStore = create<OsintState>((set) => ({
  events: [],
  activeTab: 'SPACE', 
  theme: 'tactical',
  setActiveTab: (activeTab) => set({ activeTab }),
  setTheme: (theme) => {
    set({ theme });
    if (theme === 'readable') {
      document.documentElement.classList.add('theme-readable');
    } else {
      document.documentElement.classList.remove('theme-readable');
    }
  },
  
  fetchInitialEvents: async () => {
    const { data } = await supabase
      .from('osint_events')
      .select('*')
      // Primary sort by time, secondary by ID to ensure latest is ALWAYS on top
      .order('created_at', { ascending: false })
      .order('id', { ascending: false }) 
      .limit(50);
    
    if (data) set({ events: data });
  },

  subscribeToNewEvents: () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'osint_events' 
        }, 
        (payload) => {
          set((state) => ({
            // Spread the new event at the front of the array (index 0)
            events: [payload.new, ...state.events]
          }));
        }
      )
      .subscribe();

    // Return the unsubscribe function for use in useEffect cleanup
    return () => {
      supabase.removeChannel(channel);
    };
  },
}));
