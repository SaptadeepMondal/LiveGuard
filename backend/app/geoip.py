import os
import functools
import geoip2.database
from geoip2.errors import AddressNotFoundError
from app.config import settings

# Global reader instance
_reader = None

def get_reader():
    global _reader
    if _reader is None:
        db_path = settings.GEOIP_DB_PATH
        if os.path.exists(db_path):
            _reader = geoip2.database.Reader(db_path)
        else:
            print(f"WARNING: GeoIP database not found at {db_path}. Location lookups will fail gracefully.")
    return _reader

@functools.lru_cache(maxsize=4096)
def get_location(ip: str):
    """
    Resolve IP to latitude, longitude, and country code.
    Results are cached in-memory to prevent disk I/O bottlenecks during scan bursts.
    """
    reader = get_reader()
    if not reader:
        return {"lat": 0.0, "lon": 0.0, "country": "Unknown"}

    try:
        response = reader.city(ip)
        return {
            "lat": response.location.latitude or 0.0,
            "lon": response.location.longitude or 0.0,
            "country": response.country.iso_code or "Unknown"
        }
    except AddressNotFoundError:
        return {"lat": 0.0, "lon": 0.0, "country": "Unknown"}
    except Exception as e:
        print(f"GeoIP Lookup Error for {ip}: {e}")
        return {"lat": 0.0, "lon": 0.0, "country": "Unknown"}
