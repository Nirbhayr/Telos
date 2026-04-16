# backend/adsb_tracker.py
import requests
from supabase import create_client
import os

# Initialize Supabase
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase = create_client(url, key)

OPENSKY_URL = "https://opensky-network.org/api/states/all"

# Bounding box for Med to Iran
PARAMS = {
    "lamin": 20.0,
    "lamax": 45.0,
    "lomin": 5.0,
    "lomax": 65.0
}

def poll_airspace():
    try:
        response = requests.get(OPENSKY_URL, params=PARAMS, timeout=15)
        if response.status_code != 200:
            print(f"OpenSky Error: {response.status_code}")
            return
            
        data = response.json()
        states = data.get("states", [])
        
        tracked_assets = []
        
        for state in states:
            # OpenSky state vector mapping:
            # [0] icao24, [1] callsign, [2] origin_country, [5] longitude, [6] latitude, [7] baro_altitude
            callsign = state[1].strip() if state[1] else "UNKNOWN"
            icao = state[0]
            
            # Simple heuristic for identifying potential military/state assets via callsigns
            # You can expand this list or load it from a database
            is_suspicious = any(prefix in callsign for prefix in ["RCH", "CNV", "RRR", "YANKY", "LION"])
            
            # Record state
            asset = {
                "icao": icao,
                "callsign": callsign,
                "lat": state[6],
                "lon": state[5],
                "altitude": state[7],
                "origin": state[2],
                "is_priority": is_suspicious
            }
            
            if state[5] and state[6]: # Ensure we have valid coords
                tracked_assets.append(asset)
                
        # Push to a new Supabase table: 'airspace_telemetry'
        # To avoid bloat, we use upsert with a 5-minute TTL or just overwrite the current position
        for asset in tracked_assets:
            supabase.table("airspace_telemetry").upsert(asset, on_conflict="icao").execute()
            
        print(f"Tracked {len(tracked_assets)} active transponders in AOI.")
            
    except Exception as e:
        print(f"Telemetry scrape failed: {e}")

if __name__ == "__main__":
    poll_airspace()
