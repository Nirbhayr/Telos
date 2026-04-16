import { create } from 'zustand';
import { createClient } from '@supabase/supabase-js';

export interface OsintEvent {
  id: number;
  headline: string;
  summary: string;
  url: string;
  severity?: string;
  category?: string;
  created_at: string;
}

export interface LaunchEvent {
  id: string;
  name: string;
  net: string;
}

interface OsintState {
  events: OsintEvent[];
  spaceNews: OsintEvent[];
  launches: LaunchEvent[];
  activeTab: 'SPACE' | 'WORLD' | 'AIRSPACE'; // Updated
  theme: 'tactical' | 'readable';
  setActiveTab: (tab: 'SPACE' | 'WORLD' | 'AIRSPACE') => void;
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
  theme: 'tactical', // Ensure this is explicitly set here
  setActiveTab: (activeTab) => set({ activeTab }),
  setTheme: (theme) => {
    set({ theme });
    document.documentElement.classList.toggle('theme-readable', theme === 'readable');
  },
  fetchInitialEvents: async () => {
    const [world, space, launch] = await Promise.all([
      supabase.from('osint_events').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('space_events').select('*').order('created_at', { ascending: false }).limit(20),
      supabase.from('space_launches').select('*').order('net', { ascending: true }).limit(5)
    ]);
    set({ 
        events: world.data || [], 
        spaceNews: space.data || [], 
        launches: launch.data || [],
        theme: 'tactical' // Explicitly re-set or use a functional update to satisfy TS
    });
  },
  subscribeToNewEvents: () => {
    const channel = supabase.channel('global-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'osint_events' }, () => {})
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }
}));
