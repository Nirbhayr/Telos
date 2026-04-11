import os
import feedparser
import re
import random
from datetime import datetime, timedelta
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Expanded feeds to ensure we get data
FEEDS = [
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://www.theguardian.com/world/rss",
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms"
]

# Broader keywords to ensure the table populates
OSINT_KEYWORDS = ["war", "military", "border", "missile", "security", "china", "russia", "israel", "ukraine", "protest", "government", "crisis"]

def clean_html(raw_html):
    return re.sub(r'<[^>]+>', '', raw_html)

def scrape():
    print("Starting Scrape...")
    count = 0
    
    for url in FEEDS:
        feed = feedparser.parse(url)
        print(f"Checking feed: {url} - Found {len(feed.entries)} entries")
        
        for entry in feed.entries:
            title = entry.title
            summary = clean_html(entry.get('description', ''))
            combined = (title + " " + summary).lower()
            
            # Check if any keyword matches
            if any(word in combined for word in OSINT_KEYWORDS):
                # Simple Jittered Geolocation
                lat, lng = 20.0 + random.uniform(-10, 10), 0.0 + random.uniform(-10, 10)
                
                event = {
                    "headline": title,
                    "summary": summary[:250],
                    "url": entry.link,
                    "severity": "High" if "war" in combined or "missile" in combined else "Medium",
                    "lat": lat,
                    "lng": lng,
                    "category": "Geopolitics",
                    "created_at": datetime.now().isoformat()
                }
                
                try:
                    supabase.table("osint_events").upsert(event, on_conflict="url").execute()
                    count += 1
                except Exception as e:
                    print(f"Supabase Error: {e}")

    print(f"Successfully added/updated {count} events.")

if __name__ == "__main__":
    scrape()
