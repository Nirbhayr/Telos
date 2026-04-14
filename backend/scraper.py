import os
import feedparser
import re
import time
from datetime import datetime
from supabase import create_client

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

FEEDS = [
    "https://www.theguardian.com/world/rss",
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
    "",
    
]

OSINT_KEYWORDS = ["war", "military", "border", "missile", "security", "china", "russia", "israel", "ukraine", "protest", "government", "crisis"]

def clean_html(raw_html):
    return re.sub(r'<[^>]+>', '', raw_html)

def scrape():
    print("Starting mapless OSINT scrape...")
    count = 0
    
    for feed_url in FEEDS:
        try:
            feed = feedparser.parse(feed_url)
            print(f"Checking feed: {feed_url} - Found {len(feed.entries)} entries")
                
            for entry in feed.entries:
                title = entry.title
                summary = clean_html(entry.get('description', ''))
                combined = (title + " " + summary).lower()
                    
                if any(word in combined for word in OSINT_KEYWORDS):
                    event = {
                        "headline": title,
                        "summary": summary[:300], # Increased slightly for better reading
                        "url": entry.link,
                        "severity": "High" if "war" in combined or "missile" in combined else "Medium",
                        "category": "Geopolitics",
                        "created_at": datetime.now().isoformat()
                    }
                    
                    try:
                        # Upsert prevents duplicate news articles based on the URL
                        supabase.table("osint_events").upsert(event, on_conflict="url").execute()
                        count += 1
                    except Exception as e:
                        print(f"Database insertion failed: {e}")
                        
        except Exception as e:
            print(f"Failed to parse feed {feed_url}: {e}")

    print(f"Scrape complete. {count} new/updated events processed.")

if __name__ == "__main__":
    scrape()
