import os
import requests
from supabase import create_client
from datetime import datetime, timedelta

# AOI: Mediterranean to Iran (Hormuz focus)
BOUNDS = (20.0, 45.0, 5.0, 65.0)
PRIORITY_PREFIXES = ["RCH", "CNV", "RRR", "IAM", "GAF", "ASCOT", "YANKY", "LION", "FORTE"]

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

def poll_airspace():
    # Use Auth if available in secrets, otherwise anonymous (more limited)
    user = os.environ.get("CLIENTID")
    pwd = os.environ.get("CLIENTSECRET")
    auth = (user, pwd) if user and pwd else None

    api_url = f"https://opensky-network.org/api/states/all?lamin={BOUNDS[0]}&lamax={BOUNDS[1]}&lomin={BOUNDS[2]}&lomax={BOUNDS[3]}"
    
    try:
        r = requests.get(api_url, auth=auth, timeout=20)
        if r.status_code != 200: return
        
        states = r.json().get("states", [])
        if not states: return

        for s in states:
            # Mapping: 0:icao, 1:callsign, 2:origin, 5:lon, 6:lat, 7:alt, 9:vel, 10:head
            if not s[6] or not s[5]: continue
            
            icao = s[0]
            callsign = s[1].strip() if s[1] else "UNK"
            is_priority = any(p in callsign for p in PRIORITY_PREFIXES)

            # 1. Update Current
            supabase.table("airspace_current").upsert({
                "icao": icao, "callsign": callsign, "origin_country": s[2],
                "lat": s[6], "lon": s[5], "alt": s[7], "velocity": s[9],
                "heading": s[10], "is_priority": is_priority,
                "last_updated": datetime.utcnow().isoformat()
            }).execute()

            # 2. Log Track (Sampling handled by Cron frequency)
            supabase.table("airspace_tracks").insert({
                "icao": icao, "lat": s[6], "lon": s[5]
            }).execute()

        # 3. Purge data > 4 hours old
        cutoff = (datetime.utcnow() - timedelta(hours=4)).isoformat()
        supabase.table("airspace_tracks").delete().lt("timestamp", cutoff).execute()
        
    except Exception as e:
        print(f"ADS-B Sync Error: {e}")

if __name__ == "__main__":
    poll_airspace()
