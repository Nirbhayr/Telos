import os
import feedparser
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# 1. Your "Bread and Butter" OSINT Keywords
OSINT_KEYWORDS = [
    "geopolitics", "tension", "sanction", "war", "missile", "conflict", 
    "military", "defense", "border", "deployment", "treaty", "nuclear",
    "strike", "protest", "security", "intelligence", "cyber", "invasion"
]

# 2. Expanded Reputable Sources
RSS_FEEDS = {
    "BBC World": "http://feeds.bbci.co.uk/news/world/rss.xml",
    "The Guardian": "https://www.theguardian.com/world/rss",
    "The Hindu": "https://www.thehindu.com/news/national/feeder/default.rss",
    "Telegraph": "https://www.telegraph.co.uk/rss.xml",
    "CNN": "http://rss.cnn.com/rss/edition_world.rss",
    "TOI": "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms"
}

# 3. Simple Geocoding Dictionary (Expand this over time)
# This maps country names found in headlines to rough coordinates
LOCATIONS = {
    "Ukraine": [48.37, 31.16], "Russia": [61.52, 105.31], "Israel": [31.04, 34.85],
    "Iran": [32.42, 53.68], "China": [35.86, 104.19], "Taiwan": [23.69, 120.96],
    "USA": [37.09, -95.71], "India": [20.59, 78.96], "North Korea": [40.33, 127.51]
}

def get_coords(text):
    for place, coords in LOCATIONS.items():
        if place.lower() in text.lower():
            return coords[0], coords[1]
    return 20.0, 0.0 # Default fallback

def scrape_feeds():
    for source_name, feed_url in RSS_FEEDS.items():
        print(f"Scanning {source_name}...")
        feed = feedparser.parse(feed_url)
        
        for entry in feed.entries:
            title = entry.title.lower()
            summary = entry.get('description', '').lower()
            combined_text = f"{title} {summary}"

            # Filter: Only keep if it matches our OSINT keywords
            if any(word in combined_text for word in OSINT_KEYWORDS):
                
                lat, lng = get_coords(combined_text)
                
                # Determine Severity
                severity = "Low"
                high_alert = ["war", "missile", "strike", "nuclear", "invasion"]
                if any(word in combined_text for word in high_alert):
                    severity = "High"
                elif "tension" in combined_text or "sanction" in combined_text:
                    severity = "Medium"

                new_event = {
                    "headline": entry.title,
                    "summary": f"[{source_name}] {entry.get('description', 'No summary available.')[:200]}...",
                    "url": entry.link,
                    "category": "Geopolitics",
                    "severity": severity,
                    "lat": lat,
                    "lng": lng,
                    "created_at": "now()"
                }

                try:
                    supabase.table("osint_events").upsert(new_event, on_conflict="url").execute()
                except Exception as e:
                    print(f"Error inserting: {e}")

if __name__ == "__main__":
    scrape_feeds()
