# LiveGuard

A real-time global threat visualization dashboard fed by a self-hosted honeypot, geolocating and animating live intrusion attempts on an interactive world map via WebSockets.

## Honesty Statement
This is **not** a literal global DDoS telemetry feed. It is a live intrusion/scan attack map, sourced from a real honeypot controlled by this project. 

## Features
- **Live Mode**: Displays real events ingested from a self-hosted Cowrie honeypot.
- **Interactive World Map**: Uses D3.js to animate attack paths from the source IP to the honeypot in real-time.
- **Live Stats**: Real-time counters and historical data visualization.

## Architecture Highlights
The project consists of an isolated honeypot VPS running Cowrie, which ships logs to a FastAPI backend. The backend geolocates the attacker using MaxMind GeoLite2, stores the event, and broadcasts it over WebSockets to a React frontend.

## Technology Stack
- **Backend**: FastAPI (Python), PostgreSQL / SQLite, WebSockets
- **Frontend**: React, Vite, TypeScript, D3.js, Tailwind CSS
- **Honeypot**: Cowrie
- **GeoIP**: MaxMind GeoLite2
- **Deployment**: Docker Compose, Nginx