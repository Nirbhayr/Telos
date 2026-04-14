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
}

export const useOsintStore = create<OsintState>((set) => ({
  events: [],
  activeTab: 'SPACE', // Space is now the priority
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
      .order('created_at', { ascending: false })
      .limit(50); // Keep payload light
    
    if (data) set({ events: data });
  }
}));
