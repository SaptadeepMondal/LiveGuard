import { useEventStore } from '../store/useEventStore';

export const Header = () => {
  const { running, setRunning, muted, setMuted, windowMin, setWindowMin } = useEventStore();

  return (
    <header className="col-span-1 lg:col-span-3 flex justify-between items-center border-b border-border bg-panel px-6 py-4 h-[72px]">
      
      {/* Brand & Sensor Info */}
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 border border-border flex items-center justify-center relative">
          <div className="w-2 h-2 bg-cyan animate-blip"></div>
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold tracking-widest text-text">LIVEGUARD</h1>
            <div className="flex items-center gap-1.5 border border-red px-2 py-0.5">
              <div className="w-1.5 h-1.5 bg-red animate-blip"></div>
              <span className="text-[10px] text-red font-bold tracking-widest leading-none">LIVE</span>
            </div>
          </div>
          <span className="text-[10px] text-muted tracking-[0.2em] uppercase">SENSOR · FRANKFURT, DE</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 text-xs tracking-wider">
        <select 
          className="bg-bg border border-border text-text px-2 py-1 outline-none font-mono text-[11px]"
          value={windowMin}
          onChange={(e) => setWindowMin(Number(e.target.value))}
        >
          <option value={5}>5 min</option>
          <option value={15}>15 min</option>
          <option value={30}>30 min</option>
          <option value={60}>60 min</option>
        </select>
        
        <button 
          onClick={() => setMuted(!muted)}
          className={`border px-3 py-1 transition-colors uppercase font-mono text-[10px] tracking-widest ${muted ? 'border-border text-muted hover:border-border-hi hover:text-text' : 'border-cyan text-cyan'}`}
        >
          Sound {muted ? 'Off' : 'On'}
        </button>

        <button 
          onClick={() => setRunning(!running)}
          className={`border px-3 py-1 transition-colors uppercase font-mono text-[10px] tracking-widest ${running ? 'border-border text-muted hover:border-border-hi hover:text-text' : 'border-amber text-amber'}`}
        >
          {running ? 'Pause' : 'Resume'}
        </button>
      </div>

    </header>
  );
};
