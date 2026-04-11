import os
import feedparser
import re
import random
import time
from datetime import datetime, timedelta
from supabase import create_client
from geopy.geocoders import Nominatim
from geopy.exc import GeopyError

geolocator = Nominatim(user_agent="telos_intel_platform_v1")
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
    
def get_coords(text):
    try:
        # We search the first 100 characters of the title for locations
        location = geolocator.geocode(text[:200], timeout=8, language='en')
        if location:
            # Add a jitter so multiple news in the same city don't stack
            return (
                location.latitude + random.uniform(-0.07, 0.07),
                location.longitude + random.uniform(-0.07, 0.07)
            )
    except Exception as e:
        print(f"Geocoding bypass: {e}")
    # for random locations
    regions = [
        (35, 105),  # Asia
        (50, 15),   # Europe
        (40, -100), # North America
        (20, 78),   # India
        (35, 120)   # East Asia
    ]
    base_lat, base_lng = random.choice(regions)
    return base_lat + random.uniform(-10, 10), base_lng + random.uniform(-10, 10)


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
                
            if any(word in combined for word in OSINT_KEYWORDS):
                lat, lng = get_coords(title)
                time.sleep(1) 

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
    

if __name__ == "__main__":
    scrape()
