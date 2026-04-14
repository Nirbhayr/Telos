import os
import feedparser
import requests
import re
import time
from datetime import datetime, timedelta
from supabase import create_client

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

SPACE_FEEDS = {
    "Research": "https://arxiv.org/rss/astro-ph",
    "NASA": "https://www.nasa.gov/news-release/feed/",
    "ESA": "https://www.esa.int/rssfeed/Our_Activities/Space_News",
    "General": "https://spacenews.com/feed/"
}

WORLD_FEEDS = [
    "http://feeds.bbci.co.uk/news/world/rss.xml",
    "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    "https://www.foreignaffairs.com/rss.xml",
    "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    "https://www.foreignaffairs.com/rss.xml",
    "https://globalissues.org/news/feed",
    "https://www.e-ir.info/feed",
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
    if not raw_html: return ""
    return re.sub(r'<[^>]+>', '', raw_html)

def cleanup_old_data():
    """Removes data older than 24 hours"""
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
        res = requests.get("https://services.swpc.noaa.gov/text/discussion.txt")
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

def scrape_feeds(feed_dict, table_name, is_space=False):
    print(f"Scraping {table_name}...")
    count = 0
    
    # If it's a list (World), convert to generic dict for the loop
    items = feed_dict.items() if isinstance(feed_dict, dict) else [("Global", u) for u in feed_dict]
    
    for category, feed_url in items:
        feed = feedparser.parse(feed_url)
        for entry in feed.entries[:10]:
            summary = clean_html(entry.get('description', entry.get('summary', '')))
            
            event = {
                "headline": entry.title,
                "summary": summary[:500],
                "url": entry.link,
                "created_at": datetime.utcnow().isoformat()
            }
            
            if is_space:
                event["tags"] = ["Space", category]
            else:
                event["tags"] = ["World", "Intel"]

            try:
                supabase.table(table_name).upsert(event, on_conflict="url").execute()
                count += 1
            except Exception as e:
                print(f"Supabase Error in {table_name}: {e}")
                
    print(f"Updated {table_name}: {count} articles.")

if __name__ == "__main__":
    # cleanup_old_data()
    scrape_space_weather()
    scrape_feeds(SPACE_FEEDS, "space_events", is_space=True)
    # scrape_feeds(WORLD_FEEDS, "osint_events", is_space=False)
