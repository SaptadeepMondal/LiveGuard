import asyncio
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from typing import List

from app.config import settings
from app.db import Base, engine, get_db
from app.models import Event
from app.schemas import EventResponse
from app.demo_mode import run_demo_mode

# Create SQLite tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="LiveGuard Backend")

@app.on_event("startup")
async def startup_event():
    if settings.MODE == "demo":
        # Launch demo mode generator as a background task
        asyncio.create_task(run_demo_mode())

@app.get("/")
def read_root():
    return {"status": "ok", "mode": settings.MODE}

@app.get("/api/events/recent", response_model=List[EventResponse])
def get_recent_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(Event).order_by(Event.timestamp.desc()).limit(limit).all()
    return events
