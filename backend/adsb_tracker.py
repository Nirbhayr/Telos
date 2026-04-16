import os
import requests
from supabase import create_client
from datetime import datetime, timedelta

# AOI: Mediterranean to Iran
# lamin, lamax, lomin, lomax
BOUNDS = (20.0, 45.0, 5.0, 65.0)

# Known military/state callsign prefixes
PRIORITY_PREFIXES = ["RCH", "CNV", "RRR", "IAM", "GAF", "ASCOT", "YANKY", "LION", "FORTE"]

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def poll_airspace():
    print(f"Polling AOI {BOUNDS}...")
    api_url = f"https://opensky-network.org/api/states/all?lamin={BOUNDS[0]}&lamax={BOUNDS[1]}&lomin={BOUNDS[2]}&lomax={BOUNDS[3]}"
    
    try:
        r = requests.get(api_url, timeout=20)
        if r.status_code != 200: return
        
        states = r.json().get("states", [])
        if not states: return

        for s in states:
            icao = s[0]
            callsign = s[1].strip() if s[1] else "UNK"
            origin = s[2]
            lon, lat = s[5], s[6]
            alt = s[7]
            velocity = s[9]
            heading = s[10]
            
            if not lat or not lon: continue

            is_priority = any(p in callsign for p in PRIORITY_PREFIXES)

            # 1. Update Current Position
            asset = {
                "icao": icao, "callsign": callsign, "origin_country": origin,
                "lat": lat, "lon": lon, "alt": alt, "velocity": velocity,
                "heading": heading, "is_priority": is_priority,
                "last_updated": datetime.utcnow().isoformat()
            }
            supabase.table("airspace_current").upsert(asset).execute()

            # 2. Add to Track History (The '2-minute' filter is handled by the cron interval)
            supabase.table("airspace_tracks").insert({
                "icao": icao, "lat": lat, "lon": lon
            }).execute()

        # 3. Cleanup: Delete tracks older than 4 hours
        cutoff = (datetime.utcnow() - timedelta(hours=4)).isoformat()
        supabase.table("airspace_tracks").delete().lt("timestamp", cutoff).execute()
        
        print(f"Synchronized {len(states)} assets.")
    except Exception as e:
        print(f"ADS-B Sync Error: {e}")

if __name__ == "__main__":
    poll_airspace()
