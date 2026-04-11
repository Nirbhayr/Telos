// sync.js - Run this to keep Supabase updated
async function syncSpaceNews() {
  const res = await fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=50');
  const articles = (await res.json()).results;
  
  for (const article of articles) {
    const { error } = await supabase
      .from('osint_events')
      .upsert({
        headline: article.title,
        summary: article.summary,
        url: article.url,
        category: article.title.toLowerCase().includes('space force') ? 'Defense' : 'Aerospace',
        severity: 'Medium',
        created_at: article.published_at,
        // Optional: Geocode based on keywords in title
      }, { onConflict: 'headline' });
  }
}