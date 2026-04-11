import os
import feedparser
from supabase import create_client

# 1. Setup Connection (These will be set in GitHub Secrets)
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Use Service Role Key for Write Access
supabase = create_client(url, key)

def scrape_rss():
    # Example: BBC World News RSS
    feed = feedparser.parse("http://feeds.bbci.co.uk/news/world/rss.xml")
    
    for entry in feed.entries:
        # Simple logic to determine severity based on keywords
        severity = "Low"
        keywords = ["urgent", "breaking", "attack", "explosion", "conflict"]
        if any(word in entry.title.lower() for word in keywords):
            severity = "High"
        
        # Data structure for your 'osint_events' table
        new_event = {
            "headline": entry.title,
            "summary": entry.description,
            "url": entry.link,
            "category": "Geopolitics",
            "severity": severity,
            "lat": 20.0, # Note: We will add Geocoding in the next sub-step
            "lng": 0.0,
            "created_at": "now()" 
        }
        
        # Push to Supabase (Upsert prevents duplicates if you have a unique URL constraint)
        supabase.table("osint_events").upsert(new_event, on_conflict="url").execute()

if __name__ == "__main__":
    scrape_rss()
