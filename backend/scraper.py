# # scraper.py
# import os
# import feedparser
# import re
# import random
# import time
# from datetime import datetime
# from supabase import create_client
# from geopy.geocoders import Nominatim

# geolocator = Nominatim(user_agent="telos_intel_platform_v2")
# url = os.environ.get("SUPABASE_URL")
# key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
# supabase = create_client(url, key)

# # Broadened to top-tier global news feeds
# FEEDS = [
#     "http://feeds.bbci.co.uk/news/world/rss.xml",
#     "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
#     "https://www.aljazeera.com/xml/rss/all.xml",
#     "https://moxie.foxnews.com/google-publisher/world.xml",
#     "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
#     "https://www.theguardian.com/world/rss",
#     "https://www.foreignaffairs.com/rss.xml",
#     "https://globalissues.org/news/feed",
#     "https://www.e-ir.info/feed",
#     "https://www.nytimes.com/svc/collections/v1/publish/http://www.nytimes.com/topic/subject/international-relations/rss.xml"
#     "https://www.theverge.com/rss/index.xml",
#     "https://www.washingtonpost.com/arcio/rss/category/politics/?itid=lk_inline_manual_2",
#     "https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_14",
#     "https://feeds.washingtonpost.com/rss/business/technology?itid=lk_inline_manual_12",
#     "https://www.thehindu.com/business/Economy/feeder/default.rss",
#     "https://www.thehindu.com/news/international/feeder/default.rss",
#     "https://www.thehindu.com/business/Industry/feeder/default.rss",
# ]

# def clean_html(raw_html):
#     return re.sub(r'<[^>]+>', '', raw_html)

# def generate_tags(text):
#     text_lower = text.lower()
#     tags = []
    
#     # Simple keyword routing for contextual tagging
#     if any(w in text_lower for w in ["war", "military", "missile", "troops", "defense", "strike"]): tags.append("Conflict")
#     if any(w in text_lower for w in ["pandemic", "virus", "health", "disease", "vaccine", "study"]): tags.append("Health/Science")
#     if any(w in text_lower for w in ["economy", "inflation", "trade", "market", "bank"]): tags.append("Economy")
#     if any(w in text_lower for w in ["election", "parliament", "president", "minister", "court"]): tags.append("Politics")
#     if any(w in text_lower for w in ["climate", "earthquake", "typhoon", "storm", "flood"]): tags.append("Environment")
    
#     # Fallback if no specific tags match
#     if not tags: tags.append("Global")
    
#     return tags

# def get_coords(text): 
#     regions = [(35, 105), (50, 15), (40, -100), (20, 78), (35, 120)]
#     base_lat, base_lng = random.choice(regions)
#     return base_lat + random.uniform(-10, 10), base_lng + random.uniform(-10, 10)

# def scrape():
#     print("Starting Global Scrape...")
#     count = 0
    
#     for url in FEEDS:
#         feed = feedparser.parse(url)
#         print(f"Checking feed: {url} - Found {len(feed.entries)} entries")
            
#         for entry in feed.entries[:15]: # Limit per feed to avoid overloading
#             title = entry.title
#             # Attempt to grab a longer description if available, fallback to standard summary
#             raw_summary = entry.get('description', '') 
#             summary = clean_html(raw_summary)
            
#             # Allow longer summaries (up to 500 chars) for 5-6 lines of context
#             trimmed_summary = summary[:500] + '...' if len(summary) > 500 else summary
            
#             lat, lng = get_coords(title)
#             tags = generate_tags(title + " " + summary)
#             time.sleep(1.5) # Respect geocoding rate limits

#             event = {
#                 "headline": title,
#                 "summary": trimmed_summary if trimmed_summary else "No extended summary available.",
#                 "url": entry.link,
#                 "tags": tags, # Replacing category and severity
#                 "lat": lat,
#                 "lng": lng,
#                 "created_at": datetime.now().isoformat()
#             }
#             try:
#                 supabase.table("osint_events").upsert(event, on_conflict="url").execute()
#                 count += 1
#             except Exception as e:
#                 print(f"Supabase Error: {e}")
# if __name__ == "__main__":
#     scrape()

