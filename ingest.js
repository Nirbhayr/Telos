import { createClient } from '@supabase/supabase-js';
// Use your Supabase credentials here (For a backend script, use the Service Role Key eventually)
const supabase = createClient('https://vupwfzjzzwgnclbfdkej.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ1cHdmemp6endnbmNsYmZka2VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDUyMTksImV4cCI6MjA5MTQyMTIxOX0.J0jtmdNLCBcpbIeSbBqgl9oUzWcC8Q-3ZQ0iQsQi-fs');
// Minimal fuzzy geocoder
const locations = {
  "Washington": { lat: 38.8951, lng: -77.0364 },
  "Taipei": { lat: 25.0329, lng: 121.5654 },
  "Kyiv": { lat: 50.4501, lng: 30.5234 }
};

async function pushDummyData() {
 
const dummyEvent = {
  headline: "Diplomatic Summit in Kyiv",
  summary: "Leaders meet to discuss peace framework.",
  lat: 50.4501, 
  lng: 30.5234,
  severity: "High",
  category: "Geopolitics" // This will show in WORLD
};

  const { error } = await supabase.from('osint_events').insert([dummyEvent]);
  if (error) console.error("Error:", error);
  else console.log("Injected event into database.");
}
const worldEvent = {
  headline: "Artemis 2 Astronauts Send Easter Message",
  summary: "The crew preparing for lunar flyby provided a mission update from orbit.",
  lat: 28.5721, lng: -80.6480, // Cape Canaveral
  severity: "Medium",
  category: "Geopolitics" // Shows in WORLD
};

const spaceEvent = {
  headline: "Anduril Wins Space Domain Awareness Contract",
  summary: "New $1.4M contract for space-based situational awareness.",
  lat: 33.6411, lng: -117.9186, // Costa Mesa
  severity: "High",
  category: "Space/Defense" // Shows in SPACE
};

pushDummyData();