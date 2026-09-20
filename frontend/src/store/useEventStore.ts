import { create } from 'zustand';

export interface LiveEvent {
  id: string;
  timestamp: string;
  src_ip: string;
  src_lat: number;
  src_lon: number;
  src_country: string;
  dst_port: number;
  protocol: string;
  event_type: string;
  payload_snippet?: string;
  source_mode: string;
}

interface EventStore {
  activeEvents: LiveEvent[];
  recentEvents: LiveEvent[];
  stats: {
    totalEvents: number;
    countries: Record<string, number>;
    ports: Record<number, number>;
  };
  addEvents: (events: LiveEvent[]) => void;
  removeEvent: (id: string) => void;
  connectWebSocket: () => void;
}

export const useEventStore = create<EventStore>((set, get) => ({
  activeEvents: [],
  recentEvents: [],
  stats: {
    totalEvents: 0,
    countries: {},
    ports: {},
  },

  addEvents: (events) => {
    set((state) => {
      const newCountries = { ...state.stats.countries };
      const newPorts = { ...state.stats.ports };
      
      events.forEach((event) => {
        newCountries[event.src_country] = (newCountries[event.src_country] || 0) + 1;
        newPorts[event.dst_port] = (newPorts[event.dst_port] || 0) + 1;
      });

      // Keep only the latest 50 events in the recent events table
      const combinedRecent = [...events, ...state.recentEvents].slice(0, 50);

      return {
        activeEvents: [...state.activeEvents, ...events],
        recentEvents: combinedRecent,
        stats: {
          totalEvents: state.stats.totalEvents + events.length,
          countries: newCountries,
          ports: newPorts,
        },
      };
    });
  },

  removeEvent: (id) => {
    set((state) => ({
      activeEvents: state.activeEvents.filter((event) => event.id !== id),
    }));
  },

  connectWebSocket: () => {
    // In production, this might be wss:// and use the current window.location.host
    const ws = new WebSocket('ws://localhost:8000/ws/live');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };

    ws.onmessage = (messageEvent) => {
      try {
        const events: LiveEvent[] = JSON.parse(messageEvent.data);
        if (Array.isArray(events) && events.length > 0) {
          get().addEvents(events);
        }
      } catch (error) {
        console.error('Failed to parse websocket message', error);
      }
    };

    ws.onclose = () => {
      console.log('WebSocket disconnected. Reconnecting in 3s...');
      setTimeout(() => get().connectWebSocket(), 3000);
    };
  },
}));
