import { useEffect } from 'react';
import { BaseMap } from './components/BaseMap';
import { LiveArcs } from './components/LiveArcs';
import { useEventStore } from './store/useEventStore';
import { Shield, Activity, Globe } from 'lucide-react';
import { StatsCharts } from './components/StatsCharts';
import { RecentEventsTable } from './components/RecentEventsTable';

function App() {
  const { connectWebSocket, stats } = useEventStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  const topCountries = Object.entries(stats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background text-white font-sans">
      {/* Background Map Layers */}
      <BaseMap />
      <LiveArcs />

      {/* Overlay UI */}
      <div className="absolute top-0 left-0 p-6 w-full pointer-events-none flex justify-between items-start z-20">
        
        {/* Header / Brand */}
        <div className="flex flex-col gap-2 pointer-events-auto">
          <div className="flex items-center gap-3 backdrop-blur-md bg-surface/50 border border-white/10 px-5 py-3 rounded-2xl shadow-xl">
            <div className="p-2 bg-primary/20 rounded-lg text-primary">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wider">LIVE<span className="text-primary">GUARD</span></h1>
              <p className="text-xs text-white/50 tracking-widest uppercase">Global Threat Dashboard</p>
            </div>
          </div>
        </div>

        {/* Live Stats Panel */}
        <div className="flex flex-col gap-4 pointer-events-auto w-80">
          
          <div className="backdrop-blur-md bg-surface/50 border border-white/10 p-5 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} className="text-danger" />
                Live Feed
              </h2>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-danger opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-danger"></span>
                </span>
                <span className="text-xs text-danger font-mono font-bold tracking-widest">LIVE</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-4xl font-light font-mono tracking-tight">{stats.totalEvents.toLocaleString()}</span>
              <span className="text-xs text-white/50 uppercase tracking-widest mt-1">Total Intrusions Captured</span>
            </div>
          </div>

          {topCountries.length > 0 && (
            <div className="backdrop-blur-md bg-surface/50 border border-white/10 p-5 rounded-2xl shadow-xl">
              <h2 className="text-sm font-semibold text-white/70 uppercase tracking-widest flex items-center gap-2 mb-4">
                <Globe size={16} className="text-primary" />
                Top Sources
              </h2>
              <div className="flex flex-col gap-3">
                {topCountries.map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <span className="font-mono text-white/80">{country}</span>
                    <span className="font-mono text-primary font-bold">{count.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <StatsCharts />

        </div>
      </div>
      
      {/* Bottom Events Table */}
      <RecentEventsTable />
    </div>
  );
}

export default App;
