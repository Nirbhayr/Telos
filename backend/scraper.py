import os
import feedparser
import re
import random
from datetime import datetime, timedelta
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# Stricter Filter
BLOCKLIST = ["advertisement", "sponsored", "deal", "chicken", "recipe"]
OSINT_KEYWORDS = ["missile", "strike", "border", "military", "sanction", "conflict", "nuclear"]

def clean_html(raw_html):
    return re.sub(r'<[^>]+>', '', raw_html)

def scrape():
    # 1. DELETE OLD DATA (Older than 48 hours)
    cutoff = (datetime.now() - timedelta(hours=48)).isoformat()
    supabase.table("osint_events").delete().lt("created_at", cutoff).execute()

    feed = feedparser.parse("http://feeds.bbci.co.uk/news/world/rss.xml")
    
    for entry in feed.entries:
        title = entry.title
        summary = clean_html(entry.get('description', ''))
        
        # Validation
        if any(word in title.lower() for word in BLOCKLIST): continue
        if not any(word in title.lower() for word in OSINT_KEYWORDS): continue

        # Geolocation logic (Simplified for this step)
        lat, lng = 20.0 + random.uniform(-2, 2), 0.0 + random.uniform(-2, 2)
        if "Ukraine" in title: lat, lng = 48.37, 31.16
        if "Israel" in title: lat, lng = 31.04, 34.85

        event = {
            "headline": title,
            "summary": summary[:250],
            "url": entry.link,
            "severity": "High" if "strike" in title.lower() else "Medium",
            "lat": lat,
            "lng": lng,
            "category": "Geopolitics",
            "created_at": "now()"
        }
        supabase.table("osint_events").upsert(event, on_conflict="url").execute()

if __name__ == "__main__":
    scrape()
