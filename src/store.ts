import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

interface OsintState {
  events: any[];
  activeTab: 'WORLD' | 'SPACE';
  sliderTimestamp: number;
  setActiveTab: (tab: 'WORLD' | 'SPACE') => void;
  fetchInitialEvents: () => Promise<void>;
  subscribeToNewEvents: () => () => void;
}

export const useOsintStore = create<OsintState>((set) => ({
  events: [],
  activeTab: 'WORLD',
  sliderTimestamp: Date.now(),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  fetchInitialEvents: async () => {
    // ONLY fetch from your curated Supabase table
    const { data } = await supabase
      .from('osint_events')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (data) set({ events: data });
  },

  subscribeToNewEvents: () => {
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'osint_events' }, 
        (payload) => {
          set((state) => ({ events: [payload.new, ...state.events] }));
        }
      ).subscribe();
    return () => supabase.removeChannel(channel);
  }
}));
