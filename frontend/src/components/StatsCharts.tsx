import { useEventStore } from '../store/useEventStore';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Network } from 'lucide-react';

export const StatsCharts = () => {
  const { stats } = useEventStore();

  const topPorts = Object.entries(stats.ports)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([port, count]) => ({ port: `Port ${port}`, count }));

  if (topPorts.length === 0) return null;

  return (
    <div className="backdrop-blur-md bg-surface/50 border border-white/10 p-5 rounded-2xl shadow-xl mt-4">
      <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-4">
        <Network size={16} className="text-primary" />
        Top Ports
      </h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={topPorts} layout="vertical" margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis type="number" hide />
            <YAxis 
              dataKey="port" 
              type="category" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#ffffff80', fontSize: 12, fontFamily: 'monospace' }} 
            />
            <Tooltip 
              cursor={{ fill: '#ffffff10' }}
              contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff', borderRadius: '8px' }}
              itemStyle={{ color: '#3b82f6', fontFamily: 'monospace' }}
            />
            <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
              {topPorts.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={index === 0 ? '#ef4444' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
