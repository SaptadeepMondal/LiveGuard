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

interface Bucket {
  key: string;
  count: number;
}

export const ALL_ATTACK_TYPES = ["Web Attackers", "DDoS", "Intruders", "Scanners", "Anonymizers"];

interface EventStore {
  running: boolean;
  muted: boolean;
  windowMin: number;
  activeTypes: Set<string>;
  activeEvents: LiveEvent[];
  recentEvents: LiveEvent[];
  stats: {
    totalEvents: number;
    rate: number; // events/sec
    countries: Record<string, number>;
    ports: Record<number, number>;
    vectors: Record<string, number>;
    buckets: Bucket[];
  };
  setRunning: (running: boolean) => void;
  setMuted: (muted: boolean) => void;
  setWindowMin: (mins: number) => void;
  toggleType: (type: string) => void;
  addEvents: (events: LiveEvent[]) => void;
  removeEvent: (id: string) => void;
  connectWebSocket: () => void;
}

// Helper to get bucket key (HH:MM)
const getBucketKey = (date: Date) => {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

export const useEventStore = create<EventStore>((set, get) => ({
  running: true,
  muted: true,
  windowMin: 30,
  activeTypes: new Set(ALL_ATTACK_TYPES),
  activeEvents: [],
  recentEvents: [],
  stats: {
    totalEvents: 0,
    rate: 0,
    countries: {},
    ports: {},
    vectors: {},
    buckets: [],
  },

  setRunning: (running) => set({ running }),
  setMuted: (muted) => set({ muted }),
  setWindowMin: (windowMin) => set({ windowMin }),
  toggleType: (type) => set((state) => {
    const newTypes = new Set(state.activeTypes);
    if (newTypes.has(type)) {
      newTypes.delete(type);
    } else {
      newTypes.add(type);
    }
    return { activeTypes: newTypes };
  }),

  addEvents: (events) => {
    set((state) => {
      if (!state.running) return state;

      // Filter events by activeTypes
      const validEvents = events.filter(e => state.activeTypes.has(e.event_type));
      if (validEvents.length === 0) return state;

      const newCountries = { ...state.stats.countries };
      const newPorts = { ...state.stats.ports };
      const newVectors = { ...state.stats.vectors };
      
      const newBuckets = [...state.stats.buckets];
      const now = new Date();
      
      validEvents.forEach((event) => {
        newCountries[event.src_country] = (newCountries[event.src_country] || 0) + 1;
        newPorts[event.dst_port] = (newPorts[event.dst_port] || 0) + 1;
        
        const vector = event.payload_snippet || "Unknown";
        newVectors[vector] = (newVectors[vector] || 0) + 1;

        // Bucket processing
        const eventDate = new Date(event.timestamp);
        const bucketKey = getBucketKey(eventDate);
        const lastBucket = newBuckets[newBuckets.length - 1];
        if (lastBucket && lastBucket.key === bucketKey) {
          lastBucket.count += 1;
        } else {
          newBuckets.push({ key: bucketKey, count: 1 });
        }
      });

      // Maintain only buckets within the windowMin window
      const cutoff = new Date(now.getTime() - state.windowMin * 60000);
      const cutoffKey = getBucketKey(cutoff);
      const filteredBuckets = newBuckets.filter(b => b.key >= cutoffKey);

      // Rough rate calculation: validEvents / length of time? Actually simpler: just calculate events/sec over last 2s.
      // We will do this via a separate interval in a component, but for now just use a basic rolling rate.
      // We'll leave rate calculation for a useEffect in the component to avoid excessive store updates.

      const combinedRecent = [...validEvents, ...state.recentEvents].slice(0, 60); // Keep 60

      return {
        activeEvents: [...state.activeEvents, ...validEvents],
        recentEvents: combinedRecent,
        stats: {
          ...state.stats,
          totalEvents: state.stats.totalEvents + validEvents.length,
          countries: newCountries,
          ports: newPorts,
          vectors: newVectors,
          buckets: filteredBuckets,
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
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/live');
    
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
