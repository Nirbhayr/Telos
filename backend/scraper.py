import os
import feedparser
from supabase import create_client
import random

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# 1. Your "Bread and Butter" OSINT Keywords
OSINT_KEYWORDS = [
    "geopolitics", "tension", "sanctions", "war", "missile", "conflict", 
    "military", "defense", "border", "deployment", "treaty", "nuclear",
    "strike", "protest", "security", "intelligence", "cyber", "invasion", "blockade", "hormuz", "strait"
    "chokepoint", "summit", "talks", "peace", "economic"
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

def get_coords(text):
    for place, coords in LOCATIONS.items():
        if place.lower() in text.lower():
            return coords[0], coords[1]
    return 20.0, 0.0 # Default fallback

# Expanded Location list with specific cities to reduce "clumping"
LOCATIONS = {
    "Kyiv": [50.45, 30.52], "Donetsk": [48.01, 37.80], "Moscow": [55.75, 37.61],
    "Tehran": [35.68, 51.38], "Tel Aviv": [32.08, 34.78], "Gaza": [31.50, 34.46],
    "Taipei": [25.03, 121.56], "New Delhi": [28.61, 77.20], "Washington": [38.90, -77.03],
    "Seoul": [37.56, 126.97], "Pyongyang": [39.03, 125.75]
}

def get_coords(text):
    for place, coords in LOCATIONS.items():
        if place.lower() in text.lower():
            # Add small random "jitter" so dots near the same city don't stack perfectly
            lat = coords[0] + (random.uniform(-0.15, 0.15))
            lng = coords[1] + (random.uniform(-0.15, 0.15))
            return lat, lng
    return 20.0 + random.uniform(-5, 5), 0.0 + random.uniform(-5, 5)

# Stricter filter: Article must have an OSINT keyword AND a geographic keyword
GEO_KEYWORDS = ["border", "region", "country", "capital", "city", "province", "strait", "sea"]



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
