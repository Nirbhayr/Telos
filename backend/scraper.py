import os
import feedparser
import requests
import re
from datetime import datetime, timedelta
from supabase import create_client
import socket


# Set a 15-second timeout for all network connections
socket.setdefaulttimeout(15)

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

SPACE_FEEDS = {
    "Research": "https://arxiv.org/rss/astro-ph",
    "NASA": "https://www.nasa.gov/news-release/feed/",
    "ESA": "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    "General": "https://spacenews.com/feed/",

    "ArXiv_Astro": "https://rss.arxiv.org/rss/astro-ph",
    "PhysOrg_Space": "https://phys.org/rss-feed/space-news/",
    "Universe_Today": "https://www.universetoday.com/rss.xml",

    # AEROSPACE ARCHITECTURE & PLATFORMS
    "Defense_News_Air": "https://www.defensenews.com/arc/outboundfeeds/rss/category/air/?size=20",
    "Janes_Aerospace": "https://www.janes.com/feeds/news", # High-verifiability defense
    "FlightGlobal": "https://www.flightglobal.com/71.rss", # Aerospace engineering focus
}

WORLD_FEEDS = [
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.foreignaffairs.com/rss.xml",
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    "https://globalissues.org/news/feed",
    "https://www.e-ir.info/feed",
    "https://www.nytimes.com/svc/collections/v1/publish/http://www.nytimes.com/topic/subject/international-relations/rss.xml",
    "https://www.theverge.com/rss/index.xml",
    "https://www.washingtonpost.com/arcio/rss/category/politics/?itid=lk_inline_manual_2",
    "https://feeds.washingtonpost.com/rss/world?itid=lk_inline_manual_14",
    "https://feeds.washingtonpost.com/rss/business/technology?itid=lk_inline_manual_12",
    "https://www.thehindu.com/business/Economy/feeder/default.rss",
    "https://www.thehindu.com/news/international/feeder/default.rss",
    "https://www.thehindu.com/business/Industry/feeder/default.rss"
]

def clean_html(raw_html):
    if not raw_html: return ""
    return re.sub(r'<[^>]+>', '', raw_html)

def generate_tags(text):
    """Generates dynamic tags for world news based on context"""
    text_lower = text.lower()
    tags = []
    
    if any(w in text_lower for w in ["war", "military", "missile", "troops", "defense", "strike"]): tags.append("Conflict")
    if any(w in text_lower for w in ["pandemic", "virus", "health", "disease", "vaccine", "study"]): tags.append("Health/Science")
    if any(w in text_lower for w in ["economy", "inflation", "trade", "market", "bank", "business"]): tags.append("Economy")
    if any(w in text_lower for w in ["election", "parliament", "president", "minister", "court", "politics"]): tags.append("Politics")
    if any(w in text_lower for w in ["climate", "earthquake", "typhoon", "storm", "flood", "weather"]): tags.append("Environment")
    if any(w in text_lower for w in ["tech", "ai", "software", "cyber", "hack", "space"]): tags.append("Technology")
    
    if not tags: tags.append("Global")
    return tags

def cleanup_old_data():
    """Removes data older than 24 hours using explicit UTC time"""
    time_limit = (datetime.utcnow() - timedelta(hours=24)).isoformat()
    try:
        supabase.table("osint_events").delete().lt("created_at", time_limit).execute()
        supabase.table("space_events").delete().lt("created_at", time_limit).execute()
        print("Cleanup: Stale data purged.")
    except Exception as e:
        print(f"Cleanup Error: {e}")

def scrape_space_weather():
    """Handles the raw text file from NOAA"""
    print("Fetching Space Weather Discussion...")
    try:
        res = requests.get("https://services.swpc.noaa.gov/text/discussion.txt", timeout=10)
        if res.status_code == 200:
            content = res.text[:500] # Grab the start of the discussion
            event = {
                "headline": "NOAA Space Weather Prediction Discussion",
                "summary": content.replace('\n', ' '),
                "url": "https://www.swpc.noaa.gov/",
                "tags": ["Space", "Weather"],
                "created_at": datetime.utcnow().isoformat()
            }
            supabase.table("space_events").upsert(event, on_conflict="url").execute()
    except Exception as e:
        print(f"Space Weather Error: {e}")

def scrape_launches():
    """Fetches upcoming launches and stores them in Supabase"""
    print("Fetching upcoming orbital launches...")
    try:
        res = requests.get('https://ll.thespacedevs.com/2.2.0/launch/upcoming/?limit=5', timeout=15)
        if res.status_code == 200:
            data = res.json()
            # Clear and update
            supabase.table("space_launches").delete().neq("id", "0").execute()
            launches = [{"id": r["id"], "name": r["name"], "net": r["net"]} for r in data.get('results', [])]
            if launches:
                supabase.table("space_launches").insert(launches).execute()
                print(f"Updated space_launches: {len(launches)} entries.")
    except Exception as e:
        print(f"Launch Fetch Error: {e}")


def scrape_feeds(feed_source, table_name, is_space=False):
    print(f"Scraping {table_name}...")
    count = 0
    items = feed_source.items() if isinstance(feed_source, dict) else [("Global", u) for u in feed_source]
    
    for category, feed_url in items:
        try:
            # The socket timeout now protects this call
            feed = feedparser.parse(feed_url)
            
            # Check if the feed actually returned anything or timed out
            if not feed.entries:
                print(f"Skipping empty or unreachable feed: {feed_url}")
                continue

            for entry in feed.entries[:10]:
                summary = clean_html(entry.get('description', entry.get('summary', '')))
                event = {
                    "headline": entry.title,
                    "summary": summary[:500],
                    "url": entry.link,
                    "created_at": datetime.utcnow().isoformat()
                }
                try:
                    supabase.table(table_name).upsert(event, on_conflict="url").execute()
                    count += 1
                except Exception as e:
                    print(f"Database insertion error: {e}")

        except Exception as e:
            # This captures network timeouts and prevents the script from hanging
            print(f"CRITICAL FEED ERROR: {feed_url} timed out or failed. Skipping...")
            continue
            
    print(f"Updated {table_name}: {count} articles.")


if __name__ == "__main__":
    cleanup_old_data()
    scrape_launches() # Run this first
    scrape_space_weather()
    scrape_feeds(SPACE_FEEDS, "space_events", is_space=True)
    scrape_feeds(WORLD_FEEDS, "osint_events", is_space=False)
