import asyncio
import random
import uuid
from datetime import datetime
from app.db import SessionLocal
from app.models import Event
from app.schemas import EventResponse
from app.ws import manager

# A mock list of IPs and their corresponding geo locations to simulate attacks
MOCK_LOCATIONS = [
    {"ip": "114.114.114.114", "lat": 32.06, "lon": 118.79, "country": "CN"},
    {"ip": "8.8.8.8", "lat": 37.38, "lon": -122.08, "country": "US"},
    {"ip": "9.9.9.9", "lat": 48.85, "lon": 2.35, "country": "FR"},
    {"ip": "193.0.14.129", "lat": 52.37, "lon": 4.89, "country": "NL"},
    {"ip": "77.88.8.8", "lat": 55.75, "lon": 37.61, "country": "RU"},
    {"ip": "189.4.32.1", "lat": -23.55, "lon": -46.63, "country": "BR"},
    {"ip": "202.21.12.3", "lat": 35.68, "lon": 139.76, "country": "JP"},
]

PORTS = [22, 23, 80, 443, 3389, 5900]
PROTOCOLS = ["ssh", "telnet", "http", "https", "rdp", "vnc"]
EVENT_TYPES = ["Web Attackers", "DDoS", "Intruders", "Scanners", "Anonymizers"]
VECTORS = ["TCP Flood", "Low & Slow", "ICMP Flood", "UDP Flood", "DNS Amplification", "Credential Stuffing"]

async def run_demo_mode():
    """
    Background task that generates synthetic attacks and saves them to the DB.
    """
    print("Demo Mode Generator Started.")
    while True:
        # Sleep for a random interval between 0.5 and 3 seconds
        await asyncio.sleep(random.uniform(0.5, 3.0))

        db = SessionLocal()
        try:
            loc = random.choice(MOCK_LOCATIONS)
            port = random.choice(PORTS)
            protocol = PROTOCOLS[PORTS.index(port)]
            
            event = Event(
                timestamp=datetime.utcnow(),
                src_ip=loc["ip"],
                src_lat=loc["lat"],
                src_lon=loc["lon"],
                src_country=loc["country"],
                dst_port=port,
                protocol=protocol,
                event_type=random.choice(EVENT_TYPES),
                payload_snippet=random.choice(VECTORS),
                source_mode="demo"
            )
            db.add(event)
            db.commit()
            db.refresh(event)
            
            # WebSocket Broadcast
            if hasattr(EventResponse, 'model_validate'):
                event_resp = EventResponse.model_validate(event)
            else:
                event_resp = EventResponse.from_orm(event)
            await manager.push_event(event_resp)
            
            print(f"[Demo] Generated attack from {loc['country']} on port {port}")
        except Exception as e:
            print(f"Error in demo mode generator: {e}")
            db.rollback()
        finally:
            db.close()
