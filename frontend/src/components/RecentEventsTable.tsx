import { useEventStore } from '../store/useEventStore';
import { List } from 'lucide-react';

export const RecentEventsTable = () => {
  const { recentEvents } = useEventStore();

  if (recentEvents.length === 0) return null;

  return (
    <div className="w-full flex-shrink-0 bg-panel border border-border overflow-hidden flex flex-col h-[280px]">
      <div className="p-3 border-b border-border bg-panel-2">
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] flex items-center gap-2">
          <List size={14} className="text-cyan" />
          Raw Event Log
        </h2>
      </div>
      
      <div className="overflow-y-auto overflow-x-hidden p-0 custom-scrollbar flex-1">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-panel-2 border-b border-border z-10">
            <tr className="text-[9px] text-muted uppercase tracking-[0.2em] font-sans font-bold">
              <th className="px-3 py-1.5 font-normal">Time</th>
              <th className="px-3 py-1.5 font-normal">Source</th>
              <th className="px-3 py-1.5 font-normal">Target</th>
              <th className="px-3 py-1.5 font-normal">Vector</th>
            </tr>
          </thead>
          <tbody className="font-mono text-[10px] text-text">
            {recentEvents.map((event) => {
              const date = new Date(event.timestamp);
              const time = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}.${date.getMilliseconds().toString().padStart(3, '0')}`;
              
              const isRed = event.event_type === "DDoS";
              const isAmber = event.event_type === "Intruders";
              const typeColor = isRed ? "text-red border-red" : isAmber ? "text-amber border-amber" : "text-cyan border-cyan";
              return (
                <tr key={event.id} className="border-b border-border/50 hover:bg-border/30 transition-colors">
                  <td className="px-3 py-1.5 text-muted whitespace-nowrap">{time}</td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className="text-muted mr-2">{event.src_country}</span>
                    {event.src_ip}
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <span className="text-muted mr-1">{event.protocol.toUpperCase()}</span>
                    <span className="text-text">{event.dst_port}</span>
                  </td>
                  <td className="px-3 py-1.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <span className={`px-1 py-0.5 border ${typeColor} text-[8px] uppercase tracking-wider`}>
                        {event.event_type}
                      </span>
                      <span className="text-muted truncate max-w-[120px]">{event.payload_snippet || "Unknown"}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
