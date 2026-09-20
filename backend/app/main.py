import asyncio
from datetime import datetime
from fastapi import FastAPI, Depends, Header, HTTPException, status, WebSocket, WebSocketDisconnect, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List

from app.config import settings
from app.db import Base, engine, get_db
from app.models import Event
from app.schemas import EventResponse, CowrieLogEvent
from app.demo_mode import run_demo_mode
from app import geoip
from app.ws import manager

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LiveGuard Backend")

def verify_ingest_secret(x_ingest_secret: str = Header(...)):
    if x_ingest_secret != settings.INGEST_SHARED_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid ingest secret"
        )
    return x_ingest_secret

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(manager._broadcast_task())
    if settings.MODE == "demo":
        # Launch demo mode generator as a background task
        asyncio.create_task(run_demo_mode())

@app.get("/")
def read_root():
    return {"status": "ok", "mode": settings.MODE}

@app.post("/internal/ingest", response_model=EventResponse, status_code=status.HTTP_201_CREATED)
def ingest_event(
    payload: CowrieLogEvent, 
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db), 
    secret: str = Depends(verify_ingest_secret)
):
    # GeoIP lookup
    location = geoip.get_location(payload.src_ip)
    
    # Map to DB model
    db_event = Event(
        timestamp=payload.timestamp or datetime.utcnow(),
        src_ip=payload.src_ip,
        src_lat=location["lat"],
        src_lon=location["lon"],
        src_country=location["country"],
        dst_port=payload.dst_port or 22,
        protocol="ssh" if (payload.dst_port == 22 or payload.dst_port == 2222) else "unknown",
        event_type=payload.eventid,
        payload_snippet=payload.message,
        source_mode="live"
    )
    
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    
    # WebSocket Broadcast
    if hasattr(EventResponse, 'model_validate'):
        event_resp = EventResponse.model_validate(db_event)
    else:
        event_resp = EventResponse.from_orm(db_event)
    background_tasks.add_task(manager.push_event, event_resp)
    
    return db_event

@app.get("/api/events/recent", response_model=List[EventResponse])
def get_recent_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
    return events

@app.websocket("/ws/live")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
