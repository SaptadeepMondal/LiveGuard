import asyncio
import json
from typing import List
from fastapi import WebSocket

from app.schemas import EventResponse

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.event_buffer: List[EventResponse] = []
        self.lock = asyncio.Lock()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def push_event(self, event: EventResponse):
        async with self.lock:
            self.event_buffer.append(event)

    async def _broadcast_task(self):
        """
        Background task that wakes up every 200ms, drains the event buffer,
        and broadcasts it as a JSON array to all connected clients.
        """
        while True:
            await asyncio.sleep(0.2) # 200ms batching interval
            
            async with self.lock:
                if not self.event_buffer:
                    continue
                
                # Copy the buffer and clear it
                batch = self.event_buffer.copy()
                self.event_buffer.clear()
            
            if not self.active_connections:
                continue

            # Serialize the batch using Pydantic's model_dump/json
            # Use model_dump_json if on Pydantic v2 or dict() on v1
            try:
                # We can dump each model to a dict, then json.dumps the list
                batch_data = [e.model_dump() if hasattr(e, 'model_dump') else e.dict() for e in batch]
                
                # Convert UUIDs and Datetimes for JSON
                batch_json = json.dumps(batch_data, default=str)
                
                # Iterate over a copy in case it changes during iteration
                for connection in list(self.active_connections):
                    try:
                        await connection.send_text(batch_json)
                    except Exception as e:
                        print(f"Error sending to websocket: {e}")
                        self.disconnect(connection)
            except Exception as e:
                print(f"Error preparing batch: {e}")

manager = ConnectionManager()