import os
import feedparser
import re
from datetime import datetime, timedelta
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

# DIVERSE SPACE SOURCES
SPACE_FEEDS = {
    "Research": "https://arxiv.org/rss/astro-ph",
    "NASA": "https://www.nasa.gov/news-release/feed/",
    "SpaceWeather": "https://services.swpc.noaa.gov/text/discussion.txt", # We handle this specially below
    "ESA": "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    "General": "https://spacenews.com/feed/"
}

WORLD_FEEDS = [
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.foreignaffairs.com/rss.xml",
    "https://www.nytimes.com/svc/collections/v1/publish/http://www.nytimes.com/topic/subject/international-relations/rss.xml"
    "https://www.theverge.com/rss/index.xml",
    "https://www.washingtonpost.com/arcio/rss/category/politics/?itid=lk_inline_manual_2",
    "https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_14",
    "https://feeds.washingtonpost.com/rss/business/technology?itid=lk_inline_manual_12",
    "https://www.thehindu.com/business/Economy/feeder/default.rss",
    "https://www.thehindu.com/news/international/feeder/default.rss",
    "https://www.thehindu.com/business/Industry/feeder/default.rss",
]

def clean_html(raw_html):
    return re.sub(r'<[^>]+>', '', raw_html) if raw_html else ""

def cleanup_old_data():
    """Removes data older than 24 hours from both tables"""
    time_limit = (datetime.now() - timedelta(hours=24)).isoformat()
    supabase.table("osint_events").delete().lt("created_at", time_limit).execute()
    supabase.table("space_events").delete().lt("created_at", time_limit).execute()
    print("Cleanup: Deleted entries older than 24 hours.")

def scrape_space():
    print("Gathering Space Data...")
    count = 0
    for category, feed_url in SPACE_FEEDS.items():
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:8]:
            summary = clean_html(entry.get('description', entry.get('summary', '')))
            event = {
                "headline": entry.title,
                "summary": summary[:500],
                "url": entry.link,
                "tags": ["Space", category],
                "created_at": datetime.now().isoformat()
            }
            try:
                supabase.table("space_events").upsert(event, on_conflict="url").execute()
                count += 1
            except: pass
    print(f"Space update complete: {count} articles.")

def scrape_world():
    print("Starting Global Scrape...")
    count = 0
    
    for url in WORLD_FEEDS:
        feed = feedparser.parse(url)
        print(f"Checking feed: {url} - Found {len(feed.entries)} entries")
            
        for entry in feed.entries[:7]: # Limit per feed to avoid overloading
            title = entry.title
            # Attempt to grab a longer description if available, fallback to standard summary
            raw_summary = entry.get('description', '') 
            summary = clean_html(raw_summary)
            
            # Allow longer summaries (up to 500 chars) for 5-6 lines of context
            trimmed_summary = summary[:500] + '...' if len(summary) > 500 else summary
            
            # lat, lng = get_coords(title)
            tags = generate_tags(title + " " + summary)
            time.sleep(1.5) # Respect geocoding rate limits

            event = {
                "headline": title,
                "summary": trimmed_summary if trimmed_summary else "No extended summary available.",
                "url": entry.link,
                "tags": tags, # Replacing category and severity
                # "lat": lat,
                # "lng": lng,
                "created_at": datetime.now().isoformat()
            }
            try:
                supabase.table("osint_events").upsert(event, on_conflict="url").execute()
                count += 1
            except Exception as e:
                print(f"Supabase Error: {e}")

if __name__ == "__main__":
    cleanup_old_data() # Ensure the 24-hour limit is enforced
    scrape_space()
    scrape_world()

