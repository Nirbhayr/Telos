import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

// --- STABLE TYPESCRIPT INTERFACES ---
export interface OsintEvent {
  id: number;
  headline: string;
  summary: string;
  url: string;
  severity?: string;
  category?: string;
  created_at: string;
}

export interface SpaceEvent {
  id: number;
  headline: string;
  summary: string;
  url: string;
  created_at: string;
}

export interface LaunchEvent {
  id: string;
  name: string;
  net: string;
}

interface OsintState {
  events: OsintEvent[];
  spaceNews: SpaceEvent[];
  launches: LaunchEvent[];
  activeTab: 'SPACE' | 'WORLD';
  theme: 'tactical' | 'readable';
  setActiveTab: (tab: 'SPACE' | 'WORLD') => void;
  setTheme: (theme: 'tactical' | 'readable') => void;
  fetchInitialEvents: () => Promise<void>;
  subscribeToNewEvents: () => () => void;
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export const useOsintStore = create<OsintState>((set) => ({
  events: [],
  spaceNews: [],
  launches: [],
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
    // Fetch all required data concurrently
    const [worldRes, spaceRes, launchRes] = await Promise.all([
      supabase.from('osint_events').select('*').order('created_at', { ascending: false }).order('id', { ascending: false }).limit(50),
      supabase.from('space_events').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('space_launches').select('*').order('net', { ascending: true }).limit(5)
    ]);
    
    set({ 
      events: worldRes.data || [],
      spaceNews: spaceRes.data || [],
      launches: launchRes.data || []
    });
  },

  subscribeToNewEvents: () => {
    const worldChannel = supabase
      .channel('world-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'osint_events' }, (payload) => {
        set((state) => ({ events: [payload.new as OsintEvent, ...state.events] }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'osint_events' }, (payload) => {
        set((state) => ({ events: state.events.filter(e => e.id !== payload.old.id) }));
      })
      .subscribe();

    const spaceChannel = supabase
      .channel('space-db-changes')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'space_events' }, (payload) => {
        set((state) => ({ spaceNews: [payload.new as SpaceEvent, ...state.spaceNews] }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'space_events' }, (payload) => {
        set((state) => ({ spaceNews: state.spaceNews.filter(e => e.id !== payload.old.id) }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(worldChannel);
      supabase.removeChannel(spaceChannel);
    };
  },
}));
