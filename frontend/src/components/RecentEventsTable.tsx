import { useEventStore } from '../store/useEventStore';
import { List } from 'lucide-react';

export const RecentEventsTable = () => {
  const { recentEvents } = useEventStore();

  if (recentEvents.length === 0) return null;

  return (
    <div className="absolute bottom-6 left-6 w-[600px] pointer-events-auto z-20">
      <div className="backdrop-blur-md bg-surface/80 border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[300px]">
        <div className="p-4 border-b border-white/5 bg-surface/90">
          <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2">
            <List size={16} className="text-primary" />
            Recent Intrusions
          </h2>
        </div>
        
        <div className="overflow-y-auto overflow-x-hidden p-2 custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-xs text-white/40 uppercase tracking-wider font-mono">
                <th className="px-4 py-2 font-medium">Time</th>
                <th className="px-4 py-2 font-medium">Source IP</th>
                <th className="px-4 py-2 font-medium">Country</th>
                <th className="px-4 py-2 font-medium">Port</th>
                <th className="px-4 py-2 font-medium">Protocol</th>
              </tr>
            </thead>
            <tbody className="font-mono text-xs text-white/80">
              {recentEvents.map((event) => {
                const time = new Date(event.timestamp).toLocaleTimeString([], { hour12: false });
                return (
                  <tr key={event.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white/50">{time}</td>
                    <td className="px-4 py-3">{event.src_ip}</td>
                    <td className="px-4 py-3">
                      <span className="bg-white/10 px-2 py-1 rounded text-[10px]">{event.src_country}</span>
                    </td>
                    <td className="px-4 py-3 text-danger">{event.dst_port}</td>
                    <td className="px-4 py-3 text-primary uppercase">{event.protocol}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
