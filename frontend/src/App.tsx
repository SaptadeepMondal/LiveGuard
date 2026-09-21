import { useEffect, useState } from 'react';
import { BaseMap } from './components/BaseMap';
import { LiveArcs } from './components/LiveArcs';
import { useEventStore, ALL_ATTACK_TYPES } from './store/useEventStore';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { ThreatIntel } from './components/ThreatIntel';
import { StatsCharts } from './components/StatsCharts';
import { RecentEventsTable } from './components/RecentEventsTable';
import { Globe } from 'lucide-react';
import ReactCountryFlag from 'react-country-flag';

const getCountryName = (countryCode: string) => {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(countryCode) || countryCode;
  } catch (e) {
    return countryCode;
  }
};

function App() {
  const { connectWebSocket, stats, activeTypes, toggleType } = useEventStore();
  const [rate, setRate] = useState(0);
  const [lastTotal, setLastTotal] = useState(0);

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // Rate calculator
  useEffect(() => {
    const interval = setInterval(() => {
      setRate(Math.max((stats.totalEvents - lastTotal) / 2, 0));
      setLastTotal(stats.totalEvents);
    }, 2000);
    return () => clearInterval(interval);
  }, [stats.totalEvents, lastTotal]);

  const topCountries = Object.entries(stats.countries)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  const totalCountries = topCountries.reduce((sum, [_, count]) => sum + count, 0) || 1;

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden bg-bg text-text font-sans flex flex-col">
      
      {/* Background Map Layers */}
      <div className="absolute inset-0 z-0">
        <BaseMap />
        <LiveArcs />
      </div>

      {/* Overlay HUD */}
      <div className="relative z-10 w-full h-[100dvh] pointer-events-none flex flex-col">
        
        <Header />

        {/* Main Grid: 260px / 1fr / 280px */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr_280px] gap-6 p-6 overflow-hidden">
          
          {/* Left Column */}
          <div className="flex flex-col gap-4 pointer-events-auto overflow-y-auto custom-scrollbar">
            
            {/* Intrusions Logged */}
            <div className="bg-panel border border-border p-4">
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] mb-2">
                Intrusions Logged
              </h2>
              <div className="flex flex-col">
                <span className="text-4xl font-light font-mono tracking-tight text-text">
                  {stats.totalEvents.toLocaleString()}
                </span>
                <span className="text-[10px] text-cyan uppercase tracking-widest mt-1 font-mono">
                  {rate.toFixed(1)} / sec
                </span>
              </div>
            </div>

            {/* Attack Types */}
            <div className="bg-panel border border-border p-4 flex flex-col gap-2">
              <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] mb-2">
                Attack Types
              </h2>
              {ALL_ATTACK_TYPES.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer text-xs group">
                  <input 
                    type="checkbox" 
                    checked={activeTypes.has(type)}
                    onChange={() => toggleType(type)}
                    className="accent-cyan bg-bg border-border w-3 h-3"
                  />
                  <span className={`${activeTypes.has(type) ? 'text-text' : 'text-muted'} transition-colors group-hover:text-text`}>
                    {type}
                  </span>
                </label>
              ))}
            </div>

            {/* Top Sources */}
            {topCountries.length > 0 && (
              <div className="bg-panel border border-border p-4">
                <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] flex items-center gap-2 mb-4">
                  <Globe size={14} className="text-cyan" />
                  Top Sources
                </h2>
                <div className="flex flex-col gap-3 text-xs">
                  {topCountries.map(([country, count]) => {
                    const pct = ((count / totalCountries) * 100).toFixed(0);
                    const name = getCountryName(country);
                    return (
                      <div key={country} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 overflow-hidden mr-2">
                          <ReactCountryFlag 
                            countryCode={country} 
                            svg 
                            style={{ width: '1.2em', height: '1.2em', objectFit: 'cover' }} 
                            title={name} 
                          />
                          <span className="font-mono text-text truncate max-w-[100px]" title={name}>
                            {name}
                          </span>
                          <span className="text-muted text-[10px]">{pct}%</span>
                        </div>
                        <span className="font-mono text-cyan font-bold">{count.toLocaleString()}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Center Column (Empty space for map + Recent Events) */}
          <div className="flex flex-col justify-end pointer-events-auto h-full">
            <RecentEventsTable />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 pointer-events-auto overflow-y-auto custom-scrollbar">
            <StatsCharts />
            <ThreatIntel />
          </div>

        </div>

        <Timeline />
      </div>
    </div>
  );
}

export default App;
