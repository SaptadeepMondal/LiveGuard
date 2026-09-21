import { useEventStore } from '../store/useEventStore';
import { Network, Crosshair } from 'lucide-react';

export const StatsCharts = () => {
  const { stats } = useEventStore();

  const topPorts = Object.entries(stats.ports)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const totalVectors = Object.values(stats.vectors).reduce((sum, v) => sum + v, 0);
  const topVectors = Object.entries(stats.vectors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  return (
    <>
      <div className="bg-panel border border-border p-4 flex-shrink-0">
        <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
          <Network size={14} className="text-cyan" />
          Top Scanned Ports
        </h2>
        <div className="flex flex-col gap-2">
          {topPorts.map(([port, count], i) => {
            const max = topPorts[0][1];
            const width = Math.max((count / max) * 100, 2);
            const isTop = i === 0;
            return (
              <div key={port} className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] font-mono">
                  <span className="text-muted">PORT {port}</span>
                  <span className="text-text">{count.toLocaleString()}</span>
                </div>
                <div className="w-full bg-bg h-1">
                  <div className={`h-full ${isTop ? 'bg-red' : 'bg-cyan'}`} style={{ width: `${width}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {topVectors.length > 0 && (
        <div className="bg-panel border border-border p-4 flex-shrink-0 mt-4">
          <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
            <Crosshair size={14} className="text-amber" />
            Attack Vectors
          </h2>
          <div className="flex flex-col gap-3">
            {topVectors.map(([vector, count]) => {
              const pct = totalVectors > 0 ? ((count / totalVectors) * 100).toFixed(1) : "0.0";
              return (
                <div key={vector} className="flex justify-between items-center text-xs">
                  <span className="text-text">{vector}</span>
                  <span className="font-mono text-muted text-[10px]">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};
