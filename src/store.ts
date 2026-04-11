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
  setSliderTimestamp: (time: number) => void;
  subscribeToNewEvents: () => () => void;
}

export const useOsintStore = create<OsintState>((set) => ({
  events: [],
  activeTab: 'WORLD',
  sliderTimestamp: Date.now(),
  setActiveTab: (activeTab) => set({ activeTab }),
  setSliderTimestamp: (time) => set({ sliderTimestamp: time }),
  
fetchInitialEvents: async () => {
  const { data: supabaseData } = await supabase
    .from('osint_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (supabaseData) {
    set({ events: supabaseData });
  }
},

  // 2. Fetch LIVE World News (Example using a free news API)
  // Note: Replace API_KEY with a free key from newsapi.org or gnews.io
  try {
    const liveNewsRes = await fetch('https://ok.surf/api/v1/cors/news-feed'); 
    const liveData = await liveNewsRes.json();
    
    // Map live news to your TELOS format
    const worldNews = liveData.World.map((article: any, index: number) => ({
      id: `live-${index}`,
      headline: article.title,
      summary: article.source,
      url: article.link,
      category: 'Geopolitics',
      severity: 'Medium',
      lat: 20 + (Math.random() * 20), // Placeholder: Actual geocoding requires a paid service
      lng: 0 + (Math.random() * 40),
      created_at: new Date().toISOString()
    }));

    set({ events: [...(supabaseData || []), ...worldNews] });
  } catch (e) {
    if (supabaseData) set({ events: supabaseData });
  }
},

  subscribeToNewEvents: () => {
    const channel = supabase.channel('osint-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'osint_events' }, 
        (payload) => {
          set((state) => ({ events: [payload.new, ...state.events] }));
        }
      ).subscribe();
    return () => { supabase.removeChannel(channel); };
  }
}));


 
