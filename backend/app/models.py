import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime
from app.db import Base

class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    src_ip = Column(String, index=True)
    src_lat = Column(Float)
    src_lon = Column(Float)
    src_country = Column(String)
    dst_port = Column(Integer)
    protocol = Column(String)
    event_type = Column(String)
    payload_snippet = Column(String, nullable=True)
    source_mode = Column(String)
