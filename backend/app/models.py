import uuid
from datetime import datetime
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Uuid
from sqlalchemy.types import TypeDecorator
from sqlalchemy.dialects.postgresql import INET
from app.db import Base

class CompatibleINET(TypeDecorator):
    """
    Use PostgreSQL INET type when connected to PostgreSQL.
    Fallback to generic String type for SQLite or other dialects.
    """
    impl = String
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(INET())
        else:
            return dialect.type_descriptor(String(45))  # IPv6 max length

class Event(Base):
    __tablename__ = "events"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    timestamp = Column(DateTime(timezone=True), default=datetime.utcnow, index=True)
    src_ip = Column(CompatibleINET, index=True)
    src_lat = Column(Float)
    src_lon = Column(Float)
    src_country = Column(String)
    dst_port = Column(Integer)
    protocol = Column(String)
    event_type = Column(String)
    payload_snippet = Column(Text, nullable=True)
    source_mode = Column(String)
