import uuid
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class CowrieLogEvent(BaseModel):
    eventid: str
    src_ip: str
    dst_port: Optional[int] = 0
    system: Optional[str] = "unknown"
    message: Optional[str] = ""
    timestamp: Optional[datetime] = None

class EventBase(BaseModel):
    src_ip: str
    src_lat: float
    src_lon: float
    src_country: str
    dst_port: int
    protocol: str
    event_type: str
    payload_snippet: Optional[str] = None
    source_mode: str

class EventCreate(EventBase):
    timestamp: Optional[datetime] = None

class EventResponse(EventBase):
    id: uuid.UUID
    timestamp: datetime

    class Config:
        from_attributes = True
