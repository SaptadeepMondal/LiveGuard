import { useState, useEffect } from 'react';
import { ShieldAlert } from 'lucide-react';

const INTEL_BULLETINS = [
  "DETECTED ANOMALOUS SCANNING BEHAVIOR ORIGINATING FROM UNKNOWN SUBNET IN AP-SOUTHEAST.",
  "ELEVATED SSH BRUTE FORCE CAMPAIGN IDENTIFIED. PATTERN MATCHES KNOWN BOTNET SIGNATURES.",
  "DDoS AMPLIFICATION VECTORS OBSERVED LEVERAGING EXPOSED NTP SERVERS.",
  "CREDENTIAL STUFFING ATTEMPT ON PORT 443 BLOCKED. ORIGIN: DISTRIBUTED PROXY NETWORK."
];

export const ThreatIntel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % INTEL_BULLETINS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-panel-2 border border-border p-4">
      <h2 className="text-[11px] font-semibold text-muted uppercase tracking-[0.15em] mb-3">Threat Intel</h2>
      <div className="flex gap-3 text-xs">
        <ShieldAlert size={14} className="text-amber flex-shrink-0 mt-0.5" />
        <p className="font-mono text-[10px] leading-relaxed text-text">
          {INTEL_BULLETINS[currentIndex]}
        </p>
      </div>
    </div>
  );
};
